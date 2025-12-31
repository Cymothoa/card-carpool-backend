import db from '../db/connection.js';
import {
  Carpool,
  CarpoolWithProgress,
  CarpoolWithAssignments,
  CreateCarpoolRequest,
  UpdateCarpoolRequest,
} from '../models/Carpool.js';
import { logger } from '../utils/logger.js';

export class CarpoolService {
  /**
   * 创建拼车
   * 预留权限功能：creator_id可选，主要用于预留后续权限验证
   */
  create(cardGroupId: number, data: CreateCarpoolRequest): Carpool {
    const { creator_name, creator_id } = data;

    // 验证
    if (!creator_name || creator_name.trim().length === 0) {
      throw new Error('创建者名称不能为空');
    }
    if (creator_name.trim().length > 50) {
      throw new Error('创建者名称不能超过50个字符');
    }

    // 检查卡组是否存在
    const cardGroup = db.prepare('SELECT id, deadline FROM card_groups WHERE id = ?').get(cardGroupId) as { id: number; deadline: string | null } | undefined;
    if (!cardGroup) {
      throw new Error('卡组不存在');
    }

    // 检查卡组是否超过截止时间
    if (cardGroup.deadline) {
      const deadline = new Date(cardGroup.deadline);
      const now = new Date();
      if (now > deadline) {
        throw new Error('卡组已超过截止时间，不能创建拼车');
      }
    }

    // 预留权限功能：如果提供了creator_id，验证用户是否存在（暂时不强制）
    if (creator_id) {
      const creator = db.prepare('SELECT id FROM users WHERE id = ?').get(creator_id);
      if (!creator) {
        // 暂时不强制，只记录警告
        logger.warn(`Creator ID ${creator_id} not found, but continuing without user association`);
      }
    }

    const stmt = db.prepare(`
      INSERT INTO carpools (card_group_id, creator_id, creator_name, status)
      VALUES (?, ?, ?, 'incomplete')
    `);

    const result = stmt.run(cardGroupId, creator_id || null, creator_name.trim());
    const carpool = this.getById(result.lastInsertRowid as number);

    logger.info(`Carpool created: ${carpool.id} for card group ${cardGroupId} by ${creator_name}`);
    return carpool;
  }

  /**
   * 获取卡组的所有拼车（按规则排序）
   * 排序规则：拼齐的在上，未拼齐的在下；未拼齐的按进度排序，进度相同按时间排序
   */
  getByCardGroup(cardGroupId: number, status?: string): CarpoolWithProgress[] {
    // 检查卡组是否存在
    const cardGroup = db.prepare('SELECT id FROM card_groups WHERE id = ?').get(cardGroupId);
    if (!cardGroup) {
      throw new Error('卡组不存在');
    }

    let query = `
      SELECT c.*
      FROM carpools c
      WHERE c.card_group_id = ?
    `;
    const params: any[] = [cardGroupId];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    const carpools = db.prepare(query).all(...params) as any[];

    // 获取卡组的所有成员数量
    const totalMembers = db
      .prepare('SELECT COUNT(*) as count FROM members WHERE card_group_id = ?')
      .get(cardGroupId) as { count: number };
    const total = totalMembers.count || 0;

    // 计算每个拼车的进度
    const carpoolsWithProgress: CarpoolWithProgress[] = carpools.map((c) => {
      // 获取该拼车的所有活跃分配的selected_members
      const activeAssignments = db
        .prepare(`
          SELECT selected_members
          FROM member_assignments
          WHERE carpool_id = ? AND replaced_at IS NULL
        `)
        .all(c.id) as { selected_members: string }[];

      // 统计已分配的成员（去重）
      const assignedMemberIds = new Set<number>();
      for (const assignment of activeAssignments) {
        try {
          const selectedMembers = JSON.parse(assignment.selected_members || '[]') as number[];
          for (const memberId of selectedMembers) {
            assignedMemberIds.add(memberId);
          }
        } catch (error) {
          logger.error(`Failed to parse selected_members for carpool ${c.id}: ${assignment.selected_members}`);
        }
      }

      const assigned = assignedMemberIds.size;
      const progress = total > 0 ? Math.round((assigned / total) * 100) : 0;

      // 获取创建者信息（预留权限功能）
      let creator: any = null;
      if (c.creator_id) {
        creator = db.prepare('SELECT * FROM users WHERE id = ?').get(c.creator_id) as any;
      }
      
      // 如果没有系统用户，使用creator_name
      if (!creator && c.creator_name) {
        creator = {
          id: null,
          username: c.creator_name,
          display_name: c.creator_name,
          user_type: 'member',
        };
      }

      return {
        ...c,
        total_members: total,
        assigned_members: assigned,
        progress,
        creator,
      };
    });

    // 排序：拼齐的在上，未拼齐的在下；未拼齐的按进度排序，进度相同按时间排序
    carpoolsWithProgress.sort((a, b) => {
      // 首先按状态排序：locked/complete/driven 在上，incomplete 在下
      const statusOrder: Record<string, number> = {
        locked: 1,
        complete: 2,
        driven: 3,
        incomplete: 4,
        cancelled: 5,
      };
      const statusDiff = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
      if (statusDiff !== 0) {
        return statusDiff;
      }

      // 如果都是未拼齐，按进度排序（进度高的在上）
      if (a.status === 'incomplete' && b.status === 'incomplete') {
        const progressDiff = (b.progress || 0) - (a.progress || 0);
        if (progressDiff !== 0) {
          return progressDiff;
        }
      }

      // 进度相同或都是拼齐的，按创建时间排序（先创建的在上）
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    return carpoolsWithProgress;
  }

  /**
   * 根据ID获取拼车
   */
  getById(id: number): Carpool {
    const carpool = db.prepare('SELECT * FROM carpools WHERE id = ?').get(id) as Carpool | undefined;

    if (!carpool) {
      throw new Error(`拼车不存在: ${id}`);
    }

    return carpool;
  }

  /**
   * 获取拼车详情（包含分配信息）
   */
  getWithAssignments(id: number): CarpoolWithAssignments {
    const carpool = this.getById(id);

    // 获取卡组的所有成员
    const totalMembers = db
      .prepare('SELECT COUNT(*) as count FROM members WHERE card_group_id = ?')
      .get(carpool.card_group_id) as { count: number };

    // 获取活跃的成员分配（只显示当前拼到的用户）
    const assignments = db
      .prepare(`
        SELECT ma.*, u.username as username_sys, u.display_name
        FROM member_assignments ma
        LEFT JOIN users u ON ma.user_id = u.id
        WHERE ma.carpool_id = ? AND ma.replaced_at IS NULL
        ORDER BY ma.assigned_at
      `)
      .all(id) as any[];

    // 解析selected_members JSON，如果没有系统用户，使用username作为显示名称
    const assignmentsWithParsed = assignments.map((a) => ({
      ...a,
      selected_members: JSON.parse(a.selected_members || '[]'),
      // 如果没有系统用户，创建一个虚拟用户对象用于显示
      user: a.user_id && a.username_sys ? {
        id: a.user_id,
        username: a.username_sys,
        display_name: a.display_name || a.username_sys,
      } : {
        id: null,
        username: a.username,
        display_name: a.username,
      },
    }));

    // 计算已分配的成员数量（去重）
    const assignedMemberIds = new Set<number>();
    for (const assignment of assignmentsWithParsed) {
      for (const memberId of assignment.selected_members) {
        assignedMemberIds.add(memberId);
      }
    }

    const assignedCount = assignedMemberIds.size;
    const total = totalMembers.count || 0;
    const progress = total > 0 ? Math.round((assignedCount / total) * 100) : 0;

    // 获取创建者信息（预留权限功能）
    let creator: any = null;
    if (carpool.creator_id) {
      creator = db.prepare('SELECT * FROM users WHERE id = ?').get(carpool.creator_id) as any;
    }
    
    // 如果没有系统用户，使用creator_name
    if (!creator && carpool.creator_name) {
      creator = {
        id: null,
        username: carpool.creator_name,
        display_name: carpool.creator_name,
        user_type: 'member',
      };
    }

    return {
      ...carpool,
      total_members: total,
      assigned_members: assignedCount,
      progress,
      assignments: assignmentsWithParsed,
      creator,
    };
  }

  /**
   * 检查拼车是否拼齐，如果拼齐则自动锁定
   * 新逻辑：所有成员都被且只被一个用户选择
   */
  checkAndLockIfComplete(carpoolId: number): boolean {
    const carpool = this.getById(carpoolId);

    // 如果已经锁定或完成，不需要检查
    if (carpool.status === 'locked' || carpool.status === 'complete' || carpool.status === 'driven' || carpool.status === 'cancelled') {
      return false;
    }

    // 获取卡组的所有成员ID
    const allMembers = db
      .prepare('SELECT id FROM members WHERE card_group_id = ?')
      .all(carpool.card_group_id) as { id: number }[];
    const allMemberIds = new Set(allMembers.map((m) => m.id));

    // 获取所有活跃分配的selected_members
    const activeAssignments = db
      .prepare(`
        SELECT selected_members
        FROM member_assignments
        WHERE carpool_id = ? AND replaced_at IS NULL
      `)
      .all(carpoolId) as { selected_members: string }[];

    // 统计每个成员被选择的次数
    const memberCount = new Map<number, number>();
    for (const assignment of activeAssignments) {
      const selectedMembers = JSON.parse(assignment.selected_members || '[]') as number[];
      for (const memberId of selectedMembers) {
        memberCount.set(memberId, (memberCount.get(memberId) || 0) + 1);
      }
    }

    // 检查：所有成员都被选择，且每个成员只被选择一次
    let allAssigned = true;
    let allUnique = true;

    for (const memberId of allMemberIds) {
      const count = memberCount.get(memberId) || 0;
      if (count === 0) {
        allAssigned = false;
        break;
      }
      if (count > 1) {
        allUnique = false;
        break;
      }
    }

    // 如果所有成员都被且只被一个用户选择，标记为complete并锁定
    if (allAssigned && allUnique && allMemberIds.size > 0) {
      const now = new Date().toISOString();
      db.prepare(`
        UPDATE carpools
        SET status = 'locked',
            locked_at = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(now, carpoolId);

      logger.info(`Carpool ${carpoolId} is now complete and locked`);
      return true;
    }

    return false;
  }

  /**
   * 更新拼车状态（开车、炸车、扫尾）
   * 预留权限功能：ownerId可选，主要用于预留后续权限验证
   */
  updateStatus(carpoolId: number, data: UpdateCarpoolRequest, ownerId?: number | null): Carpool {
    const carpool = this.getById(carpoolId);

    // 预留权限功能：如果提供了ownerId，验证车主权限（暂时不强制）
    if (ownerId) {
      const cardGroup = db.prepare('SELECT owner_id FROM card_groups WHERE id = ?').get(carpool.card_group_id) as {
        owner_id: number;
      } | undefined;
      if (cardGroup && cardGroup.owner_id !== ownerId) {
        throw new Error('只有车主可以执行此操作');
      }
    }

    const { action, member_ids } = data;
    const now = new Date().toISOString();

    if (action === 'drive') {
      // 开车：只有已锁定的拼车才能开车
      if (carpool.status !== 'locked') {
        throw new Error('只有已锁定的拼车才能开车');
      }

      db.prepare(`
        UPDATE carpools
        SET status = 'driven',
            driven_at = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(now, carpoolId);

      logger.info(`Carpool ${carpoolId} driven by owner ${ownerId}`);
    } else if (action === 'cancel') {
      // 炸车：取消拼车，移除所有分配
      if (carpool.status === 'driven' || carpool.status === 'cancelled') {
        throw new Error('已开车或已取消的拼车不能再次取消');
      }

      // 标记所有分配为被替换（实际上就是移除）
      db.prepare(`
        UPDATE member_assignments
        SET replaced_at = ?
        WHERE carpool_id = ? AND replaced_at IS NULL
      `).run(now, carpoolId);

      db.prepare(`
        UPDATE carpools
        SET status = 'cancelled',
            cancelled_at = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(now, carpoolId);

      logger.info(`Carpool ${carpoolId} cancelled by owner ${ownerId}`);
    } else if (action === 'sweep') {
      // 扫尾：车主为自己分配剩余未分配的成员
      if (carpool.status === 'locked' || carpool.status === 'driven' || carpool.status === 'cancelled') {
        throw new Error('已锁定、已开车或已取消的拼车不能扫尾');
      }

      if (!member_ids || member_ids.length === 0) {
        throw new Error('扫尾时必须指定要分配的成员ID列表');
      }

      // 获取卡组的所有成员
      const allMembers = db
        .prepare('SELECT id FROM members WHERE card_group_id = ?')
        .all(carpool.card_group_id) as { id: number }[];

      // 获取已分配的成员ID
      const assignedMemberIds = db
        .prepare(`
          SELECT DISTINCT member_id
          FROM member_assignments
          WHERE carpool_id = ? AND replaced_at IS NULL
        `)
        .all(carpoolId) as { member_id: number }[];

      const assignedIds = new Set(assignedMemberIds.map((a) => a.member_id));
      const allMemberIds = new Set(allMembers.map((m) => m.id));

      // 验证member_ids都是未分配的成员
      for (const memberId of member_ids) {
        if (!allMemberIds.has(memberId)) {
          throw new Error(`成员 ${memberId} 不属于此卡组`);
        }
        if (assignedIds.has(memberId)) {
          throw new Error(`成员 ${memberId} 已被分配`);
        }
      }

      // 为车主分配这些成员（不带其他成员）
      const insertStmt = db.prepare(`
        INSERT INTO member_assignments (carpool_id, member_id, user_id, brought_members)
        VALUES (?, ?, ?, ?)
      `);

      for (const memberId of member_ids) {
        insertStmt.run(carpoolId, memberId, ownerId, JSON.stringify([]));
      }

      // 检查是否拼齐
      this.checkAndLockIfComplete(carpoolId);

      logger.info(`Carpool ${carpoolId} swept by owner ${ownerId}, assigned ${member_ids.length} members`);
    } else {
      throw new Error(`未知的操作类型: ${action}`);
    }

    return this.getById(carpoolId);
  }
}

export const carpoolService = new CarpoolService();
