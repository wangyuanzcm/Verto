import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { prototypeApi } from '@/api'
import type { Prototype, PrototypeListParams, PrototypeCreateRequest, PrototypeUpdateRequest } from '@/api/types'
import { ElMessage } from 'element-plus'

/**
 * 原型设计状态
 * 管理原型列表、原型操作等状态
 */

export interface PrototypeState {
  // 原型列表
  prototypeList: Prototype[]
  // 原型总数
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
    type?: string
    projectId?: string
    creatorId?: string
  }
  // 选中的原型
  selectedPrototypes: Prototype[]
  // 当前原型详情
  currentPrototype: Prototype | null
  // 原型详情加载状态
  detailLoading: boolean
  // 我的原型列表
  myPrototypes: Prototype[]
  // 最近访问的原型
  recentPrototypes: Prototype[]
  // 原型编辑器状态
  editorState: {
    isEditing: boolean
    isDirty: boolean
    selectedElements: string[]
    clipboard: any[]
    history: any[]
    historyIndex: number
  }
}

export const usePrototypeStore = defineStore('prototype', () => {
  // 状态定义
  const prototypeList = ref<Prototype[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const loading = ref(false)
  const searchKeyword = ref('')
  const filters = ref<PrototypeState['filters']>({})
  const selectedPrototypes = ref<Prototype[]>([])
  const currentPrototype = ref<Prototype | null>(null)
  const detailLoading = ref(false)
  const myPrototypes = ref<Prototype[]>([])
  const recentPrototypes = ref<Prototype[]>([])
  const editorState = ref<PrototypeState['editorState']>({
    isEditing: false,
    isDirty: false,
    selectedElements: [],
    clipboard: [],
    history: [],
    historyIndex: -1
  })

  // 计算属性
  const totalPages = computed(() => {
    return Math.ceil(total.value / pageSize.value)
  })

  const hasPrototypes = computed(() => {
    return prototypeList.value.length > 0
  })

  const selectedPrototypeIds = computed(() => {
    return selectedPrototypes.value.map(prototype => prototype.id)
  })

  const isAllSelected = computed(() => {
    return prototypeList.value.length > 0 && selectedPrototypes.value.length === prototypeList.value.length
  })

  const isIndeterminate = computed(() => {
    return selectedPrototypes.value.length > 0 && selectedPrototypes.value.length < prototypeList.value.length
  })

  const draftPrototypes = computed(() => {
    return prototypeList.value.filter(prototype => prototype.status === 'draft')
  })

  const publishedPrototypes = computed(() => {
    return prototypeList.value.filter(prototype => prototype.status === 'published')
  })

  const archivedPrototypes = computed(() => {
    return prototypeList.value.filter(prototype => prototype.status === 'archived')
  })

  const canUndo = computed(() => {
    return editorState.value.historyIndex > 0
  })

  const canRedo = computed(() => {
    return editorState.value.historyIndex < editorState.value.history.length - 1
  })

  // 动作方法
  /**
   * 获取原型列表
   */
  const fetchPrototypeList = async (params?: Partial<PrototypeListParams>) => {
    try {
      loading.value = true
      
      const requestParams: PrototypeListParams = {
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value,
        ...filters.value,
        ...params
      }
      
      const response = await prototypeApi.getPrototypeList(requestParams)
      
      if (response.success && response.data) {
        prototypeList.value = response.data.list
        total.value = response.data.total
        currentPage.value = response.data.page
        pageSize.value = response.data.pageSize
      } else {
        ElMessage.error(response.message || '获取原型列表失败')
      }
    } catch (error: any) {
      console.error('获取原型列表错误:', error)
      ElMessage.error(error.message || '获取原型列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取原型详情
   */
  const fetchPrototypeDetail = async (prototypeId: string) => {
    try {
      detailLoading.value = true
      
      const response = await prototypeApi.getPrototypeDetail(prototypeId)
      
      if (response.success && response.data) {
        currentPrototype.value = response.data
        // 添加到最近访问列表
        addToRecentPrototypes(response.data)
      } else {
        ElMessage.error(response.message || '获取原型详情失败')
      }
    } catch (error: any) {
      console.error('获取原型详情错误:', error)
      ElMessage.error(error.message || '获取原型详情失败')
    } finally {
      detailLoading.value = false
    }
  }

  /**
   * 创建原型
   */
  const createPrototype = async (prototypeData: PrototypeCreateRequest): Promise<boolean> => {
    try {
      const response = await prototypeApi.createPrototype(prototypeData)
      
      if (response.success && response.data) {
        ElMessage.success('原型创建成功')
        // 添加到列表开头
        prototypeList.value.unshift(response.data)
        total.value++
        return true
      } else {
        ElMessage.error(response.message || '原型创建失败')
        return false
      }
    } catch (error: any) {
      console.error('创建原型错误:', error)
      ElMessage.error(error.message || '原型创建失败')
      return false
    }
  }

  /**
   * 更新原型
   */
  const updatePrototype = async (prototypeId: string, prototypeData: PrototypeUpdateRequest): Promise<boolean> => {
    try {
      const response = await prototypeApi.updatePrototype(prototypeId, prototypeData)
      
      if (response.success && response.data) {
        ElMessage.success('原型更新成功')
        
        // 更新列表中的原型信息
        const index = prototypeList.value.findIndex(prototype => prototype.id === prototypeId)
        if (index !== -1) {
          prototypeList.value[index] = response.data
        }
        
        // 更新当前原型信息
        if (currentPrototype.value?.id === prototypeId) {
          currentPrototype.value = response.data
        }
        
        // 更新我的原型列表
        const myIndex = myPrototypes.value.findIndex(prototype => prototype.id === prototypeId)
        if (myIndex !== -1) {
          myPrototypes.value[myIndex] = response.data
        }
        
        // 标记为已保存
        editorState.value.isDirty = false
        
        return true
      } else {
        ElMessage.error(response.message || '原型更新失败')
        return false
      }
    } catch (error: any) {
      console.error('更新原型错误:', error)
      ElMessage.error(error.message || '原型更新失败')
      return false
    }
  }

  /**
   * 删除原型
   */
  const deletePrototype = async (prototypeId: string): Promise<boolean> => {
    try {
      const response = await prototypeApi.deletePrototype(prototypeId)
      
      if (response.success) {
        ElMessage.success('原型删除成功')
        
        // 从列表中移除原型
        const index = prototypeList.value.findIndex(prototype => prototype.id === prototypeId)
        if (index !== -1) {
          prototypeList.value.splice(index, 1)
          total.value--
        }
        
        // 从选中列表中移除
        const selectedIndex = selectedPrototypes.value.findIndex(prototype => prototype.id === prototypeId)
        if (selectedIndex !== -1) {
          selectedPrototypes.value.splice(selectedIndex, 1)
        }
        
        // 清除当前原型
        if (currentPrototype.value?.id === prototypeId) {
          currentPrototype.value = null
        }
        
        // 从我的原型列表中移除
        const myIndex = myPrototypes.value.findIndex(prototype => prototype.id === prototypeId)
        if (myIndex !== -1) {
          myPrototypes.value.splice(myIndex, 1)
        }
        
        // 从最近访问列表中移除
        const recentIndex = recentPrototypes.value.findIndex(prototype => prototype.id === prototypeId)
        if (recentIndex !== -1) {
          recentPrototypes.value.splice(recentIndex, 1)
        }
        
        return true
      } else {
        ElMessage.error(response.message || '原型删除失败')
        return false
      }
    } catch (error: any) {
      console.error('删除原型错误:', error)
      ElMessage.error(error.message || '原型删除失败')
      return false
    }
  }

  /**
   * 批量删除原型
   */
  const batchDeletePrototypes = async (prototypeIds: string[]): Promise<boolean> => {
    try {
      const response = await prototypeApi.batchDeletePrototypes(prototypeIds)
      
      if (response.success) {
        ElMessage.success(`成功删除 ${prototypeIds.length} 个原型`)
        
        // 从列表中移除原型
        prototypeList.value = prototypeList.value.filter(prototype => !prototypeIds.includes(prototype.id))
        total.value -= prototypeIds.length
        
        // 清空选中列表
        selectedPrototypes.value = []
        
        // 从我的原型列表中移除
        myPrototypes.value = myPrototypes.value.filter(prototype => !prototypeIds.includes(prototype.id))
        
        // 从最近访问列表中移除
        recentPrototypes.value = recentPrototypes.value.filter(prototype => !prototypeIds.includes(prototype.id))
        
        return true
      } else {
        ElMessage.error(response.message || '批量删除失败')
        return false
      }
    } catch (error: any) {
      console.error('批量删除原型错误:', error)
      ElMessage.error(error.message || '批量删除失败')
      return false
    }
  }

  /**
   * 发布原型
   */
  const publishPrototype = async (prototypeId: string): Promise<boolean> => {
    try {
      const response = await prototypeApi.publishPrototype(prototypeId)
      
      if (response.success) {
        ElMessage.success('原型发布成功')
        
        // 更新原型状态
        const index = prototypeList.value.findIndex(prototype => prototype.id === prototypeId)
        if (index !== -1) {
          prototypeList.value[index].status = 'published'
        }
        
        if (currentPrototype.value?.id === prototypeId) {
          currentPrototype.value.status = 'published'
        }
        
        return true
      } else {
        ElMessage.error(response.message || '发布失败')
        return false
      }
    } catch (error: any) {
      console.error('发布原型错误:', error)
      ElMessage.error(error.message || '发布失败')
      return false
    }
  }

  /**
   * 归档原型
   */
  const archivePrototype = async (prototypeId: string): Promise<boolean> => {
    try {
      const response = await prototypeApi.archivePrototype(prototypeId)
      
      if (response.success) {
        ElMessage.success('原型已归档')
        
        // 更新原型状态
        const index = prototypeList.value.findIndex(prototype => prototype.id === prototypeId)
        if (index !== -1) {
          prototypeList.value[index].status = 'archived'
        }
        
        if (currentPrototype.value?.id === prototypeId) {
          currentPrototype.value.status = 'archived'
        }
        
        return true
      } else {
        ElMessage.error(response.message || '归档失败')
        return false
      }
    } catch (error: any) {
      console.error('归档原型错误:', error)
      ElMessage.error(error.message || '归档失败')
      return false
    }
  }

  /**
   * 复制原型
   */
  const duplicatePrototype = async (prototypeId: string): Promise<boolean> => {
    try {
      const response = await prototypeApi.duplicatePrototype(prototypeId)
      
      if (response.success && response.data) {
        ElMessage.success('原型复制成功')
        
        // 添加到列表开头
        prototypeList.value.unshift(response.data)
        total.value++
        
        return true
      } else {
        ElMessage.error(response.message || '复制失败')
        return false
      }
    } catch (error: any) {
      console.error('复制原型错误:', error)
      ElMessage.error(error.message || '复制失败')
      return false
    }
  }

  /**
   * 获取我的原型
   */
  const fetchMyPrototypes = async () => {
    try {
      const response = await prototypeApi.getMyPrototypes()
      
      if (response.success && response.data) {
        myPrototypes.value = response.data
      } else {
        ElMessage.error(response.message || '获取我的原型失败')
      }
    } catch (error: any) {
      console.error('获取我的原型错误:', error)
      ElMessage.error(error.message || '获取我的原型失败')
    }
  }

  /**
   * 添加到最近访问
   */
  const addToRecentPrototypes = (prototype: Prototype) => {
    // 移除已存在的原型
    const index = recentPrototypes.value.findIndex(p => p.id === prototype.id)
    if (index !== -1) {
      recentPrototypes.value.splice(index, 1)
    }
    
    // 添加到开头
    recentPrototypes.value.unshift(prototype)
    
    // 限制最多10个
    if (recentPrototypes.value.length > 10) {
      recentPrototypes.value = recentPrototypes.value.slice(0, 10)
    }
  }

  /**
   * 开始编辑
   */
  const startEditing = () => {
    editorState.value.isEditing = true
    editorState.value.isDirty = false
  }

  /**
   * 停止编辑
   */
  const stopEditing = () => {
    editorState.value.isEditing = false
    editorState.value.isDirty = false
    editorState.value.selectedElements = []
  }

  /**
   * 标记为已修改
   */
  const markAsDirty = () => {
    editorState.value.isDirty = true
  }

  /**
   * 添加历史记录
   */
  const addToHistory = (action: any) => {
    // 移除当前位置之后的历史记录
    editorState.value.history = editorState.value.history.slice(0, editorState.value.historyIndex + 1)
    
    // 添加新的历史记录
    editorState.value.history.push(action)
    editorState.value.historyIndex++
    
    // 限制历史记录数量
    if (editorState.value.history.length > 50) {
      editorState.value.history.shift()
      editorState.value.historyIndex--
    }
    
    markAsDirty()
  }

  /**
   * 撤销操作
   */
  const undo = () => {
    if (canUndo.value) {
      editorState.value.historyIndex--
      markAsDirty()
      return editorState.value.history[editorState.value.historyIndex]
    }
    return null
  }

  /**
   * 重做操作
   */
  const redo = () => {
    if (canRedo.value) {
      editorState.value.historyIndex++
      markAsDirty()
      return editorState.value.history[editorState.value.historyIndex]
    }
    return null
  }

  /**
   * 选择元素
   */
  const selectElements = (elementIds: string[]) => {
    editorState.value.selectedElements = elementIds
  }

  /**
   * 复制元素到剪贴板
   */
  const copyToClipboard = (elements: any[]) => {
    editorState.value.clipboard = elements
  }

  /**
   * 从剪贴板粘贴
   */
  const pasteFromClipboard = () => {
    return editorState.value.clipboard
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
  const setFilters = (newFilters: Partial<PrototypeState['filters']>) => {
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
   * 选择原型
   */
  const selectPrototype = (prototype: Prototype) => {
    const index = selectedPrototypes.value.findIndex(p => p.id === prototype.id)
    if (index === -1) {
      selectedPrototypes.value.push(prototype)
    }
  }

  /**
   * 取消选择原型
   */
  const unselectPrototype = (prototypeId: string) => {
    const index = selectedPrototypes.value.findIndex(p => p.id === prototypeId)
    if (index !== -1) {
      selectedPrototypes.value.splice(index, 1)
    }
  }

  /**
   * 切换原型选择状态
   */
  const togglePrototypeSelection = (prototype: Prototype) => {
    const index = selectedPrototypes.value.findIndex(p => p.id === prototype.id)
    if (index === -1) {
      selectedPrototypes.value.push(prototype)
    } else {
      selectedPrototypes.value.splice(index, 1)
    }
  }

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = () => {
    if (isAllSelected.value) {
      selectedPrototypes.value = []
    } else {
      selectedPrototypes.value = [...prototypeList.value]
    }
  }

  /**
   * 清空选择
   */
  const clearSelection = () => {
    selectedPrototypes.value = []
  }

  /**
   * 搜索原型
   */
  const searchPrototypes = async (keyword: string) => {
    setSearchKeyword(keyword)
    setCurrentPage(1)
    await fetchPrototypeList()
  }

  /**
   * 筛选原型
   */
  const filterPrototypes = async (filterParams: Partial<PrototypeState['filters']>) => {
    setFilters(filterParams)
    setCurrentPage(1)
    await fetchPrototypeList()
  }

  /**
   * 刷新原型列表
   */
  const refreshPrototypeList = async () => {
    await fetchPrototypeList()
  }

  /**
   * 重置状态
   */
  const $reset = () => {
    prototypeList.value = []
    total.value = 0
    currentPage.value = 1
    pageSize.value = 20
    loading.value = false
    searchKeyword.value = ''
    filters.value = {}
    selectedPrototypes.value = []
    currentPrototype.value = null
    detailLoading.value = false
    myPrototypes.value = []
    recentPrototypes.value = []
    editorState.value = {
      isEditing: false,
      isDirty: false,
      selectedElements: [],
      clipboard: [],
      history: [],
      historyIndex: -1
    }
  }

  return {
    // 状态
    prototypeList,
    total,
    currentPage,
    pageSize,
    loading,
    searchKeyword,
    filters,
    selectedPrototypes,
    currentPrototype,
    detailLoading,
    myPrototypes,
    recentPrototypes,
    editorState,

    // 计算属性
    totalPages,
    hasPrototypes,
    selectedPrototypeIds,
    isAllSelected,
    isIndeterminate,
    draftPrototypes,
    publishedPrototypes,
    archivedPrototypes,
    canUndo,
    canRedo,

    // 动作
    fetchPrototypeList,
    fetchPrototypeDetail,
    createPrototype,
    updatePrototype,
    deletePrototype,
    batchDeletePrototypes,
    publishPrototype,
    archivePrototype,
    duplicatePrototype,
    fetchMyPrototypes,
    addToRecentPrototypes,
    startEditing,
    stopEditing,
    markAsDirty,
    addToHistory,
    undo,
    redo,
    selectElements,
    copyToClipboard,
    pasteFromClipboard,
    setSearchKeyword,
    setFilters,
    clearFilters,
    setCurrentPage,
    setPageSize,
    selectPrototype,
    unselectPrototype,
    togglePrototypeSelection,
    toggleSelectAll,
    clearSelection,
    searchPrototypes,
    filterPrototypes,
    refreshPrototypeList,
    $reset
  }
}, {
  persist: {
    key: 'verto-prototype',
    paths: ['recentPrototypes']
  }
})