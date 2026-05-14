import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://jugdyjvxskqglatljvtn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2R5anZ4c2txZ2xhdGxqdnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQzODYsImV4cCI6MjA5MzcxMDM4Nn0.cfFbH5lKAsbjHAgH51vbA6_1AYfBtbJefLeFgyHfHTQ"
);

const EXAM_TYPES = ["unit", "midterm", "final", "other"];

function calcGrade(pct) {
  if (pct >= 90) return { g: "A+", c: "#059669" };
  if (pct >= 75) return { g: "A",  c: "#0ea5e9" };
  if (pct >= 60) return { g: "B",  c: "#1a56db" };
  if (pct >= 45) return { g: "C",  c: "#d97706" };
  if (pct >= 33) return { g: "D",  c: "#f59e0b" };
  return { g: "F", c: "#ef4444" };
}

export default function ResultsModule({ user, profile, schoolId }) {
  const role = profile?.role;
  const [tab, setTab] = useState("exams");
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [selExam, setSelExam] = useState(null);
  const [selClass, setSelClass] = useState("");
  const [selStudent, setSelStudent] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // forms
  const [examForm, setExamForm] = useState({ title: "", exam_type: "unit", total_marks: "100", exam_date: "", class_id: "" });
  const [showExamForm, setShowExamForm] = useState(false);
  const [marksData, setMarksData] = useState({}); // { studentId: { subject: marks } }
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };
  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";
  const isStudent = role === "student";
  const isParent = role === "parent";

  useEffect(() => { init(); }, []);
  useEffect(() => {
    if (selExam) loadExamResults(selExam.id);
  }, [selExam]);
  useEffect(() => {
    if (selClass) loadStudentsByClass(selClass);
  }, [selClass]);

  async function init() {
    setLoading(true);
    if (isAdmin || isTeacher) {
      const { data: cl } = await sb.from("classes").select("id,name").eq("school_id", schoolId);
      setClasses(cl || []);
    }
    await loadExams();
    if (isStudent) await loadMyResults();
    if (isParent) await loadChildResults();
    setLoading(false);
  }

  async function loadExams() {
    let q = sb.from("exams").select("*, classes(name)").eq("school_id", schoolId).order("created_at", { ascending: false });
    if (isTeacher) {
      const { data: tc } = await sb.from("teachers").select("class_id").eq("user_id", user.id).single();
      if (tc?.class_id) q = q.eq("class_id", tc.class_id);
    }
    const { data } = await q;
    setExams(data || []);
  }

  async function loadStudentsByClass(classId) {
    const { data } = await sb.from("students").select("id,name").eq("class_id", classId).eq("school_id", schoolId);
    setStudents(data || []);
    // init marksData with empty
    const init = {};
    (data || []).forEach(s => { init[s.id] = {}; });
    setMarksData(init);
  }

  async function loadExamResults(examId) {
    const { data } = await sb.from("results").select("*, students(name)").eq("exam_id", examId);
    setResults(data || []);
    // extract subjects
    const subs = [...new Set((data || []).map(r => r.subject))];
    setSubjects(subs);
  }

  async function loadMyResults() {
    const { data: st } = await sb.from("students").select("id").eq("user_id", user.id).single();
    if (!st) return;
    const { data } = await sb.from("results").select("*, exams(title,exam_type,exam_date,classes(name))").eq("student_id", st.id);
    setResults(data || []);
    const exIds = [...new Set((data || []).map(r => r.exam_id))];
    const ex = [];
    for (const eid of exIds) {
      const r = data.find(d => d.exam_id === eid);
      if (r) ex.push({ id: eid, title: r.exams?.title, exam_type: r.exams?.exam_type, exam_date: r.exams?.exam_date, classes: r.exams?.classes });
    }
    setExams(ex);
  }

  async function loadChildResults() {
    const { data: st } = await sb.from("students").select("id,name").eq("parent_id", user.id);
    setStudents(st || []);
    if (!selStudent && st?.length) {
      setSelStudent(st[0].id);
      const { data } = await sb.from("results").select("*, exams(title,exam_type,exam_date,classes(name))").eq("student_id", st[0].id);
      setResults(data || []);
      const ex = [];
      const seen = new Set();
      (data || []).forEach(r => {
        if (!seen.has(r.exam_id)) { seen.add(r.exam_id); ex.push({ id: r.exam_id, ...r.exams }); }
      });
      setExams(ex);
    }
  }

  async function createExam() {
    if (!examForm.title || !examForm.class_id || !examForm.total_marks) return notify("Sab fields bharo");
    const { data, error } = await sb.from("exams").insert({ ...examForm, school_id: schoolId, created_by: user.id }).select().single();
    if (error) return notify("Error: " + error.message);
    notify("Exam create ho gaya!");
    setExamForm({ title: "", exam_type: "unit", total_marks: "100", exam_date: "", class_id: "" });
    setShowExamForm(false);
    loadExams();
    setSelExam(data);
    setTab("marks");
  }

  async function saveMarks() {
    if (!selExam || subjects.length === 0) return notify("Pehle subjects add karo");
    const rows = [];
    students.forEach(s => {
      subjects.forEach(sub => {
        const m = marksData[s.id]?.[sub];
        if (m !== undefined && m !== "") {
          rows.push({
            school_id: schoolId,
            exam_id: selExam.id,
            student_id: s.id,
            subject: sub,
            marks_obtained: Number(m),
            total_marks: Number(selExam.total_marks),
            grade: calcGrade((Number(m) / Number(selExam.total_marks)) * 100).g,
            entered_by: user.id,
          });
        }
      });
    });
    const { error } = await sb.from("results").upsert(rows, { onConflict: "exam_id,student_id,subject" });
    if (error) return notify("Error: " + error.message);
    notify(`${rows.length} marks save ho gaye!`);
    loadExamResults(selExam.id);
    setTab("view");
  }

  async function deleteExam(id) {
    if (!confirm("Exam aur uske sare results delete karo?")) return;
    await sb.from("results").delete().eq("exam_id", id);
    await sb.from("exams").delete().eq("id", id);
    if (selExam?.id === id) setSelExam(null);
    loadExams();
    notify("Deleted!");
  }

  function addSubject() {
    const s = newSubject.trim();
    if (!s || subjects.includes(s)) return;
    setSubjects(p => [...p, s]);
    setNewSubject("");
  }

  function printReportCard(studentId, studentName) {
    const sRes = results.filter(r => r.student_id === studentId || r.students?.id === studentId || r.student_id === studentId);
    const exam = selExam;
    const rows = subjects.map(sub => {
      const r = sRes.find(x => x.subject === sub);
      const m = r ? Number(r.marks_obtained) : null;
      const tot = r ? Number(r.total_marks) : Number(exam?.total_marks || 100);
      const pct = m !== null ? ((m / tot) * 100).toFixed(1) : "—";
      const g = m !== null ? calcGrade((m / tot) * 100) : { g: "—", c: "#666" };
      return { sub, m, tot, pct, g };
    });
    const totalM = rows.reduce((s, r) => s + (r.m || 0), 0);
    const totalT = rows.reduce((s, r) => s + r.tot, 0);
    const overallPct = totalT > 0 ? ((totalM / totalT) * 100).toFixed(1) : 0;
    const overallG = calcGrade(Number(overallPct));

    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>Report Card</title>
      <style>
        body{font-family:Arial,sans-serif;padding:40px;max-width:680px;margin:auto;color:#1e293b}
        .header{text-align:center;border-bottom:3px solid #1a56db;padding-bottom:20px;margin-bottom:24px}
        .logo{font-size:28px;font-weight:800;color:#1a56db}
        .sub-title{color:#64748b;font-size:14px;margin-top:4px}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;background:#f8fafc;padding:16px;border-radius:10px}
        .info-item span{font-size:11px;color:#94a3b8;display:block;font-weight:700;text-transform:uppercase}
        .info-item strong{font-size:15px;color:#1e293b}
        table{width:100%;border-collapse:collapse;font-size:14px}
        thead th{background:#1a56db;color:white;padding:10px 14px;text-align:left;font-size:12px}
        tbody td{padding:10px 14px;border-bottom:1px solid #e2e8f0}
        tbody tr:nth-child(even){background:#f8fafc}
        .grade-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-weight:800;font-size:13px;color:white}
        .total-row{background:#1e293b!important;color:white}
        .total-row td{color:white;font-weight:700}
        .result-box{margin-top:24px;text-align:center;padding:20px;border-radius:12px;background:#f0f9ff;border:2px solid #0ea5e9}
        .result-grade{font-size:48px;font-weight:900}
        @media print{button{display:none}}
      </style></head>
      <body>
        <div class="header">
          <div class="logo">🏫 MySchool</div>
          <div class="sub-title">Academic Report Card</div>
        </div>
        <div class="info-grid">
          <div class="info-item"><span>Student Name</span><strong>${studentName}</strong></div>
          <div class="info-item"><span>Exam</span><strong>${exam?.title || "—"}</strong></div>
          <div class="info-item"><span>Class</span><strong>${exam?.classes?.name || selExam?.classes?.name || "—"}</strong></div>
          <div class="info-item"><span>Date</span><strong>${exam?.exam_date ? new Date(exam.exam_date).toLocaleDateString("en-IN") : "—"}</strong></div>
          <div class="info-item"><span>Exam Type</span><strong style="text-transform:capitalize">${exam?.exam_type || "—"}</strong></div>
          <div class="info-item"><span>Generated</span><strong>${new Date().toLocaleDateString("en-IN")}</strong></div>
        </div>
        <table>
          <thead><tr><th>#</th><th>Subject</th><th>Marks Obtained</th><th>Total Marks</th><th>Percentage</th><th>Grade</th></tr></thead>
          <tbody>
            ${rows.map((r, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${r.sub}</strong></td>
                <td>${r.m !== null ? r.m : "—"}</td>
                <td>${r.tot}</td>
                <td>${r.m !== null ? r.pct + "%" : "—"}</td>
                <td>${r.m !== null ? `<span class="grade-badge" style="background:${r.g.c}">${r.g.g}</span>` : "—"}</td>
              </tr>
            `).join("")}
            <tr class="total-row">
              <td colspan="2">TOTAL</td>
              <td>${totalM}</td>
              <td>${totalT}</td>
              <td>${overallPct}%</td>
              <td><span class="grade-badge" style="background:${overallG.c}">${overallG.g}</span></td>
            </tr>
          </tbody>
        </table>
        <div class="result-box">
          <div style="color:#64748b;font-size:13px;font-weight:700;text-transform:uppercase;margin-bottom:8px">Overall Grade</div>
          <div class="result-grade" style="color:${overallG.c}">${overallG.g}</div>
          <div style="color:#64748b;margin-top:4px">${overallPct}% — ${overallG.g === "F" ? "Needs Improvement" : overallG.g === "D" ? "Satisfactory" : overallG.g === "C" ? "Average" : overallG.g === "B" ? "Good" : overallG.g === "A" ? "Very Good" : "Excellent"}</div>
        </div>
        <br/>
        <button onclick="window.print()" style="background:#1a56db;color:white;padding:10px 24px;border:none;border-radius:8px;cursor:pointer;font-size:14px">🖨 Print Report Card</button>
      </body></html>
    `);
    w.document.close();
  }

  // Group results by exam for student/parent view
  const groupedByExam = exams.map(ex => ({
    exam: ex,
    rows: results.filter(r => r.exam_id === ex.id),
  })).filter(g => g.rows.length > 0);

  return (
    <div style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto", fontFamily: "'Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", color: "#1a56db", fontWeight: 700 }}>📊 Results & Report Cards</h2>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "14px" }}>Exam results, marks entry & report cards</p>
        </div>
        {(isAdmin || isTeacher) && (
          <button onClick={() => setShowExamForm(p => !p)} style={btnStyle(false)}>+ Create Exam</button>
        )}
      </div>

      {msg && (
        <div style={{ background: msg.startsWith("Error") ? "#fef2f2" : "#f0fdf4", border: `1px solid ${msg.startsWith("Error") ? "#fca5a5" : "#86efac"}`, color: msg.startsWith("Error") ? "#dc2626" : "#16a34a", padding: "10px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
          {msg}
        </div>
      )}

      {/* Create Exam Form */}
      {showExamForm && (isAdmin || isTeacher) && (
        <div style={formCard}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, color: "#1a56db", fontSize: "16px" }}>Create New Exam</h3>
            <button onClick={() => setShowExamForm(false)} style={closeBtn}>✕</button>
          </div>
          <div style={fGrid}>
            <FInput label="Exam Title" value={examForm.title} onChange={v => setExamForm(p => ({ ...p, title: v }))} placeholder="e.g. Mid Term 2025" />
            <div>
              <label style={lbl}>Exam Type</label>
              <select value={examForm.exam_type} onChange={e => setExamForm(p => ({ ...p, exam_type: e.target.value }))} style={inp}>
                {EXAM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Class</label>
              <select value={examForm.class_id} onChange={e => setExamForm(p => ({ ...p, class_id: e.target.value }))} style={inp}>
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <FInput label="Total Marks" type="number" value={examForm.total_marks} onChange={v => setExamForm(p => ({ ...p, total_marks: v }))} placeholder="100" />
            <FInput label="Exam Date" type="date" value={examForm.exam_date} onChange={v => setExamForm(p => ({ ...p, exam_date: v }))} />
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button onClick={createExam} style={btnStyle(false)}>Create & Enter Marks →</button>
            <button onClick={() => setShowExamForm(false)} style={btnStyle(true)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Admin/Teacher Tabs */}
      {(isAdmin || isTeacher) && (
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#f1f5f9", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
          {[["exams","📋 Exams"], ["marks","✏️ Enter Marks"], ["view","👁 View Results"]].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 18px", borderRadius: "7px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px", background: tab === t ? "#1a56db" : "transparent", color: tab === t ? "white" : "#64748b" }}>
              {l}
            </button>
          ))}
        </div>
      )}

      {loading && <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Loading...</div>}

      {/* ── EXAMS LIST ── */}
      {!loading && (tab === "exams") && (isAdmin || isTeacher) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {exams.length === 0 && <Empty text="Koi exam nahi mila. Create karo!" />}
          {exams.map(ex => (
            <div key={ex.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: "16px", color: "#1e293b" }}>{ex.title}</span>
                  <span style={{ ...badgeBase, background: typeColor(ex.exam_type).bg, color: typeColor(ex.exam_type).text }}>{ex.exam_type}</span>
                </div>
                <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
                  📚 {ex.classes?.name || "—"} &nbsp;•&nbsp; 📅 {ex.exam_date ? new Date(ex.exam_date).toLocaleDateString("en-IN") : "No date"} &nbsp;•&nbsp; Max: {ex.total_marks} marks
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => { setSelExam(ex); if (ex.class_id) loadStudentsByClass(ex.class_id); setTab("marks"); }} style={smBtn("#eff6ff","#1a56db","#bfdbfe")}>✏️ Enter Marks</button>
                <button onClick={() => { setSelExam(ex); setTab("view"); }} style={smBtn("#f0fdf4","#16a34a","#86efac")}>👁 View</button>
                {isAdmin && <button onClick={() => deleteExam(ex.id)} style={smBtn("#fef2f2","#dc2626","#fca5a5")}>🗑</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ENTER MARKS ── */}
      {!loading && tab === "marks" && (isAdmin || isTeacher) && (
        <div>
          {!selExam ? (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "20px", color: "#92400e", fontSize: "14px" }}>
              ⚠️ Pehle Exams tab se koi exam select karo (✏️ Enter Marks button)
            </div>
          ) : (
            <div>
              {/* Exam info */}
              <div style={{ background: "linear-gradient(135deg,#1a56db,#0ea5e9)", borderRadius: "12px", padding: "16px 20px", color: "white", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "16px" }}>{selExam.title}</div>
                  <div style={{ fontSize: "13px", opacity: 0.85 }}>{selExam.classes?.name} &nbsp;•&nbsp; Max: {selExam.total_marks} marks</div>
                </div>
                <button onClick={() => setSelExam(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>Change Exam</button>
              </div>

              {/* Load students if not loaded */}
              {students.length === 0 && selExam.class_id && (
                <button onClick={() => loadStudentsByClass(selExam.class_id)} style={{ ...btnStyle(false), marginBottom: "16px" }}>Load Students</button>
              )}

              {/* Subjects */}
              <div style={{ marginBottom: "20px" }}>
                <label style={lbl}>Subjects</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                  {subjects.map(s => (
                    <span key={s} style={{ background: "#eff6ff", color: "#1a56db", border: "1px solid #bfdbfe", borderRadius: "20px", padding: "4px 12px", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                      {s}
                      <button onClick={() => setSubjects(p => p.filter(x => x !== s))} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "14px", lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input value={newSubject} onChange={e => setNewSubject(e.target.value)} onKeyDown={e => e.key === "Enter" && addSubject()} placeholder="Subject name (Enter)" style={{ ...inp, maxWidth: "240px" }} />
                  <button onClick={addSubject} style={btnStyle(false)}>+ Add</button>
                </div>
              </div>

              {/* Marks table */}
              {students.length > 0 && subjects.length > 0 && (
                <div style={{ overflowX: "auto", marginBottom: "16px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        <th style={th}>Student</th>
                        {subjects.map(s => <th key={s} style={th}>{s}<br/><span style={{ fontSize: "10px", fontWeight: 400, color: "#94a3b8" }}>/{selExam.total_marks}</span></th>)}
                        <th style={th}>Total</th>
                        <th style={th}>%</th>
                        <th style={th}>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((st, i) => {
                        const rowMarks = subjects.map(s => Number(marksData[st.id]?.[s] || 0));
                        const total = rowMarks.reduce((a, b) => a + b, 0);
                        const maxTotal = subjects.length * Number(selExam.total_marks);
                        const pct = maxTotal > 0 ? ((total / maxTotal) * 100).toFixed(1) : 0;
                        const g = calcGrade(Number(pct));
                        return (
                          <tr key={st.id} style={{ background: i % 2 === 0 ? "white" : "#fafafa", borderBottom: "1px solid #f1f5f9" }}>
                            <td style={td}><strong>{st.name}</strong></td>
                            {subjects.map(s => (
                              <td key={s} style={td}>
                                <input
                                  type="number" min="0" max={selExam.total_marks}
                                  value={marksData[st.id]?.[s] ?? ""}
                                  onChange={e => setMarksData(prev => ({ ...prev, [st.id]: { ...prev[st.id], [s]: e.target.value } }))}
                                  style={{ width: "70px", padding: "6px 8px", border: "1.5px solid #e2e8f0", borderRadius: "7px", fontSize: "14px", textAlign: "center", outline: "none" }}
                                  onFocus={e => e.target.style.borderColor = "#1a56db"}
                                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                                />
                              </td>
                            ))}
                            <td style={td}><strong>{total}</strong></td>
                            <td style={td}>{pct}%</td>
                            <td style={td}><GradeBadge pct={Number(pct)} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {students.length > 0 && subjects.length > 0 && (
                <button onClick={saveMarks} style={btnStyle(false)}>💾 Save All Marks</button>
              )}
              {students.length === 0 && <div style={{ color: "#9ca3af", fontSize: "14px" }}>Koi student nahi mila is class mein.</div>}
            </div>
          )}
        </div>
      )}

      {/* ── VIEW RESULTS (Admin/Teacher) ── */}
      {!loading && tab === "view" && (isAdmin || isTeacher) && (
        <div>
          {/* Exam selector */}
          <div style={{ marginBottom: "16px" }}>
            <label style={lbl}>Select Exam</label>
            <select value={selExam?.id || ""} onChange={e => { const ex = exams.find(x => x.id === e.target.value); setSelExam(ex || null); }} style={{ ...inp, maxWidth: "340px" }}>
              <option value="">-- Select Exam --</option>
              {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title} — {ex.classes?.name}</option>)}
            </select>
          </div>

          {selExam && results.length > 0 && (
            <ResultsTable results={results} subjects={subjects} exam={selExam} onPrint={printReportCard} role={role} />
          )}
          {selExam && results.length === 0 && <Empty text="Is exam ke liye koi result nahi mila." />}
          {!selExam && <Empty text="Exam select karo results dekhne ke liye." />}
        </div>
      )}

      {/* ── STUDENT VIEW ── */}
      {!loading && isStudent && (
        <div>
          {groupedByExam.length === 0 && <Empty text="Abhi koi result available nahi hai." />}
          {groupedByExam.map(({ exam, rows }) => {
            const subs = [...new Set(rows.map(r => r.subject))];
            const total = rows.reduce((s, r) => s + Number(r.marks_obtained || 0), 0);
            const maxT = rows.reduce((s, r) => s + Number(r.total_marks), 0);
            const pct = maxT > 0 ? ((total / maxT) * 100).toFixed(1) : 0;
            return (
              <div key={exam.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", marginBottom: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ background: "linear-gradient(135deg,#1a56db,#0ea5e9)", padding: "16px 20px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "16px" }}>{exam.title}</div>
                    <div style={{ fontSize: "13px", opacity: 0.85 }}>{exam.classes?.name || exam.exam_type} &nbsp;•&nbsp; {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString("en-IN") : ""}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "28px", fontWeight: 900 }}>{calcGrade(Number(pct)).g}</div>
                    <div style={{ fontSize: "13px", opacity: 0.85 }}>{pct}%</div>
                  </div>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "10px" }}>
                    {subs.map(sub => {
                      const r = rows.find(x => x.subject === sub);
                      const m = Number(r?.marks_obtained || 0);
                      const t = Number(r?.total_marks || 100);
                      const p = ((m / t) * 100);
                      const g = calcGrade(p);
                      return (
                        <div key={sub} style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, marginBottom: "4px" }}>{sub}</div>
                          <div style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b" }}>{m}<span style={{ fontSize: "12px", color: "#9ca3af" }}>/{t}</span></div>
                          <GradeBadge pct={p} />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", color: "#6b7280" }}>Total: <strong>{total}/{maxT}</strong> ({pct}%)</span>
                    <button onClick={() => { setSelExam(exam); setSubjects(subs); printReportCard(rows[0]?.student_id, profile?.full_name); }} style={smBtn("#eff6ff","#1a56db","#bfdbfe")}>🖨 Report Card</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── PARENT VIEW ── */}
      {!loading && isParent && (
        <div>
          {students.length > 1 && (
            <div style={{ marginBottom: "16px" }}>
              <select value={selStudent} onChange={e => { setSelStudent(e.target.value); }} style={{ ...inp, maxWidth: "260px" }}>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          {groupedByExam.length === 0 && <Empty text="Bachche ka koi result nahi mila." />}
          {groupedByExam.map(({ exam, rows }) => {
            const subs = [...new Set(rows.map(r => r.subject))];
            const total = rows.reduce((s, r) => s + Number(r.marks_obtained || 0), 0);
            const maxT = rows.reduce((s, r) => s + Number(r.total_marks), 0);
            const pct = maxT > 0 ? ((total / maxT) * 100).toFixed(1) : 0;
            return (
              <div key={exam.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", marginBottom: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ background: "linear-gradient(135deg,#1a56db,#0ea5e9)", padding: "16px 20px", color: "white", display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "16px" }}>{exam.title}</div>
                    <div style={{ fontSize: "13px", opacity: 0.85 }}>{exam.exam_type} &nbsp;•&nbsp; {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString("en-IN") : ""}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "28px", fontWeight: 900 }}>{calcGrade(Number(pct)).g}</div>
                    <div style={{ fontSize: "13px", opacity: 0.85 }}>{pct}%</div>
                  </div>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "10px" }}>
                    {subs.map(sub => {
                      const r = rows.find(x => x.subject === sub);
                      const m = Number(r?.marks_obtained || 0);
                      const t = Number(r?.total_marks || 100);
                      const p = ((m / t) * 100);
                      return (
                        <div key={sub} style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, marginBottom: "4px" }}>{sub}</div>
                          <div style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b" }}>{m}<span style={{ fontSize: "12px", color: "#9ca3af" }}>/{t}</span></div>
                          <GradeBadge pct={p} />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "14px", color: "#6b7280" }}>Total: <strong>{total}/{maxT}</strong> ({pct}%)</span>
                    <button onClick={() => { setSelExam(exam); setSubjects(subs); printReportCard(rows[0]?.student_id, students.find(s => s.id === selStudent)?.name); }} style={smBtn("#eff6ff","#1a56db","#bfdbfe")}>🖨 Report Card</button>
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

// ── Sub-components ──

function ResultsTable({ results, subjects, exam, onPrint, role }) {
  const studentIds = [...new Set(results.map(r => r.student_id))];
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            <th style={th}>Student</th>
            {subjects.map(s => <th key={s} style={th}>{s}</th>)}
            <th style={th}>Total</th>
            <th style={th}>%</th>
            <th style={th}>Grade</th>
            <th style={th}>Report</th>
          </tr>
        </thead>
        <tbody>
          {studentIds.map((sid, i) => {
            const sRows = results.filter(r => r.student_id === sid);
            const name = sRows[0]?.students?.name || "—";
            const marks = subjects.map(s => { const r = sRows.find(x => x.subject === s); return r ? Number(r.marks_obtained) : null; });
            const tot = marks.reduce((s, m) => s + (m || 0), 0);
            const maxT = subjects.length * Number(exam.total_marks);
            const pct = maxT > 0 ? ((tot / maxT) * 100).toFixed(1) : 0;
            return (
              <tr key={sid} style={{ background: i % 2 === 0 ? "white" : "#fafafa", borderBottom: "1px solid #f1f5f9" }}>
                <td style={td}><strong>{name}</strong></td>
                {marks.map((m, j) => <td key={j} style={td}>{m !== null ? m : <span style={{ color: "#d1d5db" }}>—</span>}</td>)}
                <td style={td}><strong>{tot}</strong></td>
                <td style={td}>{pct}%</td>
                <td style={td}><GradeBadge pct={Number(pct)} /></td>
                <td style={td}><button onClick={() => onPrint(sid, name)} style={smBtn("#eff6ff","#1a56db","#bfdbfe")}>🖨</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GradeBadge({ pct }) {
  const { g, c } = calcGrade(pct);
  return <span style={{ background: c, color: "white", fontSize: "11px", fontWeight: 800, padding: "2px 9px", borderRadius: "20px" }}>{g}</span>;
}

function FInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inp} />
    </div>
  );
}

function Empty({ text }) {
  return <div style={{ textAlign: "center", padding: "48px", color: "#9ca3af", background: "#f8fafc", borderRadius: "12px", fontSize: "14px" }}>{text}</div>;
}

function typeColor(t) {
  const m = { unit: { bg: "#eff6ff", text: "#1a56db" }, midterm: { bg: "#fef3c7", text: "#92400e" }, final: { bg: "#f3e8ff", text: "#6b21a8" }, other: { bg: "#f1f5f9", text: "#475569" } };
  return m[t] || m.other;
}

function btnStyle(sec) {
  return { padding: "9px 18px", borderRadius: "8px", border: sec ? "1px solid #cbd5e1" : "none", background: sec ? "white" : "#1a56db", color: sec ? "#475569" : "white", fontWeight: 600, fontSize: "13px", cursor: "pointer" };
}

function smBtn(bg, color, border) {
  return { fontSize: "12px", background: bg, color, border: `1px solid ${border}`, padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 };
}

const lbl = { display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" };
const inp = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", color: "#1e293b", background: "#fafafa" };
const formCard = { background: "white", border: "1px solid #dbeafe", borderRadius: "14px", padding: "20px", marginBottom: "20px", boxShadow: "0 4px 20px rgba(26,86,219,0.08)" };
const closeBtn = { background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94a3b8" };
const fGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "14px" };
const th = { padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#64748b", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" };
const td = { padding: "12px 14px", color: "#1e293b", verticalAlign: "middle" };
const badgeBase = { fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "99px" };
