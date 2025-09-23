<!--项目详情组件-->
<template>
  <div class="project-detail">
    <!-- 项目基本信息 -->
    <div class="detail-section">
      <h3 class="section-title">基本信息</h3>
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="项目名称">
          {{ project.name }}
        </a-descriptions-item>
        <a-descriptions-item label="项目描述">
          {{ project.description || '暂无描述' }}
        </a-descriptions-item>
        <a-descriptions-item label="项目状态">
          <a-tag :color="getStatusColor(project.status)">
            {{ getStatusText(project.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="分支">
          <a-tag color="blue">{{ project.branch }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="负责人">
          {{ project.owner }}
        </a-descriptions-item>
        <a-descriptions-item label="开始时间">
          {{ formatDate(project.startTime) }}
        </a-descriptions-item>
        <a-descriptions-item label="结束时间">
          {{ project.endTime ? formatDate(project.endTime) : '进行中' }}
        </a-descriptions-item>
      </a-descriptions>
    </div>

    <!-- 项目进度 -->
    <div class="detail-section">
      <h3 class="section-title">项目进度</h3>
      <div class="progress-info">
        <a-progress 
          :percent="project.progress" 
          :status="getProgressStatus(project.status)"
          :stroke-color="getProgressColor(project.progress)"
        />
        <div class="progress-text">
          <span>完成度：{{ project.progress }}%</span>
        </div>
      </div>
    </div>

    <!-- 项目统计 -->
    <div class="detail-section">
      <h3 class="section-title">项目统计</h3>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-statistic
            title="代码提交"
            :value="project.commitCount || 0"
            suffix="次"
          />
        </a-col>
        <a-col :span="8">
          <a-statistic
            title="部署次数"
            :value="project.deployCount || 0"
            suffix="次"
          />
        </a-col>
        <a-col :span="8">
          <a-statistic
            title="Bug数量"
            :value="project.bugCount || 0"
            suffix="个"
          />
        </a-col>
      </a-row>
    </div>

    <!-- 最近活动 -->
    <div class="detail-section">
      <h3 class="section-title">最近活动</h3>
      <a-timeline>
        <a-timeline-item
          v-for="activity in recentActivities"
          :key="activity.id"
          :color="getActivityColor(activity.type)"
        >
          <template #dot>
            <Icon :icon="getActivityIcon(activity.type)" />
          </template>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-time">{{ formatDate(activity.time) }}</div>
          </div>
        </a-timeline-item>
      </a-timeline>
    </div>

    <!-- 操作按钮 -->
    <div class="detail-actions">
      <a-space>
        <a-button type="primary" @click="handleEdit">
          <template #icon>
            <Icon icon="ant-design:edit-outlined" />
          </template>
          编辑项目
        </a-button>
        <a-button @click="handleViewCode">
          <template #icon>
            <Icon icon="ant-design:code-outlined" />
          </template>
          查看代码
        </a-button>
        <a-button @click="handleDeploy" :disabled="project.status === 'archived'">
          <template #icon>
            <Icon icon="ant-design:rocket-outlined" />
          </template>
          部署项目
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Descriptions, DescriptionsItem, Tag, Progress, Row, Col, Statistic, Timeline, TimelineItem, Button, Space, message } from 'ant-design-vue';
import Icon from '/@/components/Icon';
import { ProjectStatus, projectStatusConfig } from './AppDetailTabs.data';

/**
 * 组件属性定义
 */
interface Props {
  project: {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    branch: string;
    owner: string;
    startTime: string;
    endTime?: string;
    progress: number;
    commitCount?: number;
    deployCount?: number;
    bugCount?: number;
  };
}

/**
 * 组件事件定义
 */
interface Emits {
  (e: 'update'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/**
 * 模拟的最近活动数据
 */
const recentActivities = computed(() => [
  {
    id: '1',
    type: 'commit',
    title: '提交了新功能代码',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'deploy',
    title: '部署到测试环境',
    time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'bug',
    title: '修复了登录问题',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]);

/**
 * 获取状态颜色
 */
const getStatusColor = (status: ProjectStatus): string => {
  return projectStatusConfig[status]?.color || 'default';
};

/**
 * 获取状态文本
 */
const getStatusText = (status: ProjectStatus): string => {
  return projectStatusConfig[status]?.text || status;
};

/**
 * 获取进度状态
 */
const getProgressStatus = (status: ProjectStatus): 'success' | 'exception' | 'normal' | 'active' => {
  if (status === 'deployed') return 'success';
  if (status === 'archived') return 'exception';
  return 'active';
};

/**
 * 获取进度颜色
 */
const getProgressColor = (progress: number): string => {
  if (progress >= 80) return '#52c41a';
  if (progress >= 50) return '#1890ff';
  if (progress >= 20) return '#faad14';
  return '#f5222d';
};

/**
 * 获取活动类型颜色
 */
const getActivityColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    commit: 'blue',
    deploy: 'green',
    bug: 'red',
    feature: 'purple',
  };
  return colorMap[type] || 'gray';
};

/**
 * 获取活动类型图标
 */
const getActivityIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    commit: 'ant-design:code-outlined',
    deploy: 'ant-design:rocket-outlined',
    bug: 'ant-design:bug-outlined',
    feature: 'ant-design:plus-outlined',
  };
  return iconMap[type] || 'ant-design:info-circle-outlined';
};

/**
 * 格式化日期
 */
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 处理编辑项目
 */
const handleEdit = (): void => {
  message.info('编辑功能开发中...');
  emit('update');
};

/**
 * 处理查看代码
 */
const handleViewCode = (): void => {
  if (props.project.branch) {
    message.info(`正在跳转到 ${props.project.branch} 分支...`);
    // 这里可以添加跳转到Git仓库的逻辑
  } else {
    message.warning('该项目暂无代码仓库信息');
  }
};

/**
 * 处理部署项目
 */
const handleDeploy = (): void => {
  if (props.project.status === 'archived') {
    message.warning('已归档的项目无法部署');
    return;
  }
  message.info('部署功能开发中...');
};
</script>

<style lang="less" scoped>
.project-detail {
  .detail-section {
    margin-bottom: 24px;

    .section-title {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 600;
      color: #262626;
    }
  }

  .progress-info {
    .progress-text {
      margin-top: 8px;
      text-align: center;
      color: #666;
    }
  }

  .activity-content {
    .activity-title {
      font-weight: 500;
      color: #262626;
    }

    .activity-time {
      margin-top: 4px;
      font-size: 12px;
      color: #999;
    }
  }

  .detail-actions {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>