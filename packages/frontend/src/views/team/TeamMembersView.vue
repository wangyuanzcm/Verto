<template>
  <div class="team-members">
    <!-- 头部操作栏 -->
    <div class="header-actions">
      <div class="header-left">
        <h2 class="page-title">团队成员</h2>
        <div class="member-stats">
          <a-statistic-countdown
            title="总成员数"
            :value="memberStats.total"
            format="D"
            :value-style="{ fontSize: '16px', color: '#1890ff' }"
          />
          <a-divider type="vertical" />
          <span class="stat-item">
            <span class="stat-label">在线:</span>
            <span class="stat-value online">{{ memberStats.online }}</span>
          </span>
          <a-divider type="vertical" />
          <span class="stat-item">
            <span class="stat-label">离线:</span>
            <span class="stat-value offline">{{ memberStats.offline }}</span>
          </span>
        </div>
      </div>
      
      <div class="header-right">
        <a-space>
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索成员姓名、邮箱或角色"
            style="width: 280px"
            @search="handleSearch"
            allow-clear
          >
            <template #enterButton>
              <SearchOutlined />
            </template>
          </a-input-search>
          
          <a-button @click="refreshMembers" :loading="loading">
            <ReloadOutlined />
            刷新
          </a-button>
          
          <a-button type="primary" @click="showInviteModal">
            <UserAddOutlined />
            邀请成员
          </a-button>
          
          <a-dropdown>
            <template #overlay>
              <a-menu @click="handleBatchAction">
                <a-menu-item key="export">
                  <ExportOutlined />
                  导出成员列表
                </a-menu-item>
                <a-menu-item key="import">
                  <ImportOutlined />
                  批量导入成员
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="roles">
                  <SafetyCertificateOutlined />
                  管理角色权限
                </a-menu-item>
                <a-menu-item key="departments">
                  <TeamOutlined />
                  管理部门
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
    
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :md="6">
          <a-select
            v-model:value="filters.department"
            placeholder="选择部门"
            style="width: 100%"
            allow-clear
            @change="handleFilterChange"
          >
            <a-select-option value="">全部部门</a-select-option>
            <a-select-option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </a-select-option>
          </a-select>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-select
            v-model:value="filters.role"
            placeholder="选择角色"
            style="width: 100%"
            allow-clear
            @change="handleFilterChange"
          >
            <a-select-option value="">全部角色</a-select-option>
            <a-select-option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </a-select-option>
          </a-select>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-select
            v-model:value="filters.status"
            placeholder="选择状态"
            style="width: 100%"
            allow-clear
            @change="handleFilterChange"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="active">活跃</a-select-option>
            <a-select-option value="inactive">非活跃</a-select-option>
            <a-select-option value="pending">待激活</a-select-option>
            <a-select-option value="disabled">已禁用</a-select-option>
          </a-select>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-space>
            <a-button @click="resetFilters">
              <ClearOutlined />
              重置
            </a-button>
            
            <a-tooltip title="切换视图">
              <a-button @click="toggleView">
                <component :is="viewMode === 'table' ? 'AppstoreOutlined' : 'UnorderedListOutlined'" />
              </a-button>
            </a-tooltip>
          </a-space>
        </a-col>
      </a-row>
    </div>
    
    <!-- 成员列表 -->
    <div class="members-content">
      <!-- 表格视图 -->
      <div v-if="viewMode === 'table'" class="table-view">
        <a-table
          :columns="tableColumns"
          :data-source="filteredMembers"
          :loading="loading"
          :pagination="pagination"
          :row-selection="rowSelection"
          :scroll="{ x: 1200 }"
          @change="handleTableChange"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'user'">
              <div class="user-info">
                <a-badge :dot="record.online" :color="record.online ? 'green' : 'default'">
                  <a-avatar :src="record.avatar" :size="40">
                    {{ record.name.charAt(0) }}
                  </a-avatar>
                </a-badge>
                <div class="user-details">
                  <div class="user-name">{{ record.name }}</div>
                  <div class="user-email">{{ record.email }}</div>
                </div>
              </div>
            </template>
            
            <template v-else-if="column.key === 'department'">
              <a-tag color="blue">{{ record.department }}</a-tag>
            </template>
            
            <template v-else-if="column.key === 'role'">
              <a-tag :color="getRoleColor(record.role)">{{ record.role }}</a-tag>
            </template>
            
            <template v-else-if="column.key === 'status'">
              <a-badge
                :status="getStatusBadge(record.status)"
                :text="getStatusText(record.status)"
              />
            </template>
            
            <template v-else-if="column.key === 'lastActive'">
              <span v-if="record.online" class="online-status">在线</span>
              <span v-else class="last-active">{{ formatTime(record.lastActive) }}</span>
            </template>
            
            <template v-else-if="column.key === 'joinDate'">
              {{ formatDate(record.joinDate) }}
            </template>
            
            <template v-else-if="column.key === 'actions'">
              <a-space>
                <a-tooltip title="发送消息">
                  <a-button type="text" size="small" @click="sendMessage(record)">
                    <MessageOutlined />
                  </a-button>
                </a-tooltip>
                
                <a-tooltip title="查看详情">
                  <a-button type="text" size="small" @click="viewMember(record)">
                    <EyeOutlined />
                  </a-button>
                </a-tooltip>
                
                <a-dropdown>
                  <template #overlay>
                    <a-menu @click="({ key }) => handleMemberAction(key, record)">
                      <a-menu-item key="edit">
                        <EditOutlined />
                        编辑信息
                      </a-menu-item>
                      <a-menu-item key="role">
                        <SafetyCertificateOutlined />
                        修改角色
                      </a-menu-item>
                      <a-menu-item key="department">
                        <TeamOutlined />
                        调整部门
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item key="disable" :disabled="record.status === 'disabled'">
                        <StopOutlined />
                        禁用账户
                      </a-menu-item>
                      <a-menu-item key="enable" :disabled="record.status !== 'disabled'">
                        <PlayCircleOutlined />
                        启用账户
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item key="remove" class="danger-item">
                        <DeleteOutlined />
                        移除成员
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
      </div>
      
      <!-- 卡片视图 -->
      <div v-else class="card-view">
        <a-row :gutter="[24, 24]">
          <a-col
            v-for="member in filteredMembers"
            :key="member.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            :xl="4"
          >
            <a-card class="member-card" :class="{ selected: selectedRowKeys.includes(member.id) }">
              <template #cover>
                <div class="member-cover">
                  <a-badge :dot="member.online" :color="member.online ? 'green' : 'default'">
                    <a-avatar :src="member.avatar" :size="80">
                      {{ member.name.charAt(0) }}
                    </a-avatar>
                  </a-badge>
                  
                  <div class="member-actions">
                    <a-space>
                      <a-tooltip title="发送消息">
                        <a-button type="text" size="small" @click="sendMessage(member)">
                          <MessageOutlined />
                        </a-button>
                      </a-tooltip>
                      
                      <a-tooltip title="查看详情">
                        <a-button type="text" size="small" @click="viewMember(member)">
                          <EyeOutlined />
                        </a-button>
                      </a-tooltip>
                      
                      <a-dropdown>
                        <template #overlay>
                          <a-menu @click="({ key }) => handleMemberAction(key, member)">
                            <a-menu-item key="edit">
                              <EditOutlined />
                              编辑
                            </a-menu-item>
                            <a-menu-item key="remove" class="danger-item">
                              <DeleteOutlined />
                              移除
                            </a-menu-item>
                          </a-menu>
                        </template>
                        <a-button type="text" size="small">
                          <MoreOutlined />
                        </a-button>
                      </a-dropdown>
                    </a-space>
                  </div>
                </div>
              </template>
              
              <div class="member-info">
                <h4 class="member-name">{{ member.name }}</h4>
                <p class="member-email">{{ member.email }}</p>
                
                <div class="member-tags">
                  <a-tag color="blue" size="small">{{ member.department }}</a-tag>
                  <a-tag :color="getRoleColor(member.role)" size="small">{{ member.role }}</a-tag>
                </div>
                
                <div class="member-status">
                  <a-badge
                    :status="getStatusBadge(member.status)"
                    :text="getStatusText(member.status)"
                  />
                </div>
                
                <div class="member-activity">
                  <span v-if="member.online" class="online-status">
                    <span class="status-dot online"></span>
                    在线
                  </span>
                  <span v-else class="last-active">
                    <span class="status-dot offline"></span>
                    {{ formatTime(member.lastActive) }}
                  </span>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
        
        <!-- 卡片视图分页 -->
        <div class="card-pagination">
          <a-pagination
            v-model:current="pagination.current"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :show-size-changer="true"
            :show-quick-jumper="true"
            :show-total="(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`"
            @change="handleTableChange"
          />
        </div>
      </div>
    </div>
    
    <!-- 邀请成员模态框 -->
    <a-modal
      v-model:open="inviteModalVisible"
      title="邀请成员"
      width="600px"
      @ok="handleInvite"
      @cancel="resetInviteForm"
      :confirm-loading="inviteLoading"
    >
      <a-form
        ref="inviteFormRef"
        :model="inviteForm"
        :rules="inviteRules"
        layout="vertical"
      >
        <a-tabs v-model:activeKey="inviteType">
          <a-tab-pane key="single" tab="单个邀请">
            <a-form-item label="邮箱地址" name="email">
              <a-input
                v-model:value="inviteForm.email"
                placeholder="请输入邮箱地址"
                type="email"
              />
            </a-form-item>
            
            <a-form-item label="姓名" name="name">
              <a-input
                v-model:value="inviteForm.name"
                placeholder="请输入姓名"
              />
            </a-form-item>
            
            <a-form-item label="部门" name="department">
              <a-select
                v-model:value="inviteForm.department"
                placeholder="选择部门"
                style="width: 100%"
              >
                <a-select-option v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            
            <a-form-item label="角色" name="role">
              <a-select
                v-model:value="inviteForm.role"
                placeholder="选择角色"
                style="width: 100%"
              >
                <a-select-option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            
            <a-form-item label="邀请消息" name="message">
              <a-textarea
                v-model:value="inviteForm.message"
                placeholder="可选：添加邀请消息"
                :rows="3"
                :max-length="200"
                show-count
              />
            </a-form-item>
          </a-tab-pane>
          
          <a-tab-pane key="batch" tab="批量邀请">
            <a-form-item label="邮箱列表" name="emails">
              <a-textarea
                v-model:value="inviteForm.emails"
                placeholder="请输入邮箱地址，每行一个&#10;例如：&#10;zhangsan@example.com&#10;lisi@example.com"
                :rows="6"
              />
            </a-form-item>
            
            <a-form-item label="默认部门" name="defaultDepartment">
              <a-select
                v-model:value="inviteForm.defaultDepartment"
                placeholder="选择默认部门"
                style="width: 100%"
              >
                <a-select-option v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            
            <a-form-item label="默认角色" name="defaultRole">
              <a-select
                v-model:value="inviteForm.defaultRole"
                placeholder="选择默认角色"
                style="width: 100%"
              >
                <a-select-option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-tab-pane>
        </a-tabs>
      </a-form>
    </a-modal>
    
    <!-- 成员详情模态框 -->
    <a-modal
      v-model:open="memberDetailVisible"
      :title="`成员详情 - ${selectedMember?.name}`"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedMember" class="member-detail">
        <div class="detail-header">
          <div class="member-avatar-large">
            <a-badge :dot="selectedMember.online" :color="selectedMember.online ? 'green' : 'default'">
              <a-avatar :src="selectedMember.avatar" :size="80">
                {{ selectedMember.name.charAt(0) }}
              </a-avatar>
            </a-badge>
          </div>
          
          <div class="member-basic-info">
            <h3>{{ selectedMember.name }}</h3>
            <p class="member-email">{{ selectedMember.email }}</p>
            <div class="member-tags">
              <a-tag color="blue">{{ selectedMember.department }}</a-tag>
              <a-tag :color="getRoleColor(selectedMember.role)">{{ selectedMember.role }}</a-tag>
              <a-badge
                :status="getStatusBadge(selectedMember.status)"
                :text="getStatusText(selectedMember.status)"
              />
            </div>
          </div>
          
          <div class="member-actions">
            <a-space direction="vertical">
              <a-button type="primary" @click="sendMessage(selectedMember)">
                <MessageOutlined />
                发送消息
              </a-button>
              <a-button @click="editMember(selectedMember)">
                <EditOutlined />
                编辑信息
              </a-button>
            </a-space>
          </div>
        </div>
        
        <a-divider />
        
        <div class="detail-content">
          <a-row :gutter="[24, 24]">
            <a-col :span="12">
              <div class="info-section">
                <h4>基本信息</h4>
                <div class="info-list">
                  <div class="info-item">
                    <span class="info-label">员工ID:</span>
                    <span class="info-value">{{ selectedMember.employeeId }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">手机号:</span>
                    <span class="info-value">{{ selectedMember.phone || '未设置' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">入职时间:</span>
                    <span class="info-value">{{ formatDate(selectedMember.joinDate) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">最后活跃:</span>
                    <span class="info-value">
                      {{ selectedMember.online ? '在线' : formatTime(selectedMember.lastActive) }}
                    </span>
                  </div>
                </div>
              </div>
            </a-col>
            
            <a-col :span="12">
              <div class="info-section">
                <h4>权限信息</h4>
                <div class="info-list">
                  <div class="info-item">
                    <span class="info-label">角色权限:</span>
                    <span class="info-value">
                      <a-tag :color="getRoleColor(selectedMember.role)">{{ selectedMember.role }}</a-tag>
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">部门:</span>
                    <span class="info-value">
                      <a-tag color="blue">{{ selectedMember.department }}</a-tag>
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">项目数量:</span>
                    <span class="info-value">{{ selectedMember.projectCount || 0 }} 个</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">任务完成:</span>
                    <span class="info-value">{{ selectedMember.taskCompleted || 0 }} 个</span>
                  </div>
                </div>
              </div>
            </a-col>
          </a-row>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import type { TableColumnsType, TableProps } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  UserAddOutlined,
  ExportOutlined,
  ImportOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  DownOutlined,
  ClearOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  MessageOutlined,
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
  StopOutlined,
  PlayCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

// 扩展 dayjs
dayjs.extend(relativeTime)

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const inviteLoading = ref(false)
const searchKeyword = ref('')
const viewMode = ref<'table' | 'card'>('table')
const inviteModalVisible = ref(false)
const memberDetailVisible = ref(false)
const inviteType = ref('single')
const selectedMember = ref(null)
const selectedRowKeys = ref<string[]>([])

// 表单引用
const inviteFormRef = ref()

// 筛选条件
const filters = reactive({
  department: '',
  role: '',
  status: ''
})

// 邀请表单
const inviteForm = reactive({
  email: '',
  name: '',
  department: '',
  role: '',
  message: '',
  emails: '',
  defaultDepartment: '',
  defaultRole: ''
})

// 邀请表单验证规则
const inviteRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  emails: [
    { required: true, message: '请输入邮箱列表', trigger: 'blur' }
  ],
  defaultDepartment: [
    { required: true, message: '请选择默认部门', trigger: 'change' }
  ],
  defaultRole: [
    { required: true, message: '请选择默认角色', trigger: 'change' }
  ]
}

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 成员统计
const memberStats = reactive({
  total: 24,
  online: 8,
  offline: 16
})

// 部门数据
const departments = ref([
  { id: '1', name: '技术部' },
  { id: '2', name: '产品部' },
  { id: '3', name: '设计部' },
  { id: '4', name: '运营部' },
  { id: '5', name: '市场部' }
])

// 角色数据
const roles = ref([
  { id: '1', name: '管理员' },
  { id: '2', name: '项目经理' },
  { id: '3', name: '开发工程师' },
  { id: '4', name: 'UI设计师' },
  { id: '5', name: '产品经理' },
  { id: '6', name: '测试工程师' },
  { id: '7', name: '运营专员' }
])

// 成员数据
const members = ref([
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    avatar: 'https://via.placeholder.com/40x40',
    department: '技术部',
    role: '项目经理',
    status: 'active',
    online: true,
    lastActive: '2024-01-20T15:30:00Z',
    joinDate: '2023-06-15T00:00:00Z',
    employeeId: 'EMP001',
    phone: '13800138000',
    projectCount: 5,
    taskCompleted: 23
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    avatar: 'https://via.placeholder.com/40x40',
    department: '技术部',
    role: '开发工程师',
    status: 'active',
    online: true,
    lastActive: '2024-01-20T14:20:00Z',
    joinDate: '2023-08-20T00:00:00Z',
    employeeId: 'EMP002',
    phone: '13800138001',
    projectCount: 3,
    taskCompleted: 18
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    avatar: 'https://via.placeholder.com/40x40',
    department: '设计部',
    role: 'UI设计师',
    status: 'active',
    online: false,
    lastActive: '2024-01-20T13:15:00Z',
    joinDate: '2023-09-10T00:00:00Z',
    employeeId: 'EMP003',
    phone: '13800138002',
    projectCount: 4,
    taskCompleted: 15
  },
  {
    id: '4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    avatar: 'https://via.placeholder.com/40x40',
    department: '技术部',
    role: '开发工程师',
    status: 'inactive',
    online: false,
    lastActive: '2024-01-19T18:30:00Z',
    joinDate: '2023-10-05T00:00:00Z',
    employeeId: 'EMP004',
    phone: '13800138003',
    projectCount: 2,
    taskCompleted: 12
  },
  {
    id: '5',
    name: '钱七',
    email: 'qianqi@example.com',
    avatar: 'https://via.placeholder.com/40x40',
    department: '产品部',
    role: '产品经理',
    status: 'pending',
    online: false,
    lastActive: '2024-01-18T16:45:00Z',
    joinDate: '2024-01-15T00:00:00Z',
    employeeId: 'EMP005',
    phone: '',
    projectCount: 1,
    taskCompleted: 3
  }
])

// 表格列配置
const tableColumns: TableColumnsType = [
  {
    title: '成员',
    key: 'user',
    width: 200,
    fixed: 'left'
  },
  {
    title: '部门',
    key: 'department',
    width: 120,
    filters: departments.value.map(dept => ({ text: dept.name, value: dept.name })),
    onFilter: (value, record) => record.department === value
  },
  {
    title: '角色',
    key: 'role',
    width: 120,
    filters: roles.value.map(role => ({ text: role.name, value: role.name })),
    onFilter: (value, record) => record.role === value
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    filters: [
      { text: '活跃', value: 'active' },
      { text: '非活跃', value: 'inactive' },
      { text: '待激活', value: 'pending' },
      { text: '已禁用', value: 'disabled' }
    ],
    onFilter: (value, record) => record.status === value
  },
  {
    title: '最后活跃',
    key: 'lastActive',
    width: 120,
    sorter: (a, b) => dayjs(a.lastActive).unix() - dayjs(b.lastActive).unix()
  },
  {
    title: '入职时间',
    key: 'joinDate',
    width: 120,
    sorter: (a, b) => dayjs(a.joinDate).unix() - dayjs(b.joinDate).unix()
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
]

// 行选择配置
const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
  },
  onSelectAll: (selected: boolean, selectedRows: any[], changeRows: any[]) => {
    console.log('onSelectAll', selected, selectedRows, changeRows)
  }
}

// 计算属性
/**
 * 过滤后的成员列表
 */
const filteredMembers = computed(() => {
  let result = members.value
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(member => 
      member.name.toLowerCase().includes(keyword) ||
      member.email.toLowerCase().includes(keyword) ||
      member.role.toLowerCase().includes(keyword)
    )
  }
  
  // 部门过滤
  if (filters.department) {
    const deptName = departments.value.find(d => d.id === filters.department)?.name
    result = result.filter(member => member.department === deptName)
  }
  
  // 角色过滤
  if (filters.role) {
    const roleName = roles.value.find(r => r.id === filters.role)?.name
    result = result.filter(member => member.role === roleName)
  }
  
  // 状态过滤
  if (filters.status) {
    result = result.filter(member => member.status === filters.status)
  }
  
  // 更新分页总数
  pagination.total = result.length
  
  // 分页处理
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  
  return result.slice(start, end)
})

// 方法
/**
 * 获取角色颜色
 */
const getRoleColor = (role: string) => {
  const colors = {
    '管理员': 'red',
    '项目经理': 'blue',
    '开发工程师': 'green',
    'UI设计师': 'purple',
    '产品经理': 'orange',
    '测试工程师': 'cyan',
    '运营专员': 'pink'
  }
  return colors[role] || 'default'
}

/**
 * 获取状态徽章
 */
const getStatusBadge = (status: string) => {
  const badges = {
    active: 'success',
    inactive: 'default',
    pending: 'processing',
    disabled: 'error'
  }
  return badges[status] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const texts = {
    active: '活跃',
    inactive: '非活跃',
    pending: '待激活',
    disabled: '已禁用'
  }
  return texts[status] || status
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
  pagination.current = 1
}

/**
 * 刷新成员列表
 */
const refreshMembers = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('成员列表已刷新')
  } catch (error) {
    message.error('刷新失败')
  } finally {
    loading.value = false
  }
}

/**
 * 筛选变化处理
 */
const handleFilterChange = () => {
  pagination.current = 1
}

/**
 * 重置筛选
 */
const resetFilters = () => {
  filters.department = ''
  filters.role = ''
  filters.status = ''
  searchKeyword.value = ''
  pagination.current = 1
}

/**
 * 切换视图模式
 */
const toggleView = () => {
  viewMode.value = viewMode.value === 'table' ? 'card' : 'table'
}

/**
 * 表格变化处理
 */
const handleTableChange: TableProps['onChange'] = (pag, filters, sorter) => {
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 10
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
    case 'roles':
      router.push('/team/roles')
      break
    case 'departments':
      router.push('/team/departments')
      break
  }
}

/**
 * 显示邀请模态框
 */
const showInviteModal = () => {
  inviteModalVisible.value = true
}

/**
 * 处理邀请
 */
const handleInvite = async () => {
  try {
    await inviteFormRef.value.validate()
    inviteLoading.value = true
    
    // 模拟邀请请求
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (inviteType.value === 'single') {
      message.success(`邀请 ${inviteForm.email} 成功`)
    } else {
      const emails = inviteForm.emails.split('\n').filter(email => email.trim())
      message.success(`批量邀请 ${emails.length} 个成员成功`)
    }
    
    inviteModalVisible.value = false
    resetInviteForm()
    refreshMembers()
  } catch (error) {
    console.error('邀请失败:', error)
  } finally {
    inviteLoading.value = false
  }
}

/**
 * 重置邀请表单
 */
const resetInviteForm = () => {
  inviteFormRef.value?.resetFields()
  Object.assign(inviteForm, {
    email: '',
    name: '',
    department: '',
    role: '',
    message: '',
    emails: '',
    defaultDepartment: '',
    defaultRole: ''
  })
}

/**
 * 发送消息
 */
const sendMessage = (member: any) => {
  message.info(`发送消息给 ${member.name}`)
}

/**
 * 查看成员详情
 */
const viewMember = (member: any) => {
  selectedMember.value = member
  memberDetailVisible.value = true
}

/**
 * 编辑成员
 */
const editMember = (member: any) => {
  router.push(`/team/members/${member.id}/edit`)
}

/**
 * 成员操作处理
 */
const handleMemberAction = (action: string, member: any) => {
  switch (action) {
    case 'edit':
      editMember(member)
      break
    case 'role':
      message.info(`修改 ${member.name} 的角色`)
      break
    case 'department':
      message.info(`调整 ${member.name} 的部门`)
      break
    case 'disable':
      Modal.confirm({
        title: '确认禁用',
        content: `确定要禁用成员 ${member.name} 吗？`,
        onOk: () => {
          message.success(`已禁用成员 ${member.name}`)
        }
      })
      break
    case 'enable':
      message.success(`已启用成员 ${member.name}`)
      break
    case 'remove':
      Modal.confirm({
        title: '确认移除',
        content: `确定要移除成员 ${member.name} 吗？此操作不可恢复。`,
        okType: 'danger',
        onOk: () => {
          message.success(`已移除成员 ${member.name}`)
        }
      })
      break
  }
}

// 生命周期
onMounted(() => {
  // 初始化数据
  pagination.total = members.value.length
})
</script>

<style scoped>
.team-members {
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

.member-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.stat-value {
  font-weight: 500;
  font-size: 14px;
}

.stat-value.online {
  color: #52c41a;
}

.stat-value.offline {
  color: #999;
}

.header-right {
  flex-shrink: 0;
}

.filter-bar {
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.members-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-view {
  padding: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
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

.online-status {
  color: #52c41a;
  font-weight: 500;
}

.last-active {
  color: #666;
  font-size: 12px;
}

.card-view {
  padding: 24px;
}

.member-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.member-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.member-card.selected {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.member-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  position: relative;
}

.member-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.member-card:hover .member-actions {
  opacity: 1;
}

.member-info {
  text-align: center;
}

.member-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: #262626;
}

.member-email {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #666;
}

.member-tags {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.member-status {
  margin-bottom: 8px;
}

.member-activity {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.online {
  background-color: #52c41a;
}

.status-dot.offline {
  background-color: #d9d9d9;
}

.card-pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 16px;
}

.member-detail {
  padding: 0;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.member-avatar-large {
  flex-shrink: 0;
}

.member-basic-info {
  flex: 1;
  min-width: 0;
}

.member-basic-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

.member-basic-info .member-email {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.member-basic-info .member-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.detail-content {
  margin-top: 0;
}

.info-section {
  margin-bottom: 24px;
}

.info-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #262626;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #666;
  font-size: 14px;
  min-width: 80px;
}

.info-value {
  color: #262626;
  font-size: 14px;
  font-weight: 500;
  text-align: right;
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
  .team-members {
    padding: 0;
  }
  
  .header-actions {
    margin-bottom: 16px;
    padding: 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .member-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .member-stats :deep(.ant-divider-vertical) {
    display: none;
  }
  
  .filter-bar {
    margin-bottom: 16px;
    padding: 12px;
  }
  
  .card-view {
    padding: 16px;
  }
  
  .member-cover {
    padding: 16px;
  }
  
  .detail-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
  }
  
  .member-basic-info .member-tags {
    justify-content: center;
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
  
  .filter-bar :deep(.ant-col) {
    width: 100% !important;
    margin-bottom: 8px;
  }
  
  .member-card {
    margin-bottom: 16px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .info-value {
    text-align: left;
  }
}
</style>