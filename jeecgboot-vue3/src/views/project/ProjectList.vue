<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined"> 新增项目</a-button>
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
          <a-button>批量操作
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
      <!--字段回显插槽-->
      <template #htmlSlot="{ text }">
        <div v-html="text"></div>
      </template>
      <!--省市区字段回显插槽-->
      <template #pcaSlot="{ text }">
        {{ getAreaTextByCode(text) }}
      </template>
      <template #fileSlot="{ text }">
        <span v-if="!text" style="font-size: 12px; font-style: italic;">无文件</span>
        <a-button v-else :ghost="true" type="primary" preIcon="ant-design:download-outlined" size="small" @click="downloadFile(text)">下载</a-button>
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <ProjectModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="project-list" setup>
  import { ref, computed, unref } from 'vue';
  import { useRouter } from 'vue-router';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import ProjectModal from './components/ProjectModal.vue';
  import { columns, searchFormSchema } from './Project.data';
  import { 
    getProjectList, 
    deleteProject, 
    batchDeleteProject, 
    exportXls, 
    importExcel 
  } from './Project.api';
  import { downloadByData } from '/@/utils/file/download';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getAreaTextByCode } from '/@/components/Form/src/utils/Area';

  const checkedKeys = ref<Array<string | number>>([]);
  const { createMessage } = useMessage();
  const router = useRouter();
  
  //注册model
  const [registerModal, { openModal }] = useModal();
  
  //注册table数据
  const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
    tableProps: {
      title: '项目管理',
      api: getProjectList,
      columns,
      canResize: false,
      formConfig: {
        //labelWidth: 120,
        schemas: searchFormSchema,
        autoSubmitOnEnter: true,
      },
      actionColumn: {
        width: 120,
        fixed: 'right',
      },
    },
    exportApi: exportXls,
    importApi: importExcel,
  });

  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

  /**
   * 新增事件
   */
  function handleAdd() {
    console.log('点击新增按钮，准备跳转到新增页面');
    // 跳转到独立的新增页面
    router.push('/project/add');
  }

  /**
   * 编辑事件
   */
  function handleEdit(record: Recordable) {
    console.log('点击编辑按钮，准备跳转到编辑页面，记录ID:', record.id);
    // 跳转到独立的编辑页面
    router.push(`/project/edit/${record.id}`);
  }

  /**
   * 详情
   */
  function handleDetail(record: Recordable) {
    console.log('点击详情按钮，准备跳转到详情页面，记录ID:', record.id);
    // 跳转到独立的详情页面
    router.push(`/project/detail/${record.id}`);
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteProject({ id: record.id });
    createMessage.success('删除成功！');
    reload();
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDeleteProject({ ids: selectedRowKeys.value });
    createMessage.success('删除成功！');
    reload();
  }

  /**
   * 成功回调
   */
  function handleSuccess() {
    reload();
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
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }

  /**
   * 下载文件
   */
  function downloadFile(text) {
    if (!text) {
      createMessage.warning('无文件可下载');
      return;
    }
    if (text.indexOf(',') > 0) {
      text = text.substring(0, text.indexOf(','));
    }
    let url = text.split('_')[1];
    downloadByData(url, url);
  }
</script>

<style scoped>

</style>