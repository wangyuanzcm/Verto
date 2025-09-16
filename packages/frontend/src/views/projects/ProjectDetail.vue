<template>
  <div class="project-detail-container">
    <!-- 项目头部 -->
    <div class="project-header">
      <div class="header-content">
        <div class="header-left">
          <el-button 
            type="text" 
            :icon="'ArrowLeft'" 
            @click="goBack"
            class="back-button"
          >
            返回项目列表
          </el-button>
          
          <div class="project-info">
            <div class="project-avatar">
              <el-avatar :size="64" :src="project.avatar">
                {{ project.name?.charAt(0) }}
              </el-avatar>
            </div>
            
            <div class="project-details">
              <h1 class="project-name">{{ project.name }}</h1>
              <p class="project-description">{{ project.description }}</p>
              
              <div class="project-meta">
                <el-tag :type="getStatusType(project.status)" size="small">
                  {{ getStatusText(project.status) }}
                </el-tag>
                
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  更新于 {{ formatTime(project.updatedAt) }}
                </span>
                
                <span class="meta-item">
                  <el-icon><User /></el-icon>
                  {{ project.team?.length || 0 }} 名成员
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <div class="project-actions">
            <el-button :icon="'Share'" @click="shareProject">
              分享
            </el-button>
            
            <el-button :icon="'Star'" @click="toggleFavorite">
              {{ project.isFavorite ? '取消收藏' : '收藏' }}
            </el-button>
            
            <el-dropdown trigger="click" @command="handleProjectAction">
              <el-button type="primary">
                项目操作
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑项目</el-dropdown-item>
                  <el-dropdown-item command="duplicate">复制项目</el-dropdown-item>
                  <el-dropdown-item command="export">导出项目</el-dropdown-item>
                  <el-dropdown-item command="settings" divided>项目设置</el-dropdown-item>
                  <el-dropdown-item command="archive">归档项目</el-dropdown-item>
                  <el-dropdown-item command="delete">删除项目</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 项目统计 -->
    <div class="project-stats">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon :size="24" color="#409eff"><Grid /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ project.prototypes || 0 }}</div>
            <div class="stat-label">原型页面</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon :size="24" color="#67c23a"><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ project.requirements || 0 }}</div>
            <div class="stat-label">需求文档</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon :size="24" color="#e6a23c"><Box /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ project.components || 0 }}</div>
            <div class="stat-label">组件库</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon :size="24" color="#f56c6c"><ChatDotRound /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ project.comments || 0 }}</div>
            <div class="stat-label">评论反馈</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="project-content">
      <div class="content-layout">
        <!-- 左侧主要内容 -->
        <div class="main-content">
          <!-- 标签页导航 -->
          <el-tabs v-model="activeTab" class="project-tabs">
            <el-tab-pane label="原型设计" name="prototypes">
              <div class="tab-content">
                <!-- 原型列表 -->
                <div class="prototypes-section">
                  <div class="section-header">
                    <h3>原型页面</h3>
                    <el-button type="primary" :icon="'Plus'" @click="createPrototype">
                      新建原型
                    </el-button>
                  </div>
                  
                  <div class="prototypes-grid">
                    <div 
                      v-for="prototype in prototypes" 
                      :key="prototype.id"
                      class="prototype-card"
                      @click="openPrototype(prototype)"
                    >
                      <div class="prototype-preview">
                        <img 
                          v-if="prototype.thumbnail" 
                          :src="prototype.thumbnail" 
                          :alt="prototype.name"
                          class="prototype-image"
                        >
                        <div v-else class="prototype-placeholder">
                          <el-icon :size="32"><Document /></el-icon>
                        </div>
                      </div>
                      
                      <div class="prototype-info">
                        <h4 class="prototype-name">{{ prototype.name }}</h4>
                        <p class="prototype-description">{{ prototype.description }}</p>
                        
                        <div class="prototype-meta">
                          <span class="meta-item">
                            <el-icon><View /></el-icon>
                            {{ prototype.views || 0 }} 次查看
                          </span>
                          <span class="meta-item">
                            <el-icon><Clock /></el-icon>
                            {{ formatTime(prototype.updatedAt) }}
                          </span>
                        </div>
                      </div>
                      
                      <div class="prototype-actions">
                        <el-dropdown trigger="click" @command="(cmd) => handlePrototypeAction(cmd, prototype)">
                          <el-button type="text" :icon="'MoreFilled'" @click.stop />
                          <template #dropdown>
                            <el-dropdown-menu>
                              <el-dropdown-item command="edit">编辑原型</el-dropdown-item>
                              <el-dropdown-item command="duplicate">复制原型</el-dropdown-item>
                              <el-dropdown-item command="export">导出原型</el-dropdown-item>
                              <el-dropdown-item command="delete" divided>删除原型</el-dropdown-item>
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>
                      </div>
                    </div>
                    
                    <!-- 创建新原型卡片 -->
                    <div class="prototype-card create-card" @click="createPrototype">
                      <div class="create-content">
                        <el-icon :size="32" color="#409eff"><Plus /></el-icon>
                        <h4>创建新原型</h4>
                        <p>开始设计新的页面原型</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="需求管理" name="requirements">
              <div class="tab-content">
                <!-- 需求列表 -->
                <div class="requirements-section">
                  <div class="section-header">
                    <h3>需求文档</h3>
                    <el-button type="primary" :icon="'Plus'" @click="createRequirement">
                      新建需求
                    </el-button>
                  </div>
                  
                  <div class="requirements-list">
                    <div 
                      v-for="requirement in requirements" 
                      :key="requirement.id"
                      class="requirement-item"
                      @click="openRequirement(requirement)"
                    >
                      <div class="requirement-icon">
                        <el-icon :size="20" :color="getPriorityColor(requirement.priority)">
                          <Document />
                        </el-icon>
                      </div>
                      
                      <div class="requirement-content">
                        <h4 class="requirement-title">{{ requirement.title }}</h4>
                        <p class="requirement-description">{{ requirement.description }}</p>
                        
                        <div class="requirement-meta">
                          <el-tag :type="getPriorityType(requirement.priority)" size="small">
                            {{ getPriorityText(requirement.priority) }}
                          </el-tag>
                          
                          <el-tag :type="getRequirementStatusType(requirement.status)" size="small">
                            {{ getRequirementStatusText(requirement.status) }}
                          </el-tag>
                          
                          <span class="meta-item">
                            <el-icon><User /></el-icon>
                            {{ requirement.assignee?.name || '未分配' }}
                          </span>
                          
                          <span class="meta-item">
                            <el-icon><Clock /></el-icon>
                            {{ formatTime(requirement.updatedAt) }}
                          </span>
                        </div>
                      </div>
                      
                      <div class="requirement-actions">
                        <el-dropdown trigger="click" @command="(cmd) => handleRequirementAction(cmd, requirement)">
                          <el-button type="text" :icon="'MoreFilled'" @click.stop />
                          <template #dropdown>
                            <el-dropdown-menu>
                              <el-dropdown-item command="edit">编辑需求</el-dropdown-item>
                              <el-dropdown-item command="assign">分配需求</el-dropdown-item>
                              <el-dropdown-item command="link">关联原型</el-dropdown-item>
                              <el-dropdown-item command="delete" divided>删除需求</el-dropdown-item>
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="组件库" name="components">
              <div class="tab-content">
                <!-- 组件库 -->
                <div class="components-section">
                  <div class="section-header">
                    <h3>项目组件</h3>
                    <el-button type="primary" :icon="'Plus'" @click="createComponent">
                      新建组件
                    </el-button>
                  </div>
                  
                  <div class="components-grid">
                    <div 
                      v-for="component in components" 
                      :key="component.id"
                      class="component-card"
                      @click="openComponent(component)"
                    >
                      <div class="component-preview">
                        <img 
                          v-if="component.thumbnail" 
                          :src="component.thumbnail" 
                          :alt="component.name"
                          class="component-image"
                        >
                        <div v-else class="component-placeholder">
                          <el-icon :size="24"><Box /></el-icon>
                        </div>
                      </div>
                      
                      <div class="component-info">
                        <h4 class="component-name">{{ component.name }}</h4>
                        <p class="component-description">{{ component.description }}</p>
                        
                        <div class="component-meta">
                          <el-tag size="small">{{ component.category }}</el-tag>
                          <span class="meta-item">
                            <el-icon><Download /></el-icon>
                            {{ component.usage || 0 }} 次使用
                          </span>
                        </div>
                      </div>
                      
                      <div class="component-actions">
                        <el-dropdown trigger="click" @command="(cmd) => handleComponentAction(cmd, component)">
                          <el-button type="text" :icon="'MoreFilled'" @click.stop />
                          <template #dropdown>
                            <el-dropdown-menu>
                              <el-dropdown-item command="edit">编辑组件</el-dropdown-item>
                              <el-dropdown-item command="duplicate">复制组件</el-dropdown-item>
                              <el-dropdown-item command="export">导出组件</el-dropdown-item>
                              <el-dropdown-item command="delete" divided>删除组件</el-dropdown-item>
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="项目活动" name="activity">
              <div class="tab-content">
                <!-- 活动时间线 -->
                <div class="activity-section">
                  <h3>项目动态</h3>
                  
                  <el-timeline class="activity-timeline">
                    <el-timeline-item 
                      v-for="activity in activities" 
                      :key="activity.id"
                      :timestamp="formatTime(activity.createdAt)"
                      :type="getActivityType(activity.type)"
                    >
                      <div class="activity-content">
                        <div class="activity-header">
                          <el-avatar :size="24" :src="activity.user.avatar">
                            {{ activity.user.name.charAt(0) }}
                          </el-avatar>
                          <span class="activity-user">{{ activity.user.name }}</span>
                          <span class="activity-action">{{ activity.action }}</span>
                        </div>
                        
                        <div class="activity-description">
                          {{ activity.description }}
                        </div>
                        
                        <div v-if="activity.target" class="activity-target">
                          <el-link :href="activity.target.url" type="primary">
                            {{ activity.target.name }}
                          </el-link>
                        </div>
                      </div>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        
        <!-- 右侧边栏 -->
        <div class="sidebar">
          <!-- 项目进度 -->
          <div class="sidebar-card">
            <h4>项目进度</h4>
            <div class="progress-info">
              <div class="progress-circle">
                <el-progress 
                  type="circle" 
                  :percentage="project.progress || 0" 
                  :width="80"
                  :color="getProgressColor(project.progress || 0)"
                />
              </div>
              <div class="progress-details">
                <div class="progress-item">
                  <span class="label">已完成任务</span>
                  <span class="value">{{ project.completedTasks || 0 }}</span>
                </div>
                <div class="progress-item">
                  <span class="label">总任务数</span>
                  <span class="value">{{ project.totalTasks || 0 }}</span>
                </div>
                <div class="progress-item">
                  <span class="label">预计完成</span>
                  <span class="value">{{ formatDate(project.dueDate) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 团队成员 -->
          <div class="sidebar-card">
            <div class="card-header">
              <h4>团队成员</h4>
              <el-button type="text" :icon="'Plus'" @click="inviteMembers">
                邀请
              </el-button>
            </div>
            
            <div class="team-list">
              <div 
                v-for="member in project.team" 
                :key="member.id"
                class="team-member"
              >
                <el-avatar :size="32" :src="member.avatar">
                  {{ member.name.charAt(0) }}
                </el-avatar>
                
                <div class="member-info">
                  <div class="member-name">{{ member.name }}</div>
                  <div class="member-role">{{ member.role }}</div>
                </div>
                
                <div class="member-status">
                  <el-badge 
                    :is-dot="true" 
                    :type="member.isOnline ? 'success' : 'info'"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- 最近文件 -->
          <div class="sidebar-card">
            <h4>最近文件</h4>
            
            <div class="recent-files">
              <div 
                v-for="file in recentFiles" 
                :key="file.id"
                class="file-item"
                @click="openFile(file)"
              >
                <div class="file-icon">
                  <el-icon :size="16" :color="getFileTypeColor(file.type)">
                    <component :is="getFileTypeIcon(file.type)" />
                  </el-icon>
                </div>
                
                <div class="file-info">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-meta">{{ formatTime(file.updatedAt) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

/**
 * 项目详情页面组件
 * 展示项目的详细信息、原型、需求、组件等内容
 */

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// 当前激活的标签页
const activeTab = ref('prototypes')

// 项目数据
const project = ref({
  id: route.params.id,
  name: 'E-Commerce Platform',
  description: '电商平台原型设计，包含用户购物流程、商品管理、订单处理等核心功能',
  avatar: '',
  status: 'active',
  progress: 75,
  prototypes: 12,
  requirements: 8,
  components: 15,
  comments: 23,
  completedTasks: 18,
  totalTasks: 24,
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
  isFavorite: false,
  team: [
    { 
      id: '1', 
      name: '张三', 
      avatar: '', 
      role: '项目经理',
      isOnline: true
    },
    { 
      id: '2', 
      name: '李四', 
      avatar: '', 
      role: 'UI设计师',
      isOnline: true
    },
    { 
      id: '3', 
      name: '王五', 
      avatar: '', 
      role: '前端开发',
      isOnline: false
    }
  ],
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
})

// 原型数据
const prototypes = ref([
  {
    id: '1',
    name: '首页设计',
    description: '电商平台首页布局和交互设计',
    thumbnail: '',
    views: 156,
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    name: '商品列表页',
    description: '商品展示和筛选功能设计',
    thumbnail: '',
    views: 89,
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: '购物车页面',
    description: '购物车管理和结算流程',
    thumbnail: '',
    views: 67,
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
])

// 需求数据
const requirements = ref([
  {
    id: '1',
    title: '用户注册登录功能',
    description: '实现用户注册、登录、找回密码等基础功能',
    priority: 'high',
    status: 'in_progress',
    assignee: { id: '1', name: '张三' },
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: '商品搜索和筛选',
    description: '支持关键词搜索、分类筛选、价格排序等功能',
    priority: 'medium',
    status: 'pending',
    assignee: { id: '2', name: '李四' },
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
  },
  {
    id: '3',
    title: '订单管理系统',
    description: '订单创建、支付、发货、退款等完整流程',
    priority: 'high',
    status: 'completed',
    assignee: { id: '3', name: '王五' },
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
])

// 组件数据
const components = ref([
  {
    id: '1',
    name: '商品卡片',
    description: '展示商品信息的卡片组件',
    category: '展示组件',
    thumbnail: '',
    usage: 25
  },
  {
    id: '2',
    name: '购买按钮',
    description: '商品购买操作按钮',
    category: '交互组件',
    thumbnail: '',
    usage: 18
  },
  {
    id: '3',
    name: '评价组件',
    description: '商品评价展示和提交',
    category: '表单组件',
    thumbnail: '',
    usage: 12
  }
])

// 活动数据
const activities = ref([
  {
    id: '1',
    type: 'prototype',
    action: '创建了原型',
    description: '新建了首页设计原型',
    user: { id: '1', name: '张三', avatar: '' },
    target: { name: '首页设计', url: '/prototypes/1' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    type: 'requirement',
    action: '更新了需求',
    description: '完成了用户注册登录功能需求',
    user: { id: '2', name: '李四', avatar: '' },
    target: { name: '用户注册登录功能', url: '/requirements/1' },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
  },
  {
    id: '3',
    type: 'comment',
    action: '添加了评论',
    description: '对商品列表页原型提出了修改建议',
    user: { id: '3', name: '王五', avatar: '' },
    target: { name: '商品列表页', url: '/prototypes/2' },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
])

// 最近文件
const recentFiles = ref([
  {
    id: '1',
    name: '首页设计稿.sketch',
    type: 'sketch',
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: '2',
    name: '需求文档.docx',
    type: 'document',
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: '原型截图.png',
    type: 'image',
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
  }
])

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
 * 获取优先级颜色
 */
const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    high: '#f56c6c',
    medium: '#e6a23c',
    low: '#909399'
  }
  return colorMap[priority] || '#909399'
}

/**
 * 获取优先级类型
 */
const getPriorityType = (priority: string) => {
  const typeMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[priority] || 'info'
}

/**
 * 获取优先级文本
 */
const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return textMap[priority] || '未知'
}

/**
 * 获取需求状态类型
 */
const getRequirementStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

/**
 * 获取需求状态文本
 */
const getRequirementStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || '未知'
}

/**
 * 获取活动类型
 */
const getActivityType = (type: string) => {
  const typeMap: Record<string, string> = {
    prototype: 'primary',
    requirement: 'success',
    comment: 'warning',
    file: 'info'
  }
  return typeMap[type] || 'info'
}

/**
 * 获取文件类型图标
 */
const getFileTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    sketch: 'Document',
    document: 'Document',
    image: 'Picture',
    pdf: 'Document'
  }
  return iconMap[type] || 'Document'
}

/**
 * 获取文件类型颜色
 */
const getFileTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    sketch: '#ff6b35',
    document: '#409eff',
    image: '#67c23a',
    pdf: '#f56c6c'
  }
  return colorMap[type] || '#909399'
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
 * 格式化日期
 */
const formatDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd', { locale: zhCN })
}

/**
 * 返回项目列表
 */
const goBack = () => {
  router.push('/projects')
}

/**
 * 分享项目
 */
const shareProject = () => {
  // 这里应该实现分享功能
  ElMessage.success('分享链接已复制到剪贴板')
}

/**
 * 切换收藏状态
 */
const toggleFavorite = () => {
  project.value.isFavorite = !project.value.isFavorite
  ElMessage.success(project.value.isFavorite ? '已添加到收藏' : '已取消收藏')
}

/**
 * 处理项目操作
 */
const handleProjectAction = async (command: string) => {
  switch (command) {
    case 'edit':
      router.push(`/projects/${project.value.id}/edit`)
      break
      
    case 'duplicate':
      try {
        // 这里应该调用复制项目的API
        ElMessage.success('项目复制成功')
      } catch (error) {
        ElMessage.error('项目复制失败')
      }
      break
      
    case 'export':
      try {
        // 这里应该调用导出项目的API
        ElMessage.success('项目导出中...')
      } catch (error) {
        ElMessage.error('项目导出失败')
      }
      break
      
    case 'settings':
      router.push(`/projects/${project.value.id}/settings`)
      break
      
    case 'archive':
      try {
        await ElMessageBox.confirm(
          '确定要归档这个项目吗？',
          '确认归档',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 这里应该调用归档项目的API
        project.value.status = 'archived'
        ElMessage.success('项目已归档')
        
      } catch (error) {
        // 用户取消操作
      }
      break
      
    case 'delete':
      try {
        await ElMessageBox.confirm(
          '确定要删除这个项目吗？此操作不可撤销。',
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
          }
        )
        
        // 这里应该调用删除项目的API
        ElMessage.success('项目已删除')
        router.push('/projects')
        
      } catch (error) {
        // 用户取消操作
      }
      break
  }
}

/**
 * 创建原型
 */
const createPrototype = () => {
  router.push(`/projects/${project.value.id}/prototypes/create`)
}

/**
 * 打开原型
 */
const openPrototype = (prototype: any) => {
  router.push(`/projects/${project.value.id}/prototypes/${prototype.id}`)
}

/**
 * 处理原型操作
 */
const handlePrototypeAction = async (command: string, prototype: any) => {
  switch (command) {
    case 'edit':
      router.push(`/projects/${project.value.id}/prototypes/${prototype.id}/edit`)
      break
      
    case 'duplicate':
      try {
        // 这里应该调用复制原型的API
        ElMessage.success('原型复制成功')
      } catch (error) {
        ElMessage.error('原型复制失败')
      }
      break
      
    case 'export':
      try {
        // 这里应该调用导出原型的API
        ElMessage.success('原型导出中...')
      } catch (error) {
        ElMessage.error('原型导出失败')
      }
      break
      
    case 'delete':
      try {
        await ElMessageBox.confirm(
          '确定要删除这个原型吗？',
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
          }
        )
        
        // 这里应该调用删除原型的API
        const index = prototypes.value.findIndex(p => p.id === prototype.id)
        if (index > -1) {
          prototypes.value.splice(index, 1)
        }
        ElMessage.success('原型已删除')
        
      } catch (error) {
        // 用户取消操作
      }
      break
  }
}

/**
 * 创建需求
 */
const createRequirement = () => {
  router.push(`/projects/${project.value.id}/requirements/create`)
}

/**
 * 打开需求
 */
const openRequirement = (requirement: any) => {
  router.push(`/projects/${project.value.id}/requirements/${requirement.id}`)
}

/**
 * 处理需求操作
 */
const handleRequirementAction = async (command: string, requirement: any) => {
  switch (command) {
    case 'edit':
      router.push(`/projects/${project.value.id}/requirements/${requirement.id}/edit`)
      break
      
    case 'assign':
      // 这里应该打开分配对话框
      ElMessage.info('分配功能开发中...')
      break
      
    case 'link':
      // 这里应该打开关联原型对话框
      ElMessage.info('关联功能开发中...')
      break
      
    case 'delete':
      try {
        await ElMessageBox.confirm(
          '确定要删除这个需求吗？',
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
          }
        )
        
        // 这里应该调用删除需求的API
        const index = requirements.value.findIndex(r => r.id === requirement.id)
        if (index > -1) {
          requirements.value.splice(index, 1)
        }
        ElMessage.success('需求已删除')
        
      } catch (error) {
        // 用户取消操作
      }
      break
  }
}

/**
 * 创建组件
 */
const createComponent = () => {
  router.push(`/projects/${project.value.id}/components/create`)
}

/**
 * 打开组件
 */
const openComponent = (component: any) => {
  router.push(`/projects/${project.value.id}/components/${component.id}`)
}

/**
 * 处理组件操作
 */
const handleComponentAction = async (command: string, component: any) => {
  switch (command) {
    case 'edit':
      router.push(`/projects/${project.value.id}/components/${component.id}/edit`)
      break
      
    case 'duplicate':
      try {
        // 这里应该调用复制组件的API
        ElMessage.success('组件复制成功')
      } catch (error) {
        ElMessage.error('组件复制失败')
      }
      break
      
    case 'export':
      try {
        // 这里应该调用导出组件的API
        ElMessage.success('组件导出中...')
      } catch (error) {
        ElMessage.error('组件导出失败')
      }
      break
      
    case 'delete':
      try {
        await ElMessageBox.confirm(
          '确定要删除这个组件吗？',
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
          }
        )
        
        // 这里应该调用删除组件的API
        const index = components.value.findIndex(c => c.id === component.id)
        if (index > -1) {
          components.value.splice(index, 1)
        }
        ElMessage.success('组件已删除')
        
      } catch (error) {
        // 用户取消操作
      }
      break
  }
}

/**
 * 邀请成员
 */
const inviteMembers = () => {
  // 这里应该打开邀请成员对话框
  ElMessage.info('邀请功能开发中...')
}

/**
 * 打开文件
 */
const openFile = (file: any) => {
  // 这里应该打开文件预览或下载
  ElMessage.info(`打开文件: ${file.name}`)
}

/**
 * 加载项目数据
 */
const loadProjectData = async () => {
  try {
    // 这里应该调用API加载项目详细数据
    console.log('加载项目数据:', project.value.id)
    
  } catch (error) {
    console.error('加载项目数据失败:', error)
    ElMessage.error('加载项目数据失败')
  }
}

/**
 * 组件挂载时的初始化
 */
onMounted(() => {
  // 设置页面标题
  appStore.setPageTitle(`项目详情 - ${project.value.name}`)
  
  // 加载项目数据
  loadProjectData()
})

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      project.value.id = newId
      loadProjectData()
    }
  }
)
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.project-detail-container {
  background-color: $bg-color-page;
  min-height: calc(100vh - 60px);
}

// 项目头部
.project-header {
  background: $white;
  border-bottom: 1px solid $border-color-lighter;
  padding: $spacing-xl $spacing-lg;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    max-width: 1200px;
    margin: 0 auto;
    
    .header-left {
      flex: 1;
      
      .back-button {
        margin-bottom: $spacing-md;
        color: $text-color-secondary;
        
        &:hover {
    background-color: $bg-color-page;
  }
  
  .file-info {
    flex: 1;
    
    .file-name {
      font-size: $font-size-small;
      color: $text-color-primary;
      margin-bottom: $spacing-xs;
      @include text-ellipsis;
    }
    
    .file-meta {
      font-size: $font-size-xs;
      color: $text-color-secondary;
    }
  }
}

// 响应式设计
@include respond-to('tablet') {
  .project-header {
    .header-content {
      flex-direction: column;
      gap: $spacing-lg;
      
      .header-left {
        .project-info {
          flex-direction: column;
          gap: $spacing-md;
        }
      }
    }
  }
  
  .project-content {
    .content-layout {
      grid-template-columns: 1fr;
      gap: $spacing-md;
    }
  }
  
  .prototypes-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
  
  .components-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

@include respond-to('mobile') {
  .project-header {
    padding: $spacing-md;
    
    .header-content {
      .header-left {
        .project-info {
          .project-details {
            .project-name {
              font-size: $font-size-xl;
            }
          }
        }
      }
      
      .header-right {
        .project-actions {
          flex-direction: column;
          gap: $spacing-sm;
        }
      }
    }
  }
  
  .project-stats {
    padding: $spacing-md;
    
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: $spacing-md;
    }
  }
  
  .project-content {
    padding: $spacing-md;
  }
  
  .prototypes-grid {
    grid-template-columns: 1fr;
  }
  
  .components-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .progress-info {
    flex-direction: column;
    text-align: center;
    gap: $spacing-md;
  }
}

// 暗色主题适配
.dark {
  .project-detail-container {
    background-color: $dark-bg-color-page;
  }
  
  .project-header {
    background: $dark-bg-color;
    border-bottom-color: $dark-border-color;
  }
  
  .project-stats {
    background: $dark-bg-color;
    border-bottom-color: $dark-border-color;
  }
  
  .stat-card {
    background: $dark-bg-color-page;
    border-color: $dark-border-color;
  }
  
  .main-content,
  .sidebar-card {
    background: $dark-bg-color;
    border-color: $dark-border-color;
    box-shadow: $dark-box-shadow-light;
  }
  
  .prototype-card,
  .requirement-item,
  .component-card {
    border-color: $dark-border-color;
    
    &:hover {
      border-color: $primary-color;
      box-shadow: $dark-box-shadow-base;
    }
    
    .prototype-preview,
    .component-preview {
      background: $dark-bg-color-page;
    }
  }
  
  .create-card {
    border-color: $dark-border-color;
    background: $dark-bg-color-page;
    
    &:hover {
      background: $dark-bg-color;
    }
  }
  
  .file-item {
    &:hover {
      background-color: $dark-bg-color-page;
    }
  }
}
</style>      color: $primary-color;
        }
      }
      
      .project-info {
        display: flex;
        gap: $spacing-lg;
        
        .project-details {
          flex: 1;
          
          .project-name {
            margin: 0 0 $spacing-xs 0;
            font-size: $font-size-2xl;
            font-weight: $font-weight-bold;
            color: $text-color-primary;
          }
          
          .project-description {
            margin: 0 0 $spacing-md 0;
            color: $text-color-secondary;
            font-size: $font-size-base;
            line-height: 1.6;
          }
          
          .project-meta {
            display: flex;
            align-items: center;
            gap: $spacing-md;
            
            .meta-item {
              display: flex;
              align-items: center;
              gap: $spacing-xs;
              color: $text-color-secondary;
              font-size: $font-size-small;
            }
          }
        }
      }
    }
    
    .header-right {
      .project-actions {
        display: flex;
        gap: $spacing-md;
      }
    }
  }
}

// 项目统计
.project-stats {
  background: $white;
  border-bottom: 1px solid $border-color-lighter;
  padding: $spacing-lg;
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-lg;
    max-width: 1200px;
    margin: 0 auto;
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-color-page;
  border-radius: $border-radius-base;
  border: 1px solid $border-color-lighter;
  
  .stat-content {
    .stat-value {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $text-color-primary;
      margin-bottom: $spacing-xs;
    }
    
    .stat-label {
      font-size: $font-size-small;
      color: $text-color-secondary;
    }
  }
}

// 主要内容
.project-content {
  padding: $spacing-lg;
  
  .content-layout {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: $spacing-lg;
    max-width: 1200px;
    margin: 0 auto;
  }
}

.main-content {
  background: $white;
  border-radius: $border-radius-base;
  overflow: hidden;
  box-shadow: $box-shadow-light;
  border: 1px solid $border-color-lighter;
}

.project-tabs {
  .tab-content {
    padding: $spacing-lg;
  }
}

// 区块头部
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
  
  h3 {
    margin: 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-primary;
    color: $text-color-primary;
  }
}

// 原型网格
.prototypes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-lg;
}

.prototype-card {
  border: 1px solid $border-color-lighter;
  border-radius: $border-radius-base;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    border-color: $primary-color;
    box-shadow: $box-shadow-base;
    transform: translateY(-2px);
  }
  
  .prototype-preview {
    height: 160px;
    background: $bg-color-page;
    @include flex-center;
    
    .prototype-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .prototype-placeholder {
      color: $text-color-placeholder;
    }
  }
  
  .prototype-info {
    padding: $spacing-md;
    
    .prototype-name {
      margin: 0 0 $spacing-xs 0;
      font-size: $font-size-base;
      font-weight: $font-weight-primary;
      color: $text-color-primary;
      @include text-ellipsis;
    }
    
    .prototype-description {
      margin: 0 0 $spacing-md 0;
      color: $text-color-secondary;
      font-size: $font-size-small;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .prototype-meta {
      display: flex;
      justify-content: space-between;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        font-size: $font-size-small;
        color: $text-color-secondary;
      }
    }
  }
  
  .prototype-actions {
    position: absolute;
    top: $spacing-md;
    right: $spacing-md;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover .prototype-actions {
    opacity: 1;
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
    height: 240px;
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

// 需求列表
.requirements-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.requirement-item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-md;
  padding: $spacing-md;
  border: 1px solid $border-color-lighter;
  border-radius: $border-radius-base;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: $primary-color;
    box-shadow: $box-shadow-light;
  }
  
  .requirement-content {
    flex: 1;
    
    .requirement-title {
      margin: 0 0 $spacing-xs 0;
      font-size: $font-size-base;
      font-weight: $font-weight-primary;
      color: $text-color-primary;
    }
    
    .requirement-description {
      margin: 0 0 $spacing-md 0;
      color: $text-color-secondary;
      font-size: $font-size-small;
      line-height: 1.5;
    }
    
    .requirement-meta {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        font-size: $font-size-small;
        color: $text-color-secondary;
      }
    }
  }
  
  .requirement-actions {
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover .requirement-actions {
    opacity: 1;
  }
}

// 组件网格
.components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: $spacing-lg;
}

.component-card {
  border: 1px solid $border-color-lighter;
  border-radius: $border-radius-base;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    border-color: $primary-color;
    box-shadow: $box-shadow-base;
    transform: translateY(-2px);
  }
  
  .component-preview {
    height: 120px;
    background: $bg-color-page;
    @include flex-center;
    
    .component-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .component-placeholder {
      color: $text-color-placeholder;
    }
  }
  
  .component-info {
    padding: $spacing-md;
    
    .component-name {
      margin: 0 0 $spacing-xs 0;
      font-size: $font-size-small;
      font-weight: $font-weight-primary;
      color: $text-color-primary;
      @include text-ellipsis;
    }
    
    .component-description {
      margin: 0 0 $spacing-md 0;
      color: $text-color-secondary;
      font-size: $font-size-xs;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .component-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        font-size: $font-size-xs;
        color: $text-color-secondary;
      }
    }
  }
  
  .component-actions {
    position: absolute;
    top: $spacing-sm;
    right: $spacing-sm;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover .component-actions {
    opacity: 1;
  }
}

// 活动时间线
.activity-section {
  h3 {
    margin: 0 0 $spacing-lg 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-primary;
    color: $text-color-primary;
  }
}

.activity-timeline {
  .activity-content {
    .activity-header {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      margin-bottom: $spacing-xs;
      
      .activity-user {
        font-weight: $font-weight-primary;
        color: $text-color-primary;
      }
      
      .activity-action {
        color: $text-color-secondary;
      }
    }
    
    .activity-description {
      color: $text-color-secondary;
      font-size: $font-size-small;
      margin-bottom: $spacing-xs;
    }
    
    .activity-target {
      margin-top: $spacing-xs;
    }
  }
}

// 侧边栏
.sidebar {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.sidebar-card {
  background: $white;
  border: 1px solid $border-color-lighter;
  border-radius: $border-radius-base;
  padding: $spacing-lg;
  box-shadow: $box-shadow-light;
  
  h4 {
    margin: 0 0 $spacing-md 0;
    font-size: $font-size-base;
    font-weight: $font-weight-primary;
    color: $text-color-primary;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;
    
    h4 {
      margin: 0;
    }
  }
}

// 项目进度
.progress-info {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  
  .progress-details {
    flex: 1;
    
    .progress-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: $spacing-xs;
      
      .label {
        color: $text-color-secondary;
        font-size: $font-size-small;
      }
      
      .value {
        color: $text-color-primary;
        font-weight: $font-weight-primary;
        font-size: $font-size-small;
      }
    }
  }
}

// 团队列表
.team-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.team-member {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  
  .member-info {
    flex: 1;
    
    .member-name {
      font-size: $font-size-small;
      font-weight: $font-weight-primary;
      color: $text-color-primary;
      margin-bottom: $spacing-xs;
    }
    
    .member-role {
      font-size: $font-size-xs;
      color: $text-color-secondary;
    }
  }
}

// 最近文件
.recent-files {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.file-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-sm;
  border-radius: $border-radius-small;
  transition: background-color 0.3s ease;
  cursor: pointer;
  
  &:hover {