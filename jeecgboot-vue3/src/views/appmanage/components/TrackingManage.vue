<!--埋点管理组件-->
<template>
  <div class="tracking-manage">
    <!-- 操作栏 -->
    <div class="action-bar">
      <a-button type="primary" @click="handleAdd">
        <Icon icon="ant-design:plus-outlined" size="16" />
        新增埋点
      </a-button>
      <a-button @click="handleBatchImport">
        <Icon icon="ant-design:upload-outlined" size="16" />
        批量导入
      </a-button>
      <a-button @click="handleExport">
        <Icon icon="ant-design:download-outlined" size="16" />
        导出配置
      </a-button>
    </div>

    <!-- 埋点列表 -->
    <a-card title="埋点配置列表" class="tracking-list-card">
      <BasicTable @register="registerTable" @row-click="handleRowClick">
        <template #toolbar>
          <a-input-search
            v-model:value="searchValue"
            placeholder="搜索埋点名称或事件"
            style="width: 300px"
            @search="handleSearch"
          />
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-button type="link" size="small" @click="handleView(record)">
                查看
              </a-button>
              <a-button type="link" size="small" danger @click="handleDelete(record)">
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </BasicTable>
    </a-card>

    <!-- 埋点详情弹窗 -->
    <TrackingModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import { Card, Button, Tag, Space, Input, message } from 'ant-design-vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import Icon from '/@/components/Icon';
  import TrackingModal from './TrackingModal.vue';
  import { trackingColumns, trackingData } from '../data/TrackingData';

  export default defineComponent({
    name: 'TrackingManage',
    components: {
      ACard: Card,
      AButton: Button,
      ATag: Tag,
      ASpace: Space,
      AInputSearch: Input.Search,
      BasicTable,
      Icon,
      TrackingModal,
    },
    props: {
      appDetail: {
        type: Object,
        default: () => ({}),
      },
      appId: {
        type: String,
        default: '',
      },
    },
    setup(props) {
      const { createMessage } = message;
      const searchValue = ref('');

      // 表格配置
      const [registerTable, { reload, getDataSource }] = useTable({
        title: '埋点列表',
        api: () => Promise.resolve({ items: trackingData, total: trackingData.length }),
        columns: trackingColumns,
        useSearchForm: false,
        showTableSetting: true,
        bordered: true,
        showIndexColumn: false,
        actionColumn: {
          width: 200,
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
        },
      });

      // 弹窗配置
      const [registerModal, { openModal }] = useModal();

      /**
       * 获取状态颜色
       */
      const getStatusColor = (status: string) => {
        const colorMap = {
          active: 'green',
          inactive: 'red',
          pending: 'orange',
        };
        return colorMap[status] || 'default';
      };

      /**
       * 获取状态文本
       */
      const getStatusText = (status: string) => {
        const textMap = {
          active: '已启用',
          inactive: '已禁用',
          pending: '待审核',
        };
        return textMap[status] || '未知';
      };

      /**
       * 新增埋点
       */
      const handleAdd = () => {
        openModal(true, {
          isUpdate: false,
          appId: props.appId,
        });
      };

      /**
       * 编辑埋点
       */
      const handleEdit = (record: any) => {
        openModal(true, {
          record,
          isUpdate: true,
          appId: props.appId,
        });
      };

      /**
       * 查看埋点详情
       */
      const handleView = (record: any) => {
        openModal(true, {
          record,
          isUpdate: false,
          readonly: true,
          appId: props.appId,
        });
      };

      /**
       * 删除埋点
       */
      const handleDelete = (record: any) => {
        createMessage.success(`删除埋点: ${record.eventName}`);
        reload();
      };

      /**
       * 批量导入
       */
      const handleBatchImport = () => {
        createMessage.info('批量导入功能开发中...');
      };

      /**
       * 导出配置
       */
      const handleExport = () => {
        createMessage.info('导出配置功能开发中...');
      };

      /**
       * 搜索
       */
      const handleSearch = (value: string) => {
        createMessage.info(`搜索: ${value}`);
        reload();
      };

      /**
       * 行点击事件
       */
      const handleRowClick = (record: any) => {
        console.log('点击行:', record);
      };

      /**
       * 操作成功回调
       */
      const handleSuccess = () => {
        reload();
      };

      onMounted(() => {
        reload();
      });

      return {
        searchValue,
        registerTable,
        registerModal,
        getStatusColor,
        getStatusText,
        handleAdd,
        handleEdit,
        handleView,
        handleDelete,
        handleBatchImport,
        handleExport,
        handleSearch,
        handleRowClick,
        handleSuccess,
      };
    },
  });
</script>

<style lang="less" scoped>
  .tracking-manage {
    .action-bar {
      margin-bottom: 16px;
      display: flex;
      gap: 12px;
    }

    .tracking-list-card {
      :deep(.ant-card-body) {
        padding: 0;
      }
    }
  }
</style>