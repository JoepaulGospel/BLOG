const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "supplifeed.db"));

db.pragma("journal_mode = WAL");

db.exec(`
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

module.exports = db;
