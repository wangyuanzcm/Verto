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