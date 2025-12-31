import db from '../db/connection.js';
import { logger } from '../utils/logger.js';
import { carpoolService } from './CarpoolService.js';
export class MemberAssignmentService {
    /**
     * 创建成员分配（加入拼车或挤车）
     * 新逻辑：用户选择一套卡（多选），如果选择的卡中有任何一张已被其他人选择，需要PK总卡数
     * 多带者得：总卡数多的可以挤掉总卡数少的
     * 如果总卡数相同，则按照时间先后，先加入的用户获得
     */
    create(carpoolId, data) {
        const { username, selected_members, user_id } = data;
        // 验证并处理用户名
        if (!username || username.trim().length === 0) {
            throw new Error('用户名不能为空');
        }
        const trimmedUsername = username.trim();
        if (trimmedUsername.length > 50) {
            throw new Error('用户名不能超过50个字符');
        }
        if (!Array.isArray(selected_members) || selected_members.length === 0) {
            throw new Error('必须至少选择一个成员');
        }
        // 检查拼车是否存在
        const carpool = db.prepare('SELECT * FROM carpools WHERE id = ?').get(carpoolId);
        if (!carpool) {
            throw new Error('拼车不存在');
        }
        // 检查拼车是否已锁定
        if (carpool.status === 'locked' || carpool.status === 'driven' || carpool.status === 'cancelled') {
            throw new Error('拼车已锁定，不能修改');
        }
        // 检查卡组是否超过截止时间
        const cardGroup = db.prepare('SELECT deadline FROM card_groups WHERE id = ?').get(carpool.card_group_id);
        if (cardGroup.deadline) {
            const deadline = new Date(cardGroup.deadline);
            const now = new Date();
            if (now > deadline) {
                throw new Error('卡组已超过截止时间，不能加入拼车');
            }
        }
        // 验证selected_members中的成员ID都属于该拼车的卡组
        const validMemberIds = db
            .prepare('SELECT id FROM members WHERE card_group_id = ?')
            .all(carpool.card_group_id);
        const validIds = new Set(validMemberIds.map((m) => m.id));
        for (const memberId of selected_members) {
            if (!validIds.has(memberId)) {
                throw new Error(`成员ID ${memberId} 不属于此卡组`);
            }
        }
        // 预留权限功能：如果提供了user_id，验证用户是否存在（暂时不强制）
        if (user_id) {
            const user = db.prepare('SELECT id FROM users WHERE id = ?').get(user_id);
            if (!user) {
                logger.warn(`User ID ${user_id} not found, but continuing without user association`);
            }
        }
        // 检查同一拼车内用户名是否已存在（通过username字段直接检查）
        const existingAssignments = db
            .prepare(`
        SELECT id, username
        FROM member_assignments
        WHERE carpool_id = ? 
        AND replaced_at IS NULL
        AND username = ?
      `)
            .all(carpoolId, trimmedUsername);
        if (existingAssignments.length > 0) {
            throw new Error('此拼车内已有相同用户名，请使用不同的名称以区分');
        }
        // 获取该拼车的所有活跃分配（使用LEFT JOIN，因为user_id可能为NULL）
        const activeAssignments = db
            .prepare(`
        SELECT ma.*, u.display_name, u.username as username_sys
        FROM member_assignments ma
        LEFT JOIN users u ON ma.user_id = u.id
        WHERE ma.carpool_id = ? AND ma.replaced_at IS NULL
      `)
            .all(carpoolId);
        // 解析每个分配的selected_members
        const assignmentsWithMembers = activeAssignments.map((a) => ({
            ...a,
            selected_members: JSON.parse(a.selected_members || '[]'),
        }));
        const newSelectedSet = new Set(selected_members);
        const newCardCount = selected_members.length;
        let replaced = false;
        const replacedUserIds = [];
        // 使用事务处理分配
        const transaction = db.transaction(() => {
            // 检查是否有交集，如果有交集需要PK
            for (const existing of assignmentsWithMembers) {
                const existingSelectedSet = new Set(existing.selected_members);
                // 检查是否有交集
                const intersection = selected_members.filter((id) => existingSelectedSet.has(id));
                if (intersection.length > 0) {
                    // 有交集，需要PK总卡数
                    const existingCardCount = existing.selected_members.length;
                    if (newCardCount <= existingCardCount) {
                        // 新用户总卡数不够，不能挤掉
                        throw new Error(`无法挤掉：您选择的卡数（${newCardCount}）必须大于现有用户（${existingCardCount}）`);
                    }
                    // 可以挤掉，标记旧分配为被替换
                    const now = new Date().toISOString();
                    db.prepare(`
            UPDATE member_assignments
            SET replaced_at = ?
            WHERE id = ?
          `).run(now, existing.id);
                    replaced = true;
                    // 记录被挤掉的用户ID（如果有的话，用于预留权限功能）
                    if (existing.user_id) {
                        replacedUserIds.push(existing.user_id);
                    }
                    logger.info(`User ${trimmedUsername} (user_id: ${user_id || 'null'}) squeezed out user ${existing.username} (user_id: ${existing.user_id || 'null'}) for members [${intersection.join(',')}] in carpool ${carpoolId}`);
                }
            }
            // 创建新分配（user_id可选，用于预留权限功能）
            const stmt = db.prepare(`
        INSERT INTO member_assignments (carpool_id, user_id, selected_members, username)
        VALUES (?, ?, ?, ?)
      `);
            const result = stmt.run(carpoolId, user_id || null, JSON.stringify(selected_members), trimmedUsername);
            const newAssignment = this.getById(result.lastInsertRowid);
            // 检查拼车是否拼齐
            carpoolService.checkAndLockIfComplete(carpoolId);
            return { assignment: newAssignment, replaced, replaced_user_ids: replacedUserIds };
        });
        const result = transaction();
        logger.info(`Member assignment created: ${result.assignment.id} for members [${selected_members.join(',')}] in carpool ${carpoolId}`);
        return result;
    }
    /**
     * 获取拼车的所有成员分配（只返回当前拼到的用户，被挤掉的不显示）
     */
    getByCarpool(carpoolId, activeOnly = true) {
        let query = `
      SELECT ma.*, u.username, u.display_name
      FROM member_assignments ma
      LEFT JOIN users u ON ma.user_id = u.id
      WHERE ma.carpool_id = ?
    `;
        if (activeOnly) {
            query += ' AND ma.replaced_at IS NULL';
        }
        query += ' ORDER BY ma.assigned_at';
        const assignments = db.prepare(query).all(carpoolId);
        // 解析selected_members JSON，如果没有系统用户，使用username作为显示名称
        return assignments.map((a) => {
            const parsed = {
                ...a,
                selected_members: JSON.parse(a.selected_members || '[]'),
            };
            // 如果没有系统用户，使用username作为显示名称
            if (!a.user_id || !a.username_sys) {
                parsed.user = {
                    id: null,
                    username: a.username,
                    display_name: a.username,
                };
            }
            else {
                parsed.user = {
                    id: a.user_id,
                    username: a.username_sys,
                    display_name: a.display_name || a.username_sys,
                };
            }
            return parsed;
        });
    }
    /**
     * 根据ID获取成员分配
     */
    getById(id) {
        const assignment = db
            .prepare('SELECT * FROM member_assignments WHERE id = ?')
            .get(id);
        if (!assignment) {
            throw new Error(`成员分配不存在: ${id}`);
        }
        // 解析selected_members JSON
        const parsed = {
            ...assignment,
            selected_members: JSON.parse(assignment.selected_members || '[]'),
        };
        // 如果没有系统用户，使用username作为显示名称
        if (!parsed.user_id) {
            parsed.user = {
                id: null,
                username: parsed.username,
                display_name: parsed.username,
            };
        }
        return parsed;
    }
    /**
     * 删除成员分配（退出拼车）
     */
    delete(id) {
        const assignment = this.getById(id);
        // 检查拼车是否已锁定
        const carpool = db.prepare('SELECT status FROM carpools WHERE id = ?').get(assignment.carpool_id);
        if (carpool.status === 'locked' || carpool.status === 'driven' || carpool.status === 'cancelled') {
            throw new Error('拼车已锁定，不能退出');
        }
        // 标记为被替换（实际上就是删除）
        const now = new Date().toISOString();
        db.prepare(`
      UPDATE member_assignments
      SET replaced_at = ?
      WHERE id = ?
    `).run(now, id);
        logger.info(`Member assignment deleted: ${id}`);
    }
}
export const memberAssignmentService = new MemberAssignmentService();
//# sourceMappingURL=MemberAssignmentService.js.map