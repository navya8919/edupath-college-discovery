const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const dbPath = path.join('C:/Users/P Navyasree/OneDrive/Desktop/demo/backend', 'database.sqlite');
const db = new DatabaseSync(dbPath);

// Reproduce exact query 
const like = '%iit%';
const fees_min = 0;
const fees_max = 10000000;
const limit = 12;
const offset = 0;

const sql = `SELECT id, name FROM colleges WHERE (LOWER(name) LIKE ? OR LOWER(city) LIKE ? OR LOWER(state) LIKE ? OR LOWER(description) LIKE ?) AND fees_min >= ? AND fees_max <= ? ORDER BY CASE WHEN ranking IS NULL THEN 1 ELSE 0 END, ranking ASC LIMIT ? OFFSET ?`;
const params = [like, like, like, like, fees_min, fees_max, limit, offset];
console.log('SQL:', sql);
console.log('Params:', params);

try {
  const stmt = db.prepare(sql);
  const result = stmt.all(...params);
  console.log('Result count:', result.length);
  console.log('First:', JSON.stringify(result[0]));
} catch(e) {
  console.error('ERROR:', e.message);
}

// Check what description looks like
const d = db.prepare('SELECT substr(description, 1, 50) as desc FROM colleges LIMIT 1').get();
console.log('Description sample:', d);
