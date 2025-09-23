<template>
  <div class="project-timeline">
    <!-- 工具栏 -->
    <div class="toolbar">
      <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined">
        添加时间节点
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

    <!-- 时间线视图切换 -->
    <div class="view-switch">
      <a-radio-group v-model:value="viewMode" @change="handleViewChange">
        <a-radio-button value="table">表格视图</a-radio-button>
        <a-radio-button value="timeline">时间线视图</a-radio-button>
      </a-radio-group>
    </div>

    <!-- 表格视图 -->
    <BasicTable
      v-show="viewMode === 'table'"
      @register="registerTable"
      :rowSelection="rowSelection"
    >
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

    <!-- 时间线视图 -->
    <div v-show="viewMode === 'timeline'" class="timeline-view">
      <a-timeline>
        <a-timeline-item
          v-for="item in timelineData"
          :key="item.id"
          :color="getTimelineColor(item.status)"
        >
          <template #dot>
            <Icon :icon="getTimelineIcon(item.status)" />
          </template>
          <div class="timeline-content">
            <div class="timeline-header">
              <h4>{{ item.title }}</h4>
              <a-tag :color="getStatusColor(item.status)">
                {{ getStatusText(item.status) }}
              </a-tag>
            </div>
            <p class="timeline-description">{{ item.description }}</p>
            <div class="timeline-meta">
              <span class="timeline-time">{{ item.planTime }}</span>
              <span class="timeline-owner">负责人：{{ item.owner }}</span>
              <div class="timeline-actions">
                <a @click="handleEdit(item)">编辑</a>
                <a-divider type="vertical" />
                <a-popconfirm
                  title="是否确认删除？"
                  @confirm="handleDelete(item)"
                  placement="topRight"
                >
                  <a style="color: #ff4d4f">删除</a>
                </a-popconfirm>
              </div>
            </div>
          </div>
        </a-timeline-item>
      </a-timeline>
    </div>

    <!-- 添加/编辑弹窗 -->
    <TimelineModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Icon } from '/@/components/Icon';
  import TimelineModal from './TimelineModal.vue';

  // 定义组件的 emits
  interface Emits {
    (e: 'update'): void;
  }

  const props = defineProps<{
    projectId: string;
  }>();

  const emit = defineEmits(['update']);

  const { createMessage } = useMessage();

  // 视图模式
  const viewMode = ref('table');
  const timelineData = ref([]);

  // 时间节点列表列配置
  const columns = [
    {
      title: '节点名称',
      dataIndex: 'title',
      width: 200,
    },
    {
      title: '节点描述',
      dataIndex: 'description',
      width: 300,
    },
    {
      title: '计划时间',
      dataIndex: 'planTime',
      width: 180,
    },
    {
      title: '实际时间',
      dataIndex: 'actualTime',
      width: 180,
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      slots: { customRender: 'status' },
    },
  ];

  // 表格配置
  const [registerTable, { reload, getSelectRows }] = useTable({
    title: '时间节点列表',
    api: getTimelineList,
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

  onMounted(() => {
    loadTimelineData();
  });

  /**
   * 获取时间节点列表
   */
  async function getTimelineList(params: any) {
    // 模拟API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = [
          {
            id: '1',
            title: '需求分析',
            description: '完成项目需求分析和评审',
            planTime: '2024-01-15',
            actualTime: '2024-01-16',
            owner: '张三',
            status: 'completed',
          },
          {
            id: '2',
            title: '原型设计',
            description: '完成产品原型设计和交互设计',
            planTime: '2024-01-20',
            actualTime: '',
            owner: '李四',
            status: 'in_progress',
          },
          {
            id: '3',
            title: 'UI设计',
            description: '完成界面设计和视觉规范',
            planTime: '2024-01-25',
            actualTime: '',
            owner: '王五',
            status: 'pending',
          },
        ];
        resolve({
          items: data,
          total: data.length,
        });
      }, 500);
    });
  }

  /**
   * 加载时间线数据
   */
  async function loadTimelineData() {
    try {
      const result = await getTimelineList({});
      timelineData.value = result.items;
    } catch (error) {
      console.error('加载时间线数据失败:', error);
    }
  }

  /**
   * 获取状态颜色
   */
  function getStatusColor(status: string) {
    const colorMap = {
      pending: 'default',
      in_progress: 'processing',
      completed: 'success',
      delayed: 'error',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取状态文本
   */
  function getStatusText(status: string) {
    const textMap = {
      pending: '待开始',
      in_progress: '进行中',
      completed: '已完成',
      delayed: '已延期',
    };
    return textMap[status] || '未知';
  }

  /**
   * 获取时间线颜色
   */
  function getTimelineColor(status: string) {
    const colorMap = {
      pending: 'gray',
      in_progress: 'blue',
      completed: 'green',
      delayed: 'red',
    };
    return colorMap[status] || 'gray';
  }

  /**
   * 获取时间线图标
   */
  function getTimelineIcon(status: string) {
    const iconMap = {
      pending: 'ant-design:clock-circle-outlined',
      in_progress: 'ant-design:loading-outlined',
      completed: 'ant-design:check-circle-outlined',
      delayed: 'ant-design:exclamation-circle-outlined',
    };
    return iconMap[status] || 'ant-design:clock-circle-outlined';
  }

  /**
   * 视图切换
   */
  function handleViewChange() {
    if (viewMode.value === 'timeline') {
      loadTimelineData();
    }
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
   * 添加时间节点
   */
  function handleAdd() {
    openModal(true, {
      isUpdate: false,
      projectId: props.projectId,
    });
  }

  /**
   * 编辑时间节点
   */
  function handleEdit(record: Recordable) {
    openModal(true, {
      record,
      isUpdate: true,
      projectId: props.projectId,
    });
  }

  /**
   * 删除时间节点
   */
  async function handleDelete(record: Recordable) {
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 500));
      createMessage.success('删除成功！');
      reload();
      loadTimelineData();
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
      loadTimelineData();
    } catch (error) {
      createMessage.error('批量删除失败！');
    }
  }

  /**
   * 操作成功回调
   */
  function handleSuccess() {
    reload();
    loadTimelineData();
    emit('update');
  }
</script>

<style lang="less" scoped>
  .project-timeline {
    .toolbar {
      margin-bottom: 16px;
      display: flex;
      gap: 8px;
    }

    .view-switch {
      margin-bottom: 16px;
      text-align: right;
    }

    .timeline-view {
      padding: 16px;
      background: #fafafa;

      .timeline-content {
        .timeline-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;

          h4 {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
          }
        }

        .timeline-description {
          color: #666;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .timeline-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 12px;
          color: #999;

          .timeline-time {
            font-weight: 500;
          }

          .timeline-actions {
            margin-left: auto;

            a {
              font-size: 12px;
            }
          }
        }
      }
    }
  }
</style>