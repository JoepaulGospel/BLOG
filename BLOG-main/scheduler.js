/* ============================================
   SUPPLIFEED — SMART SCHEDULER
   File: scheduler.js
   Rotates through questions, never repeats
   an answer for the same question until all
   answers are exhausted (then resets).
   ============================================ */

const cron      = require("node-cron");
const generator = require("./generator");
const { queryAll } = require("./db");


// ── QUESTION POOL ──────────────────────────────────────────────
// Each entry is a high-intent Google search query.
// The scheduler picks one question per day, finds which answers
// have already been used, and picks the next unused one.
// ──────────────────────────────────────────────────────────────
const questionPool = [
  {
    question: "Best supplements for weight loss",
    category: "reviews",
    answers: [
      "Probiotics",
      "Green Tea Extract",
      "Glucomannan",
      "CLA (Conjugated Linoleic Acid)",
      "Berberine",
      "Caffeine Anhydrous",
      "L-Carnitine"
    ]
  },
  {
    question: "Best supplements for men",
    category: "ingredients",
    answers: [
      "Zinc",
      "Vitamin D3",
      "Ashwagandha",
      "Creatine Monohydrate",
      "Magnesium Glycinate",
      "Tongkat Ali",
      "Fish Oil (Omega-3)"
    ]
  },
  {
    question: "Best supplements for hair growth",
    category: "ingredients",
    answers: [
      "Biotin",
      "Collagen Peptides",
      "Iron",
      "Vitamin D",
      "Saw Palmetto",
      "Zinc",
      "Keratin"
    ]
  },
  {
    question: "Best supplements for perimenopause",
    category: "tips",
    answers: [
      "Black Cohosh",
      "Magnesium",
      "Evening Primrose Oil",
      "Vitamin D3",
      "Ashwagandha",
      "Maca Root",
      "Red Clover Isoflavones"
    ]
  },
  {
    question: "Best supplements for anxiety",
    category: "research",
    answers: [
      "Ashwagandha",
      "Magnesium Glycinate",
      "L-Theanine",
      "Rhodiola Rosea",
      "GABA",
      "Valerian Root",
      "Passionflower Extract"
    ]
  },
  {
    question: "Best supplements for inflammation",
    category: "research",
    answers: [
      "Turmeric (Curcumin)",
      "Omega-3 Fish Oil",
      "Boswellia Serrata",
      "Ginger Extract",
      "Resveratrol",
      "Vitamin C",
      "Quercetin"
    ]
  },
  {
    question: "Best supplements for erections",
    category: "reviews",
    answers: [
      "L-Arginine",
      "Panax Ginseng",
      "Maca Root",
      "Zinc",
      "L-Citrulline",
      "Ashwagandha",
      "Horny Goat Weed (Epimedium)"
    ]
  },
  {
    question: "Best supplements for brain health",
    category: "research",
    answers: [
      "Lion's Mane Mushroom",
      "Omega-3 (DHA)",
      "Bacopa Monnieri",
      "Phosphatidylserine",
      "Ginkgo Biloba",
      "Creatine",
      "Citicoline (CDP-Choline)"
    ]
  },
  {
    question: "Best supplements to reduce cortisol",
    category: "tips",
    answers: [
      "Ashwagandha",
      "Rhodiola Rosea",
      "Phosphatidylserine",
      "Magnesium",
      "L-Theanine",
      "Holy Basil (Tulsi)",
      "Vitamin C"
    ]
  },
  {
    question: "Best supplements for gut health",
    category: "ingredients",
    answers: [
      "Probiotics (Lactobacillus)",
      "Prebiotics (Inulin)",
      "L-Glutamine",
      "Digestive Enzymes",
      "Zinc Carnosine",
      "Aloe Vera Extract",
      "Collagen Peptides"
    ]
  }
];


// ── PICK NEXT QUESTION (round-robin by day) ────────────────────
function getTodaysQuestion() {
  const dayIndex = Math.floor(Date.now() / 86400000); // days since epoch
  return questionPool[dayIndex % questionPool.length];
}


// ── GET UNUSED ANSWER FOR A QUESTION ──────────────────────────
async function getNextAnswer(questionEntry) {
  const { question, answers } = questionEntry;

  // Pull all answer_topics already used for this question
  const used = await queryAll(
    "SELECT answer_topic FROM posts WHERE question = ?",
    [question]
  );

  const usedTopics = used.map(row => row.answer_topic);
  const available  = answers.filter(a => !usedTopics.includes(a));

  if (available.length === 0) {
    // All answers exhausted — reset and start again
    console.log(`🔄 All answers used for "${question}" — resetting cycle`);
    return answers[0];
  }

  return available[0];
}


// ── MAIN JOB ──────────────────────────────────────────────────
async function runJob() {
  console.log("⏰ Scheduler triggered — generating new post...");

  const questionEntry = getTodaysQuestion();
  const answer        = await getNextAnswer(questionEntry);

  console.log(`❓ Question : "${questionEntry.question}"`);
  console.log(`💊 Answer   : "${answer}"`);
  console.log(`📂 Category : ${questionEntry.category}`);

  const post = await generator.generatePost(
    questionEntry.question,
    answer,
    questionEntry.category
  );

  console.log(`✅ Post published: "${post.title}" (ID: ${post.id})`);
  return post;
}


// ── CRON SCHEDULE ─────────────────────────────────────────────
// Every day at 8:00 AM
cron.schedule("0 8 * * *", () => {
  runJob().catch(err => console.error("❌ Scheduler error:", err));
});

console.log("✅ Scheduler running — new post every day at 8:00 AM");

module.exports = { runJob };