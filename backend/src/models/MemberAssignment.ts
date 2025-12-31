import { Member } from './Member.js';
import { User } from './User.js';

export interface MemberAssignment {
  id: number;
  carpool_id: number;
  user_id: number | null; // 可选，用于预留权限功能
  selected_members: number[]; // 用户选择的成员ID列表
  username: string; // 用户在此拼车中使用的名称（主要标识）
  assigned_at: string;
  replaced_at: string | null;
  user?: User; // 可选，用于预留权限功能
}

export interface CreateAssignmentRequest {
  username: string; // 用户在此拼车中使用的名称（必填，用于区分）
  selected_members: number[]; // 用户选择的成员ID列表
  user_id?: number; // 可选，用于预留权限功能（暂时不使用）
}

export interface AssignmentResult {
  assignment: MemberAssignment;
  replaced: boolean; // 是否挤掉了其他用户
  replaced_user_ids: number[]; // 被挤掉的用户ID列表
}
