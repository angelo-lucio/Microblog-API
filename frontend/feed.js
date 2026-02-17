const API_BASE = "";

// helpers
function token() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const t = token();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${t}`,
  };
}

function requireLogin() {
  if (!token()) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

// Logout (if you have a button with id="logoutBtn")
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });
}

// Load posts
async function loadPosts() {
  if (!requireLogin()) return;

  const res = await fetch(`${API_BASE}/posts`);
  const posts = await res.json();

  const list = document.getElementById("posts");
  if (!list) return;

  list.innerHTML = "";

  for (const p of posts) {
    const li = document.createElement("li");
    li.textContent = `${p.id}: ${p.content}`;

    // delete button
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.style.marginLeft = "10px";

    del.onclick = async () => {
      await fetch(`${API_BASE}/posts/${p.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      loadPosts();
    };

    li.appendChild(del);
    list.appendChild(li);
  }
}

// Create post (if you have form id="postForm" and input id="postContent")
const postForm = document.getElementById("postForm");
if (postForm) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!requireLogin()) return;

    const contentEl = document.getElementById("postContent");
    const content = contentEl.value.trim();
    if (!content) return;

    await fetch(`${API_BASE}/posts`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ content }),
    });

    contentEl.value = "";
    loadPosts();
  });
}

loadPosts();
