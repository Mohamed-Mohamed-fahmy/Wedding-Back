const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "rsvp.db");

function initDatabase() {
  const db = new Database(DB_PATH);

  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS rsvps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      attendance TEXT NOT NULL,
      guests INTEGER DEFAULT 1,
      dietary TEXT DEFAULT '',
      message TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  return db;
}

module.exports = { initDatabase };
