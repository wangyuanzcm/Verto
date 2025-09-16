/**
 * 物料管理相关API接口
 * 处理物料的增删改查、分类管理、版本控制等功能
 */

import { api } from './index'
import type {
  Material,
  MaterialListParams,
  MaterialCreateRequest,
  MaterialUpdateRequest,
  MaterialCategory,
  MaterialVersion,
  MaterialStatistics,
  PaginationResponse
} from './types'

/**
 * 获取物料列表
 * @param params 查询参数
 * @returns 物料列表
 */
export const getMaterialList = (params: MaterialListParams = {}) => {
  return api.get<PaginationResponse<Material>>('/materials', { params })
}

/**
 * 获取物料详情
 * @param materialId 物料ID
 * @returns 物料详情
 */
export const getMaterialDetail = (materialId: string) => {
  return api.get<Material>(`/materials/${materialId}`)
}

/**
 * 创建物料
 * @param data 物料创建数据
 * @returns 创建的物料信息
 */
export const createMaterial = (data: MaterialCreateRequest) => {
  return api.post<Material>('/materials', data)
}

/**
 * 更新物料信息
 * @param materialId 物料ID
 * @param data 物料更新数据
 * @returns 更新后的物料信息
 */
export const updateMaterial = (materialId: string, data: MaterialUpdateRequest) => {
  return api.put<Material>(`/materials/${materialId}`, data)
}

/**
 * 删除物料
 * @param materialId 物料ID
 * @returns 删除结果
 */
export const deleteMaterial = (materialId: string) => {
  return api.delete(`/materials/${materialId}`)
}

/**
 * 批量删除物料
 * @param materialIds 物料ID列表
 * @returns 删除结果
 */
export const batchDeleteMaterials = (materialIds: string[]) => {
  return api.delete('/materials/batch', { data: { materialIds } })
}

/**
 * 复制物料
 * @param materialId 物料ID
 * @param name 新物料名称
 * @param categoryId 目标分类ID
 * @returns 复制的物料信息
 */
export const duplicateMaterial = (materialId: string, name: string, categoryId?: string) => {
  return api.post<Material>(`/materials/${materialId}/duplicate`, {
    name,
    categoryId
  })
}

/**
 * 更新物料状态
 * @param materialId 物料ID
 * @param status 新状态
 * @param comment 状态变更说明
 * @returns 更新结果
 */
export const updateMaterialStatus = (materialId: string, status: string, comment?: string) => {
  return api.patch(`/materials/${materialId}/status`, { status, comment })
}

/**
 * 发布物料
 * @param materialId 物料ID
 * @param version 版本号
 * @param changelog 更新日志
 * @returns 发布结果
 */
export const publishMaterial = (materialId: string, version?: string, changelog?: string) => {
  return api.post(`/materials/${materialId}/publish`, { version, changelog })
}

/**
 * 取消发布物料
 * @param materialId 物料ID
 * @returns 取消发布结果
 */
export const unpublishMaterial = (materialId: string) => {
  return api.post(`/materials/${materialId}/unpublish`)
}

/**
 * 上传物料文件
 * @param materialId 物料ID
 * @param file 文件
 * @param type 文件类型
 * @returns 上传结果
 */
export const uploadMaterialFile = (materialId: string, file: File, type = 'asset') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  return api.post<{ url: string; filename: string }>(`/materials/${materialId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 删除物料文件
 * @param materialId 物料ID
 * @param filename 文件名
 * @returns 删除结果
 */
export const deleteMaterialFile = (materialId: string, filename: string) => {
  return api.delete(`/materials/${materialId}/files/${filename}`)
}

/**
 * 获取物料文件列表
 * @param materialId 物料ID
 * @returns 文件列表
 */
export const getMaterialFiles = (materialId: string) => {
  return api.get<Array<{ filename: string; url: string; size: number; type: string; uploadedAt: string }>>(
    `/materials/${materialId}/files`
  )
}

/**
 * 下载物料文件
 * @param materialId 物料ID
 * @param filename 文件名
 * @returns 文件流
 */
export const downloadMaterialFile = (materialId: string, filename: string) => {
  return api.get(`/materials/${materialId}/files/${filename}/download`, {
    responseType: 'blob'
  })
}

/**
 * 获取物料版本列表
 * @param materialId 物料ID
 * @returns 版本列表
 */
export const getMaterialVersions = (materialId: string) => {
  return api.get<MaterialVersion[]>(`/materials/${materialId}/versions`)
}

/**
 * 创建物料版本
 * @param materialId 物料ID
 * @param version 版本号
 * @param changelog 更新日志
 * @returns 创建结果
 */
export const createMaterialVersion = (materialId: string, version: string, changelog?: string) => {
  return api.post<MaterialVersion>(`/materials/${materialId}/versions`, { version, changelog })
}

/**
 * 获取物料版本详情
 * @param materialId 物料ID
 * @param version 版本号
 * @returns 版本详情
 */
export const getMaterialVersionDetail = (materialId: string, version: string) => {
  return api.get<MaterialVersion>(`/materials/${materialId}/versions/${version}`)
}

/**
 * 恢复到指定版本
 * @param materialId 物料ID
 * @param version 版本号
 * @returns 恢复结果
 */
export const restoreMaterialVersion = (materialId: string, version: string) => {
  return api.post(`/materials/${materialId}/restore`, { version })
}

/**
 * 比较物料版本
 * @param materialId 物料ID
 * @param fromVersion 起始版本
 * @param toVersion 目标版本
 * @returns 比较结果
 */
export const compareMaterialVersions = (materialId: string, fromVersion: string, toVersion: string) => {
  return api.get(`/materials/${materialId}/compare`, {
    params: { fromVersion, toVersion }
  })
}

/**
 * 获取物料分类列表
 * @param parentId 父分类ID
 * @returns 分类列表
 */
export const getMaterialCategories = (parentId?: string) => {
  return api.get<MaterialCategory[]>('/materials/categories', {
    params: { parentId }
  })
}

/**
 * 创建物料分类
 * @param data 分类数据
 * @returns 创建的分类信息
 */
export const createMaterialCategory = (data: {
  name: string
  description?: string
  parentId?: string
  icon?: string
  color?: string
}) => {
  return api.post<MaterialCategory>('/materials/categories', data)
}

/**
 * 更新物料分类
 * @param categoryId 分类ID
 * @param data 分类更新数据
 * @returns 更新后的分类信息
 */
export const updateMaterialCategory = (categoryId: string, data: {
  name?: string
  description?: string
  icon?: string
  color?: string
}) => {
  return api.put<MaterialCategory>(`/materials/categories/${categoryId}`, data)
}

/**
 * 删除物料分类
 * @param categoryId 分类ID
 * @returns 删除结果
 */
export const deleteMaterialCategory = (categoryId: string) => {
  return api.delete(`/materials/categories/${categoryId}`)
}

/**
 * 移动物料到分类
 * @param materialId 物料ID
 * @param categoryId 分类ID
 * @returns 移动结果
 */
export const moveMaterialToCategory = (materialId: string, categoryId: string) => {
  return api.patch(`/materials/${materialId}/category`, { categoryId })
}

/**
 * 批量移动物料到分类
 * @param materialIds 物料ID列表
 * @param categoryId 分类ID
 * @returns 移动结果
 */
export const batchMoveMaterialsToCategory = (materialIds: string[], categoryId: string) => {
  return api.patch('/materials/batch/category', { materialIds, categoryId })
}

/**
 * 搜索物料
 * @param keyword 搜索关键词
 * @param categoryId 分类ID
 * @param type 物料类型
 * @param limit 结果数量限制
 * @returns 搜索结果
 */
export const searchMaterials = (keyword: string, categoryId?: string, type?: string, limit = 10) => {
  return api.get<Material[]>('/materials/search', {
    params: { keyword, categoryId, type, limit }
  })
}

/**
 * 获取热门物料
 * @param limit 数量限制
 * @param categoryId 分类ID
 * @returns 热门物料列表
 */
export const getPopularMaterials = (limit = 10, categoryId?: string) => {
  return api.get<Material[]>('/materials/popular', {
    params: { limit, categoryId }
  })
}

/**
 * 获取最新物料
 * @param limit 数量限制
 * @param categoryId 分类ID
 * @returns 最新物料列表
 */
export const getLatestMaterials = (limit = 10, categoryId?: string) => {
  return api.get<Material[]>('/materials/latest', {
    params: { limit, categoryId }
  })
}

/**
 * 获取推荐物料
 * @param materialId 基于的物料ID
 * @param limit 数量限制
 * @returns 推荐物料列表
 */
export const getRecommendedMaterials = (materialId?: string, limit = 10) => {
  return api.get<Material[]>('/materials/recommended', {
    params: { materialId, limit }
  })
}

/**
 * 获取我的物料列表
 * @param params 查询参数
 * @returns 我的物料列表
 */
export const getMyMaterials = (params: Omit<MaterialListParams, 'authorId'> = {}) => {
  return api.get<PaginationResponse<Material>>('/materials/my', { params })
}

/**
 * 获取最近使用的物料
 * @param limit 数量限制
 * @returns 最近使用的物料列表
 */
export const getRecentMaterials = (limit = 10) => {
  return api.get<Material[]>('/materials/recent', {
    params: { limit }
  })
}

/**
 * 收藏物料
 * @param materialId 物料ID
 * @returns 收藏结果
 */
export const favoriteMaterial = (materialId: string) => {
  return api.post(`/materials/${materialId}/favorite`)
}

/**
 * 取消收藏物料
 * @param materialId 物料ID
 * @returns 取消收藏结果
 */
export const unfavoriteMaterial = (materialId: string) => {
  return api.delete(`/materials/${materialId}/favorite`)
}

/**
 * 获取收藏的物料列表
 * @param params 查询参数
 * @returns 收藏的物料列表
 */
export const getFavoriteMaterials = (params: Omit<MaterialListParams, 'authorId'> = {}) => {
  return api.get<PaginationResponse<Material>>('/materials/favorites', { params })
}

/**
 * 点赞物料
 * @param materialId 物料ID
 * @returns 点赞结果
 */
export const likeMaterial = (materialId: string) => {
  return api.post(`/materials/${materialId}/like`)
}

/**
 * 取消点赞物料
 * @param materialId 物料ID
 * @returns 取消点赞结果
 */
export const unlikeMaterial = (materialId: string) => {
  return api.delete(`/materials/${materialId}/like`)
}

/**
 * 增加物料下载量
 * @param materialId 物料ID
 * @returns 增加结果
 */
export const incrementMaterialDownloads = (materialId: string) => {
  return api.post(`/materials/${materialId}/download`)
}

/**
 * 增加物料使用量
 * @param materialId 物料ID
 * @param projectId 项目ID
 * @returns 增加结果
 */
export const incrementMaterialUsage = (materialId: string, projectId?: string) => {
  return api.post(`/materials/${materialId}/usage`, { projectId })
}

/**
 * 获取物料统计信息
 * @param materialId 物料ID
 * @returns 统计信息
 */
export const getMaterialStatistics = (materialId: string) => {
  return api.get<MaterialStatistics>(`/materials/${materialId}/statistics`)
}

/**
 * 获取物料使用记录
 * @param materialId 物料ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 使用记录列表
 */
export const getMaterialUsageHistory = (materialId: string, page = 1, pageSize = 20) => {
  return api.get(`/materials/${materialId}/usage-history`, {
    params: { page, pageSize }
  })
}

/**
 * 分享物料
 * @param materialId 物料ID
 * @param shareType 分享类型
 * @param expiresIn 过期时间（秒）
 * @returns 分享链接
 */
export const shareMaterial = (materialId: string, shareType = 'public', expiresIn?: number) => {
  return api.post<{ shareUrl: string; token: string }>(`/materials/${materialId}/share`, {
    shareType,
    expiresIn
  })
}

/**
 * 取消分享物料
 * @param materialId 物料ID
 * @returns 取消分享结果
 */
export const unshareMaterial = (materialId: string) => {
  return api.delete(`/materials/${materialId}/share`)
}

/**
 * 获取分享的物料信息
 * @param token 分享令牌
 * @returns 物料信息
 */
export const getSharedMaterial = (token: string) => {
  return api.get<Material>(`/materials/shared/${token}`)
}

/**
 * 导出物料
 * @param materialId 物料ID
 * @param format 导出格式
 * @param options 导出选项
 * @returns 导出结果
 */
export const exportMaterial = (materialId: string, format = 'json', options: any = {}) => {
  return api.post(`/materials/${materialId}/export`, {
    format,
    options
  }, {
    responseType: 'blob'
  })
}

/**
 * 批量导出物料
 * @param materialIds 物料ID列表
 * @param format 导出格式
 * @param options 导出选项
 * @returns 导出结果
 */
export const batchExportMaterials = (materialIds: string[], format = 'zip', options: any = {}) => {
  return api.post('/materials/batch/export', {
    materialIds,
    format,
    options
  }, {
    responseType: 'blob'
  })
}

/**
 * 导入物料
 * @param categoryId 分类ID
 * @param file 导入文件
 * @returns 导入结果
 */
export const importMaterial = (categoryId: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('categoryId', categoryId)
  return api.post<Material>('/materials/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 批量导入物料
 * @param categoryId 分类ID
 * @param file 导入文件（zip格式）
 * @returns 导入结果
 */
export const batchImportMaterials = (categoryId: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('categoryId', categoryId)
  return api.post<{ success: Material[]; failed: Array<{ name: string; error: string }> }>(
    '/materials/batch/import',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

/**
 * 获取物料模板列表
 * @param type 模板类型
 * @returns 模板列表
 */
export const getMaterialTemplates = (type?: string) => {
  return api.get('/materials/templates', {
    params: { type }
  })
}

/**
 * 从模板创建物料
 * @param templateId 模板ID
 * @param name 物料名称
 * @param categoryId 分类ID
 * @returns 创建的物料信息
 */
export const createMaterialFromTemplate = (templateId: string, name: string, categoryId: string) => {
  return api.post<Material>('/materials/from-template', {
    templateId,
    name,
    categoryId
  })
}

/**
 * 将物料保存为模板
 * @param materialId 物料ID
 * @param name 模板名称
 * @param description 模板描述
 * @param type 模板类型
 * @param isPublic 是否公开
 * @returns 保存结果
 */
export const saveMaterialAsTemplate = (
  materialId: string,
  name: string,
  description?: string,
  type?: string,
  isPublic = false
) => {
  return api.post(`/materials/${materialId}/save-as-template`, {
    name,
    description,
    type,
    isPublic
  })
}

/**
 * 获取物料类型列表
 * @returns 类型列表
 */
export const getMaterialTypes = () => {
  return api.get<{ types: Array<{ value: string; label: string; description?: string; icon?: string }> }>('/materials/types')
}

/**
 * 获取物料状态列表
 * @returns 状态列表
 */
export const getMaterialStatuses = () => {
  return api.get<{ statuses: Array<{ value: string; label: string; color?: string }> }>('/materials/statuses')
}

/**
 * 获取物料标签
 * @param categoryId 分类ID
 * @returns 标签列表
 */
export const getMaterialTags = (categoryId?: string) => {
  return api.get<{ tags: string[] }>('/materials/tags', {
    params: { categoryId }
  })
}

/**
 * 设置物料审核人
 * @param materialId 物料ID
 * @param reviewerIds 审核人ID列表
 * @returns 设置结果
 */
export const setMaterialReviewers = (materialId: string, reviewerIds: string[]) => {
  return api.patch(`/materials/${materialId}/reviewers`, { reviewerIds })
}

/**
 * 审核物料
 * @param materialId 物料ID
 * @param action 审核动作（approve/reject）
 * @param comment 审核意见
 * @returns 审核结果
 */
export const reviewMaterial = (materialId: string, action: 'approve' | 'reject', comment?: string) => {
  return api.post(`/materials/${materialId}/review`, { action, comment })
}

/**
 * 获取待审核的物料列表
 * @param params 查询参数
 * @returns 待审核物料列表
 */
export const getPendingMaterials = (params: Omit<MaterialListParams, 'status'> = {}) => {
  return api.get<PaginationResponse<Material>>('/materials/pending-review', { params })
}

/**
 * 获取物料依赖关系
 * @param materialId 物料ID
 * @returns 依赖关系
 */
export const getMaterialDependencies = (materialId: string) => {
  return api.get<{ dependencies: Material[]; dependents: Material[] }>(`/materials/${materialId}/dependencies`)
}

/**
 * 设置物料依赖
 * @param materialId 物料ID
 * @param dependencyIds 依赖物料ID列表
 * @returns 设置结果
 */
export const setMaterialDependencies = (materialId: string, dependencyIds: string[]) => {
  return api.patch(`/materials/${materialId}/dependencies`, { dependencyIds })
}

/**
 * 检查物料兼容性
 * @param materialIds 物料ID列表
 * @returns 兼容性检查结果
 */
export const checkMaterialCompatibility = (materialIds: string[]) => {
  return api.post('/materials/check-compatibility', { materialIds })
}

/**
 * 获取物料变更日志
 * @param materialId 物料ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 变更日志列表
 */
export const getMaterialChangelog = (materialId: string, page = 1, pageSize = 20) => {
  return api.get(`/materials/${materialId}/changelog`, {
    params: { page, pageSize }
  })
}

/**
 * 生成物料预览
 * @param materialId 物料ID
 * @param options 预览选项
 * @returns 预览结果
 */
export const generateMaterialPreview = (materialId: string, options: any = {}) => {
  return api.post<{ previewUrl: string }>(`/materials/${materialId}/preview`, options)
}

/**
 * 获取物料预览
 * @param materialId 物料ID
 * @param version 版本号
 * @returns 预览数据
 */
export const getMaterialPreview = (materialId: string, version?: string) => {
  return api.get(`/materials/${materialId}/preview`, {
    params: { version }
  })
}

/**
 * 验证物料代码
 * @param materialId 物料ID
 * @param code 代码内容
 * @returns 验证结果
 */
export const validateMaterialCode = (materialId: string, code: string) => {
  return api.post(`/materials/${materialId}/validate`, { code })
}

/**
 * 格式化物料代码
 * @param materialId 物料ID
 * @param code 代码内容
 * @param options 格式化选项
 * @returns 格式化结果
 */
export const formatMaterialCode = (materialId: string, code: string, options: any = {}) => {
  return api.post<{ formattedCode: string }>(`/materials/${materialId}/format`, { code, options })
}

/**
 * 压缩物料代码
 * @param materialId 物料ID
 * @param options 压缩选项
 * @returns 压缩结果
 */
export const compressMaterialCode = (materialId: string, options: any = {}) => {
  return api.post<{ compressedCode: string; originalSize: number; compressedSize: number }>(
    `/materials/${materialId}/compress`,
    options
  )
}