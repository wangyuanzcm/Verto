<template>
  <div class="p-4">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        {{ $t('personnel.user.title') }}
      </h1>
      <p class="mt-1 text-gray-600">{{ $t('personnel.user.description') }}</p>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="mb-4 rounded-lg bg-white p-4 shadow-sm">
      <a-form layout="inline" :model="searchForm" class="mb-4">
        <a-form-item>
          <a-input
            v-model:value="searchForm.keyword"
            :placeholder="$t('personnel.user.search')"
            allow-clear
            class="w-64"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-select
            v-model:value="searchForm.department"
            :placeholder="$t('personnel.fields.department')"
            allow-clear
            class="w-40"
          >
            <a-select-option value="tech">技术部</a-select-option>
            <a-select-option value="product">产品部</a-select-option>
            <a-select-option value="design">设计部</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select
            v-model:value="searchForm.status"
            :placeholder="$t('personnel.fields.status')"
            allow-clear
            class="w-32"
          >
            <a-select-option value="active">{{
              $t('personnel.status.active')
            }}</a-select-option>
            <a-select-option value="inactive">{{
              $t('personnel.status.inactive')
            }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <SearchOutlined />
            {{ $t('personnel.user.search') }}
          </a-button>
          <a-button @click="handleReset" class="ml-2">
            {{ $t('personnel.user.reset') }}
          </a-button>
        </a-form-item>
      </a-form>

      <div class="flex items-center justify-between">
        <div class="flex gap-2">
          <a-button type="primary" @click="handleCreate">
            <PlusOutlined />
            {{ $t('personnel.user.create') }}
          </a-button>
          <a-button @click="handleExport">
            <ExportOutlined />
            {{ $t('personnel.user.export') }}
          </a-button>
          <a-button @click="handleImport">
            <ImportOutlined />
            {{ $t('personnel.user.import') }}
          </a-button>
        </div>
        <div class="text-sm text-gray-500">
          {{ $t('personnel.user.total', { total: pagination.total }) }}
        </div>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="rounded-lg bg-white shadow-sm">
      <a-table
        :columns="columns"
        :data-source="userList"
        :pagination="pagination"
        :loading="loading"
        :row-selection="rowSelection"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record.avatar" :size="40">
              {{ record.name?.charAt(0) }}
            </a-avatar>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ $t(`personnel.status.${record.status}`) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'gender'">
            {{ $t(`personnel.gender.${record.gender}`) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleView(record)">
                {{ $t('personnel.user.view') }}
              </a-button>
              <a-button type="link" size="small" @click="handleEdit(record)">
                {{ $t('personnel.user.edit') }}
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="handleResetPassword(record)"
              >
                {{ $t('personnel.user.reset_password') }}
              </a-button>
              <a-popconfirm
                :title="$t('personnel.user.confirm_delete')"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" size="small" danger>
                  {{ $t('personnel.user.delete') }}
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 用户表单抽屉 -->
    <a-drawer
      v-model:open="drawerVisible"
      :title="isEdit ? $t('personnel.user.edit') : $t('personnel.user.create')"
      width="600"
      @close="handleDrawerClose"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-divider orientation="left">{{
          $t('personnel.form.basic_info')
        }}</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              name="username"
              :label="$t('personnel.fields.username')"
            >
              <a-input v-model:value="formData.username" :disabled="isEdit" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="name" :label="$t('personnel.fields.name')">
              <a-input v-model:value="formData.name" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="email" :label="$t('personnel.fields.email')">
              <a-input v-model:value="formData.email" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="phone" :label="$t('personnel.fields.phone')">
              <a-input v-model:value="formData.phone" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="gender" :label="$t('personnel.fields.gender')">
              <a-select v-model:value="formData.gender">
                <a-select-option value="male">{{
                  $t('personnel.gender.male')
                }}</a-select-option>
                <a-select-option value="female">{{
                  $t('personnel.gender.female')
                }}</a-select-option>
                <a-select-option value="unknown">{{
                  $t('personnel.gender.unknown')
                }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              name="birthday"
              :label="$t('personnel.fields.birthday')"
            >
              <a-date-picker v-model:value="formData.birthday" class="w-full" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">{{
          $t('personnel.form.work_info')
        }}</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              name="department"
              :label="$t('personnel.fields.department')"
            >
              <a-select v-model:value="formData.department">
                <a-select-option value="tech">技术部</a-select-option>
                <a-select-option value="product">产品部</a-select-option>
                <a-select-option value="design">设计部</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              name="position"
              :label="$t('personnel.fields.position')"
            >
              <a-input v-model:value="formData.position" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="role" :label="$t('personnel.fields.role')">
              <a-select v-model:value="formData.role">
                <a-select-option value="admin">管理员</a-select-option>
                <a-select-option value="user">普通用户</a-select-option>
                <a-select-option value="guest">访客</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="status" :label="$t('personnel.fields.status')">
              <a-select v-model:value="formData.status">
                <a-select-option value="active">{{
                  $t('personnel.status.active')
                }}</a-select-option>
                <a-select-option value="inactive">{{
                  $t('personnel.status.inactive')
                }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item
          name="description"
          :label="$t('personnel.fields.description')"
        >
          <a-textarea v-model:value="formData.description" :rows="3" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  SearchOutlined,
  PlusOutlined,
  ExportOutlined,
  ImportOutlined,
} from '@ant-design/icons-vue';

// 用户数据接口
interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  gender: 'male' | 'female' | 'unknown';
  birthday?: string;
  department: string;
  position: string;
  role: string;
  status: 'active' | 'inactive' | 'pending' | 'locked';
  createTime: string;
  updateTime: string;
  lastLogin?: string;
  description?: string;
}

// 响应式数据
const loading = ref(false);
const submitting = ref(false);
const drawerVisible = ref(false);
const isEdit = ref(false);
const selectedRowKeys = ref<string[]>([]);
const formRef = ref();

// 搜索表单
const searchForm = reactive({
  keyword: '',
  department: undefined,
  status: undefined,
});

// 用户表单数据
const formData = reactive<Partial<User>>({
  username: '',
  name: '',
  email: '',
  phone: '',
  gender: 'unknown',
  birthday: undefined,
  department: '',
  position: '',
  role: '',
  status: 'active',
  description: '',
});

// 表单验证规则
const formRules = {
  username: [{ required: true, message: '请输入用户名' }],
  name: [{ required: true, message: '请输入姓名' }],
  email: [{ required: true, type: 'email', message: '请输入正确的邮箱' }],
  phone: [{ required: true, message: '请输入手机号' }],
  department: [{ required: true, message: '请选择部门' }],
  role: [{ required: true, message: '请选择角色' }],
};

// 用户列表
const userList = ref<User[]>([]);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
});

// 表格列配置
const columns = [
  {
    title: '头像',
    key: 'avatar',
    width: 80,
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: '性别',
    key: 'gender',
    width: 80,
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department',
  },
  {
    title: '职位',
    dataIndex: 'position',
    key: 'position',
  },
  {
    title: '状态',
    key: 'status',
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
    width: 280,
    fixed: 'right',
  },
];

// 行选择配置
const rowSelection = {
  selectedRowKeys,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys;
  },
};

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colors = {
    active: 'green',
    inactive: 'red',
    pending: 'orange',
    locked: 'volcano',
  };
  return colors[status] || 'default';
};

/**
 * 获取用户列表
 */
const fetchUserList = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockData: User[] = [
      {
        id: '1',
        username: 'admin',
        name: '管理员',
        email: 'admin@example.com',
        phone: '13800138000',
        avatar: '',
        gender: 'male',
        birthday: '1990-01-01',
        department: 'tech',
        position: '技术总监',
        role: 'admin',
        status: 'active',
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00',
        lastLogin: '2024-01-15 09:30:00',
        description: '系统管理员',
      },
      {
        id: '2',
        username: 'zhangsan',
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138001',
        avatar: '',
        gender: 'male',
        birthday: '1992-05-15',
        department: 'tech',
        position: '前端工程师',
        role: 'user',
        status: 'active',
        createTime: '2024-01-02 10:00:00',
        updateTime: '2024-01-02 10:00:00',
        lastLogin: '2024-01-15 08:45:00',
        description: '负责前端开发',
      },
    ];

    userList.value = mockData;
    pagination.total = mockData.length;
  } catch (error) {
    message.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 搜索用户
 */
const handleSearch = () => {
  pagination.current = 1;
  fetchUserList();
};

/**
 * 重置搜索
 */
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    department: undefined,
    status: undefined,
  });
  handleSearch();
};

/**
 * 创建用户
 */
const handleCreate = () => {
  isEdit.value = false;
  resetFormData();
  drawerVisible.value = true;
};

/**
 * 编辑用户
 */
const handleEdit = (record: User) => {
  isEdit.value = true;
  Object.assign(formData, record);
  drawerVisible.value = true;
};

/**
 * 查看用户详情
 */
const handleView = (record: User) => {
  // 跳转到用户详情页面或显示详情模态框
  message.info('查看用户详情功能待实现');
};

/**
 * 删除用户
 */
const handleDelete = async (record: User) => {
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500));
    message.success('删除成功');
    fetchUserList();
  } catch (error) {
    message.error('删除失败');
  }
};

/**
 * 重置密码
 */
const handleResetPassword = async (record: User) => {
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500));
    message.success('密码重置成功');
  } catch (error) {
    message.error('密码重置失败');
  }
};

/**
 * 导出用户
 */
const handleExport = () => {
  message.info('导出功能待实现');
};

/**
 * 导入用户
 */
const handleImport = () => {
  message.info('导入功能待实现');
};

/**
 * 表格变化处理
 */
const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchUserList();
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
    username: '',
    name: '',
    email: '',
    phone: '',
    gender: 'unknown',
    birthday: undefined,
    department: '',
    position: '',
    role: '',
    status: 'active',
    description: '',
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
    fetchUserList();
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    submitting.value = false;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchUserList();
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
