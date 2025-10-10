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

/**
 * package.json 模拟数据
 */
const packageJsonData = {
  '1': {
    name: 'verto-platform',
    version: '1.0.0',
    dependencies: {
      'vue': '^3.4.21',
      '@vue/runtime-core': '^3.4.21',
      'vue-router': '^4.3.0',
      'pinia': '^2.1.7',
      'ant-design-vue': '^4.1.2',
      '@ant-design/icons-vue': '^7.0.1',
      'axios': '^1.6.8',
      'dayjs': '^1.11.10',
      'lodash-es': '^4.17.21',
      'vite': '^5.2.0',
      'typescript': '^5.4.3'
    },
    devDependencies: {
      '@vitejs/plugin-vue': '^5.0.4',
      '@typescript-eslint/eslint-plugin': '^7.2.0',
      '@typescript-eslint/parser': '^7.2.0',
      'eslint': '^8.57.0',
      'eslint-plugin-vue': '^9.22.0',
      'prettier': '^3.2.5',
      'vite-plugin-mock': '^3.0.1',
      'vitest': '^1.4.0',
      '@vue/test-utils': '^2.4.5'
    },
    peerDependencies: {
      'vue': '^3.4.0'
    }
  },
  '2': {
    name: 'user-center',
    version: '2.1.0',
    dependencies: {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'react-router-dom': '^6.10.0',
      '@reduxjs/toolkit': '^2.2.1',
      'react-redux': '^9.1.0',
      'antd': '^5.15.3',
      '@ant-design/icons': '^5.3.6',
      'axios': '^1.6.8',
      'moment': '^2.30.1',
      'classnames': '^2.5.1'
    },
    devDependencies: {
      '@types/react': '^18.2.66',
      '@types/react-dom': '^18.2.22',
      '@vitejs/plugin-react': '^4.2.1',
      'vite': '^5.2.0',
      'typescript': '^5.2.2',
      'eslint': '^8.57.0',
      '@typescript-eslint/eslint-plugin': '^7.2.0',
      '@typescript-eslint/parser': '^7.2.0',
      'eslint-plugin-react-hooks': '^4.6.0',
      'eslint-plugin-react-refresh': '^0.4.6'
    },
    peerDependencies: {
      'react': '^18.0.0',
      'react-dom': '^18.0.0'
    }
  },
  '3': {
    name: 'data-analytics',
    version: '1.5.2',
    dependencies: {
      'vue': '^3.4.21',
      'vue-router': '^4.3.0',
      'pinia': '^2.1.7',
      'element-plus': '^2.6.1',
      '@element-plus/icons-vue': '^2.3.1',
      'echarts': '^5.5.0',
      'vue-echarts': '^6.6.9',
      'd3': '^7.9.0',
      'axios': '^1.6.8',
      'dayjs': '^1.11.10',
      'xlsx': '^0.18.5'
    },
    devDependencies: {
      '@vitejs/plugin-vue': '^5.0.4',
      'vite': '^5.2.0',
      'typescript': '^5.4.3',
      '@types/d3': '^7.4.3',
      'sass': '^1.72.0',
      'unplugin-auto-import': '^0.17.5',
      'unplugin-vue-components': '^0.26.0'
    },
    optionalDependencies: {
      'canvas': '^2.11.2'
    }
  },
  '4': {
    name: 'mobile-office',
    version: '0.8.1',
    dependencies: {
      'react-native': '^0.73.6',
      'react': '^18.2.0',
      '@react-navigation/native': '^6.1.16',
      '@react-navigation/stack': '^6.3.28',
      '@react-navigation/bottom-tabs': '^6.5.17',
      'react-native-screens': '^3.29.0',
      'react-native-safe-area-context': '^4.9.0',
      'react-native-vector-icons': '^10.0.3',
      'react-native-async-storage': '^1.23.1',
      'react-native-image-picker': '^7.1.0',
      'react-native-permissions': '^4.1.5'
    },
    devDependencies: {
      '@babel/core': '^7.20.0',
      '@babel/preset-env': '^7.20.0',
      '@babel/runtime': '^7.20.0',
      '@react-native/babel-preset': '^0.73.21',
      '@react-native/eslint-config': '^0.73.2',
      '@react-native/metro-config': '^0.73.5',
      '@react-native/typescript-config': '^0.73.1',
      '@types/react': '^18.2.6',
      '@types/react-test-renderer': '^18.0.0',
      'babel-jest': '^29.6.3',
      'eslint': '^8.19.0',
      'jest': '^29.6.3',
      'metro-react-native-babel-preset': '^0.76.8',
      'prettier': '^2.8.8',
      'react-test-renderer': '^18.2.0',
      'typescript': '^5.0.4'
    }
  },
  '5': {
    name: 'finance-system',
    version: '3.2.1',
    dependencies: {
      'express': '^4.19.2',
      'mongoose': '^8.2.4',
      'jsonwebtoken': '^9.0.2',
      'bcryptjs': '^2.4.3',
      'cors': '^2.8.5',
      'helmet': '^7.1.0',
      'express-rate-limit': '^7.2.0',
      'joi': '^17.12.2',
      'multer': '^1.4.5-lts.1',
      'nodemailer': '^6.9.13',
      'winston': '^3.12.0',
      'moment': '^2.30.1'
    },
    devDependencies: {
      '@types/node': '^20.11.30',
      '@types/express': '^4.17.21',
      '@types/bcryptjs': '^2.4.6',
      '@types/cors': '^2.8.17',
      '@types/jsonwebtoken': '^9.0.6',
      '@types/multer': '^1.4.11',
      '@types/nodemailer': '^6.4.14',
      'typescript': '^5.4.3',
      'ts-node': '^10.9.2',
      'nodemon': '^3.1.0',
      'jest': '^29.7.0',
      '@types/jest': '^29.5.12',
      'supertest': '^6.3.4',
      '@types/supertest': '^6.0.2'
    },
    peerDependencies: {
      'node': '>=18.0.0'
    }
  }
};

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

  /**
   * 获取应用的 package.json 内容
   */
  {
    url: '/jeecgboot/appmanage/app/package-json',
    method: 'get',
    response: ({ query }) => {
      const { appId } = query;
      const packageData = packageJsonData[appId];
      
      if (packageData) {
        return resultSuccess(packageData);
      } else {
        return {
          success: false,
          message: '未找到该应用的 package.json 信息',
          code: 404,
          result: null,
          timestamp: Date.now(),
        };
      }
    },
  },
] as MockMethod[];