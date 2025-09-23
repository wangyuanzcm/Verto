import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();

enum Api {
  list = '/project/list',
  save = '/project/add',
  edit = '/project/edit',
  deleteOne = '/project/delete',
  deleteBatch = '/project/deleteBatch',
  importExcel = '/project/importExcel',
  exportXls = '/project/exportXls',
  detail = '/project/queryById',
  duplicateCheck = '/project/duplicateCheck',
  // 项目统计相关
  statistics = '/project/statistics',
  progressStats = '/project/progressStats',
  memberStats = '/project/memberStats',
  // 项目任务相关
  taskList = '/project/task/list',
  taskSave = '/project/task/add',
  taskEdit = '/project/task/edit',
  taskDelete = '/project/task/delete',
  // 项目文件相关
  fileList = '/project/file/list',
  fileUpload = '/project/file/upload',
  fileDelete = '/project/file/delete',
  fileDownload = '/project/file/download',
  // 项目部署相关
  deploymentList = '/project/deployment/list',
  deploymentSave = '/project/deployment/add',
  deploymentEdit = '/project/deployment/edit',
  deploymentDelete = '/project/deployment/delete',
  deploymentExecute = '/project/deployment/execute',
  // 应用管理相关
  appList = '/app/list',
  appDetail = '/app/detail',
  // 开发模板相关
  templateList = '/template/list',
  templateDetail = '/template/detail',
  // 用户相关
  userList = '/user/list',
  // Git分支管理相关
  gitBranchList = '/project/git/branch/list',
  gitBranchCreate = '/project/git/branch/create',
  gitBranchMerge = '/project/git/branch/merge',
  gitBranchDelete = '/project/git/branch/delete',

  // 工作流管理
  workflowGet = '/project/workflow/get',
  workflowUpdate = '/project/workflow/update',
  workflowDeploy = '/project/workflow/deploy',
  workflowRollback = '/project/workflow/rollback',
  
  // 流水线管理相关
  pipelineBase = '/project',
}

/**
 * 获取项目列表
 */
export const getProjectList = (params?: any) =>
  defHttp.get<any>({
    url: Api.list,
    params,
  });

/**
 * 保存项目
 */
export const saveProject = (params: any, isUpdate: boolean = false) =>
  defHttp.post<any>({
    url: isUpdate ? Api.edit : Api.save,
    params,
  });

/**
 * 删除项目
 */
export const deleteProject = (params: any, handleSuccess?: Function) => {
  return defHttp.delete<any>({
    url: Api.deleteOne,
    params,
  }, { joinParamsToUrl: true }).then(() => {
    handleSuccess && handleSuccess();
  });
};

/**
 * 批量删除项目
 */
export const batchDeleteProject = (params: any, handleSuccess?: Function) => {
  createConfirm({
    iconType: 'warning',
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete<any>({
        url: Api.deleteBatch,
        data: params,
      }, { joinParamsToUrl: true }).then(() => {
        handleSuccess && handleSuccess();
      });
    }
  });
};

/**
 * 获取项目详情
 */
export const getProjectDetail = (params: any) =>
  defHttp.get<any>({
    url: Api.detail,
    params,
  });

/**
 * 导入Excel
 */
export const importExcel = (params: any) =>
  defHttp.uploadFile<any>({
    url: Api.importExcel,
  }, params);

/**
 * 导出Excel
 */
export const exportExcel = (params: any) =>
  defHttp.get<any>({
    url: Api.exportXls,
    params,
    responseType: 'blob',
  });

/**
 * 重复校验
 */
export const duplicateCheck = (params: any) =>
  defHttp.get<any>({
    url: Api.duplicateCheck,
    params,
  });

/**
 * 获取项目统计数据
 */
export const getProjectStatistics = (params?: any) =>
  defHttp.get<any>({
    url: Api.statistics,
    params,
  });

/**
 * 获取项目进度统计
 */
export const getProjectProgressStats = (params?: any) =>
  defHttp.get<any>({
    url: Api.progressStats,
    params,
  });

/**
 * 获取项目成员统计
 */
export const getProjectMemberStats = (params?: any) =>
  defHttp.get<any>({
    url: Api.memberStats,
    params,
  });

// ==================== 项目任务相关 ====================

/**
 * 获取项目任务列表
 */
export const getProjectTaskList = (params: any) =>
  defHttp.get<any>({
    url: Api.taskList,
    params,
  });

/**
 * 保存项目任务
 */
export const saveProjectTask = (params: any, isUpdate: boolean = false) =>
  defHttp.post<any>({
    url: isUpdate ? Api.taskEdit : Api.taskSave,
    params,
  });

/**
 * 删除项目任务
 */
export const deleteProjectTask = (params: any, handleSuccess?: Function) => {
  return defHttp.delete<any>({
    url: Api.taskDelete,
    params,
  }, { joinParamsToUrl: true }).then(() => {
    handleSuccess && handleSuccess();
  });
};

// ==================== 项目文件相关 ====================

/**
 * 获取项目文件列表
 */
export const getProjectFileList = (params: any) =>
  defHttp.get<any>({
    url: Api.fileList,
    params,
  });

/**
 * 上传项目文件
 */
export const uploadProjectFile = (params: any) =>
  defHttp.uploadFile<any>({
    url: Api.fileUpload,
  }, params);

/**
 * 删除项目文件
 */
export const deleteProjectFile = (params: any, handleSuccess?: Function) => {
  return defHttp.delete<any>({
    url: Api.fileDelete,
    params,
  }, { joinParamsToUrl: true }).then(() => {
    handleSuccess && handleSuccess();
  });
};

/**
 * 下载项目文件
 */
export const downloadProjectFile = (params: any) =>
  defHttp.get<any>({
    url: Api.fileDownload,
    params,
    responseType: 'blob',
  });

// ==================== 项目部署相关 ====================

/**
 * 获取项目部署配置列表
 */
export const getProjectDeploymentList = (params: any) =>
  defHttp.get<any>({
    url: Api.deploymentList,
    params,
  });

/**
 * 保存项目部署配置
 */
export const saveProjectDeployment = (params: any, isUpdate: boolean = false) =>
  defHttp.post<any>({
    url: isUpdate ? Api.deploymentEdit : Api.deploymentSave,
    params,
  });

/**
 * 删除项目部署配置
 */
export const deleteProjectDeployment = (params: any, handleSuccess?: Function) => {
  return defHttp.delete<any>({
    url: Api.deploymentDelete,
    params,
  }, { joinParamsToUrl: true }).then(() => {
    handleSuccess && handleSuccess();
  });
};

/**
 * 执行项目部署
 */
export const executeProjectDeployment = (params: any) =>
  defHttp.post<any>({
    url: Api.deploymentExecute,
    params,
  });

/**
 * 获取应用列表
 */
export const getAppList = (params?: any) =>
  defHttp.get<any>({
    url: Api.appList,
    params,
  });

/**
 * 获取应用详情
 */
export const getAppDetail = (params: any) =>
  defHttp.get<any>({
    url: Api.appDetail,
    params,
  });

/**
 * 获取开发模板列表
 */
export const getTemplateList = (params?: any) =>
  defHttp.get<any>({
    url: Api.templateList,
    params,
  });

/**
 * 获取开发模板详情
 */
export const getTemplateDetail = (params: any) =>
  defHttp.get<any>({
    url: Api.templateDetail,
    params,
  });

/**
 * 获取用户列表
 */
export const getUserList = (params?: any) =>
  defHttp.get<any>({
    url: Api.userList,
    params,
  });

/**
 * 获取项目Git分支列表
 */
export const getProjectGitBranches = (params: any) =>
  defHttp.get<any>({
    url: Api.gitBranchList,
    params,
  });

/**
 * 创建Git分支
 */
export const createGitBranch = (params: any) =>
  defHttp.post<any>({
    url: Api.gitBranchCreate,
    params,
  });

/**
 * 合并Git分支
 */
export const mergeGitBranch = (params: any) =>
  defHttp.post<any>({
    url: Api.gitBranchMerge,
    params,
  });

/**
 * 删除Git分支
 */
export const deleteGitBranch = (params: any) => {
  return defHttp.delete({ url: Api.gitBranchDelete, params });
};

/**
 * 获取项目工作流信息
 */
export const getProjectWorkflow = (params: any) => {
  return defHttp.get({ url: Api.workflowGet, params });
};

/**
 * 更新项目工作流配置
 */
export const updateProjectWorkflow = (params: any) => {
  return defHttp.post({ url: Api.workflowUpdate, params });
};

/**
 * 执行工作流部署
 */
export const deployWorkflow = (params: any) => {
  return defHttp.post({ url: Api.workflowDeploy, params });
};

/**
 * 工作流回滚
 */
export const rollbackWorkflow = (params: any) => {
  return defHttp.post({ url: Api.workflowRollback, params });
};

// ==================== 项目流水线相关 ====================

/**
 * 获取项目流水线列表
 */
export const getProjectPipelines = (projectId: string) => {
  return defHttp.get({ url: `${Api.pipelineBase}/${projectId}/pipelines` });
};

/**
 * 获取流水线详情
 */
export const getPipelineDetail = (projectId: string, pipelineId: string) => {
  return defHttp.get({ url: `${Api.pipelineBase}/${projectId}/pipelines/${pipelineId}` });
};

/**
 * 创建流水线
 */
export const createPipeline = (projectId: string, params: any) => {
  return defHttp.post({ url: `${Api.pipelineBase}/${projectId}/pipelines`, params });
};

/**
 * 更新流水线
 */
export const updatePipeline = (projectId: string, pipelineId: string, params: any) => {
  return defHttp.put({ url: `${Api.pipelineBase}/${projectId}/pipelines/${pipelineId}`, params });
};

/**
 * 删除流水线
 */
export const deletePipeline = (projectId: string, pipelineId: string) => {
  return defHttp.delete({ url: `${Api.pipelineBase}/${projectId}/pipelines/${pipelineId}` });
};

/**
 * 执行流水线
 */
export const executePipeline = (projectId: string, pipelineId: string, params?: any) => {
  return defHttp.post({ url: `${Api.pipelineBase}/${projectId}/pipelines/${pipelineId}/execute`, params });
};

/**
 * 停止流水线执行
 */
export const stopPipelineExecution = (projectId: string, pipelineId: string, executionId: string) => {
  return defHttp.post({ url: `${Api.pipelineBase}/${projectId}/pipelines/${pipelineId}/executions/${executionId}/stop` });
};

/**
 * 获取流水线执行历史
 */
export const getPipelineExecutions = (projectId: string, pipelineId: string, params?: any) => {
  return defHttp.get({ url: `${Api.pipelineBase}/${projectId}/pipelines/${pipelineId}/executions`, params });
};

/**
 * 获取流水线执行日志
 */
export const getPipelineExecutionLogs = (projectId: string, pipelineId: string, executionId: string) => {
  return defHttp.get({ url: `${Api.pipelineBase}/${projectId}/pipelines/${pipelineId}/executions/${executionId}/logs` });
};