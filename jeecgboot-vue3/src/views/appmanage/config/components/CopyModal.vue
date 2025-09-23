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

  const sourceConfig = ref<any>({});

  // 复制表单配置
  const copyFormSchema: FormSchema[] = [
    {
      field: 'targetEnvironment',
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
      field: 'newConfigName',
      label: '新配置名称',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入新配置名称...',
      },
    },
    {
      field: 'copyContent',
      label: '复制内容',
      component: 'CheckboxGroup',
      required: true,
      defaultValue: ['config', 'metadata'],
      componentProps: {
        options: [
          { label: '配置内容', value: 'config' },
          { label: '元数据', value: 'metadata' },
          { label: '权限设置', value: 'permissions' },
        ],
      },
    },
    {
      field: 'description',
      label: '复制说明',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入复制说明...',
        rows: 3,
      },
    },
  ];

  // 表单配置
  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    schemas: copyFormSchema,
    showActionButtonGroup: false,
    autoSubmitOnEnter: true,
  });

  // 弹窗配置
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    resetFields();
    setModalProps({ confirmLoading: false });
    
    if (data?.record) {
      sourceConfig.value = data.record;
      setFieldsValue({
        newConfigName: `${data.record.name}_copy`,
        copyContent: ['config', 'metadata'],
      });
    }
  });

  // 弹窗标题
  const getTitle = computed(() => '复制配置');

  /**
   * 提交复制
   */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      // TODO: 实现复制逻辑
      console.log('复制参数:', {
        sourceConfig: sourceConfig.value,
        copyParams: values,
      });

      createMessage.success('配置复制成功');
      closeModal();
      emit('success');
    } catch (error) {
      console.error('复制失败:', error);
      createMessage.error('复制失败，请检查参数');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>