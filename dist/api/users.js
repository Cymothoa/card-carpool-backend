import { Router } from 'express';
import db from '../db/connection.js';
const router = Router();
/**
 * POST /api/users
 * 创建用户
 */
router.post('/', (req, res, next) => {
    try {
        const data = req.body;
        const { username, display_name, user_type = 'member' } = data;
        // 验证
        if (!username || username.trim().length < 3 || username.trim().length > 20) {
            res.status(400).json({ error: '用户名必须是3-20个字符' });
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            res.status(400).json({ error: '用户名只能包含字母、数字和下划线' });
            return;
        }
        if (!display_name || display_name.trim().length === 0 || display_name.length > 50) {
            res.status(400).json({ error: '显示名称必须是1-50个字符' });
            return;
        }
        if (user_type !== 'owner' && user_type !== 'member') {
            res.status(400).json({ error: '用户类型必须是owner或member' });
            return;
        }
        // 检查用户名是否已存在
        const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username.trim());
        if (existing) {
            res.status(409).json({ error: '用户名已存在' });
            return;
        }
        const stmt = db.prepare(`
      INSERT INTO users (username, display_name, user_type)
      VALUES (?, ?, ?)
    `);
        const result = stmt.run(username.trim(), display_name.trim(), user_type);
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ data: user });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/users
 * 获取用户列表
 */
router.get('/', (req, res, next) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
        const users = db
            .prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?')
            .all(limit, offset);
        const total = db.prepare('SELECT COUNT(*) as count FROM users').get();
        res.json({ data: users, total: total.count });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/users/:id
 * 获取用户详情
 */
router.get('/:id', (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }
        res.json({ data: user });
    }
    catch (error) {
        return next(error);
    }
});
/**
 * PATCH /api/users/:id
 * 更新用户信息（主要是display_name）
 */
router.patch('/:id', (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const { display_name } = req.body;
        if (display_name !== undefined) {
            if (!display_name || display_name.trim().length === 0 || display_name.length > 50) {
                return res.status(400).json({ error: '显示名称必须是1-50个字符' });
            }
            db.prepare('UPDATE users SET display_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(display_name.trim(), id);
        }
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        res.json({ data: user });
    }
    catch (error) {
        return next(error);
    }
});
export default router;
//# sourceMappingURL=users.js.map