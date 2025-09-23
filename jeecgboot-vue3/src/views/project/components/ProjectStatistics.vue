<template>
  <div class="project-statistics">
    <!-- 统计概览 -->
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic
            title="总任务数"
            :value="statistics.totalTasks"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <Icon icon="ant-design:file-text-outlined" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic
            title="已完成任务"
            :value="statistics.completedTasks"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <Icon icon="ant-design:check-circle-outlined" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic
            title="代码提交数"
            :value="statistics.commits"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <Icon icon="ant-design:code-outlined" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic
            title="团队成员"
            :value="statistics.members"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix>
              <Icon icon="ant-design:team-outlined" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="16" style="margin-top: 16px;">
      <!-- 任务进度图表 -->
      <a-col :span="12">
        <a-card title="任务进度分布" :bordered="false">
          <div ref="taskProgressChart" style="height: 300px;"></div>
        </a-card>
      </a-col>

      <!-- 代码提交趋势 -->
      <a-col :span="12">
        <a-card title="代码提交趋势" :bordered="false">
          <div ref="commitTrendChart" style="height: 300px;"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px;">
      <!-- 成员贡献度 -->
      <a-col :span="12">
        <a-card title="成员贡献度" :bordered="false">
          <div ref="memberContributionChart" style="height: 300px;"></div>
        </a-card>
      </a-col>

      <!-- 项目时间线 -->
      <a-col :span="12">
        <a-card title="项目时间线" :bordered="false">
          <a-timeline>
            <a-timeline-item
              v-for="milestone in milestones"
              :key="milestone.id"
              :color="milestone.completed ? 'green' : 'blue'"
            >
              <div class="milestone-item">
                <div class="milestone-title">{{ milestone.title }}</div>
                <div class="milestone-date">{{ milestone.date }}</div>
                <div class="milestone-description">{{ milestone.description }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, nextTick } from 'vue';
  import { Icon } from '/@/components/Icon';
  import * as echarts from 'echarts';

  interface Props {
    projectId: string;
  }

  const props = defineProps<Props>();

  const taskProgressChart = ref();
  const commitTrendChart = ref();
  const memberContributionChart = ref();

  // 统计数据
  const statistics = reactive({
    totalTasks: 0,
    completedTasks: 0,
    commits: 0,
    members: 0,
  });

  // 里程碑数据
  const milestones = ref([]);

  /**
   * 加载统计数据
   */
  async function loadStatistics() {
    // 模拟数据
    statistics.totalTasks = 45;
    statistics.completedTasks = 32;
    statistics.commits = 156;
    statistics.members = 8;

    milestones.value = [
      {
        id: '1',
        title: '项目启动',
        date: '2024-01-01',
        description: '项目正式启动，团队组建完成',
        completed: true,
      },
      {
        id: '2',
        title: '需求分析完成',
        date: '2024-01-15',
        description: '完成需求调研和分析，确定产品方向',
        completed: true,
      },
      {
        id: '3',
        title: '原型设计完成',
        date: '2024-02-01',
        description: '完成产品原型设计和用户体验优化',
        completed: true,
      },
      {
        id: '4',
        title: '开发阶段',
        date: '2024-02-15',
        description: '进入开发阶段，前后端并行开发',
        completed: false,
      },
      {
        id: '5',
        title: '测试上线',
        date: '2024-03-01',
        description: '完成功能测试，准备上线部署',
        completed: false,
      },
    ];
  }

  /**
   * 初始化任务进度图表
   */
  function initTaskProgressChart() {
    const chart = echarts.init(taskProgressChart.value);
    const option = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: '任务状态',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 32, name: '已完成' },
            { value: 8, name: '进行中' },
            { value: 3, name: '测试中' },
            { value: 2, name: '待开始' },
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
    chart.setOption(option);
  }

  /**
   * 初始化代码提交趋势图表
   */
  function initCommitTrendChart() {
    const chart = echarts.init(commitTrendChart.value);
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '提交数',
          data: [20, 35, 45, 30, 26, 40],
          type: 'line',
          smooth: true,
          areaStyle: {},
        },
      ],
    };
    chart.setOption(option);
  }

  /**
   * 初始化成员贡献度图表
   */
  function initMemberContributionChart() {
    const chart = echarts.init(memberContributionChart.value);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'category',
        data: ['张三', '李四', '王五', '赵六', '钱七'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '提交数',
          data: [45, 38, 32, 28, 13],
          type: 'bar',
          itemStyle: {
            color: '#1890ff',
          },
        },
      ],
    };
    chart.setOption(option);
  }

  /**
   * 初始化所有图表
   */
  async function initCharts() {
    await nextTick();
    initTaskProgressChart();
    initCommitTrendChart();
    initMemberContributionChart();
  }

  onMounted(async () => {
    await loadStatistics();
    await initCharts();
  });
</script>

<style lang="less" scoped>
</style>