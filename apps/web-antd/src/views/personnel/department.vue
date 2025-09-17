<template>
  <div class="p-4">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        {{ $t('personnel.department.title') }}
      </h1>
      <p class="mt-1 text-gray-600">
        {{ $t('personnel.department.description') }}
      </p>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="mb-4 rounded-lg bg-white p-4 shadow-sm">
      <a-form layout="inline" :model="searchForm" class="mb-4">
        <a-form-item>
          <a-input
            v-model:value="searchForm.keyword"
            :placeholder="$t('personnel.department.search')"
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
            {{ $t('personnel.department.search') }}
          </a-button>
          <a-button @click="handleReset" class="ml-2">
            {{ $t('personnel.department.reset') }}
          </a-button>
        </a-form-item>
      </a-form>

      <div class="flex items-center justify-between">
        <div class="flex gap-2">
          <a-button type="primary" @click="handleCreate">
            <PlusOutlined />
            {{ $t('personnel.department.create') }}
          </a-button>
          <a-button @click="handleExpandAll">
            <NodeExpandOutlined />
            展开全部
          </a-button>
          <a-button @click="handleCollapseAll">
            <NodeCollapseOutlined />
            收起全部
          </a-button>
          <a-button @click="handleExport">
            <ExportOutlined />
            {{ $t('personnel.department.export') }}
          </a-button>
        </div>
        <div class="text-sm text-gray-500">
          {{
            $t('personnel.department.total', { total: departmentList.length })
          }}
        </div>
      </div>
    </div>

    <!-- 部门树形表格 -->
    <div class="rounded-lg bg-white shadow-sm">
      <a-table
        :columns="columns"
        :data-source="departmentList"
        :pagination="false"
        :loading="loading"
        :expanded-row-keys="expandedRowKeys"
        @expand="handleExpand"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="flex items-center gap-2">
              <FolderOutlined class="text-blue-500" />
              <span class="font-medium">{{ record.name }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'leader'">
            <div v-if="record.leader" class="flex items-center gap-2">
              <a-avatar :size="24" :src="record.leader.avatar">
                {{ record.leader.name?.charAt(0) }}
              </a-avatar>
              <span>{{ record.leader.name }}</span>
            </div>
            <span v-else class="text-gray-400">未设置</span>
          </template>
          <template v-else-if="column.key === 'memberCount'">
            <a-badge
              :count="record.memberCount"
              :number-style="{ backgroundColor: '#52c41a' }"
            />
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'red'">
              {{ record.status === 'active' ? '正常' : '停用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleView(record)">
                {{ $t('personnel.department.view') }}
              </a-button>
              <a-button type="link" size="small" @click="handleEdit(record)">
                {{ $t('personnel.department.edit') }}
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="handleAddChild(record)"
              >
                添加下级
              </a-button>
              <a-popconfirm
                :title="$t('personnel.department.confirm_delete')"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" size="small" danger>
                  {{ $t('personnel.department.delete') }}
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 部门表单抽屉 -->
    <a-drawer
      v-model:open="drawerVisible"
      :title="
        isEdit
          ? $t('personnel.department.edit')
          : $t('personnel.department.create')
      "
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

        <a-form-item name="code" :label="'部门编码'">
          <a-input v-model:value="formData.code" />
        </a-form-item>

        <a-form-item
          name="parentId"
          :label="$t('personnel.department.parent_department')"
        >
          <a-tree-select
            v-model:value="formData.parentId"
            :tree-data="departmentTreeData"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="请选择上级部门"
            allow-clear
            tree-default-expand-all
          />
        </a-form-item>

        <a-form-item name="leaderId" :label="'部门负责人'">
          <a-select
            v-model:value="formData.leaderId"
            placeholder="请选择部门负责人"
            allow-clear
            show-search
            :filter-option="filterUserOption"
          >
            <a-select-option
              v-for="user in userList"
              :key="user.id"
              :value="user.id"
            >
              <div class="flex items-center gap-2">
                <a-avatar :size="20" :src="user.avatar">
                  {{ user.name?.charAt(0) }}
                </a-avatar>
                <span>{{ user.name }} ({{ user.username }})</span>
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item name="sort" :label="'排序'">
          <a-input-number
            v-model:value="formData.sort"
            :min="0"
            class="w-full"
          />
        </a-form-item>

        <a-form-item name="status" :label="$t('personnel.fields.status')">
          <a-radio-group v-model:value="formData.status">
            <a-radio value="active">正常</a-radio>
            <a-radio value="inactive">停用</a-radio>
          </a-radio-group>
        </a-form-item>

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

    <!-- 部门成员模态框 -->
    <a-modal
      v-model:open="memberModalVisible"
      :title="$t('personnel.department.department_members')"
      width="800"
      @cancel="handleMemberCancel"
    >
      <div class="mb-4">
        <h3 class="text-lg font-medium">{{ currentDepartment?.name }}</h3>
        <p class="text-gray-600">{{ currentDepartment?.description }}</p>
      </div>

      <a-table
        :columns="memberColumns"
        :data-source="departmentMembers"
        :pagination="false"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record.avatar" :size="32">
              {{ record.name?.charAt(0) }}
            </a-avatar>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'red'">
              {{ record.status === 'active' ? '正常' : '停用' }}
            </a-tag>
          </template>
        </template>
      </a-table>

      <template #footer>
        <a-button @click="handleMemberCancel">关闭</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import {
  SearchOutlined,
  PlusOutlined,
  ExportOutlined,
  FolderOutlined,
  NodeExpandOutlined,
  NodeCollapseOutlined,
} from '@ant-design/icons-vue';

// 部门数据接口
interface Department {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  leaderId?: string;
  leader?: {
    id: string;
    name: string;
    avatar?: string;
  };
  memberCount: number;
  sort: number;
  status: 'active' | 'inactive';
  description?: string;
  createTime: string;
  updateTime: string;
  children?: Department[];
}

// 用户数据接口
interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  status: string;
}

// 响应式数据
const loading = ref(false);
const submitting = ref(false);
const drawerVisible = ref(false);
const memberModalVisible = ref(false);
const isEdit = ref(false);
const expandedRowKeys = ref<string[]>([]);
const currentDepartment = ref<Department | null>(null);
const formRef = ref();

// 搜索表单
const searchForm = reactive({
  keyword: '',
});

// 部门表单数据
const formData = reactive<Partial<Department>>({
  name: '',
  code: '',
  parentId: undefined,
  leaderId: undefined,
  sort: 0,
  status: 'active',
  description: '',
});

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入部门名称' }],
  code: [{ required: true, message: '请输入部门编码' }],
};

// 部门列表
const departmentList = ref<Department[]>([]);

// 用户列表
const userList = ref<User[]>([]);

// 部门成员列表
const departmentMembers = ref<User[]>([]);

// 部门树形数据（用于选择上级部门）
const departmentTreeData = computed(() => {
  const buildTree = (departments: Department[], excludeId?: string): any[] => {
    return departments
      .filter((dept) => dept.id !== excludeId)
      .map((dept) => ({
        title: dept.name,
        value: dept.id,
        key: dept.id,
        children: dept.children ? buildTree(dept.children, excludeId) : [],
      }));
  };
  return buildTree(
    departmentList.value,
    isEdit.value ? formData.id : undefined,
  );
});

// 表格列配置
const columns = [
  {
    title: '部门名称',
    key: 'name',
    width: 250,
  },
  {
    title: '部门编码',
    dataIndex: 'code',
    key: 'code',
    width: 150,
  },
  {
    title: '负责人',
    key: 'leader',
    width: 150,
  },
  {
    title: '成员数',
    key: 'memberCount',
    width: 100,
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    width: 80,
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

// 成员表格列配置
const memberColumns = [
  {
    title: '头像',
    key: 'avatar',
    width: 60,
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: '职位',
    dataIndex: 'position',
    key: 'position',
  },
  {
    title: '状态',
    key: 'status',
  },
];

/**
 * 获取部门列表
 */
const fetchDepartmentList = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockData: Department[] = [
      {
        id: '1',
        name: '总公司',
        code: 'ROOT',
        leaderId: '1',
        leader: {
          id: '1',
          name: '张总',
          avatar: '',
        },
        memberCount: 50,
        sort: 0,
        status: 'active',
        description: '公司总部',
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00',
        children: [
          {
            id: '2',
            name: '技术部',
            code: 'TECH',
            parentId: '1',
            leaderId: '2',
            leader: {
              id: '2',
              name: '李经理',
              avatar: '',
            },
            memberCount: 20,
            sort: 1,
            status: 'active',
            description: '负责技术研发',
            createTime: '2024-01-02 10:00:00',
            updateTime: '2024-01-02 10:00:00',
            children: [
              {
                id: '3',
                name: '前端组',
                code: 'FRONTEND',
                parentId: '2',
                leaderId: '3',
                leader: {
                  id: '3',
                  name: '王组长',
                  avatar: '',
                },
                memberCount: 8,
                sort: 1,
                status: 'active',
                description: '前端开发团队',
                createTime: '2024-01-03 10:00:00',
                updateTime: '2024-01-03 10:00:00',
              },
              {
                id: '4',
                name: '后端组',
                code: 'BACKEND',
                parentId: '2',
                leaderId: '4',
                leader: {
                  id: '4',
                  name: '赵组长',
                  avatar: '',
                },
                memberCount: 12,
                sort: 2,
                status: 'active',
                description: '后端开发团队',
                createTime: '2024-01-04 10:00:00',
                updateTime: '2024-01-04 10:00:00',
              },
            ],
          },
          {
            id: '5',
            name: '产品部',
            code: 'PRODUCT',
            parentId: '1',
            leaderId: '5',
            leader: {
              id: '5',
              name: '陈经理',
              avatar: '',
            },
            memberCount: 15,
            sort: 2,
            status: 'active',
            description: '产品设计与规划',
            createTime: '2024-01-05 10:00:00',
            updateTime: '2024-01-05 10:00:00',
          },
        ],
      },
    ];

    departmentList.value = mockData;
    // 默认展开第一级
    expandedRowKeys.value = ['1'];
  } catch (error) {
    message.error('获取部门列表失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 获取用户列表
 */
const fetchUserList = async () => {
  try {
    // 模拟API调用
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        name: '张总',
        avatar: '',
        status: 'active',
      },
      {
        id: '2',
        username: 'manager1',
        name: '李经理',
        avatar: '',
        status: 'active',
      },
      {
        id: '3',
        username: 'leader1',
        name: '王组长',
        avatar: '',
        status: 'active',
      },
      {
        id: '4',
        username: 'leader2',
        name: '赵组长',
        avatar: '',
        status: 'active',
      },
      {
        id: '5',
        username: 'manager2',
        name: '陈经理',
        avatar: '',
        status: 'active',
      },
    ];
    userList.value = mockUsers;
  } catch (error) {
    message.error('获取用户列表失败');
  }
};

/**
 * 用户选项过滤
 */
const filterUserOption = (input: string, option: any) => {
  const user = userList.value.find((u) => u.id === option.value);
  return user
    ? user.name.includes(input) || user.username.includes(input)
    : false;
};

/**
 * 搜索部门
 */
const handleSearch = () => {
  fetchDepartmentList();
};

/**
 * 重置搜索
 */
const handleReset = () => {
  searchForm.keyword = '';
  handleSearch();
};

/**
 * 展开全部
 */
const handleExpandAll = () => {
  const getAllKeys = (departments: Department[]): string[] => {
    let keys: string[] = [];
    departments.forEach((dept) => {
      keys.push(dept.id);
      if (dept.children) {
        keys = keys.concat(getAllKeys(dept.children));
      }
    });
    return keys;
  };
  expandedRowKeys.value = getAllKeys(departmentList.value);
};

/**
 * 收起全部
 */
const handleCollapseAll = () => {
  expandedRowKeys.value = [];
};

/**
 * 展开/收起处理
 */
const handleExpand = (expanded: boolean, record: Department) => {
  if (expanded) {
    expandedRowKeys.value.push(record.id);
  } else {
    const index = expandedRowKeys.value.indexOf(record.id);
    if (index > -1) {
      expandedRowKeys.value.splice(index, 1);
    }
  }
};

/**
 * 创建部门
 */
const handleCreate = () => {
  isEdit.value = false;
  resetFormData();
  drawerVisible.value = true;
};

/**
 * 添加下级部门
 */
const handleAddChild = (record: Department) => {
  isEdit.value = false;
  resetFormData();
  formData.parentId = record.id;
  drawerVisible.value = true;
};

/**
 * 编辑部门
 */
const handleEdit = (record: Department) => {
  isEdit.value = true;
  Object.assign(formData, record);
  drawerVisible.value = true;
};

/**
 * 查看部门详情
 */
const handleView = async (record: Department) => {
  currentDepartment.value = record;

  // 模拟获取部门成员
  const mockMembers: User[] = [
    { id: '1', username: 'user1', name: '张三', avatar: '', status: 'active' },
    { id: '2', username: 'user2', name: '李四', avatar: '', status: 'active' },
  ];
  departmentMembers.value = mockMembers;

  memberModalVisible.value = true;
};

/**
 * 删除部门
 */
const handleDelete = async (record: Department) => {
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500));
    message.success('删除成功');
    fetchDepartmentList();
  } catch (error) {
    message.error('删除失败');
  }
};

/**
 * 导出部门
 */
const handleExport = () => {
  message.info('导出功能待实现');
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
 * 关闭成员模态框
 */
const handleMemberCancel = () => {
  memberModalVisible.value = false;
  currentDepartment.value = null;
  departmentMembers.value = [];
};

/**
 * 重置表单数据
 */
const resetFormData = () => {
  Object.assign(formData, {
    name: '',
    code: '',
    parentId: undefined,
    leaderId: undefined,
    sort: 0,
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
    fetchDepartmentList();
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    submitting.value = false;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchDepartmentList();
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
