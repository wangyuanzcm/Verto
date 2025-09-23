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
  const notificationData = ref<any>({});

  // 表单配置
  const formSchema: FormSchema[] = [
    {
      field: 'notificationName',
      label: '通知名称',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入通知名称，例如：构建失败通知',
      },
    },
    {
      field: 'notificationType',
      label: '通知类型',
      component: 'Select',
      required: true,
      componentProps: {
        placeholder: '请选择通知类型',
        options: [
          { label: '邮件通知', value: 'email' },
          { label: 'Slack通知', value: 'slack' },
          { label: '微信通知', value: 'wechat' },
          { label: '钉钉通知', value: 'dingtalk' },
          { label: 'Webhook', value: 'webhook' },
          { label: '短信通知', value: 'sms' },
          { label: '企业微信', value: 'work_wechat' },
          { label: 'Teams通知', value: 'teams' },
          { label: '自定义', value: 'custom' },
        ],
      },
    },
    {
      field: 'triggerEvents',
      label: '触发事件',
      component: 'Select',
      required: true,
      componentProps: {
        mode: 'multiple',
        placeholder: '选择触发通知的事件',
        options: [
          { label: '流水线开始', value: 'pipeline_start' },
          { label: '流水线成功', value: 'pipeline_success' },
          { label: '流水线失败', value: 'pipeline_failure' },
          { label: '流水线取消', value: 'pipeline_cancel' },
          { label: '阶段开始', value: 'stage_start' },
          { label: '阶段成功', value: 'stage_success' },
          { label: '阶段失败', value: 'stage_failure' },
          { label: '部署成功', value: 'deploy_success' },
          { label: '部署失败', value: 'deploy_failure' },
          { label: '测试失败', value: 'test_failure' },
          { label: '安全扫描发现问题', value: 'security_issue' },
          { label: '代码质量检查失败', value: 'quality_failure' },
        ],
      },
      helpMessage: '选择哪些事件会触发此通知',
    },
    {
      field: 'recipients',
      label: '接收人',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        placeholder: '接收人列表，每行一个。例如：\nuser@example.com\nadmin@example.com\n@channel (Slack频道)',
        rows: 4,
      },
      helpMessage: '通知的接收人，格式根据通知类型而定',
    },
    {
      field: 'conditions',
      label: '触发条件',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '触发条件配置，JSON格式。例如：\n{"branch": "main", "environment": "production", "failure_count": ">= 2"}',
        rows: 4,
      },
      helpMessage: '额外的触发条件，只有满足条件才发送通知',
    },
    {
      field: 'messageTemplate',
      label: '消息模板',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '消息模板，支持变量替换。例如：\n流水线 ${pipeline_name} 在分支 ${branch} 上执行${status}！\n执行时间：${duration}\n查看详情：${build_url}',
        rows: 6,
      },
      helpMessage: '通知消息的模板，支持变量替换',
    },
    {
      field: 'emailConfig',
      label: '邮件配置',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '邮件配置，JSON格式。例如：\n{"subject": "构建通知", "smtp_server": "smtp.example.com", "port": 587}',
        rows: 4,
      },
      helpMessage: '邮件通知的详细配置',
    },
    {
      field: 'slackConfig',
      label: 'Slack配置',
      component: 'InputTextArea',
      componentProps: {
        placeholder: 'Slack配置，JSON格式。例如：\n{"webhook_url": "https://hooks.slack.com/...", "channel": "#ci-cd", "username": "CI Bot"}',
        rows: 4,
      },
      helpMessage: 'Slack通知的详细配置',
    },
    {
      field: 'webhookConfig',
      label: 'Webhook配置',
      component: 'InputTextArea',
      componentProps: {
        placeholder: 'Webhook配置，JSON格式。例如：\n{"url": "https://api.example.com/notify", "method": "POST", "headers": {"Authorization": "Bearer token"}}',
        rows: 4,
      },
      helpMessage: 'Webhook通知的详细配置',
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
      helpMessage: '通知的优先级',
    },
    {
      field: 'retryCount',
      label: '重试次数',
      component: 'InputNumber',
      defaultValue: 3,
      componentProps: {
        min: 0,
        max: 10,
      },
      helpMessage: '发送失败时的重试次数',
    },
    {
      field: 'retryInterval',
      label: '重试间隔(秒)',
      component: 'InputNumber',
      defaultValue: 60,
      componentProps: {
        min: 1,
        max: 3600,
      },
      helpMessage: '重试之间的间隔时间',
    },
    {
      field: 'timeout',
      label: '超时时间(秒)',
      component: 'InputNumber',
      defaultValue: 30,
      componentProps: {
        min: 1,
        max: 300,
      },
      helpMessage: '通知发送的超时时间',
    },
    {
      field: 'rateLimitEnabled',
      label: '启用限流',
      component: 'Switch',
      defaultValue: true,
      helpMessage: '是否启用通知限流，避免频繁发送',
    },
    {
      field: 'rateLimitConfig',
      label: '限流配置',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '限流配置，JSON格式。例如：\n{"max_per_hour": 10, "max_per_day": 50, "cooldown": 300}',
        rows: 3,
      },
      helpMessage: '通知限流的详细配置',
    },
    {
      field: 'quietHours',
      label: '静默时间',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '静默时间配置，JSON格式。例如：\n{"start": "22:00", "end": "08:00", "timezone": "Asia/Shanghai", "weekends": true}',
        rows: 3,
      },
      helpMessage: '在指定时间段内不发送通知',
    },
    {
      field: 'attachLogs',
      label: '附加日志',
      component: 'Switch',
      defaultValue: false,
      helpMessage: '是否在通知中附加构建日志',
    },
    {
      field: 'logLines',
      label: '日志行数',
      component: 'InputNumber',
      defaultValue: 50,
      componentProps: {
        min: 10,
        max: 1000,
      },
      helpMessage: '附加日志的行数',
    },
    {
      field: 'enabled',
      label: '启用状态',
      component: 'Switch',
      defaultValue: true,
      helpMessage: '是否启用此通知配置',
    },
    {
      field: 'description',
      label: '描述',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入通知配置的详细描述...',
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
    notificationData.value = data?.record || {};

    if (unref(isUpdate)) {
      setFieldsValue({
        ...data.record,
      });
    }
  });

  // 弹窗标题
  const getTitle = computed(() => (!unref(isUpdate) ? '新增通知' : '编辑通知'));

  /**
   * 提交表单数据
   */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      // 验证JSON格式的字段
      const jsonFields = ['conditions', 'emailConfig', 'slackConfig', 'webhookConfig', 'rateLimitConfig', 'quietHours'];
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

      // 处理接收人列表
      if (values.recipients) {
        values.recipients = values.recipients.split('\n').filter(r => r.trim()).map(r => r.trim());
      }

      // 验证通知类型特定的配置
      if (values.notificationType === 'email' && !values.emailConfig) {
        createMessage.error('邮件通知必须配置邮件参数');
        return;
      }

      if (values.notificationType === 'slack' && !values.slackConfig) {
        createMessage.error('Slack通知必须配置Slack参数');
        return;
      }

      if (values.notificationType === 'webhook' && !values.webhookConfig) {
        createMessage.error('Webhook通知必须配置Webhook参数');
        return;
      }

      // 这里可以调用API保存数据
      // await saveNotification(values);

      emit('success', values);
      createMessage.success('通知配置保存成功');
      closeModal();
    } catch (error) {
      console.error('保存通知配置失败:', error);
      createMessage.error('保存失败，请检查表单数据');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  // 可以添加自定义样式
</style>