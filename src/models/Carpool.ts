export type CarpoolStatus = 'incomplete' | 'complete' | 'locked' | 'driven' | 'cancelled';

export interface Carpool {
  id: number;
  card_group_id: number;
  creator_id: number | null; // 可选，用于预留权限功能
  creator_name: string | null; // 创建者名称（用于显示，不依赖系统用户）
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
  creator_name: string; // 创建者名称（必填，用于显示）
  creator_id?: number; // 可选，用于预留权限功能（暂时不使用）
}

export interface UpdateCarpoolRequest {
  action: 'drive' | 'cancel' | 'sweep';
  member_ids?: number[]; // 扫尾时，车主为自己分配的成员ID列表
}
