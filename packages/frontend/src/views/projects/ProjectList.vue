<template>
  <div class="project-list-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">项目管理</h1>
          <p class="page-subtitle">管理您的所有设计项目</p>
        </div>
        <div class="header-right">
          <el-button type="primary" :icon="'Plus'" @click="createProject">
            创建项目
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 筛选和搜索栏 -->
    <div class="filter-section">
      <div class="filter-content">
        <div class="filter-left">
          <el-input
            v-model="searchQuery"
            placeholder="搜索项目名称、描述..."
            :prefix-icon="'Search'"
            clearable
            class="search-input"
            @input="handleSearch"
          />
          
          <el-select
            v-model="statusFilter"
            placeholder="项目状态"
            clearable
            class="filter-select"
            @change="handleFilter"
          >
            <el-option label="全部状态" value="" />
            <el-option label="进行中" value="active" />
            <el-option label="审核中" value="review" />
            <el-option label="规划中" value="planning" />
            <el-option label="已完成" value="completed" />
            <el-option label="已归档" value="archived" />
          </el-select>
          
          <el-select
            v-model="sortBy"
            placeholder="排序方式"
            class="filter-select"
            @change="handleSort"
          >
            <el-option label="最近更新" value="updatedAt" />
            <el-option label="创建时间" value="createdAt" />
            <el-option label="项目名称" value="name" />
            <el-option label="完成度" value="progress" />
          </el-select>
        </div>
        
        <div class="filter-right">
          <el-button-group>
            <el-button 
              :type="viewMode === 'grid' ? 'primary' : 'default'"
              :icon="'Grid'"
              @click="viewMode = 'grid'"
            />
            <el-button 
              :type="viewMode === 'list' ? 'primary' : 'default'"
              :icon="'List'"
              @click="viewMode = 'list'"
            />
          </el-button-group>
          
          <el-dropdown trigger="click" @command="handleBatchAction">
            <el-button :disabled="selectedProjects.length === 0">
              批量操作
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="archive">归档项目</el-dropdown-item>
                <el-dropdown-item command="export">导出项目</el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除项目</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
    
    <!-- 项目列表 -->
    <div class="projects-section">
      <el-loading :loading="loading" element-loading-text="加载中...">
        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="projects-grid">
          <div 
            v-for="project in filteredProjects" 
            :key="project.id"
            class="project-card"
            :class="{ 'selected': selectedProjects.includes(project.id) }"
            @click="selectProject(project)"
          >
            <!-- 选择框 -->
            <div class="project-checkbox">
              <el-checkbox 
                :model-value="selectedProjects.includes(project.id)"
                @change="toggleProjectSelection(project.id)"
                @click.stop
              />
            </div>
            
            <!-- 项目头部 -->
            <div class="project-header">
              <div class="project-avatar">
                <el-avatar :size="48" :src="project.avatar">
                  {{ project.name.charAt(0) }}
                </el-avatar>
              </div>
              <div class="project-actions">
                <el-dropdown trigger="click" @command="(cmd) => handleProjectAction(cmd, project)">
                  <el-button type="text" :icon="'MoreFilled'" @click.stop />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">编辑项目</el-dropdown-item>
                      <el-dropdown-item command="duplicate">复制项目</el-dropdown-item>
                      <el-dropdown-item command="settings">项目设置</el-dropdown-item>
                      <el-dropdown-item command="archive" divided>归档项目</el-dropdown-item>
                      <el-dropdown-item command="delete">删除项目</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            
            <!-- 项目信息 -->
            <div class="project-info">
              <h3 class="project-name">{{ project.name }}</h3>
              <p class="project-description">{{ project.description }}</p>
            </div>
            
            <!-- 项目状态和进度 -->
            <div class="project-meta">
              <div class="project-status">
                <el-tag :type="getStatusType(project.status)" size="small">
                  {{ getStatusText(project.status) }}
                </el-tag>
              </div>
              <div class="project-progress">
                <div class="progress-info">
                  <span class="progress-text">{{ project.progress }}%</span>
                  <span class="progress-label">完成度</span>
                </div>
                <el-progress 
                  :percentage="project.progress" 
                  :show-text="false" 
                  :stroke-width="6"
                  :color="getProgressColor(project.progress)"
                />
              </div>
            </div>
            
            <!-- 项目统计 -->
            <div class="project-stats">
              <div class="stat-item">
                <el-icon :size="14"><Grid /></el-icon>
                <span>{{ project.prototypes || 0 }} 原型</span>
              </div>
              <div class="stat-item">
                <el-icon :size="14"><User /></el-icon>
                <span>{{ project.team?.length || 0 }} 成员</span>
              </div>
              <div class="stat-item">
                <el-icon :size="14"><Clock /></el-icon>
                <span>{{ formatTime(project.updatedAt) }}</span>
              </div>
            </div>
            
            <!-- 团队成员 -->
            <div class="project-team">
              <el-avatar-group :max="4" :size="28">
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
          </div>
          
          <!-- 创建新项目卡片 -->
          <div class="project-card create-card" @click="createProject">
            <div class="create-content">
              <el-icon :size="48" color="#409eff">
                <Plus />
              </el-icon>
              <h3>创建新项目</h3>
              <p>开始您的新设计项目</p>
            </div>
          </div>
        </div>
        
        <!-- 列表视图 -->
        <div v-else class="projects-table">
          <el-table 
            :data="filteredProjects" 
            style="width: 100%"
            @selection-change="handleSelectionChange"
            @row-click="selectProject"
          >
            <el-table-column type="selection" width="55" />
            
            <el-table-column label="项目" min-width="200">
              <template #default="{ row }">
                <div class="table-project-info">
                  <el-avatar :size="32" :src="row.avatar">
                    {{ row.name.charAt(0) }}
                  </el-avatar>
                  <div class="project-details">
                    <div class="project-name">{{ row.name }}</div>
                    <div class="project-description">{{ row.description }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="进度" width="120">
              <template #default="{ row }">
                <div class="table-progress">
                  <el-progress 
                    :percentage="row.progress" 
                    :show-text="false" 
                    :stroke-width="6"
                    :color="getProgressColor(row.progress)"
                  />
                  <span class="progress-text">{{ row.progress }}%</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="团队" width="120">
              <template #default="{ row }">
                <el-avatar-group :max="3" :size="24">
                  <el-avatar 
                    v-for="member in row.team" 
                    :key="member.id"
                    :src="member.avatar"
                    :title="member.name"
                  >
                    {{ member.name.charAt(0) }}
                  </el-avatar>
                </el-avatar-group>
              </template>
            </el-table-column>
            
            <el-table-column label="原型数" width="80">
              <template #default="{ row }">
                {{ row.prototypes || 0 }}
              </template>
            </el-table-column>
            
            <el-table-column label="更新时间" width="120">
              <template #default="{ row }">
                {{ formatTime(row.updatedAt) }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="text" size="small" @click.stop="editProject(row)">
                  编辑
                </el-button>
                <el-dropdown trigger="click" @command="(cmd) => handleProjectAction(cmd, row)">
                  <el-button type="text" size="small" @click.stop>
                    更多
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="duplicate">复制项目</el-dropdown-item>
                      <el-dropdown-item command="settings">项目设置</el-dropdown-item>
                      <el-dropdown-item command="archive" divided>归档项目</el-dropdown-item>
                      <el-dropdown-item command="delete">删除项目</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 空状态 -->
        <div v-if="filteredProjects.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无项目">
            <template #image>
              <el-icon :size="64" color="#c0c4cc">
                <Folder />
              </el-icon>
            </template>
            <el-button type="primary" @click="createProject">
              创建第一个项目
            </el-button>
          </el-empty>
        </div>
      </el-loading>
    </div>
    
    <!-- 分页 -->
    <div v-if="filteredProjects.length > 0" class="pagination-section">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 48, 96]"
        :total="totalProjects"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

/**
 * 项目列表页面组件
 * 提供项目的展示、搜索、筛选、排序等功能
 */

const router = useRouter()
const appStore = useAppStore()

// 视图模式
const viewMode = ref<'grid' | 'list'>('grid')

// 加载状态
const loading = ref(false)

// 搜索和筛选
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('updatedAt')

// 选中的项目
const selectedProjects = ref<string[]>([])

// 分页
const currentPage = ref(1)
const pageSize = ref(12)
const totalProjects = ref(0)

// 项目数据
const projects = ref([
  {
    id: '1',
    name: 'E-Commerce Platform',
    description: '电商平台原型设计，包含用户购物流程、商品管理、订单处理等核心功能',
    avatar: '',
    status: 'active',
    progress: 75,
    prototypes: 12,
    team: [
      { id: '1', name: '张三', avatar: '' },
      { id: '2', name: '李四', avatar: '' },
      { id: '3', name: '王五', avatar: '' }
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2小时前
  },
  {
    id: '2',
    name: 'Mobile Banking App',
    description: '移动银行应用设计，专注于安全性和用户体验',
    avatar: '',
    status: 'review',
    progress: 90,
    prototypes: 8,
    team: [
      { id: '4', name: '赵六', avatar: '' },
      { id: '5', name: '钱七', avatar: '' }
    ],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14天前
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5小时前
  },
  {
    id: '3',
    name: 'Admin Dashboard',
    description: '后台管理系统界面设计，包含数据可视化和权限管理',
    avatar: '',
    status: 'planning',
    progress: 25,
    prototypes: 4,
    team: [
      { id: '6', name: '孙八', avatar: '' }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3天前
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1天前
  },
  {
    id: '4',
    name: 'Social Media App',
    description: '社交媒体应用设计，注重社交互动和内容分享',
    avatar: '',
    status: 'completed',
    progress: 100,
    prototypes: 15,
    team: [
      { id: '7', name: '周九', avatar: '' },
      { id: '8', name: '吴十', avatar: '' },
      { id: '9', name: '郑十一', avatar: '' },
      { id: '10', name: '王十二', avatar: '' }
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7天前
  },
  {
    id: '5',
    name: 'Learning Management System',
    description: '在线学习管理系统，支持课程管理、学习跟踪等功能',
    avatar: '',
    status: 'archived',
    progress: 85,
    prototypes: 10,
    team: [
      { id: '11', name: '冯十三', avatar: '' },
      { id: '12', name: '陈十四', avatar: '' }
    ],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60天前
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30天前
  }
])

// 筛选后的项目列表
const filteredProjects = computed(() => {
  let result = [...projects.value]
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(project => 
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query)
    )
  }
  
  // 状态筛选
  if (statusFilter.value) {
    result = result.filter(project => project.status === statusFilter.value)
  }
  
  // 排序
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'progress':
        return b.progress - a.progress
      case 'createdAt':
        return b.createdAt.getTime() - a.createdAt.getTime()
      case 'updatedAt':
      default:
        return b.updatedAt.getTime() - a.updatedAt.getTime()
    }
  })
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  
  totalProjects.value = result.length
  
  return result.slice(start, end)
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
 * 格式化时间
 */
const formatTime = (date: Date) => {
  return formatDistanceToNow(date, { 
    addSuffix: true, 
    locale: zhCN 
  })
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  currentPage.value = 1
}

/**
 * 处理筛选
 */
const handleFilter = () => {
  currentPage.value = 1
}

/**
 * 处理排序
 */
const handleSort = () => {
  currentPage.value = 1
}

/**
 * 选择项目
 */
const selectProject = (project: any) => {
  router.push(`/projects/${project.id}`)
}

/**
 * 切换项目选择状态
 */
const toggleProjectSelection = (projectId: string) => {
  const index = selectedProjects.value.indexOf(projectId)
  if (index > -1) {
    selectedProjects.value.splice(index, 1)
  } else {
    selectedProjects.value.push(projectId)
  }
}

/**
 * 处理表格选择变化
 */
const handleSelectionChange = (selection: any[]) => {
  selectedProjects.value = selection.map(item => item.id)
}

/**
 * 创建项目
 */
const createProject = () => {
  router.push('/projects/create')
}

/**
 * 编辑项目
 */
const editProject = (project: any) => {
  router.push(`/projects/${project.id}/edit`)
}

/**
 * 处理项目操作
 */
const handleProjectAction = async (command: string, project: any) => {
  switch (command) {
    case 'edit':
      editProject(project)
      break
      
    case 'duplicate':
      try {
        // 这里应该调用复制项目的API
        ElMessage.success('项目复制成功')
        await loadProjects()
      } catch (error) {
        ElMessage.error('项目复制失败')
      }
      break
      
    case 'settings':
      router.push(`/projects/${project.id}/settings`)
      break
      
    case 'archive':
      try {
        await ElMessageBox.confirm(
          '确定要归档这个项目吗？归档后项目将不再显示在活跃项目列表中。',
          '确认归档',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 这里应该调用归档项目的API
        project.status = 'archived'
        ElMessage.success('项目已归档')
        
      } catch (error) {
        // 用户取消操作
      }
      break
      
    case 'delete':
      try {
        await ElMessageBox.confirm(
          '确定要删除这个项目吗？此操作不可撤销，项目的所有数据将被永久删除。',
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
          }
        )
        
        // 这里应该调用删除项目的API
        const index = projects.value.findIndex(p => p.id === project.id)
        if (index > -1) {
          projects.value.splice(index, 1)
        }
        ElMessage.success('项目已删除')
        
      } catch (error) {
        // 用户取消操作
      }
      break
  }
}

/**
 * 处理批量操作
 */
const handleBatchAction = async (command: string) => {
  if (selectedProjects.value.length === 0) {
    ElMessage.warning('请先选择要操作的项目')
    return
  }
  
  switch (command) {
    case 'archive':
      try {
        await ElMessageBox.confirm(
          `确定要归档选中的 ${selectedProjects.value.length} 个项目吗？`,
          '确认批量归档',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 这里应该调用批量归档API
        selectedProjects.value.forEach(projectId => {
          const project = projects.value.find(p => p.id === projectId)
          if (project) {
            project.status = 'archived'
          }
        })
        
        ElMessage.success(`已归档 ${selectedProjects.value.length} 个项目`)
        selectedProjects.value = []
        
      } catch (error) {
        // 用户取消操作
      }
      break
      
    case 'export':
      try {
        // 这里应该调用批量导出API
        ElMessage.success(`正在导出 ${selectedProjects.value.length} 个项目...`)
        
      } catch (error) {
        ElMessage.error('导出失败')
      }
      break
      
    case 'delete':
      try {
        await ElMessageBox.confirm(
          `确定要删除选中的 ${selectedProjects.value.length} 个项目吗？此操作不可撤销。`,
          '确认批量删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
          }
        )
        
        // 这里应该调用批量删除API
        selectedProjects.value.forEach(projectId => {
          const index = projects.value.findIndex(p => p.id === projectId)
          if (index > -1) {
            projects.value.splice(index, 1)
          }
        })
        
        ElMessage.success(`已删除 ${selectedProjects.value.length} 个项目`)
        selectedProjects.value = []
        
      } catch (error) {
        // 用户取消操作
      }
      break
  }
}

/**
 * 处理分页大小变化
 */
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

/**
 * 处理当前页变化
 */
const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

/**
 * 加载项目数据
 */
const loadProjects = async () => {
  try {
    loading.value = true
    
    // 这里应该调用API加载项目数据
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    
    console.log('项目数据加载完成')
    
  } catch (error) {
    console.error('加载项目数据失败:', error)
    ElMessage.error('加载项目数据失败')
  } finally {
    loading.value = false
  }
}

/**
 * 组件挂载时的初始化
 */
onMounted(() => {
  // 设置页面标题
  appStore.setPageTitle('项目管理')
  
  // 加载项目数据
  loadProjects()
})

// 监听筛选条件变化
watch([searchQuery, statusFilter, sortBy], () => {
  currentPage.value = 1
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.project-list-container {
  padding: $spacing-lg;
  background-color: $bg-color-page;
  min-height: calc(100vh - 60px);
}

// 页面头部
.page-header {
  margin-bottom: $spacing-xl;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    
    .header-left {
      .page-title {
        margin: 0 0 $spacing-xs 0;
        font-size: $font-size-3xl;
        font-weight: $font-weight-bold;
        color: $text-color-primary;
      }
      
      .page-subtitle {
        margin: 0;
        color: $text-color-secondary;
        font-size: $font-size-base;
      }
    }
  }
}

// 筛选区域
.filter-section {
  background: $white;
  border-radius: $border-radius-base;
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;
  box-shadow: $box-shadow-light;
  border: 1px solid $border-color-lighter;
  
  .filter-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $spacing-md;
    
    .filter-left {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      flex: 1;
      
      .search-input {
        width: 300px;
      }
      
      .filter-select {
        width: 150px;
      }
    }
    
    .filter-right {
      display: flex;
      align-items: center;
      gap: $spacing-md;
    }
  }
}

// 项目区域
.projects-section {
  margin-bottom: $spacing-lg;
}

// 网格视图
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: $spacing-lg;
}

.project-card {
  background: $white;
  border: 1px solid $border-color-lighter;
  border-radius: $border-radius-base;
  padding: $spacing-lg;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    border-color: $primary-color;
    box-shadow: $box-shadow-base;
    transform: translateY(-2px);
  }
  
  &.selected {
    border-color: $primary-color;
    background: rgba(64, 158, 255, 0.05);
  }
  
  .project-checkbox {
    position: absolute;
    top: $spacing-md;
    left: $spacing-md;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover .project-checkbox {
    opacity: 1;
  }
  
  &.selected .project-checkbox {
    opacity: 1;
  }
  
  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $spacing-md;
    
    .project-actions {
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }
  
  &:hover .project-actions {
    opacity: 1;
  }
  
  .project-info {
    margin-bottom: $spacing-lg;
    
    .project-name {
      margin: 0 0 $spacing-xs 0;
      font-size: $font-size-lg;
      font-weight: $font-weight-primary;
      color: $text-color-primary;
      @include text-ellipsis;
    }
    
    .project-description {
      margin: 0;
      color: $text-color-secondary;
      font-size: $font-size-small;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
  
  .project-meta {
    margin-bottom: $spacing-md;
    
    .project-status {
      margin-bottom: $spacing-md;
    }
    
    .project-progress {
      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-xs;
        
        .progress-text {
          font-weight: $font-weight-primary;
          color: $text-color-primary;
        }
        
        .progress-label {
          font-size: $font-size-small;
          color: $text-color-secondary;
        }
      }
    }
  }
  
  .project-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: $spacing-md;
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      font-size: $font-size-small;
      color: $text-color-secondary;
    }
  }
  
  .project-team {
    display: flex;
    justify-content: flex-end;
  }
}

.create-card {
  border: 2px dashed $border-color-base;
  background: $bg-color-page;
  
  &:hover {
    border-color: $primary-color;
    background: $white;
    transform: translateY(-2px);
  }
  
  .create-content {
    @include flex-center;
    flex-direction: column;
    height: 200px;
    text-align: center;
    
    h3 {
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

// 表格视图
.projects-table {
  background: $white;
  border-radius: $border-radius-base;
  overflow: hidden;
  box-shadow: $box-shadow-light;
  border: 1px solid $border-color-lighter;
  
  .table-project-info {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    
    .project-details {
      .project-name {
        font-weight: $font-weight-primary;
        color: $text-color-primary;
        margin-bottom: $spacing-xs;
      }
      
      .project-description {
        font-size: $font-size-small;
        color: $text-color-secondary;
        @include text-ellipsis;
      }
    }
  }
  
  .table-progress {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    
    .progress-text {
      font-size: $font-size-small;
      color: $text-color-secondary;
      min-width: 40px;
    }
  }
}

// 空状态
.empty-state {
  background: $white;
  border-radius: $border-radius-base;
  padding: $spacing-xl;
  text-align: center;
  box-shadow: $box-shadow-light;
  border: 1px solid $border-color-lighter;
}

// 分页
.pagination-section {
  display: flex;
  justify-content: center;
  padding: $spacing-lg 0;
}

// 响应式设计
@include respond-below(lg) {
  .project-list-container {
    padding: $spacing-md;
  }
  
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: $spacing-md;
  }
  
  .filter-content {
    flex-direction: column;
    align-items: stretch;
    gap: $spacing-md;
    
    .filter-left {
      flex-direction: column;
      
      .search-input {
        width: 100%;
      }
      
      .filter-select {
        width: 100%;
      }
    }
    
    .filter-right {
      justify-content: space-between;
    }
  }
}

@include respond-below(md) {
  .page-header {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-md;
    }
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .project-card {
    .project-stats {
      flex-direction: column;
      gap: $spacing-xs;
      align-items: flex-start;
    }
  }
  
  .filter-right {
    flex-direction: column;
    gap: $spacing-sm;
  }
}

// 暗色主题适配
@include dark-theme {
  .project-list-container {
    background-color: $dark-bg-color;
  }
  
  .filter-section,
  .project-card,
  .projects-table,
  .empty-state {
    background: $dark-card-bg;
    border-color: $dark-border-color;
  }
  
  .page-title {
    color: $dark-text-primary;
  }
  
  .page-subtitle {
    color: $dark-text-secondary;
  }
  
  .project-name {
    color: $dark-text-primary;
  }
  
  .project-description {
    color: $dark-text-secondary;
  }
  
  .create-card {
    background: $dark-bg-color;
    border-color: $dark-border-color;
    
    &:hover {
      background: $dark-card-bg;
    }
    
    h3 {
      color: $dark-text-primary;
    }
    
    p {
      color: $dark-text-secondary;
    }
  }
}

// 动画效果
.project-card {
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

// 表格样式覆盖
:deep(.el-table) {
  .el-table__row {
    cursor: pointer;
    
    &:hover {
      background-color: $bg-color-page;
    }
  }
}

// 分页样式覆盖
:deep(.el-pagination) {
  .el-pagination__total,
  .el-pagination__jump {
    color: $text-color-secondary;
  }
}
</style>