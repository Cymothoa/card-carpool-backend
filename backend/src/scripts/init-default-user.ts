import db from '../db/connection.js';

/**
 * 初始化默认用户
 * 如果数据库中没有用户，创建一个默认车主用户
 */
function initDefaultUser() {
  // 检查是否已有用户
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (userCount.count > 0) {
    console.log('用户已存在，跳过初始化');
    return;
  }

  // 创建默认车主用户
  const stmt = db.prepare(`
    INSERT INTO users (username, display_name, user_type)
    VALUES (?, ?, ?)
  `);

  const result = stmt.run('admin', '默认车主', 'owner');
  const userId = result.lastInsertRowid;

  console.log(`✓ 默认用户创建成功: ID=${userId}, username=admin, display_name=默认车主`);
  console.log('提示: 您可以使用 ID=1 作为车主ID创建卡组');
}

// 执行初始化
initDefaultUser();
db.close();
