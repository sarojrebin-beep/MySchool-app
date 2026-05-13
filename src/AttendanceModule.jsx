import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://jugdyjvxskqglatljvtn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2R5anZ4c2txZ2xhdGxqdnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQzODYsImV4cCI6MjA5MzcxMDM4Nn0.cfFbH5lKAsbjHAgH51vbA6_1AYfBtbJefLeFgyHfHTQ"
);

const STATUS_CONFIG = {
  present:  { label: "Present",  color: "#22c55e", bg: "#f0fdf4", short: "P" },
  absent:   { label: "Absent",   color: "#ef4444", bg: "#fef2f2", short: "A" },
  late:     { label: "Late",     color: "#f59e0b", bg: "#fffbeb", short: "L" },
  holiday:  { label: "Holiday",  color: "#8b5cf6", bg: "#f5f3ff", short: "H" },
};

const today = new Date().toISOString().split("T")[0];

export default function AttendanceModule({ user, profile }) {
  const role = profile?.role;
  const isTeacherOrAdmin = role === "admin" || role === "teacher";

  return isTeacherOrAdmin
    ? <TeacherView profile={profile} user={user} />
    : <StudentView profile={profile} />;
}

/* ══════════════════════════════════════════
   TEACHER / ADMIN VIEW
══════════════════════════════════════════ */
function TeacherView({ profile }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);
  const [view, setView] = useState("mark"); // mark | summary

  useEffect(() => { fetchClasses(); }, []);
  useEffect(() => { if (selectedClass) fetchStudents(); }, [selectedClass]);
  useEffect(() => { if (selectedClass && selectedDate) fetchAttendance(); }, [selectedClass, selectedDate]);

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

  const fetchStudents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles").select("id, full_name")
      .eq("school_id", profile.school_id)
      .eq("class_id", selectedClass)
      .eq("role", "student")
      .order("full_name");
    setStudents(data || []);
    setLoading(false);
  };

  const fetchAttendance = async () => {
    const { data } = await supabase
      .from("attendance").select("student_id, status, note")
      .eq("class_id", selectedClass)
      .eq("date", selectedDate);
    const map = {};
    (data || []).forEach(a => { map[a.student_id] = { status: a.status, note: a.note || "" }; });
    setAttendance(map);
    setSaved(false);
  };

  const setStatus = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status, note: prev[studentId]?.note || "" }
    }));
    setSaved(false);
  };

  const markAll = (status) => {
    const map = {};
    students.forEach(s => { map[s.id] = { status, note: "" }; });
    setAttendance(map);
    setSaved(false);
  };

  const saveAttendance = async () => {
    setSaving(true);
    const rows = students.map(s => ({
      school_id: profile.school_id,
      class_id: selectedClass,
      student_id: s.id,
      teacher_id: profile.id,
      date: selectedDate,
      status: attendance[s.id]?.status || "absent",
      note: attendance[s.id]?.note || null,
    }));

    const { error } = await supabase.from("attendance").upsert(rows, {
      onConflict: "student_id,date"
    });

    setSaving(false);
    if (!error) { setSaved(true); showToast("Attendance save ho gai! ✅"); }
    else showToast(error.message, "error");
  };

  const stats = students.reduce((acc, s) => {
    const st = attendance[s.id]?.status;
    if (st) acc[st] = (acc[st] || 0) + 1;
    else acc.unmarked = (acc.unmarked || 0) + 1;
    return acc;
  }, {});

  const presentCount = stats.present || 0;
  const absentCount = stats.absent || 0;
  const lateCount = stats.late || 0;
  const holidayCount = stats.holiday || 0;
  const unmarked = stats.unmarked || 0;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#f0f4ff" }}>
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "error" ? "#ef4444" : "#22c55e",
          color: "#fff", padding: "12px 20px", borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)", fontWeight: 600, fontSize: 14
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
        padding: "24px 20px 20px", color: "#fff"
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>📋 Attendance</h1>
          <p style={{ margin: "4px 0 16px", fontSize: 13, opacity: 0.8 }}>Mark & manage daily attendance</p>

          {/* Controls */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              style={headerSelectStyle}
            >
              {classes.map(c => <option key={c.id} value={c.id} style={{ color: "#000" }}>{c.name}</option>)}
            </select>

            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={e => setSelectedDate(e.target.value)}
              style={headerSelectStyle}
            />

            <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
              <button
                onClick={() => setView("mark")}
                style={{
                  ...tabBtn,
                  background: view === "mark" ? "#fff" : "rgba(255,255,255,0.15)",
                  color: view === "mark" ? "#1e3a8a" : "#fff"
                }}
              >📝 Mark</button>
              <button
                onClick={() => setView("summary")}
                style={{
                  ...tabBtn,
                  background: view === "summary" ? "#fff" : "rgba(255,255,255,0.15)",
                  color: view === "summary" ? "#1e3a8a" : "#fff"
                }}
              >📊 Summary</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 16px" }}>
        {view === "mark" ? (
          <>
            {/* Stats Bar */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10, marginBottom: 16
            }}>
              {[
                { key: "present", count: presentCount },
                { key: "absent", count: absentCount },
                { key: "late", count: lateCount },
                { key: "holiday", count: holidayCount },
              ].map(({ key, count }) => (
                <div key={key} style={{
                  background: "#fff", borderRadius: 12, padding: "12px",
                  textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  borderTop: `3px solid ${STATUS_CONFIG[key].color}`
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: STATUS_CONFIG[key].color }}>{count}</div>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{STATUS_CONFIG[key].label}</div>
                </div>
              ))}
            </div>

            {/* Mark All Buttons */}
            <div style={{
              background: "#fff", borderRadius: 12, padding: "12px 16px",
              marginBottom: 12, display: "flex", alignItems: "center",
              gap: 8, flexWrap: "wrap", boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginRight: 4 }}>Mark All:</span>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => markAll(key)}
                  style={{
                    padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${cfg.color}`,
                    background: cfg.bg, color: cfg.color, cursor: "pointer",
                    fontWeight: 700, fontSize: 12
                  }}
                >{cfg.short} {cfg.label}</button>
              ))}
              {unmarked > 0 && (
                <span style={{ marginLeft: "auto", fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
                  {unmarked} unmarked
                </span>
              )}
            </div>

            {/* Student List */}
            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>⏳ Loading...</div>
            ) : students.length === 0 ? (
              <div style={{
                textAlign: "center", padding: 40, background: "#fff",
                borderRadius: 16, color: "#64748b"
              }}>
                <div style={{ fontSize: 40 }}>👥</div>
                <p>Is class mein koi student nahi</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {students.map((s, i) => {
                  const current = attendance[s.id];
                  const status = current?.status;
                  return (
                    <div key={s.id} style={{
                      background: "#fff", borderRadius: 12, padding: "12px 16px",
                      display: "flex", alignItems: "center", gap: 12,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      borderLeft: `4px solid ${status ? STATUS_CONFIG[status].color : "#e2e8f0"}`
                    }}>
                      {/* Serial + Avatar */}
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "#eff6ff", display: "flex", alignItems: "center",
                        justifyContent: "center", fontWeight: 800, fontSize: 14,
                        color: "#2563eb", flexShrink: 0
                      }}>
                        {i + 1}
                      </div>

                      {/* Name */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {s.full_name}
                        </div>
                        {status && (
                          <div style={{ fontSize: 11, color: STATUS_CONFIG[status].color, fontWeight: 600 }}>
                            {STATUS_CONFIG[status].label}
                          </div>
                        )}
                      </div>

                      {/* Status Buttons */}
                      <div style={{ display: "flex", gap: 5 }}>
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => setStatus(s.id, key)}
                            title={cfg.label}
                            style={{
                              width: 32, height: 32, borderRadius: 8,
                              border: `2px solid ${status === key ? cfg.color : "#e2e8f0"}`,
                              background: status === key ? cfg.bg : "#fff",
                              color: status === key ? cfg.color : "#94a3b8",
                              cursor: "pointer", fontWeight: 800, fontSize: 12,
                              transition: "all 0.15s"
                            }}
                          >{cfg.short}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Save Button */}
            {students.length > 0 && (
              <button
                onClick={saveAttendance}
                disabled={saving || saved}
                style={{
                  width: "100%", marginTop: 16, padding: "14px",
                  background: saved
                    ? "#22c55e"
                    : saving
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #1e3a8a, #2563eb)",
                  color: "#fff", border: "none", borderRadius: 12,
                  fontWeight: 700, fontSize: 16, cursor: saving || saved ? "not-allowed" : "pointer"
                }}
              >
                {saved ? "✅ Saved!" : saving ? "⏳ Saving..." : "💾 Save Attendance"}
              </button>
            )}
          </>
        ) : (
          <SummaryView profile={profile} classes={classes} />
        )}
      </div>
    </div>
  );
}

/* ── Summary View ── */
function SummaryView({ profile, classes }) {
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || "");
  const [month, setMonth] = useState(today.slice(0, 7));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (selectedClass) fetchSummary(); }, [selectedClass, month]);

  const fetchSummary = async () => {
    setLoading(true);
    const startDate = `${month}-01`;
    const endDate = new Date(month + "-01");
    endDate.setMonth(endDate.getMonth() + 1);
    const endStr = endDate.toISOString().split("T")[0];

    const { data: records } = await supabase
      .from("attendance")
      .select("student_id, status, date, profiles(full_name)")
      .eq("class_id", selectedClass)
      .gte("date", startDate)
      .lt("date", endStr)
      .order("date");

    // Group by student
    const studentMap = {};
    (records || []).forEach(r => {
      if (!studentMap[r.student_id]) {
        studentMap[r.student_id] = {
          name: r.profiles?.full_name || "Unknown",
          present: 0, absent: 0, late: 0, holiday: 0, total: 0
        };
      }
      studentMap[r.student_id][r.status]++;
      studentMap[r.student_id].total++;
    });

    setData(Object.values(studentMap).sort((a, b) => a.name.localeCompare(b.name)));
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <select
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        >
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>⏳ Loading...</div>
      ) : data.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 16, color: "#64748b" }}>
          <div style={{ fontSize: 40 }}>📭</div>
          <p>Is month ka koi record nahi</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1e3a8a", color: "#fff" }}>
                <th style={thStyle}>Student</th>
                <th style={{ ...thStyle, color: "#86efac" }}>P</th>
                <th style={{ ...thStyle, color: "#fca5a5" }}>A</th>
                <th style={{ ...thStyle, color: "#fde68a" }}>L</th>
                <th style={thStyle}>%</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s, i) => {
                const pct = s.total > 0 ? Math.round((s.present / s.total) * 100) : 0;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{s.name}</td>
                    <td style={{ ...tdStyle, color: "#22c55e", fontWeight: 700 }}>{s.present}</td>
                    <td style={{ ...tdStyle, color: "#ef4444", fontWeight: 700 }}>{s.absent}</td>
                    <td style={{ ...tdStyle, color: "#f59e0b", fontWeight: 700 }}>{s.late}</td>
                    <td style={tdStyle}>
                      <div style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: 20,
                        background: pct >= 75 ? "#f0fdf4" : "#fef2f2",
                        color: pct >= 75 ? "#22c55e" : "#ef4444",
                        fontWeight: 700, fontSize: 12
                      }}>{pct}%</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   STUDENT / PARENT VIEW
══════════════════════════════════════════ */
function StudentView({ profile }) {
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMyAttendance(); }, [month]);

  const fetchMyAttendance = async () => {
    setLoading(true);
    const startDate = `${month}-01`;
    const endDate = new Date(month + "-01");
    endDate.setMonth(endDate.getMonth() + 1);
    const endStr = endDate.toISOString().split("T")[0];

    const { data } = await supabase
      .from("attendance")
      .select("date, status, note")
      .eq("student_id", profile.id)
      .gte("date", startDate)
      .lt("date", endStr)
      .order("date", { ascending: false });

    setRecords(data || []);
    setLoading(false);
  };

  const stats = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const total = records.length;
  const present = stats.present || 0;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#f0f4ff" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
        padding: "24px 20px 20px", color: "#fff"
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>📋 My Attendance</h1>
          <p style={{ margin: "4px 0 16px", fontSize: 13, opacity: 0.8 }}>
            {profile?.full_name}
          </p>
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            style={headerSelectStyle}
          />
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px" }}>
        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
          {/* Percentage */}
          <div style={{
            background: "#fff", borderRadius: 16, padding: 20,
            gridColumn: "1 / -1", boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            display: "flex", alignItems: "center", gap: 16
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: pct >= 75 ? "#f0fdf4" : "#fef2f2",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 900,
              color: pct >= 75 ? "#22c55e" : "#ef4444"
            }}>{pct}%</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1e293b" }}>
                {pct >= 75 ? "Good Attendance 👍" : "Low Attendance ⚠️"}
              </div>
              <div style={{ fontSize: 13, color: "#64748b" }}>
                {present} present out of {total} days
              </div>
            </div>
          </div>

          {[
            { key: "present", count: stats.present || 0 },
            { key: "absent", count: stats.absent || 0 },
            { key: "late", count: stats.late || 0 },
            { key: "holiday", count: stats.holiday || 0 },
          ].map(({ key, count }) => (
            <div key={key} style={{
              background: "#fff", borderRadius: 12, padding: "14px 16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              borderLeft: `4px solid ${STATUS_CONFIG[key].color}`
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: STATUS_CONFIG[key].color }}>{count}</div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{STATUS_CONFIG[key].label}</div>
            </div>
          ))}
        </div>

        {/* Records List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>⏳ Loading...</div>
        ) : records.length === 0 ? (
          <div style={{
            textAlign: "center", padding: 40, background: "#fff",
            borderRadius: 16, color: "#64748b"
          }}>
            <div style={{ fontSize: 40 }}>📭</div>
            <p>Is month ka koi record nahi</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {records.map((r, i) => {
              const cfg = STATUS_CONFIG[r.status];
              const dateObj = new Date(r.date);
              return (
                <div key={i} style={{
                  background: "#fff", borderRadius: 12, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  borderLeft: `4px solid ${cfg.color}`
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: cfg.bg, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: cfg.color, lineHeight: 1 }}>
                      {dateObj.getDate()}
                    </div>
                    <div style={{ fontSize: 9, color: cfg.color, fontWeight: 600 }}>
                      {dateObj.toLocaleString("en", { month: "short" }).toUpperCase()}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                      {dateObj.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                    </div>
                    {r.note && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{r.note}</div>}
                  </div>
                  <div style={{
                    padding: "4px 12px", borderRadius: 20,
                    background: cfg.bg, color: cfg.color,
                    fontWeight: 700, fontSize: 12
                  }}>{cfg.label}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Styles ── */
const headerSelectStyle = {
  padding: "9px 12px", borderRadius: 8, border: "none",
  fontSize: 13, background: "rgba(255,255,255,0.15)",
  color: "#fff", cursor: "pointer", outline: "none"
};

const tabBtn = {
  padding: "8px 14px", borderRadius: 8, border: "none",
  cursor: "pointer", fontWeight: 700, fontSize: 13
};

const inputStyle = {
  padding: "10px 14px", borderRadius: 10,
  border: "1.5px solid #e2e8f0", fontSize: 14,
  outline: "none", background: "#f8fafc", color: "#1e293b"
};

const thStyle = {
  padding: "12px 16px", textAlign: "left",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.5px"
};

const tdStyle = {
  padding: "12px 16px", fontSize: 14, color: "#1e293b"
};
