/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
  PENDING = 'pending',
}

/**
 * 用户角色枚举
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  DESIGNER = 'designer',
  DEVELOPER = 'developer',
  TESTER = 'tester',
  VIEWER = 'viewer',
}

/**
 * 权限类型枚举
 */
export enum PermissionType {
  MENU = 'menu',
  BUTTON = 'button',
  API = 'api',
  DATA = 'data',
}

/**
 * 项目状态枚举
 */
export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  TESTING = 'testing',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}

/**
 * 项目优先级枚举
 */
export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * 需求状态枚举
 */
export enum RequirementStatus {
  DRAFT = 'draft',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_DEVELOPMENT = 'in_development',
  TESTING = 'testing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * 需求类型枚举
 */
export enum RequirementType {
  FUNCTIONAL = 'functional',
  NON_FUNCTIONAL = 'non_functional',
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  UI_UX = 'ui_ux',
}

/**
 * 需求优先级枚举
 */
export enum RequirementPriority {
  P0 = 'p0',
  P1 = 'p1',
  P2 = 'p2',
  P3 = 'p3',
  P4 = 'p4',
}

/**
 * 原型状态枚举
 */
export enum PrototypeStatus {
  DRAFT = 'draft',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/**
 * 原型类型枚举
 */
export enum PrototypeType {
  LOW_FIDELITY = 'low_fidelity',
  HIGH_FIDELITY = 'high_fidelity',
  INTERACTIVE = 'interactive',
  WIREFRAME = 'wireframe',
}

/**
 * 物料类型枚举
 */
export enum MaterialType {
  COMPONENT = 'component',
  TEMPLATE = 'template',
  BLOCK = 'block',
  PAGE = 'page',
  ASSET = 'asset',
}

/**
 * 物料状态枚举
 */
export enum MaterialStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived',
}

/**
 * 文件类型枚举
 */
export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  ARCHIVE = 'archive',
  OTHER = 'other',
}

/**
 * 操作类型枚举
 */
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  IMPORT = 'import',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

/**
 * 通知类型枚举
 */
export enum NotificationType {
  SYSTEM = 'system',
  PROJECT = 'project',
  REQUIREMENT = 'requirement',
  PROTOTYPE = 'prototype',
  MATERIAL = 'material',
  USER = 'user',
}

/**
 * 通知状态枚举
 */
export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
}

/**
 * 审批状态枚举
 */
export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

/**
 * 日志级别枚举
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * 缓存键前缀枚举
 */
export enum CachePrefix {
  USER = 'user:',
  PROJECT = 'project:',
  REQUIREMENT = 'requirement:',
  PROTOTYPE = 'prototype:',
  MATERIAL = 'material:',
  SESSION = 'session:',
  CAPTCHA = 'captcha:',
  RATE_LIMIT = 'rate_limit:',
}

/**
 * 排序方向枚举
 */
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * 性别枚举
 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

/**
 * 语言枚举
 */
export enum Language {
  ZH_CN = 'zh-CN',
  EN_US = 'en-US',
  JA_JP = 'ja-JP',
  KO_KR = 'ko-KR',
}

/**
 * 主题枚举
 */
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}