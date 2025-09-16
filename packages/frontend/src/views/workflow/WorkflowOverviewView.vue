<template>
  <div class="workflow-overview">
    <!-- 统计卡片 -->
    <div class="stats-section">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card" :bordered="false">
            <div class="stat-content">
              <div class="stat-icon running">
                <PlayCircleOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.runningInstances }}</div>
                <div class="stat-label">运行中实例</div>
                <div class="stat-trend positive">
                  <ArrowUpOutlined />
                  +12%
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card" :bordered="false">
            <div class="stat-content">
              <div class="stat-icon pending">
                <ClockCircleOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.pendingTasks }}</div>
                <div class="stat-label">待处理任务</div>
                <div class="stat-trend negative">
                  <ArrowDownOutlined />
                  -5%
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card" :bordered="false">
            <div class="stat-content">
              <div class="stat-icon completed">
                <CheckCircleOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.completedToday }}</div>
                <div class="stat-label">今日完成</div>
                <div class="stat-trend positive">
                  <ArrowUpOutlined />
                  +8%
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card" :bordered="false">
            <div class="stat-content">
              <div class="stat-icon templates">
                <FileTextOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalTemplates }}</div>
                <div class="stat-label">流程模板</div>
                <div class="stat-trend positive">
                  <ArrowUpOutlined />
                  +3
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
    
    <!-- 主要内容区域 -->
    <a-row :gutter="[16, 16]" class="main-content">
      <!-- 左侧内容 -->
      <a-col :xs="24" :lg="16">
        <!-- 流程活动图表 -->
        <a-card title="流程活动趋势" class="chart-card" :bordered="false">
          <template #extra>
            <a-radio-group v-model:value="chartTimeRange" size="small">
              <a-radio-button value="7d">7天</a-radio-button>
              <a-radio-button value="30d">30天</a-radio-button>
              <a-radio-button value="90d">90天</a-radio-button>
            </a-radio-group>
          </template>
          
          <div class="chart-container">
            <div class="chart-placeholder">
              <BarChartOutlined class="chart-icon" />
              <p>流程活动趋势图</p>
              <p class="chart-desc">显示指定时间范围内的流程启动、完成和失败趋势</p>
            </div>
          </div>
        </a-card>
        
        <!-- 最近活动 -->
        <a-card title="最近活动" class="activity-card" :bordered="false">
          <template #extra>
            <a-button type="link" @click="viewAllActivities">
              查看全部
              <RightOutlined />
            </a-button>
          </template>
          
          <a-list
            :data-source="recentActivities"
            :loading="activitiesLoading"
          >
            <template #renderItem="{ item }">
              <a-list-item class="activity-item">
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :style="{ backgroundColor: getActivityColor(item.type) }">
                      <component :is="getActivityIcon(item.type)" />
                    </a-avatar>
                  </template>
                  
                  <template #title>
                    <div class="activity-title">
                      <span>{{ item.title }}</span>
                      <a-tag :color="getActivityTagColor(item.type)" size="small">
                        {{ getActivityTypeName(item.type) }}
                      </a-tag>
                    </div>
                  </template>
                  
                  <template #description>
                    <div class="activity-desc">
                      <span>{{ item.description }}</span>
                      <span class="activity-time">{{ formatTime(item.time) }}</span>
                    </div>
                  </template>
                </a-list-item-meta>
                
                <template #actions>
                  <a-button type="link" size="small" @click="viewActivity(item)">
                    查看
                  </a-button>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
      
      <!-- 右侧内容 -->
      <a-col :xs="24" :lg="8">
        <!-- 我的任务 -->
        <a-card title="我的任务" class="task-card" :bordered="false">
          <template #extra>
            <a-button type="link" @click="viewAllTasks">
              查看全部
              <RightOutlined />
            </a-button>
          </template>
          
          <div class="task-filter">
            <a-radio-group v-model:value="taskFilter" size="small">
              <a-radio-button value="all">全部</a-radio-button>
              <a-radio-button value="pending">待处理</a-radio-button>
              <a-radio-button value="urgent">紧急</a-radio-button>
            </a-radio-group>
          </div>
          
          <a-list
            :data-source="filteredTasks"
            :loading="tasksLoading"
            size="small"
          >
            <template #renderItem="{ item }">
              <a-list-item class="task-item" @click="handleTask(item)">
                <div class="task-content">
                  <div class="task-header">
                    <span class="task-title">{{ item.title }}</span>
                    <a-tag :color="getPriorityColor(item.priority)" size="small">
                      {{ getPriorityName(item.priority) }}
                    </a-tag>
                  </div>
                  
                  <div class="task-meta">
                    <span class="task-process">{{ item.processName }}</span>
                    <span class="task-time">{{ formatTime(item.createTime) }}</span>
                  </div>
                  
                  <div class="task-progress" v-if="item.deadline">
                    <a-progress
                      :percent="getTaskProgress(item)"
                      :status="getTaskProgressStatus(item)"
                      size="small"
                      :show-info="false"
                    />
                    <span class="deadline-text">
                      {{ getDeadlineText(item.deadline) }}
                    </span>
                  </div>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
        
        <!-- 流程模板 -->
        <a-card title="常用模板" class="template-card" :bordered="false">
          <template #extra>
            <a-button type="link" @click="viewAllTemplates">
              查看全部
              <RightOutlined />
            </a-button>
          </template>
          
          <div class="template-list">
            <div
              v-for="template in popularTemplates"
              :key="template.id"
              class="template-item"
              @click="startProcess(template)"
            >
              <div class="template-icon">
                <component :is="getTemplateIcon(template.category)" />
              </div>
              
              <div class="template-info">
                <div class="template-name">{{ template.name }}</div>
                <div class="template-desc">{{ template.description }}</div>
                <div class="template-stats">
                  <span class="usage-count">
                    <PlayCircleOutlined />
                    {{ template.usageCount }}次使用
                  </span>
                  <span class="avg-duration">
                    <ClockCircleOutlined />
                    平均{{ template.avgDuration }}小时
                  </span>
                </div>
              </div>
              
              <div class="template-action">
                <a-button type="primary" size="small">
                  启动
                </a-button>
              </div>
            </div>
          </div>
        </a-card>
        
        <!-- 系统状态 -->
        <a-card title="系统状态" class="status-card" :bordered="false">
          <div class="status-list">
            <div class="status-item">
              <div class="status-label">
                <DatabaseOutlined />
                数据库连接
              </div>
              <div class="status-value">
                <a-badge status="success" text="正常" />
              </div>
            </div>
            
            <div class="status-item">
              <div class="status-label">
                <CloudOutlined />
                消息队列
              </div>
              <div class="status-value">
                <a-badge status="success" text="正常" />
              </div>
            </div>
            
            <div class="status-item">
              <div class="status-label">
                <ApiOutlined />
                API服务
              </div>
              <div class="status-value">
                <a-badge status="warning" text="延迟" />
              </div>
            </div>
            
            <div class="status-item">
              <div class="status-label">
                <DesktopOutlined />
                流程引擎
              </div>
              <div class="status-value">
                <a-badge status="success" text="正常" />
              </div>
            </div>
          </div>
          
          <div class="status-summary">
            <a-alert
              message="系统运行正常"
              description="所有核心服务运行稳定，API响应时间略有延迟，正在优化中。"
              type="info"
              show-icon
              :closable="false"
            />
          </div>
        </a-card>
      </a-col>
    </a-row>
    
    <!-- 快速操作浮动按钮 -->
    <div class="quick-actions">
      <a-float-button-group trigger="click" type="primary">
        <template #icon>
          <PlusOutlined />
        </template>
        
        <a-float-button
          tooltip="新建流程模板"
          @click="createTemplate"
        >
          <template #icon>
            <FileAddOutlined />
          </template>
        </a-float-button>
        
        <a-float-button
          tooltip="启动流程实例"
          @click="startInstance"
        >
          <template #icon>
            <PlayCircleOutlined />
          </template>
        </a-float-button>
        
        <a-float-button
          tooltip="流程设计器"
          @click="openDesigner"
        >
          <template #icon>
            <EditOutlined />
          </template>
        </a-float-button>
      </a-float-button-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  PlayCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BarChartOutlined,
  RightOutlined,
  PlusOutlined,
  FileAddOutlined,
  EditOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ApiOutlined,
  DesktopOutlined,
  UserOutlined,
  TeamOutlined,
  ShoppingOutlined,
  FileProtectOutlined,
  ProjectOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

// 扩展dayjs
dayjs.extend(relativeTime)

// 路由
const router = useRouter()

// 响应式数据
const activitiesLoading = ref(false)
const tasksLoading = ref(false)
const chartTimeRange = ref('7d')
const taskFilter = ref('all')

// 统计数据
const stats = reactive({
  runningInstances: 24,
  pendingTasks: 8,
  completedToday: 15,
  totalTemplates: 12
})

// 最近活动
const recentActivities = ref([
  {
    id: '1',
    type: 'start',
    title: '请假申请流程已启动',
    description: '张三提交了年假申请，等待主管审批',
    time: new Date(Date.now() - 5 * 60 * 1000),
    userId: 'user1'
  },
  {
    id: '2',
    type: 'complete',
    title: '采购申请流程已完成',
    description: '办公用品采购申请已通过所有审批环节',
    time: new Date(Date.now() - 15 * 60 * 1000),
    userId: 'user2'
  },
  {
    id: '3',
    type: 'approve',
    title: '合同审批已通过',
    description: '李四审批通过了供应商合同',
    time: new Date(Date.now() - 30 * 60 * 1000),
    userId: 'user3'
  },
  {
    id: '4',
    type: 'reject',
    title: '项目立项申请被驳回',
    description: '新产品开发项目需要补充更多技术细节',
    time: new Date(Date.now() - 45 * 60 * 1000),
    userId: 'user4'
  },
  {
    id: '5',
    type: 'assign',
    title: '任务已分配',
    description: '财务审核任务已分配给王五',
    time: new Date(Date.now() - 60 * 60 * 1000),
    userId: 'user5'
  }
])

// 我的任务
const myTasks = ref([
  {
    id: '1',
    title: '审批张三的年假申请',
    processName: '请假申请流程',
    priority: 'medium',
    createTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 22 * 60 * 60 * 1000),
    status: 'pending'
  },
  {
    id: '2',
    title: '财务预算审核',
    processName: '预算申请流程',
    priority: 'high',
    createTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
    status: 'pending'
  },
  {
    id: '3',
    title: '供应商资质审查',
    processName: '供应商准入流程',
    priority: 'urgent',
    createTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
    status: 'pending'
  },
  {
    id: '4',
    title: '员工入职手续办理',
    processName: '员工入职流程',
    priority: 'low',
    createTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 16 * 60 * 60 * 1000),
    status: 'pending'
  }
])

// 常用模板
const popularTemplates = ref([
  {
    id: '1',
    name: '请假申请',
    description: '员工请假申请审批',
    category: 'hr',
    usageCount: 156,
    avgDuration: 4
  },
  {
    id: '2',
    name: '采购申请',
    description: '物品采购申请审批',
    category: 'finance',
    usageCount: 89,
    avgDuration: 12
  },
  {
    id: '3',
    name: '合同审批',
    description: '合同签署审批流程',
    category: 'business',
    usageCount: 67,
    avgDuration: 24
  },
  {
    id: '4',
    name: '项目立项',
    description: '新项目立项审批',
    category: 'project',
    usageCount: 34,
    avgDuration: 48
  }
])

// 计算属性
/**
 * 过滤后的任务列表
 */
const filteredTasks = computed(() => {
  if (taskFilter.value === 'all') {
    return myTasks.value
  } else if (taskFilter.value === 'pending') {
    return myTasks.value.filter(task => task.status === 'pending')
  } else if (taskFilter.value === 'urgent') {
    return myTasks.value.filter(task => task.priority === 'urgent')
  }
  return myTasks.value
})

// 方法
/**
 * 获取活动图标
 */
const getActivityIcon = (type: string) => {
  const icons = {
    start: PlayCircleOutlined,
    complete: CheckCircleOutlined,
    approve: CheckCircleOutlined,
    reject: CloseCircleOutlined,
    assign: UserOutlined
  }
  return icons[type] || PlayCircleOutlined
}

/**
 * 获取活动颜色
 */
const getActivityColor = (type: string) => {
  const colors = {
    start: '#1890ff',
    complete: '#52c41a',
    approve: '#52c41a',
    reject: '#ff4d4f',
    assign: '#722ed1'
  }
  return colors[type] || '#1890ff'
}

/**
 * 获取活动标签颜色
 */
const getActivityTagColor = (type: string) => {
  const colors = {
    start: 'blue',
    complete: 'green',
    approve: 'green',
    reject: 'red',
    assign: 'purple'
  }
  return colors[type] || 'blue'
}

/**
 * 获取活动类型名称
 */
const getActivityTypeName = (type: string) => {
  const names = {
    start: '启动',
    complete: '完成',
    approve: '通过',
    reject: '驳回',
    assign: '分配'
  }
  return names[type] || type
}

/**
 * 获取优先级颜色
 */
const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'default',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
  }
  return colors[priority] || 'default'
}

/**
 * 获取优先级名称
 */
const getPriorityName = (priority: string) => {
  const names = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return names[priority] || priority
}

/**
 * 获取模板图标
 */
const getTemplateIcon = (category: string) => {
  const icons = {
    hr: UserOutlined,
    finance: ShoppingOutlined,
    business: FileProtectOutlined,
    project: ProjectOutlined,
    approval: CheckCircleOutlined
  }
  return icons[category] || FileTextOutlined
}

/**
 * 获取任务进度
 */
const getTaskProgress = (task: any) => {
  const now = Date.now()
  const created = task.createTime.getTime()
  const deadline = task.deadline.getTime()
  const total = deadline - created
  const elapsed = now - created
  
  return Math.min(Math.max((elapsed / total) * 100, 0), 100)
}

/**
 * 获取任务进度状态
 */
const getTaskProgressStatus = (task: any) => {
  const progress = getTaskProgress(task)
  const now = Date.now()
  const deadline = task.deadline.getTime()
  
  if (now > deadline) {
    return 'exception'
  } else if (progress > 80) {
    return 'active'
  } else {
    return 'normal'
  }
}

/**
 * 获取截止时间文本
 */
const getDeadlineText = (deadline: Date) => {
  const now = dayjs()
  const deadlineDay = dayjs(deadline)
  const diff = deadlineDay.diff(now, 'hour')
  
  if (diff < 0) {
    return '已超期'
  } else if (diff < 1) {
    return '即将到期'
  } else if (diff < 24) {
    return `${diff}小时后到期`
  } else {
    const days = Math.floor(diff / 24)
    return `${days}天后到期`
  }
}

/**
 * 格式化时间
 */
const formatTime = (time: Date) => {
  return dayjs(time).fromNow()
}

/**
 * 查看活动详情
 */
const viewActivity = (activity: any) => {
  message.info(`查看活动: ${activity.title}`)
}

/**
 * 查看所有活动
 */
const viewAllActivities = () => {
  router.push('/workflow/logs')
}

/**
 * 处理任务
 */
const handleTask = (task: any) => {
  message.info(`处理任务: ${task.title}`)
  router.push(`/workflow/tasks/${task.id}`)
}

/**
 * 查看所有任务
 */
const viewAllTasks = () => {
  router.push('/workflow/tasks')
}

/**
 * 启动流程
 */
const startProcess = (template: any) => {
  message.success(`启动流程: ${template.name}`)
  router.push(`/workflow/instances/new?template=${template.id}`)
}

/**
 * 查看所有模板
 */
const viewAllTemplates = () => {
  router.push('/workflow/templates')
}

/**
 * 创建模板
 */
const createTemplate = () => {
  router.push('/workflow/designer')
}

/**
 * 启动实例
 */
const startInstance = () => {
  router.push('/workflow/instances/new')
}

/**
 * 打开设计器
 */
const openDesigner = () => {
  router.push('/workflow/designer')
}

/**
 * 加载数据
 */
const loadData = async () => {
  activitiesLoading.value = true
  tasksLoading.value = true
  
  try {
    // 模拟加载数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 这里可以调用实际的API
    // const [activitiesRes, tasksRes] = await Promise.all([
    //   getRecentActivities(),
    //   getMyTasks()
    // ])
    // recentActivities.value = activitiesRes.data
    // myTasks.value = tasksRes.data
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    activitiesLoading.value = false
    tasksLoading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.workflow-overview {
  padding: 0;
}

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  height: 120px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  margin-right: 16px;
}

.stat-icon.running {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #faad14, #ffc53d);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #52c41a, #73d13d);
}

.stat-icon.templates {
  background: linear-gradient(135deg, #722ed1, #9254de);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #262626;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-trend.positive {
  color: #52c41a;
}

.stat-trend.negative {
  color: #ff4d4f;
}

.main-content {
  margin-top: 0;
}

.chart-card {
  margin-bottom: 24px;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #8c8c8c;
}

.chart-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #d9d9d9;
}

.chart-desc {
  margin: 8px 0 0 0;
  font-size: 12px;
}

.activity-card {
  margin-bottom: 24px;
}

.activity-item {
  transition: background-color 0.3s ease;
}

.activity-item:hover {
  background-color: #fafafa;
}

.activity-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-desc {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-time {
  font-size: 12px;
  color: #8c8c8c;
}

.task-card {
  margin-bottom: 24px;
}

.task-filter {
  margin-bottom: 16px;
}

.task-item {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
  margin-bottom: 8px;
  padding: 12px;
  border: 1px solid transparent;
}

.task-item:hover {
  background-color: #fafafa;
  border-color: #d9d9d9;
}

.task-content {
  width: 100%;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-title {
  font-weight: 500;
  color: #262626;
  flex: 1;
  min-width: 0;
  margin-right: 8px;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.deadline-text {
  font-size: 11px;
  color: #8c8c8c;
  white-space: nowrap;
}

.template-card {
  margin-bottom: 24px;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-item:hover {
  border-color: #1890ff;
  background-color: #fafafa;
}

.template-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
  color: #1890ff;
}

.template-info {
  flex: 1;
  min-width: 0;
}

.template-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.template-desc {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 6px;
}

.template-stats {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #8c8c8c;
}

.usage-count,
.avg-duration {
  display: flex;
  align-items: center;
  gap: 2px;
}

.template-action {
  margin-left: 12px;
}

.status-card {
  margin-bottom: 24px;
}

.status-list {
  margin-bottom: 16px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #262626;
}

.status-value {
  font-size: 14px;
}

.status-summary {
  margin-top: 16px;
}

.quick-actions {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .workflow-overview {
    padding: 0;
  }
  
  .stats-section {
    margin-bottom: 16px;
  }
  
  .stat-card {
    height: 100px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
    margin-right: 12px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .chart-container {
    height: 200px;
  }
  
  .quick-actions {
    bottom: 16px;
    right: 16px;
  }
}

@media (max-width: 576px) {
  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .template-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .template-action {
    margin-left: 0;
    align-self: flex-end;
  }
  
  .status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
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

.stat-card,
.chart-card,
.activity-card,
.task-card,
.template-card,
.status-card {
  animation: fadeInUp 0.6s ease-out;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }
</style>