const { createClient } = require("@libsql/client");
const dotenv = require("dotenv");

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      excerpt TEXT,
      content TEXT,
      category TEXT,
      date TEXT DEFAULT (date('now')),
      readTime TEXT DEFAULT '5 min read',
      image TEXT
    )
  `);
  console.log("✅ Turso database connected");
}

async function queryAll(sql, args = []) {
  const result = await db.execute({ sql, args });
  return result.rows;
}

async function queryOne(sql, args = []) {
  const result = await db.execute({ sql, args });
  return result.rows[0] || null;
}

async function run(sql, args = []) {
  const result = await db.execute({ sql, args });
  return { lastInsertRowid: Number(result.lastInsertRowid) };
}

module.exports = { initDb, queryAll, queryOne, run };
