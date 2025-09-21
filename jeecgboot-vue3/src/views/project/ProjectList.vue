<template>
  <div class="project-list">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!-- 工具栏 -->
      <template #tableTitle>
        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined">
          新增项目
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
        <a-dropdown v-if="selectedRowKeys.length === 1">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="handleEdit(selectedRows[0])">
                <Icon icon="clarity:note-edit-line" />
                编辑
              </a-menu-item>
              <a-menu-item key="2" @click="handleDetail(selectedRows[0])">
                <Icon icon="ant-design:eye-outlined" />
                详情
              </a-menu-item>
              <a-menu-item key="3" @click="handleCopy(selectedRows[0])">
                <Icon icon="ant-design:copy-outlined" />
                复制
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>
            批量操作
            <Icon icon="mdi:chevron-down" />
          </a-button>
        </a-dropdown>
      </template>

      <!-- 状态列 -->
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>

      <!-- 优先级列 -->
      <template #priority="{ record }">
        <a-tag :color="getPriorityColor(record.priority)">
          {{ getPriorityText(record.priority) }}
        </a-tag>
      </template>

      <!-- 类型列 -->
      <template #type="{ record }">
        <a-tag>{{ getTypeText(record.type) }}</a-tag>
      </template>

      <!-- 进度列 -->
      <template #progress="{ record }">
        <a-progress
          :percent="record.progress"
          :size="'small'"
          :status="record.progress === 100 ? 'success' : 'active'"
        />
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
    <ProjectModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, computed, unref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { columns, searchFormSchema, ProjectStatus, ProjectPriority, ProjectType } from './Project.data';
  import { getProjectList, deleteProject, batchDeleteProject } from './Project.api';
  import ProjectModal from './components/ProjectModal.vue';
  import { useGo } from '/@/hooks/web/usePage';
  import { Icon } from '/@/components/Icon';

  defineOptions({ name: 'ProjectList' });

  const go = useGo();

  // 表格配置
  const [registerTable, { reload, getSelectRows }] = useTable({
    title: '项目列表',
    api: getProjectList,
    rowKey: 'id',
    columns,
    formConfig: {
      labelWidth: 120,
      schemas: searchFormSchema,
      autoSubmitOnEnter: true,
    },
    useSearchForm: true,
    showTableSetting: true,
    bordered: true,
    handleSearchInfoFn(info) {
      console.log('handleSearchInfoFn', info);
      return info;
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

  // 多选
  const selectedRowKeys = computed(() => getSelectRows().map(item => item.id));
  const selectedRows = computed(() => getSelectRows());
  const rowSelection = {
    type: 'checkbox',
    selectedRowKeys: unref(selectedRowKeys),
    onChange: onSelectChange,
    onSelect: onSelect,
    onSelectAll: onSelectAll,
  };

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[], selectedRows: any[]) {
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
   * 新增
   */
  function handleAdd() {
    openModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑
   */
  function handleEdit(record: Recordable) {
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 详情
   */
  function handleDetail(record: Recordable) {
    go(`/project/detail/${record.id}`);
  }

  /**
   * 复制
   */
  function handleCopy(record: Recordable) {
    openModal(true, {
      record: { ...record, id: undefined, name: `${record.name}_copy` },
      isUpdate: false,
    });
  }

  /**
   * 删除
   */
  async function handleDelete(record: Recordable) {
    await deleteProject({ id: record.id }, handleSuccess);
  }

  /**
   * 批量删除
   */
  async function handleBatchDelete() {
    await batchDeleteProject({ ids: selectedRowKeys.value.join(',') }, handleSuccess);
  }

  /**
   * 成功回调
   */
  function handleSuccess() {
    reload();
  }

  /**
   * 获取状态颜色
   */
  function getStatusColor(status: ProjectStatus) {
    const colorMap = {
      [ProjectStatus.PLANNING]: 'blue',
      [ProjectStatus.IN_PROGRESS]: 'processing',
      [ProjectStatus.TESTING]: 'orange',
      [ProjectStatus.COMPLETED]: 'success',
      [ProjectStatus.SUSPENDED]: 'warning',
      [ProjectStatus.CANCELLED]: 'error',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取状态文本
   */
  function getStatusText(status: ProjectStatus) {
    const textMap = {
      [ProjectStatus.PLANNING]: '规划中',
      [ProjectStatus.IN_PROGRESS]: '进行中',
      [ProjectStatus.TESTING]: '测试中',
      [ProjectStatus.COMPLETED]: '已完成',
      [ProjectStatus.SUSPENDED]: '已暂停',
      [ProjectStatus.CANCELLED]: '已取消',
    };
    return textMap[status] || '未知';
  }

  /**
   * 获取优先级颜色
   */
  function getPriorityColor(priority: ProjectPriority) {
    const colorMap = {
      [ProjectPriority.LOW]: 'green',
      [ProjectPriority.MEDIUM]: 'blue',
      [ProjectPriority.HIGH]: 'orange',
      [ProjectPriority.URGENT]: 'red',
    };
    return colorMap[priority] || 'default';
  }

  /**
   * 获取优先级文本
   */
  function getPriorityText(priority: ProjectPriority) {
    const textMap = {
      [ProjectPriority.LOW]: '低',
      [ProjectPriority.MEDIUM]: '中',
      [ProjectPriority.HIGH]: '高',
      [ProjectPriority.URGENT]: '紧急',
    };
    return textMap[priority] || '未知';
  }

  /**
   * 获取类型文本
   */
  function getTypeText(type: ProjectType) {
    const textMap = {
      [ProjectType.WEB]: 'Web应用',
      [ProjectType.MOBILE]: '移动应用',
      [ProjectType.DESKTOP]: '桌面应用',
      [ProjectType.API]: 'API服务',
      [ProjectType.LIBRARY]: '组件库',
      [ProjectType.OTHER]: '其他',
    };
    return textMap[type] || '未知';
  }
</script>

<style lang="less" scoped>
  .project-list {
    padding: 16px;
    background: #fff;
    border-radius: 6px;
  }
</style>