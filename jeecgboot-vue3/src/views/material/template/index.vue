<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #toolbar>
        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined"> 新增</a-button>
        <a-button
          type="primary"
          preIcon="ant-design:export-outlined"
          @click="onExportXls"
          :loading="exportLoading"
        >
          导出
        </a-button>
        <j-upload-button
          type="primary"
          preIcon="ant-design:import-outlined"
          @click="onImportXls"
          :loading="importLoading"
        >
          导入
        </j-upload-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button
            >批量操作
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <TemplateModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import TemplateModal from './TemplateModal.vue';
  import { templateColumns, templateSearchFormSchema } from '../material.data';
  import { getTemplateList, deleteTemplate, batchDeleteTemplate, getExportUrl, getImportUrl } from '../material.api';

  /**
   * 模板管理页面
   * 提供模板的增删改查功能
   */
  defineOptions({ name: 'TemplateManagement' });

  const [registerModal, { openModal }] = useModal();
  const { prefixCls, tableContext, onExportXls, onImportXls, exportLoading, importLoading } = useListPage({
    tableProps: {
      title: '模板管理',
      api: getTemplateList,
      columns: templateColumns,
      canResize: false,
      formConfig: {
        labelWidth: 120,
        schemas: templateSearchFormSchema,
        autoSubmitOnEnter: true,
      },
      actionColumn: {
        width: 120,
        fixed: 'right',
      },
      beforeFetch: (params) => {
        return Object.assign({ column: 'createTime', order: 'desc' }, params);
      },
    },
    exportConfig: {
      name: '模板管理',
      url: getExportUrl,
    },
    importConfig: {
      url: getImportUrl,
    },
  });

  const [registerTable, { reload, getSelectRows }] = tableContext;

  const selectedRowKeys = ref<string[]>([]);
  const selectionRows = ref([]);
  const rowSelection = {
    type: 'checkbox',
    columnWidth: 50,
    selectedRowKeys: unref(selectedRowKeys),
    onChange: (changableRowKeys, changeableRows) => {
      selectedRowKeys.value = changableRowKeys;
      selectionRows.value = changeableRows;
    },
  };

  /**
   * 新增模板
   */
  function handleAdd() {
    openModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑模板
   */
  function handleEdit(record: Recordable) {
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 删除模板
   */
  function handleDelete(record) {
    deleteTemplate({ id: record.id }, handleSuccess);
  }

  /**
   * 批量删除模板
   */
  function batchHandleDelete() {
    batchDeleteTemplate({ ids: selectedRowKeys.value }, handleSuccess);
  }

  /**
   * 成功回调
   */
  function handleSuccess() {
    (selectedRowKeys.value = []) && reload();
  }

  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
    ];
  }
</script>

<style scoped></style>