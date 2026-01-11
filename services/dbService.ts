
import { neon } from '@neondatabase/serverless';

/**
 * 环境变量说明：
 * 1. DATABASE_URL: 手动在 Netlify 平台配置的变量
 * 2. NETLIFY_DATABASE_URL: Netlify Neon 扩展自动生成的变量（你截图中的变量）
 */
const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || '';

export const isDbConfigured = !!databaseUrl;

// 创建 SQL 执行器
export const sql = isDbConfigured ? neon(databaseUrl) : null;

/**
 * 核心初始化函数：确保生产环境数据库表结构就绪
 * 当你部署后，第一次访问网站时，它会自动在 Neon 数据库中创建对应的表
 */
export const initDatabase = async () => {
  if (!sql) {
    console.warn("未检测到数据库连接字符串。请确保在 Netlify 环境变量中配置了 NETLIFY_DATABASE_URL。");
    return;
  }
  
  try {
    // 1. 创建每日洞察表
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
    
    // 2. 创建信息瀑布流表
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
    
    // 3. 创建通知中心表
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
    console.log("Neon 云端数据库表结构校验/初始化完成。");
  } catch (error) {
    console.error("数据库初始化失败，请检查 Neon 控制台权限:", error);
    throw error;
  }
};
