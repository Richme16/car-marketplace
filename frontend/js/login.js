const API_BASE_URL = "http://localhost:5000/api/auth";

const form = document.getElementById("login-form");
const errorMsg = document.getElementById("login-error");
const loginBtn = document.getElementById("login-btn");

// If already logged in with a valid-looking token, skip straight to admin
if (localStorage.getItem("motorline_admin_token")) {
  window.location.href = "admin.html";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.hidden = true;
  loginBtn.disabled = true;
  loginBtn.textContent = "Signing in...";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Store the token in the browser's localStorage so it persists between
    // page loads. admin.js will read this and attach it to every request
    // that needs to prove you're logged in.
    localStorage.setItem("motorline_admin_token", data.token);
    window.location.href = "admin.html";
  } catch (error) {
    errorMsg.textContent = error.message || "Something went wrong. Try again.";
    errorMsg.hidden = false;
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Sign in";
  }
});
