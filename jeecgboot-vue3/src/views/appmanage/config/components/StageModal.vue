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
  const stageData = ref<any>({});

  // 表单配置
  const formSchema: FormSchema[] = [
    {
      field: 'stageName',
      label: '阶段名称',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入阶段名称，例如：构建、测试、部署',
      },
    },
    {
      field: 'stageType',
      label: '阶段类型',
      component: 'Select',
      required: true,
      componentProps: {
        placeholder: '请选择阶段类型',
        options: [
          { label: '构建阶段', value: 'build' },
          { label: '测试阶段', value: 'test' },
          { label: '代码检查', value: 'code_check' },
          { label: '安全扫描', value: 'security_scan' },
          { label: '部署阶段', value: 'deploy' },
          { label: '验证阶段', value: 'verify' },
          { label: '通知阶段', value: 'notify' },
          { label: '自定义阶段', value: 'custom' },
        ],
      },
    },
    {
      field: 'order',
      label: '执行顺序',
      component: 'InputNumber',
      required: true,
      defaultValue: 1,
      componentProps: {
        min: 1,
        max: 100,
      },
      helpMessage: '阶段在流水线中的执行顺序，数字越小越先执行',
    },
    {
      field: 'executor',
      label: '执行器',
      component: 'Select',
      componentProps: {
        placeholder: '请选择执行器',
        options: [
          { label: 'Docker容器', value: 'docker' },
          { label: 'Shell脚本', value: 'shell' },
          { label: 'Jenkins Agent', value: 'jenkins' },
          { label: 'Kubernetes Pod', value: 'k8s' },
          { label: 'GitHub Actions', value: 'github_actions' },
          { label: 'GitLab Runner', value: 'gitlab_runner' },
          { label: '本地执行', value: 'local' },
        ],
      },
    },
    {
      field: 'commands',
      label: '执行命令',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        placeholder: '请输入执行命令，每行一个。例如：\nnpm install\nnpm run build\nnpm run test',
        rows: 6,
      },
      helpMessage: '阶段要执行的命令列表',
    },
    {
      field: 'workingDirectory',
      label: '工作目录',
      component: 'Input',
      componentProps: {
        placeholder: '例如：./src、/app、相对路径或绝对路径',
      },
      helpMessage: '命令执行的工作目录',
    },
    {
      field: 'environment',
      label: '环境变量',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '环境变量配置，JSON格式。例如：\n{"NODE_ENV": "production", "API_URL": "https://api.example.com"}',
        rows: 4,
      },
    },
    {
      field: 'timeout',
      label: '超时时间(分钟)',
      component: 'InputNumber',
      defaultValue: 30,
      componentProps: {
        min: 1,
        max: 480,
      },
      helpMessage: '阶段执行的最大时间限制',
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
      helpMessage: '失败时的重试次数',
    },
    {
      field: 'continueOnError',
      label: '错误时继续',
      component: 'Switch',
      defaultValue: false,
      helpMessage: '当此阶段失败时是否继续执行后续阶段',
    },
    {
      field: 'parallel',
      label: '并行执行',
      component: 'Switch',
      defaultValue: false,
      helpMessage: '是否可以与其他阶段并行执行',
    },
    {
      field: 'conditions',
      label: '执行条件',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '阶段执行的条件，JSON格式。例如：\n{"branch": "main", "event": "push", "files_changed": ["src/**"]}',
        rows: 4,
      },
      helpMessage: '定义阶段何时执行的条件',
    },
    {
      field: 'artifacts',
      label: '产物配置',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '构建产物配置，JSON格式。例如：\n{"paths": ["dist/**", "build/**"], "expire": "7d"}',
        rows: 3,
      },
      helpMessage: '定义阶段产生的构建产物',
    },
    {
      field: 'dependencies',
      label: '依赖阶段',
      component: 'Input',
      componentProps: {
        placeholder: '依赖的阶段名称，多个用逗号分隔',
      },
      helpMessage: '此阶段依赖的其他阶段，必须等待依赖阶段完成',
    },
    {
      field: 'enabled',
      label: '启用状态',
      component: 'Switch',
      defaultValue: true,
      helpMessage: '是否启用此阶段',
    },
    {
      field: 'description',
      label: '描述',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入阶段的详细描述...',
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
    stageData.value = data?.record || {};

    if (unref(isUpdate)) {
      setFieldsValue({
        ...data.record,
      });
    }
  });

  // 弹窗标题
  const getTitle = computed(() => (!unref(isUpdate) ? '新增阶段' : '编辑阶段'));

  /**
   * 提交表单数据
   */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      // 验证JSON格式的字段
      const jsonFields = ['environment', 'conditions', 'artifacts'];
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

      // 这里可以调用API保存数据
      // await saveStage(values);

      emit('success', values);
      createMessage.success('阶段配置保存成功');
      closeModal();
    } catch (error) {
      console.error('保存阶段配置失败:', error);
      createMessage.error('保存失败，请检查表单数据');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  // 可以添加自定义样式
</style>