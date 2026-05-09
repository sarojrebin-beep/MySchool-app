import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://jugdyjvxskqglatljvtn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2R5anZ4c2txZ2xhdGxqdnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQzODYsImV4cCI6MjA5MzcxMDM4Nn0.cfFbH5lKAsbjHAgH51vbA6_1AYfBtbJefLeFgyHfHTQ"
);

const SUBJECTS = {
  math:"Mathematics", sci:"Science", eng:"English",
  hindi:"Hindi", sst:"Social Science", comp:"Computer Science"
};
const SUBJ_ICONS = {
  math:"➕", sci:"🔬", eng:"📖", hindi:"🇮🇳", sst:"🌍", comp:"💻"
};

const HS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
.hw{font-family:'Plus Jakarta Sans',sans-serif;background:#F0F2F8;min-height:100%;}
.hw *{box-sizing:border-box;margin:0;padding:0;}
.hwrap{padding:14px 14px 80px;}
.htb{background:#fff;border-bottom:1px solid #E5E7EB;padding:13px 16px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:50;box-shadow:0 2px 8px rgba(0,0,0,.05);margin:-14px -14px 14px;}
.hback{width:36px;height:36px;border-radius:10px;border:1.5px solid #E5E7EB;background:#fff;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.htbt{font-size:.95rem;font-weight:800;color:#1E1B4B;}
.htbs{font-size:.62rem;color:#6B7280;margin-top:1px;}
.hcard{background:#fff;border-radius:14px;border:1px solid #E5E7EB;box-shadow:0 2px 8px rgba(0,0,0,.05);padding:14px;margin-bottom:10px;cursor:pointer;transition:all .15s;border-left:4px solid #E5E7EB;}
.hcard:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,.1);}
.hcard.pending{border-left-color:#f08c00;}
.hcard.submitted{border-left-color:#0ca678;}
.hcard.graded{border-left-color:#4F46E5;}
.hcard.overdue{border-left-color:#e03131;}
.hfils{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:12px;scrollbar-width:none;}
.hfils::-webkit-scrollbar{display:none;}
.hft{flex-shrink:0;padding:7px 14px;border-radius:20px;font-size:.72rem;font-weight:700;border:1.5px solid #E5E7EB;background:#fff;color:#6B7280;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s;}
.hft.on{background:#4F46E5;color:#fff;border-color:#4F46E5;}
.badge{display:inline-block;padding:3px 9px;border-radius:20px;font-size:.65rem;font-weight:800;}
.bg{background:#e6faf5;color:#0ca678;}
.br{background:#fff5f5;color:#e03131;}
.by{background:#fff9db;color:#f08c00;}
.bb{background:#EEF2FF;color:#4F46E5;}
.bm{background:#F3F4F6;color:#6B7280;}
.slbl{font-size:.62rem;font-weight:800;color:#9CA3AF;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;}
.hinp{width:100%;padding:11px 13px;background:#F9FAFB;border:1.5px solid #E5E7EB;border-radius:10px;color:#1E1B4B;font-family:'Plus Jakarta Sans',sans-serif;font-size:.88rem;font-weight:500;outline:none;transition:border-color .15s;margin-bottom:12px;}
.hinp:focus{border-color:#4F46E5;background:#fff;}
select.hinp{cursor:pointer;}
textarea.hinp{resize:vertical;min-height:100px;}
.hlbl{font-size:.75rem;font-weight:700;margin-bottom:5px;display:block;color:#374151;}
.hbtn{width:100%;padding:12px;background:#4F46E5;color:#fff;border:none;border-radius:11px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .15s;}
.hbtn.g{background:#0ca678;}
.hbtn.o{background:#fff;color:#4F46E5;border:1.5px solid #C7D2FE;width:auto;padding:8px 16px;font-size:.8rem;border-radius:9px;}
.hbtn.r{background:#fff5f5;color:#e03131;border:1.5px solid #ffc9c9;width:auto;padding:8px 16px;font-size:.8rem;border-radius:9px;}
.hbtn:active{transform:scale(.98);}
.ebox{background:#fff5f5;border:1px solid #ffc9c9;border-radius:10px;padding:9px 12px;font-size:.78rem;font-weight:600;color:#e03131;margin-bottom:12px;}
.okbox{background:#e6faf5;border:1px solid #96f2d7;border-radius:10px;padding:9px 12px;font-size:.78rem;font-weight:600;color:#0ca678;margin-bottom:12px;}
.hdetail{position:fixed;inset:0;background:#F0F2F8;z-index:200;overflow-y:auto;max-width:480px;margin:0 auto;font-family:'Plus Jakarta Sans',sans-serif;padding-bottom:30px;}
.sub-card{background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:13px;margin-bottom:10px;}
.sub-card.me{border-color:#4F46E5;background:#EEF2FF;}
@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fu .22s ease both;}
`;

function Toast({ msg }) {
  if (!msg) return null;
  return <div style={{ position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#1E1B4B",color:"#fff",padding:"10px 22px",borderRadius:30,fontSize:".82rem",fontWeight:700,zIndex:999,whiteSpace:"nowrap",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{msg}</div>;
}

function daysLeft(due) {
  const d = Math.ceil((new Date(due) - new Date()) / 86400000);
  return d;
}

function dueBadge(due, submitted) {
  if (submitted) return <span className="badge bg">✅ Submitted</span>;
  const d = daysLeft(due);
  if (d < 0) return <span className="badge br">⚠️ Overdue</span>;
  if (d === 0) return <span className="badge by">⏰ Due Today</span>;
  if (d === 1) return <span className="badge by">🔔 Due Tomorrow</span>;
  return <span className="badge bm">📅 {d} days left</span>;
}

// ── HOMEWORK DETAIL (Student) ──
function HomeworkDetail({ hw, profile, onClose, onSubmitted }) {
  const [submission, setSubmission] = useState(null);
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const isOverdue = daysLeft(hw.due_date) < 0;

  useEffect(() => { fetchSubmission(); }, []);

  const fetchSubmission = async () => {
    const { data } = await supabase.from("homework_submissions")
      .select("*").eq("homework_id", hw.id).eq("student_id", profile.id).single();
    if (data) { setSubmission(data); setAnswer(data.answer_text || ""); }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) { setErr("Kuch to likho!"); return; }
    setSaving(true); setErr("");
    if (submission) {
      const { error } = await supabase.from("homework_submissions")
        .update({ answer_text: answer, submitted_at: new Date().toISOString(), status: isOverdue ? "late" : "submitted" })
        .eq("id", submission.id);
      if (error) { setErr(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("homework_submissions").insert({
        homework_id: hw.id, student_id: profile.id,
        answer_text: answer, status: isOverdue ? "late" : "submitted"
      });
      if (error) { setErr(error.message); setSaving(false); return; }
    }
    setOk("Homework submit ho gaya! ✅");
    setSaving(false);
    fetchSubmission();
    setTimeout(() => onSubmitted(), 1000);
  };

  return (
    <div className="hdetail">
      <div style={{ background:"#fff",borderBottom:"1px solid #E5E7EB",padding:"13px 16px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50 }}>
        <button className="hback" onClick={onClose}>←</button>
        <div><div className="htbt">{hw.title}</div><div className="htbs">{SUBJ_ICONS[hw.subject]} {SUBJECTS[hw.subject]}</div></div>
      </div>

      <div style={{ padding:"16px 16px 30px" }}>
        {/* Info Card */}
        <div style={{ background:`linear-gradient(135deg,#4F46E5,#7C3AED)`,borderRadius:16,padding:"20px 18px",color:"#fff",marginBottom:16 }}>
          <div style={{ fontSize:"1rem",fontWeight:800,marginBottom:8 }}>{hw.title}</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12 }}>
            {[
              ["📚",SUBJECTS[hw.subject],"Subject"],
              ["📅",new Date(hw.due_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}),"Due Date"],
              ["💯",hw.max_marks+" Marks","Max Marks"],
              ["⏰",daysLeft(hw.due_date)<0?"Overdue":daysLeft(hw.due_date)===0?"Today":daysLeft(hw.due_date)+" days","Time Left"],
            ].map(([icon,val,lbl])=>(
              <div key={lbl} style={{ background:"rgba(255,255,255,.15)",borderRadius:10,padding:"10px 8px",textAlign:"center" }}>
                <div style={{ fontSize:".7rem",opacity:.8 }}>{icon} {lbl}</div>
                <div style={{ fontSize:".85rem",fontWeight:800,marginTop:3 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chapter */}
        {hw.chapter && (
          <div style={{ background:"#fff",borderRadius:12,padding:"12px 14px",border:"1px solid #E5E7EB",marginBottom:12 }}>
            <div className="slbl">Chapter</div>
            <div style={{ fontSize:".88rem",fontWeight:700 }}>{hw.chapter}</div>
          </div>
        )}

        {/* Description */}
        {hw.description && (
          <div style={{ background:"#fff",borderRadius:12,padding:"12px 14px",border:"1px solid #E5E7EB",marginBottom:16 }}>
            <div className="slbl">Question / Instructions</div>
            <div style={{ fontSize:".88rem",lineHeight:1.7,color:"#374151",whiteSpace:"pre-wrap" }}>{hw.description}</div>
          </div>
        )}

        {/* Graded result */}
        {submission?.status === "graded" && (
          <div style={{ background:"#e6faf5",border:"1px solid #96f2d7",borderRadius:12,padding:"14px 16px",marginBottom:16 }}>
            <div className="slbl" style={{ color:"#0ca678",marginBottom:8 }}>✅ Graded</div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
              <div style={{ fontSize:"1.2rem",fontWeight:800,color:"#0ca678" }}>{submission.marks_obtained}/{hw.max_marks}</div>
              <div style={{ fontSize:".78rem",color:"#0ca678",fontWeight:700 }}>{Math.round((submission.marks_obtained/hw.max_marks)*100)}%</div>
            </div>
            {submission.feedback && (
              <div style={{ background:"rgba(255,255,255,.7)",borderRadius:8,padding:"8px 10px",fontSize:".78rem",color:"#374151",lineHeight:1.6 }}>
                💬 {submission.feedback}
              </div>
            )}
          </div>
        )}

        {/* Submit area */}
        {hw.status !== "closed" && (
          <div style={{ background:"#fff",borderRadius:14,border:"1px solid #E5E7EB",padding:16 }}>
            <div className="slbl">Apna Jawab Likho</div>
            {err && <div className="ebox">{err}</div>}
            {ok && <div className="okbox">{ok}</div>}
            {isOverdue && !submission && (
              <div style={{ background:"#fff5f5",border:"1px solid #ffc9c9",borderRadius:10,padding:"8px 12px",marginBottom:12,fontSize:".75rem",color:"#e03131",fontWeight:600 }}>
                ⚠️ Due date nikal gayi! Late submission hogi.
              </div>
            )}
            <textarea className="hinp" placeholder="Yahan apna answer likho..." value={answer} onChange={e => setAnswer(e.target.value)} style={{ height:140 }} />
            {submission?.status === "graded"
              ? <div style={{ textAlign:"center",color:"#9CA3AF",fontSize:".78rem",padding:"8px 0" }}>Already graded — edit nahi kar sakte</div>
              : <button className="hbtn g" onClick={handleSubmit} disabled={saving}>
                  {saving ? "Submitting..." : submission ? "Update Submission ✏️" : "Submit Homework ✅"}
                </button>
            }
          </div>
        )}
        {hw.status === "closed" && !submission && (
          <div style={{ background:"#fff5f5",borderRadius:12,padding:"14px 16px",textAlign:"center",border:"1px solid #ffc9c9" }}>
            <div style={{ fontSize:".88rem",fontWeight:700,color:"#e03131" }}>❌ Homework Closed</div>
            <div style={{ fontSize:".72rem",color:"#9CA3AF",marginTop:4 }}>Submission band ho gayi</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── HOMEWORK DETAIL (Teacher/Admin) ──
function HomeworkDetailTeacher({ hw, profile, onClose, onDeleted }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selSub, setSelSub] = useState(null);
  const [grade, setGrade] = useState({ marks:"", feedback:"" });
  const [grading, setGrading] = useState(false);
  const [ok, setOk] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchSubmissions(); }, []);

  const fetchSubmissions = async () => {
    const { data } = await supabase.from("homework_submissions")
      .select("*, profiles(full_name, email)")
      .eq("homework_id", hw.id)
      .order("submitted_at", { ascending: false });
    setSubmissions(data || []);
    setLoading(false);
  };

  const handleGrade = async () => {
    if (!grade.marks && grade.marks !== 0) return;
    setGrading(true);
    await supabase.from("homework_submissions").update({
      marks_obtained: parseInt(grade.marks),
      feedback: grade.feedback,
      status: "graded"
    }).eq("id", selSub.id);
    setGrading(false);
    setOk("Grade save ho gaya! ✅");
    setSelSub(null);
    fetchSubmissions();
    setTimeout(() => setOk(""), 2000);
  };

  const handleDelete = async () => {
    if (!confirm("Ye homework delete karna chahte ho?")) return;
    setDeleting(true);
    await supabase.from("homework").delete().eq("id", hw.id);
    setDeleting(false);
    onDeleted();
  };

  const toggleStatus = async () => {
    const newStatus = hw.status === "active" ? "closed" : "active";
    await supabase.from("homework").update({ status: newStatus }).eq("id", hw.id);
    onClose();
  };

  const gradedCount = submissions.filter(s => s.status === "graded").length;

  return (
    <div className="hdetail">
      <div style={{ background:"#fff",borderBottom:"1px solid #E5E7EB",padding:"13px 16px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50 }}>
        <button className="hback" onClick={onClose}>←</button>
        <div style={{ flex:1 }}><div className="htbt">{hw.title}</div><div className="htbs">{submissions.length} submissions</div></div>
        <button className="hbtn r" onClick={handleDelete} disabled={deleting}>🗑️</button>
      </div>

      <div style={{ padding:"16px 16px 30px" }}>
        {ok && <div className="okbox">{ok}</div>}

        {/* Stats */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14 }}>
          {[
            [submissions.length,"Submitted","#4F46E5"],
            [gradedCount,"Graded","#0ca678"],
            [hw.max_marks+" M","Max Marks","#f08c00"],
          ].map(([n,l,c])=>(
            <div key={l} style={{ background:"#fff",borderRadius:12,padding:"12px 8px",border:"1px solid #E5E7EB",textAlign:"center" }}>
              <div style={{ fontSize:"1.2rem",fontWeight:800,color:c }}>{n}</div>
              <div style={{ fontSize:".58rem",color:"#9CA3AF",textTransform:"uppercase",marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div style={{ background:"#fff",borderRadius:12,padding:"12px 14px",border:"1px solid #E5E7EB",marginBottom:12 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
            <div className="slbl" style={{ margin:0 }}>Homework Info</div>
            <button className="hbtn o" onClick={toggleStatus}>
              {hw.status==="active" ? "🔒 Close" : "🔓 Reopen"}
            </button>
          </div>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            <span className="badge bb">📅 Due: {new Date(hw.due_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>
            <span className="badge bm">{SUBJ_ICONS[hw.subject]} {SUBJECTS[hw.subject]}</span>
            <span className={`badge ${hw.status==="active"?"bg":"br"}`}>{hw.status==="active"?"✅ Active":"🔒 Closed"}</span>
          </div>
        </div>

        {/* Submissions */}
        <div className="slbl" style={{ marginBottom:10 }}>Student Submissions</div>
        {loading ? <div style={{ textAlign:"center",padding:30,color:"#9CA3AF" }}>Loading...</div> :
          submissions.length === 0 ? (
            <div style={{ background:"#fff",borderRadius:12,padding:"30px 16px",textAlign:"center",border:"1px solid #E5E7EB" }}>
              <div style={{ fontSize:"1.5rem",marginBottom:8 }}>📭</div>
              <div style={{ color:"#9CA3AF",fontSize:".82rem" }}>Abhi tak koi submission nahi</div>
            </div>
          ) : submissions.map(sub => (
            <div key={sub.id} className="sub-card fu" style={{ borderLeft:`4px solid ${sub.status==="graded"?"#4F46E5":sub.status==="late"?"#e03131":"#0ca678"}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:".88rem",fontWeight:800 }}>{sub.profiles?.full_name}</div>
                  <div style={{ fontSize:".62rem",color:"#9CA3AF",marginTop:2 }}>{new Date(sub.submitted_at).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                </div>
                <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                  {sub.status==="graded" && <span className="badge bb">{sub.marks_obtained}/{hw.max_marks}</span>}
                  <span className={`badge ${sub.status==="graded"?"bb":sub.status==="late"?"br":"bg"}`}>
                    {sub.status==="graded"?"✅ Graded":sub.status==="late"?"⚠️ Late":"📝 New"}
                  </span>
                </div>
              </div>
              {sub.answer_text && (
                <div style={{ background:"#F9FAFB",borderRadius:8,padding:"8px 10px",fontSize:".78rem",color:"#374151",lineHeight:1.6,marginBottom:8,maxHeight:80,overflow:"hidden" }}>
                  {sub.answer_text}
                </div>
              )}
              {sub.status==="graded" && sub.feedback && (
                <div style={{ fontSize:".72rem",color:"#4F46E5",marginBottom:8 }}>💬 {sub.feedback}</div>
              )}
              {selSub?.id === sub.id ? (
                <div style={{ marginTop:8 }}>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8 }}>
                    <div>
                      <label className="hlbl">Marks (/{hw.max_marks})</label>
                      <input className="hinp" style={{ marginBottom:0 }} type="number" min="0" max={hw.max_marks} placeholder="0" value={grade.marks} onChange={e=>setGrade({...grade,marks:e.target.value})}/>
                    </div>
                    <div>
                      <label className="hlbl">Feedback</label>
                      <input className="hinp" style={{ marginBottom:0 }} placeholder="Optional..." value={grade.feedback} onChange={e=>setGrade({...grade,feedback:e.target.value})}/>
                    </div>
                  </div>
                  <div style={{ display:"flex",gap:8 }}>
                    <button className="hbtn g" style={{ flex:1 }} onClick={handleGrade} disabled={grading}>{grading?"Saving...":"✅ Grade Save Karo"}</button>
                    <button className="hbtn o" onClick={()=>setSelSub(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="hbtn o" onClick={()=>{setSelSub(sub);setGrade({marks:sub.marks_obtained||"",feedback:sub.feedback||""});}}>
                  {sub.status==="graded"?"✏️ Edit Grade":"📝 Grade Karo"}
                </button>
              )}
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── ADD HOMEWORK (Teacher/Admin) ──
function AddHomework({ profile, classes, onClose, onAdded }) {
  const [form, setForm] = useState({ title:"",description:"",subject:"math",chapter:"",class_id:"",due_date:"",max_marks:10 });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSave = async () => {
    if (!form.title.trim()) { setErr("Title bharo!"); return; }
    if (!form.due_date) { setErr("Due date bharo!"); return; }
    setSaving(true);
    const { data: school } = await supabase.from("schools").select("id").limit(1).single();
    const { error } = await supabase.from("homework").insert({
      title: form.title, description: form.description, subject: form.subject,
      chapter: form.chapter, class_id: form.class_id || null,
      teacher_id: profile.id, school_id: school?.id,
      due_date: form.due_date, max_marks: form.max_marks,
    });
    if (error) { setErr(error.message); setSaving(false); return; }
    setSaving(false);
    onAdded();
  };

  return (
    <div className="hdetail">
      <div style={{ background:"#fff",borderBottom:"1px solid #E5E7EB",padding:"13px 16px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50 }}>
        <button className="hback" onClick={onClose}>←</button>
        <div><div className="htbt">Homework Add Karo</div><div className="htbs">Nayi assignment</div></div>
      </div>
      <div style={{ padding:"16px 16px 30px" }}>
        <div style={{ background:"#fff",borderRadius:14,border:"1px solid #E5E7EB",padding:16 }}>
          {err && <div className="ebox">{err}</div>}
          <label className="hlbl">Title *</label>
          <input className="hinp" placeholder="Jaise: Chapter 3 Exercise 3.1" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
          <label className="hlbl">Subject *</label>
          <select className="hinp" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}>
            {Object.entries(SUBJECTS).map(([k,v])=><option key={k} value={k}>{SUBJ_ICONS[k]} {v}</option>)}
          </select>
          <label className="hlbl">Chapter</label>
          <input className="hinp" placeholder="Chapter name (optional)" value={form.chapter} onChange={e=>setForm({...form,chapter:e.target.value})}/>
          <label className="hlbl">Class</label>
          <select className="hinp" value={form.class_id} onChange={e=>setForm({...form,class_id:e.target.value})}>
            <option value="">All classes</option>
            {classes.map(c=><option key={c.id} value={c.id}>{c.name} {c.section||""}</option>)}
          </select>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
            <div>
              <label className="hlbl">Due Date *</label>
              <input className="hinp" style={{ marginBottom:0 }} type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})} min={new Date().toISOString().split("T")[0]}/>
            </div>
            <div>
              <label className="hlbl">Max Marks</label>
              <input className="hinp" style={{ marginBottom:0 }} type="number" value={form.max_marks} min="1" onChange={e=>setForm({...form,max_marks:+e.target.value})}/>
            </div>
          </div>
          <div style={{ marginTop:12 }}>
            <label className="hlbl">Question / Description</label>
            <textarea className="hinp" placeholder="Homework instructions ya question..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{ height:120 }}/>
          </div>
          <button className="hbtn g" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "✅ Homework Post Karo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN MODULE ──
export default function HomeworkModule({ role, profile }) {
  const [homework, setHomework] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mySubmissions, setMySubmissions] = useState({});
  const [filter, setFilter] = useState("all");
  const [selHW, setSelHW] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState("");
  const showToast = m => { setToast(m); setTimeout(()=>setToast(""),2000); };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [hwRes, clRes] = await Promise.all([
      supabase.from("homework").select("*").order("due_date", { ascending: true }),
      supabase.from("classes").select("*").order("name"),
    ]);
    setHomework(hwRes.data || []);
    setClasses(clRes.data || []);

    if (role === "student") {
      const { data: subs } = await supabase.from("homework_submissions")
        .select("homework_id,status,marks_obtained").eq("student_id", profile.id);
      const map = {};
      (subs || []).forEach(s => { map[s.homework_id] = s; });
      setMySubmissions(map);
    }
    setLoading(false);
  };

  const getCardClass = (hw) => {
    if (role === "student") {
      const sub = mySubmissions[hw.id];
      if (!sub) return daysLeft(hw.due_date) < 0 ? "overdue" : "pending";
      if (sub.status === "graded") return "graded";
      return "submitted";
    }
    return hw.status === "closed" ? "submitted" : "pending";
  };

  const filtered = homework.filter(hw => {
    if (filter === "all") return true;
    if (filter === "pending") return !mySubmissions[hw.id] && daysLeft(hw.due_date) >= 0;
    if (filter === "submitted") return !!mySubmissions[hw.id];
    if (filter === "overdue") return !mySubmissions[hw.id] && daysLeft(hw.due_date) < 0;
    if (filter === "active") return hw.status === "active";
    if (filter === "closed") return hw.status === "closed";
    return true;
  });

  const studentFilters = ["all","pending","submitted","overdue"];
  const teacherFilters = ["all","active","closed"];
  const filters = role === "student" ? studentFilters : teacherFilters;

  if (showAdd) return (
    <>
      <style>{HS}</style>
      <div className="hw">
        <AddHomework profile={profile} classes={classes} onClose={()=>setShowAdd(false)} onAdded={()=>{setShowAdd(false);fetchData();showToast("Homework posted! ✅");}}/>
      </div>
    </>
  );

  if (selHW) {
    if (role === "student") return (
      <>
        <style>{HS}</style>
        <div className="hw">
          <HomeworkDetail hw={selHW} profile={profile} onClose={()=>setSelHW(null)} onSubmitted={()=>{setSelHW(null);fetchData();showToast("Submitted! ✅");}}/>
        </div>
      </>
    );
    return (
      <>
        <style>{HS}</style>
        <div className="hw">
          <HomeworkDetailTeacher hw={selHW} profile={profile} onClose={()=>{setSelHW(null);fetchData();}} onDeleted={()=>{setSelHW(null);fetchData();showToast("Deleted!");}}/>
        </div>
      </>
    );
  }

  // Pending count for student
  const pendingCount = role === "student" ? homework.filter(hw => !mySubmissions[hw.id] && daysLeft(hw.due_date) >= 0).length : homework.filter(hw=>hw.status==="active").length;

  return (
    <>
      <style>{HS}</style>
      <Toast msg={toast}/>
      <div className="hw"><div className="hwrap">

        {/* Hero */}
        <div style={{ background:"linear-gradient(135deg,#78350F,#B45309)",borderRadius:18,padding:"18px 18px 20px",color:"#fff",marginBottom:14 }}>
          <div style={{ fontSize:".72rem",opacity:.8,marginBottom:4 }}>Homework & Assignments</div>
          <div style={{ fontSize:"1.1rem",fontWeight:800,marginBottom:14 }}>
            {role==="student" ? `${profile?.full_name?.split(" ")[0]} ke Assignments` : "Manage Homework"}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
            {role==="student" ? [
              [pendingCount,"Pending"],
              [Object.keys(mySubmissions).length,"Submitted"],
              [homework.filter(h=>daysLeft(h.due_date)<0&&!mySubmissions[h.id]).length,"Overdue"],
            ] : [
              [homework.filter(h=>h.status==="active").length,"Active"],
              [homework.filter(h=>h.status==="closed").length,"Closed"],
              [homework.length,"Total"],
            ]).map(([n,l])=>(
              <div key={l} style={{ background:"rgba(255,255,255,.15)",borderRadius:10,padding:"10px 6px",textAlign:"center" }}>
                <div style={{ fontSize:"1.3rem",fontWeight:800 }}>{n}</div>
                <div style={{ fontSize:".55rem",opacity:.8,textTransform:"uppercase",letterSpacing:.5 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Add button */}
        {(role==="admin"||role==="teacher") && (
          <button className="hbtn" style={{ marginBottom:14 }} onClick={()=>setShowAdd(true)}>+ Homework Post Karo</button>
        )}

        {/* Filters */}
        <div className="hfils">
          {filters.map(f=>(
            <button key={f} className={`hft ${filter===f?"on":""}`} onClick={()=>setFilter(f)}>
              {f==="all"?"All":f==="pending"?"⏳ Pending":f==="submitted"?"✅ Submitted":f==="overdue"?"⚠️ Overdue":f==="active"?"✅ Active":"🔒 Closed"}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? <div style={{ textAlign:"center",padding:40,color:"#9CA3AF" }}>Loading...</div> :
          filtered.length===0 ? (
            <div style={{ background:"#fff",borderRadius:14,padding:"40px 16px",textAlign:"center",border:"1px solid #E5E7EB" }}>
              <div style={{ fontSize:"2rem",marginBottom:8 }}>📭</div>
              <div style={{ color:"#9CA3AF",fontSize:".85rem" }}>Koi homework nahi hai</div>
            </div>
          ) : filtered.map(hw => {
            const sub = mySubmissions[hw.id];
            const days = daysLeft(hw.due_date);
            return (
              <div key={hw.id} className={`hcard ${getCardClass(hw)} fu`} onClick={()=>setSelHW(hw)}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                  <div style={{ flex:1,paddingRight:8 }}>
                    <div style={{ fontWeight:800,fontSize:".9rem",marginBottom:3 }}>{hw.title}</div>
                    <div style={{ fontSize:".72rem",color:"#6B7280" }}>
                      {SUBJ_ICONS[hw.subject]} {SUBJECTS[hw.subject]}
                      {hw.chapter && ` • ${hw.chapter}`}
                    </div>
                  </div>
                  {role==="student" ? dueBadge(hw.due_date, !!sub) :
                    <span className={`badge ${hw.status==="active"?"bg":"bm"}`}>{hw.status==="active"?"✅ Active":"🔒 Closed"}</span>
                  }
                </div>

                {hw.description && (
                  <div style={{ fontSize:".78rem",color:"#6B7280",marginBottom:8,lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>
                    {hw.description}
                  </div>
                )}

                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div style={{ display:"flex",gap:6 }}>
                    <span className="badge bm">📅 {new Date(hw.due_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>
                    <span className="badge bm">💯 {hw.max_marks} Marks</span>
                  </div>
                  {role==="student" && sub?.status==="graded" && (
                    <span className="badge bb">🏆 {sub.marks_obtained}/{hw.max_marks}</span>
                  )}
                  {role!=="student" && (
                    <span className="badge bb">Tap to manage →</span>
                  )}
                </div>
              </div>
            );
          })
        }
      </div></div>
    </>
  );
}
