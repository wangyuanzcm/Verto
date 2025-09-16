<template>
  <div class="team-roles">
    <!-- 头部操作栏 -->
    <div class="header-actions">
      <div class="header-left">
        <h2 class="page-title">角色权限管理</h2>
        <p class="page-description">管理团队角色和权限配置，确保合适的访问控制</p>
      </div>
      
      <div class="header-right">
        <a-space>
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索角色名称或描述"
            style="width: 280px"
            @search="handleSearch"
            allow-clear
          >
            <template #enterButton>
              <SearchOutlined />
            </template>
          </a-input-search>
          
          <a-button @click="refreshRoles" :loading="loading">
            <ReloadOutlined />
            刷新
          </a-button>
          
          <a-button type="primary" @click="showCreateModal">
            <PlusOutlined />
            创建角色
          </a-button>
          
          <a-dropdown>
            <template #overlay>
              <a-menu @click="handleBatchAction">
                <a-menu-item key="export">
                  <ExportOutlined />
                  导出角色配置
                </a-menu-item>
                <a-menu-item key="import">
                  <ImportOutlined />
                  导入角色配置
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="permissions">
                  <SafetyCertificateOutlined />
                  权限管理
                </a-menu-item>
                <a-menu-item key="audit">
                  <AuditOutlined />
                  权限审计
                </a-menu-item>
              </a-menu>
            </template>
            <a-button>
              更多操作
              <DownOutlined />
            </a-button>
          </a-dropdown>
        </a-space>
      </div>
    </div>
    
    <!-- 角色统计 -->
    <div class="stats-section">
      <a-row :gutter="[24, 16]">
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <a-statistic
              title="总角色数"
              :value="roleStats.total"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <SafetyCertificateOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <a-statistic
              title="系统角色"
              :value="roleStats.system"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <SettingOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <a-statistic
              title="自定义角色"
              :value="roleStats.custom"
              :value-style="{ color: '#fa8c16' }"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <a-statistic
              title="已分配用户"
              :value="roleStats.assignedUsers"
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
    
    <!-- 角色列表 -->
    <div class="roles-content">
      <a-row :gutter="[24, 24]">
        <a-col
          v-for="role in filteredRoles"
          :key="role.id"
          :xs="24"
          :sm="12"
          :lg="8"
          :xl="6"
        >
          <a-card class="role-card" :class="{ system: role.isSystem }">
            <template #title>
              <div class="role-header">
                <div class="role-info">
                  <div class="role-name">
                    <component :is="getRoleIcon(role.type)" class="role-icon" />
                    {{ role.name }}
                  </div>
                  <a-tag v-if="role.isSystem" color="green" size="small">系统角色</a-tag>
                  <a-tag v-else color="blue" size="small">自定义</a-tag>
                </div>
                
                <a-dropdown v-if="!role.isSystem">
                  <template #overlay>
                    <a-menu @click="({ key }) => handleRoleAction(key, role)">
                      <a-menu-item key="edit">
                        <EditOutlined />
                        编辑角色
                      </a-menu-item>
                      <a-menu-item key="copy">
                        <CopyOutlined />
                        复制角色
                      </a-menu-item>
                      <a-menu-item key="permissions">
                        <SafetyCertificateOutlined />
                        权限配置
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item key="delete" class="danger-item">
                        <DeleteOutlined />
                        删除角色
                      </a-menu-item>
                    </a-menu>
                  </template>
                  <a-button type="text" size="small">
                    <MoreOutlined />
                  </a-button>
                </a-dropdown>
              </div>
            </template>
            
            <div class="role-content">
              <div class="role-description">
                {{ role.description || '暂无描述' }}
              </div>
              
              <div class="role-stats">
                <div class="stat-item">
                  <span class="stat-label">用户数量:</span>
                  <span class="stat-value">{{ role.userCount }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">权限数量:</span>
                  <span class="stat-value">{{ role.permissionCount }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">创建时间:</span>
                  <span class="stat-value">{{ formatDate(role.createdAt) }}</span>
                </div>
              </div>
              
              <div class="role-permissions">
                <h5>主要权限</h5>
                <div class="permission-tags">
                  <a-tag
                    v-for="permission in role.mainPermissions"
                    :key="permission.id"
                    :color="getPermissionColor(permission.type)"
                    size="small"
                  >
                    {{ permission.name }}
                  </a-tag>
                  <a-tag v-if="role.permissionCount > role.mainPermissions.length" color="default" size="small">
                    +{{ role.permissionCount - role.mainPermissions.length }} 更多
                  </a-tag>
                </div>
              </div>
              
              <div class="role-users">
                <h5>分配用户</h5>
                <div class="user-avatars">
                  <a-avatar-group :max-count="5" size="small">
                    <a-avatar
                      v-for="user in role.users"
                      :key="user.id"
                      :src="user.avatar"
                      :title="user.name"
                    >
                      {{ user.name.charAt(0) }}
                    </a-avatar>
                  </a-avatar-group>
                  <span v-if="role.userCount > 0" class="user-count">
                    共 {{ role.userCount }} 人
                  </span>
                  <span v-else class="no-users">暂无用户</span>
                </div>
              </div>
            </div>
            
            <template #actions>
              <a-space>
                <a-button size="small" @click="viewRoleDetail(role)">
                  <EyeOutlined />
                  查看详情
                </a-button>
                <a-button v-if="!role.isSystem" size="small" @click="editRole(role)">
                  <EditOutlined />
                  编辑
                </a-button>
                <a-button size="small" @click="assignUsers(role)">
                  <UserAddOutlined />
                  分配用户
                </a-button>
              </a-space>
            </template>
          </a-card>
        </a-col>
      </a-row>
      
      <!-- 空状态 -->
      <div v-if="filteredRoles.length === 0" class="empty-state">
        <a-empty description="暂无角色数据">
          <a-button type="primary" @click="showCreateModal">
            <PlusOutlined />
            创建第一个角色
          </a-button>
        </a-empty>
      </div>
    </div>
    
    <!-- 创建/编辑角色模态框 -->
    <a-modal
      v-model:open="roleModalVisible"
      :title="isEditing ? '编辑角色' : '创建角色'"
      width="800px"
      @ok="handleRoleSubmit"
      @cancel="resetRoleForm"
      :confirm-loading="submitLoading"
    >
      <a-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        layout="vertical"
      >
        <a-row :gutter="[16, 0]">
          <a-col :span="12">
            <a-form-item label="角色名称" name="name">
              <a-input
                v-model:value="roleForm.name"
                placeholder="请输入角色名称"
                :disabled="isEditing && roleForm.isSystem"
              />
            </a-form-item>
          </a-col>
          
          <a-col :span="12">
            <a-form-item label="角色类型" name="type">
              <a-select
                v-model:value="roleForm.type"
                placeholder="选择角色类型"
                :disabled="isEditing && roleForm.isSystem"
              >
                <a-select-option value="admin">管理员</a-select-option>
                <a-select-option value="manager">管理者</a-select-option>
                <a-select-option value="member">成员</a-select-option>
                <a-select-option value="guest">访客</a-select-option>
                <a-select-option value="custom">自定义</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="角色描述" name="description">
          <a-textarea
            v-model:value="roleForm.description"
            placeholder="请输入角色描述"
            :rows="3"
            :max-length="200"
            show-count
          />
        </a-form-item>
        
        <a-form-item label="权限配置" name="permissions">
          <div class="permission-config">
            <a-tree
              v-model:checkedKeys="roleForm.permissions"
              :tree-data="permissionTree"
              checkable
              :default-expand-all="true"
              :check-strictly="false"
            >
              <template #title="{ title, type, description }">
                <div class="permission-item">
                  <span class="permission-name">{{ title }}</span>
                  <a-tag :color="getPermissionColor(type)" size="small">{{ type }}</a-tag>
                  <span v-if="description" class="permission-desc">{{ description }}</span>
                </div>
              </template>
            </a-tree>
          </div>
        </a-form-item>
        
        <a-form-item label="角色设置">
          <a-space direction="vertical" style="width: 100%">
            <a-checkbox v-model:checked="roleForm.isDefault">
              设为默认角色（新用户自动分配此角色）
            </a-checkbox>
            <a-checkbox v-model:checked="roleForm.isActive">
              启用角色（禁用后用户将无法使用此角色权限）
            </a-checkbox>
          </a-space>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 角色详情模态框 -->
    <a-modal
      v-model:open="roleDetailVisible"
      :title="`角色详情 - ${selectedRole?.name}`"
      width="900px"
      :footer="null"
    >
      <div v-if="selectedRole" class="role-detail">
        <div class="detail-header">
          <div class="role-info">
            <div class="role-title">
              <component :is="getRoleIcon(selectedRole.type)" class="role-icon large" />
              <div>
                <h3>{{ selectedRole.name }}</h3>
                <div class="role-meta">
                  <a-tag v-if="selectedRole.isSystem" color="green">系统角色</a-tag>
                  <a-tag v-else color="blue">自定义角色</a-tag>
                  <a-tag :color="selectedRole.isActive ? 'success' : 'default'">
                    {{ selectedRole.isActive ? '已启用' : '已禁用' }}
                  </a-tag>
                  <a-tag v-if="selectedRole.isDefault" color="orange">默认角色</a-tag>
                </div>
              </div>
            </div>
            <p class="role-description">{{ selectedRole.description || '暂无描述' }}</p>
          </div>
        </div>
        
        <a-divider />
        
        <a-tabs default-active-key="permissions">
          <a-tab-pane key="permissions" tab="权限列表">
            <div class="permissions-list">
              <a-tree
                :tree-data="selectedRolePermissions"
                :default-expand-all="true"
                :selectable="false"
              >
                <template #title="{ title, type, description, hasPermission }">
                  <div class="permission-detail-item">
                    <div class="permission-info">
                      <span class="permission-name">{{ title }}</span>
                      <a-tag :color="getPermissionColor(type)" size="small">{{ type }}</a-tag>
                    </div>
                    <div class="permission-status">
                      <a-badge
                        :status="hasPermission ? 'success' : 'default'"
                        :text="hasPermission ? '已授权' : '未授权'"
                      />
                    </div>
                  </div>
                </template>
              </a-tree>
            </div>
          </a-tab-pane>
          
          <a-tab-pane key="users" tab="分配用户">
            <div class="assigned-users">
              <div class="users-header">
                <h4>已分配用户 ({{ selectedRole.userCount }})</h4>
                <a-button size="small" @click="assignUsers(selectedRole)">
                  <UserAddOutlined />
                  分配用户
                </a-button>
              </div>
              
              <div class="users-list">
                <div v-for="user in selectedRole.users" :key="user.id" class="user-item">
                  <div class="user-info">
                    <a-avatar :src="user.avatar" :size="32">
                      {{ user.name.charAt(0) }}
                    </a-avatar>
                    <div class="user-details">
                      <div class="user-name">{{ user.name }}</div>
                      <div class="user-email">{{ user.email }}</div>
                    </div>
                  </div>
                  
                  <div class="user-meta">
                    <span class="assign-date">{{ formatDate(user.assignedAt) }}</span>
                    <a-button v-if="!selectedRole.isSystem" type="text" size="small" danger>
                      <DeleteOutlined />
                    </a-button>
                  </div>
                </div>
                
                <div v-if="selectedRole.users.length === 0" class="no-users">
                  <a-empty description="暂无分配用户" />
                </div>
              </div>
            </div>
          </a-tab-pane>
          
          <a-tab-pane key="audit" tab="操作日志">
            <div class="audit-logs">
              <a-timeline>
                <a-timeline-item
                  v-for="log in roleAuditLogs"
                  :key="log.id"
                  :color="getLogColor(log.action)"
                >
                  <div class="log-item">
                    <div class="log-header">
                      <span class="log-action">{{ log.action }}</span>
                      <span class="log-time">{{ formatTime(log.createdAt) }}</span>
                    </div>
                    <div class="log-content">
                      <span class="log-user">{{ log.user }}</span>
                      <span class="log-description">{{ log.description }}</span>
                    </div>
                  </div>
                </a-timeline-item>
              </a-timeline>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>
    
    <!-- 分配用户模态框 -->
    <a-modal
      v-model:open="assignUserVisible"
      title="分配用户"
      width="600px"
      @ok="handleAssignUsers"
      @cancel="resetAssignForm"
      :confirm-loading="assignLoading"
    >
      <div class="assign-users">
        <div class="search-users">
          <a-input-search
            v-model:value="userSearchKeyword"
            placeholder="搜索用户"
            @search="searchUsers"
            allow-clear
          />
        </div>
        
        <div class="users-selection">
          <a-checkbox-group v-model:value="selectedUsers" style="width: 100%">
            <div v-for="user in availableUsers" :key="user.id" class="user-option">
              <a-checkbox :value="user.id">
                <div class="user-info">
                  <a-avatar :src="user.avatar" :size="24">
                    {{ user.name.charAt(0) }}
                  </a-avatar>
                  <div class="user-details">
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-email">{{ user.email }}</div>
                  </div>
                </div>
              </a-checkbox>
            </div>
          </a-checkbox-group>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  ExportOutlined,
  ImportOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  DownOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
  UserAddOutlined,
  CrownOutlined,
  KeyOutlined,
  ShieldOutlined,
  GlobalOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

// 扩展 dayjs
dayjs.extend(relativeTime)

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const assignLoading = ref(false)
const searchKeyword = ref('')
const userSearchKeyword = ref('')
const roleModalVisible = ref(false)
const roleDetailVisible = ref(false)
const assignUserVisible = ref(false)
const isEditing = ref(false)
const selectedRole = ref(null)
const selectedUsers = ref<string[]>([])

// 表单引用
const roleFormRef = ref()

// 角色统计
const roleStats = reactive({
  total: 7,
  system: 3,
  custom: 4,
  assignedUsers: 24
})

// 角色表单
const roleForm = reactive({
  id: '',
  name: '',
  type: '',
  description: '',
  permissions: [],
  isDefault: false,
  isActive: true,
  isSystem: false
})

// 角色表单验证规则
const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度为2-20个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择角色类型', trigger: 'change' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ]
}

// 角色数据
const roles = ref([
  {
    id: '1',
    name: '超级管理员',
    type: 'admin',
    description: '拥有系统所有权限，可以管理所有功能和用户',
    isSystem: true,
    isDefault: false,
    isActive: true,
    userCount: 2,
    permissionCount: 25,
    createdAt: '2023-01-01T00:00:00Z',
    mainPermissions: [
      { id: '1', name: '系统管理', type: 'system' },
      { id: '2', name: '用户管理', type: 'user' },
      { id: '3', name: '权限管理', type: 'permission' }
    ],
    users: [
      { id: '1', name: '系统管理员', email: 'admin@example.com', avatar: '', assignedAt: '2023-01-01T00:00:00Z' }
    ]
  },
  {
    id: '2',
    name: '项目经理',
    type: 'manager',
    description: '负责项目管理，可以创建和管理项目，分配任务',
    isSystem: true,
    isDefault: false,
    isActive: true,
    userCount: 5,
    permissionCount: 18,
    createdAt: '2023-01-01T00:00:00Z',
    mainPermissions: [
      { id: '4', name: '项目管理', type: 'project' },
      { id: '5', name: '任务管理', type: 'task' },
      { id: '6', name: '团队管理', type: 'team' }
    ],
    users: [
      { id: '2', name: '张三', email: 'zhangsan@example.com', avatar: '', assignedAt: '2023-06-15T00:00:00Z' },
      { id: '3', name: '李四', email: 'lisi@example.com', avatar: '', assignedAt: '2023-08-20T00:00:00Z' }
    ]
  },
  {
    id: '3',
    name: '开发工程师',
    type: 'member',
    description: '负责开发工作，可以查看和编辑分配的项目和任务',
    isSystem: true,
    isDefault: true,
    isActive: true,
    userCount: 12,
    permissionCount: 12,
    createdAt: '2023-01-01T00:00:00Z',
    mainPermissions: [
      { id: '7', name: '项目查看', type: 'project' },
      { id: '8', name: '任务编辑', type: 'task' },
      { id: '9', name: '代码管理', type: 'code' }
    ],
    users: [
      { id: '4', name: '王五', email: 'wangwu@example.com', avatar: '', assignedAt: '2023-09-10T00:00:00Z' },
      { id: '5', name: '赵六', email: 'zhaoliu@example.com', avatar: '', assignedAt: '2023-10-05T00:00:00Z' }
    ]
  },
  {
    id: '4',
    name: 'UI设计师',
    type: 'member',
    description: '负责界面设计，可以管理设计资源和原型',
    isSystem: false,
    isDefault: false,
    isActive: true,
    userCount: 3,
    permissionCount: 8,
    createdAt: '2023-03-15T00:00:00Z',
    mainPermissions: [
      { id: '10', name: '设计管理', type: 'design' },
      { id: '11', name: '原型编辑', type: 'prototype' },
      { id: '12', name: '资源管理', type: 'resource' }
    ],
    users: [
      { id: '6', name: '钱七', email: 'qianqi@example.com', avatar: '', assignedAt: '2024-01-15T00:00:00Z' }
    ]
  },
  {
    id: '5',
    name: '测试工程师',
    type: 'member',
    description: '负责测试工作，可以创建和执行测试用例',
    isSystem: false,
    isDefault: false,
    isActive: true,
    userCount: 2,
    permissionCount: 6,
    createdAt: '2023-05-20T00:00:00Z',
    mainPermissions: [
      { id: '13', name: '测试管理', type: 'test' },
      { id: '14', name: '缺陷管理', type: 'bug' }
    ],
    users: []
  }
])

// 权限树数据
const permissionTree = ref([
  {
    title: '系统管理',
    key: 'system',
    type: 'system',
    children: [
      { title: '用户管理', key: 'system.user', type: 'system', description: '管理系统用户' },
      { title: '角色管理', key: 'system.role', type: 'system', description: '管理角色权限' },
      { title: '系统设置', key: 'system.setting', type: 'system', description: '系统配置管理' }
    ]
  },
  {
    title: '项目管理',
    key: 'project',
    type: 'project',
    children: [
      { title: '项目创建', key: 'project.create', type: 'project', description: '创建新项目' },
      { title: '项目编辑', key: 'project.edit', type: 'project', description: '编辑项目信息' },
      { title: '项目删除', key: 'project.delete', type: 'project', description: '删除项目' },
      { title: '项目查看', key: 'project.view', type: 'project', description: '查看项目详情' }
    ]
  },
  {
    title: '任务管理',
    key: 'task',
    type: 'task',
    children: [
      { title: '任务创建', key: 'task.create', type: 'task', description: '创建新任务' },
      { title: '任务编辑', key: 'task.edit', type: 'task', description: '编辑任务信息' },
      { title: '任务分配', key: 'task.assign', type: 'task', description: '分配任务给用户' },
      { title: '任务查看', key: 'task.view', type: 'task', description: '查看任务详情' }
    ]
  },
  {
    title: '团队管理',
    key: 'team',
    type: 'team',
    children: [
      { title: '成员邀请', key: 'team.invite', type: 'team', description: '邀请新成员' },
      { title: '成员管理', key: 'team.manage', type: 'team', description: '管理团队成员' },
      { title: '部门管理', key: 'team.department', type: 'team', description: '管理部门结构' }
    ]
  }
])

// 可分配用户列表
const availableUsers = ref([
  { id: '7', name: '孙八', email: 'sunba@example.com', avatar: '' },
  { id: '8', name: '周九', email: 'zhoujiu@example.com', avatar: '' },
  { id: '9', name: '吴十', email: 'wushi@example.com', avatar: '' }
])

// 角色审计日志
const roleAuditLogs = ref([
  {
    id: '1',
    action: '创建角色',
    user: '系统管理员',
    description: '创建了UI设计师角色',
    createdAt: '2023-03-15T10:30:00Z'
  },
  {
    id: '2',
    action: '修改权限',
    user: '张三',
    description: '为UI设计师角色添加了原型编辑权限',
    createdAt: '2023-03-16T14:20:00Z'
  },
  {
    id: '3',
    action: '分配用户',
    user: '张三',
    description: '将钱七分配到UI设计师角色',
    createdAt: '2024-01-15T09:15:00Z'
  }
])

// 计算属性
/**
 * 过滤后的角色列表
 */
const filteredRoles = computed(() => {
  if (!searchKeyword.value) {
    return roles.value
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  return roles.value.filter(role => 
    role.name.toLowerCase().includes(keyword) ||
    role.description.toLowerCase().includes(keyword)
  )
})

/**
 * 选中角色的权限树
 */
const selectedRolePermissions = computed(() => {
  if (!selectedRole.value) return []
  
  // 这里应该根据角色的权限来构建权限树
  // 示例数据
  return permissionTree.value.map(category => ({
    ...category,
    children: category.children.map(permission => ({
      ...permission,
      hasPermission: Math.random() > 0.3 // 模拟权限状态
    }))
  }))
})

// 方法
/**
 * 获取角色图标
 */
const getRoleIcon = (type: string) => {
  const icons = {
    admin: CrownOutlined,
    manager: KeyOutlined,
    member: UserOutlined,
    guest: GlobalOutlined,
    custom: ShieldOutlined
  }
  return icons[type] || UserOutlined
}

/**
 * 获取权限颜色
 */
const getPermissionColor = (type: string) => {
  const colors = {
    system: 'red',
    project: 'blue',
    task: 'green',
    team: 'orange',
    design: 'purple',
    prototype: 'cyan',
    resource: 'pink',
    test: 'lime',
    bug: 'volcano',
    code: 'geekblue'
  }
  return colors[type] || 'default'
}

/**
 * 获取日志颜色
 */
const getLogColor = (action: string) => {
  const colors = {
    '创建角色': 'green',
    '修改权限': 'blue',
    '分配用户': 'orange',
    '删除角色': 'red'
  }
  return colors[action] || 'gray'
}

/**
 * 格式化时间
 */
const formatTime = (time: string) => {
  return dayjs(time).fromNow()
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * 搜索处理
 */
const handleSearch = (value: string) => {
  searchKeyword.value = value
}

/**
 * 刷新角色列表
 */
const refreshRoles = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('角色列表已刷新')
  } catch (error) {
    message.error('刷新失败')
  } finally {
    loading.value = false
  }
}

/**
 * 批量操作处理
 */
const handleBatchAction = ({ key }: { key: string }) => {
  switch (key) {
    case 'export':
      message.success('导出功能开发中')
      break
    case 'import':
      message.success('导入功能开发中')
      break
    case 'permissions':
      message.success('权限管理功能开发中')
      break
    case 'audit':
      message.success('权限审计功能开发中')
      break
  }
}

/**
 * 显示创建模态框
 */
const showCreateModal = () => {
  isEditing.value = false
  roleModalVisible.value = true
}

/**
 * 编辑角色
 */
const editRole = (role: any) => {
  isEditing.value = true
  Object.assign(roleForm, role)
  roleModalVisible.value = true
}

/**
 * 查看角色详情
 */
const viewRoleDetail = (role: any) => {
  selectedRole.value = role
  roleDetailVisible.value = true
}

/**
 * 角色操作处理
 */
const handleRoleAction = (action: string, role: any) => {
  switch (action) {
    case 'edit':
      editRole(role)
      break
    case 'copy':
      const newRole = { ...role, id: '', name: `${role.name} 副本`, isSystem: false }
      Object.assign(roleForm, newRole)
      isEditing.value = false
      roleModalVisible.value = true
      break
    case 'permissions':
      message.info(`配置 ${role.name} 的权限`)
      break
    case 'delete':
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除角色 ${role.name} 吗？此操作不可恢复。`,
        okType: 'danger',
        onOk: () => {
          message.success(`已删除角色 ${role.name}`)
        }
      })
      break
  }
}

/**
 * 提交角色表单
 */
const handleRoleSubmit = async () => {
  try {
    await roleFormRef.value.validate()
    submitLoading.value = true
    
    // 模拟提交请求
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (isEditing.value) {
      message.success(`角色 ${roleForm.name} 更新成功`)
    } else {
      message.success(`角色 ${roleForm.name} 创建成功`)
    }
    
    roleModalVisible.value = false
    resetRoleForm()
    refreshRoles()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

/**
 * 重置角色表单
 */
const resetRoleForm = () => {
  roleFormRef.value?.resetFields()
  Object.assign(roleForm, {
    id: '',
    name: '',
    type: '',
    description: '',
    permissions: [],
    isDefault: false,
    isActive: true,
    isSystem: false
  })
}

/**
 * 分配用户
 */
const assignUsers = (role: any) => {
  selectedRole.value = role
  selectedUsers.value = []
  assignUserVisible.value = true
}

/**
 * 搜索用户
 */
const searchUsers = (keyword: string) => {
  userSearchKeyword.value = keyword
  // 这里应该调用API搜索用户
}

/**
 * 处理分配用户
 */
const handleAssignUsers = async () => {
  if (selectedUsers.value.length === 0) {
    message.warning('请选择要分配的用户')
    return
  }
  
  assignLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success(`已为角色 ${selectedRole.value.name} 分配 ${selectedUsers.value.length} 个用户`)
    assignUserVisible.value = false
    resetAssignForm()
  } catch (error) {
    message.error('分配失败')
  } finally {
    assignLoading.value = false
  }
}

/**
 * 重置分配表单
 */
const resetAssignForm = () => {
  selectedUsers.value = []
  userSearchKeyword.value = ''
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.team-roles {
  padding: 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

.page-description {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.header-right {
  flex-shrink: 0;
}

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.roles-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.role-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  height: 100%;
}

.role-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.role-card.system {
  border-left: 4px solid #52c41a;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.role-info {
  flex: 1;
  min-width: 0;
}

.role-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 8px;
}

.role-icon {
  font-size: 16px;
  color: #1890ff;
}

.role-icon.large {
  font-size: 24px;
}

.role-content {
  padding: 0;
}

.role-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  min-height: 42px;
}

.role-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #666;
  font-size: 12px;
}

.stat-value {
  color: #262626;
  font-size: 12px;
  font-weight: 500;
}

.role-permissions {
  margin-bottom: 16px;
}

.role-permissions h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.role-users {
  margin-bottom: 16px;
}

.role-users h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.user-avatars {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-count {
  font-size: 12px;
  color: #666;
}

.no-users {
  font-size: 12px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.permission-config {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 12px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.permission-name {
  flex: 1;
  min-width: 0;
}

.permission-desc {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.role-detail {
  padding: 0;
}

.detail-header {
  margin-bottom: 0;
}

.role-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.role-title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

.role-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.permissions-list {
  max-height: 400px;
  overflow-y: auto;
}

.permission-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.permission-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.permission-status {
  flex-shrink: 0;
}

.assigned-users {
  padding: 0;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.users-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #262626;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 2px;
}

.user-email {
  font-size: 12px;
  color: #666;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assign-date {
  font-size: 12px;
  color: #666;
}

.audit-logs {
  max-height: 400px;
  overflow-y: auto;
}

.log-item {
  margin-bottom: 8px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.log-action {
  font-weight: 500;
  color: #262626;
}

.log-time {
  font-size: 12px;
  color: #999;
}

.log-content {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.log-user {
  color: #1890ff;
  font-weight: 500;
}

.log-description {
  color: #666;
}

.assign-users {
  padding: 0;
}

.search-users {
  margin-bottom: 16px;
}

.users-selection {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 12px;
}

.user-option {
  margin-bottom: 12px;
}

.user-option:last-child {
  margin-bottom: 0;
}

.user-option .user-info {
  margin-left: 8px;
}

:deep(.danger-item) {
  color: #f5222d !important;
}

:deep(.danger-item:hover) {
  background-color: #fff2f0 !important;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-actions {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-right {
    align-self: stretch;
  }
  
  .header-right :deep(.ant-space) {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .team-roles {
    padding: 0;
  }
  
  .header-actions {
    margin-bottom: 16px;
    padding: 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .stats-section {
    margin-bottom: 16px;
  }
  
  .roles-content {
    padding: 16px;
  }
  
  .role-stats {
    padding: 8px;
  }
  
  .permission-config {
    max-height: 200px;
  }
  
  .permissions-list {
    max-height: 300px;
  }
  
  .audit-logs {
    max-height: 300px;
  }
  
  .users-selection {
    max-height: 200px;
  }
}

@media (max-width: 576px) {
  .header-right :deep(.ant-space) {
    flex-direction: column;
    width: 100%;
  }
  
  .header-right :deep(.ant-input-search) {
    width: 100% !important;
  }
  
  .stats-section :deep(.ant-col) {
    width: 100% !important;
    margin-bottom: 16px;
  }
  
  .role-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .role-name {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .permission-detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .user-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .user-meta {
    align-self: flex-end;
  }
  
  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .log-content {
    flex-direction: column;
    gap: 4px;
  }
}
</style>