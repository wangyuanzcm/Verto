/**
 * 通知管理相关API接口
 * 处理通知的增删改查、推送、订阅等功能
 */

import { api } from './index'
import type {
  Notification,
  NotificationListParams,
  NotificationCreateRequest,
  NotificationUpdateRequest,
  NotificationSettings,
  NotificationTemplate,
  NotificationStatistics,
  PaginationResponse
} from './types'

/**
 * 获取通知列表
 * @param params 查询参数
 * @returns 通知列表
 */
export const getNotificationList = (params: NotificationListParams = {}) => {
  return api.get<PaginationResponse<Notification>>('/notifications', { params })
}

/**
 * 获取通知详情
 * @param notificationId 通知ID
 * @returns 通知详情
 */
export const getNotificationDetail = (notificationId: string) => {
  return api.get<Notification>(`/notifications/${notificationId}`)
}

/**
 * 创建通知
 * @param data 通知创建数据
 * @returns 创建的通知信息
 */
export const createNotification = (data: NotificationCreateRequest) => {
  return api.post<Notification>('/notifications', data)
}

/**
 * 更新通知信息
 * @param notificationId 通知ID
 * @param data 通知更新数据
 * @returns 更新后的通知信息
 */
export const updateNotification = (notificationId: string, data: NotificationUpdateRequest) => {
  return api.put<Notification>(`/notifications/${notificationId}`, data)
}

/**
 * 删除通知
 * @param notificationId 通知ID
 * @returns 删除结果
 */
export const deleteNotification = (notificationId: string) => {
  return api.delete(`/notifications/${notificationId}`)
}

/**
 * 批量删除通知
 * @param notificationIds 通知ID列表
 * @returns 删除结果
 */
export const batchDeleteNotifications = (notificationIds: string[]) => {
  return api.delete('/notifications/batch', { data: { notificationIds } })
}

/**
 * 标记通知为已读
 * @param notificationId 通知ID
 * @returns 标记结果
 */
export const markNotificationAsRead = (notificationId: string) => {
  return api.patch(`/notifications/${notificationId}/read`)
}

/**
 * 标记通知为未读
 * @param notificationId 通知ID
 * @returns 标记结果
 */
export const markNotificationAsUnread = (notificationId: string) => {
  return api.patch(`/notifications/${notificationId}/unread`)
}

/**
 * 批量标记通知为已读
 * @param notificationIds 通知ID列表
 * @returns 标记结果
 */
export const batchMarkNotificationsAsRead = (notificationIds: string[]) => {
  return api.patch('/notifications/batch/read', { notificationIds })
}

/**
 * 标记所有通知为已读
 * @returns 标记结果
 */
export const markAllNotificationsAsRead = () => {
  return api.patch('/notifications/read-all')
}

/**
 * 获取未读通知数量
 * @returns 未读通知数量
 */
export const getUnreadNotificationCount = () => {
  return api.get<{ count: number }>('/notifications/unread-count')
}

/**
 * 获取未读通知列表
 * @param limit 数量限制
 * @returns 未读通知列表
 */
export const getUnreadNotifications = (limit = 10) => {
  return api.get<Notification[]>('/notifications/unread', {
    params: { limit }
  })
}

/**
 * 获取最新通知列表
 * @param limit 数量限制
 * @returns 最新通知列表
 */
export const getLatestNotifications = (limit = 10) => {
  return api.get<Notification[]>('/notifications/latest', {
    params: { limit }
  })
}

/**
 * 发送通知
 * @param data 通知发送数据
 * @returns 发送结果
 */
export const sendNotification = (data: {
  title: string
  content: string
  type: string
  recipients: string[]
  channels?: string[]
  scheduledAt?: string
  priority?: string
  metadata?: any
}) => {
  return api.post('/notifications/send', data)
}

/**
 * 批量发送通知
 * @param notifications 通知列表
 * @returns 发送结果
 */
export const batchSendNotifications = (notifications: Array<{
  title: string
  content: string
  type: string
  recipients: string[]
  channels?: string[]
  scheduledAt?: string
  priority?: string
  metadata?: any
}>) => {
  return api.post('/notifications/batch/send', { notifications })
}

/**
 * 取消发送通知
 * @param notificationId 通知ID
 * @returns 取消结果
 */
export const cancelNotification = (notificationId: string) => {
  return api.post(`/notifications/${notificationId}/cancel`)
}

/**
 * 重新发送通知
 * @param notificationId 通知ID
 * @param recipients 接收人列表（可选）
 * @returns 重新发送结果
 */
export const resendNotification = (notificationId: string, recipients?: string[]) => {
  return api.post(`/notifications/${notificationId}/resend`, { recipients })
}

/**
 * 获取通知设置
 * @returns 通知设置
 */
export const getNotificationSettings = () => {
  return api.get<NotificationSettings>('/notifications/settings')
}

/**
 * 更新通知设置
 * @param settings 通知设置
 * @returns 更新结果
 */
export const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
  return api.put<NotificationSettings>('/notifications/settings', settings)
}

/**
 * 获取用户通知偏好
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 通知偏好
 */
export const getUserNotificationPreferences = (userId?: string) => {
  return api.get('/notifications/preferences', {
    params: { userId }
  })
}

/**
 * 更新用户通知偏好
 * @param preferences 通知偏好
 * @param userId 用户ID（可选，默认当前用户）
 * @returns 更新结果
 */
export const updateUserNotificationPreferences = (preferences: any, userId?: string) => {
  return api.put('/notifications/preferences', { preferences, userId })
}

/**
 * 订阅通知
 * @param type 通知类型
 * @param resourceId 资源ID（可选）
 * @param channels 订阅渠道
 * @returns 订阅结果
 */
export const subscribeNotification = (type: string, resourceId?: string, channels: string[] = ['web']) => {
  return api.post('/notifications/subscribe', { type, resourceId, channels })
}

/**
 * 取消订阅通知
 * @param type 通知类型
 * @param resourceId 资源ID（可选）
 * @param channels 取消订阅的渠道
 * @returns 取消订阅结果
 */
export const unsubscribeNotification = (type: string, resourceId?: string, channels?: string[]) => {
  return api.post('/notifications/unsubscribe', { type, resourceId, channels })
}

/**
 * 获取订阅列表
 * @returns 订阅列表
 */
export const getNotificationSubscriptions = () => {
  return api.get('/notifications/subscriptions')
}

/**
 * 获取通知模板列表
 * @param type 模板类型
 * @returns 模板列表
 */
export const getNotificationTemplates = (type?: string) => {
  return api.get<NotificationTemplate[]>('/notifications/templates', {
    params: { type }
  })
}

/**
 * 创建通知模板
 * @param data 模板数据
 * @returns 创建的模板信息
 */
export const createNotificationTemplate = (data: {
  name: string
  type: string
  title: string
  content: string
  variables?: string[]
  channels?: string[]
  isActive?: boolean
}) => {
  return api.post<NotificationTemplate>('/notifications/templates', data)
}

/**
 * 更新通知模板
 * @param templateId 模板ID
 * @param data 模板更新数据
 * @returns 更新后的模板信息
 */
export const updateNotificationTemplate = (templateId: string, data: {
  name?: string
  title?: string
  content?: string
  variables?: string[]
  channels?: string[]
  isActive?: boolean
}) => {
  return api.put<NotificationTemplate>(`/notifications/templates/${templateId}`, data)
}

/**
 * 删除通知模板
 * @param templateId 模板ID
 * @returns 删除结果
 */
export const deleteNotificationTemplate = (templateId: string) => {
  return api.delete(`/notifications/templates/${templateId}`)
}

/**
 * 预览通知模板
 * @param templateId 模板ID
 * @param variables 变量值
 * @returns 预览结果
 */
export const previewNotificationTemplate = (templateId: string, variables: Record<string, any> = {}) => {
  return api.post<{ title: string; content: string }>(`/notifications/templates/${templateId}/preview`, {
    variables
  })
}

/**
 * 使用模板发送通知
 * @param templateId 模板ID
 * @param data 发送数据
 * @returns 发送结果
 */
export const sendNotificationFromTemplate = (templateId: string, data: {
  recipients: string[]
  variables?: Record<string, any>
  channels?: string[]
  scheduledAt?: string
  priority?: string
}) => {
  return api.post(`/notifications/templates/${templateId}/send`, data)
}

/**
 * 获取通知统计信息
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @param type 通知类型
 * @returns 统计信息
 */
export const getNotificationStatistics = (startDate?: string, endDate?: string, type?: string) => {
  return api.get<NotificationStatistics>('/notifications/statistics', {
    params: { startDate, endDate, type }
  })
}

/**
 * 获取通知发送历史
 * @param notificationId 通知ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 发送历史列表
 */
export const getNotificationSendHistory = (notificationId: string, page = 1, pageSize = 20) => {
  return api.get(`/notifications/${notificationId}/send-history`, {
    params: { page, pageSize }
  })
}

/**
 * 获取通知阅读状态
 * @param notificationId 通知ID
 * @returns 阅读状态列表
 */
export const getNotificationReadStatus = (notificationId: string) => {
  return api.get(`/notifications/${notificationId}/read-status`)
}

/**
 * 搜索通知
 * @param keyword 搜索关键词
 * @param type 通知类型
 * @param status 通知状态
 * @param limit 结果数量限制
 * @returns 搜索结果
 */
export const searchNotifications = (keyword: string, type?: string, status?: string, limit = 10) => {
  return api.get<Notification[]>('/notifications/search', {
    params: { keyword, type, status, limit }
  })
}

/**
 * 获取通知类型列表
 * @returns 类型列表
 */
export const getNotificationTypes = () => {
  return api.get<{ types: Array<{ value: string; label: string; description?: string; icon?: string }> }>('/notifications/types')
}

/**
 * 获取通知渠道列表
 * @returns 渠道列表
 */
export const getNotificationChannels = () => {
  return api.get<{ channels: Array<{ value: string; label: string; description?: string; icon?: string; isEnabled: boolean }> }>('/notifications/channels')
}

/**
 * 测试通知渠道
 * @param channel 渠道名称
 * @param recipient 接收人
 * @param message 测试消息
 * @returns 测试结果
 */
export const testNotificationChannel = (channel: string, recipient: string, message = 'Test notification') => {
  return api.post('/notifications/test-channel', { channel, recipient, message })
}

/**
 * 获取通知队列状态
 * @returns 队列状态
 */
export const getNotificationQueueStatus = () => {
  return api.get('/notifications/queue-status')
}

/**
 * 清空通知队列
 * @param type 队列类型（可选）
 * @returns 清空结果
 */
export const clearNotificationQueue = (type?: string) => {
  return api.post('/notifications/clear-queue', { type })
}

/**
 * 重试失败的通知
 * @param notificationIds 通知ID列表（可选）
 * @returns 重试结果
 */
export const retryFailedNotifications = (notificationIds?: string[]) => {
  return api.post('/notifications/retry-failed', { notificationIds })
}

/**
 * 获取通知日志
 * @param notificationId 通知ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 日志列表
 */
export const getNotificationLogs = (notificationId: string, page = 1, pageSize = 20) => {
  return api.get(`/notifications/${notificationId}/logs`, {
    params: { page, pageSize }
  })
}

/**
 * 导出通知数据
 * @param params 导出参数
 * @param format 导出格式
 * @returns 导出结果
 */
export const exportNotifications = (params: NotificationListParams = {}, format = 'csv') => {
  return api.post('/notifications/export', { params, format }, {
    responseType: 'blob'
  })
}

/**
 * 获取通知摘要
 * @param period 时间周期（today/week/month）
 * @returns 通知摘要
 */
export const getNotificationSummary = (period = 'today') => {
  return api.get('/notifications/summary', {
    params: { period }
  })
}

/**
 * 设置通知免打扰
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @param days 生效日期（周几）
 * @returns 设置结果
 */
export const setNotificationDoNotDisturb = (startTime: string, endTime: string, days: number[] = []) => {
  return api.post('/notifications/do-not-disturb', { startTime, endTime, days })
}

/**
 * 取消通知免打扰
 * @returns 取消结果
 */
export const cancelNotificationDoNotDisturb = () => {
  return api.delete('/notifications/do-not-disturb')
}

/**
 * 获取通知免打扰设置
 * @returns 免打扰设置
 */
export const getNotificationDoNotDisturbSettings = () => {
  return api.get('/notifications/do-not-disturb')
}

/**
 * 注册推送设备
 * @param deviceToken 设备令牌
 * @param platform 平台类型
 * @param deviceInfo 设备信息
 * @returns 注册结果
 */
export const registerPushDevice = (deviceToken: string, platform: string, deviceInfo: any = {}) => {
  return api.post('/notifications/register-device', { deviceToken, platform, deviceInfo })
}

/**
 * 注销推送设备
 * @param deviceToken 设备令牌
 * @returns 注销结果
 */
export const unregisterPushDevice = (deviceToken: string) => {
  return api.post('/notifications/unregister-device', { deviceToken })
}

/**
 * 获取已注册的推送设备列表
 * @returns 设备列表
 */
export const getPushDevices = () => {
  return api.get('/notifications/push-devices')
}

/**
 * 发送推送通知
 * @param data 推送数据
 * @returns 发送结果
 */
export const sendPushNotification = (data: {
  title: string
  body: string
  recipients?: string[]
  deviceTokens?: string[]
  data?: any
  badge?: number
  sound?: string
  clickAction?: string
}) => {
  return api.post('/notifications/push', data)
}

/**
 * 获取WebSocket连接令牌
 * @returns 连接令牌
 */
export const getWebSocketToken = () => {
  return api.get<{ token: string; endpoint: string }>('/notifications/websocket-token')
}

/**
 * 获取实时通知配置
 * @returns 实时通知配置
 */
export const getRealtimeNotificationConfig = () => {
  return api.get('/notifications/realtime-config')
}

/**
 * 更新实时通知配置
 * @param config 配置数据
 * @returns 更新结果
 */
export const updateRealtimeNotificationConfig = (config: {
  enabled?: boolean
  heartbeatInterval?: number
  reconnectInterval?: number
  maxReconnectAttempts?: number
}) => {
  return api.put('/notifications/realtime-config', config)
}