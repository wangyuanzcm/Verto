<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.key">
          <div class="stat-card" :class="`stat-${stat.type}`">
            <div class="stat-icon">
              <el-icon :size="32">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-change" :class="stat.changeType">
                <el-icon :size="12">
                  <component :is="stat.changeType === 'increase' ? 'ArrowUp' : 'ArrowDown'" />
                </el-icon>
                <span>{{ stat.change }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="main-content">
      <el-row :gutter="24">
        <!-- 左侧内容 -->
        <el-col :xs="24" :lg="16">
          <!-- 最近项目 -->
          <div class="content-card recent-projects">
            <div class="card-header">
              <h3>最近项目</h3>
              <el-button type="primary" size="small" @click="goToProjects">
                查看全部
              </el-button>
            </div>
            
            <div class="projects-grid">
              <div 
                v-for="project in recentProjects" 
                :key="project.id"
                class="project-card"
                @click="openProject(project)"
              >
                <div class="project-header">
                  <div class="project-avatar">
                    <el-avatar :size="40" :src="project.avatar">
                      {{ project.name.charAt(0) }}
                    </el-avatar>
                  </div>
                  <div class="project-info">
                    <h4 class="project-name">{{ project.name }}</h4>
                    <p class="project-desc">{{ project.description }}</p>
                  </div>
                  <div class="project-actions">
                    <el-dropdown trigger="click" @command="handleProjectAction">
                      <el-button type="text" :icon="'MoreFilled'" />
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item :command="{ action: 'edit', project }">
                            编辑项目
                          </el-dropdown-item>
                          <el-dropdown-item :command="{ action: 'duplicate', project }">
                            复制项目
                          </el-dropdown-item>
                          <el-dropdown-item :command="{ action: 'archive', project }" divided>
                            归档项目
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>
                
                <div class="project-meta">
                  <div class="project-status">
                    <el-tag :type="getStatusType(project.status)" size="small">
                      {{ getStatusText(project.status) }}
                    </el-tag>
                  </div>
                  <div class="project-progress">
                    <span class="progress-text">{{ project.progress }}%</span>
                    <el-progress 
                      :percentage="project.progress" 
                      :show-text="false" 
                      :stroke-width="4"
                      :color="getProgressColor(project.progress)"
                    />
                  </div>
                </div>
                
                <div class="project-footer">
                  <div class="project-team">
                    <el-avatar-group :max="3" :size="24">
                      <el-avatar 
                        v-for="member in project.team" 
                        :key="member.id"
                        :src="member.avatar"
                        :title="member.name"
                      >
                        {{ member.name.charAt(0) }}
                      </el-avatar>
                    </el-avatar-group>
                  </div>
                  <div class="project-time">
                    <el-icon :size="14"><Clock /></el-icon>
                    <span>{{ formatTime(project.updatedAt) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 创建新项目卡片 -->
              <div class="project-card create-card" @click="createProject">
                <div class="create-content">
                  <el-icon :size="48" color="#409eff">
                    <Plus />
                  </el-icon>
                  <h4>创建新项目</h4>
                  <p>开始您的新项目</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 活动时间线 -->
          <div class="content-card activity-timeline">
            <div class="card-header">
              <h3>最近活动</h3>
              <el-button type="text" size="small" @click="viewAllActivities">
                查看全部
              </el-button>
            </div>
            
            <el-timeline class="timeline">
              <el-timeline-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :timestamp="formatTime(activity.createdAt)"
                :type="getActivityType(activity.type)"
                :icon="getActivityIcon(activity.type)"
              >
                <div class="activity-content">
                  <div class="activity-header">
                    <span class="activity-user">{{ activity.user.name }}</span>
                    <span class="activity-action">{{ activity.action }}</span>
                    <span class="activity-target">{{ activity.target }}</span>
                  </div>
                  <div v-if="activity.description" class="activity-description">
                    {{ activity.description }}
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-col>
        
        <!-- 右侧边栏 -->
        <el-col :xs="24" :lg="8">
          <!-- 快速操作 -->
          <div class="content-card quick-actions">
            <div class="card-header">
              <h3>快速操作</h3>
            </div>
            
            <div class="actions-grid">
              <div 
                v-for="action in quickActions" 
                :key="action.key"
                class="action-item"
                @click="handleQuickAction(action)"
              >
                <div class="action-icon" :style="{ backgroundColor: action.color }">
                  <el-icon :size="20">
                    <component :is="action.icon" />
                  </el-icon>
                </div>
                <div class="action-content">
                  <h4>{{ action.title }}</h4>
                  <p>{{ action.description }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 通知中心 -->
          <div class="content-card notifications">
            <div class="card-header">
              <h3>通知中心</h3>
              <el-badge :value="unreadCount" :hidden="unreadCount === 0">
                <el-button type="text" size="small" @click="viewAllNotifications">
                  查看全部
                </el-button>
              </el-badge>
            </div>
            
            <div class="notifications-list">
              <div 
                v-for="notification in recentNotifications" 
                :key="notification.id"
                class="notification-item"
                :class="{ 'unread': !notification.read }"
                @click="markAsRead(notification)"
              >
                <div class="notification-icon">
                  <el-icon :size="16" :color="getNotificationColor(notification.type)">
                    <component :is="getNotificationIcon(notification.type)" />
                  </el-icon>
                </div>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-message">{{ notification.message }}</div>
                  <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
                </div>
                <div v-if="!notification.read" class="notification-dot"></div>
              </div>
              
              <div v-if="recentNotifications.length === 0" class="empty-notifications">
                <el-icon :size="32" color="#c0c4cc">
                  <Bell />
                </el-icon>
                <p>暂无新通知</p>
              </div>
            </div>
          </div>
          
          <!-- 系统状态 -->
          <div class="content-card system-status">
            <div class="card-header">
              <h3>系统状态</h3>
              <el-tag :type="systemStatus.type" size="small">
                {{ systemStatus.text }}
              </el-tag>
            </div>
            
            <div class="status-items">
              <div v-for="item in systemStatus.items" :key="item.key" class="status-item">
                <div class="status-label">{{ item.label }}</div>
                <div class="status-value">
                  <el-progress 
                    :percentage="item.value" 
                    :show-text="false" 
                    :stroke-width="6"
                    :color="getStatusColor(item.value)"
                  />
                  <span class="status-text">{{ item.value }}%</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

/**
 * 仪表盘主页面组件
 * 显示项目概览、统计信息、最近活动等
 */

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

// 统计数据
const stats = ref([
  {
    key: 'projects',
    label: '项目总数',
    value: '12',
    change: '8.2%',
    changeType: 'increase',
    icon: 'Folder',
    type: 'primary'
  },
  {
    key: 'prototypes',
    label: '原型数量',
    value: '48',
    change: '12.5%',
    changeType: 'increase',
    icon: 'Grid',
    type: 'success'
  },
  {
    key: 'components',
    label: '组件库',
    value: '156',
    change: '3.1%',
    changeType: 'increase',
    icon: 'Collection',
    type: 'warning'
  },
  {
    key: 'team',
    label: '团队成员',
    value: '8',
    change: '0%',
    changeType: 'stable',
    icon: 'User',
    type: 'info'
  }
])

// 最近项目
const recentProjects = ref([
  {
    id: '1',
    name: 'E-Commerce Platform',
    description: '电商平台原型设计',
    avatar: '',
    status: 'active',
    progress: 75,
    team: [
      { id: '1', name: '张三', avatar: '' },
      { id: '2', name: '李四', avatar: '' },
      { id: '3', name: '王五', avatar: '' }
    ],
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2小时前
  },
  {
    id: '2',
    name: 'Mobile Banking App',
    description: '移动银行应用设计',
    avatar: '',
    status: 'review',
    progress: 90,
    team: [
      { id: '4', name: '赵六', avatar: '' },
      { id: '5', name: '钱七', avatar: '' }
    ],
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5小时前
  },
  {
    id: '3',
    name: 'Admin Dashboard',
    description: '后台管理系统界面',
    avatar: '',
    status: 'planning',
    progress: 25,
    team: [
      { id: '6', name: '孙八', avatar: '' }
    ],
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1天前
  }
])

// 最近活动
const recentActivities = ref([
  {
    id: '1',
    type: 'create',
    user: { name: '张三' },
    action: '创建了原型',
    target: '用户登录页面',
    description: '添加了登录表单和验证逻辑',
    createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30分钟前
  },
  {
    id: '2',
    type: 'update',
    user: { name: '李四' },
    action: '更新了项目',
    target: 'E-Commerce Platform',
    description: '修改了产品详情页布局',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2小时前
  },
  {
    id: '3',
    type: 'comment',
    user: { name: '王五' },
    action: '评论了',
    target: '购物车组件',
    description: '建议优化购物车的交互体验',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4小时前
  },
  {
    id: '4',
    type: 'approve',
    user: { name: '赵六' },
    action: '审批通过了',
    target: 'Mobile Banking App',
    description: '设计稿已通过审核，可以进入开发阶段',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6小时前
  }
])

// 快速操作
const quickActions = ref([
  {
    key: 'create-project',
    title: '创建项目',
    description: '开始新的设计项目',
    icon: 'FolderAdd',
    color: '#409eff'
  },
  {
    key: 'create-prototype',
    title: '新建原型',
    description: '创建页面原型',
    icon: 'Grid',
    color: '#67c23a'
  },
  {
    key: 'import-design',
    title: '导入设计',
    description: '从其他工具导入',
    icon: 'Upload',
    color: '#e6a23c'
  },
  {
    key: 'team-invite',
    title: '邀请成员',
    description: '邀请团队协作',
    icon: 'UserFilled',
    color: '#f56c6c'
  }
])

// 通知数据
const recentNotifications = ref([
  {
    id: '1',
    type: 'info',
    title: '项目更新',
    message: 'E-Commerce Platform 有新的设计更新',
    read: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15分钟前
  },
  {
    id: '2',
    type: 'success',
    title: '审批通过',
    message: 'Mobile Banking App 设计稿已通过审核',
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1小时前
  },
  {
    id: '3',
    type: 'warning',
    title: '截止日期提醒',
    message: 'Admin Dashboard 项目将在3天后截止',
    read: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2小时前
  }
])

// 系统状态
const systemStatus = ref({
  type: 'success',
  text: '运行正常',
  items: [
    { key: 'cpu', label: 'CPU 使用率', value: 45 },
    { key: 'memory', label: '内存使用率', value: 68 },
    { key: 'storage', label: '存储使用率', value: 32 },
    { key: 'network', label: '网络状态', value: 95 }
  ]
})

// 计算未读通知数量
const unreadCount = computed(() => {
  return recentNotifications.value.filter(n => !n.read).length
})

/**
 * 获取项目状态类型
 */
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    active: 'success',
    review: 'warning',
    planning: 'info',
    completed: 'success',
    archived: 'info'
  }
  return statusMap[status] || 'info'
}

/**
 * 获取项目状态文本
 */
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '进行中',
    review: '审核中',
    planning: '规划中',
    completed: '已完成',
    archived: '已归档'
  }
  return statusMap[status] || '未知'
}

/**
 * 获取进度条颜色
 */
const getProgressColor = (progress: number) => {
  if (progress < 30) return '#f56c6c'
  if (progress < 70) return '#e6a23c'
  return '#67c23a'
}

/**
 * 获取活动类型
 */
const getActivityType = (type: string) => {
  const typeMap: Record<string, string> = {
    create: 'success',
    update: 'primary',
    delete: 'danger',
    comment: 'info',
    approve: 'success'
  }
  return typeMap[type] || 'info'
}

/**
 * 获取活动图标
 */
const getActivityIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    create: 'Plus',
    update: 'Edit',
    delete: 'Delete',
    comment: 'ChatDotRound',
    approve: 'Check'
  }
  return iconMap[type] || 'InfoFilled'
}

/**
 * 获取通知图标
 */
const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    info: 'InfoFilled',
    success: 'SuccessFilled',
    warning: 'WarningFilled',
    error: 'CircleCloseFilled'
  }
  return iconMap[type] || 'InfoFilled'
}

/**
 * 获取通知颜色
 */
const getNotificationColor = (type: string) => {
  const colorMap: Record<string, string> = {
    info: '#409eff',
    success: '#67c23a',
    warning: '#e6a23c',
    error: '#f56c6c'
  }
  return colorMap[type] || '#409eff'
}

/**
 * 获取状态颜色
 */
const getStatusColor = (value: number) => {
  if (value > 80) return '#f56c6c'
  if (value > 60) return '#e6a23c'
  return '#67c23a'
}

/**
 * 格式化时间
 */
const formatTime = (date: Date) => {
  return formatDistanceToNow(date, { 
    addSuffix: true, 
    locale: zhCN 
  })
}

/**
 * 打开项目
 */
const openProject = (project: any) => {
  router.push(`/projects/${project.id}`)
}

/**
 * 创建项目
 */
const createProject = () => {
  router.push('/projects/create')
}

/**
 * 跳转到项目列表
 */
const goToProjects = () => {
  router.push('/projects')
}

/**
 * 处理项目操作
 */
const handleProjectAction = (command: any) => {
  const { action, project } = command
  
  switch (action) {
    case 'edit':
      router.push(`/projects/${project.id}/edit`)
      break
    case 'duplicate':
      ElMessage.success('项目复制成功')
      break
    case 'archive':
      ElMessageBox.confirm(
        '确定要归档这个项目吗？',
        '确认归档',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        ElMessage.success('项目已归档')
      })
      break
  }
}

/**
 * 处理快速操作
 */
const handleQuickAction = (action: any) => {
  switch (action.key) {
    case 'create-project':
      createProject()
      break
    case 'create-prototype':
      router.push('/prototypes/create')
      break
    case 'import-design':
      router.push('/import')
      break
    case 'team-invite':
      router.push('/team/invite')
      break
  }
}

/**
 * 查看所有活动
 */
const viewAllActivities = () => {
  router.push('/activities')
}

/**
 * 查看所有通知
 */
const viewAllNotifications = () => {
  router.push('/notifications')
}

/**
 * 标记通知为已读
 */
const markAsRead = (notification: any) => {
  if (!notification.read) {
    notification.read = true
    // 这里应该调用API更新通知状态
  }
}

/**
 * 组件挂载时的初始化
 */
onMounted(() => {
  // 设置页面标题
  appStore.setPageTitle('仪表盘')
  
  // 加载数据
  loadDashboardData()
})

/**
 * 加载仪表盘数据
 */
const loadDashboardData = async () => {
  try {
    // 这里应该调用API加载实际数据
    // await Promise.all([
    //   loadStats(),
    //   loadRecentProjects(),
    //   loadRecentActivities(),
    //   loadNotifications(),
    //   loadSystemStatus()
    // ])
    
    console.log('仪表盘数据加载完成')
  } catch (error) {
    console.error('加载仪表盘数据失败:', error)
    ElMessage.error('加载数据失败')
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.dashboard-container {
  padding: $spacing-lg;
  background-color: $bg-color-page;
  min-height: calc(100vh - 60px);
}

.stats-section {
  margin-bottom: $spacing-xl;
}

.stat-card {
  background: $white;
  border-radius: $border-radius-base;
  padding: $spacing-lg;
  box-shadow: $box-shadow-light;
  border: 1px solid $border-color-lighter;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $box-shadow-base;
  }
  
  display: flex;
  align-items: center;
  gap: $spacing-md;
  
  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: $border-radius-base;
    @include flex-center;
    color: $white;
    
    .stat-primary & {
      background: linear-gradient(135deg, #409eff, #66b1ff);
    }
    
    .stat-success & {
      background: linear-gradient(135deg, #67c23a, #85ce61);
    }
    
    .stat-warning & {
      background: linear-gradient(135deg, #e6a23c, #ebb563);
    }
    
    .stat-info & {
      background: linear-gradient(135deg, #909399, #a6a9ad);
    }
  }
  
  .stat-content {
    flex: 1;
    
    .stat-value {
      font-size: $font-size-2xl;
      font-weight: $font-weight-bold;
      color: $text-color-primary;
      margin-bottom: $spacing-xs;
    }
    
    .stat-label {
      font-size: $font-size-small;
      color: $text-color-secondary;
      margin-bottom: $spacing-xs;
    }
    
    .stat-change {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      font-size: $font-size-small;
      
      &.increase {
        color: $success-color;
      }
      
      &.decrease {
        color: $danger-color;
      }
      
      &.stable {
        color: $text-color-secondary;
      }
    }
  }
}

.main-content {
  .content-card {
    background: $white;
    border-radius: $border-radius-base;
    padding: $spacing-lg;
    box-shadow: $box-shadow-light;
    border: 1px solid $border-color-lighter;
    margin-bottom: $spacing-lg;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-lg;
      padding-bottom: $spacing-md;
      border-bottom: 1px solid $border-color-lighter;
      
      h3 {
        margin: 0;
        font-size: $font-size-lg;
        font-weight: $font-weight-primary;
        color: $text-color-primary;
      }
    }
  }
}

// 项目网格
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $spacing-lg;
}

.project-card {
  border: 1px solid $border-color-lighter;
  border-radius: $border-radius-base;
  padding: $spacing-md;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: $primary-color;
    box-shadow: $box-shadow-base;
  }
  
  .project-header {
    display: flex;
    align-items: flex-start;
    gap: $spacing-md;
    margin-bottom: $spacing-md;
    
    .project-info {
      flex: 1;
      
      .project-name {
        margin: 0 0 $spacing-xs 0;
        font-size: $font-size-medium;
        font-weight: $font-weight-primary;
        color: $text-color-primary;
      }
      
      .project-desc {
        margin: 0;
        font-size: $font-size-small;
        color: $text-color-secondary;
        @include text-ellipsis;
      }
    }
    
    .project-actions {
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }
  
  &:hover .project-actions {
    opacity: 1;
  }
  
  .project-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;
    
    .project-progress {
      flex: 1;
      margin-left: $spacing-md;
      
      .progress-text {
        font-size: $font-size-small;
        color: $text-color-secondary;
        margin-bottom: $spacing-xs;
        display: block;
      }
    }
  }
  
  .project-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .project-time {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      font-size: $font-size-small;
      color: $text-color-placeholder;
    }
  }
}

.create-card {
  border: 2px dashed $border-color-base;
  background: $bg-color-page;
  
  &:hover {
    border-color: $primary-color;
    background: $white;
  }
  
  .create-content {
    @include flex-center;
    flex-direction: column;
    height: 200px;
    text-align: center;
    
    h4 {
      margin: $spacing-md 0 $spacing-xs 0;
      color: $text-color-primary;
    }
    
    p {
      margin: 0;
      color: $text-color-secondary;
      font-size: $font-size-small;
    }
  }
}

// 活动时间线
.activity-timeline {
  .timeline {
    margin-top: $spacing-md;
    
    .activity-content {
      .activity-header {
        margin-bottom: $spacing-xs;
        
        .activity-user {
          font-weight: $font-weight-primary;
          color: $primary-color;
        }
        
        .activity-action {
          margin: 0 $spacing-xs;
          color: $text-color-regular;
        }
        
        .activity-target {
          font-weight: $font-weight-primary;
          color: $text-color-primary;
        }
      }
      
      .activity-description {
        color: $text-color-secondary;
        font-size: $font-size-small;
        line-height: 1.5;
      }
    }
  }
}

// 快速操作
.actions-grid {
  display: grid;
  gap: $spacing-md;
}

.action-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  border: 1px solid $border-color-lighter;
  border-radius: $border-radius-base;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: $primary-color;
    background: $bg-color-page;
  }
  
  .action-icon {
    width: 40px;
    height: 40px;
    border-radius: $border-radius-base;
    @include flex-center;
    color: $white;
  }
  
  .action-content {
    flex: 1;
    
    h4 {
      margin: 0 0 $spacing-xs 0;
      font-size: $font-size-medium;
      color: $text-color-primary;
    }
    
    p {
      margin: 0;
      font-size: $font-size-small;
      color: $text-color-secondary;
    }
  }
}

// 通知列表
.notifications-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-md;
  padding: $spacing-md;
  border-radius: $border-radius-base;
  cursor: pointer;
  transition: background-color 0.3s ease;
  position: relative;
  
  &:hover {
    background: $bg-color-page;
  }
  
  &.unread {
    background: rgba(64, 158, 255, 0.05);
  }
  
  .notification-icon {
    margin-top: $spacing-xs;
  }
  
  .notification-content {
    flex: 1;
    
    .notification-title {
      font-weight: $font-weight-primary;
      color: $text-color-primary;
      margin-bottom: $spacing-xs;
    }
    
    .notification-message {
      color: $text-color-regular;
      font-size: $font-size-small;
      line-height: 1.5;
      margin-bottom: $spacing-xs;
    }
    
    .notification-time {
      color: $text-color-placeholder;
      font-size: $font-size-small;
    }
  }
  
  .notification-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $primary-color;
    position: absolute;
    top: $spacing-md;
    right: $spacing-md;
  }
}

.empty-notifications {
  @include flex-center;
  flex-direction: column;
  padding: $spacing-xl;
  color: $text-color-placeholder;
  
  p {
    margin: $spacing-md 0 0 0;
    font-size: $font-size-small;
  }
}

// 系统状态
.status-items {
  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .status-label {
      font-size: $font-size-small;
      color: $text-color-secondary;
      flex: 1;
    }
    
    .status-value {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      flex: 2;
      
      .status-text {
        font-size: $font-size-small;
        color: $text-color-regular;
        min-width: 40px;
        text-align: right;
      }
    }
  }
}

// 响应式设计
@include respond-below(lg) {
  .dashboard-container {
    padding: $spacing-md;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
}

@include respond-below(md) {
  .stat-card {
    flex-direction: column;
    text-align: center;
    
    .stat-icon {
      margin-bottom: $spacing-md;
    }
  }
  
  .project-card {
    .project-header {
      flex-direction: column;
      align-items: flex-start;
      
      .project-actions {
        opacity: 1;
        align-self: flex-end;
      }
    }
    
    .project-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-md;
      
      .project-progress {
        margin-left: 0;
        width: 100%;
      }
    }
  }
  
  .action-item {
    .action-content {
      h4 {
        font-size: $font-size-small;
      }
      
      p {
        font-size: $font-size-xs;
      }
    }
  }
}

// 暗色主题适配
@include dark-theme {
  .dashboard-container {
    background-color: $dark-bg-color;
  }
  
  .stat-card,
  .content-card {
    background: $dark-card-bg;
    border-color: $dark-border-color;
    
    .card-header {
      border-color: $dark-border-color;
      
      h3 {
        color: $dark-text-primary;
      }
    }
  }
  
  .project-card {
    border-color: $dark-border-color;
    
    &:hover {
      border-color: $primary-color;
    }
    
    .project-name {
      color: $dark-text-primary;
    }
    
    .project-desc {
      color: $dark-text-secondary;
    }
  }
  
  .create-card {
    background: $dark-bg-color;
    border-color: $dark-border-color;
    
    &:hover {
      background: $dark-card-bg;
    }
    
    h4 {
      color: $dark-text-primary;
    }
    
    p {
      color: $dark-text-secondary;
    }
  }
  
  .action-item {
    border-color: $dark-border-color;
    
    &:hover {
      background: $dark-bg-color;
    }
    
    h4 {
      color: $dark-text-primary;
    }
    
    p {
      color: $dark-text-secondary;
    }
  }
  
  .notification-item {
    &:hover {
      background: $dark-bg-color;
    }
    
    &.unread {
      background: rgba(64, 158, 255, 0.1);
    }
    
    .notification-title {
      color: $dark-text-primary;
    }
    
    .notification-message {
      color: $dark-text-regular;
    }
  }
}

// 动画效果
.stat-card,
.project-card,
.action-item {
  animation: fadeInUp 0.6s ease-out;
  
  @for $i from 1 through 12 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.1}s;
    }
  }
}

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

// 滚动条样式
.notifications-list {
  @include custom-scrollbar;
}
</style>