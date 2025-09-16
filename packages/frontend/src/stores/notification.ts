import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationApi } from '@/api'
import type { Notification, NotificationListParams, NotificationCreateRequest, NotificationUpdateRequest } from '@/api/types'
import { ElMessage } from 'element-plus'

/**
 * 通知管理状态
 * 管理系统通知、消息等状态
 */

export interface NotificationState {
  // 通知列表
  notificationList: Notification[]
  // 通知总数
  total: number
  // 当前页码
  currentPage: number
  // 每页数量
  pageSize: number
  // 加载状态
  loading: boolean
  // 未读通知数量
  unreadCount: number
  // 筛选条件
  filters: {
    type?: string
    status?: string
    priority?: string
    startDate?: string
    endDate?: string
  }
  // 选中的通知
  selectedNotifications: Notification[]
  // 当前通知详情
  currentNotification: Notification | null
  // 通知详情加载状态
  detailLoading: boolean
  // 实时通知开关
  realTimeEnabled: boolean
  // 声音提醒开关
  soundEnabled: boolean
  // 桌面通知开关
  desktopEnabled: boolean
  // 邮件通知开关
  emailEnabled: boolean
}

export const useNotificationStore = defineStore('notification', () => {
  // 状态定义
  const notificationList = ref<Notification[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const loading = ref(false)
  const unreadCount = ref(0)
  const filters = ref<NotificationState['filters']>({})
  const selectedNotifications = ref<Notification[]>([])
  const currentNotification = ref<Notification | null>(null)
  const detailLoading = ref(false)
  const realTimeEnabled = ref(true)
  const soundEnabled = ref(true)
  const desktopEnabled = ref(true)
  const emailEnabled = ref(false)

  // 计算属性
  const totalPages = computed(() => {
    return Math.ceil(total.value / pageSize.value)
  })

  const hasNotifications = computed(() => {
    return notificationList.value.length > 0
  })

  const hasUnreadNotifications = computed(() => {
    return unreadCount.value > 0
  })

  const selectedNotificationIds = computed(() => {
    return selectedNotifications.value.map(notification => notification.id)
  })

  const isAllSelected = computed(() => {
    return notificationList.value.length > 0 && selectedNotifications.value.length === notificationList.value.length
  })

  const isIndeterminate = computed(() => {
    return selectedNotifications.value.length > 0 && selectedNotifications.value.length < notificationList.value.length
  })

  const unreadNotifications = computed(() => {
    return notificationList.value.filter(notification => !notification.isRead)
  })

  const readNotifications = computed(() => {
    return notificationList.value.filter(notification => notification.isRead)
  })

  const systemNotifications = computed(() => {
    return notificationList.value.filter(notification => notification.type === 'system')
  })

  const projectNotifications = computed(() => {
    return notificationList.value.filter(notification => notification.type === 'project')
  })

  const requirementNotifications = computed(() => {
    return notificationList.value.filter(notification => notification.type === 'requirement')
  })

  const prototypeNotifications = computed(() => {
    return notificationList.value.filter(notification => notification.type === 'prototype')
  })

  const highPriorityNotifications = computed(() => {
    return notificationList.value.filter(notification => notification.priority === 'high')
  })

  const mediumPriorityNotifications = computed(() => {
    return notificationList.value.filter(notification => notification.priority === 'medium')
  })

  const lowPriorityNotifications = computed(() => {
    return notificationList.value.filter(notification => notification.priority === 'low')
  })

  // 动作方法
  /**
   * 获取通知列表
   */
  const fetchNotificationList = async (params?: Partial<NotificationListParams>) => {
    try {
      loading.value = true
      
      const requestParams: NotificationListParams = {
        page: currentPage.value,
        pageSize: pageSize.value,
        ...filters.value,
        ...params
      }
      
      const response = await notificationApi.getNotificationList(requestParams)
      
      if (response.success && response.data) {
        notificationList.value = response.data.list
        total.value = response.data.total
        currentPage.value = response.data.page
        pageSize.value = response.data.pageSize
        unreadCount.value = response.data.unreadCount || 0
      } else {
        ElMessage.error(response.message || '获取通知列表失败')
      }
    } catch (error: any) {
      console.error('获取通知列表错误:', error)
      ElMessage.error(error.message || '获取通知列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取通知详情
   */
  const fetchNotificationDetail = async (notificationId: string) => {
    try {
      detailLoading.value = true
      
      const response = await notificationApi.getNotificationDetail(notificationId)
      
      if (response.success && response.data) {
        currentNotification.value = response.data
        
        // 如果是未读通知，标记为已读
        if (!response.data.isRead) {
          await markAsRead(notificationId)
        }
      } else {
        ElMessage.error(response.message || '获取通知详情失败')
      }
    } catch (error: any) {
      console.error('获取通知详情错误:', error)
      ElMessage.error(error.message || '获取通知详情失败')
    } finally {
      detailLoading.value = false
    }
  }

  /**
   * 创建通知
   */
  const createNotification = async (notificationData: NotificationCreateRequest): Promise<boolean> => {
    try {
      const response = await notificationApi.createNotification(notificationData)
      
      if (response.success && response.data) {
        ElMessage.success('通知创建成功')
        // 添加到列表开头
        notificationList.value.unshift(response.data)
        total.value++
        
        // 如果是未读通知，增加未读数量
        if (!response.data.isRead) {
          unreadCount.value++
        }
        
        return true
      } else {
        ElMessage.error(response.message || '通知创建失败')
        return false
      }
    } catch (error: any) {
      console.error('创建通知错误:', error)
      ElMessage.error(error.message || '通知创建失败')
      return false
    }
  }

  /**
   * 更新通知
   */
  const updateNotification = async (notificationId: string, notificationData: NotificationUpdateRequest): Promise<boolean> => {
    try {
      const response = await notificationApi.updateNotification(notificationId, notificationData)
      
      if (response.success && response.data) {
        ElMessage.success('通知更新成功')
        
        // 更新列表中的通知信息
        const index = notificationList.value.findIndex(notification => notification.id === notificationId)
        if (index !== -1) {
          notificationList.value[index] = response.data
        }
        
        // 更新当前通知信息
        if (currentNotification.value?.id === notificationId) {
          currentNotification.value = response.data
        }
        
        return true
      } else {
        ElMessage.error(response.message || '通知更新失败')
        return false
      }
    } catch (error: any) {
      console.error('更新通知错误:', error)
      ElMessage.error(error.message || '通知更新失败')
      return false
    }
  }

  /**
   * 删除通知
   */
  const deleteNotification = async (notificationId: string): Promise<boolean> => {
    try {
      const response = await notificationApi.deleteNotification(notificationId)
      
      if (response.success) {
        ElMessage.success('通知删除成功')
        
        // 从列表中移除通知
        const index = notificationList.value.findIndex(notification => notification.id === notificationId)
        if (index !== -1) {
          const notification = notificationList.value[index]
          notificationList.value.splice(index, 1)
          total.value--
          
          // 如果是未读通知，减少未读数量
          if (!notification.isRead) {
            unreadCount.value--
          }
        }
        
        // 从选中列表中移除
        const selectedIndex = selectedNotifications.value.findIndex(notification => notification.id === notificationId)
        if (selectedIndex !== -1) {
          selectedNotifications.value.splice(selectedIndex, 1)
        }
        
        // 清除当前通知
        if (currentNotification.value?.id === notificationId) {
          currentNotification.value = null
        }
        
        return true
      } else {
        ElMessage.error(response.message || '通知删除失败')
        return false
      }
    } catch (error: any) {
      console.error('删除通知错误:', error)
      ElMessage.error(error.message || '通知删除失败')
      return false
    }
  }

  /**
   * 批量删除通知
   */
  const batchDeleteNotifications = async (notificationIds: string[]): Promise<boolean> => {
    try {
      const response = await notificationApi.batchDeleteNotifications(notificationIds)
      
      if (response.success) {
        ElMessage.success(`成功删除 ${notificationIds.length} 条通知`)
        
        // 计算删除的未读通知数量
        const deletedUnreadCount = notificationList.value
          .filter(notification => notificationIds.includes(notification.id) && !notification.isRead)
          .length
        
        // 从列表中移除通知
        notificationList.value = notificationList.value.filter(notification => !notificationIds.includes(notification.id))
        total.value -= notificationIds.length
        unreadCount.value -= deletedUnreadCount
        
        // 清空选中列表
        selectedNotifications.value = []
        
        return true
      } else {
        ElMessage.error(response.message || '批量删除失败')
        return false
      }
    } catch (error: any) {
      console.error('批量删除通知错误:', error)
      ElMessage.error(error.message || '批量删除失败')
      return false
    }
  }

  /**
   * 标记为已读
   */
  const markAsRead = async (notificationId: string): Promise<boolean> => {
    try {
      const response = await notificationApi.markAsRead(notificationId)
      
      if (response.success) {
        // 更新通知状态
        const index = notificationList.value.findIndex(notification => notification.id === notificationId)
        if (index !== -1 && !notificationList.value[index].isRead) {
          notificationList.value[index].isRead = true
          notificationList.value[index].readAt = new Date().toISOString()
          unreadCount.value--
        }
        
        if (currentNotification.value?.id === notificationId && !currentNotification.value.isRead) {
          currentNotification.value.isRead = true
          currentNotification.value.readAt = new Date().toISOString()
        }
        
        return true
      } else {
        ElMessage.error(response.message || '标记已读失败')
        return false
      }
    } catch (error: any) {
      console.error('标记已读错误:', error)
      ElMessage.error(error.message || '标记已读失败')
      return false
    }
  }

  /**
   * 标记为未读
   */
  const markAsUnread = async (notificationId: string): Promise<boolean> => {
    try {
      const response = await notificationApi.markAsUnread(notificationId)
      
      if (response.success) {
        // 更新通知状态
        const index = notificationList.value.findIndex(notification => notification.id === notificationId)
        if (index !== -1 && notificationList.value[index].isRead) {
          notificationList.value[index].isRead = false
          notificationList.value[index].readAt = undefined
          unreadCount.value++
        }
        
        if (currentNotification.value?.id === notificationId && currentNotification.value.isRead) {
          currentNotification.value.isRead = false
          currentNotification.value.readAt = undefined
        }
        
        return true
      } else {
        ElMessage.error(response.message || '标记未读失败')
        return false
      }
    } catch (error: any) {
      console.error('标记未读错误:', error)
      ElMessage.error(error.message || '标记未读失败')
      return false
    }
  }

  /**
   * 批量标记为已读
   */
  const batchMarkAsRead = async (notificationIds: string[]): Promise<boolean> => {
    try {
      const response = await notificationApi.batchMarkAsRead(notificationIds)
      
      if (response.success) {
        ElMessage.success(`成功标记 ${notificationIds.length} 条通知为已读`)
        
        // 计算标记的未读通知数量
        const markedUnreadCount = notificationList.value
          .filter(notification => notificationIds.includes(notification.id) && !notification.isRead)
          .length
        
        // 更新通知状态
        notificationList.value.forEach(notification => {
          if (notificationIds.includes(notification.id) && !notification.isRead) {
            notification.isRead = true
            notification.readAt = new Date().toISOString()
          }
        })
        
        unreadCount.value -= markedUnreadCount
        
        return true
      } else {
        ElMessage.error(response.message || '批量标记已读失败')
        return false
      }
    } catch (error: any) {
      console.error('批量标记已读错误:', error)
      ElMessage.error(error.message || '批量标记已读失败')
      return false
    }
  }

  /**
   * 全部标记为已读
   */
  const markAllAsRead = async (): Promise<boolean> => {
    try {
      const response = await notificationApi.markAllAsRead()
      
      if (response.success) {
        ElMessage.success('所有通知已标记为已读')
        
        // 更新所有通知状态
        notificationList.value.forEach(notification => {
          if (!notification.isRead) {
            notification.isRead = true
            notification.readAt = new Date().toISOString()
          }
        })
        
        unreadCount.value = 0
        
        return true
      } else {
        ElMessage.error(response.message || '标记全部已读失败')
        return false
      }
    } catch (error: any) {
      console.error('标记全部已读错误:', error)
      ElMessage.error(error.message || '标记全部已读失败')
      return false
    }
  }

  /**
   * 获取未读通知数量
   */
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount()
      
      if (response.success && typeof response.data === 'number') {
        unreadCount.value = response.data
      }
    } catch (error: any) {
      console.error('获取未读数量错误:', error)
    }
  }

  /**
   * 设置筛选条件
   */
  const setFilters = (newFilters: Partial<NotificationState['filters']>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * 清除筛选条件
   */
  const clearFilters = () => {
    filters.value = {}
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
   * 选择通知
   */
  const selectNotification = (notification: Notification) => {
    const index = selectedNotifications.value.findIndex(n => n.id === notification.id)
    if (index === -1) {
      selectedNotifications.value.push(notification)
    }
  }

  /**
   * 取消选择通知
   */
  const unselectNotification = (notificationId: string) => {
    const index = selectedNotifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      selectedNotifications.value.splice(index, 1)
    }
  }

  /**
   * 切换通知选择状态
   */
  const toggleNotificationSelection = (notification: Notification) => {
    const index = selectedNotifications.value.findIndex(n => n.id === notification.id)
    if (index === -1) {
      selectedNotifications.value.push(notification)
    } else {
      selectedNotifications.value.splice(index, 1)
    }
  }

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = () => {
    if (isAllSelected.value) {
      selectedNotifications.value = []
    } else {
      selectedNotifications.value = [...notificationList.value]
    }
  }

  /**
   * 清空选择
   */
  const clearSelection = () => {
    selectedNotifications.value = []
  }

  /**
   * 筛选通知
   */
  const filterNotifications = async (filterParams: Partial<NotificationState['filters']>) => {
    setFilters(filterParams)
    setCurrentPage(1)
    await fetchNotificationList()
  }

  /**
   * 刷新通知列表
   */
  const refreshNotificationList = async () => {
    await fetchNotificationList()
  }

  /**
   * 设置通知偏好
   */
  const setNotificationPreferences = (preferences: {
    realTimeEnabled?: boolean
    soundEnabled?: boolean
    desktopEnabled?: boolean
    emailEnabled?: boolean
  }) => {
    if (preferences.realTimeEnabled !== undefined) {
      realTimeEnabled.value = preferences.realTimeEnabled
    }
    if (preferences.soundEnabled !== undefined) {
      soundEnabled.value = preferences.soundEnabled
    }
    if (preferences.desktopEnabled !== undefined) {
      desktopEnabled.value = preferences.desktopEnabled
    }
    if (preferences.emailEnabled !== undefined) {
      emailEnabled.value = preferences.emailEnabled
    }
  }

  /**
   * 显示桌面通知
   */
  const showDesktopNotification = (notification: Notification) => {
    if (!desktopEnabled.value || !('Notification' in window)) {
      return
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.content,
        icon: '/favicon.ico',
        tag: notification.id
      })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.content,
            icon: '/favicon.ico',
            tag: notification.id
          })
        }
      })
    }
  }

  /**
   * 播放通知声音
   */
  const playNotificationSound = () => {
    if (!soundEnabled.value) {
      return
    }

    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.volume = 0.5
      audio.play().catch(error => {
        console.warn('播放通知声音失败:', error)
      })
    } catch (error) {
      console.warn('播放通知声音失败:', error)
    }
  }

  /**
   * 处理新通知
   */
  const handleNewNotification = (notification: Notification) => {
    // 添加到列表开头
    notificationList.value.unshift(notification)
    total.value++
    
    // 如果是未读通知，增加未读数量
    if (!notification.isRead) {
      unreadCount.value++
    }
    
    // 显示桌面通知
    showDesktopNotification(notification)
    
    // 播放通知声音
    playNotificationSound()
  }

  /**
   * 重置状态
   */
  const $reset = () => {
    notificationList.value = []
    total.value = 0
    currentPage.value = 1
    pageSize.value = 20
    loading.value = false
    unreadCount.value = 0
    filters.value = {}
    selectedNotifications.value = []
    currentNotification.value = null
    detailLoading.value = false
    realTimeEnabled.value = true
    soundEnabled.value = true
    desktopEnabled.value = true
    emailEnabled.value = false
  }

  return {
    // 状态
    notificationList,
    total,
    currentPage,
    pageSize,
    loading,
    unreadCount,
    filters,
    selectedNotifications,
    currentNotification,
    detailLoading,
    realTimeEnabled,
    soundEnabled,
    desktopEnabled,
    emailEnabled,

    // 计算属性
    totalPages,
    hasNotifications,
    hasUnreadNotifications,
    selectedNotificationIds,
    isAllSelected,
    isIndeterminate,
    unreadNotifications,
    readNotifications,
    systemNotifications,
    projectNotifications,
    requirementNotifications,
    prototypeNotifications,
    highPriorityNotifications,
    mediumPriorityNotifications,
    lowPriorityNotifications,

    // 动作
    fetchNotificationList,
    fetchNotificationDetail,
    createNotification,
    updateNotification,
    deleteNotification,
    batchDeleteNotifications,
    markAsRead,
    markAsUnread,
    batchMarkAsRead,
    markAllAsRead,
    fetchUnreadCount,
    setFilters,
    clearFilters,
    setCurrentPage,
    setPageSize,
    selectNotification,
    unselectNotification,
    toggleNotificationSelection,
    toggleSelectAll,
    clearSelection,
    filterNotifications,
    refreshNotificationList,
    setNotificationPreferences,
    showDesktopNotification,
    playNotificationSound,
    handleNewNotification,
    $reset
  }
}, {
  persist: {
    key: 'verto-notification',
    paths: ['realTimeEnabled', 'soundEnabled', 'desktopEnabled', 'emailEnabled']
  }
})