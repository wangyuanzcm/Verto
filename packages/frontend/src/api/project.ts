/**
 * 项目管理相关API接口
 * 处理项目的增删改查、成员管理等功能
 */

import { api } from './index'
import type {
  Project,
  ProjectListParams,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectMember,
  ProjectStatistics,
  PaginationResponse
} from './types'

/**
 * 获取项目列表
 * @param params 查询参数
 * @returns 项目列表
 */
export const getProjectList = (params: ProjectListParams = {}) => {
  return api.get<PaginationResponse<Project>>('/projects', { params })
}

/**
 * 获取项目详情
 * @param projectId 项目ID
 * @returns 项目详情
 */
export const getProjectDetail = (projectId: string) => {
  return api.get<Project>(`/projects/${projectId}`)
}

/**
 * 创建项目
 * @param data 项目创建数据
 * @returns 创建的项目信息
 */
export const createProject = (data: ProjectCreateRequest) => {
  return api.post<Project>('/projects', data)
}

/**
 * 更新项目信息
 * @param projectId 项目ID
 * @param data 项目更新数据
 * @returns 更新后的项目信息
 */
export const updateProject = (projectId: string, data: ProjectUpdateRequest) => {
  return api.put<Project>(`/projects/${projectId}`, data)
}

/**
 * 删除项目
 * @param projectId 项目ID
 * @returns 删除结果
 */
export const deleteProject = (projectId: string) => {
  return api.delete(`/projects/${projectId}`)
}

/**
 * 批量删除项目
 * @param projectIds 项目ID列表
 * @returns 删除结果
 */
export const batchDeleteProjects = (projectIds: string[]) => {
  return api.delete('/projects/batch', { data: { projectIds } })
}

/**
 * 复制项目
 * @param projectId 项目ID
 * @param name 新项目名称
 * @param includeMembers 是否包含成员
 * @param includeRequirements 是否包含需求
 * @param includePrototypes 是否包含原型
 * @returns 复制的项目信息
 */
export const duplicateProject = (
  projectId: string,
  name: string,
  includeMembers = false,
  includeRequirements = false,
  includePrototypes = false
) => {
  return api.post<Project>(`/projects/${projectId}/duplicate`, {
    name,
    includeMembers,
    includeRequirements,
    includePrototypes
  })
}

/**
 * 归档项目
 * @param projectId 项目ID
 * @returns 归档结果
 */
export const archiveProject = (projectId: string) => {
  return api.post(`/projects/${projectId}/archive`)
}

/**
 * 恢复项目
 * @param projectId 项目ID
 * @returns 恢复结果
 */
export const restoreProject = (projectId: string) => {
  return api.post(`/projects/${projectId}/restore`)
}

/**
 * 获取项目成员列表
 * @param projectId 项目ID
 * @returns 成员列表
 */
export const getProjectMembers = (projectId: string) => {
  return api.get<ProjectMember[]>(`/projects/${projectId}/members`)
}

/**
 * 添加项目成员
 * @param projectId 项目ID
 * @param userId 用户ID
 * @param role 角色
 * @param permissions 权限列表
 * @returns 添加结果
 */
export const addProjectMember = (
  projectId: string,
  userId: string,
  role: string,
  permissions: string[] = []
) => {
  return api.post<ProjectMember>(`/projects/${projectId}/members`, {
    userId,
    role,
    permissions
  })
}

/**
 * 批量添加项目成员
 * @param projectId 项目ID
 * @param members 成员列表
 * @returns 添加结果
 */
export const batchAddProjectMembers = (
  projectId: string,
  members: Array<{ userId: string; role: string; permissions?: string[] }>
) => {
  return api.post(`/projects/${projectId}/members/batch`, { members })
}

/**
 * 更新项目成员角色
 * @param projectId 项目ID
 * @param memberId 成员ID
 * @param role 新角色
 * @param permissions 权限列表
 * @returns 更新结果
 */
export const updateProjectMember = (
  projectId: string,
  memberId: string,
  role: string,
  permissions: string[] = []
) => {
  return api.put<ProjectMember>(`/projects/${projectId}/members/${memberId}`, {
    role,
    permissions
  })
}

/**
 * 移除项目成员
 * @param projectId 项目ID
 * @param memberId 成员ID
 * @returns 移除结果
 */
export const removeProjectMember = (projectId: string, memberId: string) => {
  return api.delete(`/projects/${projectId}/members/${memberId}`)
}

/**
 * 批量移除项目成员
 * @param projectId 项目ID
 * @param memberIds 成员ID列表
 * @returns 移除结果
 */
export const batchRemoveProjectMembers = (projectId: string, memberIds: string[]) => {
  return api.delete(`/projects/${projectId}/members/batch`, {
    data: { memberIds }
  })
}

/**
 * 转移项目所有权
 * @param projectId 项目ID
 * @param newOwnerId 新所有者ID
 * @returns 转移结果
 */
export const transferProjectOwnership = (projectId: string, newOwnerId: string) => {
  return api.post(`/projects/${projectId}/transfer-ownership`, { newOwnerId })
}

/**
 * 获取项目统计信息
 * @param projectId 项目ID
 * @returns 统计信息
 */
export const getProjectStatistics = (projectId: string) => {
  return api.get<ProjectStatistics>(`/projects/${projectId}/statistics`)
}

/**
 * 获取项目活动日志
 * @param projectId 项目ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 活动日志列表
 */
export const getProjectActivityLogs = (projectId: string, page = 1, pageSize = 20) => {
  return api.get(`/projects/${projectId}/activity-logs`, {
    params: { page, pageSize }
  })
}

/**
 * 搜索项目
 * @param keyword 搜索关键词
 * @param limit 结果数量限制
 * @returns 搜索结果
 */
export const searchProjects = (keyword: string, limit = 10) => {
  return api.get<Project[]>('/projects/search', {
    params: { keyword, limit }
  })
}

/**
 * 获取我的项目列表
 * @param params 查询参数
 * @returns 我的项目列表
 */
export const getMyProjects = (params: Omit<ProjectListParams, 'ownerId' | 'memberId'> = {}) => {
  return api.get<PaginationResponse<Project>>('/projects/my', { params })
}

/**
 * 获取我参与的项目列表
 * @param params 查询参数
 * @returns 参与的项目列表
 */
export const getParticipatedProjects = (params: Omit<ProjectListParams, 'ownerId' | 'memberId'> = {}) => {
  return api.get<PaginationResponse<Project>>('/projects/participated', { params })
}

/**
 * 获取最近访问的项目
 * @param limit 数量限制
 * @returns 最近访问的项目列表
 */
export const getRecentProjects = (limit = 10) => {
  return api.get<Project[]>('/projects/recent', {
    params: { limit }
  })
}

/**
 * 收藏项目
 * @param projectId 项目ID
 * @returns 收藏结果
 */
export const favoriteProject = (projectId: string) => {
  return api.post(`/projects/${projectId}/favorite`)
}

/**
 * 取消收藏项目
 * @param projectId 项目ID
 * @returns 取消收藏结果
 */
export const unfavoriteProject = (projectId: string) => {
  return api.delete(`/projects/${projectId}/favorite`)
}

/**
 * 获取收藏的项目列表
 * @param params 查询参数
 * @returns 收藏的项目列表
 */
export const getFavoriteProjects = (params: Omit<ProjectListParams, 'ownerId' | 'memberId'> = {}) => {
  return api.get<PaginationResponse<Project>>('/projects/favorites', { params })
}

/**
 * 上传项目封面
 * @param projectId 项目ID
 * @param file 封面文件
 * @returns 上传结果
 */
export const uploadProjectCover = (projectId: string, file: File) => {
  const formData = new FormData()
  formData.append('cover', file)
  return api.post<{ url: string }>(`/projects/${projectId}/cover`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 删除项目封面
 * @param projectId 项目ID
 * @returns 删除结果
 */
export const deleteProjectCover = (projectId: string) => {
  return api.delete(`/projects/${projectId}/cover`)
}

/**
 * 获取项目模板列表
 * @returns 模板列表
 */
export const getProjectTemplates = () => {
  return api.get('/projects/templates')
}

/**
 * 从模板创建项目
 * @param templateId 模板ID
 * @param name 项目名称
 * @param description 项目描述
 * @returns 创建的项目信息
 */
export const createProjectFromTemplate = (templateId: string, name: string, description?: string) => {
  return api.post<Project>('/projects/from-template', {
    templateId,
    name,
    description
  })
}

/**
 * 将项目保存为模板
 * @param projectId 项目ID
 * @param name 模板名称
 * @param description 模板描述
 * @param isPublic 是否公开
 * @returns 保存结果
 */
export const saveProjectAsTemplate = (
  projectId: string,
  name: string,
  description?: string,
  isPublic = false
) => {
  return api.post(`/projects/${projectId}/save-as-template`, {
    name,
    description,
    isPublic
  })
}

/**
 * 导出项目数据
 * @param projectId 项目ID
 * @param format 导出格式
 * @param includeRequirements 是否包含需求
 * @param includePrototypes 是否包含原型
 * @returns 导出结果
 */
export const exportProject = (
  projectId: string,
  format = 'json',
  includeRequirements = true,
  includePrototypes = true
) => {
  return api.post(`/projects/${projectId}/export`, {
    format,
    includeRequirements,
    includePrototypes
  }, {
    responseType: 'blob'
  })
}

/**
 * 导入项目数据
 * @param file 导入文件
 * @returns 导入结果
 */
export const importProject = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post<Project>('/projects/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取项目标签
 * @returns 标签列表
 */
export const getProjectTags = () => {
  return api.get<{ tags: string[] }>('/projects/tags')
}

/**
 * 获取项目角色列表
 * @returns 角色列表
 */
export const getProjectRoles = () => {
  return api.get('/projects/roles')
}

/**
 * 获取项目权限列表
 * @returns 权限列表
 */
export const getProjectPermissions = () => {
  return api.get('/projects/permissions')
}

/**
 * 检查项目访问权限
 * @param projectId 项目ID
 * @param permission 权限名称
 * @returns 权限检查结果
 */
export const checkProjectPermission = (projectId: string, permission: string) => {
  return api.get<{ hasPermission: boolean }>(`/projects/${projectId}/check-permission`, {
    params: { permission }
  })
}

/**
 * 获取项目邀请链接
 * @param projectId 项目ID
 * @param role 角色
 * @param expiresIn 过期时间（秒）
 * @returns 邀请链接
 */
export const getProjectInviteLink = (projectId: string, role: string, expiresIn = 86400) => {
  return api.post<{ inviteLink: string; token: string }>(`/projects/${projectId}/invite-link`, {
    role,
    expiresIn
  })
}

/**
 * 通过邀请链接加入项目
 * @param token 邀请令牌
 * @returns 加入结果
 */
export const joinProjectByInvite = (token: string) => {
  return api.post<Project>('/projects/join-by-invite', { token })
}

/**
 * 获取项目邀请信息
 * @param token 邀请令牌
 * @returns 邀请信息
 */
export const getProjectInviteInfo = (token: string) => {
  return api.get(`/projects/invite-info/${token}`)
}