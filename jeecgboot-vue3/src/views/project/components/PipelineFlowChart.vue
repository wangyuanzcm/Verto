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

      <!-- 流水线流程图 -->
      <div class="pipeline-flow">
        <!-- 流水线信息头部 -->
        <div v-if="pipelineConfig.name" class="pipeline-header">
          <div class="pipeline-info">
            <h3 class="pipeline-name">{{ pipelineConfig.name }}</h3>
            <a-tag v-if="currentBuild" :color="getBuildStatusColor(currentBuild.status)">
              构建 #{{ currentBuild.buildNumber }}
            </a-tag>
          </div>
          <div class="pipeline-meta">
            <span class="meta-item">
              <BranchesOutlined />
              {{ currentBuild?.branch || 'main' }}
            </span>
            <span class="meta-item">
              <ClockCircleOutlined />
              {{ currentBuild?.startTime || '未开始' }}
            </span>
            <span class="meta-item">
              <UserOutlined />
              {{ currentBuild?.triggeredBy || 'System' }}
            </span>
          </div>
        </div>

        <!-- 流程图容器 -->
        <div v-if="currentStages.length > 0" class="flow-container">
          <!-- 开始节点 -->
          <div class="flow-node start-node">
            <div class="node-icon">
              <PlayCircleOutlined />
            </div>
            <div class="node-label">开始</div>
          </div>

          <!-- 流水线阶段 -->
          <template v-for="(stage, index) in currentStages" :key="stage.name">
            <!-- 连接线 -->
            <div class="flow-arrow">
              <ArrowRightOutlined />
            </div>

            <!-- 阶段节点 -->
            <div 
              class="flow-node stage-node"
              :class="[
                `status-${stage.status}`,
                { 'clickable': isStageClickable(stage) }
              ]"
              @click="handleStageClick(stage)"
            >
              <div class="node-header">
                <div class="node-icon">
                  <component :is="getStageIcon(stage.type)" />
                </div>
                <div class="status-icon">
                  <CheckCircleOutlined v-if="stage.status === 'success'" />
                  <CloseCircleOutlined v-else-if="stage.status === 'failed'" />
                  <LoadingOutlined v-else-if="stage.status === 'running'" spin />
                  <ClockCircleOutlined v-else />
                </div>
              </div>
              
              <div class="node-content">
                <div class="node-title">{{ stage.displayName || stage.name }}</div>
                <div class="node-status">{{ getBuildStatusText(stage.status) }}</div>
                <div v-if="stage.duration" class="node-duration">
                  {{ formatDuration(stage.duration) }}
                </div>
              </div>

              <!-- 进度条 -->
              <div v-if="stage.status === 'running'" class="node-progress">
                <a-progress 
                  :percent="getStageProgress(stage)" 
                  size="small" 
                  :show-info="false"
                />
              </div>

              <!-- 操作按钮 -->
              <div v-if="isStageClickable(stage)" class="node-actions">
                <a-button 
                  type="primary" 
                  size="small"
                  @click.stop="handleContinueStage(stage)"
                >
                  继续
                </a-button>
                <a-dropdown :trigger="['click']" @click.stop>
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
              </div>

              <!-- 错误信息 -->
              <div v-if="stage.status === 'failed'" class="node-error">
                <a-alert 
                  :message="getStageErrorMessage(stage)" 
                  type="error" 
                  size="small"
                  show-icon
                />
              </div>
            </div>
          </template>

          <!-- 最后的连接线 -->
          <div class="flow-arrow">
            <ArrowRightOutlined />
          </div>

          <!-- 结束节点 -->
          <div class="flow-node end-node" :class="getEndNodeClass()">
            <div class="node-icon">
              <CheckCircleOutlined v-if="isAllStagesCompleted()" />
              <CloseCircleOutlined v-else-if="hasFailedStage()" />
              <FlagOutlined v-else />
            </div>
            <div class="node-label">{{ getEndNodeLabel() }}</div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <a-empty description="暂无流水线配置">
            <a-button type="primary" @click="handleRefresh">
              刷新配置
            </a-button>
          </a-empty>
        </div>

        <!-- 构建总结 -->
        <div v-if="currentBuild" class="build-summary">
          <a-descriptions title="构建信息" :column="3" size="small">
            <a-descriptions-item label="构建状态">
              <a-tag :color="getBuildStatusColor(currentBuild.status)">
                {{ getBuildStatusText(currentBuild.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="触发方式">
              {{ currentBuild.trigger || '手动触发' }}
            </a-descriptions-item>
            <a-descriptions-item label="总耗时">
              {{ formatDuration(currentBuild.duration) }}
            </a-descriptions-item>
          </a-descriptions>
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
      
      .pipeline-info {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        
        .pipeline-name {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
        }
      }
      
      .pipeline-meta {
        display: flex;
        gap: 16px;
        font-size: 14px;
        color: #6c757d;
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
    
    .flow-container {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 16px;
      padding: 24px;
      overflow-x: auto;
      min-height: 200px;
      background: #fafafa;
      border-radius: 8px;
      
      .flow-node {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 120px;
        padding: 16px;
        background: white;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        transition: all 0.3s ease;
        
        &.start-node, &.end-node {
          min-width: 80px;
          
          .node-icon {
            font-size: 24px;
            color: #52c41a;
            margin-bottom: 8px;
          }
          
          .node-label {
            font-size: 12px;
            font-weight: 500;
            color: #666;
          }
        }
        
        &.end-node {
          &.success .node-icon {
            color: #52c41a;
          }
          
          &.failed .node-icon {
            color: #ff4d4f;
          }
          
          &.pending .node-icon {
            color: #8c8c8c;
          }
        }
        
        &.stage-node {
          position: relative;
          
          &.status-pending {
            border-color: #d9d9d9;
            background: #fafafa;
          }
          
          &.status-running {
            border-color: #1890ff;
            background: #f0f8ff;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
          }
          
          &.status-success {
            border-color: #52c41a;
            background: #f6ffed;
          }
          
          &.status-failed {
            border-color: #ff4d4f;
            background: #fff2f0;
          }
          
          &.status-waiting {
            border-color: #faad14;
            background: #fffbe6;
          }
          
          &.clickable {
            cursor: pointer;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
          }
          
          .node-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-bottom: 8px;
            
            .node-icon {
              font-size: 18px;
              color: #666;
            }
            
            .status-icon {
              font-size: 16px;
              
              &:has(.anticon-loading) {
                color: #1890ff;
              }
              
              &:has(.anticon-check-circle) {
                color: #52c41a;
              }
              
              &:has(.anticon-close-circle) {
                color: #ff4d4f;
              }
              
              &:has(.anticon-clock-circle) {
                color: #8c8c8c;
              }
            }
          }
          
          .node-content {
            text-align: center;
            margin-bottom: 8px;
            
            .node-title {
              font-weight: 600;
              font-size: 14px;
              color: #2c3e50;
              margin-bottom: 4px;
            }
            
            .node-status {
              font-size: 12px;
              color: #666;
              margin-bottom: 4px;
            }
            
            .node-duration {
              font-size: 11px;
              color: #999;
            }
          }
          
          .node-progress {
            width: 100%;
            margin-bottom: 8px;
          }
          
          .node-actions {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
          }
          
          .node-error {
            width: 100%;
          }
        }
      }
      
      .flow-arrow {
        display: flex;
        align-items: center;
        color: #8c8c8c;
        font-size: 16px;
        min-width: 20px;
      }
    }
    
    .empty-state {
      padding: 40px;
      text-align: center;
    }
    
    .build-summary {
      margin-top: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .pipeline-flow-chart {
    .flow-container {
      flex-direction: column;
      align-items: stretch;
      
      .flow-arrow {
        transform: rotate(90deg);
        margin: 8px 0;
      }
      
      .flow-node {
        min-width: auto;
        width: 100%;
      }
    }
  }
}
</style>