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
  const reviewerIndex = ref<number>();

  // 审查者表单配置
  const reviewerFormSchema: FormSchema[] = [
    {
      field: 'username',
      label: '用户名',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入用户名...',
      },
    },
    {
      field: 'name',
      label: '姓名',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入真实姓名...',
      },
    },
    {
      field: 'email',
      label: '邮箱',
      component: 'Input',
      required: true,
      rules: [
        {
          type: 'email',
          message: '请输入有效的邮箱地址',
        },
      ],
      componentProps: {
        placeholder: '请输入邮箱地址...',
      },
    },
    {
      field: 'role',
      label: '角色',
      component: 'Select',
      required: true,
      componentProps: {
        options: [
          { label: '高级开发工程师', value: 'senior_developer' },
          { label: '技术专家', value: 'tech_expert' },
          { label: '架构师', value: 'architect' },
          { label: '技术经理', value: 'tech_manager' },
          { label: '质量工程师', value: 'qa_engineer' },
        ],
      },
    },
    {
      field: 'department',
      label: '部门',
      component: 'Input',
      componentProps: {
        placeholder: '请输入所属部门...',
      },
    },
    {
      field: 'expertise',
      label: '专业领域',
      component: 'Select',
      componentProps: {
        mode: 'multiple',
        options: [
          { label: 'Java', value: 'java' },
          { label: 'JavaScript', value: 'javascript' },
          { label: 'TypeScript', value: 'typescript' },
          { label: 'Python', value: 'python' },
          { label: 'Go', value: 'go' },
          { label: 'Rust', value: 'rust' },
          { label: 'C++', value: 'cpp' },
          { label: 'Vue.js', value: 'vue' },
          { label: 'React', value: 'react' },
          { label: 'Spring Boot', value: 'springboot' },
          { label: '数据库', value: 'database' },
          { label: '微服务', value: 'microservice' },
          { label: '前端', value: 'frontend' },
          { label: '后端', value: 'backend' },
          { label: '移动端', value: 'mobile' },
          { label: 'DevOps', value: 'devops' },
          { label: '安全', value: 'security' },
        ],
        placeholder: '请选择专业领域...',
      },
    },
    {
      field: 'level',
      label: '技术等级',
      component: 'Select',
      required: true,
      componentProps: {
        options: [
          { label: 'P5 - 初级', value: 'P5' },
          { label: 'P6 - 中级', value: 'P6' },
          { label: 'P7 - 高级', value: 'P7' },
          { label: 'P8 - 专家', value: 'P8' },
          { label: 'P9 - 资深专家', value: 'P9' },
        ],
      },
    },
    {
      field: 'maxReviewsPerDay',
      label: '每日最大审查数',
      component: 'InputNumber',
      defaultValue: 5,
      componentProps: {
        min: 1,
        max: 20,
      },
    },
    {
      field: 'active',
      label: '活跃状态',
      component: 'Switch',
      defaultValue: true,
      helpMessage: '是否参与自动分配审查任务',
    },
    {
      field: 'autoAssign',
      label: '自动分配',
      component: 'Switch',
      defaultValue: true,
      helpMessage: '是否允许系统自动分配审查任务',
    },
    {
      field: 'workingHours',
      label: '工作时间',
      component: 'Input',
      componentProps: {
        placeholder: '例如: 09:00-18:00',
      },
      helpMessage: '审查者的工作时间，用于智能分配',
    },
    {
      field: 'timezone',
      label: '时区',
      component: 'Select',
      defaultValue: 'Asia/Shanghai',
      componentProps: {
        options: [
          { label: '北京时间 (UTC+8)', value: 'Asia/Shanghai' },
          { label: '东京时间 (UTC+9)', value: 'Asia/Tokyo' },
          { label: '纽约时间 (UTC-5)', value: 'America/New_York' },
          { label: '伦敦时间 (UTC+0)', value: 'Europe/London' },
        ],
      },
    },
    {
      field: 'notes',
      label: '备注',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入备注信息...',
        rows: 3,
      },
    },
  ];

  // 表单配置
  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 120,
    baseColProps: { span: 24 },
    schemas: reviewerFormSchema,
    showActionButtonGroup: false,
    autoSubmitOnEnter: true,
  });

  // 弹窗配置
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    reviewerIndex.value = data?.index;

    if (unref(isUpdate) && data?.record) {
      setFieldsValue({
        ...data.record,
      });
    }
  });

  // 弹窗标题
  const getTitle = computed(() => (!unref(isUpdate) ? '新增审查者' : '编辑审查者'));

  /**
   * 提交表单
   */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      const reviewerData = {
        ...values,
        id: unref(isUpdate) ? values.id : Date.now().toString(),
        createdAt: unref(isUpdate) ? values.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      emit('success', {
        reviewer: reviewerData,
        index: reviewerIndex.value,
      });

      createMessage.success(`${unref(isUpdate) ? '编辑' : '新增'}审查者成功`);
      closeModal();
    } catch (error) {
      console.error('提交审查者失败:', error);
      createMessage.error('提交失败，请检查表单数据');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>