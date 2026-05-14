import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://jugdyjvxskqglatljvtn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2R5anZ4c2txZ2xhdGxqdnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQzODYsImV4cCI6MjA5MzcxMDM4Nn0.cfFbH5lKAsbjHAgH51vbA6_1AYfBtbJefLeFgyHfHTQ"
);

const PLATFORMS = [
  { id: "google_meet", label: "Google Meet", icon: "🟢", color: "#059669" },
  { id: "zoom",        label: "Zoom",        icon: "🔵", color: "#2563eb" },
  { id: "teams",       label: "MS Teams",    icon: "🟣", color: "#7c3aed" },
  { id: "offline",     label: "In-Person",   icon: "🏫", color: "#d97706" },
];

const ROLES = ["admin", "teacher", "student", "parent"];

const blank = {
  title: "", description: "", meeting_date: "",
  meeting_time: "", duration_mins: "60",
  platform: "google_meet", meeting_link: "", location: "",
  for_roles: ["admin", "teacher", "student", "parent"],
};

export default function MeetingsModule({ user, profile, schoolId }) {
  const role = profile?.role;
  const canManage = role === "admin" || role === "teacher";

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("upcoming");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null);

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  useEffect(() => { load(); }, [tab]);

  async function load() {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    let q = sb.from("meetings")
      .select("*, profiles(full_name)")
      .eq("school_id", schoolId)
      .contains("for_roles", [role]);

    if (tab === "upcoming") q = q.gte("meeting_date", today).order("meeting_date").order("meeting_time");
    else q = q.lt("meeting_date", today).order("meeting_date", { ascending: false });

    const { data } = await q;
    setMeetings(data || []);
    setLoading(false);
  }

  async function save() {
    if (!form.title || !form.meeting_date || !form.meeting_time) return notify("Title, date aur time zaroori hai");
    if (form.platform !== "offline" && !form.meeting_link) return notify("Meeting link daalo");
    if (form.for_roles.length === 0) return notify("Kam se kam ek role select karo");

    const payload = { ...form, duration_mins: Number(form.duration_mins) || 60, school_id: schoolId, created_by: user.id };

    const { error } = editId
      ? await sb.from("meetings").update(payload).eq("id", editId)
      : await sb.from("meetings").insert(payload);

    if (error) return notify("Error: " + error.message);
    notify(editId ? "Meeting update ho gayi!" : "Meeting schedule ho gayi!");
    resetForm();
    load();
  }

  async function deleteMeeting(id) {
    if (!confirm("Meeting delete karo?")) return;
    await sb.from("meetings").delete().eq("id", id);
    load();
  }

  function startEdit(m) {
    setForm({
      title: m.title, description: m.description || "",
      meeting_date: m.meeting_date, meeting_time: m.meeting_time,
      duration_mins: String(m.duration_mins), platform: m.platform,
      meeting_link: m.meeting_link || "", location: m.location || "",
      for_roles: m.for_roles || ROLES,
    });
    setEditId(m.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(blank);
    setEditId(null);
    setShowForm(false);
  }

  function toggleRole(r) {
    setForm(p => ({
      ...p,
      for_roles: p.for_roles.includes(r) ? p.for_roles.filter(x => x !== r) : [...p.for_roles, r]
    }));
  }

  const plat = (id) => PLATFORMS.find(p => p.id === id) || PLATFORMS[0];

  const now = new Date();
  const isLive = (m) => {
    const start = new Date(`${m.meeting_date}T${m.meeting_time}`);
    const end = new Date(start.getTime() + m.duration_mins * 60000);
    return now >= start && now <= end;
  };
  const isSoon = (m) => {
    const start = new Date(`${m.meeting_date}T${m.meeting_time}`);
    return start > now && (start - now) <= 30 * 60000;
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", fontFamily: "'Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", color: "#1a56db", fontWeight: 700 }}>🎥 Meetings</h2>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "14px" }}>Schedule & join school meetings</p>
        </div>
        {canManage && (
          <button onClick={() => { resetForm(); setShowForm(p => !p); }} style={btnStyle(false)}>
            {showForm ? "✕ Cancel" : "+ Schedule Meeting"}
          </button>
        )}
      </div>

      {msg && <Alert msg={msg} />}

      {/* Form */}
      {showForm && canManage && (
        <div style={{ background: "white", border: "1px solid #dbeafe", borderRadius: "16px", padding: "24px", marginBottom: "24px", boxShadow: "0 4px 20px rgba(26,86,219,0.08)" }}>
          <h3 style={{ margin: "0 0 20px", color: "#1a56db", fontSize: "16px", fontWeight: 700 }}>
            {editId ? "✏️ Edit Meeting" : "📅 Schedule New Meeting"}
          </h3>

          {/* Title + description */}
          <div style={{ marginBottom: "16px" }}>
            <FInput label="Meeting Title *" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} placeholder="e.g. Parent-Teacher Meeting" />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={lbl}>Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Meeting agenda ya details..." rows={2}
              style={{ ...inp, resize: "vertical" }} />
          </div>

          {/* Date / Time / Duration */}
          <div style={fGrid3}>
            <FInput label="Date *" type="date" value={form.meeting_date} onChange={v => setForm(p => ({ ...p, meeting_date: v }))} />
            <FInput label="Time *" type="time" value={form.meeting_time} onChange={v => setForm(p => ({ ...p, meeting_time: v }))} />
            <FInput label="Duration (mins)" type="number" value={form.duration_mins} onChange={v => setForm(p => ({ ...p, duration_mins: v }))} placeholder="60" />
          </div>

          {/* Platform selector */}
          <div style={{ marginBottom: "16px" }}>
            <label style={lbl}>Platform</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {PLATFORMS.map(pl => (
                <button key={pl.id} onClick={() => setForm(p => ({ ...p, platform: pl.id }))}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: `2px solid ${form.platform === pl.id ? pl.color : "#e2e8f0"}`, background: form.platform === pl.id ? pl.color + "15" : "white", color: form.platform === pl.id ? pl.color : "#64748b", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  {pl.icon} {pl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Link or location */}
          {form.platform !== "offline"
            ? <div style={{ marginBottom: "16px" }}><FInput label="Meeting Link *" value={form.meeting_link} onChange={v => setForm(p => ({ ...p, meeting_link: v }))} placeholder="https://meet.google.com/..." /></div>
            : <div style={{ marginBottom: "16px" }}><FInput label="Location" value={form.location} onChange={v => setForm(p => ({ ...p, location: v }))} placeholder="e.g. School Hall, Room 101" /></div>
          }

          {/* Audience */}
          <div style={{ marginBottom: "20px" }}>
            <label style={lbl}>Visible To</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {ROLES.map(r => (
                <button key={r} onClick={() => toggleRole(r)}
                  style={{ padding: "6px 14px", borderRadius: "20px", border: `1.5px solid ${form.for_roles.includes(r) ? "#1a56db" : "#e2e8f0"}`, background: form.for_roles.includes(r) ? "#eff6ff" : "white", color: form.for_roles.includes(r) ? "#1a56db" : "#94a3b8", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={save} style={btnStyle(false)}>{editId ? "💾 Update" : "📅 Schedule"}</button>
            <button onClick={resetForm} style={btnStyle(true)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#f1f5f9", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        {[["upcoming","📅 Upcoming"], ["past","🕐 Past"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "7px 18px", borderRadius: "7px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px", background: tab === t ? "#1a56db" : "transparent", color: tab === t ? "white" : "#64748b" }}>
            {l}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Loading...</div>}

      {!loading && meetings.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af", background: "#f8fafc", borderRadius: "14px", fontSize: "14px" }}>
          {tab === "upcoming" ? "Koi upcoming meeting nahi hai." : "Koi past meeting nahi."}
        </div>
      )}

      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {meetings.map(m => {
            const pl = plat(m.platform);
            const live = isLive(m);
            const soon = isSoon(m);
            const isPast = tab === "past";
            const dateStr = new Date(m.meeting_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

            return (
              <div key={m.id} style={{ background: "white", border: `1.5px solid ${live ? "#22c55e" : soon ? "#f59e0b" : "#e2e8f0"}`, borderRadius: "14px", padding: "20px", boxShadow: live ? "0 0 0 3px rgba(34,197,94,0.12)" : "0 1px 4px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>

                {/* Live/Soon ribbon */}
                {live && (
                  <div style={{ position: "absolute", top: 0, right: 0, background: "#22c55e", color: "white", fontSize: "11px", fontWeight: 700, padding: "4px 14px", borderRadius: "0 14px 0 10px", letterSpacing: "0.5px" }}>
                    🔴 LIVE NOW
                  </div>
                )}
                {soon && !live && (
                  <div style={{ position: "absolute", top: 0, right: 0, background: "#f59e0b", color: "white", fontSize: "11px", fontWeight: 700, padding: "4px 14px", borderRadius: "0 14px 0 10px" }}>
                    ⏰ Starting Soon
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    {/* Title + platform */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                      <span style={{ fontSize: "20px" }}>{pl.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: "17px", color: "#1e293b" }}>{m.title}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 9px", borderRadius: "20px", background: pl.color + "18", color: pl.color }}>
                        {pl.label}
                      </span>
                    </div>

                    {m.description && (
                      <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 10px", lineHeight: 1.5 }}>{m.description}</p>
                    )}

                    {/* Meta row */}
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "13px", color: "#475569" }}>
                      <span>📅 {dateStr}</span>
                      <span>🕐 {formatTime(m.meeting_time)}</span>
                      <span>⏱ {m.duration_mins} mins</span>
                      {m.location && <span>📍 {m.location}</span>}
                    </div>

                    {/* Audience */}
                    <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                      {(m.for_roles || []).map(r => (
                        <span key={r} style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px", background: "#f1f5f9", color: "#475569" }}>{r}</span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                    {m.meeting_link && !isPast && (
                      <a href={m.meeting_link} target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-block", padding: "9px 20px", background: live ? "#22c55e" : "#1a56db", color: "white", borderRadius: "9px", fontWeight: 700, fontSize: "13px", textDecoration: "none" }}>
                        {live ? "🔴 Join Now" : "🔗 Join Meeting"}
                      </a>
                    )}
                    {canManage && (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => startEdit(m)} style={smBtn("#fef3c7","#92400e","#fde68a")}>✏️ Edit</button>
                        <button onClick={() => deleteMeeting(m.id)} style={smBtn("#fef2f2","#dc2626","#fca5a5")}>🗑</button>
                      </div>
                    )}
                    {m.meeting_link && isPast && (
                      <span style={{ fontSize: "12px", color: "#9ca3af" }}>Meeting ended</span>
                    )}
                    {/* Organizer */}
                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>by {m.profiles?.full_name || "—"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Helpers ──

function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = Number(h);
  return `${hr % 12 || 12}:${m} ${hr < 12 ? "AM" : "PM"}`;
}

function FInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inp} />
    </div>
  );
}

function Alert({ msg }) {
  const err = msg.startsWith("Error");
  return (
    <div style={{ background: err ? "#fef2f2" : "#f0fdf4", border: `1px solid ${err ? "#fca5a5" : "#86efac"}`, color: err ? "#dc2626" : "#16a34a", padding: "10px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
      {msg}
    </div>
  );
}

function btnStyle(sec) {
  return { padding: "9px 20px", borderRadius: "8px", border: sec ? "1px solid #cbd5e1" : "none", background: sec ? "white" : "#1a56db", color: sec ? "#475569" : "white", fontWeight: 600, fontSize: "13px", cursor: "pointer" };
}

function smBtn(bg, color, border) {
  return { fontSize: "12px", background: bg, color, border: `1px solid ${border}`, padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 };
}

const lbl = { display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" };
const inp = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", color: "#1e293b", background: "#fafafa" };
const fGrid3 = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "14px", marginBottom: "16px" };
