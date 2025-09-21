import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

/**
 * 人员管理API枚举
 */
enum Api {
  list = '/sys/staff/list',
  save = '/sys/staff/add',
  edit = '/sys/staff/edit',
  deleteStaff = '/sys/staff/delete',
  deleteBatch = '/sys/staff/deleteBatch',
  importExcel = '/sys/staff/importExcel',
  exportXls = '/sys/staff/exportXls',
  duplicateCheck = '/sys/duplicate/check',
  getStaffById = '/sys/staff/queryById',
  getSkillDict = '/sys/dict/getDictItems/staff_skills',
}

/**
 * 导出API地址
 */
export const getExportUrl = Api.exportXls;

/**
 * 导入API地址
 */
export const getImportUrl = Api.importExcel;

/**
 * 获取人员列表
 * @param params 查询参数
 */
export const getStaffList = (params) => defHttp.get({ url: Api.list, params });

/**
 * 根据ID获取人员详情
 * @param id 人员ID
 */
export const getStaffById = (id) => defHttp.get({ url: Api.getStaffById, params: { id } });

/**
 * 保存或更新人员信息
 * @param params 人员信息参数
 * @param isUpdate 是否为更新操作
 */
export const saveOrUpdateStaff = (params, isUpdate) => {
  const url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url, params });
};

/**
 * 创建新人员
 * @param params 人员信息参数
 */
export const createStaff = (params) => defHttp.post({ url: Api.save, params });

/**
 * 更新人员信息
 * @param params 人员信息参数
 */
export const updateStaff = (params) => defHttp.post({ url: Api.edit, params });

/**
 * 删除人员
 * @param params 删除参数
 * @param handleSuccess 成功回调
 */
export const deleteStaff = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteStaff, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除人员
 * @param params 批量删除参数
 * @param handleSuccess 成功回调
 */
export const batchDeleteStaff = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据?',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};

/**
 * 重复性校验
 * @param params 校验参数
 */
export const duplicateCheck = (params) => defHttp.get({ url: Api.duplicateCheck, params }, { isTransformResponse: false });

/**
 * 延迟重复性校验
 * @param params 校验参数
 */
const timer = {};
export const duplicateCheckDelay = (params) => {
  return new Promise((resolve) => {
    const key = params.tableName + '_' + params.fieldName;
    if (timer[key]) {
      clearTimeout(timer[key]);
    }
    timer[key] = setTimeout(() => {
      duplicateCheck(params).then((res) => {
        resolve(res);
      });
    }, 300);
  });
};

/**
 * 获取技能字典
 * @param params 查询参数
 */
export const getSkillDict = (params) => defHttp.get({ url: Api.getSkillDict, params });