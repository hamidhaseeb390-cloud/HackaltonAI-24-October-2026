"use strict";
/* Shared beginner-friendly localStorage helpers. This is a learning demo, not production authentication. */
const HCM = (() => {
  const KEYS = { company: "hcm_company", users: "hcm_users", attendance: "hcm_attendance", leaves: "hcm_leaves", session: "hcm_session" };
  const defaults = { name: "HCM Lite Company", officeStart: "09:00", graceMinutes: 15, leaveQuota: 20 };
  function read(key, fallback) { try { const raw = localStorage.getItem(KEYS[key] || key); return raw === null ? fallback : JSON.parse(raw); } catch { return fallback; } }
  function write(key, value) { localStorage.setItem(KEYS[key] || key, JSON.stringify(value)); return value; }
  function ensureDefaults() {
    if (!localStorage.getItem(KEYS.company)) write("company", defaults);
    if (!localStorage.getItem(KEYS.users)) write("users", []);
    if (!localStorage.getItem(KEYS.attendance)) write("attendance", []);
    if (!localStorage.getItem(KEYS.leaves)) write("leaves", []);
  }
  function company() { return { ...defaults, ...(read("company", defaults) || {}) }; }
  function users() { const x = read("users", []); return Array.isArray(x) ? x : []; }
  function employees() { return users().filter(u => u.role === "employee"); }
  function attendance() { const x = read("attendance", []); return Array.isArray(x) ? x : []; }
  function leaves() { const x = read("leaves", []); return Array.isArray(x) ? x : []; }
  function session() { return read("session", null); }
  function setSession(value) { write("session", value); }
  function logout() { localStorage.removeItem(KEYS.session); location.href = "index.html"; }
  function requireRole(role) {
    const s = session();
    if (!s) { location.href = "index.html"; return false; }
    if (s.role !== role) { location.href = s.role === "admin" ? "admin.html" : "employee.html"; return false; }
    if (role === "admin" && s.email !== "admin") { location.href = "index.html"; return false; }
    return true;
  }
  function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
  function nowTime() { const d = new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; }
  function minutes(time) { if (!time || !/^\d{2}:\d{2}$/.test(time)) return 0; const [h,m]=time.split(":").map(Number); return h*60+m; }
  function attendanceFor(userId, date) { return attendance().find(a => String(a.employeeId) === String(userId) && a.date === date) || null; }
  function leaveOn(userId, date, onlyApproved = true) { return leaves().find(l => String(l.employeeId) === String(userId) && l.from <= date && l.to >= date && (!onlyApproved || l.status === "Approved")) || null; }
  function isWorkingDay(date) { const day = new Date(`${date}T12:00:00`).getDay(); return day !== 0 && day !== 6; }
  function workingDaysBetween(from, to) {
    if (!from || !to || from > to) return 0;
    let count = 0; const d = new Date(`${from}T12:00:00`); const end = new Date(`${to}T12:00:00`);
    while (d <= end) { if (d.getDay() !== 0 && d.getDay() !== 6) count++; d.setDate(d.getDate()+1); }
    return count;
  }
  function approvedLeaveDays(userId) { return leaves().filter(l => String(l.employeeId) === String(userId) && l.status === "Approved").reduce((sum,l) => sum + Number(l.days || workingDaysBetween(l.from,l.to)), 0); }
  function leaveBalance(userId) { return Math.max(0, Number(company().leaveQuota) - approvedLeaveDays(userId)); }
  function hoursBetween(start, end) { return Math.max(0, (minutes(end)-minutes(start))/60); }
  function fmtHours(value) { return `${Number(value || 0).toFixed(2)} h`; }
  function escapeHTML(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[c])); }
  function initials(name) { return String(name || "U").split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0].toUpperCase()).join("") || "U"; }
  function badge(status) { const cls = String(status || "").toLowerCase().replace(/\s+/g,"-"); return `<span class="badge ${escapeHTML(cls)}">${escapeHTML(status || "—")}</span>`; }
  ensureDefaults();
  return { KEYS, read, write, company, users, employees, attendance, leaves, session, setSession, logout, requireRole, today, nowTime, minutes, attendanceFor, leaveOn, isWorkingDay, workingDaysBetween, approvedLeaveDays, leaveBalance, hoursBetween, fmtHours, escapeHTML, initials, badge };
})();
