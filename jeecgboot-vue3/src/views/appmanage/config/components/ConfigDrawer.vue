<template>
  <BasicDrawer 
    v-bind="$attrs" 
    @register="registerDrawer" 
    :title="getTitle" 
    :width="800"
    :showFooter="true"
    @ok="handleSubmit"
    @close="handleClose"
    :maskClosable="false"
    :destroyOnClose="true"
  >
    <!-- 基础信息表单 -->
    <div class="config-form-section">
      <a-card title="基础信息" size="small" style="margin-bottom: 16px;">
        <BasicForm @register="registerForm" :disabled="readonly" />
      </a-card>
    </div>
    
    <!-- 配置内容编辑器 -->
    <div v-if="configType" class="config-editor-section">
      <a-card title="配置内容" size="small">
        <!-- 流水线配置 -->
        <PipelineConfigEditor 
          v-if="configType === ConfigType.PIPELINE"
          v-model:value="configContent"
          :readonly="readonly"
        />
        
        <!-- 埋点配置 -->
        <TrackingConfigEditor 
          v-if="configType === ConfigType.TRACKING"
          v-model:value="configContent"
          :readonly="readonly"
        />
        
        <!-- 代码审查配置 -->
        <CodeReviewConfigEditor 
          v-if="configType === ConfigType.CODE_REVIEW"
          v-model:value="configContent"
          :readonly="readonly"
        />
      </a-card>
    </div>

    <!-- 操作按钮 -->
    <template #footer>
      <a-space>
        <a-button @click="handleClose">取消</a-button>
        <a-button v-if="!readonly" type="primary" @click="handleSubmit" :loading="submitLoading">
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
  const readonly = ref(false);

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
    setDrawerProps({ confirmLoading: false, showFooter: true });
    isUpdate.value = !!data?.isUpdate;
    readonly.value = !!data?.readonly;

    if (unref(isUpdate)) {
      rowId.value = data.record.id;
      setFieldsValue({
        ...data.record,
      });
      configType.value = data.record.type;
      const raw = data.record.config || {};
      try {
        configContent.value = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (e) {
        console.warn('解析配置内容失败，使用原始值:', e);
        configContent.value = raw;
      }
    } else {
      rowId.value = '';
      configType.value = undefined;
      configContent.value = {};
    }
  });

  // 抽屉标题
  const getTitle = computed(() => {
    if (readonly.value) return '配置详情';
    return !unref(isUpdate) ? '新增配置' : '修改配置';
  });

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
    submitLoading.value = true;
    try {
      const values = await validate();
      // 显式同步类型，避免表单与内部 configType 可能不一致
      values.type = configType.value;
  
      // 构造用于后端校验的配置对象：将 name、type 合并到配置内容中
      const configForValidate = {
        ...JSON.parse(JSON.stringify(configContent.value || {})),
        name: values.name,
        type: values.type,
      };
  
      // 调用后端校验，后端返回 200，即使有错误也不会抛异常，需要前端解析
      let validateResp: any;
      try {
        validateResp = await validateConfig({
          type: values.type,
          config: configForValidate,
        });
      } catch (e) {
        // 校验接口异常时，提示但允许继续保存（后端可能临时不可用）
        console.warn('validateConfig failed:', e);
      }
  
      // 解析后端校验结果结构（Result 包装）：可能是 { result: { valid, warnings, errors } } 或直接返回 { valid, warnings, errors }
      const v = validateResp?.result ?? validateResp;
      if (v) {
        if (Array.isArray(v.warnings) && v.warnings.length > 0) {
          const warnMsg = v.warnings.map((w: any) => `${w.field || 'general'}: ${w.message || ''}`).join('\n');
          createMessage.info(`校验提示:\n${warnMsg}`);
        }
        if (v.valid === false) {
          const errMsg = Array.isArray(v.errors)
            ? v.errors.map((e: any) => `${e.field || 'field'}: ${e.message || ''}`).join('\n')
            : '配置校验未通过';
          createMessage.error(`保存被阻止，原因如下：\n${errMsg}`);
          return; // 阻止保存
        }
      }
  
      // 通过校验后进行保存（仅保存实际配置内容，顶层字段在 params 中）
      const params = {
        id: rowId.value,
        name: values.name,
        type: values.type,
        status: values.status,
        environment: values.environment,
        description: values.description,
        appId: values.appId,
        // 发送纯对象，API 内部会再 stringify，避免 Vue Proxy 导致的序列化问题
        config: JSON.parse(JSON.stringify(configContent.value || {})),
      };
  
      createMessage.loading({ content: '正在保存配置...', duration: 0 });
      await saveConfig(params);
      createMessage.success('保存成功');
      closeDrawer();
      emit('success');
    } catch (e) {
      console.error(e);
      createMessage.error('保存失败：' + (e?.message || '未知错误'));
    } finally {
      submitLoading.value = false;
      createMessage.destroy();
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