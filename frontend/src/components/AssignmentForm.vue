<template>
  <div class="assignment-form">
    <van-nav-bar title="加入拼车" left-text="取消" @click-left="$emit('cancel')" />

    <div class="form-content">
      <van-cell-group inset>
        <van-field
          v-model="inputUsername"
          name="username"
          label="您的名称"
          placeholder="请输入您的名称（必填，用于区分）"
          :rules="[{ required: true, message: '请输入您的名称' }]"
          maxlength="50"
          show-word-limit
        />
      </van-cell-group>

      <!-- 选择要拼的卡（多选） -->
      <van-cell-group inset title="选择要拼的卡（可多选，多带者得）">
        <van-checkbox-group v-model="selectedMemberIds" direction="vertical">
          <van-cell
            v-for="member in allMembers"
            :key="member.id"
            :title="getMemberTitle(member)"
            clickable
            @click="toggleMember(member.id)"
          >
            <template #right-icon>
              <van-checkbox :name="member.id" />
            </template>
          </van-cell>
        </van-checkbox-group>
      </van-cell-group>

      <div class="form-actions">
        <van-button
          type="primary"
          block
          @click="handleSubmit"
          :loading="loading"
          :disabled="selectedMemberIds.length === 0"
        >
          加入拼车
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCarpoolStore, CarpoolWithAssignments } from '../stores/carpool';
import { useUserStore } from '../stores/user';
import { useCardGroupStore } from '../stores/cardGroup';
import { showSuccessToast, showToast } from 'vant';

const props = defineProps<{
  carpool: CarpoolWithAssignments;
  cardGroupId: number;
  userId?: number; // 可选，用于预留权限功能
}>();

const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

const store = useCarpoolStore();
const userStore = useUserStore();
const cardGroupStore = useCardGroupStore();
const loading = ref(false);

const selectedMemberIds = ref<number[]>([]);
const inputUsername = ref('');

// 获取所有成员
const allMembers = computed(() => {
  if (!cardGroupStore.currentCardGroup?.members) {
    return [];
  }
  return cardGroupStore.currentCardGroup.members;
});

// 获取成员标题（显示是否已被分配）
const getMemberTitle = (member: any) => {
  // 检查该成员是否被当前拼车中的用户选择
  const assignment = (props.carpool.assignments || []).find(
    (a: any) => a.selected_members && a.selected_members.includes(member.id) && !a.replaced_at
  );
  if (assignment) {
    const userName = assignment.username || assignment.user?.display_name || assignment.user?.username || '未知用户';
    const cardCount = assignment.selected_members?.length || 0;
    return `${member.member_name || `成员 ${member.member_number}`} (已被 ${userName} 选择，共${cardCount}张)`;
  }
  return member.member_name || `成员 ${member.member_number}`;
};

const toggleMember = (memberId: number) => {
  const index = selectedMemberIds.value.indexOf(memberId);
  if (index > -1) {
    selectedMemberIds.value.splice(index, 1);
  } else {
    selectedMemberIds.value.push(memberId);
  }
};

const handleSubmit = async () => {
  if (!inputUsername.value.trim()) {
    showToast('请输入您的名称');
    return;
  }
  if (selectedMemberIds.value.length === 0) {
    showToast('请至少选择一张卡');
    return;
  }

  loading.value = true;
  try {
    // 使用输入的用户名创建分配，不依赖系统用户
    const result = await store.createAssignment(props.carpool.id, {
      username: inputUsername.value.trim(),
      selected_members: selectedMemberIds.value,
      // 预留权限功能：如果以后需要，可以传入user_id
      // user_id: props.userId,
    });
    if (result) {
      if (result.replaced && result.replaced_user_ids && result.replaced_user_ids.length > 0) {
        showSuccessToast(`挤车成功！挤掉了${result.replaced_user_ids.length}个用户`);
      } else {
        showSuccessToast('加入成功！');
      }
      emit('success');
    } else {
      showToast(store.error || '加入失败');
    }
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  // 加载卡组信息以获取成员列表
  if (props.cardGroupId) {
    await cardGroupStore.fetchCardGroup(props.cardGroupId);
  }
  // 设置默认用户名
  if (userStore.currentUser) {
    inputUsername.value = userStore.currentUser.display_name || userStore.currentUser.username || '';
  }
});
</script>

<style scoped>
.assignment-form {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.form-actions {
  margin-top: 24px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .form-content {
    padding: 12px;
  }
}
</style>
