<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
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

  const isUpdate = ref(false);
  const checkerIndex = ref<number>();

  // 检查器表单配置
  const checkerFormSchema: FormSchema[] = [
    {
      field: 'name',
      label: '检查器名称',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入检查器名称...',
      },
    },
    {
      field: 'type',
      label: '检查器类型',
      component: 'Select',
      required: true,
      componentProps: {
        options: [
          { label: 'ESLint', value: 'eslint' },
          { label: 'SonarQube', value: 'sonarqube' },
          { label: 'CodeClimate', value: 'codeclimate' },
          { label: 'PMD', value: 'pmd' },
          { label: 'Checkstyle', value: 'checkstyle' },
          { label: 'SpotBugs', value: 'spotbugs' },
          { label: '自定义', value: 'custom' },
        ],
      },
    },
    {
      field: 'version',
      label: '版本',
      component: 'Input',
      componentProps: {
        placeholder: '请输入检查器版本...',
      },
    },
    {
      field: 'command',
      label: '执行命令',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入执行命令...',
      },
    },
    {
      field: 'workingDirectory',
      label: '工作目录',
      component: 'Input',
      componentProps: {
        placeholder: '请输入工作目录，默认为项目根目录',
      },
    },
    {
      field: 'timeout',
      label: '超时时间(秒)',
      component: 'InputNumber',
      defaultValue: 300,
      componentProps: {
        min: 30,
        max: 3600,
      },
    },
    {
      field: 'enabled',
      label: '启用状态',
      component: 'Switch',
      defaultValue: true,
    },
    {
      field: 'failOnError',
      label: '错误时失败',
      component: 'Switch',
      defaultValue: true,
      helpMessage: '当检查器发现错误时是否阻止合并',
    },
    {
      field: 'description',
      label: '检查器描述',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入检查器描述...',
        rows: 3,
      },
    },
    {
      field: 'config',
      label: '检查器配置',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入JSON格式的检查器配置...',
        rows: 4,
      },
      helpMessage: '请输入有效的JSON格式配置',
    },
  ];

  // 表单配置
  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 120,
    baseColProps: { span: 24 },
    schemas: checkerFormSchema,
    showActionButtonGroup: false,
    autoSubmitOnEnter: true,
  });

  // 弹窗配置
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    checkerIndex.value = data?.index;

    if (unref(isUpdate) && data?.record) {
      setFieldsValue({
        ...data.record,
        config: data.record.config ? JSON.stringify(data.record.config, null, 2) : '',
      });
    }
  });

  // 弹窗标题
  const getTitle = computed(() => (!unref(isUpdate) ? '新增检查器' : '编辑检查器'));

  /**
   * 提交表单
   */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      // 处理配置字段
      let config = {};
      if (values.config) {
        try {
          config = JSON.parse(values.config);
        } catch (error) {
          createMessage.error('检查器配置格式错误，请输入有效的JSON');
          return;
        }
      }

      const checkerData = {
        ...values,
        config,
        id: unref(isUpdate) ? values.id : Date.now().toString(),
        createdAt: unref(isUpdate) ? values.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      emit('success', {
        checker: checkerData,
        index: checkerIndex.value,
      });

      createMessage.success(`${unref(isUpdate) ? '编辑' : '新增'}检查器成功`);
      closeModal();
    } catch (error) {
      console.error('提交检查器失败:', error);
      createMessage.error('提交失败，请检查表单数据');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>