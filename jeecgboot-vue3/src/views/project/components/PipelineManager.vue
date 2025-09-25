<template>
  <div class="pipeline-manager">


    <!-- 流水线流程图 -->
    <PipelineFlowChart
      :pipeline-config="pipelineConfig"
      :current-build="currentBuild"
      :current-pipeline="currentPipeline"
      :triggering="triggering"
      :config-loading="configLoading"
      @environment-change="handleEnvironmentChange"
      @trigger-pipeline="handleTriggerPipeline"
      @refresh="handleRefresh"
      @toggle-pipeline="handleTogglePipeline"
      @continue-stage="handleContinueStage"
      @view-stage-logs="handleViewStageLogs"
      @retry-stage="handleRetryStage"
      @skip-stage="handleSkipStage"
      @cancel-stage="handleCancelStage"
      @cancel-build="handleCancelBuild"
      @edit-config="handleEditConfig"
    />

    <!-- 流水线历史 -->
    <PipelineHistory
      :pipeline-history="pipelineHistory.list"
      :loading="historyLoading"
      @refresh="handleRefreshHistory"
      @view-details="handleViewDetails"
      @retry-build="handleRetryBuild"
      @cancel-build="handleCancelBuild"
      @delete-build="handleDeleteBuild"
      @batch-delete="handleBatchDeleteBuilds"
      @download-logs="handleDownloadLogs"
      @batch-download="handleBatchDownloadLogs"
      @compare-build="handleCompareBuilds"
    />

    <!-- 构建详情弹窗 -->
    <BuildDetailModal
      v-model:visible="detailModalVisible"
      :build-detail="selectedBuildDetail"
      :loading="detailLoading"
      @view-stage-logs="handleViewStageLogs"
      @retry-stage="handleRetryStage"
      @continue-stage="handleContinueStage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import {
  BuildOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons-vue';

// 导入拆分的组件
import PipelineFlowChart from './PipelineFlowChart.vue';
import PipelineHistory from './PipelineHistory.vue';
import BuildDetailModal from './BuildDetailModal.vue';

// 导入API服务
import {
  getPipelineConfig,
  updatePipelineConfig,
  savePipelineConfig,
  togglePipelineConfig,
  getPipelineStatus,
  getPipelineHistory,
  getBuildDetail,
  deleteBuild,
  batchDeleteBuilds,
  triggerPipeline,
  cancelPipeline,
  retryBuild,
  continueStage,
  retryPipelineStage,
  skipPipelineStage,
  cancelStage,
  getStageLogs,
  getBuildLogs,
  downloadBuildLogs,
  batchDownloadLogs
} from '../Project.api';

// 导入类型定义
import type {
  PipelineConfig,
  PipelineBuild,
  PipelineStage,
  PipelineEnvironment
} from '../types/pipeline';

/**
 * 组件属性定义
 */
interface Props {
  projectId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  projectId: ''
});

/**
 * 组件事件定义
 */
const emit = defineEmits<{
  configUpdated: [config: PipelineConfig];
  buildTriggered: [buildId: string];
  buildCompleted: [build: PipelineBuild];
}>();

// 路由信息
const route = useRoute();

// 响应式数据
const triggering = ref(false);
const configLoading = ref(false);
const historyLoading = ref(false);
const detailLoading = ref(false);
const detailModalVisible = ref(false);

// 流水线配置
const pipelineConfig = reactive<PipelineConfig>({
  id: '',
  name: '',
  enabled: true,
  environments: [],
  stages: []
});

// 当前构建信息
const currentBuild = ref<PipelineBuild | null>(null);

// 当前流水线状态
const currentPipeline = reactive({
  status: 'idle',
  progress: 0,
  logs: [] as string[]
});

// 流水线历史
const pipelineHistory = reactive({
  list: [] as PipelineBuild[],
  total: 0,
  page: 1,
  pageSize: 10,
  filters: {
    status: '',
    branch: '',
    startDate: '',
    endDate: ''
  }
});

// 选中的构建详情
const selectedBuildDetail = ref<PipelineBuild | null>(null);

// 轮询控制
let statusPolling: (() => void) | null = null;

/**
 * 计算属性
 */
const projectId = computed(() => {
  return props.projectId || (route.params.id as string) || 'default-project-id';
});

/**
 * 加载流水线配置
 */
const loadPipelineConfig = async () => {
  try {
    configLoading.value = true;
    const config = await getPipelineConfig({ projectId: projectId.value });
    Object.assign(pipelineConfig, config);
  } catch (error) {
    console.error('加载流水线配置失败:', error);
    message.error('加载流水线配置失败');
  } finally {
    configLoading.value = false;
  }
};

/**
 * 加载流水线状态
 */
const loadPipelineStatus = async () => {
  try {
    const status = await getPipelineStatus({ projectId: projectId.value });
    currentBuild.value = status.currentBuild;
    Object.assign(currentPipeline, status.currentPipeline);
  } catch (error) {
    console.error('加载流水线状态失败:', error);
  }
};

/**
 * 加载流水线历史
 */
const loadPipelineHistory = async (params?: any) => {
  try {
    historyLoading.value = true;
    const result = await getPipelineHistory({
      projectId: projectId.value,
      page: pipelineHistory.page,
      pageSize: pipelineHistory.pageSize,
      ...pipelineHistory.filters,
      ...params
    });
    
    console.log(result,'result---')
    pipelineHistory.list = result.records || [];
    pipelineHistory.total = result.total || 0;
    pipelineHistory.page = result.pages || 1;
    pipelineHistory.pageSize = result.size || 10;
  } catch (error) {
    console.error('加载流水线历史失败:', error);
    message.error('加载流水线历史失败');
  } finally {
    historyLoading.value = false;
  }
};

/**
 * 开始状态轮询
 */
const startStatusPolling = async () => {
  if (statusPolling) {
    statusPolling();
  }
  
  // 简化轮询逻辑，直接使用定时器
  const poll = async () => {
    try {
      const status = await getPipelineStatus({ projectId: projectId.value });
      currentBuild.value = status.currentBuild;
      Object.assign(currentPipeline, status.currentPipeline);
      
      // 如果构建完成，刷新历史记录
      if (status.currentBuild?.status && ['success', 'failed', 'cancelled'].includes(status.currentBuild.status)) {
        loadPipelineHistory();
        emit('buildCompleted', status.currentBuild);
      } else if (status.currentBuild?.status === 'running') {
        // 如果还在运行，继续轮询
        setTimeout(poll, 5000);
      }
    } catch (error) {
      console.error('轮询状态失败:', error);
      // 出错时也继续轮询，但间隔时间加长
      setTimeout(poll, 10000);
    }
  };
  
  // 开始轮询
  poll();
  
  // 返回停止轮询的函数
  statusPolling = () => {
    // 这里可以添加停止轮询的逻辑
  };
};

/**
 * 停止状态轮询
 */
const stopStatusPolling = () => {
  if (statusPolling) {
    statusPolling();
    statusPolling = null;
  }
};

/**
 * 事件处理函数
 */

/**
 * 处理环境变更
 */
const handleEnvironmentChange = (environment: string) => {
  console.log('环境变更:', environment);
};

/**
 * 处理触发流水线
 */
const handleTriggerPipeline = async (params: { environment: string; branch?: string }) => {
  try {
    triggering.value = true;
    const result = await triggerPipeline({
      projectId: projectId.value,
      environment: params.environment,
      branch: params.branch
    });
    
    message.success(`流水线已触发，构建编号: ${result.buildNumber}`);
    emit('buildTriggered', result.buildId);
    
    // 开始轮询状态
    startStatusPolling();
    
    // 刷新历史记录
    loadPipelineHistory();
  } catch (error) {
    console.error('触发流水线失败:', error);
    message.error('触发流水线失败');
  } finally {
    triggering.value = false;
  }
};

/**
 * 处理刷新
 */
const handleRefresh = () => {
  loadPipelineStatus();
  loadPipelineHistory();
};

/**
 * 处理启用/禁用流水线
 */
const handleTogglePipeline = async (enabled: boolean) => {
  try {
    await togglePipelineConfig({ projectId: projectId.value, enabled });
    pipelineConfig.enabled = enabled;
    message.success(enabled ? '流水线已启用' : '流水线已禁用');
  } catch (error) {
    console.error('切换流水线状态失败:', error);
    message.error('切换流水线状态失败');
  }
};

/**
 * 处理继续阶段
 */
const handleContinueStage = async (stageName: string) => {
  if (!currentBuild.value) return;
  
  try {
    await continueStage({
      projectId: projectId.value,
      buildId: currentBuild.value.id,
      stageName
    });
    message.success('阶段已继续');
  } catch (error) {
    console.error('继续阶段失败:', error);
    message.error('继续阶段失败');
  }
};

/**
 * 处理查看阶段日志
 */
const handleViewStageLogs = (stageName: string) => {
  // 这里可以打开日志查看器或跳转到日志页面
  console.log('查看阶段日志:', stageName);
  message.info(`查看 ${stageName} 阶段日志`);
};

/**
 * 处理重试阶段
 */
const handleRetryStage = async (stageName: string) => {
  if (!currentBuild.value) return;
  
  try {
    await retryPipelineStage({
      projectId: projectId.value,
      buildId: currentBuild.value.id,
      stageName
    });
    message.success('阶段已重试');
  } catch (error) {
    console.error('重试阶段失败:', error);
    message.error('重试阶段失败');
  }
};

/**
 * 处理跳过阶段
 */
const handleSkipStage = async (stageName: string) => {
  if (!currentBuild.value) return;
  
  Modal.confirm({
    title: '确认跳过阶段',
    content: `确定要跳过 ${stageName} 阶段吗？`,
    onOk: async () => {
      try {
        await skipPipelineStage({
          projectId: projectId.value,
          buildId: currentBuild.value!.id,
          stageName
        });
        message.success('阶段已跳过');
      } catch (error) {
        console.error('跳过阶段失败:', error);
        message.error('跳过阶段失败');
      }
    }
  });
};

/**
 * 处理取消阶段
 */
const handleCancelStage = async (stageName: string) => {
  if (!currentBuild.value) return;
  
  Modal.confirm({
    title: '确认取消阶段',
    content: `确定要取消 ${stageName} 阶段吗？`,
    onOk: async () => {
      try {
        await cancelStage({
          projectId: projectId.value,
          buildId: currentBuild.value!.id,
          stageName
        });
        message.success('阶段已取消');
      } catch (error) {
        console.error('取消阶段失败:', error);
        message.error('取消阶段失败');
      }
    }
  });
};

/**
 * 处理取消构建
 */
const handleCancelBuild = async (buildId?: string) => {
  const targetBuildId = buildId || currentBuild.value?.id;
  if (!targetBuildId) return;
  
  Modal.confirm({
    title: '确认取消构建',
    content: '确定要取消当前构建吗？',
    onOk: async () => {
      try {
        await cancelPipeline({ projectId: projectId.value, buildId: targetBuildId });
        message.success('构建已取消');
        loadPipelineStatus();
        loadPipelineHistory();
      } catch (error) {
        console.error('取消构建失败:', error);
        message.error('取消构建失败');
      }
    }
  });
};

/**
 * 处理编辑配置
 */
const handleEditConfig = () => {
  // 这里可以打开配置编辑器或跳转到配置页面
  console.log('编辑流水线配置');
  message.info('编辑流水线配置');
};

/**
 * 处理查看构建详情
 */
const handleViewDetails = async (build: PipelineBuild) => {
  try {
    detailLoading.value = true;
    detailModalVisible.value = true;
    
    const detail = await getBuildDetail({ projectId: projectId.value, buildId: build.id });
    selectedBuildDetail.value = detail;
  } catch (error) {
    console.error('加载构建详情失败:', error);
  } finally {
    detailLoading.value = false;
  }
};

/**
 * 处理重新构建
 */
const handleRetryBuild = async (build: PipelineBuild) => {
  try {
    const result = await retryBuild({ projectId: projectId.value, buildId: build.id });
    message.success(`重新构建已触发，构建编号: ${result.buildNumber}`);
    
    // 开始轮询状态
    startStatusPolling();
    
    // 刷新历史记录
    loadPipelineHistory();
  } catch (error) {
    console.error('重新构建失败:', error);
    message.error('重新构建失败');
  }
};

/**
 * 处理删除构建
 */
const handleDeleteBuild = async (build: PipelineBuild) => {
  Modal.confirm({
    title: '确认删除构建',
    content: `确定要删除构建 #${build.buildNumber} 吗？`,
    onOk: async () => {
      try {
        await deleteBuild({ projectId: projectId.value, buildId: build.id });
        message.success('构建已删除');
        loadPipelineHistory();
      } catch (error) {
        console.error('删除构建失败:', error);
        message.error('删除构建失败');
      }
    }
  });
};

/**
 * 处理批量删除构建
 */
const handleBatchDeleteBuilds = async (buildIds: string[]) => {
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${buildIds.length} 个构建吗？`,
    onOk: async () => {
      try {
        await batchDeleteBuilds({ projectId: projectId.value, buildIds });
        message.success('构建已批量删除');
        loadPipelineHistory();
      } catch (error) {
        console.error('批量删除构建失败:', error);
        message.error('批量删除构建失败');
      }
    }
  });
};

/**
 * 处理下载日志
 */
const handleDownloadLogs = async (build: PipelineBuild) => {
  try {
    const blob = await downloadBuildLogs({ projectId: projectId.value, buildId: build.id });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `build-${build.buildNumber}-logs.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    message.success('日志下载已开始');
  } catch (error) {
    console.error('下载日志失败:', error);
    message.error('下载日志失败');
  }
};

/**
 * 处理批量下载日志
 */
const handleBatchDownloadLogs = async (buildIds: string[]) => {
  try {
    const blob = await batchDownloadLogs({ projectId: projectId.value, buildIds });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch-build-logs.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    message.success('批量日志下载已开始');
  } catch (error) {
    console.error('批量下载日志失败:', error);
    message.error('批量下载日志失败');
  }
};

/**
 * 处理构建对比
 */
const handleCompareBuilds = (builds: PipelineBuild[]) => {
  // 这里可以打开构建对比页面
  console.log('对比构建:', builds);
  message.info(`对比 ${builds.length} 个构建`);
};

/**
 * 处理历史表格变更
 */
const handleHistoryTableChange = (pagination: any, filters: any, sorter: any) => {
  pipelineHistory.page = pagination.current;
  pipelineHistory.pageSize = pagination.pageSize;
  
  // 应用过滤器
  Object.assign(pipelineHistory.filters, filters);
  
  // 重新加载数据
  loadPipelineHistory();
};

/**
 * 生命周期钩子
 */
onMounted(() => {
  // 初始化加载数据
  loadPipelineConfig();
  loadPipelineStatus();
  loadPipelineHistory();
  
  // 开始状态轮询
  startStatusPolling();
});

/**
 * 监听项目ID变化
 */
watch(
  () => projectId.value,
  (newProjectId) => {
    if (newProjectId) {
      // 停止之前的轮询
      stopStatusPolling();
      
      // 重新加载数据
      loadPipelineConfig();
      loadPipelineStatus();
      loadPipelineHistory();
      
      // 开始新的轮询
      startStatusPolling();
    }
  }
);

/**
 * 组件卸载时清理
 */
onUnmounted(() => {
  stopStatusPolling();
});
</script>

<style lang="less" scoped>
.pipeline-manager {
  padding: 16px;
  background: #f5f5f5;
  min-height: 100vh;

  .pipeline-overview {
    margin-bottom: 16px;

    .ant-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      :deep(.ant-statistic-title) {
        font-size: 14px;
        color: #666;
        margin-bottom: 4px;
      }
      
      :deep(.ant-statistic-content) {
        font-size: 20px;
        font-weight: 600;
      }
      
      :deep(.ant-statistic-content-prefix) {
        margin-right: 8px;
        font-size: 18px;
      }
    }
  }
}
</style>