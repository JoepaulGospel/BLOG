/* ============================================
   SUPPLIFEED — CATEGORY PAGE JS
   File: js/category.js
   Supports both ?cat= and ?question= filters
   ============================================ */

const API_URL        = "https://supplifeed.onrender.com";
const POSTS_PER_PAGE = 9;

let currentPage     = 1;
let currentCategory = "all";
let currentQuestion = null;
let allPosts        = [];


const categoryMeta = {
  all:         { title: "Browse <span>All Posts</span>",             description: "Explore all supplement content across every topic.",                              gridTitle: "All Posts" },
  reviews:     { title: "Supplement <span>Reviews</span>",           description: "Honest, in-depth reviews of the most popular supplements on the market.",         gridTitle: "Latest Reviews" },
  ingredients: { title: "Ingredient <span>Breakdowns</span>",        description: "Deep dives into individual ingredients — what they do and what the science says.", gridTitle: "Ingredient Breakdowns" },
  tips:        { title: "Health & Fitness <span>Tips</span>",        description: "Practical advice on how to use supplements effectively for your goals.",           gridTitle: "Health Tips" },
  research:    { title: "Supplement <span>Research</span>",          description: "The latest studies, trials, and news from the world of supplement science.",       gridTitle: "Research & News" }
};


// ── ON LOAD ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const params       = new URLSearchParams(window.location.search);
  const catFromURL   = params.get("cat") || "all";
  const questionFromURL = params.get("question");

  currentCategory = catFromURL;
  currentQuestion = questionFromURL || null;

  if (currentQuestion) {
    // Question mode — show posts for this specific question
    document.getElementById("category-title").innerHTML  = `All answers: <span>${currentQuestion}</span>`;
    document.getElementById("category-description").textContent = "Every supplement we've covered as an answer to this question.";
    document.getElementById("grid-title").textContent    = `Answers to: ${currentQuestion}`;
    document.title = `${currentQuestion} — SuppliFeed`;
  } else {
    updateHero(currentCategory);
  }

  showSkeletons(9);
  fetchPosts();
});


// ── FETCH ─────────────────────────────────────────────────────
async function fetchPosts() {
  const coldStartTimer = setTimeout(() => {
    const msg = document.getElementById("loading-msg");
    if (msg) { msg.style.display = "block"; msg.textContent = "Server is waking up... ~30 seconds on first load."; }
  }, 8000);

  try {
    let url;
    if (currentQuestion) {
      url = `${API_URL}/api/posts?question=${encodeURIComponent(currentQuestion)}`;
    } else {
      url = `${API_URL}/api/posts`;
    }

    const res  = await fetch(url);
    const data = await res.json();

    allPosts = data.posts || [];
    renderPosts();

  } catch (err) {
    console.error("Failed to fetch posts:", err);
    const msg = document.getElementById("loading-msg");
    if (msg) { msg.textContent = "Failed to load posts. Please try refreshing."; msg.style.display = "block"; }
  } finally {
    clearTimeout(coldStartTimer);
    hideSkeletons();
    showLoading(false);
  }
}


// ── RENDER ────────────────────────────────────────────────────
function renderPosts() {
  const grid        = document.getElementById("posts-grid");
  const noMsg       = document.getElementById("no-posts-msg");
  const loadMoreBtn = document.getElementById("load-more-btn");

  // In category mode, filter. In question mode, already filtered by API.
  const filtered  = (!currentQuestion && currentCategory !== "all")
    ? allPosts.filter(p => p.category === currentCategory)
    : allPosts;

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
  currentQuestion = null;
  currentPage     = 1;
  updateHero(category);
  renderPosts();

  const url = new URL(window.location);
  url.searchParams.set("cat", category);
  url.searchParams.delete("question");
  window.history.pushState({}, "", url);
}

function loadMore() {
  currentPage++;
  renderPosts();
}

function updateHero(category) {
  const meta = categoryMeta[category] || categoryMeta["all"];
  document.getElementById("category-title").innerHTML       = meta.title;
  document.getElementById("category-description").textContent = meta.description;
  document.getElementById("grid-title").textContent         = meta.gridTitle;
  document.title = `${meta.gridTitle} — SuppliFeed`;
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