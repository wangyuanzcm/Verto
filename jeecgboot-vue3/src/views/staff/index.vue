<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate"> 新增</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>
            批量操作
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <!--人员详情弹窗-->
    <StaffModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="system-staff" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
  import { Icon } from '/@/components/Icon';
  import StaffModal from './StaffModal.vue';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useRouter } from 'vue-router';
  import { columns, searchFormSchema, StaffModel } from './staff.data';
  import { getStaffList, deleteStaff, batchDeleteStaff, getImportUrl, getExportUrl } from './staff.api';

  const { createMessage, createConfirm } = useMessage();
  const router = useRouter();
  
  // 注册弹窗
  const [registerModal, { openModal }] = useModal();
  
  // 列表页面公共参数、方法
  const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
    designScope: 'staff-list',
    tableProps: {
      title: '人员管理',
      api: getStaffList,
      columns: columns,
      size: 'small',
      formConfig: {
        schemas: searchFormSchema,
      },
      useSearchForm: true,
      showTableSetting: true,
      tableSetting: {
        fullScreen: true,
      },
      actionColumn: {
        width: 150,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
      },
      beforeFetch: (params) => {
        return Object.assign({ column: 'createTime', order: 'desc' }, params);
      },
    },
    exportConfig: {
      name: '人员管理',
      url: getExportUrl,
    },
    importConfig: {
      url: getImportUrl,
    },
  });

  // 注册table数据
  const [registerTable, { reload }, { rowSelection, selectedRows, selectedRowKeys }] = tableContext;

  /**
   * 新增人员
   */
  function handleCreate() {
    router.push('/staff/create');
  }

  /**
   * 编辑人员
   * @param record 人员记录
   */
  function handleEdit(record: StaffModel) {
    router.push(`/staff/edit/${record.id}`);
  }

  /**
   * 查看人员详情
   * @param record 人员记录
   */
  function handleView(record: StaffModel) {
    router.push(`/staff/detail/${record.id}`);
  }

  /**
   * 删除人员
   * @param record 人员记录
   */
  function handleDelete(record: StaffModel) {
    deleteStaff({ id: record.id }, handleSuccess);
  }

  /**
   * 批量删除
   */
  function batchHandleDelete() {
    if (selectedRowKeys.value.length === 0) {
      createMessage.warning('请选择要删除的数据');
      return;
    }
    batchDeleteStaff({ ids: selectedRowKeys.value.join(',') }, handleSuccess);
  }

  /**
   * 成功回调
   */
  function handleSuccess() {
    selectedRowKeys.value = [];
    reload();
  }

  /**
   * 获取表格操作按钮
   * @param record 当前行记录
   */
  function getTableAction(record: StaffModel): ActionItem[] {
    return [
      {
        label: '查看',
        icon: 'ant-design:eye-outlined',
        onClick: handleView.bind(null, record),
      },
      {
        label: '编辑',
        icon: 'clarity:note-edit-line',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        icon: 'ant-design:delete-outlined',
        color: 'error',
        popConfirm: {
          title: '是否确认删除',
          placement: 'left',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }
</script>

<style scoped>
  .ant-btn {
    margin-right: 8px;
  }
</style>