import { Pool, PoolClient } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// ─── Use PostgreSQL if DATABASE_URL is set, otherwise SQLite (local dev) ───
const USE_PG = !!process.env.DATABASE_URL;

// ─── PostgreSQL pool (production) ───────────────────────────────────────────
let pgPool: Pool | null = null;
if (USE_PG) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL!.includes('localhost')
      ? false
      : { rejectUnauthorized: false },
  });
  pgPool.on('error', (err) => {
    console.error('Unexpected PG error:', err);
    process.exit(-1);
  });
}

// ─── SQLite shim (local dev) ─────────────────────────────────────────────────
type SqliteStmt = {
  get(...a: unknown[]): Record<string, unknown> | null | undefined;
  all(...a: unknown[]): Record<string, unknown>[];
  run(...a: unknown[]): { changes: number; lastInsertRowid: number | bigint };
};
type SqliteDb = {
  exec(sql: string): void;
  prepare(sql: string): SqliteStmt;
  close(): void;
};

let sqliteDb: SqliteDb | null = null;
if (!USE_PG) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DatabaseSync } = require('node:sqlite') as {
    DatabaseSync: new (p: string) => SqliteDb;
  };
  const dbPath = path.join(process.cwd(), 'database.sqlite');
  sqliteDb = new DatabaseSync(dbPath);
  sqliteDb.exec('PRAGMA journal_mode = WAL');
  sqliteDb.exec('PRAGMA foreign_keys = ON');
  sqliteDb.exec('PRAGMA case_sensitive_like = OFF');
}

// ─── Unified query interface ─────────────────────────────────────────────────
function toSQLite(sql: string): string {
  return sql
    .replace(/\$(\d+)/g, '?')
    .replace(/ILIKE/gi, 'LIKE')
    .replace(/::[a-zA-Z_[\]]+/g, '')
    .replace(/NOW\(\)/gi, "(datetime('now'))")
    .replace(/gen_random_uuid\(\)/gi, "(lower(hex(randomblob(16))))")
    .replace(/JSONB/gi, 'TEXT')
    .replace(/DECIMAL\([^)]+\)/gi, 'REAL')
    .replace(/VARCHAR\([^)]+\)/gi, 'TEXT')
    .replace(/TIMESTAMPTZ/gi, 'TEXT')
    .replace(/TIMESTAMP/gi, 'TEXT')
    .replace(/BOOLEAN/gi, 'INTEGER')
    .replace(/NULLS LAST/gi, '')
    .replace(/NULLS FIRST/gi, '');
}

function parseRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === 'string') {
      const t = v.trim();
      if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('{') && t.endsWith('}'))) {
        try { out[k] = JSON.parse(t); continue; } catch { /* ignore */ }
      }
    }
    out[k] = v;
  }
  return out;
}

function extractTable(sql: string): string | null {
  const m = sql.match(/INTO\s+([a-zA-Z_]+)/i) || sql.match(/UPDATE\s+([a-zA-Z_]+)/i);
  return m ? m[1] : null;
}

export const pool = {
  query: async (
    sql: string,
    params: unknown[] = []
  ): Promise<{ rows: Record<string, unknown>[] }> => {

    // ── PostgreSQL path ──────────────────────────────────────────────────────
    if (USE_PG && pgPool) {
      const res = await pgPool.query(sql, params as unknown[]);
      return { rows: res.rows };
    }

    // ── SQLite path ──────────────────────────────────────────────────────────
    const converted = toSQLite(sql);
    const upper = converted.trim().toUpperCase();
    const db = sqliteDb!;

    if (upper.startsWith('SELECT') || upper.startsWith('WITH')) {
      const stmt = db.prepare(converted);
      return { rows: stmt.all(...params).map(parseRow) };
    }

    if (upper.includes('RETURNING')) {
      const withoutRet = converted.replace(/RETURNING\s+\*/i, '').trim();
      const stmt = db.prepare(withoutRet);
      const info = stmt.run(...params);
      const table = extractTable(withoutRet);
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
  },

  // Expose a real PG client for direct use when needed
  connect: (): Promise<PoolClient> => {
    if (!pgPool) throw new Error('connect() only available in PostgreSQL mode');
    return pgPool.connect();
  },
};

export const IS_PG = USE_PG;
export default pool;
