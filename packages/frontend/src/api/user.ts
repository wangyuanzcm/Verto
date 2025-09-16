/**
 * 用户管理相关API接口
 * 处理用户列表、用户信息管理等功能
 */

import request from '@/utils/request'
import type {
  User,
  UserListParams,
  UserCreateRequest,
  UserUpdateRequest,
  PaginationResponse
} from './types'

/**
 * 获取用户列表
 * @param params 查询参数
 * @returns 用户列表
 */
export const getUserList = (params: UserListParams = {}) => {
  return request.get<PaginationResponse<User>>('/users', { params })
}

/**
 * 获取用户详情
 * @param userId 用户ID
 * @returns 用户详情
 */
export const getUserDetail = (userId: string) => {
  return request.get<User>(`/users/${userId}`)
}

/**
 * 创建用户
 * @param data 用户创建数据
 * @returns 创建的用户信息
 */
export const createUser = (data: UserCreateRequest) => {
  return request.post<User>('/users', data)
}

/**
 * 更新用户信息
 * @param userId 用户ID
 * @param data 用户更新数据
 * @returns 更新后的用户信息
 */
export const updateUser = (userId: string, data: UserUpdateRequest) => {
  return request.put<User>(`/users/${userId}`, data)
}

/**
 * 删除用户
 * @param userId 用户ID
 * @returns 删除结果
 */
export const deleteUser = (userId: string) => {
  return request.delete(`/users/${userId}`)
}

/**
 * 批量删除用户
 * @param userIds 用户ID列表
 * @returns 删除结果
 */
export const batchDeleteUsers = (userIds: string[]) => {
  return request.delete('/users/batch', { data: { userIds } })
}

/**
 * 启用/禁用用户
 * @param userId 用户ID
 * @param status 用户状态
 * @returns 更新结果
 */
export const updateUserStatus = (userId: string, status: 'active' | 'inactive' | 'banned') => {
  return request.patch(`/users/${userId}/status`, { status })
}

/**
 * 重置用户密码
 * @param userId 用户ID
 * @param newPassword 新密码
 * @returns 重置结果
 */
export const resetUserPassword = (userId: string, newPassword: string) => {
  return request.post(`/users/${userId}/reset-password`, { newPassword })
}

/**
 * 更新用户角色
 * @param userId 用户ID
 * @param role 新角色
 * @returns 更新结果
 */
export const updateUserRole = (userId: string, role: string) => {
  return request.patch(`/users/${userId}/role`, { role })
}

/**
 * 更新用户权限
 * @param userId 用户ID
 * @param permissions 权限列表
 * @returns 更新结果
 */
export const updateUserPermissions = (userId: string, permissions: string[]) => {
  return request.patch(`/users/${userId}/permissions`, { permissions })
}

/**
 * 获取用户权限列表
 * @param userId 用户ID
 * @returns 权限列表
 */
export const getUserPermissions = (userId: string) => {
  return request.get<{ permissions: string[] }>(`/users/${userId}/permissions`)
}

/**
 * 获取用户角色列表
 * @returns 角色列表
 */
export const getUserRoles = () => {
  return request.get<{ roles: Array<{ id: string; name: string; description?: string; permissions: string[] }> }>('/users/roles')
}

/**
 * 获取用户统计信息
 * @returns 统计信息
 */
export const getUserStatistics = () => {
  return request.get('/users/statistics')
}

/**
 * 搜索用户
 * @param keyword 搜索关键词
 * @param limit 结果数量限制
 * @returns 搜索结果
 */
export const searchUsers = (keyword: string, limit = 10) => {
  return request.get<User[]>('/users/search', {
    params: { keyword, limit }
  })
}

/**
 * 获取用户活动日志
 * @param userId 用户ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 活动日志列表
 */
export const getUserActivityLogs = (userId: string, page = 1, pageSize = 20) => {
  return request.get(`/users/${userId}/activity-logs`, {
    params: { page, pageSize }
  })
}

/**
 * 获取用户登录历史
 * @param userId 用户ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 登录历史列表
 */
export const getUserLoginHistory = (userId: string, page = 1, pageSize = 20) => {
  return request.get(`/users/${userId}/login-history`, {
    params: { page, pageSize }
  })
}

/**
 * 上传用户头像
 * @param userId 用户ID
 * @param file 头像文件
 * @returns 上传结果
 */
export const uploadUserAvatar = (userId: string, file: File) => {
  const formData = new FormData()
  formData.append('avatar', file)
  return request.post<{ url: string }>(`/users/${userId}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 删除用户头像
 * @param userId 用户ID
 * @returns 删除结果
 */
export const deleteUserAvatar = (userId: string) => {
  return request.delete(`/users/${userId}/avatar`)
}

/**
 * 获取用户偏好设置
 * @param userId 用户ID
 * @returns 偏好设置
 */
export const getUserPreferences = (userId: string) => {
  return request.get(`/users/${userId}/preferences`)
}

/**
 * 更新用户偏好设置
 * @param userId 用户ID
 * @param preferences 偏好设置数据
 * @returns 更新结果
 */
export const updateUserPreferences = (userId: string, preferences: any) => {
  return request.put(`/users/${userId}/preferences`, preferences)
}

/**
 * 获取用户通知设置
 * @param userId 用户ID
 * @returns 通知设置
 */
export const getUserNotificationSettings = (userId: string) => {
  return request.get(`/users/${userId}/notification-settings`)
}

/**
 * 更新用户通知设置
 * @param userId 用户ID
 * @param settings 通知设置数据
 * @returns 更新结果
 */
export const updateUserNotificationSettings = (userId: string, settings: any) => {
  return request.put(`/users/${userId}/notification-settings`, settings)
}

/**
 * 获取用户安全设置
 * @param userId 用户ID
 * @returns 安全设置
 */
export const getUserSecuritySettings = (userId: string) => {
  return request.get(`/users/${userId}/security-settings`)
}

/**
 * 更新用户安全设置
 * @param userId 用户ID
 * @param settings 安全设置数据
 * @returns 更新结果
 */
export const updateUserSecuritySettings = (userId: string, settings: any) => {
  return request.put(`/users/${userId}/security-settings`, settings)
}

/**
 * 发送用户邀请
 * @param email 邮箱地址
 * @param role 角色
 * @param message 邀请消息
 * @returns 邀请结果
 */
export const inviteUser = (email: string, role: string, message?: string) => {
  return request.post('/users/invite', { email, role, message })
}

/**
 * 获取用户邀请列表
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 邀请列表
 */
export const getUserInvitations = (page = 1, pageSize = 20) => {
  return request.get('/users/invitations', {
    params: { page, pageSize }
  })
}

/**
 * 取消用户邀请
 * @param invitationId 邀请ID
 * @returns 取消结果
 */
export const cancelUserInvitation = (invitationId: string) => {
  return request.delete(`/users/invitations/${invitationId}`)
}

/**
 * 重新发送用户邀请
 * @param invitationId 邀请ID
 * @returns 发送结果
 */
export const resendUserInvitation = (invitationId: string) => {
  return request.post(`/users/invitations/${invitationId}/resend`)
}

/**
 * 接受用户邀请
 * @param token 邀请令牌
 * @param userData 用户数据
 * @returns 接受结果
 */
export const acceptUserInvitation = (token: string, userData: any) => {
  return request.post('/users/invitations/accept', { token, ...userData })
}

/**
 * 拒绝用户邀请
 * @param token 邀请令牌
 * @returns 拒绝结果
 */
export const rejectUserInvitation = (token: string) => {
  return request.post('/users/invitations/reject', { token })
}

/**
 * 导出用户数据
 * @param userIds 用户ID列表
 * @param format 导出格式
 * @returns 导出结果
 */
export const exportUsers = (userIds?: string[], format = 'xlsx') => {
  return request.post('/users/export', { userIds, format }, {
    responseType: 'blob'
  })
}

/**
 * 导入用户数据
 * @param file 导入文件
 * @returns 导入结果
 */
export const importUsers = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/users/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取用户导入模板
 * @returns 模板文件
 */
export const getUserImportTemplate = () => {
  return request.get('/users/import-template', {
    responseType: 'blob'
  })
}

/**
 * 验证用户导入数据
 * @param file 导入文件
 * @returns 验证结果
 */
export const validateUserImportData = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/users/validate-import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取在线用户列表
 * @returns 在线用户列表
 */
export const getOnlineUsers = () => {
  return request.get<User[]>('/users/online')
}

/**
 * 强制用户下线
 * @param userId 用户ID
 * @returns 下线结果
 */
export const forceUserOffline = (userId: string) => {
  return request.post(`/users/${userId}/force-offline`)
}

/**
 * 获取用户标签
 * @returns 标签列表
 */
export const getUserTags = () => {
  return request.get<{ tags: string[] }>('/users/tags')
}

/**
 * 为用户添加标签
 * @param userId 用户ID
 * @param tags 标签列表
 * @returns 添加结果
 */
export const addUserTags = (userId: string, tags: string[]) => {
  return request.post(`/users/${userId}/tags`, { tags })
}

/**
 * 移除用户标签
 * @param userId 用户ID
 * @param tags 标签列表
 * @returns 移除结果
 */
export const removeUserTags = (userId: string, tags: string[]) => {
  return request.delete(`/users/${userId}/tags`, { data: { tags } })
}

// 导出用户API对象
export const userApi = {
  getUserList,
  getUserDetail,
  createUser,
  updateUser,
  deleteUser,
  batchDeleteUsers,
  updateUserStatus,
  resetUserPassword,
  updateUserRole,
  updateUserPermissions,
  getUserPermissions,
  getUserRoles,
  getUserStatistics,
  searchUsers,
  getUserActivityLogs,
  getUserLoginHistory,
  uploadUserAvatar,
  deleteUserAvatar,
  getUserPreferences,
  updateUserPreferences,
  getUserNotificationSettings,
  updateUserNotificationSettings,
  getUserSecuritySettings,
  updateUserSecuritySettings,
  inviteUser,
  getUserInvitations,
  cancelUserInvitation,
  resendUserInvitation,
  acceptUserInvitation,
  rejectUserInvitation,
  exportUsers,
  importUsers,
  getUserImportTemplate,
  validateUserImportData,
  getOnlineUsers,
  forceUserOffline,
  getUserTags,
  addUserTags,
  removeUserTags
}