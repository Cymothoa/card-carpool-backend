import { Carpool, CarpoolWithProgress, CarpoolWithAssignments, CreateCarpoolRequest, UpdateCarpoolRequest } from '../models/Carpool.js';
export declare class CarpoolService {
    /**
     * 创建拼车
     * 预留权限功能：creator_id可选，主要用于预留后续权限验证
     */
    create(cardGroupId: number, data: CreateCarpoolRequest): Carpool;
    /**
     * 获取卡组的所有拼车（按规则排序）
     * 排序规则：拼齐的在上，未拼齐的在下；未拼齐的按进度排序，进度相同按时间排序
     */
    getByCardGroup(cardGroupId: number, status?: string): CarpoolWithProgress[];
    /**
     * 根据ID获取拼车
     */
    getById(id: number): Carpool;
    /**
     * 获取拼车详情（包含分配信息）
     */
    getWithAssignments(id: number): CarpoolWithAssignments;
    /**
     * 检查拼车是否拼齐，如果拼齐则自动锁定
     * 新逻辑：所有成员都被且只被一个用户选择
     */
    checkAndLockIfComplete(carpoolId: number): boolean;
    /**
     * 更新拼车状态（开车、炸车、扫尾）
     * 预留权限功能：ownerId可选，主要用于预留后续权限验证
     */
    updateStatus(carpoolId: number, data: UpdateCarpoolRequest, ownerId?: number | null): Carpool;
}
export declare const carpoolService: CarpoolService;
//# sourceMappingURL=CarpoolService.d.ts.map