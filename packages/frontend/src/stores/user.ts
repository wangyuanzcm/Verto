import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api/auth';
import { userApi } from '@/api/user';
import type { User, LoginForm, RegisterForm } from '@/types/user';

/**
 * 用户权限类型
 */
export type UserRole = 'admin' | 'manager' | 'developer' | 'viewer';

/**
 * 用户状态管理
 */
export const useUserStore = defineStore('user', () => {
  // 用户基础信息
  const user = ref<User | null>(null);
  const token = ref<string>('');
  const refreshToken = ref<string>('');
  
  // 权限信息
  const permissions = ref<string[]>([]);
  const roles = ref<UserRole[]>([]);
  
  // 状态标识
  const isLoggedIn = ref(false);
  const isLoading = ref(false);
  
  // 计算属性
  const isAdmin = computed(() => roles.value.includes('admin'));
  const isManager = computed(() => roles.value.includes('manager') || isAdmin.value);
  const isDeveloper = computed(() => roles.value.includes('developer') || isManager.value);
  
  const userDisplayName = computed(() => {
    if (!user.value) return '';
    return user.value.nickname || user.value.username || user.value.email;
  });
  
  const userAvatar = computed(() => {
    return user.value?.avatar || '/default-avatar.png';
  });
  
  /**
   * 初始化用户状态
   */
  const initUserState = () => {
    try {
      // 从本地存储恢复token
      const savedToken = localStorage.getItem('verto-token');
      const savedRefreshToken = localStorage.getItem('verto-refresh-token');
      
      if (savedToken) {
        token.value = savedToken;
        refreshToken.value = savedRefreshToken || '';
        isLoggedIn.value = true;
      }
    } catch (error) {
      console.error('初始化用户状态失败:', error);
      clearUserState();
    }
  };
  
  /**
   * 用户登录
   */
  const login = async (loginForm: LoginForm): Promise<void> => {
    try {
      isLoading.value = true;
      
      const response = await authApi.login(loginForm);
      const { user: userData, token: accessToken, refreshToken: newRefreshToken } = response.data;
      
      // 保存用户信息
      user.value = userData;
      token.value = accessToken;
      refreshToken.value = newRefreshToken;
      isLoggedIn.value = true;
      
      // 保存到本地存储
      localStorage.setItem('verto-token', accessToken);
      localStorage.setItem('verto-refresh-token', newRefreshToken);
      
      // 获取用户权限
      await getUserPermissions();
      
      console.log('用户登录成功:', userData.username);
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * 用户注册
   */
  const register = async (registerForm: RegisterForm): Promise<void> => {
    try {
      isLoading.value = true;
      
      const response = await authApi.register(registerForm);
      const { user: userData, token: accessToken, refreshToken: newRefreshToken } = response.data;
      
      // 保存用户信息
      user.value = userData;
      token.value = accessToken;
      refreshToken.value = newRefreshToken;
      isLoggedIn.value = true;
      
      // 保存到本地存储
      localStorage.setItem('verto-token', accessToken);
      localStorage.setItem('verto-refresh-token', newRefreshToken);
      
      // 获取用户权限
      await getUserPermissions();
      
      console.log('用户注册成功:', userData.username);
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * 用户登出
   */
  const logout = async (): Promise<void> => {
    try {
      isLoading.value = true;
      
      // 调用登出API
      if (token.value) {
        await authApi.logout();
      }
    } catch (error) {
      console.error('登出API调用失败:', error);
    } finally {
      // 无论API调用是否成功，都清除本地状态
      clearUserState();
      isLoading.value = false;
      
      console.log('用户已登出');
    }
  };
  
  /**
   * 获取用户信息
   */
  const getUserInfo = async (): Promise<void> => {
    try {
      if (!token.value) {
        throw new Error('未找到访问令牌');
      }
      
      isLoading.value = true;
      
      const response = await userApi.getCurrentUser();
      user.value = response.data;
      
      // 获取用户权限
      await getUserPermissions();
      
      console.log('获取用户信息成功:', user.value.username);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 如果获取用户信息失败，可能是token过期，尝试刷新token
      await refreshAccessToken();
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * 获取用户权限
   */
  const getUserPermissions = async (): Promise<void> => {
    try {
      const response = await userApi.getUserPermissions();
      permissions.value = response.data.permissions;
      roles.value = response.data.roles;
    } catch (error) {
      console.error('获取用户权限失败:', error);
      permissions.value = [];
      roles.value = [];
    }
  };
  
  /**
   * 刷新访问令牌
   */
  const refreshAccessToken = async (): Promise<void> => {
    try {
      if (!refreshToken.value) {
        throw new Error('未找到刷新令牌');
      }
      
      const response = await authApi.refreshToken(refreshToken.value);
      const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;
      
      token.value = newAccessToken;
      refreshToken.value = newRefreshToken;
      
      // 更新本地存储
      localStorage.setItem('verto-token', newAccessToken);
      localStorage.setItem('verto-refresh-token', newRefreshToken);
      
      console.log('访问令牌刷新成功');
    } catch (error) {
      console.error('刷新访问令牌失败:', error);
      // 刷新失败，清除用户状态
      clearUserState();
      throw error;
    }
  };
  
  /**
   * 更新用户信息
   */
  const updateUserInfo = async (updateData: Partial<User>): Promise<void> => {
    try {
      isLoading.value = true;
      
      const response = await userApi.updateUser(updateData);
      user.value = response.data;
      
      console.log('用户信息更新成功');
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * 修改密码
   */
  const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    try {
      isLoading.value = true;
      
      await userApi.changePassword({
        oldPassword,
        newPassword
      });
      
      console.log('密码修改成功');
    } catch (error) {
      console.error('修改密码失败:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * 检查权限
   */
  const hasPermission = (permission: string): boolean => {
    return permissions.value.includes(permission) || isAdmin.value;
  };
  
  /**
   * 检查角色
   */
  const hasRole = (role: UserRole): boolean => {
    return roles.value.includes(role);
  };
  
  /**
   * 检查是否有任一权限
   */
  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(permission => hasPermission(permission));
  };
  
  /**
   * 检查是否有任一角色
   */
  const hasAnyRole = (roleList: UserRole[]): boolean => {
    return roleList.some(role => hasRole(role));
  };
  
  /**
   * 清除用户状态
   */
  const clearUserState = (): void => {
    user.value = null;
    token.value = '';
    refreshToken.value = '';
    permissions.value = [];
    roles.value = [];
    isLoggedIn.value = false;
    
    // 清除本地存储
    localStorage.removeItem('verto-token');
    localStorage.removeItem('verto-refresh-token');
  };
  
  // 初始化
  initUserState();
  
  return {
    // 状态
    user,
    token,
    refreshToken,
    permissions,
    roles,
    isLoggedIn,
    isLoading,
    
    // 计算属性
    isAdmin,
    isManager,
    isDeveloper,
    userDisplayName,
    userAvatar,
    
    // 方法
    login,
    register,
    logout,
    getUserInfo,
    getUserPermissions,
    refreshAccessToken,
    updateUserInfo,
    changePassword,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAnyRole,
    clearUserState
  };
});