import { pool, IS_PG } from './db';

export async function setupDatabase() {
  if (IS_PG) {
    // ── PostgreSQL DDL ──────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email         TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name          TEXT NOT NULL,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS colleges (
        id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name                 TEXT NOT NULL,
        location             TEXT NOT NULL,
        state                TEXT NOT NULL,
        city                 TEXT NOT NULL,
        fees_min             INTEGER NOT NULL DEFAULT 0,
        fees_max             INTEGER NOT NULL DEFAULT 0,
        rating               REAL NOT NULL DEFAULT 0,
        rating_count         INTEGER NOT NULL DEFAULT 0,
        type                 TEXT NOT NULL DEFAULT 'Private',
        established          INTEGER,
        website              TEXT,
        image_url            TEXT,
        description          TEXT,
        placement_percentage REAL,
        avg_package          REAL,
        highest_package      REAL,
        total_students       INTEGER,
        accreditation        TEXT,
        ranking              INTEGER,
        courses              JSONB DEFAULT '[]',
        facilities           JSONB DEFAULT '[]',
        created_at           TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS saved_colleges (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, college_id)
      );
      CREATE TABLE IF NOT EXISTS saved_comparisons (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        college_ids JSONB NOT NULL,
        name        TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS questions (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
        title      TEXT NOT NULL,
        body       TEXT NOT NULL,
        votes      INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS answers (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        body        TEXT NOT NULL,
        votes       INTEGER DEFAULT 0,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ PostgreSQL tables created/verified');
  } else {
    // ── SQLite DDL (local dev) ───────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        email         TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name          TEXT NOT NULL,
        created_at    TEXT DEFAULT (datetime('now'))
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS colleges (
        id                   TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name                 TEXT NOT NULL,
        location             TEXT NOT NULL,
        state                TEXT NOT NULL,
        city                 TEXT NOT NULL,
        fees_min             INTEGER NOT NULL DEFAULT 0,
        fees_max             INTEGER NOT NULL DEFAULT 0,
        rating               REAL NOT NULL DEFAULT 0,
        rating_count         INTEGER NOT NULL DEFAULT 0,
        type                 TEXT NOT NULL DEFAULT 'Private',
        established          INTEGER,
        website              TEXT,
        image_url            TEXT,
        description          TEXT,
        placement_percentage REAL,
        avg_package          REAL,
        highest_package      REAL,
        total_students       INTEGER,
        accreditation        TEXT,
        ranking              INTEGER,
        courses              TEXT DEFAULT '[]',
        facilities           TEXT DEFAULT '[]',
        created_at           TEXT DEFAULT (datetime('now'))
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_colleges (
        id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(user_id, college_id)
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_comparisons (
        id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        college_ids TEXT NOT NULL,
        name        TEXT,
        created_at  TEXT DEFAULT (datetime('now'))
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        college_id TEXT REFERENCES colleges(id) ON DELETE SET NULL,
        title      TEXT NOT NULL,
        body       TEXT NOT NULL,
        votes      INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS answers (
        id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        body        TEXT NOT NULL,
        votes       INTEGER DEFAULT 0,
        created_at  TEXT DEFAULT (datetime('now'))
      )
    `);
    console.log('✅ SQLite tables created/verified (local dev mode)');
  }
}
