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
  const variableData = ref<any>({});

  // 表单配置
  const formSchema: FormSchema[] = [
    {
      field: 'variableName',
      label: '变量名称',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入变量名称，例如：API_URL、DATABASE_HOST',
      },
      rules: [
        {
          pattern: /^[A-Z][A-Z0-9_]*$/,
          message: '变量名必须以大写字母开头，只能包含大写字母、数字和下划线',
        },
      ],
    },
    {
      field: 'variableType',
      label: '变量类型',
      component: 'Select',
      required: true,
      componentProps: {
        placeholder: '请选择变量类型',
        options: [
          { label: '字符串', value: 'string' },
          { label: '数字', value: 'number' },
          { label: '布尔值', value: 'boolean' },
          { label: '密钥', value: 'secret' },
          { label: 'JSON对象', value: 'json' },
          { label: '文件路径', value: 'file' },
          { label: 'URL地址', value: 'url' },
          { label: '环境变量', value: 'env' },
        ],
      },
    },
    {
      field: 'defaultValue',
      label: '默认值',
      component: 'Input',
      componentProps: {
        placeholder: '请输入变量的默认值',
      },
      helpMessage: '变量的默认值，可以在运行时被覆盖',
    },
    {
      field: 'scope',
      label: '作用域',
      component: 'Select',
      required: true,
      defaultValue: 'pipeline',
      componentProps: {
        placeholder: '请选择变量作用域',
        options: [
          { label: '全局', value: 'global' },
          { label: '项目', value: 'project' },
          { label: '流水线', value: 'pipeline' },
          { label: '阶段', value: 'stage' },
          { label: '任务', value: 'job' },
        ],
      },
      helpMessage: '变量的可见范围和生命周期',
    },
    {
      field: 'category',
      label: '分类',
      component: 'Select',
      componentProps: {
        placeholder: '请选择变量分类',
        options: [
          { label: '系统配置', value: 'system' },
          { label: '数据库配置', value: 'database' },
          { label: 'API配置', value: 'api' },
          { label: '部署配置', value: 'deployment' },
          { label: '安全配置', value: 'security' },
          { label: '监控配置', value: 'monitoring' },
          { label: '第三方服务', value: 'third_party' },
          { label: '自定义', value: 'custom' },
        ],
      },
      helpMessage: '变量的功能分类，便于管理',
    },
    {
      field: 'required',
      label: '必填项',
      component: 'Switch',
      defaultValue: false,
      helpMessage: '是否为必填变量，必填变量在执行时必须有值',
    },
    {
      field: 'sensitive',
      label: '敏感信息',
      component: 'Switch',
      defaultValue: false,
      helpMessage: '是否为敏感信息，敏感信息在日志中会被隐藏',
    },
    {
      field: 'encrypted',
      label: '加密存储',
      component: 'Switch',
      defaultValue: false,
      helpMessage: '是否加密存储变量值',
    },
    {
      field: 'validation',
      label: '验证规则',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '验证规则配置，JSON格式。例如：\n{"pattern": "^https?://", "minLength": 1, "maxLength": 255}',
        rows: 4,
      },
      helpMessage: '变量值的验证规则，JSON格式',
    },
    {
      field: 'allowedValues',
      label: '允许的值',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '允许的值列表，每行一个。例如：\nproduction\nstaging\ndevelopment',
        rows: 4,
      },
      helpMessage: '限制变量只能取这些值中的一个',
    },
    {
      field: 'environment',
      label: '环境限制',
      component: 'Select',
      componentProps: {
        mode: 'multiple',
        placeholder: '选择适用的环境',
        options: [
          { label: '开发环境', value: 'development' },
          { label: '测试环境', value: 'testing' },
          { label: '预发布环境', value: 'staging' },
          { label: '生产环境', value: 'production' },
          { label: '所有环境', value: 'all' },
        ],
      },
      helpMessage: '变量适用的环境，空表示所有环境',
    },
    {
      field: 'tags',
      label: '标签',
      component: 'Input',
      componentProps: {
        placeholder: '标签，多个用逗号分隔。例如：database,mysql,config',
      },
      helpMessage: '用于分类和搜索的标签',
    },
    {
      field: 'source',
      label: '数据源',
      component: 'Select',
      componentProps: {
        placeholder: '请选择数据源',
        options: [
          { label: '手动输入', value: 'manual' },
          { label: '环境变量', value: 'env' },
          { label: '配置文件', value: 'config' },
          { label: '密钥管理', value: 'vault' },
          { label: '外部API', value: 'api' },
          { label: '数据库', value: 'database' },
          { label: '文件系统', value: 'file' },
        ],
      },
      helpMessage: '变量值的来源',
    },
    {
      field: 'sourceConfig',
      label: '数据源配置',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '数据源配置，JSON格式。例如：\n{"path": "/etc/config.json", "key": "database.host"}',
        rows: 3,
      },
      helpMessage: '数据源的详细配置信息',
    },
    {
      field: 'expiration',
      label: '过期时间',
      component: 'DatePicker',
      componentProps: {
        showTime: true,
        placeholder: '选择过期时间',
        format: 'YYYY-MM-DD HH:mm:ss',
      },
      helpMessage: '变量的过期时间，过期后将被自动删除',
    },
    {
      field: 'enabled',
      label: '启用状态',
      component: 'Switch',
      defaultValue: true,
      helpMessage: '是否启用此变量',
    },
    {
      field: 'description',
      label: '描述',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入变量的详细描述，包括用途、格式要求等...',
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
    variableData.value = data?.record || {};

    if (unref(isUpdate)) {
      setFieldsValue({
        ...data.record,
      });
    }
  });

  // 弹窗标题
  const getTitle = computed(() => (!unref(isUpdate) ? '新增变量' : '编辑变量'));

  /**
   * 提交表单数据
   */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      // 验证JSON格式的字段
      const jsonFields = ['validation', 'sourceConfig'];
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

      // 验证变量名唯一性（这里可以调用API检查）
      // const exists = await checkVariableExists(values.variableName);
      // if (exists && !isUpdate.value) {
      //   createMessage.error('变量名已存在，请使用其他名称');
      //   return;
      // }

      // 处理允许的值
      if (values.allowedValues) {
        values.allowedValues = values.allowedValues.split('\n').filter(v => v.trim());
      }

      // 处理标签
      if (values.tags) {
        values.tags = values.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }

      // 这里可以调用API保存数据
      // await saveVariable(values);

      emit('success', values);
      createMessage.success('变量配置保存成功');
      closeModal();
    } catch (error) {
      console.error('保存变量配置失败:', error);
      createMessage.error('保存失败，请检查表单数据');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  // 可以添加自定义样式
</style>