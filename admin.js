"use strict";
if (HCM.requireRole("admin")) {
  document.getElementById("logoutBtn").addEventListener("click", HCM.logout);
  const dateInput = document.getElementById("reportDate"); dateInput.value = HCM.today();
  document.getElementById("adminHello").textContent = "Signed in as Admin";
  document.getElementById("companyHeading").textContent = `${HCM.company().name} · Daily attendance overview`;
  function render() {
    const date = dateInput.value || HCM.today(); const employees = HCM.employees(); const rows = [];
    let present = 0, late = 0, onLeave = 0;
    employees.forEach(user => {
      const record = HCM.attendanceFor(user.id, date); const leave = HCM.leaveOn(user.id, date, true);
      let status = "Absent", leaveCell = "Leave";
      if (record) { status = record.status || "Present"; present++; if (status === "Late") late++; leaveCell = leave ? `${leave.type} · Approved` : "—"; }
      else if (leave) { status = "On Leave"; leaveCell = `${leave.type} · Approved`; onLeave++; }
      const statusMarkup = HCM.badge(status);
      rows.push(`<tr><td>${HCM.escapeHTML(user.id)}</td><td>${HCM.escapeHTML(user.name)}</td><td>${HCM.escapeHTML(user.department || "—")}</td><td>${record ? HCM.escapeHTML(record.checkIn || "—") : "—"}</td><td>${record ? HCM.escapeHTML(record.checkOut || "—") : "—"}</td><td>${statusMarkup}</td><td>${HCM.escapeHTML(leaveCell)}</td></tr>`);
    });
    document.getElementById("totalEmployees").textContent = employees.length;
    document.getElementById("presentCount").textContent = present;
    document.getElementById("lateCount").textContent = late;
    document.getElementById("leaveCount").textContent = onLeave;
    document.getElementById("attendanceRows").innerHTML = rows.join("");
    document.getElementById("attendanceEmpty").hidden = employees.length > 0;
  }
  dateInput.addEventListener("change", render); render();
  document.getElementById("helperForm").addEventListener("submit", event => {
    event.preventDefault(); const q = document.getElementById("helperQuestion").value.trim().toLowerCase(); const date = dateInput.value || HCM.today();
    const employees = HCM.employees(); const all = HCM.attendance(); let answer = "I can answer about employee count, attendance, late arrivals and approved leave.";
    if (q.includes("how many") && (q.includes("employee") || q.includes("staff"))) answer = `There are ${employees.length} registered employee${employees.length === 1 ? "" : "s"}.`;
    else if (q.includes("late")) { const list = employees.filter(u => { const a = HCM.attendanceFor(u.id,date); return a && a.status === "Late"; }); answer = list.length ? `Late on ${date}: ${list.map(u=>u.name).join(", ")}.` : `No late arrivals recorded for ${date}.`; }
    else if (q.includes("leave")) { const list = employees.filter(u => HCM.leaveOn(u.id,date,true)); answer = list.length ? `On approved leave on ${date}: ${list.map(u=>u.name).join(", ")}.` : `No approved leaves cover ${date}.`; }
    else if (q.includes("present") || q.includes("attendance")) { const list = employees.filter(u => HCM.attendanceFor(u.id,date)); answer = `${list.length} of ${employees.length} employees have an attendance record for ${date}.`; }
    else if (q.includes("absent") || q.includes("not checked")) { const list = employees.filter(u => !HCM.attendanceFor(u.id,date) && !HCM.leaveOn(u.id,date,true)); answer = `No attendance and no approved leave for ${date}: ${list.length}${list.length ? ` — ${list.map(u=>u.name).join(", ")}` : ""}.`; }
    document.getElementById("helperAnswer").textContent = answer;
  });
  window.addEventListener("storage", () => render());
}
