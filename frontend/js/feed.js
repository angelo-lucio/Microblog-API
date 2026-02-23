let isEditing = false;
let cachedPostsJSON = "";

if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

const API_BASE = "";

window.addEventListener("DOMContentLoaded", () => {
  loadPosts();

  setInterval(loadPosts, 10000); // Auto refresh every 2 seconds

  document.getElementById("submitPostBtn")
    .addEventListener("click", createPost);

  document.getElementById("logoutBtn")
    .addEventListener("click", logout);
});

/* ===============================
   HELPER: Get User ID From JWT
================================= */
function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = JSON.parse(atob(token.split(".")[1]));
  return Number(payload.id);
}

/* ===============================
   LOAD POSTS
================================= */
async function loadPosts() {
  if (isEditing) return;

  try {
    const res = await fetch(`${API_BASE}/posts`);
    const posts = await res.json();

    const newJSON = JSON.stringify(posts);

    // If nothing changed → do nothing
    if (newJSON === cachedPostsJSON) {
      return;
    }

    // Save new version
    cachedPostsJSON = newJSON;

    const container = document.getElementById("postsContainer");
    const messageDiv = document.getElementById("feedMessage");

    container.innerHTML = "";

    const loggedInUserId = getUserIdFromToken();

    const myFlaggedPosts = posts.filter(
      p => Number(p.userId) === loggedInUserId && p.status === "flagged"
    );

    if (myFlaggedPosts.length > 0) {
      messageDiv.innerText =
        "⚠ One of your posts was flagged for inappropriate content. Please edit or delete it.";
    } else {
      messageDiv.innerText = "";
    }

    posts.forEach(post => {
      const card = document.createElement("div");
      card.classList.add("post-card");

      let actions = "";

      if (Number(post.userId) === loggedInUserId) {
        actions = `
          <div class="post-actions">
            <button class="post-btn post-btn-light" onclick="editPost(${post.id})">
              Edit
            </button>
            <button class="post-btn post-btn-danger" onclick="deletePost(${post.id})">
              Delete
            </button>
          </div>
        `;
      }

      let statusBadge = "";

      if (post.status === "flagged") {
        statusBadge = `<div style="color:red;font-size:12px;">Flagged by moderation</div>`;
      }

      card.innerHTML = `
        <div class="post-head">
          <div class="post-head-left">
            <div class="post-user">@${post.username}</div>
            <div class="post-meta">Post ID: ${post.id}</div>
            ${statusBadge}
          </div>
          ${actions}
        </div>
        <div class="post-body">${post.content}</div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Failed to load posts", err);
  }
}

/* ===============================
   CREATE POST
================================= */
async function createPost() {
  const contentInput = document.getElementById("postInput");
  const messageDiv = document.getElementById("feedMessage");
  const submitBtn = document.getElementById("submitPostBtn");

  const content = contentInput.value.trim();
  if (!content) return;

  const token = localStorage.getItem("token");

  submitBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    if (!res.ok) {
      messageDiv.innerText = "Failed to post.";
      submitBtn.disabled = false;
      return;
    }

    contentInput.value = "";
    submitBtn.disabled = false;

    loadPosts();

  } catch (err) {
    messageDiv.innerText = "Something went wrong.";
    submitBtn.disabled = false;
  }
}

/* ===============================
   EDIT POST
================================= */
function editPost(postId) {
  isEditing = true;

  const postCard = document.querySelector(
    `.post-card button[onclick="editPost(${postId})"]`
  ).closest(".post-card");

  const bodyDiv = postCard.querySelector(".post-body");
  const originalContent = bodyDiv.innerText;

  bodyDiv.innerHTML = `
    <textarea class="edit-textarea">${originalContent}</textarea>
  `;

  const actionsDiv = postCard.querySelector(".post-actions");

  actionsDiv.innerHTML = `
    <button class="post-btn post-btn-light" onclick="saveEdit(${postId})">
      Save
    </button>
    <button class="post-btn post-btn-danger" onclick="cancelEdit()">
      Cancel
    </button>
  `;
}

/* ===============================
   SAVE EDIT
================================= */
async function saveEdit(postId) {
  const postCard = document.querySelector(
    `.post-card button[onclick="saveEdit(${postId})"]`
  ).closest(".post-card");

  const textarea = postCard.querySelector(".edit-textarea");
  const newContent = textarea.value.trim();

  if (!newContent) return;

  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_BASE}/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ content: newContent })
    });

    if (!res.ok) throw new Error("Edit failed");

    isEditing = false;
    loadPosts();

  } catch (err) {
    console.error("Edit failed", err);
  }
}

/* ===============================
   CANCEL EDIT
================================= */
function cancelEdit() {
  isEditing = false;
  loadPosts();
}

/* ===============================
   DELETE POST
================================= */
async function deletePost(postId) {
  const token = localStorage.getItem("token");

  if (!confirm("Are you sure you want to delete this post?")) return;

  try {
    await fetch(`${API_BASE}/posts/${postId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    loadPosts();

  } catch (err) {
    console.error("Delete failed", err);
  }
}

/* ===============================
   LOGOUT
================================= */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}