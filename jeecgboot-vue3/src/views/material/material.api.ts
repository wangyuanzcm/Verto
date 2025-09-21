import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();

/**
 * 组件管理API枚举
 */
enum ComponentApi {
  list = '/material/component/list',
  save = '/material/component/add',
  edit = '/material/component/edit',
  deleteOne = '/material/component/delete',
  deleteBatch = '/material/component/deleteBatch',
  importExcel = '/material/component/importExcel',
  exportXls = '/material/component/exportXls',
}

/**
 * 模板管理API枚举
 */
enum TemplateApi {
  list = '/material/template/list',
  save = '/material/template/add',
  edit = '/material/template/edit',
  deleteOne = '/material/template/delete',
  deleteBatch = '/material/template/deleteBatch',
  importExcel = '/material/template/importExcel',
  exportXls = '/material/template/exportXls',
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