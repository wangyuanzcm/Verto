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
  const propertyData = ref<any>({});

  // 表单配置
  const formSchema: FormSchema[] = [
    {
      field: 'propertyName',
      label: '属性名称',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入属性名称，例如：用户ID、页面标题',
      },
    },
    {
      field: 'propertyKey',
      label: '属性键名',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '例如：user_id、page_title、custom_dimension_1',
      },
      helpMessage: '用于在代码中引用的属性键名，建议使用下划线命名',
    },
    {
      field: 'propertyType',
      label: '属性类型',
      component: 'Select',
      required: true,
      componentProps: {
        placeholder: '请选择属性类型',
        options: [
          { label: '字符串', value: 'string' },
          { label: '数字', value: 'number' },
          { label: '布尔值', value: 'boolean' },
          { label: '日期时间', value: 'datetime' },
          { label: '数组', value: 'array' },
          { label: '对象', value: 'object' },
          { label: 'JSON', value: 'json' },
        ],
      },
    },
    {
      field: 'dataSource',
      label: '数据来源',
      component: 'Select',
      componentProps: {
        placeholder: '请选择数据来源',
        options: [
          { label: 'DOM元素', value: 'dom' },
          { label: 'URL参数', value: 'url_param' },
          { label: 'Cookie', value: 'cookie' },
          { label: 'LocalStorage', value: 'localStorage' },
          { label: 'SessionStorage', value: 'sessionStorage' },
          { label: 'JavaScript变量', value: 'js_variable' },
          { label: '用户输入', value: 'user_input' },
          { label: '系统生成', value: 'system' },
          { label: 'API接口', value: 'api' },
        ],
      },
    },
    {
      field: 'extractionRule',
      label: '提取规则',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '例如：document.title、window.location.href、#elementId.textContent',
        rows: 3,
      },
      helpMessage: '定义如何从数据源中提取属性值的规则',
    },
    {
      field: 'defaultValue',
      label: '默认值',
      component: 'Input',
      componentProps: {
        placeholder: '当无法获取属性值时使用的默认值',
      },
    },
    {
      field: 'validationRule',
      label: '验证规则',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '例如：正则表达式、长度限制、数值范围等',
        rows: 2,
      },
    },
    {
      field: 'transformRule',
      label: '转换规则',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '对提取的数据进行转换的JavaScript代码',
        rows: 3,
      },
      helpMessage: '例如：格式化日期、转换大小写、数据类型转换等',
    },
    {
      field: 'scope',
      label: '作用域',
      component: 'Select',
      defaultValue: 'session',
      componentProps: {
        options: [
          { label: '页面级别', value: 'page' },
          { label: '会话级别', value: 'session' },
          { label: '用户级别', value: 'user' },
          { label: '全局级别', value: 'global' },
        ],
      },
      helpMessage: '定义属性的生命周期和作用范围',
    },
    {
      field: 'required',
      label: '必填属性',
      component: 'Switch',
      defaultValue: false,
      helpMessage: '是否为必填属性，缺失时是否阻止事件发送',
    },
    {
      field: 'sensitive',
      label: '敏感数据',
      component: 'Switch',
      defaultValue: false,
      helpMessage: '是否包含敏感信息，需要特殊处理',
    },
    {
      field: 'enabled',
      label: '启用状态',
      component: 'Switch',
      defaultValue: true,
      helpMessage: '是否启用此属性收集',
    },
    {
      field: 'description',
      label: '描述',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入属性的详细描述...',
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
    propertyData.value = data?.record || {};

    if (unref(isUpdate)) {
      setFieldsValue({
        ...data.record,
      });
    }
  });

  // 弹窗标题
  const getTitle = computed(() => (!unref(isUpdate) ? '新增属性' : '编辑属性'));

  /**
   * 提交表单数据
   */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      // 这里可以调用API保存数据
      // await saveProperty(values);

      emit('success', values);
      createMessage.success('属性配置保存成功');
      closeModal();
    } catch (error) {
      console.error('保存属性配置失败:', error);
      createMessage.error('保存失败，请检查表单数据');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  // 可以添加自定义样式
</style>