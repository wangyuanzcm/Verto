/**
 * 认证相关API接口
 * 处理用户登录、注册、密码重置等认证功能
 */

import request from '@/utils/request'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  RefreshTokenRequest,
  User
} from './types'

/**
 * 用户登录
 * @param data 登录请求数据
 * @returns 登录响应数据
 */
export const login = (data: LoginRequest) => {
  return request.post<LoginResponse>('/auth/login', data)
}

/**
 * 用户注册
 * @param data 注册请求数据
 * @returns 注册响应数据
 */
export const register = (data: RegisterRequest) => {
  return request.post<User>('/auth/register', data)
}

/**
 * 用户登出
 * @returns 登出响应
 */
export const logout = () => {
  return request.post('/auth/logout')
}

/**
 * 刷新访问令牌
 * @param data 刷新令牌请求数据
 * @returns 新的访问令牌
 */
export const refreshToken = (data: RefreshTokenRequest) => {
  return request.post<LoginResponse>('/auth/refresh', data)
}

/**
 * 获取当前用户信息
 * @returns 当前用户信息
 */
export const getCurrentUser = () => {
  return request.get<User>('/auth/me')
}

/**
 * 更新当前用户信息
 * @param data 用户更新数据
 * @returns 更新后的用户信息
 */
export const updateCurrentUser = (data: Partial<User>) => {
  return request.put<User>('/auth/me', data)
}

/**
 * 更新用户资料（updateCurrentUser的别名）
 * @param data 用户更新数据
 * @returns 更新后的用户信息
 */
export const updateProfile = (data: Partial<User>) => {
  return updateCurrentUser(data)
}

/**
 * 上传用户头像
 * @param file 头像文件
 * @returns 上传结果
 */
export const uploadAvatar = (file: File) => {
  const formData = new FormData()
  formData.append('avatar', file)
  return request.post<{ url: string }>('/auth/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 删除用户账户
 * @param password 当前密码
 * @returns 删除结果
 */
export const deleteAccount = (password: string) => {
  return request.delete('/auth/account', { data: { password } })
}

/**
 * 修改密码
 * @param data 修改密码请求数据
 * @returns 修改结果
 */
export const changePassword = (data: ChangePasswordRequest) => {
  return request.post('/auth/change-password', data)
}

/**
 * 重置密码
 * @param data 重置密码请求数据
 * @returns 重置结果
 */
export const resetPassword = (data: ResetPasswordRequest) => {
  return request.post('/auth/reset-password', data)
}

/**
 * 确认重置密码
 * @param token 重置令牌
 * @param password 新密码
 * @returns 确认结果
 */
export const confirmResetPassword = (token: string, password: string) => {
  return request.post('/auth/confirm-reset-password', { token, password })
}

/**
 * 发送邮箱验证码
 * @param email 邮箱地址
 * @returns 发送结果
 */
export const sendEmailVerification = (email: string) => {
  return request.post('/auth/send-email-verification', { email })
}

/**
 * 验证邮箱
 * @param token 验证令牌
 * @returns 验证结果
 */
export const verifyEmail = (token: string) => {
  return request.post('/auth/verify-email', { token })
}

/**
 * 重新发送验证邮件
 * @param email 邮箱地址
 * @returns 发送结果
 */
export const resendVerification = (email: string) => {
  return request.post('/auth/resend-verification', { email })
}

/**
 * 检查用户名是否可用
 * @param username 用户名
 * @returns 可用性检查结果
 */
export const checkUsernameAvailability = (username: string) => {
  return request.get<{ available: boolean }>(`/auth/check-username/${username}`)
}

/**
 * 检查邮箱是否可用
 * @param email 邮箱地址
 * @returns 可用性检查结果
 */
export const checkEmailAvailability = (email: string) => {
  return request.get<{ available: boolean }>(`/auth/check-email/${email}`)
}

/**
 * 获取验证码
 * @param type 验证码类型
 * @returns 验证码图片
 */
export const getCaptcha = (type: 'login' | 'register' | 'reset' = 'login') => {
  return request.get<{ image: string; token: string }>(`/auth/captcha?type=${type}`)
}

/**
 * 验证验证码
 * @param token 验证码令牌
 * @param code 验证码
 * @returns 验证结果
 */
export const verifyCaptcha = (token: string, code: string) => {
  return request.post<{ valid: boolean }>('/auth/verify-captcha', { token, code })
}

/**
 * 启用两步验证
 * @returns 两步验证设置信息
 */
export const enableTwoFactor = () => {
  return request.post<{ qrCode: string; secret: string; backupCodes: string[] }>('/auth/enable-2fa')
}

/**
 * 确认启用两步验证
 * @param code 验证码
 * @returns 确认结果
 */
export const confirmTwoFactor = (code: string) => {
  return request.post('/auth/confirm-2fa', { code })
}

/**
 * 禁用两步验证
 * @param password 当前密码
 * @returns 禁用结果
 */
export const disableTwoFactor = (password: string) => {
  return request.post('/auth/disable-2fa', { password })
}

/**
 * 验证两步验证码
 * @param code 验证码
 * @returns 验证结果
 */
export const verifyTwoFactor = (code: string) => {
  return request.post('/auth/verify-2fa', { code })
}

/**
 * 获取备用验证码
 * @returns 备用验证码列表
 */
export const getBackupCodes = () => {
  return request.get<{ codes: string[] }>('/auth/backup-codes')
}

/**
 * 重新生成备用验证码
 * @returns 新的备用验证码列表
 */
export const regenerateBackupCodes = () => {
  return request.post<{ codes: string[] }>('/auth/regenerate-backup-codes')
}

/**
 * 生成备用验证码（regenerateBackupCodes的别名）
 * @returns 备用验证码列表
 */
export const generateBackupCodes = () => {
  return regenerateBackupCodes()
}

/**
 * 获取登录历史
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 登录历史列表
 */
export const getLoginHistory = (page = 1, pageSize = 20) => {
  return request.get('/auth/login-history', {
    params: { page, pageSize }
  })
}

/**
 * 撤销会话
 * @param sessionId 会话ID
 * @returns 撤销结果
 */
export const revokeSession = (sessionId: string) => {
  return request.delete(`/auth/sessions/${sessionId}`)
}

/**
 * 撤销所有会话
 * @returns 撤销结果
 */
export const revokeAllSessions = () => {
  return request.delete('/auth/sessions')
}

/**
 * 获取受信任设备列表
 * @returns 受信任设备列表
 */
export const getTrustedDevices = () => {
  return request.get('/auth/trusted-devices')
}

/**
 * 添加受信任设备
 * @param name 设备名称
 * @returns 添加结果
 */
export const addTrustedDevice = (name: string) => {
  return request.post('/auth/trusted-devices', { name })
}

/**
 * 移除受信任设备
 * @param deviceId 设备ID
 * @returns 移除结果
 */
export const removeTrustedDevice = (deviceId: string) => {
  return request.delete(`/auth/trusted-devices/${deviceId}`)
}

/**
 * 清除所有会话
 * @returns 清除结果
 */
export const clearAllSessions = () => {
  return request.post('/auth/clear-sessions')
}

/**
 * 获取会话列表
 * @returns 会话列表
 */
export const getSessions = () => {
  return request.get('/auth/sessions')
}

/**
 * 终止指定会话
 * @param sessionId 会话ID
 * @returns 终止结果
 */
export const terminateSession = (sessionId: string) => {
  return request.delete(`/auth/sessions/${sessionId}`)
}

/**
 * 获取账户安全设置
 * @returns 安全设置信息
 */
export const getSecuritySettings = () => {
  return request.get('/auth/security-settings')
}

/**
 * 更新账户安全设置
 * @param settings 安全设置数据
 * @returns 更新结果
 */
export const updateSecuritySettings = (settings: any) => {
  return request.put('/auth/security-settings', settings)
}

/**
 * 发送手机验证码
 * @param phone 手机号码
 * @returns 发送结果
 */
export const sendSmsVerification = (phone: string) => {
  return request.post('/auth/send-sms-verification', { phone })
}

/**
 * 验证手机号码
 * @param phone 手机号码
 * @param code 验证码
 * @returns 验证结果
 */
export const verifyPhone = (phone: string, code: string) => {
  return request.post('/auth/verify-phone', { phone, code })
}

/**
 * 绑定第三方账户
 * @param provider 第三方提供商
 * @param code 授权码
 * @returns 绑定结果
 */
export const bindThirdPartyAccount = (provider: string, code: string) => {
  return request.post('/auth/bind-third-party', { provider, code })
}

/**
 * 解绑第三方账户
 * @param provider 第三方提供商
 * @returns 解绑结果
 */
export const unbindThirdPartyAccount = (provider: string) => {
  return request.delete(`/auth/unbind-third-party/${provider}`)
}

/**
 * 获取第三方账户绑定状态
 * @returns 绑定状态信息
 */
export const getThirdPartyBindings = () => {
  return request.get('/auth/third-party-bindings')
}

/**
 * 获取第三方登录URL
 * @param provider 第三方提供商
 * @param redirectUrl 重定向URL
 * @returns 登录URL
 */
export const getThirdPartyLoginUrl = (provider: string, redirectUrl?: string) => {
  return request.get<{ url: string }>(`/auth/third-party-login-url/${provider}`, {
    params: { redirectUrl }
  })
}

/**
 * 第三方登录回调处理
 * @param provider 第三方提供商
 * @param code 授权码
 * @param state 状态参数
 * @returns 登录结果
 */
export const thirdPartyLoginCallback = (provider: string, code: string, state?: string) => {
  return request.post<LoginResponse>('/auth/third-party-callback', {
    provider,
    code,
    state
  })
}

/**
 * 解绑第三方账户
 * @param provider 第三方提供商
 * @returns 解绑结果
 */
export const unlinkThirdPartyAccount = (provider: string) => {
  return request.delete(`/auth/third-party/${provider}`)
}

// 导出认证API对象
export const authApi = {
  login,
  register,
  logout,
  refreshToken,
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerification,
  getCurrentUser,
  updateProfile,
  uploadAvatar,
  deleteAccount,
  enableTwoFactor,
  disableTwoFactor,
  verifyTwoFactor,
  generateBackupCodes,
  getLoginHistory,
  revokeSession,
  revokeAllSessions,
  getThirdPartyLoginUrl,
  unlinkThirdPartyAccount,
  thirdPartyLoginCallback
}