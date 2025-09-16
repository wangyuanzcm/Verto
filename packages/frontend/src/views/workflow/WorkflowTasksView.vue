<template>
  <div class="workflow-tasks">
    <!-- 头部操作栏 -->
    <div class="tasks-header">
      <div class="header-left">
        <a-breadcrumb>
          <a-breadcrumb-item>
            <HomeOutlined />
            工作流
          </a-breadcrumb-item>
          <a-breadcrumb-item>
            <UnorderedListOutlined />
            任务管理
          </a-breadcrumb-item>
        </a-breadcrumb>
      </div>
      
      <div class="header-right">
        <a-space>
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索任务..."
            style="width: 300px"
            @search="handleSearch"
          />
          
          <a-button @click="handleRefresh">
            <ReloadOutlined />
            刷新
          </a-button>
          
          <a-button type="primary" @click="showBatchActions = true">
            <SettingOutlined />
            批量操作
          </a-button>
        </a-space>
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div class="tasks-stats">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card size="small">
            <a-statistic
              title="待处理任务"
              :value="stats.pending"
              :value-style="{ color: '#faad14' }"
            >
              <template #prefix>
                <ClockCircleOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        
        <a-col :span="6">
          <a-card size="small">
            <a-statistic
              title="进行中任务"
              :value="stats.inProgress"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <PlayCircleOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        
        <a-col :span="6">
          <a-card size="small">
            <a-statistic
              title="已完成任务"
              :value="stats.completed"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <CheckCircleOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        
        <a-col :span="6">
          <a-card size="small">
            <a-statistic
              title="超时任务"
              :value="stats.overdue"
              :value-style="{ color: '#ff4d4f' }"
            >
              <template #prefix>
                <ExclamationCircleOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>
    
    <!-- 筛选栏 -->
    <div class="tasks-filters">
      <a-row :gutter="16" align="middle">
        <a-col :span="4">
          <a-select
            v-model:value="filters.status"
            placeholder="任务状态"
            style="width: 100%"
            allowClear
            @change="handleFilterChange"
          >
            <a-select-option value="pending">待处理</a-select-option>
            <a-select-option value="in_progress">进行中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="cancelled">已取消</a-select-option>
            <a-select-option value="overdue">已超时</a-select-option>
          </a-select>
        </a-col>
        
        <a-col :span="4">
          <a-select
            v-model:value="filters.priority"
            placeholder="优先级"
            style="width: 100%"
            allowClear
            @change="handleFilterChange"
          >
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="low">低</a-select-option>
          </a-select>
        </a-col>
        
        <a-col :span="4">
          <a-select
            v-model:value="filters.assignee"
            placeholder="执行人"
            style="width: 100%"
            allowClear
            @change="handleFilterChange"
          >
            <a-select-option value="user1">张三</a-select-option>
            <a-select-option value="user2">李四</a-select-option>
            <a-select-option value="user3">王五</a-select-option>
            <a-select-option value="current">我的任务</a-select-option>
          </a-select>
        </a-col>
        
        <a-col :span="6">
          <a-range-picker
            v-model:value="filters.dateRange"
            style="width: 100%"
            @change="handleFilterChange"
          />
        </a-col>
        
        <a-col :span="4">
          <a-select
            v-model:value="filters.workflow"
            placeholder="所属流程"
            style="width: 100%"
            allowClear
            @change="handleFilterChange"
          >
            <a-select-option value="leave_approval">请假审批</a-select-option>
            <a-select-option value="purchase_approval">采购审批</a-select-option>
            <a-select-option value="expense_approval">报销审批</a-select-option>
          </a-select>
        </a-col>
        
        <a-col :span="2">
          <a-button @click="resetFilters" block>
            重置
          </a-button>
        </a-col>
      </a-row>
    </div>
    
    <!-- 任务列表 -->
    <div class="tasks-content">
      <a-table
        :columns="taskColumns"
        :data-source="filteredTasks"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        row-key="id"
        @change="handleTableChange"
      >
        <!-- 任务标题 -->
        <template #title="{ record }">
          <div class="task-title">
            <a @click="viewTaskDetail(record)" class="task-name">
              {{ record.name }}
            </a>
            <div class="task-description">{{ record.description }}</div>
          </div>
        </template>
        
        <!-- 优先级 -->
        <template #priority="{ record }">
          <a-tag :color="getPriorityColor(record.priority)">
            {{ getPriorityText(record.priority) }}
          </a-tag>
        </template>
        
        <!-- 状态 -->
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            <component :is="getStatusIcon(record.status)" />
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <!-- 执行人 -->
        <template #assignee="{ record }">
          <div class="task-assignee">
            <a-avatar-group :max-count="3">
              <a-avatar
                v-for="user in record.assignees"
                :key="user.id"
                :src="user.avatar"
                :title="user.name"
                size="small"
              >
                {{ user.name.charAt(0) }}
              </a-avatar>
            </a-avatar-group>
          </div>
        </template>
        
        <!-- 进度 -->
        <template #progress="{ record }">
          <a-progress
            :percent="record.progress"
            :size="'small'"
            :status="record.progress === 100 ? 'success' : 'active'"
          />
        </template>
        
        <!-- 截止时间 -->
        <template #dueDate="{ record }">
          <div class="task-due-date" :class="{ 'overdue': isOverdue(record.dueDate) }">
            <ClockCircleOutlined v-if="isOverdue(record.dueDate)" />
            {{ formatDate(record.dueDate) }}
          </div>
        </template>
        
        <!-- 操作 -->
        <template #action="{ record }">
          <a-space>
            <a-tooltip title="查看详情">
              <a-button type="text" size="small" @click="viewTaskDetail(record)">
                <EyeOutlined />
              </a-button>
            </a-tooltip>
            
            <a-tooltip title="处理任务" v-if="canProcess(record)">
              <a-button type="text" size="small" @click="processTask(record)">
                <PlayCircleOutlined />
              </a-button>
            </a-tooltip>
            
            <a-tooltip title="完成任务" v-if="canComplete(record)">
              <a-button type="text" size="small" @click="completeTask(record)">
                <CheckOutlined />
              </a-button>
            </a-tooltip>
            
            <a-dropdown>
              <template #overlay>
                <a-menu @click="({ key }) => handleTaskAction(key, record)">
                  <a-menu-item key="edit" v-if="canEdit(record)">
                    <EditOutlined />
                    编辑
                  </a-menu-item>
                  <a-menu-item key="delegate">
                    <UserSwitchOutlined />
                    委派
                  </a-menu-item>
                  <a-menu-item key="comment">
                    <CommentOutlined />
                    添加评论
                  </a-menu-item>
                  <a-menu-item key="history">
                    <HistoryOutlined />
                    查看历史
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="cancel" danger v-if="canCancel(record)">
                    <StopOutlined />
                    取消任务
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button type="text" size="small">
                <MoreOutlined />
              </a-button>
            </a-dropdown>
          </a-space>
        </template>
      </a-table>
    </div>
    
    <!-- 任务详情模态框 -->
    <a-modal
      v-model:open="showTaskDetail"
      title="任务详情"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedTask" class="task-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="任务名称" :span="2">
            {{ selectedTask.name }}
          </a-descriptions-item>
          
          <a-descriptions-item label="任务描述" :span="2">
            {{ selectedTask.description }}
          </a-descriptions-item>
          
          <a-descriptions-item label="所属流程">
            {{ selectedTask.workflowName }}
          </a-descriptions-item>
          
          <a-descriptions-item label="流程实例">
            <a @click="viewWorkflowInstance(selectedTask.instanceId)">
              {{ selectedTask.instanceId }}
            </a>
          </a-descriptions-item>
          
          <a-descriptions-item label="任务状态">
            <a-tag :color="getStatusColor(selectedTask.status)">
              <component :is="getStatusIcon(selectedTask.status)" />
              {{ getStatusText(selectedTask.status) }}
            </a-tag>
          </a-descriptions-item>
          
          <a-descriptions-item label="优先级">
            <a-tag :color="getPriorityColor(selectedTask.priority)">
              {{ getPriorityText(selectedTask.priority) }}
            </a-tag>
          </a-descriptions-item>
          
          <a-descriptions-item label="执行人">
            <a-avatar-group>
              <a-avatar
                v-for="user in selectedTask.assignees"
                :key="user.id"
                :src="user.avatar"
                :title="user.name"
                size="small"
              >
                {{ user.name.charAt(0) }}
              </a-avatar>
            </a-avatar-group>
          </a-descriptions-item>
          
          <a-descriptions-item label="创建时间">
            {{ formatDateTime(selectedTask.createdAt) }}
          </a-descriptions-item>
          
          <a-descriptions-item label="开始时间">
            {{ formatDateTime(selectedTask.startedAt) }}
          </a-descriptions-item>
          
          <a-descriptions-item label="截止时间">
            <span :class="{ 'overdue': isOverdue(selectedTask.dueDate) }">
              {{ formatDateTime(selectedTask.dueDate) }}
            </span>
          </a-descriptions-item>
          
          <a-descriptions-item label="完成时间" v-if="selectedTask.completedAt">
            {{ formatDateTime(selectedTask.completedAt) }}
          </a-descriptions-item>
          
          <a-descriptions-item label="任务进度" v-if="selectedTask.progress !== undefined">
            <a-progress :percent="selectedTask.progress" />
          </a-descriptions-item>
        </a-descriptions>
        
        <!-- 表单数据 -->
        <div v-if="selectedTask.formData" class="task-form-data">
          <h4>表单数据</h4>
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item
              v-for="(value, key) in selectedTask.formData"
              :key="key"
              :label="key"
            >
              {{ value }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
        
        <!-- 任务历史 -->
        <div class="task-history">
          <h4>任务历史</h4>
          <a-timeline>
            <a-timeline-item
              v-for="history in selectedTask.history"
              :key="history.id"
              :color="getHistoryColor(history.action)"
            >
              <template #dot>
                <component :is="getHistoryIcon(history.action)" />
              </template>
              <div class="history-content">
                <div class="history-action">{{ history.action }}</div>
                <div class="history-user">{{ history.user.name }}</div>
                <div class="history-time">{{ formatDateTime(history.createdAt) }}</div>
                <div v-if="history.comment" class="history-comment">{{ history.comment }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
        
        <!-- 操作按钮 -->
        <div class="task-actions">
          <a-space>
            <a-button type="primary" v-if="canProcess(selectedTask)" @click="processTask(selectedTask)">
              <PlayCircleOutlined />
              处理任务
            </a-button>
            
            <a-button type="primary" v-if="canComplete(selectedTask)" @click="completeTask(selectedTask)">
              <CheckOutlined />
              完成任务
            </a-button>
            
            <a-button v-if="canEdit(selectedTask)" @click="editTask(selectedTask)">
              <EditOutlined />
              编辑任务
            </a-button>
            
            <a-button @click="delegateTask(selectedTask)">
              <UserSwitchOutlined />
              委派任务
            </a-button>
            
            <a-button danger v-if="canCancel(selectedTask)" @click="cancelTask(selectedTask)">
              <StopOutlined />
              取消任务
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
    
    <!-- 任务处理模态框 -->
    <a-modal
      v-model:open="showTaskProcess"
      title="处理任务"
      width="600px"
      @ok="submitTaskProcess"
    >
      <div v-if="processingTask">
        <a-form layout="vertical">
          <a-form-item label="处理结果">
            <a-radio-group v-model:value="processForm.result">
              <a-radio value="approve">通过</a-radio>
              <a-radio value="reject">拒绝</a-radio>
              <a-radio value="return">退回</a-radio>
            </a-radio-group>
          </a-form-item>
          
          <a-form-item label="处理意见">
            <a-textarea
              v-model:value="processForm.comment"
              placeholder="请输入处理意见..."
              :rows="4"
            />
          </a-form-item>
          
          <a-form-item label="下一步执行人" v-if="processForm.result === 'approve'">
            <a-select
              v-model:value="processForm.nextAssignee"
              mode="multiple"
              placeholder="选择下一步执行人"
            >
              <a-select-option value="user1">张三</a-select-option>
              <a-select-option value="user2">李四</a-select-option>
              <a-select-option value="user3">王五</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
    
    <!-- 委派任务模态框 -->
    <a-modal
      v-model:open="showTaskDelegate"
      title="委派任务"
      width="500px"
      @ok="submitTaskDelegate"
    >
      <a-form layout="vertical">
        <a-form-item label="委派给" required>
          <a-select
            v-model:value="delegateForm.assignee"
            placeholder="选择委派对象"
          >
            <a-select-option value="user1">张三</a-select-option>
            <a-select-option value="user2">李四</a-select-option>
            <a-select-option value="user3">王五</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="委派原因">
          <a-textarea
            v-model:value="delegateForm.reason"
            placeholder="请输入委派原因..."
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 批量操作抽屉 -->
    <a-drawer
      v-model:open="showBatchActions"
      title="批量操作"
      width="400px"
    >
      <div class="batch-actions">
        <div class="selected-info">
          <p>已选择 {{ selectedRowKeys.length }} 个任务</p>
        </div>
        
        <a-space direction="vertical" style="width: 100%">
          <a-button block @click="batchComplete" :disabled="selectedRowKeys.length === 0">
            <CheckOutlined />
            批量完成
          </a-button>
          
          <a-button block @click="batchDelegate" :disabled="selectedRowKeys.length === 0">
            <UserSwitchOutlined />
            批量委派
          </a-button>
          
          <a-button block @click="batchCancel" danger :disabled="selectedRowKeys.length === 0">
            <StopOutlined />
            批量取消
          </a-button>
          
          <a-divider />
          
          <a-button block @click="exportTasks">
            <ExportOutlined />
            导出任务
          </a-button>
        </a-space>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  HomeOutlined,
  UnorderedListOutlined,
  ReloadOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  CheckOutlined,
  EditOutlined,
  UserSwitchOutlined,
  CommentOutlined,
  HistoryOutlined,
  StopOutlined,
  MoreOutlined,
  ExportOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const showTaskDetail = ref(false)
const showTaskProcess = ref(false)
const showTaskDelegate = ref(false)
const showBatchActions = ref(false)
const selectedTask = ref(null)
const processingTask = ref(null)
const selectedRowKeys = ref([])

// 统计数据
const stats = reactive({
  pending: 15,
  inProgress: 8,
  completed: 42,
  overdue: 3
})

// 筛选条件
const filters = reactive({
  status: undefined,
  priority: undefined,
  assignee: undefined,
  dateRange: undefined,
  workflow: undefined
})

// 表单数据
const processForm = reactive({
  result: 'approve',
  comment: '',
  nextAssignee: []
})

const delegateForm = reactive({
  assignee: '',
  reason: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 表格列配置
const taskColumns = [
  {
    title: '任务名称',
    dataIndex: 'name',
    key: 'name',
    slots: { customRender: 'title' },
    width: 250
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    slots: { customRender: 'priority' },
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    slots: { customRender: 'status' },
    width: 120
  },
  {
    title: '执行人',
    dataIndex: 'assignees',
    key: 'assignees',
    slots: { customRender: 'assignee' },
    width: 150
  },
  {
    title: '进度',
    dataIndex: 'progress',
    key: 'progress',
    slots: { customRender: 'progress' },
    width: 120
  },
  {
    title: '截止时间',
    dataIndex: 'dueDate',
    key: 'dueDate',
    slots: { customRender: 'dueDate' },
    width: 150
  },
  {
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' },
    width: 150,
    fixed: 'right'
  }
]

// 行选择配置
const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
  }
}

// 模拟任务数据
const tasks = ref([
  {
    id: '1',
    name: '请假申请审批',
    description: '张三的年假申请需要审批',
    workflowName: '请假审批流程',
    instanceId: 'INST_001',
    status: 'pending',
    priority: 'medium',
    assignees: [
      { id: 'user1', name: '李四', avatar: '' }
    ],
    progress: 0,
    createdAt: '2024-01-15T09:00:00Z',
    startedAt: null,
    dueDate: '2024-01-17T18:00:00Z',
    completedAt: null,
    formData: {
      '申请人': '张三',
      '请假类型': '年假',
      '请假天数': '3天',
      '请假原因': '家庭事务'
    },
    history: [
      {
        id: '1',
        action: '任务创建',
        user: { name: '系统' },
        createdAt: '2024-01-15T09:00:00Z',
        comment: '流程实例启动，任务自动创建'
      }
    ]
  },
  {
    id: '2',
    name: '采购申请审批',
    description: '办公用品采购申请',
    workflowName: '采购审批流程',
    instanceId: 'INST_002',
    status: 'in_progress',
    priority: 'high',
    assignees: [
      { id: 'user2', name: '王五', avatar: '' }
    ],
    progress: 50,
    createdAt: '2024-01-14T10:30:00Z',
    startedAt: '2024-01-14T11:00:00Z',
    dueDate: '2024-01-16T17:00:00Z',
    completedAt: null,
    formData: {
      '申请人': '李四',
      '采购类型': '办公用品',
      '预算金额': '5000元',
      '采购原因': '办公室设备更新'
    },
    history: [
      {
        id: '1',
        action: '任务创建',
        user: { name: '系统' },
        createdAt: '2024-01-14T10:30:00Z'
      },
      {
        id: '2',
        action: '任务开始',
        user: { name: '王五' },
        createdAt: '2024-01-14T11:00:00Z',
        comment: '开始处理采购申请'
      }
    ]
  }
])

// 计算属性
/**
 * 过滤后的任务列表
 */
const filteredTasks = computed(() => {
  let result = tasks.value
  
  // 搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(task => 
      task.name.toLowerCase().includes(keyword) ||
      task.description.toLowerCase().includes(keyword)
    )
  }
  
  // 状态过滤
  if (filters.status) {
    result = result.filter(task => task.status === filters.status)
  }
  
  // 优先级过滤
  if (filters.priority) {
    result = result.filter(task => task.priority === filters.priority)
  }
  
  // 执行人过滤
  if (filters.assignee) {
    if (filters.assignee === 'current') {
      // 过滤当前用户的任务
      result = result.filter(task => 
        task.assignees.some(assignee => assignee.id === 'current_user')
      )
    } else {
      result = result.filter(task => 
        task.assignees.some(assignee => assignee.id === filters.assignee)
      )
    }
  }
  
  // 日期范围过滤
  if (filters.dateRange && filters.dateRange.length === 2) {
    const [startDate, endDate] = filters.dateRange
    result = result.filter(task => {
      const taskDate = dayjs(task.createdAt)
      return taskDate.isAfter(startDate) && taskDate.isBefore(endDate)
    })
  }
  
  // 流程过滤
  if (filters.workflow) {
    result = result.filter(task => task.workflowName.includes(filters.workflow))
  }
  
  return result
})

// 方法
/**
 * 获取优先级颜色
 */
const getPriorityColor = (priority: string) => {
  const colors = {
    high: 'red',
    medium: 'orange',
    low: 'green'
  }
  return colors[priority] || 'default'
}

/**
 * 获取优先级文本
 */
const getPriorityText = (priority: string) => {
  const texts = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return texts[priority] || priority
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colors = {
    pending: 'orange',
    in_progress: 'blue',
    completed: 'green',
    cancelled: 'red',
    overdue: 'red'
  }
  return colors[status] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const texts = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
    overdue: '已超时'
  }
  return texts[status] || status
}

/**
 * 获取状态图标
 */
const getStatusIcon = (status: string) => {
  const icons = {
    pending: ClockCircleOutlined,
    in_progress: PlayCircleOutlined,
    completed: CheckCircleOutlined,
    cancelled: StopOutlined,
    overdue: ExclamationCircleOutlined
  }
  return icons[status] || ClockCircleOutlined
}

/**
 * 获取历史记录颜色
 */
const getHistoryColor = (action: string) => {
  const colors = {
    '任务创建': 'blue',
    '任务开始': 'green',
    '任务完成': 'green',
    '任务取消': 'red',
    '任务委派': 'orange'
  }
  return colors[action] || 'blue'
}

/**
 * 获取历史记录图标
 */
const getHistoryIcon = (action: string) => {
  const icons = {
    '任务创建': PlayCircleOutlined,
    '任务开始': PlayCircleOutlined,
    '任务完成': CheckCircleOutlined,
    '任务取消': StopOutlined,
    '任务委派': UserSwitchOutlined
  }
  return icons[action] || PlayCircleOutlined
}

/**
 * 判断是否超时
 */
const isOverdue = (dueDate: string) => {
  return dayjs().isAfter(dayjs(dueDate))
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * 格式化日期时间
 */
const formatDateTime = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 判断是否可以处理
 */
const canProcess = (task: any) => {
  return task.status === 'pending'
}

/**
 * 判断是否可以完成
 */
const canComplete = (task: any) => {
  return task.status === 'in_progress'
}

/**
 * 判断是否可以编辑
 */
const canEdit = (task: any) => {
  return ['pending', 'in_progress'].includes(task.status)
}

/**
 * 判断是否可以取消
 */
const canCancel = (task: any) => {
  return ['pending', 'in_progress'].includes(task.status)
}

/**
 * 搜索处理
 */
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

/**
 * 刷新数据
 */
const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('数据已刷新')
  }, 1000)
}

/**
 * 筛选变化处理
 */
const handleFilterChange = () => {
  // 筛选逻辑已在计算属性中处理
}

/**
 * 重置筛选
 */
const resetFilters = () => {
  filters.status = undefined
  filters.priority = undefined
  filters.assignee = undefined
  filters.dateRange = undefined
  filters.workflow = undefined
}

/**
 * 表格变化处理
 */
const handleTableChange = (pag: any, filters: any, sorter: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

/**
 * 查看任务详情
 */
const viewTaskDetail = (task: any) => {
  selectedTask.value = task
  showTaskDetail.value = true
}

/**
 * 查看流程实例
 */
const viewWorkflowInstance = (instanceId: string) => {
  router.push(`/workflow/instances/${instanceId}`)
}

/**
 * 处理任务
 */
const processTask = (task: any) => {
  processingTask.value = task
  processForm.result = 'approve'
  processForm.comment = ''
  processForm.nextAssignee = []
  showTaskProcess.value = true
}

/**
 * 完成任务
 */
const completeTask = (task: any) => {
  Modal.confirm({
    title: '确认完成',
    content: `确定要完成任务 "${task.name}" 吗？`,
    onOk: () => {
      task.status = 'completed'
      task.progress = 100
      task.completedAt = new Date().toISOString()
      message.success('任务已完成')
    }
  })
}

/**
 * 任务操作处理
 */
const handleTaskAction = (key: string, task: any) => {
  switch (key) {
    case 'edit':
      editTask(task)
      break
    case 'delegate':
      delegateTask(task)
      break
    case 'comment':
      addComment(task)
      break
    case 'history':
      viewTaskHistory(task)
      break
    case 'cancel':
      cancelTask(task)
      break
  }
}

/**
 * 编辑任务
 */
const editTask = (task: any) => {
  message.info('编辑任务功能开发中...')
}

/**
 * 委派任务
 */
const delegateTask = (task: any) => {
  processingTask.value = task
  delegateForm.assignee = ''
  delegateForm.reason = ''
  showTaskDelegate.value = true
}

/**
 * 添加评论
 */
const addComment = (task: any) => {
  message.info('添加评论功能开发中...')
}

/**
 * 查看任务历史
 */
const viewTaskHistory = (task: any) => {
  viewTaskDetail(task)
}

/**
 * 取消任务
 */
const cancelTask = (task: any) => {
  Modal.confirm({
    title: '确认取消',
    content: `确定要取消任务 "${task.name}" 吗？`,
    onOk: () => {
      task.status = 'cancelled'
      message.success('任务已取消')
    }
  })
}

/**
 * 提交任务处理
 */
const submitTaskProcess = () => {
  if (!processForm.comment.trim()) {
    message.error('请输入处理意见')
    return
  }
  
  if (processingTask.value) {
    processingTask.value.status = processForm.result === 'approve' ? 'completed' : 'cancelled'
    processingTask.value.progress = processForm.result === 'approve' ? 100 : 0
    processingTask.value.completedAt = new Date().toISOString()
    
    // 添加历史记录
    processingTask.value.history.push({
      id: Date.now().toString(),
      action: processForm.result === 'approve' ? '任务完成' : '任务拒绝',
      user: { name: '当前用户' },
      createdAt: new Date().toISOString(),
      comment: processForm.comment
    })
    
    message.success('任务处理成功')
    showTaskProcess.value = false
  }
}

/**
 * 提交任务委派
 */
const submitTaskDelegate = () => {
  if (!delegateForm.assignee) {
    message.error('请选择委派对象')
    return
  }
  
  if (processingTask.value) {
    // 更新执行人
    processingTask.value.assignees = [
      { id: delegateForm.assignee, name: '新执行人', avatar: '' }
    ]
    
    // 添加历史记录
    processingTask.value.history.push({
      id: Date.now().toString(),
      action: '任务委派',
      user: { name: '当前用户' },
      createdAt: new Date().toISOString(),
      comment: delegateForm.reason || '任务委派'
    })
    
    message.success('任务委派成功')
    showTaskDelegate.value = false
  }
}

/**
 * 批量完成
 */
const batchComplete = () => {
  Modal.confirm({
    title: '批量完成',
    content: `确定要完成选中的 ${selectedRowKeys.value.length} 个任务吗？`,
    onOk: () => {
      selectedRowKeys.value.forEach(taskId => {
        const task = tasks.value.find(t => t.id === taskId)
        if (task && canComplete(task)) {
          task.status = 'completed'
          task.progress = 100
          task.completedAt = new Date().toISOString()
        }
      })
      selectedRowKeys.value = []
      message.success('批量完成成功')
    }
  })
}

/**
 * 批量委派
 */
const batchDelegate = () => {
  message.info('批量委派功能开发中...')
}

/**
 * 批量取消
 */
const batchCancel = () => {
  Modal.confirm({
    title: '批量取消',
    content: `确定要取消选中的 ${selectedRowKeys.value.length} 个任务吗？`,
    onOk: () => {
      selectedRowKeys.value.forEach(taskId => {
        const task = tasks.value.find(t => t.id === taskId)
        if (task && canCancel(task)) {
          task.status = 'cancelled'
        }
      })
      selectedRowKeys.value = []
      message.success('批量取消成功')
    }
  })
}

/**
 * 导出任务
 */
const exportTasks = () => {
  message.info('导出任务功能开发中...')
}

// 生命周期
onMounted(() => {
  // 初始化数据
  pagination.total = tasks.value.length
})
</script>

<style scoped>
.workflow-tasks {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.tasks-stats {
  margin-bottom: 24px;
}

.tasks-filters {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tasks-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-name {
  font-weight: 500;
  color: #1890ff;
  text-decoration: none;
}

.task-name:hover {
  text-decoration: underline;
}

.task-description {
  font-size: 12px;
  color: #8c8c8c;
}

.task-assignee {
  display: flex;
  align-items: center;
}

.task-due-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

.task-due-date.overdue {
  color: #ff4d4f;
}

.task-detail {
  max-height: 600px;
  overflow-y: auto;
}

.task-form-data,
.task-history {
  margin-top: 24px;
}

.task-form-data h4,
.task-history h4 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-action {
  font-weight: 500;
}

.history-user {
  font-size: 12px;
  color: #1890ff;
}

.history-time {
  font-size: 12px;
  color: #8c8c8c;
}

.history-comment {
  font-size: 12px;
  color: #262626;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  margin-top: 4px;
}

.task-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.batch-actions {
  padding: 16px 0;
}

.selected-info {
  background: #f0f9ff;
  border: 1px solid #bae7ff;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  text-align: center;
}

.selected-info p {
  margin: 0;
  color: #1890ff;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .tasks-filters .ant-col {
    margin-bottom: 8px;
  }
}

@media (max-width: 768px) {
  .workflow-tasks {
    padding: 16px;
  }
  
  .tasks-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-right {
    width: 100%;
  }
  
  .header-right .ant-space {
    width: 100%;
    justify-content: space-between;
  }
  
  .tasks-filters .ant-row {
    flex-direction: column;
  }
  
  .tasks-filters .ant-col {
    width: 100%;
    margin-bottom: 8px;
  }
}

/* 动画效果 */
.task-title {
  transition: all 0.2s;
}

.task-title:hover {
  transform: translateX(2px);
}

.ant-table-row {
  transition: all 0.2s;
}

.ant-table-row:hover {
  background: #f5f5f5;
}

/* 状态颜色 */
.overdue {
  color: #ff4d4f !important;
}
</style>