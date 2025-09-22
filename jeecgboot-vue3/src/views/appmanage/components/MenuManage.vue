<!--菜单管理组件-->
<template>
  <div class="menu-manage-container">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-button type="primary" @click="handleAdd">
        <template #icon>
          <PlusOutlined />
        </template>
        新增菜单
      </a-button>
      <a-button @click="handleExpandAll">
        <template #icon>
          <ExpandOutlined />
        </template>
        展开全部
      </a-button>
      <a-button @click="handleCollapseAll">
        <template #icon>
          <ShrinkOutlined />
        </template>
        收起全部
      </a-button>
      <a-button @click="handleRefresh">
        <template #icon>
          <ReloadOutlined />
        </template>
        刷新
      </a-button>
    </div>

    <!-- 菜单树形表格 -->
    <BasicTable
      @register="registerTable"
      :rowSelection="{ type: 'checkbox', selectedRowKeys: checkedKeys, onChange: onSelectChange }"
    >
      <template #toolbar>
        <a-button type="primary" danger :disabled="!hasSelected" @click="handleBatchDelete">
          <template #icon>
            <DeleteOutlined />
          </template>
          批量删除
        </a-button>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'menuType'">
          <a-tag :color="getMenuTypeColor(record.menuType)">
            {{ getMenuTypeText(record.menuType) }}
          </a-tag>
        </template>

        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 'enabled' ? 'green' : 'red'">
            {{ record.status === 'enabled' ? '启用' : '禁用' }}
          </a-tag>
        </template>

        <template v-if="column.key === 'icon'">
          <Icon :icon="record.icon" v-if="record.icon" />
          <span v-else>-</span>
        </template>

        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                icon: 'clarity:note-edit-line',
                tooltip: '编辑',
                onClick: handleEdit.bind(null, record),
              },
              {
                icon: 'ant-design:plus-outlined',
                tooltip: '添加子菜单',
                onClick: handleAddChild.bind(null, record),
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
      </template>
    </BasicTable>

    <!-- 菜单配置弹窗 -->
    <MenuModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, computed } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { Icon } from '/@/components/Icon';
  import { message } from 'ant-design-vue';
  import {
    PlusOutlined,
    DeleteOutlined,
    ReloadOutlined,
    ExpandOutlined,
    ShrinkOutlined,
  } from '@ant-design/icons-vue';

  import MenuModal from './MenuModal.vue';
  import { menuColumns, menuData } from '../data/MenuData';

  export default defineComponent({
    name: 'MenuManage',
    components: {
      BasicTable,
      TableAction,
      MenuModal,
      Icon,
      PlusOutlined,
      DeleteOutlined,
      ReloadOutlined,
      ExpandOutlined,
      ShrinkOutlined,
    },
    setup() {
      const { createMessage } = message;
      const checkedKeys = ref<Array<string | number>>([]);

      const [registerTable, { reload, expandAll, collapseAll }] = useTable({
        title: '菜单列表',
        api: getMenuList,
        rowKey: 'id',
        columns: menuColumns,
        formConfig: {
          labelWidth: 120,
          schemas: [
            {
              field: 'menuName',
              label: '菜单名称',
              component: 'Input',
              componentProps: {
                placeholder: '请输入菜单名称',
              },
            },
            {
              field: 'status',
              label: '状态',
              component: 'Select',
              componentProps: {
                options: [
                  { label: '启用', value: 'enabled' },
                  { label: '禁用', value: 'disabled' },
                ],
                placeholder: '请选择状态',
              },
            },
          ],
        },
        useSearchForm: true,
        showTableSetting: true,
        bordered: true,
        handleSearchInfoFn(info) {
          console.log('handleSearchInfoFn', info);
          return info;
        },
        actionColumn: {
          width: 180,
          title: '操作',
          dataIndex: 'action',
        },
        pagination: false,
        isTreeTable: true,
        expandRowByClick: true,
      });

      const [registerModal, { openModal }] = useModal();

      const hasSelected = computed(() => checkedKeys.value.length > 0);

      /**
       * 获取菜单列表数据
       */
      async function getMenuList() {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        return menuData;
      }

      /**
       * 获取菜单类型颜色
       */
      function getMenuTypeColor(type: string) {
        const colorMap = {
          menu: 'blue',
          button: 'green',
          link: 'orange',
        };
        return colorMap[type] || 'default';
      }

      /**
       * 获取菜单类型文本
       */
      function getMenuTypeText(type: string) {
        const textMap = {
          menu: '菜单',
          button: '按钮',
          link: '链接',
        };
        return textMap[type] || type;
      }

      /**
       * 新增菜单
       */
      function handleAdd() {
        openModal(true, {
          isUpdate: false,
        });
      }

      /**
       * 添加子菜单
       */
      function handleAddChild(record: Recordable) {
        openModal(true, {
          isUpdate: false,
          parentId: record.id,
          parentName: record.menuName,
        });
      }

      /**
       * 编辑菜单
       */
      function handleEdit(record: Recordable) {
        openModal(true, {
          record,
          isUpdate: true,
        });
      }

      /**
       * 删除菜单
       */
      async function handleDelete(record: Recordable) {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));
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
        if (checkedKeys.value.length === 0) {
          createMessage.warning('请选择要删除的菜单');
          return;
        }

        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));
          createMessage.success(`成功删除 ${checkedKeys.value.length} 个菜单`);
          checkedKeys.value = [];
          reload();
        } catch (error) {
          createMessage.error('批量删除失败');
        }
      }

      /**
       * 展开全部
       */
      function handleExpandAll() {
        expandAll();
      }

      /**
       * 收起全部
       */
      function handleCollapseAll() {
        collapseAll();
      }

      /**
       * 刷新
       */
      function handleRefresh() {
        reload();
      }

      /**
       * 选择变化
       */
      function onSelectChange(selectedRowKeys: (string | number)[]) {
        checkedKeys.value = selectedRowKeys;
      }

      /**
       * 操作成功回调
       */
      function handleSuccess() {
        reload();
      }

      return {
        registerTable,
        registerModal,
        checkedKeys,
        hasSelected,
        getMenuTypeColor,
        getMenuTypeText,
        handleAdd,
        handleAddChild,
        handleEdit,
        handleDelete,
        handleBatchDelete,
        handleExpandAll,
        handleCollapseAll,
        handleRefresh,
        onSelectChange,
        handleSuccess,
      };
    },
  });
</script>

<style lang="less" scoped>
  .menu-manage-container {
    .operation-bar {
      margin-bottom: 16px;
      display: flex;
      gap: 8px;
    }
  }
</style>