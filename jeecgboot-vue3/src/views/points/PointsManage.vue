<template>
  <div class="points-manage">
    <PageWrapper title="积分管理" content="展示所有人员的积分流水，通过筛选查看个人或时间区间，并通过抽屉进行积分调整">
      <template #extra>
          <a-button type="primary" v-auth="'staff:points:adjust'" @click="openAdjustDrawer">
            <Icon icon="ant-design:plus-outlined" />
            新增调整
          </a-button>
      </template>

      <!-- 移除独立的筛选表单，改用 BasicTable 的搜索表单 -->

        <BasicTable @register="registerTable" />

      <!-- 新增/调整积分 抽屉 -->
      <BasicDrawer
        v-model:open="adjustDrawerVisible"
        title="新增积分调整"
        :width="560"
        showFooter
        :mask-closable="false"
        :destroy-on-close="true"
      >
        <BasicForm @register="registerAdjustForm" />
        <template #footer>
          <a-space>
            <a-button @click="closeAdjustDrawer">取消</a-button>
            <a-button type="primary" :loading="submitLoading" @click="submitAdjust">提交调整</a-button>
          </a-space>
        </template>
      </BasicDrawer>
    </PageWrapper>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';
  import { BasicForm, useForm, FormSchema, ApiSelect } from '/@/components/Form';
  import { BasicTable, useTable } from '/@/components/Table';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicDrawer } from '/@/components/Drawer';
  import dayjs from 'dayjs';
  import { getStaffList, getStaffPointsSummary, getStaffPointsLogs, getAllStaffPointsLogs, adjustStaffPoints } from '../staff/staff.api';

  const route = useRoute();
  const { createMessage } = useMessage();

  const submitLoading = ref(false);
  const totalPoints = ref<number>(0);
  const searchParams = ref<Record<string, any>>({});
  const adjustDrawerVisible = ref(false);
  const selectedStaffId = ref<string | undefined>(undefined);

  // 远程人员选项接口
  const staffOptionsApi = async (params?: Record<string, any>) => {
    try {
      const res = await getStaffList({ pageNo: 1, pageSize: 50, ...(params || {}) });
      const list = (res && (res.list || res.records)) || [];
      return list.map((item: any) => ({ id: item.id, name: item.name }));
    } catch (e) {
      console.warn('获取人员选项失败:', e);
      return [];
    }
  };

  function onSearchStaff(val: string) {
    searchParams.value = { name: val };
  }

  // 搜索表单配置（通过 BasicTable 的 useSearchForm 渲染）
  const searchSchemas: FormSchema[] = [
    {
      label: '人员',
      field: 'staffId',
      component: 'ApiSelect',
      componentProps: {
        api: staffOptionsApi,
        showSearch: true,
        filterOption: false,
        onSearch: onSearchStaff,
        params: searchParams,
        labelField: 'name',
        valueField: 'id',
        placeholder: '请选择人员（可搜索姓名）',
        allowClear: true,
        style: { minWidth: '240px' },
      },
    },
    {
      label: '时间区间',
      field: 'quickRange',
      component: 'Select',
      componentProps: {
        options: [
          { label: '全部', value: 'ALL' },
          { label: '今日', value: 'TODAY' },
          { label: '近7天', value: 'LAST_7_DAYS' },
          { label: '本月', value: 'THIS_MONTH' },
        ],
        allowClear: true,
        style: { width: '140px' },
      },
    },
    {
      field: 'dateRange',
      label: '自定义时间',
      component: 'RangePicker',
      componentProps: {
        allowClear: true,
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
        style: { width: '160px' },
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
        style: { width: '160px' },
      },
    },
    {
      label: '关键词',
      field: 'keyword',
      component: 'Input',
      componentProps: {
        placeholder: '备注/来源名称关键字',
        allowClear: true,
        style: { width: '200px' },
      },
    },
  ];

  // 抽屉内表单配置
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

  const [registerAdjustForm, { validate: validateAdjust, setFieldsValue: setAdjustFieldsValue, resetFields }] = useForm({
    labelWidth: 120,
    showActionButtonGroup: false,
    schemas: formSchema,
    baseColProps: { lg: 24, md: 24 },
  });

  // 积分流水表格，使用 BasicTable 的搜索表单
  const [registerTable, { reload, setProps }] = useTable({
    title: '积分流水',
    immediate: true,
    columns: [
      { title: '员工ID', dataIndex: 'staffId', width: 120 },
      { title: '事件类型', dataIndex: 'eventType', width: 160 },
      { title: '来源类型', dataIndex: 'sourceType', width: 120 },
      { title: '来源名称', dataIndex: 'sourceName', width: 200 },
      { title: '变动积分', dataIndex: 'delta', width: 100 },
      { title: '备注', dataIndex: 'remark', width: 240 },
      { title: '创建时间', dataIndex: 'createTime', width: 180 },
    ],
    api: async (params) => {
      const { page = 1, pageSize = 10 } = params || {};
      const query: Record<string, any> = { pageNo: page, pageSize };

      // 从搜索表单取值
      const staffId = params?.staffId as string | undefined;
      const eventType = params?.eventType as string | undefined;
      const sourceType = params?.sourceType as string | undefined;
      const keyword = params?.keyword as string | undefined;
      const quickRange = (params?.quickRange as string | undefined) || 'ALL';
      const dateRange = params?.dateRange as any;

      if (staffId) query.staffId = staffId;
      if (eventType) query.eventType = eventType;
      if (sourceType) query.sourceType = sourceType;
      if (keyword) query.keyword = keyword;

      // 处理时间区间
      if (Array.isArray(dateRange) && dateRange.length === 2) {
        // RangePicker 返回 dayjs 对象或字符串，根据组件实现做兼容
        const start = (dateRange[0]?.format ? dateRange[0].format('YYYY-MM-DD HH:mm:ss') : dateRange[0]) as string;
        const end = (dateRange[1]?.format ? dateRange[1].format('YYYY-MM-DD HH:mm:ss') : dateRange[1]) as string;
        query.startTime = start;
        query.endTime = end;
      } else if (quickRange && quickRange !== 'ALL') {
        const now = dayjs();
        if (quickRange === 'TODAY') {
          query.startTime = now.startOf('day').format('YYYY-MM-DD HH:mm:ss');
          query.endTime = now.endOf('day').format('YYYY-MM-DD HH:mm:ss');
        } else if (quickRange === 'LAST_7_DAYS') {
          query.startTime = now.subtract(6, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss');
          query.endTime = now.endOf('day').format('YYYY-MM-DD HH:mm:ss');
        } else if (quickRange === 'THIS_MONTH') {
          query.startTime = now.startOf('month').format('YYYY-MM-DD HH:mm:ss');
          query.endTime = now.endOf('month').format('YYYY-MM-DD HH:mm:ss');
        }
      }

      // 同步选中人员以显示摘要
      if (selectedStaffId.value !== staffId) {
        selectedStaffId.value = staffId;
        await loadSummaryFor(staffId);
      }

      try {
        const res = staffId ? await getStaffPointsLogs(staffId, query) : await getAllStaffPointsLogs(query);
        console.log(res,'res====')
        // 兼容多种返回结构：IPage、数组或带list
        const list = Array.isArray((res as any)?.records)
          ? (res as any).records
          : Array.isArray(res)
          ? (res as any)
          : ((res as any)?.list || []);
        const total = (res as any)?.total ?? list.length ?? 0;
        console.log(list,'list')
        return { records: list, total } as any;
      } catch (e) {
        console.warn('积分流水加载失败:', e);
        return { records: [], total: 0 } as any;
      }
    },
    rowKey: 'id',
    useSearchForm: true,
    showTableSetting: true,
    pagination: true,
    formConfig: {
      labelWidth: 100,
      schemas: searchSchemas,
      autoSubmitOnEnter: true,
    },
  });

  async function loadSummaryFor(staffId?: string) {
    if (!staffId) {
      totalPoints.value = 0;
      return;
    }
    try {
      const res = await getStaffPointsSummary(staffId);
      const total = (res && (res.totalPoints ?? res)) ?? 0;
      totalPoints.value = Number(total) || 0;
    } catch (error) {
      console.warn('获取积分摘要失败:', error);
      totalPoints.value = 0;
    }
  }

  async function submitAdjust() {
    try {
      submitLoading.value = true;
      const values = await validateAdjust();
      const { staffId, delta, remark, sourceType, eventType } = values as any;
      await adjustStaffPoints(staffId, Number(delta), remark, { sourceType, eventType });
      createMessage.success('调整成功');
      // 若当前筛选了该人员，刷新摘要与列表
      if (selectedStaffId.value === staffId) {
        await loadSummaryFor(staffId);
        reload();
      } else {
        reload();
      }
      closeAdjustDrawer();
    } catch (error: any) {
      console.error('调整失败:', error);
      createMessage.error(error?.message || '调整失败，请稍后重试');
    } finally {
      submitLoading.value = false;
    }
  }

  function openAdjustDrawer() {
    adjustDrawerVisible.value = true;
    setTimeout(() => {
      if (selectedStaffId.value) {
        setAdjustFieldsValue({ staffId: selectedStaffId.value });
      } else {
        resetFields();
      }
    });
  }

  function closeAdjustDrawer() {
    adjustDrawerVisible.value = false;
  }

  // 路由参数预填充
  onMounted(async () => {
    const qsId = (route.query.staffId as string) || '';
    if (qsId) {
      // 通过 BasicTable 的搜索表单设置默认人员
      selectedStaffId.value = qsId;
      await loadSummaryFor(qsId);
    }
    // 初次进入页面也触发一次加载，避免未选择人员时无数据
    reload();
  });
</script>

<style lang="less" scoped>
  .summary {
    margin-bottom: 12px;
  }
</style>