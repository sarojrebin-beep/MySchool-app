import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://jugdyjvxskqglatljvtn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2R5anZ4c2txZ2xhdGxqdnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQzODYsImV4cCI6MjA5MzcxMDM4Nn0.cfFbH5lKAsbjHAgH51vbA6_1AYfBtbJefLeFgyHfHTQ"
);

const CATS = ["general", "science", "maths", "history", "literature", "fiction", "reference", "other"];
const DUE_DAYS = 7;

export default function LibraryModule({ user, profile, schoolId }) {
  const role = profile?.role;
  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";
  const canManage = isAdmin || isTeacher;

  const [tab, setTab] = useState(canManage ? "books" : "browse");
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const [showBookForm, setShowBookForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [selBook, setSelBook] = useState(null);
  const [bookForm, setBookForm] = useState({ title: "", author: "", category: "general", isbn: "", total_copies: "1" });
  const [issueForm, setIssueForm] = useState({ book_id: "", student_id: "" });
  const [editBook, setEditBook] = useState(null);

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  useEffect(() => { init(); }, [tab]);

  async function init() {
    setLoading(true);
    await loadBooks();
    if (canManage) {
      const { data: st } = await sb.from("students").select("id,name").eq("school_id", schoolId);
      setStudents(st || []);
    }
    if (tab === "issues") await loadIssues();
    if (tab === "mybooks") await loadMyIssues();
    setLoading(false);
  }

  async function loadBooks() {
    const { data } = await sb.from("books").select("*").eq("school_id", schoolId).order("title");
    setBooks(data || []);
  }

  async function loadIssues() {
    const { data } = await sb.from("book_issues")
      .select("*, books(title,author), students(name)")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false });
    // auto-mark overdue
    const updated = (data || []).map(i => ({
      ...i,
      status: i.return_date ? "returned" : new Date(i.due_date) < new Date() ? "overdue" : "issued"
    }));
    setIssues(updated);
  }

  async function loadMyIssues() {
    const { data: st } = await sb.from("students").select("id").eq("user_id", user.id).single();
    if (!st) return;
    const { data } = await sb.from("book_issues")
      .select("*, books(title,author,category)")
      .eq("student_id", st.id)
      .order("created_at", { ascending: false });
    setIssues(data || []);
  }

  async function addBook() {
    if (!bookForm.title) return notify("Title zaroori hai");
    const copies = Number(bookForm.total_copies) || 1;
    const { error } = await sb.from("books").insert({
      ...bookForm, total_copies: copies, available_copies: copies,
      school_id: schoolId, added_by: user.id
    });
    if (error) return notify("Error: " + error.message);
    notify("Book add ho gayi!");
    setBookForm({ title: "", author: "", category: "general", isbn: "", total_copies: "1" });
    setShowBookForm(false);
    loadBooks();
  }

  async function updateBook() {
    const { error } = await sb.from("books").update({
      title: editBook.title, author: editBook.author,
      category: editBook.category, isbn: editBook.isbn,
      total_copies: Number(editBook.total_copies)
    }).eq("id", editBook.id);
    if (error) return notify("Error: " + error.message);
    notify("Book updated!");
    setEditBook(null);
    loadBooks();
  }

  async function deleteBook(id) {
    const active = issues.filter(i => i.book_id === id && i.status !== "returned");
    if (active.length) return notify("Pehle sabki books return karwao");
    if (!confirm("Book delete karo?")) return;
    await sb.from("book_issues").delete().eq("book_id", id);
    await sb.from("books").delete().eq("id", id);
    loadBooks();
  }

  async function issueBook() {
    if (!issueForm.book_id || !issueForm.student_id) return notify("Book aur student select karo");
    const book = books.find(b => b.id === issueForm.book_id);
    if (!book || book.available_copies < 1) return notify("Book available nahi hai");
    const due = new Date();
    due.setDate(due.getDate() + DUE_DAYS);
    const { error } = await sb.from("book_issues").insert({
      school_id: schoolId,
      book_id: issueForm.book_id,
      student_id: issueForm.student_id,
      issued_by: user.id,
      issue_date: new Date().toISOString().split("T")[0],
      due_date: due.toISOString().split("T")[0],
      status: "issued"
    });
    if (error) return notify("Error: " + error.message);
    await sb.from("books").update({ available_copies: book.available_copies - 1 }).eq("id", book.id);
    notify("Book issue ho gayi!");
    setIssueForm({ book_id: "", student_id: "" });
    setShowIssueForm(false);
    loadBooks();
    if (tab === "issues") loadIssues();
  }

  async function returnBook(issue) {
    if (!confirm("Return confirm karo?")) return;
    const { error } = await sb.from("book_issues").update({
      return_date: new Date().toISOString().split("T")[0],
      status: "returned"
    }).eq("id", issue.id);
    if (error) return notify("Error: " + error.message);
    const book = books.find(b => b.id === issue.book_id);
    if (book) await sb.from("books").update({ available_copies: book.available_copies + 1 }).eq("id", book.id);
    notify("Book return ho gayi!");
    loadBooks();
    loadIssues();
  }

  const filtered = books.filter(b => {
    const q = search.toLowerCase();
    const matchQ = !q || b.title.toLowerCase().includes(q) || (b.author || "").toLowerCase().includes(q);
    const matchC = !catFilter || b.category === catFilter;
    return matchQ && matchC;
  });

  const overdueCount = issues.filter(i => i.status === "overdue").length;
  const issuedCount = issues.filter(i => i.status === "issued" || i.status === "overdue").length;

  return (
    <div style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto", fontFamily: "'Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", color: "#1a56db", fontWeight: 700 }}>📚 Library</h2>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "14px" }}>Books management & issue tracking</p>
        </div>
        {canManage && (
          <div style={{ display: "flex", gap: "10px" }}>
            <Btn label="+ Add Book" onClick={() => { setShowBookForm(true); setShowIssueForm(false); }} />
            <Btn label="📤 Issue Book" onClick={() => { setShowIssueForm(true); setShowBookForm(false); }} secondary />
          </div>
        )}
      </div>

      {msg && <Alert msg={msg} />}

      {/* Summary cards - admin only */}
      {canManage && tab === "issues" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "14px", marginBottom: "20px" }}>
          <StatCard icon="📚" label="Total Books" value={books.length} color="#1a56db" />
          <StatCard icon="📤" label="Currently Issued" value={issuedCount} color="#d97706" />
          <StatCard icon="⚠️" label="Overdue" value={overdueCount} color="#dc2626" />
          <StatCard icon="✅" label="Available" value={books.reduce((s, b) => s + b.available_copies, 0)} color="#059669" />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#f1f5f9", padding: "4px", borderRadius: "10px", width: "fit-content", flexWrap: "wrap" }}>
        {canManage
          ? [["books","📋 Books"], ["issues","📤 Issues"]].map(([t,l]) => <TabBtn key={t} t={t} tab={tab} setTab={setTab} label={l} />)
          : [["browse","📋 Browse Books"], ["mybooks","📖 My Books"]].map(([t,l]) => <TabBtn key={t} t={t} tab={tab} setTab={setTab} label={l} />)
        }
      </div>

      {/* Add Book Form */}
      {showBookForm && canManage && (
        <FormCard title="Add New Book" onClose={() => setShowBookForm(false)}>
          <div style={fGrid}>
            <FInput label="Title *" value={bookForm.title} onChange={v => setBookForm(p => ({ ...p, title: v }))} placeholder="Book title" />
            <FInput label="Author" value={bookForm.author} onChange={v => setBookForm(p => ({ ...p, author: v }))} placeholder="Author name" />
            <div>
              <label style={lbl}>Category</label>
              <select value={bookForm.category} onChange={e => setBookForm(p => ({ ...p, category: e.target.value }))} style={inp}>
                {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <FInput label="ISBN" value={bookForm.isbn} onChange={v => setBookForm(p => ({ ...p, isbn: v }))} placeholder="Optional" />
            <FInput label="Total Copies" type="number" value={bookForm.total_copies} onChange={v => setBookForm(p => ({ ...p, total_copies: v }))} placeholder="1" />
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <Btn label="Add Book" onClick={addBook} />
            <Btn label="Cancel" onClick={() => setShowBookForm(false)} secondary />
          </div>
        </FormCard>
      )}

      {/* Issue Book Form */}
      {showIssueForm && canManage && (
        <FormCard title="Issue Book to Student" onClose={() => setShowIssueForm(false)}>
          <div style={fGrid}>
            <div>
              <label style={lbl}>Book</label>
              <select value={issueForm.book_id} onChange={e => setIssueForm(p => ({ ...p, book_id: e.target.value }))} style={inp}>
                <option value="">-- Select Book --</option>
                {books.filter(b => b.available_copies > 0).map(b => (
                  <option key={b.id} value={b.id}>{b.title} ({b.available_copies} available)</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Student</label>
              <select value={issueForm.student_id} onChange={e => setIssueForm(p => ({ ...p, student_id: e.target.value }))} style={inp}>
                <option value="">-- Select Student --</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "12px" }}>📅 Due date: {(() => { const d = new Date(); d.setDate(d.getDate() + DUE_DAYS); return d.toLocaleDateString("en-IN"); })()} ({DUE_DAYS} days)</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <Btn label="Issue Book" onClick={issueBook} />
            <Btn label="Cancel" onClick={() => setShowIssueForm(false)} secondary />
          </div>
        </FormCard>
      )}

      {/* Edit Book Modal */}
      {editBook && (
        <FormCard title="Edit Book" onClose={() => setEditBook(null)}>
          <div style={fGrid}>
            <FInput label="Title" value={editBook.title} onChange={v => setEditBook(p => ({ ...p, title: v }))} />
            <FInput label="Author" value={editBook.author || ""} onChange={v => setEditBook(p => ({ ...p, author: v }))} />
            <div>
              <label style={lbl}>Category</label>
              <select value={editBook.category} onChange={e => setEditBook(p => ({ ...p, category: e.target.value }))} style={inp}>
                {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <FInput label="ISBN" value={editBook.isbn || ""} onChange={v => setEditBook(p => ({ ...p, isbn: v }))} />
            <FInput label="Total Copies" type="number" value={String(editBook.total_copies)} onChange={v => setEditBook(p => ({ ...p, total_copies: v }))} />
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <Btn label="Save Changes" onClick={updateBook} />
            <Btn label="Cancel" onClick={() => setEditBook(null)} secondary />
          </div>
        </FormCard>
      )}

      {loading && <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Loading...</div>}

      {/* ── BOOKS / BROWSE TAB ── */}
      {!loading && (tab === "books" || tab === "browse") && (
        <div>
          {/* Search + filter */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search by title or author..."
              style={{ ...inp, maxWidth: "320px", flex: 1 }}
            />
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ ...inp, maxWidth: "180px" }}>
              <option value="">All Categories</option>
              {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>

          {filtered.length === 0 && <Empty text="Koi book nahi mili." />}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "14px" }}>
            {filtered.map(book => (
              <div key={book.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "18px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Book icon + title */}
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "44px", height: "56px", background: catBg(book.category), borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                    📖
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b", lineHeight: 1.3 }}>{book.title}</div>
                    {book.author && <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>by {book.author}</div>}
                    {book.isbn && <div style={{ fontSize: "11px", color: "#9ca3af" }}>ISBN: {book.isbn}</div>}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={catBadge(book.category)}>{book.category}</span>
                  <div style={{ fontSize: "13px" }}>
                    <span style={{ color: book.available_copies > 0 ? "#059669" : "#dc2626", fontWeight: 700 }}>
                      {book.available_copies > 0 ? `✅ ${book.available_copies} available` : "❌ Not available"}
                    </span>
                    <span style={{ color: "#9ca3af", marginLeft: "6px" }}>/ {book.total_copies}</span>
                  </div>
                </div>

                {canManage && (
                  <div style={{ display: "flex", gap: "8px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                    <button onClick={() => { setIssueForm(p => ({ ...p, book_id: book.id })); setShowIssueForm(true); }} disabled={book.available_copies === 0}
                      style={{ flex: 1, fontSize: "12px", background: book.available_copies > 0 ? "#eff6ff" : "#f1f5f9", color: book.available_copies > 0 ? "#1a56db" : "#9ca3af", border: `1px solid ${book.available_copies > 0 ? "#bfdbfe" : "#e2e8f0"}`, padding: "5px", borderRadius: "7px", cursor: book.available_copies > 0 ? "pointer" : "not-allowed", fontWeight: 600 }}>
                      📤 Issue
                    </button>
                    <button onClick={() => setEditBook({ ...book })} style={smBtn("#fef3c7","#92400e","#fde68a")}>✏️</button>
                    {isAdmin && <button onClick={() => deleteBook(book.id)} style={smBtn("#fef2f2","#dc2626","#fca5a5")}>🗑</button>}
                  </div>
                )}

                {/* Student view: show availability only */}
                {!canManage && (
                  <div style={{ fontSize: "13px", color: "#6b7280", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                    {book.available_copies > 0 ? "Available — Ask teacher/admin to issue" : "All copies currently issued"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ISSUES TAB (Admin/Teacher) ── */}
      {!loading && tab === "issues" && canManage && (
        <div>
          {/* Filter by status */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            {[["", "All"], ["issued", "Active"], ["overdue", "Overdue"], ["returned", "Returned"]].map(([v, l]) => (
              <button key={v} onClick={() => setCatFilter(v)}
                style={{ padding: "5px 14px", borderRadius: "20px", border: "1px solid #e2e8f0", background: catFilter === v ? "#1a56db" : "white", color: catFilter === v ? "white" : "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                {l}
              </button>
            ))}
          </div>

          {issues.length === 0 && <Empty text="Koi issue record nahi." />}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {issues
              .filter(i => !catFilter || i.status === catFilter)
              .map(issue => {
                const overdue = issue.status === "overdue";
                const returned = issue.status === "returned";
                const daysLeft = Math.ceil((new Date(issue.due_date) - new Date()) / 86400000);
                return (
                  <div key={issue.id} style={{ background: "white", border: `1px solid ${overdue ? "#fca5a5" : "#e2e8f0"}`, borderRadius: "12px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>{issue.books?.title || "—"}</div>
                      <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "3px" }}>
                        👤 {issue.students?.name} &nbsp;•&nbsp; 📅 Issued: {issue.issue_date} &nbsp;•&nbsp; Due: {issue.due_date}
                      </div>
                      {issue.return_date && <div style={{ fontSize: "12px", color: "#059669", marginTop: "2px" }}>✅ Returned: {issue.return_date}</div>}
                      {overdue && <div style={{ fontSize: "12px", color: "#dc2626", marginTop: "2px" }}>⚠️ Overdue by {Math.abs(daysLeft)} days</div>}
                      {!returned && !overdue && <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{daysLeft} days remaining</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ ...statusBadge(issue.status) }}>{issue.status}</span>
                      {!returned && (
                        <button onClick={() => returnBook(issue)} style={smBtn("#f0fdf4","#059669","#86efac")}>↩ Return</button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── MY BOOKS TAB (Student) ── */}
      {!loading && tab === "mybooks" && (
        <div>
          {issues.length === 0 && <Empty text="Tumhare paas koi book issue nahi hai." />}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {issues.map(issue => {
              const overdue = !issue.return_date && new Date(issue.due_date) < new Date();
              const returned = !!issue.return_date;
              const daysLeft = Math.ceil((new Date(issue.due_date) - new Date()) / 86400000);
              return (
                <div key={issue.id} style={{ background: "white", border: `1px solid ${overdue ? "#fca5a5" : "#e2e8f0"}`, borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "16px", color: "#1e293b" }}>{issue.books?.title || "—"}</div>
                      {issue.books?.author && <div style={{ fontSize: "13px", color: "#6b7280" }}>by {issue.books.author}</div>}
                      <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "6px" }}>
                        📅 Issued: {issue.issue_date} &nbsp;•&nbsp; Due: {issue.due_date}
                      </div>
                    </div>
                    <span style={statusBadge(returned ? "returned" : overdue ? "overdue" : "issued")}>
                      {returned ? "Returned" : overdue ? "Overdue" : "Issued"}
                    </span>
                  </div>
                  {!returned && (
                    <div style={{ marginTop: "12px", background: overdue ? "#fef2f2" : daysLeft <= 2 ? "#fffbeb" : "#f0fdf4", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: overdue ? "#dc2626" : daysLeft <= 2 ? "#92400e" : "#059669", fontWeight: 600 }}>
                      {overdue ? `⚠️ ${Math.abs(daysLeft)} din overdue — Jaldi return karo!` : daysLeft === 0 ? "⚠️ Aaj last day hai!" : `📆 ${daysLeft} din baaki hain return karne ke liye`}
                    </div>
                  )}
                  {returned && <div style={{ marginTop: "8px", fontSize: "13px", color: "#059669" }}>✅ Returned on {issue.return_date}</div>}
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

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: "22px", marginBottom: "6px" }}>{icon}</div>
      <div style={{ fontSize: "24px", fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{label}</div>
    </div>
  );
}

function TabBtn({ t, tab, setTab, label }) {
  return (
    <button onClick={() => setTab(t)} style={{ padding: "7px 18px", borderRadius: "7px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px", background: tab === t ? "#1a56db" : "transparent", color: tab === t ? "white" : "#64748b", transition: "all .2s" }}>
      {label}
    </button>
  );
}

function FormCard({ title, children, onClose }) {
  return (
    <div style={{ background: "white", border: "1px solid #dbeafe", borderRadius: "14px", padding: "20px", marginBottom: "20px", boxShadow: "0 4px 20px rgba(26,86,219,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <h3 style={{ margin: 0, color: "#1a56db", fontSize: "16px", fontWeight: 700 }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94a3b8" }}>✕</button>
      </div>
      {children}
    </div>
  );
}

function Btn({ label, onClick, secondary }) {
  return (
    <button onClick={onClick} style={{ padding: "9px 18px", borderRadius: "8px", border: secondary ? "1px solid #cbd5e1" : "none", background: secondary ? "white" : "#1a56db", color: secondary ? "#475569" : "white", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
      {label}
    </button>
  );
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

function Empty({ text }) {
  return <div style={{ textAlign: "center", padding: "48px", color: "#9ca3af", background: "#f8fafc", borderRadius: "12px", fontSize: "14px" }}>{text}</div>;
}

function smBtn(bg, color, border) {
  return { fontSize: "12px", background: bg, color, border: `1px solid ${border}`, padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 };
}

function statusBadge(status) {
  const m = {
    issued: { background: "#eff6ff", color: "#1a56db", border: "1px solid #bfdbfe" },
    overdue: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5" },
    returned: { background: "#f0fdf4", color: "#059669", border: "1px solid #86efac" },
  };
  return { ...m[status] || m.issued, fontSize: "12px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" };
}

function catBg(cat) {
  const m = { science: "#e0f2fe", maths: "#eff6ff", history: "#fef3c7", literature: "#fdf4ff", fiction: "#f0fdf4", reference: "#f1f5f9", general: "#f8fafc", other: "#f8fafc" };
  return m[cat] || "#f8fafc";
}

function catBadge(cat) {
  const colors = { science: ["#e0f2fe","#0369a1"], maths: ["#eff6ff","#1a56db"], history: ["#fef3c7","#92400e"], literature: ["#fdf4ff","#7e22ce"], fiction: ["#f0fdf4","#059669"], reference: ["#f1f5f9","#475569"], general: ["#f8fafc","#64748b"], other: ["#f1f5f9","#64748b"] };
  const [bg, color] = colors[cat] || colors.general;
  return { background: bg, color, fontSize: "11px", fontWeight: 600, padding: "2px 9px", borderRadius: "20px" };
}

const lbl = { display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" };
const inp = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", color: "#1e293b", background: "#fafafa" };
const fGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "14px" };
