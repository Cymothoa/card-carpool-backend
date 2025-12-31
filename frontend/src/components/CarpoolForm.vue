<template>
  <div class="carpool-form">
    <van-nav-bar title="创建拼车" left-text="取消" @click-left="$emit('cancel')" />

    <div class="form-content">
      <van-cell-group inset>
        <van-field
          v-model="creatorName"
          name="creator_name"
          label="创建者名称"
          placeholder="请输入您的名称（必填）"
          :rules="[{ required: true, message: '请输入创建者名称' }]"
          maxlength="50"
          show-word-limit
        />
      </van-cell-group>

      <div class="form-actions">
        <van-button type="primary" block @click="handleSubmit" :loading="loading" :disabled="!creatorName.trim()">
          创建拼车
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCarpoolStore } from '../stores/carpool';
import { useUserStore } from '../stores/user';
import { apiClient } from '../services/api';
import { showSuccessToast, showToast } from 'vant';

const props = defineProps<{
  cardGroupId: number;
  creatorId?: number; // 可选，用于预留权限功能
}>();

const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

const store = useCarpoolStore();
const userStore = useUserStore();
const loading = ref(false);

const creatorName = ref('');

// 初始化创建者名称（预留权限功能：如果以后需要，可以从系统用户获取）
onMounted(async () => {
  // 预留权限功能：如果提供了creatorId，可以尝试从系统获取用户信息
  if (props.creatorId && userStore.currentUser && userStore.currentUser.id === props.creatorId) {
    creatorName.value = userStore.currentUser.display_name || userStore.currentUser.username || '';
  } else if (props.creatorId) {
    // 尝试从API获取
    try {
      const response = await apiClient.get<any>(`/users/${props.creatorId}`);
      if (response.status === 'success' && response.data) {
        creatorName.value = response.data.display_name || response.data.username || '';
        userStore.setCurrentUser(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }
  // 如果没有设置，留空让用户输入
});

const handleSubmit = async () => {
  if (!creatorName.value.trim()) {
    showToast('请输入创建者名称');
    return;
  }

  loading.value = true;
  try {
    // 使用输入的名称创建拼车，不依赖系统用户
    const result = await store.createCarpool(props.cardGroupId, {
      creator_name: creatorName.value.trim(),
      // 预留权限功能：如果以后需要，可以传入creator_id
      // creator_id: userStore.currentUser?.id,
    });
    if (result) {
      showSuccessToast('创建成功');
      emit('success');
    } else {
      showToast(store.error || '创建失败');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.carpool-form {
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
