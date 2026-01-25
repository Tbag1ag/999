
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || '';

export const isDbConfigured = !!databaseUrl;
export const sql = isDbConfigured ? neon(databaseUrl) : null;

export const initDatabase = async () => {
  if (!sql) return;
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS insights (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        category TEXT,
        status TEXT,
        focus_points TEXT,
        strategy TEXT,
        entry_level TEXT,
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
      CREATE TABLE IF NOT EXISTS indices (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        score INTEGER NOT NULL,
        title TEXT,
        description TEXT,
        updated_at BIGINT
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
        invested_amount DOUBLE PRECISION DEFAULT 0,
        yield_rate DOUBLE PRECISION DEFAULT 0,
        yield_amount DOUBLE PRECISION DEFAULT 0,
        updated_at BIGINT
      );
    `;
  } catch (error) {
    console.error("数据库初始化失败:", error);
    throw error;
  }
};
