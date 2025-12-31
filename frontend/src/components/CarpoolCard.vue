<template>
  <van-card
    :title="`拼车 #${carpool.id}`"
    :desc="getStatusText()"
    @click="$emit('click', carpool)"
    class="carpool-card"
    :class="{ 'carpool-locked': carpool.status === 'locked', 'carpool-complete': carpool.status === 'complete' }"
  >
    <template #tags>
      <van-tag :type="getStatusTagType()">{{ getStatusText() }}</van-tag>
      <van-tag v-if="carpool.progress !== undefined" type="primary">
        {{ carpool.progress }}% ({{ carpool.assigned_members || 0 }}/{{ carpool.total_members || 0 }})
      </van-tag>
    </template>
    <template #footer>
      <div class="carpool-footer">
        <span class="carpool-time">{{ formatDate(carpool.created_at) }}</span>
        <span v-if="carpool.creator" class="carpool-creator">创建者: {{ carpool.creator.display_name || carpool.creator.username || '未知' }}</span>
      </div>
    </template>
  </van-card>
</template>

<script setup lang="ts">
import { CarpoolWithProgress } from '../stores/carpool';

const props = defineProps<{
  carpool: CarpoolWithProgress;
}>();

defineEmits<{
  click: [carpool: CarpoolWithProgress];
}>();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
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
  return statusMap[props.carpool.status] || '未知';
};

const getStatusTagType = () => {
  const typeMap: Record<string, string> = {
    incomplete: 'warning',
    complete: 'success',
    locked: 'primary',
    driven: 'success',
    cancelled: 'danger',
  };
  return typeMap[props.carpool.status] || 'default';
};
</script>

<style scoped>
.carpool-card {
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.carpool-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.carpool-locked {
  border-left: 4px solid #1989fa;
}

.carpool-complete {
  border-left: 4px solid #07c160;
}

.carpool-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #969799;
  margin-top: 8px;
}

.carpool-time {
  flex: 1;
}

.carpool-creator {
  flex: 1;
  text-align: right;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .carpool-card {
    margin-bottom: 8px;
  }

  .carpool-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .carpool-creator {
    text-align: left;
  }
}
</style>
