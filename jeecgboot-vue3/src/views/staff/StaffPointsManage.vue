<template>
  <div class="staff-points-manage">
    <PageWrapper title="人员积分管理" content="管理员可为人员手动调整积分，并填写原因备注">
      <template #extra>
        <a-button @click="goBack">返回列表</a-button>
        <a-button type="primary" @click="handleSubmit" :loading="submitLoading">
          <Icon icon="ant-design:save-outlined" />
          提交调整
        </a-button>
      </template>

      <div class="content-grid">
        <a-card title="积分调整">
          <BasicForm @register="registerForm" />
          <div class="summary">
            <a-alert v-if="selectedStaffId" type="info" show-icon>
              <template #message>
                当前员工ID：<b>{{ selectedStaffId }}</b>，当前总积分：<b>{{ totalPoints }}</b>
              </template>
            </a-alert>
          </div>
        </a-card>

        <a-card title="积分流水" class="mt-16">
          <BasicTable @register="registerTable" />
        </a-card>
      </div>
    </PageWrapper>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';
  import { BasicForm, useForm } from '/@/components/Form';
  import { BasicTable, useTable } from '/@/components/Table';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { FormSchema, ApiSelect } from '/@/components/Form';
  import { getStaffList, getStaffPointsSummary, getStaffPointsLogs, adjustStaffPoints } from './staff.api';

  const route = useRoute();
  const router = useRouter();
  const { createMessage } = useMessage();

  const submitLoading = ref(false);
  const selectedStaffId = ref<string>('');
  const totalPoints = ref<number>(0);
  const searchParams = ref<Record<string, any>>({});

  // 远程人员选项接口（返回 [{id,name}] 数组，便于 ApiSelect 使用）
  const staffOptionsApi = async (params?: Record<string, any>) => {
    try {
      const res = await getStaffList({ pageNo: 1, pageSize: 50, ...(params || {}) });
      // 兼容后端/Mock的不同结构
      const list = (res && (res.list || res.records)) || [];
      return list.map((item: any) => ({ id: item.id, name: item.name }));
    } catch (e) {
      console.warn('获取人员选项失败:', e);
      return [];
    }
  };

  // 表单配置
  const formSchema: FormSchema[] = [
    {
      label: '人员',
      field: 'staffId',
      component: 'ApiSelect',
      required: true,
      componentProps: {
        api: staffOptionsApi,
        showSearch: true,
        filterOption: false,
        // 远程搜索
        onSearch: (val: string) => {
          searchParams.value = { name: val };
        },
        params: searchParams,
        labelField: 'name',
        valueField: 'id',
        placeholder: '请选择人员（可搜索姓名）',
      },
    },
    {
      label: '积分变动',
      field: 'delta',
      component: 'InputNumber',
      required: true,
      componentProps: {
        min: -9999,
        max: 9999,
        step: 1,
        placeholder: '请输入变动积分（支持负数）',
      },
      rules: [
        { required: true, message: '请输入变动积分' },
        {
          validator: (_, value) => {
            if (value === 0 || value === null || value === undefined) return Promise.reject('积分不能为 0');
            return Promise.resolve();
          },
        },
      ],
    },
    {
      label: '原因备注',
      field: 'remark',
      component: 'InputTextArea',
      componentProps: {
        rows: 3,
        maxlength: 500,
        showCount: true,
        placeholder: '请输入积分调整原因（可选）',
      },
    },
    {
      label: '事件类型',
      field: 'eventType',
      component: 'Select',
      componentProps: {
        options: [
          { label: '手动调整', value: 'MANUAL_ADJUST' },
          { label: '其他', value: 'OTHER' },
        ],
        allowClear: true,
      },
    },
    {
      label: '来源类型',
      field: 'sourceType',
      component: 'Select',
      componentProps: {
        options: [
          { label: 'APP', value: 'APP' },
          { label: 'PROJECT', value: 'PROJECT' },
          { label: 'COMPONENT', value: 'COMPONENT' },
          { label: 'OTHER', value: 'OTHER' },
        ],
        allowClear: true,
      },
    },
  ];

  const [registerForm, { validate, setFieldsValue }] = useForm({
    labelWidth: 120,
    showActionButtonGroup: false,
    schemas: formSchema,
    baseColProps: { lg: 12, md: 24 },
  });

  // 积分流水表格
  const [registerTable, { reload, setProps }] = useTable({
    title: '积分流水',
    immediate: false,
    columns: [
      { title: '事件类型', dataIndex: 'eventType', width: 160 },
      { title: '来源类型', dataIndex: 'sourceType', width: 120 },
      { title: '来源名称', dataIndex: 'sourceName', width: 200 },
      { title: '变动积分', dataIndex: 'delta', width: 100 },
      { title: '备注', dataIndex: 'remark', width: 240 },
      { title: '创建时间', dataIndex: 'createTime', width: 180 },
    ],
    api: async (params) => {
      if (!selectedStaffId.value) return { items: [], total: 0 } as any;
      const { page = 1, pageSize = 10 } = params || {};
      const res = await getStaffPointsLogs(selectedStaffId.value, { pageNo: page, pageSize });
      // 兼容后端/Mock的不同结构
      const list = (res && (res.records || res.list)) || [];
      const total = (res && (res.total || list.length)) || 0;
      return { items: list, total } as any;
    },
    rowKey: 'id',
    useSearchForm: false,
    showTableSetting: true,
    pagination: true,
  });

  async function loadSummary() {
    if (!selectedStaffId.value) {
      totalPoints.value = 0;
      return;
    }
    try {
      const res = await getStaffPointsSummary(selectedStaffId.value);
      // 兼容：后端返回 number；Mock 返回 { totalPoints }
      const total = (res && (res.totalPoints ?? res)) ?? 0;
      totalPoints.value = Number(total) || 0;
    } catch (error) {
      console.warn('获取积分摘要失败:', error);
      totalPoints.value = 0;
    }
  }

  async function handleSubmit() {
    try {
      submitLoading.value = true;
      const values = await validate();
      const { staffId, delta, remark, sourceType, eventType } = values as any;
      selectedStaffId.value = staffId;
      await adjustStaffPoints(staffId, Number(delta), remark, { sourceType, eventType });
      createMessage.success('调整成功');
      await loadSummary();
      reload();
    } catch (error: any) {
      console.error('调整失败:', error);
      // 404 等错误提示
      createMessage.error(error?.message || '调整失败，请稍后重试');
    } finally {
      submitLoading.value = false;
    }
  }

  function goBack() {
    router.push('/staff/list');
  }

  // 路由参数预填充
  onMounted(async () => {
    const qsId = (route.query.staffId as string) || '';
    if (qsId) {
      selectedStaffId.value = qsId;
      await setFieldsValue({ staffId: qsId });
      await loadSummary();
      reload();
    }
  });

  watch(selectedStaffId, () => {
    loadSummary();
    reload();
  });
</script>

<style lang="less" scoped>
  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 16px;
  }
  .mt-16 {
    margin-top: 16px;
  }
  .summary {
    margin-top: 12px;
  }
</style>