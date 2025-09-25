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
  
  // 流水线API
  getPipelineStatus = '/project/pipeline/status',
  triggerPipeline = '/project/pipeline/trigger',
  stopPipeline = '/project/pipeline/stop',
  getPipelineLogs = '/project/pipeline/logs',
  getPipelineHistory = '/project/pipeline/history',
  retryPipelineStage = '/project/pipeline/retry',
  skipPipelineStage = '/project/pipeline/skip',
  getPipelineConfig = '/project/pipeline/config/get',
  savePipelineConfig = '/project/pipeline/config/save',
  togglePipelineConfig = '/project/pipeline/config/toggle',
  cancelPipeline = '/project/pipeline/cancel',
  
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

/**
 * 获取流水线状态
 * @param params 查询参数
 */
export const getPipelineStatus = (params: { projectId: string }) =>
  defHttp.get<PipelineStatus>({ url: Api.getPipelineStatus, params });

/**
 * 触发流水线
 * @param params 触发参数
 */
export const triggerPipeline = (params: { projectId: string; stage?: string }) =>
  defHttp.post<any>({ url: Api.triggerPipeline, params });

/**
 * 停止流水线
 * @param params 停止参数
 */
export const stopPipeline = (params: { projectId: string }) =>
  defHttp.post<any>({ url: Api.stopPipeline, params });

/**
 * 获取流水线日志
 * @param params 查询参数
 */
export const getPipelineLogs = (params: { projectId: string; stage?: string }) =>
  defHttp.get<any[]>({ url: Api.getPipelineLogs, params });

/**
 * 获取流水线历史记录
 * @param params 查询参数
 */
export const getPipelineHistory = (params: { projectId: string }) =>
  defHttp.get<any[]>({ url: Api.getPipelineHistory, params });

/**
 * 重试流水线阶段
 * @param params 重试参数
 */
export const retryPipelineStage = (params: { projectId: string; stage: string }) =>
  defHttp.post<any>({ url: Api.retryPipelineStage, params });

/**
 * 跳过流水线阶段
 * @param params 跳过参数
 */
export const skipPipelineStage = (params: { projectId: string; stage: string }) =>
  defHttp.post<any>({ url: Api.skipPipelineStage, params });

/**
 * 获取流水线配置
 * @param params 查询参数
 */
export const getPipelineConfig = (params: { projectId: string }) =>
  defHttp.get<any>({ url: Api.getPipelineConfig, params });

/**
 * 保存流水线配置
 * @param params 配置参数
 */
export const savePipelineConfig = (params: any) =>
  defHttp.post<any>({ url: Api.savePipelineConfig, params });

/**
 * 切换流水线配置状态
 * @param params 切换参数
 */
export const togglePipelineConfig = (params: { projectId: string; enabled: boolean }) =>
  defHttp.post<any>({ url: Api.togglePipelineConfig, params });

/**
 * 取消流水线构建
 * @param params 取消参数
 */
export const cancelPipeline = (params: { projectId: string; buildId: string }) =>
  defHttp.post<any>({ url: Api.cancelPipeline, params });

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