import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://jugdyjvxskqglatljvtn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2R5anZ4c2txZ2xhdGxqdnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQzODYsImV4cCI6MjA5MzcxMDM4Nn0.cfFbH5lKAsbjHAgH51vbA6_1AYfBtbJefLeFgyHfHTQ"
);

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PERIOD_COLORS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#ef4444", "#06b6d4", "#84cc16"
];

const todayDay = DAYS[new Date().getDay() - 1] || "Monday";

export default function TimetableModule({ user, profile }) {
  const isTeacherOrAdmin = profile?.role === "admin" || profile?.role === "teacher";
  return isTeacherOrAdmin
    ? <AdminView profile={profile} />
    : <StudentView profile={profile} />;
}

/* ══════════════════════════════════════════
   ADMIN / TEACHER VIEW
══════════════════════════════════════════ */
function AdminView({ profile }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editSlot, setEditSlot] = useState(null);
  const [toast, setToast] = useState(null);
  const [viewDay, setViewDay] = useState(todayDay);

  const [form, setForm] = useState({
    day: "Monday", period_number: 1,
    subject: "", teacher_name: "", start_time: "08:00", end_time: "08:45", room: ""
  });

  useEffect(() => { fetchClasses(); }, []);
  useEffect(() => { if (selectedClass) fetchTimetable(); }, [selectedClass]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchClasses = async () => {
    const { data } = await supabase
      .from("classes").select("id, name")
      .eq("school_id", profile.school_id).order("name");
    setClasses(data || []);
    if (data?.length) setSelectedClass(data[0].id);
  };

  const fetchTimetable = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("timetable").select("*")
      .eq("class_id", selectedClass)
      .order("period_number");
    const grouped = {};
    DAYS.forEach(d => { grouped[d] = []; });
    (data || []).forEach(slot => {
      if (!grouped[slot.day]) grouped[slot.day] = [];
      grouped[slot.day].push(slot);
    });
    DAYS.forEach(d => grouped[d].sort((a, b) => a.period_number - b.period_number));
    setTimetable(grouped);
    setLoading(false);
  };

  const openAdd = (day) => {
    setEditSlot(null);
    setForm({ day, period_number: (timetable[day]?.length || 0) + 1, subject: "", teacher_name: "", start_time: "08:00", end_time: "08:45", room: "" });
    setShowForm(true);
  };

  const openEdit = (slot) => {
    setEditSlot(slot);
    setForm({ day: slot.day, period_number: slot.period_number, subject: slot.subject, teacher_name: slot.teacher_name || "", start_time: slot.start_time, end_time: slot.end_time, room: slot.room || "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.subject || !form.start_time || !form.end_time) {
      showToast("Subject aur time bharo!", "error"); return;
    }
    const payload = { ...form, class_id: selectedClass, school_id: profile.school_id };
    let error;
    if (editSlot) {
      ({ error } = await supabase.from("timetable").update(payload).eq("id", editSlot.id));
    } else {
      ({ error } = await supabase.from("timetable").insert(payload));
    }
    if (!error) {
      showToast(editSlot ? "Period update ho gaya!" : "Period add ho gaya!");
      setShowForm(false);
      fetchTimetable();
    } else showToast(error.message, "error");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete karein?")) return;
    const { error } = await supabase.from("timetable").delete().eq("id", id);
    if (!error) { showToast("Period delete ho gaya"); fetchTimetable(); }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#f0f4ff" }}>
      {toast && <Toast toast={toast} />}

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
        padding: "24px 20px 20px", color: "#fff"
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>🗓️ Timetable</h1>
              <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.8 }}>Class schedule manage karo</p>
            </div>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              style={headerSelectStyle}
            >
              {classes.map(c => <option key={c.id} value={c.id} style={{ color: "#000" }}>{c.name}</option>)}
            </select>
          </div>

          {/* Day tabs */}
          <div style={{ display: "flex", gap: 6, marginTop: 16, overflowX: "auto", paddingBottom: 4 }}>
            {DAYS.map((day, i) => (
              <button key={day} onClick={() => setViewDay(day)} style={{
                padding: "7px 14px", borderRadius: 8, border: "none",
                background: viewDay === day ? "#fff" : "rgba(255,255,255,0.15)",
                color: viewDay === day ? "#1e3a8a" : "#fff",
                fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap"
              }}>{DAY_SHORT[i]}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>⏳ Loading...</div>
        ) : (
          <DayView
            day={viewDay}
            slots={timetable[viewDay] || []}
            isAdmin={true}
            onAdd={() => openAdd(viewDay)}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <SlotFormModal
          form={form}
          setForm={setForm}
          editSlot={editSlot}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   STUDENT / PARENT VIEW
══════════════════════════════════════════ */
function StudentView({ profile }) {
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewDay, setViewDay] = useState(todayDay);

  useEffect(() => { fetchTimetable(); }, []);

  const fetchTimetable = async () => {
    if (!profile?.class_id) { setLoading(false); return; }
    const { data } = await supabase
      .from("timetable").select("*")
      .eq("class_id", profile.class_id)
      .order("period_number");
    const grouped = {};
    DAYS.forEach(d => { grouped[d] = []; });
    (data || []).forEach(slot => {
      if (!grouped[slot.day]) grouped[slot.day] = [];
      grouped[slot.day].push(slot);
    });
    setTimetable(grouped);
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#f0f4ff" }}>
      <div style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
        padding: "24px 20px 20px", color: "#fff"
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>🗓️ My Timetable</h1>
          <p style={{ margin: "4px 0 16px", fontSize: 13, opacity: 0.8 }}>
            {profile?.full_name}
          </p>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
            {DAYS.map((day, i) => (
              <button key={day} onClick={() => setViewDay(day)} style={{
                padding: "7px 14px", borderRadius: 8, border: "none",
                background: viewDay === day ? "#fff" : "rgba(255,255,255,0.15)",
                color: viewDay === day ? "#1e3a8a" : "#fff",
                fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap"
              }}>{DAY_SHORT[i]}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>⏳ Loading...</div>
        ) : !profile?.class_id ? (
          <div style={{ textAlign: "center", padding: 60, background: "#fff", borderRadius: 16, color: "#64748b" }}>
            <div style={{ fontSize: 48 }}>🏫</div>
            <p>Tumhara class assign nahi hua abhi</p>
          </div>
        ) : (
          <DayView day={viewDay} slots={timetable[viewDay] || []} isAdmin={false} />
        )}
      </div>
    </div>
  );
}

/* ── Day View ── */
function DayView({ day, slots, isAdmin, onAdd, onEdit, onDelete }) {
  if (slots.length === 0) {
    return (
      <div style={{ background: "#fff", borderRadius: 16, padding: 40, textAlign: "center", color: "#64748b", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 48 }}>📭</div>
        <p style={{ fontWeight: 600 }}>{day} ke liye koi period nahi</p>
        {isAdmin && (
          <button onClick={onAdd} style={{
            marginTop: 12, padding: "10px 20px", background: "#2563eb",
            color: "#fff", border: "none", borderRadius: 10, fontWeight: 700,
            cursor: "pointer", fontSize: 14
          }}>＋ Period Add Karo</button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {slots.map((slot, i) => {
          const color = PERIOD_COLORS[i % PERIOD_COLORS.length];
          return (
            <div key={slot.id} style={{
              background: "#fff", borderRadius: 14, padding: "16px",
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              borderLeft: `5px solid ${color}`
            }}>
              {/* Period number */}
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: color + "18", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: 16, color, flexShrink: 0
              }}>{slot.period_number}</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{slot.subject}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span>🕐 {slot.start_time} – {slot.end_time}</span>
                  {slot.teacher_name && <span>👤 {slot.teacher_name}</span>}
                  {slot.room && <span>🏫 Room {slot.room}</span>}
                </div>
              </div>

              {/* Admin actions */}
              {isAdmin && (
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => onEdit(slot)} style={iconBtn("#2563eb")}>✏️</button>
                  <button onClick={() => onDelete(slot.id)} style={iconBtn("#ef4444")}>🗑️</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isAdmin && (
        <button onClick={onAdd} style={{
          width: "100%", marginTop: 12, padding: "12px",
          border: "2px dashed #cbd5e1", borderRadius: 12,
          background: "none", color: "#64748b", fontWeight: 600,
          fontSize: 14, cursor: "pointer"
        }}>＋ Period Add Karo</button>
      )}
    </div>
  );
}

/* ── Slot Form Modal ── */
function SlotFormModal({ form, setForm, editSlot, onClose, onSave }) {
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.5)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 16
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: 28,
        width: "100%", maxWidth: 440,
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)", maxHeight: "90vh", overflowY: "auto"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: "#1e3a8a" }}>
            {editSlot ? "✏️ Edit Period" : "➕ Add Period"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Day</label>
              <select value={form.day} onChange={e => f("day", e.target.value)} style={inputStyle}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ width: 80 }}>
              <label style={labelStyle}>Period #</label>
              <input type="number" min={1} max={12} value={form.period_number}
                onChange={e => f("period_number", +e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Subject *</label>
            <input placeholder="e.g. Mathematics" value={form.subject}
              onChange={e => f("subject", e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Teacher Name</label>
            <input placeholder="e.g. Mr. Sharma" value={form.teacher_name}
              onChange={e => f("teacher_name", e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Start Time *</label>
              <input type="time" value={form.start_time}
                onChange={e => f("start_time", e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>End Time *</label>
              <input type="time" value={form.end_time}
                onChange={e => f("end_time", e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Room (optional)</label>
            <input placeholder="e.g. 204" value={form.room}
              onChange={e => f("room", e.target.value)} style={inputStyle} />
          </div>

          <button onClick={onSave} style={{
            background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
            color: "#fff", border: "none", padding: "13px",
            borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer"
          }}>
            {editSlot ? "💾 Update" : "➕ Add Period"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ toast }) {
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      background: toast.type === "error" ? "#ef4444" : "#22c55e",
      color: "#fff", padding: "12px 20px", borderRadius: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)", fontWeight: 600, fontSize: 14
    }}>{toast.msg}</div>
  );
}

const iconBtn = (color) => ({
  width: 32, height: 32, borderRadius: 8,
  border: `1.5px solid ${color}20`,
  background: color + "10", color,
  cursor: "pointer", fontSize: 14, display: "flex",
  alignItems: "center", justifyContent: "center"
});

const headerSelectStyle = {
  padding: "9px 12px", borderRadius: 8, border: "none",
  fontSize: 13, background: "rgba(255,255,255,0.15)",
  color: "#fff", cursor: "pointer", outline: "none"
};

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1.5px solid #e2e8f0", fontSize: 14,
  outline: "none", background: "#f8fafc",
  color: "#1e293b", boxSizing: "border-box"
};

const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "#475569", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.5px"
};
