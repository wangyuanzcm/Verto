import { MockMethod } from 'vite-plugin-mock';
import { resultError, resultSuccess, getRequestToken, requestParams } from './_util';

// 流水线配置数据
const pipelineConfigData = {
  '1': {
    enabled: true,
    stages: [
      {
        name: 'build',
        displayName: '构建',
        enabled: true,
        timeout: 600,
        commands: [
          'npm install',
          'npm run build'
        ]
      },
      {
        name: 'test',
        displayName: '测试',
        enabled: true,
        timeout: 300,
        commands: [
          'npm run test',
          'npm run test:coverage'
        ]
      },
      {
        name: 'deploy',
        displayName: '部署',
        enabled: true,
        timeout: 900,
        commands: [
          'docker build -t app:latest .',
          'docker push registry.company.com/app:latest',
          'kubectl apply -f k8s/'
        ]
      }
    ],
    environment: {
      NODE_ENV: 'production',
      API_URL: 'https://api.company.com'
    },
    notifications: {
      email: ['dev@company.com'],
      webhook: 'https://hooks.company.com/pipeline'
    }
  },
  '2': {
    enabled: true,
    stages: [
      {
        name: 'build',
        displayName: '构建',
        enabled: true,
        timeout: 800,
        commands: [
          'mvn clean compile',
          'mvn package'
        ]
      },
      {
        name: 'test',
        displayName: '测试',
        enabled: true,
        timeout: 400,
        commands: [
          'mvn test',
          'mvn jacoco:report'
        ]
      },
      {
        name: 'deploy',
        displayName: '部署',
        enabled: false,
        timeout: 600,
        commands: [
          'docker build -t ecommerce:latest .',
          'docker push registry.company.com/ecommerce:latest'
        ]
      }
    ],
    environment: {
      JAVA_HOME: '/usr/lib/jvm/java-11-openjdk',
      MAVEN_OPTS: '-Xmx2g'
    },
    notifications: {
      email: ['backend@company.com'],
      webhook: null
    }
  },
  '3': {
    enabled: false,
    stages: [
      {
        name: 'build',
        displayName: '构建',
        enabled: true,
        timeout: 1200,
        commands: [
          'flutter clean',
          'flutter pub get',
          'flutter build apk'
        ]
      },
      {
        name: 'test',
        displayName: '测试',
        enabled: true,
        timeout: 600,
        commands: [
          'flutter test',
          'flutter test --coverage'
        ]
      }
    ],
    environment: {
      FLUTTER_ROOT: '/opt/flutter',
      ANDROID_HOME: '/opt/android-sdk'
    },
    notifications: {
      email: ['mobile@company.com'],
      webhook: null
    }
  }
};

// 流水线状态数据
const pipelineStatusData = {
  '1': {
    projectId: '1',
    isRunning: false,
    currentBuild: null,
    lastBuild: {
      id: 'build_1_15',
      number: 15,
      status: 'success',
      startTime: '2024-01-15 14:30:00',
      endTime: '2024-01-15 14:45:00',
      duration: 900,
      branch: 'main',
      commitId: 'abc123def456',
      commitMessage: 'feat: 添加新功能模块',
      author: 'zhangsan'
    },
    nextBuild: null,
    queueLength: 0
  },
  '2': {
    projectId: '2',
    isRunning: true,
    currentBuild: {
      id: 'build_2_8',
      number: 8,
      status: 'running',
      startTime: '2024-02-15 16:20:00',
      endTime: null,
      duration: null,
      branch: 'develop',
      commitId: 'def456ghi789',
      commitMessage: 'fix: 修复支付模块bug',
      author: 'lisi',
      currentStage: 'test',
      progress: 65
    },
    lastBuild: {
      id: 'build_2_7',
      number: 7,
      status: 'failed',
      startTime: '2024-02-14 10:15:00',
      endTime: '2024-02-14 10:28:00',
      duration: 780,
      branch: 'develop',
      commitId: 'ghi789jkl012',
      commitMessage: 'refactor: 重构订单服务',
      author: 'lisi'
    },
    nextBuild: null,
    queueLength: 0
  },
  '3': {
    projectId: '3',
    isRunning: false,
    currentBuild: null,
    lastBuild: null,
    nextBuild: null,
    queueLength: 0
  }
};

// 流水线历史数据
const pipelineHistoryData = {
  '1': [
    {
      id: 'build_1_15',
      number: 15,
      status: 'success',
      startTime: '2024-01-15 14:30:00',
      endTime: '2024-01-15 14:45:00',
      duration: 900,
      branch: 'main',
      commitId: 'abc123def456',
      commitMessage: 'feat: 添加新功能模块',
      author: 'zhangsan',
      stages: [
        { name: 'build', status: 'success', duration: 300 },
        { name: 'test', status: 'success', duration: 200 },
        { name: 'deploy', status: 'success', duration: 400 }
      ]
    },
    {
      id: 'build_1_14',
      number: 14,
      status: 'success',
      startTime: '2024-01-14 11:20:00',
      endTime: '2024-01-14 11:32:00',
      duration: 720,
      branch: 'develop',
      commitId: 'def456ghi789',
      commitMessage: 'style: 优化UI样式',
      author: 'lisi',
      stages: [
        { name: 'build', status: 'success', duration: 280 },
        { name: 'test', status: 'success', duration: 180 },
        { name: 'deploy', status: 'success', duration: 260 }
      ]
    },
    {
      id: 'build_1_13',
      number: 13,
      status: 'failed',
      startTime: '2024-01-13 09:45:00',
      endTime: '2024-01-13 09:52:00',
      duration: 420,
      branch: 'feature-new-module',
      commitId: 'ghi789jkl012',
      commitMessage: 'feat: 新增模块功能',
      author: 'zhangsan',
      stages: [
        { name: 'build', status: 'success', duration: 290 },
        { name: 'test', status: 'failed', duration: 130 },
        { name: 'deploy', status: 'skipped', duration: 0 }
      ]
    }
  ],
  '2': [
    {
      id: 'build_2_8',
      number: 8,
      status: 'running',
      startTime: '2024-02-15 16:20:00',
      endTime: null,
      duration: null,
      branch: 'develop',
      commitId: 'def456ghi789',
      commitMessage: 'fix: 修复支付模块bug',
      author: 'lisi',
      stages: [
        { name: 'build', status: 'success', duration: 450 },
        { name: 'test', status: 'running', duration: null },
        { name: 'deploy', status: 'pending', duration: null }
      ]
    },
    {
      id: 'build_2_7',
      number: 7,
      status: 'failed',
      startTime: '2024-02-14 10:15:00',
      endTime: '2024-02-14 10:28:00',
      duration: 780,
      branch: 'develop',
      commitId: 'ghi789jkl012',
      commitMessage: 'refactor: 重构订单服务',
      author: 'lisi',
      stages: [
        { name: 'build', status: 'success', duration: 420 },
        { name: 'test', status: 'failed', duration: 360 },
        { name: 'deploy', status: 'skipped', duration: 0 }
      ]
    }
  ],
  '3': []
};

// 构建日志数据
const buildLogsData = {
  'build_1_15': {
    build: [
      '[2024-01-15 14:30:05] Starting build process...',
      '[2024-01-15 14:30:06] Installing dependencies...',
      '[2024-01-15 14:30:45] Dependencies installed successfully',
      '[2024-01-15 14:30:46] Running build command...',
      '[2024-01-15 14:32:30] Build completed successfully',
      '[2024-01-15 14:32:31] Build artifacts created'
    ],
    test: [
      '[2024-01-15 14:32:35] Starting test execution...',
      '[2024-01-15 14:32:36] Running unit tests...',
      '[2024-01-15 14:34:20] All tests passed (45/45)',
      '[2024-01-15 14:34:21] Generating coverage report...',
      '[2024-01-15 14:34:55] Coverage: 85.2%'
    ],
    deploy: [
      '[2024-01-15 14:35:00] Starting deployment...',
      '[2024-01-15 14:35:01] Building Docker image...',
      '[2024-01-15 14:37:30] Docker image built successfully',
      '[2024-01-15 14:37:31] Pushing to registry...',
      '[2024-01-15 14:40:15] Image pushed successfully',
      '[2024-01-15 14:40:16] Deploying to Kubernetes...',
      '[2024-01-15 14:44:30] Deployment completed successfully'
    ]
  },
  'build_2_8': {
    build: [
      '[2024-02-15 16:20:05] Starting build process...',
      '[2024-02-15 16:20:06] Compiling Java sources...',
      '[2024-02-15 16:22:30] Compilation completed',
      '[2024-02-15 16:22:31] Running Maven package...',
      '[2024-02-15 16:27:45] Package created successfully'
    ],
    test: [
      '[2024-02-15 16:27:50] Starting test execution...',
      '[2024-02-15 16:27:51] Running unit tests...',
      '[2024-02-15 16:29:20] Tests in progress... (15/32 completed)'
    ]
  }
};

export default [
  /**
   * 获取流水线配置
   */
  {
    url: '/jeecgboot/project/pipeline/config/get',
    method: 'get',
    response: ({ query }) => {
      const { projectId } = query;
      const config = pipelineConfigData[projectId];
      if (config) {
        return resultSuccess(config);
      }
      return resultError('项目不存在');
    },
  },

  /**
   * 保存流水线配置
   */
  {
    url: '/jeecgboot/project/pipeline/config/save',
    method: 'post',
    response: ({ body }) => {
      const { projectId, config } = body;
      if (projectId && config) {
        pipelineConfigData[projectId] = config;
        return resultSuccess('配置保存成功');
      }
      return resultError('参数错误');
    },
  },

  /**
   * 切换流水线启用状态
   */
  {
    url: '/jeecgboot/project/pipeline/config/toggle',
    method: 'post',
    response: ({ body }) => {
      const { projectId, enabled } = body;
      if (projectId && pipelineConfigData[projectId]) {
        pipelineConfigData[projectId].enabled = enabled;
        return resultSuccess('状态切换成功');
      }
      return resultError('项目不存在');
    },
  },

  /**
   * 获取流水线状态
   */
  {
    url: '/jeecgboot/project/pipeline/status',
    method: 'get',
    response: ({ query }) => {
      const { projectId } = query;
      const status = pipelineStatusData[projectId];
      if (status) {
        return resultSuccess(status);
      }
      return resultError('项目不存在');
    },
  },

  /**
   * 获取流水线历史
   */
  {
    url: '/jeecgboot/project/pipeline/history',
    method: 'get',
    response: ({ query }) => {
      const { projectId, page = 1, pageSize = 10, status, branch } = query;
      let history = pipelineHistoryData[projectId] || [];

      // 根据状态过滤
      if (status) {
        history = history.filter(item => item.status === status);
      }

      // 根据分支过滤
      if (branch) {
        history = history.filter(item => item.branch === branch);
      }

      // 分页处理
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const records = history.slice(start, end);

      return resultSuccess({
        records,
        total: history.length,
        size: pageSize,
        current: page,
        pages: Math.ceil(history.length / pageSize)
      });
    },
  },

  /**
   * 获取构建详情
   */
  {
    url: /\/jeecgboot\/project\/pipeline\/build\/(.+)\/(.+)/,
    method: 'get',
    response: ({ url }) => {
      const matches = url.match(/\/jeecgboot\/project\/pipeline\/build\/(.+)\/(.+)/);
      if (matches) {
        const [, projectId, buildId] = matches;
        const history = pipelineHistoryData[projectId] || [];
        const build = history.find(item => item.id === buildId);
        if (build) {
          return resultSuccess(build);
        }
      }
      return resultError('构建不存在');
    },
  },

  /**
   * 删除构建记录
   */
  {
    url: /\/jeecgboot\/project\/pipeline\/build\/delete\/(.+)\/(.+)/,
    method: 'delete',
    response: ({ url }) => {
      const matches = url.match(/\/jeecgboot\/project\/pipeline\/build\/delete\/(.+)\/(.+)/);
      if (matches) {
        const [, projectId, buildId] = matches;
        const history = pipelineHistoryData[projectId] || [];
        const index = history.findIndex(item => item.id === buildId);
        if (index !== -1) {
          history.splice(index, 1);
          return resultSuccess('删除成功');
        }
      }
      return resultError('构建不存在');
    },
  },

  /**
   * 批量删除构建记录
   */
  {
    url: /\/jeecgboot\/project\/pipeline\/build\/batch-delete\/(.+)/,
    method: 'delete',
    response: ({ url, body }) => {
      const matches = url.match(/\/jeecgboot\/project\/pipeline\/build\/batch-delete\/(.+)/);
      if (matches) {
        const [, projectId] = matches;
        const { buildIds } = body;
        const history = pipelineHistoryData[projectId] || [];
        
        buildIds.forEach(buildId => {
          const index = history.findIndex(item => item.id === buildId);
          if (index !== -1) {
            history.splice(index, 1);
          }
        });
        
        return resultSuccess('批量删除成功');
      }
      return resultError('项目不存在');
    },
  },

  /**
   * 触发流水线
   */
  {
    url: '/jeecgboot/project/pipeline/trigger',
    method: 'post',
    response: ({ body }) => {
      const { projectId, environment, branch = 'main', parameters = {} } = body;
      
      if (!pipelineConfigData[projectId] || !pipelineConfigData[projectId].enabled) {
        return resultError('流水线未启用');
      }

      // 生成新的构建ID
      const buildId = `build_${projectId}_${Date.now()}`;
      const buildNumber = (pipelineHistoryData[projectId]?.length || 0) + 1;

      // 创建新构建记录
      const newBuild = {
        id: buildId,
        number: buildNumber,
        status: 'running',
        startTime: new Date().toLocaleString(),
        endTime: null,
        duration: null,
        branch,
        commitId: 'new' + Math.random().toString(36).substr(2, 9),
        commitMessage: 'Triggered manually',
        author: 'admin',
        stages: pipelineConfigData[projectId].stages.map(stage => ({
          name: stage.name,
          status: stage.name === 'build' ? 'running' : 'pending',
          duration: null
        }))
      };

      // 添加到历史记录
      if (!pipelineHistoryData[projectId]) {
        pipelineHistoryData[projectId] = [];
      }
      pipelineHistoryData[projectId].unshift(newBuild);

      // 更新状态
      pipelineStatusData[projectId] = {
        ...pipelineStatusData[projectId],
        isRunning: true,
        currentBuild: newBuild
      };

      return resultSuccess({
        buildId,
        buildNumber,
        message: '流水线已触发'
      });
    },
  },

  /**
   * 取消流水线
   */
  {
    url: /\/jeecgboot\/project\/pipeline\/cancel\/(.+)\/(.+)/,
    method: 'post',
    response: ({ url }) => {
      const matches = url.match(/\/jeecgboot\/project\/pipeline\/cancel\/(.+)\/(.+)/);
      if (matches) {
        const [, projectId, buildId] = matches;
        
        // 更新构建状态
        const history = pipelineHistoryData[projectId] || [];
        const build = history.find(item => item.id === buildId);
        if (build && build.status === 'running') {
          build.status = 'cancelled';
          build.endTime = new Date().toLocaleString();
          
          // 更新流水线状态
          if (pipelineStatusData[projectId]?.currentBuild?.id === buildId) {
            pipelineStatusData[projectId].isRunning = false;
            pipelineStatusData[projectId].currentBuild = null;
          }
          
          return resultSuccess('流水线已取消');
        }
      }
      return resultError('构建不存在或无法取消');
    },
  },

  /**
   * 重试构建
   */
  {
    url: /\/jeecgboot\/project\/pipeline\/build\/retry\/(.+)\/(.+)/,
    method: 'post',
    response: ({ url }) => {
      const matches = url.match(/\/jeecgboot\/project\/pipeline\/build\/retry\/(.+)\/(.+)/);
      if (matches) {
        const [, projectId, buildId] = matches;
        const history = pipelineHistoryData[projectId] || [];
        const originalBuild = history.find(item => item.id === buildId);
        
        if (originalBuild) {
          // 创建新的重试构建
          const retryBuildId = `build_${projectId}_${Date.now()}`;
          const retryBuild = {
            ...originalBuild,
            id: retryBuildId,
            number: history.length + 1,
            status: 'running',
            startTime: new Date().toLocaleString(),
            endTime: null,
            duration: null,
            stages: originalBuild.stages.map(stage => ({
              ...stage,
              status: stage.name === 'build' ? 'running' : 'pending',
              duration: null
            }))
          };
          
          history.unshift(retryBuild);
          
          // 更新状态
          pipelineStatusData[projectId] = {
            ...pipelineStatusData[projectId],
            isRunning: true,
            currentBuild: retryBuild
          };
          
          return resultSuccess({
            buildId: retryBuildId,
            message: '重试构建已启动'
          });
        }
      }
      return resultError('构建不存在');
    },
  },

  /**
   * 继续阶段
   */
  {
    url: /\/jeecgboot\/project\/pipeline\/stage\/continue\/(.+)\/(.+)\/(.+)/,
    method: 'post',
    response: ({ url }) => {
      const matches = url.match(/\/jeecgboot\/project\/pipeline\/stage\/continue\/(.+)\/(.+)\/(.+)/);
      if (matches) {
        const [, projectId, buildId, stageName] = matches;
        const history = pipelineHistoryData[projectId] || [];
        const build = history.find(item => item.id === buildId);
        
        if (build) {
          const stage = build.stages.find(s => s.name === stageName);
          if (stage && stage.status === 'waiting') {
            stage.status = 'running';
            return resultSuccess('阶段已继续');
          }
        }
      }
      return resultError('阶段不存在或无法继续');
    },
  },

  /**
   * 重试阶段
   */
  {
    url: /\/jeecgboot\/project\/pipeline\/retry\/(.+)\/(.+)\/(.+)/,
    method: 'post',
    response: ({ url }) => {
      const matches = url.match(/\/jeecgboot\/project\/pipeline\/retry\/(.+)\/(.+)\/(.+)/);
      if (matches) {
        const [, projectId, buildId, stageName] = matches;
        const history = pipelineHistoryData[projectId] || [];
        const build = history.find(item => item.id === buildId);
        
        if (build) {
          const stage = build.stages.find(s => s.name === stageName);
          if (stage && stage.status === 'failed') {
            stage.status = 'running';
            stage.duration = null;
            return resultSuccess('阶段重试已启动');
          }
        }
      }
      return resultError('阶段不存在或无法重试');
    },
  },

  /**
   * 跳过阶段
   */
  {
    url: /\/jeecgboot\/project\/pipeline\/skip\/(.+)\/(.+)\/(.+)/,
    method: 'post',
    response: ({ url }) => {
      const matches = url.match(/\/jeecgboot\/project\/pipeline\/skip\/(.+)\/(.+)\/(.+)/);
      if (matches) {
        const [, projectId, buildId, stageName] = matches;
        const history = pipelineHistoryData[projectId] || [];
        const build = history.find(item => item.id === buildId);
        
        if (build) {
          const stage = build.stages.find(s => s.name === stageName);
          if (stage && (stage.status === 'pending' || stage.status === 'waiting')) {
            stage.status = 'skipped';
            stage.duration = 0;
            return resultSuccess('阶段已跳过');
          }
        }
      }
      return resultError('阶段不存在或无法跳过');
    },
  },

  /**
   * 取消阶段
   */
  {
    url: /\/jeecgboot\/project\/pipeline\/stage\/cancel\/(.+)\/(.+)\/(.+)/,
    method: 'post',
    response: ({ url }) => {
      const matches = url.match(/\/jeecgboot\/project\/pipeline\/stage\/cancel\/(.+)\/(.+)\/(.+)/);
      if (matches) {
        const [, projectId, buildId, stageName] = matches;
        const history = pipelineHistoryData[projectId] || [];
        const build = history.find(item => item.id === buildId);
        
        if (build) {
          const stage = build.stages.find(s => s.name === stageName);
          if (stage && stage.status === 'running') {
            stage.status = 'cancelled';
            return resultSuccess('阶段已取消');
          }
        }
      }
      return resultError('阶段不存在或无法取消');
    },
  },

  /**
   * 获取阶段日志
   */
  {
    url: /\/jeecgboot\/project\/pipeline\/logs\/(.+)\/(.+)\/(.+)/,
    method: 'get',
    response: ({ url, query }) => {
      const matches = url.match(/\/jeecgboot\/project\/pipeline\/logs\/(.+)\/(.+)\/(.+)/);
      if (matches) {
        const [, projectId, buildId, stageName] = matches;
        const { offset = 0, limit = 100 } = query;
        
        const logs = buildLogsData[buildId]?.[stageName] || [];
        const start = parseInt(offset);
        const end = start + parseInt(limit);
        const slicedLogs = logs.slice(start, end);
        
        return resultSuccess({
          logs: slicedLogs,
          total: logs.length,
          hasMore: end < logs.length
        });
      }
      return resultError('日志不存在');
    },
  },

  /**
   * 获取构建日志
   */
  {
    url: /\/jeecgboot\/project\/pipeline\/logs\/(.+)\/(.+)/,
    method: 'get',
    response: ({ url, query }) => {
      const matches = url.match(/\/jeecgboot\/project\/pipeline\/logs\/(.+)\/(.+)/);
      if (matches) {
        const [, projectId, buildId] = matches;
        const { offset = 0, limit = 100 } = query;
        
        const buildLogs = buildLogsData[buildId];
        if (buildLogs) {
          // 合并所有阶段的日志
          const allLogs = Object.values(buildLogs).flat();
          const start = parseInt(offset);
          const end = start + parseInt(limit);
          const slicedLogs = allLogs.slice(start, end);
          
          return resultSuccess({
            logs: slicedLogs,
            total: allLogs.length,
            hasMore: end < allLogs.length
          });
        }
      }
      return resultError('日志不存在');
    },
  },

  /**
   * 下载构建日志
   */
  {
    url: /\/jeecgboot\/project\/pipeline\/build\/logs\/download\/(.+)\/(.+)/,
    method: 'get',
    response: ({ url }) => {
      const matches = url.match(/\/jeecgboot\/project\/pipeline\/build\/logs\/download\/(.+)\/(.+)/);
      if (matches) {
        const [, projectId, buildId] = matches;
        const buildLogs = buildLogsData[buildId];
        
        if (buildLogs) {
          const allLogs = Object.entries(buildLogs)
            .map(([stage, logs]) => [
              `=== ${stage.toUpperCase()} STAGE ===`,
              ...logs,
              ''
            ])
            .flat()
            .join('\n');
          
          return resultSuccess({
            fileName: `build_${buildId}_logs.txt`,
            content: allLogs,
            contentType: 'text/plain'
          });
        }
      }
      return resultError('日志不存在');
    },
  },

  /**
   * 批量下载日志
   */
  {
    url: /\/jeecgboot\/project\/pipeline\/build\/batch-download\/(.+)/,
    method: 'post',
    response: ({ url, body }) => {
      const matches = url.match(/\/jeecgboot\/project\/pipeline\/build\/batch-download\/(.+)/);
      if (matches) {
        const [, projectId] = matches;
        const { buildIds } = body;
        
        const zipContent = buildIds.map(buildId => {
          const buildLogs = buildLogsData[buildId];
          if (buildLogs) {
            const allLogs = Object.entries(buildLogs)
              .map(([stage, logs]) => [
                `=== ${stage.toUpperCase()} STAGE ===`,
                ...logs,
                ''
              ])
              .flat()
              .join('\n');
            
            return {
              fileName: `build_${buildId}_logs.txt`,
              content: allLogs
            };
          }
          return null;
        }).filter(Boolean);
        
        return resultSuccess({
          fileName: `project_${projectId}_logs.zip`,
          files: zipContent,
          contentType: 'application/zip'
        });
      }
      return resultError('项目不存在');
    },
  },
] as MockMethod[];