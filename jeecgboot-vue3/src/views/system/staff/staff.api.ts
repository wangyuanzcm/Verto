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
  getDepartmentList = '/sys/depart/queryTreeList',
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
 * @param params 包含id的参数对象
 */
export const getStaffById = (params) => defHttp.get({ url: Api.getStaffById, params });

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
 * 删除人员
 * @param params 删除参数
 * @param handleSuccess 成功回调
 */
export const deleteStaff = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteStaff, params }, { joinParamsToUrl: true }).then(() => {
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
    }
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
    const { tableName, fieldName, fieldVal, dataId } = params;
    const key = `${tableName}_${fieldName}`;
    
    if (timer[key]) {
      clearTimeout(timer[key]);
    }
    
    timer[key] = setTimeout(() => {
      duplicateCheck(params)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          resolve(false);
        });
    }, 300);
  });
};

/**
 * 获取部门列表
 * @param params 查询参数
 */
export const getDepartmentList = (params) => defHttp.get({ url: Api.getDepartmentList, params });

/**
 * 获取技能字典
 * @param params 查询参数
 */
export const getSkillDict = (params) => defHttp.get({ url: Api.getSkillDict, params });