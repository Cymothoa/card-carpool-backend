-- 迁移：移除成员分配对系统用户的依赖，改为使用输入的用户名
-- 预留权限相关结构，但不强制验证

-- 1. 修改member_assignments表，让user_id可以为NULL（使用默认匿名用户）
-- 注意：SQLite不支持直接修改列，需要重建表
CREATE TABLE IF NOT EXISTS member_assignments_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    carpool_id INTEGER NOT NULL REFERENCES carpools(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id), -- 改为可选，用于预留权限功能
    selected_members TEXT NOT NULL, -- JSON数组，存储用户选择的成员ID列表，如 "[1,2,3]"
    username TEXT NOT NULL, -- 用户在此拼车中使用的名称（主要标识）
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    replaced_at DATETIME
);

-- 迁移现有数据（如果有）
INSERT INTO member_assignments_new (id, carpool_id, user_id, selected_members, username, assigned_at, replaced_at)
SELECT id, carpool_id, user_id, selected_members, username, assigned_at, replaced_at
FROM member_assignments;

-- 删除旧表
DROP TABLE IF EXISTS member_assignments;

-- 重命名新表
ALTER TABLE member_assignments_new RENAME TO member_assignments;

-- 重新创建索引
CREATE INDEX IF NOT EXISTS idx_assignments_carpool_id ON member_assignments(carpool_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON member_assignments(user_id);

-- 2. 修改carpools表，让creator_id可以为NULL（预留权限功能）
-- 注意：SQLite不支持直接修改列，需要重建表
CREATE TABLE IF NOT EXISTS carpools_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_group_id INTEGER NOT NULL REFERENCES card_groups(id) ON DELETE CASCADE,
    creator_id INTEGER REFERENCES users(id), -- 改为可选，用于预留权限功能
    creator_name TEXT, -- 创建者名称（用于显示，不依赖系统用户）
    status TEXT NOT NULL DEFAULT 'incomplete' CHECK(status IN ('incomplete', 'complete', 'locked', 'driven', 'cancelled')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    locked_at DATETIME,
    driven_at DATETIME,
    cancelled_at DATETIME
);

-- 迁移现有数据
INSERT INTO carpools_new (id, card_group_id, creator_id, creator_name, status, created_at, updated_at, locked_at, driven_at, cancelled_at)
SELECT 
    c.id,
    c.card_group_id,
    c.creator_id,
    COALESCE(u.display_name, u.username, '未知用户') as creator_name,
    c.status,
    c.created_at,
    c.updated_at,
    c.locked_at,
    c.driven_at,
    c.cancelled_at
FROM carpools c
LEFT JOIN users u ON c.creator_id = u.id;

-- 删除旧表
DROP TABLE IF EXISTS carpools;

-- 重命名新表
ALTER TABLE carpools_new RENAME TO carpools;

-- 重新创建索引
CREATE INDEX IF NOT EXISTS idx_carpools_card_group_id ON carpools(card_group_id);
CREATE INDEX IF NOT EXISTS idx_carpools_creator_id ON carpools(creator_id);
CREATE INDEX IF NOT EXISTS idx_carpools_status ON carpools(status);
CREATE INDEX IF NOT EXISTS idx_carpools_created_at ON carpools(created_at);
