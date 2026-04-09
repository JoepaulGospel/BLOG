/* ============================================
   SUPPLIFEED — POST PAGE JS
   File: js/post.js
   ============================================ */

const API_URL = "https://supplifeed.onrender.com";


// ── ON LOAD ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const postId = new URLSearchParams(window.location.search).get("id");

  if (!postId) {
    showError("No post ID found. Please go back and select a post.");
    return;
  }

  fetchPost(postId);
});


// ── FETCH SINGLE POST ─────────────────────────────────────────
async function fetchPost(id) {
  const coldStartTimer = setTimeout(() => {
    const body = document.getElementById("post-body");
    if (body) body.innerHTML = `<div style="text-align:center;padding:60px 20px;color:#aaa;"><p>Server is waking up... This can take ~30 seconds on first load.</p></div>`;
  }, 8000);

  try {
    const res = await fetch(`${API_URL}/api/posts/${id}`);
    if (!res.ok) { showError("Post not found."); return; }

    const data = await res.json();
    renderPost(data.post);

    // Fetch related posts on same question
    if (data.post.question) {
      fetchRelatedPosts(data.post.question, data.post.id);
    }

  } catch (err) {
    console.error("Failed to fetch post:", err);
    showError("Failed to load post. Please try refreshing.");
  } finally {
    clearTimeout(coldStartTimer);
  }
}


// ── RENDER POST ───────────────────────────────────────────────
function renderPost(post) {
  if (!post) return;

  document.title = `${post.title} — SuppliFeed`;

  const metaDesc = document.querySelector("meta[name='description']");
  if (metaDesc) metaDesc.setAttribute("content", post.excerpt || "");

  // Category badge
  const catEl = document.getElementById("post-category");
  catEl.textContent  = getCategoryLabel(post.category);
  catEl.className    = `badge ${getCategoryClass(post.category)}`;

  document.getElementById("post-title").textContent     = post.title;
  document.getElementById("post-date").textContent      = `📅 ${formatDate(post.date)}`;
  document.getElementById("post-read-time").textContent = `⏱ ${post.readTime || "5 min read"}`;

  // Cover image
  if (post.image) {
    const coverEl  = document.getElementById("post-cover");
    const coverImg = document.getElementById("post-cover-img");
    coverEl.style.display = "block";
    coverImg.src = post.image;
    coverImg.alt = post.title;
  }

  // Body content
  document.getElementById("post-body").innerHTML = post.content;
}


// ── FETCH RELATED POSTS (same question) ───────────────────────
async function fetchRelatedPosts(question, currentId) {
  try {
    const res  = await fetch(`${API_URL}/api/posts?question=${encodeURIComponent(question)}&limit=5`);
    const data = await res.json();

    // Exclude current post
    const related = (data.posts || []).filter(p => String(p.id) !== String(currentId));
    renderRelatedPosts(related, question);

  } catch (err) {
    console.error("Failed to fetch related posts:", err);
  }
}


// ── RENDER RELATED POSTS ──────────────────────────────────────
function renderRelatedPosts(posts, question) {
  const list = document.getElementById("related-posts");
  if (!list) return;

  const heading = document.querySelector(".post-sidebar .sidebar-box h3");
  if (heading && question) heading.textContent = `More on: ${question}`;

  if (posts.length === 0) {
    list.innerHTML = `<li style="color:#bbb;font-size:0.85rem;">No related posts yet.</li>`;
    return;
  }

  list.innerHTML = posts.map(post => `
    <li>
      <a href="post.html?id=${post.id}">${post.title}</a>
      <div class="related-meta">📅 ${formatDate(post.date)}</div>
    </li>
  `).join("");
}


// ── ERROR ─────────────────────────────────────────────────────
function showError(message) {
  document.getElementById("post-body").innerHTML = `
    <div style="text-align:center; padding:80px 20px; color:#aaa;">
      <h2 style="margin-bottom:12px; font-family:'Playfair Display',serif; color:#1c1c1c;">Oops!</h2>
      <p style="margin-bottom:24px;">${message}</p>
      <a href="index.html" class="btn">← Back to Home</a>
    </div>
  `;
}


// ── HELPERS ───────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function getCategoryLabel(category) {
  const map = { reviews: "🧪 Review", ingredients: "🔬 Ingredient", tips: "💪 Health Tip", research: "📰 Research" };
  return map[category] || category;
}

function getCategoryClass(category) {
  const map = { reviews: "badge-review", ingredients: "badge-ingredient", tips: "badge-tip", research: "badge-research" };
  return map[category] || "";
}

function toggleNav() {
  document.getElementById("main-nav").classList.toggle("open");
}