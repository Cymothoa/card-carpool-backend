<template>
  <Layout>
    <template #header>
      <van-nav-bar
        :title="`拼车列表 - ${cardGroupName}`"
        left-text="返回"
        left-arrow
        @click-left="$router.back()"
      />
    </template>

    <van-loading v-if="store.loading" type="spinner" vertical>加载中...</van-loading>

    <div v-else class="carpool-list">
      <van-empty v-if="store.carpools.length === 0" description="还没有拼车，创建第一个吧！" />

      <div v-else>
        <CarpoolCard
          v-for="carpool in store.carpools"
          :key="carpool.id"
          :carpool="carpool"
          @click="goToDetail(carpool.id)"
        />
      </div>
    </div>

    <van-button
      type="primary"
      round
      icon="plus"
      @click="showCreateForm = true"
      class="create-button"
    >
      创建拼车
    </van-button>
  </Layout>

  <!-- 创建拼车表单 -->
  <van-popup
    v-model:show="showCreateForm"
    position="bottom"
    :style="{ height: '50%' }"
    round
  >
    <CarpoolForm
      :card-group-id="cardGroupId"
      :creator-id="currentUserId || undefined"
      @success="handleCreateSuccess"
      @cancel="showCreateForm = false"
    />
  </van-popup>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCarpoolStore } from '../stores/carpool';
import { useUserStore } from '../stores/user';
import Layout from '../components/Layout.vue';
import CarpoolCard from '../components/CarpoolCard.vue';
import CarpoolForm from '../components/CarpoolForm.vue';

const route = useRoute();
const router = useRouter();
const store = useCarpoolStore();
const userStore = useUserStore();
const showCreateForm = ref(false);

const cardGroupId = parseInt(route.params.id as string, 10);
const cardGroupName = computed(() => route.query.name as string || '卡组');

// 预留权限功能：如果以后需要用户ID，可以从这里获取
const currentUserId = computed(() => {
  return userStore.currentUser?.id || null; // 暂时不使用，预留权限功能
});

const goToDetail = (id: number) => {
  router.push(`/carpools/${id}`);
};

const handleCreateSuccess = async () => {
  showCreateForm.value = false;
  await store.fetchCarpools(cardGroupId);
};

onMounted(() => {
  if (!isNaN(cardGroupId)) {
    store.fetchCarpools(cardGroupId);
  }
});
</script>

<style scoped>
.carpool-list {
  padding: 16px;
  padding-bottom: 80px;
}

.create-button {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .carpool-list {
    padding: 12px;
    padding-bottom: 80px;
  }

  .create-button {
    bottom: 16px;
    width: calc(100% - 32px);
    max-width: 300px;
  }
}
</style>
