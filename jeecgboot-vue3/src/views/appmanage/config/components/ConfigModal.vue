<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
    
    <!-- 配置内容编辑器 -->
    <div v-if="configType" class="config-editor">
      <a-divider>配置内容</a-divider>
      
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
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref, watch } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
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

  // 表单配置
  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    schemas: configFormSchema,
    showActionButtonGroup: false,
    autoSubmitOnEnter: true,
  });

  // 弹窗配置
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    resetFields();
    setModalProps({ confirmLoading: false });
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

  // 弹窗标题
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
      setModalProps({ confirmLoading: true });

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
      
      closeModal();
      emit('success');
      createMessage.success('保存成功');
    } catch (error) {
      createMessage.error('保存失败');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  // 监听表单中的配置类型字段变化
  watch(
    () => registerForm,
    () => {
      const form = unref(registerForm);
      if (form) {
        form.getFieldsValue().then((values) => {
          if (values.type !== configType.value) {
            configType.value = values.type;
          }
        });
      }
    },
    { deep: true }
  );
</script>

<style lang="less" scoped>
  .config-editor {
    margin-top: 16px;
  }
</style>