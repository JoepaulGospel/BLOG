/* ============================================
   SUPPLEMENT BLOG — AUTO SCHEDULER
   File: scheduler.js
   ============================================ */


// ── 1. IMPORTS ──
const cron      = require("node-cron");
const generator = require("./generator");


// ── 2. TOPIC POOL ──
// The scheduler picks from these topics automatically
// Add as many as you want — it will never repeat one already used
const topicPool = {

  reviews: [
    "Optimum Nutrition Gold Standard Whey",
    "Transparent Labs Creatine HMB",
    "Garden of Life Multivitamin",
    "Legion Pulse Pre Workout",
    "NOW Foods Omega-3 Fish Oil",
    "Momentous Ashwagandha",
    "Thorne Magnesium Bisglycinate",
    "BPN Strong Greens",
    "Ritual Essential Protein",
    "Alpha Lion Superhuman Pump"
  ],

  ingredients: [
    "Creatine Monohydrate",
    "Ashwagandha",
    "Magnesium Glycinate",
    "Vitamin D3",
    "Zinc",
    "Beta Alanine",
    "L-Citrulline",
    "Rhodiola Rosea",
    "Berberine",
    "NMN (Nicotinamide Mononucleotide)"
  ],

  tips: [
    "How to time your supplements for best results",
    "Should you take supplements on rest days",
    "Best supplements for beginners",
    "How to build a supplement routine on a budget",
    "Signs you are taking too many supplements",
    "How to read a supplement label",
    "Natural vs synthetic supplements",
    "Supplements for better sleep",
    "Best supplements for women over 30",
    "How to know if a supplement is actually working"
  ],

  research: [
    "New research on creatine and brain health",
    "Latest findings on vitamin D and immunity",
    "What new studies say about protein intake",
    "Research update on omega 3 and heart health",
    "New clinical trial results on ashwagandha",
    "Latest research on gut health and probiotics",
    "What science says about pre workout ingredients",
    "New findings on magnesium and sleep quality",
    "Research on collagen supplements and joints",
    "Latest studies on intermittent fasting and supplements"
  ]

};


// ── 3. PICK A RANDOM TOPIC ──
function getRandomTopic(category) {
  const topics = topicPool[category];
  const index  = Math.floor(Math.random() * topics.length);
  return topics[index];
}


// ── 4. PICK A RANDOM CATEGORY ──
function getRandomCategory() {
  const categories = ["reviews", "ingredients", "tips", "research"];
  return categories[Math.floor(Math.random() * categories.length)];
}


// ── 5. RUN GENERATION JOB ──
async function runJob() {
  console.log("⏰ Scheduler triggered — generating new post...");

  try {
    const category = getRandomCategory();
    const topic    = getRandomTopic(category);

    console.log(`📌 Topic: "${topic}" | Category: ${category}`);

    const post = await generator.generatePost(topic, category);

    console.log(`✅ Post published: "${post.title}" (ID: ${post.id})`);

  } catch (err) {
    console.error("❌ Scheduler error:", err.message);
  }
}


// ── 6. SCHEDULE ──
// Runs every day at 8:00 AM automatically
// Format: second minute hour day month weekday
cron.schedule("0 8 * * *", () => {
  runJob();
});

console.log("✅ Scheduler is running — new post will generate every day at 8:00 AM");


// ── 7. ALSO RUN ONCE IMMEDIATELY ON START ──
// This generates one post right away when you start the scheduler
// Remove this line if you don't want that
runJob();


module.exports = { runJob };