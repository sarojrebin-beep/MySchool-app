import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://jugdyjvxskqglatljvtn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2R5anZ4c2txZ2xhdGxqdnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQzODYsImV4cCI6MjA5MzcxMDM4Nn0.cfFbH5lKAsbjHAgH51vbA6_1AYfBtbJefLeFgyHfHTQ"
);

const FILE_ICONS = {
  pdf: "📄",
  image: "🖼️",
  video: "🎬",
  link: "🔗",
  other: "📁",
};

const SUBJECTS = [
  "Mathematics", "Science", "English", "Hindi", "Social Science",
  "Physics", "Chemistry", "Biology", "History", "Geography",
  "Computer Science", "Economics", "Accountancy", "Other"
];

export default function NotesModule({ user, profile }) {
  const [notes, setNotes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterClass, setFilterClass] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [toast, setToast] = useState(null);

  const isTeacherOrAdmin = profile?.role === "admin" || profile?.role === "teacher";

  const [form, setForm] = useState({
    class_id: "",
    subject: "",
    chapter: "",
    title: "",
    description: "",
    file_type: "pdf",
    external_link: "",
    file: null,
  });

  useEffect(() => {
    fetchClasses();
    fetchNotes();
  }, [profile]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchClasses = async () => {
    if (!profile?.school_id) return;
    const { data } = await supabase
      .from("classes")
      .select("id, name")
      .eq("school_id", profile.school_id)
      .order("name");
    setClasses(data || []);
  };

  const fetchNotes = async () => {
    if (!profile?.school_id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select(`*, classes(name), profiles(full_name)`)
      .eq("school_id", profile.school_id)
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (!error) setNotes(data || []);
    setLoading(false);
  };

  const handleFileUpload = async (file) => {
    const ext = file.name.split(".").pop();
    const path = `${profile.school_id}/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("notes-files")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from("notes-files")
      .getPublicUrl(path);
    return { url: urlData.publicUrl, name: file.name };
  };

  const handleSubmit = async () => {
    if (!form.class_id || !form.subject || !form.chapter || !form.title) {
      showToast("Saare required fields bharo!", "error");
      return;
    }
    setUploading(true);
    try {
      let file_url = null;
      let file_name = null;

      if (form.file_type !== "link" && form.file) {
        const uploaded = await handleFileUpload(form.file);
        file_url = uploaded.url;
        file_name = uploaded.name;
      }

      const { error } = await supabase.from("notes").insert({
        school_id: profile.school_id,
        class_id: form.class_id,
        teacher_id: user.id,
        subject: form.subject,
        chapter: form.chapter,
        title: form.title,
        description: form.description,
        file_url: form.file_type === "link" ? null : file_url,
        file_name,
        file_type: form.file_type,
        external_link: form.file_type === "link" ? form.external_link : null,
        is_published: true,
      });

      if (error) throw error;
      showToast("Note upload ho gaya! ✅");
      setShowForm(false);
      setForm({ class_id: "", subject: "", chapter: "", title: "", description: "", file_type: "pdf", external_link: "", file: null });
      fetchNotes();
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    }
    setUploading(false);
  };

  const handleDelete = async (noteId) => {
    if (!confirm("Is note ko delete karein?")) return;
    const { error } = await supabase.from("notes").delete().eq("id", noteId);
    if (!error) {
      showToast("Note delete ho gaya");
      setNotes(notes.filter((n) => n.id !== noteId));
      if (selectedNote?.id === noteId) setSelectedNote(null);
    }
  };

  const filteredNotes = notes.filter((n) => {
    const matchSubject = filterSubject === "All" || n.subject === filterSubject;
    const matchClass = filterClass === "All" || n.class_id === filterClass;
    const matchSearch =
      !searchQuery ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchClass && matchSearch;
  });

  const groupedBySubject = filteredNotes.reduce((acc, note) => {
    if (!acc[note.subject]) acc[note.subject] = [];
    acc[note.subject].push(note);
    return acc;
  }, {});

  const uniqueSubjects = [...new Set(notes.map((n) => n.subject))];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#f0f4ff", padding: "0" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "error" ? "#ef4444" : "#22c55e",
          color: "#fff", padding: "12px 20px", borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)", fontWeight: 600, fontSize: 14
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
        padding: "24px 20px 20px", color: "#fff"
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                📚 Study Notes
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.8 }}>
                Subject-wise study material
              </p>
            </div>
            {isTeacherOrAdmin && (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  background: "#fff", color: "#1e3a8a", border: "none",
                  padding: "10px 18px", borderRadius: 10, fontWeight: 700,
                  fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                }}
              >
                ＋ Upload Note
              </button>
            )}
          </div>

          {/* Search + Filters */}
          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              placeholder="🔍 Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: "1 1 200px", padding: "9px 14px", borderRadius: 8,
                border: "none", fontSize: 14, outline: "none",
                background: "rgba(255,255,255,0.15)", color: "#fff"
              }}
            />
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              style={{
                padding: "9px 12px", borderRadius: 8, border: "none",
                fontSize: 13, background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer"
              }}
            >
              <option value="All" style={{ color: "#000" }}>All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id} style={{ color: "#000" }}>{c.name}</option>
              ))}
            </select>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              style={{
                padding: "9px 12px", borderRadius: 8, border: "none",
                fontSize: 13, background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer"
              }}
            >
              <option value="All" style={{ color: "#000" }}>All Subjects</option>
              {uniqueSubjects.map((s) => (
                <option key={s} value={s} style={{ color: "#000" }}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>
            <div style={{ fontSize: 40 }}>⏳</div>
            <p>Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div style={{
            textAlign: "center", padding: 60, background: "#fff",
            borderRadius: 16, color: "#64748b", boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
          }}>
            <div style={{ fontSize: 48 }}>📭</div>
            <p style={{ fontWeight: 600 }}>Koi notes nahi mila</p>
            <p style={{ fontSize: 13 }}>
              {isTeacherOrAdmin ? "Upload Note button se pehla note daalo!" : "Abhi koi note upload nahi hua."}
            </p>
          </div>
        ) : (
          Object.entries(groupedBySubject).map(([subject, subjectNotes]) => (
            <div key={subject} style={{ marginBottom: 28 }}>
              {/* Subject Header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 12
              }}>
                <div style={{
                  background: "#1e3a8a", color: "#fff", padding: "5px 14px",
                  borderRadius: 20, fontSize: 13, fontWeight: 700
                }}>
                  {subject}
                </div>
                <div style={{
                  flex: 1, height: 1, background: "linear-gradient(to right, #cbd5e1, transparent)"
                }} />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{subjectNotes.length} notes</span>
              </div>

              {/* Notes Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 14
              }}>
                {subjectNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isTeacherOrAdmin={isTeacherOrAdmin}
                    userId={user?.id}
                    onDelete={handleDelete}
                    onClick={() => setSelectedNote(note)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Form Modal */}
      {showForm && (
        <UploadModal
          form={form}
          setForm={setForm}
          classes={classes}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
          uploading={uploading}
        />
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <NoteDetailModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          isTeacherOrAdmin={isTeacherOrAdmin}
          userId={user?.id}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

/* ── Note Card ── */
function NoteCard({ note, isTeacherOrAdmin, userId, onDelete, onClick }) {
  const icon = FILE_ICONS[note.file_type] || FILE_ICONS.other;
  const isOwner = note.teacher_id === userId;

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff", borderRadius: 14, padding: "16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
        cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
        borderLeft: "4px solid #2563eb", position: "relative"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          fontSize: 28, flexShrink: 0, width: 44, height: 44,
          background: "#eff6ff", borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: "#1e293b",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
          }}>
            {note.title}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            Ch: {note.chapter}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "flex", gap: 8 }}>
            <span>🏫 {note.classes?.name || "—"}</span>
            <span>👤 {note.profiles?.full_name?.split(" ")[0] || "—"}</span>
          </div>
        </div>
      </div>

      {isTeacherOrAdmin && isOwner && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
          style={{
            position: "absolute", top: 10, right: 10,
            background: "none", border: "none", cursor: "pointer",
            fontSize: 16, color: "#ef4444", opacity: 0.7, padding: 4
          }}
          title="Delete"
        >
          🗑️
        </button>
      )}
    </div>
  );
}

/* ── Note Detail Modal ── */
function NoteDetailModal({ note, onClose, isTeacherOrAdmin, userId, onDelete }) {
  const icon = FILE_ICONS[note.file_type] || FILE_ICONS.other;
  const resourceUrl = note.file_type === "link" ? note.external_link : note.file_url;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.5)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 16
    }} onClick={onClose}>
      <div
        style={{
          background: "#fff", borderRadius: 20, padding: 28,
          width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: 40 }}>{icon}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>

        <h2 style={{ margin: "12px 0 4px", fontSize: 20, color: "#1e293b" }}>{note.title}</h2>
        <div style={{ fontSize: 13, color: "#64748b" }}>
          <span style={{ background: "#eff6ff", color: "#2563eb", padding: "2px 10px", borderRadius: 20, fontWeight: 600, marginRight: 8 }}>
            {note.subject}
          </span>
          Chapter: {note.chapter}
        </div>

        <div style={{ margin: "16px 0", padding: "12px 16px", background: "#f8fafc", borderRadius: 10 }}>
          <div style={{ fontSize: 13, color: "#475569" }}>
            <div>🏫 Class: <strong>{note.classes?.name || "—"}</strong></div>
            <div style={{ marginTop: 4 }}>👤 By: <strong>{note.profiles?.full_name || "—"}</strong></div>
            <div style={{ marginTop: 4 }}>📅 {new Date(note.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
          </div>
        </div>

        {note.description && (
          <p style={{ fontSize: 13, color: "#475569", margin: "0 0 16px", lineHeight: 1.6 }}>
            {note.description}
          </p>
        )}

        {resourceUrl && (
          <a
            href={resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
              color: "#fff", padding: "12px 20px", borderRadius: 12,
              textDecoration: "none", fontWeight: 700, fontSize: 14, marginBottom: 12
            }}
          >
            {note.file_type === "link" ? "🔗 Open Link" : "⬇️ Download / View File"}
          </a>
        )}

        {isTeacherOrAdmin && note.teacher_id === userId && (
          <button
            onClick={() => { onDelete(note.id); onClose(); }}
            style={{
              width: "100%", padding: "10px", border: "1px solid #ef4444",
              borderRadius: 10, background: "none", color: "#ef4444",
              cursor: "pointer", fontWeight: 600, fontSize: 13
            }}
          >
            🗑️ Delete Note
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Upload Modal ── */
function UploadModal({ form, setForm, classes, onClose, onSubmit, uploading }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.5)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto"
    }} onClick={onClose}>
      <div
        style={{
          background: "#fff", borderRadius: 20, padding: 28,
          width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: "#1e3a8a" }}>📤 Upload Study Note</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Class */}
          <div>
            <label style={labelStyle}>Class *</label>
            <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} style={inputStyle}>
              <option value="">Select Class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label style={labelStyle}>Subject *</label>
            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={inputStyle}>
              <option value="">Select Subject</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Chapter */}
          <div>
            <label style={labelStyle}>Chapter *</label>
            <input
              placeholder="e.g. Chapter 3 - Fractions"
              value={form.chapter}
              onChange={(e) => setForm({ ...form, chapter: e.target.value })}
              style={inputStyle}
            />
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>Title *</label>
            <input
              placeholder="Note ka naam"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description (optional)</label>
            <textarea
              placeholder="Short description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {/* File Type */}
          <div>
            <label style={labelStyle}>Content Type *</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["pdf", "image", "video", "link"].map((type) => (
                <button
                  key={type}
                  onClick={() => setForm({ ...form, file_type: type, file: null, external_link: "" })}
                  style={{
                    padding: "7px 14px", borderRadius: 8, border: "2px solid",
                    borderColor: form.file_type === type ? "#2563eb" : "#e2e8f0",
                    background: form.file_type === type ? "#eff6ff" : "#fff",
                    color: form.file_type === type ? "#2563eb" : "#64748b",
                    cursor: "pointer", fontWeight: 600, fontSize: 13
                  }}
                >
                  {FILE_ICONS[type]} {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* File or Link */}
          {form.file_type === "link" ? (
            <div>
              <label style={labelStyle}>Link URL *</label>
              <input
                placeholder="https://..."
                value={form.external_link}
                onChange={(e) => setForm({ ...form, external_link: e.target.value })}
                style={inputStyle}
              />
            </div>
          ) : (
            <div>
              <label style={labelStyle}>File Upload *</label>
              <input
                type="file"
                accept={
                  form.file_type === "pdf" ? ".pdf" :
                  form.file_type === "image" ? "image/*" :
                  "video/*"
                }
                onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
                style={{ ...inputStyle, padding: "8px" }}
              />
              {form.file && (
                <p style={{ fontSize: 12, color: "#22c55e", margin: "4px 0 0" }}>
                  ✅ {form.file.name}
                </p>
              )}
            </div>
          )}

          <button
            onClick={onSubmit}
            disabled={uploading}
            style={{
              background: uploading ? "#94a3b8" : "linear-gradient(135deg, #1e3a8a, #2563eb)",
              color: "#fff", border: "none", padding: "13px",
              borderRadius: 12, fontWeight: 700, fontSize: 15,
              cursor: uploading ? "not-allowed" : "pointer", marginTop: 4
            }}
          >
            {uploading ? "⏳ Uploading..." : "📤 Upload Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
  background: "#f8fafc", boxSizing: "border-box", color: "#1e293b"
};

const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px"
};
