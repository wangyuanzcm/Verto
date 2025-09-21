<template>
  <div class="statistics">
    <!-- 统计概览 -->
    <a-row :gutter="24" class="mb-4">
      <a-col
        v-for="stat in statisticsOverview"
        :key="stat.title"
        :xs="24"
        :sm="12"
        :md="6"
      >
        <a-card :bordered="false" class="stat-card">
          <a-statistic
            :title="stat.title"
            :value="stat.value"
            :suffix="stat.suffix"
            :value-style="{ color: stat.color }"
          >
            <template #prefix>
              <Icon :icon="stat.icon" />
            </template>
          </a-statistic>
          <div class="stat-trend">
            <span :class="['trend-text', stat.trend > 0 ? 'trend-up' : 'trend-down']">
              <Icon
                :icon="stat.trend > 0 ? 'ant-design:arrow-up-outlined' : 'ant-design:arrow-down-outlined'"
              />
              {{ Math.abs(stat.trend) }}%
            </span>
            <span class="trend-desc">较上月</span>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="24">
      <!-- 项目进度统计 -->
      <a-col :span="12">
        <a-card title="项目进度统计" :bordered="false" class="mb-4">
          <div class="project-progress-chart">
            <div class="chart-container">
              <!-- 这里可以集成ECharts或其他图表库 -->
              <div class="progress-list">
                <div
                  v-for="project in projectProgress"
                  :key="project.name"
                  class="progress-item"
                >
                  <div class="progress-header">
                    <span class="project-name">{{ project.name }}</span>
                    <span class="progress-percent">{{ project.progress }}%</span>
                  </div>
                  <a-progress
                    :percent="project.progress"
                    :status="getProgressStatus(project.progress)"
                    :stroke-color="getProgressColor(project.progress)"
                  />
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 代码提交统计 -->
      <a-col :span="12">
        <a-card title="代码提交统计" :bordered="false" class="mb-4">
          <div class="commit-stats">
            <div class="time-filter">
              <a-radio-group v-model:value="commitTimeRange" @change="handleCommitTimeChange">
                <a-radio-button value="week">最近一周</a-radio-button>
                <a-radio-button value="month">最近一月</a-radio-button>
                <a-radio-button value="quarter">最近三月</a-radio-button>
              </a-radio-group>
            </div>
            <div class="commit-chart">
              <!-- 简化的提交统计图表 -->
              <div class="commit-list">
                <div
                  v-for="commit in commitStats"
                  :key="commit.date"
                  class="commit-item"
                >
                  <div class="commit-date">{{ commit.date }}</div>
                  <div class="commit-bar">
                    <div
                      class="commit-bar-fill"
                      :style="{ width: `${(commit.count / maxCommits) * 100}%` }"
                    ></div>
                  </div>
                  <div class="commit-count">{{ commit.count }}</div>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="24">
      <!-- 部署统计 -->
      <a-col :span="12">
        <a-card title="部署统计" :bordered="false" class="mb-4">
          <div class="deploy-stats">
            <div class="deploy-overview">
              <a-row :gutter="16">
                <a-col :span="8">
                  <div class="deploy-stat-item">
                    <div class="stat-number success">{{ deployStats.success }}</div>
                    <div class="stat-label">成功部署</div>
                  </div>
                </a-col>
                <a-col :span="8">
                  <div class="deploy-stat-item">
                    <div class="stat-number failed">{{ deployStats.failed }}</div>
                    <div class="stat-label">失败部署</div>
                  </div>
                </a-col>
                <a-col :span="8">
                  <div class="deploy-stat-item">
                    <div class="stat-number">{{ deployStats.avgTime }}</div>
                    <div class="stat-label">平均耗时(分钟)</div>
                  </div>
                </a-col>
              </a-row>
            </div>

            <a-divider />

            <div class="deploy-history">
              <h4>最近部署记录</h4>
              <div class="deploy-list">
                <div
                  v-for="deploy in recentDeploys"
                  :key="deploy.id"
                  class="deploy-item"
                >
                  <div class="deploy-info">
                    <div class="deploy-env">{{ deploy.environment }}</div>
                    <div class="deploy-time">{{ deploy.time }}</div>
                  </div>
                  <div class="deploy-status">
                    <a-tag :color="deploy.status === 'success' ? 'green' : 'red'">
                      {{ deploy.status === 'success' ? '成功' : '失败' }}
                    </a-tag>
                  </div>
                  <div class="deploy-duration">{{ deploy.duration }}分钟</div>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 性能监控 -->
      <a-col :span="12">
        <a-card title="性能监控" :bordered="false" class="mb-4">
          <div class="performance-stats">
            <div class="metric-cards">
              <div
                v-for="metric in performanceMetrics"
                :key="metric.name"
                class="metric-card"
              >
                <div class="metric-header">
                  <Icon :icon="metric.icon" />
                  <span class="metric-name">{{ metric.name }}</span>
                </div>
                <div class="metric-value" :class="getMetricStatus(metric.value, metric.threshold)">
                  {{ metric.value }}{{ metric.unit }}
                </div>
                <div class="metric-threshold">
                  阈值: {{ metric.threshold }}{{ metric.unit }}
                </div>
              </div>
            </div>

            <a-divider />

            <div class="alert-summary">
              <h4>告警统计</h4>
              <a-row :gutter="16">
                <a-col :span="8">
                  <div class="alert-stat">
                    <div class="alert-count critical">{{ alertStats.critical }}</div>
                    <div class="alert-label">严重告警</div>
                  </div>
                </a-col>
                <a-col :span="8">
                  <div class="alert-stat">
                    <div class="alert-count warning">{{ alertStats.warning }}</div>
                    <div class="alert-label">警告告警</div>
                  </div>
                </a-col>
                <a-col :span="8">
                  <div class="alert-stat">
                    <div class="alert-count info">{{ alertStats.info }}</div>
                    <div class="alert-label">信息告警</div>
                  </div>
                </a-col>
              </a-row>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { Card, Row, Col, Statistic, Progress, RadioGroup, RadioButton, Tag, Divider } from 'ant-design-vue';
import Icon from '/@/components/Icon';

const props = defineProps<{
  appId: string;
}>();

// 统计概览数据
const statisticsOverview = ref([
  {
    title: '项目总数',
    value: 12,
    icon: 'ant-design:project-outlined',
    color: '#1890ff',
    trend: 8.5,
  },
  {
    title: '活跃项目',
    value: 8,
    icon: 'ant-design:rocket-outlined',
    color: '#52c41a',
    trend: 12.3,
  },
  {
    title: '代码提交',
    value: 1234,
    icon: 'ant-design:code-outlined',
    color: '#722ed1',
    trend: -2.1,
  },
  {
    title: '部署次数',
    value: 89,
    suffix: '次',
    icon: 'ant-design:cloud-upload-outlined',
    color: '#fa8c16',
    trend: 15.7,
  },
]);

// 项目进度数据
const projectProgress = ref([
  { name: '用户管理模块', progress: 85 },
  { name: '报表系统', progress: 92 },
  { name: '消息通知', progress: 100 },
  { name: '文件管理', progress: 35 },
  { name: '权限系统', progress: 68 },
]);

// 代码提交统计
const commitTimeRange = ref('week');
const commitStats = ref([
  { date: '01-15', count: 23 },
  { date: '01-16', count: 18 },
  { date: '01-17', count: 31 },
  { date: '01-18', count: 15 },
  { date: '01-19', count: 27 },
  { date: '01-20', count: 19 },
  { date: '01-21', count: 22 },
]);

// 最大提交数（用于计算百分比）
const maxCommits = computed(() => {
  return Math.max(...commitStats.value.map(item => item.count));
});

// 部署统计
const deployStats = ref({
  success: 156,
  failed: 8,
  avgTime: 12.5,
});

// 最近部署记录
const recentDeploys = ref([
  {
    id: '1',
    environment: '生产环境',
    time: '2024-01-21 14:30',
    status: 'success',
    duration: 8,
  },
  {
    id: '2',
    environment: '测试环境',
    time: '2024-01-21 10:15',
    status: 'success',
    duration: 6,
  },
  {
    id: '3',
    environment: '开发环境',
    time: '2024-01-20 16:45',
    status: 'failed',
    duration: 15,
  },
  {
    id: '4',
    environment: '测试环境',
    time: '2024-01-20 09:20',
    status: 'success',
    duration: 7,
  },
]);

// 性能指标
const performanceMetrics = ref([
  {
    name: 'CPU使用率',
    value: 45,
    unit: '%',
    threshold: 80,
    icon: 'ant-design:dashboard-outlined',
  },
  {
    name: '内存使用率',
    value: 62,
    unit: '%',
    threshold: 85,
    icon: 'ant-design:database-outlined',
  },
  {
    name: '响应时间',
    value: 1.2,
    unit: 's',
    threshold: 2,
    icon: 'ant-design:clock-circle-outlined',
  },
  {
    name: '错误率',
    value: 0.8,
    unit: '%',
    threshold: 5,
    icon: 'ant-design:warning-outlined',
  },
]);

// 告警统计
const alertStats = ref({
  critical: 2,
  warning: 5,
  info: 12,
});

/**
 * 获取进度状态
 */
const getProgressStatus = (progress: number) => {
  if (progress === 100) return 'success';
  if (progress >= 80) return 'active';
  if (progress >= 50) return 'normal';
  return 'exception';
};

/**
 * 获取进度颜色
 */
const getProgressColor = (progress: number) => {
  if (progress === 100) return '#52c41a';
  if (progress >= 80) return '#1890ff';
  if (progress >= 50) return '#faad14';
  return '#ff4d4f';
};

/**
 * 获取指标状态
 */
const getMetricStatus = (value: number, threshold: number) => {
  if (value >= threshold) return 'metric-danger';
  if (value >= threshold * 0.8) return 'metric-warning';
  return 'metric-normal';
};

/**
 * 处理提交时间范围变更
 */
const handleCommitTimeChange = () => {
  // TODO: 根据时间范围重新加载数据
  loadCommitStats();
};

/**
 * 加载提交统计数据
 */
const loadCommitStats = async () => {
  // TODO: 调用API获取提交统计数据
  console.log('Loading commit stats for range:', commitTimeRange.value);
};

/**
 * 加载统计数据
 */
const loadStatistics = async () => {
  // TODO: 调用API获取统计数据
  console.log('Loading statistics for app:', props.appId);
};

onMounted(() => {
  loadStatistics();
});
</script>

<style lang="less" scoped>
.statistics {
  .mb-4 {
    margin-bottom: 16px;
  }

  .stat-card {
    .stat-trend {
      margin-top: 8px;
      font-size: 12px;

      .trend-text {
        margin-right: 8px;

        &.trend-up {
          color: #52c41a;
        }

        &.trend-down {
          color: #ff4d4f;
        }
      }

      .trend-desc {
        color: #666;
      }
    }
  }

  .progress-list {
    .progress-item {
      margin-bottom: 16px;

      .progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .project-name {
          font-weight: 500;
        }

        .progress-percent {
          color: #666;
          font-size: 12px;
        }
      }
    }
  }

  .commit-stats {
    .time-filter {
      margin-bottom: 16px;
    }

    .commit-list {
      .commit-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;

        .commit-date {
          width: 60px;
          font-size: 12px;
          color: #666;
        }

        .commit-bar {
          flex: 1;
          height: 20px;
          background: #f0f0f0;
          border-radius: 10px;
          margin: 0 12px;
          overflow: hidden;

          .commit-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #1890ff, #52c41a);
            border-radius: 10px;
            transition: width 0.3s;
          }
        }

        .commit-count {
          width: 30px;
          text-align: right;
          font-size: 12px;
          font-weight: 500;
        }
      }
    }
  }

  .deploy-stats {
    .deploy-overview {
      .deploy-stat-item {
        text-align: center;

        .stat-number {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 4px;

          &.success {
            color: #52c41a;
          }

          &.failed {
            color: #ff4d4f;
          }
        }

        .stat-label {
          font-size: 12px;
          color: #666;
        }
      }
    }

    .deploy-history {
      h4 {
        margin-bottom: 16px;
        color: #333;
      }

      .deploy-list {
        .deploy-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          margin-bottom: 8px;
          background: #fafafa;
          border-radius: 4px;

          .deploy-info {
            flex: 1;

            .deploy-env {
              font-weight: 500;
              margin-bottom: 2px;
            }

            .deploy-time {
              font-size: 12px;
              color: #666;
            }
          }

          .deploy-status {
            margin: 0 12px;
          }

          .deploy-duration {
            font-size: 12px;
            color: #666;
          }
        }
      }
    }
  }

  .performance-stats {
    .metric-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 16px;

      .metric-card {
        padding: 12px;
        background: #fafafa;
        border-radius: 6px;

        .metric-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;

          .metric-name {
            margin-left: 8px;
            font-size: 12px;
            color: #666;
          }
        }

        .metric-value {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 4px;

          &.metric-normal {
            color: #52c41a;
          }

          &.metric-warning {
            color: #faad14;
          }

          &.metric-danger {
            color: #ff4d4f;
          }
        }

        .metric-threshold {
          font-size: 10px;
          color: #999;
        }
      }
    }

    .alert-summary {
      h4 {
        margin-bottom: 16px;
        color: #333;
      }

      .alert-stat {
        text-align: center;

        .alert-count {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 4px;

          &.critical {
            color: #ff4d4f;
          }

          &.warning {
            color: #faad14;
          }

          &.info {
            color: #1890ff;
          }
        }

        .alert-label {
          font-size: 12px;
          color: #666;
        }
      }
    }
  }
}
</style>