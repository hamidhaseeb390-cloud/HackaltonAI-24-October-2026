"use strict";
if (HCM.requireRole("employee")) {
  const me = HCM.session(); document.getElementById("logoutBtn").addEventListener("click", HCM.logout);
  document.getElementById("employeeHello").textContent = me.name || "Employee";
  document.getElementById("welcomeTitle").textContent = `Welcome, ${me.name || "Employee"}`;
  document.getElementById("profileName").textContent = me.name || "Employee";
  document.getElementById("profileMeta").textContent = `${me.email || ""} · ${me.department || "Employee"}`;
  document.getElementById("avatar").textContent = HCM.initials(me.name); document.getElementById("todayLabel").textContent = HCM.today();
  function render() {
    const date = HCM.today(); const record = HCM.attendanceFor(me.id,date);
    document.getElementById("leaveBalance").textContent = HCM.leaveBalance(me.id);
    const status = document.getElementById("todayStatus"); const button = document.getElementById("attendanceBtn"); const msg = document.getElementById("attendanceMessage"); const time = document.getElementById("attendanceTime");
    if (!record) { status.className = "badge"; status.textContent = "Not marked"; button.disabled = false; button.textContent = "Check in"; msg.textContent = "Check in when you start work."; time.textContent = ""; document.getElementById("hoursToday").textContent = "—"; }
    else if (!record.checkOut) { status.outerHTML = HCM.badge(record.status || "Present").replace('<span class="badge ', '<span id="todayStatus" class="badge '); button.disabled = false; button.textContent = "Check out"; msg.textContent = "Your check-in is saved. Check out when your workday ends."; time.textContent = `Checked in at ${record.checkIn}`; document.getElementById("hoursToday").textContent = "In progress"; }
    else { status.outerHTML = HCM.badge(record.status || "Present").replace('<span class="badge ', '<span id="todayStatus" class="badge '); button.disabled = true; button.textContent = "Attendance complete"; msg.textContent = "Your attendance for today is complete."; time.textContent = `${record.checkIn} – ${record.checkOut}`; document.getElementById("hoursToday").textContent = HCM.fmtHours(record.hours); }
    const records = HCM.attendance().filter(a=>String(a.employeeId)===String(me.id)).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10);
    document.getElementById("myAttendanceRows").innerHTML = records.map(a=>`<tr><td>${HCM.escapeHTML(a.date)}</td><td>${HCM.escapeHTML(a.checkIn||"—")}</td><td>${HCM.escapeHTML(a.checkOut||"—")}</td><td>${HCM.escapeHTML(a.hours == null ? "—" : HCM.fmtHours(a.hours))}</td><td>${HCM.badge(a.status||"Present")}</td></tr>`).join("");
    document.getElementById("myAttendanceEmpty").hidden = records.length > 0;
  }
  document.getElementById("attendanceBtn").addEventListener("click", () => {
    const date = HCM.today(); const records = HCM.attendance(); let record = records.find(a=>String(a.employeeId)===String(me.id)&&a.date===date);
    const settings = HCM.company();
    if (!record) { const checkIn = HCM.nowTime(); const lateAfter = HCM.minutes(settings.officeStart) + Number(settings.graceMinutes||0); const status = HCM.minutes(checkIn) > lateAfter ? "Late" : "Present"; record = { id:`ATT-${Date.now()}`, employeeId:me.id, employeeName:me.name, email:me.email, date, checkIn, checkOut:"", hours:null, status }; records.push(record); HCM.write("attendance",records); }
    else if (!record.checkOut) { record.checkOut = HCM.nowTime(); record.hours = Number(HCM.hoursBetween(record.checkIn,record.checkOut).toFixed(2)); if (record.hours < 5) record.status = "Half Day"; HCM.write("attendance",records); }
    render();
  });
  document.getElementById("employeeHelperForm").addEventListener("submit", event => {
    event.preventDefault(); const q = document.getElementById("employeeQuestion").value.trim().toLowerCase(); const date = HCM.today(); const record = HCM.attendanceFor(me.id,date); let answer = "I can help with your leave balance, attendance and work hours.";
    if (q.includes("leave") || q.includes("balance")) answer = `You have ${HCM.leaveBalance(me.id)} working day(s) of approved leave balance remaining.`;
    else if (q.includes("late")) answer = record ? (record.status === "Late" ? `Your check-in today (${record.checkIn}) is marked late.` : `Your attendance today is marked ${record.status}.`) : "You have not checked in today.";
    else if (q.includes("hour") || q.includes("work")) { const weekStart = new Date(`${date}T12:00:00`); weekStart.setDate(weekStart.getDate()-((weekStart.getDay()+6)%7)); const weekDate = `${weekStart.getFullYear()}-${String(weekStart.getMonth()+1).padStart(2,"0")}-${String(weekStart.getDate()).padStart(2,"0")}`; const hrs = HCM.attendance().filter(a=>String(a.employeeId)===String(me.id)&&a.date>=weekDate&&a.date<=date).reduce((sum,a)=>sum+Number(a.hours||0),0); answer = `Your recorded work time this week is ${hrs.toFixed(2)} hour(s). Records without check-out do not count yet.`; }
    else if (q.includes("attendance") || q.includes("present")) answer = record ? `Your attendance is ${record.status}. Check-in: ${record.checkIn || "—"}; check-out: ${record.checkOut || "not yet recorded"}.` : "No attendance record has been saved for today.";
    document.getElementById("employeeHelperAnswer").textContent = answer;
  });
  render(); window.addEventListener("storage",render);
}
