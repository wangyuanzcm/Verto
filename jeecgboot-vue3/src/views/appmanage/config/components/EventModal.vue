<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="600px">
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
  const eventData = ref<any>({});

  // 表单配置
  const formSchema: FormSchema[] = [
    {
      field: 'eventName',
      label: '事件名称',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入事件名称，例如：用户登录、页面访问',
      },
    },
    {
      field: 'eventType',
      label: '事件类型',
      component: 'Select',
      required: true,
      componentProps: {
        placeholder: '请选择事件类型',
        options: [
          { label: '页面浏览', value: 'pageview' },
          { label: '点击事件', value: 'click' },
          { label: '表单提交', value: 'submit' },
          { label: '用户行为', value: 'user_action' },
          { label: '系统事件', value: 'system' },
          { label: '自定义事件', value: 'custom' },
        ],
      },
    },
    {
      field: 'eventCategory',
      label: '事件分类',
      component: 'Input',
      componentProps: {
        placeholder: '例如：用户交互、系统监控、业务流程',
      },
    },
    {
      field: 'eventAction',
      label: '事件动作',
      component: 'Input',
      componentProps: {
        placeholder: '例如：点击、提交、查看、下载',
      },
    },
    {
      field: 'eventLabel',
      label: '事件标签',
      component: 'Input',
      componentProps: {
        placeholder: '用于标识事件的额外信息',
      },
    },
    {
      field: 'trackingCode',
      label: '跟踪代码',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入事件跟踪的JavaScript代码...',
        rows: 4,
      },
      helpMessage: '用于在前端触发事件跟踪的代码片段',
    },
    {
      field: 'triggerCondition',
      label: '触发条件',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '例如：页面URL包含特定路径、元素被点击、表单验证通过',
        rows: 3,
      },
    },
    {
      field: 'dataMapping',
      label: '数据映射',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '定义事件数据的映射规则，JSON格式',
        rows: 4,
      },
      helpMessage: '定义如何从页面或应用中提取事件相关数据',
    },
    {
      field: 'priority',
      label: '优先级',
      component: 'Select',
      defaultValue: 'medium',
      componentProps: {
        options: [
          { label: '低', value: 'low' },
          { label: '中', value: 'medium' },
          { label: '高', value: 'high' },
          { label: '紧急', value: 'urgent' },
        ],
      },
    },
    {
      field: 'enabled',
      label: '启用状态',
      component: 'Switch',
      defaultValue: true,
      helpMessage: '是否启用此事件跟踪',
    },
    {
      field: 'description',
      label: '描述',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入事件的详细描述...',
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
    eventData.value = data?.record || {};

    if (unref(isUpdate)) {
      setFieldsValue({
        ...data.record,
      });
    }
  });

  // 弹窗标题
  const getTitle = computed(() => (!unref(isUpdate) ? '新增事件' : '编辑事件'));

  /**
   * 提交表单数据
   */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      // 这里可以调用API保存数据
      // await saveEvent(values);

      emit('success', values);
      createMessage.success('事件配置保存成功');
      closeModal();
    } catch (error) {
      console.error('保存事件配置失败:', error);
      createMessage.error('保存失败，请检查表单数据');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  // 可以添加自定义样式
</style>