<template>
  <div class="step2-form">
    <BasicForm @register="registerForm">
      <template #designLinks="{ model, field }">
        <div class="design-links">
          <div
            v-for="(link, index) in model[field]"
            :key="index"
            class="design-link-item"
          >
            <a-input-group compact>
              <a-input
                v-model:value="link.title"
                style="width: 150px"
                placeholder="链接标题"
              />
              <a-input
                v-model:value="link.url"
                style="width: calc(100% - 300px)"
                placeholder="链接地址"
              />
              <a-button
                type="text"
                danger
                @click="removeDesignLink(model[field], index)"
                style="width: 50px"
              >
                删除
              </a-button>
            </a-input-group>
          </div>
          <a-button
            type="dashed"
            @click="addDesignLink(model[field])"
            style="width: 100%; margin-top: 8px"
          >
            <PlusOutlined />
            添加设计链接
          </a-button>
        </div>
      </template>
    </BasicForm>
    
    <div class="step-actions">
      <a-button @click="handlePrev">
        上一步
      </a-button>
      <a-button type="primary" @click="handleNext" style="margin-left: 8px">
        下一步
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, toRaw } from 'vue';
import { BasicForm, useForm } from '/@/components/Form';
import { step2Schemas } from '../../Project.data';
import { ProjectFormData, DesignLink } from '../../Project.data';
import { PlusOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { useProjectFormStore } from '/@/store/modules/projectForm';

interface Props {
  formData: ProjectFormData;
}

interface Emits {
  (e: 'update', data: Partial<ProjectFormData>): void;
  (e: 'next'): void;
  (e: 'prev'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 使用项目表单store
const projectFormStore = useProjectFormStore();

const [registerForm, { validate, setFieldsValue, getFieldsValue }] = useForm({
  labelWidth: 120,
  schemas: step2Schemas,
  showActionButtonGroup: false,
  baseColProps: { span: 24 },
});

/**
 * 监听store中的表单数据变化，同步到表单
 */
watch(
  () => projectFormStore.getFormData,
  (formData) => {
    if (formData) {
      // 使用toRaw确保传递的是普通对象，避免响应式对象导致的错误
      const rawData = toRaw(formData);
      setFieldsValue({
        ...rawData,
        designLinks: rawData.designLinks || [],
      });
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
      setFieldsValue({
        ...rawData,
        designLinks: rawData.designLinks || [],
      });
    }
  },
  { immediate: true, deep: true }
);

/**
 * 添加设计链接
 */
const addDesignLink = (designLinks: DesignLink[]) => {
  designLinks.push({
    title: '',
    url: '',
    type: 'prototype',
  });
};

/**
 * 删除设计链接
 */
const removeDesignLink = (designLinks: DesignLink[], index: number) => {
  designLinks.splice(index, 1);
};

/**
 * 处理上一步
 */
const handlePrev = () => {
  const values = getFieldsValue();
  emit('update', values);
  emit('prev');
};

/**
 * 处理下一步
 */
const handleNext = async () => {
  try {
    const values = await validate();
    
    // 验证必填字段
    if (!values.appId) {
      message.error('请选择关联应用');
      return;
    }
    
    if (!values.developerId) {
      message.error('请选择开发人员');
      return;
    }
    
    if (!values.status) {
      message.error('请选择项目状态');
      return;
    }
    
    // 验证设计链接格式
    const validDesignLinks = [];
    if (values.designLinks && values.designLinks.length > 0) {
      for (const link of values.designLinks) {
        if (link.title && link.url) {
          // 验证URL格式
          try {
            new URL(link.url);
            validDesignLinks.push(link);
          } catch {
            message.error(`设计链接"${link.title}"的URL格式不正确`);
            return;
          }
        }
      }
    }
    
    values.designLinks = validDesignLinks;
    emit('update', values);
    emit('next');
  } catch (error) {
    console.error('表单验证失败:', error);
    message.error('请检查表单填写是否完整');
  }
};
</script>

<style lang="less" scoped>
.step2-form {
  .design-links-container {
    .design-link-item {
      margin-bottom: 8px;
    }
  }

  .step-actions {
    margin-top: 24px;
    text-align: right;
  }
}
</style>