<template>
  <div class="system-logs">
    <!-- 头部操作栏 -->
    <div class="header-actions">
      <div class="left-actions">
        <h2>系统日志</h2>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <HomeOutlined />
            首页
          </a-breadcrumb-item>
          <a-breadcrumb-item>
            <SettingOutlined />
            系统管理
          </a-breadcrumb-item>
          <a-breadcrumb-item>系统日志</a-breadcrumb-item>
        </a-breadcrumb>
      </div>
      
      <div class="right-actions">
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索日志内容"
            style="width: 250px"
            @search="handleSearch"
          />
          <a-button @click="refreshLogs" :loading="loading">
            <ReloadOutlined />
            刷新
          </a-button>
          <a-button @click="showExportModal">
            <ExportOutlined />
            导出
          </a-button>
          <a-button @click="showCleanModal" danger>
            <DeleteOutlined />
            清理
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
              title="总日志数"
              :value="stats.totalLogs"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <FileTextOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card">
            <a-statistic
              title="错误日志"
              :value="stats.errorLogs"
              :value-style="{ color: '#ff4d4f' }"
            >
              <template #prefix>
                <ExclamationCircleOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card">
            <a-statistic
              title="警告日志"
              :value="stats.warningLogs"
              :value-style="{ color: '#fa8c16' }"
            >
              <template #prefix>
                <WarningOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card">
            <a-statistic
              title="今日日志"
              :value="stats.todayLogs"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <CalendarOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>
    
    <!-- 筛选栏 -->
    <a-card class="filter-card">
      <a-form layout="inline" :model="filterForm">
        <a-form-item label="日志级别">
          <a-select
            v-model:value="filterForm.level"
            placeholder="选择级别"
            style="width: 120px"
            allowClear
            @change="handleFilter"
          >
            <a-select-option value="DEBUG">调试</a-select-option>
            <a-select-option value="INFO">信息</a-select-option>
            <a-select-option value="WARN">警告</a-select-option>
            <a-select-option value="ERROR">错误</a-select-option>
            <a-select-option value="FATAL">致命</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="日志模块">
          <a-select
            v-model:value="filterForm.module"
            placeholder="选择模块"
            style="width: 150px"
            allowClear
            @change="handleFilter"
          >
            <a-select-option value="auth">认证模块</a-select-option>
            <a-select-option value="user">用户模块</a-select-option>
            <a-select-option value="project">项目模块</a-select-option>
            <a-select-option value="task">任务模块</a-select-option>
            <a-select-option value="system">系统模块</a-select-option>
            <a-select-option value="api">API模块</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="时间范围">
          <a-range-picker
            v-model:value="filterForm.dateRange"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            @change="handleFilter"
          />
        </a-form-item>
        
        <a-form-item label="用户">
          <a-input
            v-model:value="filterForm.user"
            placeholder="用户名或ID"
            style="width: 120px"
            @change="handleFilter"
          />
        </a-form-item>
        
        <a-form-item>
          <a-button @click="resetFilter">
            <ClearOutlined />
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
    
    <!-- 日志列表 -->
    <a-card class="logs-table-card">
      <template #title>
        <span>日志列表</span>
        <a-tag color="blue" style="margin-left: 8px">
          共 {{ filteredLogs.length }} 条
        </a-tag>
      </template>
      
      <template #extra>
        <a-space>
          <a-switch
            v-model:checked="autoRefresh"
            checked-children="自动刷新"
            un-checked-children="手动刷新"
            @change="handleAutoRefreshChange"
          />
          <a-select
            v-model:value="pageSize"
            style="width: 100px"
            @change="handlePageSizeChange"
          >
            <a-select-option :value="20">20条/页</a-select-option>
            <a-select-option :value="50">50条/页</a-select-option>
            <a-select-option :value="100">100条/页</a-select-option>
          </a-select>
        </a-space>
      </template>
      
      <a-table
        :columns="columns"
        :data-source="paginatedLogs"
        :pagination="{
          current: currentPage,
          pageSize: pageSize,
          total: filteredLogs.length,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        }"
        :loading="loading"
        :scroll="{ x: 1200 }"
        size="small"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'level'">
            <a-tag :color="getLevelColor(record.level)">
              {{ getLevelText(record.level) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'module'">
            <a-tag color="blue">{{ getModuleText(record.module) }}</a-tag>
          </template>
          
          <template v-else-if="column.key === 'message'">
            <div class="log-message">
              <div class="message-content" :title="record.message">
                {{ record.message }}
              </div>
              <div v-if="record.stackTrace" class="stack-trace-indicator">
                <a-button
                  type="link"
                  size="small"
                  @click="showStackTrace(record)"
                >
                  查看堆栈
                </a-button>
              </div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'user'">
            <div v-if="record.user" class="user-info">
              <a-avatar :size="24" :src="record.user.avatar">
                {{ record.user.name?.charAt(0) }}
              </a-avatar>
              <span class="user-name">{{ record.user.name }}</span>
            </div>
            <span v-else class="system-user">系统</span>
          </template>
          
          <template v-else-if="column.key === 'timestamp'">
            <div class="timestamp">
              <div class="date">{{ formatDate(record.timestamp) }}</div>
              <div class="time">{{ formatTime(record.timestamp) }}</div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'actions'">
            <a-space size="small">
              <a-tooltip title="查看详情">
                <a-button type="text" size="small" @click="showLogDetail(record)">
                  <EyeOutlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="复制内容">
                <a-button type="text" size="small" @click="copyLogContent(record)">
                  <CopyOutlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip v-if="record.level === 'ERROR'" title="创建工单">
                <a-button type="text" size="small" @click="createTicket(record)">
                  <BugOutlined />
                </a-button>
              </a-tooltip>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
    
    <!-- 日志详情模态框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="日志详情"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedLog" class="log-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="日志级别">
            <a-tag :color="getLevelColor(selectedLog.level)">
              {{ getLevelText(selectedLog.level) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="模块">
            <a-tag color="blue">{{ getModuleText(selectedLog.module) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="时间">
            {{ formatDateTime(selectedLog.timestamp) }}
          </a-descriptions-item>
          <a-descriptions-item label="用户">
            <div v-if="selectedLog.user" class="user-info">
              <a-avatar :size="24" :src="selectedLog.user.avatar">
                {{ selectedLog.user.name?.charAt(0) }}
              </a-avatar>
              <span class="user-name">{{ selectedLog.user.name }}</span>
            </div>
            <span v-else>系统</span>
          </a-descriptions-item>
          <a-descriptions-item v-if="selectedLog.ip" label="IP地址">
            {{ selectedLog.ip }}
          </a-descriptions-item>
          <a-descriptions-item v-if="selectedLog.userAgent" label="用户代理">
            {{ selectedLog.userAgent }}
          </a-descriptions-item>
          <a-descriptions-item label="消息内容" :span="2">
            <div class="message-content-detail">
              {{ selectedLog.message }}
            </div>
          </a-descriptions-item>
        </a-descriptions>
        
        <div v-if="selectedLog.context" class="log-context">
          <a-divider>上下文信息</a-divider>
          <pre class="context-content">{{ JSON.stringify(selectedLog.context, null, 2) }}</pre>
        </div>
        
        <div v-if="selectedLog.stackTrace" class="stack-trace">
          <a-divider>堆栈跟踪</a-divider>
          <pre class="stack-trace-content">{{ selectedLog.stackTrace }}</pre>
        </div>
      </div>
    </a-modal>
    
    <!-- 堆栈跟踪模态框 -->
    <a-modal
      v-model:open="stackTraceModalVisible"
      title="堆栈跟踪"
      width="900px"
      :footer="null"
    >
      <div v-if="selectedLog" class="stack-trace-modal">
        <div class="stack-trace-header">
          <h4>{{ selectedLog.message }}</h4>
          <a-tag :color="getLevelColor(selectedLog.level)">
            {{ getLevelText(selectedLog.level) }}
          </a-tag>
        </div>
        <pre class="stack-trace-content">{{ selectedLog.stackTrace }}</pre>
      </div>
    </a-modal>
    
    <!-- 导出模态框 -->
    <a-modal
      v-model:open="exportModalVisible"
      title="导出日志"
      width="500px"
      :confirm-loading="exporting"
      @ok="handleExport"
    >
      <a-form :model="exportForm" layout="vertical">
        <a-form-item label="导出格式">
          <a-radio-group v-model:value="exportForm.format">
            <a-radio value="csv">CSV</a-radio>
            <a-radio value="json">JSON</a-radio>
            <a-radio value="txt">TXT</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="导出范围">
          <a-radio-group v-model:value="exportForm.range">
            <a-radio value="current">当前筛选结果</a-radio>
            <a-radio value="all">全部日志</a-radio>
            <a-radio value="custom">自定义时间范围</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item v-if="exportForm.range === 'custom'" label="时间范围">
          <a-range-picker
            v-model:value="exportForm.customRange"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
          />
        </a-form-item>
        
        <a-form-item label="包含字段">
          <a-checkbox-group v-model:value="exportForm.fields">
            <a-checkbox value="timestamp">时间</a-checkbox>
            <a-checkbox value="level">级别</a-checkbox>
            <a-checkbox value="module">模块</a-checkbox>
            <a-checkbox value="message">消息</a-checkbox>
            <a-checkbox value="user">用户</a-checkbox>
            <a-checkbox value="ip">IP地址</a-checkbox>
            <a-checkbox value="stackTrace">堆栈跟踪</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 清理日志模态框 -->
    <a-modal
      v-model:open="cleanModalVisible"
      title="清理日志"
      width="500px"
      :confirm-loading="cleaning"
      @ok="handleClean"
    >
      <a-form :model="cleanForm" layout="vertical">
        <a-form-item label="清理策略">
          <a-radio-group v-model:value="cleanForm.strategy">
            <a-radio value="byTime">按时间清理</a-radio>
            <a-radio value="byCount">按数量清理</a-radio>
            <a-radio value="byLevel">按级别清理</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item v-if="cleanForm.strategy === 'byTime'" label="保留时间">
          <a-select v-model:value="cleanForm.retentionDays" style="width: 100%">
            <a-select-option :value="7">保留7天</a-select-option>
            <a-select-option :value="30">保留30天</a-select-option>
            <a-select-option :value="90">保留90天</a-select-option>
            <a-select-option :value="365">保留1年</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item v-if="cleanForm.strategy === 'byCount'" label="保留数量">
          <a-input-number
            v-model:value="cleanForm.retentionCount"
            :min="1000"
            :max="100000"
            :step="1000"
            style="width: 100%"
          />
        </a-form-item>
        
        <a-form-item v-if="cleanForm.strategy === 'byLevel'" label="清理级别">
          <a-checkbox-group v-model:value="cleanForm.levels">
            <a-checkbox value="DEBUG">调试</a-checkbox>
            <a-checkbox value="INFO">信息</a-checkbox>
            <a-checkbox value="WARN">警告</a-checkbox>
          </a-checkbox-group>
          <div class="clean-warning">
            <ExclamationCircleOutlined style="color: #fa8c16; margin-right: 4px;" />
            错误和致命级别的日志不会被清理
          </div>
        </a-form-item>
        
        <a-alert
          message="警告"
          description="清理操作不可逆，请谨慎操作。建议在清理前先导出重要日志。"
          type="warning"
          show-icon
        />
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  HomeOutlined,
  SettingOutlined,
  ReloadOutlined,
  ExportOutlined,
  DeleteOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
  ClearOutlined,
  EyeOutlined,
  CopyOutlined,
  BugOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const cleaning = ref(false)
const searchText = ref('')
const autoRefresh = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const detailModalVisible = ref(false)
const stackTraceModalVisible = ref(false)
const exportModalVisible = ref(false)
const cleanModalVisible = ref(false)
const selectedLog = ref(null)
const refreshTimer = ref(null)

// 统计数据
const stats = reactive({
  totalLogs: 15420,
  errorLogs: 89,
  warningLogs: 234,
  todayLogs: 1256
})

// 筛选表单
const filterForm = reactive({
  level: undefined,
  module: undefined,
  dateRange: undefined,
  user: ''
})

// 导出表单
const exportForm = reactive({
  format: 'csv',
  range: 'current',
  customRange: undefined,
  fields: ['timestamp', 'level', 'module', 'message', 'user']
})

// 清理表单
const cleanForm = reactive({
  strategy: 'byTime',
  retentionDays: 30,
  retentionCount: 10000,
  levels: ['DEBUG', 'INFO']
})

// 日志数据
const logs = ref([
  {
    id: '1',
    timestamp: '2024-01-15 14:30:25',
    level: 'ERROR',
    module: 'auth',
    message: '用户登录失败：密码错误',
    user: {
      id: 'user001',
      name: '张三',
      avatar: '/avatars/user001.jpg'
    },
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    context: {
      username: 'zhangsan',
      attemptCount: 3,
      lastAttempt: '2024-01-15 14:29:45'
    },
    stackTrace: 'AuthenticationException: Invalid password\n    at AuthService.authenticate(AuthService.java:45)\n    at LoginController.login(LoginController.java:23)'
  },
  {
    id: '2',
    timestamp: '2024-01-15 14:28:15',
    level: 'INFO',
    module: 'user',
    message: '用户创建成功',
    user: {
      id: 'admin',
      name: '管理员',
      avatar: '/avatars/admin.jpg'
    },
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    context: {
      newUserId: 'user123',
      userName: '李四',
      department: '技术部'
    }
  },
  {
    id: '3',
    timestamp: '2024-01-15 14:25:30',
    level: 'WARN',
    module: 'system',
    message: '系统内存使用率过高：85%',
    user: null,
    ip: '127.0.0.1',
    userAgent: 'System Monitor',
    context: {
      memoryUsage: '85%',
      threshold: '80%',
      availableMemory: '2.1GB'
    }
  },
  {
    id: '4',
    timestamp: '2024-01-15 14:20:45',
    level: 'DEBUG',
    module: 'api',
    message: 'API请求处理完成',
    user: {
      id: 'user002',
      name: '王五',
      avatar: '/avatars/user002.jpg'
    },
    ip: '192.168.1.102',
    userAgent: 'PostmanRuntime/7.32.3',
    context: {
      endpoint: '/api/projects',
      method: 'GET',
      responseTime: '125ms',
      statusCode: 200
    }
  },
  {
    id: '5',
    timestamp: '2024-01-15 14:15:20',
    level: 'FATAL',
    module: 'system',
    message: '数据库连接失败',
    user: null,
    ip: '127.0.0.1',
    userAgent: 'Database Monitor',
    context: {
      database: 'verto_main',
      host: 'localhost:5432',
      error: 'Connection timeout'
    },
    stackTrace: 'SQLException: Connection timeout\n    at DatabaseConnection.connect(DatabaseConnection.java:78)\n    at DataSource.getConnection(DataSource.java:34)'
  }
])

// 表格列定义
const columns = [
  {
    title: '时间',
    key: 'timestamp',
    width: 140,
    fixed: 'left'
  },
  {
    title: '级别',
    key: 'level',
    width: 80
  },
  {
    title: '模块',
    key: 'module',
    width: 100
  },
  {
    title: '消息内容',
    key: 'message',
    width: 400
  },
  {
    title: '用户',
    key: 'user',
    width: 120
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
]

// 级别颜色映射
const levelColors = {
  DEBUG: 'default',
  INFO: 'blue',
  WARN: 'orange',
  ERROR: 'red',
  FATAL: 'purple'
}

// 级别文本映射
const levelTexts = {
  DEBUG: '调试',
  INFO: '信息',
  WARN: '警告',
  ERROR: '错误',
  FATAL: '致命'
}

// 模块文本映射
const moduleTexts = {
  auth: '认证模块',
  user: '用户模块',
  project: '项目模块',
  task: '任务模块',
  system: '系统模块',
  api: 'API模块'
}

// 计算属性
const filteredLogs = computed(() => {
  let result = logs.value
  
  // 搜索过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(log => 
      log.message.toLowerCase().includes(search) ||
      (log.user?.name || '').toLowerCase().includes(search) ||
      log.module.toLowerCase().includes(search)
    )
  }
  
  // 级别过滤
  if (filterForm.level) {
    result = result.filter(log => log.level === filterForm.level)
  }
  
  // 模块过滤
  if (filterForm.module) {
    result = result.filter(log => log.module === filterForm.module)
  }
  
  // 时间范围过滤
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const [start, end] = filterForm.dateRange
    result = result.filter(log => {
      const logTime = new Date(log.timestamp)
      return logTime >= start && logTime <= end
    })
  }
  
  // 用户过滤
  if (filterForm.user) {
    const user = filterForm.user.toLowerCase()
    result = result.filter(log => 
      (log.user?.name || '').toLowerCase().includes(user) ||
      (log.user?.id || '').toLowerCase().includes(user)
    )
  }
  
  return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLogs.value.slice(start, end)
})

// 方法
/**
 * 搜索处理
 */
const handleSearch = () => {
  currentPage.value = 1
}

/**
 * 过滤处理
 */
const handleFilter = () => {
  currentPage.value = 1
}

/**
 * 重置过滤
 */
const resetFilter = () => {
  Object.assign(filterForm, {
    level: undefined,
    module: undefined,
    dateRange: undefined,
    user: ''
  })
  currentPage.value = 1
}

/**
 * 刷新日志
 */
const refreshLogs = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('日志刷新成功')
  }, 1000)
}

/**
 * 自动刷新变化处理
 */
const handleAutoRefreshChange = (checked: boolean) => {
  if (checked) {
    refreshTimer.value = setInterval(() => {
      refreshLogs()
    }, 30000) // 30秒刷新一次
  } else {
    if (refreshTimer.value) {
      clearInterval(refreshTimer.value)
      refreshTimer.value = null
    }
  }
}

/**
 * 页面大小变化处理
 */
const handlePageSizeChange = () => {
  currentPage.value = 1
}

/**
 * 表格变化处理
 */
const handleTableChange = (pagination: any) => {
  currentPage.value = pagination.current
}

/**
 * 获取级别颜色
 */
const getLevelColor = (level: string) => {
  return levelColors[level] || 'default'
}

/**
 * 获取级别文本
 */
const getLevelText = (level: string) => {
  return levelTexts[level] || level
}

/**
 * 获取模块文本
 */
const getModuleText = (module: string) => {
  return moduleTexts[module] || module
}

/**
 * 显示日志详情
 */
const showLogDetail = (log: any) => {
  selectedLog.value = log
  detailModalVisible.value = true
}

/**
 * 显示堆栈跟踪
 */
const showStackTrace = (log: any) => {
  selectedLog.value = log
  stackTraceModalVisible.value = true
}

/**
 * 复制日志内容
 */
const copyLogContent = async (log: any) => {
  const content = `[${log.timestamp}] [${log.level}] [${log.module}] ${log.message}`
  try {
    await navigator.clipboard.writeText(content)
    message.success('日志内容已复制到剪贴板')
  } catch (error) {
    message.error('复制失败')
  }
}

/**
 * 创建工单
 */
const createTicket = (log: any) => {
  // 这里可以跳转到工单创建页面或打开创建工单的模态框
  message.info('跳转到工单创建页面')
}

/**
 * 显示导出模态框
 */
const showExportModal = () => {
  exportModalVisible.value = true
}

/**
 * 处理导出
 */
const handleExport = () => {
  exporting.value = true
  
  setTimeout(() => {
    // 模拟导出逻辑
    const filename = `logs_${new Date().toISOString().split('T')[0]}.${exportForm.format}`
    message.success(`日志导出成功：${filename}`)
    
    exporting.value = false
    exportModalVisible.value = false
  }, 2000)
}

/**
 * 显示清理模态框
 */
const showCleanModal = () => {
  cleanModalVisible.value = true
}

/**
 * 处理清理
 */
const handleClean = () => {
  cleaning.value = true
  
  setTimeout(() => {
    // 模拟清理逻辑
    let cleanedCount = 0
    
    if (cleanForm.strategy === 'byTime') {
      cleanedCount = Math.floor(Math.random() * 1000) + 500
    } else if (cleanForm.strategy === 'byCount') {
      cleanedCount = Math.floor(Math.random() * 2000) + 1000
    } else if (cleanForm.strategy === 'byLevel') {
      cleanedCount = Math.floor(Math.random() * 800) + 200
    }
    
    stats.totalLogs -= cleanedCount
    message.success(`清理完成，共清理 ${cleanedCount} 条日志`)
    
    cleaning.value = false
    cleanModalVisible.value = false
  }, 3000)
}

/**
 * 格式化日期
 */
const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString()
}

/**
 * 格式化时间
 */
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString()
}

/**
 * 格式化日期时间
 */
const formatDateTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString()
}

// 生命周期
onMounted(() => {
  console.log('系统日志页面已加载')
})

onUnmounted(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
  }
})
</script>

<style scoped>
.system-logs {
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

.filter-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logs-table-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.log-message {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-content {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.stack-trace-indicator {
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 12px;
}

.system-user {
  color: #999;
  font-style: italic;
}

.timestamp {
  text-align: center;
}

.date {
  font-size: 12px;
  color: #666;
}

.time {
  font-size: 11px;
  color: #999;
}

.log-detail .ant-descriptions {
  margin-bottom: 16px;
}

.message-content-detail {
  word-break: break-all;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
}

.log-context,
.stack-trace {
  margin-top: 16px;
}

.context-content,
.stack-trace-content {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.stack-trace-modal .stack-trace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.stack-trace-modal .stack-trace-header h4 {
  margin: 0;
  flex: 1;
  margin-right: 16px;
}

.clean-warning {
  margin-top: 8px;
  color: #fa8c16;
  font-size: 12px;
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
  
  .filter-card .ant-form {
    flex-direction: column;
  }
  
  .filter-card .ant-form-item {
    margin-bottom: 16px;
  }
  
  .message-content {
    max-width: 200px;
  }
  
  .user-info {
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
  .filter-card,
  .logs-table-card {
    background: #141414;
    border-color: #303030;
  }
  
  .date,
  .time,
  .system-user {
    color: #999;
  }
  
  .message-content-detail,
  .context-content,
  .stack-trace-content {
    background: #262626;
    color: #fff;
  }
  
  .stack-trace-modal .stack-trace-header {
    border-color: #303030;
  }
  
  .clean-warning {
    color: #fa8c16;
  }
}
</style>