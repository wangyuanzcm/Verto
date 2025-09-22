import { MockMethod } from 'vite-plugin-mock';
import { resultPageSuccess, resultSuccess } from './_util';

/**
 * 应用管理模拟数据
 */
const appList = [
  {
    id: '1',
    appName: 'Verto平台',
    appDescription: '企业级低代码开发平台，提供应用管理、项目管理、人员管理等功能',
    gitUrl: 'https://github.com/company/verto-platform.git',
    domain: 'platform',
    domain_dictText: '平台类',
    managers: ['admin', 'manager1'],
    managers_dictText: '管理员, 张三',
    status: '1',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:20:00',
    createBy: 'admin',
    updateBy: 'admin',
  },
  {
    id: '2',
    appName: '用户中心',
    appDescription: '统一用户认证和权限管理系统，支持SSO单点登录',
    gitUrl: 'https://github.com/company/user-center.git',
    domain: 'auth',
    domain_dictText: '认证类',
    managers: ['manager2'],
    managers_dictText: '李四',
    status: '1',
    createTime: '2024-01-10 09:15:00',
    updateTime: '2024-01-18 16:45:00',
    createBy: 'admin',
    updateBy: 'manager2',
  },
  {
    id: '3',
    appName: '数据分析平台',
    appDescription: '企业数据可视化分析平台，支持多维度数据展示和报表生成',
    gitUrl: 'https://github.com/company/data-analytics.git',
    domain: 'analytics',
    domain_dictText: '分析类',
    managers: ['analyst1', 'analyst2'],
    managers_dictText: '王五, 赵六',
    status: '1',
    createTime: '2024-01-05 11:20:00',
    updateTime: '2024-01-22 13:30:00',
    createBy: 'admin',
    updateBy: 'analyst1',
  },
  {
    id: '4',
    appName: '移动办公APP',
    appDescription: '企业移动办公应用，支持审批流程、考勤打卡、通讯录等功能',
    gitUrl: 'https://github.com/company/mobile-office.git',
    domain: 'mobile',
    domain_dictText: '移动类',
    managers: ['mobile_dev'],
    managers_dictText: '钱七',
    status: '0',
    createTime: '2023-12-20 15:45:00',
    updateTime: '2024-01-15 10:15:00',
    createBy: 'admin',
    updateBy: 'mobile_dev',
  },
  {
    id: '5',
    appName: '财务管理系统',
    appDescription: '企业财务管理系统，包含预算管理、费用报销、财务报表等模块',
    gitUrl: 'https://github.com/company/finance-system.git',
    domain: 'finance',
    domain_dictText: '财务类',
    managers: ['finance_manager'],
    managers_dictText: '孙八',
    status: '1',
    createTime: '2024-01-08 08:30:00',
    updateTime: '2024-01-25 17:20:00',
    createBy: 'admin',
    updateBy: 'finance_manager',
  },
];

/**
 * 用户列表数据（用于负责人选择）
 */
const userList = [
  { value: 'admin', text: '管理员', username: 'admin', realname: '管理员' },
  { value: 'manager1', text: '张三', username: 'manager1', realname: '张三' },
  { value: 'manager2', text: '李四', username: 'manager2', realname: '李四' },
  { value: 'analyst1', text: '王五', username: 'analyst1', realname: '王五' },
  { value: 'analyst2', text: '赵六', username: 'analyst2', realname: '赵六' },
  { value: 'mobile_dev', text: '钱七', username: 'mobile_dev', realname: '钱七' },
  { value: 'finance_manager', text: '孙八', username: 'finance_manager', realname: '孙八' },
];

/**
 * 领域字典数据
 */
const domainDict = [
  { value: 'platform', text: '平台类' },
  { value: 'auth', text: '认证类' },
  { value: 'analytics', text: '分析类' },
  { value: 'mobile', text: '移动类' },
  { value: 'finance', text: '财务类' },
  { value: 'hr', text: '人力资源' },
  { value: 'crm', text: '客户关系' },
  { value: 'oa', text: '办公自动化' },
];

export default [
  /**
   * 获取应用列表
   */
  {
    url: '/jeecgboot/appmanage/app/list',
    method: 'get',
    response: ({ query }) => {
      const { pageNo = 1, pageSize = 10, appName, domain } = query;
      let filteredList = [...appList];

      // 根据应用名称过滤
      if (appName) {
        filteredList = filteredList.filter(item => 
          item.appName.toLowerCase().includes(appName.toLowerCase())
        );
      }

      // 根据领域过滤
      if (domain) {
        filteredList = filteredList.filter(item => item.domain === domain);
      }

      // 分页处理
      const start = (pageNo - 1) * pageSize;
      const end = start + pageSize;
      const records = filteredList.slice(start, end);

      return resultPageSuccess(pageNo, pageSize, filteredList);
    },
  },

  /**
   * 根据ID查询应用详情
   */
  {
    url: '/jeecgboot/appmanage/app/queryById',
    method: 'get',
    response: ({ query }) => {
      const { id } = query;
      const app = appList.find(item => item.id === id);
      return resultSuccess(app);
    },
  },

  /**
   * 新增/编辑应用
   */
  {
    url: '/jeecgboot/appmanage/app/edit',
    method: 'put',
    response: ({ body }) => {
      const data = body;
      if (data.id) {
        // 编辑
        const index = appList.findIndex(item => item.id === data.id);
        if (index !== -1) {
          appList[index] = { ...appList[index], ...data, updateTime: new Date().toLocaleString() };
        }
      } else {
        // 新增
        const newApp = {
          ...data,
          id: String(appList.length + 1),
          createTime: new Date().toLocaleString(),
          updateTime: new Date().toLocaleString(),
          createBy: 'admin',
          updateBy: 'admin',
          status: '1',
        };
        appList.push(newApp);
      }
      return resultSuccess('操作成功');
    },
  },

  /**
   * 删除应用
   */
  {
    url: '/jeecgboot/appmanage/app/delete',
    method: 'delete',
    response: ({ query }) => {
      const { id } = query;
      const index = appList.findIndex(item => item.id === id);
      if (index !== -1) {
        appList.splice(index, 1);
      }
      return resultSuccess('删除成功');
    },
  },

  /**
   * 批量删除应用
   */
  {
    url: '/jeecgboot/appmanage/app/deleteBatch',
    method: 'delete',
    response: ({ body }) => {
      const { ids } = body;
      ids.forEach(id => {
        const index = appList.findIndex(item => item.id === id);
        if (index !== -1) {
          appList.splice(index, 1);
        }
      });
      return resultSuccess('批量删除成功');
    },
  },

  /**
   * 获取用户列表（用于负责人选择）
   */
  {
    url: '/jeecgboot/sys/user/list',
    method: 'get',
    response: () => {
      return resultSuccess(userList);
    },
  },

  /**
   * 获取领域字典
   */
  {
    url: '/jeecgboot/sys/dict/getDictItems/app_domain',
    method: 'get',
    response: () => {
      return resultSuccess(domainDict);
    },
  },
] as MockMethod[];