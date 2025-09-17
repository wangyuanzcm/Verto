<template>
  <div class="requirement-create">
    <!-- 页面头部 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <Button @click="handleBack">
            <template #icon>
              <VbenIcon icon="lucide:arrow-left" />
            </template>
            返回列表
          </Button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">创建需求</h1>
            <p class="mt-1 text-gray-500">填写需求信息，创建新的需求</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Button @click="handleSaveDraft">
            <template #icon>
              <VbenIcon icon="lucide:save" />
            </template>
            保存草稿
          </Button>
          <Button type="primary" @click="handleSubmit" :loading="submitting">
            <template #icon>
              <VbenIcon icon="lucide:check" />
            </template>
            创建需求
          </Button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- 主要表单区域 -->
      <div class="lg:col-span-2">
        <Card title="基本信息">
          <RequirementForm
            ref="formRef"
            :form-data="formData"
            @submit="handleFormSubmit"
            @values-change="handleFormValuesChange"
          />
        </Card>
      </div>

      <!-- 侧边栏 -->
      <div class="space-y-6">
        <!-- 创建提示 -->
        <Card title="创建提示">
          <div class="space-y-3 text-sm">
            <div class="flex items-start gap-2">
              <VbenIcon
                icon="lucide:lightbulb"
                class="mt-0.5 flex-shrink-0 text-yellow-500"
              />
              <div>
                <div class="mb-1 font-medium">填写完整信息</div>
                <div class="text-gray-600">
                  详细的需求描述有助于开发人员更好地理解需求
                </div>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <VbenIcon
                icon="lucide:users"
                class="mt-0.5 flex-shrink-0 text-blue-500"
              />
              <div>
                <div class="mb-1 font-medium">指派合适的人员</div>
                <div class="text-gray-600">
                  选择有经验的开发人员可以提高需求完成质量
                </div>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <VbenIcon
                icon="lucide:calendar"
                class="mt-0.5 flex-shrink-0 text-green-500"
              />
              <div>
                <div class="mb-1 font-medium">设置合理的截止日期</div>
                <div class="text-gray-600">
                  考虑需求复杂度和团队工作量设置截止日期
                </div>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <VbenIcon
                icon="lucide:tag"
                class="mt-0.5 flex-shrink-0 text-purple-500"
              />
              <div>
                <div class="mb-1 font-medium">添加相关标签</div>
                <div class="text-gray-600">
                  使用标签可以更好地分类和检索需求
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- 需求模板 -->
        <Card title="需求模板">
          <div class="space-y-2">
            <div class="mb-3 text-sm text-gray-600">选择模板快速创建需求</div>

            <div
              v-for="template in requirementTemplates"
              :key="template.id"
              class="cursor-pointer rounded-lg border p-3 transition-colors hover:border-blue-300 hover:bg-blue-50"
              @click="handleUseTemplate(template)"
            >
              <div class="mb-1 text-sm font-medium">{{ template.name }}</div>
              <div class="text-xs text-gray-500">
                {{ template.description }}
              </div>
            </div>
          </div>
        </Card>

        <!-- 最近创建的需求 -->
        <Card title="最近创建">
          <div class="space-y-2">
            <div
              v-for="recent in recentRequirements"
              :key="recent.id"
              class="rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <div class="mb-1 text-sm font-medium">{{ recent.title }}</div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <Tag size="small" :color="getTypeColor(recent.type)">
                  {{ getTypeLabel(recent.type) }}
                </Tag>
                <span>{{ recent.createTime }}</span>
              </div>
            </div>

            <div v-if="!recentRequirements.length" class="py-4 text-center">
              <Empty description="暂无最近创建的需求" size="small" />
            </div>
          </div>
        </Card>

        <!-- 快捷操作 -->
        <Card title="快捷操作">
          <div class="space-y-2">
            <Button block @click="handleImportFromFile">
              <template #icon>
                <VbenIcon icon="lucide:upload" />
              </template>
              从文件导入
            </Button>

            <Button block @click="handleCopyFromExisting">
              <template #icon>
                <VbenIcon icon="lucide:copy" />
              </template>
              复制现有需求
            </Button>

            <Button block @click="handleBatchCreate">
              <template #icon>
                <VbenIcon icon="lucide:layers" />
              </template>
              批量创建
            </Button>
          </div>
        </Card>
      </div>
    </div>

    <!-- 导入文件弹窗 -->
    <Modal
      v-model:open="importModalVisible"
      title="从文件导入需求"
      @ok="handleImportConfirm"
      @cancel="handleImportCancel"
    >
      <div class="space-y-4">
        <div>
          <label class="mb-2 block text-sm font-medium">选择文件</label>
          <Upload
            :file-list="fileList"
            :before-upload="handleBeforeUpload"
            @remove="handleRemoveFile"
          >
            <Button>
              <template #icon>
                <VbenIcon icon="lucide:upload" />
              </template>
              选择文件
            </Button>
          </Upload>
          <div class="mt-1 text-xs text-gray-500">
            支持 .xlsx, .csv, .txt 格式文件
          </div>
        </div>

        <div v-if="importPreview.length">
          <label class="mb-2 block text-sm font-medium">预览数据</label>
          <div class="max-h-40 overflow-y-auto rounded border p-2">
            <div
              v-for="(item, index) in importPreview"
              :key="index"
              class="border-b py-1 text-sm last:border-b-0"
            >
              {{ item.title || `需求 ${index + 1}` }}
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- 复制需求弹窗 -->
    <Modal
      v-model:open="copyModalVisible"
      title="复制现有需求"
      @ok="handleCopyConfirm"
      @cancel="handleCopyCancel"
    >
      <div class="space-y-4">
        <div>
          <label class="mb-2 block text-sm font-medium">搜索需求</label>
          <Input
            v-model:value="copySearchKeyword"
            placeholder="输入需求标题或ID搜索"
            @input="handleCopySearch"
          >
            <template #prefix>
              <VbenIcon icon="lucide:search" />
            </template>
          </Input>
        </div>

        <div v-if="copySearchResults.length">
          <label class="mb-2 block text-sm font-medium">选择需求</label>
          <div class="max-h-60 space-y-2 overflow-y-auto">
            <div
              v-for="requirement in copySearchResults"
              :key="requirement.id"
              class="cursor-pointer rounded border p-3 hover:bg-blue-50"
              :class="{
                'border-blue-300 bg-blue-50':
                  selectedCopyRequirement?.id === requirement.id,
              }"
              @click="selectedCopyRequirement = requirement"
            >
              <div class="font-medium">{{ requirement.title }}</div>
              <div class="mt-1 text-sm text-gray-500">
                ID: {{ requirement.id }} • {{ requirement.createTime }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  Button,
  Card,
  Tag,
  Empty,
  Modal,
  Upload,
  Input,
  message,
} from 'ant-design-vue';
import { VbenIcon } from '@vben/common-ui';
import RequirementForm from './modules/form.vue';
import { requirementTypeOptions } from './data';

const router = useRouter();

// 响应式数据
const formRef = ref();
const formData = ref({});
const submitting = ref(false);
const importModalVisible = ref(false);
const copyModalVisible = ref(false);
const fileList = ref([]);
const importPreview = ref([]);
const copySearchKeyword = ref('');
const copySearchResults = ref([]);
const selectedCopyRequirement = ref(null);

// 需求模板数据
const requirementTemplates = ref([
  {
    id: '1',
    name: '功能需求模板',
    description: '用于创建新功能需求',
    template: {
      type: 'feature',
      priority: 'medium',
      description: '## 需求背景\n\n## 功能要求\n\n## 验收标准\n\n',
    },
  },
  {
    id: '2',
    name: 'Bug修复模板',
    description: '用于创建Bug修复需求',
    template: {
      type: 'bug',
      priority: 'high',
      description:
        '## 问题描述\n\n## 复现步骤\n\n## 期望结果\n\n## 实际结果\n\n',
    },
  },
  {
    id: '3',
    name: '优化改进模板',
    description: '用于创建优化改进需求',
    template: {
      type: 'improvement',
      priority: 'low',
      description: '## 当前状况\n\n## 改进目标\n\n## 预期收益\n\n',
    },
  },
]);

// 最近创建的需求
const recentRequirements = ref([
  {
    id: 'REQ-001',
    title: '用户登录功能优化',
    type: 'improvement',
    createTime: '2024-01-20',
  },
  {
    id: 'REQ-002',
    title: '数据导出功能',
    type: 'feature',
    createTime: '2024-01-19',
  },
  {
    id: 'REQ-003',
    title: '页面加载缓慢问题',
    type: 'bug',
    createTime: '2024-01-18',
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

// 事件处理函数
const handleBack = () => {
  router.push('/requirement/list');
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

    message.success('需求创建成功');
    router.push('/requirement/list');
  } catch (error) {
    message.error('需求创建失败');
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

const handleUseTemplate = (template: any) => {
  formRef.value?.setFieldsValue(template.template);
  message.success(`已应用模板: ${template.name}`);
};

const handleImportFromFile = () => {
  importModalVisible.value = true;
};

const handleCopyFromExisting = () => {
  copyModalVisible.value = true;
};

const handleBatchCreate = () => {
  router.push('/requirement/batch-create');
};

const handleBeforeUpload = (file: any) => {
  const isValidType = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
  ].includes(file.type);
  if (!isValidType) {
    message.error('只支持 Excel、CSV 和 TXT 文件');
    return false;
  }

  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    message.error('文件大小不能超过 10MB');
    return false;
  }

  fileList.value = [file];

  // 模拟文件解析
  setTimeout(() => {
    importPreview.value = [
      { title: '需求1: 用户管理功能' },
      { title: '需求2: 权限控制系统' },
      { title: '需求3: 数据统计报表' },
    ];
  }, 500);

  return false;
};

const handleRemoveFile = () => {
  fileList.value = [];
  importPreview.value = [];
};

const handleImportConfirm = () => {
  if (!fileList.value.length) {
    message.error('请选择要导入的文件');
    return;
  }

  // 模拟导入逻辑
  message.success(`成功导入 ${importPreview.value.length} 个需求`);
  importModalVisible.value = false;
  fileList.value = [];
  importPreview.value = [];
};

const handleImportCancel = () => {
  importModalVisible.value = false;
  fileList.value = [];
  importPreview.value = [];
};

const handleCopySearch = () => {
  if (!copySearchKeyword.value.trim()) {
    copySearchResults.value = [];
    return;
  }

  // 模拟搜索结果
  copySearchResults.value = [
    {
      id: 'REQ-001',
      title: '用户登录功能优化',
      createTime: '2024-01-20',
    },
    {
      id: 'REQ-002',
      title: '数据导出功能',
      createTime: '2024-01-19',
    },
  ].filter(
    (item) =>
      item.title.includes(copySearchKeyword.value) ||
      item.id.includes(copySearchKeyword.value),
  );
};

const handleCopyConfirm = () => {
  if (!selectedCopyRequirement.value) {
    message.error('请选择要复制的需求');
    return;
  }

  // 模拟复制逻辑
  const copiedData = {
    title: `${selectedCopyRequirement.value.title} (副本)`,
    description: '这是从现有需求复制的内容...',
    type: 'feature',
    priority: 'medium',
  };

  formRef.value?.setFieldsValue(copiedData);
  message.success('需求已复制到表单');

  copyModalVisible.value = false;
  copySearchKeyword.value = '';
  copySearchResults.value = [];
  selectedCopyRequirement.value = null;
};

const handleCopyCancel = () => {
  copyModalVisible.value = false;
  copySearchKeyword.value = '';
  copySearchResults.value = [];
  selectedCopyRequirement.value = null;
};

// 生命周期
onMounted(() => {
  // 初始化页面数据
});
</script>

<style scoped>
.requirement-create {
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

:deep(.ant-upload-list) {
  margin-top: 8px;
}

:deep(.ant-modal-body) {
  padding: 20px;
}
</style>
