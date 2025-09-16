<template>
  <div class="system-overview">
    <!-- 系统状态卡片 -->
    <div class="status-cards">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :md="6">
          <a-card size="small" class="status-card">
            <a-statistic
              title="系统状态"
              :value="systemStatus.status"
              :value-style="{ color: getStatusColor(systemStatus.status) }"
            >
              <template #prefix>
                <component :is="getStatusIcon(systemStatus.status)" />
              </template>
            </a-statistic>
            <div class="card-footer">
              <span class="uptime">运行时间: {{ systemStatus.uptime }}</span>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card size="small" class="status-card">
            <a-statistic
              title="在线用户"
              :value="systemStatus.onlineUsers"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-statistic>
            <div class="card-footer">
              <span class="trend positive">+12% 较昨日</span>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card size="small" class="status-card">
            <a-statistic
              title="CPU使用率"
              :value="systemStatus.cpuUsage"
              suffix="%"
              :value-style="{ color: getCpuColor(systemStatus.cpuUsage) }"
            >
              <template #prefix>
                <DashboardOutlined />
              </template>
            </a-statistic>
            <div class="card-footer">
              <a-progress :percent="systemStatus.cpuUsage" size="small" :show-info="false" />
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card size="small" class="status-card">
            <a-statistic
              title="内存使用率"
              :value="systemStatus.memoryUsage"
              suffix="%"
              :value-style="{ color: getMemoryColor(systemStatus.memoryUsage) }"
            >
              <template #prefix>
                <DatabaseOutlined />
              </template>
            </a-statistic>
            <div class="card-footer">
              <a-progress :percent="systemStatus.memoryUsage" size="small" :show-info="false" />
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="overview-content">
      <a-row :gutter="[16, 16]">
        <!-- 左侧列 -->
        <a-col :xs="24" :lg="16">
          <!-- 性能监控图表 -->
          <a-card title="性能监控" class="chart-card">
            <template #extra>
              <a-space>
                <a-select v-model:value="chartTimeRange" size="small" style="width: 120px">
                  <a-select-option value="1h">最近1小时</a-select-option>
                  <a-select-option value="6h">最近6小时</a-select-option>
                  <a-select-option value="24h">最近24小时</a-select-option>
                  <a-select-option value="7d">最近7天</a-select-option>
                </a-select>
                <a-button size="small" @click="refreshCharts">
                  <ReloadOutlined />
                </a-button>
              </a-space>
            </template>
            
            <div class="performance-charts">
              <div class="chart-container">
                <h4>CPU & 内存使用率</h4>
                <div id="performance-chart" style="height: 300px;"></div>
              </div>
            </div>
          </a-card>
          
          <!-- 最近活动 -->
          <a-card title="最近活动" class="activity-card">
            <template #extra>
              <a @click="viewAllActivities">查看全部</a>
            </template>
            
            <a-list
              :data-source="recentActivities"
              :loading="activitiesLoading"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta>
                    <template #avatar>
                      <a-avatar :style="{ backgroundColor: getActivityColor(item.type) }">
                        <component :is="getActivityIcon(item.type)" />
                      </a-avatar>
                    </template>
                    <template #title>
                      <span>{{ item.title }}</span>
                      <a-tag :color="getActivityTagColor(item.type)" size="small" style="margin-left: 8px">
                        {{ getActivityTypeText(item.type) }}
                      </a-tag>
                    </template>
                    <template #description>
                      <div class="activity-description">
                        <span>{{ item.description }}</span>
                        <span class="activity-time">{{ formatTime(item.timestamp) }}</span>
                      </div>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </a-col>
        
        <!-- 右侧列 -->
        <a-col :xs="24" :lg="8">
          <!-- 系统信息 -->
          <a-card title="系统信息" class="info-card">
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="系统版本">
                <a-tag color="blue">{{ systemInfo.version }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="构建时间">
                {{ systemInfo.buildTime }}
              </a-descriptions-item>
              <a-descriptions-item label="数据库">
                <a-badge :status="systemInfo.database.status" :text="systemInfo.database.type" />
              </a-descriptions-item>
              <a-descriptions-item label="缓存">
                <a-badge :status="systemInfo.cache.status" :text="systemInfo.cache.type" />
              </a-descriptions-item>
              <a-descriptions-item label="存储">
                {{ systemInfo.storage.used }} / {{ systemInfo.storage.total }}
                <a-progress
                  :percent="systemInfo.storage.percentage"
                  size="small"
                  :show-info="false"
                  style="margin-top: 4px"
                />
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
          
          <!-- 快速操作 -->
          <a-card title="快速操作" class="quick-actions-card">
            <div class="quick-actions">
              <a-row :gutter="[8, 8]">
                <a-col :span="12">
                  <a-button block @click="navigateTo('/system/users')">
                    <UserOutlined />
                    用户管理
                  </a-button>
                </a-col>
                <a-col :span="12">
                  <a-button block @click="navigateTo('/system/config/basic')">
                    <SettingOutlined />
                    系统配置
                  </a-button>
                </a-col>
                <a-col :span="12">
                  <a-button block @click="navigateTo('/system/monitoring/logs')">
                    <FileTextOutlined />
                    查看日志
                  </a-button>
                </a-col>
                <a-col :span="12">
                  <a-button block @click="navigateTo('/system/maintenance/backup')">
                    <CloudDownloadOutlined />
                    数据备份
                  </a-button>
                </a-col>
                <a-col :span="12">
                  <a-button block @click="showSystemRestart">
                    <ReloadOutlined />
                    重启系统
                  </a-button>
                </a-col>
                <a-col :span="12">
                  <a-button block @click="showSystemMaintenance">
                    <ToolOutlined />
                    维护模式
                  </a-button>
                </a-col>
              </a-row>
            </div>
          </a-card>
          
          <!-- 告警信息 -->
          <a-card title="系统告警" class="alerts-card">
            <template #extra>
              <a-badge :count="alerts.length" :offset="[10, 0]">
                <BellOutlined />
              </a-badge>
            </template>
            
            <div v-if="alerts.length === 0" class="no-alerts">
              <a-empty description="暂无告警" :image="false" />
            </div>
            
            <div v-else class="alerts-list">
              <div
                v-for="alert in alerts.slice(0, 5)"
                :key="alert.id"
                class="alert-item"
                :class="`alert-${alert.level}`"
              >
                <div class="alert-icon">
                  <component :is="getAlertIcon(alert.level)" />
                </div>
                <div class="alert-content">
                  <div class="alert-title">{{ alert.title }}</div>
                  <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
                </div>
                <div class="alert-actions">
                  <a-button type="text" size="small" @click="dismissAlert(alert.id)">
                    <CloseOutlined />
                  </a-button>
                </div>
              </div>
              
              <div v-if="alerts.length > 5" class="more-alerts">
                <a @click="navigateTo('/system/monitoring/alerts')">查看全部 {{ alerts.length }} 条告警</a>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
    
    <!-- 系统重启确认模态框 -->
    <a-modal
      v-model:open="showRestartModal"
      title="系统重启确认"
      @ok="confirmSystemRestart"
      ok-text="确认重启"
      cancel-text="取消"
    >
      <div class="restart-warning">
        <a-alert
          message="警告"
          description="系统重启将中断所有用户会话，请确保在合适的时间进行此操作。"
          type="warning"
          show-icon
        />
        <div style="margin-top: 16px;">
          <a-checkbox v-model:checked="restartOptions.notifyUsers">
            提前通知在线用户
          </a-checkbox>
        </div>
        <div style="margin-top: 8px;">
          <a-checkbox v-model:checked="restartOptions.gracefulShutdown">
            优雅关闭（等待当前任务完成）
          </a-checkbox>
        </div>
      </div>
    </a-modal>
    
    <!-- 维护模式模态框 -->
    <a-modal
      v-model:open="showMaintenanceModal"
      title="维护模式设置"
      @ok="confirmMaintenanceMode"
      ok-text="启用维护模式"
      cancel-text="取消"
    >
      <div class="maintenance-settings">
        <a-form layout="vertical">
          <a-form-item label="维护原因">
            <a-textarea
              v-model:value="maintenanceOptions.reason"
              placeholder="请输入维护原因..."
              :rows="3"
            />
          </a-form-item>
          
          <a-form-item label="预计维护时长">
            <a-select v-model:value="maintenanceOptions.duration" style="width: 100%">
              <a-select-option value="30m">30分钟</a-select-option>
              <a-select-option value="1h">1小时</a-select-option>
              <a-select-option value="2h">2小时</a-select-option>
              <a-select-option value="4h">4小时</a-select-option>
              <a-select-option value="custom">自定义</a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item v-if="maintenanceOptions.duration === 'custom'" label="自定义时长">
            <a-input-number
              v-model:value="maintenanceOptions.customDuration"
              :min="1"
              :max="24"
              addon-after="小时"
              style="width: 100%"
            />
          </a-form-item>
          
          <a-form-item>
            <a-checkbox v-model:checked="maintenanceOptions.allowAdminAccess">
              允许管理员访问
            </a-checkbox>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  UserOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  ReloadOutlined,
  SettingOutlined,
  FileTextOutlined,
  CloudDownloadOutlined,
  ToolOutlined,
  BellOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 路由
const router = useRouter()

// 响应式数据
const chartTimeRange = ref('24h')
const activitiesLoading = ref(false)
const showRestartModal = ref(false)
const showMaintenanceModal = ref(false)

// 系统状态
const systemStatus = reactive({
  status: '正常',
  uptime: '15天 8小时 32分钟',
  onlineUsers: 156,
  cpuUsage: 45,
  memoryUsage: 68
})

// 系统信息
const systemInfo = reactive({
  version: 'v2.1.0',
  buildTime: '2024-01-15 14:30:00',
  database: {
    type: 'PostgreSQL 14.2',
    status: 'processing'
  },
  cache: {
    type: 'Redis 6.2',
    status: 'success'
  },
  storage: {
    used: '2.3 GB',
    total: '10 GB',
    percentage: 23
  }
})

// 重启选项
const restartOptions = reactive({
  notifyUsers: true,
  gracefulShutdown: true
})

// 维护模式选项
const maintenanceOptions = reactive({
  reason: '',
  duration: '1h',
  customDuration: 2,
  allowAdminAccess: true
})

// 最近活动
const recentActivities = ref([
  {
    id: '1',
    type: 'login',
    title: '用户登录',
    description: '张三 登录系统',
    timestamp: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    type: 'config',
    title: '配置更新',
    description: '邮件服务配置已更新',
    timestamp: '2024-01-15T09:45:00Z'
  },
  {
    id: '3',
    type: 'user',
    title: '用户创建',
    description: '新用户 李四 已创建',
    timestamp: '2024-01-15T09:15:00Z'
  },
  {
    id: '4',
    type: 'backup',
    title: '数据备份',
    description: '定时备份任务执行成功',
    timestamp: '2024-01-15T08:00:00Z'
  },
  {
    id: '5',
    type: 'error',
    title: '系统错误',
    description: 'API响应超时 (已恢复)',
    timestamp: '2024-01-15T07:30:00Z'
  }
])

// 告警信息
const alerts = ref([
  {
    id: '1',
    level: 'warning',
    title: 'CPU使用率较高',
    timestamp: '2024-01-15T10:45:00Z'
  },
  {
    id: '2',
    level: 'info',
    title: '定时备份完成',
    timestamp: '2024-01-15T08:00:00Z'
  }
])

// 定时器
let statusTimer: NodeJS.Timeout | null = null

// 方法
/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colors = {
    '正常': '#52c41a',
    '警告': '#faad14',
    '异常': '#ff4d4f'
  }
  return colors[status] || '#52c41a'
}

/**
 * 获取状态图标
 */
const getStatusIcon = (status: string) => {
  const icons = {
    '正常': CheckCircleOutlined,
    '警告': WarningOutlined,
    '异常': ExclamationCircleOutlined
  }
  return icons[status] || CheckCircleOutlined
}

/**
 * 获取CPU颜色
 */
const getCpuColor = (usage: number) => {
  if (usage < 50) return '#52c41a'
  if (usage < 80) return '#faad14'
  return '#ff4d4f'
}

/**
 * 获取内存颜色
 */
const getMemoryColor = (usage: number) => {
  if (usage < 60) return '#52c41a'
  if (usage < 85) return '#faad14'
  return '#ff4d4f'
}

/**
 * 获取活动颜色
 */
const getActivityColor = (type: string) => {
  const colors = {
    login: '#52c41a',
    logout: '#faad14',
    config: '#1890ff',
    user: '#722ed1',
    backup: '#13c2c2',
    error: '#ff4d4f'
  }
  return colors[type] || '#1890ff'
}

/**
 * 获取活动图标
 */
const getActivityIcon = (type: string) => {
  const icons = {
    login: LoginOutlined,
    logout: LogoutOutlined,
    config: SettingOutlined,
    user: UserOutlined,
    backup: CloudDownloadOutlined,
    error: ExclamationCircleOutlined
  }
  return icons[type] || InfoCircleOutlined
}

/**
 * 获取活动标签颜色
 */
const getActivityTagColor = (type: string) => {
  const colors = {
    login: 'green',
    logout: 'orange',
    config: 'blue',
    user: 'purple',
    backup: 'cyan',
    error: 'red'
  }
  return colors[type] || 'blue'
}

/**
 * 获取活动类型文本
 */
const getActivityTypeText = (type: string) => {
  const texts = {
    login: '登录',
    logout: '登出',
    config: '配置',
    user: '用户',
    backup: '备份',
    error: '错误'
  }
  return texts[type] || type
}

/**
 * 获取告警图标
 */
const getAlertIcon = (level: string) => {
  const icons = {
    info: InfoCircleOutlined,
    warning: WarningOutlined,
    error: ExclamationCircleOutlined
  }
  return icons[level] || InfoCircleOutlined
}

/**
 * 格式化时间
 */
const formatTime = (timestamp: string) => {
  return dayjs(timestamp).format('MM-DD HH:mm')
}

/**
 * 导航到指定路由
 */
const navigateTo = (path: string) => {
  router.push(path)
}

/**
 * 刷新图表
 */
const refreshCharts = () => {
  message.success('图表数据已刷新')
  // 这里可以重新加载图表数据
}

/**
 * 查看所有活动
 */
const viewAllActivities = () => {
  navigateTo('/system/monitoring/logs')
}

/**
 * 显示系统重启确认
 */
const showSystemRestart = () => {
  showRestartModal.value = true
}

/**
 * 确认系统重启
 */
const confirmSystemRestart = () => {
  Modal.confirm({
    title: '最终确认',
    content: '确定要立即重启系统吗？此操作不可撤销。',
    okText: '确认重启',
    cancelText: '取消',
    onOk: () => {
      message.success('系统重启指令已发送')
      showRestartModal.value = false
    }
  })
}

/**
 * 显示维护模式设置
 */
const showSystemMaintenance = () => {
  showMaintenanceModal.value = true
}

/**
 * 确认维护模式
 */
const confirmMaintenanceMode = () => {
  if (!maintenanceOptions.reason.trim()) {
    message.error('请输入维护原因')
    return
  }
  
  message.success('维护模式已启用')
  showMaintenanceModal.value = false
}

/**
 * 忽略告警
 */
const dismissAlert = (alertId: string) => {
  const index = alerts.value.findIndex(alert => alert.id === alertId)
  if (index > -1) {
    alerts.value.splice(index, 1)
    message.success('告警已忽略')
  }
}

/**
 * 更新系统状态
 */
const updateSystemStatus = () => {
  // 模拟实时数据更新
  systemStatus.cpuUsage = Math.floor(Math.random() * 20) + 40
  systemStatus.memoryUsage = Math.floor(Math.random() * 15) + 60
  systemStatus.onlineUsers = Math.floor(Math.random() * 50) + 130
}

/**
 * 初始化图表
 */
const initCharts = () => {
  // 这里可以初始化ECharts或其他图表库
  // 由于没有引入图表库，这里只是占位
  console.log('初始化性能监控图表')
}

// 生命周期
onMounted(() => {
  initCharts()
  
  // 启动定时更新
  statusTimer = setInterval(updateSystemStatus, 30000) // 30秒更新一次
})

onUnmounted(() => {
  if (statusTimer) {
    clearInterval(statusTimer)
  }
})
</script>

<style scoped>
.system-overview {
  padding: 0;
}

.status-cards {
  margin-bottom: 24px;
}

.status-card {
  height: 120px;
  transition: all 0.3s;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-footer {
  margin-top: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.trend {
  font-weight: 500;
}

.trend.positive {
  color: #52c41a;
}

.trend.negative {
  color: #ff4d4f;
}

.overview-content {
  margin-top: 24px;
}

.chart-card,
.activity-card,
.info-card,
.quick-actions-card,
.alerts-card {
  margin-bottom: 16px;
  transition: all 0.3s;
}

.chart-card:hover,
.activity-card:hover,
.info-card:hover,
.quick-actions-card:hover,
.alerts-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.performance-charts {
  padding: 16px 0;
}

.chart-container h4 {
  margin-bottom: 16px;
  color: #262626;
  font-size: 14px;
}

.activity-description {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-time {
  font-size: 12px;
  color: #8c8c8c;
}

.quick-actions {
  padding: 8px 0;
}

.quick-actions .ant-btn {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.no-alerts {
  text-align: center;
  padding: 20px 0;
}

.alerts-list {
  max-height: 300px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.2s;
}

.alert-item:hover {
  background: #f5f5f5;
}

.alert-item.alert-info {
  border-left: 4px solid #1890ff;
  background: #f0f9ff;
}

.alert-item.alert-warning {
  border-left: 4px solid #faad14;
  background: #fffbe6;
}

.alert-item.alert-error {
  border-left: 4px solid #ff4d4f;
  background: #fff2f0;
}

.alert-icon {
  font-size: 16px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.alert-time {
  font-size: 12px;
  color: #8c8c8c;
}

.alert-actions {
  display: flex;
  align-items: center;
}

.more-alerts {
  text-align: center;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}

.restart-warning {
  padding: 16px 0;
}

.maintenance-settings {
  padding: 16px 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .overview-content .ant-col {
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .status-cards .ant-col {
    margin-bottom: 16px;
  }
  
  .chart-card .ant-card-extra {
    margin-top: 8px;
  }
  
  .quick-actions .ant-col {
    margin-bottom: 8px;
  }
  
  .activity-description {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

/* 动画效果 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.status-card .ant-statistic-content {
  animation: pulse 2s infinite;
}

.alert-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .status-card,
  .chart-card,
  .activity-card,
  .info-card,
  .quick-actions-card,
  .alerts-card {
    background: #141414;
    border-color: #303030;
  }
  
  .alert-item:hover {
    background: #262626;
  }
  
  .alert-item.alert-info {
    background: #111b26;
  }
  
  .alert-item.alert-warning {
    background: #2b2611;
  }
  
  .alert-item.alert-error {
    background: #2a1215;
  }
}
</style>