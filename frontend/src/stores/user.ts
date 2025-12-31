import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface User {
  id: number;
  username: string;
  display_name: string;
  user_type: 'owner' | 'member';
  created_at: string;
  updated_at: string;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
    users: [] as User[],
  }),
  actions: {
    setCurrentUser(user: User | null) {
      this.currentUser = user;
    },
    setUsers(users: User[]) {
      this.users = users;
    },
    async fetchUsers() {
      // TODO: 实现API调用
    },
  },
});
