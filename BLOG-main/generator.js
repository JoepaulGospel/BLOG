/* ============================================
   SUPPLIFEED — AI POST GENERATOR
   File: generator.js
   Generates articles that answer a question
   with a specific supplement as the answer.
   Includes a "Where to Buy" section.
   ============================================ */

const Groq       = require("groq-sdk");
const cloudinary = require("cloudinary").v2;
const dotenv     = require("dotenv");
const { run }    = require("./db");

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// ── FETCH COVER IMAGE FROM PEXELS → CLOUDINARY ────────────────
async function generateCoverImage(answer, category) {
  try {
    const query    = encodeURIComponent(`${answer} supplement health`);
    const url      = `https://api.pexels.com/v1/search?query=${query}&per_page=5&orientation=landscape`;
    const response = await fetch(url, {
      headers: { Authorization: process.env.PEXELS_API_KEY }
    });

    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
      const fallback = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(category + " health wellness")}&per_page=5&orientation=landscape`,
        { headers: { Authorization: process.env.PEXELS_API_KEY } }
      );
      const fallbackData = await fallback.json();
      if (!fallbackData.photos || fallbackData.photos.length === 0) return null;
      data.photos = fallbackData.photos;
    }

    const photo        = data.photos[Math.floor(Math.random() * data.photos.length)];
    const uploadResult = await cloudinary.uploader.upload(photo.src.large2x, {
      folder: "supplifeed",
      transformation: [{ width: 1200, height: 630, crop: "fill" }],
    });

    console.log(`🖼️ Cover image uploaded (Pexels: ${photo.photographer})`);
    return uploadResult.secure_url;

  } catch (err) {
    console.error("⚠️ Image fetch/upload failed:", err.message);
    return null;
  }
}


// ── GENERATE POST ─────────────────────────────────────────────
async function generatePost(question, answer, category) {
  const prompt   = buildPrompt(question, answer, category);
  const title    = `${question}: ${answer}`;

  const [textResponse, imageUrl] = await Promise.all([
    groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert supplement and health writer with deep knowledge of nutrition science.
You write clear, research-backed, engaging blog articles for real people searching for supplement advice.
Always return valid HTML for the article body using h2, h3, p, ul, li, strong, blockquote tags.
Do NOT include the article title in the body — it will be displayed separately.
Always end the article with a "Where to Buy" section.`
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2800
    }),
    generateCoverImage(answer, category)
  ]);

  const content = textResponse.choices[0].message.content;

  // Generate excerpt from first ~160 chars of plain text
  const excerpt = content
    .replace(/<[^>]+>/g, "")
    .substring(0, 160)
    .trim() + "...";

  // Estimate read time (~200 wpm)
  const wordCount = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  const readTime  = `${Math.max(3, Math.ceil(wordCount / 200))} min read`;

  const result = await run(
    `INSERT INTO posts (title, excerpt, content, category, question, answer_topic, date, readTime, image)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      excerpt,
      content,
      category,
      question,
      answer,
      new Date().toISOString().split("T")[0],
      readTime,
      imageUrl
    ]
  );

  const post = { id: result.lastInsertRowid, title, category, question, answer_topic: answer };
  console.log(`✅ Post saved: "${title}" (ID: ${post.id})`);

  return post;
}


// ── BUILD PROMPT ──────────────────────────────────────────────
function buildPrompt(question, answer, category) {
  const base = `
The user searched Google for: "${question}"
Your job is to write a detailed, helpful blog article that answers this question.
The specific supplement you are covering as THE answer is: "${answer}"

Structure your article with these sections:
1. Introduction — Why people ask this question and why ${answer} is one of the best answers
2. What is ${answer}? — Clear explanation for beginners
3. How it works — The science and mechanism behind it
4. Key benefits — Backed by research, use specific studies where possible
5. Recommended dosage — How much, when, and how to take it
6. Side effects & who should avoid it — Honest assessment
7. How to choose a quality ${answer} supplement — What to look for on labels
8. Where to Buy — A section listing trusted retailers where people can find ${answer} supplements. Include: Amazon, iHerb, GNC, Walmart, Bodybuilding.com, and Vitacost. Format each as a paragraph mentioning the retailer by name and why it's a good place to buy. Do NOT make up specific product links — just mention the retailer name and note they carry a wide range of ${answer} supplements.
9. Final verdict — Short, honest summary

Format the entire response as clean HTML. Use h2 for main sections, h3 for subsections, p for paragraphs, ul/li for lists, and blockquote for key research callouts.
`;

  return base;
}


module.exports = { generatePost };