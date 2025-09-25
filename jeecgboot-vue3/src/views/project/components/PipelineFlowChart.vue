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

      <!-- BPM风格的流程图 -->
      <div class="bmp-pipeline-flow">
        <!-- 流水线信息头部 -->
        <div class="pipeline-header">
          <div class="pipeline-title">
            <span class="pipeline-name">{{ pipelineConfig.name }}</span>
            <a-tag v-if="currentBuild" :color="getBuildStatusColor(currentBuild.status)">
              构建 #{{ currentBuild.buildNumber }}
            </a-tag>
          </div>
          <div class="pipeline-meta">
            <div class="meta-item">
              <BranchesOutlined />
              <span>{{ currentBuild?.branch || 'main' }}</span>
            </div>
            <div class="meta-item">
              <ClockCircleOutlined />
              <span>{{ currentBuild?.startTime || '未开始' }}</span>
            </div>
            <div class="meta-item">
              <UserOutlined />
              <span>{{ currentBuild?.triggeredBy || 'System' }}</span>
            </div>
          </div>
        </div>

        <!-- BPM流程图容器 -->
        <div class="bmp-flow-container">
          <!-- 开始节点 -->
          <div class="bmp-node start-node">
            <div class="node-content">
              <div class="node-icon">
                <PlayCircleOutlined />
              </div>
              <div class="node-label">开始</div>
            </div>
          </div>

          <!-- 连接线 -->
          <div class="flow-connector"></div>

          <!-- 流水线阶段节点 -->
          <template v-for="(stage, index) in currentStages" :key="stage.name">
            <!-- 阶段节点 -->
            <div 
              class="bmp-stage-node"
              :class="[
                `stage-${stage.status}`,
                { 'stage-clickable': isStageClickable(stage) }
              ]"
              @click="handleStageClick(stage)"
            >
              <div class="node-content">
                <!-- 节点图标和状态 -->
                <div class="node-header">
                  <div class="node-icon">
                    <component :is="getStageIcon(stage.type)" />
                  </div>
                  <div class="status-indicator" :class="stage.status">
                    <CheckCircleOutlined v-if="stage.status === 'success'" />
                    <CloseCircleOutlined v-else-if="stage.status === 'failed'" />
                    <LoadingOutlined v-else-if="stage.status === 'running'" />
                    <ClockCircleOutlined v-else />
                  </div>
                </div>
                
                <!-- 节点信息 -->
                <div class="node-info">
                  <div class="node-title">{{ stage.displayName }}</div>
                  <div class="node-status">{{ getBuildStatusText(stage.status) }}</div>
                  <div v-if="stage.duration" class="node-duration">
                    {{ formatDuration(stage.duration) }}
                  </div>
                </div>

                <!-- 手动卡点操作 -->
                <div v-if="isStageClickable(stage)" class="node-actions">
                  <a-tooltip title="点击继续">
                    <a-button 
                      type="primary" 
                      size="small" 
                      shape="circle"
                      @click.stop="handleContinueStage(stage)"
                    >
                      <template #icon>
                        <CaretRightOutlined />
                      </template>
                    </a-button>
                  </a-tooltip>
                  <a-dropdown :trigger="['click']" @click.stop>
                    <a-button size="small" shape="circle">
                      <template #icon>
                        <MoreOutlined />
                      </template>
                    </a-button>
                    <template #overlay>
                      <a-menu>
                        <a-menu-item key="logs" @click="handleViewStageLogs(stage)">
                          <template #icon><FileTextOutlined /></template>
                          查看日志
                        </a-menu-item>
                        <a-menu-item key="retry" @click="handleRetryStage(stage)">
                          <template #icon><ReloadOutlined /></template>
                          重试
                        </a-menu-item>
                        <a-menu-item key="skip" @click="handleSkipStage(stage)">
                          <template #icon><FastForwardOutlined /></template>
                          跳过
                        </a-menu-item>
                        <a-menu-item key="cancel" @click="handleCancelStage(stage)">
                          <template #icon><StopOutlined /></template>
                          取消
                        </a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </div>

                <!-- 进度条（运行中状态） -->
                <div v-if="stage.status === 'running'" class="node-progress">
                  <a-progress 
                    :percent="getStageProgress(stage)" 
                    size="small" 
                    :show-info="false"
                  />
                </div>

                <!-- 错误信息（失败状态） -->
                <div v-if="stage.status === 'failed'" class="node-error">
                  <a-alert 
                    :message="getStageErrorMessage(stage)" 
                    type="error" 
                    size="small"
                    show-icon
                  />
                </div>
              </div>
            </div>

            <!-- 连接线（非最后一个节点） -->
            <div 
              v-if="index < currentStages.length - 1" 
              class="flow-connector"
              :class="getConnectorClass(stage, currentStages[index + 1])"
            ></div>
          </template>

          <!-- 连接线 -->
          <div class="flow-connector"></div>

          <!-- 结束节点 -->
          <div class="bmp-node end-node" :class="getEndNodeClass()">
            <div class="node-content">
              <div class="node-icon">
                <CheckCircleOutlined v-if="isAllStagesCompleted()" />
                <CloseCircleOutlined v-else-if="hasFailedStage()" />
                <FlagOutlined v-else />
              </div>
              <div class="node-label">
                {{ getEndNodeLabel() }}
              </div>
            </div>
          </div>
        </div>

        <!-- 构建总结 -->
        <div v-if="currentBuild" class="build-summary">
          <div class="summary-content">
            <div class="summary-info">
              <div class="info-item">
                <span class="label">构建状态</span>
                <a-tag :color="getBuildStatusColor(currentBuild.status)">
                  {{ getBuildStatusText(currentBuild.status) }}
                </a-tag>
              </div>
              <div class="info-item">
                <span class="label">触发方式</span>
                <span class="value">{{ currentBuild.trigger || '手动触发' }}</span>
              </div>
              <div class="info-item">
                <span class="label">总耗时</span>
                <span class="value">{{ formatDuration(currentBuild.duration) }}</span>
              </div>
            </div>
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
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  PlayCircleOutlined,
  ReloadOutlined,
  ApartmentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  CaretRightOutlined,
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

// Props定义
interface Props {
  pipelineConfig: PipelineConfig;
  currentBuild: PipelineBuild | null;
  selectedEnvironment: 'test' | 'production';
  triggering: boolean;
}

// Emits定义
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

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 计算属性
const currentStages = computed(() => {
  const env = props.pipelineConfig.environments.find(e => e.name === props.selectedEnvironment);
  return env?.stages || [];
});

// 事件处理方法
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

// 工具方法
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
    'cancelled': 'warning'
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
 * 获取连接线样式类
 */
const getConnectorClass = (currentStage: PipelineStage, nextStage: PipelineStage) => {
  if (currentStage.status === 'success') {
    return 'connector-success';
  } else if (currentStage.status === 'failed') {
    return 'connector-failed';
  } else if (currentStage.status === 'running') {
    return 'connector-running';
  }
  return 'connector-pending';
};

/**
 * 获取阶段进度
 */
const getStageProgress = (stage: PipelineStage) => {
  // 模拟进度，实际应该从后端获取
  if (stage.status === 'running') {
    return Math.floor(Math.random() * 80) + 10; // 10-90之间的随机数
  }
  return 0;
};

/**
 * 获取阶段错误信息
 */
const getStageErrorMessage = (stage: PipelineStage) => {
  // 模拟错误信息，实际应该从后端获取
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
  // BMP流程图样式
  .bmp-flow-container {
    .pipeline-header {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      
      .pipeline-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        
        .pipeline-name {
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
    
    .bmp-flow-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      padding: 40px 20px;
      overflow-x: auto;
      min-height: 200px;
      
      .bmp-node {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 80px;
        min-height: 80px;
        border-radius: 50%;
        background: white;
        border: 3px solid #e9ecef;
        position: relative;
        transition: all 0.3s ease;
        
        &.start-node {
          border-color: #52c41a;
          background: #f6ffed;
          
          .node-icon {
            color: #52c41a;
            font-size: 24px;
          }
        }
        
        &.end-node {
          &.success {
            border-color: #52c41a;
            background: #f6ffed;
            
            .node-icon {
              color: #52c41a;
            }
          }
          
          &.failed {
            border-color: #ff4d4f;
            background: #fff2f0;
            
            .node-icon {
              color: #ff4d4f;
            }
          }
          
          &.pending {
            border-color: #d9d9d9;
            background: #fafafa;
            
            .node-icon {
              color: #8c8c8c;
            }
          }
          
          .node-icon {
            font-size: 24px;
          }
        }
        
        .node-content {
          text-align: center;
          
          .node-label {
            font-size: 12px;
            font-weight: 500;
            margin-top: 4px;
            color: #666;
          }
        }
      }
      
      .bmp-stage-node {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 160px;
        background: white;
        border: 2px solid #e9ecef;
        border-radius: 12px;
        padding: 16px;
        position: relative;
        transition: all 0.3s ease;
        cursor: default;
        
        &.stage-pending {
          border-color: #d9d9d9;
          background: #fafafa;
        }
        
        &.stage-running {
          border-color: #1890ff;
          background: #f0f8ff;
          animation: pulse 2s infinite;
        }
        
        &.stage-success {
          border-color: #52c41a;
          background: #f6ffed;
        }
        
        &.stage-failed {
          border-color: #ff4d4f;
          background: #fff2f0;
        }
        
        &.stage-waiting {
          border-color: #faad14;
          background: #fffbe6;
          cursor: pointer;
          
          &:hover {
            border-color: #fa8c16;
            box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3);
          }
        }
        
        &.stage-clickable {
          cursor: pointer;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        }
        
        .node-content {
          width: 100%;
          text-align: center;
          
          .node-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            
            .node-icon {
              font-size: 20px;
              color: #666;
            }
            
            .status-indicator {
              font-size: 16px;
              
              &.running {
                color: #1890ff;
                animation: spin 1s linear infinite;
              }
              
              &.success {
                color: #52c41a;
              }
              
              &.failed {
                color: #ff4d4f;
              }
              
              &.pending, &.waiting {
                color: #8c8c8c;
              }
            }
          }
          
          .node-info {
            margin-bottom: 12px;
            
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
          
          .node-actions {
            display: flex;
            gap: 8px;
            justify-content: center;
            margin-bottom: 12px;
          }
          
          .node-progress {
            width: 100%;
            margin-bottom: 8px;
          }
          
          .node-error {
            width: 100%;
          }
        }
      }
      
      .flow-connector {
        width: 60px;
        height: 2px;
        background: #d9d9d9;
        position: relative;
        margin: 0 -1px;
        
        &::after {
          content: '';
          position: absolute;
          right: -6px;
          top: -4px;
          width: 0;
          height: 0;
          border-left: 6px solid #d9d9d9;
          border-top: 5px solid transparent;
          border-bottom: 5px solid transparent;
        }
        
        &.connector-success {
          background: #52c41a;
          
          &::after {
            border-left-color: #52c41a;
          }
        }
        
        &.connector-running {
          background: #1890ff;
          animation: flow 2s linear infinite;
          
          &::after {
            border-left-color: #1890ff;
          }
        }
        
        &.connector-failed {
          background: #ff4d4f;
          
          &::after {
            border-left-color: #ff4d4f;
          }
        }
      }
    }
    
    .build-summary {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 16px;
      margin-top: 24px;
      
      .summary-content {
        .summary-info {
          display: flex;
          gap: 24px;
          
          .info-item {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .label {
              font-weight: 500;
              color: #666;
            }
            
            .value {
              color: #2c3e50;
            }
          }
        }
      }
    }
  }
  
  .current-build {
    margin-top: 16px;
  }
  
  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(24, 144, 255, 0);
    }
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes flow {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 20px 0;
    }
  }
}
</style>