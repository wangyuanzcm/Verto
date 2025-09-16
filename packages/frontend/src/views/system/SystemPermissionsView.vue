<template>
  <div class="system-permissions">
    <!-- 头部操作栏 -->
    <div class="header-actions">
      <div class="left-actions">
        <h2>权限管理</h2>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <HomeOutlined />
            首页
          </a-breadcrumb-item>
          <a-breadcrumb-item>
            <SettingOutlined />
            系统管理
          </a-breadcrumb-item>
          <a-breadcrumb-item>权限管理</a-breadcrumb-item>
        </a-breadcrumb>
      </div>
      
      <div class="right-actions">
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索权限名称或描述"
            style="width: 250px"
            @search="handleSearch"
          />
          <a-button @click="refreshData" :loading="loading">
            <ReloadOutlined />
            刷新
          </a-button>
          <a-button type="primary" @click="showCreateModal">
            <PlusOutlined />
            新建权限
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
              title="总权限数"
              :value="stats.totalPermissions"
              :value-style="{ color: '#1890ff' }"
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
              title="权限组数"
              :value="stats.permissionGroups"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <FolderOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card">
            <a-statistic
              title="已分配权限"
              :value="stats.assignedPermissions"
              :value-style="{ color: '#fa8c16' }"
            >
              <template #prefix>
                <CheckCircleOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card">
            <a-statistic
              title="关联角色"
              :value="stats.relatedRoles"
              :value-style="{ color: '#722ed1' }"
            >
              <template #prefix>
                <TeamOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>
    
    <!-- 权限树形结构 -->
    <a-card class="permissions-tree-card">
      <template #title>
        <span>权限结构</span>
      </template>
      
      <template #extra>
        <a-space>
          <a-button @click="expandAll">
            <ExpandAltOutlined />
            展开全部
          </a-button>
          <a-button @click="collapseAll">
            <ShrinkOutlined />
            收起全部
          </a-button>
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
      
      <div class="permissions-tree">
        <a-tree
          :tree-data="filteredPermissions"
          :expanded-keys="expandedKeys"
          :selected-keys="selectedKeys"
          show-line
          @expand="onExpand"
          @select="onSelect"
        >
          <template #title="{ title, description, type, status, code, roles }">
            <div class="permission-node">
              <div class="permission-info">
                <span class="permission-title">
                  <a-tag v-if="type === 'group'" color="blue">组</a-tag>
                  <a-tag v-else color="green">权限</a-tag>
                  {{ title }}
                </span>
                <span class="permission-code">{{ code }}</span>
              </div>
              
              <div class="permission-meta">
                <span class="permission-description">{{ description }}</span>
                <div class="permission-actions">
                  <a-switch
                    v-if="type !== 'group'"
                    :checked="status"
                    size="small"
                    @change="(checked) => handleStatusChange(code, checked)"
                  />
                  
                  <a-space size="small">
                    <a-tooltip title="查看详情">
                      <a-button type="text" size="small" @click="showPermissionDetail(code)">
                        <EyeOutlined />
                      </a-button>
                    </a-tooltip>
                    
                    <a-tooltip title="编辑">
                      <a-button type="text" size="small" @click="showEditModal(code)">
                        <EditOutlined />
                      </a-button>
                    </a-tooltip>
                    
                    <a-tooltip v-if="type !== 'group'" title="删除">
                      <a-popconfirm
                        title="确定要删除这个权限吗？"
                        ok-text="确定"
                        cancel-text="取消"
                        @confirm="deletePermission(code)"
                      >
                        <a-button type="text" size="small" danger>
                          <DeleteOutlined />
                        </a-button>
                      </a-popconfirm>
                    </a-tooltip>
                  </a-space>
                </div>
              </div>
              
              <div v-if="roles && roles.length > 0" class="permission-roles">
                <span class="roles-label">关联角色：</span>
                <a-space wrap>
                  <a-tag
                    v-for="role in roles.slice(0, 3)"
                    :key="role"
                    size="small"
                    color="purple"
                  >
                    {{ role }}
                  </a-tag>
                  <a-tag v-if="roles.length > 3" size="small" color="default">
                    +{{ roles.length - 3 }}
                  </a-tag>
                </a-space>
              </div>
            </div>
          </template>
        </a-tree>
      </div>
    </a-card>
    
    <!-- 创建/编辑权限模态框 -->
    <a-modal
      v-model:open="permissionModalVisible"
      :title="permissionModalTitle"
      width="600px"
      :confirm-loading="submitting"
      @ok="handlePermissionSubmit"
      @cancel="handlePermissionCancel"
    >
      <a-form
        ref="permissionFormRef"
        :model="permissionForm"
        :rules="permissionRules"
        layout="vertical"
      >
        <a-form-item label="权限类型" name="type">
          <a-radio-group v-model:value="permissionForm.type" :disabled="isEdit">
            <a-radio value="group">权限组</a-radio>
            <a-radio value="permission">权限</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="权限名称" name="title">
              <a-input v-model:value="permissionForm.title" placeholder="请输入权限名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="权限代码" name="code">
              <a-input v-model:value="permissionForm.code" placeholder="请输入权限代码" :disabled="isEdit" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item v-if="permissionForm.type === 'permission'" label="父级权限组" name="parentCode">
          <a-tree-select
            v-model:value="permissionForm.parentCode"
            :tree-data="groupOptions"
            placeholder="请选择父级权限组"
            tree-default-expand-all
            allow-clear
          />
        </a-form-item>
        
        <a-form-item label="权限描述" name="description">
          <a-textarea
            v-model:value="permissionForm.description"
            :rows="3"
            placeholder="请输入权限描述"
          />
        </a-form-item>
        
        <a-form-item v-if="permissionForm.type === 'permission'" label="资源路径" name="resource">
          <a-input v-model:value="permissionForm.resource" placeholder="请输入资源路径，如：/api/users" />
        </a-form-item>
        
        <a-form-item v-if="permissionForm.type === 'permission'" label="操作类型" name="actions">
          <a-checkbox-group v-model:value="permissionForm.actions">
            <a-checkbox value="read">查看</a-checkbox>
            <a-checkbox value="write">编辑</a-checkbox>
            <a-checkbox value="delete">删除</a-checkbox>
            <a-checkbox value="execute">执行</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        
        <a-form-item>
          <a-checkbox v-model:checked="permissionForm.status">
            启用权限
          </a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 权限详情模态框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="权限详情"
      width="700px"
      :footer="null"
    >
      <div v-if="selectedPermission" class="permission-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="权限名称">
            {{ selectedPermission.title }}
          </a-descriptions-item>
          <a-descriptions-item label="权限代码">
            {{ selectedPermission.code }}
          </a-descriptions-item>
          <a-descriptions-item label="权限类型">
            <a-tag :color="selectedPermission.type === 'group' ? 'blue' : 'green'">
              {{ selectedPermission.type === 'group' ? '权限组' : '权限' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="selectedPermission.status ? 'green' : 'red'">
              {{ selectedPermission.status ? '启用' : '禁用' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item v-if="selectedPermission.resource" label="资源路径">
            {{ selectedPermission.resource }}
          </a-descriptions-item>
          <a-descriptions-item v-if="selectedPermission.actions" label="操作类型">
            <a-space wrap>
              <a-tag v-for="action in selectedPermission.actions" :key="action" color="blue">
                {{ getActionName(action) }}
              </a-tag>
            </a-space>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ formatDate(selectedPermission.createdAt) }}
          </a-descriptions-item>
          <a-descriptions-item label="更新时间">
            {{ formatDate(selectedPermission.updatedAt) }}
          </a-descriptions-item>
          <a-descriptions-item label="权限描述" :span="2">
            {{ selectedPermission.description }}
          </a-descriptions-item>
        </a-descriptions>
        
        <a-divider v-if="selectedPermission.roles && selectedPermission.roles.length > 0">
          关联角色
        </a-divider>
        
        <div v-if="selectedPermission.roles && selectedPermission.roles.length > 0" class="related-roles">
          <a-space wrap>
            <a-tag
              v-for="role in selectedPermission.roles"
              :key="role"
              color="purple"
            >
              {{ role }}
            </a-tag>
          </a-space>
        </div>
      </div>
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
  SafetyOutlined,
  FolderOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  ExpandAltOutlined,
  ShrinkOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const searchText = ref('')
const filterStatus = ref()
const permissionModalVisible = ref(false)
const detailModalVisible = ref(false)
const isEdit = ref(false)
const selectedPermission = ref(null)
const expandedKeys = ref(['user', 'project', 'team', 'system'])
const selectedKeys = ref([])

// 表单引用
const permissionFormRef = ref()

// 统计数据
const stats = reactive({
  totalPermissions: 28,
  permissionGroups: 7,
  assignedPermissions: 24,
  relatedRoles: 12
})

// 权限表单
const permissionForm = reactive({
  type: 'permission',
  title: '',
  code: '',
  description: '',
  parentCode: '',
  resource: '',
  actions: [],
  status: true
})

// 权限数据
const permissions = ref([
  {
    title: '用户管理',
    key: 'user',
    code: 'user',
    description: '用户相关权限管理',
    type: 'group',
    status: true,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00',
    children: [
      {
        title: '查看用户',
        key: 'user:read',
        code: 'user:read',
        description: '查看用户列表和详情',
        type: 'permission',
        resource: '/api/users',
        actions: ['read'],
        status: true,
        roles: ['超级管理员', '系统管理员', '项目经理'],
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00'
      },
      {
        title: '管理用户',
        key: 'user:write',
        code: 'user:write',
        description: '创建、编辑、删除用户',
        type: 'permission',
        resource: '/api/users',
        actions: ['write', 'delete'],
        status: true,
        roles: ['超级管理员', '系统管理员'],
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00'
      }
    ]
  },
  {
    title: '角色管理',
    key: 'role',
    code: 'role',
    description: '角色相关权限管理',
    type: 'group',
    status: true,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00',
    children: [
      {
        title: '查看角色',
        key: 'role:read',
        code: 'role:read',
        description: '查看角色列表和详情',
        type: 'permission',
        resource: '/api/roles',
        actions: ['read'],
        status: true,
        roles: ['超级管理员', '系统管理员'],
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00'
      },
      {
        title: '管理角色',
        key: 'role:write',
        code: 'role:write',
        description: '创建、编辑、删除角色',
        type: 'permission',
        resource: '/api/roles',
        actions: ['write', 'delete'],
        status: true,
        roles: ['超级管理员'],
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00'
      }
    ]
  },
  {
    title: '项目管理',
    key: 'project',
    code: 'project',
    description: '项目相关权限管理',
    type: 'group',
    status: true,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00',
    children: [
      {
        title: '查看项目',
        key: 'project:read',
        code: 'project:read',
        description: '查看项目列表和详情',
        type: 'permission',
        resource: '/api/projects',
        actions: ['read'],
        status: true,
        roles: ['超级管理员', '项目经理', '开发人员', '测试人员'],
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00'
      },
      {
        title: '管理项目',
        key: 'project:write',
        code: 'project:write',
        description: '创建、编辑、删除项目',
        type: 'permission',
        resource: '/api/projects',
        actions: ['write', 'delete'],
        status: true,
        roles: ['超级管理员', '项目经理'],
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00'
      }
    ]
  },
  {
    title: '团队管理',
    key: 'team',
    code: 'team',
    description: '团队相关权限管理',
    type: 'group',
    status: true,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00',
    children: [
      {
        title: '查看团队',
        key: 'team:read',
        code: 'team:read',
        description: '查看团队列表和详情',
        type: 'permission',
        resource: '/api/teams',
        actions: ['read'],
        status: true,
        roles: ['超级管理员', '项目经理'],
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00'
      },
      {
        title: '管理团队',
        key: 'team:write',
        code: 'team:write',
        description: '创建、编辑、删除团队',
        type: 'permission',
        resource: '/api/teams',
        actions: ['write', 'delete'],
        status: true,
        roles: ['超级管理员', '项目经理'],
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00'
      }
    ]
  },
  {
    title: '任务管理',
    key: 'task',
    code: 'task',
    description: '任务相关权限管理',
    type: 'group',
    status: true,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00',
    children: [
      {
        title: '查看任务',
        key: 'task:read',
        code: 'task:read',
        description: '查看任务列表和详情',
        type: 'permission',
        resource: '/api/tasks',
        actions: ['read'],
        status: true,
        roles: ['超级管理员', '项目经理', '开发人员', '测试人员'],
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00'
      },
      {
        title: '管理任务',
        key: 'task:write',
        code: 'task:write',
        description: '创建、编辑、删除任务',
        type: 'permission',
        resource: '/api/tasks',
        actions: ['write', 'delete'],
        status: true,
        roles: ['超级管理员', '项目经理', '开发人员'],
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00'
      }
    ]
  },
  {
    title: '系统管理',
    key: 'system',
    code: 'system',
    description: '系统相关权限管理',
    type: 'group',
    status: true,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00',
    children: [
      {
        title: '查看系统',
        key: 'system:read',
        code: 'system:read',
        description: '查看系统配置和状态',
        type: 'permission',
        resource: '/api/system',
        actions: ['read'],
        status: true,
        roles: ['超级管理员', '系统管理员'],
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00'
      },
      {
        title: '管理系统',
        key: 'system:write',
        code: 'system:write',
        description: '修改系统配置',
        type: 'permission',
        resource: '/api/system',
        actions: ['write'],
        status: true,
        roles: ['超级管理员'],
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00'
      }
    ]
  }
])

// 操作类型名称映射
const actionNames = {
  read: '查看',
  write: '编辑',
  delete: '删除',
  execute: '执行'
}

// 表单验证规则
const permissionRules = {
  title: [
    { required: true, message: '请输入权限名称' }
  ],
  code: [
    { required: true, message: '请输入权限代码' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9:_]*$/, message: '权限代码只能包含字母、数字、冒号和下划线，且以字母开头' }
  ],
  description: [
    { required: true, message: '请输入权限描述' }
  ],
  parentCode: [
    { required: true, message: '请选择父级权限组' }
  ]
}

// 计算属性
const permissionModalTitle = computed(() => {
  return isEdit.value ? '编辑权限' : '新建权限'
})

const filteredPermissions = computed(() => {
  let result = permissions.value
  
  // 搜索过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = filterTreeData(result, (node) => 
      node.title.toLowerCase().includes(search) ||
      node.description.toLowerCase().includes(search) ||
      node.code.toLowerCase().includes(search)
    )
  }
  
  // 状态过滤
  if (filterStatus.value) {
    const status = filterStatus.value === 'active'
    result = filterTreeData(result, (node) => node.status === status)
  }
  
  return result
})

const groupOptions = computed(() => {
  return permissions.value
    .filter(p => p.type === 'group')
    .map(p => ({
      title: p.title,
      value: p.code,
      key: p.code
    }))
})

// 方法
/**
 * 树形数据过滤
 */
const filterTreeData = (data: any[], predicate: (node: any) => boolean): any[] => {
  return data.reduce((acc, node) => {
    const children = node.children ? filterTreeData(node.children, predicate) : []
    
    if (predicate(node) || children.length > 0) {
      acc.push({
        ...node,
        children: children.length > 0 ? children : node.children
      })
    }
    
    return acc
  }, [])
}

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
 * 展开全部
 */
const expandAll = () => {
  const getAllKeys = (data: any[]): string[] => {
    let keys: string[] = []
    data.forEach(item => {
      keys.push(item.key)
      if (item.children) {
        keys = keys.concat(getAllKeys(item.children))
      }
    })
    return keys
  }
  
  expandedKeys.value = getAllKeys(permissions.value)
}

/**
 * 收起全部
 */
const collapseAll = () => {
  expandedKeys.value = []
}

/**
 * 树节点展开处理
 */
const onExpand = (keys: string[]) => {
  expandedKeys.value = keys
}

/**
 * 树节点选择处理
 */
const onSelect = (keys: string[]) => {
  selectedKeys.value = keys
}

/**
 * 状态变化处理
 */
const handleStatusChange = (code: string, checked: boolean) => {
  const updateStatus = (data: any[]) => {
    data.forEach(item => {
      if (item.code === code) {
        item.status = checked
      }
      if (item.children) {
        updateStatus(item.children)
      }
    })
  }
  
  updateStatus(permissions.value)
  message.success(`权限${checked ? '启用' : '禁用'}成功`)
}

/**
 * 显示创建模态框
 */
const showCreateModal = () => {
  isEdit.value = false
  resetPermissionForm()
  permissionModalVisible.value = true
}

/**
 * 显示编辑模态框
 */
const showEditModal = (code: string) => {
  const findPermission = (data: any[], targetCode: string): any => {
    for (const item of data) {
      if (item.code === targetCode) {
        return item
      }
      if (item.children) {
        const found = findPermission(item.children, targetCode)
        if (found) return found
      }
    }
    return null
  }
  
  const permission = findPermission(permissions.value, code)
  if (permission) {
    isEdit.value = true
    Object.assign(permissionForm, {
      type: permission.type,
      title: permission.title,
      code: permission.code,
      description: permission.description,
      parentCode: permission.type === 'permission' ? getParentCode(code) : '',
      resource: permission.resource || '',
      actions: permission.actions || [],
      status: permission.status
    })
    permissionModalVisible.value = true
  }
}

/**
 * 显示权限详情
 */
const showPermissionDetail = (code: string) => {
  const findPermission = (data: any[], targetCode: string): any => {
    for (const item of data) {
      if (item.code === targetCode) {
        return item
      }
      if (item.children) {
        const found = findPermission(item.children, targetCode)
        if (found) return found
      }
    }
    return null
  }
  
  selectedPermission.value = findPermission(permissions.value, code)
  detailModalVisible.value = true
}

/**
 * 权限提交处理
 */
const handlePermissionSubmit = async () => {
  try {
    await permissionFormRef.value.validate()
    submitting.value = true
    
    // 模拟提交
    setTimeout(() => {
      if (isEdit.value) {
        // 更新权限逻辑
        message.success('权限更新成功')
      } else {
        // 创建权限逻辑
        const newPermission = {
          title: permissionForm.title,
          key: permissionForm.code,
          code: permissionForm.code,
          description: permissionForm.description,
          type: permissionForm.type,
          resource: permissionForm.resource,
          actions: permissionForm.actions,
          status: permissionForm.status,
          roles: [],
          createdAt: new Date().toLocaleString(),
          updatedAt: new Date().toLocaleString()
        }
        
        if (permissionForm.type === 'group') {
          newPermission.children = []
          permissions.value.push(newPermission)
        } else {
          // 添加到对应的权限组
          const parentGroup = permissions.value.find(p => p.code === permissionForm.parentCode)
          if (parentGroup) {
            parentGroup.children = parentGroup.children || []
            parentGroup.children.push(newPermission)
          }
        }
        
        stats.totalPermissions++
        if (permissionForm.type === 'group') {
          stats.permissionGroups++
        }
        
        message.success('权限创建成功')
      }
      
      submitting.value = false
      permissionModalVisible.value = false
    }, 1000)
  } catch (error) {
    console.error('权限提交失败:', error)
  }
}

/**
 * 权限取消处理
 */
const handlePermissionCancel = () => {
  permissionModalVisible.value = false
  resetPermissionForm()
}

/**
 * 重置权限表单
 */
const resetPermissionForm = () => {
  Object.assign(permissionForm, {
    type: 'permission',
    title: '',
    code: '',
    description: '',
    parentCode: '',
    resource: '',
    actions: [],
    status: true
  })
  permissionFormRef.value?.resetFields()
}

/**
 * 删除权限
 */
const deletePermission = (code: string) => {
  const deleteFromTree = (data: any[], targetCode: string): boolean => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].code === targetCode) {
        data.splice(i, 1)
        return true
      }
      if (data[i].children && deleteFromTree(data[i].children, targetCode)) {
        return true
      }
    }
    return false
  }
  
  if (deleteFromTree(permissions.value, code)) {
    stats.totalPermissions--
    message.success('权限删除成功')
  }
}

/**
 * 获取父级权限组代码
 */
const getParentCode = (code: string): string => {
  const parts = code.split(':')
  return parts.length > 1 ? parts[0] : ''
}

/**
 * 获取操作类型名称
 */
const getActionName = (action: string) => {
  return actionNames[action] || action
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

// 生命周期
onMounted(() => {
  // 初始化数据
  console.log('权限管理页面已加载')
})
</script>

<style scoped>
.system-permissions {
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

.permissions-tree-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.permissions-tree {
  max-height: 600px;
  overflow-y: auto;
}

.permission-node {
  width: 100%;
  padding: 8px 0;
}

.permission-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.permission-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.permission-code {
  color: #666;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
}

.permission-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.permission-description {
  color: #666;
  font-size: 12px;
  flex: 1;
}

.permission-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.permission-roles {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.roles-label {
  color: #666;
  font-size: 12px;
  margin-right: 8px;
}

.permission-detail .ant-descriptions {
  margin-bottom: 16px;
}

.related-roles {
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
  
  .permission-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .permission-actions {
    align-self: flex-end;
  }
  
  .permission-roles {
    margin-top: 4px;
    padding-top: 4px;
  }
  
  .roles-label {
    display: block;
    margin-bottom: 4px;
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
  .permissions-tree-card {
    background: #141414;
    border-color: #303030;
  }
  
  .permission-code {
    background: #262626;
    color: #999;
  }
  
  .permission-description {
    color: #999;
  }
  
  .roles-label {
    color: #999;
  }
  
  .permission-roles {
    border-color: #303030;
  }
}
</style>