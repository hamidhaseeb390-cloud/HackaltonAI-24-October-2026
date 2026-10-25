"use strict";
document.getElementById("registerForm").addEventListener("submit", event => {
  event.preventDefault(); const message = document.getElementById("registerMessage"); message.textContent = ""; message.className = "error";
  const name = document.getElementById("name").value.trim(); const email = document.getElementById("email").value.trim();
  const department = document.getElementById("department").value.trim(); const salary = Number(document.getElementById("salary").value);
  const password = document.getElementById("password").value; const confirmPassword = document.getElementById("confirmPassword").value;
  if (!name || !email || !department || !Number.isFinite(salary) || salary <= 0) { message.textContent = "Please complete all fields with valid values."; return; }
  if (password.length < 6) { message.textContent = "Password must be at least 6 characters."; return; }
  if (password !== confirmPassword) { message.textContent = "Passwords do not match."; return; }
  const users = HCM.users(); if (users.some(u => String(u.email).toLowerCase() === email.toLowerCase())) { message.textContent = "This email is already registered."; return; }
  users.push({ id: `EMP-${Date.now()}`, name, email, department, salary, password, role: "employee", createdAt: new Date().toISOString() }); HCM.write("users", users);
  message.className = "success-text"; message.textContent = "Account created. Redirecting to login…";
  setTimeout(() => { location.href = "index.html"; }, 700);
});
