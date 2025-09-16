// 用户相关类型定义
export interface User {
  id: number;
  username: string;
  email: string;
  realName?: string;
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  status: UserStatus;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  emailVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserStatus {
  DISABLED = 0,
  ENABLED = 1,
}

// 角色相关类型定义
export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  status: RoleStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum RoleStatus {
  DISABLED = 0,
  ENABLED = 1,
}

// 权限相关类型定义
export interface Permission {
  id: number;
  name: string;
  code: string;
  type: PermissionType;
  parentId?: number;
  path?: string;
  component?: string;
  icon?: string;
  sort: number;
  status: PermissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum PermissionType {
  MENU = 'menu',
  BUTTON = 'button',
  API = 'api',
}

export enum PermissionStatus {
  DISABLED = 0,
  ENABLED = 1,
}

// 项目相关类型定义
export interface Project {
  id: number;
  name: string;
  code: string;
  description?: string;
  type: ProjectType;
  status: ProjectStatus;
  ownerId: number;
  teamMembers: ProjectMember[];
  repository?: string;
  branch?: string;
  buildCommand?: string;
  deployCommand?: string;
  environment: ProjectEnvironment[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectType {
  WEB = 'web',
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
  MINI_PROGRAM = 'mini_program',
}

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
  role: ProjectMemberRole;
  joinedAt: Date;
}

export enum ProjectMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  VIEWER = 'viewer',
}

export interface ProjectEnvironment {
  id: number;
  projectId: number;
  name: string;
  type: EnvironmentType;
  url?: string;
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum EnvironmentType {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

// 需求相关类型定义
export interface Requirement {
  id: number;
  title: string;
  description?: string;
  type: RequirementType;
  priority: RequirementPriority;
  status: RequirementStatus;
  projectId: number;
  assigneeId?: number;
  reporterId: number;
  prototypeId?: number;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum RequirementType {
  FEATURE = 'feature',
  BUG = 'bug',
  IMPROVEMENT = 'improvement',
  TASK = 'task',
}

export enum RequirementPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum RequirementStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  TESTING = 'testing',
  DONE = 'done',
  CLOSED = 'closed',
}

// 原型相关类型定义
export interface Prototype {
  id: number;
  name: string;
  description?: string;
  projectId: number;
  requirementId?: number;
  creatorId: number;
  data: PrototypeData;
  version: string;
  status: PrototypeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrototypeData {
  pages: PrototypePage[];
  components: PrototypeComponent[];
  assets: PrototypeAsset[];
}

export interface PrototypePage {
  id: string;
  name: string;
  width: number;
  height: number;
  elements: PrototypeElement[];
}

export interface PrototypeElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, any>;
}

export interface PrototypeComponent {
  id: string;
  name: string;
  category: string;
  template: string;
  properties: Record<string, any>;
}

export interface PrototypeAsset {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  size: number;
}

export enum AssetType {
  IMAGE = 'image',
  ICON = 'icon',
  FONT = 'font',
  VIDEO = 'video',
  AUDIO = 'audio',
}

export enum PrototypeStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// 物料相关类型定义
export interface Material {
  id: number;
  name: string;
  description?: string;
  type: MaterialType;
  category: string;
  tags: string[];
  version: string;
  code: string;
  demo?: string;
  documentation?: string;
  authorId: number;
  downloads: number;
  rating: number;
  status: MaterialStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum MaterialType {
  COMPONENT = 'component',
  TEMPLATE = 'template',
  SNIPPET = 'snippet',
  HOOK = 'hook',
  UTIL = 'util',
}

export enum MaterialStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  DEPRECATED = 'deprecated',
}

// API响应类型定义
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 通用类型定义
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface TreeNode {
  id: string | number;
  label: string;
  children?: TreeNode[];
  disabled?: boolean;
  [key: string]: any;
}