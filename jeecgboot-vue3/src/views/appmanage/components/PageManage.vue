<!--页面管理-->
<template>
  <div class="page-manage-container">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-space>
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          新增页面
        </a-button>
        <a-button @click="handleBatchDelete" :disabled="!hasSelected">
          <template #icon><DeleteOutlined /></template>
          批量删除
        </a-button>
        <a-button @click="handleRefresh">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </a-space>
    </div>

    <!-- 页面列表 -->
    <BasicTable @register="registerTable" @row-click="handleRowClick">
      <template #toolbar>
        <a-input-search
          v-model:value="searchText"
          placeholder="搜索页面名称或路径"
          style="width: 300px"
          @search="handleSearch"
        />
      </template>
      
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 'published' ? 'green' : record.status === 'draft' ? 'orange' : 'red'">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <template v-if="column.key === 'pageType'">
          <a-tag :color="getPageTypeColor(record.pageType)">
            {{ getPageTypeText(record.pageType) }}
          </a-tag>
        </template>
        
        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                icon: 'clarity:note-edit-line',
                tooltip: '编辑',
                onClick: handleEdit.bind(null, record),
              },
              {
                icon: 'ant-design:eye-outlined',
                tooltip: '预览',
                onClick: handlePreview.bind(null, record),
              },
              {
                icon: 'ant-design:copy-outlined',
                tooltip: '复制',
                onClick: handleCopy.bind(null, record),
              },
              {
                icon: 'ant-design:delete-outlined',
                color: 'error',
                tooltip: '删除',
                popConfirm: {
                  title: '是否确认删除',
                  placement: 'left',
                  confirm: handleDelete.bind(null, record),
                },
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>

    <!-- 页面配置弹窗 -->
    <PageModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { message } from 'ant-design-vue';
  import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons-vue';
  import { pageColumns, pageData } from '../data/PageData';
  import PageModal from './PageModal.vue';

  export default defineComponent({
    name: 'PageManage',
    components: {
      BasicTable,
      TableAction,
      PageModal,
      PlusOutlined,
      DeleteOutlined,
      ReloadOutlined,
    },
    setup() {
      const { createMessage } = message;
      const searchText = ref('');

      // 表格配置
      const [registerTable, { getSelectRows, reload }] = useTable({
        title: '页面列表',
        api: () => Promise.resolve({ items: pageData, total: pageData.length }),
        columns: pageColumns,
        formConfig: {
          labelWidth: 120,
          schemas: [
            {
              field: 'name',
              label: '页面名称',
              component: 'Input',
              colProps: { span: 8 },
            },
            {
              field: 'status',
              label: '状态',
              component: 'Select',
              componentProps: {
                options: [
                  { label: '已发布', value: 'published' },
                  { label: '草稿', value: 'draft' },
                  { label: '已下线', value: 'offline' },
                ],
              },
              colProps: { span: 8 },
            },
          ],
        },
        useSearchForm: true,
        showTableSetting: true,
        bordered: true,
        rowSelection: {
          type: 'checkbox',
        },
      });

      // 弹窗配置
      const [registerModal, { openModal }] = useModal();

      const hasSelected = ref(false);

      /**
       * 获取状态文本
       */
      function getStatusText(status: string) {
        const statusMap = {
          published: '已发布',
          draft: '草稿',
          offline: '已下线',
        };
        return statusMap[status] || status;
      }

      /**
       * 获取页面类型颜色
       */
      function getPageTypeColor(type: string) {
        const colorMap = {
          list: 'blue',
          form: 'green',
          detail: 'orange',
          dashboard: 'purple',
          custom: 'cyan',
        };
        return colorMap[type] || 'default';
      }

      /**
       * 获取页面类型文本
       */
      function getPageTypeText(type: string) {
        const typeMap = {
          list: '列表页',
          form: '表单页',
          detail: '详情页',
          dashboard: '仪表板',
          custom: '自定义页',
        };
        return typeMap[type] || type;
      }

      /**
       * 新增页面
       */
      function handleAdd() {
        openModal(true, {
          isUpdate: false,
        });
      }

      /**
       * 编辑页面
       */
      function handleEdit(record: Recordable) {
        openModal(true, {
          record,
          isUpdate: true,
        });
      }

      /**
       * 预览页面
       */
      function handlePreview(record: Recordable) {
        // 打开新窗口预览页面
        const previewUrl = `${window.location.origin}${record.path}`;
        window.open(previewUrl, '_blank');
        createMessage.info(`正在预览页面: ${record.name}`);
      }

      /**
       * 复制页面
       */
      function handleCopy(record: Recordable) {
        openModal(true, {
          record: {
            ...record,
            id: undefined,
            name: `${record.name}_副本`,
            path: `${record.path}_copy`,
          },
          isUpdate: false,
        });
      }

      /**
       * 删除页面
       */
      async function handleDelete(record: Recordable) {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          createMessage.success('删除成功');
          reload();
        } catch (error) {
          createMessage.error('删除失败');
        }
      }

      /**
       * 批量删除
       */
      async function handleBatchDelete() {
        const selectedRows = getSelectRows();
        if (selectedRows.length === 0) {
          createMessage.warning('请选择要删除的页面');
          return;
        }

        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          createMessage.success(`成功删除 ${selectedRows.length} 个页面`);
          reload();
        } catch (error) {
          createMessage.error('批量删除失败');
        }
      }

      /**
       * 刷新列表
       */
      function handleRefresh() {
        reload();
      }

      /**
       * 搜索
       */
      function handleSearch() {
        reload();
      }

      /**
       * 行点击
       */
      function handleRowClick(record: Recordable) {
        console.log('点击行:', record);
      }

      /**
       * 操作成功回调
       */
      function handleSuccess() {
        reload();
      }

      return {
        searchText,
        hasSelected,
        registerTable,
        registerModal,
        getStatusText,
        getPageTypeColor,
        getPageTypeText,
        handleAdd,
        handleEdit,
        handlePreview,
        handleCopy,
        handleDelete,
        handleBatchDelete,
        handleRefresh,
        handleSearch,
        handleRowClick,
        handleSuccess,
      };
    },
  });
</script>

<style lang="less" scoped>
  .page-manage-container {
    .operation-bar {
      margin-bottom: 16px;
    }
  }
</style>