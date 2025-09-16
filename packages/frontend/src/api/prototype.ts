/**
 * 原型设计相关API接口
 * 处理原型的增删改查、评论、版本管理等功能
 */

import { api } from './index'
import type {
  Prototype,
  PrototypeListParams,
  PrototypeCreateRequest,
  PrototypeUpdateRequest,
  PrototypeComment,
  PrototypeHistory,
  PrototypeStatistics,
  PaginationResponse
} from './types'

/**
 * 获取原型列表
 * @param params 查询参数
 * @returns 原型列表
 */
export const getPrototypeList = (params: PrototypeListParams = {}) => {
  return api.get<PaginationResponse<Prototype>>('/prototypes', { params })
}

/**
 * 获取原型详情
 * @param prototypeId 原型ID
 * @returns 原型详情
 */
export const getPrototypeDetail = (prototypeId: string) => {
  return api.get<Prototype>(`/prototypes/${prototypeId}`)
}

/**
 * 创建原型
 * @param data 原型创建数据
 * @returns 创建的原型信息
 */
export const createPrototype = (data: PrototypeCreateRequest) => {
  return api.post<Prototype>('/prototypes', data)
}

/**
 * 更新原型信息
 * @param prototypeId 原型ID
 * @param data 原型更新数据
 * @returns 更新后的原型信息
 */
export const updatePrototype = (prototypeId: string, data: PrototypeUpdateRequest) => {
  return api.put<Prototype>(`/prototypes/${prototypeId}`, data)
}

/**
 * 删除原型
 * @param prototypeId 原型ID
 * @returns 删除结果
 */
export const deletePrototype = (prototypeId: string) => {
  return api.delete(`/prototypes/${prototypeId}`)
}

/**
 * 批量删除原型
 * @param prototypeIds 原型ID列表
 * @returns 删除结果
 */
export const batchDeletePrototypes = (prototypeIds: string[]) => {
  return api.delete('/prototypes/batch', { data: { prototypeIds } })
}

/**
 * 复制原型
 * @param prototypeId 原型ID
 * @param name 新原型名称
 * @param projectId 目标项目ID
 * @returns 复制的原型信息
 */
export const duplicatePrototype = (prototypeId: string, name: string, projectId?: string) => {
  return api.post<Prototype>(`/prototypes/${prototypeId}/duplicate`, {
    name,
    projectId
  })
}

/**
 * 更新原型状态
 * @param prototypeId 原型ID
 * @param status 新状态
 * @param comment 状态变更说明
 * @returns 更新结果
 */
export const updatePrototypeStatus = (prototypeId: string, status: string, comment?: string) => {
  return api.patch(`/prototypes/${prototypeId}/status`, { status, comment })
}

/**
 * 发布原型
 * @param prototypeId 原型ID
 * @param version 版本号
 * @param changelog 更新日志
 * @returns 发布结果
 */
export const publishPrototype = (prototypeId: string, version?: string, changelog?: string) => {
  return api.post(`/prototypes/${prototypeId}/publish`, { version, changelog })
}

/**
 * 取消发布原型
 * @param prototypeId 原型ID
 * @returns 取消发布结果
 */
export const unpublishPrototype = (prototypeId: string) => {
  return api.post(`/prototypes/${prototypeId}/unpublish`)
}

/**
 * 保存原型数据
 * @param prototypeId 原型ID
 * @param data 原型数据
 * @param autoSave 是否自动保存
 * @returns 保存结果
 */
export const savePrototypeData = (prototypeId: string, data: any, autoSave = false) => {
  return api.post(`/prototypes/${prototypeId}/save`, { data, autoSave })
}

/**
 * 获取原型数据
 * @param prototypeId 原型ID
 * @param version 版本号
 * @returns 原型数据
 */
export const getPrototypeData = (prototypeId: string, version?: string) => {
  return api.get<{ data: any }>(`/prototypes/${prototypeId}/data`, {
    params: { version }
  })
}

/**
 * 获取原型版本列表
 * @param prototypeId 原型ID
 * @returns 版本列表
 */
export const getPrototypeVersions = (prototypeId: string) => {
  return api.get<Array<{ version: string; createdAt: string; author: any; changelog?: string }>>(
    `/prototypes/${prototypeId}/versions`
  )
}

/**
 * 创建原型版本
 * @param prototypeId 原型ID
 * @param version 版本号
 * @param changelog 更新日志
 * @returns 创建结果
 */
export const createPrototypeVersion = (prototypeId: string, version: string, changelog?: string) => {
  return api.post(`/prototypes/${prototypeId}/versions`, { version, changelog })
}

/**
 * 恢复到指定版本
 * @param prototypeId 原型ID
 * @param version 版本号
 * @returns 恢复结果
 */
export const restorePrototypeVersion = (prototypeId: string, version: string) => {
  return api.post(`/prototypes/${prototypeId}/restore`, { version })
}

/**
 * 比较原型版本
 * @param prototypeId 原型ID
 * @param fromVersion 起始版本
 * @param toVersion 目标版本
 * @returns 比较结果
 */
export const comparePrototypeVersions = (prototypeId: string, fromVersion: string, toVersion: string) => {
  return api.get(`/prototypes/${prototypeId}/compare`, {
    params: { fromVersion, toVersion }
  })
}

/**
 * 获取原型评论列表
 * @param prototypeId 原型ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 评论列表
 */
export const getPrototypeComments = (prototypeId: string, page = 1, pageSize = 20) => {
  return api.get<PaginationResponse<PrototypeComment>>(`/prototypes/${prototypeId}/comments`, {
    params: { page, pageSize }
  })
}

/**
 * 添加原型评论
 * @param prototypeId 原型ID
 * @param content 评论内容
 * @param x X坐标
 * @param y Y坐标
 * @param parentId 父评论ID
 * @returns 添加的评论信息
 */
export const addPrototypeComment = (
  prototypeId: string,
  content: string,
  x?: number,
  y?: number,
  parentId?: string
) => {
  return api.post<PrototypeComment>(`/prototypes/${prototypeId}/comments`, {
    content,
    x,
    y,
    parentId
  })
}

/**
 * 更新原型评论
 * @param prototypeId 原型ID
 * @param commentId 评论ID
 * @param content 评论内容
 * @returns 更新结果
 */
export const updatePrototypeComment = (prototypeId: string, commentId: string, content: string) => {
  return api.put(`/prototypes/${prototypeId}/comments/${commentId}`, { content })
}

/**
 * 删除原型评论
 * @param prototypeId 原型ID
 * @param commentId 评论ID
 * @returns 删除结果
 */
export const deletePrototypeComment = (prototypeId: string, commentId: string) => {
  return api.delete(`/prototypes/${prototypeId}/comments/${commentId}`)
}

/**
 * 解决原型评论
 * @param prototypeId 原型ID
 * @param commentId 评论ID
 * @returns 解决结果
 */
export const resolvePrototypeComment = (prototypeId: string, commentId: string) => {
  return api.post(`/prototypes/${prototypeId}/comments/${commentId}/resolve`)
}

/**
 * 获取原型历史记录
 * @param prototypeId 原型ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 历史记录列表
 */
export const getPrototypeHistory = (prototypeId: string, page = 1, pageSize = 20) => {
  return api.get<PaginationResponse<PrototypeHistory>>(`/prototypes/${prototypeId}/history`, {
    params: { page, pageSize }
  })
}

/**
 * 获取原型统计信息
 * @param prototypeId 原型ID
 * @returns 统计信息
 */
export const getPrototypeStatistics = (prototypeId: string) => {
  return api.get<PrototypeStatistics>(`/prototypes/${prototypeId}/statistics`)
}

/**
 * 增加原型浏览量
 * @param prototypeId 原型ID
 * @returns 增加结果
 */
export const incrementPrototypeViews = (prototypeId: string) => {
  return api.post(`/prototypes/${prototypeId}/view`)
}

/**
 * 点赞原型
 * @param prototypeId 原型ID
 * @returns 点赞结果
 */
export const likePrototype = (prototypeId: string) => {
  return api.post(`/prototypes/${prototypeId}/like`)
}

/**
 * 取消点赞原型
 * @param prototypeId 原型ID
 * @returns 取消点赞结果
 */
export const unlikePrototype = (prototypeId: string) => {
  return api.delete(`/prototypes/${prototypeId}/like`)
}

/**
 * 分享原型
 * @param prototypeId 原型ID
 * @param shareType 分享类型
 * @param expiresIn 过期时间（秒）
 * @returns 分享链接
 */
export const sharePrototype = (prototypeId: string, shareType = 'public', expiresIn?: number) => {
  return api.post<{ shareUrl: string; token: string }>(`/prototypes/${prototypeId}/share`, {
    shareType,
    expiresIn
  })
}

/**
 * 取消分享原型
 * @param prototypeId 原型ID
 * @returns 取消分享结果
 */
export const unsharePrototype = (prototypeId: string) => {
  return api.delete(`/prototypes/${prototypeId}/share`)
}

/**
 * 获取分享的原型信息
 * @param token 分享令牌
 * @returns 原型信息
 */
export const getSharedPrototype = (token: string) => {
  return api.get<Prototype>(`/prototypes/shared/${token}`)
}

/**
 * 搜索原型
 * @param keyword 搜索关键词
 * @param projectId 项目ID
 * @param limit 结果数量限制
 * @returns 搜索结果
 */
export const searchPrototypes = (keyword: string, projectId?: string, limit = 10) => {
  return api.get<Prototype[]>('/prototypes/search', {
    params: { keyword, projectId, limit }
  })
}

/**
 * 获取我的原型列表
 * @param params 查询参数
 * @returns 我的原型列表
 */
export const getMyPrototypes = (params: Omit<PrototypeListParams, 'authorId'> = {}) => {
  return api.get<PaginationResponse<Prototype>>('/prototypes/my', { params })
}

/**
 * 获取最近访问的原型
 * @param limit 数量限制
 * @returns 最近访问的原型列表
 */
export const getRecentPrototypes = (limit = 10) => {
  return api.get<Prototype[]>('/prototypes/recent', {
    params: { limit }
  })
}

/**
 * 收藏原型
 * @param prototypeId 原型ID
 * @returns 收藏结果
 */
export const favoritePrototype = (prototypeId: string) => {
  return api.post(`/prototypes/${prototypeId}/favorite`)
}

/**
 * 取消收藏原型
 * @param prototypeId 原型ID
 * @returns 取消收藏结果
 */
export const unfavoritePrototype = (prototypeId: string) => {
  return api.delete(`/prototypes/${prototypeId}/favorite`)
}

/**
 * 获取收藏的原型列表
 * @param params 查询参数
 * @returns 收藏的原型列表
 */
export const getFavoritePrototypes = (params: Omit<PrototypeListParams, 'authorId'> = {}) => {
  return api.get<PaginationResponse<Prototype>>('/prototypes/favorites', { params })
}

/**
 * 上传原型封面
 * @param prototypeId 原型ID
 * @param file 封面文件
 * @returns 上传结果
 */
export const uploadPrototypeCover = (prototypeId: string, file: File) => {
  const formData = new FormData()
  formData.append('cover', file)
  return api.post<{ url: string }>(`/prototypes/${prototypeId}/cover`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 生成原型缩略图
 * @param prototypeId 原型ID
 * @returns 生成结果
 */
export const generatePrototypeThumbnail = (prototypeId: string) => {
  return api.post<{ url: string }>(`/prototypes/${prototypeId}/thumbnail`)
}

/**
 * 导出原型
 * @param prototypeId 原型ID
 * @param format 导出格式
 * @param options 导出选项
 * @returns 导出结果
 */
export const exportPrototype = (prototypeId: string, format = 'json', options: any = {}) => {
  return api.post(`/prototypes/${prototypeId}/export`, {
    format,
    options
  }, {
    responseType: 'blob'
  })
}

/**
 * 导入原型
 * @param projectId 项目ID
 * @param file 导入文件
 * @returns 导入结果
 */
export const importPrototype = (projectId: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('projectId', projectId)
  return api.post<Prototype>('/prototypes/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取原型模板列表
 * @param category 分类
 * @returns 模板列表
 */
export const getPrototypeTemplates = (category?: string) => {
  return api.get('/prototypes/templates', {
    params: { category }
  })
}

/**
 * 从模板创建原型
 * @param templateId 模板ID
 * @param name 原型名称
 * @param projectId 项目ID
 * @returns 创建的原型信息
 */
export const createPrototypeFromTemplate = (templateId: string, name: string, projectId: string) => {
  return api.post<Prototype>('/prototypes/from-template', {
    templateId,
    name,
    projectId
  })
}

/**
 * 将原型保存为模板
 * @param prototypeId 原型ID
 * @param name 模板名称
 * @param description 模板描述
 * @param category 分类
 * @param isPublic 是否公开
 * @returns 保存结果
 */
export const savePrototypeAsTemplate = (
  prototypeId: string,
  name: string,
  description?: string,
  category?: string,
  isPublic = false
) => {
  return api.post(`/prototypes/${prototypeId}/save-as-template`, {
    name,
    description,
    category,
    isPublic
  })
}

/**
 * 获取原型类型列表
 * @returns 类型列表
 */
export const getPrototypeTypes = () => {
  return api.get<{ types: Array<{ value: string; label: string; description?: string }> }>('/prototypes/types')
}

/**
 * 获取原型状态列表
 * @returns 状态列表
 */
export const getPrototypeStatuses = () => {
  return api.get<{ statuses: Array<{ value: string; label: string; color?: string }> }>('/prototypes/statuses')
}

/**
 * 获取原型标签
 * @param projectId 项目ID
 * @returns 标签列表
 */
export const getPrototypeTags = (projectId?: string) => {
  return api.get<{ tags: string[] }>('/prototypes/tags', {
    params: { projectId }
  })
}

/**
 * 设置原型审核人
 * @param prototypeId 原型ID
 * @param reviewerIds 审核人ID列表
 * @returns 设置结果
 */
export const setPrototypeReviewers = (prototypeId: string, reviewerIds: string[]) => {
  return api.patch(`/prototypes/${prototypeId}/reviewers`, { reviewerIds })
}

/**
 * 审核原型
 * @param prototypeId 原型ID
 * @param action 审核动作（approve/reject）
 * @param comment 审核意见
 * @returns 审核结果
 */
export const reviewPrototype = (prototypeId: string, action: 'approve' | 'reject', comment?: string) => {
  return api.post(`/prototypes/${prototypeId}/review`, { action, comment })
}

/**
 * 获取待审核的原型列表
 * @param params 查询参数
 * @returns 待审核原型列表
 */
export const getPendingPrototypes = (params: Omit<PrototypeListParams, 'status'> = {}) => {
  return api.get<PaginationResponse<Prototype>>('/prototypes/pending-review', { params })
}

/**
 * 关联原型与需求
 * @param prototypeId 原型ID
 * @param requirementIds 需求ID列表
 * @returns 关联结果
 */
export const linkPrototypeRequirements = (prototypeId: string, requirementIds: string[]) => {
  return api.post(`/prototypes/${prototypeId}/link-requirements`, { requirementIds })
}

/**
 * 取消关联原型与需求
 * @param prototypeId 原型ID
 * @param requirementIds 需求ID列表
 * @returns 取消关联结果
 */
export const unlinkPrototypeRequirements = (prototypeId: string, requirementIds: string[]) => {
  return api.delete(`/prototypes/${prototypeId}/link-requirements`, {
    data: { requirementIds }
  })
}