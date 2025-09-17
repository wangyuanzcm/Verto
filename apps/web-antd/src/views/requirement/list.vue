<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { message, Modal } from 'ant-design-vue';

import {
  getRequirementTableColumns,
  getRequirementSearchFormSchema,
} from './data';

// 需求接口类型
interface RequirementItem {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'bug' | 'improvement' | 'task';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status:
    | 'draft'
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'developing'
    | 'testing'
    | 'completed';
  assignee?: string;
  reporter: string;
  projectId?: string;
  projectName?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: string[];
  createTime: string;
  updateTime: string;
  dueDate?: string;
  reviewers: string[];
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  reviewComments?: string;
}

const router = useRouter();

// 表格配置
const gridOptions = ref<VxeGridProps<RequirementItem>>({
  columns: getRequirementTableColumns(),
  data: [],
  height: 'auto',
  keepSource: true,
  showOverflow: true,
});

const searchFormSchema = getRequirementSearchFormSchema();

// 表格实例
const [Table, tableApi] = useVbenVxeGrid({
  formOptions: { schema: searchFormSchema },
});

// 模拟需求数据
const mockRequirements: RequirementItem[] = [
  {
    id: '1',
    title: '用户登录功能优化',
    description: '优化用户登录流程，增加多种登录方式支持，提升用户体验',
    type: 'improvement',
    priority: 'high',
    status: 'developing',
    assignee: '张三',
    reporter: '产品经理',
    projectId: 'proj_001',
    projectName: 'Vue3 Admin Dashboard',
    estimatedHours: 40,
    actualHours: 25,
    tags: ['登录', '用户体验', '安全'],
    attachments: ['login_mockup.png', 'requirements.pdf'],
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-15 14:30:00',
    dueDate: '2024-02-01',
    reviewers: ['技术总监', '产品总监'],
    reviewStatus: 'approved',
    reviewComments: '需求合理，可以开始开发',
  },
  {
    id: '2',
    title: '数据导出功能',
    description: '支持将表格数据导出为Excel、CSV、PDF等格式',
    type: 'feature',
    priority: 'medium',
    status: 'pending',
    reporter: '业务分析师',
    projectId: 'proj_001',
    projectName: 'Vue3 Admin Dashboard',
    estimatedHours: 24,
    tags: ['导出', '数据处理'],
    attachments: ['export_spec.docx'],
    createTime: '2024-01-05 09:15:00',
    updateTime: '2024-01-10 16:45:00',
    dueDate: '2024-01-25',
    reviewers: ['技术总监'],
    reviewStatus: 'pending',
  },
  {
    id: '3',
    title: '修复表格排序问题',
    description: '修复表格多列排序时出现的数据错乱问题',
    type: 'bug',
    priority: 'urgent',
    status: 'approved',
    assignee: '李四',
    reporter: '测试工程师',
    projectId: 'proj_002',
    projectName: 'React E-commerce',
    estimatedHours: 8,
    actualHours: 6,
    tags: ['Bug修复', '表格', '排序'],
    attachments: ['bug_report.pdf', 'test_case.xlsx'],
    createTime: '2024-01-08 11:30:00',
    updateTime: '2024-01-12 10:20:00',
    dueDate: '2024-01-15',
    reviewers: ['技术总监'],
    reviewStatus: 'approved',
    reviewComments: '紧急Bug，优先处理',
  },
  {
    id: '4',
    title: '移动端适配',
    description: '对现有页面进行移动端适配，确保在各种设备上的良好显示',
    type: 'task',
    priority: 'medium',
    status: 'draft',
    reporter: 'UI设计师',
    projectId: 'proj_003',
    projectName: 'Vue3 Blog System',
    estimatedHours: 60,
    tags: ['移动端', '响应式', 'UI'],
    attachments: ['mobile_design.fig'],
    createTime: '2024-01-10 14:00:00',
    updateTime: '2024-01-10 14:00:00',
    dueDate: '2024-02-15',
    reviewers: ['技术总监', 'UI总监'],
    reviewStatus: 'pending',
  },
  {
    id: '5',
    title: '性能优化',
    description: '优化首页加载速度，减少白屏时间，提升用户体验',
    type: 'improvement',
    priority: 'high',
    status: 'testing',
    assignee: '王五',
    reporter: '前端工程师',
    projectId: 'proj_001',
    projectName: 'Vue3 Admin Dashboard',
    estimatedHours: 32,
    actualHours: 28,
    tags: ['性能优化', '加载速度', '用户体验'],
    attachments: ['performance_report.pdf'],
    createTime: '2024-01-12 16:20:00',
    updateTime: '2024-01-18 11:10:00',
    dueDate: '2024-01-30',
    reviewers: ['技术总监'],
    reviewStatus: 'approved',
    reviewComments: '性能优化很重要，支持实施',
  },
  {
    id: '6',
    title: '国际化支持',
    description: '添加多语言支持，支持中文、英文、日文等语言切换',
    type: 'feature',
    priority: 'low',
    status: 'rejected',
    reporter: '产品经理',
    projectId: 'proj_002',
    projectName: 'React E-commerce',
    estimatedHours: 80,
    tags: ['国际化', '多语言', 'i18n'],
    attachments: ['i18n_plan.docx'],
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 09:45:00',
    dueDate: '2024-03-01',
    reviewers: ['产品总监', '技术总监'],
    reviewStatus: 'rejected',
    reviewComments: '当前阶段不考虑国际化，优先级较低',
  },
];

// 加载状态
const loading = ref(false);

/**
 * 获取需求列表数据
 * @param params 查询参数
 */
async function fetchRequirements(params: any = {}) {
  loading.value = true;
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredData = [...mockRequirements];

    // 应用搜索过滤
    if (params.title) {
      filteredData = filteredData.filter((item) =>
        item.title.toLowerCase().includes(params.title.toLowerCase()),
      );
    }

    if (params.type) {
      filteredData = filteredData.filter((item) => item.type === params.type);
    }

    if (params.status) {
      filteredData = filteredData.filter(
        (item) => item.status === params.status,
      );
    }

    if (params.priority) {
      filteredData = filteredData.filter(
        (item) => item.priority === params.priority,
      );
    }

    if (params.projectId) {
      filteredData = filteredData.filter(
        (item) => item.projectId === params.projectId,
      );
    }

    gridOptions.value.data = filteredData;
  } catch (error) {
    message.error('获取需求列表失败');
  } finally {
    loading.value = false;
  }
}

/**
 * 查看需求详情
 * @param record 需求记录
 */
function viewRequirement(record: RequirementItem) {
  router.push(`/requirement/detail/${record.id}`);
}

/**
 * 编辑需求
 * @param record 需求记录
 */
function editRequirement(record: RequirementItem) {
  router.push(`/requirement/edit/${record.id}`);
}

/**
 * 删除需求
 * @param record 需求记录
 */
function deleteRequirement(record: RequirementItem) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除需求"${record.title}"吗？此操作不可恢复。`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        // 模拟删除API调用
        await new Promise((resolve) => setTimeout(resolve, 300));

        const index = gridOptions.value.data?.findIndex(
          (item) => item.id === record.id,
        );
        if (index !== undefined && index > -1 && gridOptions.value.data) {
          gridOptions.value.data.splice(index, 1);
        }

        message.success('删除成功');
      } catch (error) {
        message.error('删除失败');
      }
    },
  });
}

/**
 * 复制需求
 * @param record 需求记录
 */
function copyRequirement(record: RequirementItem) {
  const newRequirement = {
    ...record,
    id: `copy_${Date.now()}`,
    title: `${record.title} (副本)`,
    status: 'draft' as const,
    createTime: new Date().toLocaleString(),
    updateTime: new Date().toLocaleString(),
    assignee: undefined,
    actualHours: undefined,
    reviewStatus: 'pending' as const,
    reviewComments: undefined,
  };

  gridOptions.value.data?.unshift(newRequirement);
  message.success('需求已复制');
}

/**
 * 批量操作
 * @param action 操作类型
 */
function batchAction(action: string) {
  const selectedRows = tableApi.getCheckboxRecords();

  if (selectedRows.length === 0) {
    message.warning('请先选择要操作的需求');
    return;
  }

  Modal.confirm({
    title: '确认批量操作',
    content: `确定要对选中的 ${selectedRows.length} 个需求执行"${action}"操作吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        // 模拟批量操作API调用
        await new Promise((resolve) => setTimeout(resolve, 500));

        selectedRows.forEach((row) => {
          const index = gridOptions.value.data?.findIndex(
            (item) => item.id === row.id,
          );
          if (index !== undefined && index > -1 && gridOptions.value.data) {
            switch (action) {
              case '删除':
                gridOptions.value.data.splice(index, 1);
                break;
              case '批准':
                gridOptions.value.data[index].status = 'approved';
                gridOptions.value.data[index].reviewStatus = 'approved';
                break;
              case '拒绝':
                gridOptions.value.data[index].status = 'rejected';
                gridOptions.value.data[index].reviewStatus = 'rejected';
                break;
            }
          }
        });

        message.success(`批量${action}成功`);
        tableApi.clearCheckboxRow();
      } catch (error) {
        message.error(`批量${action}失败`);
      }
    },
  });
}

/**
 * 创建新需求
 */
function createRequirement() {
  router.push('/requirement/create');
}

/**
 * 导出需求数据
 */
function exportRequirements() {
  const selectedRows = tableApi.getCheckboxRecords();
  const dataToExport =
    selectedRows.length > 0 ? selectedRows : gridOptions.value.data || [];

  // 模拟导出功能
  const csvContent = [
    [
      'ID',
      '标题',
      '类型',
      '优先级',
      '状态',
      '指派人',
      '报告人',
      '项目',
      '创建时间',
    ].join(','),
    ...dataToExport.map((item) =>
      [
        item.id,
        `"${item.title}"`,
        item.type,
        item.priority,
        item.status,
        item.assignee || '',
        item.reporter,
        item.projectName || '',
        item.createTime,
      ].join(','),
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `requirements_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();

  message.success('导出成功');
}

// 表格配置
const tableProps: VbenTableProps = {
  api: fetchRequirements,
  columns: getRequirementTableColumns({
    onView: viewRequirement,
    onEdit: editRequirement,
    onDelete: deleteRequirement,
    onCopy: copyRequirement,
  }),
  commonConfig: {
    rowConfig: {
      keyField: 'id',
    },
  },
  formOptions: {
    schema: searchFormSchema,
  },
  gridOptions,
};

// 初始化数据
fetchRequirements();
</script>

<template>
  <Page description="需求管理 - 创建、跟踪和管理项目需求" title="需求列表">
    <Table v-bind="tableProps">
      <!-- 工具栏按钮 -->
      <template #toolbar-tools>
        <a-button type="primary" class="mr-2" @click="createRequirement">
          <template #icon>
            <lucide:plus class="size-4" />
          </template>
          新建需求
        </a-button>

        <a-dropdown>
          <template #overlay>
            <a-menu @click="({ key }) => batchAction(key)">
              <a-menu-item key="批准">批量批准</a-menu-item>
              <a-menu-item key="拒绝">批量拒绝</a-menu-item>
              <a-menu-divider />
              <a-menu-item key="删除" class="text-red-600"
                >批量删除</a-menu-item
              >
            </a-menu>
          </template>
          <a-button class="mr-2">
            批量操作
            <lucide:chevron-down class="ml-1 size-4" />
          </a-button>
        </a-dropdown>

        <a-button class="mr-2" @click="exportRequirements">
          <template #icon>
            <lucide:download class="size-4" />
          </template>
          导出
        </a-button>

        <a-button
          class="mr-2"
          @click="() => router.push('/requirement/review')"
        >
          <template #icon>
            <lucide:check-circle class="size-4" />
          </template>
          需求评审
        </a-button>

        <a-button @click="() => router.push('/requirement/analysis')">
          <template #icon>
            <lucide:bar-chart class="size-4" />
          </template>
          需求分析
        </a-button>
      </template>
    </Table>
  </Page>
</template>
