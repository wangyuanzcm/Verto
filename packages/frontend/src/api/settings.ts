/**
 * 设置管理相关API接口
 * 处理用户设置、系统设置、配置管理等功能
 */

import { api } from './index'
import type {
  UserSettings,
  SystemSettings,
  SettingsGroup,
  SettingsItem,
  SettingsBackup,
  SettingsImportResult
} from './types'

/**
 * 获取用户设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 用户设置
 */
export const getUserSettings = (userId?: string) => {
  return api.get<UserSettings>('/settings/user', {
    params: { userId }
  })
}

/**
 * 更新用户设置
 * @param settings 用户设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 更新结果
 */
export const updateUserSettings = (settings: Partial<UserSettings>, userId?: string) => {
  return api.put<UserSettings>('/settings/user', { settings, userId })
}

/**
 * 重置用户设置
 * @param keys 要重置的设置键（可选，默认重置所有）
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 重置结果
 */
export const resetUserSettings = (keys?: string[], userId?: string) => {
  return api.post('/settings/user/reset', { keys, userId })
}

/**
 * 获取系统设置
 * @returns 系统设置
 */
export const getSystemSettings = () => {
  return api.get<SystemSettings>('/settings/system')
}

/**
 * 更新系统设置
 * @param settings 系统设置
 * @returns 更新结果
 */
export const updateSystemSettings = (settings: Partial<SystemSettings>) => {
  return api.put<SystemSettings>('/settings/system', settings)
}

/**
 * 重置系统设置
 * @param keys 要重置的设置键（可选，默认重置所有）
 * @returns 重置结果
 */
export const resetSystemSettings = (keys?: string[]) => {
  return api.post('/settings/system/reset', { keys })
}

/**
 * 获取设置分组列表
 * @param type 设置类型（user/system）
 * @returns 设置分组列表
 */
export const getSettingsGroups = (type: 'user' | 'system' = 'user') => {
  return api.get<SettingsGroup[]>('/settings/groups', {
    params: { type }
  })
}

/**
 * 获取设置项列表
 * @param groupId 分组ID
 * @param type 设置类型（user/system）
 * @returns 设置项列表
 */
export const getSettingsItems = (groupId?: string, type: 'user' | 'system' = 'user') => {
  return api.get<SettingsItem[]>('/settings/items', {
    params: { groupId, type }
  })
}

/**
 * 获取单个设置项
 * @param key 设置键
 * @param type 设置类型（user/system）
 * @param userId 用户ID（仅用户设置时有效）
 * @returns 设置项
 */
export const getSettingsItem = (key: string, type: 'user' | 'system' = 'user', userId?: string) => {
  return api.get<SettingsItem>(`/settings/items/${key}`, {
    params: { type, userId }
  })
}

/**
 * 更新单个设置项
 * @param key 设置键
 * @param value 设置值
 * @param type 设置类型（user/system）
 * @param userId 用户ID（仅用户设置时有效）
 * @returns 更新结果
 */
export const updateSettingsItem = (key: string, value: any, type: 'user' | 'system' = 'user', userId?: string) => {
  return api.put<SettingsItem>(`/settings/items/${key}`, { value, type, userId })
}

/**
 * 删除设置项
 * @param key 设置键
 * @param type 设置类型（user/system）
 * @param userId 用户ID（仅用户设置时有效）
 * @returns 删除结果
 */
export const deleteSettingsItem = (key: string, type: 'user' | 'system' = 'user', userId?: string) => {
  return api.delete(`/settings/items/${key}`, {
    params: { type, userId }
  })
}

/**
 * 批量更新设置
 * @param settings 设置键值对
 * @param type 设置类型（user/system）
 * @param userId 用户ID（仅用户设置时有效）
 * @returns 更新结果
 */
export const batchUpdateSettings = (settings: Record<string, any>, type: 'user' | 'system' = 'user', userId?: string) => {
  return api.patch('/settings/batch', { settings, type, userId })
}

/**
 * 获取设置默认值
 * @param keys 设置键列表（可选，默认获取所有）
 * @param type 设置类型（user/system）
 * @returns 默认值
 */
export const getSettingsDefaults = (keys?: string[], type: 'user' | 'system' = 'user') => {
  return api.get('/settings/defaults', {
    params: { keys: keys?.join(','), type }
  })
}

/**
 * 验证设置值
 * @param key 设置键
 * @param value 设置值
 * @param type 设置类型（user/system）
 * @returns 验证结果
 */
export const validateSettingsValue = (key: string, value: any, type: 'user' | 'system' = 'user') => {
  return api.post<{ valid: boolean; errors?: string[] }>('/settings/validate', { key, value, type })
}

/**
 * 搜索设置
 * @param keyword 搜索关键词
 * @param type 设置类型（user/system）
 * @param groupId 分组ID（可选）
 * @returns 搜索结果
 */
export const searchSettings = (keyword: string, type: 'user' | 'system' = 'user', groupId?: string) => {
  return api.get<SettingsItem[]>('/settings/search', {
    params: { keyword, type, groupId }
  })
}

/**
 * 导出设置
 * @param type 设置类型（user/system）
 * @param keys 要导出的设置键（可选，默认导出所有）
 * @param format 导出格式（json/yaml/ini）
 * @param userId 用户ID（仅用户设置时有效）
 * @returns 导出结果
 */
export const exportSettings = (type: 'user' | 'system' = 'user', keys?: string[], format = 'json', userId?: string) => {
  return api.post('/settings/export', { type, keys, format, userId }, {
    responseType: 'blob'
  })
}

/**
 * 导入设置
 * @param file 设置文件
 * @param type 设置类型（user/system）
 * @param merge 是否合并（true）还是覆盖（false）
 * @param userId 用户ID（仅用户设置时有效）
 * @returns 导入结果
 */
export const importSettings = (file: File, type: 'user' | 'system' = 'user', merge = true, userId?: string) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  formData.append('merge', merge.toString())
  if (userId) {
    formData.append('userId', userId)
  }
  return api.post<SettingsImportResult>('/settings/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 创建设置备份
 * @param name 备份名称
 * @param description 备份描述
 * @param type 设置类型（user/system）
 * @param userId 用户ID（仅用户设置时有效）
 * @returns 备份信息
 */
export const createSettingsBackup = (name: string, description?: string, type: 'user' | 'system' = 'user', userId?: string) => {
  return api.post<SettingsBackup>('/settings/backup', { name, description, type, userId })
}

/**
 * 获取设置备份列表
 * @param type 设置类型（user/system）
 * @param userId 用户ID（仅用户设置时有效）
 * @returns 备份列表
 */
export const getSettingsBackups = (type: 'user' | 'system' = 'user', userId?: string) => {
  return api.get<SettingsBackup[]>('/settings/backups', {
    params: { type, userId }
  })
}

/**
 * 恢复设置备份
 * @param backupId 备份ID
 * @param merge 是否合并（true）还是覆盖（false）
 * @returns 恢复结果
 */
export const restoreSettingsBackup = (backupId: string, merge = true) => {
  return api.post(`/settings/backups/${backupId}/restore`, { merge })
}

/**
 * 删除设置备份
 * @param backupId 备份ID
 * @returns 删除结果
 */
export const deleteSettingsBackup = (backupId: string) => {
  return api.delete(`/settings/backups/${backupId}`)
}

/**
 * 下载设置备份
 * @param backupId 备份ID
 * @returns 备份文件
 */
export const downloadSettingsBackup = (backupId: string) => {
  return api.get(`/settings/backups/${backupId}/download`, {
    responseType: 'blob'
  })
}

/**
 * 获取设置变更历史
 * @param key 设置键（可选）
 * @param type 设置类型（user/system）
 * @param userId 用户ID（仅用户设置时有效）
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 变更历史
 */
export const getSettingsHistory = (key?: string, type: 'user' | 'system' = 'user', userId?: string, page = 1, pageSize = 20) => {
  return api.get('/settings/history', {
    params: { key, type, userId, page, pageSize }
  })
}

/**
 * 获取设置模板列表
 * @param type 设置类型（user/system）
 * @param category 模板分类
 * @returns 模板列表
 */
export const getSettingsTemplates = (type: 'user' | 'system' = 'user', category?: string) => {
  return api.get('/settings/templates', {
    params: { type, category }
  })
}

/**
 * 应用设置模板
 * @param templateId 模板ID
 * @param merge 是否合并（true）还是覆盖（false）
 * @param userId 用户ID（仅用户设置时有效）
 * @returns 应用结果
 */
export const applySettingsTemplate = (templateId: string, merge = true, userId?: string) => {
  return api.post(`/settings/templates/${templateId}/apply`, { merge, userId })
}

/**
 * 创建设置模板
 * @param name 模板名称
 * @param description 模板描述
 * @param settings 设置内容
 * @param type 设置类型（user/system）
 * @param category 模板分类
 * @param isPublic 是否公开
 * @returns 创建的模板信息
 */
export const createSettingsTemplate = (name: string, description: string, settings: Record<string, any>, type: 'user' | 'system' = 'user', category?: string, isPublic = false) => {
  return api.post('/settings/templates', {
    name,
    description,
    settings,
    type,
    category,
    isPublic
  })
}

/**
 * 更新设置模板
 * @param templateId 模板ID
 * @param data 模板更新数据
 * @returns 更新结果
 */
export const updateSettingsTemplate = (templateId: string, data: {
  name?: string
  description?: string
  settings?: Record<string, any>
  category?: string
  isPublic?: boolean
}) => {
  return api.put(`/settings/templates/${templateId}`, data)
}

/**
 * 删除设置模板
 * @param templateId 模板ID
 * @returns 删除结果
 */
export const deleteSettingsTemplate = (templateId: string) => {
  return api.delete(`/settings/templates/${templateId}`)
}

/**
 * 获取主题设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 主题设置
 */
export const getThemeSettings = (userId?: string) => {
  return api.get('/settings/theme', {
    params: { userId }
  })
}

/**
 * 更新主题设置
 * @param theme 主题设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 更新结果
 */
export const updateThemeSettings = (theme: {
  mode?: 'light' | 'dark' | 'auto'
  primaryColor?: string
  fontSize?: string
  fontFamily?: string
  borderRadius?: string
  customCss?: string
}, userId?: string) => {
  return api.put('/settings/theme', { theme, userId })
}

/**
 * 获取可用主题列表
 * @returns 主题列表
 */
export const getAvailableThemes = () => {
  return api.get('/settings/themes')
}

/**
 * 获取语言设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 语言设置
 */
export const getLanguageSettings = (userId?: string) => {
  return api.get('/settings/language', {
    params: { userId }
  })
}

/**
 * 更新语言设置
 * @param language 语言代码
 * @param timezone 时区
 * @param dateFormat 日期格式
 * @param timeFormat 时间格式
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 更新结果
 */
export const updateLanguageSettings = (language: string, timezone?: string, dateFormat?: string, timeFormat?: string, userId?: string) => {
  return api.put('/settings/language', {
    language,
    timezone,
    dateFormat,
    timeFormat,
    userId
  })
}

/**
 * 获取可用语言列表
 * @returns 语言列表
 */
export const getAvailableLanguages = () => {
  return api.get('/settings/languages')
}

/**
 * 获取可用时区列表
 * @returns 时区列表
 */
export const getAvailableTimezones = () => {
  return api.get('/settings/timezones')
}

/**
 * 获取隐私设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 隐私设置
 */
export const getPrivacySettings = (userId?: string) => {
  return api.get('/settings/privacy', {
    params: { userId }
  })
}

/**
 * 更新隐私设置
 * @param privacy 隐私设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 更新结果
 */
export const updatePrivacySettings = (privacy: {
  profileVisibility?: 'public' | 'private' | 'friends'
  showEmail?: boolean
  showPhone?: boolean
  allowSearch?: boolean
  allowContact?: boolean
  dataCollection?: boolean
  analytics?: boolean
}, userId?: string) => {
  return api.put('/settings/privacy', { privacy, userId })
}

/**
 * 获取安全设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 安全设置
 */
export const getSecuritySettings = (userId?: string) => {
  return api.get('/settings/security', {
    params: { userId }
  })
}

/**
 * 更新安全设置
 * @param security 安全设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 更新结果
 */
export const updateSecuritySettings = (security: {
  twoFactorAuth?: boolean
  loginNotifications?: boolean
  sessionTimeout?: number
  passwordExpiry?: number
  allowMultipleSessions?: boolean
}, userId?: string) => {
  return api.put('/settings/security', { security, userId })
}

/**
 * 获取通知设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 通知设置
 */
export const getNotificationSettings = (userId?: string) => {
  return api.get('/settings/notifications', {
    params: { userId }
  })
}

/**
 * 更新通知设置
 * @param notifications 通知设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 更新结果
 */
export const updateNotificationSettings = (notifications: {
  email?: boolean
  push?: boolean
  sms?: boolean
  desktop?: boolean
  sound?: boolean
  vibration?: boolean
  doNotDisturb?: {
    enabled: boolean
    startTime?: string
    endTime?: string
    days?: number[]
  }
  types?: Record<string, boolean>
}, userId?: string) => {
  return api.put('/settings/notifications', { notifications, userId })
}

/**
 * 获取工作区设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 工作区设置
 */
export const getWorkspaceSettings = (userId?: string) => {
  return api.get('/settings/workspace', {
    params: { userId }
  })
}

/**
 * 更新工作区设置
 * @param workspace 工作区设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 更新结果
 */
export const updateWorkspaceSettings = (workspace: {
  layout?: 'sidebar' | 'topbar' | 'minimal'
  sidebarCollapsed?: boolean
  showToolbar?: boolean
  showStatusBar?: boolean
  showMinimap?: boolean
  autoSave?: boolean
  autoSaveInterval?: number
  defaultView?: string
  gridSize?: number
  snapToGrid?: boolean
}, userId?: string) => {
  return api.put('/settings/workspace', { workspace, userId })
}

/**
 * 获取编辑器设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 编辑器设置
 */
export const getEditorSettings = (userId?: string) => {
  return api.get('/settings/editor', {
    params: { userId }
  })
}

/**
 * 更新编辑器设置
 * @param editor 编辑器设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 更新结果
 */
export const updateEditorSettings = (editor: {
  theme?: string
  fontSize?: number
  fontFamily?: string
  lineHeight?: number
  tabSize?: number
  wordWrap?: boolean
  showLineNumbers?: boolean
  showWhitespace?: boolean
  autoComplete?: boolean
  syntaxHighlight?: boolean
  codeFormatting?: boolean
  keyBindings?: string
}, userId?: string) => {
  return api.put('/settings/editor', { editor, userId })
}

/**
 * 获取快捷键设置
 * @param userId 用户ID（可选，默认用户）
 * @returns 快捷键设置
 */
export const getShortcutSettings = (userId?: string) => {
  return api.get('/settings/shortcuts', {
    params: { userId }
  })
}

/**
 * 更新快捷键设置
 * @param shortcuts 快捷键设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 更新结果
 */
export const updateShortcutSettings = (shortcuts: Record<string, string>, userId?: string) => {
  return api.put('/settings/shortcuts', { shortcuts, userId })
}

/**
 * 重置快捷键设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 重置结果
 */
export const resetShortcutSettings = (userId?: string) => {
  return api.post('/settings/shortcuts/reset', { userId })
}

/**
 * 获取默认快捷键
 * @returns 默认快捷键
 */
export const getDefaultShortcuts = () => {
  return api.get('/settings/shortcuts/defaults')
}

/**
 * 检查快捷键冲突
 * @param shortcuts 快捷键设置
 * @returns 冲突检查结果
 */
export const checkShortcutConflicts = (shortcuts: Record<string, string>) => {
  return api.post('/settings/shortcuts/check-conflicts', { shortcuts })
}

/**
 * 获取设置同步状态
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 同步状态
 */
export const getSettingsSyncStatus = (userId?: string) => {
  return api.get('/settings/sync-status', {
    params: { userId }
  })
}

/**
 * 同步设置到云端
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 同步结果
 */
export const syncSettingsToCloud = (userId?: string) => {
  return api.post('/settings/sync-to-cloud', { userId })
}

/**
 * 从云端同步设置
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 同步结果
 */
export const syncSettingsFromCloud = (userId?: string) => {
  return api.post('/settings/sync-from-cloud', { userId })
}

/**
 * 启用/禁用设置同步
 * @param enabled 是否启用
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 设置结果
 */
export const toggleSettingsSync = (enabled: boolean, userId?: string) => {
  return api.post('/settings/toggle-sync', { enabled, userId })
}