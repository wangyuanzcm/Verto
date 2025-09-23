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
      pipelineUrl: 'https://jenkins.example.com/job/smart-office-web',
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
      developer: 'wangwu',
      developerText: '王五',
      tester: 'zhaoliu',
      testerText: '赵六',
      status: 'PRODUCTION',
      pipelineUrl: 'https://jenkins.example.com/job/smart-office-api',
      description: '智能办公系统后端API服务',
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
      pipelineUrl: 'https://jenkins.example.com/job/ecommerce-web',
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
      pipelineUrl: 'https://jenkins.example.com/job/mobile-app',
      description: '企业级移动端原生应用',
      createTime: '2024-03-01 08:30:00',
      updateTime: '2024-03-10 11:45:00'
    }
  ]
};

// 时间节点数据
const timelineData = {
  '1': [
    {
      id: 'timeline_1_1',
      projectId: '1',
      title: '需求分析',
      description: '完成需求调研和分析文档',
      planTime: '2024-01-15',
      actualTime: '2024-01-12',
      owner: 'zhangsan',
      ownerText: '张三',
      status: 'COMPLETED',
      priority: 'HIGH',
      createTime: '2024-01-01 10:00:00'
    },
    {
      id: 'timeline_1_2',
      projectId: '1',
      title: '技术方案设计',
      description: '完成技术架构设计和技术选型',
      planTime: '2024-02-01',
      actualTime: '2024-01-28',
      owner: 'lisi',
      ownerText: '李四',
      status: 'COMPLETED',
      priority: 'HIGH',
      createTime: '2024-01-01 10:00:00'
    },
    {
      id: 'timeline_1_3',
      projectId: '1',
      title: '开发阶段',
      description: '完成核心功能开发',
      planTime: '2024-06-01',
      actualTime: '2024-05-28',
      owner: 'wangwu',
      ownerText: '王五',
      status: 'COMPLETED',
      priority: 'HIGH',
      createTime: '2024-01-01 10:00:00'
    },
    {
      id: 'timeline_1_4',
      projectId: '1',
      title: '测试阶段',
      description: '完成系统测试和用户验收测试',
      planTime: '2024-08-01',
      actualTime: '2024-07-25',
      owner: 'zhaoliu',
      ownerText: '赵六',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      createTime: '2024-01-01 10:00:00'
    },
    {
      id: 'timeline_1_5',
      projectId: '1',
      title: '上线部署',
      description: '完成生产环境部署和上线',
      planTime: '2024-09-01',
      actualTime: '2024-08-28',
      owner: 'zhangsan',
      ownerText: '张三',
      status: 'COMPLETED',
      priority: 'URGENT',
      createTime: '2024-01-01 10:00:00'
    }
  ],
  '2': [
    {
      id: 'timeline_2_1',
      projectId: '2',
      title: '需求梳理',
      description: '梳理升级需求和现有系统分析',
      planTime: '2024-02-15',
      actualTime: '2024-02-12',
      owner: 'lisi',
      ownerText: '李四',
      status: 'COMPLETED',
      priority: 'HIGH',
      createTime: '2024-02-01 09:00:00'
    },
    {
      id: 'timeline_2_2',
      projectId: '2',
      title: '架构升级',
      description: '完成技术架构升级改造',
      planTime: '2024-05-01',
      actualTime: null,
      owner: 'wangwu',
      ownerText: '王五',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      createTime: '2024-02-01 09:00:00'
    },
    {
      id: 'timeline_2_3',
      projectId: '2',
      title: '功能测试',
      description: '完成升级后的功能测试',
      planTime: '2024-07-01',
      actualTime: null,
      owner: 'zhangsan',
      ownerText: '张三',
      status: 'PENDING',
      priority: 'MEDIUM',
      createTime: '2024-02-01 09:00:00'
    }
  ],
  '3': [
    {
      id: 'timeline_3_1',
      projectId: '3',
      title: 'UI设计',
      description: '完成移动端UI设计稿',
      planTime: '2024-03-15',
      actualTime: '2024-03-18',
      owner: 'lisi',
      ownerText: '李四',
      status: 'DELAYED',
      priority: 'MEDIUM',
      createTime: '2024-03-01 08:30:00'
    },
    {
      id: 'timeline_3_2',
      projectId: '3',
      title: '原型开发',
      description: '完成核心功能原型开发',
      planTime: '2024-05-01',
      actualTime: null,
      owner: 'wangwu',
      ownerText: '王五',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      createTime: '2024-03-01 08:30:00'
    }
  ]
};

// 项目管理模拟数据（需求管理）
const projectList = [
  {
    id: '1',
    projectName: '智能办公系统需求',
    projectCode: 'REQ_SMART_OFFICE',
    projectDescription: '基于AI的智能办公管理系统需求开发',
    projectType: 'WEB',
    status: 'DEPLOYED',
    priority: 'HIGH',
    
    // 任务类型和ID
    taskType: 'REQUIREMENT',
    requirementId: 'REQ-2024-001',
    bugId: null,
    
    // 需求相关链接
    zentaoUrl: 'https://zentao.example.com/story-view-1001.html',
    uiDesignUrl: 'https://figma.com/smart-office-design',
    prototypeUrl: 'https://axure.com/smart-office-prototype',
    designDocUrl: 'https://confluence.example.com/smart-office-design-doc',
    
    // Git分支管理
    branchCreateMode: 'AUTO',
    gitBranches: [
      {
        id: 'branch_1_1',
        branchName: 'feature-REQ-2024-001',
        branchType: 'FEATURE',
        status: 'MERGED',
        createTime: '2024-01-02 09:00:00',
        mergeTime: '2024-08-25 16:00:00',
        developer: 'zhangsan',
        developerText: '张三'
      },
      {
        id: 'branch_1_2',
        branchName: 'hotfix-REQ-2024-001-fix',
        branchType: 'HOTFIX',
        status: 'ACTIVE',
        createTime: '2024-09-01 10:00:00',
        mergeTime: null,
        developer: 'lisi',
        developerText: '李四'
      }
    ],
    
    // 开发模式和配置
    developmentMode: 'L1',
    templateId: null,
    configData: null,
    
    // 时间节点
    startDate: '2024-01-01',
    testDate: '2024-07-15',
    onlineDate: '2024-08-28',
    releaseDate: '2024-09-01',
    endDate: '2024-12-31',
    
    // 人员配置
    projectManager: 'zhangsan',
    projectManagerText: '张三',
    teamMembers: ['zhangsan', 'lisi', 'wangwu', 'zhaoliu'],
    teamMembersText: '张三,李四,王五,赵六',
    
    // 关联应用
    relatedApps: relatedAppsData['1'],
    // 时间节点
    timeline: timelineData['1'],

    // 项目配置 项目信息
    gitUrl: 'https://github.com/company/smart-office',
    gitBranch: 'main',
    version: 'v2.1.0',
    progress: 85,
    estimatedHours: 2000,
    actualHours: 1800,
    techStack: ['Vue3', 'TypeScript', 'Java', 'Spring Boot', 'MySQL'],
    techStackText: 'Vue3,TypeScript,Java,Spring Boot,MySQL',
    environment: {
      dev: 'https://dev.smart-office.com',
      test: 'https://test.smart-office.com',
      prod: 'https://smart-office.com'
    },
    createBy: 'admin',
    createTime: '2024-01-01 10:00:00',
    updateBy: 'admin',
    updateTime: '2024-01-15 16:30:00'
  },
  {
    id: '2',
    projectName: '电商平台升级需求',
    projectCode: 'REQ_ECOMMERCE_UPGRADE',
    projectDescription: '电商平台技术架构升级改造需求',
    projectType: 'WEB',
    status: 'TESTING',
    priority: 'MEDIUM',
    
    // 任务类型和ID
    taskType: 'REQUIREMENT',
    requirementId: 'REQ-2024-002',
    bugId: null,
    
    // 需求相关链接
    zentaoUrl: 'https://zentao.example.com/story-view-1002.html',
    uiDesignUrl: 'https://figma.com/ecommerce-upgrade-design',
    prototypeUrl: 'https://axure.com/ecommerce-upgrade-prototype',
    designDocUrl: 'https://confluence.example.com/ecommerce-upgrade-design-doc',
    
    // Git分支管理
    branchCreateMode: 'MANUAL',
    gitBranches: [
      {
        id: 'branch_2_1',
        branchName: 'feature-ecommerce-upgrade',
        branchType: 'FEATURE',
        status: 'ACTIVE',
        createTime: '2024-02-02 10:00:00',
        mergeTime: null,
        developer: 'lisi',
        developerText: '李四'
      }
    ],
    
    // 开发模式和配置
    developmentMode: 'L2',
    templateId: 'TEMPLATE_001',
    configData: {
      framework: 'React',
      database: 'MongoDB',
      deployment: 'Docker'
    },
    
    // 时间节点
    startDate: '2024-02-01',
    testDate: '2024-06-15',
    onlineDate: null,
    releaseDate: null,
    endDate: '2024-08-31',
    
    // 人员配置
    projectManager: 'lisi',
    projectManagerText: '李四',
    teamMembers: ['lisi', 'wangwu', 'zhangsan'],
    teamMembersText: '李四,王五,张三',
    
    // 关联应用
    relatedApps: relatedAppsData['2'],
    // 时间节点
    timeline: timelineData['2'],

    // 项目配置 项目信息
    gitUrl: 'https://github.com/company/ecommerce-upgrade',
    gitBranch: 'develop',
    version: 'v1.5.0',
    progress: 60,
    estimatedHours: 1500,
    actualHours: 1200,
    techStack: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
    techStackText: 'React,TypeScript,Node.js,MongoDB',
    environment: {
      dev: 'https://dev.ecommerce.com',
      test: 'https://test.ecommerce.com',
      prod: 'https://ecommerce.com'
    },
    createBy: 'admin',
    createTime: '2024-02-01 09:00:00',
    updateBy: 'admin',
    updateTime: '2024-02-15 14:20:00'
  },
  {
    id: '3',
    projectName: '移动端APP开发需求',
    projectCode: 'REQ_MOBILE_APP',
    projectDescription: '企业级移动端应用开发需求',
    projectType: 'MOBILE',
    status: 'DEVELOPING',
    priority: 'LOW',
    
    // 任务类型和ID
    taskType: 'REQUIREMENT',
    requirementId: 'REQ-2024-003',
    bugId: null,
    
    // 需求相关链接
    zentaoUrl: 'https://zentao.example.com/story-view-1003.html',
    uiDesignUrl: 'https://figma.com/mobile-app-design',
    prototypeUrl: 'https://axure.com/mobile-app-prototype',
    designDocUrl: 'https://confluence.example.com/mobile-app-design-doc',
    
    // Git分支管理
    branchCreateMode: 'AUTO',
    gitBranches: [
      {
        id: 'branch_3_1',
        branchName: 'feature-mobile-app-v1',
        branchType: 'FEATURE',
        status: 'ACTIVE',
        createTime: '2024-03-02 08:30:00',
        mergeTime: null,
        developer: 'wangwu',
        developerText: '王五'
      }
    ],
    
    // 开发模式和配置
    developmentMode: 'L3',
    templateId: 'TEMPLATE_002',
    configData: {
      platform: 'React Native',
      targetOS: ['iOS', 'Android'],
      minVersion: '12.0'
    },
    
    // 时间节点
    startDate: '2024-03-01',
    testDate: '2024-08-15',
    onlineDate: null,
    releaseDate: null,
    endDate: '2024-10-31',
    
    // 人员配置
    projectManager: 'wangwu',
    projectManagerText: '王五',
    teamMembers: ['wangwu', 'lisi', 'zhaoliu'],
    teamMembersText: '王五,李四,赵六',
    
    // 关联应用
    relatedApps: relatedAppsData['3'],
    // 时间节点
    timeline: timelineData['3'],

    // 项目配置 项目信息
    gitUrl: 'https://github.com/company/mobile-app',
    gitBranch: 'feature/v1.0',
    version: 'v1.0.0-beta',
    progress: 30,
    estimatedHours: 1000,
    actualHours: 300,
    techStack: ['React Native', 'TypeScript', 'Java', 'Spring Boot'],
    techStackText: 'React Native,TypeScript,Java,Spring Boot',
    environment: {
      dev: 'https://dev.mobile-app.com',
      test: 'https://test.mobile-app.com',
      prod: null
    },
    createBy: 'admin',
    createTime: '2024-03-01 08:30:00',
    updateBy: 'admin',
    updateTime: '2024-03-10 11:45:00'
  },
  {
    id: '4',
    projectName: '数据分析平台需求',
    projectCode: 'REQ_DATA_ANALYTICS',
    projectDescription: '企业数据分析和可视化平台需求',
    projectType: 'WEB',
    status: 'PLANNING',
    priority: 'URGENT',
    
    // 任务类型和ID
    taskType: 'BUG',
    requirementId: null,
    bugId: 'BUG-2024-001',
    
    // 需求相关链接
    zentaoUrl: 'https://zentao.example.com/story-view-1004.html',
    uiDesignUrl: 'https://figma.com/data-analytics-design',
    prototypeUrl: 'https://axure.com/data-analytics-prototype',
    designDocUrl: 'https://confluence.example.com/data-analytics-design-doc',
    
    // Git分支管理
    branchCreateMode: 'MANUAL',
    gitBranches: [],
    
    // 开发模式和配置
    developmentMode: 'L1',
    templateId: null,
    configData: null,
    
    // 时间节点
    startDate: '2024-04-01',
    testDate: null,
    onlineDate: null,
    releaseDate: null,
    endDate: '2024-12-31',
    
    // 人员配置
    projectManager: 'zhaoliu',
    projectManagerText: '赵六',
    teamMembers: ['zhaoliu', 'zhangsan', 'lisi'],
    teamMembersText: '赵六,张三,李四',
    
    // 关联应用
    relatedApps: [],
    // 时间节点
    timeline: [],

    // 项目配置 项目信息
    gitUrl: 'https://github.com/company/data-analytics',
    gitBranch: 'main',
    version: 'v0.1.0',
    progress: 5,
    estimatedHours: 2500,
    actualHours: 100,
    techStack: ['Vue3', 'TypeScript', 'Python', 'Django', 'PostgreSQL'],
    techStackText: 'Vue3,TypeScript,Python,Django,PostgreSQL',
    environment: {
      dev: 'https://dev.analytics.com',
      test: null,
      prod: null
    },
    createBy: 'admin',
    createTime: '2024-04-01 09:00:00',
    updateBy: 'admin',
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
          item.projectName.includes(projectName)
        );
      }
      
      // 根据需求编码过滤
      if (projectCode) {
        filteredList = filteredList.filter(item => 
          item.projectCode.includes(projectCode)
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
          item.projectManager === projectManager
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
  
  // 保存项目
  {
    url: '/jeecgboot/project/add',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const newProject = {
        id: Date.now().toString(),
        ...body,
        createBy: 'admin',
        createTime: new Date().toLocaleString(),
        updateBy: 'admin',
        updateTime: new Date().toLocaleString()
      };
      projectList.unshift(newProject);
      return resultSuccess(newProject);
    }
  },
  
  // 更新项目
  {
    url: '/jeecgboot/project/edit',
    timeout: 200,
    method: 'put',
    response: ({ body }) => {
      const index = projectList.findIndex(item => item.id === body.id);
      if (index > -1) {
        projectList[index] = {
          ...projectList[index],
          ...body,
          updateBy: 'admin',
          updateTime: new Date().toLocaleString()
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
      const { id } = query;
      const index = projectList.findIndex(item => item.id === id);
      if (index > -1) {
        projectList.splice(index, 1);
        return resultSuccess('删除成功');
      }
      return resultError('项目不存在');
    }
  },
  
  // 批量删除项目
  {
    url: '/jeecgboot/project/deleteBatch',
    timeout: 200,
    method: 'delete',
    response: ({ query }) => {
      const { ids } = query;
      const idArray = ids.split(',');
      idArray.forEach(id => {
        const index = projectList.findIndex(item => item.id === id);
        if (index > -1) {
          projectList.splice(index, 1);
        }
      });
      return resultSuccess('批量删除成功');
    }
  },
  
  // 获取项目详情
  {
    url: '/jeecgboot/project/queryById',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { id } = query;
      const project = projectList.find(item => item.id === id);
      if (project) {
        return resultSuccess(project);
      }
      return resultError('项目不存在');
    }
  },
  
  // 获取项目统计
  {
    url: '/jeecgboot/project/statistics',
    timeout: 200,
    method: 'get',
    response: () => {
      return resultSuccess(projectStats);
    }
  },
  
  // 检查项目编码重复
  {
    url: '/jeecgboot/project/checkProjectCode',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { projectCode, id } = query;
      const exists = projectList.some(item => 
        item.projectCode === projectCode && item.id !== id
      );
      return resultSuccess({ exists });
    }
  },

  // ==================== 关联应用管理 API ====================
  
  // 获取项目关联应用列表
  {
    url: '/jeecgboot/project/relatedApps/list',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { projectId, pageNo = 1, pageSize = 10 } = query;
      const apps = relatedAppsData[projectId] || [];
      
      const start = (pageNo - 1) * pageSize;
      const end = start + parseInt(pageSize);
      const records = apps.slice(start, end);
      
      return resultSuccess({
        records,
        total: apps.length,
        size: pageSize,
        current: pageNo,
        pages: Math.ceil(apps.length / pageSize)
      });
    }
  },

  // 添加关联应用
  {
    url: '/jeecgboot/project/relatedApps/add',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const newApp = {
        id: `app_${body.projectId}_${Date.now()}`,
        ...body,
        createTime: new Date().toLocaleString('zh-CN'),
        updateTime: new Date().toLocaleString('zh-CN')
      };
      
      if (!relatedAppsData[body.projectId]) {
        relatedAppsData[body.projectId] = [];
      }
      relatedAppsData[body.projectId].push(newApp);
      
      return resultSuccess('添加成功');
    }
  },

  // 编辑关联应用
  {
    url: '/jeecgboot/project/relatedApps/edit',
    timeout: 200,
    method: 'put',
    response: ({ body }) => {
      const { projectId, id } = body;
      const apps = relatedAppsData[projectId] || [];
      const index = apps.findIndex(item => item.id === id);
      
      if (index !== -1) {
        apps[index] = {
          ...apps[index],
          ...body,
          updateTime: new Date().toLocaleString('zh-CN')
        };
        return resultSuccess('编辑成功');
      }
      return resultError('应用不存在');
    }
  },

  // 删除关联应用
  {
    url: '/jeecgboot/project/relatedApps/delete',
    timeout: 200,
    method: 'delete',
    response: ({ query }) => {
      const { projectId, id } = query;
      const apps = relatedAppsData[projectId] || [];
      const index = apps.findIndex(item => item.id === id);
      
      if (index !== -1) {
        apps.splice(index, 1);
        return resultSuccess('删除成功');
      }
      return resultError('应用不存在');
    }
  },

  // ==================== 时间节点管理 API ====================
  
  // 获取项目时间节点列表
  {
    url: '/jeecgboot/project/timeline/list',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { projectId, pageNo = 1, pageSize = 10 } = query;
      const timeline = timelineData[projectId] || [];
      
      const start = (pageNo - 1) * pageSize;
      const end = start + parseInt(pageSize);
      const records = timeline.slice(start, end);
      
      return resultSuccess({
        records,
        total: timeline.length,
        size: pageSize,
        current: pageNo,
        pages: Math.ceil(timeline.length / pageSize)
      });
    }
  },

  // 添加时间节点
  {
    url: '/jeecgboot/project/timeline/add',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const newTimeline = {
        id: `timeline_${body.projectId}_${Date.now()}`,
        ...body,
        createTime: new Date().toLocaleString('zh-CN')
      };
      
      if (!timelineData[body.projectId]) {
        timelineData[body.projectId] = [];
      }
      timelineData[body.projectId].push(newTimeline);
      
      return resultSuccess('添加成功');
    }
  },

  // 编辑时间节点
  {
    url: '/jeecgboot/project/timeline/edit',
    timeout: 200,
    method: 'put',
    response: ({ body }) => {
      const { projectId, id } = body;
      const timeline = timelineData[projectId] || [];
      const index = timeline.findIndex(item => item.id === id);
      
      if (index !== -1) {
        timeline[index] = {
          ...timeline[index],
          ...body
        };
        return resultSuccess('编辑成功');
      }
      return resultError('时间节点不存在');
    }
  },

  // 删除时间节点
  {
    url: '/jeecgboot/project/timeline/delete',
    timeout: 200,
    method: 'delete',
    response: ({ query }) => {
      const { projectId, id } = query;
      const timeline = timelineData[projectId] || [];
      const index = timeline.findIndex(item => item.id === id);
      
      if (index !== -1) {
        timeline.splice(index, 1);
        return resultSuccess('删除成功');
      }
      return resultError('时间节点不存在');
    }
  },

  // 更新时间节点状态
  {
    url: '/jeecgboot/project/timeline/updateStatus',
    timeout: 200,
    method: 'put',
    response: ({ body }) => {
      const { projectId, id, status, actualTime } = body;
      const timeline = timelineData[projectId] || [];
      const index = timeline.findIndex(item => item.id === id);
      
      if (index !== -1) {
        timeline[index].status = status;
        if (actualTime) {
          timeline[index].actualTime = actualTime;
        }
        return resultSuccess('状态更新成功');
      }
      return resultError('时间节点不存在');
    }
  },

  // Git分支管理相关接口
  // 获取项目Git分支列表
  {
    url: '/jeecgboot/project/gitBranches/list',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { projectId } = query;
      const project = projectList.find(p => p.id === projectId);
      
      if (!project) {
        return resultError('项目不存在');
      }
      
      return resultSuccess(project.gitBranches || []);
    }
  },

  // 创建Git分支
  {
    url: '/jeecgboot/project/gitBranches/create',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const { projectId, branchType, developer } = body;
      const project = projectList.find(p => p.id === projectId);
      
      if (!project) {
        return resultError('项目不存在');
      }
      
      // 生成分支名
      let branchName = '';
      if (branchType === 'FEATURE') {
        branchName = project.taskType === 'REQUIREMENT' 
          ? `feature-${project.requirementId}` 
          : `fix-${project.bugId}`;
      } else if (branchType === 'HOTFIX') {
        branchName = `hotfix-${project.requirementId || project.bugId}`;
      }
      
      const newBranch = {
        id: `branch_${projectId}_${Date.now()}`,
        branchName,
        branchType,
        status: 'ACTIVE',
        createTime: new Date().toISOString().replace('T', ' ').split('.')[0],
        mergeTime: null,
        developer,
        developerText: developer // 实际应该从用户表获取
      };
      
      if (!project.gitBranches) {
        project.gitBranches = [];
      }
      project.gitBranches.push(newBranch);
      
      return resultSuccess(newBranch, '分支创建成功');
    }
  },

  // 合并Git分支
  {
    url: '/jeecgboot/project/gitBranches/merge',
    timeout: 200,
    method: 'put',
    response: ({ body }) => {
      const { projectId, branchId } = body;
      const project = projectList.find(p => p.id === projectId);
      
      if (!project || !project.gitBranches) {
        return resultError('项目或分支不存在');
      }
      
      const branch = project.gitBranches.find(b => b.id === branchId);
      if (!branch) {
        return resultError('分支不存在');
      }
      
      branch.status = 'MERGED';
      branch.mergeTime = new Date().toISOString().replace('T', ' ').split('.')[0];
      
      return resultSuccess('分支合并成功');
    }
  },

  // 删除Git分支
  {
    url: '/jeecgboot/project/gitBranches/delete',
    timeout: 200,
    method: 'delete',
    response: ({ query }) => {
      const { projectId, branchId } = query;
      const project = projectList.find(p => p.id === projectId);
      
      if (!project || !project.gitBranches) {
        return resultError('项目或分支不存在');
      }
      
      const index = project.gitBranches.findIndex(b => b.id === branchId);
      if (index === -1) {
        return resultError('分支不存在');
      }
      
      project.gitBranches.splice(index, 1);
      
      return resultSuccess('分支删除成功');
    }
  },

  // 开发模式和模板相关接口
  // 获取开发模板列表
  {
    url: '/jeecgboot/project/templates/list',
    timeout: 200,
    method: 'get',
    response: () => {
      const templates = [
        {
          id: 'TEMPLATE_001',
          name: 'React + TypeScript 模板',
          description: '基于React和TypeScript的前端开发模板',
          framework: 'React',
          language: 'TypeScript',
          features: ['路由管理', '状态管理', 'UI组件库', 'API集成'],
          configSchema: {
            database: { type: 'select', options: ['MySQL', 'PostgreSQL', 'MongoDB'] },
            deployment: { type: 'select', options: ['Docker', 'K8s', 'Serverless'] }
          }
        },
        {
          id: 'TEMPLATE_002',
          name: 'Vue3 + Vite 模板',
          description: '基于Vue3和Vite的现代前端开发模板',
          framework: 'Vue3',
          language: 'TypeScript',
          features: ['Composition API', 'Pinia状态管理', 'Element Plus', 'Vite构建'],
          configSchema: {
            platform: { type: 'select', options: ['Web', 'Mobile', 'Desktop'] },
            targetOS: { type: 'multiSelect', options: ['iOS', 'Android', 'Windows', 'macOS'] }
          }
        },
        {
          id: 'TEMPLATE_003',
          name: 'Spring Boot 微服务模板',
          description: '基于Spring Boot的微服务后端模板',
          framework: 'Spring Boot',
          language: 'Java',
          features: ['微服务架构', 'Spring Cloud', 'Redis缓存', 'MySQL数据库'],
          configSchema: {
            database: { type: 'select', options: ['MySQL', 'PostgreSQL', 'Oracle'] },
            cache: { type: 'select', options: ['Redis', 'Memcached', 'Caffeine'] }
          }
        }
      ];
      
      return resultSuccess(templates);
    }
  },

  // 获取模板详情
  {
    url: '/jeecgboot/project/templates/detail',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { templateId } = query;
      
      // 模拟模板详情数据
      const templateDetails = {
        'TEMPLATE_001': {
          id: 'TEMPLATE_001',
          name: 'React + TypeScript 模板',
          description: '基于React和TypeScript的前端开发模板',
          framework: 'React',
          language: 'TypeScript',
          version: '1.0.0',
          author: 'admin',
          createTime: '2024-01-01 10:00:00',
          files: [
            { path: 'src/App.tsx', type: 'component' },
            { path: 'src/components/Header.tsx', type: 'component' },
            { path: 'src/utils/request.ts', type: 'utility' },
            { path: 'package.json', type: 'config' }
          ],
          configSchema: {
            database: { 
              type: 'select', 
              label: '数据库类型',
              options: ['MySQL', 'PostgreSQL', 'MongoDB'],
              default: 'MySQL'
            },
            deployment: { 
              type: 'select', 
              label: '部署方式',
              options: ['Docker', 'K8s', 'Serverless'],
              default: 'Docker'
            }
          }
        }
      };
      
      const template = templateDetails[templateId];
      if (!template) {
        return resultError('模板不存在');
      }
      
      return resultSuccess(template);
    }
  },

  // 保存项目配置
  {
    url: '/jeecgboot/project/config/save',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const { projectId, configData } = body;
      const project = projectList.find(p => p.id === projectId);
      
      if (!project) {
        return resultError('项目不存在');
      }
      
      project.configData = configData;
      project.updateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
      
      return resultSuccess('配置保存成功');
    }
  },

  // 生成项目代码
  {
    url: '/jeecgboot/project/code/generate',
    timeout: 2000,
    method: 'post',
    response: ({ body }) => {
      const { projectId } = body;
      const project = projectList.find(p => p.id === projectId);
      
      if (!project) {
        return resultError('项目不存在');
      }
      
      // 模拟代码生成过程
      return resultSuccess({
        downloadUrl: `https://download.example.com/projects/${projectId}/code.zip`,
        generateTime: new Date().toISOString().replace('T', ' ').split('.')[0],
        fileSize: '2.5MB'
      }, '代码生成成功');
    }
  },

  // 流水线部署相关接口
  // 获取流水线配置
  {
    url: '/jeecgboot/project/pipeline/config',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { projectId } = query;
      
      return resultSuccess({
        projectId,
        stages: [
          { name: '代码检查', status: 'SUCCESS', duration: '2m 30s' },
          { name: '单元测试', status: 'SUCCESS', duration: '5m 15s' },
          { name: '构建打包', status: 'RUNNING', duration: '3m 45s' },
          { name: '部署测试环境', status: 'PENDING', duration: null },
          { name: '自动化测试', status: 'PENDING', duration: null },
          { name: '部署生产环境', status: 'PENDING', duration: null }
        ],
        lastRunTime: '2024-01-15 14:30:00',
        nextRunTime: '2024-01-16 09:00:00'
      });
    }
  },

  // 触发流水线部署
  {
    url: '/jeecgboot/project/pipeline/deploy',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const { projectId, environment } = body;
      
      return resultSuccess({
        pipelineId: `pipeline_${Date.now()}`,
        status: 'RUNNING',
        environment,
        startTime: new Date().toISOString().replace('T', ' ').split('.')[0]
      }, '流水线部署已启动');
    }
  }
] as MockMethod[];