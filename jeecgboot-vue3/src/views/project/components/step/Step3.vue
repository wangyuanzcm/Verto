<template>
  <div class="step3-form">
    <BasicForm @register="registerForm" />
    
    <div class="step-actions">
      <a-button @click="handlePrev">
        上一步
      </a-button>
      <a-button type="primary" @click="handleSubmit" style="margin-left: 8px">
        {{ isEdit ? '更新项目' : '创建项目' }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, toRaw } from 'vue';
import { BasicForm, useForm } from '/@/components/Form';
import { step3Schemas } from '../../Project.data';
import { ProjectFormData } from '../../Project.data';
import { message } from 'ant-design-vue';
import { useProjectFormStore } from '/@/store/modules/projectForm';

interface Props {
  formData: ProjectFormData;
}

interface Emits {
  (e: 'update', data: Partial<ProjectFormData>): void;
  (e: 'prev'): void;
  (e: 'submit'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 使用项目表单store
const projectFormStore = useProjectFormStore();

const [registerForm, { validate, setFieldsValue, getFieldsValue }] = useForm({
  labelWidth: 120,
  schemas: step3Schemas,
  showActionButtonGroup: false,
  baseColProps: { span: 24 },
});

/**
 * 是否为编辑模式
 */
const isEdit = computed(() => projectFormStore.getIsEdit);

/**
 * 监听store中的表单数据变化，同步到表单
 */
watch(
  () => projectFormStore.getFormData,
  (formData) => {
    if (formData) {
      // 使用toRaw确保传递的是普通对象，避免响应式对象导致的错误
      const rawData = toRaw(formData);
      setFieldsValue(rawData);
    }
  },
  { immediate: true, deep: true }
);

/**
 * 监听props变化（兼容性保持）
 */
watch(
  () => props.formData,
  (formData) => {
    if (formData) {
      const rawData = toRaw(formData);
      setFieldsValue(rawData);
    }
  },
  { immediate: true, deep: true }
);

/**
 * 处理上一步
 */
const handlePrev = () => {
  const values = getFieldsValue();
  emit('update', values);
  emit('prev');
};

/**
 * 处理提交
 */
const handleSubmit = async () => {
  try {
    const values = await validate();
    
    // 验证时间逻辑
    const { startTime, testTime, onlineTime, releaseTime } = values;
    
    if (startTime && testTime) {
      if (new Date(startTime) >= new Date(testTime)) {
        message.error('提测时间必须晚于开始时间');
        return;
      }
    }
    
    if (testTime && onlineTime) {
      if (new Date(testTime) >= new Date(onlineTime)) {
        message.error('上线时间必须晚于提测时间');
        return;
      }
    }
    
    if (onlineTime && releaseTime) {
      if (new Date(onlineTime) >= new Date(releaseTime)) {
        message.error('发布时间必须晚于上线时间');
        return;
      }
    }
    
    // 验证时间不能是未来时间（除了计划时间）
    const now = new Date();
    if (startTime && new Date(startTime) > now) {
      // 开始时间可以是未来时间，这是正常的
    }
    
    emit('update', values);
    emit('submit');
  } catch (error) {
    console.error('表单验证失败:', error);
    message.error('请检查表单填写是否完整');
  }
};
</script>

<style lang="less" scoped>
.step3-form {
  .step-actions {
    margin-top: 24px;
    text-align: right;
  }
}
</style>