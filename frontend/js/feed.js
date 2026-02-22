if (!localStorage.getItem("token")) {
  window.location.href = "login.html";  // change if your login page name is different
}

const API_BASE = "";

window.addEventListener("DOMContentLoaded", () => {
  loadPosts();

  document.getElementById("submitPostBtn")
    .addEventListener("click", createPost);
    
  document.getElementById("logoutBtn")
    .addEventListener("click", logout);
});

// Get logged in userId from JWT
function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = JSON.parse(atob(token.split(".")[1]));
  console.log("TOKEN PAYLOAD:", payload);

  return Number(payload.id);
}
// LOAD POSTS
async function loadPosts() {
  const container = document.getElementById("postsContainer");
  const messageDiv = document.getElementById("feedMessage");

  container.innerHTML = "";
  messageDiv.innerText = "Loading posts...";

  try {
    const res = await fetch(`${API_BASE}/posts`);
    const posts = await res.json();

    if (!posts.length) {
      messageDiv.innerText = "No posts yet. Be the first to post something.";
      return;
    }

    messageDiv.innerText = ""; // clear message

    const loggedInUserId = getUserIdFromToken();

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

      card.innerHTML = `
        <div class="post-head">
          <div class="post-head-left">
            <div class="post-user">@${post.username}</div>
            <div class="post-meta">Post ID: ${post.id}</div>
          </div>
          ${actions}
        </div>
        <div class="post-body">${post.content}</div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    messageDiv.innerText = "Failed to load posts.";
    console.error("Failed to load posts", err);
  }
}

// DELETE POST
async function deletePost(postId) {
  const token = localStorage.getItem("token");

  if (!confirm("Are you sure you want to delete this post?")) return;

  try {
    const res = await fetch(`${API_BASE}/posts/${postId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Delete failed");
    }

    loadPosts(); // refresh feed

  } catch (err) {
    console.error("Delete failed", err);
  }
}

// EDIT POST
function editPost(postId) {
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
    <button class="post-btn post-btn-danger" onclick="cancelEdit(${postId}, \`${originalContent}\`)">
      Cancel
    </button>
  `;
}

//SAVE EDIT
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

    loadPosts();

  } catch (err) {
    console.error("Edit failed", err);
  }
}

// CANCEL EDIT
function cancelEdit(postId, originalContent) {
  loadPosts(); // easiest and cleanest way
}

// CREATE POST
async function createPost() {
  const contentInput = document.getElementById("postInput");
  const messageDiv = document.getElementById("feedMessage");
  const submitBtn = document.getElementById("submitPostBtn");

  const content = contentInput.value.trim();
  if (!content) return;

  const token = localStorage.getItem("token");

  //  Show loading message
  messageDiv.innerText = "Smalltalk moderation system is reviewing your post...";
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
      messageDiv.innerText = "This post violates our community guidelines and cannot be published.";
      submitBtn.disabled = false;
      return;
    }

    contentInput.value = "";
    messageDiv.innerText = "";
    submitBtn.disabled = false;

    loadPosts();

  } catch (err) {
    console.error("Create post failed", err);
    messageDiv.innerText = "Something went wrong.";
    submitBtn.disabled = false;
  }
}

// LOGOUT
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}