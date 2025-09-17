<template>
  <div class="requirement-edit">
    <!-- 页面头部 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <Button @click="handleBack">
            <template #icon>
              <VbenIcon icon="lucide:arrow-left" />
            </template>
            返回详情
          </Button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">编辑需求</h1>
            <p class="mt-1 text-gray-500">
              ID: {{ requirementId }} • 最后更新: {{ lastUpdateTime }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Button @click="handleSaveDraft">
            <template #icon>
              <VbenIcon icon="lucide:save" />
            </template>
            保存草稿
          </Button>
          <Button @click="handlePreview">
            <template #icon>
              <VbenIcon icon="lucide:eye" />
            </template>
            预览
          </Button>
          <Button type="primary" @click="handleSubmit" :loading="submitting">
            <template #icon>
              <VbenIcon icon="lucide:check" />
            </template>
            保存更改
          </Button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- 主要表单区域 -->
      <div class="space-y-6 lg:col-span-2">
        <!-- 基本信息 -->
        <Card title="基本信息">
          <RequirementForm
            ref="formRef"
            :form-data="formData"
            :is-edit="true"
            @submit="handleFormSubmit"
            @values-change="handleFormValuesChange"
          />
        </Card>

        <!-- 变更记录 -->
        <Card title="变更记录">
          <div v-if="changeHistory.length" class="space-y-4">
            <Timeline>
              <TimelineItem v-for="change in changeHistory" :key="change.id">
                <div class="text-sm">
                  <div class="mb-1 flex items-center justify-between">
                    <span class="font-medium">{{ change.field }}</span>
                    <span class="text-gray-500">{{ change.time }}</span>
                  </div>
                  <div class="text-gray-600">
                    <span class="text-red-500">{{ change.oldValue }}</span>
                    <VbenIcon icon="lucide:arrow-right" class="mx-2" />
                    <span class="text-green-500">{{ change.newValue }}</span>
                  </div>
                  <div class="mt-1 text-gray-500">by {{ change.operator }}</div>
                </div>
              </TimelineItem>
            </Timeline>
          </div>
          <Empty v-else description="暂无变更记录" />
        </Card>
      </div>

      <!-- 侧边栏 -->
      <div class="space-y-6">
        <!-- 编辑状态 -->
        <Card title="编辑状态">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">当前状态</span>
              <Tag :color="getStatusColor(currentStatus)">{{
                getStatusLabel(currentStatus)
              }}</Tag>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">编辑权限</span>
              <Tag color="green">可编辑</Tag>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">锁定状态</span>
              <Tag :color="isLocked ? 'red' : 'default'">
                {{ isLocked ? '已锁定' : '未锁定' }}
              </Tag>
            </div>

            <Divider />

            <div class="text-xs text-gray-500">
              <div>创建时间: {{ createTime }}</div>
              <div>最后编辑: {{ lastEditTime }}</div>
              <div>编辑次数: {{ editCount }} 次</div>
            </div>
          </div>
        </Card>

        <!-- 快速操作 -->
        <Card title="快速操作">
          <div class="space-y-2">
            <Button block @click="handleResetForm">
              <template #icon>
                <VbenIcon icon="lucide:rotate-ccw" />
              </template>
              重置表单
            </Button>

            <Button block @click="handleRestoreVersion">
              <template #icon>
                <VbenIcon icon="lucide:history" />
              </template>
              恢复版本
            </Button>

            <Button block @click="handleDuplicate">
              <template #icon>
                <VbenIcon icon="lucide:copy" />
              </template>
              复制为新需求
            </Button>

            <Button block danger @click="handleDelete">
              <template #icon>
                <VbenIcon icon="lucide:trash-2" />
              </template>
              删除需求
            </Button>
          </div>
        </Card>

        <!-- 版本历史 -->
        <Card title="版本历史">
          <div class="space-y-2">
            <div
              v-for="version in versionHistory"
              :key="version.id"
              class="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-gray-50"
              :class="{
                'border-blue-300 bg-blue-50': version.id === currentVersion,
              }"
              @click="handleSelectVersion(version)"
            >
              <div class="mb-1 flex items-center justify-between">
                <span class="text-sm font-medium">v{{ version.version }}</span>
                <span class="text-xs text-gray-500">{{ version.time }}</span>
              </div>
              <div class="text-xs text-gray-600">{{ version.description }}</div>
              <div class="mt-1 text-xs text-gray-500">
                by {{ version.author }}
              </div>
            </div>
          </div>
        </Card>

        <!-- 相关需求 -->
        <Card title="相关需求">
          <div class="space-y-2">
            <div
              v-for="related in relatedRequirements"
              :key="related.id"
              class="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-gray-50"
              @click="handleViewRelated(related)"
            >
              <div class="mb-1 text-sm font-medium">{{ related.title }}</div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <Tag size="small" :color="getTypeColor(related.type)">
                  {{ getTypeLabel(related.type) }}
                </Tag>
                <span>{{ related.relation }}</span>
              </div>
            </div>

            <Button block size="small" @click="handleAddRelation">
              <template #icon>
                <VbenIcon icon="lucide:plus" />
              </template>
              添加关联
            </Button>
          </div>
        </Card>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <Modal
      v-model:open="previewVisible"
      title="需求预览"
      width="80%"
      :footer="null"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-sm font-medium">需求标题</label>
            <div class="text-lg font-semibold">{{ previewData.title }}</div>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">需求类型</label>
            <Tag :color="getTypeColor(previewData.type)">{{
              getTypeLabel(previewData.type)
            }}</Tag>
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">需求描述</label>
          <div class="whitespace-pre-wrap rounded border bg-gray-50 p-3">
            {{ previewData.description }}
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="mb-1 block text-sm font-medium">优先级</label>
            <Tag :color="getPriorityColor(previewData.priority)">{{
              getPriorityLabel(previewData.priority)
            }}</Tag>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">指派人</label>
            <span>{{ previewData.assignee || '未指派' }}</span>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">截止日期</label>
            <span>{{ previewData.dueDate || '未设置' }}</span>
          </div>
        </div>
      </div>
    </Modal>

    <!-- 版本恢复确认弹窗 -->
    <Modal
      v-model:open="restoreModalVisible"
      title="恢复版本"
      @ok="handleRestoreConfirm"
      @cancel="handleRestoreCancel"
    >
      <div class="space-y-4">
        <Alert
          message="注意"
          description="恢复版本将覆盖当前的所有更改，此操作不可撤销。"
          type="warning"
          show-icon
        />

        <div v-if="selectedVersion">
          <div class="mb-2 font-medium">将恢复到版本:</div>
          <div class="rounded border bg-gray-50 p-3">
            <div class="font-medium">v{{ selectedVersion.version }}</div>
            <div class="mt-1 text-sm text-gray-600">
              {{ selectedVersion.description }}
            </div>
            <div class="mt-1 text-sm text-gray-500">
              {{ selectedVersion.author }} • {{ selectedVersion.time }}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  Button,
  Card,
  Tag,
  Empty,
  Timeline,
  TimelineItem,
  Divider,
  Modal,
  Alert,
  message,
} from 'ant-design-vue';
import { VbenIcon } from '@vben/common-ui';
import RequirementForm from './modules/form.vue';
import { requirementTypeOptions, priorityOptions, statusOptions } from './data';

const router = useRouter();
const route = useRoute();

// 响应式数据
const formRef = ref();
const formData = ref({});
const submitting = ref(false);
const previewVisible = ref(false);
const previewData = ref({});
const restoreModalVisible = ref(false);
const selectedVersion = ref(null);
const requirementId = ref('');
const currentVersion = ref('1.3');
const currentStatus = ref('developing');
const isLocked = ref(false);
const createTime = ref('2024-01-15 10:30:00');
const lastUpdateTime = ref('2024-01-20 14:20:00');
const lastEditTime = ref('2024-01-20 14:20:00');
const editCount = ref(5);

// 变更记录
const changeHistory = ref([
  {
    id: '1',
    field: '需求标题',
    oldValue: 'Vue3 Admin 用户权限管理',
    newValue: 'Vue3 Admin Dashboard 用户权限管理功能',
    operator: '张三',
    time: '2024-01-20 14:20:00',
  },
  {
    id: '2',
    field: '优先级',
    oldValue: '中',
    newValue: '高',
    operator: '产品经理',
    time: '2024-01-19 16:30:00',
  },
  {
    id: '3',
    field: '截止日期',
    oldValue: '2024-02-20',
    newValue: '2024-02-15',
    operator: '项目经理',
    time: '2024-01-18 09:15:00',
  },
]);

// 版本历史
const versionHistory = ref([
  {
    id: '1.3',
    version: '1.3',
    description: '更新需求标题和优先级',
    author: '张三',
    time: '2024-01-20 14:20:00',
  },
  {
    id: '1.2',
    version: '1.2',
    description: '添加验收标准和技术要求',
    author: '产品经理',
    time: '2024-01-19 16:30:00',
  },
  {
    id: '1.1',
    version: '1.1',
    description: '完善需求描述',
    author: '产品经理',
    time: '2024-01-18 09:15:00',
  },
  {
    id: '1.0',
    version: '1.0',
    description: '初始版本',
    author: '产品经理',
    time: '2024-01-15 10:30:00',
  },
]);

// 相关需求
const relatedRequirements = ref([
  {
    id: 'REQ-002',
    title: '用户角色管理功能',
    type: 'feature',
    relation: '依赖',
  },
  {
    id: 'REQ-003',
    title: '菜单权限控制',
    type: 'feature',
    relation: '关联',
  },
  {
    id: 'REQ-004',
    title: '数据权限控制',
    type: 'feature',
    relation: '关联',
  },
]);

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

/**
 * 获取需求详情数据
 */
const fetchRequirementDetail = async () => {
  requirementId.value = route.params.id as string;

  // 模拟API调用
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 模拟数据
  formData.value = {
    title: 'Vue3 Admin Dashboard 用户权限管理功能',
    description: `## 需求背景\n\n当前系统缺少完善的用户权限管理功能，需要实现基于角色的权限控制系统(RBAC)。\n\n## 功能要求\n\n1. **用户管理**\n   - 用户的增删改查\n   - 用户状态管理（启用/禁用）\n   - 用户密码重置\n\n2. **角色管理**\n   - 角色的增删改查\n   - 角色权限分配\n   - 角色继承关系\n\n3. **权限管理**\n   - 菜单权限控制\n   - 按钮权限控制\n   - 数据权限控制`,
    type: 'feature',
    priority: 'high',
    projectId: 'proj_001',
    assignee: '张三',
    estimatedHours: 40,
    dueDate: '2024-02-15',
    reviewers: ['技术总监', '架构师'],
    tags: ['权限管理', 'RBAC', '用户系统'],
  };
};

// 事件处理函数
const handleBack = () => {
  router.push(`/requirement/detail/${requirementId.value}`);
};

const handleFormSubmit = (values: Record<string, any>) => {
  console.log('表单提交:', values);
  formData.value = values;
};

const handleFormValuesChange = (
  changedValues: Record<string, any>,
  allValues: Record<string, any>,
) => {
  console.log('表单值变化:', changedValues, allValues);
  formData.value = allValues;
};

const handleSubmit = async () => {
  const validation = await formRef.value?.validate();
  if (!validation.success) {
    message.error('请检查表单填写是否正确');
    return;
  }

  submitting.value = true;

  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    message.success('需求更新成功');
    router.push(`/requirement/detail/${requirementId.value}`);
  } catch (error) {
    message.error('需求更新失败');
  } finally {
    submitting.value = false;
  }
};

const handleSaveDraft = async () => {
  const formValues = formRef.value?.getFieldsValue();

  try {
    // 模拟保存草稿API调用
    await new Promise((resolve) => setTimeout(resolve, 500));

    message.success('草稿已保存');
  } catch (error) {
    message.error('草稿保存失败');
  }
};

const handlePreview = () => {
  previewData.value = formRef.value?.getFieldsValue() || {};
  previewVisible.value = true;
};

const handleResetForm = () => {
  formRef.value?.resetFields();
  message.success('表单已重置');
};

const handleRestoreVersion = () => {
  restoreModalVisible.value = true;
};

const handleSelectVersion = (version: any) => {
  selectedVersion.value = version;
};

const handleRestoreConfirm = () => {
  if (!selectedVersion.value) {
    message.error('请选择要恢复的版本');
    return;
  }

  // 模拟恢复版本逻辑
  message.success(`已恢复到版本 v${selectedVersion.value.version}`);
  restoreModalVisible.value = false;
  selectedVersion.value = null;

  // 重新加载数据
  fetchRequirementDetail();
};

const handleRestoreCancel = () => {
  restoreModalVisible.value = false;
  selectedVersion.value = null;
};

const handleDuplicate = () => {
  const formValues = formRef.value?.getFieldsValue();
  const duplicatedData = {
    ...formValues,
    title: `${formValues.title} (副本)`,
  };

  // 跳转到创建页面并填充数据
  router.push({
    path: '/requirement/create',
    query: { duplicate: JSON.stringify(duplicatedData) },
  });
};

const handleDelete = () => {
  Modal.confirm({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除这个需求吗？',
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      message.success('需求已删除');
      router.push('/requirement/list');
    },
  });
};

const handleViewRelated = (related: any) => {
  router.push(`/requirement/detail/${related.id}`);
};

const handleAddRelation = () => {
  // 添加关联需求逻辑
  message.info('添加关联需求功能开发中...');
};

// 生命周期
onMounted(() => {
  fetchRequirementDetail();
});
</script>

<style scoped>
.requirement-edit {
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

:deep(.ant-timeline-item-content) {
  margin-left: 16px;
}

:deep(.ant-modal-body) {
  padding: 20px;
}
</style>
