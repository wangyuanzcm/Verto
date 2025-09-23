import { MockMethod } from 'vite-plugin-mock';
import { resultPageSuccess, resultSuccess } from './_util';

/**
 * 配置管理模拟数据
 */

// 流水线配置数据
const pipelineConfigs = [
  {
    id: '1',
    name: 'Verto平台CI/CD流水线',
    type: 'pipeline',
    status: 'enabled',
    environment: 'prod',
    description: '生产环境自动化部署流水线，包含构建、测试、部署等阶段',
    appId: '1',
    config: {
      stages: [
        {
          id: 'build',
          name: '构建阶段',
          type: 'build',
          script: 'npm install && npm run build',
          image: 'node:18-alpine',
          timeout: 600,
          retryCount: 2
        },
        {
          id: 'test',
          name: '测试阶段',
          type: 'test',
          script: 'npm run test:unit && npm run test:e2e',
          image: 'node:18-alpine',
          dependencies: ['build'],
          timeout: 300,
          retryCount: 1
        },
        {
          id: 'deploy',
          name: '部署阶段',
          type: 'deploy',
          script: 'docker build -t verto-platform . && docker push registry.company.com/verto-platform',
          image: 'docker:latest',
          dependencies: ['test'],
          timeout: 900,
          retryCount: 1
        }
      ],
      triggers: [
        {
          type: 'push',
          branches: ['main', 'release/*'],
          conditions: { pathFilter: ['src/**', 'package.json'] }
        },
        {
          type: 'schedule',
          schedule: '0 2 * * *',
          branches: ['main']
        }
      ],
      variables: [
        { key: 'NODE_ENV', value: 'production', type: 'env', protected: false, masked: false },
        { key: 'API_URL', value: 'https://api.company.com', type: 'env', protected: false, masked: false },
        { key: 'DB_PASSWORD', value: '***', type: 'env', protected: true, masked: true }
      ],
      notifications: [
        {
          type: 'email',
          recipients: ['dev-team@company.com'],
          events: ['success', 'failure'],
          template: 'default'
        },
        {
          type: 'slack',
          recipients: ['#deployment'],
          events: ['failure'],
          template: 'error'
        }
      ]
    },
    createdBy: 'admin',
    createdTime: '2024-01-15 10:30:00',
    updatedBy: 'admin',
    updatedTime: '2024-01-25 14:20:00'
  },
  {
    id: '2',
    name: '用户中心测试流水线',
    type: 'pipeline',
    status: 'enabled',
    environment: 'test',
    description: '测试环境自动化测试流水线',
    appId: '2',
    config: {
      stages: [
        {
          id: 'build',
          name: '构建阶段',
          type: 'build',
          script: 'npm install && npm run build',
          image: 'node:18-alpine',
          timeout: 300,
          retryCount: 1
        }
      ],
      triggers: [
        {
          type: 'push',
          branches: ['develop', 'test/*'],
          conditions: { pathFilter: ['src/**'] }
        }
      ],
      variables: [
        { key: 'NODE_ENV', value: 'test', type: 'env', protected: false, masked: false }
      ],
      notifications: [
        {
          type: 'email',
          recipients: ['test-team@company.com'],
          events: ['failure'],
          template: 'default'
        }
      ]
    },
    createdBy: 'admin',
    createdTime: '2024-01-20 09:15:00',
    updatedBy: 'admin',
    updatedTime: '2024-01-20 09:15:00'
  }
];

// 埋点配置数据
const trackingConfigs = [
  {
    id: '3',
    name: '用户行为埋点配置',
    type: 'tracking',
    status: 'enabled',
    environment: 'prod',
    description: '用户行为数据收集和分析配置',
    appId: '1',
    config: {
      events: [
        {
          name: 'page_view',
          description: '页面浏览事件',
          properties: ['page_url', 'page_title', 'user_id', 'timestamp'],
          filters: [
            { field: 'page_url', operator: 'contains', value: '/dashboard' }
          ]
        },
        {
          name: 'button_click',
          description: '按钮点击事件',
          properties: ['button_id', 'button_text', 'page_url', 'user_id'],
          filters: [
            { field: 'button_id', operator: 'not_empty', value: '' }
          ]
        }
      ],
      properties: [
        { name: 'user_id', type: 'string', required: true, description: '用户ID' },
        { name: 'page_url', type: 'string', required: true, description: '页面URL' },
        { name: 'timestamp', type: 'number', required: true, description: '时间戳' }
      ],
      filters: [
        { field: 'user_id', operator: 'not_empty', value: '' },
        { field: 'page_url', operator: 'regex', value: '^https?://' }
      ]
    },
    createdBy: 'admin',
    createdTime: '2024-01-18 14:30:00',
    updatedBy: 'admin',
    updatedTime: '2024-01-22 16:45:00'
  }
];

// 代码审查配置数据
const codeReviewConfigs = [
  {
    id: '4',
    name: '代码质量审查规则',
    type: 'code_review',
    status: 'enabled',
    environment: 'prod',
    description: '自动化代码质量检查和审查规则配置',
    appId: '1',
    config: {
      rules: [
        {
          name: 'complexity',
          description: '代码复杂度检查',
          enabled: true,
          threshold: 10,
          severity: 'warning'
        },
        {
          name: 'coverage',
          description: '测试覆盖率检查',
          enabled: true,
          threshold: 80,
          severity: 'error'
        },
        {
          name: 'security',
          description: '安全漏洞检查',
          enabled: true,
          threshold: 0,
          severity: 'error'
        }
      ],
      reviewers: [
        { name: '张三', email: 'zhangsan@company.com', role: 'senior' },
        { name: '李四', email: 'lisi@company.com', role: 'lead' }
      ],
      autoAssign: true,
      requireApproval: 2,
      blockMerge: true
    },
    createdBy: 'admin',
    createdTime: '2024-01-16 11:20:00',
    updatedBy: 'admin',
    updatedTime: '2024-01-24 13:10:00'
  }
];

// 合并所有配置数据
const allConfigs = [...pipelineConfigs, ...trackingConfigs, ...codeReviewConfigs];

/**
 * 生成随机ID
 */
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}



export default [
  // 获取配置列表
  {
    url: '/jeecgboot/super/config/list',
    method: 'get',
    response: ({ query }) => {
      console.log('=== Mock Config List Request ===');
      console.log('Query params:', query);
      console.log('allConfigs length:', allConfigs.length);
      console.log('allConfigs sample:', allConfigs[0]);
      
      const { pageNo = 1, pageSize = 10, type, status, environment, name, appId } = query;
      
      let filteredConfigs = [...allConfigs];
      
      // 应用过滤条件
      if (type) {
        filteredConfigs = filteredConfigs.filter(config => config.type === type);
      }
      if (status) {
        filteredConfigs = filteredConfigs.filter(config => config.status === status);
      }
      if (environment) {
        filteredConfigs = filteredConfigs.filter(config => config.environment === environment);
      }
      if (name) {
        filteredConfigs = filteredConfigs.filter(config => 
          config.name.toLowerCase().includes(name.toLowerCase())
        );
      }
      if (appId) {
        filteredConfigs = filteredConfigs.filter(config => config.appId === appId);
      }
      
      console.log('filteredConfigs length:', filteredConfigs.length);
      
      const result = resultPageSuccess(Number(pageNo), Number(pageSize), filteredConfigs);
      console.log('Final result:', JSON.stringify(result, null, 2));
      console.log('=== End Mock Response ===');
      
      return result;
    },
  },

  // 保存配置
  {
    url: '/jeecgboot/super/config/save',
    method: 'post',
    response: ({ body }) => {
      
      const config = body;
      
      if (config.id) {
        // 更新现有配置
        const index = allConfigs.findIndex(c => c.id === config.id);
        if (index !== -1) {
          allConfigs[index] = { ...allConfigs[index], ...config, updatedTime: new Date().toLocaleString() };
        }
      } else {
        // 创建新配置
        const newConfig = {
          ...config,
          id: generateId(),
          createdBy: 'admin',
          createdTime: new Date().toLocaleString(),
          updatedBy: 'admin',
          updatedTime: new Date().toLocaleString()
        };
        allConfigs.push(newConfig);
      }
      
      return resultSuccess(null, { message: '保存成功' });
    },
  },

  // 删除配置
  {
    url: '/jeecgboot/super/config/delete',
    method: 'delete',
    response: ({ query }) => {
      
      const { id } = query;
      const index = allConfigs.findIndex(config => config.id === id);
      if (index !== -1) {
        allConfigs.splice(index, 1);
      }
      
      return resultSuccess(null, { message: '删除成功' });
    },
  },

  // 获取配置详情
  {
    url: '/jeecgboot/super/config/detail',
    method: 'get',
    response: ({ query }) => {
      const { id } = query;
      const config = allConfigs.find(c => c.id === id);
      
      return resultSuccess(config || null);
    },
  },

  // 复制配置
  {
    url: '/jeecgboot/super/config/copy',
    method: 'post',
    response: ({ body }) => {
      const { id } = body;
      const originalConfig = allConfigs.find(c => c.id === id);
      
      if (originalConfig) {
        const newConfig = {
          ...originalConfig,
          id: generateId(),
          name: `${originalConfig.name} - 副本`,
          status: 'disabled',
          createdBy: 'admin',
          createdTime: new Date().toLocaleString(),
          updatedBy: 'admin',
          updatedTime: new Date().toLocaleString()
        };
        allConfigs.push(newConfig);
        
        return resultSuccess(newConfig, { message: '复制成功' });
      }
      
      return resultSuccess(null, { message: '配置不存在' });
    },
  },

  // 部署配置
  {
    url: '/jeecgboot/super/config/deploy',
    method: 'post',
    response: ({ body }) => {
      const { id } = body;
      const config = allConfigs.find(c => c.id === id);
      
      if (config) {
        // 模拟部署过程
        return resultSuccess({ deployId: generateId(), status: 'deploying' }, { message: '部署已启动' });
      }
      
      return resultSuccess(null, { message: '配置不存在' });
    },
  },

  // 回滚配置
  {
    url: '/jeecgboot/super/config/rollback',
    method: 'post',
    response: ({ body }) => {
      
      const { id, version } = body;
      
      return resultSuccess({ rollbackId: generateId(), status: 'rolling_back' }, { message: '回滚已启动' });
    },
  },

  // 验证配置
  {
    url: '/jeecgboot/super/config/validate',
    method: 'post',
    response: ({ body }) => {
      
      const config = body;
      const errors = [];
      
      // 模拟配置验证
      if (!config.name) {
        errors.push({ field: 'name', message: '配置名称不能为空' });
      }
      if (!config.type) {
        errors.push({ field: 'type', message: '配置类型不能为空' });
      }
      
      const isValid = errors.length === 0;
      
      return resultSuccess({
        valid: isValid,
        errors: errors,
        warnings: isValid ? [] : [{ field: 'general', message: '请检查配置项' }]
      });
    },
  },

  // 导出配置
  {
    url: '/jeecgboot/super/config/export',
    method: 'post',
    response: ({ body }) => {
      
      const { ids } = body;
      const configs = allConfigs.filter(c => ids.includes(c.id));
      
      return resultSuccess({
        downloadUrl: '/api/download/configs.json',
        filename: `configs_${new Date().getTime()}.json`,
        size: JSON.stringify(configs).length
      }, { message: '导出成功' });
    },
  },

  // 导入配置
  {
    url: '/jeecgboot/super/config/import',
    method: 'post',
    response: ({ body }) => {
      
      const { configs } = body;
      let successCount = 0;
      let errorCount = 0;
      
      configs.forEach(config => {
        try {
          const newConfig = {
            ...config,
            id: generateId(),
            createdBy: 'admin',
            createdTime: new Date().toLocaleString(),
            updatedBy: 'admin',
            updatedTime: new Date().toLocaleString()
          };
          allConfigs.push(newConfig);
          successCount++;
        } catch (error) {
          errorCount++;
        }
      });
      
      return resultSuccess({ successCount, errorCount }, { message: `导入完成，成功${successCount}个，失败${errorCount}个` });
    },
  },

  // 获取配置历史
  {
    url: '/jeecgboot/super/config/history',
    method: 'get',
    response: ({ query }) => {
      
      const { id, pageNo = 1, pageSize = 10 } = query;
      
      // 模拟历史记录
      const history = [
        {
          id: '1',
          configId: id,
          version: 'v1.2.0',
          changeType: 'update',
          description: '更新流水线配置',
          operator: 'admin',
          operateTime: '2024-01-25 14:20:00',
          changes: [
            { field: 'timeout', oldValue: '300', newValue: '600' },
            { field: 'retryCount', oldValue: '1', newValue: '2' }
          ]
        },
        {
          id: '2',
          configId: id,
          version: 'v1.1.0',
          changeType: 'create',
          description: '创建流水线配置',
          operator: 'admin',
          operateTime: '2024-01-15 10:30:00',
          changes: []
        }
      ];
      
      return resultPageSuccess(Number(pageNo), Number(pageSize), history);
    },
  },

  // 预览配置
  {
    url: '/jeecgboot/super/config/preview',
    method: 'get',
    response: ({ query }) => {
      
      const { id } = query;
      const config = allConfigs.find(c => c.id === id);
      
      if (config) {
        return resultSuccess({
          config: config,
          preview: {
            yaml: `# ${config.name}\napiVersion: v1\nkind: Config\nmetadata:\n  name: ${config.name}\nspec:\n  type: ${config.type}\n  status: ${config.status}`,
            json: JSON.stringify(config, null, 2)
          }
        });
      }
      
      return resultSuccess(null);
    },
  }
] as MockMethod[];