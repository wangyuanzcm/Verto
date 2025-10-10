import { MockMethod } from 'vite-plugin-mock';
import { resultError, resultSuccess, getRequestToken, requestParams } from './_util';

// 关联应用数据
const relatedAppsData = {
  '1': [
    {
      id: 'app_1_1',
      projectId: '1',
      appName: '智能办公前端',
      appCode: 'SMART_OFFICE_WEB',
      appType: 'WEB',
      gitUrl: 'https://github.com/company/smart-office-web.git',
      developer: 'zhangsan',
      developerText: '张三',
      tester: 'lisi',
      testerText: '李四',
      status: 'PRODUCTION',
      description: '智能办公系统前端应用',
      createTime: '2024-01-01 10:00:00',
      updateTime: '2024-01-15 16:30:00'
    },
    {
      id: 'app_1_2',
      projectId: '1',
      appName: '智能办公API',
      appCode: 'SMART_OFFICE_API',
      appType: 'API',
      gitUrl: 'https://github.com/company/smart-office-api.git',
      developer: 'zhangsan',
      developerText: '张三',
      tester: 'zhaoliu',
      testerText: '赵六',
      status: 'PRODUCTION',
      description: '智能办公系统后端API',
      createTime: '2024-01-01 10:00:00',
      updateTime: '2024-01-15 16:30:00'
    }
  ],
  '2': [
    {
      id: 'app_2_1',
      projectId: '2',
      appName: '电商前端',
      appCode: 'ECOMMERCE_WEB',
      appType: 'WEB',
      gitUrl: 'https://github.com/company/ecommerce-web.git',
      developer: 'lisi',
      developerText: '李四',
      tester: 'zhangsan',
      testerText: '张三',
      status: 'TESTING',
      description: '电商平台前端应用',
      createTime: '2024-02-01 09:00:00',
      updateTime: '2024-02-15 14:20:00'
    }
  ],
  '3': [
    {
      id: 'app_3_1',
      projectId: '3',
      appName: '移动端APP',
      appCode: 'MOBILE_APP_NATIVE',
      appType: 'MOBILE',
      gitUrl: 'https://github.com/company/mobile-app.git',
      developer: 'wangwu',
      developerText: '王五',
      tester: 'lisi',
      testerText: '李四',
      status: 'DEVELOPMENT',
      description: '企业级移动端原生应用',
      createTime: '2024-03-01 08:30:00',
      updateTime: '2024-03-10 11:45:00'
    }
  ]
};

// Git分支数据
const gitBranchesData = {
  '1': [
    { name: 'main', type: 'main', lastCommit: '2024-01-15 16:30:00', author: 'zhangsan' },
    { name: 'develop', type: 'develop', lastCommit: '2024-01-14 14:20:00', author: 'lisi' },
    { name: 'feature-REQ-2024-001', type: 'feature', lastCommit: '2024-01-13 10:15:00', author: 'zhangsan' }
  ],
  '2': [
    { name: 'main', type: 'main', lastCommit: '2024-02-15 14:20:00', author: 'lisi' },
    { name: 'develop', type: 'develop', lastCommit: '2024-02-14 11:30:00', author: 'wangwu' },
    { name: 'feature-ecommerce-upgrade', type: 'feature', lastCommit: '2024-02-13 09:45:00', author: 'lisi' }
  ],
  '3': [
    { name: 'main', type: 'main', lastCommit: '2024-03-10 11:45:00', author: 'wangwu' },
    { name: 'develop', type: 'develop', lastCommit: '2024-03-09 15:20:00', author: 'zhaoliu' },
    { name: 'feature-mobile-app-v1', type: 'feature', lastCommit: '2024-03-08 13:10:00', author: 'wangwu' }
  ]
};

// 应用配置数据（移除流水线配置）
const appConfigData = {
  '1': {
    trackingConfig: {
      events: [
        {
          name: 'user_login',
          description: '用户登录事件',
          enabled: true,
          parameters: ['userId', 'loginTime', 'deviceType']
        },
        {
          name: 'document_upload',
          description: '文档上传事件',
          enabled: true,
          parameters: ['documentId', 'fileSize', 'uploadTime']
        }
      ]
    }
  },
  '2': {
    trackingConfig: {
      events: [
        {
          name: 'product_view',
          description: '商品浏览事件',
          enabled: true,
          parameters: ['productId', 'viewTime', 'userId']
        },
        {
          name: 'add_to_cart',
          description: '添加到购物车事件',
          enabled: true,
          parameters: ['productId', 'quantity', 'userId']
        }
      ]
    }
  },
  '3': {
    trackingConfig: {
      events: [
        {
          name: 'app_launch',
          description: '应用启动事件',
          enabled: true,
          parameters: ['userId', 'launchTime', 'version']
        },
        {
          name: 'feature_usage',
          description: '功能使用事件',
          enabled: true,
          parameters: ['featureId', 'usageTime', 'userId']
        }
      ]
    }
  }
};

// 项目时间线数据
const projectTimelineData = {
  '1': [
    {
      id: 'timeline_1_1',
      projectId: '1',
      name: '需求分析',
      type: 'requirement',
      plannedTime: '2024-01-01 09:00:00',
      actualTime: '2024-01-01 09:00:00',
      status: 'completed',
      description: '完成智能办公系统需求分析',
      responsible: 'zhangsan',
      responsibleName: '张三'
    },
    {
      id: 'timeline_1_2',
      projectId: '1',
      name: '开发阶段',
      type: 'development',
      plannedTime: '2024-01-15 09:00:00',
      actualTime: '2024-01-15 09:00:00',
      status: 'completed',
      description: '完成核心功能开发',
      responsible: 'zhangsan',
      responsibleName: '张三'
    }
  ],
  '2': [
    {
      id: 'timeline_2_1',
      projectId: '2',
      name: '需求分析',
      type: 'requirement',
      plannedTime: '2024-02-01 09:00:00',
      actualTime: '2024-02-01 09:00:00',
      status: 'completed',
      description: '完成电商平台升级需求分析',
      responsible: 'lisi',
      responsibleName: '李四'
    },
    {
      id: 'timeline_2_2',
      projectId: '2',
      name: '开发阶段',
      type: 'development',
      plannedTime: '2024-02-15 09:00:00',
      actualTime: '2024-02-15 09:00:00',
      status: 'in_progress',
      description: '正在进行架构升级开发',
      responsible: 'lisi',
      responsibleName: '李四'
    }
  ],
  '3': [
    {
      id: 'timeline_3_1',
      projectId: '3',
      name: '需求分析',
      type: 'requirement',
      plannedTime: '2024-03-01 09:00:00',
      actualTime: '2024-03-01 09:00:00',
      status: 'completed',
      description: '完成移动端APP需求分析',
      responsible: 'wangwu',
      responsibleName: '王五'
    },
    {
      id: 'timeline_3_2',
      projectId: '3',
      name: '开发阶段',
      type: 'development',
      plannedTime: '2024-03-15 09:00:00',
      actualTime: '2024-03-15 09:00:00',
      status: 'in_progress',
      description: '正在进行移动端开发',
      responsible: 'wangwu',
      responsibleName: '王五'
    }
  ]
};

// 项目管理模拟数据（需求管理）
const projectList = [
  {
    id: '1',
    projectType: 'requirement',
    requirementId: 'REQ-2024-001',
    bugId: null,
    title: '智能办公系统需求',
    description: '基于AI的智能办公管理系统需求开发',
    relatedAppId: 'app_1_1',
    relatedAppName: '智能办公前端',
    developerId: 'zhangsan',
    developerName: '张三',
    designLinks: [
      {
        id: 'design_1_1',
        title: '智能办公系统原型',
        url: 'https://axure.com/smart-office-prototype',
        type: 'prototype'
      },
      {
        id: 'design_1_2',
        title: 'UI设计稿',
        url: 'https://figma.com/smart-office-design',
        type: 'design'
      }
    ],
    startTime: '2024-01-01 10:00:00',
    testTime: '2024-07-15 09:00:00',
    onlineTime: '2024-08-28 16:00:00',
    releaseTime: '2024-09-01 10:00:00',
    status: 'released',
    gitBranch: 'feature-REQ-2024-001',
    appConfig: appConfigData['1'],
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-15 16:30:00'
  },
  {
    id: '2',
    projectType: 'requirement',
    requirementId: 'REQ-2024-002',
    bugId: null,
    title: '电商平台升级需求',
    description: '电商平台技术架构升级改造需求',
    relatedAppId: 'app_2_1',
    relatedAppName: '电商前端',
    developerId: 'lisi',
    developerName: '李四',
    designLinks: [
      {
        id: 'design_2_1',
        title: '电商升级原型',
        url: 'https://axure.com/ecommerce-upgrade-prototype',
        type: 'prototype'
      }
    ],
    startTime: '2024-02-01 09:00:00',
    testTime: '2024-06-15 14:00:00',
    onlineTime: null,
    releaseTime: null,
    status: 'testing',
    gitBranch: 'feature-ecommerce-upgrade',
    appConfig: appConfigData['2'],
    createTime: '2024-02-01 09:00:00',
    updateTime: '2024-02-15 14:20:00'
  },
  {
    id: '3',
    projectType: 'requirement',
    requirementId: 'REQ-2024-003',
    bugId: null,
    title: '移动端APP开发需求',
    description: '企业级移动端应用开发需求',
    relatedAppId: 'app_3_1',
    relatedAppName: '移动端APP',
    developerId: 'wangwu',
    developerName: '王五',
    designLinks: [
      {
        id: 'design_3_1',
        title: '移动端UI设计',
        url: 'https://figma.com/mobile-app-design',
        type: 'design'
      }
    ],
    startTime: '2024-03-01 08:30:00',
    testTime: '2024-08-15 10:00:00',
    onlineTime: null,
    releaseTime: null,
    status: 'developing',
    gitBranch: 'feature-mobile-app-v1',
    appConfig: appConfigData['3'],
    createTime: '2024-03-01 08:30:00',
    updateTime: '2024-03-10 11:45:00'
  },
  {
    id: '4',
    projectType: 'bug',
    requirementId: null,
    bugId: 'BUG-2024-001',
    title: '数据分析平台BUG修复',
    description: '数据分析平台性能优化和BUG修复',
    relatedAppId: 'app_4_1',
    relatedAppName: '数据分析平台',
    developerId: 'zhaoliu',
    developerName: '赵六',
    designLinks: [],
    startTime: '2024-04-01 09:00:00',
    testTime: null,
    onlineTime: null,
    releaseTime: null,
    status: 'planning',
    gitBranch: null,
    appConfig: null,
    createTime: '2024-04-01 09:00:00',
    updateTime: '2024-04-01 09:00:00'
  }
];

// 项目统计数据
const projectStats = {
  total: 15,
  active: 12,
  inactive: 3,
  building: 2,
  success: 8,
  failed: 2
};

export default [
  /**
   * 获取相关应用列表
   */
  {
    url: '/jeecgboot/project/related-apps',
    method: 'get',
    response: () => {
      return resultSuccess(relatedAppsData);
    },
  },

  /**
   * 获取Git分支列表
   */
  {
    url: '/jeecgboot/project/git/branches',
    method: 'get',
    response: ({ query }) => {
      const { projectId } = query;
      const branches = gitBranchesData[projectId] || [];
      return resultSuccess(branches);
    },
  },

  /**
   * 获取应用配置
   */
  {
    url: '/jeecgboot/project/app/config',
    method: 'get',
    response: ({ query }) => {
      const { projectId } = query;
      const config = appConfigData[projectId];
      if (config) {
        return resultSuccess(config);
      }
      return resultError('配置不存在');
    },
  },

  /**
   * 保存应用配置
   */
  {
    url: '/jeecgboot/project/app/config',
    method: 'post',
    response: ({ body }) => {
      const { projectId, config } = body;
      if (projectId && config) {
        appConfigData[projectId] = config;
        return resultSuccess('配置保存成功');
      }
      return resultError('参数错误');
    },
  },

  /**
   * 获取项目时间线
   */
  {
    url: '/jeecgboot/project/timeline',
    method: 'get',
    response: ({ query }) => {
      const { projectId } = query;
      const timeline = projectTimelineData[projectId] || [];
      return resultSuccess(timeline);
    },
  },

  /**
   * 获取项目列表
   */
  {
    url: '/jeecgboot/project/list',
    method: 'get',
    response: ({ query }) => {
      const { pageNo = 1, pageSize = 10, name, status, type } = query;
      let filteredProjects = [...projectList];

      // 根据名称过滤
      if (name) {
        filteredProjects = filteredProjects.filter(project => 
          project.title.toLowerCase().includes(name.toLowerCase()) ||
          project.description.toLowerCase().includes(name.toLowerCase())
        );
      }

      // 根据状态过滤
      if (status) {
        filteredProjects = filteredProjects.filter(project => project.status === status);
      }

      // 根据类型过滤
      if (type) {
        filteredProjects = filteredProjects.filter(project => project.projectType === type);
      }

      // 分页处理
      const start = (pageNo - 1) * pageSize;
      const end = start + pageSize;
      const records = filteredProjects.slice(start, end);

      return resultSuccess({
        records,
        total: filteredProjects.length,
        size: pageSize,
        current: pageNo,
        pages: Math.ceil(filteredProjects.length / pageSize)
      });
    },
  },

  /**
   * 获取项目详情
   */
  {
    url: /\/jeecgboot\/project\/queryById/,
    method: 'get',
    response: ({ query }) => {
      const { id } = query;
      const project = projectList.find(p => p.id === id);
      if (project) {
        return resultSuccess(project);
      }
      return resultError('项目不存在');
    },
  },

  /**
   * 新增项目
   */
  {
    url: '/jeecgboot/project/add',
    method: 'post',
    response: ({ body }) => {
      const newProject = {
        id: Date.now().toString(),
        createTime: new Date().toLocaleString(),
        updateTime: new Date().toLocaleString(),
        ...body
      };
      projectList.unshift(newProject);
      return resultSuccess('添加成功');
    },
  },

  /**
   * 编辑项目
   */
  {
    url: '/jeecgboot/project/edit',
    method: 'put',
    response: ({ body }) => {
      const { id } = body;
      const index = projectList.findIndex(p => p.id === id);
      if (index !== -1) {
        projectList[index] = {
          ...projectList[index],
          ...body,
          updateTime: new Date().toLocaleString()
        };
        return resultSuccess('编辑成功');
      }
      return resultError('项目不存在');
    },
  },

  /**
   * 删除项目
   */
  {
    url: /\/jeecgboot\/project\/delete/,
    method: 'delete',
    response: ({ query }) => {
      const { id } = query;
      const index = projectList.findIndex(p => p.id === id);
      if (index !== -1) {
        projectList.splice(index, 1);
        return resultSuccess('删除成功');
      }
      return resultError('项目不存在');
    },
  },

  /**
   * 批量删除项目
   */
  {
    url: '/jeecgboot/project/deleteBatch',
    method: 'delete',
    response: ({ body }) => {
      const { ids } = body;
      ids.forEach(id => {
        const index = projectList.findIndex(p => p.id === id);
        if (index !== -1) {
          projectList.splice(index, 1);
        }
      });
      return resultSuccess('批量删除成功');
    },
  },

  /**
   * 导入项目
   */
  {
    url: '/jeecgboot/project/importExcel',
    method: 'post',
    response: () => {
      return resultSuccess('导入成功');
    },
  },

  /**
   * 导出项目
   */
  {
    url: '/jeecgboot/project/exportXls',
    method: 'get',
    response: () => {
      return resultSuccess('导出成功');
    },
  },

  /**
   * 获取项目统计
   */
  {
    url: '/jeecgboot/project/statistics',
    method: 'get',
    response: () => {
      return resultSuccess(projectStats);
    },
  },

  /**
   * 获取应用列表（用于项目关联）
   */
  {
    url: '/jeecgboot/appmanage/app/list',
    method: 'get',
    response: ({ query }) => {
      const { pageNo = 1, pageSize = 10 } = query;
      const allApps = Object.values(relatedAppsData).flat();
      const start = (pageNo - 1) * pageSize;
      const end = start + pageSize;
      const records = allApps.slice(start, end);

      return resultSuccess({
        records,
        total: allApps.length,
        size: pageSize,
        current: pageNo,
        pages: Math.ceil(allApps.length / pageSize)
      });
    },
  },

  /**
   * 获取用户列表（用于项目成员）
   */
  {
    url: '/jeecgboot/sys/user/list',
    method: 'get',
    response: ({ query }) => {
      const { pageNo = 1, pageSize = 10 } = query;
      const users = [
        { id: '1', username: 'admin', realname: '管理员', email: 'admin@example.com' },
        { id: '2', username: 'zhangsan', realname: '张三', email: 'zhangsan@example.com' },
        { id: '3', username: 'lisi', realname: '李四', email: 'lisi@example.com' },
        { id: '4', username: 'wangwu', realname: '王五', email: 'wangwu@example.com' }
      ];

      const start = (pageNo - 1) * pageSize;
      const end = start + pageSize;
      const records = users.slice(start, end);

      return resultSuccess({
        records,
        total: users.length,
        size: pageSize,
        current: pageNo,
        pages: Math.ceil(users.length / pageSize)
      });
    },
  },
] as MockMethod[];