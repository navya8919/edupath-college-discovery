const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE t(id INTEGER)');
db.exec('INSERT INTO t VALUES(1)');
db.exec('INSERT INTO t VALUES(2)');
const result = db.prepare('SELECT COUNT(*) AS cnt FROM t').all();
console.log('COUNT result:', JSON.stringify(result));
const result2 = db.prepare('SELECT COUNT(*) FROM t').all();
console.log('COUNT without alias:', JSON.stringify(result2));
