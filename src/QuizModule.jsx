// ─── Quiz Module — MySchool App ────────────────────────────────────────────────
// Import this in App.jsx and use <QuizModule role={role} profile={profile} />

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://jugdyjvxskqglatljvtn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2R5anZ4c2txZ2xhdGxqdnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQzODYsImV4cCI6MjA5MzcxMDM4Nn0.cfFbH5lKAsbjHAgH51vbA6_1AYfBtbJefLeFgyHfHTQ"
);

// ── Constants ──
const SUBJECTS = {
  math:  { name: "Mathematics",   icon: "➕", color: "#3b5bdb" },
  sci:   { name: "Science",       icon: "🔬", color: "#0ca678" },
  eng:   { name: "English",       icon: "📖", color: "#1c7ed6" },
  hindi: { name: "Hindi",         icon: "🇮🇳", color: "#f08c00" },
  sst:   { name: "Social Sci.",   icon: "🌍", color: "#9c36b5" },
  comp:  { name: "Computer Sci.", icon: "💻", color: "#e03131" },
};

const CHAPTERS = {
  math:  ["Chapter 1 — Real Numbers","Chapter 2 — Polynomials","Chapter 3 — Pair of Linear Equations","Chapter 4 — Quadratic Equations","Chapter 5 — Arithmetic Progressions","Chapter 6 — Triangles","Chapter 7 — Coordinate Geometry","Chapter 8 — Introduction to Trigonometry","Chapter 9 — Applications of Trigonometry","Chapter 10 — Circles","Chapter 11 — Areas Related to Circles","Chapter 12 — Surface Areas and Volumes","Chapter 13 — Statistics","Chapter 14 — Probability"],
  sci:   ["Chapter 1 — Chemical Reactions","Chapter 2 — Acids Bases and Salts","Chapter 3 — Metals and Non-metals","Chapter 4 — Carbon and its Compounds","Chapter 5 — Periodic Classification","Chapter 6 — Life Processes","Chapter 7 — Control and Coordination","Chapter 8 — Reproduction","Chapter 9 — Heredity and Evolution","Chapter 10 — Light Reflection & Refraction","Chapter 11 — Human Eye","Chapter 12 — Electricity","Chapter 13 — Magnetic Effects","Chapter 14 — Sources of Energy","Chapter 15 — Environment"],
  eng:   ["Ch 1 — A Letter to God","Ch 2 — Nelson Mandela","Ch 3 — Two Stories About Flying","Ch 4 — From the Diary of Anne Frank","Ch 5 — Hundred Dresses I","Ch 6 — Hundred Dresses II","Ch 7 — Glimpses of India","Ch 8 — Mijbil the Otter","Ch 9 — Madam Rides the Bus","Ch 10 — Sermon at Benares"],
  hindi: ["Ch 1 — Surdas","Ch 2 — Tulsidas","Ch 3 — Dev","Ch 4 — Jay Shankar Prasad","Ch 5 — Suryakant Tripathi Nirala","Ch 6 — Nagarjun","Ch 7 — Manglesh Dabral"],
  sst:   ["History Ch 1 — Rise of Nationalism","History Ch 2 — Nationalism in India","History Ch 3 — Making of Global World","Geography Ch 1 — Resources","Geography Ch 2 — Forest and Wildlife","Civics Ch 1 — Power Sharing","Civics Ch 2 — Federalism","Economics Ch 1 — Development"],
  comp:  ["Ch 1 — Introduction to Computers","Ch 2 — Hardware & Software","Ch 3 — Networking","Ch 4 — Internet","Ch 5 — Programming Basics"],
};

const DIFF_LABEL = { easy: "Easy 🟢", medium: "Medium 🟡", hard: "Hard 🔴" };
const DIFF_CLS   = { easy: "badge-green", medium: "badge-yellow", hard: "badge-red" };

// ── Styles ──
const quizStyles = `
  .qz-wrap { padding: 14px; padding-bottom: 30px; font-family: 'Plus Jakarta Sans', sans-serif; }
  .qz-hero { background: linear-gradient(135deg, #9c36b5, #be4bdb); color: #fff; border-radius: 16px; padding: 18px; margin-bottom: 14px; }
  .qz-hero-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 12px; }
  .qz-hero-stat { background: rgba(255,255,255,.15); border-radius: 10px; padding: 10px 6px; text-align: center; }
  .qz-hero-stat-num { font-size: 1.3rem; font-weight: 800; display: block; }
  .qz-hero-stat-lbl { font-size: .55rem; opacity: .8; text-transform: uppercase; }
  .qz-subj-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .qz-subj-card { border-radius: 14px; padding: 16px 14px; cursor: pointer; color: #fff; transition: transform .15s, box-shadow .15s; border: none; text-align: left; }
  .qz-subj-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.15); }
  .qz-subj-icon { font-size: 1.8rem; margin-bottom: 8px; display: block; }
  .qz-subj-name { font-size: .82rem; font-weight: 800; display: block; }
  .qz-subj-count { font-size: .62rem; opacity: .8; margin-top: 2px; display: block; }
  .qz-back-btn { width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #e4e8f0; background: #fff; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .qz-topbar { background: #fff; border-bottom: 1px solid #e4e8f0; padding: 13px 16px; display: flex; align-items: center; gap: 12px; position: sticky; top: 0; z-index: 50; box-shadow: 0 2px 8px rgba(59,91,219,0.07); margin: -14px -14px 14px; }
  .qz-topbar-title { font-size: 1rem; font-weight: 800; }
  .qz-topbar-sub { font-size: .62rem; color: #868e96; }
  .qz-quiz-card { background: #fff; border-radius: 14px; border: 1px solid #e4e8f0; box-shadow: 0 2px 8px rgba(59,91,219,0.07); padding: 14px; margin-bottom: 10px; cursor: pointer; transition: all .15s; border-left: 4px solid #e4e8f0; }
  .qz-quiz-card.attempted { border-left-color: #0ca678; }
  .qz-quiz-card:hover { border-color: #c5cffa; box-shadow: 0 4px 16px rgba(59,91,219,0.12); transform: translateY(-1px); }
  .qz-filter-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; margin-bottom: 12px; scrollbar-width: none; }
  .qz-filter-tabs::-webkit-scrollbar { display: none; }
  .qz-filter-tab { flex-shrink: 0; padding: 7px 14px; border-radius: 20px; font-size: .72rem; font-weight: 700; border: 1.5px solid #e4e8f0; background: #fff; color: #868e96; cursor: pointer; transition: all .15s; font-family: 'Plus Jakarta Sans', sans-serif; }
  .qz-filter-tab.active { background: #3b5bdb; color: #fff; border-color: #3b5bdb; }
  .sec-lbl { font-size: .62rem; font-weight: 800; color: #868e96; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; margin-top: 4px; }
  .badge { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: .65rem; font-weight: 800; }
  .badge-green { background: #e6faf5; color: #0ca678; }
  .badge-red { background: #fff5f5; color: #e03131; }
  .badge-yellow { background: #fff9db; color: #f08c00; }
  .badge-blue { background: #eef1ff; color: #3b5bdb; }
  .badge-muted { background: #f0f4ff; color: #868e96; }

  /* Quiz Player */
  .qz-player { position: fixed; inset: 0; background: #f0f4ff; z-index: 200; display: flex; flex-direction: column; max-width: 480px; margin: 0 auto; font-family: 'Plus Jakarta Sans', sans-serif; }
  .qz-player-header { background: #fff; padding: 12px 16px; border-bottom: 1px solid #e4e8f0; flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; }
  .qz-timer { font-size: 1.1rem; font-weight: 800; color: #3b5bdb; font-variant-numeric: tabular-nums; }
  .qz-timer.warning { color: #f08c00; animation: timerPulse .5s infinite; }
  .qz-timer.danger { color: #e03131; animation: timerPulse .3s infinite; }
  @keyframes timerPulse { 0%,100%{opacity:1}50%{opacity:.5} }
  .qz-progress { height: 4px; background: #e4e8f0; flex-shrink: 0; }
  .qz-progress-fill { height: 100%; background: #3b5bdb; transition: width .3s; }
  .qz-dots { display: flex; gap: 5px; flex-wrap: wrap; padding: 10px 16px; background: #fff; flex-shrink: 0; border-bottom: 1px solid #e4e8f0; }
  .q-dot { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: .65rem; font-weight: 800; cursor: pointer; border: 2px solid transparent; transition: all .15s; flex-shrink: 0; }
  .q-dot.unanswered { background: #f0f4ff; color: #868e96; border-color: #e4e8f0; }
  .q-dot.answered { background: #3b5bdb; color: #fff; }
  .q-dot.current { border-color: #3b5bdb; background: #eef1ff; color: #3b5bdb; }
  .q-dot.skipped { background: #fff9db; color: #f08c00; border-color: #ffe066; }
  .qz-body { flex: 1; overflow-y: auto; padding: 18px 16px; }
  .q-num-badge { font-size: .65rem; font-weight: 800; color: #868e96; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .q-text { font-size: .98rem; font-weight: 700; line-height: 1.6; margin-bottom: 18px; color: #1a1d2e; }
  .mcq-opt { display: flex; align-items: center; gap: 12px; padding: 13px 14px; background: #fff; border-radius: 12px; border: 2px solid #e4e8f0; margin-bottom: 10px; cursor: pointer; transition: all .15s; -webkit-tap-highlight-color: transparent; }
  .mcq-opt.selected { border-color: #3b5bdb; background: #eef1ff; }
  .mcq-opt.correct { border-color: #0ca678 !important; background: #e6faf5 !important; }
  .mcq-opt.wrong { border-color: #e03131 !important; background: #fff5f5 !important; }
  .mcq-opt.reveal { border-color: #0ca678; background: #e6faf5; }
  .opt-letter { width: 30px; height: 30px; border-radius: 50%; background: #f0f4ff; display: flex; align-items: center; justify-content: center; font-size: .78rem; font-weight: 800; color: #868e96; flex-shrink: 0; transition: all .15s; }
  .mcq-opt.selected .opt-letter { background: #3b5bdb; color: #fff; }
  .mcq-opt.correct .opt-letter { background: #0ca678; color: #fff; }
  .mcq-opt.wrong .opt-letter { background: #e03131; color: #fff; }
  .mcq-opt.reveal .opt-letter { background: #0ca678; color: #fff; }
  .opt-text { font-size: .88rem; font-weight: 600; flex: 1; }
  .tf-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .tf-opt { padding: 18px 10px; border-radius: 12px; border: 2px solid #e4e8f0; text-align: center; cursor: pointer; transition: all .15s; background: #fff; }
  .tf-opt.selected { border-color: #3b5bdb; background: #eef1ff; }
  .tf-opt.correct { border-color: #0ca678; background: #e6faf5; }
  .tf-opt.wrong { border-color: #e03131; background: #fff5f5; }
  .tf-opt.reveal { border-color: #0ca678; background: #e6faf5; }
  .tf-icon { font-size: 1.8rem; margin-bottom: 6px; }
  .tf-label { font-size: .85rem; font-weight: 800; }
  .fib-inp { width: 100%; padding: 14px 16px; background: #fff; border: 2px solid #e4e8f0; border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 600; outline: none; transition: border-color .15s; margin-bottom: 14px; text-align: center; }
  .fib-inp:focus { border-color: #3b5bdb; }
  .fib-inp.correct { border-color: #0ca678; background: #e6faf5; color: #0ca678; }
  .fib-inp.wrong { border-color: #e03131; background: #fff5f5; color: #e03131; }
  .expl-box { background: #eef1ff; border: 1px solid #c5cffa; border-radius: 10px; padding: 11px 13px; margin-top: 6px; font-size: .78rem; font-weight: 600; color: #3b5bdb; line-height: 1.5; }
  .qz-footer { background: #fff; padding: 14px 16px; border-top: 1px solid #e4e8f0; flex-shrink: 0; display: flex; gap: 8px; align-items: center; }
  .qz-nav-btn { flex: 1; padding: 13px; border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: .9rem; font-weight: 700; cursor: pointer; border: none; transition: all .15s; }
  .btn-prev { background: #f0f4ff; color: #868e96; border: 1.5px solid #e4e8f0; }
  .btn-next { background: #3b5bdb; color: #fff; }
  .btn-submit { background: #0ca678; color: #fff; }
  .btn-skip { background: #fff9db; color: #f08c00; border: 1.5px solid #ffe066; flex: none; padding: 13px 16px; border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: .82rem; font-weight: 700; cursor: pointer; }

  /* Result */
  .qz-result { position: fixed; inset: 0; background: #f0f4ff; z-index: 200; overflow-y: auto; max-width: 480px; margin: 0 auto; font-family: 'Plus Jakarta Sans', sans-serif; padding-bottom: 20px; }
  .result-hero { background: linear-gradient(135deg, #3b5bdb, #5c7cfa); color: #fff; padding: 28px 20px 24px; text-align: center; }
  .result-grade { font-size: 4rem; font-weight: 800; line-height: 1; margin-bottom: 6px; }
  .result-pct { font-size: 1.3rem; font-weight: 800; opacity: .9; margin-bottom: 4px; }
  .result-msg { font-size: .82rem; opacity: .8; font-weight: 500; }
  .result-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; padding: 14px 16px; }
  .result-stat { background: #fff; border-radius: 12px; padding: 12px 8px; text-align: center; border: 1px solid #e4e8f0; }
  .result-stat-num { font-size: 1.2rem; font-weight: 800; display: block; }
  .result-stat-lbl { font-size: .58rem; color: #868e96; text-transform: uppercase; letter-spacing: .4px; margin-top: 2px; display: block; }
  .review-q { background: #fff; border-radius: 12px; border: 1px solid #e4e8f0; padding: 13px; margin: 0 14px 10px; }
  .review-q.r-correct { border-left: 4px solid #0ca678; }
  .review-q.r-wrong { border-left: 4px solid #e03131; }
  .review-q.r-skip { border-left: 4px solid #f08c00; }

  /* Quiz Creator */
  .qc-card { background: #fff; border-radius: 14px; border: 1px solid #e4e8f0; box-shadow: 0 2px 8px rgba(59,91,219,0.07); padding: 14px; margin-bottom: 10px; }
  .qc-inp { width: 100%; padding: 11px 13px; background: #f0f4ff; border: 1.5px solid #e4e8f0; border-radius: 10px; color: #1a1d2e; font-family: 'Plus Jakarta Sans', sans-serif; font-size: .88rem; font-weight: 500; outline: none; transition: border-color .15s; margin-bottom: 12px; }
  .qc-inp:focus { border-color: #3b5bdb; background: #fff; }
  select.qc-inp { cursor: pointer; }
  textarea.qc-inp { resize: vertical; min-height: 75px; }
  .qc-label { font-size: .75rem; font-weight: 700; margin-bottom: 5px; display: block; color: #1a1d2e; }
  .qc-btn { width: 100%; padding: 12px; background: #3b5bdb; color: #fff; border: none; border-radius: 11px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: .9rem; font-weight: 700; cursor: pointer; transition: all .15s; margin-top: 2px; }
  .qc-btn:active { transform: scale(.98); }
  .qc-btn-green { background: #0ca678; }
  .qc-btn-outline { background: #fff; color: #3b5bdb; border: 1.5px solid #c5cffa; }
  .qc-btn-sm { padding: 7px 13px; font-size: .75rem; border-radius: 8px; width: auto; }
  .qc-btn-danger { background: #fff5f5; color: #e03131; border: 1.5px solid #ffc9c9; }
  .type-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
  .type-btn { padding: 7px 13px; border-radius: 20px; font-size: .72rem; font-weight: 700; cursor: pointer; border: 1.5px solid #e4e8f0; background: #fff; color: #868e96; font-family: 'Plus Jakarta Sans', sans-serif; transition: all .15s; }
  .type-btn.active { background: #3b5bdb; color: #fff; border-color: #3b5bdb; }
  .mode-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 0; background: #f0f4ff; border-radius: 11px; padding: 3px; margin-bottom: 14px; border: 1px solid #e4e8f0; }
  .mode-tab { padding: 9px; border-radius: 9px; text-align: center; font-size: .78rem; font-weight: 700; cursor: pointer; transition: all .15s; border: none; background: transparent; font-family: 'Plus Jakarta Sans', sans-serif; color: #868e96; }
  .mode-tab.active { background: #fff; color: #3b5bdb; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
  .opt-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .opt-radio { width: 18px; height: 18px; accent-color: #0ca678; cursor: pointer; flex-shrink: 0; }
  .opt-inp { flex: 1; padding: 9px 12px; background: #fff; border: 1.5px solid #e4e8f0; border-radius: 9px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: .84rem; font-weight: 500; outline: none; transition: all .15s; }
  .opt-inp:focus { border-color: #3b5bdb; }
  .opt-inp.is-correct { border-color: #0ca678; background: #e6faf5; font-weight: 700; }
  .opt-del { width: 28px; height: 28px; border-radius: 7px; border: 1.5px solid #e4e8f0; background: #f0f4ff; color: #868e96; font-size: .8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .tf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
  .tf-creator-btn { padding: 14px; border-radius: 11px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: .9rem; font-weight: 800; cursor: pointer; border: 2px solid #e4e8f0; background: #fff; transition: all .15s; }
  .tf-creator-btn.sel-true { background: #e6faf5; border-color: #0ca678; color: #0ca678; }
  .tf-creator-btn.sel-false { background: #fff5f5; border-color: #e03131; color: #e03131; }
  .paste-area { width: 100%; min-height: 140px; padding: 12px; background: #f0f4ff; border: 2px dashed #e4e8f0; border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: .78rem; color: #1a1d2e; outline: none; resize: vertical; transition: border-color .15s; line-height: 1.5; margin-bottom: 12px; }
  .paste-area:focus { border-color: #3b5bdb; background: #fff; }
  .added-q-item { background: #f0f4ff; border-radius: 9px; padding: 9px 11px; margin-bottom: 6px; display: flex; gap: 8px; align-items: flex-start; border: 1px solid #e4e8f0; }
  .err-box { background: #fff5f5; border: 1px solid #ffc9c9; border-radius: 10px; padding: 9px 12px; font-size: .78rem; font-weight: 600; color: #e03131; margin-bottom: 12px; }
  .ok-box { background: #e6faf5; border: 1px solid #96f2d7; border-radius: 10px; padding: 9px 12px; font-size: .78rem; font-weight: 600; color: #0ca678; margin-bottom: 12px; }
  .step-indicator { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
  .step-dot { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .75rem; font-weight: 800; }
  .step-dot.active { background: #3b5bdb; color: #fff; }
  .step-dot.done { background: #0ca678; color: #fff; }
  .step-dot.inactive { background: #f0f4ff; color: #868e96; }
  .step-line { flex: 1; height: 2px; background: #e4e8f0; }
  .step-line.done { background: #0ca678; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .fade-up { animation: fadeUp .22s ease both; }
`;

// ── Toast ──
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: "#1a1d2e", color: "#fff", padding: "10px 22px", borderRadius: 30,
      fontSize: ".82rem", fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,.2)",
      zIndex: 999, whiteSpace: "nowrap", fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>{msg}</div>
  );
}

// ── Quiz Player ──
function QuizPlayer({ quiz, questions, profile, onClose, onFinish }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [skipped, setSkipped] = useState({});
  const [revealed, setRevealed] = useState({});
  const [timeLeft, setTimeLeft] = useState((quiz.time_minutes || 15) * 60);
  const [mode, setMode] = useState("test"); // test | practice
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (mode === "test" && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [mode, submitted]);

  const fmtTime = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const timerCls = timeLeft < 60 ? "danger" : timeLeft < 180 ? "warning" : "";

  const q = questions[current];

  const handleAnswer = (val) => {
    if (revealed[current]) return;
    setAnswers(a => ({ ...a, [current]: val }));
    if (mode === "practice") {
      setRevealed(r => ({ ...r, [current]: true }));
    }
  };

  const handleSkip = () => {
    setSkipped(s => ({ ...s, [current]: true }));
    if (current < questions.length - 1) setCurrent(c => c + 1);
  };

  const handleSubmit = async (auto = false) => {
    clearInterval(timerRef.current);
    let correct = 0, wrong = 0, skippedCount = 0, totalMarks = 0, obtainedMarks = 0;

    questions.forEach((q, i) => {
      const ans = answers[i];
      const maxM = q.marks || 1;
      totalMarks += maxM;
      if (skipped[i] || ans === undefined) { skippedCount++; return; }

      let isCorrect = false;
      if (q.type === "mcq") isCorrect = ans === q.correct_answer;
      else if (q.type === "tf") isCorrect = String(ans) === String(q.correct_answer);
      else if (q.type === "fib") isCorrect = ans?.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase();

      if (isCorrect) { correct++; obtainedMarks += maxM; }
      else wrong++;
    });

    const pct = Math.round((obtainedMarks / totalMarks) * 100);
    const passed = pct >= (quiz.pass_percentage || 60);
    const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : "F";

    const resultData = { correct, wrong, skipped: skippedCount, total: questions.length, pct, passed, grade, obtainedMarks, totalMarks, timeTaken: (quiz.time_minutes * 60) - timeLeft };
    setResults(resultData);
    setSubmitted(true);

    // Save to Supabase
    await supabase.from("quiz_attempts").insert({
      quiz_id: quiz.id,
      student_id: profile?.id,
      score: obtainedMarks,
      total_marks: totalMarks,
      percentage: pct,
      passed,
      answers: JSON.stringify(answers),
      time_taken: resultData.timeTaken,
    }).catch(() => {});
  };

  const isAnswered = (i) => answers[i] !== undefined;
  const progressPct = ((current + 1) / questions.length) * 100;

  // Result Screen
  if (submitted && results) {
    const msgs = results.pct >= 90 ? "Excellent! 🌟" : results.pct >= 70 ? "Great Job! 👏" : results.pct >= 60 ? "Good, Passed! ✅" : "Better luck next time 💪";
    return (
      <div className="qz-result">
        <div className="result-hero">
          <div className="result-grade">{results.grade}</div>
          <div className="result-pct">{results.pct}%</div>
          <div className="result-msg">{msgs}</div>
        </div>
        <div className="result-stats">
          {[["✅ " + results.correct, "Correct"], ["❌ " + results.wrong, "Wrong"], ["⏭️ " + results.skipped, "Skipped"]].map(([n, l]) => (
            <div className="result-stat" key={l}><span className="result-stat-num">{n}</span><span className="result-stat-lbl">{l}</span></div>
          ))}
        </div>
        <div style={{ padding: "0 14px 14px" }}>
          <div style={{ background: results.passed ? "#e6faf5" : "#fff5f5", borderRadius: 12, padding: "12px 16px", textAlign: "center", marginBottom: 14, border: `1px solid ${results.passed ? "#96f2d7" : "#ffc9c9"}` }}>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: results.passed ? "#0ca678" : "#e03131" }}>
              {results.passed ? "🎉 Passed!" : "❌ Failed"} — {results.obtainedMarks}/{results.totalMarks} Marks
            </span>
          </div>

          <div className="sec-lbl">Answer Review</div>
          {questions.map((q, i) => {
            const ans = answers[i];
            const isSkip = skipped[i] || ans === undefined;
            let isCorrect = false;
            if (!isSkip) {
              if (q.type === "mcq") isCorrect = ans === q.correct_answer;
              else if (q.type === "tf") isCorrect = String(ans) === String(q.correct_answer);
              else if (q.type === "fib") isCorrect = ans?.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase();
            }
            return (
              <div className={`review-q ${isSkip ? "r-skip" : isCorrect ? "r-correct" : "r-wrong"}`} key={i}>
                <div style={{ fontSize: ".72rem", color: "#868e96", marginBottom: 4 }}>Q{i + 1}</div>
                <div style={{ fontSize: ".85rem", fontWeight: 700, marginBottom: 6 }}>{q.question}</div>
                <div style={{ fontSize: ".78rem" }}>
                  {isSkip ? <span style={{ color: "#f08c00" }}>⏭️ Skipped</span> :
                    isCorrect ? <span style={{ color: "#0ca678" }}>✅ Correct</span> :
                      <span style={{ color: "#e03131" }}>❌ Wrong — Correct: <strong>{String(q.correct_answer)}</strong></span>}
                </div>
                {q.explanation && <div style={{ fontSize: ".72rem", color: "#3b5bdb", marginTop: 6, background: "#eef1ff", padding: "6px 10px", borderRadius: 8 }}>💡 {q.explanation}</div>}
              </div>
            );
          })}

          <button className="qc-btn" onClick={onFinish} style={{ marginTop: 8 }}>← Quiz List Par Jaao</button>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="qz-player">
      <div className="qz-player-header">
        <div>
          <div style={{ fontSize: ".72rem", color: "#868e96", fontWeight: 700 }}>{quiz.title}</div>
          <div style={{ fontSize: ".82rem", fontWeight: 800 }}>Q {current + 1}/{questions.length}</div>
        </div>
        {mode === "test" && <div className={`qz-timer ${timerCls}`}>{fmtTime(timeLeft)}</div>}
        {mode === "practice" && <span className="badge badge-blue">Practice Mode</span>}
        <button onClick={() => { if (confirm("Quiz chhodna chahte ho?")) { clearInterval(timerRef.current); onClose(); } }}
          style={{ padding: "6px 12px", borderRadius: 20, border: "1.5px solid #e4e8f0", background: "#fff", fontSize: ".72rem", fontWeight: 700, cursor: "pointer", color: "#868e96" }}>
          Exit
        </button>
      </div>

      <div className="qz-progress"><div className="qz-progress-fill" style={{ width: progressPct + "%" }} /></div>

      <div className="qz-dots">
        {questions.map((_, i) => (
          <div key={i} className={`q-dot ${i === current ? "current" : skipped[i] ? "skipped" : isAnswered(i) ? "answered" : "unanswered"}`}
            onClick={() => setCurrent(i)}>{i + 1}</div>
        ))}
      </div>

      <div className="qz-body">
        <div className="q-num-badge">Question {current + 1} of {questions.length} • {q.marks || 1} Mark{(q.marks || 1) > 1 ? "s" : ""}</div>
        <div className="q-text">{q.question}</div>

        {/* MCQ */}
        {q.type === "mcq" && (
          <div>
            {(q.options || []).map((opt, oi) => {
              let cls = "";
              if (revealed[current]) {
                if (oi === q.correct_answer) cls = "correct";
                else if (answers[current] === oi) cls = "wrong";
              } else if (answers[current] === oi) cls = "selected";
              return (
                <div key={oi} className={`mcq-opt ${cls}`} onClick={() => handleAnswer(oi)}>
                  <div className="opt-letter">{["A","B","C","D"][oi]}</div>
                  <div className="opt-text">{opt}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* True/False */}
        {q.type === "tf" && (
          <div className="tf-opts">
            {[true, false].map(val => {
              let cls = "";
              if (revealed[current]) {
                if (String(val) === String(q.correct_answer)) cls = "correct";
                else if (answers[current] === val) cls = "wrong";
              } else if (answers[current] === val) cls = "selected";
              return (
                <div key={String(val)} className={`tf-opt ${cls}`} onClick={() => handleAnswer(val)}>
                  <div className="tf-icon">{val ? "✅" : "❌"}</div>
                  <div className="tf-label">{val ? "True" : "False"}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fill in blank */}
        {q.type === "fib" && (
          <div>
            <input
              className={`fib-inp ${revealed[current] ? (answers[current]?.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase() ? "correct" : "wrong") : ""}`}
              placeholder="Jawab yahan likho..."
              value={answers[current] || ""}
              onChange={e => !revealed[current] && setAnswers(a => ({ ...a, [current]: e.target.value }))}
              onKeyDown={e => { if (e.key === "Enter" && mode === "practice") setRevealed(r => ({ ...r, [current]: true })); }}
            />
            {mode === "practice" && !revealed[current] && (
              <button className="qc-btn qc-btn-outline" onClick={() => setRevealed(r => ({ ...r, [current]: true }))}>Check Answer</button>
            )}
            {revealed[current] && (
              <div className="expl-box" style={{ display: "block" }}>✅ Correct Answer: <strong>{q.correct_answer}</strong></div>
            )}
          </div>
        )}

        {revealed[current] && q.explanation && (
          <div className="expl-box" style={{ display: "block", marginTop: 12 }}>💡 {q.explanation}</div>
        )}
      </div>

      <div className="qz-footer">
        <button className="qz-nav-btn btn-prev" onClick={() => current > 0 && setCurrent(c => c - 1)} disabled={current === 0}>← Prev</button>
        {mode === "test" && <button className="btn-skip" onClick={handleSkip}>Skip ⏭</button>}
        {current < questions.length - 1
          ? <button className="qz-nav-btn btn-next" onClick={() => setCurrent(c => c + 1)}>Next →</button>
          : <button className="qz-nav-btn btn-submit" onClick={() => { if (confirm("Quiz submit karna chahte ho?")) handleSubmit(); }}>Submit ✓</button>
        }
      </div>
    </div>
  );
}

// ── Quiz Creator (Teacher/Admin) ──
function QuizCreator({ profile, onClose, onPublished }) {
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState({ title: "", subject: "math", chapter: "", customChapter: "", timeMinutes: 15, passPercentage: 60, difficulty: "medium", status: "active", mode: "both" });
  const [questions, setQuestions] = useState([]);
  const [inputMode, setInputMode] = useState("paste"); // paste | manual
  const [pasteText, setPasteText] = useState("");
  const [pastePreview, setPastePreview] = useState(null);
  const [selectedPaste, setSelectedPaste] = useState([]);
  const [qType, setQType] = useState("mcq");
  const [manualQ, setManualQ] = useState({ question: "", options: ["","","",""], correctAnswer: 0, tfAnswer: true, fibAnswer: "", explanation: "", marks: 1 });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  const goStep2 = () => {
    if (!info.title.trim()) { setErr("Quiz title zaroor bharo!"); return; }
    setErr(""); setStep(2);
  };

  const parsePaste = () => {
    try {
      const cleaned = pasteText.trim().replace(/^var\s+\w+\s*=\s*/, "").replace(/;$/, "");
      const parsed = eval("(" + cleaned + ")");
      if (!Array.isArray(parsed)) throw new Error("Array chahiye");
      setPastePreview(parsed);
      setSelectedPaste(parsed.map((_, i) => i));
      setOk(`${parsed.length} questions parse ho gaye!`);
      setErr("");
    } catch (e) {
      setErr("Parse error! Format check karo."); setOk("");
    }
  };

  const importSelected = () => {
    const imported = selectedPaste.map(i => {
      const q = pastePreview[i];
      return {
        type: q.type || "mcq",
        question: q.q || q.question,
        options: q.opts || q.options || [],
        correct_answer: q.ans !== undefined ? q.ans : q.correct_answer,
        explanation: q.exp || q.explanation || "",
        marks: q.marks || 1,
        pairs: q.pairs || [],
      };
    });
    setQuestions(prev => [...prev, ...imported]);
    setPastePreview(null); setPasteText(""); setOk(""); setSelectedPaste([]);
    showToast(`${imported.length} questions added!`);
  };

  const addManualQ = () => {
    if (!manualQ.question.trim()) { setErr("Question likho!"); return; }
    const newQ = {
      type: qType,
      question: manualQ.question,
      options: qType === "mcq" ? manualQ.options.filter(o => o.trim()) : [],
      correct_answer: qType === "mcq" ? manualQ.correctAnswer : qType === "tf" ? manualQ.tfAnswer : manualQ.fibAnswer,
      explanation: manualQ.explanation,
      marks: manualQ.marks,
    };
    if (qType === "mcq" && newQ.options.length < 2) { setErr("Kam se kam 2 options chahiye!"); return; }
    setQuestions(prev => [...prev, newQ]);
    setManualQ({ question: "", options: ["","","",""], correctAnswer: 0, tfAnswer: true, fibAnswer: "", explanation: "", marks: 1 });
    setErr(""); showToast("Question added!");
  };

  const publishQuiz = async () => {
    if (questions.length === 0) { setErr("Kam se kam ek question add karo!"); return; }
    setSaving(true);
    const chapterName = info.customChapter.trim() || info.chapter || (CHAPTERS[info.subject]?.[0] || "");
    const { data: quiz, error } = await supabase.from("quizzes").insert({
      title: info.title,
      subject: info.subject,
      chapter: chapterName,
      time_minutes: info.timeMinutes,
      pass_percentage: info.passPercentage,
      difficulty: info.difficulty,
      status: info.status,
      mode: info.mode,
      created_by: profile?.id,
      total_questions: questions.length,
    }).select().single();

    if (error) { setErr(error.message); setSaving(false); return; }

    const qRows = questions.map((q, i) => ({ ...q, quiz_id: quiz.id, order_index: i, options: JSON.stringify(q.options), pairs: JSON.stringify(q.pairs || []) }));
    await supabase.from("quiz_questions").insert(qRows);
    setSaving(false);
    showToast("Quiz published! 🎉");
    setTimeout(() => onPublished(), 1000);
  };

  const chapters = CHAPTERS[info.subject] || [];

  return (
    <div style={{ position: "fixed", inset: 0, background: "#f0f4ff", zIndex: 200, overflowY: "auto", maxWidth: 480, margin: "0 auto", fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: 30 }}>
      <style>{quizStyles}</style>
      <Toast msg={toast} />
      <div style={{ background: "#fff", borderBottom: "1px solid #e4e8f0", padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100 }}>
        <button className="qz-back-btn" onClick={onClose}>←</button>
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 800 }}>Quiz Creator</div>
          <div style={{ fontSize: ".62rem", color: "#868e96" }}>Step {step} of 2</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <div className="step-indicator" style={{ gap: 6, marginBottom: 0 }}>
            <div className={`step-dot ${step === 1 ? "active" : "done"}`}>1</div>
            <div className={`step-line ${step === 2 ? "done" : ""}`} style={{ width: 24 }} />
            <div className={`step-dot ${step === 2 ? "active" : "inactive"}`}>2</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 14 }}>
        {step === 1 && (
          <div className="qc-card fade-up">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div className="step-dot active">1</div>
              <div style={{ fontSize: ".9rem", fontWeight: 800 }}>Quiz Info</div>
            </div>
            {err && <div className="err-box">{err}</div>}
            <label className="qc-label">Quiz Title *</label>
            <input className="qc-inp" placeholder="Jaise: Real Numbers — Chapter 1 Quiz" value={info.title} onChange={e => setInfo({ ...info, title: e.target.value })} />
            <label className="qc-label">Subject *</label>
            <select className="qc-inp" value={info.subject} onChange={e => setInfo({ ...info, subject: e.target.value, chapter: "" })}>
              {Object.entries(SUBJECTS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.name}</option>)}
            </select>
            <label className="qc-label">Chapter *</label>
            <select className="qc-inp" value={info.chapter} onChange={e => setInfo({ ...info, chapter: e.target.value })}>
              <option value="">Chapter select karo</option>
              {chapters.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="qc-label">Ya custom chapter</label>
            <input className="qc-inp" placeholder="Custom chapter name (optional)" value={info.customChapter} onChange={e => setInfo({ ...info, customChapter: e.target.value })} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div><label className="qc-label">Time (min)</label><input className="qc-inp" type="number" value={info.timeMinutes} min="1" onChange={e => setInfo({ ...info, timeMinutes: +e.target.value })} /></div>
              <div><label className="qc-label">Pass (%)</label><input className="qc-inp" type="number" value={info.passPercentage} min="1" max="100" onChange={e => setInfo({ ...info, passPercentage: +e.target.value })} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label className="qc-label">Difficulty</label>
                <select className="qc-inp" value={info.difficulty} onChange={e => setInfo({ ...info, difficulty: e.target.value })}>
                  <option value="easy">Easy 🟢</option><option value="medium">Medium 🟡</option><option value="hard">Hard 🔴</option>
                </select>
              </div>
              <div>
                <label className="qc-label">Status</label>
                <select className="qc-inp" value={info.status} onChange={e => setInfo({ ...info, status: e.target.value })}>
                  <option value="active">✅ Active</option><option value="draft">📝 Draft</option>
                </select>
              </div>
            </div>
            <label className="qc-label">Quiz Mode</label>
            <select className="qc-inp" value={info.mode} onChange={e => setInfo({ ...info, mode: e.target.value })}>
              <option value="both">🔀 Both (Practice + Test)</option>
              <option value="practice">📖 Practice Only</option>
              <option value="test">⏱️ Test Only</option>
            </select>
            <button className="qc-btn" onClick={goStep2}>Next: Add Questions →</button>
          </div>
        )}

        {step === 2 && (
          <>
            <div className="qc-card fade-up" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: "1.1rem" }}>{SUBJECTS[info.subject]?.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: ".82rem", fontWeight: 800 }}>{info.title}</div>
                <div style={{ fontSize: ".62rem", color: "#868e96" }}>{info.customChapter || info.chapter} • {info.timeMinutes} min • <span className={`badge ${DIFF_CLS[info.difficulty]}`}>{DIFF_LABEL[info.difficulty]}</span></div>
              </div>
              <button className="qc-btn qc-btn-sm qc-btn-outline" onClick={() => setStep(1)}>✏️ Edit</button>
            </div>

            <div className="qc-card fade-up" style={{ padding: "12px 14px" }}>
              <div className="mode-tabs">
                <button className={`mode-tab ${inputMode === "paste" ? "active" : ""}`} onClick={() => setInputMode("paste")}>📋 Paste Mode</button>
                <button className={`mode-tab ${inputMode === "manual" ? "active" : ""}`} onClick={() => setInputMode("manual")}>✏️ Manual Mode</button>
              </div>
            </div>

            {inputMode === "paste" && (
              <div className="qc-card fade-up">
                <div className="sec-lbl">Questions Paste Karo</div>
                <div style={{ background: "#eef1ff", borderRadius: 10, padding: "10px 12px", marginBottom: 10, fontSize: ".72rem", color: "#3b5bdb", fontWeight: 600, lineHeight: 1.7 }}>
                  💡 JS array format:<br />
                  MCQ: <code style={{ background: "rgba(255,255,255,.7)", padding: "1px 5px", borderRadius: 4 }}>{`{q:"?", opts:["A","B","C","D"], ans:0}`}</code><br />
                  T/F: <code style={{ background: "rgba(255,255,255,.7)", padding: "1px 5px", borderRadius: 4 }}>{`{q:"?", type:"tf", ans:true}`}</code><br />
                  Fill: <code style={{ background: "rgba(255,255,255,.7)", padding: "1px 5px", borderRadius: 4 }}>{`{q:"___ capital", type:"fib", ans:"Delhi"}`}</code>
                </div>
                <textarea className="paste-area" placeholder="Yahan paste karo..." value={pasteText} onChange={e => setPasteText(e.target.value)} />
                {err && <div className="err-box">{err}</div>}
                {ok && <div className="ok-box">{ok}</div>}
                <button className="qc-btn qc-btn-outline" onClick={parsePaste} style={{ marginBottom: 10 }}>🔍 Parse & Preview</button>
                {pastePreview && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div className="sec-lbl" style={{ margin: 0 }}>{pastePreview.length} questions</div>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button className="qc-btn qc-btn-sm qc-btn-outline" onClick={() => setSelectedPaste(pastePreview.map((_, i) => i))}>All</button>
                        <button className="qc-btn qc-btn-sm qc-btn-outline" onClick={() => setSelectedPaste([])}>None</button>
                      </div>
                    </div>
                    {pastePreview.map((q, i) => (
                      <div key={i} onClick={() => setSelectedPaste(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])}
                        style={{ background: selectedPaste.includes(i) ? "#eef1ff" : "#f0f4ff", border: `1px solid ${selectedPaste.includes(i) ? "#c5cffa" : "#e4e8f0"}`, borderRadius: 10, padding: 11, marginBottom: 8, cursor: "pointer" }}>
                        <div style={{ fontSize: ".78rem", fontWeight: 700 }}>{i + 1}. {q.q || q.question}</div>
                        <div style={{ fontSize: ".62rem", color: "#868e96", marginTop: 3 }}>{(q.type || "mcq").toUpperCase()}</div>
                      </div>
                    ))}
                    <button className="qc-btn qc-btn-green" onClick={importSelected} style={{ marginTop: 6 }}>✅ Import Karo ({selectedPaste.length})</button>
                  </div>
                )}
              </div>
            )}

            {inputMode === "manual" && (
              <div className="qc-card fade-up">
                <div className="sec-lbl">Manual Question Add Karo</div>
                {err && <div className="err-box">{err}</div>}
                <label className="qc-label">Question Type</label>
                <div className="type-tabs">
                  {["mcq","tf","fib"].map(t => (
                    <button key={t} className={`type-btn ${qType === t ? "active" : ""}`} onClick={() => setQType(t)}>
                      {t === "mcq" ? "MCQ" : t === "tf" ? "True / False" : "Fill in Blank"}
                    </button>
                  ))}
                </div>
                <label className="qc-label">Question *</label>
                <textarea className="qc-inp" placeholder="Question yahan likho..." value={manualQ.question} onChange={e => setManualQ({ ...manualQ, question: e.target.value })} style={{ height: 75 }} />

                {qType === "mcq" && (
                  <div>
                    <label className="qc-label">Options <span style={{ color: "#868e96", fontWeight: 500 }}>(✓ = correct answer)</span></label>
                    {manualQ.options.map((opt, oi) => (
                      <div className="opt-row" key={oi}>
                        <input type="radio" className="opt-radio" checked={manualQ.correctAnswer === oi} onChange={() => setManualQ({ ...manualQ, correctAnswer: oi })} />
                        <input className={`opt-inp ${manualQ.correctAnswer === oi ? "is-correct" : ""}`} placeholder={`Option ${["A","B","C","D"][oi]}`} value={opt} onChange={e => { const o = [...manualQ.options]; o[oi] = e.target.value; setManualQ({ ...manualQ, options: o }); }} />
                        {manualQ.options.length > 2 && <button className="opt-del" onClick={() => { const o = manualQ.options.filter((_, i) => i !== oi); setManualQ({ ...manualQ, options: o, correctAnswer: Math.min(manualQ.correctAnswer, o.length - 1) }); }}>✕</button>}
                      </div>
                    ))}
                    {manualQ.options.length < 6 && <button className="qc-btn qc-btn-outline qc-btn-sm" onClick={() => setManualQ({ ...manualQ, options: [...manualQ.options, ""] })} style={{ marginBottom: 12 }}>+ Option Add Karo</button>}
                  </div>
                )}

                {qType === "tf" && (
                  <div>
                    <label className="qc-label">Correct Answer</label>
                    <div className="tf-grid">
                      <button className={`tf-creator-btn ${manualQ.tfAnswer === true ? "sel-true" : ""}`} onClick={() => setManualQ({ ...manualQ, tfAnswer: true })}>✅ True</button>
                      <button className={`tf-creator-btn ${manualQ.tfAnswer === false ? "sel-false" : ""}`} onClick={() => setManualQ({ ...manualQ, tfAnswer: false })}>❌ False</button>
                    </div>
                  </div>
                )}

                {qType === "fib" && (
                  <div>
                    <label className="qc-label">Correct Answer *</label>
                    <input className="qc-inp" placeholder="Sahi jawab likho..." value={manualQ.fibAnswer} onChange={e => setManualQ({ ...manualQ, fibAnswer: e.target.value })} />
                  </div>
                )}

                <label className="qc-label">Explanation <span style={{ color: "#868e96", fontWeight: 500 }}>(optional)</span></label>
                <textarea className="qc-inp" placeholder="Answer ki explanation..." value={manualQ.explanation} onChange={e => setManualQ({ ...manualQ, explanation: e.target.value })} style={{ height: 65 }} />
                <label className="qc-label">Marks</label>
                <input className="qc-inp" type="number" value={manualQ.marks} min="1" max="10" onChange={e => setManualQ({ ...manualQ, marks: +e.target.value })} />
                <button className="qc-btn qc-btn-green" onClick={addManualQ}>✅ Question Add Karo</button>
              </div>
            )}

            {questions.length > 0 && (
              <div className="qc-card fade-up">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div className="sec-lbl" style={{ margin: 0 }}>{questions.length} questions added</div>
                  <button className="qc-btn qc-btn-sm qc-btn-danger" onClick={() => { if (confirm("Sab questions delete karein?")) setQuestions([]); }}>Clear All</button>
                </div>
                {questions.map((q, i) => (
                  <div key={i} className="added-q-item">
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: "#3b5bdb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".65rem", fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: ".82rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.question}</div>
                      <div style={{ fontSize: ".62rem", color: "#868e96" }}>{q.type?.toUpperCase()} • {q.marks} mark</div>
                    </div>
                    <button className="opt-del" onClick={() => setQuestions(qs => qs.filter((_, j) => j !== i))}>✕</button>
                  </div>
                ))}
                {err && <div className="err-box">{err}</div>}
                <button className="qc-btn qc-btn-green" onClick={publishQuiz} disabled={saving} style={{ marginTop: 4 }}>
                  {saving ? "Publishing..." : "🚀 Quiz Publish Karo"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Quiz Module ──
export default function QuizModule({ role, profile }) {
  const [view, setView] = useState("home"); // home | subject | chapter | quizList | player | creator | startScreen
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [subjectCounts, setSubjectCounts] = useState({});
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [myStats, setMyStats] = useState({ total: 0, avg: 0, passed: 0 });
  const [loading, setLoading] = useState(false);
  const [filterDiff, setFilterDiff] = useState("all");
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  useEffect(() => { fetchHomeData(); }, []);

  const fetchHomeData = async () => {
    const [quizRes, attemptRes] = await Promise.all([
      supabase.from("quizzes").select("id, subject, status").eq("status", "active"),
      supabase.from("quiz_attempts").select("*").eq("student_id", profile?.id),
    ]);
    const counts = {};
    (quizRes.data || []).forEach(q => { counts[q.subject] = (counts[q.subject] || 0) + 1; });
    setSubjectCounts(counts);
    const att = attemptRes.data || [];
    setAttempts(att);
    if (att.length > 0) {
      const avg = Math.round(att.reduce((s, a) => s + a.percentage, 0) / att.length);
      const passed = att.filter(a => a.passed).length;
      setMyStats({ total: att.length, avg, passed });
    }
  };

  const openSubject = async (subKey) => {
    setSelectedSubject(subKey);
    setView("subject");
  };

  const openChapter = async (chapter) => {
    setSelectedChapter(chapter);
    setLoading(true);
    const { data } = await supabase.from("quizzes").select("*").eq("subject", selectedSubject).eq("chapter", chapter).eq("status", "active");
    setQuizzes(data || []);
    setLoading(false);
    setView("quizList");
  };

  const openQuiz = async (quiz) => {
    setActiveQuiz(quiz);
    const { data } = await supabase.from("quiz_questions").select("*").eq("quiz_id", quiz.id).order("order_index");
    const qs = (data || []).map(q => ({ ...q, options: typeof q.options === "string" ? JSON.parse(q.options) : q.options || [], pairs: typeof q.pairs === "string" ? JSON.parse(q.pairs) : q.pairs || [] }));
    setActiveQuestions(qs);
    setView("player");
  };

  const attemptedQuizIds = new Set(attempts.map(a => a.quiz_id));
  const chapters = selectedSubject ? (CHAPTERS[selectedSubject] || []) : [];
  const filteredQuizzes = filterDiff === "all" ? quizzes : quizzes.filter(q => q.difficulty === filterDiff);

  if (view === "creator" && (role === "admin" || role === "teacher")) {
    return (
      <>
        <style>{quizStyles}</style>
        <QuizCreator profile={profile} onClose={() => setView("home")} onPublished={() => { setView("home"); fetchHomeData(); showToast("Quiz published! 🎉"); }} />
      </>
    );
  }

  if (view === "player" && activeQuiz) {
    return (
      <>
        <style>{quizStyles}</style>
        <QuizPlayer quiz={activeQuiz} questions={activeQuestions} profile={profile}
          onClose={() => setView("quizList")} onFinish={() => { setView("quizList"); fetchHomeData(); }} />
      </>
    );
  }

  return (
    <>
      <style>{quizStyles}</style>
      <Toast msg={toast} />
      <div className="qz-wrap">

        {/* Subject List */}
        {view === "subject" && (
          <>
            <div className="qz-topbar">
              <button className="qz-back-btn" onClick={() => setView("home")}>←</button>
              <div>
                <div className="qz-topbar-title">{SUBJECTS[selectedSubject]?.icon} {SUBJECTS[selectedSubject]?.name}</div>
                <div className="qz-topbar-sub">Chapter select karo</div>
              </div>
            </div>
            <div className="sec-lbl">Chapters</div>
            {chapters.map(ch => (
              <div className="qz-quiz-card" key={ch} onClick={() => openChapter(ch)}>
                <div style={{ fontWeight: 700, fontSize: ".88rem" }}>{ch}</div>
                <div style={{ fontSize: ".65rem", color: "#868e96", marginTop: 3 }}>Tap to view quizzes →</div>
              </div>
            ))}
          </>
        )}

        {/* Quiz List */}
        {view === "quizList" && (
          <>
            <div className="qz-topbar">
              <button className="qz-back-btn" onClick={() => setView("subject")}>←</button>
              <div>
                <div className="qz-topbar-title">{selectedChapter}</div>
                <div className="qz-topbar-sub">{quizzes.length} quizzes available</div>
              </div>
            </div>
            <div className="qz-filter-tabs">
              {["all","easy","medium","hard"].map(d => (
                <button key={d} className={`qz-filter-tab ${filterDiff === d ? "active" : ""}`} onClick={() => setFilterDiff(d)}>
                  {d === "all" ? "All" : DIFF_LABEL[d]}
                </button>
              ))}
            </div>
            {loading ? <div style={{ textAlign: "center", padding: 40, color: "#868e96" }}>Loading...</div> :
              filteredQuizzes.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "#868e96" }}>Is chapter mein koi quiz nahi hai abhi</div> :
              filteredQuizzes.map(quiz => {
                const att = attempts.find(a => a.quiz_id === quiz.id);
                return (
                  <div key={quiz.id} className={`qz-quiz-card ${att ? "attempted" : ""}`} onClick={() => openQuiz(quiz)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ fontWeight: 800, fontSize: ".9rem", flex: 1, paddingRight: 8 }}>{quiz.title}</div>
                      <span className={`badge ${DIFF_CLS[quiz.difficulty]}`}>{DIFF_LABEL[quiz.difficulty]}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      <span className="badge badge-muted">⏱ {quiz.time_minutes} min</span>
                      <span className="badge badge-muted">❓ {quiz.total_questions} Qs</span>
                      <span className="badge badge-muted">✅ Pass: {quiz.pass_percentage}%</span>
                    </div>
                    {att && <div style={{ fontSize: ".72rem", color: "#0ca678", fontWeight: 700 }}>✓ Attempted — {att.percentage}% {att.passed ? "• Passed 🎉" : "• Failed"}</div>}
                  </div>
                );
              })
            }
          </>
        )}

        {/* Home */}
        {view === "home" && (
          <>
            {(role === "admin" || role === "teacher") && (
              <button className="qc-btn" style={{ marginBottom: 14 }} onClick={() => setView("creator")}>
                + New Quiz Banao
              </button>
            )}

            <div className="qz-hero">
              <div style={{ fontSize: ".72rem", opacity: .8, marginBottom: 4 }}>Meri Quiz Progress</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 14 }}>{profile?.full_name || "Student"}</div>
              <div className="qz-hero-stats">
                <div className="qz-hero-stat"><span className="qz-hero-stat-num">{myStats.total}</span><span className="qz-hero-stat-lbl">Attempts</span></div>
                <div className="qz-hero-stat"><span className="qz-hero-stat-num">{myStats.total > 0 ? myStats.avg + "%" : "—"}</span><span className="qz-hero-stat-lbl">Avg Score</span></div>
                <div className="qz-hero-stat"><span className="qz-hero-stat-num">{myStats.passed}</span><span className="qz-hero-stat-lbl">Passed</span></div>
              </div>
            </div>

            <div className="sec-lbl">Subject Chuniye</div>
            <div className="qz-subj-grid">
              {Object.entries(SUBJECTS).map(([key, subj]) => (
                <button key={key} className="qz-subj-card" style={{ background: subj.color }} onClick={() => openSubject(key)}>
                  <span className="qz-subj-icon">{subj.icon}</span>
                  <span className="qz-subj-name">{subj.name}</span>
                  <span className="qz-subj-count">{subjectCounts[key] || 0} quizzes</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
