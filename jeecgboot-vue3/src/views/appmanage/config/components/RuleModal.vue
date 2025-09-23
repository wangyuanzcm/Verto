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
  const ruleIndex = ref<number>();

  // 规则表单配置
  const ruleFormSchema: FormSchema[] = [
    {
      field: 'name',
      label: '规则名称',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入规则名称...',
      },
    },
    {
      field: 'type',
      label: '规则类型',
      component: 'Select',
      required: true,
      componentProps: {
        options: [
          { label: '代码质量', value: 'quality' },
          { label: '安全检查', value: 'security' },
          { label: '性能检查', value: 'performance' },
          { label: '代码规范', value: 'style' },
          { label: '测试覆盖', value: 'coverage' },
        ],
      },
    },
    {
      field: 'severity',
      label: '严重级别',
      component: 'Select',
      required: true,
      componentProps: {
        options: [
          { label: '错误', value: 'error' },
          { label: '警告', value: 'warning' },
          { label: '信息', value: 'info' },
        ],
      },
    },
    {
      field: 'pattern',
      label: '匹配模式',
      component: 'Input',
      componentProps: {
        placeholder: '请输入文件匹配模式，如: **/*.js',
      },
    },
    {
      field: 'excludePattern',
      label: '排除模式',
      component: 'Input',
      componentProps: {
        placeholder: '请输入排除模式，如: **/test/**',
      },
    },
    {
      field: 'enabled',
      label: '启用状态',
      component: 'Switch',
      defaultValue: true,
    },
    {
      field: 'autoFix',
      label: '自动修复',
      component: 'Switch',
      defaultValue: false,
    },
    {
      field: 'description',
      label: '规则描述',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入规则描述...',
        rows: 3,
      },
    },
    {
      field: 'config',
      label: '规则配置',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入JSON格式的规则配置...',
        rows: 4,
      },
      helpMessage: '请输入有效的JSON格式配置',
    },
  ];

  // 表单配置
  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    schemas: ruleFormSchema,
    showActionButtonGroup: false,
    autoSubmitOnEnter: true,
  });

  // 弹窗配置
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    ruleIndex.value = data?.index;

    if (unref(isUpdate) && data?.record) {
      setFieldsValue({
        ...data.record,
        config: data.record.config ? JSON.stringify(data.record.config, null, 2) : '',
      });
    }
  });

  // 弹窗标题
  const getTitle = computed(() => (!unref(isUpdate) ? '新增规则' : '编辑规则'));

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
          createMessage.error('规则配置格式错误，请输入有效的JSON');
          return;
        }
      }

      const ruleData = {
        ...values,
        config,
        id: unref(isUpdate) ? values.id : Date.now().toString(),
        createdAt: unref(isUpdate) ? values.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      emit('success', {
        rule: ruleData,
        index: ruleIndex.value,
      });

      createMessage.success(`${unref(isUpdate) ? '编辑' : '新增'}规则成功`);
      closeModal();
    } catch (error) {
      console.error('提交规则失败:', error);
      createMessage.error('提交失败，请检查表单数据');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>