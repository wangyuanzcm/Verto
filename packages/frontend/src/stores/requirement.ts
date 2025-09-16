import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { requirementApi } from '@/api'
import type { Requirement, RequirementListParams, RequirementCreateRequest, RequirementUpdateRequest } from '@/api/types'
import { ElMessage } from 'element-plus'

/**
 * 需求管理状态
 * 管理需求列表、需求操作等状态
 */

export interface RequirementState {
  // 需求列表
  requirementList: Requirement[]
  // 需求总数
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
    type?: string
    assigneeId?: string
    projectId?: string
  }
  // 选中的需求
  selectedRequirements: Requirement[]
  // 当前需求详情
  currentRequirement: Requirement | null
  // 需求详情加载状态
  detailLoading: boolean
  // 我的需求列表
  myRequirements: Requirement[]
  // 需求统计信息
  statistics: {
    total: number
    pending: number
    inProgress: number
    completed: number
    rejected: number
  }
}

export const useRequirementStore = defineStore('requirement', () => {
  // 状态定义
  const requirementList = ref<Requirement[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const loading = ref(false)
  const searchKeyword = ref('')
  const filters = ref<RequirementState['filters']>({})
  const selectedRequirements = ref<Requirement[]>([])
  const currentRequirement = ref<Requirement | null>(null)
  const detailLoading = ref(false)
  const myRequirements = ref<Requirement[]>([])
  const statistics = ref<RequirementState['statistics']>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0
  })

  // 计算属性
  const totalPages = computed(() => {
    return Math.ceil(total.value / pageSize.value)
  })

  const hasRequirements = computed(() => {
    return requirementList.value.length > 0
  })

  const selectedRequirementIds = computed(() => {
    return selectedRequirements.value.map(requirement => requirement.id)
  })

  const isAllSelected = computed(() => {
    return requirementList.value.length > 0 && selectedRequirements.value.length === requirementList.value.length
  })

  const isIndeterminate = computed(() => {
    return selectedRequirements.value.length > 0 && selectedRequirements.value.length < requirementList.value.length
  })

  const pendingRequirements = computed(() => {
    return requirementList.value.filter(requirement => requirement.status === 'pending')
  })

  const inProgressRequirements = computed(() => {
    return requirementList.value.filter(requirement => requirement.status === 'in_progress')
  })

  const completedRequirements = computed(() => {
    return requirementList.value.filter(requirement => requirement.status === 'completed')
  })

  const highPriorityRequirements = computed(() => {
    return requirementList.value.filter(requirement => requirement.priority === 'high')
  })

  // 动作方法
  /**
   * 获取需求列表
   */
  const fetchRequirementList = async (params?: Partial<RequirementListParams>) => {
    try {
      loading.value = true
      
      const requestParams: RequirementListParams = {
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value,
        ...filters.value,
        ...params
      }
      
      const response = await requirementApi.getRequirementList(requestParams)
      
      if (response.success && response.data) {
        requirementList.value = response.data.list
        total.value = response.data.total
        currentPage.value = response.data.page
        pageSize.value = response.data.pageSize
      } else {
        ElMessage.error(response.message || '获取需求列表失败')
      }
    } catch (error: any) {
      console.error('获取需求列表错误:', error)
      ElMessage.error(error.message || '获取需求列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取需求详情
   */
  const fetchRequirementDetail = async (requirementId: string) => {
    try {
      detailLoading.value = true
      
      const response = await requirementApi.getRequirementDetail(requirementId)
      
      if (response.success && response.data) {
        currentRequirement.value = response.data
      } else {
        ElMessage.error(response.message || '获取需求详情失败')
      }
    } catch (error: any) {
      console.error('获取需求详情错误:', error)
      ElMessage.error(error.message || '获取需求详情失败')
    } finally {
      detailLoading.value = false
    }
  }

  /**
   * 创建需求
   */
  const createRequirement = async (requirementData: RequirementCreateRequest): Promise<boolean> => {
    try {
      const response = await requirementApi.createRequirement(requirementData)
      
      if (response.success && response.data) {
        ElMessage.success('需求创建成功')
        // 添加到列表开头
        requirementList.value.unshift(response.data)
        total.value++
        // 更新统计信息
        updateStatistics()
        return true
      } else {
        ElMessage.error(response.message || '需求创建失败')
        return false
      }
    } catch (error: any) {
      console.error('创建需求错误:', error)
      ElMessage.error(error.message || '需求创建失败')
      return false
    }
  }

  /**
   * 更新需求
   */
  const updateRequirement = async (requirementId: string, requirementData: RequirementUpdateRequest): Promise<boolean> => {
    try {
      const response = await requirementApi.updateRequirement(requirementId, requirementData)
      
      if (response.success && response.data) {
        ElMessage.success('需求更新成功')
        
        // 更新列表中的需求信息
        const index = requirementList.value.findIndex(requirement => requirement.id === requirementId)
        if (index !== -1) {
          requirementList.value[index] = response.data
        }
        
        // 更新当前需求信息
        if (currentRequirement.value?.id === requirementId) {
          currentRequirement.value = response.data
        }
        
        // 更新我的需求列表
        const myIndex = myRequirements.value.findIndex(requirement => requirement.id === requirementId)
        if (myIndex !== -1) {
          myRequirements.value[myIndex] = response.data
        }
        
        // 更新统计信息
        updateStatistics()
        
        return true
      } else {
        ElMessage.error(response.message || '需求更新失败')
        return false
      }
    } catch (error: any) {
      console.error('更新需求错误:', error)
      ElMessage.error(error.message || '需求更新失败')
      return false
    }
  }

  /**
   * 删除需求
   */
  const deleteRequirement = async (requirementId: string): Promise<boolean> => {
    try {
      const response = await requirementApi.deleteRequirement(requirementId)
      
      if (response.success) {
        ElMessage.success('需求删除成功')
        
        // 从列表中移除需求
        const index = requirementList.value.findIndex(requirement => requirement.id === requirementId)
        if (index !== -1) {
          requirementList.value.splice(index, 1)
          total.value--
        }
        
        // 从选中列表中移除
        const selectedIndex = selectedRequirements.value.findIndex(requirement => requirement.id === requirementId)
        if (selectedIndex !== -1) {
          selectedRequirements.value.splice(selectedIndex, 1)
        }
        
        // 清除当前需求
        if (currentRequirement.value?.id === requirementId) {
          currentRequirement.value = null
        }
        
        // 从我的需求列表中移除
        const myIndex = myRequirements.value.findIndex(requirement => requirement.id === requirementId)
        if (myIndex !== -1) {
          myRequirements.value.splice(myIndex, 1)
        }
        
        // 更新统计信息
        updateStatistics()
        
        return true
      } else {
        ElMessage.error(response.message || '需求删除失败')
        return false
      }
    } catch (error: any) {
      console.error('删除需求错误:', error)
      ElMessage.error(error.message || '需求删除失败')
      return false
    }
  }

  /**
   * 批量删除需求
   */
  const batchDeleteRequirements = async (requirementIds: string[]): Promise<boolean> => {
    try {
      const response = await requirementApi.batchDeleteRequirements(requirementIds)
      
      if (response.success) {
        ElMessage.success(`成功删除 ${requirementIds.length} 个需求`)
        
        // 从列表中移除需求
        requirementList.value = requirementList.value.filter(requirement => !requirementIds.includes(requirement.id))
        total.value -= requirementIds.length
        
        // 清空选中列表
        selectedRequirements.value = []
        
        // 从我的需求列表中移除
        myRequirements.value = myRequirements.value.filter(requirement => !requirementIds.includes(requirement.id))
        
        // 更新统计信息
        updateStatistics()
        
        return true
      } else {
        ElMessage.error(response.message || '批量删除失败')
        return false
      }
    } catch (error: any) {
      console.error('批量删除需求错误:', error)
      ElMessage.error(error.message || '批量删除失败')
      return false
    }
  }

  /**
   * 更新需求状态
   */
  const updateRequirementStatus = async (requirementId: string, status: string): Promise<boolean> => {
    try {
      const response = await requirementApi.updateRequirementStatus(requirementId, status)
      
      if (response.success) {
        ElMessage.success('需求状态更新成功')
        
        // 更新需求状态
        const index = requirementList.value.findIndex(requirement => requirement.id === requirementId)
        if (index !== -1) {
          requirementList.value[index].status = status
        }
        
        if (currentRequirement.value?.id === requirementId) {
          currentRequirement.value.status = status
        }
        
        // 更新统计信息
        updateStatistics()
        
        return true
      } else {
        ElMessage.error(response.message || '状态更新失败')
        return false
      }
    } catch (error: any) {
      console.error('更新需求状态错误:', error)
      ElMessage.error(error.message || '状态更新失败')
      return false
    }
  }

  /**
   * 分配需求
   */
  const assignRequirement = async (requirementId: string, assigneeId: string): Promise<boolean> => {
    try {
      const response = await requirementApi.assignRequirement(requirementId, assigneeId)
      
      if (response.success) {
        ElMessage.success('需求分配成功')
        
        // 更新需求分配信息
        const index = requirementList.value.findIndex(requirement => requirement.id === requirementId)
        if (index !== -1) {
          requirementList.value[index].assigneeId = assigneeId
        }
        
        if (currentRequirement.value?.id === requirementId) {
          currentRequirement.value.assigneeId = assigneeId
        }
        
        return true
      } else {
        ElMessage.error(response.message || '需求分配失败')
        return false
      }
    } catch (error: any) {
      console.error('分配需求错误:', error)
      ElMessage.error(error.message || '需求分配失败')
      return false
    }
  }

  /**
   * 获取我的需求
   */
  const fetchMyRequirements = async () => {
    try {
      const response = await requirementApi.getMyRequirements()
      
      if (response.success && response.data) {
        myRequirements.value = response.data
      } else {
        ElMessage.error(response.message || '获取我的需求失败')
      }
    } catch (error: any) {
      console.error('获取我的需求错误:', error)
      ElMessage.error(error.message || '获取我的需求失败')
    }
  }

  /**
   * 获取需求统计信息
   */
  const fetchRequirementStatistics = async (projectId?: string) => {
    try {
      const response = await requirementApi.getRequirementStatistics(projectId)
      
      if (response.success && response.data) {
        statistics.value = response.data
      } else {
        ElMessage.error(response.message || '获取统计信息失败')
      }
    } catch (error: any) {
      console.error('获取需求统计错误:', error)
      ElMessage.error(error.message || '获取统计信息失败')
    }
  }

  /**
   * 更新统计信息
   */
  const updateStatistics = () => {
    statistics.value = {
      total: requirementList.value.length,
      pending: requirementList.value.filter(r => r.status === 'pending').length,
      inProgress: requirementList.value.filter(r => r.status === 'in_progress').length,
      completed: requirementList.value.filter(r => r.status === 'completed').length,
      rejected: requirementList.value.filter(r => r.status === 'rejected').length
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
  const setFilters = (newFilters: Partial<RequirementState['filters']>) => {
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
   * 选择需求
   */
  const selectRequirement = (requirement: Requirement) => {
    const index = selectedRequirements.value.findIndex(r => r.id === requirement.id)
    if (index === -1) {
      selectedRequirements.value.push(requirement)
    }
  }

  /**
   * 取消选择需求
   */
  const unselectRequirement = (requirementId: string) => {
    const index = selectedRequirements.value.findIndex(r => r.id === requirementId)
    if (index !== -1) {
      selectedRequirements.value.splice(index, 1)
    }
  }

  /**
   * 切换需求选择状态
   */
  const toggleRequirementSelection = (requirement: Requirement) => {
    const index = selectedRequirements.value.findIndex(r => r.id === requirement.id)
    if (index === -1) {
      selectedRequirements.value.push(requirement)
    } else {
      selectedRequirements.value.splice(index, 1)
    }
  }

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = () => {
    if (isAllSelected.value) {
      selectedRequirements.value = []
    } else {
      selectedRequirements.value = [...requirementList.value]
    }
  }

  /**
   * 清空选择
   */
  const clearSelection = () => {
    selectedRequirements.value = []
  }

  /**
   * 搜索需求
   */
  const searchRequirements = async (keyword: string) => {
    setSearchKeyword(keyword)
    setCurrentPage(1)
    await fetchRequirementList()
  }

  /**
   * 筛选需求
   */
  const filterRequirements = async (filterParams: Partial<RequirementState['filters']>) => {
    setFilters(filterParams)
    setCurrentPage(1)
    await fetchRequirementList()
  }

  /**
   * 刷新需求列表
   */
  const refreshRequirementList = async () => {
    await fetchRequirementList()
  }

  /**
   * 重置状态
   */
  const $reset = () => {
    requirementList.value = []
    total.value = 0
    currentPage.value = 1
    pageSize.value = 20
    loading.value = false
    searchKeyword.value = ''
    filters.value = {}
    selectedRequirements.value = []
    currentRequirement.value = null
    detailLoading.value = false
    myRequirements.value = []
    statistics.value = {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      rejected: 0
    }
  }

  return {
    // 状态
    requirementList,
    total,
    currentPage,
    pageSize,
    loading,
    searchKeyword,
    filters,
    selectedRequirements,
    currentRequirement,
    detailLoading,
    myRequirements,
    statistics,

    // 计算属性
    totalPages,
    hasRequirements,
    selectedRequirementIds,
    isAllSelected,
    isIndeterminate,
    pendingRequirements,
    inProgressRequirements,
    completedRequirements,
    highPriorityRequirements,

    // 动作
    fetchRequirementList,
    fetchRequirementDetail,
    createRequirement,
    updateRequirement,
    deleteRequirement,
    batchDeleteRequirements,
    updateRequirementStatus,
    assignRequirement,
    fetchMyRequirements,
    fetchRequirementStatistics,
    updateStatistics,
    setSearchKeyword,
    setFilters,
    clearFilters,
    setCurrentPage,
    setPageSize,
    selectRequirement,
    unselectRequirement,
    toggleRequirementSelection,
    toggleSelectAll,
    clearSelection,
    searchRequirements,
    filterRequirements,
    refreshRequirementList,
    $reset
  }
})