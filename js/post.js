/* ============================================
   SUPPLEMENT BLOG — POST PAGE JS
   File: js/post.js
   ============================================ */


// ── 1. CONFIG ──
const API_URL = "";


// ── 2. ON PAGE LOAD ──
document.addEventListener("DOMContentLoaded", () => {
  const postId = getPostIdFromURL();

  if (!postId) {
    showError("No post ID found. Please go back and select a post.");
    return;
  }

  fetchPost(postId);
  fetchRelatedPosts();
});


// ── 3. GET POST ID FROM URL ──
// Reads the ?id=123 from the URL
function getPostIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}


// ── 4. FETCH SINGLE POST ──
async function fetchPost(id) {
  try {
    const res = await fetch(`${API_URL}/api/posts/${id}`);

    if (!res.ok) {
      showError("Post not found.");
      return;
    }

    const data = await res.json();
    renderPost(data.post);

  } catch (err) {
    console.error("Failed to fetch post:", err);
    showError("Failed to load post. Make sure the server is running.");
  }
}


// ── 5. RENDER POST ON PAGE ──
function renderPost(post) {
  if (!post) return;

  // Update page title
  document.title = `${post.title} — SuppliFeed`;

  // Update meta description
  const metaDesc = document.querySelector("meta[name='description']");
  if (metaDesc) metaDesc.setAttribute("content", post.excerpt);

  // Fill in the hero section
  document.getElementById("post-category").textContent =
    getCategoryLabel(post.category);

  document.getElementById("post-title").textContent = post.title;

  document.getElementById("post-date").textContent =
    `📅 ${formatDate(post.date)}`;

  document.getElementById("post-read-time").textContent =
    `⏱ ${post.readTime || "5 min read"}`;

  // Apply correct badge color to category
  const catBadge = document.getElementById("post-category");
  catBadge.className = `badge ${getCategoryBadgeClass(post.category)}`;

  // Fill in the post body
  document.getElementById("post-body").innerHTML = post.content;
}


// ── 6. FETCH RELATED POSTS ──
async function fetchRelatedPosts() {
  try {
    const res = await fetch(`${API_URL}/api/posts?limit=4`);
    const data = await res.json();

    renderRelatedPosts(data.posts || []);

  } catch (err) {
    console.error("Failed to fetch related posts:", err);
  }
}


// ── 7. RENDER RELATED POSTS IN SIDEBAR ──
function renderRelatedPosts(posts) {
  const list = document.getElementById("related-posts");
  if (!list || posts.length === 0) return;

  list.innerHTML = posts.map(post => `
    <li>
      <a href="post.html?id=${post.id}">
        ${post.title}
      </a>
      <div style="font-size:0.78rem; color:#aaa; margin-top:2px;">
        📅 ${formatDate(post.date)}
      </div>
    </li>
  `).join("");
}


// ── 8. SHOW ERROR MESSAGE ──
function showError(message) {
  document.getElementById("post-body").innerHTML = `
    <div style="
      text-align: center;
      padding: 60px 20px;
      color: #888;
    ">
      <h2 style="margin-bottom:12px;">😕 Oops!</h2>
      <p>${message}</p>
      <a href="index.html" class="btn" style="margin-top:20px; display:inline-block;">
        ← Back to Home
      </a>
    </div>
  `;
}


// ── 9. HELPER — FORMAT DATE ──
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}


// ── 10. HELPER — CATEGORY LABEL ──
function getCategoryLabel(category) {
  const map = {
    reviews:     "🧪 Review",
    ingredients: "🔬 Ingredient",
    tips:        "💪 Health Tip",
    research:    "📰 Research"
  };
  return map[category] || category;
}


// ── 11. HELPER — CATEGORY BADGE CSS CLASS ──
function getCategoryBadgeClass(category) {
  const map = {
    reviews:     "badge-review",
    ingredients: "badge-ingredient",
    tips:        "badge-tip",
    research:    "badge-research"
  };
  return map[category] || "";
}