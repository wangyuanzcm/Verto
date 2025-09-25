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
  totalProjects: 4,
  activeProjects: 2,
  completedProjects: 1,
  pausedProjects: 0,
  planningProjects: 1,
  avgProgress: 45,
  totalEstimatedHours: 7000,
  totalActualHours: 3400,
  onTimeRate: 75,
  delayedRate: 25
};

export default [
  // 获取项目列表
  {
    url: '/jeecgboot/project/list',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { pageNo = 1, pageSize = 10, projectName, projectCode, status, projectManager } = query;
      let filteredList = [...projectList];
      
      // 根据需求名称过滤
      if (projectName) {
        filteredList = filteredList.filter(item => 
          item.title.includes(projectName)
        );
      }
      
      // 根据需求编码过滤
      if (projectCode) {
        filteredList = filteredList.filter(item => 
          (item.requirementId && item.requirementId.includes(projectCode)) ||
          (item.bugId && item.bugId.includes(projectCode))
        );
      }
      
      // 根据需求状态过滤
      if (status) {
        filteredList = filteredList.filter(item => 
          item.status === status
        );
      }
      
      // 根据项目经理过滤
      if (projectManager) {
        filteredList = filteredList.filter(item => 
          item.developerName === projectManager
        );
      }
      
      const start = (pageNo - 1) * pageSize;
      const end = start + parseInt(pageSize);
      const records = filteredList.slice(start, end);
      
      return resultSuccess({
        records,
        total: filteredList.length,
        size: pageSize,
        current: pageNo,
        pages: Math.ceil(filteredList.length / pageSize)
      });
    }
  },

  // 获取项目详情
  {
    url: '/jeecgboot/project/detail',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { id } = query;
      const project = projectList.find(item => item.id === id);
      if (project) {
        return resultSuccess({
          ...project,
          relatedApps: relatedAppsData[id] || [],
          timeline: projectTimelineData[id] || [],
          gitBranches: gitBranchesData[id] || []
        });
      }
      return resultError('项目不存在');
    }
  },

  // 创建项目
  {
    url: '/jeecgboot/project/add',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const newProject = {
        id: String(Date.now()),
        ...body,
        createTime: new Date().toLocaleString('zh-CN'),
        updateTime: new Date().toLocaleString('zh-CN')
      };
      projectList.push(newProject);
      return resultSuccess(newProject);
    }
  },

  // 更新项目
  {
    url: '/jeecgboot/project/edit',
    timeout: 200,
    method: 'put',
    response: ({ body }) => {
      const { id } = body;
      const index = projectList.findIndex(item => item.id === id);
      if (index !== -1) {
        projectList[index] = {
          ...projectList[index],
          ...body,
          updateTime: new Date().toLocaleString('zh-CN')
        };
        return resultSuccess(projectList[index]);
      }
      return resultError('项目不存在');
    }
  },

  // 删除项目
  {
    url: '/jeecgboot/project/delete',
    timeout: 200,
    method: 'delete',
    response: ({ query }) => {
      const { ids } = query;
      const idList = ids.split(',');
      idList.forEach(id => {
        const index = projectList.findIndex(item => item.id === id);
        if (index !== -1) {
          projectList.splice(index, 1);
        }
      });
      return resultSuccess('删除成功');
    }
  },

  // 获取项目统计
  {
    url: '/jeecgboot/project/stats',
    timeout: 200,
    method: 'get',
    response: () => {
      return resultSuccess(projectStats);
    }
  },

  // 获取关联应用列表
  {
    url: '/jeecgboot/project/apps',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { projectId } = query;
      const apps = relatedAppsData[projectId] || [];
      return resultSuccess(apps);
    }
  },

  // 获取Git分支列表
  {
    url: '/jeecgboot/project/git/branches',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { projectId } = query;
      const branches = gitBranchesData[projectId] || [];
      return resultSuccess(branches);
    }
  },

  // 创建Git分支
  {
    url: '/jeecgboot/project/git/branch/create',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const { projectId, branchName, fromBranch, type } = body;
      if (!gitBranchesData[projectId]) {
        gitBranchesData[projectId] = [];
      }
      const newBranch = {
        name: branchName,
        type: type || 'feature',
        lastCommit: new Date().toLocaleString('zh-CN'),
        author: 'current_user'
      };
      gitBranchesData[projectId].push(newBranch);
      return resultSuccess('分支创建成功');
    }
  },

  // 删除Git分支
  {
    url: '/jeecgboot/project/git/branch/delete',
    timeout: 200,
    method: 'delete',
    response: ({ body }) => {
      const { projectId, branchName } = body;
      if (gitBranchesData[projectId]) {
        const index = gitBranchesData[projectId].findIndex(branch => branch.name === branchName);
        if (index !== -1) {
          gitBranchesData[projectId].splice(index, 1);
          return resultSuccess('分支删除成功');
        }
      }
      return resultError('分支不存在');
    }
  }
] as MockMethod[];