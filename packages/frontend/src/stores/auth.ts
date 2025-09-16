import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import type { User, LoginRequest, RegisterRequest } from '@/api/types'
import { removeToken, setToken, getToken } from '@/utils/auth'
import { ElMessage } from 'element-plus'

/**
 * 认证状态管理
 * 管理用户登录、注册、登出等认证相关状态
 */

export interface AuthState {
  // 访问令牌
  token: string | null
  // 刷新令牌
  refreshToken: string | null
  // 当前用户信息
  user: User | null
  // 登录状态
  isAuthenticated: boolean
  // 登录加载状态
  loginLoading: boolean
  // 注册加载状态
  registerLoading: boolean
  // 登出加载状态
  logoutLoading: boolean
  // 用户权限列表
  permissions: string[]
  // 用户角色列表
  roles: string[]
  // 记住登录状态
  rememberMe: boolean
}

export const useAuthStore = defineStore('auth', () => {
  // 状态定义
  const token = ref<string | null>(getToken())
  const refreshToken = ref<string | null>(null)
  const user = ref<User | null>(null)
  const loginLoading = ref(false)
  const registerLoading = ref(false)
  const logoutLoading = ref(false)
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])
  const rememberMe = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value
  })

  const userRole = computed(() => {
    return user.value?.role || null
  })

  const userName = computed(() => {
    return user.value?.name || user.value?.username || ''
  })

  const userAvatar = computed(() => {
    return user.value?.avatar || ''
  })

  const userEmail = computed(() => {
    return user.value?.email || ''
  })

  // 动作方法
  /**
   * 用户登录
   */
  const login = async (loginData: LoginRequest): Promise<boolean> => {
    try {
      loginLoading.value = true
      
      const response = await authApi.login(loginData)
      
      if (response.success && response.data) {
        // 保存令牌
        token.value = response.data.token
        refreshToken.value = response.data.refreshToken
        setToken(response.data.token)
        
        // 保存用户信息
        user.value = response.data.user
        permissions.value = response.data.permissions || []
        roles.value = response.data.roles || []
        
        // 保存记住登录状态
        rememberMe.value = loginData.rememberMe || false
        
        ElMessage.success('登录成功')
        return true
      } else {
        ElMessage.error(response.message || '登录失败')
        return false
      }
    } catch (error: any) {
      console.error('登录错误:', error)
      ElMessage.error(error.message || '登录失败，请稍后重试')
      return false
    } finally {
      loginLoading.value = false
    }
  }

  /**
   * 用户注册
   */
  const register = async (registerData: RegisterRequest): Promise<boolean> => {
    try {
      registerLoading.value = true
      
      const response = await authApi.register(registerData)
      
      if (response.success) {
        ElMessage.success('注册成功，请登录')
        return true
      } else {
        ElMessage.error(response.message || '注册失败')
        return false
      }
    } catch (error: any) {
      console.error('注册错误:', error)
      ElMessage.error(error.message || '注册失败，请稍后重试')
      return false
    } finally {
      registerLoading.value = false
    }
  }

  /**
   * 用户登出
   */
  const logout = async (): Promise<void> => {
    try {
      logoutLoading.value = true
      
      if (token.value) {
        await authApi.logout()
      }
    } catch (error) {
      console.error('登出错误:', error)
    } finally {
      // 清除本地状态
      clearAuthData()
      logoutLoading.value = false
      ElMessage.success('已退出登录')
    }
  }

  /**
   * 刷新令牌
   */
  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      if (!refreshToken.value) {
        throw new Error('没有刷新令牌')
      }
      
      const response = await authApi.refreshToken(refreshToken.value)
      
      if (response.success && response.data) {
        token.value = response.data.token
        setToken(response.data.token)
        
        if (response.data.refreshToken) {
          refreshToken.value = response.data.refreshToken
        }
        
        return true
      } else {
        throw new Error(response.message || '刷新令牌失败')
      }
    } catch (error) {
      console.error('刷新令牌错误:', error)
      // 刷新失败，清除认证数据
      clearAuthData()
      return false
    }
  }

  /**
   * 获取用户信息
   */
  const fetchUserInfo = async (): Promise<boolean> => {
    try {
      if (!token.value) {
        return false
      }
      
      const response = await authApi.getUserInfo()
      
      if (response.success && response.data) {
        user.value = response.data.user
        permissions.value = response.data.permissions || []
        roles.value = response.data.roles || []
        return true
      } else {
        throw new Error(response.message || '获取用户信息失败')
      }
    } catch (error) {
      console.error('获取用户信息错误:', error)
      // 获取用户信息失败，可能令牌已过期
      if (refreshToken.value) {
        const refreshSuccess = await refreshAccessToken()
        if (refreshSuccess) {
          // 刷新成功后重新获取用户信息
          return fetchUserInfo()
        }
      }
      clearAuthData()
      return false
    }
  }

  /**
   * 更新用户信息
   */
  const updateUserInfo = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const response = await authApi.updateProfile(userData)
      
      if (response.success && response.data) {
        user.value = { ...user.value, ...response.data }
        ElMessage.success('用户信息更新成功')
        return true
      } else {
        ElMessage.error(response.message || '更新失败')
        return false
      }
    } catch (error: any) {
      console.error('更新用户信息错误:', error)
      ElMessage.error(error.message || '更新失败，请稍后重试')
      return false
    }
  }

  /**
   * 修改密码
   */
  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await authApi.changePassword({
        oldPassword,
        newPassword
      })
      
      if (response.success) {
        ElMessage.success('密码修改成功，请重新登录')
        // 修改密码后需要重新登录
        await logout()
        return true
      } else {
        ElMessage.error(response.message || '密码修改失败')
        return false
      }
    } catch (error: any) {
      console.error('修改密码错误:', error)
      ElMessage.error(error.message || '密码修改失败，请稍后重试')
      return false
    }
  }

  /**
   * 忘记密码
   */
  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      const response = await authApi.forgotPassword({ email })
      
      if (response.success) {
        ElMessage.success('重置密码邮件已发送，请查收')
        return true
      } else {
        ElMessage.error(response.message || '发送失败')
        return false
      }
    } catch (error: any) {
      console.error('忘记密码错误:', error)
      ElMessage.error(error.message || '发送失败，请稍后重试')
      return false
    }
  }

  /**
   * 重置密码
   */
  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await authApi.resetPassword({
        token,
        newPassword
      })
      
      if (response.success) {
        ElMessage.success('密码重置成功，请登录')
        return true
      } else {
        ElMessage.error(response.message || '密码重置失败')
        return false
      }
    } catch (error: any) {
      console.error('重置密码错误:', error)
      ElMessage.error(error.message || '密码重置失败，请稍后重试')
      return false
    }
  }

  /**
   * 检查权限
   */
  const hasPermission = (permission: string): boolean => {
    return permissions.value.includes(permission)
  }

  /**
   * 检查角色
   */
  const hasRole = (role: string): boolean => {
    return roles.value.includes(role)
  }

  /**
   * 检查多个权限（需要全部拥有）
   */
  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every(permission => hasPermission(permission))
  }

  /**
   * 检查多个权限（拥有其中一个即可）
   */
  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(permission => hasPermission(permission))
  }

  /**
   * 检查多个角色（需要全部拥有）
   */
  const hasAllRoles = (roleList: string[]): boolean => {
    return roleList.every(role => hasRole(role))
  }

  /**
   * 检查多个角色（拥有其中一个即可）
   */
  const hasAnyRole = (roleList: string[]): boolean => {
    return roleList.some(role => hasRole(role))
  }

  /**
   * 清除认证数据
   */
  const clearAuthData = () => {
    token.value = null
    refreshToken.value = null
    user.value = null
    permissions.value = []
    roles.value = []
    removeToken()
  }

  /**
   * 初始化认证状态
   */
  const initAuth = async () => {
    const savedToken = getToken()
    if (savedToken) {
      token.value = savedToken
      // 尝试获取用户信息
      await fetchUserInfo()
    }
  }

  /**
   * 重置状态
   */
  const $reset = () => {
    clearAuthData()
    loginLoading.value = false
    registerLoading.value = false
    logoutLoading.value = false
    rememberMe.value = false
  }

  return {
    // 状态
    token,
    refreshToken,
    user,
    loginLoading,
    registerLoading,
    logoutLoading,
    permissions,
    roles,
    rememberMe,

    // 计算属性
    isAuthenticated,
    userRole,
    userName,
    userAvatar,
    userEmail,

    // 动作
    login,
    register,
    logout,
    refreshAccessToken,
    fetchUserInfo,
    updateUserInfo,
    changePassword,
    forgotPassword,
    resetPassword,
    hasPermission,
    hasRole,
    hasAllPermissions,
    hasAnyPermission,
    hasAllRoles,
    hasAnyRole,
    clearAuthData,
    initAuth,
    $reset
  }
}, {
  persist: {
    key: 'verto-auth',
    paths: ['token', 'refreshToken', 'user', 'permissions', 'roles', 'rememberMe']
  }
})