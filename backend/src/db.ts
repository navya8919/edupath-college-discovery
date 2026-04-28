import path from 'path';

// Node.js 22+ built-in SQLite — no native compilation needed
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DatabaseSync } = require('node:sqlite') as {
  DatabaseSync: new (dbPath: string) => SqliteDb;
};

interface SqliteStmt {
  get(...args: unknown[]): Record<string, any> | null | undefined;
  all(...args: unknown[]): Record<string, any>[];
  run(...args: unknown[]): { changes: number; lastInsertRowid: number | bigint };
}
interface SqliteDb {
  exec(sql: string): void;
  prepare(sql: string): SqliteStmt;
  close(): void;
}

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db: SqliteDb = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");
db.exec("PRAGMA case_sensitive_like = OFF");

// pg-compatible async interface
export const pool = {
  query: async (
    sql: string,
    params: unknown[] = []
  ): Promise<{ rows: Record<string, any>[] }> => {
    try {
      const converted = toSQLite(sql);
      const upper = converted.trim().toUpperCase();

      if (upper.startsWith('SELECT') || upper.startsWith('WITH')) {
        const stmt = db.prepare(converted);
        const rows = stmt.all(...params).map(parseRow);
        return { rows };
      }

      if (upper.includes('RETURNING')) {
        const withoutReturning = converted.replace(/RETURNING\s+\*/i, '').trim();
        const stmt = db.prepare(withoutReturning);
        const info = stmt.run(...params);
        const table = extractTable(withoutReturning);
        if (table) {
          const rowid = typeof info.lastInsertRowid === 'bigint'
            ? Number(info.lastInsertRowid)
            : info.lastInsertRowid;
          const sel = db.prepare(`SELECT * FROM ${table} WHERE rowid=?`);
          const row = sel.get(rowid);
          if (row) return { rows: [parseRow(row)] };
        }
        return { rows: [] };
      }

      const stmt = db.prepare(converted);
      stmt.run(...params);
      return { rows: [] };
    } catch (err) {
      throw err;
    }
  },
};

function toSQLite(sql: string): string {
  return sql
    .replace(/\$(\d+)/g, '?')
    .replace(/ILIKE/gi, 'LIKE')
    .replace(/::[a-zA-Z_[\]]+/g, '')
    .replace(/NOW\(\)/gi, "(datetime('now'))")
    .replace(/gen_random_uuid\(\)/gi, "(lower(hex(randomblob(16))))")
    .replace(/TEXT\s*\[\]/gi, 'TEXT')
    .replace(/UUID\s*\[\]/gi, 'TEXT')
    .replace(/JSONB/gi, 'TEXT')
    .replace(/DECIMAL\([^)]+\)/gi, 'REAL')
    .replace(/VARCHAR\([^)]+\)/gi, 'TEXT')
    .replace(/TIMESTAMP/gi, 'TEXT')
    .replace(/BOOLEAN/gi, 'INTEGER')
    .replace(/DEFAULT '{}'::[a-zA-Z_[\]]*/gi, "DEFAULT '[]'");
}

function extractTable(sql: string): string | null {
  const m = sql.match(/INTO\s+([a-zA-Z_]+)/i) || sql.match(/UPDATE\s+([a-zA-Z_]+)/i);
  return m ? m[1] : null;
}

function parseRow(row: Record<string, any>): Record<string, any> {
  if (!row) return row;
  const parsed: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === 'string') {
      const t = v.trim();
      if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('{') && t.endsWith('}'))) {
        try { parsed[k] = JSON.parse(t); continue; } catch { /* ignore */ }
      }
    }
    parsed[k] = v;
  }
  return parsed;
}

export default db;
