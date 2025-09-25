import { defHttp } from '/@/utils/http/axios';
import { ProjectModel, PipelineStatus, AppConfig } from './Project.data';

enum Api {
  // 项目基础API
  list = '/project/list',
  save = '/project/save',
  edit = '/project/edit',
  deleteOne = '/project/delete',
  deleteBatch = '/project/deleteBatch',
  importExcel = '/project/importExcel',
  exportXls = '/project/exportXls',
  detail = '/project/detail',
  
  // Git分支管理API
  createGitBranch = '/project/git/createBranch',
  getGitBranches = '/project/git/branches',
  deleteGitBranch = '/project/git/deleteBranch',
  
  // 应用配置API
  getAppConfig = '/project/appConfig/get',
  saveAppConfig = '/project/appConfig/save',
  
  // 流水线配置API - 与mock保持一致
  getPipelineConfig = '/project/pipeline/config/get',
  savePipelineConfig = '/project/pipeline/config/save',
  togglePipelineConfig = '/project/pipeline/config/toggle',
  
  // 流水线状态API - 与mock保持一致
  getPipelineStatus = '/project/pipeline/status',
  
  // 流水线历史API - 与mock保持一致
  getPipelineHistory = '/project/pipeline/history',
  getBuildDetail = '/project/pipeline/build',
  deleteBuild = '/project/pipeline/build/delete',
  batchDeleteBuilds = '/project/pipeline/build/batch-delete',
  
  // 流水线执行API - 与mock保持一致
  triggerPipeline = '/project/pipeline/trigger',
  cancelPipeline = '/project/pipeline/cancel',
  retryBuild = '/project/pipeline/build/retry',
  
  // 流水线阶段API - 与mock保持一致
  continueStage = '/project/pipeline/stage/continue',
  retryPipelineStage = '/project/pipeline/retry',
  skipPipelineStage = '/project/pipeline/skip',
  cancelStage = '/project/pipeline/stage/cancel',
  getStageLogs = '/project/pipeline/logs',
  
  // 流水线日志API - 与mock保持一致
  getBuildLogs = '/project/pipeline/logs',
  downloadBuildLogs = '/project/pipeline/build/logs/download',
  batchDownloadLogs = '/project/pipeline/build/batch-download',
  
  // 流水线部署API - 与mock保持一致
  deployPipeline = '/project/pipeline/deploy',
  stopPipeline = '/project/pipeline/stop',
  
  // 关联数据API
  getAppList = '/appmanage/app/list',
  getUserList = '/sys/staff/list',
}

/**
 * 获取项目列表
 * @param params 查询参数
 */
export const getProjectList = (params?: any) =>
  defHttp.get<any>({ url: Api.list, params });

/**
 * 保存项目
 * @param params 项目数据
 * @param isUpdate 是否为更新操作
 */
export const saveProject = (params: ProjectModel, isUpdate?: boolean) => {
  if (isUpdate) {
    return defHttp.put<any>({ url: Api.edit, params });
  } else {
    return defHttp.post<any>({ url: Api.save, params });
  }
};

/**
 * 更新项目
 * @param params 项目数据
 */
export const updateProject = (params: ProjectModel) => {
  return defHttp.put<any>({ url: Api.edit, params });
};

/**
 * 删除项目
 * @param params 删除参数
 */
export const deleteProject = (params: { id: string }) =>
  defHttp.delete<any>({ url: Api.deleteOne, params });

/**
 * 批量删除项目
 * @param params 批量删除参数
 */
export const batchDeleteProject = (params: { ids: string[] }) =>
  defHttp.delete<any>({ url: Api.deleteBatch, params });

/**
 * 获取项目详情
 * @param params 查询参数
 */
export const getProjectDetail = (params: { id: string }) =>
  defHttp.get<ProjectModel>({ url: Api.detail, params });

/**
 * 导入Excel
 * @param params 导入参数
 */
export const importExcel = (params: any) =>
  defHttp.post<any>({ url: Api.importExcel, params });

/**
 * 导出Excel
 * @param params 导出参数
 */
export const exportXls = (params?: any) =>
  defHttp.get<any>({ url: Api.exportXls, params }, { responseType: 'blob' });

/**
 * 创建Git分支
 * @param params 分支创建参数
 */
export const createGitBranch = (params: {
  projectId: string;
  projectType: 'requirement' | 'bug';
  itemId: string; // 需求ID或BUG ID
  appId: string;
}) => {
  return defHttp.post<{
    branchName: string;
    command: string;
    success: boolean;
    message: string;
  }>({ url: Api.createGitBranch, params });
};

/**
 * 获取Git分支列表
 * @param params 查询参数
 */
export const getGitBranches = (params: { projectId: string }) =>
  defHttp.get<any[]>({ url: Api.getGitBranches, params });

/**
 * 删除Git分支
 * @param params 删除参数
 */
export const deleteGitBranch = (params: { projectId: string; branchName: string }) =>
  defHttp.delete<any>({ url: Api.deleteGitBranch, params });

/**
 * 获取应用配置
 * @param params 查询参数
 */
export const getAppConfig = (params: { projectId: string }) =>
  defHttp.get<AppConfig>({ url: Api.getAppConfig, params });

/**
 * 保存应用配置
 * @param params 配置数据
 */
export const saveAppConfig = (params: { projectId: string; config: AppConfig }) =>
  defHttp.post<any>({ url: Api.saveAppConfig, params });

// ==================== 流水线配置相关API ====================

/**
 * 获取流水线配置
 * @param params 查询参数
 */
export const getPipelineConfig = (params: { projectId: string }) =>
  defHttp.get<any>({ url: Api.getPipelineConfig, params });

/**
 * 更新流水线配置
 * @param params 配置参数
 */
export const updatePipelineConfig = (params: { projectId: string; config: any }) =>
  defHttp.put({ url: `${Api.getPipelineConfig}/${params.projectId}`, data: params.config });

/**
 * 保存流水线配置
 * @param params 配置参数
 */
export const savePipelineConfig = (params: any) =>
  defHttp.post<any>({ url: Api.savePipelineConfig, params });

/**
 * 启用/禁用流水线
 * @param params 切换参数
 */
export const togglePipelineConfig = (params: { projectId: string; enabled: boolean }) =>
  defHttp.post<any>({ url: Api.togglePipelineConfig, params });

// ==================== 流水线状态相关API ====================

/**
 * 获取流水线当前状态
 * @param params 查询参数
 */
export const getPipelineStatus = (params: { projectId: string }) =>
  defHttp.get<PipelineStatus>({ url: Api.getPipelineStatus, params });

// ==================== 流水线历史相关API ====================

/**
 * 获取流水线历史记录
 * @param params 查询参数
 */
export const getPipelineHistory = (params: {
  projectId: string;
  page?: number;
  pageSize?: number;
  status?: string;
  branch?: string;
  startDate?: string;
  endDate?: string;
}) => defHttp.get<any>({ url: Api.getPipelineHistory, params });

/**
 * 获取构建详情
 * @param params 查询参数
 */
export const getBuildDetail = (params: { projectId: string; buildId: string }) =>
  defHttp.get<any>({ url: `${Api.getBuildDetail}/${params.projectId}/${params.buildId}` });

/**
 * 删除构建记录
 * @param params 删除参数
 */
export const deleteBuild = (params: { projectId: string; buildId: string }) =>
  defHttp.delete<any>({ url: `${Api.deleteBuild}/${params.projectId}/${params.buildId}` });

/**
 * 批量删除构建记录
 * @param params 批量删除参数
 */
export const batchDeleteBuilds = (params: { projectId: string; buildIds: string[] }) =>
  defHttp.delete<any>({ url: `${Api.batchDeleteBuilds}/${params.projectId}`, data: { buildIds: params.buildIds } });

// ==================== 流水线执行相关API ====================

/**
 * 触发流水线
 * @param params 触发参数
 */
export const triggerPipeline = (params: {
  projectId: string;
  environment: string;
  branch?: string;
  commitId?: string;
  parameters?: Record<string, any>;
}) => defHttp.post<any>({ url: Api.triggerPipeline, data: params });

/**
 * 取消流水线构建
 * @param params 取消参数
 */
export const cancelPipeline = (params: { projectId: string; buildId: string }) =>
  defHttp.post<any>({ url: `${Api.cancelPipeline}/${params.projectId}/${params.buildId}` });

/**
 * 重新构建
 * @param params 重试参数
 */
export const retryBuild = (params: { projectId: string; buildId: string }) =>
  defHttp.post<any>({ url: `${Api.retryBuild}/${params.projectId}/${params.buildId}` });

// ==================== 流水线阶段相关API ====================

/**
 * 继续阶段（手动卡点）
 * @param params 继续参数
 */
export const continueStage = (params: { projectId: string; buildId: string; stageName: string }) =>
  defHttp.post<any>({ url: `${Api.continueStage}/${params.projectId}/${params.buildId}/${params.stageName}` });

/**
 * 重试流水线阶段
 * @param params 重试参数
 */
export const retryPipelineStage = (params: { projectId: string; buildId: string; stageName: string }) =>
  defHttp.post<any>({ url: `${Api.retryPipelineStage}/${params.projectId}/${params.buildId}/${params.stageName}` });

/**
 * 跳过流水线阶段
 * @param params 跳过参数
 */
export const skipPipelineStage = (params: { projectId: string; buildId: string; stageName: string }) =>
  defHttp.post<any>({ url: `${Api.skipPipelineStage}/${params.projectId}/${params.buildId}/${params.stageName}` });

/**
 * 取消阶段
 * @param params 取消参数
 */
export const cancelStage = (params: { projectId: string; buildId: string; stageName: string }) =>
  defHttp.post<any>({ url: `${Api.cancelStage}/${params.projectId}/${params.buildId}/${params.stageName}` });

/**
 * 获取阶段日志
 * @param params 查询参数
 */
export const getStageLogs = (params: {
  projectId: string;
  buildId: string;
  stageName: string;
  offset?: number;
  limit?: number;
  follow?: boolean;
}) => defHttp.get<any>({ url: `${Api.getStageLogs}/${params.projectId}/${params.buildId}/${params.stageName}`, params });

// ==================== 流水线日志相关API ====================

/**
 * 获取构建日志
 * @param params 查询参数
 */
export const getBuildLogs = (params: {
  projectId: string;
  buildId: string;
  offset?: number;
  limit?: number;
  follow?: boolean;
}) => defHttp.get<any>({ url: `${Api.getBuildLogs}/${params.projectId}/${params.buildId}`, params });

/**
 * 下载构建日志
 * @param params 下载参数
 */
export const downloadBuildLogs = (params: { projectId: string; buildId: string }) =>
  defHttp.get<Blob>({ 
    url: `${Api.downloadBuildLogs}/${params.projectId}/${params.buildId}`, 
    responseType: 'blob' 
  });

/**
 * 批量下载构建日志
 * @param params 批量下载参数
 */
export const batchDownloadLogs = (params: { projectId: string; buildIds: string[] }) =>
  defHttp.post<Blob>({ 
    url: `${Api.batchDownloadLogs}/${params.projectId}`, 
    data: { buildIds: params.buildIds },
    responseType: 'blob' 
  });

/**
 * 获取应用列表
 * @param params 查询参数
 */
export const getAppList = (params?: any) =>
  defHttp.get<any[]>({ url: Api.getAppList, params });

/**
 * 获取用户列表
 * @param params 查询参数
 */
export const getUserList = (params?: any) =>
  defHttp.get<any[]>({ url: Api.getUserList, params });

/**
 * 生成Git分支名称
 * @param projectType 项目类型
 * @param itemId 需求ID或BUG ID
 */
export const generateGitBranchName = (projectType: 'requirement' | 'bug', itemId: string): string => {
  const prefix = projectType === 'requirement' ? 'feature' : 'fix';
  return `${prefix}-${itemId}`;
};

/**
 * 生成Git分支创建命令
 * @param branchName 分支名称
 * @param baseBranch 基础分支，默认为develop
 */
export const generateGitBranchCommand = (branchName: string, baseBranch: string = 'develop'): string => {
  return `git checkout -b ${branchName} ${baseBranch}`;
};