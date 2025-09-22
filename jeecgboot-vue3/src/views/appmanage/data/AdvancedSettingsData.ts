import { FormSchema } from '/@/components/Form';

// 系统配置表单
export const systemFormSchema: FormSchema[] = [
  {
    field: 'appName',
    label: '应用名称',
    component: 'Input',
    defaultValue: '示例应用',
    componentProps: {
      placeholder: '请输入应用名称',
    },
    rules: [{ required: true, message: '请输入应用名称' }],
  },
  {
    field: 'appDescription',
    label: '应用描述',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入应用描述',
      rows: 3,
    },
  },
  {
    field: 'environment',
    label: '运行环境',
    component: 'Select',
    defaultValue: 'production',
    componentProps: {
      options: [
        { label: '开发环境', value: 'development' },
        { label: '测试环境', value: 'testing' },
        { label: '预发布环境', value: 'staging' },
        { label: '生产环境', value: 'production' },
      ],
    },
    rules: [{ required: true, message: '请选择运行环境' }],
  },
  {
    field: 'logLevel',
    label: '日志级别',
    component: 'Select',
    defaultValue: 'info',
    componentProps: {
      options: [
        { label: 'Debug', value: 'debug' },
        { label: 'Info', value: 'info' },
        { label: 'Warn', value: 'warn' },
        { label: 'Error', value: 'error' },
      ],
    },
  },
  {
    field: 'timezone',
    label: '时区设置',
    component: 'Select',
    defaultValue: 'Asia/Shanghai',
    componentProps: {
      options: [
        { label: '北京时间 (UTC+8)', value: 'Asia/Shanghai' },
        { label: '东京时间 (UTC+9)', value: 'Asia/Tokyo' },
        { label: '纽约时间 (UTC-5)', value: 'America/New_York' },
        { label: '伦敦时间 (UTC+0)', value: 'Europe/London' },
      ],
    },
  },
  {
    field: 'autoBackup',
    label: '自动备份',
    component: 'Switch',
    defaultValue: true,
  },
];

// 安全配置表单
export const securityFormSchema: FormSchema[] = [
  {
    field: 'enableHttps',
    label: '启用HTTPS',
    component: 'Switch',
    defaultValue: true,
  },
  {
    field: 'sessionTimeout',
    label: '会话超时(分钟)',
    component: 'InputNumber',
    defaultValue: 30,
    componentProps: {
      min: 5,
      max: 1440,
      placeholder: '请输入会话超时时间',
    },
  },
  {
    field: 'maxLoginAttempts',
    label: '最大登录尝试次数',
    component: 'InputNumber',
    defaultValue: 5,
    componentProps: {
      min: 1,
      max: 20,
      placeholder: '请输入最大登录尝试次数',
    },
  },
  {
    field: 'passwordPolicy',
    label: '密码策略',
    component: 'Select',
    defaultValue: 'medium',
    componentProps: {
      options: [
        { label: '简单 (6位以上)', value: 'simple' },
        { label: '中等 (8位+数字+字母)', value: 'medium' },
        { label: '复杂 (8位+数字+字母+特殊字符)', value: 'complex' },
      ],
    },
  },
  {
    field: 'enableTwoFactor',
    label: '启用双因子认证',
    component: 'Switch',
    defaultValue: false,
  },
  {
    field: 'ipWhitelist',
    label: 'IP白名单',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入IP地址，每行一个',
      rows: 3,
    },
  },
  {
    field: 'enableAuditLog',
    label: '启用审计日志',
    component: 'Switch',
    defaultValue: true,
  },
];

// 性能配置表单
export const performanceFormSchema: FormSchema[] = [
  {
    field: 'maxConcurrentUsers',
    label: '最大并发用户数',
    component: 'InputNumber',
    defaultValue: 1000,
    componentProps: {
      min: 10,
      max: 10000,
      placeholder: '请输入最大并发用户数',
    },
  },
  {
    field: 'requestTimeout',
    label: '请求超时时间(秒)',
    component: 'InputNumber',
    defaultValue: 30,
    componentProps: {
      min: 5,
      max: 300,
      placeholder: '请输入请求超时时间',
    },
  },
  {
    field: 'cacheStrategy',
    label: '缓存策略',
    component: 'Select',
    defaultValue: 'redis',
    componentProps: {
      options: [
        { label: '内存缓存', value: 'memory' },
        { label: 'Redis缓存', value: 'redis' },
        { label: 'Memcached缓存', value: 'memcached' },
        { label: '不使用缓存', value: 'none' },
      ],
    },
  },
  {
    field: 'cacheExpiration',
    label: '缓存过期时间(小时)',
    component: 'InputNumber',
    defaultValue: 24,
    componentProps: {
      min: 1,
      max: 168,
      placeholder: '请输入缓存过期时间',
    },
  },
  {
    field: 'enableCompression',
    label: '启用数据压缩',
    component: 'Switch',
    defaultValue: true,
  },
  {
    field: 'compressionLevel',
    label: '压缩级别',
    component: 'Select',
    defaultValue: 'medium',
    componentProps: {
      options: [
        { label: '低压缩 (快速)', value: 'low' },
        { label: '中等压缩', value: 'medium' },
        { label: '高压缩 (慢速)', value: 'high' },
      ],
    },
    ifShow: ({ values }) => values.enableCompression,
  },
  {
    field: 'enableCdn',
    label: '启用CDN加速',
    component: 'Switch',
    defaultValue: false,
  },
];

// 监控配置表单
export const monitorFormSchema: FormSchema[] = [
  {
    field: 'enableMonitoring',
    label: '启用系统监控',
    component: 'Switch',
    defaultValue: true,
  },
  {
    field: 'monitoringInterval',
    label: '监控间隔(秒)',
    component: 'InputNumber',
    defaultValue: 60,
    componentProps: {
      min: 10,
      max: 3600,
      placeholder: '请输入监控间隔',
    },
    ifShow: ({ values }) => values.enableMonitoring,
  },
  {
    field: 'alertThreshold',
    label: '告警阈值',
    component: 'InputGroup',
    ifShow: ({ values }) => values.enableMonitoring,
    slot: 'alertThreshold',
  },
  {
    field: 'cpuThreshold',
    label: 'CPU使用率告警阈值(%)',
    component: 'InputNumber',
    defaultValue: 80,
    componentProps: {
      min: 50,
      max: 95,
      placeholder: '请输入CPU告警阈值',
    },
    ifShow: ({ values }) => values.enableMonitoring,
  },
  {
    field: 'memoryThreshold',
    label: '内存使用率告警阈值(%)',
    component: 'InputNumber',
    defaultValue: 85,
    componentProps: {
      min: 50,
      max: 95,
      placeholder: '请输入内存告警阈值',
    },
    ifShow: ({ values }) => values.enableMonitoring,
  },
  {
    field: 'diskThreshold',
    label: '磁盘使用率告警阈值(%)',
    component: 'InputNumber',
    defaultValue: 90,
    componentProps: {
      min: 70,
      max: 95,
      placeholder: '请输入磁盘告警阈值',
    },
    ifShow: ({ values }) => values.enableMonitoring,
  },
  {
    field: 'alertEmail',
    label: '告警邮箱',
    component: 'Input',
    componentProps: {
      placeholder: '请输入告警邮箱地址',
    },
    rules: [
      { type: 'email', message: '请输入正确的邮箱地址' },
    ],
    ifShow: ({ values }) => values.enableMonitoring,
  },
  {
    field: 'enableSms',
    label: '启用短信告警',
    component: 'Switch',
    defaultValue: false,
    ifShow: ({ values }) => values.enableMonitoring,
  },
  {
    field: 'alertPhone',
    label: '告警手机号',
    component: 'Input',
    componentProps: {
      placeholder: '请输入告警手机号',
    },
    rules: [
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
    ],
    ifShow: ({ values }) => values.enableMonitoring && values.enableSms,
  },
];