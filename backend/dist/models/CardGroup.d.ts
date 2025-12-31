export interface CardGroup {
    id: number;
    name: string;
    owner_id: number;
    deadline: string | null;
    created_at: string;
    updated_at: string;
}
import { Member } from './Member.js';
import { User } from './User.js';
export interface CardGroupWithMembers extends CardGroup {
    members?: Member[];
    owner?: User;
}
export interface CreateCardGroupRequest {
    name: string;
    owner_id: number;
    deadline?: string | null;
}
export interface UpdateCardGroupRequest {
    name?: string;
    deadline?: string | null;
}
//# sourceMappingURL=CardGroup.d.ts.map