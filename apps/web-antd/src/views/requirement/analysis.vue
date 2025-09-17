<template>
  <div class="p-4">
    <!-- 页面头部 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">需求分析</h1>
          <p class="mt-1 text-sm text-gray-500">需求数据统计与分析报告</p>
        </div>
        <div class="flex space-x-3">
          <a-range-picker
            v-model:value="dateRange"
            @change="handleDateChange"
          />
          <a-button type="primary" @click="handleExport">
            <template #icon>
              <VbenIcon icon="lucide:download" />
            </template>
            导出报告
          </a-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg bg-white p-6 shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100"
            >
              <VbenIcon icon="lucide:file-text" class="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">总需求数</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ statistics.total }}
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-6 shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100"
            >
              <VbenIcon
                icon="lucide:check-circle"
                class="h-5 w-5 text-green-600"
              />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">已完成</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ statistics.completed }}
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-6 shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100"
            >
              <VbenIcon icon="lucide:clock" class="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">进行中</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ statistics.inProgress }}
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-6 shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100"
            >
              <VbenIcon
                icon="lucide:alert-circle"
                class="h-5 w-5 text-red-600"
              />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">已延期</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ statistics.overdue }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- 需求状态分布 -->
      <div class="rounded-lg bg-white p-6 shadow">
        <h3 class="mb-4 text-lg font-medium text-gray-900">需求状态分布</h3>
        <div ref="statusChartRef" class="h-64"></div>
      </div>

      <!-- 需求优先级分布 -->
      <div class="rounded-lg bg-white p-6 shadow">
        <h3 class="mb-4 text-lg font-medium text-gray-900">需求优先级分布</h3>
        <div ref="priorityChartRef" class="h-64"></div>
      </div>
    </div>

    <!-- 需求趋势图 -->
    <div class="mb-6 rounded-lg bg-white p-6 shadow">
      <h3 class="mb-4 text-lg font-medium text-gray-900">需求创建趋势</h3>
      <div ref="trendChartRef" class="h-80"></div>
    </div>

    <!-- 需求类型分析 -->
    <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- 需求类型分布 -->
      <div class="rounded-lg bg-white p-6 shadow">
        <h3 class="mb-4 text-lg font-medium text-gray-900">需求类型分布</h3>
        <div ref="typeChartRef" class="h-64"></div>
      </div>

      <!-- 需求来源分析 -->
      <div class="rounded-lg bg-white p-6 shadow">
        <h3 class="mb-4 text-lg font-medium text-gray-900">需求来源分析</h3>
        <div ref="sourceChartRef" class="h-64"></div>
      </div>
    </div>

    <!-- 详细数据表格 -->
    <div class="rounded-lg bg-white shadow">
      <div class="border-b border-gray-200 px-6 py-4">
        <h3 class="text-lg font-medium text-gray-900">详细数据</h3>
      </div>
      <div class="p-6">
        <a-table
          :columns="tableColumns"
          :data-source="tableData"
          :pagination="pagination"
          :loading="loading"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'priority'">
              <a-tag :color="getPriorityColor(record.priority)">
                {{ getPriorityText(record.priority) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'progress'">
              <a-progress :percent="record.progress" size="small" />
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import { VbenIcon } from '@vben/common-ui';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';

// 响应式数据
const loading = ref(false);
const dateRange = ref([]);
const tableData = ref([]);

// 图表引用
const statusChartRef = ref<HTMLElement>();
const priorityChartRef = ref<HTMLElement>();
const trendChartRef = ref<HTMLElement>();
const typeChartRef = ref<HTMLElement>();
const sourceChartRef = ref<HTMLElement>();

// 图表实例
let statusChart: ECharts | null = null;
let priorityChart: ECharts | null = null;
let trendChart: ECharts | null = null;
let typeChart: ECharts | null = null;
let sourceChart: ECharts | null = null;

// 统计数据
const statistics = reactive({
  total: 156,
  completed: 89,
  inProgress: 45,
  overdue: 12,
});

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
});

// 表格列配置
const tableColumns = [
  {
    title: '需求标题',
    dataIndex: 'title',
    key: 'title',
    width: 200,
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 100,
  },
  {
    title: '进度',
    dataIndex: 'progress',
    key: 'progress',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 150,
  },
  {
    title: '预计完成时间',
    dataIndex: 'estimatedTime',
    key: 'estimatedTime',
    width: 150,
  },
];

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colors = {
    pending: 'orange',
    inProgress: 'blue',
    completed: 'green',
    cancelled: 'red',
  };
  return colors[status] || 'default';
};

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const texts = {
    pending: '待开始',
    inProgress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  };
  return texts[status] || status;
};

/**
 * 获取优先级颜色
 */
const getPriorityColor = (priority: string) => {
  const colors = {
    high: 'red',
    medium: 'orange',
    low: 'green',
  };
  return colors[priority] || 'default';
};

/**
 * 获取优先级文本
 */
const getPriorityText = (priority: string) => {
  const texts = {
    high: '高',
    medium: '中',
    low: '低',
  };
  return texts[priority] || priority;
};

/**
 * 初始化状态分布图表
 */
const initStatusChart = () => {
  if (!statusChartRef.value) return;

  statusChart = echarts.init(statusChartRef.value);
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '需求状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 45, name: '进行中' },
          { value: 89, name: '已完成' },
          { value: 12, name: '已延期' },
          { value: 10, name: '待开始' },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };
  statusChart.setOption(option);
};

/**
 * 初始化优先级分布图表
 */
const initPriorityChart = () => {
  if (!priorityChartRef.value) return;

  priorityChart = echarts.init(priorityChartRef.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['高', '中', '低'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '需求数量',
        type: 'bar',
        data: [45, 78, 33],
        itemStyle: {
          color: function (params) {
            const colors = ['#ff4d4f', '#faad14', '#52c41a'];
            return colors[params.dataIndex];
          },
        },
      },
    ],
  };
  priorityChart.setOption(option);
};

/**
 * 初始化趋势图表
 */
const initTrendChart = () => {
  if (!trendChartRef.value) return;

  trendChart = echarts.init(trendChartRef.value);
  const option = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['新增需求', '完成需求'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '新增需求',
        type: 'line',
        stack: 'Total',
        data: [12, 18, 15, 22, 19, 25, 20],
      },
      {
        name: '完成需求',
        type: 'line',
        stack: 'Total',
        data: [8, 15, 12, 18, 16, 20, 18],
      },
    ],
  };
  trendChart.setOption(option);
};

/**
 * 初始化类型分布图表
 */
const initTypeChart = () => {
  if (!typeChartRef.value) return;

  typeChart = echarts.init(typeChartRef.value);
  const option = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      top: '5%',
      left: 'center',
    },
    series: [
      {
        name: '需求类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '40',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 35, name: '功能需求' },
          { value: 25, name: '性能需求' },
          { value: 20, name: '界面需求' },
          { value: 15, name: '安全需求' },
          { value: 5, name: '其他需求' },
        ],
      },
    ],
  };
  typeChart.setOption(option);
};

/**
 * 初始化来源分析图表
 */
const initSourceChart = () => {
  if (!sourceChartRef.value) return;

  sourceChart = echarts.init(sourceChartRef.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
    },
    yAxis: {
      type: 'category',
      data: ['客户反馈', '内部需求', '市场调研', '竞品分析', '技术升级'],
    },
    series: [
      {
        name: '需求数量',
        type: 'bar',
        data: [45, 38, 25, 18, 12],
      },
    ],
  };
  sourceChart.setOption(option);
};

/**
 * 加载表格数据
 */
const loadTableData = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 模拟数据
    const mockData = [
      {
        id: '1',
        title: '用户登录功能优化',
        type: '功能需求',
        status: 'inProgress',
        priority: 'high',
        progress: 75,
        createTime: '2024-01-15',
        estimatedTime: '2024-02-15',
      },
      {
        id: '2',
        title: '数据导出功能',
        type: '功能需求',
        status: 'completed',
        priority: 'medium',
        progress: 100,
        createTime: '2024-01-10',
        estimatedTime: '2024-01-25',
      },
      {
        id: '3',
        title: '移动端适配',
        type: '界面需求',
        status: 'pending',
        priority: 'low',
        progress: 0,
        createTime: '2024-01-20',
        estimatedTime: '2024-03-01',
      },
    ];

    tableData.value = mockData;
    pagination.total = mockData.length;
  } catch (error) {
    message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 日期范围变化处理
 */
const handleDateChange = (dates: any) => {
  console.log('日期范围变化:', dates);
  // 重新加载数据
  loadTableData();
};

/**
 * 导出报告
 */
const handleExport = () => {
  message.success('导出功能开发中');
};

/**
 * 窗口大小变化时重新调整图表
 */
const handleResize = () => {
  statusChart?.resize();
  priorityChart?.resize();
  trendChart?.resize();
  typeChart?.resize();
  sourceChart?.resize();
};

// 组件挂载时初始化
onMounted(async () => {
  await loadTableData();

  await nextTick();

  // 初始化所有图表
  initStatusChart();
  initPriorityChart();
  initTrendChart();
  initTypeChart();
  initSourceChart();

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

// 组件卸载时清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  statusChart?.dispose();
  priorityChart?.dispose();
  trendChart?.dispose();
  typeChart?.dispose();
  sourceChart?.dispose();
});
</script>

<style scoped>
.ant-table {
  background: white;
}
</style>
