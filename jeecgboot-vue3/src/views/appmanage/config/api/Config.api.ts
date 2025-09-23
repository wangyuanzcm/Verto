import { defHttp } from '/@/utils/http/axios';
import { ConfigModel } from '../data/Config.data';

enum Api {
  CONFIG_LIST = '/super/config/list',
  CONFIG_SAVE = '/super/config/save',
  CONFIG_DELETE = '/super/config/delete',
  CONFIG_DETAIL = '/super/config/detail',
  CONFIG_COPY = '/super/config/copy',
  CONFIG_DEPLOY = '/super/config/deploy',
  CONFIG_ROLLBACK = '/super/config/rollback',
  CONFIG_VALIDATE = '/super/config/validate',
  CONFIG_EXPORT = '/super/config/export',
  CONFIG_IMPORT = '/super/config/import',
  CONFIG_HISTORY = '/super/config/history',
  CONFIG_PREVIEW = '/super/config/preview',

  // 流水线配置相关
  PIPELINE_EXECUTE = '/super/config/pipeline/execute',
  PIPELINE_STOP = '/super/config/pipeline/stop',
  PIPELINE_LOGS = '/super/config/pipeline/logs',
  PIPELINE_STAGES = '/super/config/pipeline/stages',

  // 埋点配置相关
  TRACKING_EVENTS = '/super/config/tracking/events',
  TRACKING_PROPERTIES = '/super/config/tracking/properties',
  TRACKING_STATISTICS = '/super/config/tracking/statistics',

  // 代码审查配置相关
  CODE_REVIEW_RULES = '/super/config/code-review/rules',
  CODE_REVIEW_REVIEWERS = '/super/config/code-review/reviewers',
  CODE_REVIEW_REPORTS = '/super/config/code-review/reports',
}

/**
 * 获取配置列表
 */
export const getConfigList = (params?: any) =>
  defHttp.get<any>({
    url: Api.CONFIG_LIST,
    params,
  });

/**
 * 保存配置
 */
export const saveConfig = (params: ConfigModel) =>
  defHttp.post<any>({
    url: Api.CONFIG_SAVE,
    params,
  });

/**
 * 删除配置
 */
export const deleteConfig = (id: string) =>
  defHttp.delete<any>({
    url: Api.CONFIG_DELETE,
    params: { id },
  });

/**
 * 获取配置详情
 */
export const getConfigDetail = (id: string) =>
  defHttp.get<ConfigModel>({
    url: Api.CONFIG_DETAIL,
    params: { id },
  });

/**
 * 复制配置
 */
export const copyConfig = (id: string, name: string) =>
  defHttp.post<any>({
    url: Api.CONFIG_COPY,
    params: { id, name },
  });

/**
 * 部署配置
 */
export const deployConfig = (id: string, environment: string) =>
  defHttp.post<any>({
    url: Api.CONFIG_DEPLOY,
    params: { id, environment },
  });

/**
 * 回滚配置
 */
export const rollbackConfig = (id: string, version: string) =>
  defHttp.post<any>({
    url: Api.CONFIG_ROLLBACK,
    params: { id, version },
  });

/**
 * 验证配置
 */
export const validateConfig = (config: any, type: string) =>
  defHttp.post<any>({
    url: Api.CONFIG_VALIDATE,
    params: { config, type },
  });

/**
 * 导出配置
 */
export const exportConfig = (ids: string[]) =>
  defHttp.post<any>({
    url: Api.CONFIG_EXPORT,
    params: { ids },
    responseType: 'blob',
  });

/**
 * 导入配置
 */
export const importConfig = (file: File, appId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('appId', appId);

  return defHttp.post<any>({
    url: Api.CONFIG_IMPORT,
    params: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 获取配置变更历史
 */
export const getConfigHistory = (id: string) =>
  defHttp.get<any>({
    url: Api.CONFIG_HISTORY,
    params: { id },
  });

/**
 * 预览配置
 */
export const previewConfig = (id: string, environment: string) =>
  defHttp.get<any>({
    url: Api.CONFIG_PREVIEW,
    params: { id, environment },
  });

// ==================== 流水线配置相关 ====================

/**
 * 执行流水线
 */
export const executePipeline = (configId: string, branch?: string) =>
  defHttp.post<any>({
    url: Api.PIPELINE_EXECUTE,
    params: { configId, branch },
  });

/**
 * 停止流水线
 */
export const stopPipeline = (executionId: string) =>
  defHttp.post<any>({
    url: Api.PIPELINE_STOP,
    params: { executionId },
  });

/**
 * 获取流水线日志
 */
export const getPipelineLogs = (executionId: string, stageId?: string) =>
  defHttp.get<any>({
    url: Api.PIPELINE_LOGS,
    params: { executionId, stageId },
  });

/**
 * 获取流水线阶段信息
 */
export const getPipelineStages = (configId: string) =>
  defHttp.get<any>({
    url: Api.PIPELINE_STAGES,
    params: { configId },
  });

// ==================== 埋点配置相关 ====================

/**
 * 获取埋点事件列表
 */
export const getTrackingEvents = (configId: string) =>
  defHttp.get<any>({
    url: Api.TRACKING_EVENTS,
    params: { configId },
  });

/**
 * 获取埋点属性列表
 */
export const getTrackingProperties = (configId: string) =>
  defHttp.get<any>({
    url: Api.TRACKING_PROPERTIES,
    params: { configId },
  });

/**
 * 获取埋点统计数据
 */
export const getTrackingStatistics = (configId: string, dateRange: string[]) =>
  defHttp.get<any>({
    url: Api.TRACKING_STATISTICS,
    params: { configId, startDate: dateRange[0], endDate: dateRange[1] },
  });

// ==================== 代码审查配置相关 ====================

/**
 * 获取代码审查规则
 */
export const getCodeReviewRules = (configId: string) =>
  defHttp.get<any>({
    url: Api.CODE_REVIEW_RULES,
    params: { configId },
  });

/**
 * 获取代码审查人员
 */
export const getCodeReviewers = (configId: string) =>
  defHttp.get<any>({
    url: Api.CODE_REVIEW_REVIEWERS,
    params: { configId },
  });

/**
 * 获取代码审查报告
 */
export const getCodeReviewReports = (configId: string, dateRange: string[]) =>
  defHttp.get<any>({
    url: Api.CODE_REVIEW_REPORTS,
    params: { configId, startDate: dateRange[0], endDate: dateRange[1] },
  });
