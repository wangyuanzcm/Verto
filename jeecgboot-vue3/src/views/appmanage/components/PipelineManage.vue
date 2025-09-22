<!--流水线管理-->
<template>
  <div class="pipeline-container">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="handleAdd">
              <template #icon><PlusOutlined /></template>
              新建流水线
            </a-button>
            <a-button @click="handleBatchRun" :disabled="!hasSelected">
              <template #icon><PlayCircleOutlined /></template>
              批量执行
            </a-button>
            <a-button @click="handleBatchStop" :disabled="!hasSelected">
              <template #icon><PauseCircleOutlined /></template>
              批量停止
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="12" style="text-align: right">
          <a-space>
            <a-input-search
              v-model:value="searchText"
              placeholder="搜索流水线名称"
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

    <!-- 流水线列表 -->
    <BasicTable
      @register="registerTable"
      :rowSelection="rowSelection"
      @row-click="handleRowClick"
    >
      <template #toolbar>
        <a-button type="primary" @click="handleAdd">
          <Icon icon="ant-design:plus-outlined" />
          新建流水线
        </a-button>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'lastRunStatus'">
          <a-tag :color="getRunStatusColor(record.lastRunStatus)">
            {{ getRunStatusText(record.lastRunStatus) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                icon: 'ant-design:play-circle-outlined',
                tooltip: '执行',
                color: 'success',
                onClick: handleRun.bind(null, record),
                ifShow: record.status === 'active',
              },
              {
                icon: 'ant-design:pause-circle-outlined',
                tooltip: '停止',
                color: 'warning',
                onClick: handleStop.bind(null, record),
                ifShow: record.lastRunStatus === 'running',
              },
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

    <!-- 流水线配置弹窗 -->
    <PipelineModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, computed } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { Icon } from '/@/components/Icon';
  import { message } from 'ant-design-vue';
  import { 
    PlusOutlined, 
    PlayCircleOutlined, 
    PauseCircleOutlined, 
    ReloadOutlined 
  } from '@ant-design/icons-vue';
  
  import PipelineModal from './PipelineModal.vue';
  import { pipelineColumns, pipelineData } from '../data/PipelineData';

  export default defineComponent({
    name: 'PipelineManage',
    components: {
      BasicTable,
      TableAction,
      Icon,
      PipelineModal,
      PlusOutlined,
      PlayCircleOutlined,
      PauseCircleOutlined,
      ReloadOutlined,
    },
    setup() {
      const { createMessage } = message;
      const searchText = ref('');
      const selectedRowKeys = ref<string[]>([]);

      const [registerTable, { reload, getSelectRows }] = useTable({
        title: '流水线列表',
        api: () => Promise.resolve({ items: pipelineData, total: pipelineData.length }),
        columns: pipelineColumns,
        formConfig: {
          labelWidth: 120,
          schemas: [
            {
              field: 'pipelineName',
              label: '流水线名称',
              component: 'Input',
              componentProps: {
                placeholder: '请输入流水线名称',
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
            {
              field: 'lastRunStatus',
              label: '执行状态',
              component: 'Select',
              componentProps: {
                placeholder: '请选择执行状态',
                options: [
                  { label: '成功', value: 'success' },
                  { label: '失败', value: 'failed' },
                  { label: '运行中', value: 'running' },
                  { label: '已取消', value: 'cancelled' },
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
          width: 200,
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
       * 获取状态颜色
       */
      function getStatusColor(status: string) {
        const colorMap = {
          active: 'green',
          inactive: 'red',
        };
        return colorMap[status] || 'default';
      }

      /**
       * 获取状态文本
       */
      function getStatusText(status: string) {
        const textMap = {
          active: '启用',
          inactive: '禁用',
        };
        return textMap[status] || status;
      }

      /**
       * 获取执行状态颜色
       */
      function getRunStatusColor(status: string) {
        const colorMap = {
          success: 'green',
          failed: 'red',
          running: 'blue',
          cancelled: 'orange',
        };
        return colorMap[status] || 'default';
      }

      /**
       * 获取执行状态文本
       */
      function getRunStatusText(status: string) {
        const textMap = {
          success: '成功',
          failed: '失败',
          running: '运行中',
          cancelled: '已取消',
        };
        return textMap[status] || status;
      }

      /**
       * 新建流水线
       */
      function handleAdd() {
        openModal(true, {
          isUpdate: false,
        });
      }

      /**
       * 编辑流水线
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
       * 执行流水线
       */
      async function handleRun(record: Recordable) {
        try {
          createMessage.loading('正在启动流水线...', 2);
          // 模拟API调用
          await new Promise((resolve) => setTimeout(resolve, 1000));
          createMessage.success('流水线启动成功');
          reload();
        } catch (error) {
          createMessage.error('流水线启动失败');
        }
      }

      /**
       * 停止流水线
       */
      async function handleStop(record: Recordable) {
        try {
          createMessage.loading('正在停止流水线...', 2);
          // 模拟API调用
          await new Promise((resolve) => setTimeout(resolve, 1000));
          createMessage.success('流水线已停止');
          reload();
        } catch (error) {
          createMessage.error('停止流水线失败');
        }
      }

      /**
       * 复制流水线
       */
      async function handleCopy(record: Recordable) {
        try {
          // 模拟API调用
          await new Promise((resolve) => setTimeout(resolve, 500));
          createMessage.success('流水线复制成功');
          reload();
        } catch (error) {
          createMessage.error('复制失败');
        }
      }

      /**
       * 删除流水线
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
       * 批量执行
       */
      async function handleBatchRun() {
        if (selectedRowKeys.value.length === 0) {
          createMessage.warning('请选择要执行的流水线');
          return;
        }
        
        try {
          createMessage.loading('正在批量启动流水线...', 2);
          // 模拟API调用
          await new Promise((resolve) => setTimeout(resolve, 1500));
          createMessage.success(`成功启动 ${selectedRowKeys.value.length} 个流水线`);
          selectedRowKeys.value = [];
          reload();
        } catch (error) {
          createMessage.error('批量启动失败');
        }
      }

      /**
       * 批量停止
       */
      async function handleBatchStop() {
        if (selectedRowKeys.value.length === 0) {
          createMessage.warning('请选择要停止的流水线');
          return;
        }
        
        try {
          createMessage.loading('正在批量停止流水线...', 2);
          // 模拟API调用
          await new Promise((resolve) => setTimeout(resolve, 1000));
          createMessage.success(`成功停止 ${selectedRowKeys.value.length} 个流水线`);
          selectedRowKeys.value = [];
          reload();
        } catch (error) {
          createMessage.error('批量停止失败');
        }
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
        getStatusColor,
        getStatusText,
        getRunStatusColor,
        getRunStatusText,
        handleAdd,
        handleEdit,
        handleView,
        handleRun,
        handleStop,
        handleCopy,
        handleDelete,
        handleBatchRun,
        handleBatchStop,
        handleSearch,
        handleRefresh,
        handleRowClick,
        handleSuccess,
      };
    },
  });
</script>

<style lang="less" scoped>
  .pipeline-container {
    .operation-bar {
      margin-bottom: 16px;
      padding: 16px;
      background: #fff;
      border-radius: 6px;
    }
  }
</style>