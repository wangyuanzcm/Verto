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

/**
 * 构建详情数据
 */
const buildDetailData = {
  'build_001': {
    id: 'build_001',
    buildNumber: 1,
    status: 'success',
    startTime: '2024-08-28 09:00:00',
    endTime: '2024-08-28 10:30:00',
    duration: 5400, // 90分钟 = 5400秒
    triggerType: 'manual',
    triggeredBy: 'zhangsan',
    branch: 'main',
    commitId: 'abc123def456',
    commitMessage: '修复登录页面样式问题，优化用户体验',
    environment: 'test',
    trigger: 'manual',
    avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    stages: [
      {
        name: 'git_merge',
        displayName: 'Git合并',
        type: 'git',
        status: 'success',
        startTime: '2024-08-28 09:00:00',
        endTime: '2024-08-28 09:05:00',
        duration: 300, // 5分钟
        order: 1,
        logs: [
          '开始Git合并操作...',
          '检查分支状态...',
          '合并代码到目标分支...',
          'Git合并完成'
        ]
      },
      {
        name: 'build',
        displayName: '构建',
        type: 'build',
        status: 'success',
        startTime: '2024-08-28 09:05:00',
        endTime: '2024-08-28 09:20:00',
        duration: 900, // 15分钟
        order: 2,
        logs: [
          '开始构建应用...',
          '安装依赖包...',
          '编译源代码...',
          '打包应用文件...',
          '构建完成'
        ]
      },
      {
        name: 'test',
        displayName: '测试',
        type: 'test',
        status: 'success',
        startTime: '2024-08-28 09:20:00',
        endTime: '2024-08-28 09:50:00',
        duration: 1800, // 30分钟
        order: 3,
        logs: [
          '开始运行测试...',
          '执行单元测试...',
          '执行集成测试...',
          '生成测试报告...',
          '测试通过'
        ]
      },
      {
        name: 'deploy',
        displayName: '部署',
        type: 'deploy',
        status: 'success',
        startTime: '2024-08-28 09:50:00',
        endTime: '2024-08-28 10:30:00',
        duration: 2400, // 40分钟
        order: 4,
        logs: [
          '开始部署应用...',
          '上传应用文件...',
          '更新服务配置...',
          '重启应用服务...',
          '健康检查通过...',
          '部署完成'
        ]
      }
    ]
  },
  'build_002': {
    id: 'build_002',
    buildNumber: 2,
    status: 'failed',
    startTime: '2024-08-27 14:00:00',
    endTime: '2024-08-27 14:45:00',
    duration: 2700, // 45分钟
    triggerType: 'webhook',
    triggeredBy: 'lisi',
    branch: 'develop',
    commitId: 'def456ghi789',
    commitMessage: '添加新功能模块，重构部分代码',
    environment: 'test',
    trigger: 'webhook',
    avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
    stages: [
      {
        name: 'git_merge',
        displayName: 'Git合并',
        type: 'git',
        status: 'success',
        startTime: '2024-08-27 14:00:00',
        endTime: '2024-08-27 14:03:00',
        duration: 180, // 3分钟
        order: 1,
        logs: [
          '开始Git合并操作...',
          '检查分支状态...',
          '合并代码到目标分支...',
          'Git合并完成'
        ]
      },
      {
        name: 'build',
        displayName: '构建',
        type: 'build',
        status: 'success',
        startTime: '2024-08-27 14:03:00',
        endTime: '2024-08-27 14:15:00',
        duration: 720, // 12分钟
        order: 2,
        logs: [
          '开始构建应用...',
          '安装依赖包...',
          '编译源代码...',
          '打包应用文件...',
          '构建完成'
        ]
      },
      {
        name: 'test',
        displayName: '测试',
        type: 'test',
        status: 'failed',
        startTime: '2024-08-27 14:15:00',
        endTime: '2024-08-27 14:45:00',
        duration: 1800, // 30分钟
        order: 3,
        logs: [
          '开始运行测试...',
          '执行单元测试...',
          'ERROR: 测试用例失败',
          'FAILED: LoginTest.testUserLogin',
          '测试失败，构建终止'
        ]
      },
      {
        name: 'deploy',
        displayName: '部署',
        type: 'deploy',
        status: 'cancelled',
        startTime: null,
        endTime: null,
        duration: 0,
        order: 4,
        logs: [
          '由于前置阶段失败，部署阶段被取消'
        ]
      }
    ]
  }
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
  },

  /**
   * 获取构建详情
   */
  {
    url: '/jeecgboot/project/pipeline/build/:projectId/:buildId',
    timeout: 200,
    method: 'get',
    response: ({ url }) => {
      // 从URL路径中提取参数
      const urlParts = url.split('/');
      const projectId = urlParts[urlParts.length - 2];
      const buildId = urlParts[urlParts.length - 1].split('?')[0]; // 移除查询参数
      
      console.log('获取构建详情:', { projectId, buildId, url });
      
      const buildDetail = buildDetailData[buildId];
      if (buildDetail) {
        return resultSuccess(buildDetail);
      }
      return resultError(`构建详情不存在: ${buildId}`);
    }
  },

  /**
   * 重试构建
   */
  {
    url: '/jeecgboot/project/pipeline/build/retry/:projectId/:buildId',
    timeout: 1000,
    method: 'post',
    response: ({ url }) => {
      // 从URL路径中提取参数
      const urlParts = url.split('/');
      const buildId = urlParts[urlParts.length - 1];
      const projectId = urlParts[urlParts.length - 2];
      
      console.log('重试构建:', { projectId, buildId });
      
      // 生成新的构建编号
      const newBuildNumber = Math.floor(Math.random() * 1000) + 100;
      const newBuildId = `build_${String(newBuildNumber).padStart(3, '0')}`;
      
      // 模拟重新触发构建
      return resultSuccess({
        buildId: newBuildId,
        buildNumber: newBuildNumber,
        status: 'pending',
        message: '构建已重新触发',
        startTime: new Date().toLocaleString('zh-CN')
      });
    }
  },

  /**
   * 下载构建日志
   */
  {
    url: '/jeecgboot/project/pipeline/build/logs/download/:projectId/:buildId',
    timeout: 500,
    method: 'get',
    response: ({ url }) => {
      // 从URL路径中提取参数
      const urlParts = url.split('/');
      const buildId = urlParts[urlParts.length - 1];
      const projectId = urlParts[urlParts.length - 2];
      
      console.log('下载构建日志:', { projectId, buildId });
      
      // 模拟日志文件内容
      const logContent = `
=== 构建日志 ${buildId} ===
时间: ${new Date().toLocaleString('zh-CN')}
项目ID: ${projectId}
构建ID: ${buildId}

[2024-12-25 10:00:00] 开始构建...
[2024-12-25 10:01:00] 拉取代码完成
[2024-12-25 10:02:00] 安装依赖...
[2024-12-25 10:05:00] 依赖安装完成
[2024-12-25 10:06:00] 开始编译...
[2024-12-25 10:10:00] 编译完成
[2024-12-25 10:11:00] 运行测试...
[2024-12-25 10:15:00] 测试通过
[2024-12-25 10:16:00] 开始部署...
[2024-12-25 10:20:00] 部署完成
[2024-12-25 10:20:30] 构建成功！

=== 构建结束 ===
      `.trim();
      
      // 返回日志内容，前端可以创建下载链接
      return resultSuccess({
        filename: `build_${buildId}_logs.txt`,
        content: logContent,
        size: logContent.length,
        downloadUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(logContent)}`
      });
    }
  },

  /**
   * 批量下载构建日志
   */
  {
    url: '/jeecgboot/project/pipeline/build/batch-download/:projectId',
    timeout: 1000,
    method: 'post',
    response: ({ url, body }) => {
      const urlParts = url.split('/');
      const projectId = urlParts[urlParts.length - 1];
      const { buildIds } = body;
      
      console.log('批量下载构建日志:', { projectId, buildIds });
      
      if (!buildIds || !Array.isArray(buildIds)) {
        return resultError('构建ID列表不能为空');
      }
      
      // 模拟生成压缩包
      const zipContent = buildIds.map(buildId => 
        `=== ${buildId} 构建日志 ===\n[日志内容...]\n\n`
      ).join('');
      
      return resultSuccess({
        filename: `batch_logs_${projectId}_${Date.now()}.zip`,
        content: zipContent,
        size: zipContent.length,
        buildCount: buildIds.length,
        downloadUrl: `data:application/zip;base64,${btoa(zipContent)}`
      });
    }
  },

  /**
   * 对比构建
   */
  {
    url: '/jeecgboot/project/pipeline/build/compare',
    timeout: 800,
    method: 'post',
    response: ({ body }) => {
      const { projectId, buildIds } = body;
      
      console.log('对比构建:', { projectId, buildIds });
      
      if (!buildIds || buildIds.length < 2) {
        return resultError('至少需要选择两个构建进行对比');
      }
      
      // 模拟构建对比结果
      const compareResult = {
        projectId,
        buildIds,
        compareTime: new Date().toLocaleString('zh-CN'),
        differences: [
          {
            category: '代码变更',
            items: [
              {
                type: 'added',
                file: 'src/components/NewComponent.vue',
                lines: '+45',
                description: '新增组件文件'
              },
              {
                type: 'modified',
                file: 'src/views/Dashboard.vue',
                lines: '+12 -8',
                description: '修改仪表板样式'
              },
              {
                type: 'deleted',
                file: 'src/utils/deprecated.js',
                lines: '-23',
                description: '删除废弃工具函数'
              }
            ]
          },
          {
            category: '构建时间',
            items: [
              {
                stage: 'build',
                build1: '2分30秒',
                build2: '2分45秒',
                difference: '+15秒'
              },
              {
                stage: 'test',
                build1: '1分20秒',
                build2: '1分15秒',
                difference: '-5秒'
              }
            ]
          },
          {
            category: '测试结果',
            items: [
              {
                type: 'coverage',
                build1: '85.2%',
                build2: '87.1%',
                difference: '+1.9%'
              },
              {
                type: 'tests',
                build1: '156 passed',
                build2: '158 passed',
                difference: '+2 tests'
              }
            ]
          }
        ]
      };
      
      return resultSuccess(compareResult);
    }
  },

  /**
   * 删除构建记录
   */
  {
    url: '/jeecgboot/project/pipeline/build/:projectId/:buildId',
    timeout: 500,
    method: 'delete',
    response: ({ url }) => {
      // 从URL路径中提取参数
      const urlParts = url.split('/');
      const buildId = urlParts[urlParts.length - 1];
      const projectId = urlParts[urlParts.length - 2];
      
      console.log('删除构建记录:', { projectId, buildId });
      
      // 检查构建是否存在
      if (buildDetailData[buildId]) {
        // 模拟删除操作
        return resultSuccess({
          message: `构建记录 ${buildId} 已删除`,
          deletedAt: new Date().toLocaleString('zh-CN')
        });
      }
      
      return resultError(`构建记录 ${buildId} 不存在`);
    }
  },

  /**
   * 批量删除构建记录
   */
  {
    url: '/jeecgboot/project/pipeline/build/batch-delete/:projectId',
    timeout: 800,
    method: 'delete',
    response: ({ url, body }) => {
      const urlParts = url.split('/');
      const projectId = urlParts[urlParts.length - 1];
      const { buildIds } = body;
      
      console.log('批量删除构建记录:', { projectId, buildIds });
      
      if (!buildIds || !Array.isArray(buildIds)) {
        return resultError('构建ID列表不能为空');
      }
      
      // 模拟批量删除
      const deletedCount = buildIds.length;
      const failedIds = []; // 模拟一些删除失败的情况
      
      return resultSuccess({
        message: `成功删除 ${deletedCount} 个构建记录`,
        deletedCount,
        failedIds,
        deletedAt: new Date().toLocaleString('zh-CN')
      });
    }
  }
] as MockMethod[];
