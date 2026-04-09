/* ============================================
   SUPPLIFEED — MAIN JS
   File: js/main.js
   ============================================ */

const API_URL      = "https://supplifeed.onrender.com";
const POSTS_PER_PAGE = 6;

let currentPage     = 1;
let currentCategory = "all";
let allPosts        = [];


// ── ON LOAD ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  showSkeletons(6);
  fetchPosts();
});


// ── FETCH POSTS ───────────────────────────────────────────────
async function fetchPosts() {
  const coldStartTimer = setTimeout(() => {
    const msg = document.getElementById("loading-msg");
    if (msg) {
      msg.style.display = "block";
      msg.textContent = "Server is waking up... This can take ~30 seconds on first load.";
    }
  }, 8000);

  try {
    const res  = await fetch(`${API_URL}/api/posts`);
    const data = await res.json();

    allPosts = data.posts || [];

    renderFeaturedPost(allPosts[0]);
    renderPosts(allPosts);

  } catch (err) {
    console.error("Failed to fetch posts:", err);
    const msg = document.getElementById("loading-msg");
    if (msg) {
      msg.textContent = "Failed to load posts. Please try refreshing.";
      msg.style.display = "block";
    }
  } finally {
    clearTimeout(coldStartTimer);
    hideSkeletons();
    showLoading(false);
  }
}


// ── RENDER FEATURED POST ──────────────────────────────────────
function renderFeaturedPost(post) {
  const container = document.getElementById("featured-post");
  if (!post || !container) return;

  container.innerHTML = `
    <a href="post.html?id=${post.id}" class="featured-card">
      <div class="card-img">
        <img src="${post.image || 'https://placehold.co/800x500/1c1c1c/2ecc71?text=SuppliFeed'}" alt="${post.title}" />
      </div>
      <div class="card-body">
        <span class="featured-label">⭐ Featured</span>
        <div class="card-category ${getCategoryClass(post.category)}">${getCategoryLabel(post.category)}</div>
        <div class="card-title">${post.title}</div>
        <p class="card-excerpt">${post.excerpt}</p>
        <div class="card-meta">
          <span>📅 ${formatDate(post.date)}</span>
          <span>⏱ ${post.readTime || '5 min read'}</span>
        </div>
        <span class="read-more" style="margin-top:20px;">Read article →</span>
      </div>
    </a>
  `;
}


// ── RENDER POST CARDS ─────────────────────────────────────────
function renderPosts(posts) {
  const grid        = document.getElementById("posts-grid");
  const noMsg       = document.getElementById("no-posts-msg");
  const loadMoreBtn = document.getElementById("load-more-btn");

  const filtered  = currentCategory === "all" ? posts : posts.filter(p => p.category === currentCategory);
  const paginated = filtered.slice(0, currentPage * POSTS_PER_PAGE);

  if (filtered.length === 0) {
    grid.innerHTML = "";
    noMsg.style.display = "block";
    loadMoreBtn.style.display = "none";
    return;
  }

  noMsg.style.display = "none";

  grid.innerHTML = paginated.map(post => `
    <a href="post.html?id=${post.id}" class="card">
      <div class="card-img">
        <img src="${post.image || 'https://placehold.co/600x400/1c1c1c/2ecc71?text=SuppliFeed'}" alt="${post.title}" />
      </div>
      <div class="card-body">
        <div class="card-category ${getCategoryClass(post.category)}">${getCategoryLabel(post.category)}</div>
        <div class="card-title">${post.title}</div>
        <p class="card-excerpt">${post.excerpt}</p>
        <div class="card-meta">
          <span>📅 ${formatDate(post.date)}</span>
          <span>⏱ ${post.readTime || '5 min read'}</span>
        </div>
      </div>
    </a>
  `).join("");

  loadMoreBtn.style.display = paginated.length < filtered.length ? "inline-block" : "none";
}


// ── FILTER ────────────────────────────────────────────────────
function filterPosts(category) {
  currentCategory = category;
  currentPage     = 1;
  renderPosts(allPosts);
}

function loadMore() {
  currentPage++;
  renderPosts(allPosts);
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

function showLoading(state) {
  const msg = document.getElementById("loading-msg");
  if (msg) msg.style.display = state ? "block" : "none";
}

function showSkeletons(count) {
  const grid = document.getElementById("posts-grid");
  if (!grid) return;
  grid.innerHTML = Array(count).fill(`
    <div class="skeleton-card">
      <div class="skeleton-img skeleton-shimmer"></div>
      <div class="skeleton-body">
        <div class="skeleton-line skeleton-shimmer" style="width:40%; height:11px;"></div>
        <div class="skeleton-line skeleton-shimmer" style="width:90%;"></div>
        <div class="skeleton-line skeleton-shimmer" style="width:70%;"></div>
        <div class="skeleton-line skeleton-shimmer" style="width:55%; height:11px;"></div>
      </div>
    </div>
  `).join("");
}

function hideSkeletons() {
  document.querySelectorAll(".skeleton-card").forEach(s => s.remove());
}

function toggleNav() {
  document.getElementById("main-nav").classList.toggle("open");
}