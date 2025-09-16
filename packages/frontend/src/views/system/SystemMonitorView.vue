<template>
  <div class="system-monitor">
    <!-- 头部操作栏 -->
    <div class="header-actions">
      <div class="left-actions">
        <h2>系统监控</h2>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <HomeOutlined />
            首页
          </a-breadcrumb-item>
          <a-breadcrumb-item>
            <SettingOutlined />
            系统管理
          </a-breadcrumb-item>
          <a-breadcrumb-item>系统监控</a-breadcrumb-item>
        </a-breadcrumb>
      </div>
      
      <div class="right-actions">
        <a-space>
          <a-switch
            v-model:checked="autoRefresh"
            checked-children="自动刷新"
            un-checked-children="手动刷新"
            @change="handleAutoRefreshChange"
          />
          <a-select
            v-model:value="refreshInterval"
            style="width: 120px"
            :disabled="!autoRefresh"
            @change="handleIntervalChange"
          >
            <a-select-option :value="5">5秒</a-select-option>
            <a-select-option :value="10">10秒</a-select-option>
            <a-select-option :value="30">30秒</a-select-option>
            <a-select-option :value="60">1分钟</a-select-option>
          </a-select>
          <a-button @click="refreshData" :loading="loading">
            <ReloadOutlined />
            刷新
          </a-button>
          <a-button @click="showAlertModal">
            <BellOutlined />
            告警设置
          </a-button>
        </a-space>
      </div>
    </div>
    
    <!-- 系统状态概览 -->
    <div class="status-overview">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="status-card cpu-card">
            <div class="status-content">
              <div class="status-icon">
                <div class="cpu-icon">
                  <span class="icon-text">CPU</span>
                </div>
              </div>
              <div class="status-info">
                <div class="status-title">CPU使用率</div>
                <div class="status-value">{{ systemStats.cpu.usage }}%</div>
                <div class="status-detail">
                  <span>负载: {{ systemStats.cpu.load }}</span>
                  <span>核心: {{ systemStats.cpu.cores }}</span>
                </div>
              </div>
              <div class="status-chart">
                <a-progress
                  type="circle"
                  :percent="systemStats.cpu.usage"
                  :size="60"
                  :stroke-color="getCpuColor(systemStats.cpu.usage)"
                />
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="status-card memory-card">
            <div class="status-content">
              <div class="status-icon">
                <div class="memory-icon">
                  <span class="icon-text">RAM</span>
                </div>
              </div>
              <div class="status-info">
                <div class="status-title">内存使用率</div>
                <div class="status-value">{{ systemStats.memory.usage }}%</div>
                <div class="status-detail">
                  <span>已用: {{ formatBytes(systemStats.memory.used) }}</span>
                  <span>总计: {{ formatBytes(systemStats.memory.total) }}</span>
                </div>
              </div>
              <div class="status-chart">
                <a-progress
                  type="circle"
                  :percent="systemStats.memory.usage"
                  :size="60"
                  :stroke-color="getMemoryColor(systemStats.memory.usage)"
                />
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="status-card disk-card">
            <div class="status-content">
              <div class="status-icon">
                <div class="disk-icon">
                  <HddOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="status-info">
                <div class="status-title">磁盘使用率</div>
                <div class="status-value">{{ systemStats.disk.usage }}%</div>
                <div class="status-detail">
                  <span>已用: {{ formatBytes(systemStats.disk.used) }}</span>
                  <span>总计: {{ formatBytes(systemStats.disk.total) }}</span>
                </div>
              </div>
              <div class="status-chart">
                <a-progress
                  type="circle"
                  :percent="systemStats.disk.usage"
                  :size="60"
                  :stroke-color="getDiskColor(systemStats.disk.usage)"
                />
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="status-card network-card">
            <div class="status-content">
              <div class="status-icon">
                <div class="network-icon">
                  <WifiOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="status-info">
                <div class="status-title">网络流量</div>
                <div class="status-value">{{ formatBytes(systemStats.network.speed) }}/s</div>
                <div class="status-detail">
                  <span>上行: {{ formatBytes(systemStats.network.upload) }}/s</span>
                  <span>下行: {{ formatBytes(systemStats.network.download) }}/s</span>
                </div>
              </div>
              <div class="status-chart">
                <div class="network-indicator">
                  <div class="upload-bar" :style="{ height: getNetworkBarHeight(systemStats.network.upload) }"></div>
                  <div class="download-bar" :style="{ height: getNetworkBarHeight(systemStats.network.download) }"></div>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
    
    <!-- 详细监控图表 -->
    <a-row :gutter="16" style="margin-bottom: 24px;">
      <a-col :xs="24" :lg="12">
        <a-card title="CPU & 内存趋势" class="chart-card">
          <div class="chart-container">
            <div class="chart-placeholder">
              <LineChartOutlined style="font-size: 48px; color: #d9d9d9;" />
              <p>CPU & 内存使用率趋势图</p>
            </div>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :lg="12">
        <a-card title="网络流量趋势" class="chart-card">
          <div class="chart-container">
            <div class="chart-placeholder">
              <AreaChartOutlined style="font-size: 48px; color: #d9d9d9;" />
              <p>网络上传/下载流量趋势图</p>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
    
    <!-- 进程监控 -->
    <a-row :gutter="16" style="margin-bottom: 24px;">
      <a-col :xs="24" :lg="16">
        <a-card class="process-card">
          <template #title>
            <span>进程监控</span>
            <a-tag color="blue" style="margin-left: 8px">
              运行中: {{ runningProcesses.length }}
            </a-tag>
          </template>
          
          <template #extra>
            <a-space>
              <a-input-search
                v-model:value="processSearchText"
                placeholder="搜索进程"
                style="width: 200px"
                @search="handleProcessSearch"
              />
              <a-select
                v-model:value="processSortBy"
                style="width: 120px"
                @change="handleProcessSort"
              >
                <a-select-option value="cpu">CPU使用率</a-select-option>
                <a-select-option value="memory">内存使用</a-select-option>
                <a-select-option value="name">进程名称</a-select-option>
              </a-select>
            </a-space>
          </template>
          
          <a-table
            :columns="processColumns"
            :data-source="filteredProcesses"
            :pagination="{
              pageSize: 8,
              showSizeChanger: false,
              showQuickJumper: false,
              size: 'small'
            }"
            size="small"
            :scroll="{ y: 300 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <div class="process-name">
                  <div class="name-text">{{ record.name }}</div>
                  <div class="pid-text">PID: {{ record.pid }}</div>
                </div>
              </template>
              
              <template v-else-if="column.key === 'cpu'">
                <div class="process-cpu">
                  <span class="cpu-value">{{ record.cpu }}%</span>
                  <a-progress
                    :percent="record.cpu"
                    size="small"
                    :show-info="false"
                    :stroke-color="getCpuColor(record.cpu)"
                  />
                </div>
              </template>
              
              <template v-else-if="column.key === 'memory'">
                <div class="process-memory">
                  <span class="memory-value">{{ formatBytes(record.memory) }}</span>
                  <span class="memory-percent">({{ record.memoryPercent }}%)</span>
                </div>
              </template>
              
              <template v-else-if="column.key === 'status'">
                <a-tag :color="getProcessStatusColor(record.status)">
                  {{ record.status }}
                </a-tag>
              </template>
              
              <template v-else-if="column.key === 'actions'">
                <a-space size="small">
                  <a-tooltip title="查看详情">
                    <a-button type="text" size="small" @click="showProcessDetail(record)">
                      <EyeOutlined />
                    </a-button>
                  </a-tooltip>
                  
                  <a-tooltip v-if="record.status === 'running'" title="终止进程">
                    <a-popconfirm
                      title="确定要终止这个进程吗？"
                      ok-text="确定"
                      cancel-text="取消"
                      @confirm="killProcess(record)"
                    >
                      <a-button type="text" size="small" danger>
                        <StopOutlined />
                      </a-button>
                    </a-popconfirm>
                  </a-tooltip>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :lg="8">
        <a-card title="系统信息" class="system-info-card">
          <div class="system-info">
            <div class="info-item">
              <div class="info-label">
                <DesktopOutlined style="color: #1890ff;" />
                操作系统
              </div>
              <div class="info-value">{{ systemInfo.os }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">
                <ClockCircleOutlined style="color: #52c41a;" />
                运行时间
              </div>
              <div class="info-value">{{ systemInfo.uptime }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">
                <UserOutlined style="color: #fa8c16;" />
                当前用户
              </div>
              <div class="info-value">{{ systemInfo.user }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">
                <GlobalOutlined style="color: #722ed1;" />
                主机名
              </div>
              <div class="info-value">{{ systemInfo.hostname }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">
                <ThunderboltOutlined style="color: #eb2f96;" />
                CPU型号
              </div>
              <div class="info-value">{{ systemInfo.cpuModel }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">
                <DatabaseOutlined style="color: #13c2c2;" />
                总内存
              </div>
              <div class="info-value">{{ formatBytes(systemInfo.totalMemory) }}</div>
            </div>
          </div>
        </a-card>
        
        <a-card title="服务状态" class="service-status-card" style="margin-top: 16px;">
          <div class="service-list">
            <div
              v-for="service in services"
              :key="service.name"
              class="service-item"
            >
              <div class="service-info">
                <div class="service-name">{{ service.name }}</div>
                <div class="service-description">{{ service.description }}</div>
              </div>
              <div class="service-status">
                <a-tag :color="getServiceStatusColor(service.status)">
                  <template #icon>
                    <CheckCircleOutlined v-if="service.status === 'running'" />
                    <CloseCircleOutlined v-else-if="service.status === 'stopped'" />
                    <ExclamationCircleOutlined v-else />
                  </template>
                  {{ service.status }}
                </a-tag>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
    
    <!-- 告警日志 -->
    <a-card title="告警日志" class="alert-log-card">
      <template #extra>
        <a-space>
          <a-select
            v-model:value="alertFilter"
            placeholder="告警级别"
            style="width: 120px"
            allowClear
            @change="handleAlertFilter"
          >
            <a-select-option value="critical">严重</a-select-option>
            <a-select-option value="warning">警告</a-select-option>
            <a-select-option value="info">信息</a-select-option>
          </a-select>
          <a-button @click="clearAlerts" size="small">
            <DeleteOutlined />
            清空日志
          </a-button>
        </a-space>
      </template>
      
      <div class="alert-list">
        <div
          v-for="alert in filteredAlerts"
          :key="alert.id"
          class="alert-item"
          :class="`alert-${alert.level}`"
        >
          <div class="alert-icon">
            <ExclamationCircleOutlined v-if="alert.level === 'critical'" />
            <WarningOutlined v-else-if="alert.level === 'warning'" />
            <InfoCircleOutlined v-else />
          </div>
          <div class="alert-content">
            <div class="alert-message">{{ alert.message }}</div>
            <div class="alert-time">{{ formatDateTime(alert.time) }}</div>
          </div>
          <div class="alert-actions">
            <a-button type="text" size="small" @click="dismissAlert(alert.id)">
              <CloseOutlined />
            </a-button>
          </div>
        </div>
        
        <div v-if="filteredAlerts.length === 0" class="empty-alerts">
          <a-empty description="暂无告警信息" />
        </div>
      </div>
    </a-card>
    
    <!-- 进程详情模态框 -->
    <a-modal
      v-model:open="processDetailModalVisible"
      title="进程详情"
      width="600px"
      :footer="null"
    >
      <div v-if="selectedProcess" class="process-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="进程名称">
            {{ selectedProcess.name }}
          </a-descriptions-item>
          <a-descriptions-item label="进程ID">
            {{ selectedProcess.pid }}
          </a-descriptions-item>
          <a-descriptions-item label="父进程ID">
            {{ selectedProcess.ppid }}
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getProcessStatusColor(selectedProcess.status)">
              {{ selectedProcess.status }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="CPU使用率">
            {{ selectedProcess.cpu }}%
          </a-descriptions-item>
          <a-descriptions-item label="内存使用">
            {{ formatBytes(selectedProcess.memory) }} ({{ selectedProcess.memoryPercent }}%)
          </a-descriptions-item>
          <a-descriptions-item label="启动时间">
            {{ formatDateTime(selectedProcess.startTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="运行时长">
            {{ formatDuration(selectedProcess.runtime) }}
          </a-descriptions-item>
          <a-descriptions-item label="命令行" :span="2">
            <code class="command-line">{{ selectedProcess.command }}</code>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
    
    <!-- 告警设置模态框 -->
    <a-modal
      v-model:open="alertModalVisible"
      title="告警设置"
      width="600px"
      @ok="handleSaveAlertSettings"
    >
      <a-form layout="vertical">
        <a-form-item label="CPU使用率告警">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-input-number
                v-model:value="alertSettings.cpu.warning"
                :min="0"
                :max="100"
                addon-after="%"
                placeholder="警告阈值"
              />
            </a-col>
            <a-col :span="12">
              <a-input-number
                v-model:value="alertSettings.cpu.critical"
                :min="0"
                :max="100"
                addon-after="%"
                placeholder="严重阈值"
              />
            </a-col>
          </a-row>
        </a-form-item>
        
        <a-form-item label="内存使用率告警">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-input-number
                v-model:value="alertSettings.memory.warning"
                :min="0"
                :max="100"
                addon-after="%"
                placeholder="警告阈值"
              />
            </a-col>
            <a-col :span="12">
              <a-input-number
                v-model:value="alertSettings.memory.critical"
                :min="0"
                :max="100"
                addon-after="%"
                placeholder="严重阈值"
              />
            </a-col>
          </a-row>
        </a-form-item>
        
        <a-form-item label="磁盘使用率告警">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-input-number
                v-model:value="alertSettings.disk.warning"
                :min="0"
                :max="100"
                addon-after="%"
                placeholder="警告阈值"
              />
            </a-col>
            <a-col :span="12">
              <a-input-number
                v-model:value="alertSettings.disk.critical"
                :min="0"
                :max="100"
                addon-after="%"
                placeholder="严重阈值"
              />
            </a-col>
          </a-row>
        </a-form-item>
        
        <a-form-item>
          <a-checkbox v-model:checked="alertSettings.emailNotification">
            启用邮件通知
          </a-checkbox>
        </a-form-item>
        
        <a-form-item>
          <a-checkbox v-model:checked="alertSettings.soundNotification">
            启用声音提醒
          </a-checkbox>
        </a-form-item>
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
  BellOutlined,
  HddOutlined,
  WifiOutlined,
  LineChartOutlined,
  AreaChartOutlined,
  EyeOutlined,
  StopOutlined,
  DesktopOutlined,
  ClockCircleOutlined,
  UserOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const loading = ref(false)
const autoRefresh = ref(true)
const refreshInterval = ref(10)
const processSearchText = ref('')
const processSortBy = ref('cpu')
const alertFilter = ref()
const processDetailModalVisible = ref(false)
const alertModalVisible = ref(false)
const selectedProcess = ref(null)
let refreshTimer: NodeJS.Timeout | null = null

// 系统统计数据
const systemStats = reactive({
  cpu: {
    usage: 45,
    load: 1.2,
    cores: 8
  },
  memory: {
    usage: 68,
    used: 5497558138,
    total: 8589934592
  },
  disk: {
    usage: 72,
    used: 322122547200,
    total: 500107862016
  },
  network: {
    speed: 1048576,
    upload: 524288,
    download: 1572864
  }
})

// 系统信息
const systemInfo = reactive({
  os: 'Windows 11 Pro',
  uptime: '5天 12小时 30分钟',
  user: 'Administrator',
  hostname: 'DESKTOP-ABC123',
  cpuModel: 'Intel Core i7-12700K',
  totalMemory: 8589934592
})

// 进程数据
const processes = ref([
  {
    id: '1',
    name: 'chrome.exe',
    pid: 1234,
    ppid: 567,
    cpu: 15.2,
    memory: 536870912,
    memoryPercent: 6.2,
    status: 'running',
    startTime: '2024-01-15 09:30:00',
    runtime: 18000,
    command: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe --type=browser'
  },
  {
    id: '2',
    name: 'node.exe',
    pid: 2345,
    ppid: 1234,
    cpu: 8.7,
    memory: 268435456,
    memoryPercent: 3.1,
    status: 'running',
    startTime: '2024-01-15 10:15:00',
    runtime: 15300,
    command: 'C:\\Program Files\\nodejs\\node.exe server.js'
  },
  {
    id: '3',
    name: 'vscode.exe',
    pid: 3456,
    ppid: 567,
    cpu: 5.3,
    memory: 402653184,
    memoryPercent: 4.7,
    status: 'running',
    startTime: '2024-01-15 08:45:00',
    runtime: 21900,
    command: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe'
  },
  {
    id: '4',
    name: 'explorer.exe',
    pid: 4567,
    ppid: 567,
    cpu: 2.1,
    memory: 134217728,
    memoryPercent: 1.6,
    status: 'running',
    startTime: '2024-01-15 08:00:00',
    runtime: 24600,
    command: 'C:\\Windows\\explorer.exe'
  },
  {
    id: '5',
    name: 'notepad.exe',
    pid: 5678,
    ppid: 4567,
    cpu: 0.1,
    memory: 16777216,
    memoryPercent: 0.2,
    status: 'sleeping',
    startTime: '2024-01-15 11:20:00',
    runtime: 8400,
    command: 'C:\\Windows\\System32\\notepad.exe'
  }
])

// 服务数据
const services = ref([
  {
    name: 'Web Server',
    description: 'HTTP服务器',
    status: 'running'
  },
  {
    name: 'Database',
    description: 'MySQL数据库',
    status: 'running'
  },
  {
    name: 'Redis Cache',
    description: 'Redis缓存服务',
    status: 'running'
  },
  {
    name: 'File Server',
    description: '文件服务器',
    status: 'stopped'
  },
  {
    name: 'Backup Service',
    description: '备份服务',
    status: 'error'
  }
])

// 告警数据
const alerts = ref([
  {
    id: '1',
    level: 'warning',
    message: 'CPU使用率超过80%',
    time: '2024-01-15 14:30:00'
  },
  {
    id: '2',
    level: 'critical',
    message: '磁盘空间不足，剩余空间小于10%',
    time: '2024-01-15 14:25:00'
  },
  {
    id: '3',
    level: 'info',
    message: '系统备份任务完成',
    time: '2024-01-15 14:20:00'
  },
  {
    id: '4',
    level: 'warning',
    message: '内存使用率超过85%',
    time: '2024-01-15 14:15:00'
  }
])

// 告警设置
const alertSettings = reactive({
  cpu: {
    warning: 80,
    critical: 90
  },
  memory: {
    warning: 85,
    critical: 95
  },
  disk: {
    warning: 85,
    critical: 95
  },
  emailNotification: true,
  soundNotification: false
})

// 进程表格列定义
const processColumns = [
  {
    title: '进程名称',
    key: 'name',
    width: 200
  },
  {
    title: 'CPU',
    key: 'cpu',
    width: 120,
    sorter: (a: any, b: any) => a.cpu - b.cpu
  },
  {
    title: '内存',
    key: 'memory',
    width: 120,
    sorter: (a: any, b: any) => a.memory - b.memory
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 100
  }
]

// 计算属性
const runningProcesses = computed(() => {
  return processes.value.filter(p => p.status === 'running')
})

const filteredProcesses = computed(() => {
  let result = processes.value
  
  // 搜索过滤
  if (processSearchText.value) {
    const search = processSearchText.value.toLowerCase()
    result = result.filter(process => 
      process.name.toLowerCase().includes(search) ||
      process.pid.toString().includes(search)
    )
  }
  
  // 排序
  if (processSortBy.value === 'cpu') {
    result = result.sort((a, b) => b.cpu - a.cpu)
  } else if (processSortBy.value === 'memory') {
    result = result.sort((a, b) => b.memory - a.memory)
  } else if (processSortBy.value === 'name') {
    result = result.sort((a, b) => a.name.localeCompare(b.name))
  }
  
  return result
})

const filteredAlerts = computed(() => {
  if (!alertFilter.value) {
    return alerts.value
  }
  return alerts.value.filter(alert => alert.level === alertFilter.value)
})

// 方法
/**
 * 刷新数据
 */
const refreshData = () => {
  loading.value = true
  
  // 模拟数据更新
  setTimeout(() => {
    // 更新系统统计数据
    systemStats.cpu.usage = Math.floor(Math.random() * 100)
    systemStats.memory.usage = Math.floor(Math.random() * 100)
    systemStats.disk.usage = Math.floor(Math.random() * 100)
    systemStats.network.upload = Math.floor(Math.random() * 2097152)
    systemStats.network.download = Math.floor(Math.random() * 2097152)
    systemStats.network.speed = systemStats.network.upload + systemStats.network.download
    
    // 更新进程数据
    processes.value.forEach(process => {
      process.cpu = Math.floor(Math.random() * 20)
      process.runtime += refreshInterval.value
    })
    
    loading.value = false
    message.success('数据刷新成功')
  }, 1000)
}

/**
 * 处理自动刷新变化
 */
const handleAutoRefreshChange = (checked: boolean) => {
  if (checked) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

/**
 * 处理刷新间隔变化
 */
const handleIntervalChange = () => {
  if (autoRefresh.value) {
    stopAutoRefresh()
    startAutoRefresh()
  }
}

/**
 * 开始自动刷新
 */
const startAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  refreshTimer = setInterval(() => {
    refreshData()
  }, refreshInterval.value * 1000)
}

/**
 * 停止自动刷新
 */
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

/**
 * 处理进程搜索
 */
const handleProcessSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

/**
 * 处理进程排序
 */
const handleProcessSort = () => {
  // 排序逻辑已在计算属性中处理
}

/**
 * 显示进程详情
 */
const showProcessDetail = (process: any) => {
  selectedProcess.value = process
  processDetailModalVisible.value = true
}

/**
 * 终止进程
 */
const killProcess = (process: any) => {
  process.status = 'stopped'
  message.success(`进程 ${process.name} 已终止`)
}

/**
 * 显示告警设置模态框
 */
const showAlertModal = () => {
  alertModalVisible.value = true
}

/**
 * 保存告警设置
 */
const handleSaveAlertSettings = () => {
  alertModalVisible.value = false
  message.success('告警设置已保存')
}

/**
 * 处理告警过滤
 */
const handleAlertFilter = () => {
  // 过滤逻辑已在计算属性中处理
}

/**
 * 清空告警
 */
const clearAlerts = () => {
  alerts.value = []
  message.success('告警日志已清空')
}

/**
 * 忽略告警
 */
const dismissAlert = (id: string) => {
  const index = alerts.value.findIndex(alert => alert.id === id)
  if (index > -1) {
    alerts.value.splice(index, 1)
  }
}

/**
 * 获取CPU颜色
 */
const getCpuColor = (usage: number) => {
  if (usage >= 90) return '#ff4d4f'
  if (usage >= 80) return '#fa8c16'
  if (usage >= 60) return '#fadb14'
  return '#52c41a'
}

/**
 * 获取内存颜色
 */
const getMemoryColor = (usage: number) => {
  if (usage >= 95) return '#ff4d4f'
  if (usage >= 85) return '#fa8c16'
  if (usage >= 70) return '#fadb14'
  return '#52c41a'
}

/**
 * 获取磁盘颜色
 */
const getDiskColor = (usage: number) => {
  if (usage >= 95) return '#ff4d4f'
  if (usage >= 85) return '#fa8c16'
  if (usage >= 70) return '#fadb14'
  return '#52c41a'
}

/**
 * 获取网络条形图高度
 */
const getNetworkBarHeight = (speed: number) => {
  const maxSpeed = 2097152 // 2MB/s
  const percentage = Math.min((speed / maxSpeed) * 100, 100)
  return `${percentage}%`
}

/**
 * 获取进程状态颜色
 */
const getProcessStatusColor = (status: string) => {
  const colors = {
    running: 'green',
    sleeping: 'blue',
    stopped: 'red',
    zombie: 'orange'
  }
  return colors[status] || 'default'
}

/**
 * 获取服务状态颜色
 */
const getServiceStatusColor = (status: string) => {
  const colors = {
    running: 'green',
    stopped: 'red',
    error: 'orange'
  }
  return colors[status] || 'default'
}

/**
 * 格式化字节数
 */
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化持续时间
 */
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString()
}

// 生命周期
onMounted(() => {
  console.log('系统监控页面已加载')
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.system-monitor {
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

.status-overview {
  margin-bottom: 24px;
}

.status-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.status-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.status-icon {
  flex-shrink: 0;
}

.cpu-icon,
.memory-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #fff;
}

.cpu-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.memory-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.disk-icon,
.network-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.disk-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.network-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.icon-text {
  font-size: 12px;
  font-weight: bold;
}

.status-info {
  flex: 1;
  min-width: 0;
}

.status-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.status-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.status-detail {
  font-size: 12px;
  color: #999;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-chart {
  flex-shrink: 0;
}

.network-indicator {
  display: flex;
  align-items: end;
  gap: 4px;
  height: 40px;
  width: 40px;
}

.upload-bar,
.download-bar {
  width: 16px;
  background: linear-gradient(to top, #1890ff, #40a9ff);
  border-radius: 2px;
  transition: height 0.3s ease;
}

.download-bar {
  background: linear-gradient(to top, #52c41a, #73d13d);
}

.chart-card,
.process-card,
.system-info-card,
.service-status-card,
.alert-log-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #999;
}

.chart-placeholder p {
  margin-top: 16px;
  font-size: 14px;
}

.process-name {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name-text {
  font-weight: 500;
}

.pid-text {
  font-size: 11px;
  color: #999;
}

.process-cpu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cpu-value {
  font-size: 12px;
  font-weight: 500;
}

.process-memory {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.memory-value {
  font-size: 12px;
  font-weight: 500;
}

.memory-percent {
  font-size: 11px;
  color: #999;
}

.system-info {
  padding: 8px 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  text-align: right;
  max-width: 60%;
  word-break: break-all;
}

.service-list {
  padding: 8px 0;
}

.service-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.service-item:last-child {
  border-bottom: none;
}

.service-info {
  flex: 1;
}

.service-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.service-description {
  font-size: 12px;
  color: #999;
}

.service-status {
  flex-shrink: 0;
}

.alert-list {
  max-height: 400px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.alert-item:hover {
  background: #f5f5f5;
}

.alert-critical {
  border-left: 4px solid #ff4d4f;
  background: #fff2f0;
}

.alert-warning {
  border-left: 4px solid #fa8c16;
  background: #fff7e6;
}

.alert-info {
  border-left: 4px solid #1890ff;
  background: #e6f7ff;
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-critical .alert-icon {
  color: #ff4d4f;
}

.alert-warning .alert-icon {
  color: #fa8c16;
}

.alert-info .alert-icon {
  color: #1890ff;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-message {
  font-size: 14px;
  margin-bottom: 4px;
}

.alert-time {
  font-size: 12px;
  color: #999;
}

.alert-actions {
  flex-shrink: 0;
}

.empty-alerts {
  padding: 40px 0;
  text-align: center;
}

.process-detail .ant-descriptions {
  margin-bottom: 16px;
}

.command-line {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  word-break: break-all;
  display: block;
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
  
  .status-content {
    gap: 12px;
  }
  
  .status-value {
    font-size: 20px;
  }
  
  .status-detail {
    font-size: 11px;
  }
  
  .chart-container {
    height: 200px;
  }
  
  .info-value {
    max-width: 50%;
    font-size: 12px;
  }
  
  .service-name {
    font-size: 13px;
  }
  
  .service-description {
    font-size: 11px;
  }
  
  .alert-message {
    font-size: 13px;
  }
}

/* 动画效果 */
.status-card {
  animation: fadeInUp 0.6s ease-out;
}

.status-card:nth-child(1) { animation-delay: 0.1s; }
.status-card:nth-child(2) { animation-delay: 0.2s; }
.status-card:nth-child(3) { animation-delay: 0.3s; }
.status-card:nth-child(4) { animation-delay: 0.4s; }

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

.upload-bar,
.download-bar {
  animation: barGrow 0.5s ease-out;
}

@keyframes barGrow {
  from {
    height: 0;
  }
  to {
    height: var(--target-height);
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .header-actions,
  .status-card,
  .chart-card,
  .process-card,
  .system-info-card,
  .service-status-card,
  .alert-log-card {
    background: #141414;
    border-color: #303030;
  }
  
  .status-title,
  .info-label,
  .service-description,
  .alert-time {
    color: #999;
  }
  
  .status-detail,
  .pid-text,
  .memory-percent {
    color: #666;
  }
  
  .chart-placeholder {
    color: #666;
  }
  
  .info-item,
  .service-item {
    border-bottom-color: #303030;
  }
  
  .alert-item:hover {
    background: #262626;
  }
  
  .alert-critical {
    background: #2a1215;
  }
  
  .alert-warning {
    background: #2b1d11;
  }
  
  .alert-info {
    background: #111b26;
  }
  
  .command-line {
    background: #262626;
    color: #fff;
  }
}
</style>