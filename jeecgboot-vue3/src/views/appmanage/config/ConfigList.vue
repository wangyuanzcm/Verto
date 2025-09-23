<template>
  <div class="config-list">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!-- 工具栏 -->
      <template #toolbar>
        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined">
          新增配置
        </a-button>
        <a-button
          type="primary"
          @click="handleBatchDelete"
          :disabled="!selectedRowKeys.length"
          preIcon="ant-design:delete-outlined"
        >
          批量删除
        </a-button>
        <a-button @click="handleExport" preIcon="ant-design:export-outlined">
          导出配置
        </a-button>
        <a-upload
          :show-upload-list="false"
          :before-upload="handleImport"
          accept=".json,.yaml,.yml"
        >
          <a-button preIcon="ant-design:import-outlined">导入配置</a-button>
        </a-upload>
      </template>

      <!-- 配置类型列 -->
      <template #configType="{ record }">
        <a-tag :color="getTypeColor(record.type)">
          {{ getTypeText(record.type) }}
        </a-tag>
      </template>

      <!-- 环境列 -->
      <template #environment="{ record }">
        <a-tag :color="getEnvironmentColor(record.environment)">
          {{ getEnvironmentText(record.environment) }}
        </a-tag>
      </template>

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
              icon: 'ant-design:copy-outlined',
              tooltip: '复制',
              onClick: handleCopy.bind(null, record),
            },
            {
              icon: 'ant-design:eye-outlined',
              tooltip: '查看详情',
              onClick: handleDetail.bind(null, record),
            },
            {
              icon: 'ant-design:cloud-upload-outlined',
              tooltip: '部署',
              onClick: handleDeploy.bind(null, record),
              ifShow: record.status === 'enabled',
            },
            {
              icon: 'ant-design:rollback-outlined',
              tooltip: '回滚',
              onClick: handleRollback.bind(null, record),
              ifShow: record.status === 'enabled',
            },
          ]"
          :dropDownActions="[
            {
              icon: 'ant-design:download-outlined',
              label: '导出',
              onClick: handleExportSingle.bind(null, record),
            },
            {
              icon: 'ant-design:delete-outlined',
              label: '删除',
              color: 'error',
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

    <!-- 新增弹窗 -->
    <ConfigModal @register="registerModal" @success="handleSuccess" />

    <!-- 编辑抽屉 -->
    <ConfigDrawer @register="registerDrawer" @success="handleSuccess" />

    <!-- 部署弹窗 -->
    <DeployModal @register="registerDeployModal" @success="handleSuccess" />

    <!-- 复制弹窗 -->
    <CopyModal @register="registerCopyModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useGo } from '/@/hooks/web/usePage';
  
  import ConfigModal from './components/ConfigModal.vue';
  import ConfigDrawer from './components/ConfigDrawer.vue';
  import DeployModal from './components/DeployModal.vue';
  import CopyModal from './components/CopyModal.vue';
  
  import { configColumns, configSearchFormSchema, ConfigType, ConfigStatus, EnvironmentType } from './data/Config.data';
  import { 
    getConfigList, 
    deleteConfig, 
    exportConfig, 
    importConfig 
  } from './api/Config.api';

  const { createMessage } = useMessage();
  const go = useGo();

  // 选中的行
  const selectedRowKeys = ref<string[]>([]);
  const rowSelection = {
    type: 'checkbox',
    selectedRowKeys,
    onChange: (keys: string[]) => {
      selectedRowKeys.value = keys;
    },
  };

  // 表格配置
  const [registerTable, { reload, getSelectRows }] = useTable({
    title: '配置列表',
    api: getConfigList,
    rowKey: 'id',
    columns: configColumns,
    formConfig: {
      labelWidth: 120,
      schemas: configSearchFormSchema,
      autoSubmitOnEnter: true,
    },
    useSearchForm: true,
    showTableSetting: true,
    bordered: true,
    actionColumn: {
      width: 300,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
  });

  // 弹窗配置
  const [registerModal, { openModal }] = useModal();
  const [registerDeployModal, { openModal: openDeployModal }] = useModal();
  const [registerCopyModal, { openModal: openCopyModal }] = useModal();
  
  // 抽屉配置
  const [registerDrawer, { openDrawer }] = useDrawer();

  /**
   * 新增配置
   */
  function handleAdd() {
    openModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑配置
   */
  function handleEdit(record: Recordable) {
    openDrawer(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 复制配置
   */
  function handleCopy(record: Recordable) {
    openCopyModal(true, {
      record,
    });
  }

  /**
   * 查看详情
   */
  function handleDetail(record: Recordable) {
    go(`/appmanage/config/detail/${record.id}`);
  }

  /**
   * 部署配置
   */
  function handleDeploy(record: Recordable) {
    openDeployModal(true, {
      record,
    });
  }

  /**
   * 回滚配置
   */
  function handleRollback(record: Recordable) {
    // TODO: 实现回滚逻辑
    createMessage.info('回滚功能开发中...');
  }

  /**
   * 删除配置
   */
  async function handleDelete(record: Recordable) {
    try {
      await deleteConfig(record.id);
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
    if (!selectedRowKeys.value.length) {
      createMessage.warning('请选择要删除的配置');
      return;
    }

    try {
      await Promise.all(selectedRowKeys.value.map(id => deleteConfig(id)));
      createMessage.success('批量删除成功');
      selectedRowKeys.value = [];
      reload();
    } catch (error) {
      createMessage.error('批量删除失败');
    }
  }

  /**
   * 导出配置
   */
  async function handleExport() {
    try {
      const rows = getSelectRows();
      const ids = rows.length > 0 ? rows.map(row => row.id) : selectedRowKeys.value;
      
      if (!ids.length) {
        createMessage.warning('请选择要导出的配置');
        return;
      }

      await exportConfig(ids);
      createMessage.success('导出成功');
    } catch (error) {
      createMessage.error('导出失败');
    }
  }

  /**
   * 导出单个配置
   */
  async function handleExportSingle(record: Recordable) {
    try {
      await exportConfig([record.id]);
      createMessage.success('导出成功');
    } catch (error) {
      createMessage.error('导出失败');
    }
  }

  /**
   * 导入配置
   */
  async function handleImport(file: File) {
    try {
      // 这里需要获取当前应用ID，暂时使用固定值
      const appId = 'current-app-id';
      await importConfig(file, appId);
      createMessage.success('导入成功');
      reload();
    } catch (error) {
      createMessage.error('导入失败');
    }
    return false; // 阻止默认上传行为
  }

  /**
   * 操作成功回调
   */
  function handleSuccess() {
    reload();
  }

  /**
   * 获取配置类型文本
   */
  function getTypeText(type: ConfigType): string {
    const typeMap = {
      [ConfigType.PIPELINE]: '流水线配置',
      [ConfigType.TRACKING]: '埋点配置',
      [ConfigType.CODE_REVIEW]: '代码审查配置',
    };
    return typeMap[type] || type;
  }

  /**
   * 获取配置类型颜色
   */
  function getTypeColor(type: ConfigType): string {
    const colorMap = {
      [ConfigType.PIPELINE]: 'blue',
      [ConfigType.TRACKING]: 'green',
      [ConfigType.CODE_REVIEW]: 'purple',
    };
    return colorMap[type] || 'default';
  }

  /**
   * 获取环境文本
   */
  function getEnvironmentText(environment: EnvironmentType): string {
    const envMap = {
      [EnvironmentType.DEV]: '开发',
      [EnvironmentType.TEST]: '测试',
      [EnvironmentType.STAGING]: '预发',
      [EnvironmentType.PROD]: '生产',
    };
    return envMap[environment] || environment;
  }

  /**
   * 获取环境颜色
   */
  function getEnvironmentColor(environment: EnvironmentType): string {
    const colorMap = {
      [EnvironmentType.DEV]: 'default',
      [EnvironmentType.TEST]: 'orange',
      [EnvironmentType.STAGING]: 'cyan',
      [EnvironmentType.PROD]: 'red',
    };
    return colorMap[environment] || 'default';
  }

  /**
   * 获取状态文本
   */
  function getStatusText(status: ConfigStatus): string {
    const statusMap = {
      [ConfigStatus.ENABLED]: '启用',
      [ConfigStatus.DISABLED]: '禁用',
      [ConfigStatus.DRAFT]: '草稿',
    };
    return statusMap[status] || status;
  }

  /**
   * 获取状态颜色
   */
  function getStatusColor(status: ConfigStatus): string {
    const colorMap = {
      [ConfigStatus.ENABLED]: 'success',
      [ConfigStatus.DISABLED]: 'error',
      [ConfigStatus.DRAFT]: 'warning',
    };
    return colorMap[status] || 'default';
  }
</script>

<style lang="less" scoped>
  .config-list {
    padding: 16px;
  }
</style>