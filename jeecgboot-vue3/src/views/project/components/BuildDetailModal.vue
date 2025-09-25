<template>
  <a-modal
    :open="visible"
    title="构建详情"
    width="900px"
    :footer="null"
    @cancel="handleClose"
  >
    <div v-if="buildDetail" class="build-detail">
      <!-- 构建基本信息 -->
      <div class="build-info">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="构建号">
            <a-tag color="blue">#{{ buildDetail.buildNumber }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getBuildStatusColor(buildDetail.status)">
              {{ getBuildStatusText(buildDetail.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="分支">
            <a-tag color="green">
              <template #icon>
                <BranchesOutlined />
              </template>
              {{ buildDetail.branch }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="提交ID">
            <a-typography-text code copyable>
              {{ buildDetail.commitId }}
            </a-typography-text>
          </a-descriptions-item>
          <a-descriptions-item label="提交信息" :span="2">
            <a-typography-paragraph 
              :ellipsis="{ rows: 2, expandable: true }"
              style="margin: 0;"
            >
              {{ buildDetail.commitMessage }}
            </a-typography-paragraph>
          </a-descriptions-item>
          <a-descriptions-item label="触发方式">
            <a-tag :color="getTriggerColor(buildDetail.trigger)">
              <component :is="getTriggerIcon(buildDetail.trigger)" />
              {{ getTriggerText(buildDetail.trigger) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="触发人">
            <div class="trigger-user">
              <a-avatar size="small" :src="buildDetail.avatar">
                {{ buildDetail.triggeredBy?.charAt(0).toUpperCase() }}
              </a-avatar>
              <span class="user-name">{{ buildDetail.triggeredBy }}</span>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="开始时间">
            {{ formatTime(buildDetail.startTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="结束时间">
            {{ buildDetail.endTime ? formatTime(buildDetail.endTime) : '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="总耗时">
            <a-tag v-if="buildDetail.duration" color="purple">
              {{ formatDuration(buildDetail.duration) }}
            </a-tag>
            <span v-else>-</span>
          </a-descriptions-item>
          <a-descriptions-item label="环境">
            <a-tag :color="getEnvironmentColor(buildDetail.environment)">
              {{ getEnvironmentText(buildDetail.environment) }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </div>

      <!-- 阶段详情时间线 -->
      <div class="stages-detail">
        <a-divider orientation="left">
          <span class="section-title">阶段详情</span>
        </a-divider>
        
        <a-timeline>
          <a-timeline-item
            v-for="(stage, index) in buildDetail.stages"
            :key="stage.name"
            :color="getStageTimelineColor(stage.status)"
          >
            <template #dot>
              <div class="timeline-dot" :class="stage.status">
                <component :is="getStageIcon(stage.type)" />
              </div>
            </template>
            
            <div class="stage-timeline-content">
              <div class="stage-header">
                <div class="stage-title">
                  <span class="stage-name">{{ stage.displayName }}</span>
                  <a-tag 
                    size="small" 
                    :color="getBuildStatusColor(stage.status)"
                  >
                    {{ getBuildStatusText(stage.status) }}
                  </a-tag>
                </div>
                <div class="stage-meta">
                  <span v-if="stage.startTime" class="stage-time">
                    <ClockCircleOutlined />
                    {{ formatTime(stage.startTime) }}
                  </span>
                  <span v-if="stage.duration" class="stage-duration">
                    <HourglassOutlined />
                    {{ formatDuration(stage.duration) }}
                  </span>
                </div>
              </div>
              
              <!-- 阶段进度（运行中状态） -->
              <div v-if="stage.status === 'running'" class="stage-progress">
                <a-progress 
                  :percent="getStageProgress(stage)" 
                  size="small"
                  :status="stage.status === 'failed' ? 'exception' : 'active'"
                />
              </div>
              
              <!-- 阶段描述 -->
              <div v-if="stage.description" class="stage-description">
                {{ stage.description }}
              </div>
              
              <!-- 错误信息（失败状态） -->
              <div v-if="stage.status === 'failed' && stage.errorMessage" class="stage-error">
                <a-alert 
                  :message="stage.errorMessage" 
                  type="error" 
                  size="small"
                  show-icon
                  :closable="false"
                />
              </div>
              
              <!-- 阶段操作 -->
              <div class="stage-actions">
                <a-space size="small">
                  <a-button 
                    size="small" 
                    type="text"
                    @click="handleViewStageLogs(stage)"
                  >
                    <template #icon>
                      <FileTextOutlined />
                    </template>
                    查看日志
                  </a-button>
                  
                  <a-button 
                    v-if="stage.status === 'failed'"
                    size="small" 
                    type="text"
                    @click="handleRetryStage(stage)"
                  >
                    <template #icon>
                      <ReloadOutlined />
                    </template>
                    重试
                  </a-button>
                  
                  <a-button 
                    v-if="stage.status === 'waiting'"
                    size="small" 
                    type="text"
                    @click="handleContinueStage(stage)"
                  >
                    <template #icon>
                      <CaretRightOutlined />
                    </template>
                    继续
                  </a-button>
                </a-space>
              </div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>

      <!-- 构建统计信息 -->
      <div class="build-statistics">
        <a-divider orientation="left">
          <span class="section-title">构建统计</span>
        </a-divider>
        
        <a-row :gutter="16">
          <a-col :span="6">
            <a-statistic
              title="总阶段数"
              :value="buildDetail.stages.length"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <NodeIndexOutlined />
              </template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic
              title="成功阶段"
              :value="getSuccessStagesCount()"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <CheckCircleOutlined />
              </template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic
              title="失败阶段"
              :value="getFailedStagesCount()"
              :value-style="{ color: '#ff4d4f' }"
            >
              <template #prefix>
                <CloseCircleOutlined />
              </template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic
              title="成功率"
              :value="getSuccessRate()"
              suffix="%"
              :value-style="{ color: getSuccessRate() > 80 ? '#52c41a' : '#faad14' }"
            >
              <template #prefix>
                <TrophyOutlined />
              </template>
            </a-statistic>
          </a-col>
        </a-row>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-else class="loading-container">
      <a-spin size="large" tip="加载构建详情中...">
        <div style="height: 400px;"></div>
      </a-spin>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  BranchesOutlined,
  ClockCircleOutlined,
  HourglassOutlined,
  FileTextOutlined,
  ReloadOutlined,
  CaretRightOutlined,
  NodeIndexOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  GitlabOutlined,
  BuildOutlined,
  BugOutlined,
  CloudUploadOutlined,
  UserOutlined,
  ScheduleOutlined,
  ApiOutlined
} from '@ant-design/icons-vue';
import type { PipelineBuild, PipelineStage } from '../types/pipeline';
import dayjs from 'dayjs';

// Props定义
interface Props {
  visible: boolean;
  buildDetail: PipelineBuild | null;
}

// Emits定义
interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
  (e: 'viewStageLogs', stage: PipelineStage): void;
  (e: 'retryStage', stage: PipelineStage): void;
  (e: 'continueStage', stage: PipelineStage): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 事件处理方法
/**
 * 关闭弹窗
 */
const handleClose = () => {
  emit('update:visible', false);
  emit('close');
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
 * 继续阶段
 */
const handleContinueStage = (stage: PipelineStage) => {
  emit('continueStage', stage);
};

// 工具方法
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
    'waiting': 'warning'
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
 * 获取触发方式颜色
 */
const getTriggerColor = (trigger: string) => {
  const colorMap = {
    'manual': 'blue',
    'webhook': 'green',
    'schedule': 'orange',
    'api': 'purple'
  };
  return colorMap[trigger] || 'default';
};

/**
 * 获取触发方式图标
 */
const getTriggerIcon = (trigger: string) => {
  const iconMap = {
    'manual': UserOutlined,
    'webhook': GitlabOutlined,
    'schedule': ScheduleOutlined,
    'api': ApiOutlined
  };
  return iconMap[trigger] || UserOutlined;
};

/**
 * 获取触发方式文本
 */
const getTriggerText = (trigger: string) => {
  const textMap = {
    'manual': '手动触发',
    'webhook': 'Webhook',
    'schedule': '定时触发',
    'api': 'API触发'
  };
  return textMap[trigger] || trigger;
};

/**
 * 获取环境颜色
 */
const getEnvironmentColor = (environment: string) => {
  const colorMap = {
    'test': 'cyan',
    'production': 'red',
    'staging': 'orange',
    'development': 'green'
  };
  return colorMap[environment] || 'default';
};

/**
 * 获取环境文本
 */
const getEnvironmentText = (environment: string) => {
  const textMap = {
    'test': '测试环境',
    'production': '生产环境',
    'staging': '预发环境',
    'development': '开发环境'
  };
  return textMap[environment] || environment;
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
 * 获取阶段时间线颜色
 */
const getStageTimelineColor = (status: string) => {
  const colorMap = {
    'pending': 'gray',
    'running': 'blue',
    'success': 'green',
    'failed': 'red',
    'cancelled': 'orange',
    'waiting': 'gold'
  };
  return colorMap[status] || 'gray';
};

/**
 * 获取阶段进度
 */
const getStageProgress = (stage: PipelineStage) => {
  // 模拟进度，实际应该从后端获取
  if (stage.status === 'running') {
    return Math.floor(Math.random() * 80) + 10; // 10-90之间的随机数
  }
  return stage.status === 'success' ? 100 : 0;
};

/**
 * 格式化时间
 */
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 格式化时长
 */
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`;
  }
  return `${remainingSeconds}秒`;
};

/**
 * 获取成功阶段数量
 */
const getSuccessStagesCount = () => {
  if (!props.buildDetail?.stages) return 0;
  return props.buildDetail.stages.filter(stage => stage.status === 'success').length;
};

/**
 * 获取失败阶段数量
 */
const getFailedStagesCount = () => {
  if (!props.buildDetail?.stages) return 0;
  return props.buildDetail.stages.filter(stage => stage.status === 'failed').length;
};

/**
 * 获取成功率
 */
const getSuccessRate = () => {
  if (!props.buildDetail?.stages || props.buildDetail.stages.length === 0) return 0;
  const successCount = getSuccessStagesCount();
  return Math.round((successCount / props.buildDetail.stages.length) * 100);
};
</script>

<style lang="less" scoped>
.build-detail {
  .build-info {
    margin-bottom: 24px;
    
    .trigger-user {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .user-name {
        font-size: 14px;
      }
    }
  }
  
  .stages-detail {
    margin-bottom: 24px;
    
    .section-title {
      font-weight: 600;
      color: #2c3e50;
    }
    
    .timeline-dot {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: white;
      border: 2px solid #d9d9d9;
      font-size: 12px;
      
      &.pending {
        border-color: #d9d9d9;
        color: #8c8c8c;
      }
      
      &.running {
        border-color: #1890ff;
        color: #1890ff;
        background: #f0f8ff;
      }
      
      &.success {
        border-color: #52c41a;
        color: #52c41a;
        background: #f6ffed;
      }
      
      &.failed {
        border-color: #ff4d4f;
        color: #ff4d4f;
        background: #fff2f0;
      }
      
      &.waiting {
        border-color: #faad14;
        color: #faad14;
        background: #fffbe6;
      }
    }
    
    .stage-timeline-content {
      .stage-header {
        margin-bottom: 8px;
        
        .stage-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          
          .stage-name {
            font-weight: 600;
            font-size: 14px;
            color: #2c3e50;
          }
        }
        
        .stage-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #666;
          
          .stage-time,
          .stage-duration {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
      
      .stage-progress {
        margin-bottom: 8px;
      }
      
      .stage-description {
        font-size: 13px;
        color: #666;
        margin-bottom: 8px;
        line-height: 1.5;
      }
      
      .stage-error {
        margin-bottom: 8px;
      }
      
      .stage-actions {
        margin-top: 8px;
      }
    }
  }
  
  .build-statistics {
    .section-title {
      font-weight: 600;
      color: #2c3e50;
    }
  }
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

// 时间线样式优化
:deep(.ant-timeline) {
  .ant-timeline-item-content {
    margin-left: 32px;
    min-height: auto;
  }
  
  .ant-timeline-item-tail {
    border-left: 2px solid #e8e8e8;
  }
}

// 描述列表样式优化
:deep(.ant-descriptions) {
  .ant-descriptions-item-label {
    font-weight: 600;
    color: #2c3e50;
    background-color: #fafbfc;
  }
  
  .ant-descriptions-item-content {
    color: #495057;
  }
}

// 统计数字样式优化
:deep(.ant-statistic) {
  .ant-statistic-title {
    font-size: 13px;
    color: #666;
    margin-bottom: 4px;
  }
  
  .ant-statistic-content {
    font-size: 20px;
    font-weight: 600;
  }
}
</style>