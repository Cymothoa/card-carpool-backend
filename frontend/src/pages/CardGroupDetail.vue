<template>
  <Layout>
    <template #header>
      <van-nav-bar
        :title="store.currentCardGroup?.name || '卡组详情'"
        left-text="返回"
        left-arrow
        @click-left="$router.back()"
      />
    </template>

    <van-loading v-if="store.loading" type="spinner" vertical>加载中...</van-loading>

    <div v-else-if="store.currentCardGroup" class="card-group-detail">
      <!-- 卡组信息 -->
      <van-cell-group inset>
        <van-cell title="卡组名称" :value="store.currentCardGroup.name" />
        <van-cell
          title="截止时间"
          :value="store.currentCardGroup.deadline ? formatDate(store.currentCardGroup.deadline) : '未设置'"
        />
        <van-cell
          title="创建时间"
          :value="formatDate(store.currentCardGroup.created_at)"
        />
      </van-cell-group>

      <!-- 成员列表 -->
      <MemberList
        :members="store.currentCardGroup.members || []"
        @add-member="showMemberForm = true"
        @delete-member="handleDeleteMember"
        class="member-list"
      />

      <!-- 操作按钮 -->
      <div class="actions">
        <van-button
          type="primary"
          block
          @click="goToCarpools"
          class="carpools-button"
        >
          查看拼车列表
        </van-button>
        <van-button
          type="danger"
          block
          @click="handleDelete"
          class="delete-button"
        >
          删除卡组
        </van-button>
      </div>
    </div>

    <van-empty v-else description="卡组不存在" />
  </Layout>

  <!-- 添加成员表单 -->
  <van-popup
    v-model:show="showMemberForm"
    position="bottom"
    :style="{ height: '60%' }"
    round
  >
    <MemberForm @submit="handleAddMember" @cancel="showMemberForm = false" />
  </van-popup>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCardGroupStore } from '../stores/cardGroup';
import { showConfirmDialog, showSuccessToast, showToast } from 'vant';
import Layout from '../components/Layout.vue';
import MemberList from '../components/MemberList.vue';
import MemberForm from '../components/MemberForm.vue';

const route = useRoute();
const router = useRouter();
const store = useCardGroupStore();
const showMemberForm = ref(false);

const cardGroupId = parseInt(route.params.id as string, 10);

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

const handleAddMember = async (data: { member_number?: string; member_name?: string; preset?: 'cortis_all' }) => {
  if (data.preset === 'cortis_all') {
    const result = await store.bulkAddMembers(cardGroupId, 'cortis_all');
    if (result) {
      showSuccessToast('添加成功');
      showMemberForm.value = false;
    } else {
      showToast(store.error || '添加失败');
    }
  } else if (data.member_number) {
    const result = await store.addMember(cardGroupId, data.member_number, data.member_name);
    if (result) {
      showSuccessToast('添加成功');
      showMemberForm.value = false;
    } else {
      showToast(store.error || '添加失败');
    }
  }
};

const handleDeleteMember = async (memberId: number) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个成员吗？',
    });
    const result = await store.deleteMember(memberId);
    if (result) {
      showSuccessToast('删除成功');
    } else {
      showToast(store.error || '删除失败');
    }
  } catch {
    // 用户取消
  }
};

const goToCarpools = () => {
  router.push({
    name: 'CarpoolList',
    params: { id: cardGroupId },
    query: { name: store.currentCardGroup?.name || '卡组' },
  });
};

const handleDelete = async () => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个卡组吗？删除后无法恢复。',
    });
    const result = await store.deleteCardGroup(cardGroupId);
    if (result) {
      showSuccessToast('删除成功');
      router.push('/card-groups');
    } else {
      showToast(store.error || '删除失败');
    }
  } catch {
    // 用户取消
  }
};

onMounted(() => {
  if (!isNaN(cardGroupId)) {
    store.fetchCardGroup(cardGroupId);
  }
});
</script>

<style scoped>
.card-group-detail {
  padding-bottom: 80px;
}

.actions {
  margin-top: 24px;
  padding: 0 16px;
}

.carpools-button {
  margin-bottom: 12px;
}

.delete-button {
  margin-top: 0;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .actions {
    padding: 0 12px;
    margin-top: 16px;
  }
}
</style>
