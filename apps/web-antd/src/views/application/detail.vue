<template>
  <div class="project-detail">
    <Page description="查看项目详细信息" title="项目详情">
      <template #extra>
        <Space>
          <Button @click="onBack"> 返回 </Button>
          <Button type="primary" @click="onEdit"> 编辑 </Button>
        </Space>
      </template>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- 基本信息 -->
        <Card class="lg:col-span-2" title="基本信息">
          <Descriptions :column="2" bordered>
            <DescriptionsItem label="项目名称">
              {{ projectData?.name }}
            </DescriptionsItem>
            <DescriptionsItem label="状态">
              <Tag :color="getStatusColor(projectData?.status)">
                {{ getStatusText(projectData?.status) }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem label="项目描述" :span="2">
              {{ projectData?.description }}
            </DescriptionsItem>
            <DescriptionsItem label="创建者">
              {{ projectData?.creator }}
            </DescriptionsItem>
            <DescriptionsItem label="创建时间">
              {{ projectData?.createTime }}
            </DescriptionsItem>
            <DescriptionsItem label="更新时间">
              {{ projectData?.updateTime }}
            </DescriptionsItem>
            <DescriptionsItem label="版本">
              {{ projectData?.version }}
            </DescriptionsItem>
            <DescriptionsItem label="模板">
              {{ projectData?.template }}
            </DescriptionsItem>
            <DescriptionsItem label="可见性">
              <Tag
                :color="
                  projectData?.visibility === 'public' ? 'green' : 'orange'
                "
              >
                {{ projectData?.visibility === 'public' ? '公开' : '私有' }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem label="优先级">
              <Tag :color="getPriorityColor(projectData?.priority)">
                {{ getPriorityText(projectData?.priority) }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem label="团队规模">
              {{ projectData?.teamSize }} 人
            </DescriptionsItem>
            <DescriptionsItem label="预算">
              ¥{{ projectData?.budget?.toLocaleString() }}
            </DescriptionsItem>
            <DescriptionsItem label="开始日期">
              {{ projectData?.startDate }}
            </DescriptionsItem>
            <DescriptionsItem label="结束日期">
              {{ projectData?.endDate }}
            </DescriptionsItem>
          </Descriptions>
        </Card>

        <!-- 项目统计 -->
        <Card title="项目统计">
          <div class="space-y-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">
                {{ projectData?.progress || 0 }}%
              </div>
              <div class="text-gray-500">完成进度</div>
              <Progress :percent="projectData?.progress || 0" class="mt-2" />
            </div>

            <Divider />

            <div class="grid grid-cols-2 gap-4 text-center">
              <div>
                <div class="text-lg font-semibold text-green-600">
                  {{ projectData?.completedTasks || 0 }}
                </div>
                <div class="text-sm text-gray-500">已完成任务</div>
              </div>
              <div>
                <div class="text-lg font-semibold text-orange-600">
                  {{ projectData?.totalTasks || 0 }}
                </div>
                <div class="text-sm text-gray-500">总任务数</div>
              </div>
              <div>
                <div class="text-lg font-semibold text-blue-600">
                  {{ projectData?.activeDays || 0 }}
                </div>
                <div class="text-sm text-gray-500">活跃天数</div>
              </div>
              <div>
                <div class="text-lg font-semibold text-purple-600">
                  {{ projectData?.commits || 0 }}
                </div>
                <div class="text-sm text-gray-500">代码提交</div>
              </div>
            </div>
          </div>
        </Card>

        <!-- 技术栈 -->
        <Card title="技术栈">
          <div class="space-y-2">
            <Tag
              v-for="tech in projectData?.technologies"
              :key="tech"
              color="blue"
            >
              {{ tech }}
            </Tag>
          </div>
        </Card>

        <!-- 项目特性 -->
        <Card title="项目特性">
          <div class="space-y-2">
            <div
              v-for="feature in projectData?.features"
              :key="feature"
              class="flex items-center space-x-2"
            >
              <CheckCircleOutlined class="text-green-500" />
              <span>{{ feature }}</span>
            </div>
          </div>
        </Card>

        <!-- 项目链接 -->
        <Card title="项目链接">
          <div class="space-y-3">
            <div v-if="projectData?.repository">
              <div class="mb-1 text-sm text-gray-500">代码仓库</div>
              <a
                :href="projectData.repository"
                target="_blank"
                class="text-blue-600 hover:text-blue-800"
              >
                {{ projectData.repository }}
              </a>
            </div>
            <div v-if="projectData?.homepage">
              <div class="mb-1 text-sm text-gray-500">项目主页</div>
              <a
                :href="projectData.homepage"
                target="_blank"
                class="text-blue-600 hover:text-blue-800"
              >
                {{ projectData.homepage }}
              </a>
            </div>
            <div v-if="projectData?.documentation">
              <div class="mb-1 text-sm text-gray-500">项目文档</div>
              <a
                :href="projectData.documentation"
                target="_blank"
                class="text-blue-600 hover:text-blue-800"
              >
                {{ projectData.documentation }}
              </a>
            </div>
          </div>
        </Card>

        <!-- 项目备注 -->
        <Card v-if="projectData?.notes" class="lg:col-span-3" title="项目备注">
          <div class="whitespace-pre-wrap">{{ projectData.notes }}</div>
        </Card>
      </div>
    </Page>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { CheckCircleOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Divider,
  Progress,
  Space,
  Tag,
} from 'ant-design-vue';

/**
 * 项目详情页面组件
 * 显示项目的详细信息
 */

interface ProjectDetailData {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  creator: string;
  createTime: string;
  updateTime: string;
  template: string;
  version: string;
  visibility: 'public' | 'private';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  teamSize: number;
  budget: number;
  startDate: string;
  endDate: string;
  technologies: string[];
  features: string[];
  repository?: string;
  homepage?: string;
  documentation?: string;
  notes?: string;
  progress: number;
  completedTasks: number;
  totalTasks: number;
  activeDays: number;
  commits: number;
}

const route = useRoute();
const router = useRouter();
const projectData = ref<ProjectDetailData>();

/**
 * 获取项目详情
 * @param id 项目ID
 * @returns 项目详情数据
 */
const getProjectDetail = async (id: string): Promise<ProjectDetailData> => {
  // 模拟API调用
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 模拟返回数据
  return {
    id,
    name: 'Vue3 Admin Dashboard',
    description:
      '基于Vue3的现代化管理后台系统，提供完整的权限管理、数据可视化、多语言支持等功能。采用最新的前端技术栈，具有良好的可扩展性和维护性。',
    status: 'active',
    creator: '张三',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:20:00',
    template: 'Vue3 + TypeScript',
    version: '1.2.0',
    visibility: 'public',
    priority: 'high',
    teamSize: 5,
    budget: 50000,
    startDate: '2024-01-15',
    endDate: '2024-04-15',
    technologies: [
      'Vue3',
      'TypeScript',
      'Vite',
      'Pinia',
      'Ant Design Vue',
      'TailwindCSS',
    ],
    features: [
      '权限管理',
      '数据可视化',
      '多语言支持',
      '主题切换',
      '响应式设计',
      '代码生成',
    ],
    repository: 'https://github.com/example/vue3-admin',
    homepage: 'https://vue3-admin.example.com',
    documentation: 'https://docs.vue3-admin.example.com',
    notes:
      '这是一个重要的项目，需要按时完成。项目采用敏捷开发模式，每两周进行一次迭代。',
    progress: 75,
    completedTasks: 45,
    totalTasks: 60,
    activeDays: 35,
    commits: 128,
  };
};

/**
 * 获取状态颜色
 * @param status 状态
 * @returns 颜色
 */
function getStatusColor(status?: string) {
  switch (status) {
    case 'active':
      return 'green';
    case 'inactive':
      return 'orange';
    case 'archived':
      return 'red';
    default:
      return 'default';
  }
}

/**
 * 获取状态文本
 * @param status 状态
 * @returns 状态文本
 */
function getStatusText(status?: string) {
  switch (status) {
    case 'active':
      return '活跃';
    case 'inactive':
      return '非活跃';
    case 'archived':
      return '已归档';
    default:
      return '未知';
  }
}

/**
 * 获取优先级颜色
 * @param priority 优先级
 * @returns 颜色
 */
function getPriorityColor(priority?: string) {
  switch (priority) {
    case 'urgent':
      return 'red';
    case 'high':
      return 'orange';
    case 'medium':
      return 'blue';
    case 'low':
      return 'green';
    default:
      return 'default';
  }
}

/**
 * 获取优先级文本
 * @param priority 优先级
 * @returns 优先级文本
 */
function getPriorityText(priority?: string) {
  switch (priority) {
    case 'urgent':
      return '紧急';
    case 'high':
      return '高';
    case 'medium':
      return '中';
    case 'low':
      return '低';
    default:
      return '未知';
  }
}

/**
 * 返回上一页
 */
function onBack() {
  router.back();
}

/**
 * 编辑项目
 */
function onEdit() {
  router.push(`/project/edit/${route.params.id}`);
}

/**
 * 初始化数据
 */
onMounted(async () => {
  try {
    projectData.value = await getProjectDetail(route.params.id as string);
  } catch (error) {
    console.error('获取项目详情失败:', error);
  }
});
</script>

<style scoped>
.project-detail {
  height: 100%;
}
</style>
