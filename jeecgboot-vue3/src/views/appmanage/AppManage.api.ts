import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

export enum Api {
  // 应用管理
  list = '/appmanage/app/list',
  save = '/appmanage/app/edit',
  delete = '/appmanage/app/delete',
  queryById = '/appmanage/app/queryById',
  batchDelete = '/appmanage/app/deleteBatch',
  // 获取用户列表（用于负责人选择）
  getUserList = '/sys/user/list',
  // 获取领域字典
  getDomainDict = '/sys/dict/getDictItems/app_domain',
  
  // 流水线配置相关
  getPipelineConfig = '/appmanage/app/pipeline/config',
  savePipelineConfig = '/appmanage/app/pipeline/config/save',
  deletePipelineConfig = '/appmanage/app/pipeline/config/delete',
  togglePipelineConfig = '/appmanage/app/pipeline/config/toggle',
  copyPipelineConfig = '/appmanage/app/pipeline/config/copy',
  
  // 流水线运行历史相关
  getPipelineHistory = '/appmanage/app/pipeline/history',
  getPipelineHistoryDetail = '/appmanage/app/pipeline/history/detail',
  rerunPipeline = '/appmanage/app/pipeline/rerun',
  cancelPipeline = '/appmanage/app/pipeline/cancel',
  getPipelineLogs = '/appmanage/app/pipeline/logs',
}

/**
 * 查询应用列表
 * @param params 查询参数
 */
export const getAppList = (params) => {
  return defHttp.get({ url: Api.list, params }, { isTransformResponse: false });
};

/**
 * 根据应用id查询应用详情
 * @param params 查询参数
 */
export const getAppById = (params) => {
  return defHttp.get({ url: Api.queryById, params }, { isTransformResponse: false });
};

/**
 * 新增或编辑应用
 * @param params 应用数据
 */
export const saveApp = (params) => {
  return defHttp.put({ url: Api.save, params });
};

/**
 * 删除应用
 * @param params 删除参数
 * @param handleSuccess 成功回调
 */
export const deleteApp = (params, handleSuccess) => {
  return Modal.confirm({
    title: '确认删除',
    content: '是否删除选中的应用？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};

/**
 * 批量删除应用
 * @param params 删除参数
 * @param handleSuccess 成功回调
 */
export const batchDeleteApp = (params, handleSuccess) => {
  return Modal.confirm({
    title: '确认删除',
    content: '是否删除选中的应用？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.batchDelete, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};

/**
 * 获取用户列表（用于负责人选择）
 * @param params 查询参数
 */
export const getUserList = (params) => {
  return defHttp.get({ url: Api.getUserList, params }, { isTransformResponse: false });
};

/**
 * 获取领域字典数据
 */
export const getDomainDict = () => {
  return defHttp.get({ url: Api.getDomainDict }, { isTransformResponse: false });
};

// ==================== 流水线相关API ====================

/**
 * 获取应用流水线配置
 * @param appId 应用ID
 */
export const getPipelineConfig = (appId: string) => {
  return defHttp.get({ url: Api.getPipelineConfig, params: { appId } }, { isTransformResponse: false });
};

/**
 * 保存流水线配置
 * @param appId 应用ID
 * @param config 配置数据
 */
export const savePipelineConfig = (appId: string, config: any) => {
  return defHttp.post({ url: Api.savePipelineConfig, data: { appId, ...config } });
};

/**
 * 删除流水线配置
 * @param appId 应用ID
 * @param configId 配置ID
 */
export const deletePipelineConfig = (appId: string, configId: string) => {
  return Modal.confirm({
    title: '确认删除',
    content: '是否删除选中的流水线配置？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.deletePipelineConfig, params: { appId, configId } }, { joinParamsToUrl: true });
    },
  });
};

/**
 * 切换流水线配置启用状态
 * @param appId 应用ID
 * @param configId 配置ID
 * @param enabled 是否启用
 */
export const togglePipelineConfig = (appId: string, configId: string, enabled: boolean) => {
  return defHttp.post({ url: Api.togglePipelineConfig, data: { appId, configId, enabled } });
};

/**
 * 复制流水线配置
 * @param appId 应用ID
 * @param configId 配置ID
 * @param newName 新配置名称
 */
export const copyPipelineConfig = (appId: string, configId: string, newName: string) => {
  return defHttp.post({ url: Api.copyPipelineConfig, data: { appId, configId, newName } });
};

/**
 * 获取流水线运行历史
 * @param appId 应用ID
 * @param params 查询参数
 */
export const getPipelineHistory = (appId: string, params: any) => {
  return defHttp.get({ url: Api.getPipelineHistory, params: { appId, ...params } }, { isTransformResponse: false });
};

/**
 * 获取流水线运行历史详情
 * @param appId 应用ID
 * @param historyId 历史记录ID
 */
export const getPipelineHistoryDetail = (appId: string, historyId: string) => {
  return defHttp.get({ url: Api.getPipelineHistoryDetail, params: { appId, historyId } }, { isTransformResponse: false });
};

/**
 * 重新运行流水线
 * @param appId 应用ID
 * @param historyId 历史记录ID
 */
export const rerunPipeline = (appId: string, historyId: string) => {
  return defHttp.post({ url: Api.rerunPipeline, data: { appId, historyId } });
};

/**
 * 取消流水线运行
 * @param appId 应用ID
 * @param historyId 历史记录ID
 */
export const cancelPipeline = (appId: string, historyId: string) => {
  return defHttp.post({ url: Api.cancelPipeline, data: { appId, historyId } });
};

/**
 * 获取流水线运行日志
 * @param appId 应用ID
 * @param historyId 历史记录ID
 */
export const getPipelineLogs = (appId: string, historyId: string) => {
  return defHttp.get({ url: Api.getPipelineLogs, params: { appId, historyId } }, { isTransformResponse: false });
};