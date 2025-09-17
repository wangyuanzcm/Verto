<template>
  <Form />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useVbenForm } from '@vben/common-ui';
import { getRequirementFormSchema } from '../data';
import dayjs from 'dayjs';

interface Props {
  /** 表单数据 */
  formData?: Record<string, any>;
  /** 是否为编辑模式 */
  isEdit?: boolean;
}

interface Emits {
  /** 表单提交事件 */
  submit: [values: Record<string, any>];
  /** 表单值变化事件 */
  valuesChange: [
    changedValues: Record<string, any>,
    allValues: Record<string, any>,
  ];
}

const props = withDefaults(defineProps<Props>(), {
  formData: () => ({}),
  isEdit: false,
});

const emit = defineEmits<Emits>();

// 表单配置
const formSchema = computed(() => {
  const schema = getRequirementFormSchema();

  // 如果是编辑模式，可以根据需要调整表单配置
  if (props.isEdit) {
    // 编辑模式下的特殊处理
    return schema.map((item) => {
      // 例如：某些字段在编辑时不可修改
      if (item.fieldName === 'type') {
        return {
          ...item,
          componentProps: {
            ...item.componentProps,
            disabled: false, // 根据业务需求决定是否禁用
          },
        };
      }
      return item;
    });
  }

  return schema;
});

// 使用表单hook
/**
 * 处理表单提交
 * @param values 表单值
 */
const handleSubmit = (values: Record<string, any>) => {
  console.log('需求表单提交:', values);

  // 处理日期格式
  const formattedValues = {
    ...values,
    dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
  };

  emit('submit', formattedValues);
};

/**
 * 处理表单值变化
 * @param changedValues 变化的值
 * @param allValues 所有值
 */
const handleValuesChange = (
  changedValues: Record<string, any>,
  allValues: Record<string, any>,
) => {
  console.log('需求表单值变化:', changedValues, allValues);
  emit('valuesChange', changedValues, allValues);
};

// 创建表单
const [Form, formApi] = useVbenForm({
  schema: formSchema,
  handleSubmit,
  handleValuesChange,
});

/**
 * 设置表单值
 * @param values 表单值
 */
const setFieldsValue = (values: Record<string, any>) => {
  formApi.setValues(values);
};

/**
 * 获取表单值
 * @returns 表单值
 */
const getFieldsValue = () => {
  return formApi.getValues();
};

/**
 * 验证表单
 * @returns 验证结果
 */
const validate = async () => {
  try {
    await formApi.validate();
    const values = await formApi.getValues();
    return { success: true, values };
  } catch (error) {
    console.error('表单验证失败:', error);
    return { success: false, error };
  }
};

/**
 * 重置表单
 */
const resetFields = () => {
  formApi.resetForm();
};

/**
 * 清空表单验证状态
 */
const clearValidate = () => {
  formApi.resetValidate();
};

// 监听表单数据变化，自动填充表单
watch(
  () => props.formData,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      // 处理日期字段
      const formattedData = {
        ...newData,
        dueDate: newData.dueDate ? dayjs(newData.dueDate) : null,
      };

      setFieldsValue(formattedData);
    }
  },
  { immediate: true, deep: true },
);

// 暴露方法给父组件
defineExpose({
  setFieldsValue,
  getFieldsValue,
  validate,
  resetFields,
  clearValidate,
  formRef,
});
</script>

<style scoped>
/* 表单样式 */
:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-form-item-label) {
  font-weight: 500;
}

:deep(.ant-upload-list) {
  max-height: 200px;
  overflow-y: auto;
}

:deep(.ant-select-multiple .ant-select-selection-item) {
  background: #f0f0f0;
  border: 1px solid #d9d9d9;
}

:deep(.ant-input-number) {
  width: 100%;
}

:deep(.ant-picker) {
  width: 100%;
}
</style>
