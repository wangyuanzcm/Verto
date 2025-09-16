<template>
  <div class="workflow-instances">
    <!-- 头部操作栏 -->
    <div class="header-actions">
      <div class="header-left">
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索流程实例..."
          style="width: 300px"
          @search="handleSearch"
        />
        
        <a-select
          v-model:value="statusFilter"
          placeholder="选择状态"
          style="width: 150px; margin-left: 12px"
          allow-clear
          @change="handleStatusChange"
        >
          <a-select-option value="">全部状态</a-select-option>
          <a-select-option value="running">运行中</a-select-option>
          <a-select-option value="completed">已完成</a-select-option>
          <a-select-option value="suspended">已暂停</a-select-option>
          <a-select-option value="terminated">已终止</a-select-option>
          <a-select-option value="error">异常</a-select-option>
        </a-select>
        
        <a-select
          v-model:value="templateFilter"
          placeholder="选择模板"
          style="width: 180px; margin-left: 12px"
          allow-clear
          @change="handleTemplateChange"
        >
          <a-select-option value="">全部模板</a-select-option>
          <a-select-option value="leave">请假申请流程</a-select-option>
          <a-select-option value="purchase">采购申请流程</a-select-option>
          <a-select-option value="contract">合同审批流程</a-select-option>
          <a-select-option value="project">项目立项流程</a-select-option>
          <a-select-option value="onboard">员工入职流程</a-select-option>
        </a-select>
        
        <a-range-picker
          v-model:value="dateRange"
          style="margin-left: 12px"
          @change="handleDateChange"
        />
      </div>
      
      <div class="header-right">
        <a-space>
          <a-tooltip title="刷新">
            <a-button @click="handleRefresh" :loading="loading">
              <ReloadOutlined />
            </a-button>
          </a-tooltip>
          
          <a-dropdown>
            <template #overlay>
              <a-menu @click="handleBatchAction">
                <a-menu-item key="suspend">
                  <PauseCircleOutlined />
                  批量暂停
                </a-menu-item>
                <a-menu-item key="resume">
                  <PlayCircleOutlined />
                  批量恢复
                </a-menu-item>
                <a-menu-item key="terminate">
                  <StopOutlined />
                  批量终止
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="export">
                  <ExportOutlined />
                  导出数据
                </a-menu-item>
              </a-menu>
            </template>
            <a-button :disabled="selectedRowKeys.length === 0">
              批量操作
              <DownOutlined />
            </a-button>
          </a-dropdown>
          
          <a-button type="primary" @click="startNewInstance">
            <PlusOutlined />
            启动流程
          </a-button>
        </a-space>
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div class="stats-bar">
      <a-row :gutter="[16, 16]">
        <a-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">总实例数</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ stats.running }}</div>
            <div class="stat-label">运行中</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ stats.avgDuration }}</div>
            <div class="stat-label">平均耗时(小时)</div>
          </div>
        </a-col>
      </a-row>
    </div>
    
    <!-- 实例列表 -->
    <div class="instances-table">
      <a-table
        :columns="tableColumns"
        :data-source="filteredInstances"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        row-key="id"
        @change="handleTableChange"
        :scroll="{ x: 1200 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <div class="instance-title-cell">
              <div class="instance-icon">
                <component :is="getTemplateIcon(record.template)" />
              </div>
              <div class="instance-info">
                <div class="title">
                  <a @click="viewInstance(record)">{{ record.title }}</a>
                </div>
                <div class="template">{{ getTemplateName(record.template) }}</div>
              </div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'status'">
            <a-badge
              :status="getStatusBadge(record.status)"
              :text="getStatusText(record.status)"
            />
            <div v-if="record.status === 'running'" class="progress-info">
              <a-progress
                :percent="record.progress"
                size="small"
                :show-info="false"
              />
              <span class="progress-text">{{ record.progress }}%</span>
            </div>
          </template>
          
          <template v-else-if="column.key === 'currentTask'">
            <div v-if="record.currentTask" class="current-task">
              <div class="task-name">{{ record.currentTask.name }}</div>
              <div class="task-assignee">
                <a-avatar :size="20" :src="record.currentTask.assignee.avatar">
                  {{ record.currentTask.assignee.name.charAt(0) }}
                </a-avatar>
                <span>{{ record.currentTask.assignee.name }}</span>
              </div>
            </div>
            <span v-else class="no-task">-</span>
          </template>
          
          <template v-else-if="column.key === 'initiator'">
            <div class="initiator-cell">
              <a-avatar :size="24" :src="record.initiator.avatar">
                {{ record.initiator.name.charAt(0) }}
              </a-avatar>
              <span class="name">{{ record.initiator.name }}</span>
            </div>
          </template>
          
          <template v-else-if="column.key === 'startTime'">
            <div class="time-cell">
              <div class="date">{{ formatDate(record.startTime) }}</div>
              <div class="relative">{{ formatRelativeTime(record.startTime) }}</div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'duration'">
            <div class="duration-cell">
              <span class="value">{{ formatDuration(record.duration) }}</span>
              <div v-if="record.estimatedDuration" class="estimated">
                预计: {{ formatDuration(record.estimatedDuration) }}
              </div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ getPriorityText(record.priority) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-tooltip title="查看详情">
                <a-button type="text" size="small" @click="viewInstance(record)">
                  <EyeOutlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="流程图">
                <a-button type="text" size="small" @click="viewDiagram(record)">
                  <NodeIndexOutlined />
                </a-button>
              </a-tooltip>
              
              <a-dropdown>
                <template #overlay>
                  <a-menu @click="({ key }) => handleInstanceAction(key, record)">
                    <a-menu-item key="suspend" v-if="record.status === 'running'">
                      <PauseCircleOutlined />
                      暂停
                    </a-menu-item>
                    <a-menu-item key="resume" v-if="record.status === 'suspended'">
                      <PlayCircleOutlined />
                      恢复
                    </a-menu-item>
                    <a-menu-item key="terminate" v-if="['running', 'suspended'].includes(record.status)">
                      <StopOutlined />
                      终止
                    </a-menu-item>
                    <a-menu-divider v-if="['running', 'suspended'].includes(record.status)" />
                    <a-menu-item key="history">
                      <HistoryOutlined />
                      执行历史
                    </a-menu-item>
                    <a-menu-item key="export">
                      <ExportOutlined />
                      导出数据
                    </a-menu-item>
                    <a-menu-item key="copy">
                      <CopyOutlined />
                      复制启动
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="delete" danger v-if="['completed', 'terminated', 'error'].includes(record.status)">
                      <DeleteOutlined />
                      删除
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
    
    <!-- 实例详情模态框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="流程实例详情"
      width="1000px"
      :footer="null"
    >
      <div v-if="selectedInstance" class="instance-detail">
        <a-tabs v-model:activeKey="detailActiveTab">
          <a-tab-pane key="basic" tab="基本信息">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="实例标题">
                {{ selectedInstance.title }}
              </a-descriptions-item>
              
              <a-descriptions-item label="流程模板">
                {{ getTemplateName(selectedInstance.template) }}
              </a-descriptions-item>
              
              <a-descriptions-item label="实例状态">
                <a-badge
                  :status="getStatusBadge(selectedInstance.status)"
                  :text="getStatusText(selectedInstance.status)"
                />
              </a-descriptions-item>
              
              <a-descriptions-item label="优先级">
                <a-tag :color="getPriorityColor(selectedInstance.priority)">
                  {{ getPriorityText(selectedInstance.priority) }}
                </a-tag>
              </a-descriptions-item>
              
              <a-descriptions-item label="发起人">
                <div class="initiator-info">
                  <a-avatar :size="24" :src="selectedInstance.initiator.avatar">
                    {{ selectedInstance.initiator.name.charAt(0) }}
                  </a-avatar>
                  <span>{{ selectedInstance.initiator.name }}</span>
                </div>
              </a-descriptions-item>
              
              <a-descriptions-item label="开始时间">
                {{ formatDate(selectedInstance.startTime) }}
              </a-descriptions-item>
              
              <a-descriptions-item label="结束时间">
                {{ selectedInstance.endTime ? formatDate(selectedInstance.endTime) : '-' }}
              </a-descriptions-item>
              
              <a-descriptions-item label="执行时长">
                {{ formatDuration(selectedInstance.duration) }}
              </a-descriptions-item>
              
              <a-descriptions-item label="当前任务" v-if="selectedInstance.currentTask">
                <div class="current-task-info">
                  <div>{{ selectedInstance.currentTask.name }}</div>
                  <div class="assignee">
                    <a-avatar :size="20" :src="selectedInstance.currentTask.assignee.avatar">
                      {{ selectedInstance.currentTask.assignee.name.charAt(0) }}
                    </a-avatar>
                    <span>{{ selectedInstance.currentTask.assignee.name }}</span>
                  </div>
                </div>
              </a-descriptions-item>
              
              <a-descriptions-item label="进度" v-if="selectedInstance.status === 'running'">
                <a-progress :percent="selectedInstance.progress" />
              </a-descriptions-item>
              
              <a-descriptions-item label="实例描述" :span="2">
                {{ selectedInstance.description || '-' }}
              </a-descriptions-item>
            </a-descriptions>
          </a-tab-pane>
          
          <a-tab-pane key="tasks" tab="任务列表">
            <a-table
              :columns="taskColumns"
              :data-source="selectedInstance.tasks || []"
              :pagination="false"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-badge
                    :status="getTaskStatusBadge(record.status)"
                    :text="getTaskStatusText(record.status)"
                  />
                </template>
                
                <template v-else-if="column.key === 'assignee'">
                  <div class="assignee-cell">
                    <a-avatar :size="20" :src="record.assignee.avatar">
                      {{ record.assignee.name.charAt(0) }}
                    </a-avatar>
                    <span>{{ record.assignee.name }}</span>
                  </div>
                </template>
                
                <template v-else-if="column.key === 'startTime'">
                  {{ record.startTime ? formatDate(record.startTime) : '-' }}
                </template>
                
                <template v-else-if="column.key === 'endTime'">
                  {{ record.endTime ? formatDate(record.endTime) : '-' }}
                </template>
                
                <template v-else-if="column.key === 'duration'">
                  {{ record.duration ? formatDuration(record.duration) : '-' }}
                </template>
              </template>
            </a-table>
          </a-tab-pane>
          
          <a-tab-pane key="history" tab="执行历史">
            <a-timeline>
              <a-timeline-item
                v-for="(event, index) in selectedInstance.history || []"
                :key="index"
                :color="getEventColor(event.type)"
              >
                <template #dot>
                  <component :is="getEventIcon(event.type)" />
                </template>
                
                <div class="history-item">
                  <div class="event-title">{{ event.title }}</div>
                  <div class="event-description">{{ event.description }}</div>
                  <div class="event-meta">
                    <span class="operator">{{ event.operator }}</span>
                    <span class="time">{{ formatDate(event.time) }}</span>
                  </div>
                </div>
              </a-timeline-item>
            </a-timeline>
          </a-tab-pane>
          
          <a-tab-pane key="variables" tab="流程变量">
            <a-table
              :columns="variableColumns"
              :data-source="selectedInstance.variables || []"
              :pagination="false"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'value'">
                  <div class="variable-value">
                    <span v-if="typeof record.value === 'object'">
                      {{ JSON.stringify(record.value, null, 2) }}
                    </span>
                    <span v-else>{{ record.value }}</span>
                  </div>
                </template>
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>
        
        <div class="detail-actions">
          <a-space>
            <a-button
              v-if="selectedInstance.status === 'running'"
              @click="handleInstanceAction('suspend', selectedInstance)"
            >
              <PauseCircleOutlined />
              暂停
            </a-button>
            
            <a-button
              v-if="selectedInstance.status === 'suspended'"
              type="primary"
              @click="handleInstanceAction('resume', selectedInstance)"
            >
              <PlayCircleOutlined />
              恢复
            </a-button>
            
            <a-button
              v-if="['running', 'suspended'].includes(selectedInstance.status)"
              danger
              @click="handleInstanceAction('terminate', selectedInstance)"
            >
              <StopOutlined />
              终止
            </a-button>
            
            <a-button @click="viewDiagram(selectedInstance)">
              <NodeIndexOutlined />
              查看流程图
            </a-button>
            
            <a-button @click="handleInstanceAction('export', selectedInstance)">
              <ExportOutlined />
              导出数据
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
    
    <!-- 流程图模态框 -->
    <a-modal
      v-model:open="diagramModalVisible"
      title="流程图"
      width="1200px"
      :footer="null"
    >
      <div class="diagram-container">
        <div class="diagram-placeholder">
          <NodeIndexOutlined style="font-size: 48px; color: #d9d9d9;" />
          <p>流程图组件开发中...</p>
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
  ReloadOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ExportOutlined,
  DownOutlined,
  PlusOutlined,
  EyeOutlined,
  NodeIndexOutlined,
  MoreOutlined,
  HistoryOutlined,
  CopyOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  ShoppingOutlined,
  FileProtectOutlined,
  ProjectOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'

// 扩展dayjs
dayjs.extend(relativeTime)
dayjs.extend(duration)

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref('')
const templateFilter = ref('')
const dateRange = ref([])
const selectedRowKeys = ref([])
const detailModalVisible = ref(false)
const diagramModalVisible = ref(false)
const selectedInstance = ref(null)
const detailActiveTab = ref('basic')

// 统计数据
const stats = reactive({
  total: 156,
  running: 23,
  completed: 128,
  avgDuration: 18.5
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 156,
  showSizeChanger: true,
  showQuickJumper: true
})

// 实例数据
const instances = ref([
  {
    id: '1',
    title: '张三的年假申请',
    template: 'leave',
    status: 'running',
    progress: 60,
    priority: 'normal',
    initiator: {
      id: 'user1',
      name: '张三',
      avatar: ''
    },
    currentTask: {
      name: '部门经理审批',
      assignee: {
        id: 'user2',
        name: '李四',
        avatar: ''
      }
    },
    startTime: new Date('2024-01-20 09:00:00'),
    endTime: null,
    duration: 8 * 60 * 60 * 1000, // 8小时
    estimatedDuration: 24 * 60 * 60 * 1000, // 24小时
    description: '申请年假5天，用于回家探亲',
    tasks: [
      {
        id: 'task1',
        name: '提交申请',
        status: 'completed',
        assignee: { id: 'user1', name: '张三', avatar: '' },
        startTime: new Date('2024-01-20 09:00:00'),
        endTime: new Date('2024-01-20 09:15:00'),
        duration: 15 * 60 * 1000
      },
      {
        id: 'task2',
        name: '部门经理审批',
        status: 'running',
        assignee: { id: 'user2', name: '李四', avatar: '' },
        startTime: new Date('2024-01-20 09:15:00'),
        endTime: null,
        duration: null
      }
    ],
    history: [
      {
        type: 'start',
        title: '流程启动',
        description: '张三启动了请假申请流程',
        operator: '张三',
        time: new Date('2024-01-20 09:00:00')
      },
      {
        type: 'task_complete',
        title: '任务完成',
        description: '提交申请任务已完成',
        operator: '张三',
        time: new Date('2024-01-20 09:15:00')
      },
      {
        type: 'task_assign',
        title: '任务分配',
        description: '部门经理审批任务已分配给李四',
        operator: '系统',
        time: new Date('2024-01-20 09:15:00')
      }
    ],
    variables: [
      { name: 'leaveType', label: '请假类型', value: '年假', type: 'string' },
      { name: 'leaveDays', label: '请假天数', value: 5, type: 'number' },
      { name: 'startDate', label: '开始日期', value: '2024-02-01', type: 'date' },
      { name: 'endDate', label: '结束日期', value: '2024-02-05', type: 'date' },
      { name: 'reason', label: '请假原因', value: '回家探亲', type: 'string' }
    ]
  },
  {
    id: '2',
    title: '办公用品采购申请',
    template: 'purchase',
    status: 'completed',
    progress: 100,
    priority: 'low',
    initiator: {
      id: 'user3',
      name: '王五',
      avatar: ''
    },
    currentTask: null,
    startTime: new Date('2024-01-18 14:00:00'),
    endTime: new Date('2024-01-19 16:30:00'),
    duration: 26.5 * 60 * 60 * 1000,
    estimatedDuration: 48 * 60 * 60 * 1000,
    description: '采购打印机、文具等办公用品',
    tasks: [],
    history: [],
    variables: []
  },
  {
    id: '3',
    title: '销售合同审批',
    template: 'contract',
    status: 'suspended',
    progress: 40,
    priority: 'high',
    initiator: {
      id: 'user4',
      name: '赵六',
      avatar: ''
    },
    currentTask: {
      name: '法务审核',
      assignee: {
        id: 'user5',
        name: '孙七',
        avatar: ''
      }
    },
    startTime: new Date('2024-01-19 10:00:00'),
    endTime: null,
    duration: 30 * 60 * 60 * 1000,
    estimatedDuration: 72 * 60 * 60 * 1000,
    description: '与ABC公司的销售合同审批',
    tasks: [],
    history: [],
    variables: []
  },
  {
    id: '4',
    title: '新项目立项申请',
    template: 'project',
    status: 'error',
    progress: 20,
    priority: 'high',
    initiator: {
      id: 'user6',
      name: '周八',
      avatar: ''
    },
    currentTask: null,
    startTime: new Date('2024-01-17 11:00:00'),
    endTime: null,
    duration: 72 * 60 * 60 * 1000,
    estimatedDuration: 120 * 60 * 60 * 1000,
    description: '移动端APP开发项目立项',
    tasks: [],
    history: [],
    variables: []
  },
  {
    id: '5',
    title: '新员工入职办理',
    template: 'onboard',
    status: 'running',
    progress: 80,
    priority: 'normal',
    initiator: {
      id: 'user7',
      name: '吴九',
      avatar: ''
    },
    currentTask: {
      name: 'IT设备配置',
      assignee: {
        id: 'user8',
        name: '郑十',
        avatar: ''
      }
    },
    startTime: new Date('2024-01-19 08:30:00'),
    endTime: null,
    duration: 32 * 60 * 60 * 1000,
    estimatedDuration: 40 * 60 * 60 * 1000,
    description: '新员工李明的入职办理流程',
    tasks: [],
    history: [],
    variables: []
  }
])

// 表格列配置
const tableColumns = [
  {
    title: '实例标题',
    key: 'title',
    width: 300,
    fixed: 'left'
  },
  {
    title: '状态',
    key: 'status',
    width: 150
  },
  {
    title: '当前任务',
    key: 'currentTask',
    width: 200
  },
  {
    title: '优先级',
    key: 'priority',
    width: 100
  },
  {
    title: '发起人',
    key: 'initiator',
    width: 120
  },
  {
    title: '开始时间',
    key: 'startTime',
    width: 150,
    sorter: true
  },
  {
    title: '执行时长',
    key: 'duration',
    width: 120
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 任务列表列配置
const taskColumns = [
  { title: '任务名称', dataIndex: 'name', key: 'name' },
  { title: '状态', key: 'status', width: 100 },
  { title: '执行人', key: 'assignee', width: 120 },
  { title: '开始时间', key: 'startTime', width: 150 },
  { title: '结束时间', key: 'endTime', width: 150 },
  { title: '耗时', key: 'duration', width: 100 }
]

// 变量列表列配置
const variableColumns = [
  { title: '变量名', dataIndex: 'name', key: 'name' },
  { title: '显示名', dataIndex: 'label', key: 'label' },
  { title: '值', key: 'value' },
  { title: '类型', dataIndex: 'type', key: 'type' }
]

// 行选择配置
const rowSelection = {
  selectedRowKeys,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
  }
}

// 计算属性
/**
 * 过滤后的实例列表
 */
const filteredInstances = computed(() => {
  let result = [...instances.value]
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(instance => 
      instance.title.toLowerCase().includes(keyword) ||
      instance.description.toLowerCase().includes(keyword) ||
      instance.initiator.name.toLowerCase().includes(keyword)
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(instance => instance.status === statusFilter.value)
  }
  
  // 模板过滤
  if (templateFilter.value) {
    result = result.filter(instance => instance.template === templateFilter.value)
  }
  
  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    result = result.filter(instance => {
      const instanceDate = dayjs(instance.startTime)
      return instanceDate.isAfter(startDate) && instanceDate.isBefore(endDate.add(1, 'day'))
    })
  }
  
  return result
})

// 方法
/**
 * 获取模板图标
 */
const getTemplateIcon = (template: string) => {
  const icons = {
    leave: UserOutlined,
    purchase: ShoppingOutlined,
    contract: FileProtectOutlined,
    project: ProjectOutlined,
    onboard: TeamOutlined
  }
  return icons[template] || FileTextOutlined
}

/**
 * 获取模板名称
 */
const getTemplateName = (template: string) => {
  const names = {
    leave: '请假申请流程',
    purchase: '采购申请流程',
    contract: '合同审批流程',
    project: '项目立项流程',
    onboard: '员工入职流程'
  }
  return names[template] || template
}

/**
 * 获取状态徽章
 */
const getStatusBadge = (status: string) => {
  const badges = {
    running: 'processing',
    completed: 'success',
    suspended: 'warning',
    terminated: 'default',
    error: 'error'
  }
  return badges[status] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const texts = {
    running: '运行中',
    completed: '已完成',
    suspended: '已暂停',
    terminated: '已终止',
    error: '异常'
  }
  return texts[status] || status
}

/**
 * 获取任务状态徽章
 */
const getTaskStatusBadge = (status: string) => {
  const badges = {
    pending: 'default',
    running: 'processing',
    completed: 'success',
    skipped: 'warning'
  }
  return badges[status] || 'default'
}

/**
 * 获取任务状态文本
 */
const getTaskStatusText = (status: string) => {
  const texts = {
    pending: '待执行',
    running: '执行中',
    completed: '已完成',
    skipped: '已跳过'
  }
  return texts[status] || status
}

/**
 * 获取优先级颜色
 */
const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'green',
    normal: 'blue',
    high: 'orange',
    urgent: 'red'
  }
  return colors[priority] || 'default'
}

/**
 * 获取优先级文本
 */
const getPriorityText = (priority: string) => {
  const texts = {
    low: '低',
    normal: '普通',
    high: '高',
    urgent: '紧急'
  }
  return texts[priority] || priority
}

/**
 * 获取事件颜色
 */
const getEventColor = (type: string) => {
  const colors = {
    start: 'green',
    task_complete: 'blue',
    task_assign: 'orange',
    suspend: 'yellow',
    resume: 'blue',
    terminate: 'red',
    error: 'red'
  }
  return colors[type] || 'blue'
}

/**
 * 获取事件图标
 */
const getEventIcon = (type: string) => {
  const icons = {
    start: PlayCircleOutlined,
    task_complete: CheckCircleOutlined,
    task_assign: UserOutlined,
    suspend: PauseCircleOutlined,
    resume: PlayCircleOutlined,
    terminate: StopOutlined,
    error: ExclamationCircleOutlined
  }
  return icons[type] || ClockCircleOutlined
}

/**
 * 格式化日期
 */
const formatDate = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

/**
 * 格式化相对时间
 */
const formatRelativeTime = (date: Date) => {
  return dayjs(date).fromNow()
}

/**
 * 格式化持续时间
 */
const formatDuration = (milliseconds: number) => {
  const duration = dayjs.duration(milliseconds)
  const days = Math.floor(duration.asDays())
  const hours = duration.hours()
  const minutes = duration.minutes()
  
  if (days > 0) {
    return `${days}天${hours}小时`
  } else if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

/**
 * 搜索处理
 */
const handleSearch = (value: string) => {
  searchKeyword.value = value
  pagination.current = 1
}

/**
 * 状态变更处理
 */
const handleStatusChange = () => {
  pagination.current = 1
}

/**
 * 模板变更处理
 */
const handleTemplateChange = () => {
  pagination.current = 1
}

/**
 * 日期变更处理
 */
const handleDateChange = () => {
  pagination.current = 1
}

/**
 * 刷新处理
 */
const handleRefresh = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('刷新成功')
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
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要操作的实例')
    return
  }
  
  switch (key) {
    case 'suspend':
      message.success(`已暂停 ${selectedRowKeys.value.length} 个实例`)
      break
    case 'resume':
      message.success(`已恢复 ${selectedRowKeys.value.length} 个实例`)
      break
    case 'terminate':
      Modal.confirm({
        title: '确认终止',
        content: `确定要终止选中的 ${selectedRowKeys.value.length} 个实例吗？`,
        onOk: () => {
          message.success(`已终止 ${selectedRowKeys.value.length} 个实例`)
          selectedRowKeys.value = []
        }
      })
      break
    case 'export':
      message.success(`正在导出 ${selectedRowKeys.value.length} 个实例的数据`)
      break
  }
}

/**
 * 启动新实例
 */
const startNewInstance = () => {
  router.push('/workflow/instances/new')
}

/**
 * 表格变更处理
 */
const handleTableChange = (pag: any, filters: any, sorter: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

/**
 * 查看实例详情
 */
const viewInstance = (instance: any) => {
  selectedInstance.value = instance
  detailModalVisible.value = true
  detailActiveTab.value = 'basic'
}

/**
 * 查看流程图
 */
const viewDiagram = (instance: any) => {
  selectedInstance.value = instance
  diagramModalVisible.value = true
}

/**
 * 实例操作处理
 */
const handleInstanceAction = (key: string, instance: any) => {
  switch (key) {
    case 'suspend':
      Modal.confirm({
        title: '确认暂停',
        content: `确定要暂停实例 "${instance.title}" 吗？`,
        onOk: () => {
          message.success(`已暂停实例: ${instance.title}`)
          instance.status = 'suspended'
        }
      })
      break
    case 'resume':
      message.success(`已恢复实例: ${instance.title}`)
      instance.status = 'running'
      break
    case 'terminate':
      Modal.confirm({
        title: '确认终止',
        content: `确定要终止实例 "${instance.title}" 吗？此操作不可撤销。`,
        onOk: () => {
          message.success(`已终止实例: ${instance.title}`)
          instance.status = 'terminated'
        }
      })
      break
    case 'history':
      selectedInstance.value = instance
      detailModalVisible.value = true
      detailActiveTab.value = 'history'
      break
    case 'export':
      message.success(`正在导出实例数据: ${instance.title}`)
      break
    case 'copy':
      message.success(`复制启动实例: ${instance.title}`)
      router.push(`/workflow/instances/new?copy=${instance.id}`)
      break
    case 'delete':
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除实例 "${instance.title}" 吗？`,
        onOk: () => {
          message.success(`已删除实例: ${instance.title}`)
          const index = instances.value.findIndex(i => i.id === instance.id)
          if (index > -1) {
            instances.value.splice(index, 1)
          }
        }
      })
      break
  }
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.workflow-instances {
  padding: 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.header-right {
  flex-shrink: 0;
}

.stats-bar {
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
}

.instances-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.instance-title-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.instance-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #1890ff;
}

.instance-info .title {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.instance-info .title a {
  color: #1890ff;
  text-decoration: none;
}

.instance-info .title a:hover {
  text-decoration: underline;
}

.instance-info .template {
  font-size: 12px;
  color: #8c8c8c;
}

.progress-info {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: #8c8c8c;
}

.current-task {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-name {
  font-weight: 500;
  color: #262626;
}

.task-assignee {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8c8c8c;
}

.no-task {
  color: #d9d9d9;
}

.initiator-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.initiator-cell .name {
  font-size: 14px;
  color: #262626;
}

.time-cell .date {
  font-size: 14px;
  color: #262626;
  margin-bottom: 2px;
}

.time-cell .relative {
  font-size: 12px;
  color: #8c8c8c;
}

.duration-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.duration-cell .value {
  font-weight: 500;
  color: #262626;
}

.duration-cell .estimated {
  font-size: 12px;
  color: #8c8c8c;
}

.instance-detail {
  padding: 16px 0;
}

.initiator-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-task-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.current-task-info .assignee {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8c8c8c;
}

.assignee-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.history-item {
  margin-bottom: 8px;
}

.event-title {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.event-description {
  color: #595959;
  margin-bottom: 4px;
}

.event-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #8c8c8c;
}

.variable-value {
  max-width: 200px;
  word-break: break-all;
}

.detail-actions {
  margin-top: 24px;
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.diagram-container {
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 8px;
}

.diagram-placeholder {
  text-align: center;
  color: #8c8c8c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .header-left {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 576px) {
  .stats-bar :deep(.ant-col) {
    margin-bottom: 12px;
  }
  
  .instance-title-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .current-task {
    align-items: flex-start;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-actions,
.stats-bar,
.instances-table {
  animation: fadeInUp 0.6s ease-out;
}

/* 表格行状态样式 */
:deep(.ant-table-tbody > tr.ant-table-row:hover) {
  background-color: #f5f5f5;
}

:deep(.ant-table-tbody > tr[data-status="error"]) {
  background-color: #fff2f0;
}

:deep(.ant-table-tbody > tr[data-status="suspended"]) {
  background-color: #fffbe6;
}

/* 进度条样式优化 */
:deep(.ant-progress-line) {
  margin-bottom: 0;
}

:deep(.ant-progress-text) {
  font-size: 12px;
}
</style>