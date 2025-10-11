import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();

/**
 * 组件管理API枚举
 */
enum ComponentApi {
  list = '/verto-backend/material/component/list',
  save = '/verto-backend/material/component/add',
  edit = '/verto-backend/material/component/edit',
  deleteOne = '/verto-backend/material/component/delete',
  deleteBatch = '/verto-backend/material/component/deleteBatch',
  importExcel = '/verto-backend/material/component/importExcel',
  exportXls = '/verto-backend/material/component/exportXls',
}

/**
 * 模板管理API枚举
 */
enum TemplateApi {
  list = '/verto-backend/material/template/list',
  save = '/verto-backend/material/template/add',
  edit = '/verto-backend/material/template/edit',
  deleteOne = '/verto-backend/material/template/delete',
  deleteBatch = '/verto-backend/material/template/deleteBatch',
  importExcel = '/verto-backend/material/template/importExcel',
  exportXls = '/verto-backend/material/template/exportXls',
}

/**
 * 导出组件管理
 */
export const getExportUrl = ComponentApi.exportXls;

/**
 * 导入组件管理
 */
export const getImportUrl = ComponentApi.importExcel;

/**
 * 获取组件列表
 */
export const getComponentList = (params) => defHttp.get({ url: ComponentApi.list, params });

/**
 * 删除组件
 */
export const deleteComponent = (params, handleSuccess) => {
  return defHttp.delete({ url: ComponentApi.deleteOne, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除组件
 */
export const batchDeleteComponent = (params, handleSuccess) => {
  createConfirm({
    iconType: 'warning',
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: ComponentApi.deleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};

/**
 * 保存或者更新组件
 */
export const saveOrUpdateComponent = (params, isUpdate) => {
  const url = isUpdate ? ComponentApi.edit : ComponentApi.save;
  return defHttp.post({ url: url, params }, { isTransformResponse: false });
};

/**
 * 新增组件
 */
export const addComponent = (params) => {
  return defHttp.post({ url: ComponentApi.save, params }, { isTransformResponse: false });
};

/**
 * 更新组件
 */
export const updateComponent = (params) => {
  return defHttp.post({ url: ComponentApi.edit, params }, { isTransformResponse: false });
};

/**
 * 获取模板列表
 */
export const getTemplateList = (params) => defHttp.get({ url: TemplateApi.list, params });

/**
 * 删除模板
 */
export const deleteTemplate = (params, handleSuccess) => {
  return defHttp.delete({ url: TemplateApi.deleteOne, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除模板
 */
export const batchDeleteTemplate = (params, handleSuccess) => {
  createConfirm({
    iconType: 'warning',
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: TemplateApi.deleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};

/**
 * 保存或者更新模板
 */
export const saveOrUpdateTemplate = (params, isUpdate) => {
  const url = isUpdate ? TemplateApi.edit : TemplateApi.save;
  return defHttp.post({ url: url, params }, { isTransformResponse: false });
};

/**
 * 新增模板
 */
export const addTemplate = (params) => {
  return defHttp.post({ url: TemplateApi.save, params }, { isTransformResponse: false });
};

/**
 * 更新模板
 */
export const updateTemplate = (params) => {
  return defHttp.post({ url: TemplateApi.edit, params }, { isTransformResponse: false });
};