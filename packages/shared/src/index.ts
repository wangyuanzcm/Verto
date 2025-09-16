// 导出所有类型定义
export * from './types';

// 导出所有工具函数
export * from './utils';

// 导出常量定义
export const APP_NAME = 'Verto';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = '前端全流程管理平台';

// API 相关常量
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.verto.com' 
  : 'http://localhost:3000';

export const API_TIMEOUT = 30000; // 30秒

// 分页相关常量
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// 文件上传相关常量
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// 权限相关常量
export const PERMISSIONS = {
  // 用户管理
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // 角色管理
  ROLE_VIEW: 'role:view',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  
  // 项目管理
  PROJECT_VIEW: 'project:view',
  PROJECT_CREATE: 'project:create',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_DEPLOY: 'project:deploy',
  
  // 需求管理
  REQUIREMENT_VIEW: 'requirement:view',
  REQUIREMENT_CREATE: 'requirement:create',
  REQUIREMENT_UPDATE: 'requirement:update',
  REQUIREMENT_DELETE: 'requirement:delete',
  
  // 原型设计
  PROTOTYPE_VIEW: 'prototype:view',
  PROTOTYPE_CREATE: 'prototype:create',
  PROTOTYPE_UPDATE: 'prototype:update',
  PROTOTYPE_DELETE: 'prototype:delete',
  
  // 物料管理
  MATERIAL_VIEW: 'material:view',
  MATERIAL_CREATE: 'material:create',
  MATERIAL_UPDATE: 'material:update',
  MATERIAL_DELETE: 'material:delete',
  MATERIAL_PUBLISH: 'material:publish',
  
  // 系统管理
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_LOG: 'system:log',
  SYSTEM_MONITOR: 'system:monitor'
} as const;

// 状态映射
export const STATUS_LABELS = {
  // 用户状态
  USER_STATUS: {
    0: '禁用',
    1: '启用'
  },
  
  // 项目状态
  PROJECT_STATUS: {
    draft: '草稿',
    active: '活跃',
    archived: '已归档',
    deleted: '已删除'
  },
  
  // 需求状态
  REQUIREMENT_STATUS: {
    draft: '草稿',
    open: '开放',
    in_progress: '进行中',
    review: '评审中',
    testing: '测试中',
    done: '已完成',
    closed: '已关闭'
  },
  
  // 需求优先级
  REQUIREMENT_PRIORITY: {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  },
  
  // 需求类型
  REQUIREMENT_TYPE: {
    feature: '功能',
    bug: '缺陷',
    improvement: '改进',
    task: '任务'
  },
  
  // 物料状态
  MATERIAL_STATUS: {
    draft: '草稿',
    published: '已发布',
    deprecated: '已废弃'
  },
  
  // 物料类型
  MATERIAL_TYPE: {
    component: '组件',
    template: '模板',
    snippet: '代码片段',
    hook: 'Hook',
    util: '工具函数'
  }
} as const;

// 颜色主题
export const THEME_COLORS = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  info: '#1890ff',
  text: {
    primary: 'rgba(0, 0, 0, 0.85)',
    secondary: 'rgba(0, 0, 0, 0.65)',
    disabled: 'rgba(0, 0, 0, 0.25)'
  },
  border: {
    base: '#d9d9d9',
    split: '#f0f0f0'
  },
  background: {
    base: '#ffffff',
    light: '#fafafa',
    dark: '#001529'
  }
} as const;

// 正则表达式常量
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^1[3-9]\d{9}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PROJECT_CODE: /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/,
  VERSION: /^\d+\.\d+\.\d+$/
} as const;