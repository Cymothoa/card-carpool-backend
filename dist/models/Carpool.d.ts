export type CarpoolStatus = 'incomplete' | 'complete' | 'locked' | 'driven' | 'cancelled';
export interface Carpool {
    id: number;
    card_group_id: number;
    creator_id: number | null;
    creator_name: string | null;
    status: CarpoolStatus;
    created_at: string;
    updated_at: string;
    locked_at: string | null;
    driven_at: string | null;
    cancelled_at: string | null;
}
import { User } from './User.js';
import { MemberAssignment } from './MemberAssignment.js';
export interface CarpoolWithProgress extends Carpool {
    progress?: number;
    total_members?: number;
    assigned_members?: number;
    creator?: User;
}
export interface CarpoolWithAssignments extends CarpoolWithProgress {
    assignments?: MemberAssignment[];
}
export interface CreateCarpoolRequest {
    creator_name: string;
    creator_id?: number;
}
export interface UpdateCarpoolRequest {
    action: 'drive' | 'cancel' | 'sweep';
    member_ids?: number[];
}
//# sourceMappingURL=Carpool.d.ts.map