<template>
  <div class="member-list">
    <van-cell-group inset>
      <van-cell title="成员列表" :value="`共 ${members.length} 个`">
        <template #right-icon>
          <van-button
            type="primary"
            size="small"
            @click="$emit('add-member')"
            class="add-button"
          >
            添加成员
          </van-button>
        </template>
      </van-cell>
    </van-cell-group>

    <van-empty v-if="members.length === 0" description="还没有成员" />

    <van-cell-group v-else inset>
      <van-cell
        v-for="member in members"
        :key="member.id"
        :title="getMemberTitle(member)"
        :label="getMemberLabel(member)"
        :value="formatDate(member.created_at)"
        is-link
        @click="$emit('member-click', member)"
      >
        <template #right-icon>
          <van-icon
            name="delete"
            @click.stop="$emit('delete-member', member.id)"
            class="delete-icon"
          />
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import type { Member } from '../stores/cardGroup';

interface Props {
  members: Member[];
}

defineProps<Props>();

defineEmits<{
  'add-member': [];
  'member-click': [member: Member];
  'delete-member': [id: number];
}>();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  });
};

// 获取成员标题：如果是cortis全员预设的成员，显示真实姓名；否则显示"成员 X"
const getMemberTitle = (member: Member) => {
  // cortis全员预设的成员名称映射
  const cortisNames = ['JAMES', 'JUHOON', 'MARTIN', 'SEONGHYEON', 'KEONHO'];
  if (member.member_name && cortisNames.includes(member.member_name)) {
    return member.member_name;
  }
  return `成员 ${member.member_number}`;
};

// 获取成员标签：显示成员编号或cortis标识
const getMemberLabel = (member: Member) => {
  // cortis全员预设的成员名称映射
  const cortisNames = ['JAMES', 'JUHOON', 'MARTIN', 'SEONGHYEON', 'KEONHO'];
  if (member.member_name && cortisNames.includes(member.member_name)) {
    return `cortis ${member.member_number}`;
  }
  return member.member_name || '未命名';
};
</script>

<style scoped>
.member-list {
  margin-top: 16px;
}

.van-cell-group--inset {
  margin-bottom: 10px;
}

.add-button {
  min-width: 80px;
  margin-left: 10px;
}
.van-cell {
  align-items: center;
}
.delete-icon {
  color: #ee0a24;
  margin-left: 8px;
  font-size: 18px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .add-button {
    min-width: 70px;
    font-size: 12px;
  }
}
</style>
