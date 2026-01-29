
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || '';

export const isDbConfigured = !!databaseUrl;
export const sql = isDbConfigured ? neon(databaseUrl) : null;

export const initDatabase = async () => {
  if (!sql) return;
  
  try {
    // 基础表创建
    await sql`
      CREATE TABLE IF NOT EXISTS insights (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        category TEXT,
        status TEXT,
        focus_points TEXT,
        strategy TEXT,
        entry_level TEXT,
        image_url TEXT,
        updated_at BIGINT,
        completion_status TEXT DEFAULT '进行中'
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS journals (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT NOT NULL,
        mood TEXT,
        type TEXT,
        source TEXT,
        date BIGINT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS positions (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        category TEXT DEFAULT '美股',
        signal_type TEXT,
        side TEXT,
        status TEXT DEFAULT '观察中',
        signal_time BIGINT,
        entry_price DOUBLE PRECISION,
        shares DOUBLE PRECISION DEFAULT 1,
        yield_rate DOUBLE PRECISION DEFAULT 0,
        yield_amount DOUBLE PRECISION DEFAULT 0,
        updated_at BIGINT
      );
    `;

    // 增量补全逻辑
    try {
      await sql`ALTER TABLE insights ADD COLUMN IF NOT EXISTS image_url TEXT`;
      await sql`ALTER TABLE positions ADD COLUMN IF NOT EXISTS shares DOUBLE PRECISION DEFAULT 1`;
      await sql`ALTER TABLE positions ADD COLUMN IF NOT EXISTS yield_rate DOUBLE PRECISION DEFAULT 0`;
      await sql`ALTER TABLE positions ADD COLUMN IF NOT EXISTS yield_amount DOUBLE PRECISION DEFAULT 0`;
      await sql`ALTER TABLE positions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '美股'`;
    } catch (e) {
      console.warn("增量更新列失败（可能列已存在）:", e);
    }
    
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        title TEXT,
        message TEXT,
        timestamp BIGINT,
        is_read BOOLEAN DEFAULT FALSE,
        type TEXT
      );
    `;
  } catch (error) {
    console.error("数据库初始化失败:", error);
    throw error;
  }
};
