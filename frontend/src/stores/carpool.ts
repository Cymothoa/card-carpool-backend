import { defineStore } from 'pinia';
import { apiClient } from '../services/api';

export type CarpoolStatus = 'incomplete' | 'complete' | 'locked' | 'driven' | 'cancelled';

export interface Carpool {
  id: number;
  card_group_id: number;
  creator_id: number;
  status: CarpoolStatus;
  created_at: string;
  updated_at: string;
  locked_at: string | null;
  driven_at: string | null;
  cancelled_at: string | null;
}

export interface CarpoolWithProgress extends Carpool {
  progress?: number;
  total_members?: number;
  assigned_members?: number;
  creator?: any;
}

export interface CarpoolWithAssignments extends CarpoolWithProgress {
  assignments?: MemberAssignment[];
}

export interface MemberAssignment {
  id: number;
  carpool_id: number;
  user_id: number;
  selected_members: number[]; // 用户选择的成员ID列表
  username: string; // 用户在此拼车中使用的名称
  assigned_at: string;
  replaced_at: string | null;
  user?: any;
}

export interface CreateCarpoolRequest {
  creator_name: string; // 创建者名称（必填）
  creator_id?: number; // 可选，用于预留权限功能
}

export interface CreateAssignmentRequest {
  username: string; // 用户在此拼车中使用的名称（必填）
  selected_members: number[]; // 用户选择的成员ID列表
  user_id?: number; // 可选，用于预留权限功能
}

export interface AssignmentResult {
  assignment: MemberAssignment;
  replaced: boolean;
  replaced_user_ids: number[]; // 被挤掉的用户ID列表
}

export const useCarpoolStore = defineStore('carpool', {
  state: () => ({
    carpools: [] as CarpoolWithProgress[],
    currentCarpool: null as CarpoolWithAssignments | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchCarpools(cardGroupId: number, status?: string) {
      this.loading = true;
      this.error = null;
      try {
        const params = status ? `?status=${status}` : '';
        const response = await apiClient.get<CarpoolWithProgress[]>(
          `/card-groups/${cardGroupId}/carpools${params}`
        );
        if (response.status === 'success' && response.data) {
          this.carpools = response.data;
        } else {
          this.error = response.error || '获取拼车列表失败';
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取拼车列表失败';
      } finally {
        this.loading = false;
      }
    },

    async fetchCarpool(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get<CarpoolWithAssignments>(`/carpools/${id}`);
        if (response.status === 'success' && response.data) {
          this.currentCarpool = response.data;
          return response.data;
        } else {
          this.error = response.error || '获取拼车详情失败';
          return null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取拼车详情失败';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createCarpool(cardGroupId: number, data: CreateCarpoolRequest) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post<Carpool>(`/card-groups/${cardGroupId}/carpools`, data);
        if (response.status === 'success' && response.data) {
          // 刷新拼车列表
          await this.fetchCarpools(cardGroupId);
          return response.data;
        } else {
          this.error = response.error || '创建拼车失败';
          return null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '创建拼车失败';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createAssignment(carpoolId: number, data: CreateAssignmentRequest) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post<AssignmentResult>(`/carpools/${carpoolId}/assignments`, data);
        if (response.status === 'success' && response.data) {
          // 刷新拼车详情
          await this.fetchCarpool(carpoolId);
          return response.data;
        } else {
          this.error = response.error || '分配成员失败';
          return null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '分配成员失败';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateCarpoolStatus(
      carpoolId: number,
      action: 'drive' | 'cancel' | 'sweep',
      ownerId: number,
      memberIds?: number[]
    ) {
      this.loading = true;
      this.error = null;
      try {
        const body: any = { action, owner_id: ownerId };
        if (action === 'sweep' && memberIds) {
          body.member_ids = memberIds;
        }
        const response = await apiClient.patch<Carpool>(`/carpools/${carpoolId}`, body);
        if (response.status === 'success' && response.data) {
          // 刷新当前拼车
          await this.fetchCarpool(carpoolId);
          // 刷新拼车列表（如果知道cardGroupId）
          if (this.currentCarpool?.card_group_id) {
            await this.fetchCarpools(this.currentCarpool.card_group_id);
          }
          return response.data;
        } else {
          this.error = response.error || '操作失败';
          return null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '操作失败';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async deleteAssignment(carpoolId: number, assignmentId: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.delete(`/carpools/${carpoolId}/assignments/${assignmentId}`);
        if (response.status === 'success') {
          // 刷新拼车详情
          await this.fetchCarpool(carpoolId);
          return true;
        } else {
          this.error = response.error || '退出拼车失败';
          return false;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '退出拼车失败';
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
