<template>
  <div class="team-overview">
    <!-- 统计卡片 -->
    <div class="stats-section">
      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <a-statistic
              title="团队成员"
              :value="stats.totalMembers"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <UserOutlined />
              </template>
              <template #suffix>
                <span class="stat-suffix">人</span>
              </template>
            </a-statistic>
            <div class="stat-trend">
              <span class="trend-text">较上月</span>
              <span class="trend-value positive">+{{ stats.memberGrowth }}</span>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <a-statistic
              title="活跃项目"
              :value="stats.activeProjects"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <ProjectOutlined />
              </template>
              <template #suffix>
                <span class="stat-suffix">个</span>
              </template>
            </a-statistic>
            <div class="stat-trend">
              <span class="trend-text">进行中</span>
              <span class="trend-value">{{ stats.ongoingProjects }}个</span>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <a-statistic
              title="本月任务"
              :value="stats.monthlyTasks"
              :value-style="{ color: '#fa8c16' }"
            >
              <template #prefix>
                <CheckSquareOutlined />
              </template>
              <template #suffix>
                <span class="stat-suffix">个</span>
              </template>
            </a-statistic>
            <div class="stat-trend">
              <span class="trend-text">完成率</span>
              <span class="trend-value">{{ stats.taskCompletionRate }}%</span>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <a-statistic
              title="团队效率"
              :value="stats.teamEfficiency"
              :value-style="{ color: '#722ed1' }"
              suffix="%"
            >
              <template #prefix>
                <TrophyOutlined />
              </template>
            </a-statistic>
            <div class="stat-trend">
              <span class="trend-text">较上周</span>
              <span class="trend-value positive">+{{ stats.efficiencyGrowth }}%</span>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
    
    <!-- 主要内容区域 -->
    <a-row :gutter="[24, 24]" class="main-content">
      <!-- 左侧内容 -->
      <a-col :xs="24" :lg="16">
        <!-- 团队活动 -->
        <a-card title="团队活动" class="activity-card">
          <template #extra>
            <a-space>
              <a-select v-model:value="activityFilter" style="width: 120px">
                <a-select-option value="all">全部</a-select-option>
                <a-select-option value="project">项目</a-select-option>
                <a-select-option value="member">成员</a-select-option>
                <a-select-option value="system">系统</a-select-option>
              </a-select>
              <a-button @click="refreshActivity" :loading="loadingActivity">
                <ReloadOutlined />
              </a-button>
            </a-space>
          </template>
          
          <div class="activity-timeline">
            <a-timeline>
              <a-timeline-item 
                v-for="activity in filteredActivities" 
                :key="activity.id"
                :color="getActivityColor(activity.type)"
              >
                <template #dot>
                  <component :is="getActivityIcon(activity.type)" class="activity-icon" />
                </template>
                
                <div class="activity-item">
                  <div class="activity-header">
                    <div class="activity-user">
                      <a-avatar :size="24" :src="activity.user.avatar">
                        {{ activity.user.name.charAt(0) }}
                      </a-avatar>
                      <span class="user-name">{{ activity.user.name }}</span>
                    </div>
                    <span class="activity-time">{{ formatTime(activity.time) }}</span>
                  </div>
                  
                  <div class="activity-content">
                    <span class="activity-action">{{ activity.action }}</span>
                    <a-tag v-if="activity.target" :color="getTargetColor(activity.type)" size="small">
                      {{ activity.target }}
                    </a-tag>
                  </div>
                  
                  <div v-if="activity.description" class="activity-description">
                    {{ activity.description }}
                  </div>
                </div>
              </a-timeline-item>
            </a-timeline>
            
            <div v-if="filteredActivities.length === 0" class="empty-activity">
              <a-empty description="暂无活动记录" />
            </div>
            
            <div v-if="hasMoreActivities" class="load-more">
              <a-button @click="loadMoreActivities" :loading="loadingMore" block>
                加载更多
              </a-button>
            </div>
          </div>
        </a-card>
        
        <!-- 项目进度 -->
        <a-card title="项目进度" class="project-progress-card">
          <template #extra>
            <a-button @click="viewAllProjects" type="link">
              查看全部
              <ArrowRightOutlined />
            </a-button>
          </template>
          
          <div class="project-list">
            <div v-for="project in recentProjects" :key="project.id" class="project-item">
              <div class="project-header">
                <div class="project-info">
                  <h4 class="project-name">{{ project.name }}</h4>
                  <a-tag :color="getStatusColor(project.status)" size="small">
                    {{ getStatusText(project.status) }}
                  </a-tag>
                </div>
                <div class="project-meta">
                  <span class="project-progress">{{ project.progress }}%</span>
                  <span class="project-deadline">{{ formatDate(project.deadline) }}</span>
                </div>
              </div>
              
              <div class="project-progress-bar">
                <a-progress 
                  :percent="project.progress" 
                  :stroke-color="getProgressColor(project.progress)"
                  :show-info="false"
                  size="small"
                />
              </div>
              
              <div class="project-team">
                <div class="team-members">
                  <a-avatar-group :max-count="4" size="small">
                    <a-avatar 
                      v-for="member in project.members" 
                      :key="member.id"
                      :src="member.avatar"
                      :title="member.name"
                    >
                      {{ member.name.charAt(0) }}
                    </a-avatar>
                  </a-avatar-group>
                </div>
                <div class="project-actions">
                  <a-button size="small" @click="viewProject(project.id)">
                    查看
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      
      <!-- 右侧内容 -->
      <a-col :xs="24" :lg="8">
        <!-- 团队成员 -->
        <a-card title="团队成员" class="members-card">
          <template #extra>
            <a-space>
              <a-button @click="inviteMember" type="primary" size="small">
                <UserAddOutlined />
                邀请
              </a-button>
              <a-button @click="viewAllMembers" type="link" size="small">
                查看全部
              </a-button>
            </a-space>
          </template>
          
          <div class="members-list">
            <div v-for="member in topMembers" :key="member.id" class="member-item">
              <div class="member-avatar">
                <a-badge :dot="member.online" :color="member.online ? 'green' : 'default'">
                  <a-avatar :src="member.avatar" :size="40">
                    {{ member.name.charAt(0) }}
                  </a-avatar>
                </a-badge>
              </div>
              
              <div class="member-info">
                <div class="member-name">{{ member.name }}</div>
                <div class="member-role">{{ member.role }}</div>
                <div class="member-status">
                  <span :class="['status-text', member.online ? 'online' : 'offline']">
                    {{ member.online ? '在线' : '离线' }}
                  </span>
                  <span v-if="!member.online" class="last-seen">
                    {{ formatTime(member.lastSeen) }}
                  </span>
                </div>
              </div>
              
              <div class="member-actions">
                <a-dropdown>
                  <template #overlay>
                    <a-menu @click="handleMemberAction">
                      <a-menu-item :key="`message-${member.id}`">
                        <MessageOutlined />
                        发送消息
                      </a-menu-item>
                      <a-menu-item :key="`profile-${member.id}`">
                        <UserOutlined />
                        查看资料
                      </a-menu-item>
                      <a-menu-item :key="`assign-${member.id}`">
                        <PlusOutlined />
                        分配任务
                      </a-menu-item>
                    </a-menu>
                  </template>
                  <a-button type="text" size="small">
                    <MoreOutlined />
                  </a-button>
                </a-dropdown>
              </div>
            </div>
          </div>
        </a-card>
        
        <!-- 部门分布 -->
        <a-card title="部门分布" class="department-card">
          <div class="department-chart">
            <div class="chart-container">
              <!-- 这里可以集成图表库，如 ECharts -->
              <div class="pie-chart-placeholder">
                <div class="chart-center">
                  <div class="total-number">{{ stats.totalMembers }}</div>
                  <div class="total-label">总人数</div>
                </div>
              </div>
            </div>
            
            <div class="department-legend">
              <div v-for="dept in departmentStats" :key="dept.id" class="legend-item">
                <div class="legend-color" :style="{ backgroundColor: dept.color }"></div>
                <div class="legend-info">
                  <div class="legend-name">{{ dept.name }}</div>
                  <div class="legend-count">{{ dept.count }}人 ({{ dept.percentage }}%)</div>
                </div>
              </div>
            </div>
          </div>
        </a-card>
        
        <!-- 快速操作 -->
        <a-card title="快速操作" class="quick-actions-card">
          <div class="quick-actions">
            <a-row :gutter="[12, 12]">
              <a-col :span="12">
                <a-button block @click="createProject" class="action-btn">
                  <PlusOutlined />
                  <span>新建项目</span>
                </a-button>
              </a-col>
              <a-col :span="12">
                <a-button block @click="inviteMember" class="action-btn">
                  <UserAddOutlined />
                  <span>邀请成员</span>
                </a-button>
              </a-col>
              <a-col :span="12">
                <a-button block @click="createRole" class="action-btn">
                  <SafetyCertificateOutlined />
                  <span>创建角色</span>
                </a-button>
              </a-col>
              <a-col :span="12">
                <a-button block @click="viewReports" class="action-btn">
                  <BarChartOutlined />
                  <span>查看报表</span>
                </a-button>
              </a-col>
              <a-col :span="12">
                <a-button block @click="teamSettings" class="action-btn">
                  <SettingOutlined />
                  <span>团队设置</span>
                </a-button>
              </a-col>
              <a-col :span="12">
                <a-button block @click="exportData" class="action-btn">
                  <ExportOutlined />
                  <span>导出数据</span>
                </a-button>
              </a-col>
            </a-row>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  TrophyOutlined,
  ReloadOutlined,
  ArrowRightOutlined,
  UserAddOutlined,
  MessageOutlined,
  PlusOutlined,
  MoreOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  SettingOutlined,
  ExportOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

// 扩展 dayjs
dayjs.extend(relativeTime)

// 路由
const router = useRouter()

// 响应式数据
const loadingActivity = ref(false)
const loadingMore = ref(false)
const hasMoreActivities = ref(true)
const activityFilter = ref('all')

// 统计数据
const stats = reactive({
  totalMembers: 24,
  memberGrowth: 3,
  activeProjects: 8,
  ongoingProjects: 5,
  monthlyTasks: 156,
  taskCompletionRate: 78,
  teamEfficiency: 85,
  efficiencyGrowth: 5
})

// 团队活动数据
const activities = ref([
  {
    id: '1',
    type: 'project',
    user: { id: '1', name: '张三', avatar: 'https://via.placeholder.com/32x32' },
    action: '创建了项目',
    target: 'Verto 2.0',
    description: '产品原型设计平台升级项目',
    time: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    type: 'member',
    user: { id: '2', name: '李四', avatar: 'https://via.placeholder.com/32x32' },
    action: '加入了团队',
    target: '前端开发组',
    time: '2024-01-20T14:20:00Z'
  },
  {
    id: '3',
    type: 'task',
    user: { id: '3', name: '王五', avatar: 'https://via.placeholder.com/32x32' },
    action: '完成了任务',
    target: '用户界面设计',
    description: '移动端登录页面设计完成',
    time: '2024-01-20T13:15:00Z'
  },
  {
    id: '4',
    type: 'system',
    user: { id: 'system', name: '系统', avatar: '' },
    action: '自动备份',
    target: '数据备份',
    description: '每日数据备份已完成',
    time: '2024-01-20T12:00:00Z'
  },
  {
    id: '5',
    type: 'project',
    user: { id: '4', name: '赵六', avatar: 'https://via.placeholder.com/32x32' },
    action: '更新了项目进度',
    target: '移动端App',
    description: '项目进度更新至 65%',
    time: '2024-01-20T11:45:00Z'
  }
])

// 最近项目数据
const recentProjects = ref([
  {
    id: '1',
    name: 'Verto 产品原型设计平台',
    status: 'in_progress',
    progress: 75,
    deadline: '2024-02-15T00:00:00Z',
    members: [
      { id: '1', name: '张三', avatar: 'https://via.placeholder.com/32x32' },
      { id: '2', name: '李四', avatar: 'https://via.placeholder.com/32x32' },
      { id: '3', name: '王五', avatar: 'https://via.placeholder.com/32x32' }
    ]
  },
  {
    id: '2',
    name: '移动端App开发',
    status: 'in_progress',
    progress: 45,
    deadline: '2024-03-01T00:00:00Z',
    members: [
      { id: '2', name: '李四', avatar: 'https://via.placeholder.com/32x32' },
      { id: '4', name: '赵六', avatar: 'https://via.placeholder.com/32x32' }
    ]
  },
  {
    id: '3',
    name: '管理后台系统',
    status: 'completed',
    progress: 100,
    deadline: '2024-01-30T00:00:00Z',
    members: [
      { id: '1', name: '张三', avatar: 'https://via.placeholder.com/32x32' },
      { id: '3', name: '王五', avatar: 'https://via.placeholder.com/32x32' }
    ]
  }
])

// 顶级成员数据
const topMembers = ref([
  {
    id: '1',
    name: '张三',
    role: '项目经理',
    avatar: 'https://via.placeholder.com/40x40',
    online: true,
    lastSeen: null
  },
  {
    id: '2',
    name: '李四',
    role: '前端开发',
    avatar: 'https://via.placeholder.com/40x40',
    online: true,
    lastSeen: null
  },
  {
    id: '3',
    name: '王五',
    role: 'UI设计师',
    avatar: 'https://via.placeholder.com/40x40',
    online: false,
    lastSeen: '2024-01-20T14:30:00Z'
  },
  {
    id: '4',
    name: '赵六',
    role: '后端开发',
    avatar: 'https://via.placeholder.com/40x40',
    online: false,
    lastSeen: '2024-01-20T12:15:00Z'
  },
  {
    id: '5',
    name: '钱七',
    role: '测试工程师',
    avatar: 'https://via.placeholder.com/40x40',
    online: true,
    lastSeen: null
  }
])

// 部门统计数据
const departmentStats = ref([
  { id: '1', name: '技术部', count: 12, percentage: 50, color: '#1890ff' },
  { id: '2', name: '产品部', count: 6, percentage: 25, color: '#52c41a' },
  { id: '3', name: '设计部', count: 4, percentage: 17, color: '#fa8c16' },
  { id: '4', name: '运营部', count: 2, percentage: 8, color: '#722ed1' }
])

// 计算属性
/**
 * 过滤后的活动列表
 */
const filteredActivities = computed(() => {
  if (activityFilter.value === 'all') {
    return activities.value
  }
  return activities.value.filter(activity => activity.type === activityFilter.value)
})

// 方法
/**
 * 获取活动图标
 */
const getActivityIcon = (type: string) => {
  const icons = {
    project: ProjectOutlined,
    member: UserOutlined,
    task: CheckSquareOutlined,
    system: SettingOutlined,
    edit: EditOutlined,
    delete: DeleteOutlined
  }
  return icons[type] || ClockCircleOutlined
}

/**
 * 获取活动颜色
 */
const getActivityColor = (type: string) => {
  const colors = {
    project: 'blue',
    member: 'green',
    task: 'orange',
    system: 'purple',
    edit: 'cyan',
    delete: 'red'
  }
  return colors[type] || 'gray'
}

/**
 * 获取目标颜色
 */
const getTargetColor = (type: string) => {
  const colors = {
    project: 'blue',
    member: 'green',
    task: 'orange',
    system: 'purple'
  }
  return colors[type] || 'default'
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colors = {
    pending: 'default',
    in_progress: 'processing',
    completed: 'success',
    cancelled: 'error',
    on_hold: 'warning'
  }
  return colors[status] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const texts = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
    on_hold: '暂停'
  }
  return texts[status] || status
}

/**
 * 获取进度条颜色
 */
const getProgressColor = (progress: number) => {
  if (progress >= 80) return '#52c41a'
  if (progress >= 60) return '#1890ff'
  if (progress >= 40) return '#fa8c16'
  return '#f5222d'
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
  return dayjs(date).format('MM-DD')
}

/**
 * 刷新活动
 */
const refreshActivity = async () => {
  loadingActivity.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('活动数据已刷新')
  } catch (error) {
    message.error('刷新失败')
  } finally {
    loadingActivity.value = false
  }
}

/**
 * 加载更多活动
 */
const loadMoreActivities = async () => {
  loadingMore.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 模拟加载更多数据
    hasMoreActivities.value = false
    message.success('已加载全部活动')
  } catch (error) {
    message.error('加载失败')
  } finally {
    loadingMore.value = false
  }
}

/**
 * 查看所有项目
 */
const viewAllProjects = () => {
  router.push('/projects')
}

/**
 * 查看项目详情
 */
const viewProject = (projectId: string) => {
  router.push(`/projects/${projectId}`)
}

/**
 * 邀请成员
 */
const inviteMember = () => {
  router.push('/team/members?action=invite')
}

/**
 * 查看所有成员
 */
const viewAllMembers = () => {
  router.push('/team/members')
}

/**
 * 处理成员操作
 */
const handleMemberAction = ({ key }: { key: string }) => {
  const [action, memberId] = key.split('-')
  
  switch (action) {
    case 'message':
      message.info(`发送消息给成员 ${memberId}`)
      break
    case 'profile':
      router.push(`/team/members/${memberId}`)
      break
    case 'assign':
      message.info(`分配任务给成员 ${memberId}`)
      break
  }
}

/**
 * 创建项目
 */
const createProject = () => {
  router.push('/projects/new')
}

/**
 * 创建角色
 */
const createRole = () => {
  router.push('/team/roles?action=create')
}

/**
 * 查看报表
 */
const viewReports = () => {
  router.push('/reports')
}

/**
 * 团队设置
 */
const teamSettings = () => {
  router.push('/team/settings')
}

/**
 * 导出数据
 */
const exportData = () => {
  message.success('导出功能开发中')
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.team-overview {
  padding: 0;
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

.stat-card :deep(.ant-statistic-title) {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-card :deep(.ant-statistic-content) {
  font-size: 28px;
  font-weight: 600;
}

.stat-suffix {
  font-size: 14px;
  color: #999;
  margin-left: 4px;
}

.stat-trend {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.trend-text {
  margin-right: 4px;
}

.trend-value {
  font-weight: 500;
}

.trend-value.positive {
  color: #52c41a;
}

.trend-value.negative {
  color: #f5222d;
}

.main-content {
  margin-top: 0;
}

.activity-card,
.project-progress-card,
.members-card,
.department-card,
.quick-actions-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.activity-timeline {
  max-height: 500px;
  overflow-y: auto;
}

.activity-item {
  margin-bottom: 8px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.activity-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-weight: 500;
  color: #262626;
}

.activity-time {
  font-size: 12px;
  color: #999;
}

.activity-content {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.activity-action {
  color: #666;
}

.activity-description {
  font-size: 12px;
  color: #999;
  margin-left: 32px;
}

.activity-icon {
  font-size: 12px;
}

.empty-activity {
  text-align: center;
  padding: 40px 0;
}

.load-more {
  margin-top: 16px;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-item {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.project-info {
  flex: 1;
}

.project-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: #262626;
}

.project-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.project-progress {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
}

.project-deadline {
  font-size: 12px;
  color: #666;
}

.project-progress-bar {
  margin-bottom: 12px;
}

.project-team {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-members {
  flex: 1;
}

.project-actions {
  margin-left: 12px;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.member-avatar {
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 2px;
}

.member-role {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.member-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.status-text.online {
  color: #52c41a;
}

.status-text.offline {
  color: #999;
}

.last-seen {
  color: #999;
}

.member-actions {
  flex-shrink: 0;
}

.department-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.pie-chart-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    #1890ff 0deg 180deg,
    #52c41a 180deg 270deg,
    #fa8c16 270deg 331deg,
    #722ed1 331deg 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.pie-chart-placeholder::before {
  content: '';
  position: absolute;
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
}

.chart-center {
  position: relative;
  z-index: 1;
  text-align: center;
}

.total-number {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  line-height: 1;
}

.total-label {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.department-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-info {
  flex: 1;
  min-width: 0;
}

.legend-name {
  font-size: 13px;
  color: #262626;
  margin-bottom: 2px;
}

.legend-count {
  font-size: 11px;
  color: #666;
}

.quick-actions {
  padding: 0;
}

.action-btn {
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid #f0f0f0;
  background: #fafafa;
  transition: all 0.3s ease;
}

.action-btn:hover {
  border-color: #1890ff;
  background: #e6f7ff;
  color: #1890ff;
}

.action-btn span {
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-section :deep(.ant-col) {
    margin-bottom: 16px;
  }
  
  .project-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .project-meta {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .team-overview {
    padding: 0;
  }
  
  .stats-section {
    margin-bottom: 16px;
  }
  
  .main-content {
    margin-top: 0;
  }
  
  .activity-card,
  .project-progress-card,
  .members-card,
  .department-card,
  .quick-actions-card {
    margin-bottom: 16px;
  }
  
  .activity-timeline {
    max-height: 400px;
  }
  
  .member-item {
    padding: 8px;
  }
  
  .action-btn {
    height: 50px;
  }
}

@media (max-width: 576px) {
  .stats-section :deep(.ant-col) {
    width: 100% !important;
  }
  
  .activity-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .activity-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .project-team {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .project-actions {
    margin-left: 0;
    align-self: flex-end;
  }
  
  .member-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .member-actions {
    align-self: flex-end;
  }
  
  .chart-container {
    height: 150px;
  }
  
  .pie-chart-placeholder {
    width: 100px;
    height: 100px;
  }
  
  .pie-chart-placeholder::before {
    width: 70px;
    height: 70px;
  }
  
  .total-number {
    font-size: 20px;
  }
}
</style>