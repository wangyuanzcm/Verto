<template>
  <div class="dashboard-view">
    <div class="page-header">
      <h1>仪表盘</h1>
      <p>项目概览和数据统计</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <a-card class="stat-card">
        <a-statistic
          title="总项目数"
          :value="stats.totalProjects"
          :value-style="{ color: '#1890ff' }"
        >
          <template #prefix>
            <FolderOutlined />
          </template>
        </a-statistic>
      </a-card>
      
      <a-card class="stat-card">
        <a-statistic
          title="进行中项目"
          :value="stats.activeProjects"
          :value-style="{ color: '#52c41a' }"
        >
          <template #prefix>
            <PlayCircleOutlined />
          </template>
        </a-statistic>
      </a-card>
      
      <a-card class="stat-card">
        <a-statistic
          title="待处理需求"
          :value="stats.pendingRequirements"
          :value-style="{ color: '#faad14' }"
        >
          <template #prefix>
            <FileTextOutlined />
          </template>
        </a-statistic>
      </a-card>
      
      <a-card class="stat-card">
        <a-statistic
          title="团队成员"
          :value="stats.teamMembers"
          :value-style="{ color: '#722ed1' }"
        >
          <template #prefix>
            <TeamOutlined />
          </template>
        </a-statistic>
      </a-card>
    </div>

    <!-- 内容区域 -->
    <div class="dashboard-content">
      <!-- 最近项目 -->
      <div class="content-section">
        <a-card title="最近项目" class="recent-projects">
          <template #extra>
            <a-button type="link" @click="viewAllProjects">查看全部</a-button>
          </template>
          
          <div class="project-list">
            <div 
              v-for="project in recentProjects" 
              :key="project.id"
              class="project-item"
              @click="viewProject(project.id)"
            >
              <div class="project-info">
                <h4>{{ project.name }}</h4>
                <p>{{ project.description }}</p>
                <div class="project-meta">
                  <a-tag :color="getStatusColor(project.status)">{{ project.status }}</a-tag>
                  <span class="project-date">{{ formatDate(project.updatedAt) }}</span>
                </div>
              </div>
              <div class="project-progress">
                <a-progress 
                  :percent="project.progress" 
                  :size="'small'"
                  :show-info="false"
                />
                <span class="progress-text">{{ project.progress }}%</span>
              </div>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 待办事项 -->
      <div class="content-section">
        <a-card title="待办事项" class="todo-list">
          <template #extra>
            <a-button type="link" @click="viewAllTodos">查看全部</a-button>
          </template>
          
          <div class="todo-items">
            <div 
              v-for="todo in todoList" 
              :key="todo.id"
              class="todo-item"
            >
              <a-checkbox 
                v-model:checked="todo.completed"
                @change="toggleTodo(todo.id)"
              />
              <div class="todo-content">
                <span :class="{ 'completed': todo.completed }">{{ todo.title }}</span>
                <div class="todo-meta">
                  <a-tag size="small" :color="getPriorityColor(todo.priority)">{{ todo.priority }}</a-tag>
                  <span class="todo-date">{{ formatDate(todo.dueDate) }}</span>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <a-card title="项目进度统计" class="chart-card">
        <div class="chart-placeholder">
          <p>图表组件待集成</p>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  FolderOutlined, 
  PlayCircleOutlined, 
  FileTextOutlined, 
  TeamOutlined 
} from '@ant-design/icons-vue'

const router = useRouter()

// 统计数据
const stats = ref({
  totalProjects: 12,
  activeProjects: 8,
  pendingRequirements: 24,
  teamMembers: 15
})

// 最近项目
const recentProjects = ref([
  {
    id: 1,
    name: 'Verto 项目管理系统',
    description: '基于 Vue3 + Electron 的项目管理平台',
    status: '进行中',
    progress: 75,
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 2,
    name: '移动端 App 开发',
    description: 'React Native 跨平台移动应用',
    status: '计划中',
    progress: 30,
    updatedAt: new Date('2024-01-14')
  },
  {
    id: 3,
    name: '数据分析平台',
    description: '企业级数据可视化分析工具',
    status: '已完成',
    progress: 100,
    updatedAt: new Date('2024-01-10')
  }
])

// 待办事项
const todoList = ref([
  {
    id: 1,
    title: '完成用户认证模块开发',
    priority: '高',
    completed: false,
    dueDate: new Date('2024-01-20')
  },
  {
    id: 2,
    title: '编写API文档',
    priority: '中',
    completed: false,
    dueDate: new Date('2024-01-22')
  },
  {
    id: 3,
    title: '代码审查',
    priority: '低',
    completed: true,
    dueDate: new Date('2024-01-18')
  }
])

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '进行中': 'processing',
    '计划中': 'warning',
    '已完成': 'success',
    '已暂停': 'default'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取优先级颜色
 */
const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    '高': 'red',
    '中': 'orange',
    '低': 'green'
  }
  return colorMap[priority] || 'default'
}

/**
 * 格式化日期
 */
const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

/**
 * 查看项目详情
 */
const viewProject = (id: number) => {
  router.push(`/project/${id}`)
}

/**
 * 查看所有项目
 */
const viewAllProjects = () => {
  router.push('/project')
}

/**
 * 查看所有待办
 */
const viewAllTodos = () => {
  // TODO: 实现待办事项页面
  console.log('查看所有待办')
}

/**
 * 切换待办状态
 */
const toggleTodo = (id: number) => {
  const todo = todoList.value.find(item => item.id === id)
  if (todo) {
    // TODO: 调用API更新状态
    console.log('切换待办状态:', id)
  }
}

/**
 * 加载数据
 */
const loadData = async () => {
  // TODO: 从API加载实际数据
  console.log('加载仪表盘数据')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard-view {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

.page-header p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.content-section {
  min-width: 0;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-item {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.project-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.project-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.project-info p {
  margin: 0 0 12px 0;
  color: #8c8c8c;
  font-size: 14px;
  line-height: 1.4;
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.project-date {
  color: #8c8c8c;
  font-size: 12px;
}

.project-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: #8c8c8c;
  min-width: 32px;
}

.todo-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fafafa;
}

.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-content span {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #262626;
}

.todo-content span.completed {
  text-decoration: line-through;
  color: #8c8c8c;
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.todo-date {
  color: #8c8c8c;
  font-size: 12px;
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  color: #8c8c8c;
}

@media (max-width: 1200px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-view {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>