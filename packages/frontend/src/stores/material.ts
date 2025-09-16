import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { materialApi } from '@/api'
import type { Material, MaterialListParams, MaterialCreateRequest, MaterialUpdateRequest } from '@/api/types'
import { ElMessage } from 'element-plus'

/**
 * 物料管理状态
 * 管理物料库、组件等状态
 */

export interface MaterialState {
  // 物料列表
  materialList: Material[]
  // 物料总数
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
    category?: string
    type?: string
    status?: string
    tags?: string[]
  }
  // 选中的物料
  selectedMaterials: Material[]
  // 当前物料详情
  currentMaterial: Material | null
  // 物料详情加载状态
  detailLoading: boolean
  // 物料分类列表
  categories: any[]
  // 我的物料列表
  myMaterials: Material[]
  // 最近使用的物料
  recentMaterials: Material[]
  // 收藏的物料
  favoriteMaterials: Material[]
}

export const useMaterialStore = defineStore('material', () => {
  // 状态定义
  const materialList = ref<Material[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const loading = ref(false)
  const searchKeyword = ref('')
  const filters = ref<MaterialState['filters']>({})
  const selectedMaterials = ref<Material[]>([])
  const currentMaterial = ref<Material | null>(null)
  const detailLoading = ref(false)
  const categories = ref<any[]>([])
  const myMaterials = ref<Material[]>([])
  const recentMaterials = ref<Material[]>([])
  const favoriteMaterials = ref<Material[]>([])

  // 计算属性
  const totalPages = computed(() => {
    return Math.ceil(total.value / pageSize.value)
  })

  const hasMaterials = computed(() => {
    return materialList.value.length > 0
  })

  const selectedMaterialIds = computed(() => {
    return selectedMaterials.value.map(material => material.id)
  })

  const isAllSelected = computed(() => {
    return materialList.value.length > 0 && selectedMaterials.value.length === materialList.value.length
  })

  const isIndeterminate = computed(() => {
    return selectedMaterials.value.length > 0 && selectedMaterials.value.length < materialList.value.length
  })

  const componentMaterials = computed(() => {
    return materialList.value.filter(material => material.type === 'component')
  })

  const templateMaterials = computed(() => {
    return materialList.value.filter(material => material.type === 'template')
  })

  const blockMaterials = computed(() => {
    return materialList.value.filter(material => material.type === 'block')
  })

  const publicMaterials = computed(() => {
    return materialList.value.filter(material => material.status === 'public')
  })

  const privateMaterials = computed(() => {
    return materialList.value.filter(material => material.status === 'private')
  })

  // 动作方法
  /**
   * 获取物料列表
   */
  const fetchMaterialList = async (params?: Partial<MaterialListParams>) => {
    try {
      loading.value = true
      
      const requestParams: MaterialListParams = {
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value,
        ...filters.value,
        ...params
      }
      
      const response = await materialApi.getMaterialList(requestParams)
      
      if (response.success && response.data) {
        materialList.value = response.data.list
        total.value = response.data.total
        currentPage.value = response.data.page
        pageSize.value = response.data.pageSize
      } else {
        ElMessage.error(response.message || '获取物料列表失败')
      }
    } catch (error: any) {
      console.error('获取物料列表错误:', error)
      ElMessage.error(error.message || '获取物料列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取物料详情
   */
  const fetchMaterialDetail = async (materialId: string) => {
    try {
      detailLoading.value = true
      
      const response = await materialApi.getMaterialDetail(materialId)
      
      if (response.success && response.data) {
        currentMaterial.value = response.data
        // 添加到最近使用列表
        addToRecentMaterials(response.data)
      } else {
        ElMessage.error(response.message || '获取物料详情失败')
      }
    } catch (error: any) {
      console.error('获取物料详情错误:', error)
      ElMessage.error(error.message || '获取物料详情失败')
    } finally {
      detailLoading.value = false
    }
  }

  /**
   * 创建物料
   */
  const createMaterial = async (materialData: MaterialCreateRequest): Promise<boolean> => {
    try {
      const response = await materialApi.createMaterial(materialData)
      
      if (response.success && response.data) {
        ElMessage.success('物料创建成功')
        // 添加到列表开头
        materialList.value.unshift(response.data)
        total.value++
        return true
      } else {
        ElMessage.error(response.message || '物料创建失败')
        return false
      }
    } catch (error: any) {
      console.error('创建物料错误:', error)
      ElMessage.error(error.message || '物料创建失败')
      return false
    }
  }

  /**
   * 更新物料
   */
  const updateMaterial = async (materialId: string, materialData: MaterialUpdateRequest): Promise<boolean> => {
    try {
      const response = await materialApi.updateMaterial(materialId, materialData)
      
      if (response.success && response.data) {
        ElMessage.success('物料更新成功')
        
        // 更新列表中的物料信息
        const index = materialList.value.findIndex(material => material.id === materialId)
        if (index !== -1) {
          materialList.value[index] = response.data
        }
        
        // 更新当前物料信息
        if (currentMaterial.value?.id === materialId) {
          currentMaterial.value = response.data
        }
        
        // 更新我的物料列表
        const myIndex = myMaterials.value.findIndex(material => material.id === materialId)
        if (myIndex !== -1) {
          myMaterials.value[myIndex] = response.data
        }
        
        return true
      } else {
        ElMessage.error(response.message || '物料更新失败')
        return false
      }
    } catch (error: any) {
      console.error('更新物料错误:', error)
      ElMessage.error(error.message || '物料更新失败')
      return false
    }
  }

  /**
   * 删除物料
   */
  const deleteMaterial = async (materialId: string): Promise<boolean> => {
    try {
      const response = await materialApi.deleteMaterial(materialId)
      
      if (response.success) {
        ElMessage.success('物料删除成功')
        
        // 从列表中移除物料
        const index = materialList.value.findIndex(material => material.id === materialId)
        if (index !== -1) {
          materialList.value.splice(index, 1)
          total.value--
        }
        
        // 从选中列表中移除
        const selectedIndex = selectedMaterials.value.findIndex(material => material.id === materialId)
        if (selectedIndex !== -1) {
          selectedMaterials.value.splice(selectedIndex, 1)
        }
        
        // 清除当前物料
        if (currentMaterial.value?.id === materialId) {
          currentMaterial.value = null
        }
        
        // 从我的物料列表中移除
        const myIndex = myMaterials.value.findIndex(material => material.id === materialId)
        if (myIndex !== -1) {
          myMaterials.value.splice(myIndex, 1)
        }
        
        // 从最近使用列表中移除
        const recentIndex = recentMaterials.value.findIndex(material => material.id === materialId)
        if (recentIndex !== -1) {
          recentMaterials.value.splice(recentIndex, 1)
        }
        
        // 从收藏列表中移除
        const favoriteIndex = favoriteMaterials.value.findIndex(material => material.id === materialId)
        if (favoriteIndex !== -1) {
          favoriteMaterials.value.splice(favoriteIndex, 1)
        }
        
        return true
      } else {
        ElMessage.error(response.message || '物料删除失败')
        return false
      }
    } catch (error: any) {
      console.error('删除物料错误:', error)
      ElMessage.error(error.message || '物料删除失败')
      return false
    }
  }

  /**
   * 批量删除物料
   */
  const batchDeleteMaterials = async (materialIds: string[]): Promise<boolean> => {
    try {
      const response = await materialApi.batchDeleteMaterials(materialIds)
      
      if (response.success) {
        ElMessage.success(`成功删除 ${materialIds.length} 个物料`)
        
        // 从列表中移除物料
        materialList.value = materialList.value.filter(material => !materialIds.includes(material.id))
        total.value -= materialIds.length
        
        // 清空选中列表
        selectedMaterials.value = []
        
        // 从我的物料列表中移除
        myMaterials.value = myMaterials.value.filter(material => !materialIds.includes(material.id))
        
        // 从最近使用列表中移除
        recentMaterials.value = recentMaterials.value.filter(material => !materialIds.includes(material.id))
        
        // 从收藏列表中移除
        favoriteMaterials.value = favoriteMaterials.value.filter(material => !materialIds.includes(material.id))
        
        return true
      } else {
        ElMessage.error(response.message || '批量删除失败')
        return false
      }
    } catch (error: any) {
      console.error('批量删除物料错误:', error)
      ElMessage.error(error.message || '批量删除失败')
      return false
    }
  }

  /**
   * 发布物料
   */
  const publishMaterial = async (materialId: string): Promise<boolean> => {
    try {
      const response = await materialApi.publishMaterial(materialId)
      
      if (response.success) {
        ElMessage.success('物料发布成功')
        
        // 更新物料状态
        const index = materialList.value.findIndex(material => material.id === materialId)
        if (index !== -1) {
          materialList.value[index].status = 'public'
        }
        
        if (currentMaterial.value?.id === materialId) {
          currentMaterial.value.status = 'public'
        }
        
        return true
      } else {
        ElMessage.error(response.message || '发布失败')
        return false
      }
    } catch (error: any) {
      console.error('发布物料错误:', error)
      ElMessage.error(error.message || '发布失败')
      return false
    }
  }

  /**
   * 下架物料
   */
  const unpublishMaterial = async (materialId: string): Promise<boolean> => {
    try {
      const response = await materialApi.unpublishMaterial(materialId)
      
      if (response.success) {
        ElMessage.success('物料已下架')
        
        // 更新物料状态
        const index = materialList.value.findIndex(material => material.id === materialId)
        if (index !== -1) {
          materialList.value[index].status = 'private'
        }
        
        if (currentMaterial.value?.id === materialId) {
          currentMaterial.value.status = 'private'
        }
        
        return true
      } else {
        ElMessage.error(response.message || '下架失败')
        return false
      }
    } catch (error: any) {
      console.error('下架物料错误:', error)
      ElMessage.error(error.message || '下架失败')
      return false
    }
  }

  /**
   * 收藏物料
   */
  const favoriteMaterial = async (materialId: string): Promise<boolean> => {
    try {
      const response = await materialApi.favoriteMaterial(materialId)
      
      if (response.success) {
        ElMessage.success('收藏成功')
        
        // 添加到收藏列表
        const material = materialList.value.find(m => m.id === materialId)
        if (material && !favoriteMaterials.value.find(m => m.id === materialId)) {
          favoriteMaterials.value.unshift(material)
        }
        
        return true
      } else {
        ElMessage.error(response.message || '收藏失败')
        return false
      }
    } catch (error: any) {
      console.error('收藏物料错误:', error)
      ElMessage.error(error.message || '收藏失败')
      return false
    }
  }

  /**
   * 取消收藏物料
   */
  const unfavoriteMaterial = async (materialId: string): Promise<boolean> => {
    try {
      const response = await materialApi.unfavoriteMaterial(materialId)
      
      if (response.success) {
        ElMessage.success('取消收藏成功')
        
        // 从收藏列表中移除
        const index = favoriteMaterials.value.findIndex(material => material.id === materialId)
        if (index !== -1) {
          favoriteMaterials.value.splice(index, 1)
        }
        
        return true
      } else {
        ElMessage.error(response.message || '取消收藏失败')
        return false
      }
    } catch (error: any) {
      console.error('取消收藏物料错误:', error)
      ElMessage.error(error.message || '取消收藏失败')
      return false
    }
  }

  /**
   * 复制物料
   */
  const duplicateMaterial = async (materialId: string): Promise<boolean> => {
    try {
      const response = await materialApi.duplicateMaterial(materialId)
      
      if (response.success && response.data) {
        ElMessage.success('物料复制成功')
        
        // 添加到列表开头
        materialList.value.unshift(response.data)
        total.value++
        
        return true
      } else {
        ElMessage.error(response.message || '复制失败')
        return false
      }
    } catch (error: any) {
      console.error('复制物料错误:', error)
      ElMessage.error(error.message || '复制失败')
      return false
    }
  }

  /**
   * 获取物料分类
   */
  const fetchMaterialCategories = async () => {
    try {
      const response = await materialApi.getMaterialCategories()
      
      if (response.success && response.data) {
        categories.value = response.data
      } else {
        ElMessage.error(response.message || '获取分类失败')
      }
    } catch (error: any) {
      console.error('获取物料分类错误:', error)
      ElMessage.error(error.message || '获取分类失败')
    }
  }

  /**
   * 获取我的物料
   */
  const fetchMyMaterials = async () => {
    try {
      const response = await materialApi.getMyMaterials()
      
      if (response.success && response.data) {
        myMaterials.value = response.data
      } else {
        ElMessage.error(response.message || '获取我的物料失败')
      }
    } catch (error: any) {
      console.error('获取我的物料错误:', error)
      ElMessage.error(error.message || '获取我的物料失败')
    }
  }

  /**
   * 获取收藏的物料
   */
  const fetchFavoriteMaterials = async () => {
    try {
      const response = await materialApi.getFavoriteMaterials()
      
      if (response.success && response.data) {
        favoriteMaterials.value = response.data
      } else {
        ElMessage.error(response.message || '获取收藏物料失败')
      }
    } catch (error: any) {
      console.error('获取收藏物料错误:', error)
      ElMessage.error(error.message || '获取收藏物料失败')
    }
  }

  /**
   * 添加到最近使用
   */
  const addToRecentMaterials = (material: Material) => {
    // 移除已存在的物料
    const index = recentMaterials.value.findIndex(m => m.id === material.id)
    if (index !== -1) {
      recentMaterials.value.splice(index, 1)
    }
    
    // 添加到开头
    recentMaterials.value.unshift(material)
    
    // 限制最多20个
    if (recentMaterials.value.length > 20) {
      recentMaterials.value = recentMaterials.value.slice(0, 20)
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
  const setFilters = (newFilters: Partial<MaterialState['filters']>) => {
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
   * 选择物料
   */
  const selectMaterial = (material: Material) => {
    const index = selectedMaterials.value.findIndex(m => m.id === material.id)
    if (index === -1) {
      selectedMaterials.value.push(material)
    }
  }

  /**
   * 取消选择物料
   */
  const unselectMaterial = (materialId: string) => {
    const index = selectedMaterials.value.findIndex(m => m.id === materialId)
    if (index !== -1) {
      selectedMaterials.value.splice(index, 1)
    }
  }

  /**
   * 切换物料选择状态
   */
  const toggleMaterialSelection = (material: Material) => {
    const index = selectedMaterials.value.findIndex(m => m.id === material.id)
    if (index === -1) {
      selectedMaterials.value.push(material)
    } else {
      selectedMaterials.value.splice(index, 1)
    }
  }

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = () => {
    if (isAllSelected.value) {
      selectedMaterials.value = []
    } else {
      selectedMaterials.value = [...materialList.value]
    }
  }

  /**
   * 清空选择
   */
  const clearSelection = () => {
    selectedMaterials.value = []
  }

  /**
   * 搜索物料
   */
  const searchMaterials = async (keyword: string) => {
    setSearchKeyword(keyword)
    setCurrentPage(1)
    await fetchMaterialList()
  }

  /**
   * 筛选物料
   */
  const filterMaterials = async (filterParams: Partial<MaterialState['filters']>) => {
    setFilters(filterParams)
    setCurrentPage(1)
    await fetchMaterialList()
  }

  /**
   * 刷新物料列表
   */
  const refreshMaterialList = async () => {
    await fetchMaterialList()
  }

  /**
   * 重置状态
   */
  const $reset = () => {
    materialList.value = []
    total.value = 0
    currentPage.value = 1
    pageSize.value = 20
    loading.value = false
    searchKeyword.value = ''
    filters.value = {}
    selectedMaterials.value = []
    currentMaterial.value = null
    detailLoading.value = false
    categories.value = []
    myMaterials.value = []
    recentMaterials.value = []
    favoriteMaterials.value = []
  }

  return {
    // 状态
    materialList,
    total,
    currentPage,
    pageSize,
    loading,
    searchKeyword,
    filters,
    selectedMaterials,
    currentMaterial,
    detailLoading,
    categories,
    myMaterials,
    recentMaterials,
    favoriteMaterials,

    // 计算属性
    totalPages,
    hasMaterials,
    selectedMaterialIds,
    isAllSelected,
    isIndeterminate,
    componentMaterials,
    templateMaterials,
    blockMaterials,
    publicMaterials,
    privateMaterials,

    // 动作
    fetchMaterialList,
    fetchMaterialDetail,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    batchDeleteMaterials,
    publishMaterial,
    unpublishMaterial,
    favoriteMaterial,
    unfavoriteMaterial,
    duplicateMaterial,
    fetchMaterialCategories,
    fetchMyMaterials,
    fetchFavoriteMaterials,
    addToRecentMaterials,
    setSearchKeyword,
    setFilters,
    clearFilters,
    setCurrentPage,
    setPageSize,
    selectMaterial,
    unselectMaterial,
    toggleMaterialSelection,
    toggleSelectAll,
    clearSelection,
    searchMaterials,
    filterMaterials,
    refreshMaterialList,
    $reset
  }
}, {
  persist: {
    key: 'verto-material',
    paths: ['recentMaterials', 'favoriteMaterials']
  }
})