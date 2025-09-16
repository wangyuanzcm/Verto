<template>
  <div class="system-users">
    <!-- 头部操作栏 -->
    <div class="users-header">
      <div class="header-left">
        <h3>用户管理</h3>
        <span class="user-count">共 {{ filteredUsers.length }} 个用户</span>
      </div>
      <div class="header-right">
        <a-space>
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索用户名、邮箱或姓名"
            style="width: 300px"
            @search="handleSearch"
          />
          <a-button @click="showImportModal = true">
            <CloudUploadOutlined />
            批量导入
          </a-button>
          <a-button type="primary" @click="showCreateModal = true">
            <PlusOutlined />
            新建用户
          </a-button>
        </a-space>
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div class="users-stats">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="6">
          <a-card size="small" class="stat-card">
            <a-statistic
              title="总用户数"
              :value="userStats.total"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="6">
          <a-card size="small" class="stat-card">
            <a-statistic
              title="活跃用户"
              :value="userStats.active"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <CheckCircleOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="6">
          <a-card size="small" class="stat-card">
            <a-statistic
              title="在线用户"
              :value="userStats.online"
              :value-style="{ color: '#722ed1' }"
            >
              <template #prefix>
                <GlobalOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="6">
          <a-card size="small" class="stat-card">
            <a-statistic
              title="禁用用户"
              :value="userStats.disabled"
              :value-style="{ color: '#ff4d4f' }"
            >
              <template #prefix>
                <StopOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>
    
    <!-- 筛选栏 -->
    <div class="users-filters">
      <a-card size="small">
        <a-row :gutter="16" align="middle">
          <a-col :xs="24" :sm="6">
            <a-select
              v-model:value="filters.status"
              placeholder="用户状态"
              style="width: 100%"
              allow-clear
            >
              <a-select-option value="active">活跃</a-select-option>
              <a-select-option value="inactive">非活跃</a-select-option>
              <a-select-option value="disabled">禁用</a-select-option>
            </a-select>
          </a-col>
          <a-col :xs="24" :sm="6">
            <a-select
              v-model:value="filters.role"
              placeholder="用户角色"
              style="width: 100%"
              allow-clear
            >
              <a-select-option value="admin">管理员</a-select-option>
              <a-select-option value="user">普通用户</a-select-option>
              <a-select-option value="guest">访客</a-select-option>
            </a-select>
          </a-col>
          <a-col :xs="24" :sm="6">
            <a-select
              v-model:value="filters.department"
              placeholder="所属部门"
              style="width: 100%"
              allow-clear
            >
              <a-select-option value="tech">技术部</a-select-option>
              <a-select-option value="product">产品部</a-select-option>
              <a-select-option value="design">设计部</a-select-option>
              <a-select-option value="marketing">市场部</a-select-option>
            </a-select>
          </a-col>
          <a-col :xs="24" :sm="6">
            <a-space>
              <a-button @click="resetFilters">
                <ReloadOutlined />
                重置
              </a-button>
              <a-button type="primary" @click="applyFilters">
                <SearchOutlined />
                筛选
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-card>
    </div>
    
    <!-- 用户列表 -->
    <div class="users-table">
      <a-card>
        <template #title>
          <a-space>
            <span>用户列表</span>
            <a-tag v-if="selectedRowKeys.length > 0" color="blue">
              已选择 {{ selectedRowKeys.length }} 项
            </a-tag>
          </a-space>
        </template>
        
        <template #extra>
          <a-space>
            <a-dropdown v-if="selectedRowKeys.length > 0">
              <template #overlay>
                <a-menu @click="handleBatchAction">
                  <a-menu-item key="enable">
                    <CheckCircleOutlined />
                    批量启用
                  </a-menu-item>
                  <a-menu-item key="disable">
                    <StopOutlined />
                    批量禁用
                  </a-menu-item>
                  <a-menu-item key="delete">
                    <DeleteOutlined />
                    批量删除
                  </a-menu-item>
                  <a-menu-item key="export">
                    <ExportOutlined />
                    导出选中
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button>
                批量操作
                <DownOutlined />
              </a-button>
            </a-dropdown>
            
            <a-button @click="exportUsers">
              <ExportOutlined />
              导出全部
            </a-button>
            
            <a-button @click="refreshUsers">
              <ReloadOutlined />
            </a-button>
          </a-space>
        </template>
        
        <a-table
          :columns="userColumns"
          :data-source="filteredUsers"
          :loading="usersLoading"
          :pagination="pagination"
          :row-selection="{
            selectedRowKeys,
            onChange: onSelectChange,
            getCheckboxProps: (record) => ({
              disabled: record.id === currentUserId
            })
          }"
          row-key="id"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'avatar'">
              <a-avatar :src="record.avatar" :size="40">
                {{ record.name?.charAt(0) }}
              </a-avatar>
            </template>
            
            <template v-else-if="column.key === 'name'">
              <div class="user-info">
                <div class="user-name">{{ record.name }}</div>
                <div class="user-email">{{ record.email }}</div>
              </div>
            </template>
            
            <template v-else-if="column.key === 'status'">
              <a-badge
                :status="getUserStatusBadge(record.status)"
                :text="getUserStatusText(record.status)"
              />
            </template>
            
            <template v-else-if="column.key === 'role'">
              <a-tag :color="getRoleColor(record.role)">
                {{ getRoleText(record.role) }}
              </a-tag>
            </template>
            
            <template v-else-if="column.key === 'lastLogin'">
              <span v-if="record.lastLogin">
                {{ formatTime(record.lastLogin) }}
              </span>
              <span v-else class="text-muted">从未登录</span>
            </template>
            
            <template v-else-if="column.key === 'actions'">
              <a-space>
                <a-button
                  type="text"
                  size="small"
                  @click="viewUser(record)"
                >
                  <EyeOutlined />
                </a-button>
                
                <a-button
                  type="text"
                  size="small"
                  @click="editUser(record)"
                >
                  <EditOutlined />
                </a-button>
                
                <a-dropdown>
                  <template #overlay>
                    <a-menu @click="({ key }) => handleUserAction(key, record)">
                      <a-menu-item key="resetPassword">
                        <KeyOutlined />
                        重置密码
                      </a-menu-item>
                      <a-menu-item key="changeRole">
                        <UserSwitchOutlined />
                        变更角色
                      </a-menu-item>
                      <a-menu-item
                        :key="record.status === 'active' ? 'disable' : 'enable'"
                      >
                        <component
                          :is="record.status === 'active' ? StopOutlined : CheckCircleOutlined"
                        />
                        {{ record.status === 'active' ? '禁用用户' : '启用用户' }}
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item
                        key="delete"
                        :disabled="record.id === currentUserId"
                        class="danger-item"
                      >
                        <DeleteOutlined />
                        删除用户
                      </a-menu-item>
                    </a-menu>
                  </template>
                  <a-button type="text" size="small">
                    <MoreOutlined />
                  </a-button>
                </a-dropdown>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>
    
    <!-- 创建用户模态框 -->
    <a-modal
      v-model:open="showCreateModal"
      title="新建用户"
      width="600px"
      @ok="handleCreateUser"
      @cancel="resetCreateForm"
    >
      <a-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="用户名" name="username">
              <a-input v-model:value="createForm.username" placeholder="请输入用户名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮箱" name="email">
              <a-input v-model:value="createForm.email" placeholder="请输入邮箱" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="姓名" name="name">
              <a-input v-model:value="createForm.name" placeholder="请输入姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="手机号" name="phone">
              <a-input v-model:value="createForm.phone" placeholder="请输入手机号" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="角色" name="role">
              <a-select v-model:value="createForm.role" placeholder="请选择角色">
                <a-select-option value="admin">管理员</a-select-option>
                <a-select-option value="user">普通用户</a-select-option>
                <a-select-option value="guest">访客</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="部门" name="department">
              <a-select v-model:value="createForm.department" placeholder="请选择部门">
                <a-select-option value="tech">技术部</a-select-option>
                <a-select-option value="product">产品部</a-select-option>
                <a-select-option value="design">设计部</a-select-option>
                <a-select-option value="marketing">市场部</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="初始密码" name="password">
          <a-input-password
            v-model:value="createForm.password"
            placeholder="请输入初始密码"
          />
        </a-form-item>
        
        <a-form-item label="备注" name="remark">
          <a-textarea
            v-model:value="createForm.remark"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item>
          <a-checkbox v-model:checked="createForm.sendWelcomeEmail">
            发送欢迎邮件
          </a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 编辑用户模态框 -->
    <a-modal
      v-model:open="showEditModal"
      title="编辑用户"
      width="600px"
      @ok="handleEditUser"
      @cancel="resetEditForm"
    >
      <a-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="用户名" name="username">
              <a-input v-model:value="editForm.username" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮箱" name="email">
              <a-input v-model:value="editForm.email" placeholder="请输入邮箱" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="姓名" name="name">
              <a-input v-model:value="editForm.name" placeholder="请输入姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="手机号" name="phone">
              <a-input v-model:value="editForm.phone" placeholder="请输入手机号" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="角色" name="role">
              <a-select v-model:value="editForm.role" placeholder="请选择角色">
                <a-select-option value="admin">管理员</a-select-option>
                <a-select-option value="user">普通用户</a-select-option>
                <a-select-option value="guest">访客</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="部门" name="department">
              <a-select v-model:value="editForm.department" placeholder="请选择部门">
                <a-select-option value="tech">技术部</a-select-option>
                <a-select-option value="product">产品部</a-select-option>
                <a-select-option value="design">设计部</a-select-option>
                <a-select-option value="marketing">市场部</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="editForm.status">
            <a-radio value="active">活跃</a-radio>
            <a-radio value="inactive">非活跃</a-radio>
            <a-radio value="disabled">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="备注" name="remark">
          <a-textarea
            v-model:value="editForm.remark"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 用户详情模态框 -->
    <a-modal
      v-model:open="showDetailModal"
      title="用户详情"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedUser" class="user-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="头像" :span="2">
            <a-avatar :src="selectedUser.avatar" :size="64">
              {{ selectedUser.name?.charAt(0) }}
            </a-avatar>
          </a-descriptions-item>
          
          <a-descriptions-item label="用户名">
            {{ selectedUser.username }}
          </a-descriptions-item>
          
          <a-descriptions-item label="姓名">
            {{ selectedUser.name }}
          </a-descriptions-item>
          
          <a-descriptions-item label="邮箱">
            {{ selectedUser.email }}
          </a-descriptions-item>
          
          <a-descriptions-item label="手机号">
            {{ selectedUser.phone || '未设置' }}
          </a-descriptions-item>
          
          <a-descriptions-item label="角色">
            <a-tag :color="getRoleColor(selectedUser.role)">
              {{ getRoleText(selectedUser.role) }}
            </a-tag>
          </a-descriptions-item>
          
          <a-descriptions-item label="部门">
            {{ getDepartmentText(selectedUser.department) }}
          </a-descriptions-item>
          
          <a-descriptions-item label="状态">
            <a-badge
              :status="getUserStatusBadge(selectedUser.status)"
              :text="getUserStatusText(selectedUser.status)"
            />
          </a-descriptions-item>
          
          <a-descriptions-item label="创建时间">
            {{ formatTime(selectedUser.createdAt) }}
          </a-descriptions-item>
          
          <a-descriptions-item label="最后登录">
            <span v-if="selectedUser.lastLogin">
              {{ formatTime(selectedUser.lastLogin) }}
            </span>
            <span v-else class="text-muted">从未登录</span>
          </a-descriptions-item>
          
          <a-descriptions-item label="登录次数">
            {{ selectedUser.loginCount || 0 }} 次
          </a-descriptions-item>
          
          <a-descriptions-item label="备注" :span="2">
            {{ selectedUser.remark || '无' }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
    
    <!-- 批量导入模态框 -->
    <a-modal
      v-model:open="showImportModal"
      title="批量导入用户"
      width="600px"
      @ok="handleImportUsers"
      @cancel="resetImportForm"
    >
      <div class="import-content">
        <a-alert
          message="导入说明"
          description="请上传Excel文件，文件格式：用户名、邮箱、姓名、手机号、角色、部门。第一行为标题行。"
          type="info"
          show-icon
          style="margin-bottom: 16px"
        />
        
        <a-upload-dragger
          v-model:file-list="importFileList"
          :before-upload="beforeUpload"
          :remove="removeFile"
          accept=".xlsx,.xls"
        >
          <p class="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p class="ant-upload-hint">支持单个文件上传，仅支持 .xlsx 和 .xls 格式</p>
        </a-upload-dragger>
        
        <div style="margin-top: 16px;">
          <a-space>
            <a-button @click="downloadTemplate">
              <DownloadOutlined />
              下载模板
            </a-button>
            <a-checkbox v-model:checked="importOptions.skipDuplicates">
              跳过重复用户
            </a-checkbox>
            <a-checkbox v-model:checked="importOptions.sendWelcomeEmail">
              发送欢迎邮件
            </a-checkbox>
          </a-space>
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
  UserOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  StopOutlined,
  GlobalOutlined,
  CloudUploadOutlined,
  ExportOutlined,
  DownOutlined,
  KeyOutlined,
  UserSwitchOutlined,
  InboxOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import type { TableColumnsType, TableProps } from 'ant-design-vue'

// 路由
const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const usersLoading = ref(false)
const selectedRowKeys = ref<string[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const showImportModal = ref(false)
const currentUserId = ref('1') // 当前登录用户ID

// 表单引用
const createFormRef = ref()
const editFormRef = ref()

// 筛选条件
const filters = reactive({
  status: undefined,
  role: undefined,
  department: undefined
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => 
    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 用户统计
const userStats = reactive({
  total: 1248,
  active: 1156,
  online: 89,
  disabled: 12
})

// 创建用户表单
const createForm = reactive({
  username: '',
  email: '',
  name: '',
  phone: '',
  role: 'user',
  department: '',
  password: '',
  remark: '',
  sendWelcomeEmail: true
})

// 编辑用户表单
const editForm = reactive({
  id: '',
  username: '',
  email: '',
  name: '',
  phone: '',
  role: '',
  department: '',
  status: '',
  remark: ''
})

// 选中的用户
const selectedUser = ref(null)

// 导入相关
const importFileList = ref([])
const importOptions = reactive({
  skipDuplicates: true,
  sendWelcomeEmail: false
})

// 用户数据
const users = ref([
  {
    id: '1',
    username: 'admin',
    name: '系统管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    role: 'admin',
    department: 'tech',
    status: 'active',
    avatar: '',
    lastLogin: '2024-01-15T10:30:00Z',
    loginCount: 156,
    createdAt: '2024-01-01T00:00:00Z',
    remark: '系统管理员账户'
  },
  {
    id: '2',
    username: 'zhangsan',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    role: 'user',
    department: 'product',
    status: 'active',
    avatar: '',
    lastLogin: '2024-01-15T09:15:00Z',
    loginCount: 89,
    createdAt: '2024-01-02T00:00:00Z',
    remark: '产品经理'
  },
  {
    id: '3',
    username: 'lisi',
    name: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    role: 'user',
    department: 'design',
    status: 'inactive',
    avatar: '',
    lastLogin: '2024-01-10T16:20:00Z',
    loginCount: 45,
    createdAt: '2024-01-03T00:00:00Z',
    remark: 'UI设计师'
  },
  {
    id: '4',
    username: 'wangwu',
    name: '王五',
    email: 'wangwu@example.com',
    phone: '13800138003',
    role: 'guest',
    department: 'marketing',
    status: 'disabled',
    avatar: '',
    lastLogin: null,
    loginCount: 0,
    createdAt: '2024-01-04T00:00:00Z',
    remark: '临时访客账户'
  }
])

// 表格列配置
const userColumns: TableColumnsType = [
  {
    title: '头像',
    key: 'avatar',
    width: 80,
    align: 'center'
  },
  {
    title: '用户信息',
    key: 'name',
    width: 200
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    width: 120
  },
  {
    title: '角色',
    key: 'role',
    width: 100,
    filters: [
      { text: '管理员', value: 'admin' },
      { text: '普通用户', value: 'user' },
      { text: '访客', value: 'guest' }
    ]
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department',
    width: 120,
    customRender: ({ text }) => getDepartmentText(text)
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    filters: [
      { text: '活跃', value: 'active' },
      { text: '非活跃', value: 'inactive' },
      { text: '禁用', value: 'disabled' }
    ]
  },
  {
    title: '最后登录',
    key: 'lastLogin',
    width: 150,
    sorter: true
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
]

// 表单验证规则
const createRules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符' }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入有效的邮箱地址' }
  ],
  name: [
    { required: true, message: '请输入姓名' }
  ],
  role: [
    { required: true, message: '请选择角色' }
  ],
  password: [
    { required: true, message: '请输入初始密码' },
    { min: 6, message: '密码长度至少6个字符' }
  ]
}

const editRules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入有效的邮箱地址' }
  ],
  name: [
    { required: true, message: '请输入姓名' }
  ],
  role: [
    { required: true, message: '请选择角色' }
  ]
}

// 计算属性
const filteredUsers = computed(() => {
  let result = users.value
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(user => 
      user.username.toLowerCase().includes(keyword) ||
      user.name.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword)
    )
  }
  
  // 状态过滤
  if (filters.status) {
    result = result.filter(user => user.status === filters.status)
  }
  
  // 角色过滤
  if (filters.role) {
    result = result.filter(user => user.role === filters.role)
  }
  
  // 部门过滤
  if (filters.department) {
    result = result.filter(user => user.department === filters.department)
  }
  
  return result
})

// 方法
/**
 * 获取用户状态徽章
 */
const getUserStatusBadge = (status: string) => {
  const badges = {
    active: 'success',
    inactive: 'warning',
    disabled: 'error'
  }
  return badges[status] || 'default'
}

/**
 * 获取用户状态文本
 */
const getUserStatusText = (status: string) => {
  const texts = {
    active: '活跃',
    inactive: '非活跃',
    disabled: '禁用'
  }
  return texts[status] || status
}

/**
 * 获取角色颜色
 */
const getRoleColor = (role: string) => {
  const colors = {
    admin: 'red',
    user: 'blue',
    guest: 'orange'
  }
  return colors[role] || 'default'
}

/**
 * 获取角色文本
 */
const getRoleText = (role: string) => {
  const texts = {
    admin: '管理员',
    user: '普通用户',
    guest: '访客'
  }
  return texts[role] || role
}

/**
 * 获取部门文本
 */
const getDepartmentText = (department: string) => {
  const texts = {
    tech: '技术部',
    product: '产品部',
    design: '设计部',
    marketing: '市场部'
  }
  return texts[department] || department
}

/**
 * 格式化时间
 */
const formatTime = (timestamp: string) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 搜索处理
 */
const handleSearch = () => {
  pagination.current = 1
}

/**
 * 重置筛选条件
 */
const resetFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = undefined
  })
  pagination.current = 1
}

/**
 * 应用筛选条件
 */
const applyFilters = () => {
  pagination.current = 1
}

/**
 * 表格变化处理
 */
const handleTableChange: TableProps['onChange'] = (pag, filters, sorter) => {
  pagination.current = pag?.current || 1
  pagination.pageSize = pag?.pageSize || 10
}

/**
 * 选择变化处理
 */
const onSelectChange = (selectedKeys: string[]) => {
  selectedRowKeys.value = selectedKeys
}

/**
 * 查看用户
 */
const viewUser = (user: any) => {
  selectedUser.value = user
  showDetailModal.value = true
}

/**
 * 编辑用户
 */
const editUser = (user: any) => {
  Object.assign(editForm, user)
  showEditModal.value = true
}

/**
 * 用户操作处理
 */
const handleUserAction = (action: string, user: any) => {
  switch (action) {
    case 'resetPassword':
      Modal.confirm({
        title: '重置密码',
        content: `确定要重置用户 ${user.name} 的密码吗？`,
        onOk: () => {
          message.success('密码重置成功，新密码已发送到用户邮箱')
        }
      })
      break
      
    case 'changeRole':
      // 这里可以打开角色变更模态框
      message.info('角色变更功能开发中')
      break
      
    case 'enable':
    case 'disable':
      const actionText = action === 'enable' ? '启用' : '禁用'
      Modal.confirm({
        title: `${actionText}用户`,
        content: `确定要${actionText}用户 ${user.name} 吗？`,
        onOk: () => {
          user.status = action === 'enable' ? 'active' : 'disabled'
          message.success(`用户${actionText}成功`)
        }
      })
      break
      
    case 'delete':
      Modal.confirm({
        title: '删除用户',
        content: `确定要删除用户 ${user.name} 吗？此操作不可撤销。`,
        okType: 'danger',
        onOk: () => {
          const index = users.value.findIndex(u => u.id === user.id)
          if (index > -1) {
            users.value.splice(index, 1)
            message.success('用户删除成功')
          }
        }
      })
      break
  }
}

/**
 * 批量操作处理
 */
const handleBatchAction = ({ key }: { key: string }) => {
  const selectedUsers = users.value.filter(user => 
    selectedRowKeys.value.includes(user.id)
  )
  
  switch (key) {
    case 'enable':
    case 'disable':
      const actionText = key === 'enable' ? '启用' : '禁用'
      Modal.confirm({
        title: `批量${actionText}用户`,
        content: `确定要${actionText} ${selectedUsers.length} 个用户吗？`,
        onOk: () => {
          selectedUsers.forEach(user => {
            user.status = key === 'enable' ? 'active' : 'disabled'
          })
          selectedRowKeys.value = []
          message.success(`批量${actionText}成功`)
        }
      })
      break
      
    case 'delete':
      Modal.confirm({
        title: '批量删除用户',
        content: `确定要删除 ${selectedUsers.length} 个用户吗？此操作不可撤销。`,
        okType: 'danger',
        onOk: () => {
          selectedRowKeys.value.forEach(id => {
            const index = users.value.findIndex(user => user.id === id)
            if (index > -1) {
              users.value.splice(index, 1)
            }
          })
          selectedRowKeys.value = []
          message.success('批量删除成功')
        }
      })
      break
      
    case 'export':
      message.success('导出功能开发中')
      break
  }
}

/**
 * 导出用户
 */
const exportUsers = () => {
  message.success('导出功能开发中')
}

/**
 * 刷新用户列表
 */
const refreshUsers = () => {
  usersLoading.value = true
  setTimeout(() => {
    usersLoading.value = false
    message.success('用户列表已刷新')
  }, 1000)
}

/**
 * 创建用户
 */
const handleCreateUser = async () => {
  try {
    await createFormRef.value.validate()
    
    // 检查用户名是否已存在
    const existingUser = users.value.find(user => 
      user.username === createForm.username
    )
    if (existingUser) {
      message.error('用户名已存在')
      return
    }
    
    // 检查邮箱是否已存在
    const existingEmail = users.value.find(user => 
      user.email === createForm.email
    )
    if (existingEmail) {
      message.error('邮箱已存在')
      return
    }
    
    // 创建新用户
    const newUser = {
      id: Date.now().toString(),
      ...createForm,
      status: 'active',
      avatar: '',
      lastLogin: null,
      loginCount: 0,
      createdAt: new Date().toISOString()
    }
    
    users.value.unshift(newUser)
    showCreateModal.value = false
    resetCreateForm()
    message.success('用户创建成功')
    
    if (createForm.sendWelcomeEmail) {
      message.info('欢迎邮件已发送')
    }
  } catch (error) {
    console.error('创建用户失败:', error)
  }
}

/**
 * 编辑用户
 */
const handleEditUser = async () => {
  try {
    await editFormRef.value.validate()
    
    const userIndex = users.value.findIndex(user => user.id === editForm.id)
    if (userIndex > -1) {
      Object.assign(users.value[userIndex], editForm)
      showEditModal.value = false
      resetEditForm()
      message.success('用户信息更新成功')
    }
  } catch (error) {
    console.error('更新用户失败:', error)
  }
}

/**
 * 重置创建表单
 */
const resetCreateForm = () => {
  Object.assign(createForm, {
    username: '',
    email: '',
    name: '',
    phone: '',
    role: 'user',
    department: '',
    password: '',
    remark: '',
    sendWelcomeEmail: true
  })
  createFormRef.value?.resetFields()
}

/**
 * 重置编辑表单
 */
const resetEditForm = () => {
  Object.assign(editForm, {
    id: '',
    username: '',
    email: '',
    name: '',
    phone: '',
    role: '',
    department: '',
    status: '',
    remark: ''
  })
  editFormRef.value?.resetFields()
}

/**
 * 文件上传前处理
 */
const beforeUpload = (file: File) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                  file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    message.error('只能上传Excel文件')
    return false
  }
  
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('文件大小不能超过10MB')
    return false
  }
  
  return false // 阻止自动上传
}

/**
 * 移除文件
 */
const removeFile = () => {
  importFileList.value = []
}

/**
 * 下载模板
 */
const downloadTemplate = () => {
  message.success('模板下载功能开发中')
}

/**
 * 导入用户
 */
const handleImportUsers = () => {
  if (importFileList.value.length === 0) {
    message.error('请选择要导入的文件')
    return
  }
  
  message.success('用户导入功能开发中')
  showImportModal.value = false
  resetImportForm()
}

/**
 * 重置导入表单
 */
const resetImportForm = () => {
  importFileList.value = []
  Object.assign(importOptions, {
    skipDuplicates: true,
    sendWelcomeEmail: false
  })
}

// 生命周期
onMounted(() => {
  pagination.total = users.value.length
})
</script>

<style scoped>
.system-users {
  padding: 0;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 0;
}

.header-left h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.user-count {
  margin-left: 12px;
  color: #8c8c8c;
  font-size: 14px;
}

.users-stats {
  margin-bottom: 24px;
}

.stat-card {
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.users-filters {
  margin-bottom: 24px;
}

.users-table {
  background: #fff;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.user-email {
  font-size: 12px;
  color: #8c8c8c;
}

.text-muted {
  color: #8c8c8c;
}

.danger-item {
  color: #ff4d4f !important;
}

.user-detail {
  padding: 16px 0;
}

.import-content {
  padding: 16px 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .users-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-right {
    width: 100%;
  }
  
  .header-right .ant-space {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .users-stats .ant-col {
    margin-bottom: 16px;
  }
  
  .users-filters .ant-col {
    margin-bottom: 8px;
  }
  
  .header-right .ant-input-search {
    width: 100% !important;
  }
  
  .users-table .ant-table {
    font-size: 12px;
  }
  
  .user-info {
    min-width: 120px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card,
.users-filters .ant-card,
.users-table .ant-card {
  animation: fadeIn 0.3s ease-out;
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .stat-card,
  .users-filters .ant-card,
  .users-table .ant-card {
    background: #141414;
    border-color: #303030;
  }
  
  .user-email,
  .text-muted,
  .user-count {
    color: #8c8c8c;
  }
}
</style>