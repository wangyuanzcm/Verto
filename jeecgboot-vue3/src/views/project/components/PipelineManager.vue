<template>
  <div class="pipeline-manager">
    <div class="pipeline-header">
      <h3>流水线管理</h3>
      <a-space>
        <a-button @click="loadPipelineStatus" :loading="loading">
          <Icon icon="ant-design:reload-outlined" />
          刷新状态
        </a-button>
        <a-button type="primary" @click="handleTriggerPipeline" :loading="triggerLoading">
          <Icon icon="ant-design:play-circle-outlined" />
          触发流水线
        </a-button>
        <a-button danger @click="handleStopPipeline" :loading="stopLoading" :disabled="!isRunning">
          <Icon icon="ant-design:stop-outlined" />
          停止流水线
        </a-button>
      </a-space>
    </div>

    <!-- 流水线状态概览 -->
    <div class="pipeline-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-statistic
            title="流水线状态"
            :value="pipelineStatus.status"
            :value-style="{ color: getStatusColor(pipelineStatus.status) }"
          />
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="执行时长"
            :value="pipelineStatus.duration"
            suffix="秒"
          />
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="成功率"
            :value="pipelineStatus.successRate"
            suffix="%"
            :precision="1"
          />
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="最后执行时间"
            :value="formatTime(pipelineStatus.lastExecuteTime)"
          />
        </a-col>
      </a-row>
    </div>

    <!-- 流水线阶段 -->
    <div class="pipeline-stages">
      <h4>流水线阶段</h4>
      <div class="stages-container">
        <div
          v-for="(stage, index) in pipelineStages"
          :key="stage.id"
          class="stage-item"
          :class="getStageClass(stage.status)"
        >
          <div class="stage-header">
            <div class="stage-info">
              <Icon :icon="getStageIcon(stage.status)" class="stage-icon" />
              <span class="stage-name">{{ stage.name }}</span>
              <a-tag :color="getStageStatusColor(stage.status)" size="small">
                {{ getStageStatusText(stage.status) }}
              </a-tag>
            </div>
            <div class="stage-actions">
              <a-button
                size="small"
                @click="handleRetryStage(stage)"
                :disabled="!canRetryStage(stage)"
                :loading="stage.retrying"
              >
                重试
              </a-button>
              <a-button
                size="small"
                @click="handleSkipStage(stage)"
                :disabled="!canSkipStage(stage)"
              >
                跳过
              </a-button>
              <a-button
                size="small"
                @click="handleViewLogs(stage)"
              >
                查看日志
              </a-button>
            </div>
          </div>
          
          <div class="stage-content">
            <div class="stage-meta">
              <span>开始时间: {{ formatTime(stage.startTime) }}</span>
              <span>结束时间: {{ formatTime(stage.endTime) }}</span>
              <span>耗时: {{ stage.duration }}秒</span>
            </div>
            
            <div class="stage-progress" v-if="stage.status === 'running'">
              <a-progress
                :percent="stage.progress"
                :status="stage.progress === 100 ? 'success' : 'active'"
                size="small"
              />
            </div>
            
            <div class="stage-error" v-if="stage.status === 'failed' && stage.error">
              <a-alert
                :message="stage.error"
                type="error"
                size="small"
                show-icon
              />
            </div>
          </div>
          
          <!-- 连接线 -->
          <div v-if="index < pipelineStages.length - 1" class="stage-connector">
            <Icon icon="ant-design:arrow-down-outlined" />
          </div>
        </div>
      </div>
    </div>

    <!-- 执行历史 -->
    <div class="pipeline-history">
      <h4>执行历史</h4>
      <a-table
        :columns="historyColumns"
        :data-source="pipelineHistory"
        :loading="historyLoading"
        :pagination="{ pageSize: 10 }"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'duration'">
            {{ record.duration }}秒
          </template>
          <template v-if="column.key === 'executeTime'">
            {{ formatTime(record.executeTime) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button size="small" @click="handleViewHistoryDetail(record)">
                查看详情
              </a-button>
              <a-button size="small" @click="handleViewHistoryLogs(record)">
                查看日志
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 日志查看模态框 -->
    <BasicModal
      v-model:visible="logsModalVisible"
      :title="logsModalTitle"
      width="80%"
      :footer="null"
    >
      <div class="logs-container">
        <div class="logs-header">
          <a-space>
            <a-button @click="loadLogs" :loading="logsLoading">
              <Icon icon="ant-design:reload-outlined" />
              刷新日志
            </a-button>
            <a-button @click="handleDownloadLogs">
              <Icon icon="ant-design:download-outlined" />
              下载日志
            </a-button>
            <a-switch v-model:checked="autoRefreshLogs" size="small" />
            <span>自动刷新</span>
          </a-space>
        </div>
        <div class="logs-content">
          <pre class="logs-text">{{ logsContent }}</pre>
        </div>
      </div>
    </BasicModal>

    <!-- 历史详情模态框 -->
    <BasicModal
      v-model:visible="historyDetailModalVisible"
      title="执行详情"
      :footer="null"
      width="60%"
    >
      <div class="history-detail" v-if="currentHistoryDetail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="执行ID">
            {{ currentHistoryDetail.id }}
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(currentHistoryDetail.status)">
              {{ getStatusText(currentHistoryDetail.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="开始时间">
            {{ formatTime(currentHistoryDetail.startTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="结束时间">
            {{ formatTime(currentHistoryDetail.endTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="执行时长">
            {{ currentHistoryDetail.duration }}秒
          </a-descriptions-item>
          <a-descriptions-item label="触发人">
            {{ currentHistoryDetail.triggerUser }}
          </a-descriptions-item>
          <a-descriptions-item label="Git分支" :span="2">
            {{ currentHistoryDetail.gitBranch }}
          </a-descriptions-item>
          <a-descriptions-item label="Git提交" :span="2">
            {{ currentHistoryDetail.gitCommit }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { BasicModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { 
    getPipelineStatus, 
    triggerPipeline, 
    stopPipeline,
    getPipelineLogs,
    retryPipelineStage,
    skipPipelineStage,
    getPipelineHistory
  } from '../Project.api';
  import { formatToDateTime } from '/@/utils/dateUtil';

  interface Props {
    projectId: string;
  }

  const props = defineProps<Props>();
  const { createMessage } = useMessage();

  // 加载状态
  const loading = ref(false);
  const triggerLoading = ref(false);
  const stopLoading = ref(false);
  const historyLoading = ref(false);
  const logsLoading = ref(false);

  // 流水线状态
  const pipelineStatus = reactive({
    status: 'idle',
    duration: 0,
    successRate: 0,
    lastExecuteTime: '',
  });

  // 流水线阶段
  const pipelineStages = ref<any[]>([]);

  // 执行历史
  const pipelineHistory = ref<any[]>([]);

  // 日志相关
  const logsModalVisible = ref(false);
  const logsModalTitle = ref('');
  const logsContent = ref('');
  const autoRefreshLogs = ref(false);
  const currentStageId = ref('');
  const currentHistoryId = ref('');

  // 历史详情
  const historyDetailModalVisible = ref(false);
  const currentHistoryDetail = ref<any>(null);

  // 自动刷新定时器
  let refreshTimer: NodeJS.Timeout | null = null;
  let logsRefreshTimer: NodeJS.Timeout | null = null;

  // 是否正在运行
  const isRunning = computed(() => {
    return pipelineStatus.status === 'running';
  });

  // 历史表格列配置
  const historyColumns = [
    { title: '执行ID', dataIndex: 'id', key: 'id', width: 120 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
    { title: '执行时长', dataIndex: 'duration', key: 'duration', width: 100 },
    { title: '触发人', dataIndex: 'triggerUser', key: 'triggerUser', width: 120 },
    { title: '执行时间', dataIndex: 'executeTime', key: 'executeTime', width: 180 },
    { title: '操作', key: 'action', width: 200 },
  ];

  /**
   * 加载流水线状态
   */
  async function loadPipelineStatus() {
    try {
      loading.value = true;
      const result = await getPipelineStatus({ projectId: props.projectId });
      
      Object.assign(pipelineStatus, result.status);
      pipelineStages.value = result.stages || [];
    } catch (error) {
      createMessage.error('加载流水线状态失败');
    } finally {
      loading.value = false;
    }
  }

  /**
   * 加载执行历史
   */
  async function loadPipelineHistory() {
    try {
      historyLoading.value = true;
      const result = await getPipelineHistory({ projectId: props.projectId });
      pipelineHistory.value = result || [];
    } catch (error) {
      createMessage.error('加载执行历史失败');
    } finally {
      historyLoading.value = false;
    }
  }

  /**
   * 触发流水线
   */
  async function handleTriggerPipeline() {
    try {
      triggerLoading.value = true;
      await triggerPipeline({ projectId: props.projectId });
      createMessage.success('流水线触发成功');
      loadPipelineStatus();
    } catch (error) {
      createMessage.error('触发流水线失败');
    } finally {
      triggerLoading.value = false;
    }
  }

  /**
   * 停止流水线
   */
  async function handleStopPipeline() {
    try {
      stopLoading.value = true;
      await stopPipeline({ projectId: props.projectId });
      createMessage.success('流水线已停止');
      loadPipelineStatus();
    } catch (error) {
      createMessage.error('停止流水线失败');
    } finally {
      stopLoading.value = false;
    }
  }

  /**
   * 重试阶段
   */
  async function handleRetryStage(stage: any) {
    try {
      stage.retrying = true;
      await retryPipelineStage({
        projectId: props.projectId,
        stageId: stage.id,
      });
      createMessage.success('阶段重试成功');
      loadPipelineStatus();
    } catch (error) {
      createMessage.error('重试阶段失败');
    } finally {
      stage.retrying = false;
    }
  }

  /**
   * 跳过阶段
   */
  async function handleSkipStage(stage: any) {
    try {
      await skipPipelineStage({
        projectId: props.projectId,
        stageId: stage.id,
      });
      createMessage.success('阶段已跳过');
      loadPipelineStatus();
    } catch (error) {
      createMessage.error('跳过阶段失败');
    }
  }

  /**
   * 查看阶段日志
   */
  function handleViewLogs(stage: any) {
    currentStageId.value = stage.id;
    currentHistoryId.value = '';
    logsModalTitle.value = `${stage.name} - 执行日志`;
    logsModalVisible.value = true;
    loadLogs();
  }

  /**
   * 查看历史日志
   */
  function handleViewHistoryLogs(record: any) {
    currentStageId.value = '';
    currentHistoryId.value = record.id;
    logsModalTitle.value = `执行历史 ${record.id} - 日志`;
    logsModalVisible.value = true;
    loadLogs();
  }

  /**
   * 加载日志
   */
  async function loadLogs() {
    try {
      logsLoading.value = true;
      const result = await getPipelineLogs({
        projectId: props.projectId,
        stageId: currentStageId.value,
        historyId: currentHistoryId.value,
      });
      logsContent.value = result.logs || '';
    } catch (error) {
      createMessage.error('加载日志失败');
    } finally {
      logsLoading.value = false;
    }
  }

  /**
   * 下载日志
   */
  function handleDownloadLogs() {
    const blob = new Blob([logsContent.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 查看历史详情
   */
  function handleViewHistoryDetail(record: any) {
    currentHistoryDetail.value = record;
    historyDetailModalVisible.value = true;
  }

  /**
   * 获取状态颜色
   */
  function getStatusColor(status: string) {
    const colorMap = {
      idle: '#666',
      running: '#1890ff',
      success: '#52c41a',
      failed: '#ff4d4f',
      cancelled: '#faad14',
    };
    return colorMap[status] || '#666';
  }

  /**
   * 获取状态文本
   */
  function getStatusText(status: string) {
    const textMap = {
      idle: '空闲',
      running: '运行中',
      success: '成功',
      failed: '失败',
      cancelled: '已取消',
    };
    return textMap[status] || status;
  }

  /**
   * 获取阶段样式类
   */
  function getStageClass(status: string) {
    return `stage-${status}`;
  }

  /**
   * 获取阶段图标
   */
  function getStageIcon(status: string) {
    const iconMap = {
      pending: 'ant-design:clock-circle-outlined',
      running: 'ant-design:loading-outlined',
      success: 'ant-design:check-circle-outlined',
      failed: 'ant-design:close-circle-outlined',
      skipped: 'ant-design:minus-circle-outlined',
    };
    return iconMap[status] || 'ant-design:question-circle-outlined';
  }

  /**
   * 获取阶段状态颜色
   */
  function getStageStatusColor(status: string) {
    const colorMap = {
      pending: 'default',
      running: 'processing',
      success: 'success',
      failed: 'error',
      skipped: 'warning',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取阶段状态文本
   */
  function getStageStatusText(status: string) {
    const textMap = {
      pending: '等待中',
      running: '运行中',
      success: '成功',
      failed: '失败',
      skipped: '已跳过',
    };
    return textMap[status] || status;
  }

  /**
   * 是否可以重试阶段
   */
  function canRetryStage(stage: any) {
    return stage.status === 'failed';
  }

  /**
   * 是否可以跳过阶段
   */
  function canSkipStage(stage: any) {
    return stage.status === 'failed' || stage.status === 'pending';
  }

  /**
   * 格式化时间
   */
  function formatTime(time?: string) {
    return time ? formatToDateTime(time) : '-';
  }

  /**
   * 开始自动刷新
   */
  function startAutoRefresh() {
    if (refreshTimer) return;
    
    refreshTimer = setInterval(() => {
      if (isRunning.value) {
        loadPipelineStatus();
      }
    }, 5000); // 每5秒刷新一次
  }

  /**
   * 停止自动刷新
   */
  function stopAutoRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  }

  /**
   * 开始日志自动刷新
   */
  function startLogsAutoRefresh() {
    if (logsRefreshTimer) return;
    
    logsRefreshTimer = setInterval(() => {
      if (autoRefreshLogs.value && logsModalVisible.value) {
        loadLogs();
      }
    }, 2000); // 每2秒刷新一次日志
  }

  /**
   * 停止日志自动刷新
   */
  function stopLogsAutoRefresh() {
    if (logsRefreshTimer) {
      clearInterval(logsRefreshTimer);
      logsRefreshTimer = null;
    }
  }

  // 组件挂载时加载数据
  onMounted(() => {
    loadPipelineStatus();
    loadPipelineHistory();
    startAutoRefresh();
    startLogsAutoRefresh();
  });

  // 组件卸载时清理定时器
  onUnmounted(() => {
    stopAutoRefresh();
    stopLogsAutoRefresh();
  });
</script>

<style lang="less" scoped>
  .pipeline-manager {
    padding: 16px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    
    .pipeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
    }
    
    .pipeline-overview {
      margin-bottom: 24px;
      padding: 16px;
      background: #fafafa;
      border-radius: 6px;
    }
    
    .pipeline-stages {
      margin-bottom: 24px;
      
      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .stages-container {
        .stage-item {
          position: relative;
          margin-bottom: 24px;
          padding: 16px;
          border: 1px solid #d9d9d9;
          border-radius: 6px;
          transition: all 0.3s;
          
          &.stage-pending {
            border-color: #d9d9d9;
            background: #fafafa;
          }
          
          &.stage-running {
            border-color: #1890ff;
            background: #f0f8ff;
          }
          
          &.stage-success {
            border-color: #52c41a;
            background: #f6ffed;
          }
          
          &.stage-failed {
            border-color: #ff4d4f;
            background: #fff2f0;
          }
          
          &.stage-skipped {
            border-color: #faad14;
            background: #fffbe6;
          }
          
          .stage-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            
            .stage-info {
              display: flex;
              align-items: center;
              gap: 8px;
              
              .stage-icon {
                font-size: 16px;
              }
              
              .stage-name {
                font-size: 16px;
                font-weight: 600;
              }
            }
            
            .stage-actions {
              display: flex;
              gap: 8px;
            }
          }
          
          .stage-content {
            .stage-meta {
              display: flex;
              gap: 16px;
              margin-bottom: 8px;
              font-size: 12px;
              color: #666;
            }
            
            .stage-progress {
              margin-bottom: 8px;
            }
          }
          
          .stage-connector {
            position: absolute;
            bottom: -24px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 16px;
            color: #d9d9d9;
          }
        }
      }
    }
    
    .pipeline-history {
      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
      }
    }
    
    .logs-container {
      .logs-header {
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .logs-content {
        max-height: 400px;
        overflow: auto;
        
        .logs-text {
          margin: 0;
          padding: 12px;
          background: #000;
          color: #fff;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-all;
        }
      }
    }
    
    .history-detail {
      padding: 16px 0;
    }
  }
</style>