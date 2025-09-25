<template>
  <div class="pipeline-manager">
    <!-- 流水线概览 -->
    <div class="pipeline-overview">
      <a-card title="流水线概览" :bordered="false">
        <div class="overview-content">
          <div class="pipeline-status">
            <a-statistic
              title="总构建次数"
              :value="statistics.totalBuilds"
              :value-style="{ color: '#1890ff' }"
            />
            <a-statistic
              title="成功率"
              :value="statistics.successRate"
              suffix="%"
              :value-style="{ color: '#52c41a' }"
            />
            <a-statistic
              title="平均构建时长"
              :value="statistics.avgDuration"
              suffix="分钟"
              :value-style="{ color: '#722ed1' }"
            />
            <a-statistic
              title="今日构建"
              :value="statistics.todayBuilds"
              :value-style="{ color: '#fa8c16' }"
            />
          </div>
        </div>
      </a-card>
    </div>

    <!-- 流水线流程展示 -->
    <div class="pipeline-flow">
      <a-card title="流水线流程" :bordered="false">
        <template #extra>
          <a-space>
            <a-select
              v-model:value="selectedEnvironment"
              placeholder="选择环境"
              style="width: 120px"
              @change="handleEnvironmentChange"
            >
              <a-select-option value="test">测试环境</a-select-option>
              <a-select-option value="production">生产环境</a-select-option>
            </a-select>
            <a-button
              type="primary"
              :loading="triggering"
              @click="handleTriggerPipeline"
            >
              <template #icon>
                <PlayCircleOutlined />
              </template>
              触发流水线
            </a-button>
            <a-button @click="handleRefresh">
              <template #icon>
                <ReloadOutlined />
              </template>
              刷新
            </a-button>
          </a-space>
        </template>

        <!-- 流程图 -->
        <div class="pipeline-stages">
          <div
            v-for="(stage, index) in currentStages"
            :key="stage.name"
            class="stage-item"
            :class="getStageClass(stage)"
          >
            <div class="stage-icon">
              <component :is="getStageIcon(stage.type)" />
            </div>
            <div class="stage-content">
              <div class="stage-title">{{ stage.displayName }}</div>
              <div class="stage-status">{{ getStageStatusText(stage) }}</div>
              <div v-if="stage.duration" class="stage-duration">
                {{ formatDuration(stage.duration) }}
              </div>
            </div>
            <div v-if="index < currentStages.length - 1" class="stage-arrow">
              <ArrowRightOutlined />
            </div>
          </div>
        </div>

        <!-- 当前构建信息 -->
        <div v-if="currentBuild" class="current-build">
          <a-alert
            :message="`构建 #${currentBuild.buildNumber} - ${currentBuild.status === 'running' ? '正在运行' : '已完成'}`"
            :type="getBuildAlertType(currentBuild.status)"
            :description="`分支: ${currentBuild.branch} | 触发人: ${currentBuild.triggeredBy} | 开始时间: ${currentBuild.startTime}`"
            show-icon
          />
        </div>
      </a-card>
    </div>

    <!-- 流水线历史 -->
    <div class="pipeline-history">
      <a-card title="构建历史" :bordered="false">
        <template #extra>
          <a-space>
            <a-select
              v-model:value="historyFilter.status"
              placeholder="状态筛选"
              style="width: 120px"
              allow-clear
              @change="loadPipelineHistory"
            >
              <a-select-option value="success">成功</a-select-option>
              <a-select-option value="failed">失败</a-select-option>
              <a-select-option value="running">运行中</a-select-option>
              <a-select-option value="cancelled">已取消</a-select-option>
            </a-select>
            <a-select
              v-model:value="historyFilter.environment"
              placeholder="环境筛选"
              style="width: 120px"
              allow-clear
              @change="loadPipelineHistory"
            >
              <a-select-option value="test">测试环境</a-select-option>
              <a-select-option value="production">生产环境</a-select-option>
            </a-select>
          </a-space>
        </template>

        <a-table
          :columns="historyColumns"
          :data-source="pipelineHistory"
          :loading="historyLoading"
          :pagination="historyPagination"
          row-key="id"
          @change="handleHistoryTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
            <template v-if="column.key === 'duration'">
              {{ formatDuration(record.duration) }}
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button
                  type="link"
                  size="small"
                  @click="handleViewDetails(record)"
                >
                  详情
                </a-button>
                <a-button
                  v-if="record.status === 'failed'"
                  type="link"
                  size="small"
                  @click="handleRetryBuild(record)"
                >
                  重试
                </a-button>
                <a-button
                  v-if="record.status === 'running'"
                  type="link"
                  size="small"
                  danger
                  @click="handleCancelBuild(record)"
                >
                  取消
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>



    <!-- 构建详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="构建详情"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedBuild" class="build-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="构建号">
            #{{ selectedBuild.buildNumber }}
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(selectedBuild.status)">
              {{ getStatusText(selectedBuild.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="分支">
            {{ selectedBuild.branch }}
          </a-descriptions-item>
          <a-descriptions-item label="提交ID">
            <a-typography-text code>{{ selectedBuild.commitId }}</a-typography-text>
          </a-descriptions-item>
          <a-descriptions-item label="提交信息" :span="2">
            {{ selectedBuild.commitMessage }}
          </a-descriptions-item>
          <a-descriptions-item label="触发方式">
            {{ selectedBuild.triggerType === 'manual' ? '手动触发' : '自动触发' }}
          </a-descriptions-item>
          <a-descriptions-item label="触发人">
            {{ selectedBuild.triggeredBy }}
          </a-descriptions-item>
          <a-descriptions-item label="开始时间">
            {{ selectedBuild.startTime }}
          </a-descriptions-item>
          <a-descriptions-item label="结束时间">
            {{ selectedBuild.endTime || '进行中' }}
          </a-descriptions-item>
          <a-descriptions-item label="构建时长">
            {{ formatDuration(selectedBuild.duration) }}
          </a-descriptions-item>
          <a-descriptions-item label="环境">
            <a-tag color="blue">{{ selectedBuild.environment === 'test' ? '测试环境' : '生产环境' }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>

        <!-- 阶段详情 -->
        <div class="stages-detail">
          <h4>阶段详情</h4>
          <a-timeline>
            <a-timeline-item
              v-for="stage in selectedBuild.stages"
              :key="stage.name"
              :color="getStageTimelineColor(stage.status)"
            >
              <template #dot>
                <component :is="getStageIcon(stage.type)" />
              </template>
              <div class="stage-timeline-content">
                <div class="stage-timeline-title">
                  {{ stage.displayName }}
                  <a-tag :color="getStatusColor(stage.status)" size="small">
                    {{ getStatusText(stage.status) }}
                  </a-tag>
                </div>
                <div class="stage-timeline-time">
                  开始: {{ stage.startTime }} | 结束: {{ stage.endTime || '进行中' }} | 
                  时长: {{ formatDuration(stage.duration) }}
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute } from 'vue-router';
import {
  PlayCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  ArrowRightOutlined,
  GitlabOutlined,
  BuildOutlined,
  BugOutlined,
  CloudUploadOutlined
} from '@ant-design/icons-vue';
import { 
  getPipelineStatus, 
  triggerPipeline, 
  stopPipeline, 
  getPipelineLogs, 
  getPipelineHistory, 
  retryPipelineStage, 
  skipPipelineStage,
  getPipelineConfig,
  savePipelineConfig,
  togglePipelineConfig,
  cancelPipeline
} from '../Project.api';// 接口定义
interface PipelineStage {
  name: string;
  displayName: string;
  type: 'git' | 'build' | 'test' | 'deploy';
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  startTime?: string;
  endTime?: string;
  duration?: number;
  enabled: boolean;
  order: number;
}

interface PipelineBuild {
  id: string;
  buildNumber: number;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  branch: string;
  commitId: string;
  commitMessage: string;
  triggerType: 'manual' | 'auto';
  triggeredBy: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  environment: 'test' | 'production';
  stages: PipelineStage[];
}

interface PipelineConfig {
  id: string;
  projectId: string;
  name: string;
  description: string;
  enabled: boolean;
  autoTrigger: boolean;
  environments: Array<{
    name: string;
    displayName: string;
    enabled: boolean;
    autoTrigger: boolean;
    stages: PipelineStage[];
  }>;
  notifications: {
    enabled: boolean;
    channels: string[];
    events: string[];
  };
  createTime: string;
  updateTime: string;
}

interface PipelineStatistics {
  totalBuilds: number;
  successRate: number;
  avgDuration: number;
  todayBuilds: number;
}

// 响应式数据
const route = useRoute();
const projectId = computed(() => route.params.id as string);

// 基础状态
const loading = ref(false);
const triggering = ref(false);
const configLoading = ref(false);
const historyLoading = ref(false);

// 环境选择
const selectedEnvironment = ref<'test' | 'production'>('test');

// 统计数据
const statistics = reactive<PipelineStatistics>({
  totalBuilds: 2,
  successRate: 50,
  avgDuration: 45,
  todayBuilds: 1
});

// 流水线配置
const pipelineConfig = reactive<PipelineConfig>({
  id: '',
  projectId: '',
  name: '默认流水线',
  description: '',
  enabled: false,
  autoTrigger: false,
  environments: [
    {
      name: 'test',
      displayName: '测试环境',
      enabled: true,
      stages: [
        {
          name: 'git',
          displayName: 'Git拉取',
          type: 'git',
          status: 'pending',
          enabled: true,
          order: 1
        },
        {
          name: 'build',
          displayName: '构建',
          type: 'build',
          status: 'pending',
          enabled: true,
          order: 2
        },
        {
          name: 'test',
          displayName: '测试',
          type: 'test',
          status: 'pending',
          enabled: true,
          order: 3
        },
        {
          name: 'deploy',
          displayName: '部署',
          type: 'deploy',
          status: 'pending',
          enabled: true,
          order: 4
        }
      ]
    },
    {
      name: 'production',
      displayName: '生产环境',
      enabled: false,
      stages: []
    }
  ],
  notifications: {
    enabled: false,
    channels: [],
    events: []
  },
  createTime: new Date().toISOString(),
  updateTime: new Date().toISOString()
});

// 当前构建
const currentBuild = ref<PipelineBuild | null>(null);

// 当前流水线状态
const currentPipeline = reactive({
  id: '',
  status: 'pending' as 'pending' | 'running' | 'success' | 'failed' | 'cancelled',
  currentStage: null as string | null,
  progress: 0,
  startTime: null as string | null,
  endTime: null as string | null,
  logs: [] as Array<{
    timestamp: string;
    level: string;
    message: string;
    stage: string;
  }>
});

// 流水线历史
const pipelineHistory = ref<PipelineBuild[]>([
  {
    id: '1',
    buildNumber: 1,
    status: 'success',
    branch: 'main',
    commitId: 'abc123',
    commitMessage: '初始化项目',
    triggerType: 'manual',
    triggeredBy: '管理员',
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date().toISOString(),
    duration: 60,
    environment: 'test',
    stages: []
  },
  {
    id: '2',
    buildNumber: 2,
    status: 'failed',
    branch: 'develop',
    commitId: 'def456',
    commitMessage: '修复bug',
    triggerType: 'auto',
    triggeredBy: '开发者',
    startTime: new Date(Date.now() - 1800000).toISOString(),
    endTime: new Date(Date.now() - 1200000).toISOString(),
    duration: 30,
    environment: 'test',
    stages: []
  }
]);
const historyFilter = reactive({
  status: undefined as string | undefined,
  environment: undefined as string | undefined
});
const historyPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 2,
  showSizeChanger: true,
  showQuickJumper: true
});

// 详情弹窗
const detailModalVisible = ref(false);
const selectedBuild = ref<PipelineBuild | null>(null);

// 计算属性
const currentStages = computed(() => {
  const env = pipelineConfig.environments.find(e => e.name === selectedEnvironment.value);
  return env?.stages || [];
});

// 历史表格列定义
const historyColumns = [
  {
    title: '构建号',
    dataIndex: 'buildNumber',
    key: 'buildNumber',
    width: 100,
    customRender: ({ text }) => `#${text}`
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '分支',
    dataIndex: 'branch',
    key: 'branch',
    width: 120
  },
  {
    title: '环境',
    dataIndex: 'environment',
    key: 'environment',
    width: 100,
    customRender: ({ text }) => text === 'test' ? '测试环境' : '生产环境'
  },
  {
    title: '触发人',
    dataIndex: 'triggeredBy',
    key: 'triggeredBy',
    width: 100
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime',
    width: 160
  },
  {
    title: '构建时长',
    dataIndex: 'duration',
    key: 'duration',
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right'
  }
];

// 方法定义

/**
 * 加载流水线状态
 */
const loadPipelineStatus = async () => {
  try {
    console.log('开始加载流水线状态，项目ID:', projectId.value);
    
    const response = await getPipelineStatus({ projectId: projectId.value });
    
    console.log('流水线状态响应:', response);
    
    // if (response.success && response.result) {
      Object.assign(currentPipeline, response.result);
      console.log('设置流水线状态:', currentPipeline);
    // } else {
    //   console.error('加载流水线状态失败:', response.message);
    // }
  } catch (error) {
    console.error('加载流水线状态失败:', error);
  }
};

/**
 * 加载流水线配置
 */
const loadPipelineConfig = async () => {
  try {
    configLoading.value = true;
    console.log('开始加载流水线配置，项目ID:', projectId.value);
    
    const response = await getPipelineConfig({ projectId: projectId.value });
    
    console.log('流水线配置响应:', response);
    
    if (response.success && response.result) {
      Object.assign(pipelineConfig, response.result);
      console.log('设置配置数据:', pipelineConfig);
    } else {
      console.error('加载流水线配置失败:', response.message);
      message.error(response.message || '加载流水线配置失败');
    }
  } catch (error) {
    console.error('加载流水线配置失败:', error);
    message.error('加载流水线配置失败');
  } finally {
    configLoading.value = false;
  }
};

/**
 * 加载流水线历史
 */
const loadPipelineHistory = async () => {
  try {
    historyLoading.value = true;
    console.log('开始加载流水线历史，项目ID:', projectId.value);
    
    const response = await getPipelineHistory({
      projectId: projectId.value,
      current: historyPagination.current,
      size: historyPagination.pageSize,
      status: historyFilter.status,
      environment: historyFilter.environment
    });
    
    console.log('流水线历史响应:', response);
    
    if (response.success) {
      pipelineHistory.value = response.result.records || [];
      historyPagination.total = response.result.total || 0;
      
      console.log('设置历史数据:', pipelineHistory.value);
      console.log('分页信息:', historyPagination);
      
      // 计算统计数据
      calculateStatistics();
    } else {
      console.error('加载流水线历史失败:', response.message);
      message.error(response.message || '加载流水线历史失败');
    }
  } catch (error) {
    console.error('加载流水线历史失败:', error);
    message.error('加载流水线历史失败');
  } finally {
    historyLoading.value = false;
  }
};

/**
 * 计算统计数据
 */
/**
 * 计算流水线统计数据
 */
const calculateStatistics = () => {
  const allHistory = pipelineHistory.value;
  console.log('计算统计数据 - 历史数据:', allHistory);
  
  // 总构建数
  statistics.value.totalBuilds = allHistory.length;
  
  if (allHistory.length > 0) {
    // 成功率计算
    const successCount = allHistory.filter(h => h.status === 'success').length;
    statistics.value.successRate = Math.round((successCount / allHistory.length) * 100);
    
    // 平均持续时间计算（mock数据中duration已经是分钟）
    const completedBuilds = allHistory.filter(h => h.duration && h.duration > 0);
    if (completedBuilds.length > 0) {
      const totalDuration = completedBuilds.reduce((sum, h) => sum + (h.duration || 0), 0);
      statistics.value.avgDuration = Math.round(totalDuration / completedBuilds.length);
    } else {
      statistics.value.avgDuration = 0;
    }
    
    // 今日构建数计算
    const today = new Date().toDateString();
    statistics.value.todayBuilds = allHistory.filter(h => 
      new Date(h.startTime).toDateString() === today
    ).length;
  } else {
    // 如果没有历史数据，设置默认值
    statistics.value.successRate = 0;
    statistics.value.avgDuration = 0;
    statistics.value.todayBuilds = 0;
  }
  
  console.log('计算后的统计数据:', statistics.value);
};

/**
 * 处理环境变更
 */
const handleEnvironmentChange = (value: 'test' | 'production') => {
  selectedEnvironment.value = value;
  // 可以在这里加载对应环境的当前构建状态
};

/**
 * 触发流水线
 */
const handleTriggerPipeline = async () => {
  try {
    triggering.value = true;
    const response = await triggerPipeline({
      projectId: projectId.value,
      environment: selectedEnvironment.value,
      branch: 'develop' // 可以从界面选择
    });
    
    if (response.success) {
      message.success('流水线触发成功');
      await loadPipelineHistory();
    }
  } catch (error) {
    console.error('触发流水线失败:', error);
    message.error('触发流水线失败');
  } finally {
    triggering.value = false;
  }
};

/**
 * 刷新数据
 */
const handleRefresh = async () => {
  await Promise.all([
    loadPipelineStatus(),
    loadPipelineConfig(),
    loadPipelineHistory()
  ]);
};

/**
 * 切换流水线启用状态
 */
const handleTogglePipeline = async (enabled: boolean) => {
  try {
    configLoading.value = true;
    const response = await togglePipelineConfig({
      projectId: projectId.value,
      enabled
    });
    
    if (response.success) {
      message.success(enabled ? '流水线已启用' : '流水线已禁用');
      pipelineConfig.enabled = enabled;
    }
  } catch (error) {
    console.error('切换流水线状态失败:', error);
    message.error('切换流水线状态失败');
    // 恢复原状态
    pipelineConfig.enabled = !enabled;
  } finally {
    configLoading.value = false;
  }
};

/**
 * 编辑配置
 */
const handleEditConfig = () => {
  message.info('配置编辑功能开发中...');
};

/**
 * 查看构建详情
 */
const handleViewDetails = (record: PipelineBuild) => {
  selectedBuild.value = record;
  detailModalVisible.value = true;
};

/**
 * 重试构建
 */
const handleRetryBuild = async (record: PipelineBuild) => {
  try {
    const response = await retryPipelineStage({
      projectId: projectId.value,
      stage: record.id
    });
    
    if (response.success) {
      message.success('重试构建成功');
      await loadPipelineHistory();
    }
  } catch (error) {
    console.error('重试构建失败:', error);
    message.error('重试构建失败');
  }
};

/**
 * 取消构建
 */
const handleCancelBuild = async (record: PipelineBuild) => {
  try {
    const response = await cancelPipeline({
      projectId: projectId.value,
      buildId: record.id
    });
    
    if (response.success) {
      message.success('取消构建成功');
      await loadPipelineHistory();
    }
  } catch (error) {
    console.error('取消构建失败:', error);
    message.error('取消构建失败');
  }
};

/**
 * 处理历史表格变更
 */
const handleHistoryTableChange = (pagination: any) => {
  historyPagination.current = pagination.current;
  historyPagination.pageSize = pagination.pageSize;
  loadPipelineHistory();
};

// 工具方法

/**
 * 获取阶段样式类
 */
const getStageClass = (stage: PipelineStage) => {
  return {
    'stage-pending': stage.status === 'pending',
    'stage-running': stage.status === 'running',
    'stage-success': stage.status === 'success',
    'stage-failed': stage.status === 'failed',
    'stage-cancelled': stage.status === 'cancelled'
  };
};

/**
 * 获取阶段图标
 */
const getStageIcon = (type: string) => {
  const iconMap = {
    git: GitlabOutlined,
    build: BuildOutlined,
    test: BugOutlined,
    deploy: CloudUploadOutlined
  };
  return iconMap[type] || BuildOutlined;
};

/**
 * 获取阶段状态文本
 */
const getStageStatusText = (stage: PipelineStage) => {
  const statusMap = {
    pending: '等待中',
    running: '运行中',
    success: '成功',
    failed: '失败',
    cancelled: '已取消'
  };
  return statusMap[stage.status] || '未知';
};

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colorMap = {
    pending: 'default',
    running: 'processing',
    success: 'success',
    failed: 'error',
    cancelled: 'warning'
  };
  return colorMap[status] || 'default';
};

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const textMap = {
    pending: '等待中',
    running: '运行中',
    success: '成功',
    failed: '失败',
    cancelled: '已取消'
  };
  return textMap[status] || '未知';
};

/**
 * 获取构建警告类型
 */
const getBuildAlertType = (status: string) => {
  const typeMap = {
    running: 'info',
    success: 'success',
    failed: 'error',
    cancelled: 'warning'
  };
  return typeMap[status] || 'info';
};

/**
 * 获取阶段时间线颜色
 */
const getStageTimelineColor = (status: string) => {
  const colorMap = {
    pending: 'gray',
    running: 'blue',
    success: 'green',
    failed: 'red',
    cancelled: 'orange'
  };
  return colorMap[status] || 'gray';
};

/**
 * 格式化时长
 */
const formatDuration = (seconds?: number) => {
  if (!seconds) return '-';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`;
  }
  return `${remainingSeconds}秒`;
};

// 生命周期
onMounted(async () => {
  await handleRefresh();
});

// 监听项目ID变化
watch(() => projectId.value, async (newId) => {
  if (newId) {
    await handleRefresh();
  }
});
</script>

<style lang="less" scoped>
.pipeline-manager {
  padding: 16px;
  
  .pipeline-overview {
    margin-bottom: 24px;
    
    .overview-content {
      .pipeline-status {
        display: flex;
        justify-content: space-around;
        align-items: center;
        gap: 24px;
      }
    }
  }
  
  .pipeline-flow {
    margin-bottom: 24px;
    
    .pipeline-stages {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 0;
      gap: 16px;
      
      .stage-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px;
        border-radius: 8px;
        border: 2px solid #d9d9d9;
        background: #fafafa;
        min-width: 120px;
        transition: all 0.3s;
        
        &.stage-pending {
          border-color: #d9d9d9;
          background: #fafafa;
        }
        
        &.stage-running {
          border-color: #1890ff;
          background: #e6f7ff;
          box-shadow: 0 0 8px rgba(24, 144, 255, 0.3);
        }
        
        &.stage-success {
          border-color: #52c41a;
          background: #f6ffed;
        }
        
        &.stage-failed {
          border-color: #ff4d4f;
          background: #fff2f0;
        }
        
        &.stage-cancelled {
          border-color: #faad14;
          background: #fffbe6;
        }
        
        .stage-icon {
          font-size: 24px;
          margin-bottom: 8px;
          color: #666;
        }
        
        .stage-content {
          text-align: center;
          
          .stage-title {
            font-weight: 600;
            margin-bottom: 4px;
          }
          
          .stage-status {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
          }
          
          .stage-duration {
            font-size: 11px;
            color: #999;
          }
        }
      }
      
      .stage-arrow {
        font-size: 16px;
        color: #999;
      }
    }
    
    .current-build {
      margin-top: 16px;
    }
  }
  
  .pipeline-history {
    margin-bottom: 24px;
  }
  
  .pipeline-config {
    .config-content {
      margin-top: 16px;
    }
  }
  
  .build-detail {
    .stages-detail {
      margin-top: 24px;
      
      h4 {
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 600;
      }
      
      .stage-timeline-content {
        .stage-timeline-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          font-weight: 600;
        }
        
        .stage-timeline-time {
          font-size: 12px;
          color: #666;
        }
      }
    }
  }
}
</style>