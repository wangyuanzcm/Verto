<template>
  <div class="project-tasks">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!-- 工具栏 -->
      <template #tableTitle>
        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined">
          新增任务
        </a-button>
        <a-button
          type="primary"
          @click="handleBatchDelete"
          :disabled="!selectedRowKeys.length"
          preIcon="ant-design:delete-outlined"
          color="error"
        >
          批量删除
        </a-button>
      </template>

      <!-- 状态列 -->
      <template #status="{ record }">
        <a-tag :color="getTaskStatusColor(record.status)">
          {{ getTaskStatusText(record.status) }}
        </a-tag>
      </template>

      <!-- 优先级列 -->
      <template #priority="{ record }">
        <a-tag :color="getPriorityColor(record.priority)">
          {{ getPriorityText(record.priority) }}
        </a-tag>
      </template>

      <!-- 进度列 -->
      <template #progress="{ record }">
        <a-progress
          :percent="record.progress"
          :size="'small'"
          :status="record.progress === 100 ? 'success' : 'active'"
        />
      </template>

      <!-- 负责人列 -->
      <template #assignee="{ record }">
        <div class="assignee-info">
          <a-avatar :size="24" :src="record.assignee?.avatar">
            {{ record.assignee?.name?.charAt(0) }}
          </a-avatar>
          <span class="assignee-name">{{ record.assignee?.name }}</span>
        </div>
      </template>

      <!-- 操作列 -->
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: 'clarity:info-standard-line',
              tooltip: '详情',
              onClick: handleDetail.bind(null, record),
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
    </BasicTable>

    <!-- 新增/编辑弹窗 -->
    <TaskModal @register="registerModal" @success="handleSuccess" />

    <!-- 任务详情抽屉 -->
    <TaskDetailDrawer @register="registerDrawer" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, unref, onMounted } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import { getProjectTaskList, deleteProjectTask } from '../Project.api';
  import TaskModal from './TaskModal.vue';
  import TaskDetailDrawer from './TaskDetailDrawer.vue';

  interface Props {
    projectId: string;
  }

  const props = defineProps<Props>();

  // 任务状态枚举
  enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    TESTING = 'testing',
    DONE = 'done',
    CANCELLED = 'cancelled',
  }

  // 优先级枚举
  enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
  }

  // 表格列配置
  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      slots: { customRender: 'status' },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      slots: { customRender: 'priority' },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 120,
      slots: { customRender: 'progress' },
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      width: 120,
      slots: { customRender: 'assignee' },
    },
    {
      title: '开始时间',
      dataIndex: 'startDate',
      width: 120,
    },
    {
      title: '结束时间',
      dataIndex: 'endDate',
      width: 120,
    },
  ];

  // 表格配置
  const [registerTable, { reload, getSelectRows }] = useTable({
    title: '任务列表',
    api: getProjectTaskList,
    rowKey: 'id',
    columns,
    useSearchForm: false,
    showTableSetting: true,
    bordered: true,
    beforeFetch: (params) => {
      return { ...params, projectId: props.projectId };
    },
    actionColumn: {
      width: 120,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
  });

  // 弹窗配置
  const [registerModal, { openModal }] = useModal();
  const [registerDrawer, { openDrawer }] = useDrawer();

  // 多选
  const selectedRowKeys = computed(() => getSelectRows().map(item => item.id));
  const rowSelection = {
    type: 'checkbox',
    selectedRowKeys: unref(selectedRowKeys),
  };

  /**
   * 新增任务
   */
  function handleAdd() {
    openModal(true, {
      isUpdate: false,
      projectId: props.projectId,
    });
  }

  /**
   * 编辑任务
   */
  function handleEdit(record: Recordable) {
    openModal(true, {
      record,
      isUpdate: true,
      projectId: props.projectId,
    });
  }

  /**
   * 查看详情
   */
  function handleDetail(record: Recordable) {
    openDrawer(true, {
      record,
      projectId: props.projectId,
    });
  }

  /**
   * 删除任务
   */
  async function handleDelete(record: Recordable) {
    await deleteProjectTask({ id: record.id }, handleSuccess);
  }

  /**
   * 批量删除
   */
  async function handleBatchDelete() {
    // 实现批量删除逻辑
    console.log('批量删除任务:', selectedRowKeys.value);
  }

  /**
   * 成功回调
   */
  function handleSuccess() {
    reload();
  }

  /**
   * 获取任务状态颜色
   */
  function getTaskStatusColor(status: TaskStatus) {
    const colorMap = {
      [TaskStatus.TODO]: 'default',
      [TaskStatus.IN_PROGRESS]: 'processing',
      [TaskStatus.TESTING]: 'orange',
      [TaskStatus.DONE]: 'success',
      [TaskStatus.CANCELLED]: 'error',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取任务状态文本
   */
  function getTaskStatusText(status: TaskStatus) {
    const textMap = {
      [TaskStatus.TODO]: '待办',
      [TaskStatus.IN_PROGRESS]: '进行中',
      [TaskStatus.TESTING]: '测试中',
      [TaskStatus.DONE]: '已完成',
      [TaskStatus.CANCELLED]: '已取消',
    };
    return textMap[status] || '未知';
  }

  /**
   * 获取优先级颜色
   */
  function getPriorityColor(priority: TaskPriority) {
    const colorMap = {
      [TaskPriority.LOW]: 'green',
      [TaskPriority.MEDIUM]: 'blue',
      [TaskPriority.HIGH]: 'orange',
      [TaskPriority.URGENT]: 'red',
    };
    return colorMap[priority] || 'default';
  }

  /**
   * 获取优先级文本
   */
  function getPriorityText(priority: TaskPriority) {
    const textMap = {
      [TaskPriority.LOW]: '低',
      [TaskPriority.MEDIUM]: '中',
      [TaskPriority.HIGH]: '高',
      [TaskPriority.URGENT]: '紧急',
    };
    return textMap[priority] || '未知';
  }

  // 生命周期
  onMounted(() => {
    reload();
  });
</script>

<style lang="less" scoped>
  .project-tasks {
    .assignee-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .assignee-name {
        font-size: 12px;
      }
    }
  }
</style>