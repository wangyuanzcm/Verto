<!--代码审查管理-->
<template>
  <div class="code-review-container">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="handleAdd">
              <template #icon><PlusOutlined /></template>
              新增审查规则
            </a-button>
            <a-button @click="handleBatchDelete" :disabled="!hasSelected">
              <template #icon><DeleteOutlined /></template>
              批量删除
            </a-button>
            <a-button @click="handleExport">
              <template #icon><ExportOutlined /></template>
              导出规则
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="12" style="text-align: right">
          <a-space>
            <a-input-search
              v-model:value="searchText"
              placeholder="搜索规则名称或描述"
              style="width: 250px"
              @search="handleSearch"
            />
            <a-button @click="handleRefresh">
              <template #icon><ReloadOutlined /></template>
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <!-- 代码审查规则列表 -->
    <BasicTable
      @register="registerTable"
      :rowSelection="rowSelection"
      @row-click="handleRowClick"
    >
      <template #toolbar>
        <a-button type="primary" @click="handleAdd">
          <Icon icon="ant-design:plus-outlined" />
          新增规则
        </a-button>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'severity'">
          <a-tag :color="getSeverityColor(record.severity)">
            {{ getSeverityText(record.severity) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status === 'active' ? 'green' : 'red'">
            {{ record.status === 'active' ? '启用' : '禁用' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                icon: 'clarity:info-standard-line',
                tooltip: '查看详情',
                onClick: handleView.bind(null, record),
              },
              {
                icon: 'clarity:note-edit-line',
                tooltip: '编辑',
                onClick: handleEdit.bind(null, record),
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

    <!-- 代码审查规则弹窗 -->
    <CodeReviewModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, computed } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { Icon } from '/@/components/Icon';
  import { message } from 'ant-design-vue';
  import { PlusOutlined, DeleteOutlined, ExportOutlined, ReloadOutlined } from '@ant-design/icons-vue';
  
  import CodeReviewModal from './CodeReviewModal.vue';
  import { codeReviewColumns, codeReviewData } from '../data/CodeReviewData';

  export default defineComponent({
    name: 'CodeReview',
    components: {
      BasicTable,
      TableAction,
      Icon,
      CodeReviewModal,
      PlusOutlined,
      DeleteOutlined,
      ExportOutlined,
      ReloadOutlined,
    },
    setup() {
      const { createMessage } = message;
      const searchText = ref('');
      const selectedRowKeys = ref<string[]>([]);

      const [registerTable, { reload, getSelectRows }] = useTable({
        title: '代码审查规则列表',
        api: () => Promise.resolve({ items: codeReviewData, total: codeReviewData.length }),
        columns: codeReviewColumns,
        formConfig: {
          labelWidth: 120,
          schemas: [
            {
              field: 'ruleName',
              label: '规则名称',
              component: 'Input',
              componentProps: {
                placeholder: '请输入规则名称',
              },
            },
            {
              field: 'severity',
              label: '严重程度',
              component: 'Select',
              componentProps: {
                placeholder: '请选择严重程度',
                options: [
                  { label: '低', value: 'low' },
                  { label: '中', value: 'medium' },
                  { label: '高', value: 'high' },
                  { label: '严重', value: 'critical' },
                ],
              },
            },
            {
              field: 'status',
              label: '状态',
              component: 'Select',
              componentProps: {
                placeholder: '请选择状态',
                options: [
                  { label: '启用', value: 'active' },
                  { label: '禁用', value: 'inactive' },
                ],
              },
            },
          ],
        },
        useSearchForm: true,
        showTableSetting: true,
        bordered: true,
        handleSearchInfoFn(info) {
          console.log('handleSearchInfoFn', info);
        },
        actionColumn: {
          width: 120,
          title: '操作',
          dataIndex: 'action',
          fixed: undefined,
        },
      });

      const [registerModal, { openModal }] = useModal();

      const rowSelection = {
        type: 'checkbox',
        selectedRowKeys: selectedRowKeys,
        onChange: (keys: string[]) => {
          selectedRowKeys.value = keys;
        },
      };

      const hasSelected = computed(() => selectedRowKeys.value.length > 0);

      /**
       * 获取严重程度颜色
       */
      function getSeverityColor(severity: string) {
        const colorMap = {
          low: 'blue',
          medium: 'orange',
          high: 'red',
          critical: 'purple',
        };
        return colorMap[severity] || 'default';
      }

      /**
       * 获取严重程度文本
       */
      function getSeverityText(severity: string) {
        const textMap = {
          low: '低',
          medium: '中',
          high: '高',
          critical: '严重',
        };
        return textMap[severity] || severity;
      }

      /**
       * 新增规则
       */
      function handleAdd() {
        openModal(true, {
          isUpdate: false,
        });
      }

      /**
       * 编辑规则
       */
      function handleEdit(record: Recordable) {
        openModal(true, {
          record,
          isUpdate: true,
        });
      }

      /**
       * 查看详情
       */
      function handleView(record: Recordable) {
        openModal(true, {
          record,
          isUpdate: true,
          readonly: true,
        });
      }

      /**
       * 删除规则
       */
      async function handleDelete(record: Recordable) {
        try {
          // 模拟API调用
          await new Promise((resolve) => setTimeout(resolve, 500));
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
        if (selectedRowKeys.value.length === 0) {
          createMessage.warning('请选择要删除的规则');
          return;
        }
        
        try {
          // 模拟API调用
          await new Promise((resolve) => setTimeout(resolve, 500));
          createMessage.success(`成功删除 ${selectedRowKeys.value.length} 条规则`);
          selectedRowKeys.value = [];
          reload();
        } catch (error) {
          createMessage.error('批量删除失败');
        }
      }

      /**
       * 导出规则
       */
      function handleExport() {
        createMessage.info('导出功能开发中...');
      }

      /**
       * 搜索
       */
      function handleSearch(value: string) {
        console.log('搜索:', value);
        reload();
      }

      /**
       * 刷新
       */
      function handleRefresh() {
        reload();
      }

      /**
       * 行点击
       */
      function handleRowClick(record: Recordable) {
        console.log('行点击:', record);
      }

      /**
       * 操作成功回调
       */
      function handleSuccess() {
        reload();
      }

      return {
        registerTable,
        registerModal,
        rowSelection,
        hasSelected,
        searchText,
        getSeverityColor,
        getSeverityText,
        handleAdd,
        handleEdit,
        handleView,
        handleDelete,
        handleBatchDelete,
        handleExport,
        handleSearch,
        handleRefresh,
        handleRowClick,
        handleSuccess,
      };
    },
  });
</script>

<style lang="less" scoped>
  .code-review-container {
    .operation-bar {
      margin-bottom: 16px;
      padding: 16px;
      background: #fff;
      border-radius: 6px;
    }
  }
</style>