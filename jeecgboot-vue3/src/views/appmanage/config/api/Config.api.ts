import { defHttp } from '/@/utils/http/axios';

/**
 * 获取配置列表
 */
export function getConfigList(params: any) {
  return defHttp.get({
    url: '/verto-backend/appmanage/config/list',
    params,
  });
}

/**
 * 保存配置
 */
export function saveConfig(params: any) {
  const payload = {
    ...params,
    // 后端字段为 String，确保传递 JSON 字符串
    config: typeof params.config === 'string' ? params.config : JSON.stringify(params.config ?? {}),
  };
  return defHttp.post({
    url: '/verto-backend/appmanage/config/save',
    // 使用 data 作为请求体，避免被拼接到 URL
    data: payload,
  });
}

/**
 * 校验配置
 */
export function validateConfig({ config, type }: { config: any; type?: string }) {
  const body = { config };
  return defHttp.post({
    url: '/verto-backend/appmanage/config/validate',
    // 保持 type 作为查询/路径参数（若后端需要）。若后端读取 body 中的 type，可移入 data。
    params: { type },
    data: body,
  });
}

/**
 * 导入配置
 */
export function importConfig(file: File, appId: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('appId', appId);
  return defHttp.post({
    url: '/verto-backend/appmanage/config/import',
    params: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 导出配置
 */
export function exportConfig(ids: string[]) {
  return defHttp.post({
    url: '/verto-backend/appmanage/config/export',
    data: { ids },
    responseType: 'blob',
  });
}

/**
 * 获取代码审查报告
 */
export function getCodeReviewReports(params: any) {
  return defHttp.get({
    url: '/verto-backend/appmanage/config/review/report',
    params,
  });
}

export function deleteConfig(id: string) {
  return defHttp.delete(
    {
      url: '/verto-backend/appmanage/config/delete',
      params: { id },
    },
    { joinParamsToUrl: true }
  );
}
export function getConfigDetail(id: string) {
  return defHttp.get({
    url: '/verto-backend/appmanage/config/detail',
    params: { id },
  });
}
