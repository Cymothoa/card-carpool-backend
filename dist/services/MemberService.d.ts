import { Member, CreateMemberRequest, BulkCreateMembersRequest } from '../models/Member.js';
export declare class MemberService {
    /**
     * 创建成员
     */
    create(cardGroupId: number, data: CreateMemberRequest): Member;
    /**
     * 批量创建成员（cortis全员预设）
     */
    bulkCreate(cardGroupId: number, data: BulkCreateMembersRequest): Member[];
    /**
     * 获取卡组的所有成员
     */
    getByCardGroup(cardGroupId: number): Member[];
    /**
     * 根据ID获取成员
     */
    getById(id: number): Member;
    /**
     * 删除成员
     */
    delete(id: number): void;
}
export declare const memberService: MemberService;
//# sourceMappingURL=MemberService.d.ts.map