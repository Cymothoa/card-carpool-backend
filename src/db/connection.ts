import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/carpool.db');

// 确保数据目录存在
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 创建数据库实例
const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

// 启用WAL模式（提高并发性能）
db.pragma('journal_mode = WAL');

export default db;
