import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Project } from './project.entity';

/**
 * 项目成员实体
 */
@Entity('project_members')
@Unique(['projectId', 'userId'])
@Index(['projectId'])
@Index(['userId'])
@Index(['role'])
@Index(['status'])
@Index(['joinedAt'])
export class ProjectMember extends BaseEntity {
  @ApiProperty({ description: '项目ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '项目ID',
  })
  projectId: string;

  @ApiProperty({ description: '用户ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '用户ID',
  })
  userId: string;

  @ApiProperty({ description: '成员角色' })
  @Column({
    type: 'enum',
    enum: ['owner', 'admin', 'manager', 'developer', 'designer', 'tester', 'viewer', 'guest'],
    default: 'viewer',
    comment: '成员在项目中的角色',
  })
  role: 'owner' | 'admin' | 'manager' | 'developer' | 'designer' | 'tester' | 'viewer' | 'guest';

  @ApiProperty({ description: '成员状态' })
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'pending', 'rejected', 'left'],
    default: 'pending',
    comment: '成员状态',
  })
  status: 'active' | 'inactive' | 'pending' | 'rejected' | 'left';

  @ApiProperty({ description: '权限列表', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '成员权限列表',
  })
  permissions?: string[];

  @ApiProperty({ description: '加入时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '加入时间',
  })
  joinedAt?: Date;

  @ApiProperty({ description: '离开时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '离开时间',
  })
  leftAt?: Date;

  @ApiProperty({ description: '邀请时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '邀请时间',
  })
  invitedAt?: Date;

  @ApiProperty({ description: '邀请者ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '邀请者ID',
  })
  inviterId?: string;

  @ApiProperty({ description: '邀请消息', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '邀请消息',
  })
  inviteMessage?: string;

  @ApiProperty({ description: '邀请令牌', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '邀请令牌',
  })
  inviteToken?: string;

  @ApiProperty({ description: '邀请过期时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '邀请过期时间',
  })
  inviteExpiresAt?: Date;

  @ApiProperty({ description: '成员配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '成员配置信息',
  })
  config?: {
    // 通知设置
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      frequency?: 'immediate' | 'daily' | 'weekly' | 'never';
      types?: string[]; // 通知类型
    };
    
    // 工作设置
    workSettings?: {
      workingHours?: {
        start: string;
        end: string;
        timezone: string;
      };
      workingDays?: number[]; // 0-6, 0为周日
      availability?: 'available' | 'busy' | 'away' | 'offline';
      maxConcurrentTasks?: number;
    };
    
    // 权限设置
    accessControl?: {
      ipWhitelist?: string[];
      allowedDevices?: string[];
      sessionTimeout?: number; // 分钟
      requireMFA?: boolean;
    };
    
    // 偏好设置
    preferences?: {
      language?: string;
      theme?: 'light' | 'dark' | 'auto';
      dateFormat?: string;
      timeFormat?: '12h' | '24h';
      defaultView?: string;
    };
  };

  @ApiProperty({ description: '成员统计信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '成员统计信息',
  })
  statistics?: {
    // 任务统计
    tasks?: {
      total: number;
      completed: number;
      inProgress: number;
      overdue: number;
      averageCompletionTime: number; // 小时
    };
    
    // 活动统计
    activity?: {
      lastActivity: Date;
      totalActivities: number;
      weeklyActivities: number;
      monthlyActivities: number;
      loginCount: number;
      lastLogin: Date;
    };
    
    // 贡献统计
    contributions?: {
      requirementsCreated: number;
      prototypesCreated: number;
      materialsUploaded: number;
      commentsPosted: number;
      reviewsCompleted: number;
    };
    
    // 绩效统计
    performance?: {
      qualityScore: number; // 0-100
      productivityScore: number; // 0-100
      collaborationScore: number; // 0-100
      satisfactionScore: number; // 0-100
    };
  };

  @ApiProperty({ description: '成员标签', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '成员标签',
  })
  tags?: string[];

  @ApiProperty({ description: '成员备注', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '成员备注',
  })
  notes?: string;

  @ApiProperty({ description: '自定义字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '自定义字段',
  })
  customFields?: Record<string, any>;

  @ApiProperty({ description: '创建者ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '创建者ID',
  })
  creatorId?: string;

  @ApiProperty({ description: '最后修改者ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '最后修改者ID',
  })
  updaterId?: string;

  // 关联关系
  @ApiProperty({ description: '所属项目', type: () => Project })
  @ManyToOne(() => Project, project => project.members)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ApiProperty({ description: '用户信息', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: '邀请者信息', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'inviterId' })
  inviter?: User;

  /**
   * 检查成员状态
   * @param status 状态
   * @returns 是否为指定状态
   */
  isStatus(status: string): boolean {
    return this.status === status;
  }

  /**
   * 检查是否为活跃成员
   * @returns 是否活跃
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * 检查是否为待审核成员
   * @returns 是否待审核
   */
  isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * 检查是否已离开
   * @returns 是否已离开
   */
  hasLeft(): boolean {
    return this.status === 'left';
  }

  /**
   * 检查是否被拒绝
   * @returns 是否被拒绝
   */
  isRejected(): boolean {
    return this.status === 'rejected';
  }

  /**
   * 检查成员角色
   * @param role 角色
   * @returns 是否为指定角色
   */
  isRole(role: string): boolean {
    return this.role === role;
  }

  /**
   * 检查是否为项目所有者
   * @returns 是否为所有者
   */
  isOwner(): boolean {
    return this.role === 'owner';
  }

  /**
   * 检查是否为管理员
   * @returns 是否为管理员
   */
  isAdmin(): boolean {
    return this.role === 'admin' || this.role === 'owner';
  }

  /**
   * 检查是否为管理者
   * @returns 是否为管理者
   */
  isManager(): boolean {
    return ['owner', 'admin', 'manager'].includes(this.role);
  }

  /**
   * 检查是否有指定权限
   * @param permission 权限
   * @returns 是否有权限
   */
  hasPermission(permission: string): boolean {
    if (this.isOwner()) return true;
    return this.permissions?.includes(permission) || false;
  }

  /**
   * 检查是否有任一权限
   * @param permissions 权限列表
   * @returns 是否有任一权限
   */
  hasAnyPermission(permissions: string[]): boolean {
    if (this.isOwner()) return true;
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * 检查是否有所有权限
   * @param permissions 权限列表
   * @returns 是否有所有权限
   */
  hasAllPermissions(permissions: string[]): boolean {
    if (this.isOwner()) return true;
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * 检查邀请是否过期
   * @returns 是否过期
   */
  isInviteExpired(): boolean {
    if (!this.inviteExpiresAt) return false;
    return new Date() > this.inviteExpiresAt;
  }

  /**
   * 检查是否在工作时间
   * @param currentTime 当前时间
   * @returns 是否在工作时间
   */
  isWorkingTime(currentTime: Date = new Date()): boolean {
    const workSettings = this.config?.workSettings;
    if (!workSettings) return true;
    
    // 检查工作日
    if (workSettings.workingDays) {
      const day = currentTime.getDay();
      if (!workSettings.workingDays.includes(day)) return false;
    }
    
    // 检查工作时间
    if (workSettings.workingHours) {
      const hour = currentTime.getHours();
      const start = parseInt(workSettings.workingHours.start.split(':')[0]);
      const end = parseInt(workSettings.workingHours.end.split(':')[0]);
      
      if (start <= end) {
        if (hour < start || hour > end) return false;
      } else {
        if (hour < start && hour > end) return false;
      }
    }
    
    return true;
  }

  /**
   * 检查是否可用
   * @returns 是否可用
   */
  isAvailable(): boolean {
    return this.config?.workSettings?.availability === 'available';
  }

  /**
   * 激活成员
   */
  activate(): void {
    this.status = 'active';
    if (!this.joinedAt) {
      this.joinedAt = new Date();
    }
  }

  /**
   * 停用成员
   */
  deactivate(): void {
    this.status = 'inactive';
  }

  /**
   * 接受邀请
   */
  acceptInvite(): void {
    this.status = 'active';
    this.joinedAt = new Date();
    this.inviteToken = null;
    this.inviteExpiresAt = null;
  }

  /**
   * 拒绝邀请
   */
  rejectInvite(): void {
    this.status = 'rejected';
    this.inviteToken = null;
    this.inviteExpiresAt = null;
  }

  /**
   * 离开项目
   */
  leave(): void {
    this.status = 'left';
    this.leftAt = new Date();
  }

  /**
   * 更改角色
   * @param role 新角色
   */
  changeRole(role: ProjectMember['role']): void {
    this.role = role;
  }

  /**
   * 添加权限
   * @param permission 权限
   */
  addPermission(permission: string): void {
    if (!this.permissions) {
      this.permissions = [];
    }
    
    if (!this.permissions.includes(permission)) {
      this.permissions.push(permission);
    }
  }

  /**
   * 移除权限
   * @param permission 权限
   */
  removePermission(permission: string): void {
    if (this.permissions) {
      this.permissions = this.permissions.filter(p => p !== permission);
    }
  }

  /**
   * 设置权限
   * @param permissions 权限列表
   */
  setPermissions(permissions: string[]): void {
    this.permissions = [...new Set(permissions)];
  }

  /**
   * 清空权限
   */
  clearPermissions(): void {
    this.permissions = [];
  }

  /**
   * 设置可用性
   * @param availability 可用性状态
   */
  setAvailability(availability: 'available' | 'busy' | 'away' | 'offline'): void {
    if (!this.config) {
      this.config = {};
    }
    
    if (!this.config.workSettings) {
      this.config.workSettings = {};
    }
    
    this.config.workSettings.availability = availability;
  }

  /**
   * 设置工作时间
   * @param workingHours 工作时间
   */
  setWorkingHours(workingHours: {
    start: string;
    end: string;
    timezone: string;
  }): void {
    if (!this.config) {
      this.config = {};
    }
    
    if (!this.config.workSettings) {
      this.config.workSettings = {};
    }
    
    this.config.workSettings.workingHours = workingHours;
  }

  /**
   * 设置工作日
   * @param workingDays 工作日（0-6，0为周日）
   */
  setWorkingDays(workingDays: number[]): void {
    if (!this.config) {
      this.config = {};
    }
    
    if (!this.config.workSettings) {
      this.config.workSettings = {};
    }
    
    this.config.workSettings.workingDays = workingDays;
  }

  /**
   * 添加标签
   * @param tag 标签
   */
  addTag(tag: string): void {
    if (!this.tags) {
      this.tags = [];
    }
    
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  /**
   * 移除标签
   * @param tag 标签
   */
  removeTag(tag: string): void {
    if (this.tags) {
      this.tags = this.tags.filter(t => t !== tag);
    }
  }

  /**
   * 设置自定义字段
   * @param key 字段名
   * @param value 字段值
   */
  setCustomField(key: string, value: any): void {
    if (!this.customFields) {
      this.customFields = {};
    }
    
    this.customFields[key] = value;
  }

  /**
   * 获取自定义字段
   * @param key 字段名
   * @returns 字段值
   */
  getCustomField(key: string): any {
    return this.customFields?.[key];
  }

  /**
   * 移除自定义字段
   * @param key 字段名
   */
  removeCustomField(key: string): void {
    if (this.customFields) {
      delete this.customFields[key];
    }
  }

  /**
   * 更新统计信息
   * @param statistics 统计信息
   */
  updateStatistics(statistics: Partial<ProjectMember['statistics']>): void {
    if (!this.statistics) {
      this.statistics = {
        tasks: { total: 0, completed: 0, inProgress: 0, overdue: 0, averageCompletionTime: 0 },
        activity: { lastActivity: new Date(), totalActivities: 0, weeklyActivities: 0, monthlyActivities: 0, loginCount: 0, lastLogin: new Date() },
        contributions: { requirementsCreated: 0, prototypesCreated: 0, materialsUploaded: 0, commentsPosted: 0, reviewsCompleted: 0 },
        performance: { qualityScore: 0, productivityScore: 0, collaborationScore: 0, satisfactionScore: 0 },
      };
    }
    
    this.statistics = { ...this.statistics, ...statistics };
  }

  /**
   * 记录活动
   */
  recordActivity(): void {
    if (!this.statistics) {
      this.updateStatistics({});
    }
    
    this.statistics.activity.lastActivity = new Date();
    this.statistics.activity.totalActivities += 1;
  }

  /**
   * 记录登录
   */
  recordLogin(): void {
    if (!this.statistics) {
      this.updateStatistics({});
    }
    
    this.statistics.activity.lastLogin = new Date();
    this.statistics.activity.loginCount += 1;
  }

  /**
   * 获取成员绩效评分
   * @returns 绩效评分（0-100）
   */
  getPerformanceScore(): number {
    if (!this.statistics?.performance) return 0;
    
    const { qualityScore, productivityScore, collaborationScore, satisfactionScore } = this.statistics.performance;
    return Math.round((qualityScore + productivityScore + collaborationScore + satisfactionScore) / 4);
  }

  /**
   * 获取任务完成率
   * @returns 任务完成率（百分比）
   */
  getTaskCompletionRate(): number {
    if (!this.statistics?.tasks || this.statistics.tasks.total === 0) return 0;
    return Math.round((this.statistics.tasks.completed / this.statistics.tasks.total) * 100);
  }

  /**
   * 生成邀请令牌
   * @returns 邀请令牌
   */
  static generateInviteToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * 验证成员数据
   * @param data 成员数据
   * @returns 验证结果
   */
  static validate(data: Partial<ProjectMember>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.projectId || data.projectId.trim().length === 0) {
      errors.push('项目ID不能为空');
    }
    
    if (!data.userId || data.userId.trim().length === 0) {
      errors.push('用户ID不能为空');
    }
    
    if (data.inviteMessage && data.inviteMessage.length > 1000) {
      errors.push('邀请消息长度不能超过1000个字符');
    }
    
    if (data.notes && data.notes.length > 2000) {
      errors.push('成员备注长度不能超过2000个字符');
    }
    
    if (data.inviteExpiresAt && new Date(data.inviteExpiresAt) <= new Date()) {
      errors.push('邀请过期时间必须晚于当前时间');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建成员实例
   * @param data 成员数据
   * @returns 成员实例
   */
  static create(data: {
    projectId: string;
    userId: string;
    role?: ProjectMember['role'];
    inviterId?: string;
    inviteMessage?: string;
    permissions?: string[];
    creatorId?: string;
  }): Partial<ProjectMember> {
    const inviteToken = ProjectMember.generateInviteToken();
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7); // 7天后过期
    
    return {
      projectId: data.projectId,
      userId: data.userId,
      role: data.role || 'viewer',
      status: 'pending',
      permissions: data.permissions,
      invitedAt: new Date(),
      inviterId: data.inviterId,
      inviteMessage: data.inviteMessage,
      inviteToken,
      inviteExpiresAt,
      creatorId: data.creatorId,
    };
  }

  /**
   * 获取角色权限映射
   * @returns 角色权限映射
   */
  static getRolePermissions(): Record<ProjectMember['role'], string[]> {
    return {
      owner: ['*'], // 所有权限
      admin: [
        'project:read', 'project:update', 'project:manage',
        'member:read', 'member:create', 'member:update', 'member:delete',
        'requirement:*', 'prototype:*', 'material:*'
      ],
      manager: [
        'project:read', 'project:update',
        'member:read', 'member:create', 'member:update',
        'requirement:*', 'prototype:read', 'prototype:comment',
        'material:read', 'material:download'
      ],
      developer: [
        'project:read',
        'member:read',
        'requirement:read', 'requirement:update', 'requirement:comment',
        'prototype:read', 'prototype:comment',
        'material:read', 'material:download', 'material:upload'
      ],
      designer: [
        'project:read',
        'member:read',
        'requirement:read', 'requirement:comment',
        'prototype:*',
        'material:*'
      ],
      tester: [
        'project:read',
        'member:read',
        'requirement:read', 'requirement:comment',
        'prototype:read', 'prototype:comment',
        'material:read', 'material:download'
      ],
      viewer: [
        'project:read',
        'member:read',
        'requirement:read',
        'prototype:read',
        'material:read', 'material:download'
      ],
      guest: [
        'project:read',
        'requirement:read',
        'prototype:read'
      ],
    };
  }
}