import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

/**
 * 人员管理API枚举
 */
enum Api {
  list = '/verto-backend/staff/list',
  save = '/verto-backend/staff/add',
  edit = '/verto-backend/staff/edit',
  deleteStaff = '/verto-backend/staff/delete',
  deleteBatch = '/verto-backend/staff/deleteBatch',
  importExcel = '/verto-backend/staff/importExcel',
  exportXls = '/verto-backend/staff/exportXls',
  duplicateCheck = '/verto-backend/sys/duplicate/check',
  getStaffById = '/verto-backend/staff/queryById',
  getSkillDict = '/verto-backend/sys/dict/getDictItems/staff_skills',
  skillsStats = '/verto-backend/staff/skillsStats',
  departmentStats = '/verto-backend/staff/departmentStats',
  checkEmployeeNo = '/verto-backend/staff/checkEmployeeNo',
  checkEmail = '/verto-backend/staff/checkEmail',
  // 积分相关
  pointsSummary = '/verto-backend/staff/points/summary',
  pointsLogs = '/verto-backend/staff/points/logs',
  pointsLogsAll = '/verto-backend/staff/points/logs/all',
  // 可选：手动加分接口（用于测试或管理员操作）
  pointsAdjust = '/verto-backend/staff/points/adjust',
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
export const updateStaff = (params) => defHttp.put({ url: Api.edit, params });

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

/**
 * 获取技能统计
 */
export const getSkillsStats = () => defHttp.get({ url: Api.skillsStats });

/**
 * 获取部门统计
 */
export const getDepartmentStats = () => defHttp.get({ url: Api.departmentStats });

/**
 * 检查工号是否重复
 * @param employeeNo 工号
 * @param id 当前记录ID（编辑时排除自己）
 */
export const checkEmployeeNo = (employeeNo, id) => defHttp.get({ url: Api.checkEmployeeNo, params: { employeeNo, id } });

/**
 * 检查邮箱是否重复
 * @param email 邮箱
 * @param id 当前记录ID（编辑时排除自己）
 */
export const checkEmail = (email, id) => defHttp.get({ url: Api.checkEmail, params: { email, id } });

/**
 * 获取人员总积分
 * @param staffId 人员ID
 */
export const getStaffPointsSummary = (staffId: string) =>
  defHttp.get({ url: Api.pointsSummary, params: { staffId } });

/**
 * 获取人员积分流水（单人）
 */
export const getStaffPointsLogs = (staffId: string, params?: Record<string, any>) =>
  defHttp.get({ url: Api.pointsLogs, params: { staffId, ...(params || {}) } });

/**
 * 获取全员积分流水（可选筛选：staffId、时间区间、事件类型、来源类型、关键字）
 */
export const getAllStaffPointsLogs = (params?: Record<string, any>) =>
  defHttp.get({ url: Api.pointsLogsAll, params: { ...(params || {}) } });

/**
 * 调整人员积分（正负均可）—可选：用于管理员手动调整或联调期间测试
 * @param staffId 人员ID
 * @param delta   变动积分，支持负数
 * @param remark  备注
 * @param source  来源对象信息，如 { sourceType: 'PROJECT', sourceId }
 */
export const adjustStaffPoints = (
  staffId: string,
  delta: number,
  remark?: string,
  source?: { sourceType?: string; sourceId?: string; eventType?: string }
) => defHttp.post({ url: Api.pointsAdjust, params: { staffId, delta, remark, ...(source || {}) }, headers: { 'X-PERMISSION': 'staff:points:adjust' } });