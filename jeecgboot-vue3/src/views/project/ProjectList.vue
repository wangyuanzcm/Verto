<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" @click="handleCreateWizard" preIcon="ant-design:plus-outlined">
          创建项目
        </a-button>
        <a-button @click="handleAdd" preIcon="ant-design:edit-outlined">
          快速新增
        </a-button>
        <a-select
          v-model:value="currentTaskType"
          placeholder="选择项目类型"
          style="width: 150px; margin-left: 8px"
          @change="handleTaskTypeChange"
        >
          <a-select-option value="">全部</a-select-option>
          <a-select-option :value="TaskType.REQUIREMENT">需求</a-select-option>
          <a-select-option :value="TaskType.BUG">BUG</a-select-option>
        </a-select>
        <a-button
          type="primary"
          @click="handleBatchDelete"
          :disabled="!selectedRowKeys.length"
          preIcon="ant-design:delete-outlined"
          danger
          style="margin-left: 8px"
        >
          批量删除
        </a-button>
      </template>

      <!-- 状态列 -->
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>



      <!-- 任务类型列 -->
      <template #taskType="{ record }">
        <a-tag :color="getTaskTypeColor(record.taskType)">
          {{ getTaskTypeText(record.taskType) }}
        </a-tag>
      </template>

      <!-- 需求/BUG ID列 -->
      <template #taskId="{ record }">
        <span v-if="record.taskType === 'REQUIREMENT'">
          <a-tag color="blue">{{ record.requirementId }}</a-tag>
        </span>
        <span v-else-if="record.taskType === 'BUG'">
          <a-tag color="red">{{ record.bugId }}</a-tag>
        </span>
        <span v-else>-</span>
      </template>

      <!-- 开发模式列 -->
      <template #developmentMode="{ record }">
        <a-tag :color="getDevelopmentModeColor(record.developmentMode)">
          {{ getDevelopmentModeText(record.developmentMode) }}
        </a-tag>
      </template>

      <!-- Git分支状态列 -->
      <template #gitBranchStatus="{ record }">
        <div v-if="record.gitBranches && record.gitBranches.length > 0">
          <a-tag 
            v-for="branch in record.gitBranches.slice(0, 2)" 
            :key="branch.id"
            :color="getBranchStatusColor(branch.status)"
            size="small"
          >
            {{ branch.branchName }}
          </a-tag>
          <a-tag v-if="record.gitBranches.length > 2" size="small">
            +{{ record.gitBranches.length - 2 }}
          </a-tag>
        </div>
        <span v-else>无分支</span>
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

    <!-- 编辑弹窗 -->
    <ProjectModal @register="registerModal" @success="handleSuccess" />
    
    <!-- 项目创建向导 -->
    <ProjectCreateWizard @register="registerWizardModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, computed, unref, ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  // import { useListPage } from '/@/hooks/system/useListPage';
  import { 
    getColumns, 
    searchFormSchema, 
    ProjectStatus, 
    TaskType,
    DevelopmentMode
  } from './Project.data';
  import { getProjectList, deleteProject, batchDeleteProject } from './Project.api';
  import ProjectModal from './components/ProjectModal.vue';
  import ProjectCreateWizard from './components/ProjectCreateWizard.vue';
  import { useGo } from '/@/hooks/web/usePage';
  import { Icon } from '/@/components/Icon';

  const go = useGo();

  // 当前项目类型筛选
  const currentTaskType = ref('');

  // 表格配置
  const [registerTable, { reload, getSelectRows, setColumns }] = useTable({
    title: '项目列表',
    api: getProjectList,
    rowKey: 'id',
    columns: getColumns(),
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
      // 添加项目类型筛选
      if (currentTaskType.value) {
        info.taskType = currentTaskType.value;
      }
      return info;
    },
    actionColumn: {
      width: 120,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
  });

  /**
   * 任务类型变化处理
   */
  function handleTaskTypeChange(value: string) {
    currentTaskType.value = value;
    // 动态更新表格列配置
    const newColumns = getColumns(value as TaskType);
    setColumns(newColumns);
    reload();
  }

  // 弹窗配置
  const [registerModal, { openModal }] = useModal();
  const [registerWizardModal, { openModal: openWizardModal }] = useModal();

  // 多选
  const selectedRowKeys = computed(() => {
    try {
      return getSelectRows().map(item => item.id);
    } catch (error) {
      return [];
    }
  });
  const selectedRows = computed(() => {
    try {
      return getSelectRows();
    } catch (error) {
      return [];
    }
  });
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
   * 新增事件
   */
  function handleAdd() {
    openModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 创建项目向导
   */
  function handleCreateWizard() {
    openWizardModal(true, {});
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
      [ProjectStatus.DEVELOPING]: 'processing',
      [ProjectStatus.TESTING]: 'orange',
      [ProjectStatus.DEPLOYED]: 'success',
      [ProjectStatus.MAINTENANCE]: 'warning',
      [ProjectStatus.ARCHIVED]: 'default',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取状态文本
   */
  function getStatusText(status: ProjectStatus) {
    const textMap = {
      [ProjectStatus.PLANNING]: '规划中',
      [ProjectStatus.DEVELOPING]: '开发中',
      [ProjectStatus.TESTING]: '测试中',
      [ProjectStatus.DEPLOYED]: '已部署',
      [ProjectStatus.MAINTENANCE]: '维护中',
      [ProjectStatus.ARCHIVED]: '已归档',
    };
    return textMap[status] || '未知';
  }





  /**
   * 获取任务类型颜色
   */
  function getTaskTypeColor(taskType: TaskType) {
    const colorMap = {
      [TaskType.REQUIREMENT]: 'blue',
      [TaskType.BUG]: 'red',
    };
    return colorMap[taskType] || 'default';
  }

  /**
   * 获取任务类型文本
   */
  function getTaskTypeText(taskType: TaskType) {
    const textMap = {
      [TaskType.REQUIREMENT]: '需求',
      [TaskType.BUG]: 'BUG',
    };
    return textMap[taskType] || '未知';
  }

  /**
   * 获取开发模式颜色
   */
  function getDevelopmentModeColor(mode: DevelopmentMode) {
    const colorMap = {
      [DevelopmentMode.L1]: 'green',
      [DevelopmentMode.L2]: 'blue',
      [DevelopmentMode.L3]: 'purple',
    };
    return colorMap[mode] || 'default';
  }

  /**
   * 获取开发模式文本
   */
  function getDevelopmentModeText(mode: DevelopmentMode) {
    const textMap = {
      [DevelopmentMode.L1]: 'L1-直接开发',
      [DevelopmentMode.L2]: 'L2-模板开发',
      [DevelopmentMode.L3]: 'L3-可视化配置',
    };
    return textMap[mode] || '未知';
  }

  /**
   * 获取分支状态颜色
   */
  function getBranchStatusColor(status: string) {
    const colorMap = {
      'ACTIVE': 'processing',
      'MERGED': 'success',
      'DELETED': 'default',
    };
    return colorMap[status] || 'default';
  }
</script>

<style lang="less" scoped>
</style>