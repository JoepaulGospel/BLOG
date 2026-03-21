/* ============================================
   SUPPLEMENT BLOG — MAIN JS
   File: js/main.js
   ============================================ */


// -- 1. CONFIG --
const API_URL = "https://supplifeed.onrender.com";
const POSTS_PER_PAGE = 6;

let currentPage = 1;
let currentCategory = "all";
let allPosts = [];


// -- 2. ON PAGE LOAD --
document.addEventListener("DOMContentLoaded", () => {
  showSkeletons();
  fetchPosts();
});


// -- 3. FETCH POSTS FROM BACKEND --
async function fetchPosts() {
  const coldStartTimer = setTimeout(() => {
    const msg = document.getElementById("loading-msg");
    if (msg) {
      msg.style.display = "block";
      msg.textContent = "Server is waking up... This can take ~30 seconds on first load.";
    }
  }, 8000);

  try {
    const res = await fetch(`${API_URL}/api/posts`);
    const data = await res.json();

    allPosts = data.posts || [];

    renderFeaturedPost(allPosts[0]);
    renderPosts(allPosts);

  } catch (err) {
    console.error("Failed to fetch posts:", err);
    const msg = document.getElementById("loading-msg");
    if (msg) {
      msg.textContent = "Failed to load posts. Please try refreshing the page.";
      msg.style.display = "block";
    }
  } finally {
    clearTimeout(coldStartTimer);
    hideSkeletons();
    showLoading(false);
  }
}


// -- 4. RENDER FEATURED POST --
function renderFeaturedPost(post) {
  const container = document.getElementById("featured-post");
  if (!post) return;

  container.innerHTML = `
    <a href="post.html?id=${post.id}" class="featured-card">
      <div class="card-img">
        <img src="${post.image || 'https://placehold.co/800x400?text=SuppliFeed'}" alt="${post.title}" />
      </div>
      <div class="card-body">
        <div class="card-category">${getCategoryBadge(post.category)}</div>
        <div class="card-title" style="font-size:1.5rem;">${post.title}</div>
        <p class="card-excerpt">${post.excerpt}</p>
        <div class="card-meta">
          <span>📅 ${formatDate(post.date)}</span>
          <span>⏱ ${post.readTime || '5 min read'}</span>
        </div>
      </div>
    </a>
  `;
}


// -- 5. RENDER POST CARDS --
function renderPosts(posts) {
  const grid = document.getElementById("posts-grid");
  const noMsg = document.getElementById("no-posts-msg");
  const loadMoreBtn = document.getElementById("load-more-btn");

  // Filter by category
  const filtered = currentCategory === "all"
    ? posts
    : posts.filter(p => p.category === currentCategory);

  // Slice for pagination
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
        <img src="${post.image || 'https://placehold.co/600x400?text=SuppliFeed'}" alt="${post.title}" />
      </div>
      <div class="card-body">
        <div class="card-category">${getCategoryBadge(post.category)}</div>
        <div class="card-title">${post.title}</div>
        <p class="card-excerpt">${post.excerpt}</p>
        <div class="card-meta">
          <span>📅 ${formatDate(post.date)}</span>
          <span>⏱ ${post.readTime || '5 min read'}</span>
        </div>
      </div>
    </a>
  `).join("");

  // Show/hide load more button
  loadMoreBtn.style.display =
    paginated.length < filtered.length ? "inline-block" : "none";
}


// -- 6. FILTER POSTS BY CATEGORY --
function filterPosts(category) {
  currentCategory = category;
  currentPage = 1;
  renderPosts(allPosts);
}


// -- 7. LOAD MORE POSTS --
function loadMore() {
  currentPage++;
  renderPosts(allPosts);
}


// -- 8. HELPER — FORMAT DATE --
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}


// -- 9. HELPER — CATEGORY BADGE LABEL --
function getCategoryBadge(category) {
  const map = {
    reviews:     "🧪 Review",
    ingredients: "🔬 Ingredient",
    tips:        "💪 Health Tip",
    research:    "📰 Research"
  };
  return map[category] || category;
}


// -- 10. HELPER — SHOW/HIDE LOADING --
function showLoading(state) {
  const msg = document.getElementById("loading-msg");
  if (msg) msg.style.display = state ? "block" : "none";
}


// -- 11. SKELETON LOADING --
function showSkeletons() {
  const grid = document.getElementById("posts-grid");
  if (!grid) return;

  grid.innerHTML = Array(6).fill(`
    <div class="skeleton-card">
      <div class="skeleton-img skeleton-shimmer"></div>
      <div class="skeleton-body">
        <div class="skeleton-line skeleton-shimmer" style="width:40%"></div>
        <div class="skeleton-line skeleton-shimmer" style="width:90%"></div>
        <div class="skeleton-line skeleton-shimmer" style="width:70%"></div>
      </div>
    </div>
  `).join("");
}

function hideSkeletons() {
  const skeletons = document.querySelectorAll(".skeleton-card");
  skeletons.forEach(s => s.remove());
}
