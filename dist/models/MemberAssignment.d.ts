import { User } from './User.js';
export interface MemberAssignment {
    id: number;
    carpool_id: number;
    user_id: number | null;
    selected_members: number[];
    username: string;
    assigned_at: string;
    replaced_at: string | null;
    user?: User;
}
export interface CreateAssignmentRequest {
    username: string;
    selected_members: number[];
    user_id?: number;
}
export interface AssignmentResult {
    assignment: MemberAssignment;
    replaced: boolean;
    replaced_user_ids: number[];
}
//# sourceMappingURL=MemberAssignment.d.ts.map