<template>
  <Layout>
    <template #header>
      <van-nav-bar
        title="拼车详情"
        left-text="返回"
        left-arrow
        @click-left="$router.back()"
      />
    </template>

    <van-loading v-if="store.loading" type="spinner" vertical>加载中...</van-loading>

    <div v-else-if="store.currentCarpool" class="carpool-detail">
      <!-- 拼车信息 -->
      <van-cell-group inset>
        <van-cell title="拼车ID" :value="`#${store.currentCarpool.id}`" />
        <van-cell title="状态" :value="getStatusText()" />
        <van-cell
          title="进度"
          :value="`${store.currentCarpool.progress || 0}% (${store.currentCarpool.assigned_members || 0}/${store.currentCarpool.total_members || 0})`"
        />
        <van-cell
          title="创建时间"
          :value="formatDate(store.currentCarpool.created_at)"
        />
      </van-cell-group>

      <!-- 成员分配列表 -->
      <div class="assignments-section">
        <van-cell-group inset>
          <van-cell title="成员分配" />
        </van-cell-group>
        <div v-if="assignments.length === 0" class="empty-assignments">
          <van-empty description="还没有成员分配" />
        </div>
        <van-cell-group v-else inset>
          <van-cell
            v-for="assignment in assignments"
            :key="assignment.id"
            :title="getMemberName(assignment)"
          >
            <template #label>
              <div class="assignment-label">
                <span class="label-text">已拼：</span>
                <van-tag
                  v-for="memberId in assignment.selected_members"
                  :key="memberId"
                  type="primary"
                  class="member-tag"
                >
                  {{ getMemberDisplayName(memberId) }}
                </van-tag>
                <span class="time-text">{{ formatDate(assignment.assigned_at) }}</span>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 操作按钮 -->
      <div v-if="canAssign" class="actions">
        <van-button
          type="primary"
          block
          @click="showAssignmentForm = true"
          :disabled="isLocked"
        >
          {{ isLocked ? '拼车已锁定' : '加入拼车' }}
        </van-button>
      </div>
    </div>

    <van-empty v-else description="拼车不存在" />
  </Layout>

  <!-- 成员分配表单 -->
  <van-popup
    v-model:show="showAssignmentForm"
    position="bottom"
    :style="{ height: '70%' }"
    round
  >
    <AssignmentForm
      :carpool="store.currentCarpool!"
      :card-group-id="cardGroupId"
      :user-id="currentUserId || undefined"
      @success="handleAssignmentSuccess"
      @cancel="showAssignmentForm = false"
    />
  </van-popup>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCarpoolStore, CarpoolWithAssignments, MemberAssignment } from '../stores/carpool';
import { useUserStore } from '../stores/user';
import { useCardGroupStore } from '../stores/cardGroup';
import Layout from '../components/Layout.vue';
import AssignmentForm from '../components/AssignmentForm.vue';

const route = useRoute();
const router = useRouter();
const store = useCarpoolStore();
const userStore = useUserStore();
const cardGroupStore = useCardGroupStore();
const showAssignmentForm = ref(false);

const carpoolId = parseInt(route.params.id as string, 10);
const cardGroupId = computed(() => store.currentCarpool?.card_group_id || 0);
// 预留权限功能：如果以后需要用户ID，可以从这里获取
const currentUserId = computed(() => userStore.currentUser?.id || null);

const assignments = computed(() => {
  return store.currentCarpool?.assignments || [];
});

const isLocked = computed(() => {
  return store.currentCarpool?.status === 'locked' || 
         store.currentCarpool?.status === 'driven' || 
         store.currentCarpool?.status === 'cancelled';
});

const canAssign = computed(() => {
  return !isLocked.value;
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusText = () => {
  const statusMap: Record<string, string> = {
    incomplete: '未拼齐',
    complete: '已拼齐',
    locked: '已锁定',
    driven: '已开车',
    cancelled: '已取消',
  };
  return statusMap[store.currentCarpool?.status || ''] || '未知';
};

// 获取卡组成员信息（用于显示成员名称）
const getCardGroupMembers = computed(() => {
  // 从卡组store获取成员信息
  return cardGroupStore.currentCardGroup?.members || [];
});

const getMemberName = (assignment: MemberAssignment) => {
  const userName = assignment.username || assignment.user?.display_name || assignment.user?.username || '未知用户';
  return userName;
};

const getMemberDisplayName = (memberId: number) => {
  const member = getCardGroupMembers.value.find((m: any) => m.id === memberId);
  if (member) {
    return member.member_name || `成员${member.member_number}`;
  }
  return `成员${memberId}`;
};

const getAssignmentLabel = (assignment: MemberAssignment) => {
  // 这个方法现在只用于fallback，实际显示在template中使用tag
  const parts: string[] = [];
  if (assignment.selected_members && assignment.selected_members.length > 0) {
    parts.push(`已拼: ${assignment.selected_members.length}张卡`);
  }
  parts.push(`时间: ${formatDate(assignment.assigned_at)}`);
  return parts.join(' | ');
};

const handleAssignmentSuccess = async () => {
  showAssignmentForm.value = false;
  await store.fetchCarpool(carpoolId);
};

onMounted(async () => {
  if (!isNaN(carpoolId)) {
    await store.fetchCarpool(carpoolId);
    // 加载卡组信息以获取成员列表
    if (store.currentCarpool?.card_group_id) {
      await cardGroupStore.fetchCardGroup(store.currentCarpool.card_group_id);
    }
  }
});
</script>

<style scoped>
.van-cell-group--inset {
  margin-bottom: 10px;
}
.carpool-detail {
  padding-bottom: 80px;
}

.assignments-section {
  margin-top: 15px;
}

.empty-assignments {
  padding: 24px;
}

.assignment-label {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.label-text {
  font-size: 14px;
  color: #969799;
}

.member-tag {
  margin-right: 4px;
}

.time-text {
  font-size: 12px;
  color: #969799;
  margin-left: auto;
}

.actions {
  margin-top: 24px;
  padding: 0 16px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .carpool-detail {
    padding-bottom: 80px;
  }

  .actions {
    padding: 0 12px;
    margin-top: 16px;
  }
}
</style>
