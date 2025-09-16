<template>
  <div class="project-list">
    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <el-row :gutter="16">
        <el-col :span="8">
          <el-input
            v-model="searchQuery"
            placeholder="搜索项目名称或描述"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="statusFilter" placeholder="项目状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="进行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="已暂停" value="paused" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="priorityFilter" placeholder="优先级" clearable>
            <el-option label="全部" value="" />
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-col>
      </el-row>
    </div>

    <!-- 项目列表 -->
    <div class="project-grid">
      <div 
        v-for="project in filteredProjects" 
        :key="project.id"
        class="project-card"
        @click="viewProject(project.id)"
      >
        <div class="card-header">
          <div class="project-info">
            <h3 class="project-name">{{ project.name }}</h3>
            <p class="project-description">{{ project.description }}</p>
          </div>
          <div class="project-actions">
            <el-dropdown @command="handleCommand">
              <el-button text>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{ action: 'edit', id: project.id }">
                    编辑
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'delete', id: project.id }" divided>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        
        <div class="card-content">
          <div class="project-meta">
            <el-tag 
              :type="getStatusType(project.status)"
              size="small"
            >
              {{ getStatusText(project.status) }}
            </el-tag>
            <el-tag 
              :type="getPriorityType(project.priority)"
              size="small"
            >
              {{ getPriorityText(project.priority) }}
            </el-tag>
          </div>
          
          <div class="project-progress">
            <div class="progress-info">
              <span>进度</span>
              <span>{{ project.progress }}%</span>
            </div>
            <el-progress 
              :percentage="project.progress" 
              :stroke-width="6"
              :show-text="false"
            />
          </div>
          
          <div class="project-stats">
            <div class="stat-item">
              <el-icon><User /></el-icon>
              <span>{{ project.memberCount || 0 }} 成员</span>
            </div>
            <div class="stat-item">
              <el-icon><Document /></el-icon>
              <span>{{ project.taskCount || 0 }} 任务</span>
            </div>
          </div>
          
          <div class="project-dates">
            <div class="date-item">
              <span class="label">创建时间:</span>
              <span>{{ formatDate(project.createdAt) }}</span>
            </div>
            <div class="date-item">
              <span class="label">截止时间:</span>
              <span>{{ formatDate(project.deadline) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty 
      v-if="filteredProjects.length === 0" 
      description="暂无项目数据"
      :image-size="120"
    >
      <el-button type="primary" @click="$router.push('/project/new')">
        创建第一个项目
      </el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, MoreFilled, User, Document } from '@element-plus/icons-vue'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  priority: 'high' | 'medium' | 'low'
  progress: number
  memberCount: number
  taskCount: number
  createdAt: string
  deadline: string
}

const router = useRouter()

// 响应式数据
const searchQuery = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const projects = ref<Project[]>([])

// 计算属性
const filteredProjects = computed(() => {
  return projects.value.filter(project => {
    const matchesSearch = !searchQuery.value || 
      project.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = !statusFilter.value || project.status === statusFilter.value
    const matchesPriority = !priorityFilter.value || project.priority === priorityFilter.value
    
    return matchesSearch && matchesStatus && matchesPriority
  })
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const viewProject = (id: string) => {
  router.push(`/project/${id}`)
}

const handleCommand = (command: { action: string; id: string }) => {
  const { action, id } = command
  
  if (action === 'edit') {
    router.push(`/project/${id}/edit`)
  } else if (action === 'delete') {
    ElMessageBox.confirm(
      '确定要删除这个项目吗？此操作不可恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      deleteProject(id)
    })
  }
}

const deleteProject = async (id: string) => {
  try {
    // TODO: 调用删除API
    projects.value = projects.value.filter(p => p.id !== id)
    ElMessage.success('项目删除成功')
  } catch (error) {
    ElMessage.error('删除失败，请重试')
  }
}

const getStatusType = (status: string) => {
  const types = {
    active: 'success',
    completed: 'info',
    paused: 'warning',
    cancelled: 'danger'
  }
  return types[status as keyof typeof types] || 'info'
}

const getStatusText = (status: string) => {
  const texts = {
    active: '进行中',
    completed: '已完成',
    paused: '已暂停',
    cancelled: '已取消'
  }
  return texts[status as keyof typeof texts] || status
}

const getPriorityType = (priority: string) => {
  const types = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[priority as keyof typeof types] || 'info'
}

const getPriorityText = (priority: string) => {
  const texts = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return texts[priority as keyof typeof texts] || priority
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const loadProjects = async () => {
  try {
    // TODO: 调用API获取项目列表
    // 模拟数据
    projects.value = [
      {
        id: '1',
        name: '电商平台重构',
        description: '基于Vue3和TypeScript的电商平台前端重构项目',
        status: 'active',
        priority: 'high',
        progress: 65,
        memberCount: 8,
        taskCount: 24,
        createdAt: '2024-01-15',
        deadline: '2024-06-30'
      },
      {
        id: '2',
        name: '移动端App开发',
        description: '基于React Native的移动端应用开发',
        status: 'active',
        priority: 'medium',
        progress: 30,
        memberCount: 5,
        taskCount: 18,
        createdAt: '2024-02-01',
        deadline: '2024-08-15'
      }
    ]
  } catch (error) {
    ElMessage.error('加载项目列表失败')
  }
}

// 生命周期
onMounted(() => {
  loadProjects()
})
</script>

<style scoped lang="scss">
.project-list {
  .search-bar {
    margin-bottom: 24px;
  }
  
  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 20px;
  }
  
  .project-card {
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #409eff;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      
      .project-info {
        flex: 1;
        
        .project-name {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
        
        .project-description {
          margin: 0;
          font-size: 14px;
          color: #606266;
          line-height: 1.4;
        }
      }
      
      .project-actions {
        margin-left: 12px;
      }
    }
    
    .card-content {
      .project-meta {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }
      
      .project-progress {
        margin-bottom: 16px;
        
        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          color: #606266;
        }
      }
      
      .project-stats {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          color: #606266;
        }
      }
      
      .project-dates {
        .date-item {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
          
          .label {
            font-weight: 500;
          }
        }
      }
    }
  }
}
</style>