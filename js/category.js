/* ============================================
   SUPPLEMENT BLOG — CATEGORY PAGE JS
   File: js/category.js
   ============================================ */


// ── 1. CONFIG ──
const API_URL = "";
const POSTS_PER_PAGE = 9;

let currentPage = 1;
let currentCategory = "all";
let allPosts = [];


// ── 2. CATEGORY META (Titles & Descriptions) ──
const categoryMeta = {
  all: {
    title: "Browse <span>All Posts</span>",
    description: "Explore all supplement content across every topic.",
    gridTitle: "All Posts"
  },
  reviews: {
    title: "Supplement <span>Reviews</span>",
    description: "Honest, in-depth reviews of the most popular supplements on the market.",
    gridTitle: "Latest Reviews"
  },
  ingredients: {
    title: "Ingredient <span>Breakdowns</span>",
    description: "Deep dives into individual supplement ingredients — what they do and what the science says.",
    gridTitle: "Ingredient Breakdowns"
  },
  tips: {
    title: "Health & Fitness <span>Tips</span>",
    description: "Practical advice on how to use supplements effectively for your goals.",
    gridTitle: "Health Tips"
  },
  research: {
    title: "Supplement <span>Research</span>",
    description: "The latest studies, trials, and news from the world of supplement science.",
    gridTitle: "Research & News"
  }
};


// ── 3. ON PAGE LOAD ──
document.addEventListener("DOMContentLoaded", () => {
  // Read category from URL e.g. category.html?cat=reviews
  const params = new URLSearchParams(window.location.search);
  const catFromURL = params.get("cat") || "all";

  currentCategory = catFromURL;

  updateHero(currentCategory);
  fetchPosts();
});


// ── 4. UPDATE HERO TEXT BASED ON CATEGORY ──
function updateHero(category) {
  const meta = categoryMeta[category] || categoryMeta["all"];

  document.getElementById("category-title").innerHTML = meta.title;
  document.getElementById("category-description").textContent = meta.description;
  document.getElementById("grid-title").textContent = meta.gridTitle;
  document.title = `${meta.gridTitle} — SuppliFeed`;
}


// ── 5. FETCH ALL POSTS FROM BACKEND ──
async function fetchPosts() {
  try {
    showLoading(true);

    const res = await fetch(`${API_URL}/api/posts`);
    const data = await res.json();

    allPosts = data.posts || [];
    renderPosts();

  } catch (err) {
    console.error("Failed to fetch posts:", err);
    document.getElementById("loading-msg").textContent =
      "Failed to load posts. Make sure the server is running.";
  } finally {
    showLoading(false);
  }
}


// ── 6. RENDER POSTS GRID ──
function renderPosts() {
  const grid = document.getElementById("posts-grid");
  const noMsg = document.getElementById("no-posts-msg");
  const loadMoreBtn = document.getElementById("load-more-btn");

  // Filter by category
  const filtered = currentCategory === "all"
    ? allPosts
    : allPosts.filter(p => p.category === currentCategory);

  // Paginate
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
        <img
          src="${post.image || 'assets/images/default.jpg'}"
          alt="${post.title}"
        />
      </div>
      <div class="card-body">
        <div class="card-category">${getCategoryLabel(post.category)}</div>
        <div class="card-title">${post.title}</div>
        <p class="card-excerpt">${post.excerpt}</p>
        <div class="card-meta">
          <span>📅 ${formatDate(post.date)}</span>
          <span>⏱ ${post.readTime || '5 min read'}</span>
        </div>
      </div>
    </a>
  `).join("");

  // Show/hide load more
  loadMoreBtn.style.display =
    paginated.length < filtered.length ? "inline-block" : "none";
}


// ── 7. FILTER POSTS (badge click) ──
function filterPosts(category) {
  currentCategory = category;
  currentPage = 1;
  updateHero(category);
  renderPosts();

  // Update URL without reloading page
  const url = new URL(window.location);
  url.searchParams.set("cat", category);
  window.history.pushState({}, "", url);
}


// ── 8. LOAD MORE ──
function loadMore() {
  currentPage++;
  renderPosts();
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


// ── 11. HELPER — SHOW/HIDE LOADING ──
function showLoading(state) {
  const msg = document.getElementById("loading-msg");
  if (msg) msg.style.display = state ? "block" : "none";
}