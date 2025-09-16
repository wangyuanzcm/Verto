/**
 * API接口定义
 * 统一管理所有API接口
 */

import request from '@/utils/request'

// 用户相关接口
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: string
  status: 'active' | 'inactive' | 'banned'
  createdAt: string
  updatedAt: string
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
    company?: string
    position?: string
    bio?: string
  }
}

// 登录请求参数
export interface LoginParams {
  username: string
  password: string
  remember?: boolean
}

// 登录响应数据
export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

// 注册请求参数
export interface RegisterParams {
  username: string
  email: string
  password: string
  confirmPassword: string
  inviteCode?: string
}

// 项目相关接口
export interface Project {
  id: string
  name: string
  description?: string
  type: 'web' | 'mobile' | 'desktop' | 'api'
  status: 'planning' | 'development' | 'testing' | 'production' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  ownerId: string
  owner: User
  members: ProjectMember[]
  tags: string[]
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
  stats?: {
    totalRequirements: number
    completedRequirements: number
    totalTasks: number
    completedTasks: number
    totalFiles: number
    totalSize: number
  }
}

// 项目成员
export interface ProjectMember {
  id: string
  userId: string
  user: User
  projectId: string
  role: 'owner' | 'admin' | 'developer' | 'designer' | 'tester' | 'viewer'
  permissions: string[]
  joinedAt: string
}

// 项目创建参数
export interface CreateProjectParams {
  name: string
  description?: string
  type: Project['type']
  priority?: Project['priority']
  tags?: string[]
  startDate?: string
  endDate?: string
  template?: string
}

// 需求相关接口
export interface Requirement {
  id: string
  title: string
  description: string
  type: 'feature' | 'bug' | 'enhancement' | 'task'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'draft' | 'review' | 'approved' | 'development' | 'testing' | 'done' | 'rejected'
  projectId: string
  assigneeId?: string
  assignee?: User
  reporterId: string
  reporter: User
  tags: string[]
  attachments: FileInfo[]
  comments: Comment[]
  estimatedHours?: number
  actualHours?: number
  dueDate?: string
  createdAt: string
  updatedAt: string
}

// 文件信息
export interface FileInfo {
  id: string
  name: string
  originalName: string
  size: number
  type: string
  url: string
  thumbnailUrl?: string
  uploaderId: string
  uploader: User
  createdAt: string
}

// 评论
export interface Comment {
  id: string
  content: string
  authorId: string
  author: User
  targetType: 'requirement' | 'project' | 'prototype'
  targetId: string
  parentId?: string
  replies?: Comment[]
  attachments: FileInfo[]
  createdAt: string
  updatedAt: string
}

// 原型相关接口
export interface Prototype {
  id: string
  name: string
  description?: string
  projectId: string
  version: string
  status: 'draft' | 'review' | 'approved' | 'archived'
  pages: PrototypePage[]
  createdBy: string
  creator: User
  createdAt: string
  updatedAt: string
}

// 原型页面
export interface PrototypePage {
  id: string
  name: string
  path: string
  components: PrototypeComponent[]
  layout?: any
  meta?: any
  order: number
}

// 原型组件
export interface PrototypeComponent {
  id: string
  type: string
  name: string
  props: Record<string, any>
  style: Record<string, any>
  children?: PrototypeComponent[]
  position: {
    x: number
    y: number
    width: number
    height: number
  }
}

// 分页参数
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 分页响应
export interface PaginationResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 搜索参数
export interface SearchParams extends PaginationParams {
  keyword?: string
  filters?: Record<string, any>
}

/**
 * 用户认证API
 */
export const authApi = {
  /**
   * 用户登录
   * @param params 登录参数
   * @returns 登录响应
   */
  login: (params: LoginParams) => 
    request.post<LoginResponse>('/auth/login', params),

  /**
   * 用户注册
   * @param params 注册参数
   * @returns 用户信息
   */
  register: (params: RegisterParams) => 
    request.post<User>('/auth/register', params),

  /**
   * 用户登出
   * @returns void
   */
  logout: () => 
    request.post('/auth/logout'),

  /**
   * 刷新Token
   * @param refreshToken 刷新令牌
   * @returns 新的Token信息
   */
  refreshToken: (refreshToken: string) => 
    request.post<LoginResponse>('/auth/refresh', { refreshToken }),

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  getCurrentUser: () => 
    request.get<User>('/auth/me'),

  /**
   * 修改密码
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   * @returns void
   */
  changePassword: (oldPassword: string, newPassword: string) => 
    request.post('/auth/change-password', { oldPassword, newPassword }),

  /**
   * 忘记密码
   * @param email 邮箱
   * @returns void
   */
  forgotPassword: (email: string) => 
    request.post('/auth/forgot-password', { email }),

  /**
   * 重置密码
   * @param token 重置令牌
   * @param password 新密码
   * @returns void
   */
  resetPassword: (token: string, password: string) => 
    request.post('/auth/reset-password', { token, password })
}

/**
 * 用户管理API
 */
export const userApi = {
  /**
   * 获取用户列表
   * @param params 搜索参数
   * @returns 用户列表
   */
  getUsers: (params?: SearchParams) => 
    request.get<PaginationResponse<User>>('/users', params),

  /**
   * 获取用户详情
   * @param id 用户ID
   * @returns 用户信息
   */
  getUser: (id: string) => 
    request.get<User>(`/users/${id}`),

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param data 更新数据
   * @returns 用户信息
   */
  updateUser: (id: string, data: Partial<User>) => 
    request.put<User>(`/users/${id}`, data),

  /**
   * 删除用户
   * @param id 用户ID
   * @returns void
   */
  deleteUser: (id: string) => 
    request.delete(`/users/${id}`),

  /**
   * 上传头像
   * @param file 头像文件
   * @returns 头像URL
   */
  uploadAvatar: (file: File) => 
    request.upload<{ url: string }>('/users/avatar', file)
}

/**
 * 项目管理API
 */
export const projectApi = {
  /**
   * 获取项目列表
   * @param params 搜索参数
   * @returns 项目列表
   */
  getProjects: (params?: SearchParams) => 
    request.get<PaginationResponse<Project>>('/projects', params),

  /**
   * 获取项目详情
   * @param id 项目ID
   * @returns 项目信息
   */
  getProject: (id: string) => 
    request.get<Project>(`/projects/${id}`),

  /**
   * 创建项目
   * @param data 项目数据
   * @returns 项目信息
   */
  createProject: (data: CreateProjectParams) => 
    request.post<Project>('/projects', data),

  /**
   * 更新项目
   * @param id 项目ID
   * @param data 更新数据
   * @returns 项目信息
   */
  updateProject: (id: string, data: Partial<Project>) => 
    request.put<Project>(`/projects/${id}`, data),

  /**
   * 删除项目
   * @param id 项目ID
   * @returns void
   */
  deleteProject: (id: string) => 
    request.delete(`/projects/${id}`),

  /**
   * 获取项目成员
   * @param projectId 项目ID
   * @returns 成员列表
   */
  getProjectMembers: (projectId: string) => 
    request.get<ProjectMember[]>(`/projects/${projectId}/members`),

  /**
   * 添加项目成员
   * @param projectId 项目ID
   * @param userId 用户ID
   * @param role 角色
   * @returns 成员信息
   */
  addProjectMember: (projectId: string, userId: string, role: ProjectMember['role']) => 
    request.post<ProjectMember>(`/projects/${projectId}/members`, { userId, role }),

  /**
   * 更新项目成员
   * @param projectId 项目ID
   * @param memberId 成员ID
   * @param data 更新数据
   * @returns 成员信息
   */
  updateProjectMember: (projectId: string, memberId: string, data: Partial<ProjectMember>) => 
    request.put<ProjectMember>(`/projects/${projectId}/members/${memberId}`, data),

  /**
   * 移除项目成员
   * @param projectId 项目ID
   * @param memberId 成员ID
   * @returns void
   */
  removeProjectMember: (projectId: string, memberId: string) => 
    request.delete(`/projects/${projectId}/members/${memberId}`)
}

/**
 * 需求管理API
 */
export const requirementApi = {
  /**
   * 获取需求列表
   * @param projectId 项目ID
   * @param params 搜索参数
   * @returns 需求列表
   */
  getRequirements: (projectId: string, params?: SearchParams) => 
    request.get<PaginationResponse<Requirement>>(`/projects/${projectId}/requirements`, params),

  /**
   * 获取需求详情
   * @param id 需求ID
   * @returns 需求信息
   */
  getRequirement: (id: string) => 
    request.get<Requirement>(`/requirements/${id}`),

  /**
   * 创建需求
   * @param projectId 项目ID
   * @param data 需求数据
   * @returns 需求信息
   */
  createRequirement: (projectId: string, data: Partial<Requirement>) => 
    request.post<Requirement>(`/projects/${projectId}/requirements`, data),

  /**
   * 更新需求
   * @param id 需求ID
   * @param data 更新数据
   * @returns 需求信息
   */
  updateRequirement: (id: string, data: Partial<Requirement>) => 
    request.put<Requirement>(`/requirements/${id}`, data),

  /**
   * 删除需求
   * @param id 需求ID
   * @returns void
   */
  deleteRequirement: (id: string) => 
    request.delete(`/requirements/${id}`),

  /**
   * 获取需求评论
   * @param requirementId 需求ID
   * @returns 评论列表
   */
  getRequirementComments: (requirementId: string) => 
    request.get<Comment[]>(`/requirements/${requirementId}/comments`),

  /**
   * 添加需求评论
   * @param requirementId 需求ID
   * @param content 评论内容
   * @param parentId 父评论ID
   * @returns 评论信息
   */
  addRequirementComment: (requirementId: string, content: string, parentId?: string) => 
    request.post<Comment>(`/requirements/${requirementId}/comments`, { content, parentId })
}

/**
 * 原型管理API
 */
export const prototypeApi = {
  /**
   * 获取原型列表
   * @param projectId 项目ID
   * @param params 搜索参数
   * @returns 原型列表
   */
  getPrototypes: (projectId: string, params?: SearchParams) => 
    request.get<PaginationResponse<Prototype>>(`/projects/${projectId}/prototypes`, params),

  /**
   * 获取原型详情
   * @param id 原型ID
   * @returns 原型信息
   */
  getPrototype: (id: string) => 
    request.get<Prototype>(`/prototypes/${id}`),

  /**
   * 创建原型
   * @param projectId 项目ID
   * @param data 原型数据
   * @returns 原型信息
   */
  createPrototype: (projectId: string, data: Partial<Prototype>) => 
    request.post<Prototype>(`/projects/${projectId}/prototypes`, data),

  /**
   * 更新原型
   * @param id 原型ID
   * @param data 更新数据
   * @returns 原型信息
   */
  updatePrototype: (id: string, data: Partial<Prototype>) => 
    request.put<Prototype>(`/prototypes/${id}`, data),

  /**
   * 删除原型
   * @param id 原型ID
   * @returns void
   */
  deletePrototype: (id: string) => 
    request.delete(`/prototypes/${id}`),

  /**
   * 保存原型页面
   * @param prototypeId 原型ID
   * @param pageId 页面ID
   * @param data 页面数据
   * @returns 页面信息
   */
  savePrototypePage: (prototypeId: string, pageId: string, data: Partial<PrototypePage>) => 
    request.put<PrototypePage>(`/prototypes/${prototypeId}/pages/${pageId}`, data)
}

/**
 * 文件管理API
 */
export const fileApi = {
  /**
   * 上传文件
   * @param file 文件对象
   * @param type 文件类型
   * @returns 文件信息
   */
  uploadFile: (file: File, type?: string) => 
    request.upload<FileInfo>('/files/upload', file, { type }),

  /**
   * 获取文件信息
   * @param id 文件ID
   * @returns 文件信息
   */
  getFile: (id: string) => 
    request.get<FileInfo>(`/files/${id}`),

  /**
   * 删除文件
   * @param id 文件ID
   * @returns void
   */
  deleteFile: (id: string) => 
    request.delete(`/files/${id}`),

  /**
   * 下载文件
   * @param id 文件ID
   * @param filename 文件名
   * @returns void
   */
  downloadFile: (id: string, filename?: string) => 
    request.download(`/files/${id}/download`, filename)
}

/**
 * 系统配置API
 */
export const systemApi = {
  /**
   * 获取系统信息
   * @returns 系统信息
   */
  getSystemInfo: () => 
    request.get('/system/info'),

  /**
   * 获取系统配置
   * @returns 系统配置
   */
  getSystemConfig: () => 
    request.get('/system/config'),

  /**
   * 更新系统配置
   * @param config 配置数据
   * @returns void
   */
  updateSystemConfig: (config: Record<string, any>) => 
    request.put('/system/config', config)
}

// 导出所有API
const api = {
  auth: authApi,
  user: userApi,
  project: projectApi,
  requirement: requirementApi,
  prototype: prototypeApi,
  file: fileApi,
  system: systemApi
}

export { api }
export default api