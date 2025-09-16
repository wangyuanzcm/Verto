import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { projectApi } from '@/api'
import type { Project, ProjectListParams, ProjectCreateRequest, ProjectUpdateRequest } from '@/api/types'
import { ElMessage } from 'element-plus'

/**
 * 项目管理状态
 * 管理项目列表、项目操作等状态
 */

export interface ProjectState {
  // 项目列表
  projectList: Project[]
  // 项目总数
  total: number
  // 当前页码
  currentPage: number
  // 每页数量
  pageSize: number
  // 加载状态
  loading: boolean
  // 搜索关键词
  searchKeyword: string
  // 筛选条件
  filters: {
    status?: string
    priority?: string
    category?: string
    ownerId?: string
  }
  // 选中的项目
  selectedProjects: Project[]
  // 当前项目详情
  currentProject: Project | null
  // 项目详情加载状态
  detailLoading: boolean
  // 我的项目列表
  myProjects: Project[]
  // 最近访问的项目
  recentProjects: Project[]
}

export const useProjectStore = defineStore('project', () => {
  // 状态定义
  const projectList = ref<Project[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const loading = ref(false)
  const searchKeyword = ref('')
  const filters = ref<ProjectState['filters']>({})
  const selectedProjects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const detailLoading = ref(false)
  const myProjects = ref<Project[]>([])
  const recentProjects = ref<Project[]>([])

  // 计算属性
  const totalPages = computed(() => {
    return Math.ceil(total.value / pageSize.value)
  })

  const hasProjects = computed(() => {
    return projectList.value.length > 0
  })

  const selectedProjectIds = computed(() => {
    return selectedProjects.value.map(project => project.id)
  })

  const isAllSelected = computed(() => {
    return projectList.value.length > 0 && selectedProjects.value.length === projectList.value.length
  })

  const isIndeterminate = computed(() => {
    return selectedProjects.value.length > 0 && selectedProjects.value.length < projectList.value.length
  })

  const activeProjects = computed(() => {
    return projectList.value.filter(project => project.status === 'active')
  })

  const completedProjects = computed(() => {
    return projectList.value.filter(project => project.status === 'completed')
  })

  const archivedProjects = computed(() => {
    return projectList.value.filter(project => project.status === 'archived')
  })

  // 动作方法
  /**
   * 获取项目列表
   */
  const fetchProjectList = async (params?: Partial<ProjectListParams>) => {
    try {
      loading.value = true
      
      const requestParams: ProjectListParams = {
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value,
        ...filters.value,
        ...params
      }
      
      const response = await projectApi.getProjectList(requestParams)
      
      if (response.success && response.data) {
        projectList.value = response.data.list
        total.value = response.data.total
        currentPage.value = response.data.page
        pageSize.value = response.data.pageSize
      } else {
        ElMessage.error(response.message || '获取项目列表失败')
      }
    } catch (error: any) {
      console.error('获取项目列表错误:', error)
      ElMessage.error(error.message || '获取项目列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取项目详情
   */
  const fetchProjectDetail = async (projectId: string) => {
    try {
      detailLoading.value = true
      
      const response = await projectApi.getProjectDetail(projectId)
      
      if (response.success && response.data) {
        currentProject.value = response.data
        // 添加到最近访问列表
        addToRecentProjects(response.data)
      } else {
        ElMessage.error(response.message || '获取项目详情失败')
      }
    } catch (error: any) {
      console.error('获取项目详情错误:', error)
      ElMessage.error(error.message || '获取项目详情失败')
    } finally {
      detailLoading.value = false
    }
  }

  /**
   * 创建项目
   */
  const createProject = async (projectData: ProjectCreateRequest): Promise<boolean> => {
    try {
      const response = await projectApi.createProject(projectData)
      
      if (response.success && response.data) {
        ElMessage.success('项目创建成功')
        // 添加到列表开头
        projectList.value.unshift(response.data)
        total.value++
        return true
      } else {
        ElMessage.error(response.message || '项目创建失败')
        return false
      }
    } catch (error: any) {
      console.error('创建项目错误:', error)
      ElMessage.error(error.message || '项目创建失败')
      return false
    }
  }

  /**
   * 更新项目
   */
  const updateProject = async (projectId: string, projectData: ProjectUpdateRequest): Promise<boolean> => {
    try {
      const response = await projectApi.updateProject(projectId, projectData)
      
      if (response.success && response.data) {
        ElMessage.success('项目更新成功')
        
        // 更新列表中的项目信息
        const index = projectList.value.findIndex(project => project.id === projectId)
        if (index !== -1) {
          projectList.value[index] = response.data
        }
        
        // 更新当前项目信息
        if (currentProject.value?.id === projectId) {
          currentProject.value = response.data
        }
        
        // 更新我的项目列表
        const myIndex = myProjects.value.findIndex(project => project.id === projectId)
        if (myIndex !== -1) {
          myProjects.value[myIndex] = response.data
        }
        
        return true
      } else {
        ElMessage.error(response.message || '项目更新失败')
        return false
      }
    } catch (error: any) {
      console.error('更新项目错误:', error)
      ElMessage.error(error.message || '项目更新失败')
      return false
    }
  }

  /**
   * 删除项目
   */
  const deleteProject = async (projectId: string): Promise<boolean> => {
    try {
      const response = await projectApi.deleteProject(projectId)
      
      if (response.success) {
        ElMessage.success('项目删除成功')
        
        // 从列表中移除项目
        const index = projectList.value.findIndex(project => project.id === projectId)
        if (index !== -1) {
          projectList.value.splice(index, 1)
          total.value--
        }
        
        // 从选中列表中移除
        const selectedIndex = selectedProjects.value.findIndex(project => project.id === projectId)
        if (selectedIndex !== -1) {
          selectedProjects.value.splice(selectedIndex, 1)
        }
        
        // 清除当前项目
        if (currentProject.value?.id === projectId) {
          currentProject.value = null
        }
        
        // 从我的项目列表中移除
        const myIndex = myProjects.value.findIndex(project => project.id === projectId)
        if (myIndex !== -1) {
          myProjects.value.splice(myIndex, 1)
        }
        
        // 从最近访问列表中移除
        const recentIndex = recentProjects.value.findIndex(project => project.id === projectId)
        if (recentIndex !== -1) {
          recentProjects.value.splice(recentIndex, 1)
        }
        
        return true
      } else {
        ElMessage.error(response.message || '项目删除失败')
        return false
      }
    } catch (error: any) {
      console.error('删除项目错误:', error)
      ElMessage.error(error.message || '项目删除失败')
      return false
    }
  }

  /**
   * 批量删除项目
   */
  const batchDeleteProjects = async (projectIds: string[]): Promise<boolean> => {
    try {
      const response = await projectApi.batchDeleteProjects(projectIds)
      
      if (response.success) {
        ElMessage.success(`成功删除 ${projectIds.length} 个项目`)
        
        // 从列表中移除项目
        projectList.value = projectList.value.filter(project => !projectIds.includes(project.id))
        total.value -= projectIds.length
        
        // 清空选中列表
        selectedProjects.value = []
        
        // 从我的项目列表中移除
        myProjects.value = myProjects.value.filter(project => !projectIds.includes(project.id))
        
        // 从最近访问列表中移除
        recentProjects.value = recentProjects.value.filter(project => !projectIds.includes(project.id))
        
        return true
      } else {
        ElMessage.error(response.message || '批量删除失败')
        return false
      }
    } catch (error: any) {
      console.error('批量删除项目错误:', error)
      ElMessage.error(error.message || '批量删除失败')
      return false
    }
  }

  /**
   * 归档项目
   */
  const archiveProject = async (projectId: string): Promise<boolean> => {
    try {
      const response = await projectApi.archiveProject(projectId)
      
      if (response.success) {
        ElMessage.success('项目已归档')
        
        // 更新项目状态
        const index = projectList.value.findIndex(project => project.id === projectId)
        if (index !== -1) {
          projectList.value[index].status = 'archived'
        }
        
        if (currentProject.value?.id === projectId) {
          currentProject.value.status = 'archived'
        }
        
        return true
      } else {
        ElMessage.error(response.message || '归档失败')
        return false
      }
    } catch (error: any) {
      console.error('归档项目错误:', error)
      ElMessage.error(error.message || '归档失败')
      return false
    }
  }

  /**
   * 恢复项目
   */
  const restoreProject = async (projectId: string): Promise<boolean> => {
    try {
      const response = await projectApi.restoreProject(projectId)
      
      if (response.success) {
        ElMessage.success('项目已恢复')
        
        // 更新项目状态
        const index = projectList.value.findIndex(project => project.id === projectId)
        if (index !== -1) {
          projectList.value[index].status = 'active'
        }
        
        if (currentProject.value?.id === projectId) {
          currentProject.value.status = 'active'
        }
        
        return true
      } else {
        ElMessage.error(response.message || '恢复失败')
        return false
      }
    } catch (error: any) {
      console.error('恢复项目错误:', error)
      ElMessage.error(error.message || '恢复失败')
      return false
    }
  }

  /**
   * 获取我的项目
   */
  const fetchMyProjects = async () => {
    try {
      const response = await projectApi.getMyProjects()
      
      if (response.success && response.data) {
        myProjects.value = response.data
      } else {
        ElMessage.error(response.message || '获取我的项目失败')
      }
    } catch (error: any) {
      console.error('获取我的项目错误:', error)
      ElMessage.error(error.message || '获取我的项目失败')
    }
  }

  /**
   * 添加到最近访问
   */
  const addToRecentProjects = (project: Project) => {
    // 移除已存在的项目
    const index = recentProjects.value.findIndex(p => p.id === project.id)
    if (index !== -1) {
      recentProjects.value.splice(index, 1)
    }
    
    // 添加到开头
    recentProjects.value.unshift(project)
    
    // 限制最多10个
    if (recentProjects.value.length > 10) {
      recentProjects.value = recentProjects.value.slice(0, 10)
    }
  }

  /**
   * 设置搜索关键词
   */
  const setSearchKeyword = (keyword: string) => {
    searchKeyword.value = keyword
  }

  /**
   * 设置筛选条件
   */
  const setFilters = (newFilters: Partial<ProjectState['filters']>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * 清除筛选条件
   */
  const clearFilters = () => {
    filters.value = {}
    searchKeyword.value = ''
  }

  /**
   * 设置当前页码
   */
  const setCurrentPage = (page: number) => {
    currentPage.value = page
  }

  /**
   * 设置每页数量
   */
  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
  }

  /**
   * 选择项目
   */
  const selectProject = (project: Project) => {
    const index = selectedProjects.value.findIndex(p => p.id === project.id)
    if (index === -1) {
      selectedProjects.value.push(project)
    }
  }

  /**
   * 取消选择项目
   */
  const unselectProject = (projectId: string) => {
    const index = selectedProjects.value.findIndex(p => p.id === projectId)
    if (index !== -1) {
      selectedProjects.value.splice(index, 1)
    }
  }

  /**
   * 切换项目选择状态
   */
  const toggleProjectSelection = (project: Project) => {
    const index = selectedProjects.value.findIndex(p => p.id === project.id)
    if (index === -1) {
      selectedProjects.value.push(project)
    } else {
      selectedProjects.value.splice(index, 1)
    }
  }

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = () => {
    if (isAllSelected.value) {
      selectedProjects.value = []
    } else {
      selectedProjects.value = [...projectList.value]
    }
  }

  /**
   * 清空选择
   */
  const clearSelection = () => {
    selectedProjects.value = []
  }

  /**
   * 搜索项目
   */
  const searchProjects = async (keyword: string) => {
    setSearchKeyword(keyword)
    setCurrentPage(1)
    await fetchProjectList()
  }

  /**
   * 筛选项目
   */
  const filterProjects = async (filterParams: Partial<ProjectState['filters']>) => {
    setFilters(filterParams)
    setCurrentPage(1)
    await fetchProjectList()
  }

  /**
   * 刷新项目列表
   */
  const refreshProjectList = async () => {
    await fetchProjectList()
  }

  /**
   * 重置状态
   */
  const $reset = () => {
    projectList.value = []
    total.value = 0
    currentPage.value = 1
    pageSize.value = 20
    loading.value = false
    searchKeyword.value = ''
    filters.value = {}
    selectedProjects.value = []
    currentProject.value = null
    detailLoading.value = false
    myProjects.value = []
    recentProjects.value = []
  }

  return {
    // 状态
    projectList,
    total,
    currentPage,
    pageSize,
    loading,
    searchKeyword,
    filters,
    selectedProjects,
    currentProject,
    detailLoading,
    myProjects,
    recentProjects,

    // 计算属性
    totalPages,
    hasProjects,
    selectedProjectIds,
    isAllSelected,
    isIndeterminate,
    activeProjects,
    completedProjects,
    archivedProjects,

    // 动作
    fetchProjectList,
    fetchProjectDetail,
    createProject,
    updateProject,
    deleteProject,
    batchDeleteProjects,
    archiveProject,
    restoreProject,
    fetchMyProjects,
    addToRecentProjects,
    setSearchKeyword,
    setFilters,
    clearFilters,
    setCurrentPage,
    setPageSize,
    selectProject,
    unselectProject,
    toggleProjectSelection,
    toggleSelectAll,
    clearSelection,
    searchProjects,
    filterProjects,
    refreshProjectList,
    $reset
  }
}, {
  persist: {
    key: 'verto-project',
    paths: ['recentProjects']
  }
})