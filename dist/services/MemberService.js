import db from '../db/connection.js';
import { logger } from '../utils/logger.js';
export class MemberService {
    /**
     * 创建成员
     */
    create(cardGroupId, data) {
        const { member_number, member_name } = data;
        // 验证
        if (!member_number || member_number.trim().length === 0) {
            throw new Error('成员编号不能为空');
        }
        if (member_number.length > 20) {
            throw new Error('成员编号不能超过20个字符');
        }
        // 检查卡组是否存在
        const cardGroup = db.prepare('SELECT id FROM card_groups WHERE id = ?').get(cardGroupId);
        if (!cardGroup) {
            throw new Error('卡组不存在');
        }
        // 检查成员编号是否已存在
        const existing = db
            .prepare('SELECT id FROM members WHERE card_group_id = ? AND member_number = ?')
            .get(cardGroupId, member_number.trim());
        if (existing) {
            throw new Error(`成员编号 ${member_number} 已存在`);
        }
        const stmt = db.prepare(`
      INSERT INTO members (card_group_id, member_number, member_name)
      VALUES (?, ?, ?)
    `);
        const result = stmt.run(cardGroupId, member_number.trim(), member_name?.trim() || null);
        const member = this.getById(result.lastInsertRowid);
        logger.info(`Member created: ${member.id} - ${member.member_number} in card group ${cardGroupId}`);
        return member;
    }
    /**
     * 批量创建成员（cortis全员预设）
     */
    bulkCreate(cardGroupId, data) {
        let membersToCreate = [];
        if (data.preset === 'cortis_all') {
            // cortis全员：成员1-5
            membersToCreate = [
                { member_number: '1', member_name: 'cortis 1' },
                { member_number: '2', member_name: 'cortis 2' },
                { member_number: '3', member_name: 'cortis 3' },
                { member_number: '4', member_name: 'cortis 4' },
                { member_number: '5', member_name: 'cortis 5' },
            ];
        }
        else if (data.members && data.members.length > 0) {
            membersToCreate = data.members;
        }
        else {
            throw new Error('必须提供preset或members数组');
        }
        // 检查卡组是否存在
        const cardGroup = db.prepare('SELECT id FROM card_groups WHERE id = ?').get(cardGroupId);
        if (!cardGroup) {
            throw new Error('卡组不存在');
        }
        const created = [];
        const errors = [];
        // 使用事务批量创建
        const insertStmt = db.prepare(`
      INSERT INTO members (card_group_id, member_number, member_name)
      VALUES (?, ?, ?)
    `);
        const checkStmt = db.prepare(`
      SELECT id FROM members WHERE card_group_id = ? AND member_number = ?
    `);
        const transaction = db.transaction((members) => {
            for (const memberData of members) {
                try {
                    // 检查是否已存在
                    const existing = checkStmt.get(cardGroupId, memberData.member_number.trim());
                    if (existing) {
                        errors.push(`成员编号 ${memberData.member_number} 已存在，跳过`);
                        continue;
                    }
                    const result = insertStmt.run(cardGroupId, memberData.member_number.trim(), memberData.member_name?.trim() || null);
                    const member = this.getById(result.lastInsertRowid);
                    created.push(member);
                }
                catch (error) {
                    errors.push(`创建成员 ${memberData.member_number} 失败: ${error instanceof Error ? error.message : '未知错误'}`);
                }
            }
        });
        transaction(membersToCreate);
        logger.info(`Bulk created ${created.length} members for card group ${cardGroupId}`);
        if (errors.length > 0) {
            logger.warn(`Bulk create errors: ${errors.join('; ')}`);
        }
        return created;
    }
    /**
     * 获取卡组的所有成员
     */
    getByCardGroup(cardGroupId) {
        return db
            .prepare('SELECT * FROM members WHERE card_group_id = ? ORDER BY member_number')
            .all(cardGroupId);
    }
    /**
     * 根据ID获取成员
     */
    getById(id) {
        const member = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
        if (!member) {
            throw new Error(`成员不存在: ${id}`);
        }
        return member;
    }
    /**
     * 删除成员
     */
    delete(id) {
        const member = this.getById(id);
        db.prepare('DELETE FROM members WHERE id = ?').run(id);
        logger.info(`Member deleted: ${id} - ${member.member_number}`);
    }
}
export const memberService = new MemberService();
//# sourceMappingURL=MemberService.js.map