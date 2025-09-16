/**
 * 需求管理相关API接口
 * 处理需求的增删改查、评论、历史记录等功能
 */

import { api } from './index'
import type {
  Requirement,
  RequirementListParams,
  RequirementCreateRequest,
  RequirementUpdateRequest,
  RequirementComment,
  RequirementHistory,
  PaginationResponse
} from './types'

/**
 * 获取需求列表
 * @param params 查询参数
 * @returns 需求列表
 */
export const getRequirementList = (params: RequirementListParams = {}) => {
  return api.get<PaginationResponse<Requirement>>('/requirements', { params })
}

/**
 * 获取需求详情
 * @param requirementId 需求ID
 * @returns 需求详情
 */
export const getRequirementDetail = (requirementId: string) => {
  return api.get<Requirement>(`/requirements/${requirementId}`)
}

/**
 * 创建需求
 * @param data 需求创建数据
 * @returns 创建的需求信息
 */
export const createRequirement = (data: RequirementCreateRequest) => {
  return api.post<Requirement>('/requirements', data)
}

/**
 * 更新需求信息
 * @param requirementId 需求ID
 * @param data 需求更新数据
 * @returns 更新后的需求信息
 */
export const updateRequirement = (requirementId: string, data: RequirementUpdateRequest) => {
  return api.put<Requirement>(`/requirements/${requirementId}`, data)
}

/**
 * 删除需求
 * @param requirementId 需求ID
 * @returns 删除结果
 */
export const deleteRequirement = (requirementId: string) => {
  return api.delete(`/requirements/${requirementId}`)
}

/**
 * 批量删除需求
 * @param requirementIds 需求ID列表
 * @returns 删除结果
 */
export const batchDeleteRequirements = (requirementIds: string[]) => {
  return api.delete('/requirements/batch', { data: { requirementIds } })
}

/**
 * 复制需求
 * @param requirementId 需求ID
 * @param title 新需求标题
 * @param projectId 目标项目ID
 * @returns 复制的需求信息
 */
export const duplicateRequirement = (requirementId: string, title: string, projectId?: string) => {
  return api.post<Requirement>(`/requirements/${requirementId}/duplicate`, {
    title,
    projectId
  })
}

/**
 * 更新需求状态
 * @param requirementId 需求ID
 * @param status 新状态
 * @param comment 状态变更说明
 * @returns 更新结果
 */
export const updateRequirementStatus = (requirementId: string, status: string, comment?: string) => {
  return api.patch(`/requirements/${requirementId}/status`, { status, comment })
}

/**
 * 批量更新需求状态
 * @param requirementIds 需求ID列表
 * @param status 新状态
 * @param comment 状态变更说明
 * @returns 更新结果
 */
export const batchUpdateRequirementStatus = (requirementIds: string[], status: string, comment?: string) => {
  return api.patch('/requirements/batch/status', { requirementIds, status, comment })
}

/**
 * 分配需求
 * @param requirementId 需求ID
 * @param assigneeId 分配给的用户ID
 * @returns 分配结果
 */
export const assignRequirement = (requirementId: string, assigneeId: string) => {
  return api.patch(`/requirements/${requirementId}/assign`, { assigneeId })
}

/**
 * 批量分配需求
 * @param requirementIds 需求ID列表
 * @param assigneeId 分配给的用户ID
 * @returns 分配结果
 */
export const batchAssignRequirements = (requirementIds: string[], assigneeId: string) => {
  return api.patch('/requirements/batch/assign', { requirementIds, assigneeId })
}

/**
 * 设置需求审核人
 * @param requirementId 需求ID
 * @param reviewerId 审核人ID
 * @returns 设置结果
 */
export const setRequirementReviewer = (requirementId: string, reviewerId: string) => {
  return api.patch(`/requirements/${requirementId}/reviewer`, { reviewerId })
}

/**
 * 审核需求
 * @param requirementId 需求ID
 * @param action 审核动作（approve/reject）
 * @param comment 审核意见
 * @returns 审核结果
 */
export const reviewRequirement = (requirementId: string, action: 'approve' | 'reject', comment?: string) => {
  return api.post(`/requirements/${requirementId}/review`, { action, comment })
}

/**
 * 获取需求依赖关系
 * @param requirementId 需求ID
 * @returns 依赖关系
 */
export const getRequirementDependencies = (requirementId: string) => {
  return api.get<{ dependencies: Requirement[]; dependents: Requirement[] }>(`/requirements/${requirementId}/dependencies`)
}

/**
 * 添加需求依赖
 * @param requirementId 需求ID
 * @param dependencyId 依赖的需求ID
 * @returns 添加结果
 */
export const addRequirementDependency = (requirementId: string, dependencyId: string) => {
  return api.post(`/requirements/${requirementId}/dependencies`, { dependencyId })
}

/**
 * 移除需求依赖
 * @param requirementId 需求ID
 * @param dependencyId 依赖的需求ID
 * @returns 移除结果
 */
export const removeRequirementDependency = (requirementId: string, dependencyId: string) => {
  return api.delete(`/requirements/${requirementId}/dependencies/${dependencyId}`)
}

/**
 * 获取需求子项
 * @param requirementId 需求ID
 * @returns 子需求列表
 */
export const getRequirementChildren = (requirementId: string) => {
  return api.get<Requirement[]>(`/requirements/${requirementId}/children`)
}

/**
 * 创建子需求
 * @param parentId 父需求ID
 * @param data 子需求数据
 * @returns 创建的子需求信息
 */
export const createChildRequirement = (parentId: string, data: Omit<RequirementCreateRequest, 'parentId'>) => {
  return api.post<Requirement>(`/requirements/${parentId}/children`, data)
}

/**
 * 移动需求到其他父需求下
 * @param requirementId 需求ID
 * @param newParentId 新父需求ID
 * @returns 移动结果
 */
export const moveRequirement = (requirementId: string, newParentId: string | null) => {
  return api.patch(`/requirements/${requirementId}/move`, { newParentId })
}

/**
 * 获取需求评论列表
 * @param requirementId 需求ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 评论列表
 */
export const getRequirementComments = (requirementId: string, page = 1, pageSize = 20) => {
  return api.get<PaginationResponse<RequirementComment>>(`/requirements/${requirementId}/comments`, {
    params: { page, pageSize }
  })
}

/**
 * 添加需求评论
 * @param requirementId 需求ID
 * @param content 评论内容
 * @param parentId 父评论ID
 * @returns 添加的评论信息
 */
export const addRequirementComment = (requirementId: string, content: string, parentId?: string) => {
  return api.post<RequirementComment>(`/requirements/${requirementId}/comments`, {
    content,
    parentId
  })
}

/**
 * 更新需求评论
 * @param requirementId 需求ID
 * @param commentId 评论ID
 * @param content 评论内容
 * @returns 更新结果
 */
export const updateRequirementComment = (requirementId: string, commentId: string, content: string) => {
  return api.put(`/requirements/${requirementId}/comments/${commentId}`, { content })
}

/**
 * 删除需求评论
 * @param requirementId 需求ID
 * @param commentId 评论ID
 * @returns 删除结果
 */
export const deleteRequirementComment = (requirementId: string, commentId: string) => {
  return api.delete(`/requirements/${requirementId}/comments/${commentId}`)
}

/**
 * 获取需求历史记录
 * @param requirementId 需求ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 历史记录列表
 */
export const getRequirementHistory = (requirementId: string, page = 1, pageSize = 20) => {
  return api.get<PaginationResponse<RequirementHistory>>(`/requirements/${requirementId}/history`, {
    params: { page, pageSize }
  })
}

/**
 * 搜索需求
 * @param keyword 搜索关键词
 * @param projectId 项目ID
 * @param limit 结果数量限制
 * @returns 搜索结果
 */
export const searchRequirements = (keyword: string, projectId?: string, limit = 10) => {
  return api.get<Requirement[]>('/requirements/search', {
    params: { keyword, projectId, limit }
  })
}

/**
 * 获取需求统计信息
 * @param projectId 项目ID
 * @returns 统计信息
 */
export const getRequirementStatistics = (projectId?: string) => {
  return api.get('/requirements/statistics', {
    params: { projectId }
  })
}

/**
 * 获取我的需求列表
 * @param params 查询参数
 * @returns 我的需求列表
 */
export const getMyRequirements = (params: Omit<RequirementListParams, 'assigneeId'> = {}) => {
  return api.get<PaginationResponse<Requirement>>('/requirements/my', { params })
}

/**
 * 获取待审核的需求列表
 * @param params 查询参数
 * @returns 待审核需求列表
 */
export const getPendingRequirements = (params: Omit<RequirementListParams, 'reviewerId' | 'status'> = {}) => {
  return api.get<PaginationResponse<Requirement>>('/requirements/pending-review', { params })
}

/**
 * 上传需求附件
 * @param requirementId 需求ID
 * @param files 附件文件列表
 * @returns 上传结果
 */
export const uploadRequirementAttachments = (requirementId: string, files: File[]) => {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('attachments', file)
  })
  return api.post(`/requirements/${requirementId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 删除需求附件
 * @param requirementId 需求ID
 * @param attachmentId 附件ID
 * @returns 删除结果
 */
export const deleteRequirementAttachment = (requirementId: string, attachmentId: string) => {
  return api.delete(`/requirements/${requirementId}/attachments/${attachmentId}`)
}

/**
 * 导出需求数据
 * @param projectId 项目ID
 * @param format 导出格式
 * @param requirementIds 需求ID列表
 * @returns 导出结果
 */
export const exportRequirements = (projectId?: string, format = 'xlsx', requirementIds?: string[]) => {
  return api.post('/requirements/export', {
    projectId,
    format,
    requirementIds
  }, {
    responseType: 'blob'
  })
}

/**
 * 导入需求数据
 * @param projectId 项目ID
 * @param file 导入文件
 * @returns 导入结果
 */
export const importRequirements = (projectId: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('projectId', projectId)
  return api.post('/requirements/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取需求导入模板
 * @returns 模板文件
 */
export const getRequirementImportTemplate = () => {
  return api.get('/requirements/import-template', {
    responseType: 'blob'
  })
}

/**
 * 验证需求导入数据
 * @param file 导入文件
 * @returns 验证结果
 */
export const validateRequirementImportData = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/requirements/validate-import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取需求类型列表
 * @returns 类型列表
 */
export const getRequirementTypes = () => {
  return api.get<{ types: Array<{ value: string; label: string; description?: string }> }>('/requirements/types')
}

/**
 * 获取需求优先级列表
 * @returns 优先级列表
 */
export const getRequirementPriorities = () => {
  return api.get<{ priorities: Array<{ value: string; label: string; color?: string }> }>('/requirements/priorities')
}

/**
 * 获取需求状态列表
 * @returns 状态列表
 */
export const getRequirementStatuses = () => {
  return api.get<{ statuses: Array<{ value: string; label: string; color?: string }> }>('/requirements/statuses')
}

/**
 * 获取需求复杂度列表
 * @returns 复杂度列表
 */
export const getRequirementComplexities = () => {
  return api.get<{ complexities: Array<{ value: string; label: string; description?: string }> }>('/requirements/complexities')
}

/**
 * 获取需求标签
 * @param projectId 项目ID
 * @returns 标签列表
 */
export const getRequirementTags = (projectId?: string) => {
  return api.get<{ tags: string[] }>('/requirements/tags', {
    params: { projectId }
  })
}

/**
 * 批量更新需求标签
 * @param requirementIds 需求ID列表
 * @param tags 标签列表
 * @param action 操作类型（add/remove/replace）
 * @returns 更新结果
 */
export const batchUpdateRequirementTags = (
  requirementIds: string[],
  tags: string[],
  action: 'add' | 'remove' | 'replace' = 'replace'
) => {
  return api.patch('/requirements/batch/tags', {
    requirementIds,
    tags,
    action
  })
}

/**
 * 获取需求甘特图数据
 * @param projectId 项目ID
 * @returns 甘特图数据
 */
export const getRequirementGanttData = (projectId: string) => {
  return api.get(`/requirements/gantt/${projectId}`)
}

/**
 * 获取需求看板数据
 * @param projectId 项目ID
 * @returns 看板数据
 */
export const getRequirementKanbanData = (projectId: string) => {
  return api.get(`/requirements/kanban/${projectId}`)
}

/**
 * 更新需求看板状态
 * @param requirementId 需求ID
 * @param fromStatus 原状态
 * @param toStatus 目标状态
 * @param position 位置
 * @returns 更新结果
 */
export const updateRequirementKanbanStatus = (
  requirementId: string,
  fromStatus: string,
  toStatus: string,
  position: number
) => {
  return api.patch(`/requirements/${requirementId}/kanban-status`, {
    fromStatus,
    toStatus,
    position
  })
}