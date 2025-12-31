import { CardGroup, CreateCardGroupRequest, UpdateCardGroupRequest } from '../models/CardGroup.js';
export declare class CardGroupService {
    /**
     * 创建卡组
     */
    create(data: CreateCardGroupRequest): CardGroup;
    /**
     * 获取所有卡组
     */
    getAll(ownerId?: number): CardGroup[];
    /**
     * 根据ID获取卡组
     */
    getById(id: number): CardGroup;
    /**
     * 更新卡组
     */
    update(id: number, data: UpdateCardGroupRequest): CardGroup;
    /**
     * 删除卡组
     */
    delete(id: number): void;
    /**
     * 获取卡组及其成员
     */
    getWithMembers(id: number): {
        members: any[];
        owner: any;
        id: number;
        name: string;
        owner_id: number;
        deadline: string | null;
        created_at: string;
        updated_at: string;
    };
}
export declare const cardGroupService: CardGroupService;
//# sourceMappingURL=CardGroupService.d.ts.map