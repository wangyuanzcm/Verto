<template>
  <div class="p-4">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        {{ $t('personnel.role.title') }}
      </h1>
      <p class="mt-1 text-gray-600">{{ $t('personnel.role.description') }}</p>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="mb-4 rounded-lg bg-white p-4 shadow-sm">
      <a-form layout="inline" :model="searchForm" class="mb-4">
        <a-form-item>
          <a-input
            v-model:value="searchForm.keyword"
            :placeholder="$t('personnel.role.search')"
            allow-clear
            class="w-64"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <SearchOutlined />
            {{ $t('personnel.role.search') }}
          </a-button>
          <a-button @click="handleReset" class="ml-2">
            {{ $t('personnel.role.reset') }}
          </a-button>
        </a-form-item>
      </a-form>

      <div class="flex items-center justify-between">
        <div class="flex gap-2">
          <a-button type="primary" @click="handleCreate">
            <PlusOutlined />
            {{ $t('personnel.role.create') }}
          </a-button>
          <a-button @click="handleExport">
            <ExportOutlined />
            {{ $t('personnel.role.export') }}
          </a-button>
        </div>
        <div class="text-sm text-gray-500">
          {{ $t('personnel.role.total', { total: pagination.total }) }}
        </div>
      </div>
    </div>

    <!-- 角色列表 -->
    <div class="rounded-lg bg-white shadow-sm">
      <a-table
        :columns="columns"
        :data-source="roleList"
        :pagination="pagination"
        :loading="loading"
        :row-selection="rowSelection"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'permissions'">
            <a-space wrap>
              <a-tag
                v-for="permission in record.permissions.slice(0, 3)"
                :key="permission"
                color="blue"
              >
                {{ permission }}
              </a-tag>
              <a-tag v-if="record.permissions.length > 3" color="default">
                +{{ record.permissions.length - 3 }}
              </a-tag>
            </a-space>
          </template>
          <template v-else-if="column.key === 'userCount'">
            <a-badge
              :count="record.userCount"
              :number-style="{ backgroundColor: '#52c41a' }"
            />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleView(record)">
                {{ $t('personnel.role.view') }}
              </a-button>
              <a-button type="link" size="small" @click="handleEdit(record)">
                {{ $t('personnel.role.edit') }}
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="handleAssignPermissions(record)"
              >
                {{ $t('personnel.role.assign_permissions') }}
              </a-button>
              <a-popconfirm
                :title="$t('personnel.role.confirm_delete')"
                @confirm="handleDelete(record)"
              >
                <a-button
                  type="link"
                  size="small"
                  danger
                  :disabled="record.isSystem"
                >
                  {{ $t('personnel.role.delete') }}
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 角色表单抽屉 -->
    <a-drawer
      v-model:open="drawerVisible"
      :title="isEdit ? $t('personnel.role.edit') : $t('personnel.role.create')"
      width="600"
      @close="handleDrawerClose"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item name="name" :label="$t('personnel.fields.name')">
          <a-input v-model:value="formData.name" />
        </a-form-item>

        <a-form-item name="code" :label="'角色编码'">
          <a-input v-model:value="formData.code" :disabled="isEdit" />
        </a-form-item>

        <a-form-item
          name="description"
          :label="$t('personnel.fields.description')"
        >
          <a-textarea v-model:value="formData.description" :rows="3" />
        </a-form-item>

        <a-form-item
          name="permissions"
          :label="$t('personnel.role.permissions')"
        >
          <a-tree
            v-model:checkedKeys="formData.permissions"
            :tree-data="permissionTree"
            checkable
            :default-expand-all="true"
            class="max-h-64 overflow-auto rounded border p-2"
          />
        </a-form-item>
      </a-form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <a-button @click="handleDrawerClose">{{
            $t('personnel.form.cancel')
          }}</a-button>
          <a-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ $t('personnel.form.save') }}
          </a-button>
        </div>
      </template>
    </a-drawer>

    <!-- 权限分配模态框 -->
    <a-modal
      v-model:open="permissionModalVisible"
      :title="$t('personnel.role.assign_permissions')"
      width="800"
      @ok="handlePermissionSubmit"
      @cancel="handlePermissionCancel"
    >
      <div class="mb-4">
        <h3 class="text-lg font-medium">{{ currentRole?.name }}</h3>
        <p class="text-gray-600">{{ currentRole?.description }}</p>
      </div>

      <a-tree
        v-model:checkedKeys="selectedPermissions"
        :tree-data="permissionTree"
        checkable
        :default-expand-all="true"
        class="max-h-96 overflow-auto rounded border p-4"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  SearchOutlined,
  PlusOutlined,
  ExportOutlined,
} from '@ant-design/icons-vue';

// 角色数据接口
interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  createTime: string;
  updateTime: string;
}

// 权限树节点接口
interface PermissionNode {
  key: string;
  title: string;
  children?: PermissionNode[];
}

// 响应式数据
const loading = ref(false);
const submitting = ref(false);
const drawerVisible = ref(false);
const permissionModalVisible = ref(false);
const isEdit = ref(false);
const selectedRowKeys = ref<string[]>([]);
const selectedPermissions = ref<string[]>([]);
const currentRole = ref<Role | null>(null);
const formRef = ref();

// 搜索表单
const searchForm = reactive({
  keyword: '',
});

// 角色表单数据
const formData = reactive<Partial<Role>>({
  name: '',
  code: '',
  description: '',
  permissions: [],
});

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入角色名称' }],
  code: [{ required: true, message: '请输入角色编码' }],
};

// 角色列表
const roleList = ref<Role[]>([]);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
});

// 权限树数据
const permissionTree = ref<PermissionNode[]>([
  {
    key: 'system',
    title: '系统管理',
    children: [
      { key: 'system:user', title: '用户管理' },
      { key: 'system:role', title: '角色管理' },
      { key: 'system:dept', title: '部门管理' },
      { key: 'system:menu', title: '菜单管理' },
    ],
  },
  {
    key: 'application',
    title: '应用管理',
    children: [
      { key: 'app:list', title: '应用列表' },
      { key: 'app:create', title: '创建应用' },
      { key: 'app:edit', title: '编辑应用' },
      { key: 'app:delete', title: '删除应用' },
    ],
  },
  {
    key: 'monitor',
    title: '监控管理',
    children: [
      { key: 'monitor:online', title: '在线用户' },
      { key: 'monitor:job', title: '定时任务' },
      { key: 'monitor:server', title: '服务监控' },
    ],
  },
]);

// 表格列配置
const columns = [
  {
    title: '角色名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '角色编码',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: '权限',
    key: 'permissions',
    width: 300,
  },
  {
    title: '用户数',
    key: 'userCount',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 300,
    fixed: 'right',
  },
];

// 行选择配置
const rowSelection = {
  selectedRowKeys,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys;
  },
  getCheckboxProps: (record: Role) => ({
    disabled: record.isSystem,
  }),
};

/**
 * 获取角色列表
 */
const fetchRoleList = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockData: Role[] = [
      {
        id: '1',
        name: '超级管理员',
        code: 'super_admin',
        description: '拥有系统所有权限',
        permissions: [
          'system:user',
          'system:role',
          'system:dept',
          'app:list',
          'app:create',
        ],
        userCount: 1,
        isSystem: true,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00',
      },
      {
        id: '2',
        name: '普通用户',
        code: 'user',
        description: '普通用户权限',
        permissions: ['app:list'],
        userCount: 15,
        isSystem: false,
        createTime: '2024-01-02 10:00:00',
        updateTime: '2024-01-02 10:00:00',
      },
      {
        id: '3',
        name: '应用管理员',
        code: 'app_admin',
        description: '应用管理相关权限',
        permissions: ['app:list', 'app:create', 'app:edit', 'app:delete'],
        userCount: 5,
        isSystem: false,
        createTime: '2024-01-03 10:00:00',
        updateTime: '2024-01-03 10:00:00',
      },
    ];

    roleList.value = mockData;
    pagination.total = mockData.length;
  } catch (error) {
    message.error('获取角色列表失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 搜索角色
 */
const handleSearch = () => {
  pagination.current = 1;
  fetchRoleList();
};

/**
 * 重置搜索
 */
const handleReset = () => {
  searchForm.keyword = '';
  handleSearch();
};

/**
 * 创建角色
 */
const handleCreate = () => {
  isEdit.value = false;
  resetFormData();
  drawerVisible.value = true;
};

/**
 * 编辑角色
 */
const handleEdit = (record: Role) => {
  isEdit.value = true;
  Object.assign(formData, record);
  drawerVisible.value = true;
};

/**
 * 查看角色详情
 */
const handleView = (record: Role) => {
  message.info('查看角色详情功能待实现');
};

/**
 * 删除角色
 */
const handleDelete = async (record: Role) => {
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500));
    message.success('删除成功');
    fetchRoleList();
  } catch (error) {
    message.error('删除失败');
  }
};

/**
 * 分配权限
 */
const handleAssignPermissions = (record: Role) => {
  currentRole.value = record;
  selectedPermissions.value = [...record.permissions];
  permissionModalVisible.value = true;
};

/**
 * 导出角色
 */
const handleExport = () => {
  message.info('导出功能待实现');
};

/**
 * 表格变化处理
 */
const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchRoleList();
};

/**
 * 关闭抽屉
 */
const handleDrawerClose = () => {
  drawerVisible.value = false;
  formRef.value?.resetFields();
  resetFormData();
};

/**
 * 重置表单数据
 */
const resetFormData = () => {
  Object.assign(formData, {
    name: '',
    code: '',
    description: '',
    permissions: [],
  });
};

/**
 * 提交表单
 */
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitting.value = true;

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    message.success(isEdit.value ? '更新成功' : '创建成功');
    handleDrawerClose();
    fetchRoleList();
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    submitting.value = false;
  }
};

/**
 * 提交权限分配
 */
const handlePermissionSubmit = async () => {
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (currentRole.value) {
      currentRole.value.permissions = [...selectedPermissions.value];
    }

    message.success('权限分配成功');
    permissionModalVisible.value = false;
    fetchRoleList();
  } catch (error) {
    message.error('权限分配失败');
  }
};

/**
 * 取消权限分配
 */
const handlePermissionCancel = () => {
  permissionModalVisible.value = false;
  selectedPermissions.value = [];
  currentRole.value = null;
};

// 组件挂载时获取数据
onMounted(() => {
  fetchRoleList();
});
</script>

<style scoped>
.ant-table {
  font-size: 14px;
}

.ant-drawer-body {
  padding: 24px;
}
</style>
