<template>
  <div class="pipeline-flow-chart">
    <a-card title="流水线流程" :bordered="false">
      <template #extra>
        <a-space>
          <a-select
            :value="selectedEnvironment"
            placeholder="选择环境"
            style="width: 120px"
            @change="handleEnvironmentChange"
          >
            <a-select-option 
              v-for="env in pipelineConfig.environments || []" 
              :key="env.name" 
              :value="env.name"
            >
              {{ env.displayName || env.name }}
            </a-select-option>
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

      <!-- 流水线流程 -->
      <div class="pipeline-flow">
        <!-- 流水线信息头部 -->
        <div v-if="pipelineConfig.name" class="pipeline-header">
          <a-descriptions :column="3" size="small">
            <a-descriptions-item label="流水线名称">
              {{ pipelineConfig.name }}
            </a-descriptions-item>
            <a-descriptions-item label="当前构建" v-if="currentBuild">
              <a-tag :color="getBuildStatusColor(currentBuild.status)">
                #{{ currentBuild.buildNumber }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="分支">
              <BranchesOutlined />
              {{ currentBuild?.branch || 'main' }}
            </a-descriptions-item>
            <a-descriptions-item label="触发者">
              <UserOutlined />
              {{ currentBuild?.triggeredBy || 'System' }}
            </a-descriptions-item>
            <a-descriptions-item label="开始时间">
              <ClockCircleOutlined />
              {{ currentBuild?.startTime || '未开始' }}
            </a-descriptions-item>
            <a-descriptions-item label="总耗时" v-if="currentBuild?.duration">
              {{ formatDuration(currentBuild.duration) }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- Steps 流程步骤 -->
        <div v-if="currentStages.length > 0" class="pipeline-steps">
          <a-steps 
            :current="getCurrentStepIndex()" 
            :status="getStepsStatus()"
            direction="horizontal"
            size="small"
          >
            <a-step 
              v-for="(stage, index) in currentStages" 
              :key="stage.name"
              :title="stage.displayName || stage.name"
              :status="getStepStatus(stage)"
            >
              <template #description>
                <div class="step-description">
                  <!-- 状态信息 -->
                  <div class="step-status">
                    <a-tag :color="getBuildStatusColor(stage.status)" size="small">
                      <template #icon>
                        <component :is="getStatusIcon(stage.status)" :spin="stage.status === 'running'" />
                      </template>
                      {{ getBuildStatusText(stage.status) }}
                    </a-tag>
                    <span v-if="stage.duration" class="step-duration">
                      {{ formatDuration(stage.duration) }}
                    </span>
                  </div>

                  <!-- 进度条 -->
                  <div v-if="stage.status === 'running'" class="step-progress">
                    <a-progress 
                      :percent="getStageProgress(stage)" 
                      size="small" 
                      :show-info="false"
                    />
                  </div>

                  <!-- 错误信息 -->
                  <div v-if="stage.status === 'failed'" class="step-error">
                    <a-alert 
                      :message="getStageErrorMessage(stage)" 
                      type="error" 
                      size="small"
                      show-icon
                    />
                  </div>

                  <!-- 操作按钮 -->
                  <div v-if="isStageClickable(stage)" class="step-actions">
                    <a-space size="small">
                      <a-button 
                        type="primary" 
                        size="small"
                        @click="handleContinueStage(stage)"
                      >
                        继续
                      </a-button>
                      <a-dropdown :trigger="['click']">
                        <a-button size="small">
                          <MoreOutlined />
                        </a-button>
                        <template #overlay>
                          <a-menu>
                            <a-menu-item @click="handleViewStageLogs(stage)">
                              <FileTextOutlined />
                              查看日志
                            </a-menu-item>
                            <a-menu-item @click="handleRetryStage(stage)">
                              <ReloadOutlined />
                              重试
                            </a-menu-item>
                            <a-menu-item @click="handleSkipStage(stage)">
                              <FastForwardOutlined />
                              跳过
                            </a-menu-item>
                            <a-menu-item @click="handleCancelStage(stage)">
                              <StopOutlined />
                              取消
                            </a-menu-item>
                          </a-menu>
                        </template>
                      </a-dropdown>
                    </a-space>
                  </div>
                </div>
              </template>
              <template #icon>
                <component :is="getStageIcon(stage.type)" />
              </template>
            </a-step>
          </a-steps>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <a-empty description="暂无流水线配置">
            <a-button type="primary" @click="handleRefresh">
              刷新配置
            </a-button>
          </a-empty>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, withDefaults } from 'vue';
import {
  PlayCircleOutlined,
  ReloadOutlined,
  BranchesOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  ArrowRightOutlined,
  MoreOutlined,
  FlagOutlined,
  FileTextOutlined,
  FastForwardOutlined,
  StopOutlined,
  GitlabOutlined,
  BuildOutlined,
  BugOutlined,
  CloudUploadOutlined
} from '@ant-design/icons-vue';
import type { PipelineStage, PipelineBuild, PipelineConfig } from '../types/pipeline';

/**
 * 组件属性定义
 */
interface Props {
  pipelineConfig: PipelineConfig;
  currentBuild: PipelineBuild | null;
  currentPipeline?: any;
  triggering: boolean;
  configLoading?: boolean;
  selectedEnvironment?: 'test' | 'production';
}

/**
 * 组件事件定义
 */
interface Emits {
  (e: 'environmentChange', value: 'test' | 'production'): void;
  (e: 'triggerPipeline'): void;
  (e: 'refresh'): void;
  (e: 'stageClick', stage: PipelineStage): void;
  (e: 'continueStage', stage: PipelineStage): void;
  (e: 'viewStageLogs', stage: PipelineStage): void;
  (e: 'retryStage', stage: PipelineStage): void;
  (e: 'skipStage', stage: PipelineStage): void;
  (e: 'cancelStage', stage: PipelineStage): void;
}

const props = withDefaults(defineProps<Props>(), {
  selectedEnvironment: 'test',
  configLoading: false
});

const emit = defineEmits<Emits>();

/**
 * 计算当前环境的阶段列表
 */
const currentStages = computed(() => {
  if (!props.pipelineConfig?.environments) return [];
  const env = props.pipelineConfig.environments.find(e => e.name === props.selectedEnvironment);
  return env?.stages || [];
});

/**
 * 处理环境变更
 */
const handleEnvironmentChange = (value: 'test' | 'production') => {
  emit('environmentChange', value);
};

/**
 * 触发流水线
 */
const handleTriggerPipeline = () => {
  emit('triggerPipeline');
};

/**
 * 刷新数据
 */
const handleRefresh = () => {
  emit('refresh');
};

/**
 * 处理阶段点击
 */
const handleStageClick = (stage: PipelineStage) => {
  emit('stageClick', stage);
};

/**
 * 处理继续阶段
 */
const handleContinueStage = (stage: PipelineStage) => {
  emit('continueStage', stage);
};

/**
 * 查看阶段日志
 */
const handleViewStageLogs = (stage: PipelineStage) => {
  emit('viewStageLogs', stage);
};

/**
 * 重试阶段
 */
const handleRetryStage = (stage: PipelineStage) => {
  emit('retryStage', stage);
};

/**
 * 跳过阶段
 */
const handleSkipStage = (stage: PipelineStage) => {
  emit('skipStage', stage);
};

/**
 * 取消阶段
 */
const handleCancelStage = (stage: PipelineStage) => {
  emit('cancelStage', stage);
};

/**
 * 获取当前步骤索引
 */
const getCurrentStepIndex = () => {
  const runningIndex = currentStages.value.findIndex(stage => stage.status === 'running');
  if (runningIndex !== -1) return runningIndex;
  
  const failedIndex = currentStages.value.findIndex(stage => stage.status === 'failed');
  if (failedIndex !== -1) return failedIndex;
  
  const completedCount = currentStages.value.filter(stage => stage.status === 'success').length;
  return completedCount;
};

/**
 * 获取Steps整体状态
 */
const getStepsStatus = () => {
  if (hasFailedStage()) return 'error';
  if (currentStages.value.some(stage => stage.status === 'running')) return 'process';
  if (isAllStagesCompleted()) return 'finish';
  return 'wait';
};

/**
 * 获取单个步骤状态
 */
const getStepStatus = (stage: PipelineStage) => {
  switch (stage.status) {
    case 'success':
      return 'finish';
    case 'failed':
      return 'error';
    case 'running':
      return 'process';
    case 'waiting':
      return 'wait';
    default:
      return 'wait';
  }
};

/**
 * 获取状态图标
 */
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return CheckCircleOutlined;
    case 'failed':
      return CloseCircleOutlined;
    case 'running':
      return LoadingOutlined;
    case 'waiting':
      return ClockCircleOutlined;
    default:
      return ClockCircleOutlined;
  }
};

/**
 * 判断阶段是否可点击（手动卡点）
 */
const isStageClickable = (stage: PipelineStage) => {
  return stage.status === 'waiting' || stage.status === 'failed';
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
 * 获取构建状态颜色
 */
const getBuildStatusColor = (status: string) => {
  const colorMap = {
    'pending': 'default',
    'running': 'processing',
    'success': 'success',
    'failed': 'error',
    'cancelled': 'warning',
    'waiting': 'orange'
  };
  return colorMap[status] || 'default';
};

/**
 * 获取构建状态文本
 */
const getBuildStatusText = (status: string) => {
  const textMap = {
    'pending': '等待中',
    'running': '运行中',
    'success': '成功',
    'failed': '失败',
    'cancelled': '已取消',
    'waiting': '等待中'
  };
  return textMap[status] || status;
};

/**
 * 获取阶段进度
 */
const getStageProgress = (stage: PipelineStage) => {
  if (stage.status === 'running') {
    return Math.floor(Math.random() * 80) + 10;
  }
  return 0;
};

/**
 * 获取阶段错误信息
 */
const getStageErrorMessage = (stage: PipelineStage) => {
  const errorMessages = {
    'git': 'Git拉取失败：无法连接到远程仓库',
    'build': '构建失败：编译错误',
    'test': '测试失败：单元测试未通过',
    'deploy': '部署失败：目标服务器连接超时'
  };
  return errorMessages[stage.type] || '执行失败';
};

/**
 * 获取结束节点的CSS类
 */
const getEndNodeClass = () => {
  if (isAllStagesCompleted()) {
    return 'success';
  } else if (hasFailedStage()) {
    return 'failed';
  }
  return 'pending';
};

/**
 * 获取结束节点标签
 */
const getEndNodeLabel = () => {
  if (isAllStagesCompleted()) {
    return '完成';
  } else if (hasFailedStage()) {
    return '失败';
  }
  return '结束';
};

/**
 * 判断所有阶段是否完成
 */
const isAllStagesCompleted = () => {
  return currentStages.value.every(stage => stage.status === 'success');
};

/**
 * 判断是否有失败的阶段
 */
const hasFailedStage = () => {
  return currentStages.value.some(stage => stage.status === 'failed');
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
</script>

<style lang="less" scoped>
.pipeline-flow-chart {
  .pipeline-flow {
    .pipeline-header {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    
    .pipeline-steps {
       padding: 16px;
       background: #fafafa;
       border-radius: 8px;
       overflow-x: auto;
       
       .step-description {
         margin-top: 8px;
         
         .step-status {
           display: flex;
           align-items: center;
           justify-content: center;
           gap: 8px;
           margin-bottom: 8px;
           
           .step-duration {
             font-size: 12px;
             color: #666;
           }
         }
         
         .step-progress {
           margin-bottom: 8px;
         }
         
         .step-error {
           margin-bottom: 8px;
         }
         
         .step-actions {
           margin-top: 8px;
           display: flex;
           justify-content: center;
         }
       }
     }
    
    .empty-state {
      padding: 40px;
      text-align: center;
    }
  }
}

// 自定义Steps样式
:deep(.ant-steps-item) {
  .ant-steps-item-icon {
    margin-right: 12px;
  }
  
  .ant-steps-item-content {
    min-height: auto;
  }
  
  .ant-steps-item-title {
    font-weight: 600;
    font-size: 14px;
  }
  
  .ant-steps-item-description {
    margin-top: 4px;
  }
}

:deep(.ant-steps-horizontal) {
   .ant-steps-item {
     flex: 1;
     
     .ant-steps-item-icon {
       margin-right: 8px;
     }
     
     .ant-steps-item-content {
       min-height: auto;
       margin-top: 8px;
     }
     
     .ant-steps-item-title {
       font-weight: 600;
       font-size: 14px;
       text-align: center;
     }
     
     .ant-steps-item-description {
       margin-top: 4px;
       text-align: center;
     }
   }
   
   .ant-steps-item-tail {
     top: 12px;
   }
 }

// 响应式设计
@media (max-width: 768px) {
  .pipeline-flow-chart {
    .pipeline-steps {
      padding: 12px;
    }
  }
}
</style>