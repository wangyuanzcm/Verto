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
  const filterData = ref<any>({});

  // 表单配置
  const formSchema: FormSchema[] = [
    {
      field: 'filterName',
      label: '过滤器名称',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入过滤器名称，例如：IP地址过滤、机器人过滤',
      },
    },
    {
      field: 'filterType',
      label: '过滤器类型',
      component: 'Select',
      required: true,
      componentProps: {
        placeholder: '请选择过滤器类型',
        options: [
          { label: 'IP地址过滤', value: 'ip_filter' },
          { label: '用户代理过滤', value: 'user_agent_filter' },
          { label: '引荐来源过滤', value: 'referrer_filter' },
          { label: '地理位置过滤', value: 'geo_filter' },
          { label: '设备类型过滤', value: 'device_filter' },
          { label: '事件属性过滤', value: 'property_filter' },
          { label: '自定义过滤', value: 'custom_filter' },
        ],
      },
    },
    {
      field: 'filterAction',
      label: '过滤动作',
      component: 'RadioGroup',
      defaultValue: 'exclude',
      componentProps: {
        options: [
          { label: '排除', value: 'exclude' },
          { label: '包含', value: 'include' },
        ],
      },
      helpMessage: '排除：过滤掉匹配的数据；包含：只保留匹配的数据',
    },
    {
      field: 'matchType',
      label: '匹配类型',
      component: 'Select',
      defaultValue: 'exact',
      componentProps: {
        options: [
          { label: '精确匹配', value: 'exact' },
          { label: '包含', value: 'contains' },
          { label: '开始于', value: 'starts_with' },
          { label: '结束于', value: 'ends_with' },
          { label: '正则表达式', value: 'regex' },
          { label: '范围匹配', value: 'range' },
        ],
      },
    },
    {
      field: 'filterRules',
      label: '过滤规则',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        placeholder: '请输入过滤规则，每行一个。例如：\n192.168.1.*\nbot|spider|crawler\n*.example.com',
        rows: 6,
      },
      helpMessage: '支持通配符(*)、正则表达式等，具体格式取决于匹配类型',
    },
    {
      field: 'targetField',
      label: '目标字段',
      component: 'Input',
      componentProps: {
        placeholder: '例如：ip_address、user_agent、referrer、custom_property',
      },
      helpMessage: '指定要应用过滤规则的字段名称',
    },
    {
      field: 'caseSensitive',
      label: '区分大小写',
      component: 'Switch',
      defaultValue: false,
      helpMessage: '字符串匹配时是否区分大小写',
    },
    {
      field: 'priority',
      label: '优先级',
      component: 'InputNumber',
      defaultValue: 100,
      componentProps: {
        min: 1,
        max: 1000,
      },
      helpMessage: '数值越小优先级越高，过滤器按优先级顺序执行',
    },
    {
      field: 'applyToEvents',
      label: '应用到事件',
      component: 'Select',
      componentProps: {
        mode: 'multiple',
        placeholder: '选择要应用此过滤器的事件类型',
        options: [
          { label: '所有事件', value: 'all' },
          { label: '页面浏览', value: 'pageview' },
          { label: '点击事件', value: 'click' },
          { label: '表单提交', value: 'submit' },
          { label: '用户行为', value: 'user_action' },
          { label: '系统事件', value: 'system' },
          { label: '自定义事件', value: 'custom' },
        ],
      },
      helpMessage: '留空表示应用到所有事件类型',
    },
    {
      field: 'conditions',
      label: '附加条件',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '可选的附加过滤条件，JSON格式。例如：\n{"time_range": {"start": "09:00", "end": "18:00"}}',
        rows: 4,
      },
      helpMessage: '可以设置时间范围、设备类型等附加过滤条件',
    },
    {
      field: 'enabled',
      label: '启用状态',
      component: 'Switch',
      defaultValue: true,
      helpMessage: '是否启用此过滤器',
    },
    {
      field: 'description',
      label: '描述',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入过滤器的详细描述...',
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
    filterData.value = data?.record || {};

    if (unref(isUpdate)) {
      setFieldsValue({
        ...data.record,
      });
    }
  });

  // 弹窗标题
  const getTitle = computed(() => (!unref(isUpdate) ? '新增过滤器' : '编辑过滤器'));

  /**
   * 提交表单数据
   */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      // 验证附加条件的JSON格式
      if (values.conditions) {
        try {
          JSON.parse(values.conditions);
        } catch (error) {
          createMessage.error('附加条件必须是有效的JSON格式');
          return;
        }
      }

      // 这里可以调用API保存数据
      // await saveFilter(values);

      emit('success', values);
      createMessage.success('过滤器配置保存成功');
      closeModal();
    } catch (error) {
      console.error('保存过滤器配置失败:', error);
      createMessage.error('保存失败，请检查表单数据');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  // 可以添加自定义样式
</style>