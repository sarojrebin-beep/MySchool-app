import { useState, useEffect, createContext, useContext } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Supabase Client ───────────────────────────────────────────────────────────
const supabase = createClient(
  "https://jugdyjvxskqglatljvtn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2R5anZ4c2txZ2xhdGxqdnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQzODYsImV4cCI6MjA5MzcxMDM4Nn0.cfFbH5lKAsbjHAgH51vbA6_1AYfBtbJefLeFgyHfHTQ"
);

// ─── Auth Context ──────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

// ─── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const icons = {
  school: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  dashboard: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  quiz: "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  notes: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  homework: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
  attendance: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
  fees: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  timetable: "M8 2v4 M16 2v4 M3 10h18 M21 8H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1z",
  notice: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  results: "M22 12h-4l-3 9L9 3l-3 9H2",
  library: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  meeting: "M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.888L15 14 M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  plus: "M12 5v14 M5 12h14",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18 M6 6l12 12",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  eyeOff: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94 M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19 M1 1l22 22",
  menu: "M3 12h18 M3 6h18 M3 18h18",
  close: "M18 6L6 18 M6 6l12 12",
  chevronDown: "M6 9l6 6 6-6",
  settings: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M4.93 19.07l1.41-1.41 M17.66 6.34l1.41-1.41",
  parent: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  child: "M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z M12 14c-7 0-9 3-9 5v1h18v-1c0-2-2-5-9-5z",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: "M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6",
  approve: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3",
};

// ─── CSS Styles ─────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --primary: #1a56db;
    --primary-dark: #1342b0;
    --primary-light: #e8f0fe;
    --secondary: #0ea5e9;
    --accent: #f59e0b;
    --success: #10b981;
    --danger: #ef4444;
    --warning: #f59e0b;
    --bg: #f0f4f8;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #0f172a;
    --text-2: #475569;
    --text-3: #94a3b8;
    --sidebar-bg: #0f172a;
    --sidebar-text: #cbd5e1;
    --sidebar-active: #1a56db;
    --shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);
    --shadow-lg: 0 10px 40px rgba(0,0,0,0.12);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  h1,h2,h3,h4,h5 { font-family: 'Plus Jakarta Sans', sans-serif; }

  /* ── Login Page ── */
  .login-page {
    min-height: 100vh;
    display: flex;
    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1a56db 100%);
    position: relative;
    overflow: hidden;
  }

  .login-page::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(26,86,219,0.3) 0%, transparent 70%);
    top: -200px; right: -200px;
    border-radius: 50%;
  }

  .login-page::after {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%);
    bottom: -100px; left: -100px;
    border-radius: 50%;
  }

  .login-left {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px;
    position: relative;
    z-index: 1;
  }

  .login-brand {
    text-align: center;
    color: white;
  }

  .login-brand-icon {
    width: 80px; height: 80px;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
  }

  .login-brand h1 {
    font-size: 42px;
    font-weight: 800;
    letter-spacing: -1px;
    margin-bottom: 12px;
  }

  .login-brand p {
    font-size: 16px;
    color: rgba(255,255,255,0.6);
    max-width: 300px;
    line-height: 1.6;
    margin: 0 auto;
  }

  .login-features {
    margin-top: 48px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    text-align: left;
  }

  .login-feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    color: rgba(255,255,255,0.8);
    font-size: 14px;
  }

  .login-feature-dot {
    width: 8px; height: 8px;
    background: var(--secondary);
    border-radius: 50%;
    flex-shrink: 0;
  }

  .login-right {
    width: 480px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    position: relative;
    z-index: 1;
  }

  .login-card {
    background: white;
    border-radius: 24px;
    padding: 48px;
    width: 100%;
    box-shadow: 0 25px 60px rgba(0,0,0,0.3);
  }

  .login-card h2 {
    font-size: 28px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 8px;
  }

  .login-card p {
    color: var(--text-2);
    font-size: 15px;
    margin-bottom: 32px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 8px;
    letter-spacing: 0.3px;
  }

  .input-wrap {
    position: relative;
  }

  .input-wrap input {
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid var(--border);
    border-radius: 12px;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
    transition: all 0.2s;
    background: #fafafa;
    outline: none;
  }

  .input-wrap input:focus {
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(26,86,219,0.1);
  }

  .input-wrap .eye-btn {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-3);
    padding: 4px;
  }

  .btn-primary {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 8px;
    letter-spacing: 0.3px;
  }

  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(26,86,219,0.35); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .login-divider {
    text-align: center;
    margin: 24px 0;
    position: relative;
    color: var(--text-3);
    font-size: 13px;
  }

  .login-divider::before, .login-divider::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background: var(--border);
  }

  .login-divider::before { left: 0; }
  .login-divider::after { right: 0; }

  .role-tabs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 28px;
  }

  .role-tab {
    padding: 10px 6px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    background: white;
    cursor: pointer;
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-2);
    transition: all 0.2s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .role-tab.active {
    border-color: var(--primary);
    background: var(--primary-light);
    color: var(--primary);
  }

  .alert {
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 13px;
    margin-bottom: 16px;
    font-weight: 500;
  }

  .alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .alert-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }

  /* ── App Layout ── */
  .app-layout {
    display: flex;
    min-height: 100vh;
  }

  /* ── Sidebar ── */
  .sidebar {
    width: 260px;
    background: var(--sidebar-bg);
    height: 100vh;
    position: fixed;
    left: 0; top: 0;
    display: flex;
    flex-direction: column;
    z-index: 100;
    transition: transform 0.3s;
  }

  .sidebar-header {
    padding: 24px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sidebar-logo-icon {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar-logo-text h3 {
    color: white;
    font-size: 16px;
    font-weight: 700;
  }

  .sidebar-logo-text span {
    color: var(--sidebar-text);
    font-size: 11px;
    opacity: 0.6;
  }

  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 12px 0;
  }

  .sidebar-section-title {
    padding: 12px 20px 6px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: rgba(255,255,255,0.25);
  }

  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 20px;
    color: var(--sidebar-text);
    cursor: pointer;
    transition: all 0.15s;
    border-radius: 0;
    margin: 1px 10px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
  }

  .sidebar-item:hover {
    background: rgba(255,255,255,0.06);
    color: white;
  }

  .sidebar-item.active {
    background: var(--primary);
    color: white;
  }

  .sidebar-item.active svg { color: white; }

  .sidebar-footer {
    padding: 16px 10px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  .sidebar-user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
  }

  .sidebar-user:hover { background: rgba(255,255,255,0.06); }

  .sidebar-avatar {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }

  .sidebar-user-info h4 {
    color: white;
    font-size: 13px;
    font-weight: 600;
  }

  .sidebar-user-info span {
    color: var(--sidebar-text);
    font-size: 11px;
    text-transform: capitalize;
    opacity: 0.6;
  }

  /* ── Main Content ── */
  .main-content {
    margin-left: 260px;
    flex: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Top Navbar ── */
  .topbar {
    background: white;
    height: 64px;
    padding: 0 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .topbar-left h2 {
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
  }

  .topbar-left p {
    font-size: 12px;
    color: var(--text-3);
    margin-top: 1px;
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .topbar-btn {
    width: 38px; height: 38px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-2);
    transition: all 0.15s;
    position: relative;
  }

  .topbar-btn:hover { background: var(--primary-light); color: var(--primary); }

  .notif-badge {
    position: absolute;
    top: 6px; right: 6px;
    width: 8px; height: 8px;
    background: var(--danger);
    border-radius: 50%;
    border: 2px solid white;
  }

  .topbar-profile {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px 6px 6px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .topbar-profile:hover { background: var(--primary-light); border-color: var(--primary); }

  .topbar-avatar {
    width: 30px; height: 30px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: white;
  }

  .topbar-profile-info h4 {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
  }

  .topbar-profile-info span {
    font-size: 11px;
    color: var(--text-3);
    text-transform: capitalize;
  }

  /* ── Page Content ── */
  .page-content {
    padding: 28px;
    flex: 1;
  }

  /* ── Stats Cards ── */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 28px;
  }

  .stat-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--shadow);
    border: 1px solid var(--border);
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }

  .stat-card::after {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 80px; height: 80px;
    border-radius: 0 16px 0 80px;
    opacity: 0.08;
  }

  .stat-card.blue::after { background: var(--primary); }
  .stat-card.green::after { background: var(--success); }
  .stat-card.orange::after { background: var(--accent); }
  .stat-card.sky::after { background: var(--secondary); }

  .stat-icon {
    width: 48px; height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .stat-icon.blue { background: var(--primary-light); color: var(--primary); }
  .stat-icon.green { background: #d1fae5; color: var(--success); }
  .stat-icon.orange { background: #fef3c7; color: var(--accent); }
  .stat-icon.sky { background: #e0f2fe; color: var(--secondary); }

  .stat-value {
    font-size: 32px;
    font-weight: 800;
    color: var(--text);
    font-family: 'Plus Jakarta Sans', sans-serif;
    line-height: 1;
    margin-bottom: 6px;
  }

  .stat-label {
    font-size: 13px;
    color: var(--text-2);
    font-weight: 500;
  }

  .stat-change {
    font-size: 12px;
    margin-top: 8px;
    font-weight: 600;
  }

  .stat-change.up { color: var(--success); }
  .stat-change.neutral { color: var(--text-3); }

  /* ── Cards ── */
  .card {
    background: white;
    border-radius: 16px;
    box-shadow: var(--shadow);
    border: 1px solid var(--border);
    overflow: hidden;
  }

  .card-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-header h3 {
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }

  .card-body { padding: 24px; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }

  /* ── Table ── */
  .table-wrap { overflow-x: auto; }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  thead th {
    padding: 12px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--text-3);
    background: var(--bg);
    border-bottom: 1px solid var(--border);
  }

  tbody tr {
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
  }

  tbody tr:hover { background: #fafafa; }
  tbody tr:last-child { border-bottom: none; }

  tbody td {
    padding: 14px 16px;
    color: var(--text);
    vertical-align: middle;
  }

  /* ── Badges ── */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
  }

  .badge-blue { background: var(--primary-light); color: var(--primary); }
  .badge-green { background: #d1fae5; color: #059669; }
  .badge-orange { background: #fef3c7; color: #d97706; }
  .badge-red { background: #fef2f2; color: #dc2626; }
  .badge-gray { background: #f1f5f9; color: var(--text-2); }

  /* ── Buttons ── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .btn-sm { padding: 6px 12px; font-size: 12px; }
  .btn-blue { background: var(--primary); color: white; }
  .btn-blue:hover { background: var(--primary-dark); transform: translateY(-1px); }
  .btn-green { background: var(--success); color: white; }
  .btn-green:hover { background: #059669; }
  .btn-red { background: var(--danger); color: white; }
  .btn-red:hover { background: #dc2626; }
  .btn-outline { background: white; color: var(--text); border: 1.5px solid var(--border); }
  .btn-outline:hover { border-color: var(--primary); color: var(--primary); }
  .btn-ghost { background: transparent; color: var(--text-2); }
  .btn-ghost:hover { background: var(--bg); color: var(--text); }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .modal {
    background: white;
    border-radius: 20px;
    width: 100%;
    max-width: 520px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 60px rgba(0,0,0,0.3);
  }

  .modal-header {
    padding: 24px 28px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-header h3 { font-size: 18px; font-weight: 700; }

  .modal-body { padding: 24px 28px; }
  .modal-footer {
    padding: 16px 28px 24px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  /* ── Form ── */
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .form-field { margin-bottom: 16px; }

  .form-field label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 6px;
  }

  .form-field input, .form-field select, .form-field textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
    background: #fafafa;
    outline: none;
    transition: all 0.2s;
  }

  .form-field input:focus, .form-field select:focus, .form-field textarea:focus {
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(26,86,219,0.08);
  }

  /* ── Notice Card ── */
  .notice-item {
    padding: 16px;
    border-radius: 12px;
    border: 1px solid var(--border);
    margin-bottom: 12px;
    transition: all 0.15s;
  }

  .notice-item:hover { border-color: var(--primary); background: var(--primary-light); }

  .notice-item h4 { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .notice-item p { font-size: 13px; color: var(--text-2); line-height: 1.5; }
  .notice-meta { font-size: 11px; color: var(--text-3); margin-top: 8px; }

  /* ── Quick Actions ── */
  .quick-actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .quick-action {
    padding: 16px;
    border-radius: 12px;
    border: 1.5px solid var(--border);
    background: white;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
  }

  .quick-action:hover {
    border-color: var(--primary);
    background: var(--primary-light);
    transform: translateY(-2px);
  }

  .quick-action-icon {
    width: 40px; height: 40px;
    background: var(--primary-light);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px;
    color: var(--primary);
  }

  .quick-action span {
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
    display: block;
  }

  /* ── Welcome Card ── */
  .welcome-card {
    background: linear-gradient(135deg, var(--primary) 0%, #1342b0 100%);
    border-radius: 20px;
    padding: 32px;
    color: white;
    position: relative;
    overflow: hidden;
    margin-bottom: 24px;
  }

  .welcome-card::before {
    content: '';
    position: absolute;
    right: -40px; top: -40px;
    width: 200px; height: 200px;
    background: rgba(255,255,255,0.06);
    border-radius: 50%;
  }

  .welcome-card::after {
    content: '';
    position: absolute;
    right: 40px; bottom: -60px;
    width: 160px; height: 160px;
    background: rgba(255,255,255,0.04);
    border-radius: 50%;
  }

  .welcome-card h2 { font-size: 24px; font-weight: 800; margin-bottom: 6px; }
  .welcome-card p { font-size: 14px; opacity: 0.8; }

  .welcome-badges {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    flex-wrap: wrap;
  }

  .welcome-badge {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    backdrop-filter: blur(10px);
  }

  /* ── Loader ── */
  .loader {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    flex-direction: column;
    gap: 16px;
  }

  .spinner {
    width: 44px; height: 44px;
    border: 3px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Empty State ── */
  .empty-state {
    text-align: center;
    padding: 48px 24px;
    color: var(--text-3);
  }

  .empty-state p { font-size: 14px; margin-top: 12px; }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .grid-2, .grid-3 { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    .login-left { display: none; }
    .login-right { width: 100%; }
    .sidebar { transform: translateX(-260px); }
    .sidebar.open { transform: translateX(0); }
    .main-content { margin-left: 0; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .quick-actions { grid-template-columns: repeat(2, 1fr); }
  }
`;

// ─── Auth Provider ──────────────────────────────────────────────────────────────
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, schools(name)")
      .eq("id", userId)
      .single();

    if (!error && data) setProfile(data);
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refetchProfile: () => fetchProfile(user?.id) }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Login Page ─────────────────────────────────────────────────────────────────
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login"); // login | signup
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }

    if (data.user) {
      const { data: school } = await supabase.from("schools").select("id").limit(1).single();
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: name,
        email,
        role,
        school_id: school?.id,
        is_approved: role === "admin",
      });

      if (profileError) setError(profileError.message);
      else setError("Account created! Please wait for admin approval.");
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">
            <Icon path={icons.school} size={40} color="white" />
          </div>
          <h1>MySchool</h1>
          <p>Complete School Management Platform for the modern educational institution</p>
          <div className="login-features">
            {["Student & Teacher Portals", "Quiz & Assessments", "Attendance Tracking", "Fees Management", "Results & Report Cards", "Library Management"].map(f => (
              <div className="login-feature-item" key={f}>
                <div className="login-feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>{mode === "login" ? "Welcome back" : "Create account"}</h2>
          <p>{mode === "login" ? "Sign in to your school account" : "Register for MySchool"}</p>

          {error && <div className={`alert ${error.includes("created") ? "alert-success" : "alert-error"}`}>{error}</div>}

          {mode === "signup" && (
            <>
              <div className="role-tabs">
                {["student", "teacher", "parent", "admin"].map(r => (
                  <button key={r} className={`role-tab ${role === r ? "active" : ""}`} onClick={() => setRole(r)}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrap">
                  <input type="text" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} />
                </div>
              </div>
            </>
          )}

          <form onSubmit={mode === "login" ? handleLogin : handleSignup}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrap">
                <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrap">
                <input type={showPass ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                  <Icon path={showPass ? icons.eyeOff : icons.eye} size={16} />
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="login-divider">{mode === "login" ? "New to MySchool?" : "Already have an account?"}</div>
          <button
            className="btn-primary"
            style={{ background: "white", color: "var(--primary)", border: "1.5px solid var(--primary)", marginTop: 0 }}
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
          >
            {mode === "login" ? "Create New Account" : "Sign In Instead"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, role }) {
  const { profile, signOut } = useAuth();

  const navItems = {
    admin: [
      { section: "Overview", items: [{ id: "dashboard", label: "Dashboard", icon: icons.dashboard }] },
      { section: "Management", items: [
        { id: "students", label: "Students", icon: icons.users },
        { id: "teachers", label: "Teachers", icon: icons.user },
        { id: "classes", label: "Classes", icon: icons.school },
        { id: "parents", label: "Parents", icon: icons.parent },
      ]},
      { section: "Academic", items: [
        { id: "quiz", label: "Quiz / Tests", icon: icons.quiz },
        { id: "notes", label: "Study Material", icon: icons.notes },
        { id: "homework", label: "Homework", icon: icons.homework },
        { id: "attendance", label: "Attendance", icon: icons.attendance },
        { id: "timetable", label: "Timetable", icon: icons.timetable },
        { id: "results", label: "Results", icon: icons.results },
      ]},
      { section: "School", items: [
        { id: "fees", label: "Fees", icon: icons.fees },
        { id: "notices", label: "Notices", icon: icons.notice },
        { id: "library", label: "Library", icon: icons.library },
        { id: "meetings", label: "Meetings", icon: icons.meeting },
      ]},
    ],
    teacher: [
      { section: "Overview", items: [{ id: "dashboard", label: "Dashboard", icon: icons.dashboard }] },
      { section: "My Classes", items: [
        { id: "students", label: "My Students", icon: icons.users },
        { id: "attendance", label: "Attendance", icon: icons.attendance },
        { id: "timetable", label: "Timetable", icon: icons.timetable },
      ]},
      { section: "Academic", items: [
        { id: "quiz", label: "Quiz / Tests", icon: icons.quiz },
        { id: "notes", label: "Study Material", icon: icons.notes },
        { id: "homework", label: "Homework", icon: icons.homework },
        { id: "results", label: "Results", icon: icons.results },
      ]},
      { section: "School", items: [
        { id: "notices", label: "Notices", icon: icons.notice },
        { id: "meetings", label: "Meetings", icon: icons.meeting },
      ]},
    ],
    student: [
      { section: "Overview", items: [{ id: "dashboard", label: "Dashboard", icon: icons.dashboard }] },
      { section: "Learning", items: [
        { id: "quiz", label: "Quiz / Tests", icon: icons.quiz },
        { id: "notes", label: "Study Material", icon: icons.notes },
        { id: "homework", label: "Homework", icon: icons.homework },
        { id: "timetable", label: "Timetable", icon: icons.timetable },
        { id: "results", label: "My Results", icon: icons.results },
      ]},
      { section: "School", items: [
        { id: "attendance", label: "Attendance", icon: icons.attendance },
        { id: "fees", label: "My Fees", icon: icons.fees },
        { id: "notices", label: "Notices", icon: icons.notice },
        { id: "library", label: "Library", icon: icons.library },
        { id: "meetings", label: "Meetings", icon: icons.meeting },
      ]},
    ],
    parent: [
      { section: "Overview", items: [{ id: "dashboard", label: "Dashboard", icon: icons.dashboard }] },
      { section: "My Child", items: [
        { id: "attendance", label: "Attendance", icon: icons.attendance },
        { id: "results", label: "Results", icon: icons.results },
        { id: "homework", label: "Homework", icon: icons.homework },
        { id: "fees", label: "Fees", icon: icons.fees },
        { id: "timetable", label: "Timetable", icon: icons.timetable },
      ]},
      { section: "School", items: [
        { id: "notices", label: "Notices", icon: icons.notice },
        { id: "meetings", label: "Meetings", icon: icons.meeting },
      ]},
    ],
  };

  const items = navItems[role] || navItems.student;
  const initials = profile?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U";

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Icon path={icons.school} size={20} color="white" />
          </div>
          <div className="sidebar-logo-text">
            <h3>MySchool</h3>
            <span>Management System</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map(section => (
          <div key={section.section}>
            <div className="sidebar-section-title">{section.section}</div>
            {section.items.map(item => (
              <div
                key={item.id}
                className={`sidebar-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon path={item.icon} size={18} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={signOut} title="Click to logout">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <h4>{profile?.full_name || "User"}</h4>
            <span>{role} • Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Topbar ──────────────────────────────────────────────────────────────────────
function Topbar({ title, subtitle }) {
  const { profile } = useAuth();
  const initials = profile?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U";

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="topbar-right">
        <div className="topbar-btn">
          <Icon path={icons.bell} size={18} />
          <div className="notif-badge" />
        </div>
        <div className="topbar-profile">
          <div className="topbar-avatar">{initials}</div>
          <div className="topbar-profile-info">
            <h4>{profile?.full_name || "User"}</h4>
            <span>{profile?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Coming Soon ─────────────────────────────────────────────────────────────────
function ComingSoon({ title }) {
  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 80, height: 80, background: "var(--primary-light)", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon path={icons.settings} size={36} color="var(--primary)" />
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{title}</h3>
        <p style={{ color: "var(--text-2)", fontSize: 15 }}>This module is coming in the next phase</p>
        <div className="badge badge-blue">Phase 2+</div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ─────────────────────────────────────────────────────────────
function AdminDashboard({ setActiveTab }) {
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, pending: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [studentsRes, teachersRes, classesRes, pendingRes, usersRes, noticesRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact" }).eq("role", "student"),
      supabase.from("profiles").select("id", { count: "exact" }).eq("role", "teacher"),
      supabase.from("classes").select("id", { count: "exact" }),
      supabase.from("profiles").select("id", { count: "exact" }).eq("is_approved", false),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("notices").select("*").order("created_at", { ascending: false }).limit(3),
    ]);

    setStats({
      students: studentsRes.count || 0,
      teachers: teachersRes.count || 0,
      classes: classesRes.count || 0,
      pending: pendingRes.count || 0,
    });

    setRecentUsers(usersRes.data || []);
    setNotices(noticesRes.data || []);
    setLoading(false);
  };

  const roleColor = { admin: "badge-red", teacher: "badge-blue", student: "badge-green", parent: "badge-orange" };

  return (
    <div className="page-content">
      <div className="welcome-card">
        <h2>Good Morning, Admin! 👋</h2>
        <p>Here's what's happening at MySchool today</p>
        <div className="welcome-badges">
          <div className="welcome-badge">📅 {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
          {stats.pending > 0 && <div className="welcome-badge" style={{ background: "rgba(239,68,68,0.3)" }}>⚠️ {stats.pending} Pending Approvals</div>}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue" onClick={() => setActiveTab("students")} style={{ cursor: "pointer" }}>
          <div className="stat-icon blue"><Icon path={icons.users} size={22} /></div>
          <div className="stat-value">{stats.students}</div>
          <div className="stat-label">Total Students</div>
          <div className="stat-change neutral">Click to manage →</div>
        </div>
        <div className="stat-card green" onClick={() => setActiveTab("teachers")} style={{ cursor: "pointer" }}>
          <div className="stat-icon green"><Icon path={icons.user} size={22} /></div>
          <div className="stat-value">{stats.teachers}</div>
          <div className="stat-label">Total Teachers</div>
          <div className="stat-change neutral">Click to manage →</div>
        </div>
        <div className="stat-card orange" onClick={() => setActiveTab("classes")} style={{ cursor: "pointer" }}>
          <div className="stat-icon orange"><Icon path={icons.school} size={22} /></div>
          <div className="stat-value">{stats.classes}</div>
          <div className="stat-label">Total Classes</div>
          <div className="stat-change neutral">Click to manage →</div>
        </div>
        <div className="stat-card sky" style={{ cursor: "pointer" }}>
          <div className="stat-icon sky"><Icon path={icons.approve} size={22} /></div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending Approvals</div>
          <div className={`stat-change ${stats.pending > 0 ? "up" : "neutral"}`}>
            {stats.pending > 0 ? "Action needed" : "All clear ✓"}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              {[
                { label: "Add Student", icon: icons.users, tab: "students" },
                { label: "Add Teacher", icon: icons.user, tab: "teachers" },
                { label: "Add Class", icon: icons.school, tab: "classes" },
                { label: "New Notice", icon: icons.notice, tab: "notices" },
                { label: "Attendance", icon: icons.attendance, tab: "attendance" },
                { label: "Fee Entry", icon: icons.fees, tab: "fees" },
              ].map(a => (
                <div className="quick-action" key={a.label} onClick={() => setActiveTab(a.tab)}>
                  <div className="quick-action-icon"><Icon path={a.icon} size={18} /></div>
                  <span>{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Notices</h3>
            <button className="btn btn-sm btn-outline" onClick={() => setActiveTab("notices")}>View All</button>
          </div>
          <div className="card-body" style={{ padding: "16px 24px" }}>
            {notices.length === 0 ? (
              <div className="empty-state"><p>No notices yet</p></div>
            ) : (
              notices.map(n => (
                <div className="notice-item" key={n.id}>
                  <h4>{n.title}</h4>
                  <p>{n.content?.slice(0, 80)}...</p>
                  <div className="notice-meta">{new Date(n.created_at).toLocaleDateString("en-IN")}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Registrations</h3>
          <button className="btn btn-sm btn-blue" onClick={() => setActiveTab("students")}>Manage Users</button>
        </div>
        <div className="table-wrap">
          {recentUsers.length === 0 ? (
            <div className="empty-state"><p>No users registered yet</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.full_name}</strong></td>
                    <td style={{ color: "var(--text-2)" }}>{u.email}</td>
                    <td><span className={`badge ${roleColor[u.role] || "badge-gray"}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.is_approved ? "badge-green" : "badge-orange"}`}>{u.is_approved ? "Approved" : "Pending"}</span></td>
                    <td style={{ color: "var(--text-3)" }}>{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Students Manager ─────────────────────────────────────────────────────────────
function StudentsManager() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", class_id: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [sRes, cRes] = await Promise.all([
      supabase.from("profiles").select("*, classes(name, section)").eq("role", "student").order("created_at", { ascending: false }),
      supabase.from("classes").select("*").order("name"),
    ]);
    setStudents(sRes.data || []);
    setClasses(cRes.data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    setSaving(true); setMsg("");
    const { data: school } = await supabase.from("schools").select("id").limit(1).single();
    const { data: authData, error: authError } = await supabase.auth.admin?.createUser
      ? await supabase.auth.admin.createUser({ email: form.email, password: form.password, email_confirm: true })
      : await supabase.auth.signUp({ email: form.email, password: form.password });

    if (authError) { setMsg(authError.message); setSaving(false); return; }

    const userId = authData?.user?.id;
    if (userId) {
      await supabase.from("profiles").upsert({
        id: userId, full_name: form.full_name, email: form.email,
        role: "student", phone: form.phone, school_id: school?.id, is_approved: true,
      });
      if (form.class_id) {
        await supabase.from("students").insert({ profile_id: userId, class_id: form.class_id });
      }
    }

    setMsg("Student added! (They can login with the provided credentials)");
    setForm({ full_name: "", email: "", phone: "", password: "", class_id: "" });
    fetchData();
    setSaving(false);
  };

  const handleApprove = async (id, approved) => {
    await supabase.from("profiles").update({ is_approved: !approved }).eq("id", id);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this student?")) return;
    await supabase.from("profiles").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Students</h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 2 }}>Manage all student accounts</p>
        </div>
        <button className="btn btn-blue" onClick={() => setShowModal(true)}>
          <Icon path={icons.plus} size={16} /> Add Student
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? <div className="empty-state"><p>Loading...</p></div> : students.length === 0 ? (
            <div className="empty-state"><p>No students yet. Add your first student!</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Class</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: "var(--text-3)", fontWeight: 600 }}>{i + 1}</td>
                    <td><strong>{s.full_name}</strong></td>
                    <td style={{ color: "var(--text-2)" }}>{s.email}</td>
                    <td style={{ color: "var(--text-2)" }}>{s.phone || "—"}</td>
                    <td>{s.classes ? `${s.classes.name} ${s.classes.section || ""}` : "—"}</td>
                    <td>
                      <span className={`badge ${s.is_approved ? "badge-green" : "badge-orange"}`}>
                        {s.is_approved ? "Active" : "Pending"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-sm btn-outline" onClick={() => handleApprove(s.id, s.is_approved)}>
                          <Icon path={s.is_approved ? icons.x : icons.check} size={12} />
                          {s.is_approved ? "Deactivate" : "Approve"}
                        </button>
                        <button className="btn btn-sm btn-red" onClick={() => handleDelete(s.id)}>
                          <Icon path={icons.trash} size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Student</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                <Icon path={icons.close} size={18} />
              </button>
            </div>
            <div className="modal-body">
              {msg && <div className={`alert ${msg.includes("added") ? "alert-success" : "alert-error"}`}>{msg}</div>}
              <div className="form-row">
                <div className="form-field">
                  <label>Full Name *</label>
                  <input type="text" placeholder="Student's full name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Phone</label>
                  <input type="tel" placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Email *</label>
                  <input type="email" placeholder="student@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Password *</label>
                  <input type="password" placeholder="Set password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
              </div>
              <div className="form-field">
                <label>Assign Class</label>
                <select value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })}>
                  <option value="">Select class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-blue" onClick={handleAdd} disabled={saving}>
                {saving ? "Adding..." : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Classes Manager ──────────────────────────────────────────────────────────────
function ClassesManager() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", section: "", teacher_id: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [cRes, tRes] = await Promise.all([
      supabase.from("classes").select("*, profiles!teacher_id(full_name)").order("name"),
      supabase.from("profiles").select("id, full_name").eq("role", "teacher"),
    ]);
    setClasses(cRes.data || []);
    setTeachers(tRes.data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    setSaving(true);
    const { data: school } = await supabase.from("schools").select("id").limit(1).single();
    await supabase.from("classes").insert({ ...form, school_id: school?.id, teacher_id: form.teacher_id || null });
    setForm({ name: "", section: "", teacher_id: "" });
    setShowModal(false);
    fetchData();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this class?")) return;
    await supabase.from("classes").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Classes</h2>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>Manage school classes and sections</p>
        </div>
        <button className="btn btn-blue" onClick={() => setShowModal(true)}>
          <Icon path={icons.plus} size={16} /> Add Class
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? <div className="empty-state"><p>Loading...</p></div> : classes.length === 0 ? (
            <div className="empty-state"><p>No classes yet. Add your first class!</p></div>
          ) : (
            <table>
              <thead>
                <tr><th>#</th><th>Class Name</th><th>Section</th><th>Class Teacher</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {classes.map((c, i) => (
                  <tr key={c.id}>
                    <td style={{ color: "var(--text-3)", fontWeight: 600 }}>{i + 1}</td>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.section || "—"}</td>
                    <td>{c.profiles?.full_name || <span style={{ color: "var(--text-3)" }}>Not assigned</span>}</td>
                    <td>
                      <button className="btn btn-sm btn-red" onClick={() => handleDelete(c.id)}>
                        <Icon path={icons.trash} size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Class</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                <Icon path={icons.close} size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-field">
                  <label>Class Name *</label>
                  <input type="text" placeholder="e.g. Class 10" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Section</label>
                  <input type="text" placeholder="e.g. A, B, C" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} />
                </div>
              </div>
              <div className="form-field">
                <label>Class Teacher</label>
                <select value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })}>
                  <option value="">Select teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-blue" onClick={handleAdd} disabled={saving || !form.name}>
                {saving ? "Adding..." : "Add Class"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Teachers Manager ─────────────────────────────────────────────────────────────
function TeachersManager() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", qualification: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("role", "teacher").order("created_at", { ascending: false });
    setTeachers(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    setSaving(true); setMsg("");
    const { data: school } = await supabase.from("schools").select("id").limit(1).single();
    const { data: authData, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password });

    if (authError) { setMsg(authError.message); setSaving(false); return; }

    const userId = authData?.user?.id;
    if (userId) {
      await supabase.from("profiles").upsert({
        id: userId, full_name: form.full_name, email: form.email,
        role: "teacher", phone: form.phone, school_id: school?.id, is_approved: true,
      });
      await supabase.from("teachers").insert({ profile_id: userId, qualification: form.qualification });
    }

    setMsg("Teacher added successfully!");
    setForm({ full_name: "", email: "", phone: "", password: "", qualification: "" });
    fetchData();
    setSaving(false);
  };

  const handleApprove = async (id, approved) => {
    await supabase.from("profiles").update({ is_approved: !approved }).eq("id", id);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this teacher?")) return;
    await supabase.from("profiles").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Teachers</h2>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>Manage all teacher accounts</p>
        </div>
        <button className="btn btn-blue" onClick={() => setShowModal(true)}>
          <Icon path={icons.plus} size={16} /> Add Teacher
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? <div className="empty-state"><p>Loading...</p></div> : teachers.length === 0 ? (
            <div className="empty-state"><p>No teachers yet. Add your first teacher!</p></div>
          ) : (
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {teachers.map((t, i) => (
                  <tr key={t.id}>
                    <td style={{ color: "var(--text-3)", fontWeight: 600 }}>{i + 1}</td>
                    <td><strong>{t.full_name}</strong></td>
                    <td style={{ color: "var(--text-2)" }}>{t.email}</td>
                    <td style={{ color: "var(--text-2)" }}>{t.phone || "—"}</td>
                    <td><span className={`badge ${t.is_approved ? "badge-green" : "badge-orange"}`}>{t.is_approved ? "Active" : "Pending"}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-sm btn-outline" onClick={() => handleApprove(t.id, t.is_approved)}>
                          <Icon path={t.is_approved ? icons.x : icons.check} size={12} />
                          {t.is_approved ? "Deactivate" : "Approve"}
                        </button>
                        <button className="btn btn-sm btn-red" onClick={() => handleDelete(t.id)}>
                          <Icon path={icons.trash} size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Teacher</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                <Icon path={icons.close} size={18} />
              </button>
            </div>
            <div className="modal-body">
              {msg && <div className={`alert ${msg.includes("success") ? "alert-success" : "alert-error"}`}>{msg}</div>}
              <div className="form-row">
                <div className="form-field">
                  <label>Full Name *</label>
                  <input type="text" placeholder="Teacher's full name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Phone</label>
                  <input type="tel" placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Email *</label>
                  <input type="email" placeholder="teacher@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Password *</label>
                  <input type="password" placeholder="Set password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
              </div>
              <div className="form-field">
                <label>Qualification</label>
                <input type="text" placeholder="e.g. B.Ed, M.Sc" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-blue" onClick={handleAdd} disabled={saving}>
                {saving ? "Adding..." : "Add Teacher"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Notices Manager ──────────────────────────────────────────────────────────────
function NoticesManager({ role }) {
  const { profile } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", priority: "normal" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => {
    const { data } = await supabase.from("notices").select("*, profiles(full_name)").order("created_at", { ascending: false });
    setNotices(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    setSaving(true);
    await supabase.from("notices").insert({ ...form, created_by: profile?.id });
    setForm({ title: "", content: "", priority: "normal" });
    setShowModal(false);
    fetchNotices();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this notice?")) return;
    await supabase.from("notices").delete().eq("id", id);
    fetchNotices();
  };

  const priorityColor = { urgent: "badge-red", important: "badge-orange", normal: "badge-blue" };

  return (
    <div className="page-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Notices</h2>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>School announcements and notices</p>
        </div>
        {(role === "admin" || role === "teacher") && (
          <button className="btn btn-blue" onClick={() => setShowModal(true)}>
            <Icon path={icons.plus} size={16} /> Add Notice
          </button>
        )}
      </div>

      {loading ? <div className="empty-state"><p>Loading...</p></div> : notices.length === 0 ? (
        <div className="card"><div className="empty-state"><p>No notices yet</p></div></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notices.map(n => (
            <div className="card" key={n.id} style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{n.title}</h3>
                    <span className={`badge ${priorityColor[n.priority] || "badge-blue"}`}>{n.priority}</span>
                  </div>
                  <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6 }}>{n.content}</p>
                  <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 8 }}>
                    By {n.profiles?.full_name || "Admin"} • {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                {role === "admin" && (
                  <button className="btn btn-sm btn-red" style={{ marginLeft: 16 }} onClick={() => handleDelete(n.id)}>
                    <Icon path={icons.trash} size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Notice</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                <Icon path={icons.close} size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <label>Title *</label>
                <input type="text" placeholder="Notice title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Content *</label>
                <textarea rows={4} placeholder="Notice details..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} style={{ resize: "vertical" }} />
              </div>
              <div className="form-field">
                <label>Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-blue" onClick={handleAdd} disabled={saving || !form.title || !form.content}>
                {saving ? "Posting..." : "Post Notice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────────
function StudentDashboard({ setActiveTab }) {
  const { profile } = useAuth();
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    supabase.from("notices").select("*").order("created_at", { ascending: false }).limit(3).then(({ data }) => setNotices(data || []));
  }, []);

  return (
    <div className="page-content">
      <div className="welcome-card">
        <h2>Welcome, {profile?.full_name?.split(" ")[0]}! 👋</h2>
        <p>Ready to learn something new today?</p>
        <div className="welcome-badges">
          <div className="welcome-badge">📅 {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
          <div className="welcome-badge">🎓 Student</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>Quick Access</h3></div>
          <div className="card-body">
            <div className="quick-actions">
              {[
                { label: "My Quiz", icon: icons.quiz, tab: "quiz" },
                { label: "Study Notes", icon: icons.notes, tab: "notes" },
                { label: "Homework", icon: icons.homework, tab: "homework" },
                { label: "Timetable", icon: icons.timetable, tab: "timetable" },
                { label: "My Results", icon: icons.results, tab: "results" },
                { label: "Fee Status", icon: icons.fees, tab: "fees" },
              ].map(a => (
                <div className="quick-action" key={a.label} onClick={() => setActiveTab(a.tab)}>
                  <div className="quick-action-icon"><Icon path={a.icon} size={18} /></div>
                  <span>{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Notices</h3>
            <button className="btn btn-sm btn-outline" onClick={() => setActiveTab("notices")}>View All</button>
          </div>
          <div className="card-body" style={{ padding: "16px 24px" }}>
            {notices.length === 0 ? (
              <div className="empty-state"><p>No notices yet</p></div>
            ) : (
              notices.map(n => (
                <div className="notice-item" key={n.id}>
                  <h4>{n.title}</h4>
                  <p>{n.content?.slice(0, 80)}...</p>
                  <div className="notice-meta">{new Date(n.created_at).toLocaleDateString("en-IN")}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>My Profile</h3></div>
        <div className="card-body">
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, var(--primary), var(--secondary))", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "white" }}>
              {profile?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>{profile?.full_name}</h3>
              <p style={{ color: "var(--text-2)", fontSize: 14 }}>{profile?.email}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <span className="badge badge-blue">Student</span>
                <span className={`badge ${profile?.is_approved ? "badge-green" : "badge-orange"}`}>
                  {profile?.is_approved ? "Active" : "Pending Approval"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Teacher Dashboard ────────────────────────────────────────────────────────────
function TeacherDashboard({ setActiveTab }) {
  const { profile } = useAuth();
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    supabase.from("notices").select("*").order("created_at", { ascending: false }).limit(3).then(({ data }) => setNotices(data || []));
  }, []);

  return (
    <div className="page-content">
      <div className="welcome-card">
        <h2>Welcome, {profile?.full_name?.split(" ")[0]}! 👋</h2>
        <p>Here's your teaching overview for today</p>
        <div className="welcome-badges">
          <div className="welcome-badge">📅 {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
          <div className="welcome-badge">👨‍🏫 Teacher</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>Quick Actions</h3></div>
          <div className="card-body">
            <div className="quick-actions">
              {[
                { label: "Mark Attendance", icon: icons.attendance, tab: "attendance" },
                { label: "Create Quiz", icon: icons.quiz, tab: "quiz" },
                { label: "Upload Notes", icon: icons.notes, tab: "notes" },
                { label: "Add Homework", icon: icons.homework, tab: "homework" },
                { label: "Enter Results", icon: icons.results, tab: "results" },
                { label: "Post Notice", icon: icons.notice, tab: "notices" },
              ].map(a => (
                <div className="quick-action" key={a.label} onClick={() => setActiveTab(a.tab)}>
                  <div className="quick-action-icon"><Icon path={a.icon} size={18} /></div>
                  <span>{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Notices</h3>
            <button className="btn btn-sm btn-outline" onClick={() => setActiveTab("notices")}>View All</button>
          </div>
          <div className="card-body" style={{ padding: "16px 24px" }}>
            {notices.length === 0 ? (
              <div className="empty-state"><p>No notices yet</p></div>
            ) : (
              notices.map(n => (
                <div className="notice-item" key={n.id}>
                  <h4>{n.title}</h4>
                  <p>{n.content?.slice(0, 80)}...</p>
                  <div className="notice-meta">{new Date(n.created_at).toLocaleDateString("en-IN")}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>My Profile</h3></div>
        <div className="card-body">
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, var(--success), #059669)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "white" }}>
              {profile?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>{profile?.full_name}</h3>
              <p style={{ color: "var(--text-2)", fontSize: 14 }}>{profile?.email}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <span className="badge badge-green">Teacher</span>
                <span className={`badge ${profile?.is_approved ? "badge-green" : "badge-orange"}`}>
                  {profile?.is_approved ? "Active" : "Pending Approval"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Parent Dashboard ─────────────────────────────────────────────────────────────
function ParentDashboard({ setActiveTab }) {
  const { profile } = useAuth();
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    supabase.from("notices").select("*").order("created_at", { ascending: false }).limit(3).then(({ data }) => setNotices(data || []));
  }, []);

  return (
    <div className="page-content">
      <div className="welcome-card">
        <h2>Welcome, {profile?.full_name?.split(" ")[0]}! 👋</h2>
        <p>Track your child's academic progress</p>
        <div className="welcome-badges">
          <div className="welcome-badge">📅 {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
          <div className="welcome-badge">👨‍👩‍👦 Parent</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>Quick Access</h3></div>
          <div className="card-body">
            <div className="quick-actions">
              {[
                { label: "Attendance", icon: icons.attendance, tab: "attendance" },
                { label: "Results", icon: icons.results, tab: "results" },
                { label: "Homework", icon: icons.homework, tab: "homework" },
                { label: "Fee Status", icon: icons.fees, tab: "fees" },
                { label: "Timetable", icon: icons.timetable, tab: "timetable" },
                { label: "Notices", icon: icons.notice, tab: "notices" },
              ].map(a => (
                <div className="quick-action" key={a.label} onClick={() => setActiveTab(a.tab)}>
                  <div className="quick-action-icon"><Icon path={a.icon} size={18} /></div>
                  <span>{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>School Notices</h3>
            <button className="btn btn-sm btn-outline" onClick={() => setActiveTab("notices")}>View All</button>
          </div>
          <div className="card-body" style={{ padding: "16px 24px" }}>
            {notices.length === 0 ? (
              <div className="empty-state"><p>No notices yet</p></div>
            ) : (
              notices.map(n => (
                <div className="notice-item" key={n.id}>
                  <h4>{n.title}</h4>
                  <p>{n.content?.slice(0, 80)}...</p>
                  <div className="notice-meta">{new Date(n.created_at).toLocaleDateString("en-IN")}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Not Approved Screen ──────────────────────────────────────────────────────────
function PendingApproval({ signOut }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ textAlign: "center", maxWidth: 400, padding: 40 }}>
        <div style={{ width: 80, height: 80, background: "#fef3c7", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <Icon path={icons.notice} size={40} color="#d97706" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Awaiting Approval</h2>
        <p style={{ color: "var(--text-2)", lineHeight: 1.6, marginBottom: 24 }}>
          Your account has been created successfully. Please wait for the admin to approve your account before you can access the system.
        </p>
        <button className="btn btn-outline" onClick={signOut} style={{ margin: "0 auto" }}>
          <Icon path={icons.logout} size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────────
function AppShell() {
  const { profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner" />
        <p style={{ color: "var(--text-2)", fontSize: 14 }}>Loading MySchool...</p>
      </div>
    );
  }

  if (!profile) return <LoginPage />;
  if (!profile.is_approved) return <PendingApproval signOut={signOut} />;

  const role = profile.role;

  const pageTitle = {
    dashboard: "Dashboard", students: "Students", teachers: "Teachers",
    classes: "Classes", parents: "Parents", quiz: "Quiz & Tests",
    notes: "Study Material", homework: "Homework", attendance: "Attendance",
    timetable: "Timetable", fees: "Fees Management", notices: "Notices",
    results: "Results", library: "Library", meetings: "Meetings",
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        if (role === "admin") return <AdminDashboard setActiveTab={setActiveTab} />;
        if (role === "teacher") return <TeacherDashboard setActiveTab={setActiveTab} />;
        if (role === "student") return <StudentDashboard setActiveTab={setActiveTab} />;
        if (role === "parent") return <ParentDashboard setActiveTab={setActiveTab} />;
        return null;
      case "students": return role === "admin" ? <StudentsManager /> : <ComingSoon title="Students" />;
      case "teachers": return role === "admin" ? <TeachersManager /> : <ComingSoon title="Teachers" />;
      case "classes": return role === "admin" ? <ClassesManager /> : <ComingSoon title="Classes" />;
      case "notices": return <NoticesManager role={role} />;
      default: return <ComingSoon title={pageTitle[activeTab] || activeTab} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={role} />
      <div className="main-content">
        <Topbar title={pageTitle[activeTab] || "Dashboard"} subtitle="MySchool Management System" />
        {renderContent()}
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <style>{styles}</style>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </>
  );
}
