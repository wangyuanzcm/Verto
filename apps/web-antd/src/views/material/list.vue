<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

// 物料接口类型定义
interface MaterialItem {
  id: string;
  name: string;
  description: string;
  type: 'component' | 'snippet' | 'template' | 'library';
  category: string;
  framework: string;
  language: string;
  version: string;
  status: 'published' | 'draft' | 'deprecated';
  downloadCount: number;
  rating: number;
  author: string;
  createTime: string;
  updateTime: string;
  tags: string[];
  isOfficial: boolean;
  preview?: string;
  repository?: string;
}

const router = useRouter();

// 模拟API函数
const getMaterialList = async (params: any) => {
  // 这里应该调用真实的API
  return {
    items: [
      {
        id: '1',
        name: 'Button组件',
        description: '通用按钮组件，支持多种样式和尺寸',
        type: 'component',
        category: '基础组件',
        framework: 'Vue3',
        language: 'TypeScript',
        version: 'v1.2.0',
        status: 'published',
        downloadCount: 1250,
        rating: 4.8,
        author: '前端团队',
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-15 14:30:00',
        tags: ['按钮', '基础组件', 'UI'],
        isOfficial: true,
        preview: 'https://example.com/preview/button',
        repository: 'https://github.com/example/button',
      },
      {
        id: '2',
        name: '表单验证代码片段',
        description: '常用的表单验证逻辑代码片段',
        type: 'snippet',
        category: '工具函数',
        framework: 'Vue3',
        language: 'TypeScript',
        version: 'v1.0.0',
        status: 'published',
        downloadCount: 890,
        rating: 4.6,
        author: '开发者A',
        createTime: '2024-01-05 10:00:00',
        updateTime: '2024-01-12 16:20:00',
        tags: ['表单', '验证', '工具'],
        isOfficial: false,
      },
      {
        id: '3',
        name: '数据表格模板',
        description: '带分页、搜索、排序的数据表格模板',
        type: 'template',
        category: '页面模板',
        framework: 'Vue3',
        language: 'TypeScript',
        version: 'v2.1.0',
        status: 'published',
        downloadCount: 650,
        rating: 4.7,
        author: '模板团队',
        createTime: '2024-01-08 10:00:00',
        updateTime: '2024-01-14 11:45:00',
        tags: ['表格', '分页', '模板'],
        isOfficial: true,
        preview: 'https://example.com/preview/table',
      },
    ],
    total: 3,
  };
};

const deleteMaterial = async (id: string) => {
  // 模拟删除API
  console.log('删除物料:', id);
  return { success: true };
};

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getMaterialList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<MaterialItem>,
});

/**
 * 处理操作按钮点击事件
 * @param e 操作参数
 */
function onActionClick(e: OnActionClickParams<MaterialItem>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'view': {
      onView(e.row);
      break;
    }
    case 'preview': {
      onPreview(e.row);
      break;
    }
    case 'download': {
      onDownload(e.row);
      break;
    }
  }
}

/**
 * 封装确认对话框为Promise
 * @param content 提示内容
 * @param title 提示标题
 */
function confirm(content: string, title: string) {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('已取消'));
      },
      onOk() {
        resolve(true);
      },
      title,
    });
  });
}

/**
 * 状态开关变更处理
 * @param newStatus 新状态值
 * @param row 行数据
 */
async function onStatusChange(newStatus: string, row: MaterialItem) {
  try {
    await confirm(
      `确定要${newStatus === 'published' ? '发布' : '下架'}物料"${row.name}"吗？`,
      '状态变更确认',
    );

    // 这里应该调用更新状态的API
    message.success(
      `物料"${row.name}"已${newStatus === 'published' ? '发布' : '下架'}`,
    );
    gridApi.reload();
  } catch {
    // 用户取消操作，不做任何处理
  }
}

/**
 * 删除物料
 * @param row 物料数据
 */
async function onDelete(row: MaterialItem) {
  try {
    await confirm(
      `确定要删除物料"${row.name}"吗？此操作不可恢复。`,
      '删除确认',
    );
    await deleteMaterial(row.id);
    message.success(`物料"${row.name}"已删除`);
    gridApi.reload();
  } catch (error: any) {
    if (error.message !== '已取消') {
      message.error('删除失败');
    }
  }
}

/**
 * 编辑物料
 * @param row 物料数据
 */
function onEdit(row: MaterialItem) {
  formDrawerApi.open({
    title: '编辑物料',
    data: row,
    onConfirm: async (values: Recordable) => {
      // 这里应该调用更新API
      console.log('更新物料:', values);
      message.success('物料更新成功');
      gridApi.reload();
      formDrawerApi.close();
    },
  });
}

/**
 * 查看物料详情
 * @param row 物料数据
 */
function onView(row: MaterialItem) {
  router.push(`/material/detail/${row.id}`);
}

/**
 * 预览物料
 * @param row 物料数据
 */
function onPreview(row: MaterialItem) {
  if (row.preview) {
    window.open(row.preview, '_blank');
  } else {
    message.info('该物料暂无预览');
  }
}

/**
 * 下载物料
 * @param row 物料数据
 */
function onDownload(row: MaterialItem) {
  message.success(`正在下载"${row.name}"...`);
  // 这里应该调用下载API
}

/**
 * 新增物料
 */
function onCreate() {
  formDrawerApi.open({
    title: '新增物料',
    onConfirm: async (values: Recordable) => {
      // 这里应该调用创建API
      console.log('创建物料:', values);
      message.success('物料创建成功');
      gridApi.reload();
      formDrawerApi.close();
    },
  });
}

/**
 * 批量导入物料
 */
function onBatchImport() {
  message.info('批量导入功能开发中...');
}

/**
 * 导出物料
 */
function onExport() {
  message.info('导出功能开发中...');
}
</script>

<template>
  <Page
    description="物料管理 - 组件库、代码片段、模板等开发物料的统一管理"
    title="物料列表"
  >
    <Grid>
      <template #toolbar-tools>
        <div class="flex gap-2">
          <Button @click="onBatchImport"> 批量导入 </Button>
          <Button @click="onExport"> 导出物料 </Button>
          <Button type="primary" @click="onCreate">
            <template #icon>
              <Plus class="size-4" />
            </template>
            新增物料
          </Button>
        </div>
      </template>
    </Grid>

    <FormDrawer />
  </Page>
</template>
