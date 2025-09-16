/**
 * API 类型定义
 * 定义所有API相关的TypeScript类型
 */

// 基础类型
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

// 分页参数
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 分页响应
export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 用户相关类型
export interface User extends BaseEntity {
  username: string
  email: string
  nickname?: string
  avatar?: string
  phone?: string
  status: 'active' | 'inactive' | 'banned'
  role: 'admin' | 'user' | 'guest'
  permissions: string[]
  lastLoginAt?: string
  profile?: UserProfile
}

export interface UserProfile {
  firstName?: string
  lastName?: string
  bio?: string
  location?: string
  website?: string
  company?: string
  position?: string
  skills?: string[]
  interests?: string[]
  socialLinks?: {
    github?: string
    linkedin?: string
    twitter?: string
    website?: string
  }
}

export interface UserListParams extends PaginationParams {
  keyword?: string
  status?: string
  role?: string
  startDate?: string
  endDate?: string
}

export interface UserCreateRequest {
  username: string
  email: string
  password: string
  nickname?: string
  phone?: string
  role?: string
}

export interface UserUpdateRequest {
  nickname?: string
  email?: string
  phone?: string
  avatar?: string
  status?: string
  role?: string
  profile?: Partial<UserProfile>
}

// 认证相关类型
export interface LoginRequest {
  username: string
  password: string
  rememberMe?: boolean
  captcha?: string
}

export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
  nickname?: string
  phone?: string
  inviteCode?: string
  captcha?: string
}

export interface ResetPasswordRequest {
  email: string
  captcha?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// 项目相关类型
export interface Project extends BaseEntity {
  name: string
  description?: string
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  startDate?: string
  endDate?: string
  deadline?: string
  progress: number
  budget?: number
  currency?: string
  tags?: string[]
  cover?: string
  owner: User
  members: ProjectMember[]
  requirements?: Requirement[]
  prototypes?: Prototype[]
  statistics?: ProjectStatistics
}

export interface ProjectMember {
  id: string
  user: User
  role: 'owner' | 'admin' | 'developer' | 'designer' | 'tester' | 'viewer'
  permissions: string[]
  joinedAt: string
}

export interface ProjectStatistics {
  totalRequirements: number
  completedRequirements: number
  totalPrototypes: number
  completedPrototypes: number
  totalMembers: number
  activeMembers: number
}

export interface ProjectListParams extends PaginationParams {
  keyword?: string
  status?: string
  priority?: string
  ownerId?: string
  memberId?: string
  tags?: string[]
  startDate?: string
  endDate?: string
}

export interface ProjectCreateRequest {
  name: string
  description?: string
  status?: string
  priority?: string
  startDate?: string
  endDate?: string
  deadline?: string
  budget?: number
  currency?: string
  tags?: string[]
  cover?: string
  members?: {
    userId: string
    role: string
    permissions?: string[]
  }[]
}

export interface ProjectUpdateRequest {
  name?: string
  description?: string
  status?: string
  priority?: string
  startDate?: string
  endDate?: string
  deadline?: string
  progress?: number
  budget?: number
  currency?: string
  tags?: string[]
  cover?: string
}

// 需求相关类型
export interface Requirement extends BaseEntity {
  title: string
  description?: string
  content?: string
  type: 'functional' | 'non-functional' | 'business' | 'technical'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'implemented' | 'tested' | 'completed'
  complexity: 'simple' | 'medium' | 'complex'
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
  attachments?: FileAttachment[]
  project: Project
  assignee?: User
  reviewer?: User
  dependencies?: Requirement[]
  children?: Requirement[]
  parent?: Requirement
  comments?: RequirementComment[]
  history?: RequirementHistory[]
}

export interface RequirementComment extends BaseEntity {
  content: string
  author: User
  requirement: Requirement
  parent?: RequirementComment
  replies?: RequirementComment[]
}

export interface RequirementHistory extends BaseEntity {
  action: string
  field?: string
  oldValue?: any
  newValue?: any
  user: User
  requirement: Requirement
}

export interface RequirementListParams extends PaginationParams {
  projectId?: string
  keyword?: string
  type?: string
  priority?: string
  status?: string
  complexity?: string
  assigneeId?: string
  reviewerId?: string
  tags?: string[]
  startDate?: string
  endDate?: string
}

export interface RequirementCreateRequest {
  title: string
  description?: string
  content?: string
  type: string
  priority: string
  complexity?: string
  estimatedHours?: number
  tags?: string[]
  projectId: string
  assigneeId?: string
  reviewerId?: string
  parentId?: string
  dependencies?: string[]
  attachments?: string[]
}

export interface RequirementUpdateRequest {
  title?: string
  description?: string
  content?: string
  type?: string
  priority?: string
  status?: string
  complexity?: string
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
  assigneeId?: string
  reviewerId?: string
  dependencies?: string[]
  attachments?: string[]
}

// 原型相关类型
export interface Prototype extends BaseEntity {
  name: string
  description?: string
  type: 'wireframe' | 'mockup' | 'interactive' | 'high-fidelity'
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'published'
  version: string
  tags?: string[]
  cover?: string
  thumbnail?: string
  url?: string
  data?: any
  project: Project
  requirements?: Requirement[]
  author: User
  reviewers?: User[]
  comments?: PrototypeComment[]
  history?: PrototypeHistory[]
  statistics?: PrototypeStatistics
}

export interface PrototypeComment extends BaseEntity {
  content: string
  x?: number
  y?: number
  author: User
  prototype: Prototype
  parent?: PrototypeComment
  replies?: PrototypeComment[]
}

export interface PrototypeHistory extends BaseEntity {
  action: string
  version: string
  changes?: any
  user: User
  prototype: Prototype
}

export interface PrototypeStatistics {
  views: number
  likes: number
  comments: number
  shares: number
}

export interface PrototypeListParams extends PaginationParams {
  projectId?: string
  keyword?: string
  type?: string
  status?: string
  authorId?: string
  tags?: string[]
  startDate?: string
  endDate?: string
}

export interface PrototypeCreateRequest {
  name: string
  description?: string
  type: string
  tags?: string[]
  cover?: string
  url?: string
  data?: any
  projectId: string
  requirementIds?: string[]
  reviewerIds?: string[]
}

export interface PrototypeUpdateRequest {
  name?: string
  description?: string
  type?: string
  status?: string
  version?: string
  tags?: string[]
  cover?: string
  thumbnail?: string
  url?: string
  data?: any
  requirementIds?: string[]
  reviewerIds?: string[]
}

// 物料相关类型
export interface Material extends BaseEntity {
  name: string
  description?: string
  type: 'component' | 'template' | 'block' | 'icon' | 'image'
  category: string
  tags?: string[]
  version: string
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'public' | 'private'
  cover?: string
  thumbnail?: string
  preview?: string
  code?: string
  style?: string
  script?: string
  props?: MaterialProp[]
  dependencies?: string[]
  author: User
  downloads: number
  likes: number
  stars: number
  views: number
  comments?: MaterialComment[]
  history?: MaterialHistory[]
}

export interface MaterialProp {
  name: string
  type: string
  required: boolean
  default?: any
  description?: string
  options?: any[]
}

export interface MaterialComment extends BaseEntity {
  content: string
  rating?: number
  author: User
  material: Material
  parent?: MaterialComment
  replies?: MaterialComment[]
}

export interface MaterialHistory extends BaseEntity {
  action: string
  version: string
  changes?: any
  user: User
  material: Material
}

export interface MaterialListParams extends PaginationParams {
  keyword?: string
  type?: string
  category?: string
  status?: string
  authorId?: string
  tags?: string[]
  startDate?: string
  endDate?: string
}

export interface MaterialCreateRequest {
  name: string
  description?: string
  type: string
  category: string
  tags?: string[]
  cover?: string
  thumbnail?: string
  preview?: string
  code?: string
  style?: string
  script?: string
  props?: MaterialProp[]
  dependencies?: string[]
}

export interface MaterialUpdateRequest {
  name?: string
  description?: string
  type?: string
  category?: string
  status?: string
  version?: string
  tags?: string[]
  cover?: string
  thumbnail?: string
  preview?: string
  code?: string
  style?: string
  script?: string
  props?: MaterialProp[]
  dependencies?: string[]
}

// 通知相关类型
export interface Notification extends BaseEntity {
  title: string
  content: string
  type: 'system' | 'project' | 'requirement' | 'prototype' | 'material' | 'user'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'unread' | 'read' | 'archived'
  isRead: boolean
  readAt?: string
  data?: any
  recipient: User
  sender?: User
  relatedId?: string
  relatedType?: string
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: string
  url?: string
  data?: any
}

export interface NotificationListParams extends PaginationParams {
  type?: string
  priority?: string
  status?: string
  isRead?: boolean
  startDate?: string
  endDate?: string
}

export interface NotificationCreateRequest {
  title: string
  content: string
  type: string
  priority?: string
  data?: any
  recipientIds: string[]
  relatedId?: string
  relatedType?: string
  actions?: NotificationAction[]
}

export interface NotificationUpdateRequest {
  title?: string
  content?: string
  type?: string
  priority?: string
  status?: string
  data?: any
  actions?: NotificationAction[]
}

// 设置相关类型
export interface UserSettings {
  theme?: 'light' | 'dark' | 'auto'
  language?: string
  fontSize?: 'small' | 'medium' | 'large'
  sidebarCollapsed?: boolean
  sidebarWidth?: number
  layoutMode?: 'vertical' | 'horizontal' | 'mix'
  fixedHeader?: boolean
  fixedSidebar?: boolean
  showBreadcrumb?: boolean
  showTabs?: boolean
  showFooter?: boolean
  pageAnimation?: boolean
  animationType?: 'fade' | 'slide' | 'zoom'
  autoSaveInterval?: number
  autoBackup?: boolean
  backupInterval?: number
  maxBackupCount?: number
  notifications?: {
    email?: boolean
    desktop?: boolean
    sound?: boolean
    project?: boolean
    requirement?: boolean
    prototype?: boolean
    material?: boolean
  }
}

export interface SystemSettings {
  siteName?: string
  siteDescription?: string
  siteLogo?: string
  siteFavicon?: string
  allowRegistration?: boolean
  requireEmailVerification?: boolean
  defaultRole?: string
  maxFileSize?: number
  allowedFileTypes?: string[]
  enableCaptcha?: boolean
  sessionTimeout?: number
  passwordPolicy?: {
    minLength?: number
    requireUppercase?: boolean
    requireLowercase?: boolean
    requireNumbers?: boolean
    requireSymbols?: boolean
  }
  emailSettings?: {
    provider?: string
    host?: string
    port?: number
    secure?: boolean
    username?: string
    password?: string
    from?: string
  }
  storageSettings?: {
    provider?: string
    bucket?: string
    region?: string
    accessKey?: string
    secretKey?: string
    endpoint?: string
  }
}

export interface NotificationSettings {
  emailEnabled?: boolean
  desktopEnabled?: boolean
  soundEnabled?: boolean
  projectNotifications?: boolean
  requirementNotifications?: boolean
  prototypeNotifications?: boolean
  materialNotifications?: boolean
  userNotifications?: boolean
  systemNotifications?: boolean
  digestFrequency?: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never'
  quietHours?: {
    enabled?: boolean
    startTime?: string
    endTime?: string
  }
}

export interface SecuritySettings {
  twoFactorEnabled?: boolean
  sessionTimeout?: number
  maxLoginAttempts?: number
  lockoutDuration?: number
  passwordExpiry?: number
  ipWhitelist?: string[]
  trustedDevices?: TrustedDevice[]
  loginHistory?: LoginHistory[]
}

export interface TrustedDevice {
  id: string
  name: string
  userAgent: string
  ip: string
  location?: string
  addedAt: string
  lastUsedAt: string
}

export interface LoginHistory {
  id: string
  ip: string
  userAgent: string
  location?: string
  success: boolean
  reason?: string
  timestamp: string
}

// 文件相关类型
export interface FileAttachment extends BaseEntity {
  name: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnail?: string
  path: string
  hash: string
  uploader: User
  downloads: number
  metadata?: {
    width?: number
    height?: number
    duration?: number
    [key: string]: any
  }
}

export interface FileUploadResponse {
  file: FileAttachment
  url: string
}

export interface FileListParams extends PaginationParams {
  keyword?: string
  mimeType?: string
  uploaderId?: string
  startDate?: string
  endDate?: string
  minSize?: number
  maxSize?: number
}

// 统计相关类型
export interface DashboardStatistics {
  projects: {
    total: number
    active: number
    completed: number
    overdue: number
  }
  requirements: {
    total: number
    pending: number
    approved: number
    implemented: number
  }
  prototypes: {
    total: number
    draft: number
    published: number
    views: number
  }
  materials: {
    total: number
    public: number
    downloads: number
    likes: number
  }
  users: {
    total: number
    active: number
    online: number
    newToday: number
  }
}

export interface ActivityLog extends BaseEntity {
  action: string
  description: string
  user: User
  ip: string
  userAgent: string
  relatedId?: string
  relatedType?: string
  data?: any
}

// 搜索相关类型
export interface SearchParams {
  keyword: string
  type?: 'all' | 'project' | 'requirement' | 'prototype' | 'material' | 'user'
  filters?: {
    [key: string]: any
  }
  page?: number
  pageSize?: number
}

export interface SearchResult {
  type: string
  id: string
  title: string
  description?: string
  url: string
  highlight?: string
  score: number
  data?: any
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  page: number
  pageSize: number
  suggestions?: string[]
  facets?: {
    [key: string]: {
      [value: string]: number
    }
  }
}