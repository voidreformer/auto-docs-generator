const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.NODE_ENV === 'production' 
  ? '/tmp/auto_docs.db' 
  : path.join(__dirname, 'auto_docs.db');

let db = null;
let memoryStore = [];

async function getDB() {
  if (db) return db;

  try {
    const initSqlJs = require('sql.js');
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
      const filebuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(filebuffer);
    } else {
      db = new SQL.Database();
    }

    db.run(`
      CREATE TABLE IF NOT EXISTS docs_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        format TEXT NOT NULL,
        raw_code TEXT NOT NULL,
        generated_doc TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    saveDB();
    return db;
  } catch (err) {
    console.warn('WASM SQLite initialization fallback:', err.message);
    // Return memory fallback interface
    return {
      run: (query, params = []) => {
        if (query.includes('INSERT INTO docs_history')) {
          memoryStore.push({
            id: memoryStore.length + 1,
            title: params[0],
            format: params[1],
            raw_code: params[2],
            generated_doc: params[3],
            created_at: new Date().toISOString()
          });
        }
      },
      exec: () => {
        return [{
          columns: ['id', 'title', 'format', 'raw_code', 'generated_doc', 'created_at'],
          values: memoryStore.map(item => [item.id, item.title, item.format, item.raw_code, item.generated_doc, item.created_at])
        }];
      }
    };
  }
}

function saveDB() {
  if (!db || typeof db.export !== 'function') return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (e) {
    console.warn('DB Save warning:', e.message);
  }
}

module.exports = {
  getDB,
  saveDB
};
