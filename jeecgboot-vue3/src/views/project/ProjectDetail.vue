<template>
  <div class="project-detail">
    <!-- 页面头部 -->
    <div class="detail-header">
      <div class="header-left">
        <a-button @click="goBack" class="back-btn">
          <template #icon>
            <Icon icon="ant-design:arrow-left-outlined" />
          </template>
          返回
        </a-button>
        <div class="title-info">
          <h2>{{ projectInfo.name }}</h2>
          <a-tag :color="getStatusColor(projectInfo.status)">
            {{ getStatusText(projectInfo.status) }}
          </a-tag>
        </div>
      </div>
      <div class="header-actions">
        <a-button @click="handleEdit">
          <template #icon>
            <Icon icon="ant-design:edit-outlined" />
          </template>
          编辑
        </a-button>
        <a-button type="primary" danger @click="handleDelete">
          <template #icon>
            <Icon icon="ant-design:delete-outlined" />
          </template>
          删除
        </a-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-spin size="large" />
    </div>

    <!-- 详情内容 -->
    <div v-else class="detail-content">
      <!-- 需求概览卡片 -->
      <a-card class="project-overview-card" :bordered="false">
        <div class="overview-content">
          <div class="project-info">
            <div class="project-avatar">
              <a-avatar :size="64" :src="projectInfo.avatar">
                {{ projectInfo.name?.charAt(0) }}
              </a-avatar>
            </div>
            <div class="project-details">
              <h3>{{ projectInfo.name }}</h3>
              <p class="description">{{ projectInfo.description }}</p>
              <div class="project-tags">
                <a-tag v-for="tag in projectInfo.tags" :key="tag" color="blue">
                  {{ tag }}
                </a-tag>
              </div>
            </div>
          </div>
          <div class="project-stats">
            <div class="stat-item">
              <div class="stat-value">{{ taskCount }}</div>
              <div class="stat-label">任务数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ memberCount }}</div>
              <div class="stat-label">成员数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ projectInfo.progress }}%</div>
              <div class="stat-label">完成度</div>
            </div>
          </div>
        </div>
      </a-card>

      <!-- Tab页面内容 -->
      <a-card class="tab-container" :bordered="false">
        <a-tabs v-model:activeKey="activeTabKey" @change="handleTabChange">
          <a-tab-pane v-for="tab in tabList" :key="tab.key" :tab="tab.name">
            <component :is="tab.component" :project-id="projectId" />
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getProjectDetail, deleteProject } from './Project.api';
  import { ProjectStatus, projectDetailTabs } from './Project.data';
  import ProjectBasicInfo from './components/ProjectBasicInfo.vue';
  import ProjectRelatedApps from './components/ProjectRelatedApps.vue';
  import GitBranchManager from './components/GitBranchManager.vue';
  import ProjectWorkflow from './components/ProjectWorkflow.vue';
  import PipelineManager from './components/PipelineManager.vue';
  import ProjectTimeline from './components/ProjectTimeline.vue';
  import ProjectMembers from './components/ProjectMembers.vue';
  import ProjectFiles from './components/ProjectFiles.vue';
  import ProjectStatistics from './components/ProjectStatistics.vue';

  defineOptions({ name: 'ProjectDetail' });

  const route = useRoute();
  const router = useRouter();
  const { createMessage, createConfirm } = useMessage();

  // 响应式数据
  const loading = ref(false);
  const activeTabKey = ref('basic');
  const taskCount = ref(0);
  const memberCount = ref(0);

  // 项目信息
  const projectInfo = reactive({
    id: '',
    name: '',
    code: '',
    description: '',
    status: ProjectStatus.PLANNING,
    priority: '',
    type: '',
    avatar: '',
    tags: [],
    progress: 0,
    startDate: '',
    endDate: '',
    createTime: '',
    updateTime: '',
  });

  // 计算属性
  const projectId = computed(() => route.params.id as string);

  // Tab列表
  const tabList = projectDetailTabs.map(tab => ({
    ...tab,
    component: getTabComponent(tab.key),
  }));

  /**
   * 获取Tab组件
   */
  function getTabComponent(key: string) {
    const componentMap = {
      basic: ProjectBasicInfo,
      relatedApps: ProjectRelatedApps,
      gitBranches: GitBranchManager,
      workflow: ProjectWorkflow,
      pipelines: PipelineManager,
      timeline: ProjectTimeline,
      members: ProjectMembers,
      files: ProjectFiles,
      statistics: ProjectStatistics,
    };
    return componentMap[key] || ProjectBasicInfo;
  }

  /**
   * 加载项目详情
   */
  async function loadProjectDetail() {
    try {
      loading.value = true;
      const result = await getProjectDetail({ id: projectId.value });
      
      if (result.success) {
        Object.assign(projectInfo, result.result);
        // 模拟统计数据
        taskCount.value = Math.floor(Math.random() * 50) + 10;
        memberCount.value = Math.floor(Math.random() * 10) + 3;
      } else {
        createMessage.error(result.message || '加载项目详情失败');
      }
    } catch (error) {
      console.error('加载项目详情失败:', error);
      createMessage.error('加载项目详情失败');
    } finally {
      loading.value = false;
    }
  }

  /**
   * 返回列表
   */
  function goBack() {
    router.go(-1);
  }

  /**
   * 编辑项目
   */
  function handleEdit() {
    router.push(`/project/edit/${projectId.value}`);
  }

  /**
   * 删除项目
   */
  function handleDelete() {
    createConfirm({
      iconType: 'warning',
      title: '确认删除',
      content: '确定要删除这个项目吗？删除后无法恢复。',
      onOk: async () => {
        try {
          await deleteProject({ id: projectId.value });
          createMessage.success('删除成功');
          router.push('/project/list');
        } catch (error) {
          createMessage.error('删除失败');
        }
      },
    });
  }

  /**
   * Tab切换处理
   */
  function handleTabChange(key: string) {
    activeTabKey.value = key;
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

  // 生命周期
  onMounted(() => {
    loadProjectDetail();
  });
</script>

<style lang="less" scoped>
  .project-detail {
    padding: 0;
    background: #f5f7fa;
    min-height: 100vh;

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding: 16px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;

        .title-info {
          display: flex;
          align-items: center;
          gap: 8px;

          h2 {
            margin: 0;
            font-size: 18px;
          }
        }
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 400px;
      background: #fff;
      margin: 0 16px;
    }

    .detail-content {
      padding: 0 16px 16px;

      .project-overview-card {
        margin-bottom: 16px;

        .overview-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;

          .project-info {
            display: flex;
            gap: 16px;
            flex: 1;

            .project-avatar {
              flex-shrink: 0;
            }

            .project-details {
              flex: 1;

              h3 {
                margin: 0 0 8px 0;
                font-size: 16px;
              }

              .description {
                margin: 0 0 8px 0;
                color: #666;
                line-height: 1.5;
              }

              .project-tags {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
              }
            }
          }

          .project-stats {
            display: flex;
            gap: 16px;
            flex-shrink: 0;

            .stat-item {
              text-align: center;
              padding: 16px;
              min-width: 80px;

              .stat-value {
                font-size: 24px;
                line-height: 1;
                margin-bottom: 8px;
              }

              .stat-label {
                font-size: 12px;
              }
            }
          }
        }
      }

      .tab-container {
        border: 1px solid #f0f0f0;

        :deep(.ant-tabs) {
          .ant-tabs-nav {
            margin: 0;
            padding: 0 16px;

            .ant-tabs-tab {
              padding: 12px 16px;

              &.ant-tabs-tab-active {
                background: #fff;
                color: #1890ff;
                font-weight: 600;
                border-bottom: 3px solid #1890ff;
              }
            }
          }

          .ant-tabs-content-holder {
            padding: 24px;
            background: #fff;
          }

          .ant-tabs-ink-bar {
            display: none;
          }
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .project-detail {
      .detail-header {
        padding: 16px 20px;
        flex-direction: column;
        gap: 16px;
        align-items: stretch;

        .header-left {
          justify-content: space-between;

          .title-info {
            h2 {
              font-size: 20px;
            }
          }
        }

        .header-actions {
          justify-content: center;
        }
      }

      .detail-content {
        padding: 0 16px 16px;

        .project-overview-card {
          .overview-content {
            flex-direction: column;
            gap: 24px;

            .project-stats {
              justify-content: space-around;
              gap: 16px;

              .stat-item {
                min-width: 60px;
                padding: 12px;

                .stat-value {
                  font-size: 24px;
                }
              }
            }
          }
        }

        .tab-container {
          :deep(.ant-tabs-nav) {
            padding: 0 16px;

            .ant-tabs-tab {
              padding: 12px 16px;
            }
          }

          :deep(.ant-tabs-content-holder) {
            padding: 16px;
          }
        }
      }
    }
  }
</style>