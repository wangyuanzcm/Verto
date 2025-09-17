<template>
  <div class="project-pipeline">
    <Page description="管理项目的CI/CD流水线" title="项目流水线">
      <template #extra>
        <Space>
          <Button @click="onRefresh">
            <template #icon>
              <ReloadOutlined />
            </template>
            刷新
          </Button>
          <Button type="primary" @click="onCreatePipeline">
            <template #icon>
              <Plus class="size-4" />
            </template>
            创建流水线
          </Button>
        </Space>
      </template>

      <!-- 项目选择 -->
      <Card class="mb-6">
        <div class="flex items-center space-x-4">
          <span class="text-sm font-medium">选择项目：</span>
          <Select
            v-model:value="selectedProject"
            placeholder="请选择项目"
            class="w-64"
            @change="onProjectChange"
          >
            <SelectOption
              v-for="project in projects"
              :key="project.id"
              :value="project.id"
            >
              {{ project.name }}
            </SelectOption>
          </Select>
        </div>
      </Card>

      <!-- 流水线列表 -->
      <div v-if="selectedProject" class="space-y-6">
        <Card
          v-for="pipeline in pipelines"
          :key="pipeline.id"
          class="pipeline-card"
        >
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="flex items-center space-x-2">
                <component
                  :is="getPipelineIcon(pipeline.status)"
                  :class="getPipelineIconClass(pipeline.status)"
                />
                <h3 class="text-lg font-semibold">{{ pipeline.name }}</h3>
              </div>
              <Tag :color="getStatusColor(pipeline.status)">
                {{ getStatusText(pipeline.status) }}
              </Tag>
            </div>

            <div class="flex items-center space-x-2">
              <Tooltip title="查看详情">
                <Button
                  type="text"
                  size="small"
                  @click="onViewPipeline(pipeline)"
                >
                  <EyeOutlined />
                </Button>
              </Tooltip>
              <Tooltip title="编辑">
                <Button
                  type="text"
                  size="small"
                  @click="onEditPipeline(pipeline)"
                >
                  <EditOutlined />
                </Button>
              </Tooltip>
              <Tooltip title="运行">
                <Button
                  type="text"
                  size="small"
                  :disabled="pipeline.status === 'running'"
                  @click="onRunPipeline(pipeline)"
                >
                  <PlayCircleOutlined />
                </Button>
              </Tooltip>
              <Tooltip title="停止">
                <Button
                  type="text"
                  size="small"
                  danger
                  :disabled="pipeline.status !== 'running'"
                  @click="onStopPipeline(pipeline)"
                >
                  <StopOutlined />
                </Button>
              </Tooltip>
            </div>
          </div>

          <div class="mb-4">
            <p class="mb-2 text-gray-600">{{ pipeline.description }}</p>
            <div class="flex items-center space-x-4 text-sm text-gray-500">
              <span>分支: {{ pipeline.branch }}</span>
              <span>触发器: {{ pipeline.trigger }}</span>
              <span>最后运行: {{ pipeline.lastRun }}</span>
              <span>持续时间: {{ pipeline.duration }}</span>
            </div>
          </div>

          <!-- 流水线步骤 -->
          <div class="pipeline-steps">
            <div class="flex items-center space-x-2 overflow-x-auto pb-2">
              <div
                v-for="(step, index) in pipeline.steps"
                :key="step.id"
                class="flex flex-shrink-0 items-center space-x-2"
              >
                <div
                  class="step-item flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white"
                  :class="getStepClass(step.status)"
                >
                  <component :is="getStepIcon(step.status)" class="h-4 w-4" />
                </div>
                <span class="text-sm font-medium">{{ step.name }}</span>
                <div
                  v-if="index < pipeline.steps.length - 1"
                  class="h-0.5 w-8 bg-gray-300"
                ></div>
              </div>
            </div>
          </div>

          <!-- 进度条 -->
          <div v-if="pipeline.status === 'running'" class="mt-4">
            <Progress
              :percent="pipeline.progress"
              :status="pipeline.progress === 100 ? 'success' : 'active'"
            />
          </div>
        </Card>
      </div>

      <!-- 空状态 -->
      <Empty v-else description="请先选择一个项目" class="mt-8" />
    </Page>

    <!-- 流水线详情抽屉 -->
    <Drawer v-model:open="drawerVisible" title="流水线详情" width="800">
      <div v-if="selectedPipeline" class="space-y-6">
        <!-- 基本信息 -->
        <div>
          <h3 class="mb-3 text-lg font-semibold">
            {{ selectedPipeline.name }}
          </h3>
          <Descriptions :column="2" bordered>
            <DescriptionsItem label="状态">
              <Tag :color="getStatusColor(selectedPipeline.status)">
                {{ getStatusText(selectedPipeline.status) }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem label="分支">
              {{ selectedPipeline.branch }}
            </DescriptionsItem>
            <DescriptionsItem label="触发器">
              {{ selectedPipeline.trigger }}
            </DescriptionsItem>
            <DescriptionsItem label="最后运行">
              {{ selectedPipeline.lastRun }}
            </DescriptionsItem>
            <DescriptionsItem label="持续时间">
              {{ selectedPipeline.duration }}
            </DescriptionsItem>
            <DescriptionsItem label="成功率">
              {{ selectedPipeline.successRate }}%
            </DescriptionsItem>
          </Descriptions>
        </div>

        <!-- 步骤详情 -->
        <div>
          <h4 class="mb-3 font-medium">执行步骤</h4>
          <Timeline>
            <TimelineItem
              v-for="step in selectedPipeline.steps"
              :key="step.id"
              :color="getStepColor(step.status)"
            >
              <template #dot>
                <component :is="getStepIcon(step.status)" class="h-4 w-4" />
              </template>
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium">{{ step.name }}</div>
                  <div class="text-sm text-gray-500">
                    {{ step.description }}
                  </div>
                  <div class="text-xs text-gray-400">
                    耗时: {{ step.duration }}
                  </div>
                </div>
                <Tag :color="getStepColor(step.status)">
                  {{ getStepStatusText(step.status) }}
                </Tag>
              </div>
            </TimelineItem>
          </Timeline>
        </div>

        <!-- 日志 -->
        <div>
          <h4 class="mb-3 font-medium">执行日志</h4>
          <div
            class="max-h-64 overflow-y-auto rounded bg-gray-900 p-4 font-mono text-sm text-green-400"
          >
            <div v-for="(log, index) in selectedPipeline.logs" :key="index">
              {{ log }}
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  StopOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Empty,
  Progress,
  Select,
  SelectOption,
  Space,
  Tag,
  Timeline,
  TimelineItem,
  Tooltip,
} from 'ant-design-vue';

/**
 * 项目流水线页面组件
 * 管理项目的CI/CD流水线
 */

interface Project {
  id: string;
  name: string;
}

interface PipelineStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  duration: string;
}

interface Pipeline {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'success' | 'failed' | 'cancelled';
  branch: string;
  trigger: string;
  lastRun: string;
  duration: string;
  progress: number;
  successRate: number;
  steps: PipelineStep[];
  logs: string[];
}

// 响应式数据
const projects = ref<Project[]>([]);
const pipelines = ref<Pipeline[]>([]);
const selectedProject = ref<string>();
const drawerVisible = ref(false);
const selectedPipeline = ref<Pipeline>();

/**
 * 获取项目列表
 * @returns 项目列表
 */
const getProjects = async (): Promise<Project[]> => {
  // 模拟API调用
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    { id: 'proj_001', name: 'Vue3 Admin Dashboard' },
    { id: 'proj_002', name: 'React E-commerce' },
    { id: 'proj_003', name: 'Vue3 Blog System' },
  ];
};

/**
 * 获取流水线列表
 * @param projectId 项目ID
 * @returns 流水线列表
 */
const getPipelines = async (projectId: string): Promise<Pipeline[]> => {
  // 模拟API调用
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      id: 'pipeline_001',
      name: '主分支部署',
      description: '主分支代码的自动构建和部署流水线',
      status: 'success',
      branch: 'main',
      trigger: 'Push',
      lastRun: '2024-01-20 14:30:00',
      duration: '5分32秒',
      progress: 100,
      successRate: 95,
      steps: [
        {
          id: 'step_001',
          name: '代码检出',
          description: '从Git仓库检出代码',
          status: 'success',
          duration: '30秒',
        },
        {
          id: 'step_002',
          name: '依赖安装',
          description: '安装项目依赖',
          status: 'success',
          duration: '2分15秒',
        },
        {
          id: 'step_003',
          name: '代码构建',
          description: '编译和打包代码',
          status: 'success',
          duration: '1分45秒',
        },
        {
          id: 'step_004',
          name: '单元测试',
          description: '运行单元测试',
          status: 'success',
          duration: '45秒',
        },
        {
          id: 'step_005',
          name: '部署',
          description: '部署到生产环境',
          status: 'success',
          duration: '17秒',
        },
      ],
      logs: [
        '[2024-01-20 14:30:00] 开始执行流水线...',
        '[2024-01-20 14:30:05] 正在检出代码...',
        '[2024-01-20 14:30:35] 代码检出完成',
        '[2024-01-20 14:30:36] 正在安装依赖...',
        '[2024-01-20 14:32:51] 依赖安装完成',
        '[2024-01-20 14:32:52] 正在构建代码...',
        '[2024-01-20 14:34:37] 代码构建完成',
        '[2024-01-20 14:34:38] 正在运行测试...',
        '[2024-01-20 14:35:23] 测试通过',
        '[2024-01-20 14:35:24] 正在部署...',
        '[2024-01-20 14:35:41] 部署完成',
        '[2024-01-20 14:35:42] 流水线执行成功',
      ],
    },
    {
      id: 'pipeline_002',
      name: '开发分支测试',
      description: '开发分支的自动测试流水线',
      status: 'running',
      branch: 'develop',
      trigger: 'Pull Request',
      lastRun: '2024-01-20 15:45:00',
      duration: '3分12秒',
      progress: 60,
      successRate: 88,
      steps: [
        {
          id: 'step_001',
          name: '代码检出',
          description: '从Git仓库检出代码',
          status: 'success',
          duration: '25秒',
        },
        {
          id: 'step_002',
          name: '依赖安装',
          description: '安装项目依赖',
          status: 'success',
          duration: '1分58秒',
        },
        {
          id: 'step_003',
          name: '代码检查',
          description: '运行ESLint和Prettier',
          status: 'running',
          duration: '49秒',
        },
        {
          id: 'step_004',
          name: '单元测试',
          description: '运行单元测试',
          status: 'pending',
          duration: '-',
        },
        {
          id: 'step_005',
          name: '集成测试',
          description: '运行集成测试',
          status: 'pending',
          duration: '-',
        },
      ],
      logs: [
        '[2024-01-20 15:45:00] 开始执行流水线...',
        '[2024-01-20 15:45:05] 正在检出代码...',
        '[2024-01-20 15:45:30] 代码检出完成',
        '[2024-01-20 15:45:31] 正在安装依赖...',
        '[2024-01-20 15:47:29] 依赖安装完成',
        '[2024-01-20 15:47:30] 正在进行代码检查...',
      ],
    },
  ];
};

/**
 * 获取流水线图标
 * @param status 状态
 * @returns 图标组件
 */
function getPipelineIcon(status: string) {
  switch (status) {
    case 'running':
      return LoadingOutlined;
    case 'success':
      return CheckCircleOutlined;
    case 'failed':
      return CloseCircleOutlined;
    case 'cancelled':
      return ExclamationCircleOutlined;
    default:
      return ClockCircleOutlined;
  }
}

/**
 * 获取流水线图标样式
 * @param status 状态
 * @returns 样式类名
 */
function getPipelineIconClass(status: string) {
  switch (status) {
    case 'running':
      return 'text-blue-500';
    case 'success':
      return 'text-green-500';
    case 'failed':
      return 'text-red-500';
    case 'cancelled':
      return 'text-orange-500';
    default:
      return 'text-gray-500';
  }
}

/**
 * 获取状态颜色
 * @param status 状态
 * @returns 颜色
 */
function getStatusColor(status: string) {
  switch (status) {
    case 'running':
      return 'blue';
    case 'success':
      return 'green';
    case 'failed':
      return 'red';
    case 'cancelled':
      return 'orange';
    default:
      return 'default';
  }
}

/**
 * 获取状态文本
 * @param status 状态
 * @returns 状态文本
 */
function getStatusText(status: string) {
  switch (status) {
    case 'idle':
      return '空闲';
    case 'running':
      return '运行中';
    case 'success':
      return '成功';
    case 'failed':
      return '失败';
    case 'cancelled':
      return '已取消';
    default:
      return '未知';
  }
}

/**
 * 获取步骤样式
 * @param status 状态
 * @returns 样式类名
 */
function getStepClass(status: string) {
  switch (status) {
    case 'running':
      return 'bg-blue-500';
    case 'success':
      return 'bg-green-500';
    case 'failed':
      return 'bg-red-500';
    case 'skipped':
      return 'bg-orange-500';
    default:
      return 'bg-gray-400';
  }
}

/**
 * 获取步骤图标
 * @param status 状态
 * @returns 图标组件
 */
function getStepIcon(status: string) {
  switch (status) {
    case 'running':
      return LoadingOutlined;
    case 'success':
      return CheckCircleOutlined;
    case 'failed':
      return CloseCircleOutlined;
    case 'skipped':
      return ExclamationCircleOutlined;
    default:
      return ClockCircleOutlined;
  }
}

/**
 * 获取步骤颜色
 * @param status 状态
 * @returns 颜色
 */
function getStepColor(status: string) {
  switch (status) {
    case 'running':
      return 'blue';
    case 'success':
      return 'green';
    case 'failed':
      return 'red';
    case 'skipped':
      return 'orange';
    default:
      return 'gray';
  }
}

/**
 * 获取步骤状态文本
 * @param status 状态
 * @returns 状态文本
 */
function getStepStatusText(status: string) {
  switch (status) {
    case 'pending':
      return '等待中';
    case 'running':
      return '运行中';
    case 'success':
      return '成功';
    case 'failed':
      return '失败';
    case 'skipped':
      return '跳过';
    default:
      return '未知';
  }
}

/**
 * 项目变更处理
 */
async function onProjectChange() {
  if (selectedProject.value) {
    try {
      pipelines.value = await getPipelines(selectedProject.value);
    } catch (error) {
      console.error('获取流水线列表失败:', error);
    }
  }
}

/**
 * 刷新数据
 */
async function onRefresh() {
  if (selectedProject.value) {
    await onProjectChange();
  }
}

/**
 * 查看流水线详情
 * @param pipeline 流水线数据
 */
function onViewPipeline(pipeline: Pipeline) {
  selectedPipeline.value = pipeline;
  drawerVisible.value = true;
}

/**
 * 编辑流水线
 * @param pipeline 流水线数据
 */
function onEditPipeline(pipeline: Pipeline) {
  console.log('编辑流水线:', pipeline.name);
}

/**
 * 运行流水线
 * @param pipeline 流水线数据
 */
function onRunPipeline(pipeline: Pipeline) {
  console.log('运行流水线:', pipeline.name);
  // 这里可以调用API启动流水线
}

/**
 * 停止流水线
 * @param pipeline 流水线数据
 */
function onStopPipeline(pipeline: Pipeline) {
  console.log('停止流水线:', pipeline.name);
  // 这里可以调用API停止流水线
}

/**
 * 创建流水线
 */
function onCreatePipeline() {
  console.log('创建新流水线');
  // 这里可以打开创建流水线的弹窗或页面
}

/**
 * 初始化数据
 */
onMounted(async () => {
  try {
    projects.value = await getProjects();
  } catch (error) {
    console.error('获取项目列表失败:', error);
  }
});
</script>

<style scoped>
.project-pipeline {
  height: 100%;
}

.pipeline-card {
  transition: all 0.3s ease;
}

.pipeline-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pipeline-steps {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.step-item {
  transition: all 0.3s ease;
}
</style>
