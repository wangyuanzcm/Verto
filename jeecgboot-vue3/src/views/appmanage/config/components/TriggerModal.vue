<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="700px">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form/index';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();

  const isUpdate = ref(true);
  const triggerData = ref<any>({});

  // 表单配置
  const formSchema: FormSchema[] = [
    {
      field: 'triggerName',
      label: '触发器名称',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入触发器名称，例如：代码推送触发器',
      },
    },
    {
      field: 'triggerType',
      label: '触发器类型',
      component: 'Select',
      required: true,
      componentProps: {
        placeholder: '请选择触发器类型',
        options: [
          { label: '代码推送', value: 'push' },
          { label: '合并请求', value: 'merge_request' },
          { label: '标签创建', value: 'tag' },
          { label: '定时触发', value: 'schedule' },
          { label: '手动触发', value: 'manual' },
          { label: 'Webhook', value: 'webhook' },
          { label: '文件变更', value: 'file_change' },
          { label: '外部API', value: 'api' },
          { label: '依赖更新', value: 'dependency' },
        ],
      },
    },
    {
      field: 'repository',
      label: '代码仓库',
      component: 'Input',
      componentProps: {
        placeholder: '例如：https://github.com/user/repo.git',
      },
      helpMessage: '关联的代码仓库地址',
    },
    {
      field: 'branches',
      label: '分支过滤',
      component: 'Input',
      componentProps: {
        placeholder: '例如：main,develop,feature/*',
      },
      helpMessage: '触发的分支规则，支持通配符，多个分支用逗号分隔',
    },
    {
      field: 'paths',
      label: '路径过滤',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '文件路径过滤规则，每行一个。例如：\nsrc/**\n*.js\n!test/**',
        rows: 4,
      },
      helpMessage: '只有指定路径的文件变更才触发，支持glob模式',
    },
    {
      field: 'schedule',
      label: '定时规则',
      component: 'Input',
      componentProps: {
        placeholder: '例如：0 2 * * * (每天凌晨2点)',
      },
      helpMessage: 'Cron表达式，仅定时触发器需要',
    },
    {
      field: 'webhookUrl',
      label: 'Webhook URL',
      component: 'Input',
      componentProps: {
        placeholder: '例如：https://api.example.com/webhook',
      },
      helpMessage: 'Webhook触发器的回调地址',
    },
    {
      field: 'webhookSecret',
      label: 'Webhook密钥',
      component: 'InputPassword',
      componentProps: {
        placeholder: '请输入Webhook验证密钥',
      },
      helpMessage: '用于验证Webhook请求的密钥',
    },
    {
      field: 'conditions',
      label: '触发条件',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '触发条件配置，JSON格式。例如：\n{"commit_message": "!skip-ci", "author": "user@example.com"}',
        rows: 4,
      },
      helpMessage: '额外的触发条件，JSON格式',
    },
    {
      field: 'variables',
      label: '环境变量',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '触发时设置的环境变量，JSON格式。例如：\n{"TRIGGER_TYPE": "push", "BRANCH_NAME": "$branch"}',
        rows: 4,
      },
      helpMessage: '触发时传递给流水线的环境变量',
    },
    {
      field: 'timeout',
      label: '超时时间(分钟)',
      component: 'InputNumber',
      defaultValue: 60,
      componentProps: {
        min: 1,
        max: 1440,
      },
      helpMessage: '触发器等待响应的最大时间',
    },
    {
      field: 'retryCount',
      label: '重试次数',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: {
        min: 0,
        max: 5,
      },
      helpMessage: '触发失败时的重试次数',
    },
    {
      field: 'priority',
      label: '优先级',
      component: 'Select',
      defaultValue: 'normal',
      componentProps: {
        options: [
          { label: '低', value: 'low' },
          { label: '普通', value: 'normal' },
          { label: '高', value: 'high' },
          { label: '紧急', value: 'urgent' },
        ],
      },
      helpMessage: '触发器的执行优先级',
    },
    {
      field: 'concurrent',
      label: '并发执行',
      component: 'Switch',
      defaultValue: false,
      helpMessage: '是否允许同时触发多个流水线实例',
    },
    {
      field: 'skipDuplicates',
      label: '跳过重复',
      component: 'Switch',
      defaultValue: true,
      helpMessage: '是否跳过重复的触发请求',
    },
    {
      field: 'notifications',
      label: '通知配置',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '通知配置，JSON格式。例如：\n{"email": ["admin@example.com"], "slack": "#ci-cd"}',
        rows: 3,
      },
      helpMessage: '触发成功或失败时的通知配置',
    },
    {
      field: 'enabled',
      label: '启用状态',
      component: 'Switch',
      defaultValue: true,
      helpMessage: '是否启用此触发器',
    },
    {
      field: 'description',
      label: '描述',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入触发器的详细描述...',
        rows: 3,
      },
    },
  ];

  // 表单配置
  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 120,
    baseColProps: { span: 24 },
    schemas: formSchema,
    showActionButtonGroup: false,
    autoSubmitOnEnter: true,
  });

  // 弹窗配置
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    triggerData.value = data?.record || {};

    if (unref(isUpdate)) {
      setFieldsValue({
        ...data.record,
      });
    }
  });

  // 弹窗标题
  const getTitle = computed(() => (!unref(isUpdate) ? '新增触发器' : '编辑触发器'));

  /**
   * 提交表单数据
   */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      // 验证JSON格式的字段
      const jsonFields = ['conditions', 'variables', 'notifications'];
      for (const field of jsonFields) {
        if (values[field]) {
          try {
            JSON.parse(values[field]);
          } catch (error) {
            createMessage.error(`${field} 必须是有效的JSON格式`);
            return;
          }
        }
      }

      // 验证定时触发器的Cron表达式
      if (values.triggerType === 'schedule' && !values.schedule) {
        createMessage.error('定时触发器必须设置定时规则');
        return;
      }

      // 验证Webhook触发器的URL
      if (values.triggerType === 'webhook' && !values.webhookUrl) {
        createMessage.error('Webhook触发器必须设置回调URL');
        return;
      }

      // 这里可以调用API保存数据
      // await saveTrigger(values);

      emit('success', values);
      createMessage.success('触发器配置保存成功');
      closeModal();
    } catch (error) {
      console.error('保存触发器配置失败:', error);
      createMessage.error('保存失败，请检查表单数据');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  // 可以添加自定义样式
</style>