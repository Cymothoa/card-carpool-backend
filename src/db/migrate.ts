import db from './connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const migrationsDir = path.join(__dirname, 'migrations');

// 创建迁移记录表
db.exec(`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

// 获取已执行的迁移
const executedMigrations = db
  .prepare('SELECT name FROM migrations ORDER BY id')
  .all()
  .map((row: any) => row.name);

// 读取所有迁移文件
const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort();

// 执行未执行的迁移
for (const file of migrationFiles) {
  if (!executedMigrations.includes(file)) {
    console.log(`Executing migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    
    db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(file);
    })();
    
    console.log(`✓ Migration ${file} completed`);
  } else {
    console.log(`- Migration ${file} already executed`);
  }
}

console.log('Database migration completed!');
db.close();
