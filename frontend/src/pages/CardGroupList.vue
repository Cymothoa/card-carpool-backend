<template>
  <Layout title="我的卡组">
    <van-loading v-if="store.loading" type="spinner" vertical>加载中...</van-loading>
    
    <van-empty v-else-if="store.cardGroups.length === 0" description="还没有卡组，创建第一个吧！" />
    
    <div v-else class="card-group-list">
      <van-card
        v-for="group in store.cardGroups"
        :key="group.id"
        :title="group.name"
        :desc="`创建时间: ${formatDate(group.created_at)}`"
        @click="goToDetail(group.id)"
        class="card-group-item"
      >
        <template #tags>
          <van-tag v-if="group.deadline" type="warning">
            截止: {{ formatDate(group.deadline) }}
          </van-tag>
          <van-tag v-if="group.members" type="primary">
            {{ group.members.length }} 个成员
          </van-tag>
        </template>
      </van-card>
    </div>

    <van-button
      type="primary"
      round
      icon="plus"
      @click="showCreateForm = true"
      class="create-button"
    >
      创建卡组
    </van-button>
  </Layout>

  <!-- 创建卡组表单 -->
  <van-popup
    v-model:show="showCreateForm"
    position="bottom"
    :style="{ height: '70%' }"
    round
  >
    <CardGroupForm
      @success="handleCreateSuccess"
      @cancel="showCreateForm = false"
    />
  </van-popup>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCardGroupStore } from '../stores/cardGroup';
import Layout from '../components/Layout.vue';
import CardGroupForm from '../components/CardGroupForm.vue';

const router = useRouter();
const store = useCardGroupStore();
const showCreateForm = ref(false);

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

const goToDetail = (id: number) => {
  router.push(`/card-groups/${id}`);
};

const handleCreateSuccess = () => {
  showCreateForm.value = false;
  store.fetchCardGroups();
};

onMounted(() => {
  store.fetchCardGroups();
});
</script>

<style scoped>
.card-group-list {
  padding: 8px;
}

.card-group-item {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.create-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .card-group-list {
    padding: 4px;
  }

  .card-group-item {
    margin-bottom: 8px;
  }
}
</style>
