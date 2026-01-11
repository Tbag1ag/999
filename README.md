# 市场周刊 - 行情捕捉与每日洞察

基于 React + Tailwind CSS + Neon (PostgreSQL) 构建的专业市场行情记录工具。

## 🌟 核心功能
- **每日洞察**：核心资产策略管理，支持看涨/看跌研判与入场点位记录。
- **信息捕捉**：碎片化信息捕捉瀑布流，支持新闻、随笔、逻辑分类。
- **消息中心**：实时同步行情变更与系统通知。
- **云端同步**：使用 Neon Serverless PostgreSQL 实现全球多端数据实时同步。

## 🚀 部署指南

### 1. 数据库准备 (Neon)
1. 访问 [Neon.tech](https://neon.tech/) 创建一个免费的 PostgreSQL 数据库。
2. 在控制台获取 `Connection String`（例如：`postgresql://user:password@host/dbname?sslmode=require`）。

### 2. 环境配置
在 Netlify 的部署设置中，添加以下环境变量：
- `NETLIFY_DATABASE_URL`: 你的 Neon 连接字符串（使用 Netlify Neon 扩展会自动生成）。

### 3. 本地运行
```bash
npm install
npm run dev
```

## 🔒 管理员模式
- **默认密码**: `8888`
- **进入方式**: 连续点击左上角图标 5 次。

## 📄 开源协议
MIT