<template>
  <div class="system-roles">
    <!-- 头部操作栏 -->
    <div class="header-actions">
      <div class="left-actions">
        <h2>角色管理</h2>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <HomeOutlined />
            首页
          </a-breadcrumb-item>
          <a-breadcrumb-item>
            <SettingOutlined />
            系统管理
          </a-breadcrumb-item>
          <a-breadcrumb-item>角色管理</a-breadcrumb-item>
        </a-breadcrumb>
      </div>
      
      <div class="right-actions">
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索角色名称或描述"
            style="width: 250px"
            @search="handleSearch"
          />
          <a-button @click="refreshData" :loading="loading">
            <ReloadOutlined />
            刷新
          </a-button>
          <a-button type="primary" @click="showCreateModal">
            <PlusOutlined />
            新建角色
          </a-button>
        </a-space>
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div class="stats-cards">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card">
            <a-statistic
              title="总角色数"
              :value="stats.totalRoles"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <TeamOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card">
            <a-statistic
              title="系统角色"
              :value="stats.systemRoles"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <SafetyOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card">
            <a-statistic
              title="自定义角色"
              :value="stats.customRoles"
              :value-style="{ color: '#fa8c16' }"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card">
            <a-statistic
              title="已分配用户"
              :value="stats.assignedUsers"
              :value-style="{ color: '#722ed1' }"
            >
              <template #prefix>
                <UsergroupAddOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>
    
    <!-- 角色列表 -->
    <a-card class="roles-table-card">
      <template #title>
        <span>角色列表</span>
      </template>
      
      <template #extra>
        <a-space>
          <a-select
            v-model:value="filterType"
            placeholder="角色类型"
            style="width: 120px"
            allowClear
            @change="handleFilter"
          >
            <a-select-option value="system">系统角色</a-select-option>
            <a-select-option value="custom">自定义角色</a-select-option>
          </a-select>
          
          <a-select
            v-model:value="filterStatus"
            placeholder="状态"
            style="width: 100px"
            allowClear
            @change="handleFilter"
          >
            <a-select-option value="active">启用</a-select-option>
            <a-select-option value="inactive">禁用</a-select-option>
          </a-select>
        </a-space>
      </template>
      
      <a-table
        :columns="columns"
        :data-source="filteredRoles"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="role-info">
              <div class="role-name">
                <a-tag v-if="record.type === 'system'" color="blue">系统</a-tag>
                <a-tag v-else color="orange">自定义</a-tag>
                {{ record.name }}
              </div>
              <div class="role-description">{{ record.description }}</div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'permissions'">
            <a-space wrap>
              <a-tag
                v-for="permission in record.permissions.slice(0, 3)"
                :key="permission"
                color="geekblue"
              >
                {{ getPermissionName(permission) }}
              </a-tag>
              <a-tag v-if="record.permissions.length > 3" color="default">
                +{{ record.permissions.length - 3 }}
              </a-tag>
            </a-space>
          </template>
          
          <template v-else-if="column.key === 'userCount'">
            <a-button type="link" @click="showRoleUsers(record)">
              {{ record.userCount }} 人
            </a-button>
          </template>
          
          <template v-else-if="column.key === 'status'">
            <a-switch
              v-model:checked="record.status"
              :disabled="record.type === 'system'"
              @change="(checked) => handleStatusChange(record, checked)"
            />
          </template>
          
          <template v-else-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="showRoleDetail(record)">
                <EyeOutlined />
                查看
              </a-button>
              <a-button
                type="link"
                size="small"
                :disabled="record.type === 'system'"
                @click="showEditModal(record)"
              >
                <EditOutlined />
                编辑
              </a-button>
              <a-button
                type="link"
                size="small"
                :disabled="record.type === 'system'"
                @click="showCopyModal(record)"
              >
                <CopyOutlined />
                复制
              </a-button>
              <a-popconfirm
                title="确定要删除这个角色吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="deleteRole(record)"
              >
                <a-button
                  type="link"
                  size="small"
                  danger
                  :disabled="record.type === 'system' || record.userCount > 0"
                >
                  <DeleteOutlined />
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
    
    <!-- 创建/编辑角色模态框 -->
    <a-modal
      v-model:open="roleModalVisible"
      :title="roleModalTitle"
      width="800px"
      :confirm-loading="submitting"
      @ok="handleRoleSubmit"
      @cancel="handleRoleCancel"
    >
      <a-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="角色名称" name="name">
              <a-input v-model:value="roleForm.name" placeholder="请输入角色名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="角色代码" name="code">
              <a-input v-model:value="roleForm.code" placeholder="请输入角色代码" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="角色描述" name="description">
          <a-textarea
            v-model:value="roleForm.description"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </a-form-item>
        
        <a-form-item label="权限配置" name="permissions">
          <div class="permissions-tree">
            <a-tree
              v-model:checkedKeys="roleForm.permissions"
              :tree-data="permissionTree"
              checkable
              :check-strictly="false"
              :default-expand-all="true"
            >
              <template #title="{ title, description }">
                <div class="permission-item">
                  <span class="permission-title">{{ title }}</span>
                  <span class="permission-description">{{ description }}</span>
                </div>
              </template>
            </a-tree>
          </div>
        </a-form-item>
        
        <a-form-item>
          <a-checkbox v-model:checked="roleForm.status">
            启用角色
          </a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 角色详情模态框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="角色详情"
      width="700px"
      :footer="null"
    >
      <div v-if="selectedRole" class="role-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="角色名称">
            {{ selectedRole.name }}
          </a-descriptions-item>
          <a-descriptions-item label="角色代码">
            {{ selectedRole.code }}
          </a-descriptions-item>
          <a-descriptions-item label="角色类型">
            <a-tag :color="selectedRole.type === 'system' ? 'blue' : 'orange'">
              {{ selectedRole.type === 'system' ? '系统角色' : '自定义角色' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="selectedRole.status ? 'green' : 'red'">
              {{ selectedRole.status ? '启用' : '禁用' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="用户数量">
            {{ selectedRole.userCount }} 人
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ formatDate(selectedRole.createdAt) }}
          </a-descriptions-item>
          <a-descriptions-item label="角色描述" :span="2">
            {{ selectedRole.description }}
          </a-descriptions-item>
        </a-descriptions>
        
        <a-divider>权限列表</a-divider>
        
        <div class="permissions-list">
          <a-space wrap>
            <a-tag
              v-for="permission in selectedRole.permissions"
              :key="permission"
              color="geekblue"
            >
              {{ getPermissionName(permission) }}
            </a-tag>
          </a-space>
        </div>
      </div>
    </a-modal>
    
    <!-- 角色用户列表模态框 -->
    <a-modal
      v-model:open="usersModalVisible"
      :title="`角色用户 - ${selectedRole?.name}`"
      width="800px"
      :footer="null"
    >
      <a-table
        :columns="userColumns"
        :data-source="roleUsers"
        :loading="loadingUsers"
        :pagination="false"
        size="small"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record.avatar" :size="32">
              {{ record.name.charAt(0) }}
            </a-avatar>
          </template>
          
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'red'">
              {{ record.status === 'active' ? '正常' : '禁用' }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'assignedAt'">
            {{ formatDate(record.assignedAt) }}
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  HomeOutlined,
  SettingOutlined,
  ReloadOutlined,
  PlusOutlined,
  TeamOutlined,
  SafetyOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  EyeOutlined,
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
  ExperimentOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const loadingUsers = ref(false)
const searchText = ref('')
const filterType = ref()
const filterStatus = ref()
const roleModalVisible = ref(false)
const detailModalVisible = ref(false)
const usersModalVisible = ref(false)
const isEdit = ref(false)
const selectedRole = ref(null)
const roleUsers = ref([])

// 表单引用
const roleFormRef = ref()

// 统计数据
const stats = reactive({
  totalRoles: 12,
  systemRoles: 5,
  customRoles: 7,
  assignedUsers: 156
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 角色表单
const roleForm = reactive({
  id: null,
  name: '',
  code: '',
  description: '',
  permissions: [],
  status: true
})

// 角色数据
const roles = ref([
  {
    id: 1,
    name: '超级管理员',
    code: 'super_admin',
    description: '拥有系统所有权限的超级管理员',
    type: 'system',
    permissions: ['user:read', 'user:write', 'role:read', 'role:write', 'system:read', 'system:write'],
    userCount: 2,
    status: true,
    createdAt: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: '系统管理员',
    code: 'admin',
    description: '系统管理员，负责系统配置和用户管理',
    type: 'system',
    permissions: ['user:read', 'user:write', 'role:read', 'system:read'],
    userCount: 5,
    status: true,
    createdAt: '2024-01-01 10:00:00'
  },
  {
    id: 3,
    name: '项目经理',
    code: 'project_manager',
    description: '项目经理，负责项目管理和团队协调',
    type: 'custom',
    permissions: ['project:read', 'project:write', 'team:read', 'team:write'],
    userCount: 12,
    status: true,
    createdAt: '2024-01-02 14:30:00'
  },
  {
    id: 4,
    name: '开发人员',
    code: 'developer',
    description: '开发人员，负责代码开发和技术实现',
    type: 'custom',
    permissions: ['project:read', 'task:read', 'task:write'],
    userCount: 25,
    status: true,
    createdAt: '2024-01-02 15:00:00'
  },
  {
    id: 5,
    name: '测试人员',
    code: 'tester',
    description: '测试人员，负责软件测试和质量保证',
    type: 'custom',
    permissions: ['project:read', 'task:read', 'test:read', 'test:write'],
    userCount: 8,
    status: true,
    createdAt: '2024-01-03 09:15:00'
  }
])

// 权限树数据
const permissionTree = ref([
  {
    title: '用户管理',
    key: 'user',
    children: [
      {
        title: '查看用户',
        key: 'user:read',
        description: '查看用户列表和详情'
      },
      {
        title: '管理用户',
        key: 'user:write',
        description: '创建、编辑、删除用户'
      }
    ]
  },
  {
    title: '角色管理',
    key: 'role',
    children: [
      {
        title: '查看角色',
        key: 'role:read',
        description: '查看角色列表和详情'
      },
      {
        title: '管理角色',
        key: 'role:write',
        description: '创建、编辑、删除角色'
      }
    ]
  },
  {
    title: '项目管理',
    key: 'project',
    children: [
      {
        title: '查看项目',
        key: 'project:read',
        description: '查看项目列表和详情'
      },
      {
        title: '管理项目',
        key: 'project:write',
        description: '创建、编辑、删除项目'
      }
    ]
  },
  {
    title: '团队管理',
    key: 'team',
    children: [
      {
        title: '查看团队',
        key: 'team:read',
        description: '查看团队列表和详情'
      },
      {
        title: '管理团队',
        key: 'team:write',
        description: '创建、编辑、删除团队'
      }
    ]
  },
  {
    title: '任务管理',
    key: 'task',
    children: [
      {
        title: '查看任务',
        key: 'task:read',
        description: '查看任务列表和详情'
      },
      {
        title: '管理任务',
        key: 'task:write',
        description: '创建、编辑、删除任务'
      }
    ]
  },
  {
    title: '测试管理',
    key: 'test',
    children: [
      {
        title: '查看测试',
        key: 'test:read',
        description: '查看测试用例和报告'
      },
      {
        title: '管理测试',
        key: 'test:write',
        description: '创建、编辑测试用例'
      }
    ]
  },
  {
    title: '系统管理',
    key: 'system',
    children: [
      {
        title: '查看系统',
        key: 'system:read',
        description: '查看系统配置和状态'
      },
      {
        title: '管理系统',
        key: 'system:write',
        description: '修改系统配置'
      }
    ]
  }
])

// 权限名称映射
const permissionNames = {
  'user:read': '查看用户',
  'user:write': '管理用户',
  'role:read': '查看角色',
  'role:write': '管理角色',
  'project:read': '查看项目',
  'project:write': '管理项目',
  'team:read': '查看团队',
  'team:write': '管理团队',
  'task:read': '查看任务',
  'task:write': '管理任务',
  'test:read': '查看测试',
  'test:write': '管理测试',
  'system:read': '查看系统',
  'system:write': '管理系统'
}

// 表格列配置
const columns = [
  {
    title: '角色信息',
    key: 'name',
    width: 250
  },
  {
    title: '权限',
    key: 'permissions',
    width: 300
  },
  {
    title: '用户数量',
    key: 'userCount',
    width: 100,
    align: 'center'
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    align: 'center'
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 150
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    align: 'center'
  }
]

// 用户表格列配置
const userColumns = [
  {
    title: '头像',
    key: 'avatar',
    width: 60,
    align: 'center'
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: '状态',
    key: 'status',
    align: 'center'
  },
  {
    title: '分配时间',
    key: 'assignedAt'
  }
]

// 表单验证规则
const roleRules = {
  name: [
    { required: true, message: '请输入角色名称' }
  ],
  code: [
    { required: true, message: '请输入角色代码' },
    { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '角色代码只能包含字母、数字和下划线，且以字母或下划线开头' }
  ],
  description: [
    { required: true, message: '请输入角色描述' }
  ]
}

// 计算属性
const roleModalTitle = computed(() => {
  return isEdit.value ? '编辑角色' : '新建角色'
})

const filteredRoles = computed(() => {
  let result = roles.value
  
  // 搜索过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(role => 
      role.name.toLowerCase().includes(search) ||
      role.description.toLowerCase().includes(search)
    )
  }
  
  // 类型过滤
  if (filterType.value) {
    result = result.filter(role => role.type === filterType.value)
  }
  
  // 状态过滤
  if (filterStatus.value) {
    const status = filterStatus.value === 'active'
    result = result.filter(role => role.status === status)
  }
  
  return result
})

// 方法
/**
 * 搜索处理
 */
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

/**
 * 过滤处理
 */
const handleFilter = () => {
  // 过滤逻辑已在计算属性中处理
}

/**
 * 刷新数据
 */
const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('数据刷新成功')
  }, 1000)
}

/**
 * 表格变化处理
 */
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

/**
 * 状态变化处理
 */
const handleStatusChange = (record: any, checked: boolean) => {
  record.status = checked
  message.success(`角色${checked ? '启用' : '禁用'}成功`)
}

/**
 * 显示创建模态框
 */
const showCreateModal = () => {
  isEdit.value = false
  resetRoleForm()
  roleModalVisible.value = true
}

/**
 * 显示编辑模态框
 */
const showEditModal = (record: any) => {
  isEdit.value = true
  Object.assign(roleForm, {
    id: record.id,
    name: record.name,
    code: record.code,
    description: record.description,
    permissions: [...record.permissions],
    status: record.status
  })
  roleModalVisible.value = true
}

/**
 * 显示复制模态框
 */
const showCopyModal = (record: any) => {
  isEdit.value = false
  Object.assign(roleForm, {
    id: null,
    name: `${record.name}_副本`,
    code: `${record.code}_copy`,
    description: record.description,
    permissions: [...record.permissions],
    status: true
  })
  roleModalVisible.value = true
}

/**
 * 显示角色详情
 */
const showRoleDetail = (record: any) => {
  selectedRole.value = record
  detailModalVisible.value = true
}

/**
 * 显示角色用户列表
 */
const showRoleUsers = (record: any) => {
  selectedRole.value = record
  loadingUsers.value = true
  usersModalVisible.value = true
  
  // 模拟加载用户数据
  setTimeout(() => {
    roleUsers.value = [
      {
        id: 1,
        username: 'admin',
        name: '管理员',
        email: 'admin@example.com',
        avatar: '',
        status: 'active',
        assignedAt: '2024-01-01 10:00:00'
      },
      {
        id: 2,
        username: 'user1',
        name: '张三',
        email: 'zhangsan@example.com',
        avatar: '',
        status: 'active',
        assignedAt: '2024-01-02 14:30:00'
      }
    ]
    loadingUsers.value = false
  }, 1000)
}

/**
 * 角色提交处理
 */
const handleRoleSubmit = async () => {
  try {
    await roleFormRef.value.validate()
    submitting.value = true
    
    // 模拟提交
    setTimeout(() => {
      if (isEdit.value) {
        const index = roles.value.findIndex(r => r.id === roleForm.id)
        if (index !== -1) {
          Object.assign(roles.value[index], {
            name: roleForm.name,
            code: roleForm.code,
            description: roleForm.description,
            permissions: [...roleForm.permissions],
            status: roleForm.status
          })
        }
        message.success('角色更新成功')
      } else {
        const newRole = {
          id: Date.now(),
          name: roleForm.name,
          code: roleForm.code,
          description: roleForm.description,
          type: 'custom',
          permissions: [...roleForm.permissions],
          userCount: 0,
          status: roleForm.status,
          createdAt: new Date().toLocaleString()
        }
        roles.value.unshift(newRole)
        stats.customRoles++
        stats.totalRoles++
        message.success('角色创建成功')
      }
      
      submitting.value = false
      roleModalVisible.value = false
    }, 1000)
  } catch (error) {
    console.error('角色提交失败:', error)
  }
}

/**
 * 角色取消处理
 */
const handleRoleCancel = () => {
  roleModalVisible.value = false
  resetRoleForm()
}

/**
 * 重置角色表单
 */
const resetRoleForm = () => {
  Object.assign(roleForm, {
    id: null,
    name: '',
    code: '',
    description: '',
    permissions: [],
    status: true
  })
  roleFormRef.value?.resetFields()
}

/**
 * 删除角色
 */
const deleteRole = (record: any) => {
  const index = roles.value.findIndex(r => r.id === record.id)
  if (index !== -1) {
    roles.value.splice(index, 1)
    stats.customRoles--
    stats.totalRoles--
    message.success('角色删除成功')
  }
}

/**
 * 获取权限名称
 */
const getPermissionName = (permission: string) => {
  return permissionNames[permission] || permission
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

// 生命周期
onMounted(() => {
  pagination.total = roles.value.length
})
</script>

<style scoped>
.system-roles {
  padding: 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 16px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.left-actions h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.right-actions {
  flex-shrink: 0;
}

.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.roles-table-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.role-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.role-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.role-description {
  color: #666;
  font-size: 12px;
}

.permissions-tree {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 12px;
}

.permission-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.permission-title {
  font-weight: 500;
}

.permission-description {
  color: #666;
  font-size: 12px;
}

.role-detail .ant-descriptions {
  margin-bottom: 16px;
}

.permissions-list {
  max-height: 200px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-actions {
    flex-direction: column;
    gap: 16px;
  }
  
  .right-actions {
    width: 100%;
  }
  
  .right-actions .ant-space {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .header-actions {
    padding: 12px;
  }
  
  .right-actions .ant-space {
    flex-direction: column;
    width: 100%;
  }
  
  .right-actions .ant-input-search {
    width: 100% !important;
  }
  
  .stats-cards .ant-col {
    margin-bottom: 16px;
  }
  
  .roles-table-card .ant-table {
    font-size: 12px;
  }
  
  .role-info {
    gap: 2px;
  }
  
  .role-name {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

/* 动画效果 */
.stat-card {
  animation: fadeInUp 0.6s ease-out;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .header-actions,
  .stat-card,
  .roles-table-card {
    background: #141414;
    border-color: #303030;
  }
  
  .role-description {
    color: #999;
  }
  
  .permission-description {
    color: #999;
  }
  
  .permissions-tree {
    border-color: #303030;
    background: #1f1f1f;
  }
}
</style>