import db from '../db/connection.js';
import { CardGroup, CreateCardGroupRequest, UpdateCardGroupRequest } from '../models/CardGroup.js';
import { logger } from '../utils/logger.js';

export class CardGroupService {
  /**
   * 创建卡组
   */
  create(data: CreateCardGroupRequest): CardGroup {
    const { name, owner_id, deadline } = data;

    // 验证
    if (!name || name.trim().length === 0) {
      throw new Error('卡组名称不能为空');
    }
    if (name.length > 100) {
      throw new Error('卡组名称不能超过100个字符');
    }
    if (!owner_id) {
      throw new Error('车主ID不能为空');
    }

    // 检查车主是否存在
    const owner = db.prepare('SELECT id FROM users WHERE id = ?').get(owner_id);
    if (!owner) {
      throw new Error('车主不存在');
    }

    // 验证截止时间
    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        throw new Error('截止时间格式无效');
      }
      if (deadlineDate <= new Date()) {
        throw new Error('截止时间必须晚于当前时间');
      }
    }

    const stmt = db.prepare(`
      INSERT INTO card_groups (name, owner_id, deadline)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(name.trim(), owner_id, deadline || null);
    const cardGroup = this.getById(result.lastInsertRowid as number);

    logger.info(`Card group created: ${cardGroup.id} - ${cardGroup.name}`);
    return cardGroup;
  }

  /**
   * 获取所有卡组
   */
  getAll(ownerId?: number): CardGroup[] {
    let query = 'SELECT * FROM card_groups';
    const params: any[] = [];

    if (ownerId) {
      query += ' WHERE owner_id = ?';
      params.push(ownerId);
    }

    query += ' ORDER BY created_at DESC';

    return db.prepare(query).all(...params) as CardGroup[];
  }

  /**
   * 根据ID获取卡组
   */
  getById(id: number): CardGroup {
    const cardGroup = db.prepare('SELECT * FROM card_groups WHERE id = ?').get(id) as CardGroup | undefined;

    if (!cardGroup) {
      throw new Error(`卡组不存在: ${id}`);
    }

    return cardGroup;
  }

  /**
   * 更新卡组
   */
  update(id: number, data: UpdateCardGroupRequest): CardGroup {
    const cardGroup = this.getById(id);

    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('卡组名称不能为空');
      }
      if (data.name.length > 100) {
        throw new Error('卡组名称不能超过100个字符');
      }
      updates.push('name = ?');
      values.push(data.name.trim());
    }

    if (data.deadline !== undefined) {
      if (data.deadline) {
        const deadlineDate = new Date(data.deadline);
        if (isNaN(deadlineDate.getTime())) {
          throw new Error('截止时间格式无效');
        }
        if (deadlineDate <= new Date()) {
          throw new Error('截止时间必须晚于当前时间');
        }
      }
      updates.push('deadline = ?');
      values.push(data.deadline || null);
    }

    if (updates.length === 0) {
      return cardGroup;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE card_groups
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
    logger.info(`Card group updated: ${id}`);
    return this.getById(id);
  }

  /**
   * 删除卡组
   */
  delete(id: number): void {
    const cardGroup = this.getById(id);

    // 级联删除会自动处理关联的members和carpools
    db.prepare('DELETE FROM card_groups WHERE id = ?').run(id);
    logger.info(`Card group deleted: ${id} - ${cardGroup.name}`);
  }

  /**
   * 获取卡组及其成员
   */
  getWithMembers(id: number) {
    const cardGroup = this.getById(id);
    const members = db
      .prepare('SELECT * FROM members WHERE card_group_id = ? ORDER BY member_number')
      .all(id) as any[];

    const owner = db.prepare('SELECT * FROM users WHERE id = ?').get(cardGroup.owner_id) as any;

    return {
      ...cardGroup,
      members,
      owner,
    };
  }
}

export const cardGroupService = new CardGroupService();
