// Switch UI
const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");

signUpButton.addEventListener("click", () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
});

// IMPORTANT: use relative URL so it works behind nginx (http://localhost)
const API_BASE = "";

// Helpers
function setMsg(id, text, ok = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.style.color = ok ? "green" : "crimson";
}

// SIGN UP
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirmPassword").value;

  if (!username || !password || !confirm) return setMsg("signupMsg", "Please fill in all fields.");
  if (password !== confirm) return setMsg("signupMsg", "Passwords do not match.");
  if (password.length < 4) return setMsg("signupMsg", "Password must be at least 4 characters.");

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) return setMsg("signupMsg", data.error || "Register failed.");

    setMsg("signupMsg", "Account created! Now sign in.", true);
    container.classList.remove("right-panel-active");
  } catch {
    setMsg("signupMsg", "Network error. Is backend running?");
  }
});

//Show password functions
function showPasswordSignUp() {
  var x = document.getElementById("signupPassword");
  var y = document.getElementById("signupConfirmPassword");
  if (x.type === "password" && y.type === "password") {
    x.type = "text";
    y.type = "text";
  } else {
    x.type = "password";
    y.type = "password";
  }
} 

function showPasswordSignIn() {
  var x = document.getElementById("loginPassword");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

// LOGIN
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!username || !password) return setMsg("loginMsg", "Please fill in all fields.");

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const text = await res.text(); // token OR error JSON as text

    if (!res.ok) {
      try {
        const j = JSON.parse(text);
        return setMsg("loginMsg", j.error || "Login failed.");
      } catch {
        return setMsg("loginMsg", "Login failed.");
      }
    }

    const token = text.trim();
    localStorage.setItem("token", token);

    window.location.href = "feed.html";
  } catch {
    setMsg("loginMsg", "Network error. Is backend running?");
  }
});
