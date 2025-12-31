<template>
  <div class="card-group-form">
    <van-nav-bar
      title="创建卡组"
      left-text="取消"
      right-text="保存"
      @click-left="handleCancel"
      @click-right="handleSubmit"
    />

    <van-form @submit="handleSubmit">
      <van-cell-group inset>
        <van-field
          v-model="formData.name"
          name="name"
          label="卡组名称"
          placeholder="请输入卡组名称"
          :rules="[{ required: true, message: '请输入卡组名称' }]"
          maxlength="100"
          show-word-limit
        />

        <van-field
          v-model="formData.owner_id"
          name="owner_id"
          label="车主ID"
          type="number"
          placeholder="请输入车主ID"
          :rules="[{ required: true, message: '请输入车主ID' }]"
        />

        <van-field
          v-model="deadlineDisplay"
          name="deadline"
          label="截止时间"
          placeholder="选择截止时间（可选）"
          readonly
          is-link
          @click="showDatePicker = true"
        />
      </van-cell-group>
    </van-form>

    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-picker-group
        title="选择截止时间"
        :tabs="['选择日期', '选择时间']"
        @confirm="handleDateConfirm"
        @cancel="showDatePicker = false"
      >
        <van-date-picker v-model="selectedDate" />
        <van-time-picker v-model="selectedTime" />
      </van-picker-group>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useCardGroupStore, CreateCardGroupRequest } from '../stores/cardGroup';
import { showToast, showSuccessToast } from 'vant';

const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

const store = useCardGroupStore();
const showDatePicker = ref(false);

// 初始化日期和时间选择器的值（格式：['YYYY', 'MM', 'DD'] 和 ['HH', 'mm']）
const initPickerValues = () => {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  
  return {
    date: [year, month, day],
    time: [hour, minute]
  };
};

const selectedDate = ref<string[]>(initPickerValues().date);
const selectedTime = ref<string[]>(initPickerValues().time);

interface FormData {
  name: string;
  owner_id: number | undefined;
  deadline: string | null;
}

const formData = reactive<FormData>({
  name: '',
  owner_id: undefined, // 初始值为空，需要用户自己输入
  deadline: null,
});

// 当打开日期选择器时，如果有已选中的截止时间，显示该时间
watch(showDatePicker, (isOpen) => {
  if (isOpen) {
    if (formData.deadline) {
      const date = new Date(formData.deadline);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      
      selectedDate.value = [year, month, day];
      selectedTime.value = [hour, minute];
    } else {
      // 如果没有已选时间，使用当前时间
      const init = initPickerValues();
      selectedDate.value = init.date;
      selectedTime.value = init.time;
    }
  }
});

const deadlineDisplay = computed(() => {
  if (!formData.deadline) return '';
  const date = new Date(formData.deadline);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
});

const handleDateConfirm = () => {
  // 将选择的日期和时间组合成 Date 对象
  const [year, month, day] = selectedDate.value;
  const [hour, minute] = selectedTime.value;
  
  const date = new Date(
    parseInt(year),
    parseInt(month) - 1, // 月份从0开始
    parseInt(day),
    parseInt(hour),
    parseInt(minute)
  );
  
  formData.deadline = date.toISOString();
  showDatePicker.value = false;
};

// 重置表单
const resetForm = () => {
  formData.name = '';
  formData.owner_id = undefined; // 重置为空，需要用户自己输入
  formData.deadline = null;
  const init = initPickerValues();
  selectedDate.value = init.date;
  selectedTime.value = init.time;
  showDatePicker.value = false;
};

const handleSubmit = async () => {
  if (!formData.name.trim()) {
    showToast('请输入卡组名称');
    return;
  }

  if (formData.owner_id === undefined || formData.owner_id === null) {
    showToast('请输入车主ID');
    return;
  }

  // 确保owner_id是number类型
  const submitData: CreateCardGroupRequest = {
    name: formData.name.trim(),
    owner_id: Number(formData.owner_id),
    deadline: formData.deadline || null,
  };

  const result = await store.createCardGroup(submitData);
  if (result) {
    showSuccessToast('创建成功');
    resetForm();
    emit('success');
  } else {
    showToast(store.error || '创建失败');
  }
};

// 监听cancel事件，重置表单
const handleCancel = () => {
  resetForm();
  emit('cancel');
};
</script>

<style scoped>
.card-group-form {
  padding: 16px;
  background-color: #fff;
  min-height: 100%;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .card-group-form {
    padding: 12px;
  }
}
</style>
