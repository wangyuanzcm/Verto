<template>
  <div class="project-list">
    <!-- 操作栏 -->
    <div class="action-bar">
      <a-space>
        <a-button type="primary" @click="handleAddProject">
          <template #icon>
            <Icon icon="ant-design:plus-outlined" />
          </template>
          新建项目
        </a-button>
        <a-input-search
          v-model:value="searchText"
          placeholder="搜索项目名称"
          style="width: 300px"
          @search="handleSearch"
        />
        <a-select
          v-model:value="statusFilter"
          placeholder="项目状态"
          style="width: 120px"
          allow-clear
          @change="handleStatusFilter"
        >
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="planning">规划中</a-select-option>
          <a-select-option value="developing">开发中</a-select-option>
          <a-select-option value="testing">测试中</a-select-option>
          <a-select-option value="deployed">已部署</a-select-option>
          <a-select-option value="archived">已归档</a-select-option>
        </a-select>
      </a-space>
    </div>

    <!-- 项目卡片列表 -->
    <div class="project-cards">
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="project in filteredProjects"
          :key="project.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <a-card
            :hoverable="true"
            class="project-card"
            @click="handleProjectClick(project)"
          >
            <template #cover>
              <div class="project-cover">
                <Icon :icon="project.icon" :size="40" />
              </div>
            </template>
            
            <template #actions>
              <Icon
                icon="ant-design:edit-outlined"
                @click.stop="handleEditProject(project)"
              />
              <Icon
                icon="ant-design:setting-outlined"
                @click.stop="handleProjectConfig(project)"
              />
              <Icon
                icon="ant-design:delete-outlined"
                @click.stop="handleDeleteProject(project)"
              />
            </template>

            <a-card-meta
              :title="project.name"
              :description="project.description"
            />

            <div class="project-info">
              <div class="info-item">
                <span class="label">状态:</span>
                <a-tag :color="getStatusColor(project.status)">
                  {{ getStatusText(project.status) }}
                </a-tag>
              </div>
              
              <div class="info-item">
                <span class="label">分支:</span>
                <a-tag color="blue">{{ project.branch }}</a-tag>
              </div>

              <div class="info-item">
                <span class="label">负责人:</span>
                <span>{{ project.owner }}</span>
              </div>

              <div class="info-item">
                <span class="label">开始时间:</span>
                <span>{{ project.startTime }}</span>
              </div>

              <div v-if="project.requirementUrl" class="info-item">
                <span class="label">需求链接:</span>
                <a :href="project.requirementUrl" target="_blank" @click.stop>
                  查看需求
                </a>
              </div>

              <div v-if="project.uiUrl" class="info-item">
                <span class="label">UI设计:</span>
                <a :href="project.uiUrl" target="_blank" @click.stop>
                  查看设计
                </a>
              </div>

              <div class="progress-info">
                <span class="label">进度:</span>
                <a-progress
                  :percent="project.progress"
                  :size="'small'"
                  :status="project.progress === 100 ? 'success' : 'active'"
                />
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 项目详情抽屉 -->
    <a-drawer
      v-model:open="drawerVisible"
      title="项目详情"
      width="600"
      placement="right"
    >
      <ProjectDetail
        v-if="selectedProject"
        :project="selectedProject"
        @update="handleProjectUpdate"
      />
    </a-drawer>

    <!-- 新建/编辑项目弹窗 -->
    <ProjectModal
      v-model:open="modalVisible"
      :project="editingProject"
      :app-id="appId"
      @success="handleModalSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { Card, Row, Col, Button, Input, Select, Space, Tag, Progress, Drawer, message } from 'ant-design-vue';
import Icon from '/@/components/Icon';
import ProjectDetail from './ProjectDetail.vue';
import ProjectModal from './ProjectModal.vue';
import { ProjectStatus, projectStatusConfig } from './AppDetailTabs.data';

/**
 * 项目信息接口定义
 */
interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  branch: string;
  owner: string;
  startTime: string;
  testTime?: string;
  releaseTime?: string;
  requirementUrl?: string;
  uiUrl?: string;
  designDocUrl?: string;
  progress: number;
  icon: string;
}

const props = defineProps<{
  appId: string;
}>();

const searchText = ref('');
const statusFilter = ref('');
const drawerVisible = ref(false);
const modalVisible = ref(false);
const selectedProject = ref<Project | null>(null);
const editingProject = ref<Project | null>(null);

// 模拟项目数据
const projects = ref<Project[]>([
  {
    id: '1',
    name: '用户管理模块',
    description: '完善用户管理功能，支持角色权限配置',
    status: ProjectStatus.DEVELOPING,
    branch: 'feature/user-management',
    owner: '张三',
    startTime: '2024-01-10',
    requirementUrl: 'https://example.com/requirement/1',
    uiUrl: 'https://example.com/ui/1',
    progress: 65,
    icon: 'ant-design:user-outlined',
  },
  {
    id: '2',
    name: '报表系统',
    description: '新增数据报表和图表展示功能',
    status: ProjectStatus.TESTING,
    branch: 'feature/report-system',
    owner: '李四',
    startTime: '2024-01-05',
    testTime: '2024-01-20',
    requirementUrl: 'https://example.com/requirement/2',
    progress: 90,
    icon: 'ant-design:bar-chart-outlined',
  },
  {
    id: '3',
    name: '消息通知',
    description: '实现站内消息和邮件通知功能',
    status: ProjectStatus.DEPLOYED,
    branch: 'feature/notification',
    owner: '王五',
    startTime: '2023-12-15',
    testTime: '2024-01-08',
    releaseTime: '2024-01-12',
    progress: 100,
    icon: 'ant-design:notification-outlined',
  },
  {
    id: '4',
    name: '文件管理',
    description: '优化文件上传下载和在线预览功能',
    status: ProjectStatus.PLANNING,
    branch: 'feature/file-management',
    owner: '赵六',
    startTime: '2024-01-25',
    requirementUrl: 'https://example.com/requirement/4',
    uiUrl: 'https://example.com/ui/4',
    progress: 15,
    icon: 'ant-design:file-outlined',
  },
]);

/**
 * 过滤后的项目列表
 */
const filteredProjects = computed(() => {
  let result = projects.value;

  // 按名称搜索
  if (searchText.value) {
    result = result.filter(project =>
      project.name.toLowerCase().includes(searchText.value.toLowerCase())
    );
  }

  // 按状态过滤
  if (statusFilter.value) {
    result = result.filter(project => project.status === statusFilter.value);
  }

  return result;
});

/**
 * 获取状态颜色
 */
const getStatusColor = (status: ProjectStatus) => {
  return projectStatusConfig[status]?.color || 'default';
};

/**
 * 获取状态文本
 */
const getStatusText = (status: ProjectStatus) => {
  return projectStatusConfig[status]?.text || status;
};

/**
 * 处理搜索
 */
const handleSearch = (value: string) => {
  searchText.value = value;
};

/**
 * 处理状态过滤
 */
const handleStatusFilter = () => {
  // 过滤逻辑在computed中处理
};

/**
 * 处理项目点击
 */
const handleProjectClick = (project: Project) => {
  selectedProject.value = project;
  drawerVisible.value = true;
};

/**
 * 处理新建项目
 */
const handleAddProject = () => {
  editingProject.value = null;
  modalVisible.value = true;
};

/**
 * 处理编辑项目
 */
const handleEditProject = (project: Project) => {
  editingProject.value = project;
  modalVisible.value = true;
};

/**
 * 处理项目配置
 */
const handleProjectConfig = (project: Project) => {
  // TODO: 跳转到项目配置页面
  message.info(`配置项目: ${project.name}`);
};

/**
 * 处理删除项目
 */
const handleDeleteProject = (project: Project) => {
  // TODO: 实现删除逻辑
  message.warning(`删除项目: ${project.name}`);
};

/**
 * 处理项目更新
 */
const handleProjectUpdate = (updatedProject: Project) => {
  const index = projects.value.findIndex(p => p.id === updatedProject.id);
  if (index !== -1) {
    projects.value[index] = updatedProject;
  }
};

/**
 * 处理弹窗成功
 */
const handleModalSuccess = () => {
  modalVisible.value = false;
  // TODO: 重新加载项目列表
  loadProjects();
};

/**
 * 加载项目列表
 */
const loadProjects = async () => {
  // TODO: 调用API获取项目列表
  console.log('Loading projects for app:', props.appId);
};

onMounted(() => {
  loadProjects();
});
</script>

<style lang="less" scoped>
.project-list {
  .action-bar {
    margin-bottom: 24px;
    padding: 16px;
    background: #fafafa;
    border-radius: 6px;
  }

  .project-cards {
    .project-card {
      height: 100%;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .project-cover {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .project-info {
        margin-top: 16px;

        .info-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          font-size: 12px;

          .label {
            min-width: 60px;
            color: #666;
            font-weight: 500;
          }

          a {
            color: #1890ff;
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }

        .progress-info {
          margin-top: 12px;

          .label {
            display: block;
            margin-bottom: 4px;
            color: #666;
            font-size: 12px;
            font-weight: 500;
          }
        }
      }
    }
  }
}
</style>