<template>
  <div class="member-form">
    <van-nav-bar
      :title="isBulk ? '批量添加成员' : '添加成员'"
      left-text="取消"
      right-text="保存"
      @click-left="handleCancel"
      @click-right="handleSubmit"
    />

    <van-form @submit="handleSubmit">
      <van-cell-group inset>
        <!-- cortis全员预设选项 -->
        <van-cell title="快速添加" />
        <van-cell
          title="cortis全员"
          label="自动添加成员 1、2、3、4、5"
          is-link
          @click="handleCortisPreset"
        />

        <van-divider>或手动添加</van-divider>

        <!-- 手动添加单个成员 -->
        <van-field
          v-model="formData.member_number"
          name="member_number"
          label="成员编号"
          placeholder="请输入成员编号（如：1, 2, 3）"
          :rules="[{ required: !isBulk, message: '请输入成员编号' }]"
          maxlength="20"
        />

        <van-field
          v-model="formData.member_name"
          name="member_name"
          label="成员名称"
          placeholder="请输入成员名称（可选）"
          maxlength="100"
        />
      </van-cell-group>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { showToast } from 'vant';

interface Props {
  isBulk?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isBulk: false,
});

const emit = defineEmits<{
  submit: [data: { member_number?: string; member_name?: string; preset?: 'cortis_all' }];
  cancel: [];
}>();

const formData = reactive({
  member_number: '',
  member_name: '',
});

// 重置表单
const resetForm = () => {
  formData.member_number = '';
  formData.member_name = '';
};

const handleCortisPreset = () => {
  emit('submit', { preset: 'cortis_all' });
  resetForm();
};

const handleSubmit = () => {
  if (!props.isBulk && !formData.member_number.trim()) {
    showToast('请输入成员编号');
    return;
  }

  emit('submit', {
    member_number: formData.member_number.trim() || undefined,
    member_name: formData.member_name.trim() || undefined,
  });

  // 重置表单
  resetForm();
};

// 监听cancel事件，重置表单
const handleCancel = () => {
  resetForm();
  emit('cancel');
};
</script>

<style scoped>
.member-form {
  padding: 16px;
  background-color: #fff;
  min-height: 100%;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .member-form {
    padding: 12px;
  }
}
</style>
