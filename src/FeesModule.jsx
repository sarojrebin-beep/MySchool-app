import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://jugdyjvxskqglatljvtn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2R5anZ4c2txZ2xhdGxqdnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQzODYsImV4cCI6MjA5MzcxMDM4Nn0.cfFbH5lKAsbjHAgH51vbA6_1AYfBtbJefLeFgyHfHTQ"
);

const CATS = ["tuition", "transport", "exam", "misc"];
const MODES = ["cash", "online", "cheque"];

export default function FeesModule({ user, profile, schoolId }) {
  const role = profile?.role;
  const [tab, setTab] = useState(role === "admin" ? "fees" : "my");
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [selStudent, setSelStudent] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Forms
  const [feeForm, setFeeForm] = useState({ title: "", amount: "", due_date: "", category: "tuition", student_id: "" });
  const [payForm, setPayForm] = useState({ fee_id: "", paid_amount: "", payment_mode: "cash", remarks: "" });
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);
  const [activeFee, setActiveFee] = useState(null);

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  useEffect(() => { loadData(); }, [tab, selStudent]);

  async function loadData() {
    setLoading(true);
    try {
      if (role === "admin" || role === "teacher") {
        const { data: st } = await sb.from("students").select("id,name,class_id").eq("school_id", schoolId);
        setStudents(st || []);
      }

      if (tab === "fees" && (role === "admin" || role === "teacher")) {
        let q = sb.from("fees").select("*, students(name)").eq("school_id", schoolId).order("created_at", { ascending: false });
        if (selStudent) q = q.eq("student_id", selStudent);
        const { data } = await q;
        setFees(data || []);

        const { data: p } = await sb.from("fee_payments").select("*").eq("school_id", schoolId);
        setPayments(p || []);
      }

      if (tab === "my") {
        let sid = null;
        if (role === "student") {
          const { data: st } = await sb.from("students").select("id").eq("user_id", user.id).single();
          sid = st?.id;
        } else if (role === "parent") {
          const { data: st } = await sb.from("students").select("id,name").eq("parent_id", user.id);
          setStudents(st || []);
          if (!selStudent && st?.length) setSelStudent(st[0].id);
          sid = selStudent || st?.[0]?.id;
        }
        if (sid) {
          const { data: f } = await sb.from("fees").select("*").eq("student_id", sid).order("due_date");
          setFees(f || []);
          const { data: p } = await sb.from("fee_payments").select("*").eq("student_id", sid);
          setPayments(p || []);
        }
      }
    } finally { setLoading(false); }
  }

  async function addFee() {
    if (!feeForm.title || !feeForm.amount || !feeForm.due_date) return notify("Sab fields bharo");
    const rows = feeForm.student_id
      ? [{ ...feeForm, school_id: schoolId }]
      : students.map(s => ({ ...feeForm, student_id: s.id, school_id: schoolId }));
    const { error } = await sb.from("fees").insert(rows);
    if (error) return notify("Error: " + error.message);
    notify(feeForm.student_id ? "Fee add ho gayi!" : `${students.length} students ko fee add ki!`);
    setFeeForm({ title: "", amount: "", due_date: "", category: "tuition", student_id: "" });
    setShowFeeForm(false);
    loadData();
  }

  async function addPayment() {
    if (!payForm.fee_id || !payForm.paid_amount) return notify("Fee aur amount select karo");
    const fee = fees.find(f => f.id === payForm.fee_id);
    const { error } = await sb.from("fee_payments").insert({
      ...payForm,
      student_id: fee.student_id,
      school_id: schoolId,
      created_by: user.id,
      payment_date: new Date().toISOString().split("T")[0],
    });
    if (error) return notify("Error: " + error.message);
    notify("Payment recorded!");
    setPayForm({ fee_id: "", paid_amount: "", payment_mode: "cash", remarks: "" });
    setShowPayForm(false);
    loadData();
  }

  async function deleteFee(id) {
    if (!confirm("Fee delete karo?")) return;
    await sb.from("fee_payments").delete().eq("fee_id", id);
    await sb.from("fees").delete().eq("id", id);
    loadData();
  }

  function paidFor(feeId) {
    return payments.filter(p => p.fee_id === feeId).reduce((s, p) => s + Number(p.paid_amount), 0);
  }

  function printReceipt(p, f) {
    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>Fee Receipt</title>
      <style>
        body{font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:auto}
        .logo{font-size:24px;font-weight:bold;color:#1e40af}
        .divider{border-top:2px solid #1e40af;margin:16px 0}
        .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb}
        .total{font-size:18px;font-weight:bold;color:#1e40af}
        .badge{background:#dcfce7;color:#166534;padding:4px 12px;border-radius:20px;font-size:13px}
        @media print{button{display:none}}
      </style></head>
      <body>
        <div class="logo">🏫 MySchool</div>
        <div class="divider"></div>
        <h2 style="margin:0">Fee Receipt</h2>
        <p style="color:#6b7280">Receipt No: <strong>${p.receipt_no}</strong></p>
        <div class="row"><span>Student</span><span>${f?.students?.name || "—"}</span></div>
        <div class="row"><span>Fee Head</span><span>${f?.title || "—"}</span></div>
        <div class="row"><span>Category</span><span>${f?.category || "—"}</span></div>
        <div class="row"><span>Payment Date</span><span>${p.payment_date}</span></div>
        <div class="row"><span>Payment Mode</span><span>${p.payment_mode}</span></div>
        ${p.remarks ? `<div class="row"><span>Remarks</span><span>${p.remarks}</span></div>` : ""}
        <div class="divider"></div>
        <div class="row"><span class="total">Amount Paid</span><span class="total">₹${Number(p.paid_amount).toLocaleString("en-IN")}</span></div>
        <div style="margin-top:24px;text-align:center"><span class="badge">✓ Payment Confirmed</span></div>
        <div style="margin-top:32px;color:#9ca3af;font-size:12px;text-align:center">Generated on ${new Date().toLocaleDateString("en-IN")}</div>
        <br/><button onclick="window.print()" style="background:#1e40af;color:white;padding:10px 24px;border:none;border-radius:6px;cursor:pointer">🖨 Print</button>
      </body></html>
    `);
    w.document.close();
  }

  const totalFees = fees.reduce((s, f) => s + Number(f.amount), 0);
  const totalPaid = fees.reduce((s, f) => s + paidFor(f.id), 0);
  const totalDue = totalFees - totalPaid;

  const isOverdue = (f) => new Date(f.due_date) < new Date() && paidFor(f.id) < Number(f.amount);

  return (
    <div style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", color: "#1e40af", fontWeight: 700 }}>💰 Fees Management</h2>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "14px" }}>School fee records & payments</p>
        </div>
        {role === "admin" && (
          <div style={{ display: "flex", gap: "10px" }}>
            <Btn onClick={() => { setShowFeeForm(true); setShowPayForm(false); }} label="+ Add Fee" />
            <Btn onClick={() => { setShowPayForm(true); setShowFeeForm(false); }} label="💳 Record Payment" secondary />
          </div>
        )}
      </div>

      {msg && <div style={{ background: msg.startsWith("Error") ? "#fef2f2" : "#f0fdf4", border: `1px solid ${msg.startsWith("Error") ? "#fca5a5" : "#86efac"}`, color: msg.startsWith("Error") ? "#dc2626" : "#16a34a", padding: "10px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>{msg}</div>}

      {/* Tabs */}
      {(role === "admin" || role === "teacher") && (
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#f1f5f9", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
          {["fees", "payments"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 20px", borderRadius: "7px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px", background: tab === t ? "#1e40af" : "transparent", color: tab === t ? "white" : "#64748b", transition: "all .2s" }}>
              {t === "fees" ? "📋 Fees" : "💳 Payments"}
            </button>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      {fees.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginBottom: "24px" }}>
          <Card label="Total Fees" value={`₹${totalFees.toLocaleString("en-IN")}`} color="#1e40af" icon="📊" />
          <Card label="Paid" value={`₹${totalPaid.toLocaleString("en-IN")}`} color="#16a34a" icon="✅" />
          <Card label="Due" value={`₹${totalDue.toLocaleString("en-IN")}`} color={totalDue > 0 ? "#dc2626" : "#16a34a"} icon="⏳" />
          <Card label="Fees Records" value={fees.length} color="#7c3aed" icon="📁" />
        </div>
      )}

      {/* Filter */}
      {(role === "admin" || role === "teacher") && students.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <select value={selStudent} onChange={e => setSelStudent(e.target.value)} style={selectStyle}>
            <option value="">All Students</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      {/* Parent child selector */}
      {role === "parent" && students.length > 1 && (
        <div style={{ marginBottom: "16px" }}>
          <select value={selStudent} onChange={e => { setSelStudent(e.target.value); loadData(); }} style={selectStyle}>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      {/* Add Fee Form */}
      {showFeeForm && (
        <FormCard title="Add Fee" onClose={() => setShowFeeForm(false)}>
          <div style={formGrid}>
            <LabelInput label="Fee Title" value={feeForm.title} onChange={v => setFeeForm(p => ({ ...p, title: v }))} placeholder="e.g. Monthly Tuition" />
            <LabelInput label="Amount (₹)" type="number" value={feeForm.amount} onChange={v => setFeeForm(p => ({ ...p, amount: v }))} placeholder="0" />
            <LabelInput label="Due Date" type="date" value={feeForm.due_date} onChange={v => setFeeForm(p => ({ ...p, due_date: v }))} />
            <div>
              <label style={labelStyle}>Category</label>
              <select value={feeForm.category} onChange={e => setFeeForm(p => ({ ...p, category: e.target.value }))} style={inputStyle}>
                {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Student (blank = all students)</label>
              <select value={feeForm.student_id} onChange={e => setFeeForm(p => ({ ...p, student_id: e.target.value }))} style={inputStyle}>
                <option value="">All Students</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <Btn onClick={addFee} label="Add Fee" />
            <Btn onClick={() => setShowFeeForm(false)} label="Cancel" secondary />
          </div>
        </FormCard>
      )}

      {/* Record Payment Form */}
      {showPayForm && (
        <FormCard title="Record Payment" onClose={() => setShowPayForm(false)}>
          <div style={formGrid}>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Select Fee</label>
              <select value={payForm.fee_id} onChange={e => setPayForm(p => ({ ...p, fee_id: e.target.value }))} style={inputStyle}>
                <option value="">-- Select Fee --</option>
                {fees.filter(f => paidFor(f.id) < Number(f.amount)).map(f => (
                  <option key={f.id} value={f.id}>{f.students?.name} — {f.title} (₹{Number(f.amount) - paidFor(f.id)} due)</option>
                ))}
              </select>
            </div>
            <LabelInput label="Amount (₹)" type="number" value={payForm.paid_amount} onChange={v => setPayForm(p => ({ ...p, paid_amount: v }))} placeholder="0" />
            <div>
              <label style={labelStyle}>Payment Mode</label>
              <select value={payForm.payment_mode} onChange={e => setPayForm(p => ({ ...p, payment_mode: e.target.value }))} style={inputStyle}>
                {MODES.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <LabelInput label="Remarks (optional)" value={payForm.remarks} onChange={v => setPayForm(p => ({ ...p, remarks: v }))} placeholder="Note..." />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <Btn onClick={addPayment} label="Record Payment" />
            <Btn onClick={() => setShowPayForm(false)} label="Cancel" secondary />
          </div>
        </FormCard>
      )}

      {loading && <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Loading...</div>}

      {/* Fees Tab */}
      {!loading && (tab === "fees" || role === "student" || role === "parent") && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {fees.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", background: "#f8fafc", borderRadius: "12px" }}>Koi fee record nahi mila</div>}
          {fees.map(f => {
            const paid = paidFor(f.id);
            const due = Number(f.amount) - paid;
            const pct = Math.min(100, (paid / Number(f.amount)) * 100);
            const over = isOverdue(f);
            const feePayments = payments.filter(p => p.fee_id === f.id);
            return (
              <div key={f.id} style={{ background: "white", border: `1px solid ${over && due > 0 ? "#fca5a5" : "#e2e8f0"}`, borderRadius: "12px", padding: "18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: "16px", color: "#1e293b" }}>{f.title}</span>
                      <span style={{ ...badge, background: catColor(f.category).bg, color: catColor(f.category).text }}>{f.category}</span>
                      {over && due > 0 && <span style={{ ...badge, background: "#fef2f2", color: "#dc2626" }}>⚠ Overdue</span>}
                    </div>
                    {f.students?.name && <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>👤 {f.students.name}</div>}
                    <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>📅 Due: {new Date(f.due_date).toLocaleDateString("en-IN")}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: "#1e40af" }}>₹{Number(f.amount).toLocaleString("en-IN")}</div>
                    <div style={{ fontSize: "13px", color: due > 0 ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
                      {due > 0 ? `₹${due.toLocaleString("en-IN")} due` : "✅ Paid"}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: "14px", background: "#f1f5f9", borderRadius: "99px", height: "8px", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, background: pct === 100 ? "#16a34a" : "#3b82f6", height: "100%", borderRadius: "99px", transition: "width .4s" }} />
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>Paid: ₹{paid.toLocaleString("en-IN")} / ₹{Number(f.amount).toLocaleString("en-IN")}</div>

                {/* Payment history */}
                {feePayments.length > 0 && (
                  <div style={{ marginTop: "14px", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "8px" }}>PAYMENT HISTORY</div>
                    {feePayments.map(p => (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#f8fafc", borderRadius: "6px", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                        <div style={{ fontSize: "13px" }}>
                          <span style={{ fontWeight: 600, color: "#16a34a" }}>₹{Number(p.paid_amount).toLocaleString("en-IN")}</span>
                          <span style={{ color: "#6b7280", marginLeft: "8px" }}>{p.payment_mode} • {p.payment_date}</span>
                          {p.remarks && <span style={{ color: "#9ca3af", marginLeft: "8px" }}>"{p.remarks}"</span>}
                        </div>
                        <button onClick={() => printReceipt(p, f)} style={{ fontSize: "12px", background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", padding: "3px 10px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>🖨 Receipt</button>
                      </div>
                    ))}
                  </div>
                )}

                {role === "admin" && (
                  <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                    <button onClick={() => { setActiveFee(f); setPayForm(p => ({ ...p, fee_id: f.id, paid_amount: String(due) })); setShowPayForm(true); setShowFeeForm(false); }} style={{ fontSize: "12px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #86efac", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>+ Record Payment</button>
                    <button onClick={() => deleteFee(f.id)} style={{ fontSize: "12px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>🗑 Delete</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Payments Tab (Admin) */}
      {!loading && tab === "payments" && (role === "admin" || role === "teacher") && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            {payments.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", background: "#f8fafc", borderRadius: "12px", gridColumn: "1/-1" }}>Koi payment record nahi</div>}
            {payments.map(p => {
              const f = fees.find(f => f.id === p.fee_id);
              return (
                <div key={p.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 700, color: "#16a34a", fontSize: "18px" }}>₹{Number(p.paid_amount).toLocaleString("en-IN")}</span>
                    <span style={{ ...badge, background: "#eff6ff", color: "#1e40af" }}>{p.payment_mode}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151", fontWeight: 600 }}>{f?.title || "—"}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>📅 {p.payment_date}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>#{p.receipt_no}</div>
                  <button onClick={() => printReceipt(p, f)} style={{ marginTop: "10px", width: "100%", fontSize: "12px", background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", padding: "5px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>🖨 Print Receipt</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──

function Card({ label, value, color, icon }) {
  return (
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: "22px", marginBottom: "6px" }}>{icon}</div>
      <div style={{ fontSize: "22px", fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500, marginTop: "2px" }}>{label}</div>
    </div>
  );
}

function FormCard({ title, children, onClose }) {
  return (
    <div style={{ background: "white", border: "1px solid #dbeafe", borderRadius: "14px", padding: "20px", marginBottom: "20px", boxShadow: "0 4px 20px rgba(30,64,175,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0, color: "#1e40af", fontSize: "16px", fontWeight: 700 }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94a3b8" }}>✕</button>
      </div>
      {children}
    </div>
  );
}

function LabelInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

function Btn({ onClick, label, secondary }) {
  return (
    <button onClick={onClick} style={{ padding: "9px 18px", borderRadius: "8px", border: secondary ? "1px solid #cbd5e1" : "none", background: secondary ? "white" : "#1e40af", color: secondary ? "#475569" : "white", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
      {label}
    </button>
  );
}

function catColor(c) {
  const m = { tuition: { bg: "#eff6ff", text: "#1e40af" }, transport: { bg: "#fef3c7", text: "#92400e" }, exam: { bg: "#f3e8ff", text: "#6b21a8" }, misc: { bg: "#f1f5f9", text: "#475569" } };
  return m[c] || m.misc;
}

const labelStyle = { display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" };
const inputStyle = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", color: "#1e293b" };
const selectStyle = { padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", color: "#374151", background: "white", cursor: "pointer" };
const formGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" };
const badge = { fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "99px" };
