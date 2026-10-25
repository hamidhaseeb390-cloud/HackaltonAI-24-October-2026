"use strict";
document.getElementById("loginForm").addEventListener("submit", event => {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const error = document.getElementById("loginError"); error.textContent = "";
  if (email.toLowerCase() === "admin" && password === "saylaniwelfare") {
    HCM.setSession({ id: "ADMIN-001", name: "Administrator", email: "admin", role: "admin" });
    location.href = "admin.html"; return;
  }
  const user = HCM.employees().find(u => String(u.email).toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) { error.textContent = "Invalid email/username or password."; return; }
  HCM.setSession({ ...user, role: "employee" }); location.href = "employee.html";
});
