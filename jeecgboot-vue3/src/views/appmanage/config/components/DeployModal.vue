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
  const configData = ref<any>({});

  // 部署表单配置
  const deployFormSchema: FormSchema[] = [
    {
      field: 'environment',
      label: '目标环境',
      component: 'Select',
      required: true,
      componentProps: {
        options: [
          { label: '开发环境', value: 'dev' },
          { label: '测试环境', value: 'test' },
          { label: '预发布环境', value: 'staging' },
          { label: '生产环境', value: 'prod' },
        ],
      },
    },
    {
      field: 'deployType',
      label: '部署类型',
      component: 'RadioGroup',
      required: true,
      defaultValue: 'full',
      componentProps: {
        options: [
          { label: '全量部署', value: 'full' },
          { label: '增量部署', value: 'incremental' },
        ],
      },
    },
    {
      field: 'description',
      label: '部署说明',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入部署说明...',
        rows: 3,
      },
    },
  ];

  // 表单配置
  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    schemas: deployFormSchema,
    showActionButtonGroup: false,
    autoSubmitOnEnter: true,
  });

  // 弹窗配置
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    resetFields();
    setModalProps({ confirmLoading: false });
    
    if (data?.record) {
      configData.value = data.record;
      setFieldsValue({
        environment: 'dev',
        deployType: 'full',
      });
    }
  });

  // 弹窗标题
  const getTitle = computed(() => '部署配置');

  /**
   * 提交部署
   */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      // TODO: 实现部署逻辑
      console.log('部署参数:', {
        config: configData.value,
        deployParams: values,
      });

      createMessage.success('部署任务已提交');
      closeModal();
      emit('success');
    } catch (error) {
      console.error('部署失败:', error);
      createMessage.error('部署失败，请检查参数');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>