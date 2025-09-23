<template>
  <div class="project-related-apps">
    <!-- 工具栏 -->
    <div class="toolbar">
      <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined">
        添加关联应用
      </a-button>
      <a-button
        type="primary"
        danger
        @click="handleBatchDelete"
        :disabled="!selectedRowKeys.length"
        preIcon="ant-design:delete-outlined"
      >
        批量删除
      </a-button>
    </div>

    <!-- 关联应用列表 -->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!-- 状态列 -->
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>

      <!-- 操作列 -->
      <template #action="{ record }">
        <TableAction
          :actions="[
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
    </BasicTable>

    <!-- 添加/编辑弹窗 -->
    <RelatedAppModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import RelatedAppModal from './RelatedAppModal.vue';

  // 定义组件的 props
  const props = defineProps<{
    projectId: string;
  }>();

  const emit = defineEmits(['update']);

  const { createMessage } = useMessage();

  // 关联应用列表列配置
  const columns = [
    {
      title: '应用名称',
      dataIndex: 'appName',
      width: 200,
    },
    {
      title: '应用编码',
      dataIndex: 'appCode',
      width: 150,
    },
    {
      title: '应用类型',
      dataIndex: 'appType',
      width: 120,
    },
    {
      title: '开发负责人',
      dataIndex: 'developer',
      width: 120,
    },
    {
      title: '测试负责人',
      dataIndex: 'tester',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      slots: { customRender: 'status' },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
    },
  ];

  // 表格配置
  const [registerTable, { reload, getSelectRows }] = useTable({
    title: '关联应用列表',
    api: getRelatedAppList,
    rowKey: 'id',
    columns,
    useSearchForm: false,
    showTableSetting: true,
    bordered: true,
    actionColumn: {
      width: 120,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
  });

  // 弹窗配置
  const [registerModal, { openModal }] = useModal();

  // 多选
  const selectedRowKeys = computed(() => {
    try {
      return getSelectRows().map(item => item.id);
    } catch (error) {
      return [];
    }
  });

  const rowSelection = {
    type: 'checkbox',
    selectedRowKeys: selectedRowKeys,
    onChange: onSelectChange,
    onSelect: onSelect,
    onSelectAll: onSelectAll,
  };

  /**
   * 获取关联应用列表
   */
  async function getRelatedAppList(params: any) {
    // 模拟API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          items: [
            {
              id: '1',
              appName: '用户管理系统',
              appCode: 'user-system',
              appType: 'Web应用',
              developer: '张三',
              tester: '李四',
              status: 'development',
              createTime: '2024-01-15 10:30:00',
            },
            {
              id: '2',
              appName: '订单管理系统',
              appCode: 'order-system',
              appType: 'Web应用',
              developer: '王五',
              tester: '赵六',
              status: 'testing',
              createTime: '2024-01-16 14:20:00',
            },
          ],
          total: 2,
        });
      }, 500);
    });
  }

  /**
   * 获取状态颜色
   */
  function getStatusColor(status: string) {
    const colorMap = {
      development: 'blue',
      testing: 'orange',
      production: 'green',
      maintenance: 'red',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取状态文本
   */
  function getStatusText(status: string) {
    const textMap = {
      development: '开发中',
      testing: '测试中',
      production: '已上线',
      maintenance: '维护中',
    };
    return textMap[status] || '未知';
  }

  /**
   * 选择改变事件
   */
  function onSelectChange(selectedRowKeys: string[], selectedRows: any[]) {
    console.log('selectedRowKeys changed: ', selectedRowKeys, selectedRows);
  }

  /**
   * 单选事件
   */
  function onSelect(record: any, selected: boolean, selectedRows: any[]) {
    console.log('record', record, selected, selectedRows);
  }

  /**
   * 全选事件
   */
  function onSelectAll(selected: boolean, selectedRows: any[], changeRows: any[]) {
    console.log('onSelectAll', selected, selectedRows, changeRows);
  }

  /**
   * 添加关联应用
   */
  function handleAdd() {
    openModal(true, {
      isUpdate: false,
      projectId: props.projectId,
    });
  }

  /**
   * 编辑关联应用
   */
  function handleEdit(record: Recordable) {
    openModal(true, {
      record,
      isUpdate: true,
      projectId: props.projectId,
    });
  }

  /**
   * 删除关联应用
   */
  async function handleDelete(record: Recordable) {
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 500));
      createMessage.success('删除成功！');
      reload();
    } catch (error) {
      createMessage.error('删除失败！');
    }
  }

  /**
   * 批量删除
   */
  async function handleBatchDelete() {
    if (!selectedRowKeys.value.length) {
      createMessage.warning('请选择要删除的数据！');
      return;
    }

    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 500));
      createMessage.success(`成功删除 ${selectedRowKeys.value.length} 条数据！`);
      reload();
    } catch (error) {
      createMessage.error('批量删除失败！');
    }
  }

  /**
   * 操作成功回调
   */
  function handleSuccess() {
    reload();
    emit('update');
  }
</script>

<style lang="less" scoped>
  .project-related-apps {
    .toolbar {
      margin-bottom: 16px;
      display: flex;
      gap: 8px;
    }
  }
</style>