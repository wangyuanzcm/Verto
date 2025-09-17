<template>
  <div class="requirement-detail">
    <!-- 页面头部 -->
    <div class="mb-6">
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <Button @click="handleBack">
            <template #icon>
              <VbenIcon icon="lucide:arrow-left" />
            </template>
            返回列表
          </Button>
          <div>
            <h1 class="mb-1 text-2xl font-bold text-gray-900">
              {{ requirementDetail.title }}
            </h1>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span>ID: {{ requirementDetail.id }}</span>
              <Divider type="vertical" />
              <span>创建时间: {{ requirementDetail.createTime }}</span>
              <Divider type="vertical" />
              <span>更新时间: {{ requirementDetail.updateTime }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Button @click="handleFavorite">
            <template #icon>
              <VbenIcon
                :icon="isFavorited ? 'lucide:heart' : 'lucide:heart'"
                :class="isFavorited ? 'text-red-500' : ''"
              />
            </template>
            {{ isFavorited ? '已收藏' : '收藏' }}
          </Button>
          <Button @click="handleCopy">
            <template #icon>
              <VbenIcon icon="lucide:copy" />
            </template>
            复制需求
          </Button>
          <Button type="primary" @click="handleEdit">
            <template #icon>
              <VbenIcon icon="lucide:edit" />
            </template>
            编辑需求
          </Button>
          <Dropdown>
            <Button>
              <template #icon>
                <VbenIcon icon="lucide:more-horizontal" />
              </template>
            </Button>
            <template #overlay>
              <Menu>
                <MenuItem @click="handleExport">
                  <VbenIcon icon="lucide:download" class="mr-2" />
                  导出需求
                </MenuItem>
                <MenuItem @click="handleShare">
                  <VbenIcon icon="lucide:share" class="mr-2" />
                  分享需求
                </MenuItem>
                <MenuDivider />
                <MenuItem @click="handleDelete" danger>
                  <VbenIcon icon="lucide:trash-2" class="mr-2" />
                  删除需求
                </MenuItem>
              </Menu>
            </template>
          </Dropdown>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- 主要内容区域 -->
      <div class="space-y-6 lg:col-span-2">
        <!-- 基本信息 -->
        <Card title="基本信息">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >需求类型</label
              >
              <Tag :color="getTypeColor(requirementDetail.type)">
                {{ getTypeLabel(requirementDetail.type) }}
              </Tag>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >优先级</label
              >
              <Tag :color="getPriorityColor(requirementDetail.priority)">
                {{ getPriorityLabel(requirementDetail.priority) }}
              </Tag>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >状态</label
              >
              <Tag :color="getStatusColor(requirementDetail.status)">
                {{ getStatusLabel(requirementDetail.status) }}
              </Tag>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >评审状态</label
              >
              <Tag
                v-if="requirementDetail.reviewStatus"
                :color="getReviewStatusColor(requirementDetail.reviewStatus)"
              >
                {{ getReviewStatusLabel(requirementDetail.reviewStatus) }}
              </Tag>
              <span v-else class="text-gray-400">未评审</span>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >指派人</label
              >
              <div
                v-if="requirementDetail.assignee"
                class="flex items-center gap-2"
              >
                <Avatar size="small">{{
                  requirementDetail.assignee[0]
                }}</Avatar>
                <span>{{ requirementDetail.assignee }}</span>
              </div>
              <span v-else class="text-gray-400">未指派</span>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >报告人</label
              >
              <div class="flex items-center gap-2">
                <Avatar size="small">{{
                  requirementDetail.reporter[0]
                }}</Avatar>
                <span>{{ requirementDetail.reporter }}</span>
              </div>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >所属项目</label
              >
              <span v-if="requirementDetail.projectName">{{
                requirementDetail.projectName
              }}</span>
              <span v-else class="text-gray-400">未关联</span>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >截止日期</label
              >
              <span
                v-if="requirementDetail.dueDate"
                :class="
                  isOverdue ? 'font-medium text-red-500' : 'text-gray-600'
                "
              >
                {{ requirementDetail.dueDate }}
              </span>
              <span v-else class="text-gray-400">未设置</span>
            </div>
          </div>
        </Card>

        <!-- 需求描述 -->
        <Card title="需求描述">
          <div class="prose max-w-none">
            <div
              v-html="requirementDetail.description"
              class="whitespace-pre-wrap"
            ></div>
          </div>
        </Card>

        <!-- 验收标准 -->
        <Card title="验收标准">
          <div v-if="requirementDetail.acceptanceCriteria" class="space-y-2">
            <div
              v-for="(criteria, index) in requirementDetail.acceptanceCriteria"
              :key="index"
              class="flex items-start gap-2"
            >
              <VbenIcon
                icon="lucide:check-circle"
                class="mt-1 flex-shrink-0 text-green-500"
              />
              <span>{{ criteria }}</span>
            </div>
          </div>
          <Empty v-else description="暂无验收标准" />
        </Card>

        <!-- 附件 -->
        <Card title="附件">
          <div v-if="requirementDetail.attachments?.length" class="space-y-2">
            <div
              v-for="attachment in requirementDetail.attachments"
              :key="attachment.id"
              class="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
            >
              <div class="flex items-center gap-3">
                <VbenIcon icon="lucide:file" class="text-gray-400" />
                <div>
                  <div class="font-medium">{{ attachment.name }}</div>
                  <div class="text-sm text-gray-500">
                    {{ attachment.size }} • {{ attachment.uploadTime }}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Button
                  size="small"
                  @click="handlePreviewAttachment(attachment)"
                >
                  <VbenIcon icon="lucide:eye" class="size-4" />
                </Button>
                <Button
                  size="small"
                  @click="handleDownloadAttachment(attachment)"
                >
                  <VbenIcon icon="lucide:download" class="size-4" />
                </Button>
              </div>
            </div>
          </div>
          <Empty v-else description="暂无附件" />
        </Card>

        <!-- 评论区域 -->
        <Card title="评论">
          <div class="space-y-4">
            <!-- 评论输入框 -->
            <div class="rounded-lg border p-4">
              <Textarea
                v-model:value="newComment"
                placeholder="添加评论..."
                :rows="3"
                class="mb-3"
              />
              <div class="flex justify-end">
                <Button
                  type="primary"
                  @click="handleAddComment"
                  :disabled="!newComment.trim()"
                >
                  发表评论
                </Button>
              </div>
            </div>

            <!-- 评论列表 -->
            <div v-if="requirementDetail.comments?.length" class="space-y-4">
              <div
                v-for="comment in requirementDetail.comments"
                :key="comment.id"
                class="border-l-2 border-gray-200 pl-4"
              >
                <div class="mb-2 flex items-center gap-2">
                  <Avatar size="small">{{ comment.author[0] }}</Avatar>
                  <span class="font-medium">{{ comment.author }}</span>
                  <span class="text-sm text-gray-500">{{
                    comment.createTime
                  }}</span>
                </div>
                <div class="whitespace-pre-wrap text-gray-700">
                  {{ comment.content }}
                </div>
              </div>
            </div>
            <Empty v-else description="暂无评论" />
          </div>
        </Card>
      </div>

      <!-- 侧边栏 -->
      <div class="space-y-6">
        <!-- 进度信息 -->
        <Card title="进度信息">
          <div class="space-y-4">
            <div>
              <div class="mb-2 flex items-center justify-between">
                <span class="text-sm font-medium">完成进度</span>
                <span class="text-sm text-gray-500">{{ progress }}%</span>
              </div>
              <Progress
                :percent="progress"
                :stroke-color="getProgressColor(progress)"
              />
            </div>

            <Divider />

            <div class="grid grid-cols-2 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold text-blue-600">
                  {{ requirementDetail.estimatedHours || 0 }}
                </div>
                <div class="text-sm text-gray-500">预估工时</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-green-600">
                  {{ requirementDetail.actualHours || 0 }}
                </div>
                <div class="text-sm text-gray-500">实际工时</div>
              </div>
            </div>
          </div>
        </Card>

        <!-- 相关人员 -->
        <Card title="相关人员">
          <div class="space-y-3">
            <div v-if="requirementDetail.assignee">
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >指派人</label
              >
              <div class="flex items-center gap-2">
                <Avatar size="small">{{
                  requirementDetail.assignee[0]
                }}</Avatar>
                <span>{{ requirementDetail.assignee }}</span>
              </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >报告人</label
              >
              <div class="flex items-center gap-2">
                <Avatar size="small">{{
                  requirementDetail.reporter[0]
                }}</Avatar>
                <span>{{ requirementDetail.reporter }}</span>
              </div>
            </div>

            <div v-if="requirementDetail.reviewers?.length">
              <label class="mb-2 block text-sm font-medium text-gray-700"
                >评审人</label
              >
              <div class="space-y-2">
                <div
                  v-for="reviewer in requirementDetail.reviewers"
                  :key="reviewer"
                  class="flex items-center gap-2"
                >
                  <Avatar size="small">{{ reviewer[0] }}</Avatar>
                  <span>{{ reviewer }}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- 标签 -->
        <Card title="标签">
          <div
            v-if="requirementDetail.tags?.length"
            class="flex flex-wrap gap-2"
          >
            <Tag v-for="tag in requirementDetail.tags" :key="tag" color="blue">
              {{ tag }}
            </Tag>
          </div>
          <Empty v-else description="暂无标签" size="small" />
        </Card>

        <!-- 操作历史 -->
        <Card title="操作历史">
          <Timeline>
            <TimelineItem
              v-for="history in requirementDetail.history"
              :key="history.id"
            >
              <div class="text-sm">
                <div class="font-medium">{{ history.action }}</div>
                <div class="text-gray-500">
                  {{ history.operator }} • {{ history.time }}
                </div>
              </div>
            </TimelineItem>
          </Timeline>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  Button,
  Card,
  Tag,
  Avatar,
  Divider,
  Dropdown,
  Menu,
  MenuItem,
  MenuDivider,
  Empty,
  Textarea,
  Progress,
  Timeline,
  TimelineItem,
  message,
} from 'ant-design-vue';
import { VbenIcon } from '@vben/common-ui';
import {
  requirementTypeOptions,
  priorityOptions,
  statusOptions,
  reviewStatusOptions,
} from './data';

const router = useRouter();
const route = useRoute();

// 响应式数据
const requirementDetail = ref<any>({});
const isFavorited = ref(false);
const newComment = ref('');

/**
 * 获取需求详情数据
 */
const fetchRequirementDetail = async () => {
  const id = route.params.id as string;

  // 模拟API调用
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 模拟数据
  requirementDetail.value = {
    id: id,
    title: 'Vue3 Admin Dashboard 用户权限管理功能',
    description: `## 需求背景\n\n当前系统缺少完善的用户权限管理功能，需要实现基于角色的权限控制系统(RBAC)。\n\n## 功能要求\n\n1. **用户管理**\n   - 用户的增删改查\n   - 用户状态管理（启用/禁用）\n   - 用户密码重置\n\n2. **角色管理**\n   - 角色的增删改查\n   - 角色权限分配\n   - 角色继承关系\n\n3. **权限管理**\n   - 菜单权限控制\n   - 按钮权限控制\n   - 数据权限控制\n\n## 技术要求\n\n- 前端使用Vue3 + TypeScript\n- 后端使用Node.js + Express\n- 数据库使用MySQL\n- 支持权限缓存机制`,
    type: 'feature',
    priority: 'high',
    status: 'developing',
    reviewStatus: 'approved',
    assignee: '张三',
    reporter: '产品经理',
    projectName: 'Vue3 Admin Dashboard',
    estimatedHours: 40,
    actualHours: 25,
    dueDate: '2024-02-15',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:20:00',
    reviewers: ['技术总监', '架构师'],
    tags: ['权限管理', 'RBAC', '用户系统'],
    acceptanceCriteria: [
      '用户可以正常登录和退出系统',
      '管理员可以创建、编辑、删除用户',
      '角色权限分配功能正常工作',
      '权限控制在前端和后端都生效',
      '支持批量操作用户',
      '权限变更后实时生效',
    ],
    attachments: [
      {
        id: '1',
        name: '权限管理原型图.pdf',
        size: '2.5MB',
        uploadTime: '2024-01-15 11:00:00',
      },
      {
        id: '2',
        name: '数据库设计文档.docx',
        size: '1.2MB',
        uploadTime: '2024-01-16 09:30:00',
      },
    ],
    comments: [
      {
        id: '1',
        author: '技术总监',
        content: '需求分析很详细，建议在权限缓存方面考虑使用Redis来提升性能。',
        createTime: '2024-01-16 10:00:00',
      },
      {
        id: '2',
        author: '张三',
        content:
          '好的，我会在技术方案中加入Redis缓存的设计。预计下周可以完成用户管理模块的开发。',
        createTime: '2024-01-16 14:30:00',
      },
    ],
    history: [
      {
        id: '1',
        action: '需求已批准',
        operator: '技术总监',
        time: '2024-01-16 09:00:00',
      },
      {
        id: '2',
        action: '指派给张三',
        operator: '项目经理',
        time: '2024-01-16 09:30:00',
      },
      {
        id: '3',
        action: '状态变更为开发中',
        operator: '张三',
        time: '2024-01-17 10:00:00',
      },
    ],
  };
};

// 计算属性
const progress = computed(() => {
  const status = requirementDetail.value.status;
  switch (status) {
    case 'draft':
      return 0;
    case 'pending':
      return 10;
    case 'approved':
      return 20;
    case 'developing':
      return 60;
    case 'testing':
      return 80;
    case 'completed':
      return 100;
    default:
      return 0;
  }
});

const isOverdue = computed(() => {
  if (
    !requirementDetail.value.dueDate ||
    requirementDetail.value.status === 'completed'
  ) {
    return false;
  }
  const dueDate = new Date(requirementDetail.value.dueDate);
  const now = new Date();
  return dueDate < now;
});

// 获取标签颜色和文本的辅助函数
const getTypeColor = (type: string) => {
  const option = requirementTypeOptions.find((opt) => opt.value === type);
  return option?.color || 'default';
};

const getTypeLabel = (type: string) => {
  const option = requirementTypeOptions.find((opt) => opt.value === type);
  return option?.label || type;
};

const getPriorityColor = (priority: string) => {
  const option = priorityOptions.find((opt) => opt.value === priority);
  return option?.color || 'default';
};

const getPriorityLabel = (priority: string) => {
  const option = priorityOptions.find((opt) => opt.value === priority);
  return option?.label || priority;
};

const getStatusColor = (status: string) => {
  const option = statusOptions.find((opt) => opt.value === status);
  return option?.color || 'default';
};

const getStatusLabel = (status: string) => {
  const option = statusOptions.find((opt) => opt.value === status);
  return option?.label || status;
};

const getReviewStatusColor = (status: string) => {
  const option = reviewStatusOptions.find((opt) => opt.value === status);
  return option?.color || 'default';
};

const getReviewStatusLabel = (status: string) => {
  const option = reviewStatusOptions.find((opt) => opt.value === status);
  return option?.label || status;
};

const getProgressColor = (percent: number) => {
  if (percent < 30) return '#ff4d4f';
  if (percent < 70) return '#faad14';
  return '#52c41a';
};

// 事件处理函数
const handleBack = () => {
  router.push('/requirement/list');
};

const handleEdit = () => {
  router.push(`/requirement/edit/${requirementDetail.value.id}`);
};

const handleFavorite = () => {
  isFavorited.value = !isFavorited.value;
  message.success(isFavorited.value ? '已收藏' : '已取消收藏');
};

const handleCopy = () => {
  // 复制需求逻辑
  message.success('需求已复制');
};

const handleExport = () => {
  // 导出需求逻辑
  message.success('需求导出中...');
};

const handleShare = () => {
  // 分享需求逻辑
  message.success('分享链接已复制到剪贴板');
};

const handleDelete = () => {
  // 删除需求逻辑
  message.success('需求已删除');
  router.push('/requirement/list');
};

const handlePreviewAttachment = (attachment: any) => {
  // 预览附件逻辑
  message.info(`预览附件: ${attachment.name}`);
};

const handleDownloadAttachment = (attachment: any) => {
  // 下载附件逻辑
  message.success(`下载附件: ${attachment.name}`);
};

const handleAddComment = () => {
  if (!newComment.value.trim()) return;

  // 添加评论逻辑
  const comment = {
    id: Date.now().toString(),
    author: '当前用户',
    content: newComment.value,
    createTime: new Date().toLocaleString(),
  };

  requirementDetail.value.comments = requirementDetail.value.comments || [];
  requirementDetail.value.comments.unshift(comment);
  newComment.value = '';

  message.success('评论已添加');
};

// 生命周期
onMounted(() => {
  fetchRequirementDetail();
});
</script>

<style scoped>
.requirement-detail {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

:deep(.ant-card) {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

:deep(.ant-card-head-title) {
  font-weight: 600;
}

:deep(.prose) {
  line-height: 1.6;
}

:deep(.prose h1) {
  font-size: 1.5em;
  font-weight: 600;
  margin-bottom: 0.5em;
}

:deep(.prose h2) {
  font-size: 1.3em;
  font-weight: 600;
  margin-bottom: 0.5em;
  margin-top: 1em;
}

:deep(.prose h3) {
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 0.5em;
  margin-top: 0.8em;
}

:deep(.prose ul) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

:deep(.prose li) {
  margin: 0.25em 0;
}

:deep(.ant-timeline-item-content) {
  margin-left: 16px;
}

:deep(.ant-progress-text) {
  font-weight: 500;
}
</style>
