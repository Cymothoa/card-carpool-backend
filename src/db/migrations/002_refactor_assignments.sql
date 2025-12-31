-- 迁移：重构成员分配表，将member_id+brought_members改为selected_members
-- 新的逻辑：用户选择一套卡（多选），不区分"想要的"和"带的"

-- 注意：此迁移会清空现有数据，因为逻辑完全改变
-- 如果需要保留数据，需要手动转换

-- 1. 删除旧表（如果存在）
DROP TABLE IF EXISTS member_assignments;
DROP TRIGGER IF EXISTS check_unique_assignment;

-- 2. 创建新表
CREATE TABLE IF NOT EXISTS member_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    carpool_id INTEGER NOT NULL REFERENCES carpools(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    selected_members TEXT NOT NULL, -- JSON数组，存储用户选择的成员ID列表，如 "[1,2,3]"
    username TEXT NOT NULL, -- 用户在此拼车中使用的名称
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    replaced_at DATETIME
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_assignments_carpool_id ON member_assignments(carpool_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON member_assignments(user_id);
