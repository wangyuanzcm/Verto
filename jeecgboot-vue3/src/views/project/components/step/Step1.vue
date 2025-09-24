<template>
  <div class="step1-form">
    <BasicForm @register="registerForm" />
    
    <div class="step-actions">
      <a-button type="primary" @click="handleNext">
        下一步
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, toRaw } from 'vue';
import { BasicForm, useForm } from '/@/components/Form';
import { step1Schemas } from '../../Project.data';
import { ProjectFormData } from '../../Project.data';
import { message } from 'ant-design-vue';

interface Props {
  formData: ProjectFormData;
}

interface Emits {
  (e: 'update', data: Partial<ProjectFormData>): void;
  (e: 'next'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const [registerForm, { validate, setFieldsValue, getFieldsValue }] = useForm({
  labelWidth: 120,
  schemas: step1Schemas,
  showActionButtonGroup: false,
  baseColProps: { span: 24 },
});

/**
 * 监听表单数据变化，同步到表单
 */
watch(
  () => props.formData,
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
 * 处理下一步
 */
const handleNext = async () => {
  try {
    const values = await validate();
    
    // 验证项目类型相关字段
    if (values.type === 'requirement' && !values.requirementId) {
      message.error('请输入需求ID');
      return;
    }
    
    if (values.type === 'bug' && !values.bugId) {
      message.error('请输入BUG ID');
      return;
    }
    
    // 验证必填字段
    if (!values.title?.trim()) {
      message.error('请输入项目标题');
      return;
    }
    
    if (!values.priority) {
      message.error('请选择优先级');
      return;
    }
    
    emit('update', values);
    emit('next');
  } catch (error) {
    console.error('表单验证失败:', error);
    message.error('请检查表单填写是否完整');
  }
};
</script>

<style lang="less" scoped>
.step1-form {
  .step-actions {
    margin-top: 24px;
    text-align: right;
  }
}
</style>