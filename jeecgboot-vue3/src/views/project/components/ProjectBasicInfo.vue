<template>
  <div class="project-basic-info">
    <a-row :gutter="16">
      <!-- 基本信息 -->
      <a-col :span="12">
        <a-card title="基本信息" :bordered="false" class="info-card">
          <div class="info-list">
            <div class="info-item">
              <span class="label">项目名称：</span>
              <span class="value">{{ projectInfo.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">项目编码：</span>
              <span class="value">{{ projectInfo.code }}</span>
            </div>
            <div class="info-item">
              <span class="label">项目描述：</span>
              <span class="value">{{ projectInfo.description }}</span>
            </div>
            <div class="info-item">
              <span class="label">项目状态：</span>
              <a-tag :color="getStatusColor(projectInfo.status)">
                {{ getStatusText(projectInfo.status) }}
              </a-tag>
            </div>
            <div class="info-item">
              <span class="label">优先级：</span>
              <a-tag :color="getPriorityColor(projectInfo.priority)">
                {{ getPriorityText(projectInfo.priority) }}
              </a-tag>
            </div>
            <div class="info-item">
              <span class="label">项目类型：</span>
              <a-tag>{{ getTypeText(projectInfo.type) }}</a-tag>
            </div>
            <div class="info-item">
              <span class="label">项目进度：</span>
              <a-progress
                :percent="projectInfo.progress"
                :size="'small'"
                :status="projectInfo.progress === 100 ? 'success' : 'active'"
                style="width: 200px;"
              />
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 时间信息 -->
      <a-col :span="12">
        <a-card title="时间信息" :bordered="false" class="info-card">
          <div class="info-list">
            <div class="info-item">
              <span class="label">开始时间：</span>
              <span class="value">{{ formatDate(projectInfo.startDate) }}</span>
            </div>
            <div class="info-item">
              <span class="label">结束时间：</span>
              <span class="value">{{ formatDate(projectInfo.endDate) }}</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间：</span>
              <span class="value">{{ formatDate(projectInfo.createTime) }}</span>
            </div>
            <div class="info-item">
              <span class="label">更新时间：</span>
              <span class="value">{{ formatDate(projectInfo.updateTime) }}</span>
            </div>
            <div class="info-item">
              <span class="label">项目周期：</span>
              <span class="value">{{ getProjectDuration() }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px;">
      <!-- 技术栈 -->
      <a-col :span="12">
        <a-card title="技术栈" :bordered="false" class="info-card">
          <div class="tech-stack">
            <a-tag
              v-for="tech in projectInfo.techStack"
              :key="tech"
              color="blue"
              class="tech-tag"
            >
              {{ tech }}
            </a-tag>
          </div>
        </a-card>
      </a-col>

      <!-- 项目负责人 -->
      <a-col :span="12">
        <a-card title="项目负责人" :bordered="false" class="info-card">
          <div class="manager-info">
            <a-avatar :size="48" :src="projectInfo.manager?.avatar">
              {{ projectInfo.manager?.name?.charAt(0) }}
            </a-avatar>
            <div class="manager-details">
              <div class="name">{{ projectInfo.manager?.name }}</div>
              <div class="role">{{ projectInfo.manager?.role }}</div>
              <div class="contact">{{ projectInfo.manager?.email }}</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px;">
      <!-- Git仓库信息 -->
      <a-col :span="24">
        <a-card title="Git仓库信息" :bordered="false" class="info-card">
          <div class="git-info">
            <div class="info-item">
              <span class="label">仓库地址：</span>
              <a :href="projectInfo.gitUrl" target="_blank" class="git-link">
                <Icon icon="ant-design:github-outlined" />
                {{ projectInfo.gitUrl }}
              </a>
            </div>
            <div class="info-item">
              <span class="label">主分支：</span>
              <span class="value">{{ projectInfo.mainBranch || 'main' }}</span>
            </div>
            <div class="info-item">
              <span class="label">最新提交：</span>
              <span class="value">{{ projectInfo.lastCommit || '暂无' }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { getProjectDetail } from '../Project.api';
  import { ProjectStatus, ProjectPriority, ProjectType } from '../Project.data';
  import { formatToDate } from '/@/utils/dateUtil';

  interface Props {
    projectId: string;
  }

  const props = defineProps<Props>();

  // 项目信息
  const projectInfo = reactive({
    id: '',
    name: '',
    code: '',
    description: '',
    status: ProjectStatus.PLANNING,
    priority: ProjectPriority.MEDIUM,
    type: ProjectType.WEB,
    progress: 0,
    startDate: '',
    endDate: '',
    createTime: '',
    updateTime: '',
    techStack: [],
    manager: {
      name: '',
      role: '',
      email: '',
      avatar: '',
    },
    gitUrl: '',
    mainBranch: '',
    lastCommit: '',
  });

  /**
   * 加载项目详情
   */
  async function loadProjectDetail() {
    try {
      const result = await getProjectDetail({ id: props.projectId });
      if (result.success) {
        Object.assign(projectInfo, result.result);
      }
    } catch (error) {
      console.error('加载项目详情失败:', error);
    }
  }

  /**
   * 格式化日期
   */
  function formatDate(date: string) {
    return date ? formatToDate(date) : '-';
  }

  /**
   * 获取项目周期
   */
  function getProjectDuration() {
    if (!projectInfo.startDate || !projectInfo.endDate) {
      return '-';
    }
    const start = new Date(projectInfo.startDate);
    const end = new Date(projectInfo.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} 天`;
  }

  /**
   * 获取状态颜色
   */
  function getStatusColor(status: ProjectStatus) {
    const colorMap = {
      [ProjectStatus.PLANNING]: 'blue',
      [ProjectStatus.IN_PROGRESS]: 'processing',
      [ProjectStatus.TESTING]: 'orange',
      [ProjectStatus.COMPLETED]: 'success',
      [ProjectStatus.SUSPENDED]: 'warning',
      [ProjectStatus.CANCELLED]: 'error',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取状态文本
   */
  function getStatusText(status: ProjectStatus) {
    const textMap = {
      [ProjectStatus.PLANNING]: '规划中',
      [ProjectStatus.IN_PROGRESS]: '进行中',
      [ProjectStatus.TESTING]: '测试中',
      [ProjectStatus.COMPLETED]: '已完成',
      [ProjectStatus.SUSPENDED]: '已暂停',
      [ProjectStatus.CANCELLED]: '已取消',
    };
    return textMap[status] || '未知';
  }

  /**
   * 获取优先级颜色
   */
  function getPriorityColor(priority: ProjectPriority) {
    const colorMap = {
      [ProjectPriority.LOW]: 'green',
      [ProjectPriority.MEDIUM]: 'blue',
      [ProjectPriority.HIGH]: 'orange',
      [ProjectPriority.URGENT]: 'red',
    };
    return colorMap[priority] || 'default';
  }

  /**
   * 获取优先级文本
   */
  function getPriorityText(priority: ProjectPriority) {
    const textMap = {
      [ProjectPriority.LOW]: '低',
      [ProjectPriority.MEDIUM]: '中',
      [ProjectPriority.HIGH]: '高',
      [ProjectPriority.URGENT]: '紧急',
    };
    return textMap[priority] || '未知';
  }

  /**
   * 获取类型文本
   */
  function getTypeText(type: ProjectType) {
    const textMap = {
      [ProjectType.WEB]: 'Web应用',
      [ProjectType.MOBILE]: '移动应用',
      [ProjectType.DESKTOP]: '桌面应用',
      [ProjectType.API]: 'API服务',
      [ProjectType.LIBRARY]: '组件库',
      [ProjectType.OTHER]: '其他',
    };
    return textMap[type] || '未知';
  }

  // 生命周期
  onMounted(() => {
    loadProjectDetail();
  });
</script>

<style lang="less" scoped>
</style>