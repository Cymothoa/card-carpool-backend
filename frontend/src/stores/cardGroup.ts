import { defineStore } from 'pinia';
import { apiClient } from '../services/api';

export interface CardGroup {
  id: number;
  name: string;
  owner_id: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  members?: Member[];
  owner?: any;
}

export interface Member {
  id: number;
  card_group_id: number;
  member_number: string;
  member_name: string | null;
  created_at: string;
}

export interface CreateCardGroupRequest {
  name: string;
  owner_id: number;
  deadline?: string | null;
}

export const useCardGroupStore = defineStore('cardGroup', {
  state: () => ({
    cardGroups: [] as CardGroup[],
    currentCardGroup: null as CardGroup | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchCardGroups(ownerId?: number) {
      this.loading = true;
      this.error = null;
      try {
        const params = ownerId ? `?owner_id=${ownerId}` : '';
        const response = await apiClient.get<CardGroup[]>(`/card-groups${params}`);
        if (response.status === 'success' && response.data) {
          this.cardGroups = response.data;
        } else {
          this.error = response.error || '获取卡组列表失败';
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取卡组列表失败';
      } finally {
        this.loading = false;
      }
    },

    async fetchCardGroup(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get<CardGroup>(`/card-groups/${id}`);
        if (response.status === 'success' && response.data) {
          this.currentCardGroup = response.data;
          return response.data;
        } else {
          this.error = response.error || '获取卡组详情失败';
          return null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取卡组详情失败';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createCardGroup(data: CreateCardGroupRequest) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post<CardGroup>('/card-groups', data);
        if (response.status === 'success' && response.data) {
          this.cardGroups.unshift(response.data);
          return response.data;
        } else {
          this.error = response.error || '创建卡组失败';
          return null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '创建卡组失败';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateCardGroup(id: number, data: Partial<CreateCardGroupRequest>) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.put<CardGroup>(`/card-groups/${id}`, data);
        if (response.status === 'success' && response.data) {
          const index = this.cardGroups.findIndex((cg) => cg.id === id);
          if (index !== -1) {
            this.cardGroups[index] = response.data;
          }
          if (this.currentCardGroup?.id === id) {
            this.currentCardGroup = response.data;
          }
          return response.data;
        } else {
          this.error = response.error || '更新卡组失败';
          return null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新卡组失败';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async deleteCardGroup(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.delete(`/card-groups/${id}`);
        if (response.status === 'success') {
          this.cardGroups = this.cardGroups.filter((cg) => cg.id !== id);
          if (this.currentCardGroup?.id === id) {
            this.currentCardGroup = null;
          }
          return true;
        } else {
          this.error = response.error || '删除卡组失败';
          return false;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '删除卡组失败';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async addMember(cardGroupId: number, memberNumber: string, memberName?: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post<Member>(`/card-groups/${cardGroupId}/members`, {
          member_number: memberNumber,
          member_name: memberName || null,
        });
        if (response.status === 'success' && response.data) {
          // 刷新当前卡组
          if (this.currentCardGroup?.id === cardGroupId) {
            await this.fetchCardGroup(cardGroupId);
          }
          return response.data;
        } else {
          this.error = response.error || '添加成员失败';
          return null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '添加成员失败';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async bulkAddMembers(cardGroupId: number, preset: 'cortis_all') {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post<Member[]>(`/card-groups/${cardGroupId}/members/bulk`, {
          preset,
        });
        if (response.status === 'success' && response.data) {
          // 刷新当前卡组
          if (this.currentCardGroup?.id === cardGroupId) {
            await this.fetchCardGroup(cardGroupId);
          }
          return response.data;
        } else {
          this.error = response.error || '批量添加成员失败';
          return null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '批量添加成员失败';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async deleteMember(memberId: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.delete(`/members/${memberId}`);
        if (response.status === 'success') {
          // 刷新当前卡组
          if (this.currentCardGroup) {
            await this.fetchCardGroup(this.currentCardGroup.id);
          }
          return true;
        } else {
          this.error = response.error || '删除成员失败';
          return false;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '删除成员失败';
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
