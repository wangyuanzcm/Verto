import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { settingsApi } from '@/api'
import type { UserSettings, SystemSettings, NotificationSettings, SecuritySettings } from '@/api/types'
import { ElMessage } from 'element-plus'

/**
 * 设置管理状态
 * 管理用户设置、系统设置等状态
 */

export interface SettingsState {
  // 用户设置
  userSettings: UserSettings | null
  // 系统设置
  systemSettings: SystemSettings | null
  // 通知设置
  notificationSettings: NotificationSettings | null
  // 安全设置
  securitySettings: SecuritySettings | null
  // 加载状态
  loading: boolean
  // 保存状态
  saving: boolean
  // 主题设置
  theme: 'light' | 'dark' | 'auto'
  // 语言设置
  language: string
  // 字体大小
  fontSize: 'small' | 'medium' | 'large'
  // 侧边栏折叠状态
  sidebarCollapsed: boolean
  // 侧边栏宽度
  sidebarWidth: number
  // 布局模式
  layoutMode: 'vertical' | 'horizontal' | 'mix'
  // 固定头部
  fixedHeader: boolean
  // 固定侧边栏
  fixedSidebar: boolean
  // 显示面包屑
  showBreadcrumb: boolean
  // 显示标签页
  showTabs: boolean
  // 显示页脚
  showFooter: boolean
  // 页面动画
  pageAnimation: boolean
  // 动画类型
  animationType: 'fade' | 'slide' | 'zoom'
  // 自动保存间隔（分钟）
  autoSaveInterval: number
  // 自动备份
  autoBackup: boolean
  // 备份间隔（小时）
  backupInterval: number
  // 最大备份数量
  maxBackupCount: number
}

export const useSettingsStore = defineStore('settings', () => {
  // 状态定义
  const userSettings = ref<UserSettings | null>(null)
  const systemSettings = ref<SystemSettings | null>(null)
  const notificationSettings = ref<NotificationSettings | null>(null)
  const securitySettings = ref<SecuritySettings | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const theme = ref<'light' | 'dark' | 'auto'>('auto')
  const language = ref('zh-CN')
  const fontSize = ref<'small' | 'medium' | 'large'>('medium')
  const sidebarCollapsed = ref(false)
  const sidebarWidth = ref(240)
  const layoutMode = ref<'vertical' | 'horizontal' | 'mix'>('vertical')
  const fixedHeader = ref(true)
  const fixedSidebar = ref(true)
  const showBreadcrumb = ref(true)
  const showTabs = ref(true)
  const showFooter = ref(true)
  const pageAnimation = ref(true)
  const animationType = ref<'fade' | 'slide' | 'zoom'>('fade')
  const autoSaveInterval = ref(5)
  const autoBackup = ref(true)
  const backupInterval = ref(24)
  const maxBackupCount = ref(10)

  // 计算属性
  const isDarkMode = computed(() => {
    if (theme.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme.value === 'dark'
  })

  const isLightMode = computed(() => {
    return !isDarkMode.value
  })

  const currentFontSize = computed(() => {
    const sizeMap = {
      small: '12px',
      medium: '14px',
      large: '16px'
    }
    return sizeMap[fontSize.value]
  })

  const sidebarStyle = computed(() => {
    return {
      width: sidebarCollapsed.value ? '64px' : `${sidebarWidth.value}px`,
      position: fixedSidebar.value ? 'fixed' : 'relative'
    }
  })

  const headerStyle = computed(() => {
    return {
      position: fixedHeader.value ? 'fixed' : 'relative',
      zIndex: fixedHeader.value ? 1000 : 'auto'
    }
  })

  const layoutClass = computed(() => {
    return {
      'layout-vertical': layoutMode.value === 'vertical',
      'layout-horizontal': layoutMode.value === 'horizontal',
      'layout-mix': layoutMode.value === 'mix',
      'sidebar-collapsed': sidebarCollapsed.value,
      'fixed-header': fixedHeader.value,
      'fixed-sidebar': fixedSidebar.value,
      'show-breadcrumb': showBreadcrumb.value,
      'show-tabs': showTabs.value,
      'show-footer': showFooter.value,
      'page-animation': pageAnimation.value
    }
  })

  const animationClass = computed(() => {
    if (!pageAnimation.value) return ''
    return `animation-${animationType.value}`
  })

  // 动作方法
  /**
   * 获取用户设置
   */
  const fetchUserSettings = async () => {
    try {
      loading.value = true
      
      const response = await settingsApi.getUserSettings()
      
      if (response.success && response.data) {
        userSettings.value = response.data
        
        // 应用用户设置
        applyUserSettings(response.data)
      } else {
        ElMessage.error(response.message || '获取用户设置失败')
      }
    } catch (error: any) {
      console.error('获取用户设置错误:', error)
      ElMessage.error(error.message || '获取用户设置失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取系统设置
   */
  const fetchSystemSettings = async () => {
    try {
      loading.value = true
      
      const response = await settingsApi.getSystemSettings()
      
      if (response.success && response.data) {
        systemSettings.value = response.data
      } else {
        ElMessage.error(response.message || '获取系统设置失败')
      }
    } catch (error: any) {
      console.error('获取系统设置错误:', error)
      ElMessage.error(error.message || '获取系统设置失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取通知设置
   */
  const fetchNotificationSettings = async () => {
    try {
      loading.value = true
      
      const response = await settingsApi.getNotificationSettings()
      
      if (response.success && response.data) {
        notificationSettings.value = response.data
      } else {
        ElMessage.error(response.message || '获取通知设置失败')
      }
    } catch (error: any) {
      console.error('获取通知设置错误:', error)
      ElMessage.error(error.message || '获取通知设置失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取安全设置
   */
  const fetchSecuritySettings = async () => {
    try {
      loading.value = true
      
      const response = await settingsApi.getSecuritySettings()
      
      if (response.success && response.data) {
        securitySettings.value = response.data
      } else {
        ElMessage.error(response.message || '获取安全设置失败')
      }
    } catch (error: any) {
      console.error('获取安全设置错误:', error)
      ElMessage.error(error.message || '获取安全设置失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新用户设置
   */
  const updateUserSettings = async (settings: Partial<UserSettings>): Promise<boolean> => {
    try {
      saving.value = true
      
      const response = await settingsApi.updateUserSettings(settings)
      
      if (response.success && response.data) {
        userSettings.value = response.data
        
        // 应用新设置
        applyUserSettings(response.data)
        
        ElMessage.success('用户设置更新成功')
        return true
      } else {
        ElMessage.error(response.message || '用户设置更新失败')
        return false
      }
    } catch (error: any) {
      console.error('更新用户设置错误:', error)
      ElMessage.error(error.message || '用户设置更新失败')
      return false
    } finally {
      saving.value = false
    }
  }

  /**
   * 更新系统设置
   */
  const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<boolean> => {
    try {
      saving.value = true
      
      const response = await settingsApi.updateSystemSettings(settings)
      
      if (response.success && response.data) {
        systemSettings.value = response.data
        ElMessage.success('系统设置更新成功')
        return true
      } else {
        ElMessage.error(response.message || '系统设置更新失败')
        return false
      }
    } catch (error: any) {
      console.error('更新系统设置错误:', error)
      ElMessage.error(error.message || '系统设置更新失败')
      return false
    } finally {
      saving.value = false
    }
  }

  /**
   * 更新通知设置
   */
  const updateNotificationSettings = async (settings: Partial<NotificationSettings>): Promise<boolean> => {
    try {
      saving.value = true
      
      const response = await settingsApi.updateNotificationSettings(settings)
      
      if (response.success && response.data) {
        notificationSettings.value = response.data
        ElMessage.success('通知设置更新成功')
        return true
      } else {
        ElMessage.error(response.message || '通知设置更新失败')
        return false
      }
    } catch (error: any) {
      console.error('更新通知设置错误:', error)
      ElMessage.error(error.message || '通知设置更新失败')
      return false
    } finally {
      saving.value = false
    }
  }

  /**
   * 更新安全设置
   */
  const updateSecuritySettings = async (settings: Partial<SecuritySettings>): Promise<boolean> => {
    try {
      saving.value = true
      
      const response = await settingsApi.updateSecuritySettings(settings)
      
      if (response.success && response.data) {
        securitySettings.value = response.data
        ElMessage.success('安全设置更新成功')
        return true
      } else {
        ElMessage.error(response.message || '安全设置更新失败')
        return false
      }
    } catch (error: any) {
      console.error('更新安全设置错误:', error)
      ElMessage.error(error.message || '安全设置更新失败')
      return false
    } finally {
      saving.value = false
    }
  }

  /**
   * 应用用户设置
   */
  const applyUserSettings = (settings: UserSettings) => {
    if (settings.theme) {
      setTheme(settings.theme)
    }
    if (settings.language) {
      setLanguage(settings.language)
    }
    if (settings.fontSize) {
      setFontSize(settings.fontSize)
    }
    if (settings.sidebarCollapsed !== undefined) {
      setSidebarCollapsed(settings.sidebarCollapsed)
    }
    if (settings.sidebarWidth) {
      setSidebarWidth(settings.sidebarWidth)
    }
    if (settings.layoutMode) {
      setLayoutMode(settings.layoutMode)
    }
    if (settings.fixedHeader !== undefined) {
      setFixedHeader(settings.fixedHeader)
    }
    if (settings.fixedSidebar !== undefined) {
      setFixedSidebar(settings.fixedSidebar)
    }
    if (settings.showBreadcrumb !== undefined) {
      setShowBreadcrumb(settings.showBreadcrumb)
    }
    if (settings.showTabs !== undefined) {
      setShowTabs(settings.showTabs)
    }
    if (settings.showFooter !== undefined) {
      setShowFooter(settings.showFooter)
    }
    if (settings.pageAnimation !== undefined) {
      setPageAnimation(settings.pageAnimation)
    }
    if (settings.animationType) {
      setAnimationType(settings.animationType)
    }
    if (settings.autoSaveInterval) {
      setAutoSaveInterval(settings.autoSaveInterval)
    }
    if (settings.autoBackup !== undefined) {
      setAutoBackup(settings.autoBackup)
    }
    if (settings.backupInterval) {
      setBackupInterval(settings.backupInterval)
    }
    if (settings.maxBackupCount) {
      setMaxBackupCount(settings.maxBackupCount)
    }
  }

  /**
   * 设置主题
   */
  const setTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    theme.value = newTheme
    
    // 应用主题到DOM
    const html = document.documentElement
    html.classList.remove('light', 'dark')
    
    if (newTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.classList.add(prefersDark ? 'dark' : 'light')
    } else {
      html.classList.add(newTheme)
    }
  }

  /**
   * 切换主题
   */
  const toggleTheme = () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  /**
   * 设置语言
   */
  const setLanguage = (newLanguage: string) => {
    language.value = newLanguage
    
    // 应用语言到DOM
    document.documentElement.lang = newLanguage
  }

  /**
   * 设置字体大小
   */
  const setFontSize = (newFontSize: 'small' | 'medium' | 'large') => {
    fontSize.value = newFontSize
    
    // 应用字体大小到DOM
    const html = document.documentElement
    html.classList.remove('font-small', 'font-medium', 'font-large')
    html.classList.add(`font-${newFontSize}`)
  }

  /**
   * 设置侧边栏折叠状态
   */
  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
  }

  /**
   * 切换侧边栏折叠状态
   */
  const toggleSidebarCollapsed = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  /**
   * 设置侧边栏宽度
   */
  const setSidebarWidth = (width: number) => {
    sidebarWidth.value = Math.max(200, Math.min(400, width))
  }

  /**
   * 设置布局模式
   */
  const setLayoutMode = (mode: 'vertical' | 'horizontal' | 'mix') => {
    layoutMode.value = mode
  }

  /**
   * 设置固定头部
   */
  const setFixedHeader = (fixed: boolean) => {
    fixedHeader.value = fixed
  }

  /**
   * 设置固定侧边栏
   */
  const setFixedSidebar = (fixed: boolean) => {
    fixedSidebar.value = fixed
  }

  /**
   * 设置显示面包屑
   */
  const setShowBreadcrumb = (show: boolean) => {
    showBreadcrumb.value = show
  }

  /**
   * 设置显示标签页
   */
  const setShowTabs = (show: boolean) => {
    showTabs.value = show
  }

  /**
   * 设置显示页脚
   */
  const setShowFooter = (show: boolean) => {
    showFooter.value = show
  }

  /**
   * 设置页面动画
   */
  const setPageAnimation = (enabled: boolean) => {
    pageAnimation.value = enabled
  }

  /**
   * 设置动画类型
   */
  const setAnimationType = (type: 'fade' | 'slide' | 'zoom') => {
    animationType.value = type
  }

  /**
   * 设置自动保存间隔
   */
  const setAutoSaveInterval = (interval: number) => {
    autoSaveInterval.value = Math.max(1, Math.min(60, interval))
  }

  /**
   * 设置自动备份
   */
  const setAutoBackup = (enabled: boolean) => {
    autoBackup.value = enabled
  }

  /**
   * 设置备份间隔
   */
  const setBackupInterval = (interval: number) => {
    backupInterval.value = Math.max(1, Math.min(168, interval))
  }

  /**
   * 设置最大备份数量
   */
  const setMaxBackupCount = (count: number) => {
    maxBackupCount.value = Math.max(1, Math.min(100, count))
  }

  /**
   * 重置为默认设置
   */
  const resetToDefaults = async (): Promise<boolean> => {
    try {
      const response = await settingsApi.resetToDefaults()
      
      if (response.success) {
        // 重置本地状态
        $reset()
        
        // 重新获取设置
        await fetchUserSettings()
        
        ElMessage.success('设置已重置为默认值')
        return true
      } else {
        ElMessage.error(response.message || '重置设置失败')
        return false
      }
    } catch (error: any) {
      console.error('重置设置错误:', error)
      ElMessage.error(error.message || '重置设置失败')
      return false
    }
  }

  /**
   * 导出设置
   */
  const exportSettings = async (): Promise<boolean> => {
    try {
      const response = await settingsApi.exportSettings()
      
      if (response.success && response.data) {
        // 创建下载链接
        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `verto-settings-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        ElMessage.success('设置导出成功')
        return true
      } else {
        ElMessage.error(response.message || '导出设置失败')
        return false
      }
    } catch (error: any) {
      console.error('导出设置错误:', error)
      ElMessage.error(error.message || '导出设置失败')
      return false
    }
  }

  /**
   * 导入设置
   */
  const importSettings = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text()
      const settings = JSON.parse(text)
      
      const response = await settingsApi.importSettings(settings)
      
      if (response.success) {
        // 重新获取设置
        await fetchUserSettings()
        
        ElMessage.success('设置导入成功')
        return true
      } else {
        ElMessage.error(response.message || '导入设置失败')
        return false
      }
    } catch (error: any) {
      console.error('导入设置错误:', error)
      ElMessage.error(error.message || '导入设置失败')
      return false
    }
  }

  /**
   * 初始化设置
   */
  const initializeSettings = async () => {
    await Promise.all([
      fetchUserSettings(),
      fetchSystemSettings(),
      fetchNotificationSettings(),
      fetchSecuritySettings()
    ])
  }

  /**
   * 重置状态
   */
  const $reset = () => {
    userSettings.value = null
    systemSettings.value = null
    notificationSettings.value = null
    securitySettings.value = null
    loading.value = false
    saving.value = false
    theme.value = 'auto'
    language.value = 'zh-CN'
    fontSize.value = 'medium'
    sidebarCollapsed.value = false
    sidebarWidth.value = 240
    layoutMode.value = 'vertical'
    fixedHeader.value = true
    fixedSidebar.value = true
    showBreadcrumb.value = true
    showTabs.value = true
    showFooter.value = true
    pageAnimation.value = true
    animationType.value = 'fade'
    autoSaveInterval.value = 5
    autoBackup.value = true
    backupInterval.value = 24
    maxBackupCount.value = 10
  }

  return {
    // 状态
    userSettings,
    systemSettings,
    notificationSettings,
    securitySettings,
    loading,
    saving,
    theme,
    language,
    fontSize,
    sidebarCollapsed,
    sidebarWidth,
    layoutMode,
    fixedHeader,
    fixedSidebar,
    showBreadcrumb,
    showTabs,
    showFooter,
    pageAnimation,
    animationType,
    autoSaveInterval,
    autoBackup,
    backupInterval,
    maxBackupCount,

    // 计算属性
    isDarkMode,
    isLightMode,
    currentFontSize,
    sidebarStyle,
    headerStyle,
    layoutClass,
    animationClass,

    // 动作
    fetchUserSettings,
    fetchSystemSettings,
    fetchNotificationSettings,
    fetchSecuritySettings,
    updateUserSettings,
    updateSystemSettings,
    updateNotificationSettings,
    updateSecuritySettings,
    applyUserSettings,
    setTheme,
    toggleTheme,
    setLanguage,
    setFontSize,
    setSidebarCollapsed,
    toggleSidebarCollapsed,
    setSidebarWidth,
    setLayoutMode,
    setFixedHeader,
    setFixedSidebar,
    setShowBreadcrumb,
    setShowTabs,
    setShowFooter,
    setPageAnimation,
    setAnimationType,
    setAutoSaveInterval,
    setAutoBackup,
    setBackupInterval,
    setMaxBackupCount,
    resetToDefaults,
    exportSettings,
    importSettings,
    initializeSettings,
    $reset
  }
}, {
  persist: {
    key: 'verto-settings',
    paths: [
      'theme',
      'language',
      'fontSize',
      'sidebarCollapsed',
      'sidebarWidth',
      'layoutMode',
      'fixedHeader',
      'fixedSidebar',
      'showBreadcrumb',
      'showTabs',
      'showFooter',
      'pageAnimation',
      'animationType',
      'autoSaveInterval',
      'autoBackup',
      'backupInterval',
      'maxBackupCount'
    ]
  }
})