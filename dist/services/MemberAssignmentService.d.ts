import { MemberAssignment, CreateAssignmentRequest, AssignmentResult } from '../models/MemberAssignment.js';
export declare class MemberAssignmentService {
    /**
     * 创建成员分配（加入拼车或挤车）
     * 新逻辑：用户选择一套卡（多选），如果选择的卡中有任何一张已被其他人选择，需要PK总卡数
     * 多带者得：总卡数多的可以挤掉总卡数少的
     * 如果总卡数相同，则按照时间先后，先加入的用户获得
     */
    create(carpoolId: number, data: CreateAssignmentRequest): AssignmentResult;
    /**
     * 获取拼车的所有成员分配（只返回当前拼到的用户，被挤掉的不显示）
     */
    getByCarpool(carpoolId: number, activeOnly?: boolean): MemberAssignment[];
    /**
     * 根据ID获取成员分配
     */
    getById(id: number): MemberAssignment;
    /**
     * 删除成员分配（退出拼车）
     */
    delete(id: number): void;
}
export declare const memberAssignmentService: MemberAssignmentService;
//# sourceMappingURL=MemberAssignmentService.d.ts.map