<template>
  <div class="project-detail">
    <!-- 页面头部 -->
    <div class="detail-header">
      <a-button type="link" @click="goBack" class="back-btn">
        <Icon icon="ant-design:arrow-left-outlined" size="16" />
        返回列表
      </a-button>
      <div class="header-actions">
        <a-button type="primary" @click="handleEdit">
          <Icon icon="ant-design:edit-outlined" size="16" />
          编辑项目
        </a-button>
        <a-button @click="handleCreateGitBranch" :loading="gitBranchLoading">
          <Icon icon="ant-design:branch-outlined" size="16" />
          创建Git分支
        </a-button>
        <a-button @click="handleTriggerPipeline" :loading="pipelineLoading">
          <Icon icon="ant-design:play-circle-outlined" size="16" />
          触发流水线
        </a-button>
      </div>
    </div>

    <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
      <template #headerContent>
        <div class="project-header">
          <div class="project-title">
            <h2>{{ projectData?.title || '项目详情' }}</h2>
            <div class="project-meta">
              <a-tag :color="getProjectTypeColor(projectData?.projectType)">
                {{ getProjectTypeText(projectData?.projectType) }}
              </a-tag>
              <a-tag :color="getProjectStatusColor(projectData?.status)">
                {{ getProjectStatusText(projectData?.status) }}
              </a-tag>
              <span class="project-id">
                {{ projectData?.requirementId || projectData?.bugId || '' }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <a-tabs v-model:activeKey="activeTab" type="card" class="project-tabs">
        <!-- 基本信息 -->
        <a-tab-pane key="basic" tab="基本信息">
          <div class="tab-content">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="项目类型">
                <a-tag :color="getProjectTypeColor(projectData?.projectType)">
                  {{ getProjectTypeText(projectData?.projectType) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="需求/BUG ID">
                {{ projectData?.requirementId || projectData?.bugId || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="项目标题" :span="2">
                {{ projectData?.title || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="项目描述" :span="2">
                {{ projectData?.description || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="关联应用">
                {{ projectData?.relatedAppName || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="开发人员">
                {{ projectData?.developerName || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="项目状态">
                <a-tag :color="getProjectStatusColor(projectData?.status)">
                  {{ getProjectStatusText(projectData?.status) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="Git分支">
                {{ projectData?.gitBranch || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="开始时间">
                {{ formatTime(projectData?.startTime) }}
              </a-descriptions-item>
              <a-descriptions-item label="提测时间">
                {{ formatTime(projectData?.testTime) }}
              </a-descriptions-item>
              <a-descriptions-item label="上线时间">
                {{ formatTime(projectData?.onlineTime) }}
              </a-descriptions-item>
              <a-descriptions-item label="发布时间">
                {{ formatTime(projectData?.releaseTime) }}
              </a-descriptions-item>
            </a-descriptions>

            <!-- 设计链接 -->
            <div class="design-links-section" v-if="projectData?.designLinks?.length">
              <h3>原型/设计稿链接</h3>
              <div class="design-links">
                <div v-for="link in projectData.designLinks" :key="link.id" class="design-link-item">
                  <a-tag :color="link.type === 'prototype' ? 'blue' : 'green'">
                    {{ link.type === 'prototype' ? '原型' : '设计稿' }}
                  </a-tag>
                  <span class="link-title">{{ link.title }}</span>
                  <a :href="link.url" target="_blank" class="link-url">
                    <Icon icon="ant-design:link-outlined" />
                    查看链接
                  </a>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <!-- Git分支管理 -->
        <a-tab-pane key="git" tab="Git分支">
          <GitBranchManager :project-id="projectId" :project-data="projectData" />
        </a-tab-pane>

        <!-- 应用配置 -->
        <a-tab-pane key="config" tab="应用配置">
          <AppConfigManager :project-id="projectId" />
        </a-tab-pane>

        <!-- 流水线 -->
        <a-tab-pane key="pipeline" tab="流水线">
          <PipelineManager :project-id="projectId" />
        </a-tab-pane>
      </a-tabs>
    </PageWrapper>
    
    <!-- 项目编辑模态框 -->
    <ProjectModal @register="registerModal" @success="handleEditSuccess" />
    
    <!-- Git分支创建结果模态框 -->
    <BasicModal
      v-model:visible="gitBranchModalVisible"
      title="Git分支创建结果"
      :footer="null"
      width="600px"
    >
      <div class="git-branch-result">
        <a-result
          :status="gitBranchResult.success ? 'success' : 'error'"
          :title="gitBranchResult.success ? '分支创建成功' : '分支创建失败'"
          :sub-title="gitBranchResult.message"
        >
          <template #extra v-if="gitBranchResult.success">
            <div class="git-command">
              <h4>Git命令：</h4>
              <a-typography-paragraph copyable>
                {{ gitBranchResult.command }}
              </a-typography-paragraph>
            </div>
          </template>
        </a-result>
      </div>
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { 
    getProjectDetail, 
    createGitBranch, 
    triggerPipeline,
    generateGitBranchName 
  } from './Project.api';
  import { ProjectModel, ProjectType, ProjectStatus } from './Project.data';
  import ProjectModal from './components/ProjectModal.vue';
  import GitBranchManager from './components/GitBranchManager.vue';
  import AppConfigManager from './components/AppConfigManager.vue';
  import PipelineManager from './components/PipelineManager.vue';
  import { formatToDateTime } from '/@/utils/dateUtil';

  const route = useRoute();
  const router = useRouter();
  const { createMessage } = useMessage();
  
  // 项目ID
  const projectId = computed(() => route.params?.id as string);
  
  // 项目数据
  const projectData = ref<ProjectModel>();
  
  // 当前激活的标签页
  const activeTab = ref('basic');
  
  // 加载状态
  const loading = ref(false);
  const gitBranchLoading = ref(false);
  const pipelineLoading = ref(false);
  
  // Git分支创建结果
  const gitBranchModalVisible = ref(false);
  const gitBranchResult = reactive({
    success: false,
    message: '',
    command: '',
    branchName: '',
  });

  // 注册模态框
  const [registerModal, { openModal }] = useModal();

  /**
   * 加载项目详情
   */
  async function loadProjectDetail() {
    if (!projectId.value) return;
    
    try {
      loading.value = true;
      const result = await getProjectDetail({ id: projectId.value });
      projectData.value = result;
    } catch (error) {
      createMessage.error('加载项目详情失败');
    } finally {
      loading.value = false;
    }
  }

  /**
   * 返回列表
   */
  function goBack() {
    router.push('/project/list');
  }

  /**
   * 编辑项目
   */
  function handleEdit() {
    // 跳转到独立的编辑页面
    router.push(`/project/edit/${route.params.id}`);
  }

  /**
   * 创建Git分支
   */
  async function handleCreateGitBranch() {
    if (!projectData.value) return;
    
    try {
      gitBranchLoading.value = true;
      const itemId = projectData.value.requirementId || projectData.value.bugId;
      if (!itemId) {
        createMessage.error('需求ID或BUG ID不能为空');
        return;
      }
      
      const result = await createGitBranch({
        projectId: projectId.value,
        projectType: projectData.value.projectType,
        itemId,
        appId: projectData.value.relatedAppId,
      });
      
      gitBranchResult.success = result.success;
      gitBranchResult.message = result.message;
      gitBranchResult.command = result.command;
      gitBranchResult.branchName = result.branchName;
      gitBranchModalVisible.value = true;
      
      if (result.success) {
        // 更新项目数据中的Git分支信息
        projectData.value.gitBranch = result.branchName;
      }
    } catch (error) {
      createMessage.error('创建Git分支失败');
    } finally {
      gitBranchLoading.value = false;
    }
  }

  /**
   * 触发流水线
   */
  async function handleTriggerPipeline() {
    if (!projectId.value) return;
    
    try {
      pipelineLoading.value = true;
      await triggerPipeline({ projectId: projectId.value });
      createMessage.success('流水线触发成功');
      // 切换到流水线标签页
      activeTab.value = 'pipeline';
    } catch (error) {
      createMessage.error('触发流水线失败');
    } finally {
      pipelineLoading.value = false;
    }
  }

  /**
   * 编辑成功回调
   */
  function handleEditSuccess() {
    loadProjectDetail();
  }

  /**
   * 获取项目类型颜色
   */
  function getProjectTypeColor(type?: ProjectType) {
    return type === ProjectType.REQUIREMENT ? 'blue' : 'red';
  }

  /**
   * 获取项目类型文本
   */
  function getProjectTypeText(type?: ProjectType) {
    return type === ProjectType.REQUIREMENT ? '需求' : 'BUG';
  }

  /**
   * 获取项目状态颜色
   */
  function getProjectStatusColor(status?: ProjectStatus) {
    const colorMap = {
      [ProjectStatus.PLANNING]: 'default',
      [ProjectStatus.DEVELOPING]: 'processing',
      [ProjectStatus.TESTING]: 'warning',
      [ProjectStatus.ONLINE]: 'success',
      [ProjectStatus.RELEASED]: 'success',
      [ProjectStatus.CLOSED]: 'default',
    };
    return colorMap[status!] || 'default';
  }

  /**
   * 获取项目状态文本
   */
  function getProjectStatusText(status?: ProjectStatus) {
    const textMap = {
      [ProjectStatus.PLANNING]: '规划中',
      [ProjectStatus.DEVELOPING]: '开发中',
      [ProjectStatus.TESTING]: '测试中',
      [ProjectStatus.ONLINE]: '已上线',
      [ProjectStatus.RELEASED]: '已发布',
      [ProjectStatus.CLOSED]: '已关闭',
    };
    return textMap[status!] || status;
  }

  /**
   * 格式化时间
   */
  function formatTime(time?: string) {
    return time ? formatToDateTime(time) : '-';
  }

  // 组件挂载时加载数据
  onMounted(() => {
    loadProjectDetail();
  });
</script>

<style lang="less" scoped>
  .project-detail {
    padding: 24px;
    background-color: #f0f2f5;
    min-height: calc(100vh - 64px);

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 16px 24px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .back-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0;
        font-size: 16px;
        color: #1890ff;

        &:hover {
          color: #40a9ff;
        }
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }
    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      
      .project-title {
        h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
        }
        
        .project-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .project-id {
            color: #666;
            font-size: 14px;
          }
        }
      }
      
      .project-actions {
        display: flex;
        gap: 8px;
      }
    }
    
    .project-tabs {
      height: 100%;
      width: 100%;
      
      :deep(.ant-tabs-content-holder) {
        height: calc(100% - 44px);
        overflow: auto;
      }
      
      :deep(.ant-tabs-tabpane) {
        width: 100%;
        height: 100%;
      }
    }
    
    .tab-content {
      padding: 16px;
      width: 100%;
      box-sizing: border-box;
    }
    
    .design-links-section {
      margin-top: 24px;
      
      h3 {
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 600;
      }
      
      .design-links {
        .design-link-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          padding: 8px;
          background: #fafafa;
          border-radius: 4px;
          
          .link-title {
            font-weight: 500;
          }
          
          .link-url {
            color: #1890ff;
            text-decoration: none;
            
            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }
    
    .git-branch-result {
      .git-command {
        text-align: left;
        
        h4 {
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
        }
      }
    }
  }
</style>