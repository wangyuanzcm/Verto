<template>
  <div class="project-list">
    <Page description="管理和查看所有项目信息" title="项目列表">
      <template #extra>
        <Button type="primary" @click="onCreate">
          <template #icon>
            <Plus class="size-4" />
          </template>
          新建项目
        </Button>
      </template>

      <Grid ref="gridRef" class="h-full" />
    </Page>

    <!-- 项目表单抽屉 -->
    <FormDrawer />
  </div>
</template>

<script setup lang="ts">
import type { Recordable } from '@vben/types';
import type { OnActionClickParams, VxeTableGridOptions } from '@vben/common-ui';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { useGridFormSchema, useProjectFormSchema } from './data';
import FormModal from './modules/form.vue';

/**
 * 项目列表页面组件
 * 提供项目的增删改查功能
 */

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  creator: string;
  createTime: string;
  updateTime: string;
  template: string;
  version: string;
}

const router = useRouter();

/**
 * 获取项目列表数据
 * @param params 查询参数
 * @returns 项目列表
 */
const getProjectList = async (params: any) => {
  // 模拟API调用
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const mockData: ProjectItem[] = [
    {
      id: 'proj_001',
      name: 'Vue3 Admin Dashboard',
      description: '基于Vue3的现代化管理后台系统',
      status: 'active',
      creator: '张三',
      createTime: '2024-01-15 10:30:00',
      updateTime: '2024-01-20 14:20:00',
      template: 'Vue3 + TypeScript',
      version: '1.2.0',
    },
    {
      id: 'proj_002',
      name: 'React E-commerce',
      description: '电商平台前端项目',
      status: 'active',
      creator: '李四',
      createTime: '2024-01-10 09:15:00',
      updateTime: '2024-01-18 16:45:00',
      template: 'React + Next.js',
      version: '2.1.3',
    },
    {
      id: 'proj_003',
      name: 'Vue3 Blog System',
      description: '个人博客系统',
      status: 'inactive',
      creator: '王五',
      createTime: '2024-01-05 14:20:00',
      updateTime: '2024-01-12 11:30:00',
      template: 'Vue3 + Nuxt',
      version: '1.0.5',
    },
  ];

  return {
    items: mockData,
    total: mockData.length,
  };
};

/**
 * 删除项目
 * @param id 项目ID
 */
const deleteProject = async (id: string) => {
  // 模拟API调用
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log('删除项目:', id);
};

// 表单抽屉
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: FormModal,
  title: '项目信息',
});

// 表格配置
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
  },
  gridOptions: {
    data: [],
    loading: false,
    columns: [
      { type: 'seq', width: 60 },
      { field: 'name', title: '项目名称', minWidth: 200 },
      { field: 'description', title: '项目描述', minWidth: 250 },
      { field: 'status', title: '状态', width: 100 },
      { field: 'creator', title: '创建者', width: 120 },
      { field: 'createTime', title: '创建时间', width: 160 },
      { field: 'template', title: '模板', width: 150 },
      { field: 'version', title: '版本', width: 100 },
      {
        title: '操作',
        width: 200,
        fixed: 'right',
        slots: { default: 'action' },
      },
    ],
    proxyConfig: {
      ajax: {
        query: async ({ page, form }: any) => {
          return await getProjectList({
            ...form,
            page: page.currentPage,
            pageSize: page.pageSize,
          });
        },
      },
    },
  } as VxeTableGridOptions<ProjectItem>,
});

/**
 * 处理操作按钮点击
 * @param params 操作参数
 */
function onActionClick(e: OnActionClickParams<ProjectItem>) {
  const { action, record } = e;
  switch (action) {
    case 'view': {
      onView(record);
      break;
    }
    case 'edit': {
      onEdit(record);
      break;
    }
    case 'delete': {
      onDelete(record);
      break;
    }
    case 'status': {
      onStatusChange(
        record.status === 'active' ? 'inactive' : 'active',
        record,
      );
      break;
    }
  }
}

/**
 * 修改项目状态
 * @param newStatus 新状态
 * @param row 项目数据
 */
async function onStatusChange(newStatus: string, row: ProjectItem) {
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 更新本地数据
    row.status = newStatus as 'active' | 'inactive' | 'archived';

    console.log(`项目 ${row.name} 状态已更新为: ${newStatus}`);
  } catch (error) {
    console.error('更新状态失败:', error);
  }
}

/**
 * 删除项目
 * @param row 项目数据
 */
async function onDelete(row: ProjectItem) {
  try {
    await deleteProject(row.id);
    await gridApi.reload();
    console.log(`项目 ${row.name} 已删除`);
  } catch (error) {
    console.error('删除失败:', error);
  }
}

/**
 * 创建项目
 */
function onCreate() {
  formDrawerApi.open({
    title: '新建项目',
    data: {},
  });
}

/**
 * 编辑项目
 * @param row 项目数据
 */
function onEdit(row: ProjectItem) {
  formDrawerApi.open({
    title: '编辑项目',
    data: row,
  });
}

/**
 * 查看项目详情
 * @param row 项目数据
 */
function onView(row: ProjectItem) {
  router.push(`/project/detail/${row.id}`);
}
</script>

<style scoped>
.project-list {
  height: 100%;
}
</style>
