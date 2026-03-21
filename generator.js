/* ============================================
   SUPPLEMENT BLOG — AI POST GENERATOR
   File: generator.js
   Uses Groq API for text + Gemini for cover images
   ============================================ */

const Groq = require("groq-sdk");
const fs = require("fs");
const path = require("path");
const https = require("https");
const dotenv = require("dotenv");
const db = require("./db");

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Ensure images directory exists
const imagesDir = path.join(__dirname, "assets", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// ── FETCH COVER IMAGE FROM PEXELS ──
async function generateCoverImage(topic, category) {
  try {
    const query = encodeURIComponent(`${topic} supplement health`);
    const url = `https://api.pexels.com/v1/search?query=${query}&per_page=5&orientation=landscape`;

    const response = await fetch(url, {
      headers: { Authorization: process.env.PEXELS_API_KEY }
    });

    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
      console.warn("⚠️ No Pexels results, trying generic query...");
      const fallback = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(category + " health wellness")}&per_page=5&orientation=landscape`,
        { headers: { Authorization: process.env.PEXELS_API_KEY } }
      );
      const fallbackData = await fallback.json();
      if (!fallbackData.photos || fallbackData.photos.length === 0) {
        console.warn("⚠️ No images found on Pexels");
        return null;
      }
      data.photos = fallbackData.photos;
    }

    // Pick a random photo from results
    const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
    const imageUrl = photo.src.large2x;

    // Download image
    const fileName = `post-${Date.now()}.jpg`;
    const filePath = path.join(imagesDir, fileName);

    await new Promise((resolve, reject) => {
      https.get(imageUrl, (res) => {
        const stream = fs.createWriteStream(filePath);
        res.pipe(stream);
        stream.on("finish", () => { stream.close(); resolve(); });
        stream.on("error", reject);
      }).on("error", reject);
    });

    console.log(`🖼️ Cover image saved: ${fileName} (Pexels: ${photo.photographer})`);
    return `assets/images/${fileName}`;
  } catch (err) {
    console.error("⚠️ Image fetch failed:", err.message);
    return null;
  }
}

// ── GENERATE A FULL BLOG POST ──
async function generatePost(topic, category) {
  const prompt = buildPrompt(topic, category);

  // Generate text and image in parallel
  const [textResponse, imagePath] = await Promise.all([
    groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert supplement and health writer. You write clear, well-researched, engaging blog articles. Always return valid HTML for the article body (use h2, h3, p, ul, li, strong, blockquote tags). Do NOT include the title in the body — it will be displayed separately."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2500
    }),
    generateCoverImage(topic, category)
  ]);

  const content = textResponse.choices[0].message.content;

  // Generate excerpt from first ~160 chars of plain text
  const excerpt = content
    .replace(/<[^>]+>/g, "")
    .substring(0, 160)
    .trim() + "...";

  // Estimate read time (~200 words per minute)
  const wordCount = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  const readTime = `${Math.max(3, Math.ceil(wordCount / 200))} min read`;

  // Save to database
  const stmt = db.prepare(`
    INSERT INTO posts (title, excerpt, content, category, date, readTime, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    topic,
    excerpt,
    content,
    category,
    new Date().toISOString().split("T")[0],
    readTime,
    imagePath
  );

  const post = { id: result.lastInsertRowid, title: topic, category };
  console.log(`✅ Post saved: "${topic}" (ID: ${post.id})`);

  return post;
}

// ── BUILD PROMPT BASED ON CATEGORY ──
function buildPrompt(topic, category) {
  const prompts = {
    reviews: `Write a detailed supplement review article about "${topic}". Include:
- A brief intro about the product
- Key ingredients and what they do
- Pros and cons (use a pros/cons format)
- Who this supplement is best for
- A final verdict
Format the body as HTML.`,

    ingredients: `Write an in-depth ingredient breakdown article about "${topic}". Include:
- What it is and where it comes from
- How it works in the body
- Scientific evidence and key studies
- Recommended dosage
- Potential side effects
- Best forms to supplement with
Format the body as HTML.`,

    tips: `Write a practical health tip article about: "${topic}". Include:
- Why this matters
- Actionable steps or advice
- Common mistakes to avoid
- A quick summary or takeaway
Format the body as HTML.`,

    research: `Write a research news article about: "${topic}". Include:
- Summary of the latest findings
- What the study or research showed
- Why it matters for supplement users
- Practical takeaways
- What to watch for next
Format the body as HTML.`
  };

  return prompts[category] || prompts.tips;
}

module.exports = { generatePost };
