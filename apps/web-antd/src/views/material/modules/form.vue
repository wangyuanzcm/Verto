<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import { computed, ref, watch } from 'vue';

import { useVbenForm } from '@vben/common-ui';

import { useMaterialFormSchema } from '../data';

interface Props {
  data?: Recordable;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({}),
});

const emit = defineEmits<{
  submit: [values: Recordable];
}>();

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'vertical',
  schema: useMaterialFormSchema(),
  showDefaultActions: false,
});

const isEdit = computed(() => !!props.data?.id);

/**
 * 监听数据变化，更新表单值
 */
watch(
  () => props.data,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      formApi.setValues(newData);
    }
  },
  { immediate: true, deep: true },
);

/**
 * 处理表单提交
 */
async function handleSubmit() {
  try {
    const values = await formApi.submitForm();
    emit('submit', values);
  } catch (error) {
    console.error('表单验证失败:', error);
  }
}

/**
 * 处理表单值变化
 * @param values 表单值
 */
function handleValuesChange(values: Recordable) {
  console.log('表单值变化:', values);
}

/**
 * 重置表单
 */
function resetForm() {
  formApi.resetForm();
}

/**
 * 验证表单
 */
async function validateForm() {
  return await formApi.validate();
}

/**
 * 获取表单值
 */
function getFormValues() {
  return formApi.getValues();
}

/**
 * 设置表单值
 * @param values 表单值
 */
function setFormValues(values: Recordable) {
  formApi.setValues(values);
}

/**
 * 初始化表单
 */
function initForm() {
  if (props.data && Object.keys(props.data).length > 0) {
    formApi.setValues(props.data);
  } else {
    formApi.resetForm();
  }
}

// 暴露方法给父组件
defineExpose({
  handleSubmit,
  resetForm,
  validateForm,
  getFormValues,
  setFormValues,
  initForm,
});
</script>

<template>
  <div class="material-form">
    <Form @values-change="handleValuesChange" />
  </div>
</template>

<style scoped>
.material-form {
  padding: 16px;
}
</style>
