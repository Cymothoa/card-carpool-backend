-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    user_type TEXT NOT NULL DEFAULT 'member' CHECK(user_type IN ('owner', 'member')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建卡组表
CREATE TABLE IF NOT EXISTS card_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    deadline DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建成员表
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_group_id INTEGER NOT NULL REFERENCES card_groups(id) ON DELETE CASCADE,
    member_number TEXT NOT NULL,
    member_name TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(card_group_id, member_number)
);

-- 创建拼车表
CREATE TABLE IF NOT EXISTS carpools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_group_id INTEGER NOT NULL REFERENCES card_groups(id) ON DELETE CASCADE,
    creator_id INTEGER NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'incomplete' CHECK(status IN ('incomplete', 'complete', 'locked', 'driven', 'cancelled')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    locked_at DATETIME,
    driven_at DATETIME,
    cancelled_at DATETIME
);

-- 创建成员分配表
CREATE TABLE IF NOT EXISTS member_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    carpool_id INTEGER NOT NULL REFERENCES carpools(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    brought_members TEXT NOT NULL,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    replaced_at DATETIME
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_card_groups_owner_id ON card_groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_card_groups_deadline ON card_groups(deadline);
CREATE INDEX IF NOT EXISTS idx_members_card_group_id ON members(card_group_id);
CREATE INDEX IF NOT EXISTS idx_carpools_card_group_id ON carpools(card_group_id);
CREATE INDEX IF NOT EXISTS idx_carpools_creator_id ON carpools(creator_id);
CREATE INDEX IF NOT EXISTS idx_carpools_status ON carpools(status);
CREATE INDEX IF NOT EXISTS idx_carpools_created_at ON carpools(created_at);
CREATE INDEX IF NOT EXISTS idx_assignments_carpool_id ON member_assignments(carpool_id);
CREATE INDEX IF NOT EXISTS idx_assignments_member_id ON member_assignments(member_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON member_assignments(user_id);

-- 创建唯一索引（确保同一拼车中同一成员只有一个活跃分配）
-- SQLite不支持部分索引的WHERE子句，使用触发器实现
CREATE TRIGGER IF NOT EXISTS check_unique_assignment 
BEFORE INSERT ON member_assignments
WHEN EXISTS (
    SELECT 1 FROM member_assignments 
    WHERE carpool_id = NEW.carpool_id 
    AND member_id = NEW.member_id 
    AND replaced_at IS NULL
)
BEGIN
    SELECT RAISE(ABORT, 'Member already assigned to this carpool');
END;
