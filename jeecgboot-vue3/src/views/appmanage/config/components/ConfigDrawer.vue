<template>
  <BasicDrawer 
    v-bind="$attrs" 
    @register="registerDrawer" 
    :title="getTitle" 
    :width="800"
    @ok="handleSubmit"
    @close="handleClose"
    :maskClosable="false"
    :destroyOnClose="true"
  >
    <!-- 基础信息表单 -->
    <div class="config-form-section">
      <a-card title="基础信息" size="small" style="margin-bottom: 16px;">
        <BasicForm @register="registerForm" />
      </a-card>
    </div>
    
    <!-- 配置内容编辑器 -->
    <div v-if="configType" class="config-editor-section">
      <a-card title="配置内容" size="small">
        <!-- 流水线配置 -->
        <PipelineConfigEditor 
          v-if="configType === ConfigType.PIPELINE"
          v-model:value="configContent"
        />
        
        <!-- 埋点配置 -->
        <TrackingConfigEditor 
          v-if="configType === ConfigType.TRACKING"
          v-model:value="configContent"
        />
        
        <!-- 代码审查配置 -->
        <CodeReviewConfigEditor 
          v-if="configType === ConfigType.CODE_REVIEW"
          v-model:value="configContent"
        />
      </a-card>
    </div>

    <!-- 操作按钮 -->
    <template #footer>
      <a-space>
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" @click="handleSubmit" :loading="submitLoading">
          {{ isUpdate ? '更新' : '保存' }}
        </a-button>
      </a-space>
    </template>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { ref, computed, unref, watch } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  
  import PipelineConfigEditor from './PipelineConfigEditor.vue';
  import TrackingConfigEditor from './TrackingConfigEditor.vue';
  import CodeReviewConfigEditor from './CodeReviewConfigEditor.vue';
  
  import { configFormSchema, ConfigType } from '../data/Config.data';
  import { saveConfig, validateConfig } from '../api/Config.api';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();

  const isUpdate = ref(true);
  const rowId = ref('');
  const configType = ref<ConfigType>();
  const configContent = ref<any>({});
  const submitLoading = ref(false);

  // 表单配置
  const [registerForm, { setFieldsValue, resetFields, validate, getFieldsValue }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    schemas: configFormSchema,
    showActionButtonGroup: false,
    autoSubmitOnEnter: false,
  });

  // 抽屉配置
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    resetFields();
    setDrawerProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;

    if (unref(isUpdate)) {
      rowId.value = data.record.id;
      setFieldsValue({
        ...data.record,
      });
      configType.value = data.record.type;
      configContent.value = data.record.config || {};
    } else {
      rowId.value = '';
      configType.value = undefined;
      configContent.value = {};
    }
  });

  // 抽屉标题
  const getTitle = computed(() => (!unref(isUpdate) ? '新增配置' : '编辑配置'));

  // 监听配置类型变化
  watch(
    () => configType.value,
    (newType) => {
      if (newType && !unref(isUpdate)) {
        // 新增时，根据类型初始化配置内容
        initConfigContent(newType);
      }
    }
  );

  // 监听表单字段变化，特别是配置类型字段
  watch(
    () => getFieldsValue(),
    (values) => {
      if (values.type && values.type !== configType.value) {
        configType.value = values.type;
      }
    },
    { deep: true }
  );

  /**
   * 初始化配置内容
   */
  function initConfigContent(type: ConfigType) {
    switch (type) {
      case ConfigType.PIPELINE:
        configContent.value = {
          stages: [],
          triggers: [],
          variables: [],
          notifications: [],
        };
        break;
      case ConfigType.TRACKING:
        configContent.value = {
          events: [],
          properties: [],
          filters: [],
          sampling: {
            enabled: false,
            rate: 1.0,
            strategy: 'random',
          },
        };
        break;
      case ConfigType.CODE_REVIEW:
        configContent.value = {
          rules: [],
          reviewers: [],
          approvals: {
            required: 1,
            dismissStale: false,
            requireCodeOwner: false,
            restrictPush: false,
          },
          automation: {
            autoAssign: false,
            autoMerge: false,
            autoTest: false,
            autoFormat: false,
          },
        };
        break;
    }
  }

  /**
   * 提交表单
   */
  async function handleSubmit() {
    try {
      const values = await validate();
      submitLoading.value = true;

      // 验证配置内容
      if (configType.value && configContent.value) {
        await validateConfig(configContent.value, configType.value);
      }

      // 保存配置
      const params = {
        ...values,
        config: configContent.value,
      };

      if (unref(isUpdate)) {
        params.id = rowId.value;
      }

      await saveConfig(params);
      
      closeDrawer();
      emit('success', { isUpdate: unref(isUpdate), values: params });
      createMessage.success('保存成功');
    } catch (error) {
      console.error('保存配置失败:', error);
      createMessage.error('保存失败');
    } finally {
      submitLoading.value = false;
    }
  }

  /**
   * 关闭抽屉
   */
  function handleClose() {
    closeDrawer();
  }
</script>

<style lang="less" scoped>
  .config-form-section {
    .ant-card {
      :deep(.ant-card-body) {
        padding: 16px;
      }
    }
  }

  .config-editor-section {
    .ant-card {
      :deep(.ant-card-body) {
        padding: 16px;
        max-height: 500px;
        overflow-y: auto;
      }
    }
  }

  // 抽屉内容样式优化
  :deep(.ant-drawer-body) {
    padding: 16px;
  }

  :deep(.ant-form-item) {
    margin-bottom: 16px;
  }

  :deep(.ant-form-item-label) {
    font-weight: 500;
  }
</style>