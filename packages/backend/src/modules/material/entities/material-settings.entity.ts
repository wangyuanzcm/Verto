import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Material } from './material.entity';

/**
 * 物料设置实体
 * 存储物料的各种设置选项，包括权限、可见性、通知等
 */
@Entity('material_settings')
@Index(['materialId'], { unique: true })
@Index(['visibility'])
@Index(['accessLevel'])
@Index(['allowFork'])
@Index(['allowDownload'])
export class MaterialSettings extends BaseEntity {
  @ApiProperty({ description: '物料ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '关联的物料ID',
  })
  materialId: string;

  @ApiProperty({ description: '是否允许Fork' })
  @Column({
    type: 'boolean',
    default: true,
    comment: '是否允许其他用户Fork此物料',
  })
  allowFork: boolean;

  @ApiProperty({ description: '是否允许评论' })
  @Column({
    type: 'boolean',
    default: true,
    comment: '是否允许用户评论',
  })
  allowComment: boolean;

  @ApiProperty({ description: '是否允许评分' })
  @Column({
    type: 'boolean',
    default: true,
    comment: '是否允许用户评分',
  })
  allowRating: boolean;

  @ApiProperty({ description: '是否允许下载' })
  @Column({
    type: 'boolean',
    default: true,
    comment: '是否允许下载',
  })
  allowDownload: boolean;

  @ApiProperty({ description: '是否需要审批' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '使用前是否需要审批',
  })
  requireApproval: boolean;

  @ApiProperty({ description: '是否自动更新' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否自动更新到最新版本',
  })
  autoUpdate: boolean;

  @ApiProperty({ description: '是否启用通知' })
  @Column({
    type: 'boolean',
    default: true,
    comment: '是否启用相关通知',
  })
  notifications: boolean;

  @ApiProperty({ description: '可见性', enum: ['public', 'private', 'internal'] })
  @Column({
    type: 'enum',
    enum: ['public', 'private', 'internal'],
    default: 'public',
    comment: '物料可见性',
  })
  visibility: 'public' | 'private' | 'internal';

  @ApiProperty({ description: '访问级别', enum: ['read', 'write', 'admin'] })
  @Column({
    type: 'enum',
    enum: ['read', 'write', 'admin'],
    default: 'read',
    comment: '默认访问级别',
  })
  accessLevel: 'read' | 'write' | 'admin';

  @ApiProperty({ description: '过期时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '物料过期时间',
  })
  expiresAt?: Date;

  @ApiProperty({ description: '最大下载次数', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '最大下载次数限制',
  })
  maxDownloads?: number;

  @ApiProperty({ description: '最大使用次数', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '最大使用次数限制',
  })
  maxUsage?: number;

  @ApiProperty({ description: '允许的用户组', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '允许访问的用户组列表',
  })
  allowedGroups?: string[];

  @ApiProperty({ description: '禁止的用户组', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '禁止访问的用户组列表',
  })
  blockedGroups?: string[];

  @ApiProperty({ description: '允许的用户', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '允许访问的用户ID列表',
  })
  allowedUsers?: string[];

  @ApiProperty({ description: '禁止的用户', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '禁止访问的用户ID列表',
  })
  blockedUsers?: string[];

  @ApiProperty({ description: '下载限制配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '下载限制配置',
  })
  downloadRestrictions?: {
    dailyLimit?: number;
    weeklyLimit?: number;
    monthlyLimit?: number;
    requireLogin?: boolean;
    requireVerification?: boolean;
  };

  @ApiProperty({ description: '使用限制配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '使用限制配置',
  })
  usageRestrictions?: {
    dailyLimit?: number;
    weeklyLimit?: number;
    monthlyLimit?: number;
    requireLicense?: boolean;
    commercialUse?: boolean;
  };

  @ApiProperty({ description: '通知配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '通知配置',
  })
  notificationConfig?: {
    onDownload?: boolean;
    onUse?: boolean;
    onComment?: boolean;
    onRating?: boolean;
    onFork?: boolean;
    onUpdate?: boolean;
  };

  // 关联关系
  @ApiProperty({ description: '关联物料', type: () => Material })
  @OneToOne(() => Material, material => material.settings)
  @JoinColumn({ name: 'materialId' })
  material: Material;

  /**
   * 检查用户是否可以访问
   */
  canAccess(userId: string, userGroups: string[] = []): boolean {
    // 检查可见性
    if (this.visibility === 'private') {
      return false; // 私有物料需要特殊权限
    }

    // 检查用户黑名单
    if (this.blockedUsers?.includes(userId)) {
      return false;
    }

    // 检查用户组黑名单
    if (this.blockedGroups?.some(group => userGroups.includes(group))) {
      return false;
    }

    // 检查用户白名单
    if (this.allowedUsers?.length && !this.allowedUsers.includes(userId)) {
      return false;
    }

    // 检查用户组白名单
    if (this.allowedGroups?.length && !this.allowedGroups.some(group => userGroups.includes(group))) {
      return false;
    }

    return true;
  }

  /**
   * 检查是否可以下载
   */
  canDownload(userId: string, userGroups: string[] = []): boolean {
    if (!this.allowDownload) {
      return false;
    }

    if (!this.canAccess(userId, userGroups)) {
      return false;
    }

    // 检查是否过期
    if (this.expiresAt && this.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * 检查是否可以Fork
   */
  canFork(userId: string, userGroups: string[] = []): boolean {
    if (!this.allowFork) {
      return false;
    }

    return this.canAccess(userId, userGroups);
  }

  /**
   * 检查是否可以评论
   */
  canComment(userId: string, userGroups: string[] = []): boolean {
    if (!this.allowComment) {
      return false;
    }

    return this.canAccess(userId, userGroups);
  }

  /**
   * 检查是否可以评分
   */
  canRate(userId: string, userGroups: string[] = []): boolean {
    if (!this.allowRating) {
      return false;
    }

    return this.canAccess(userId, userGroups);
  }

  /**
   * 检查是否已过期
   */
  isExpired(): boolean {
    return this.expiresAt ? this.expiresAt < new Date() : false;
  }

  /**
   * 检查下载限制
   */
  checkDownloadLimit(currentDownloads: number): boolean {
    if (this.maxDownloads && currentDownloads >= this.maxDownloads) {
      return false;
    }
    return true;
  }

  /**
   * 检查使用限制
   */
  checkUsageLimit(currentUsage: number): boolean {
    if (this.maxUsage && currentUsage >= this.maxUsage) {
      return false;
    }
    return true;
  }

  /**
   * 添加允许的用户
   */
  addAllowedUser(userId: string): void {
    if (!this.allowedUsers) {
      this.allowedUsers = [];
    }
    if (!this.allowedUsers.includes(userId)) {
      this.allowedUsers.push(userId);
    }
  }

  /**
   * 移除允许的用户
   */
  removeAllowedUser(userId: string): void {
    if (this.allowedUsers) {
      this.allowedUsers = this.allowedUsers.filter(id => id !== userId);
    }
  }

  /**
   * 添加禁止的用户
   */
  addBlockedUser(userId: string): void {
    if (!this.blockedUsers) {
      this.blockedUsers = [];
    }
    if (!this.blockedUsers.includes(userId)) {
      this.blockedUsers.push(userId);
    }
  }

  /**
   * 移除禁止的用户
   */
  removeBlockedUser(userId: string): void {
    if (this.blockedUsers) {
      this.blockedUsers = this.blockedUsers.filter(id => id !== userId);
    }
  }

  /**
   * 更新通知配置
   */
  updateNotificationConfig(config: Partial<MaterialSettings['notificationConfig']>): void {
    this.notificationConfig = {
      ...this.notificationConfig,
      ...config,
    };
  }

  /**
   * 检查是否应该发送通知
   */
  shouldNotify(event: string): boolean {
    if (!this.notifications || !this.notificationConfig) {
      return false;
    }

    switch (event) {
      case 'download':
        return this.notificationConfig.onDownload ?? false;
      case 'use':
        return this.notificationConfig.onUse ?? false;
      case 'comment':
        return this.notificationConfig.onComment ?? false;
      case 'rating':
        return this.notificationConfig.onRating ?? false;
      case 'fork':
        return this.notificationConfig.onFork ?? false;
      case 'update':
        return this.notificationConfig.onUpdate ?? false;
      default:
        return false;
    }
  }
}