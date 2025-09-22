/**
 * 流水线管理数据配置
 */
import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';

/**
 * 流水线列表表格列配置
 */
export const pipelineColumns: BasicColumn[] = [
  {
    title: '流水线名称',
    dataIndex: 'pipelineName',
    width: 200,
    align: 'left',
  },
  {
    title: '描述',
    dataIndex: 'description',
    width: 250,
    ellipsis: true,
  },
  {
    title: '触发方式',
    dataIndex: 'triggerType',
    width: 120,
    customRender: ({ record }) => {
      const typeMap = {
        manual: '手动触发',
        push: '代码推送',
        schedule: '定时触发',
        webhook: 'Webhook',
        merge: '合并请求',
      };
      return typeMap[record.triggerType] || record.triggerType;
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    key: 'status',
  },
  {
    title: '最后执行状态',
    dataIndex: 'lastRunStatus',
    width: 120,
    key: 'lastRunStatus',
  },
  {
    title: '最后执行时间',
    dataIndex: 'lastRunTime',
    width: 160,
  },
  {
    title: '执行次数',
    dataIndex: 'runCount',
    width: 100,
    align: 'center',
  },
  {
    title: '成功率',
    dataIndex: 'successRate',
    width: 100,
    align: 'center',
    customRender: ({ record }) => {
      return `${record.successRate}%`;
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 160,
  },
];

/**
 * 流水线表单配置
 */
export const pipelineFormSchema: FormSchema[] = [
  {
    field: 'pipelineName',
    label: '流水线名称',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入流水线名称',
    },
  },
  {
    field: 'description',
    label: '描述',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入流水线描述',
      rows: 3,
    },
  },
  {
    field: 'triggerType',
    label: '触发方式',
    component: 'Select',
    required: true,
    componentProps: {
      placeholder: '请选择触发方式',
      options: [
        { label: '手动触发', value: 'manual' },
        { label: '代码推送', value: 'push' },
        { label: '定时触发', value: 'schedule' },
        { label: 'Webhook', value: 'webhook' },
        { label: '合并请求', value: 'merge' },
      ],
    },
  },
  {
    field: 'triggerCondition',
    label: '触发条件',
    component: 'Input',
    componentProps: {
      placeholder: '请输入触发条件（如分支名、cron表达式等）',
    },
  },
  {
    field: 'steps',
    label: '执行步骤',
    component: 'InputTextArea',
    required: true,
    componentProps: {
      placeholder: '请输入执行步骤配置（JSON格式）',
      rows: 8,
    },
    helpMessage: '请输入有效的JSON格式配置',
  },
  {
    field: 'environment',
    label: '环境变量',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入环境变量配置（JSON格式）',
      rows: 4,
    },
    helpMessage: '请输入有效的JSON格式配置',
  },
  {
    field: 'timeout',
    label: '超时时间',
    component: 'InputNumber',
    defaultValue: 30,
    componentProps: {
      placeholder: '请输入超时时间（分钟）',
      min: 1,
      max: 1440,
      addonAfter: '分钟',
    },
  },
  {
    field: 'retryCount',
    label: '重试次数',
    component: 'InputNumber',
    defaultValue: 0,
    componentProps: {
      placeholder: '请输入重试次数',
      min: 0,
      max: 5,
    },
  },
  {
    field: 'status',
    label: '状态',
    component: 'RadioButtonGroup',
    defaultValue: 'active',
    componentProps: {
      options: [
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' },
      ],
    },
  },
];

/**
 * 流水线模拟数据
 */
export const pipelineData = [
  {
    id: '1',
    pipelineName: '前端构建部署',
    description: '前端项目自动构建和部署流水线',
    triggerType: 'push',
    triggerCondition: 'main',
    steps: [
      { name: '代码检出', command: 'git checkout' },
      { name: '安装依赖', command: 'npm install' },
      { name: '代码检查', command: 'npm run lint' },
      { name: '单元测试', command: 'npm run test' },
      { name: '构建项目', command: 'npm run build' },
      { name: '部署到服务器', command: 'deploy.sh' },
    ],
    environment: {
      NODE_ENV: 'production',
      API_URL: 'https://api.example.com',
    },
    timeout: 30,
    retryCount: 2,
    status: 'active',
    lastRunStatus: 'success',
    lastRunTime: '2024-01-20 14:30:00',
    runCount: 156,
    successRate: 95,
    createTime: '2024-01-10 10:00:00',
  },
  {
    id: '2',
    pipelineName: '后端API测试',
    description: '后端API自动化测试流水线',
    triggerType: 'schedule',
    triggerCondition: '0 2 * * *',
    steps: [
      { name: '代码检出', command: 'git checkout' },
      { name: '启动测试环境', command: 'docker-compose up -d' },
      { name: '运行API测试', command: 'npm run test:api' },
      { name: '生成测试报告', command: 'npm run test:report' },
      { name: '清理环境', command: 'docker-compose down' },
    ],
    environment: {
      TEST_ENV: 'staging',
      DB_URL: 'postgresql://test:test@localhost:5432/testdb',
    },
    timeout: 45,
    retryCount: 1,
    status: 'active',
    lastRunStatus: 'running',
    lastRunTime: '2024-01-21 02:00:00',
    runCount: 89,
    successRate: 92,
    createTime: '2024-01-12 09:15:00',
  },
  {
    id: '3',
    pipelineName: '代码质量检查',
    description: '代码质量和安全性检查流水线',
    triggerType: 'merge',
    triggerCondition: 'develop',
    steps: [
      { name: '代码检出', command: 'git checkout' },
      { name: '代码风格检查', command: 'eslint .' },
      { name: '安全漏洞扫描', command: 'npm audit' },
      { name: '代码覆盖率检查', command: 'npm run coverage' },
      { name: '生成质量报告', command: 'sonar-scanner' },
    ],
    environment: {
      SONAR_TOKEN: '***',
      SONAR_HOST_URL: 'https://sonarqube.example.com',
    },
    timeout: 20,
    retryCount: 0,
    status: 'active',
    lastRunStatus: 'failed',
    lastRunTime: '2024-01-20 16:45:00',
    runCount: 234,
    successRate: 88,
    createTime: '2024-01-14 16:45:00',
  },
  {
    id: '4',
    pipelineName: '数据库备份',
    description: '定时数据库备份流水线',
    triggerType: 'schedule',
    triggerCondition: '0 1 * * 0',
    steps: [
      { name: '连接数据库', command: 'mysql -h localhost -u backup' },
      { name: '创建备份', command: 'mysqldump --all-databases' },
      { name: '压缩备份文件', command: 'gzip backup.sql' },
      { name: '上传到云存储', command: 'aws s3 cp backup.sql.gz s3://backups/' },
      { name: '清理本地文件', command: 'rm backup.sql.gz' },
    ],
    environment: {
      AWS_ACCESS_KEY_ID: '***',
      AWS_SECRET_ACCESS_KEY: '***',
      AWS_REGION: 'us-east-1',
    },
    timeout: 60,
    retryCount: 3,
    status: 'active',
    lastRunStatus: 'success',
    lastRunTime: '2024-01-21 01:00:00',
    runCount: 52,
    successRate: 98,
    createTime: '2024-01-16 13:20:00',
  },
  {
    id: '5',
    pipelineName: '性能测试',
    description: '应用性能压力测试流水线',
    triggerType: 'manual',
    triggerCondition: '',
    steps: [
      { name: '准备测试环境', command: 'docker-compose -f perf-test.yml up -d' },
      { name: '预热应用', command: 'curl -X GET http://localhost:8080/health' },
      { name: '执行压力测试', command: 'jmeter -n -t performance.jmx' },
      { name: '生成性能报告', command: 'jmeter -g results.jtl -o report/' },
      { name: '清理测试环境', command: 'docker-compose -f perf-test.yml down' },
    ],
    environment: {
      JMETER_HOME: '/opt/jmeter',
      TEST_THREADS: '100',
      TEST_DURATION: '300',
    },
    timeout: 90,
    retryCount: 1,
    status: 'inactive',
    lastRunStatus: 'cancelled',
    lastRunTime: '2024-01-19 15:30:00',
    runCount: 23,
    successRate: 87,
    createTime: '2024-01-18 11:30:00',
  },
];