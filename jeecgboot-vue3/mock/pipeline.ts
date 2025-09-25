import { MockMethod } from 'vite-plugin-mock';
import { resultError, resultSuccess } from './_util';

/**
 * 流水线配置数据
 */
const pipelineConfigData = {
  '1': {
    id: 'config_1',
    projectId: '1',
    name: '智能办公系统流水线',
    description: '智能办公系统的完整CI/CD流水线配置',
    enabled: true,
    autoTrigger: true,
    environments: [
      {
        name: 'test',
        displayName: '测试环境',
        enabled: true,
        autoTrigger: true,
        stages: [
          {
            name: 'git_merge',
            displayName: 'Git合并',
            type: 'git',
            enabled: true,
            order: 1,
            config: {
              sourceBranch: 'feature/*',
              targetBranch: 'develop',
              requireReview: true,
              reviewers: ['lisi', 'wangwu']
            }
          },
          {
            name: 'build',
            displayName: '构建',
            type: 'build',
            enabled: true,
            order: 2,
            config: {
              nodeVersion: '18.x',
              buildCommand: 'npm run build:test',
              outputPath: 'dist',
              cacheEnabled: true
            }
          },
          {
            name: 'test',
            displayName: '测试',
            type: 'test',
            enabled: true,
            order: 3,
            config: {
              testCommand: 'npm run test',
              coverage: true,
              coverageThreshold: 80,
              parallelJobs: 4
            }
          },
          {
            name: 'deploy',
            displayName: '部署',
            type: 'deploy',
            enabled: true,
            order: 4,
            config: {
              environment: 'test',
              deployCommand: 'npm run deploy:test',
              healthCheck: true,
              rollbackEnabled: true
            }
          }
        ]
      },
      {
        name: 'prod',
        displayName: '生产环境',
        enabled: true,
        autoTrigger: false,
        stages: [
          {
            name: 'git_merge',
            displayName: 'Git合并',
            type: 'git',
            enabled: true,
            order: 1,
            config: {
              sourceBranch: 'develop',
              targetBranch: 'main',
              requireReview: true,
              reviewers: ['zhangsan', 'lisi']
            }
          },
          {
            name: 'build',
            displayName: '构建',
            type: 'build',
            enabled: true,
            order: 2,
            config: {
              nodeVersion: '18.x',
              buildCommand: 'npm run build:prod',
              outputPath: 'dist',
              cacheEnabled: true
            }
          },
          {
            name: 'test',
            displayName: '测试',
            type: 'test',
            enabled: true,
            order: 3,
            config: {
              testCommand: 'npm run test:prod',
              coverage: true,
              coverageThreshold: 90,
              parallelJobs: 8
            }
          },
          {
            name: 'deploy',
            displayName: '部署',
            type: 'deploy',
            enabled: true,
            order: 4,
            config: {
              environment: 'prod',
              deployCommand: 'npm run deploy:prod',
              healthCheck: true,
              rollbackEnabled: true
            }
          }
        ]
      }
    ],
    createTime: '2024-08-20 10:00:00',
    updateTime: '2024-08-25 15:30:00',
    creator: 'zhangsan'
  },
  '2': {
    id: 'config_2',
    projectId: '2',
    name: '电商平台流水线',
    description: '电商平台的CI/CD流水线配置',
    enabled: true,
    autoTrigger: true,
    environments: [
      {
        name: 'test',
        displayName: '测试环境',
        enabled: true,
        autoTrigger: true,
        stages: [
          {
            name: 'build',
            displayName: '构建',
            type: 'build',
            enabled: true,
            order: 1,
            config: {
              nodeVersion: '16.x',
              buildCommand: 'npm run build',
              outputPath: 'dist'
            }
          },
          {
            name: 'test',
            displayName: '测试',
            type: 'test',
            enabled: true,
            order: 2,
            config: {
              testCommand: 'npm run test',
              coverage: true
            }
          },
          {
            name: 'deploy',
            displayName: '部署',
            type: 'deploy',
            enabled: true,
            order: 3,
            config: {
              environment: 'test',
              deployCommand: 'npm run deploy:test'
            }
          }
        ]
      }
    ],
    createTime: '2024-08-22 14:00:00',
    updateTime: '2024-08-24 16:45:00',
    creator: 'lisi'
  },
  '3': {
    id: 'config_3',
    projectId: '3',
    name: '移动应用流水线',
    description: '移动应用的CI/CD流水线配置',
    enabled: false,
    autoTrigger: false,
    environments: [
      {
        name: 'test',
        displayName: '测试环境',
        enabled: true,
        autoTrigger: false,
        stages: [
          {
            name: 'build',
            displayName: '构建',
            type: 'build',
            enabled: true,
            order: 1,
            config: {
              platform: 'android',
              buildCommand: './gradlew assembleDebug'
            }
          },
          {
            name: 'test',
            displayName: '测试',
            type: 'test',
            enabled: true,
            order: 2,
            config: {
              testCommand: './gradlew test'
            }
          }
        ]
      }
    ],
    createTime: '2024-08-25 09:30:00',
    updateTime: '2024-08-25 09:30:00',
    creator: 'wangwu'
  }
};

/**
 * 流水线状态数据
 */
const pipelineStatusData = {
  '1': {
    id: 'pipeline_1',
    status: 'success',
    currentStage: 'deploy',
    progress: 100,
    startTime: '2024-08-28 09:00:00',
    endTime: '2024-08-28 10:30:00',
    logs: [
      {
        timestamp: '2024-08-28 09:00:00',
        level: 'info',
        message: '开始构建流水线',
        stage: 'build'
      },
      {
        timestamp: '2024-08-28 09:15:00',
        level: 'info',
        message: '构建完成，开始测试',
        stage: 'test'
      },
      {
        timestamp: '2024-08-28 09:45:00',
        level: 'info',
        message: '测试通过，开始部署',
        stage: 'deploy'
      },
      {
        timestamp: '2024-08-28 10:30:00',
        level: 'info',
        message: '部署完成',
        stage: 'deploy'
      }
    ]
  },
  '2': {
    id: 'pipeline_2',
    status: 'running',
    currentStage: 'test',
    progress: 65,
    startTime: '2024-12-25 14:00:00',
    endTime: null,
    logs: [
      {
        timestamp: '2024-12-25 14:00:00',
        level: 'info',
        message: '开始构建流水线',
        stage: 'build'
      },
      {
        timestamp: '2024-12-25 14:20:00',
        level: 'info',
        message: '构建完成，开始测试',
        stage: 'test'
      },
      {
        timestamp: '2024-12-25 14:35:00',
        level: 'warn',
        message: '发现测试警告，继续执行',
        stage: 'test'
      }
    ]
  },
  '3': {
    id: 'pipeline_3',
    status: 'pending',
    currentStage: null,
    progress: 0,
    startTime: null,
    endTime: null,
    logs: []
  }
};

/**
 * 流水线历史数据
 */
const pipelineHistoryData = {
  '1': [
    {
      id: 'build_001',
      buildNumber: 1,
      status: 'success',
      startTime: '2024-08-28 09:00:00',
      endTime: '2024-08-28 10:30:00',
      duration: 90, // 90分钟
      triggerType: 'manual',
      triggeredBy: 'zhangsan',
      branch: 'main',
      commitId: 'abc123def',
      commitMessage: '修复登录页面样式问题',
      environment: 'test',
      stages: [
        { name: 'build', status: 'success', duration: 15 },
        { name: 'test', status: 'success', duration: 30 },
        { name: 'deploy', status: 'success', duration: 45 }
      ]
    },
    {
      id: 'build_002',
      buildNumber: 2,
      status: 'failed',
      startTime: '2024-08-27 14:00:00',
      endTime: '2024-08-27 14:45:00',
      duration: 45, // 45分钟
      triggerType: 'auto',
      triggeredBy: 'lisi',
      branch: 'develop',
      commitId: 'def456ghi',
      commitMessage: '添加新功能模块',
      environment: 'test',
      stages: [
        { name: 'build', status: 'success', duration: 15 },
        { name: 'test', status: 'failed', duration: 30 },
        { name: 'deploy', status: 'cancelled', duration: 0 }
      ]
    },
    {
      id: 'build_003',
      buildNumber: 3,
      status: 'success',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      duration: 60, // 60分钟
      triggerType: 'manual',
      triggeredBy: 'admin',
      branch: 'main',
      commitId: 'xyz789abc',
      commitMessage: '今日构建测试',
      environment: 'test',
      stages: [
        { name: 'build', status: 'success', duration: 20 },
        { name: 'test', status: 'success', duration: 25 },
        { name: 'deploy', status: 'success', duration: 15 }
      ]
    }
  ],
  '2': [
    {
      id: 'build_004',
      buildNumber: 1,
      status: 'running',
      startTime: '2024-12-25 14:00:00',
      endTime: null,
      duration: null,
      triggerType: 'auto',
      triggeredBy: 'system',
      branch: 'main',
      commitId: 'ghi789jkl',
      commitMessage: '优化数据库查询性能',
      environment: 'test',
      stages: [
        { name: 'build', status: 'success', duration: 20 },
        { name: 'test', status: 'running', duration: null },
        { name: 'deploy', status: 'pending', duration: null }
      ]
    }
  ],
  '3': []
};

export default [
  // ==================== 流水线管理 API ====================
  
  /**
   * 获取流水线状态
   */
  {
    url: '/jeecgboot/project/pipeline/status',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { projectId } = query;
      const status = pipelineStatusData[projectId];
      if (status) {
        return resultSuccess(status);
      }
      return resultError('流水线状态不存在');
    }
  },

  /**
   * 触发流水线
   */
  {
    url: '/jeecgboot/project/pipeline/trigger',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const { projectId } = body;
      if (pipelineStatusData[projectId]) {
        pipelineStatusData[projectId].status = 'running';
        pipelineStatusData[projectId].currentStage = 'build';
        pipelineStatusData[projectId].progress = 10;
        pipelineStatusData[projectId].startTime = new Date().toLocaleString('zh-CN');
        pipelineStatusData[projectId].endTime = null;
        return resultSuccess('流水线触发成功');
      }
      return resultError('项目不存在');
    }
  },

  /**
   * 停止流水线
   */
  {
    url: '/jeecgboot/project/pipeline/stop',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const { projectId } = body;
      if (pipelineStatusData[projectId]) {
        pipelineStatusData[projectId].status = 'stopped';
        pipelineStatusData[projectId].endTime = new Date().toLocaleString('zh-CN');
        return resultSuccess('流水线停止成功');
      }
      return resultError('项目不存在');
    }
  },

  /**
   * 获取流水线日志
   */
  {
    url: '/jeecgboot/project/pipeline/logs',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { projectId } = query;
      const status = pipelineStatusData[projectId];
      if (status) {
        return resultSuccess(status.logs);
      }
      return resultError('流水线日志不存在');
    }
  },

  /**
   * 获取流水线历史
   */
  {
    url: '/jeecgboot/project/pipeline/history',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { projectId, pageNo = 1, pageSize = 10 } = query;
      const history = pipelineHistoryData[projectId] || [];
      
      const startIndex = (pageNo - 1) * pageSize;
      const endIndex = startIndex + parseInt(pageSize);
      const records = history.slice(startIndex, endIndex);
      
      return resultSuccess({
        records,
        total: history.length,
        size: parseInt(pageSize),
        current: parseInt(pageNo),
        pages: Math.ceil(history.length / pageSize)
      });
    }
  },

  /**
   * 获取流水线配置
   */
  {
    url: '/jeecgboot/project/pipeline/config/get',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { projectId } = query;
      const config = pipelineConfigData[projectId];
      if (config) {
        return resultSuccess(config);
      }
      return resultError('流水线配置不存在');
    }
  },

  /**
   * 保存流水线配置
   */
  {
    url: '/jeecgboot/project/pipeline/config/save',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const { projectId, ...config } = body;
      pipelineConfigData[projectId] = {
        ...config,
        projectId,
        updateTime: new Date().toLocaleString('zh-CN')
      };
      return resultSuccess('流水线配置保存成功');
    }
  },

  /**
   * 切换流水线启用状态
   */
  {
    url: '/jeecgboot/project/pipeline/config/toggle',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const { projectId, enabled } = body;
      if (pipelineConfigData[projectId]) {
        pipelineConfigData[projectId].enabled = enabled;
        pipelineConfigData[projectId].updateTime = new Date().toLocaleString('zh-CN');
        return resultSuccess('流水线状态切换成功');
      }
      return resultError('流水线配置不存在');
    }
  },

  /**
   * 重试流水线阶段
   */
  {
    url: '/jeecgboot/project/pipeline/retry',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const { projectId, stage } = body;
      if (pipelineStatusData[projectId]) {
        pipelineStatusData[projectId].currentStage = stage;
        pipelineStatusData[projectId].status = 'running';
        return resultSuccess('流水线重试成功');
      }
      return resultError('项目不存在');
    }
  },

  /**
   * 跳过流水线阶段
   */
  {
    url: '/jeecgboot/project/pipeline/skip',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const { projectId, stage } = body;
      if (pipelineStatusData[projectId]) {
        // 这里可以添加跳过阶段的逻辑
        return resultSuccess('流水线阶段跳过成功');
      }
      return resultError('项目不存在');
    }
  },

  /**
   * 部署流水线
   */
  {
    url: '/jeecgboot/project/pipeline/deploy',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const { projectId, environment } = body;
      if (pipelineStatusData[projectId]) {
        // 模拟部署过程
        return resultSuccess({
          deployId: `deploy_${Date.now()}`,
          status: 'deploying',
          environment,
          startTime: new Date().toLocaleString('zh-CN')
        });
      }
      return resultError('项目不存在');
    }
  }
] as MockMethod[];