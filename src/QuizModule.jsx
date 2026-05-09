import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://jugdyjvxskqglatljvtn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2R5anZ4c2txZ2xhdGxqdnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQzODYsImV4cCI6MjA5MzcxMDM4Nn0.cfFbH5lKAsbjHAgH51vbA6_1AYfBtbJefLeFgyHfHTQ"
);

const SUBJECTS = {
  math:  { name:"Mathematics",   icon:"➕", color:"#3730A3" },
  sci:   { name:"Science",       icon:"🔬", color:"#065F46" },
  eng:   { name:"English",       icon:"📖", color:"#1E3A5F" },
  hindi: { name:"Hindi",         icon:"🇮🇳", color:"#78350F" },
  sst:   { name:"Social Sci.",   icon:"🌍", color:"#4C1D95" },
  comp:  { name:"Computer Sci.", icon:"💻", color:"#7F1D1D" },
};

const CHAPTERS = {
  math:  ["Chapter 1 — Real Numbers","Chapter 2 — Polynomials","Chapter 3 — Pair of Linear Equations","Chapter 4 — Quadratic Equations","Chapter 5 — Arithmetic Progressions","Chapter 6 — Triangles","Chapter 7 — Coordinate Geometry","Chapter 8 — Trigonometry","Chapter 9 — Circles","Chapter 10 — Statistics","Chapter 11 — Probability"],
  sci:   ["Chapter 1 — Chemical Reactions","Chapter 2 — Acids Bases Salts","Chapter 3 — Metals & Non-metals","Chapter 4 — Carbon Compounds","Chapter 5 — Periodic Classification","Chapter 6 — Life Processes","Chapter 7 — Control & Coordination","Chapter 8 — Reproduction","Chapter 9 — Heredity & Evolution","Chapter 10 — Light","Chapter 11 — Electricity","Chapter 12 — Magnetic Effects"],
  eng:   ["Ch 1 — A Letter to God","Ch 2 — Nelson Mandela","Ch 3 — Two Stories About Flying","Ch 4 — Diary of Anne Frank","Ch 5 — Hundred Dresses I","Ch 6 — Hundred Dresses II","Ch 7 — Glimpses of India","Ch 8 — Mijbil the Otter","Ch 9 — Madam Rides the Bus","Ch 10 — Sermon at Benares"],
  hindi: ["Ch 1 — Surdas","Ch 2 — Tulsidas","Ch 3 — Dev","Ch 4 — Jay Shankar Prasad","Ch 5 — Nirala","Ch 6 — Nagarjun","Ch 7 — Manglesh Dabral"],
  sst:   ["History Ch 1 — Rise of Nationalism","History Ch 2 — Nationalism in India","History Ch 3 — Making of Global World","Geography Ch 1 — Resources","Geography Ch 2 — Forest & Wildlife","Civics Ch 1 — Power Sharing","Civics Ch 2 — Federalism","Economics Ch 1 — Development"],
  comp:  ["Ch 1 — Intro to Computers","Ch 2 — Hardware & Software","Ch 3 — Networking","Ch 4 — Internet","Ch 5 — Programming Basics"],
};

const DIFF_LABEL = { easy:"Easy 🟢", medium:"Medium 🟡", hard:"Hard 🔴" };
const DIFF_CLS   = { easy:"dg", medium:"dy", hard:"dr" };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  if (a.length>=2 && a.every((v,i)=>v===arr[i])) [a[0],a[1]]=[a[1],a[0]];
  return a;
}

const QS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
.qz{font-family:'Plus Jakarta Sans',sans-serif;background:#F0F2F8;min-height:100%;}
.qz *{box-sizing:border-box;margin:0;padding:0;}
.qwrap{padding:14px 14px 80px;}
.qhero{background:linear-gradient(135deg,#3730A3,#4F46E5);color:#fff;border-radius:18px;padding:18px;margin-bottom:14px;}
.qhero-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px;}
.qhs{background:rgba(255,255,255,.15);border-radius:10px;padding:10px 6px;text-align:center;}
.qhs-n{font-size:1.3rem;font-weight:800;display:block;}
.qhs-l{font-size:.55rem;opacity:.8;text-transform:uppercase;letter-spacing:.5px;display:block;}
.qsgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}
.qscard{border-radius:16px;padding:16px 14px;cursor:pointer;color:#fff;border:none;text-align:left;transition:transform .15s;width:100%;}
.qscard:hover{transform:translateY(-2px);}
.qsi{font-size:1.8rem;display:block;margin-bottom:8px;}
.qsn{font-size:.82rem;font-weight:800;display:block;}
.qsc{font-size:.62rem;opacity:.8;margin-top:3px;display:block;}
.qtb{background:#fff;border-bottom:1px solid #E5E7EB;padding:13px 16px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:50;box-shadow:0 2px 8px rgba(0,0,0,.05);margin:-14px -14px 14px;}
.qback{width:36px;height:36px;border-radius:10px;border:1.5px solid #E5E7EB;background:#fff;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.qtbt{font-size:.95rem;font-weight:800;color:#1E1B4B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.qtbs{font-size:.62rem;color:#6B7280;margin-top:1px;}
.qcard{background:#fff;border-radius:14px;border:1px solid #E5E7EB;box-shadow:0 2px 8px rgba(0,0,0,.05);padding:14px;margin-bottom:10px;cursor:pointer;transition:all .15s;}
.qcard:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,.1);}
.qcard.att{border-left:4px solid #0ca678;}
.qfils{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:12px;scrollbar-width:none;}
.qfils::-webkit-scrollbar{display:none;}
.qft{flex-shrink:0;padding:7px 14px;border-radius:20px;font-size:.72rem;font-weight:700;border:1.5px solid #E5E7EB;background:#fff;color:#6B7280;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s;}
.qft.on{background:#4F46E5;color:#fff;border-color:#4F46E5;}
.badge{display:inline-block;padding:3px 9px;border-radius:20px;font-size:.65rem;font-weight:800;}
.dg{background:#e6faf5;color:#0ca678;}
.dr{background:#fff5f5;color:#e03131;}
.dy{background:#fff9db;color:#f08c00;}
.db{background:#EEF2FF;color:#4F46E5;}
.dm{background:#F3F4F6;color:#6B7280;}
.slbl{font-size:.62rem;font-weight:800;color:#9CA3AF;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;}
/* PLAYER */
.qplayer{position:fixed;inset:0;background:#F0F2F8;z-index:200;display:flex;flex-direction:column;max-width:480px;margin:0 auto;font-family:'Plus Jakarta Sans',sans-serif;}
.qph{background:#fff;padding:12px 16px;border-bottom:1px solid #E5E7EB;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;gap:10px;}
.qtimer{font-size:1.1rem;font-weight:800;color:#4F46E5;font-variant-numeric:tabular-nums;}
.qtimer.w{color:#f08c00;animation:tp .5s infinite;}
.qtimer.d{color:#e03131;animation:tp .3s infinite;}
@keyframes tp{0%,100%{opacity:1}50%{opacity:.4}}
.qprog{height:4px;background:#E5E7EB;flex-shrink:0;}
.qprogf{height:100%;background:#4F46E5;transition:width .3s;}
.qdots{display:flex;gap:5px;flex-wrap:wrap;padding:10px 16px;background:#fff;flex-shrink:0;border-bottom:1px solid #E5E7EB;}
.qdot{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:800;cursor:pointer;border:2px solid transparent;flex-shrink:0;transition:all .15s;}
.qdot.un{background:#F3F4F6;color:#9CA3AF;border-color:#E5E7EB;}
.qdot.an{background:#4F46E5;color:#fff;}
.qdot.cu{border-color:#4F46E5;background:#EEF2FF;color:#4F46E5;}
.qdot.sk{background:#fff9db;color:#f08c00;border-color:#ffe066;}
.qbody{flex:1;overflow-y:auto;padding:18px 16px;}
.qnum{font-size:.65rem;font-weight:800;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;}
.qtext{font-size:.98rem;font-weight:700;line-height:1.6;margin-bottom:18px;color:#1E1B4B;}
.mopt{display:flex;align-items:center;gap:12px;padding:13px 14px;background:#fff;border-radius:12px;border:2px solid #E5E7EB;margin-bottom:10px;cursor:pointer;transition:all .15s;-webkit-tap-highlight-color:transparent;}
.mopt.sl{border-color:#4F46E5;background:#EEF2FF;}
.mopt.co{border-color:#0ca678!important;background:#e6faf5!important;pointer-events:none;}
.mopt.wr{border-color:#e03131!important;background:#fff5f5!important;pointer-events:none;}
.mopt.rv{border-color:#0ca678;background:#e6faf5;pointer-events:none;}
.ol{width:30px;height:30px;border-radius:50%;background:#F3F4F6;display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:800;color:#9CA3AF;flex-shrink:0;transition:all .15s;}
.mopt.sl .ol{background:#4F46E5;color:#fff;}
.mopt.co .ol{background:#0ca678;color:#fff;}
.mopt.wr .ol{background:#e03131;color:#fff;}
.mopt.rv .ol{background:#0ca678;color:#fff;}
.ot{font-size:.88rem;font-weight:600;flex:1;}
.tfopts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}
.tfopt{padding:18px 10px;border-radius:12px;border:2px solid #E5E7EB;text-align:center;cursor:pointer;transition:all .15s;background:#fff;}
.tfopt.sl{border-color:#4F46E5;background:#EEF2FF;}
.tfopt.co{border-color:#0ca678;background:#e6faf5;pointer-events:none;}
.tfopt.wr{border-color:#e03131;background:#fff5f5;pointer-events:none;}
.tfopt.rv{border-color:#0ca678;background:#e6faf5;pointer-events:none;}
.tfi{font-size:1.8rem;margin-bottom:6px;}
.tfl{font-size:.85rem;font-weight:800;}
.fibi{width:100%;padding:14px 16px;background:#fff;border:2px solid #E5E7EB;border-radius:12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:1rem;font-weight:600;outline:none;transition:border-color .15s;margin-bottom:14px;text-align:center;}
.fibi:focus{border-color:#4F46E5;}
.fibi.co{border-color:#0ca678;background:#e6faf5;color:#0ca678;}
.fibi.wr{border-color:#e03131;background:#fff5f5;color:#e03131;}
.mgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px;}
.mcol-lbl{font-size:.62rem;font-weight:800;color:#9CA3AF;text-transform:uppercase;text-align:center;margin-bottom:6px;}
.mci{padding:11px 10px;border-radius:12px;border:2px solid #E5E7EB;background:#fff;font-size:.84rem;font-weight:700;text-align:center;min-height:46px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;color:#1E1B4B;margin-bottom:8px;}
.mci.sl{border-color:#4F46E5;background:#EEF2FF;color:#4F46E5;}
.mci.conn{border-color:#4F46E5;background:#EEF2FF;cursor:default;}
.mci.co{border-color:#0ca678;background:#e6faf5;color:#0ca678;cursor:default;}
.mci.wr{border-color:#e03131;background:#fff5f5;color:#e03131;cursor:default;}
.mhint{margin-top:10px;text-align:center;font-size:.72rem;color:#6B7280;font-weight:600;}
.expl{background:#EEF2FF;border:1px solid #C7D2FE;border-radius:10px;padding:11px 13px;margin-top:10px;font-size:.78rem;font-weight:600;color:#4F46E5;line-height:1.5;}
.qfoot{background:#fff;padding:14px 16px;border-top:1px solid #E5E7EB;flex-shrink:0;display:flex;gap:8px;}
.qnb{flex:1;padding:13px;border-radius:12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;border:none;transition:all .15s;}
.bp{background:#F3F4F6;color:#9CA3AF;border:1.5px solid #E5E7EB;}
.bn{background:#4F46E5;color:#fff;}
.bs{background:#0ca678;color:#fff;}
.bsk{background:#fff9db;color:#f08c00;border:1.5px solid #ffe066;flex:none;padding:13px 16px;border-radius:12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.82rem;font-weight:700;cursor:pointer;}
/* START */
.qstart{position:fixed;inset:0;background:#F0F2F8;z-index:200;overflow-y:auto;max-width:480px;margin:0 auto;font-family:'Plus Jakarta Sans',sans-serif;padding-bottom:30px;}
.mcard{border-radius:14px;border:2px solid #E5E7EB;background:#fff;padding:16px 14px;cursor:pointer;transition:all .15s;margin-bottom:10px;}
.mcard.on{border-color:#4F46E5;background:#EEF2FF;}
.mct{font-size:.88rem;font-weight:800;color:#1E1B4B;margin-bottom:4px;}
.mcs{font-size:.72rem;color:#6B7280;font-weight:600;}
/* RESULT */
.qresult{position:fixed;inset:0;background:#F0F2F8;z-index:200;overflow-y:auto;max-width:480px;margin:0 auto;font-family:'Plus Jakarta Sans',sans-serif;padding-bottom:30px;}
.rhero{background:linear-gradient(135deg,#3730A3,#4F46E5,#6366F1);color:#fff;padding:28px 20px 24px;text-align:center;}
.rgrade{font-size:4rem;font-weight:800;line-height:1;margin-bottom:6px;}
.rpct{font-size:1.3rem;font-weight:800;opacity:.9;}
.rmsg{font-size:.82rem;opacity:.8;margin-top:4px;}
.rstats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:14px 16px;}
.rstat{background:#fff;border-radius:12px;padding:12px 8px;text-align:center;border:1px solid #E5E7EB;}
.rsn{font-size:1.2rem;font-weight:800;display:block;}
.rsl{font-size:.58rem;color:#9CA3AF;text-transform:uppercase;letter-spacing:.4px;margin-top:2px;display:block;}
.revq{background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:13px;margin:0 14px 10px;}
.revq.rc{border-left:4px solid #0ca678;}
.revq.rw{border-left:4px solid #e03131;}
.revq.rs{border-left:4px solid #f08c00;}
/* CREATOR */
.qccard{background:#fff;border-radius:14px;border:1px solid #E5E7EB;padding:14px;margin-bottom:10px;}
.qci{width:100%;padding:11px 13px;background:#F9FAFB;border:1.5px solid #E5E7EB;border-radius:10px;color:#1E1B4B;font-family:'Plus Jakarta Sans',sans-serif;font-size:.88rem;font-weight:500;outline:none;transition:border-color .15s;margin-bottom:12px;}
.qci:focus{border-color:#4F46E5;background:#fff;}
select.qci{cursor:pointer;}
textarea.qci{resize:vertical;min-height:75px;}
.qcl{font-size:.75rem;font-weight:700;margin-bottom:5px;display:block;color:#374151;}
.qcb{width:100%;padding:12px;background:#4F46E5;color:#fff;border:none;border-radius:11px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .15s;}
.qcb.g{background:#0ca678;}
.qcb.o{background:#fff;color:#4F46E5;border:1.5px solid #C7D2FE;width:auto;padding:7px 13px;font-size:.75rem;border-radius:8px;}
.qcb.danger{background:#fff5f5;color:#e03131;border:1.5px solid #ffc9c9;width:auto;padding:7px 13px;font-size:.75rem;border-radius:8px;}
.ttabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;}
.ttab{padding:7px 13px;border-radius:20px;font-size:.72rem;font-weight:700;cursor:pointer;border:1.5px solid #E5E7EB;background:#fff;color:#6B7280;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s;}
.ttab.on{background:#4F46E5;color:#fff;border-color:#4F46E5;}
.mtabs{display:grid;grid-template-columns:1fr 1fr;background:#F3F4F6;border-radius:11px;padding:3px;margin-bottom:14px;border:1px solid #E5E7EB;}
.mtab{padding:9px;border-radius:9px;text-align:center;font-size:.78rem;font-weight:700;cursor:pointer;border:none;background:transparent;font-family:'Plus Jakarta Sans',sans-serif;color:#6B7280;transition:all .15s;}
.mtab.on{background:#fff;color:#4F46E5;box-shadow:0 2px 8px rgba(0,0,0,.08);}
.orow{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
.orad{width:18px;height:18px;accent-color:#0ca678;cursor:pointer;flex-shrink:0;}
.oi{flex:1;padding:9px 12px;background:#fff;border:1.5px solid #E5E7EB;border-radius:9px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.84rem;font-weight:500;outline:none;transition:all .15s;}
.oi:focus{border-color:#4F46E5;}
.oi.coi{border-color:#0ca678;background:#e6faf5;font-weight:700;}
.odel{width:28px;height:28px;border-radius:7px;border:1.5px solid #E5E7EB;background:#F3F4F6;color:#9CA3AF;font-size:.8rem;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.tfbtns{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;}
.tfcb{padding:14px;border-radius:11px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.9rem;font-weight:800;cursor:pointer;border:2px solid #E5E7EB;background:#fff;transition:all .15s;}
.tfcb.t{background:#e6faf5;border-color:#0ca678;color:#0ca678;}
.tfcb.f{background:#fff5f5;border-color:#e03131;color:#e03131;}
.mprow{display:grid;grid-template-columns:1fr auto 1fr auto;gap:6px;align-items:center;margin-bottom:8px;}
.mi{padding:9px 10px;background:#fff;border:1.5px solid #E5E7EB;border-radius:9px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.82rem;font-weight:500;outline:none;width:100%;transition:border-color .15s;}
.mi:focus{border-color:#4F46E5;}
.paste{width:100%;min-height:140px;padding:12px;background:#F9FAFB;border:2px dashed #E5E7EB;border-radius:12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.78rem;color:#1E1B4B;outline:none;resize:vertical;line-height:1.5;margin-bottom:12px;}
.paste:focus{border-color:#4F46E5;background:#fff;}
.addedq{background:#F9FAFB;border-radius:9px;padding:9px 11px;margin-bottom:6px;display:flex;gap:8px;align-items:flex-start;border:1px solid #E5E7EB;}
.ebox{background:#fff5f5;border:1px solid #ffc9c9;border-radius:10px;padding:9px 12px;font-size:.78rem;font-weight:600;color:#e03131;margin-bottom:12px;}
.okbox{background:#e6faf5;border:1px solid #96f2d7;border-radius:10px;padding:9px 12px;font-size:.78rem;font-weight:600;color:#0ca678;margin-bottom:12px;}
@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fu .22s ease both;}
`;

function Toast({ msg }) {
  if (!msg) return null;
  return <div style={{ position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#1E1B4B",color:"#fff",padding:"10px 22px",borderRadius:30,fontSize:".82rem",fontWeight:700,boxShadow:"0 8px 24px rgba(0,0,0,.2)",zIndex:999,whiteSpace:"nowrap",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{msg}</div>;
}

// ── START SCREEN ──
function StartScreen({ quiz, questions, attempts, onStart, onClose }) {
  const [mode, setMode] = useState(null);
  const subj = SUBJECTS[quiz.subject] || { icon:"📝", color:"#4F46E5" };
  const totalMarks = questions.reduce((s,q) => s+(q.marks||1), 0);
  const myAtt = attempts.filter(a => a.quiz_id===quiz.id);
  const best = [...myAtt].sort((a,b) => b.percentage-a.percentage)[0];
  const allowed = quiz.mode || "both";
  const canStart = allowed!=="both" || mode!==null;

  return (
    <div className="qstart">
      <div style={{ background:"#fff",borderBottom:"1px solid #E5E7EB",padding:"13px 16px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50 }}>
        <button className="qback" onClick={onClose}>←</button>
        <div><div className="qtbt">{quiz.title}</div><div className="qtbs">{quiz.chapter}</div></div>
      </div>
      <div style={{ padding:"16px 16px 100px" }}>
        <div style={{ background:`linear-gradient(135deg,${subj.color},${subj.color}cc)`,borderRadius:18,padding:"24px 20px",color:"#fff",textAlign:"center",marginBottom:20 }}>
          <div style={{ fontSize:"2rem",marginBottom:10 }}>{subj.icon}</div>
          <div style={{ fontSize:"1.1rem",fontWeight:800,marginBottom:4 }}>{quiz.title}</div>
          <div style={{ fontSize:".75rem",opacity:.85 }}>{quiz.chapter}</div>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16 }}>
          {[["❓ "+questions.length,"Questions"],["⏱ "+quiz.time_minutes+" min","Time Limit"],["💯 "+totalMarks,"Total Marks"],["✅ "+quiz.pass_percentage+"%","Pass Marks"]].map(([n,l]) => (
            <div key={l} style={{ background:"#fff",borderRadius:12,padding:13,border:"1px solid #E5E7EB",textAlign:"center" }}>
              <div style={{ fontSize:"1.3rem",fontWeight:800,color:"#4F46E5" }}>{n}</div>
              <div style={{ fontSize:".62rem",color:"#9CA3AF",textTransform:"uppercase",marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>

        {allowed==="both" && (
          <div style={{ marginBottom:16 }}>
            <div className="slbl" style={{ marginBottom:10 }}>Mode Chuniye</div>
            <div className={`mcard ${mode==="practice"?"on":""}`} onClick={() => setMode("practice")}>
              <div className="mct">📖 Practice Mode</div>
              <div className="mcs">Har answer ke baad explanation • Timer relaxed • Sikhne ke liye</div>
            </div>
            <div className={`mcard ${mode==="test"?"on":""}`} onClick={() => setMode("test")}>
              <div className="mct">⏱️ Test Mode</div>
              <div className="mcs">Timer ON • Real exam jaise • Score save hoga</div>
            </div>
          </div>
        )}

        {allowed!=="both" && (
          <div style={{ background:"#EEF2FF",borderRadius:12,padding:"12px 14px",marginBottom:16,fontSize:".78rem",color:"#4F46E5",fontWeight:700 }}>
            {allowed==="practice" ? "📖 Practice Only Mode" : "⏱️ Test Only Mode"}
          </div>
        )}

        {best && (
          <div style={{ background:"#e6faf5",border:"1px solid #96f2d7",borderRadius:12,padding:13,marginBottom:16 }}>
            <div style={{ fontSize:".72rem",fontWeight:800,color:"#0ca678",textTransform:"uppercase",letterSpacing:1,marginBottom:6 }}>Best Attempt</div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div style={{ fontSize:"1rem",fontWeight:800,color:"#0ca678" }}>{best.percentage}% • {myAtt.length} attempt{myAtt.length>1?"s":""}</div>
              <span className={`badge ${best.passed?"dg":"dr"}`}>{best.passed?"Passed":"Failed"}</span>
            </div>
          </div>
        )}

        <button
          style={{ width:"100%",padding:16,background:canStart?subj.color:"#9CA3AF",color:"#fff",border:"none",borderRadius:14,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:"1rem",fontWeight:800,cursor:canStart?"pointer":"not-allowed",letterSpacing:".5px" }}
          disabled={!canStart}
          onClick={() => onStart(allowed!=="both" ? allowed : mode)}
        >🚀 Quiz Start Karo!</button>
      </div>
    </div>
  );
}

// ── QUIZ PLAYER ──
function QuizPlayer({ quiz, questions, profile, mode, onClose, onFinish }) {
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState({});
  const [skipped, setSkipped] = useState({});
  const [revealed, setRevealed] = useState({});
  const [timeLeft, setTimeLeft] = useState((quiz.time_minutes||15)*60);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [matchSelL, setMatchSelL] = useState(undefined);
  const [matchShuf, setMatchShuf] = useState({});
  const timerRef = useRef(null);

  useEffect(() => {
    const s = {};
    questions.forEach((q,i) => { if(q.type==="match"&&q.pairs?.length) s[i]=shuffle(q.pairs.map((_,j)=>j)); });
    setMatchShuf(s);
  }, [questions]);

  useEffect(() => {
    if (mode==="test"&&!submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => { if(t<=1){clearInterval(timerRef.current);handleSubmit(true);return 0;} return t-1; });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [mode, submitted]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const tc = timeLeft<60?"d":timeLeft<180?"w":"";
  const q = questions[cur];

  const answer = (val) => {
    if (revealed[cur]) return;
    setAnswers(a => ({...a,[cur]:val}));
    setSkipped(s => { const n={...s}; delete n[cur]; return n; });
    if (mode==="practice") setRevealed(r => ({...r,[cur]:true}));
  };

  const matchTap = (side, idx) => {
    if (revealed[cur]) return;
    const ma = answers[cur]||{};
    if (side==="left") { setMatchSelL(p => p===idx?undefined:idx); }
    else {
      if (matchSelL===undefined) return;
      const nm = {...ma,[matchSelL]:idx};
      setAnswers(a => ({...a,[cur]:nm}));
      setSkipped(s => { const n={...s}; delete n[cur]; return n; });
      setMatchSelL(undefined);
      if (mode==="practice"&&Object.keys(nm).length===(q.pairs||[]).length)
        setRevealed(r => ({...r,[cur]:true}));
    }
  };

  const handleSubmit = async (auto=false) => {
    clearInterval(timerRef.current);
    let cor=0,wro=0,sk=0,tot=0,obt=0;
    questions.forEach((q,i) => {
      const a=answers[i]; const m=q.marks||1; tot+=m;
      if(skipped[i]||a===undefined){sk++;return;}
      let ok=false;
      if(q.type==="mcq") ok=a===q.correct_answer;
      else if(q.type==="tf") ok=String(a)===String(q.correct_answer);
      else if(q.type==="fib") ok=String(a).trim().toLowerCase()===String(q.correct_answer).trim().toLowerCase();
      else if(q.type==="match") ok=(q.pairs||[]).every((_,pi)=>a[pi]===pi);
      if(ok){cor++;obt+=m;}else wro++;
    });
    const pct=tot>0?Math.round((obt/tot)*100):0;
    const passed=pct>=(quiz.pass_percentage||60);
    const grade=pct>=90?"A+":pct>=80?"A":pct>=70?"B+":pct>=60?"B":pct>=40?"C":"D";
    const res={cor,wro,sk,tot:questions.length,pct,passed,grade,obt,totalMarks:tot,timeTaken:(quiz.time_minutes*60)-timeLeft};
    setResults(res); setSubmitted(true);
    if(mode==="test") await supabase.from("quiz_attempts").insert({ quiz_id:quiz.id,student_id:profile?.id,score:obt,total_marks:tot,percentage:pct,passed,answers:JSON.stringify(answers),time_taken:res.timeTaken }).catch(()=>{});
  };

  // RESULT
  if (submitted&&results) {
    const msg=results.pct>=90?"🎉 Excellent!":results.pct>=80?"👏 Great Job!":results.pct>=60?"✅ Passed!":"💪 Dobara koshish karo!";
    return (
      <div className="qresult">
        <div className="rhero">
          <div className="rgrade">{results.grade}</div>
          <div className="rpct">{results.pct}%</div>
          <div className="rmsg">{msg}</div>
        </div>
        <div className="rstats">
          {[["✅ "+results.cor,"Correct"],["❌ "+results.wro,"Wrong"],["⏭️ "+results.sk,"Skipped"]].map(([n,l])=>(
            <div className="rstat" key={l}><span className="rsn">{n}</span><span className="rsl">{l}</span></div>
          ))}
        </div>
        <div style={{ padding:"0 14px 14px" }}>
          <div style={{ background:results.passed?"#e6faf5":"#fff5f5",borderRadius:12,padding:"12px 16px",textAlign:"center",marginBottom:14,border:`1px solid ${results.passed?"#96f2d7":"#ffc9c9"}` }}>
            <span style={{ fontSize:"1.1rem",fontWeight:800,color:results.passed?"#0ca678":"#e03131" }}>
              {results.passed?"🎉 Passed!":"❌ Failed"} — {results.obt}/{results.totalMarks} Marks
            </span>
          </div>
          <div className="slbl" style={{ marginBottom:10 }}>Answer Review</div>
          {questions.map((q,i) => {
            const a=answers[i],isSkip=skipped[i]||a===undefined;
            let ok=false;
            if(!isSkip){
              if(q.type==="mcq") ok=a===q.correct_answer;
              else if(q.type==="tf") ok=String(a)===String(q.correct_answer);
              else if(q.type==="fib") ok=String(a).trim().toLowerCase()===String(q.correct_answer).trim().toLowerCase();
              else if(q.type==="match") ok=(q.pairs||[]).every((_,pi)=>a[pi]===pi);
            }
            return (
              <div className={`revq ${isSkip?"rs":ok?"rc":"rw"}`} key={i}>
                <div style={{ fontSize:".72rem",color:"#9CA3AF",marginBottom:4 }}>Q{i+1} • {q.type?.toUpperCase()}</div>
                <div style={{ fontSize:".85rem",fontWeight:700,marginBottom:6 }}>{q.question}</div>
                {isSkip?<span style={{ color:"#f08c00",fontSize:".78rem" }}>⏭️ Skipped</span>:
                  ok?<span style={{ color:"#0ca678",fontSize:".78rem" }}>✅ Correct</span>:
                    <div style={{ fontSize:".78rem",color:"#e03131" }}>❌ Wrong — Sahi: <strong>{q.type==="match"?"Pairs correct order":""+q.correct_answer}</strong></div>
                }
                {q.explanation&&<div className="expl" style={{ marginTop:8 }}>💡 {q.explanation}</div>}
              </div>
            );
          })}
          <div style={{ padding:"8px 0" }}>
            <button className="qcb" style={{ width:"100%" }} onClick={onFinish}>← Wapas Jao</button>
          </div>
        </div>
      </div>
    );
  }

  if (!q) return null;
  const ma = q.type==="match" ? (answers[cur]||{}) : {};
  const rightOrder = matchShuf[cur] || (q.pairs||[]).map((_,i)=>i);
  const prog = ((cur+1)/questions.length)*100;

  return (
    <div className="qplayer">
      <div className="qph">
        <div>
          <div style={{ fontSize:".65rem",color:"#9CA3AF",fontWeight:700,textTransform:"uppercase" }}>{quiz.title}</div>
          <div style={{ fontSize:".82rem",fontWeight:800 }}>Q {cur+1}/{questions.length}</div>
        </div>
        {mode==="test"?<div className={`qtimer ${tc}`}>{fmt(timeLeft)}</div>:<span className="badge db">📖 Practice</span>}
        <button onClick={()=>{if(confirm("Quiz chhodna chahte ho?")){clearInterval(timerRef.current);onClose();}}}
          style={{ padding:"6px 12px",borderRadius:20,border:"1.5px solid #E5E7EB",background:"#fff",fontSize:".72rem",fontWeight:700,cursor:"pointer",color:"#9CA3AF" }}>Exit</button>
      </div>
      <div className="qprog"><div className="qprogf" style={{ width:prog+"%" }}/></div>
      <div className="qdots">
        {questions.map((_,i)=>(
          <div key={i} onClick={()=>setCur(i)} className={`qdot ${i===cur?"cu":skipped[i]?"sk":answers[i]!==undefined?"an":"un"}`}>{i+1}</div>
        ))}
      </div>
      <div className="qbody">
        <div className="qnum">Question {cur+1} of {questions.length} • {q.marks||1} Mark{(q.marks||1)>1?"s":""}</div>
        <div style={{ display:"inline-block",fontSize:".6rem",fontWeight:800,padding:"2px 10px",borderRadius:20,marginBottom:10,
          background:q.type==="mcq"?"#EEF2FF":q.type==="tf"?"#e6faf5":q.type==="match"?"#EDE9FE":"#fff4e6",
          color:q.type==="mcq"?"#4F46E5":q.type==="tf"?"#0ca678":q.type==="match"?"#7C3AED":"#e8590c"
        }}>
          {q.type==="mcq"?"Multiple Choice":q.type==="tf"?"True / False":q.type==="match"?"Match the Following":"Fill in Blank"}
        </div>
        <div className="qtext">{q.question}</div>

        {/* MCQ */}
        {q.type==="mcq"&&(q.options||[]).map((opt,oi)=>{
          let cls="";
          if(revealed[cur]){if(oi===q.correct_answer)cls="co";else if(answers[cur]===oi)cls="wr";}
          else if(answers[cur]===oi)cls="sl";
          return(
            <div key={oi} className={`mopt ${cls}`} onClick={()=>answer(oi)}>
              <div className="ol">{["A","B","C","D","E"][oi]}</div>
              <div className="ot">{opt}</div>
            </div>
          );
        })}

        {/* T/F */}
        {q.type==="tf"&&[true,false].map(val=>{
          let cls="";
          if(revealed[cur]){if(String(val)===String(q.correct_answer))cls="co";else if(answers[cur]===val)cls="wr";}
          else if(answers[cur]===val)cls="sl";
          return(
            <div key={String(val)} className={`tfopt ${cls}`} onClick={()=>answer(val)}>
              <div className="tfi">{val?"✅":"❌"}</div>
              <div className="tfl">{val?"True":"False"}</div>
            </div>
          );
        })}

        {/* FIB */}
        {q.type==="fib"&&(
          <>
            <input className={`fibi ${revealed[cur]?(String(answers[cur]||"").trim().toLowerCase()===String(q.correct_answer||"").trim().toLowerCase()?"co":"wr"):""}`}
              placeholder="Apna jawab yahan likho..."
              value={answers[cur]||""}
              onChange={e=>!revealed[cur]&&answer(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&mode==="practice"&&answers[cur])setRevealed(r=>({...r,[cur]:true}));}}
            />
            {mode==="practice"&&!revealed[cur]&&answers[cur]&&(
              <button className="qcb o" style={{ width:"100%",textAlign:"center",display:"block",marginBottom:14 }} onClick={()=>setRevealed(r=>({...r,[cur]:true}))}>Check Answer</button>
            )}
            {revealed[cur]&&<div className="expl">✅ Correct: <strong>{q.correct_answer}</strong></div>}
          </>
        )}

        {/* MATCH */}
        {q.type==="match"&&(()=>{
          const pairs=q.pairs||[];
          const locked=!!revealed[cur];
          return(
            <>
              <div className="mgrid">
                <div>
                  <div className="mcol-lbl">Column A</div>
                  {pairs.map((p,pi)=>{
                    const cr=ma[pi],ic=cr!==undefined,correct=ic&&cr===pi;
                    let cls=locked||ic?(locked?(correct?"co":"wr"):"conn"):matchSelL===pi?"sl":"";
                    return<div key={pi} className={`mci ${cls}`} onClick={()=>!locked&&!ic&&setMatchSelL(prev=>prev===pi?undefined:pi)}>
                      {p.l}{ic&&locked?(correct?" ✅":" ❌"):""}
                    </div>;
                  })}
                </div>
                <div>
                  <div className="mcol-lbl">Column B</div>
                  {rightOrder.map(oi=>{
                    const p=pairs[oi];
                    const cl=Object.keys(ma).find(k=>ma[k]===oi);
                    const ic=cl!==undefined,correct=ic&&parseInt(cl)===oi;
                    let cls=locked||ic?(locked?(correct?"co":"wr"):"conn"):"";
                    return<div key={oi} className={`mci ${cls}`} onClick={()=>!locked&&!ic&&matchTap("right",oi)}>
                      {p.r}
                    </div>;
                  })}
                </div>
              </div>
              <div className="mhint">
                {locked?`${Object.keys(ma).length}/${pairs.length} sahi`:matchSelL!==undefined?"Ab Column B se milao ✨":"Pehle Column A se chuniye"}
              </div>
            </>
          );
        })()}

        {revealed[cur]&&q.explanation&&q.type!=="fib"&&<div className="expl" style={{ marginTop:12 }}>💡 {q.explanation}</div>}
      </div>

      <div className="qfoot">
        <button className="qnb bp" onClick={()=>cur>0&&setCur(c=>c-1)} disabled={cur===0}>← Prev</button>
        {mode==="test"&&<button className="bsk" onClick={()=>{setSkipped(s=>({...s,[cur]:true}));if(cur<questions.length-1)setCur(c=>c+1);}}>Skip ⏭</button>}
        {cur<questions.length-1
          ?<button className="qnb bn" onClick={()=>setCur(c=>c+1)}>Next →</button>
          :<button className="qnb bs" onClick={()=>{if(confirm("Submit karna chahte ho?"))handleSubmit();}}>Submit ✓</button>
        }
      </div>
    </div>
  );
}

// ── QUIZ CREATOR ──
function QuizCreator({ profile, onClose, onPublished }) {
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState({ title:"",subject:"math",chapter:"",customChapter:"",timeMinutes:15,passPercentage:60,difficulty:"medium",status:"active",mode:"both" });
  const [questions, setQuestions] = useState([]);
  const [iMode, setIMode] = useState("paste");
  const [paste, setPaste] = useState("");
  const [preview, setPreview] = useState(null);
  const [selPaste, setSelPaste] = useState([]);
  const [qType, setQType] = useState("mcq");
  const [mQ, setMQ] = useState({ q:"",opts:["","","",""],cor:0,tf:true,fib:"",pairs:[{l:"",r:""},{l:"",r:""}],exp:"",marks:1 });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const showToast = m => { setToast(m); setTimeout(()=>setToast(""),2000); };

  const parsePaste = () => {
    try {
      const c=paste.trim().replace(/^var\s+\w+\s*=\s*/,"").replace(/;$/,"");
      const p=eval("("+c+")");
      if(!Array.isArray(p)) throw new Error();
      setPreview(p); setSelPaste(p.map((_,i)=>i)); setOk(`${p.length} questions parse ho gaye!`); setErr("");
    } catch { setErr("Parse error! Format check karo."); setOk(""); }
  };

  const importSel = () => {
    const imp=selPaste.map(i=>{
      const q=preview[i];
      return { type:q.type||"mcq",question:q.q||q.question,options:q.opts||q.options||[],correct_answer:q.ans!==undefined?q.ans:q.correct_answer,explanation:q.exp||q.explanation||"",marks:q.marks||1,pairs:(q.pairs||[]).map(p=>({l:p.l||"",r:p.r||""})) };
    });
    setQuestions(p=>[...p,...imp]); setPreview(null); setPaste(""); setOk(""); setSelPaste([]);
    showToast(`${imp.length} questions added!`);
  };

  const addManual = () => {
    if(!mQ.q.trim()){setErr("Question likho!");return;}
    let nq={type:qType,question:mQ.q,explanation:mQ.exp,marks:mQ.marks};
    if(qType==="mcq"){const o=mQ.opts.filter(x=>x.trim());if(o.length<2){setErr("2+ options chahiye!");return;}nq={...nq,options:o,correct_answer:mQ.cor};}
    else if(qType==="tf") nq={...nq,correct_answer:mQ.tf};
    else if(qType==="fib"){if(!mQ.fib.trim()){setErr("Answer likho!");return;}nq={...nq,correct_answer:mQ.fib};}
    else if(qType==="match"){const p=mQ.pairs.filter(x=>x.l.trim()&&x.r.trim());if(p.length<2){setErr("2+ pairs chahiye!");return;}nq={...nq,pairs:p};}
    setQuestions(p=>[...p,nq]);
    setMQ({q:"",opts:["","","",""],cor:0,tf:true,fib:"",pairs:[{l:"",r:""},{l:"",r:""}],exp:"",marks:1});
    setErr(""); showToast("Question added!");
  };

  const publish = async () => {
    if(!questions.length){setErr("Ek question zaroor add karo!");return;}
    setSaving(true);
    const ch=info.customChapter.trim()||info.chapter||CHAPTERS[info.subject]?.[0]||"";
    const {data:quiz,error}=await supabase.from("quizzes").insert({ title:info.title,subject:info.subject,chapter:ch,time_minutes:info.timeMinutes,pass_percentage:info.passPercentage,difficulty:info.difficulty,status:info.status,mode:info.mode,created_by:profile?.id,total_questions:questions.length }).select().single();
    if(error){setErr(error.message);setSaving(false);return;}
    await supabase.from("quiz_questions").insert(questions.map((q,i)=>({ quiz_id:quiz.id,type:q.type,question:q.question,options:JSON.stringify(q.options||[]),correct_answer:String(q.correct_answer||""),explanation:q.explanation||"",marks:q.marks||1,pairs:JSON.stringify(q.pairs||[]),order_index:i })));
    setSaving(false); showToast("Quiz published! 🎉");
    setTimeout(()=>onPublished(),1000);
  };

  return (
    <div style={{ position:"fixed",inset:0,background:"#F0F2F8",zIndex:200,overflowY:"auto",maxWidth:480,margin:"0 auto",fontFamily:"'Plus Jakarta Sans',sans-serif",paddingBottom:30 }}>
      <Toast msg={toast}/>
      <div style={{ background:"#fff",borderBottom:"1px solid #E5E7EB",padding:"13px 16px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:100 }}>
        <button className="qback" onClick={onClose}>←</button>
        <div><div className="qtbt">Quiz Creator</div><div className="qtbs">Step {step} of 2</div></div>
        <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:6 }}>
          {[1,2].map(s=>[
            <div key={s} style={{ width:22,height:22,borderRadius:"50%",background:step>=s?"#4F46E5":"#E5E7EB",color:step>=s?"#fff":"#9CA3AF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".7rem",fontWeight:800 }}>{s}</div>,
            s===1&&<div key="line" style={{ width:20,height:2,background:step>=2?"#4F46E5":"#E5E7EB",borderRadius:2 }}/>
          ])}
        </div>
      </div>

      <div style={{ padding:14 }}>
        {step===1&&(
          <div className="qccard fu">
            {err&&<div className="ebox">{err}</div>}
            <label className="qcl">Quiz Title *</label>
            <input className="qci" placeholder="Jaise: Real Numbers Quiz" value={info.title} onChange={e=>setInfo({...info,title:e.target.value})}/>
            <label className="qcl">Subject *</label>
            <select className="qci" value={info.subject} onChange={e=>setInfo({...info,subject:e.target.value,chapter:""})}>
              {Object.entries(SUBJECTS).map(([k,v])=><option key={k} value={k}>{v.icon} {v.name}</option>)}
            </select>
            <label className="qcl">Chapter *</label>
            <select className="qci" value={info.chapter} onChange={e=>setInfo({...info,chapter:e.target.value})}>
              <option value="">Chapter select karo</option>
              {(CHAPTERS[info.subject]||[]).map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <label className="qcl">Ya custom chapter name</label>
            <input className="qci" placeholder="Custom chapter (optional)" value={info.customChapter} onChange={e=>setInfo({...info,customChapter:e.target.value})}/>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              <div><label className="qcl">Time (min)</label><input className="qci" type="number" value={info.timeMinutes} min="1" onChange={e=>setInfo({...info,timeMinutes:+e.target.value})}/></div>
              <div><label className="qcl">Pass (%)</label><input className="qci" type="number" value={info.passPercentage} min="1" max="100" onChange={e=>setInfo({...info,passPercentage:+e.target.value})}/></div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              <div><label className="qcl">Difficulty</label>
                <select className="qci" value={info.difficulty} onChange={e=>setInfo({...info,difficulty:e.target.value})}>
                  <option value="easy">Easy 🟢</option><option value="medium">Medium 🟡</option><option value="hard">Hard 🔴</option>
                </select>
              </div>
              <div><label className="qcl">Status</label>
                <select className="qci" value={info.status} onChange={e=>setInfo({...info,status:e.target.value})}>
                  <option value="active">✅ Active</option><option value="draft">📝 Draft</option>
                </select>
              </div>
            </div>
            <label className="qcl">Quiz Mode</label>
            <select className="qci" value={info.mode} onChange={e=>setInfo({...info,mode:e.target.value})}>
              <option value="both">🔀 Both (Practice + Test)</option>
              <option value="practice">📖 Practice Only</option>
              <option value="test">⏱️ Test Only</option>
            </select>
            <button className="qcb" onClick={()=>{if(!info.title.trim()){setErr("Title bharo!");return;}setErr("");setStep(2);}}>Next: Add Questions →</button>
          </div>
        )}

        {step===2&&(
          <>
            <div className="qccard fu" style={{ padding:"10px 14px",display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ fontSize:"1.1rem" }}>{SUBJECTS[info.subject]?.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:".82rem",fontWeight:800 }}>{info.title}</div>
                <div style={{ fontSize:".62rem",color:"#9CA3AF" }}>{info.customChapter||info.chapter} • {info.timeMinutes} min • <span className={`badge ${DIFF_CLS[info.difficulty]}`}>{DIFF_LABEL[info.difficulty]}</span></div>
              </div>
              <button className="qcb o" onClick={()=>setStep(1)}>✏️ Edit</button>
            </div>

            <div className="qccard fu" style={{ padding:"12px 14px" }}>
              <div className="mtabs">
                <button className={`mtab ${iMode==="paste"?"on":""}`} onClick={()=>setIMode("paste")}>📋 Paste Mode</button>
                <button className={`mtab ${iMode==="manual"?"on":""}`} onClick={()=>setIMode("manual")}>✏️ Manual Mode</button>
              </div>
            </div>

            {iMode==="paste"&&(
              <div className="qccard fu">
                <div className="slbl">Format Guide</div>
                <div style={{ background:"#EEF2FF",borderRadius:10,padding:"10px 12px",marginBottom:10,fontSize:".72rem",color:"#4F46E5",fontWeight:600,lineHeight:1.7 }}>
                  MCQ: <code style={{ background:"rgba(255,255,255,.7)",padding:"1px 5px",borderRadius:4 }}>{'{q:"?", opts:["A","B","C","D"], ans:0}'}</code><br/>
                  T/F: <code style={{ background:"rgba(255,255,255,.7)",padding:"1px 5px",borderRadius:4 }}>{'{q:"?", type:"tf", ans:true}'}</code><br/>
                  Fill: <code style={{ background:"rgba(255,255,255,.7)",padding:"1px 5px",borderRadius:4 }}>{'{q:"_?", type:"fib", ans:"Delhi"}'}</code><br/>
                  Match: <code style={{ background:"rgba(255,255,255,.7)",padding:"1px 5px",borderRadius:4 }}>{'{q:"Match:", type:"match", pairs:[{l:"A",r:"1"}]}'}</code>
                </div>
                <textarea className="paste" placeholder="Yahan paste karo..." value={paste} onChange={e=>setPaste(e.target.value)}/>
                {err&&<div className="ebox">{err}</div>}
                {ok&&<div className="okbox">{ok}</div>}
                <button className="qcb o" style={{ width:"100%",textAlign:"center",display:"block" }} onClick={parsePaste}>🔍 Parse & Preview</button>
                {preview&&(
                  <div style={{ marginTop:12 }}>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
                      <div className="slbl" style={{ margin:0 }}>{preview.length} questions</div>
                      <div style={{ display:"flex",gap:5 }}>
                        <button className="qcb o" onClick={()=>setSelPaste(preview.map((_,i)=>i))}>All</button>
                        <button className="qcb o" onClick={()=>setSelPaste([])}>None</button>
                      </div>
                    </div>
                    {preview.map((q,i)=>(
                      <div key={i} onClick={()=>setSelPaste(s=>s.includes(i)?s.filter(x=>x!==i):[...s,i])}
                        style={{ background:selPaste.includes(i)?"#EEF2FF":"#F9FAFB",border:`1px solid ${selPaste.includes(i)?"#C7D2FE":"#E5E7EB"}`,borderRadius:10,padding:11,marginBottom:8,cursor:"pointer" }}>
                        <div style={{ fontSize:".78rem",fontWeight:700 }}>{i+1}. {q.q||q.question}</div>
                        <div style={{ fontSize:".62rem",color:"#9CA3AF",marginTop:3 }}>{(q.type||"mcq").toUpperCase()}</div>
                      </div>
                    ))}
                    <button className="qcb g" onClick={importSel} style={{ marginTop:6 }}>✅ Import ({selPaste.length})</button>
                  </div>
                )}
              </div>
            )}

            {iMode==="manual"&&(
              <div className="qccard fu">
                {err&&<div className="ebox">{err}</div>}
                <label className="qcl">Question Type</label>
                <div className="ttabs">
                  {[["mcq","MCQ"],["tf","True/False"],["fib","Fill in Blank"],["match","Match Following"]].map(([t,l])=>(
                    <button key={t} className={`ttab ${qType===t?"on":""}`} onClick={()=>setQType(t)}>{l}</button>
                  ))}
                </div>
                <label className="qcl">Question *</label>
                <textarea className="qci" placeholder="Question yahan..." value={mQ.q} onChange={e=>setMQ({...mQ,q:e.target.value})} style={{ height:75 }}/>

                {qType==="mcq"&&(
                  <>
                    <label className="qcl">Options <span style={{ color:"#9CA3AF",fontWeight:500 }}>(✓ = correct)</span></label>
                    {mQ.opts.map((opt,oi)=>(
                      <div className="orow" key={oi}>
                        <input type="radio" className="orad" checked={mQ.cor===oi} onChange={()=>setMQ({...mQ,cor:oi})}/>
                        <input className={`oi ${mQ.cor===oi?"coi":""}`} placeholder={`Option ${["A","B","C","D"][oi]}`} value={opt}
                          onChange={e=>{const o=[...mQ.opts];o[oi]=e.target.value;setMQ({...mQ,opts:o});}}/>
                        {mQ.opts.length>2&&<button className="odel" onClick={()=>{const o=mQ.opts.filter((_,i)=>i!==oi);setMQ({...mQ,opts:o,cor:Math.min(mQ.cor,o.length-1)});}}>✕</button>}
                      </div>
                    ))}
                    {mQ.opts.length<6&&<button className="qcb o" style={{ marginBottom:12 }} onClick={()=>setMQ({...mQ,opts:[...mQ.opts,""]})}>+ Option</button>}
                  </>
                )}

                {qType==="tf"&&(
                  <>
                    <label className="qcl">Correct Answer</label>
                    <div className="tfbtns">
                      <button className={`tfcb ${mQ.tf===true?"t":""}`} onClick={()=>setMQ({...mQ,tf:true})}>✅ True</button>
                      <button className={`tfcb ${mQ.tf===false?"f":""}`} onClick={()=>setMQ({...mQ,tf:false})}>❌ False</button>
                    </div>
                  </>
                )}

                {qType==="fib"&&(
                  <>
                    <label className="qcl">Correct Answer *</label>
                    <input className="qci" placeholder="Sahi jawab..." value={mQ.fib} onChange={e=>setMQ({...mQ,fib:e.target.value})}/>
                  </>
                )}

                {qType==="match"&&(
                  <>
                    <label className="qcl">Pairs <span style={{ color:"#9CA3AF",fontWeight:500 }}>(A → B)</span></label>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6 }}>
                      <div style={{ fontSize:".62rem",fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",textAlign:"center" }}>Column A</div>
                      <div style={{ fontSize:".62rem",fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",textAlign:"center" }}>Column B</div>
                    </div>
                    {mQ.pairs.map((pair,pi)=>(
                      <div className="mprow" key={pi}>
                        <input className="mi" placeholder={`A${pi+1}`} value={pair.l} onChange={e=>{const p=[...mQ.pairs];p[pi]={...p[pi],l:e.target.value};setMQ({...mQ,pairs:p});}}/>
                        <span style={{ fontSize:".8rem",color:"#9CA3AF" }}>→</span>
                        <input className="mi" placeholder={`B${pi+1}`} value={pair.r} onChange={e=>{const p=[...mQ.pairs];p[pi]={...p[pi],r:e.target.value};setMQ({...mQ,pairs:p});}}/>
                        {mQ.pairs.length>2&&<button className="odel" onClick={()=>setMQ({...mQ,pairs:mQ.pairs.filter((_,i)=>i!==pi)})}>✕</button>}
                      </div>
                    ))}
                    {mQ.pairs.length<8&&<button className="qcb o" style={{ marginBottom:12 }} onClick={()=>setMQ({...mQ,pairs:[...mQ.pairs,{l:"",r:""}]})}>+ Pair Add Karo</button>}
                  </>
                )}

                <label className="qcl">Explanation <span style={{ color:"#9CA3AF",fontWeight:500 }}>(optional)</span></label>
                <textarea className="qci" placeholder="Answer ki explanation..." value={mQ.exp} onChange={e=>setMQ({...mQ,exp:e.target.value})} style={{ height:65 }}/>
                <label className="qcl">Marks</label>
                <input className="qci" type="number" value={mQ.marks} min="1" max="10" onChange={e=>setMQ({...mQ,marks:+e.target.value})}/>
                <button className="qcb g" onClick={addManual}>✅ Question Add Karo</button>
              </div>
            )}

            {questions.length>0&&(
              <div className="qccard fu">
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
                  <div className="slbl" style={{ margin:0 }}>{questions.length} questions added</div>
                  <button className="qcb danger" onClick={()=>{if(confirm("Sab delete karein?"))setQuestions([]);}}>Clear All</button>
                </div>
                {questions.map((q,i)=>(
                  <div key={i} className="addedq">
                    <div style={{ width:22,height:22,borderRadius:6,background:"#4F46E5",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".65rem",fontWeight:800,flexShrink:0 }}>{i+1}</div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:".82rem",fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{q.question}</div>
                      <div style={{ fontSize:".62rem",color:"#9CA3AF" }}>{q.type?.toUpperCase()} • {q.marks} mark</div>
                    </div>
                    <button className="odel" onClick={()=>setQuestions(qs=>qs.filter((_,j)=>j!==i))}>✕</button>
                  </div>
                ))}
                {err&&<div className="ebox">{err}</div>}
                <button className="qcb g" onClick={publish} disabled={saving} style={{ marginTop:4 }}>
                  {saving?"Publishing...":"🚀 Quiz Publish Karo"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── MAIN ──
export default function QuizModule({ role, profile }) {
  const [view, setView] = useState("home");
  const [selSubj, setSelSubj] = useState(null);
  const [selCh, setSelCh] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [sCounts, setSCounts] = useState({});
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeQs, setActiveQs] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState({ total:0,avg:0,passed:0 });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [qMode, setQMode] = useState(null);
  const [toast, setToast] = useState("");
  const showToast = m => { setToast(m); setTimeout(()=>setToast(""),2000); };

  useEffect(()=>{ fetchHome(); },[]);

  const fetchHome = async () => {
    const [qr,ar]=await Promise.all([
      supabase.from("quizzes").select("id,subject,status").eq("status","active"),
      supabase.from("quiz_attempts").select("*").eq("student_id",profile?.id),
    ]);
    const c={};(qr.data||[]).forEach(q=>{c[q.subject]=(c[q.subject]||0)+1;});
    setSCounts(c);
    const att=ar.data||[];setAttempts(att);
    if(att.length>0){const avg=Math.round(att.reduce((s,a)=>s+a.percentage,0)/att.length);setStats({total:att.length,avg,passed:att.filter(a=>a.passed).length});}
  };

  const openChapter = async ch => {
    setSelCh(ch);setLoading(true);
    const {data}=await supabase.from("quizzes").select("*").eq("subject",selSubj).eq("chapter",ch).eq("status","active");
    setQuizzes(data||[]);setLoading(false);setView("list");
  };

  const openQuiz = async quiz => {
    const {data}=await supabase.from("quiz_questions").select("*").eq("quiz_id",quiz.id).order("order_index");
    const qs=(data||[]).map(q=>({
      ...q,
      options:typeof q.options==="string"?JSON.parse(q.options):q.options||[],
      pairs:typeof q.pairs==="string"?JSON.parse(q.pairs):q.pairs||[],
      correct_answer:q.type==="tf"?q.correct_answer==="true":q.type==="mcq"?parseInt(q.correct_answer):q.correct_answer,
    }));
    setActiveQuiz(quiz);setActiveQs(qs);setView("start");
  };

  const attIds=new Set(attempts.map(a=>a.quiz_id));
  const filtQuizzes=filter==="all"?quizzes:quizzes.filter(q=>q.difficulty===filter);
  const chapters=selSubj?(CHAPTERS[selSubj]||[]):[];

  if(view==="creator") return(<><style>{QS}</style><div className="qz"><QuizCreator profile={profile} onClose={()=>setView("home")} onPublished={()=>{setView("home");fetchHome();showToast("Quiz published! 🎉");}}/></div></>);
  if(view==="start"&&activeQuiz) return(<><style>{QS}</style><div className="qz"><StartScreen quiz={activeQuiz} questions={activeQs} attempts={attempts} onClose={()=>setView("list")} onStart={m=>{setQMode(m);setView("player");}}/></div></>);
  if(view==="player"&&activeQuiz) return(<><style>{QS}</style><div className="qz"><QuizPlayer quiz={activeQuiz} questions={activeQs} profile={profile} mode={qMode} onClose={()=>setView("start")} onFinish={()=>{setView("list");fetchHome();}}/></div></>);

  return (
    <><style>{QS}</style>
    <Toast msg={toast}/>
    <div className="qz"><div className="qwrap">

      {(view==="subj"||view==="list")&&(
        <div className="qtb">
          <button className="qback" onClick={()=>setView(view==="subj"?"home":"subj")}>←</button>
          <div style={{ flex:1,minWidth:0 }}>
            <div className="qtbt">{view==="subj"?`${SUBJECTS[selSubj]?.icon} ${SUBJECTS[selSubj]?.name}`:selCh}</div>
            <div className="qtbs">{view==="subj"?"Chapter select karo":`${quizzes.length} quizzes`}</div>
          </div>
        </div>
      )}

      {view==="subj"&&chapters.map(ch=>(
        <div className="qcard" key={ch} onClick={()=>openChapter(ch)}>
          <div style={{ fontWeight:700,fontSize:".88rem" }}>{ch}</div>
          <div style={{ fontSize:".65rem",color:"#9CA3AF",marginTop:3 }}>Tap to view quizzes →</div>
        </div>
      ))}

      {view==="list"&&(
        <>
          <div className="qfils">
            {["all","easy","medium","hard"].map(d=>(
              <button key={d} className={`qft ${filter===d?"on":""}`} onClick={()=>setFilter(d)}>
                {d==="all"?"All":DIFF_LABEL[d]}
              </button>
            ))}
          </div>
          {loading?<div style={{ textAlign:"center",padding:40,color:"#9CA3AF" }}>Loading...</div>:
            filtQuizzes.length===0?<div style={{ textAlign:"center",padding:40,color:"#9CA3AF" }}>Koi quiz nahi hai abhi</div>:
            filtQuizzes.map(quiz=>{
              const att=attempts.filter(a=>a.quiz_id===quiz.id);
              const best=[...att].sort((a,b)=>b.percentage-a.percentage)[0];
              return(
                <div key={quiz.id} className={`qcard ${attIds.has(quiz.id)?"att":""}`} onClick={()=>openQuiz(quiz)}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6 }}>
                    <div style={{ fontWeight:800,fontSize:".9rem",flex:1,paddingRight:8 }}>{quiz.title}</div>
                    <span className={`badge ${DIFF_CLS[quiz.difficulty]}`}>{DIFF_LABEL[quiz.difficulty]}</span>
                  </div>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:6 }}>
                    <span className="badge dm">⏱ {quiz.time_minutes} min</span>
                    <span className="badge dm">❓ {quiz.total_questions} Qs</span>
                    <span className="badge db">{quiz.mode==="practice"?"📖 Practice":quiz.mode==="test"?"⏱️ Test":"🔀 Both"}</span>
                  </div>
                  {best
                    ?<div style={{ background:"#e6faf5",borderRadius:8,padding:"7px 10px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <div style={{ fontSize:".72rem",color:"#0ca678",fontWeight:700 }}>✅ Best: {best.percentage}% • {att.length} attempt{att.length>1?"s":""}</div>
                        <span className={`badge ${best.passed?"dg":"dr"}`}>{best.passed?"Pass":"Fail"}</span>
                      </div>
                    :<div style={{ background:"#EEF2FF",borderRadius:8,padding:"7px 10px" }}>
                        <div style={{ fontSize:".72rem",color:"#4F46E5",fontWeight:700 }}>🆕 Abhi tak attempt nahi kiya</div>
                      </div>
                  }
                </div>
              );
            })
          }
        </>
      )}

      {view==="home"&&(
        <>
          {(role==="admin"||role==="teacher")&&(
            <button className="qcb" style={{ width:"100%",marginBottom:14 }} onClick={()=>setView("creator")}>+ New Quiz Banao</button>
          )}
          <div className="qhero">
            <div style={{ fontSize:".72rem",opacity:.8,marginBottom:4 }}>Meri Quiz Progress</div>
            <div style={{ fontSize:"1.1rem",fontWeight:800,marginBottom:14 }}>{profile?.full_name||"Student"}</div>
            <div className="qhero-stats">
              <div className="qhs"><span className="qhs-n">{stats.total}</span><span className="qhs-l">Attempts</span></div>
              <div className="qhs"><span className="qhs-n">{stats.total>0?stats.avg+"%":"—"}</span><span className="qhs-l">Avg Score</span></div>
              <div className="qhs"><span className="qhs-n">{stats.passed}</span><span className="qhs-l">Passed</span></div>
            </div>
          </div>
          <div className="slbl" style={{ marginBottom:10 }}>Subject Chuniye</div>
          <div className="qsgrid">
            {Object.entries(SUBJECTS).map(([key,subj])=>(
              <button key={key} className="qscard" style={{ background:`linear-gradient(140deg,${subj.color},${subj.color}cc)` }} onClick={()=>{setSelSubj(key);setView("subj");}}>
                <span className="qsi">{subj.icon}</span>
                <span className="qsn">{subj.name}</span>
                <span className="qsc">{sCounts[key]||0} quizzes</span>
              </button>
            ))}
          </div>
        </>
      )}

    </div></div></>
  );
}
