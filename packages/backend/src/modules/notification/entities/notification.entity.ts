import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { NotificationChannel } from './notification-channel.entity';
import { NotificationStatistics } from './notification-statistics.entity';
import { NotificationConfig } from './notification-config.entity';

/**
 * 通知实体
 */
@Entity('notifications')
@Index(['userId'])
@Index(['type'])
@Index(['status'])
@Index(['priority'])
@Index(['createdAt'])
@Index(['scheduledAt'])
@Index(['isRead'])
export class Notification extends BaseEntity {
  @ApiProperty({ description: '接收者用户ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '接收者用户ID',
  })
  userId: string;

  @ApiProperty({ description: '通知类型' })
  @Column({
    type: 'enum',
    enum: [
      'system', 'project', 'requirement', 'prototype', 'material',
      'comment', 'mention', 'assignment', 'deadline', 'approval',
      'security', 'update', 'reminder', 'welcome', 'invitation'
    ],
    comment: '通知类型',
  })
  type: 'system' | 'project' | 'requirement' | 'prototype' | 'material' |
        'comment' | 'mention' | 'assignment' | 'deadline' | 'approval' |
        'security' | 'update' | 'reminder' | 'welcome' | 'invitation';

  @ApiProperty({ description: '通知标题' })
  @Column({
    type: 'varchar',
    length: 200,
    comment: '通知标题',
  })
  title: string;

  @ApiProperty({ description: '通知内容' })
  @Column({
    type: 'text',
    comment: '通知内容',
  })
  content: string;

  @ApiProperty({ description: '通知状态' })
  @Column({
    type: 'enum',
    enum: ['pending', 'sent', 'delivered', 'read', 'failed', 'cancelled'],
    default: 'pending',
    comment: '通知状态',
  })
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled';

  @ApiProperty({ description: '优先级' })
  @Column({
    type: 'enum',
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    comment: '通知优先级',
  })
  priority: 'low' | 'normal' | 'high' | 'urgent';

  @ApiProperty({ description: '是否已读' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否已读',
  })
  isRead: boolean;

  @ApiProperty({ description: '阅读时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '阅读时间',
  })
  readAt?: Date;

  @ApiProperty({ description: '计划发送时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '计划发送时间',
  })
  scheduledAt?: Date;

  @ApiProperty({ description: '实际发送时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '实际发送时间',
  })
  sentAt?: Date;

  @ApiProperty({ description: '过期时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '通知过期时间',
  })
  expiresAt?: Date;

  // 发送渠道关联已移至 NotificationChannel 实体

  @ApiProperty({ description: '通知数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '通知相关数据',
  })
  data?: {
    // 关联实体信息
    entityType?: string; // 实体类型
    entityId?: string; // 实体ID
    entityName?: string; // 实体名称
    
    // 操作信息
    action?: string; // 操作类型
    actionBy?: string; // 操作者ID
    actionByName?: string; // 操作者姓名
    actionAt?: Date; // 操作时间
    
    // 链接信息
    url?: string; // 跳转链接
    deepLink?: string; // 深度链接
    
    // 附加数据
    metadata?: Record<string, any>;
    
    // 模板变量
    variables?: Record<string, any>;
  };

  // 通知配置关联已移至 NotificationConfig 实体

  // 通知统计关联已移至 NotificationStatistics 实体

  @ApiProperty({ description: '通知标签', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '通知标签',
  })
  tags?: string[];

  @ApiProperty({ description: '发送者ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '发送者ID',
  })
  senderId?: string;

  @ApiProperty({ description: '创建者ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '创建者ID',
  })
  creatorId?: string;

  // 关联关系
  @ApiProperty({ description: '接收者用户', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: '发送者用户', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender?: User;

  @OneToMany(() => NotificationChannel, channel => channel.notification, { cascade: true })
  channels: NotificationChannel[];

  @OneToOne(() => NotificationStatistics, statistics => statistics.notification, { cascade: true })
  statistics: NotificationStatistics;

  @OneToOne(() => NotificationConfig, config => config.notification, { cascade: true })
  config: NotificationConfig;

  /**
   * 检查通知状态
   * @param status 状态
   * @returns 是否为指定状态
   */
  isStatus(status: string): boolean {
    return this.status === status;
  }

  /**
   * 检查是否已读
   * @returns 是否已读
   */
  isReadStatus(): boolean {
    return this.isRead;
  }

  /**
   * 检查是否待发送
   * @returns 是否待发送
   */
  isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * 检查是否已发送
   * @returns 是否已发送
   */
  isSent(): boolean {
    return this.status === 'sent';
  }

  /**
   * 检查是否发送失败
   * @returns 是否发送失败
   */
  isFailed(): boolean {
    return this.status === 'failed';
  }

  /**
   * 检查是否已过期
   * @returns 是否已过期
   */
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  /**
   * 检查是否为高优先级
   * @returns 是否为高优先级
   */
  isHighPriority(): boolean {
    return ['high', 'urgent'].includes(this.priority);
  }

  /**
   * 检查是否为紧急通知
   * @returns 是否为紧急通知
   */
  isUrgent(): boolean {
    return this.priority === 'urgent';
  }

  /**
   * 检查是否需要立即发送
   * @returns 是否需要立即发送
   */
  shouldSendImmediately(): boolean {
    if (!this.scheduledAt) return true;
    return new Date() >= this.scheduledAt;
  }

  /**
   * 检查渠道是否启用
   * @param channel 渠道名称
   * @returns 是否启用
   */
  isChannelEnabled(channel: string): boolean {
    const channelEntity = this.channels?.find(c => c.channel === channel);
    return channelEntity?.enabled === true;
  }

  /**
   * 检查渠道是否已发送
   * @param channel 渠道名称
   * @returns 是否已发送
   */
  isChannelDelivered(channel: string): boolean {
    const channelEntity = this.channels?.find(c => c.channel === channel);
    return channelEntity?.status === 'delivered';
  }

  /**
   * 标记为已读
   */
  markAsRead(): void {
    this.isRead = true;
    this.readAt = new Date();
    this.status = 'read';
  }

  /**
   * 标记为未读
   */
  markAsUnread(): void {
    this.isRead = false;
    this.readAt = null;
    if (this.status === 'read') {
      this.status = 'delivered';
    }
  }

  /**
   * 标记为已发送
   * @param channel 发送渠道
   */
  markAsSent(channel?: string): void {
    this.status = 'sent';
    this.sentAt = new Date();
    
    if (channel) {
      const channelEntity = this.channels?.find(c => c.channel === channel);
      if (channelEntity) {
        channelEntity.markAsDelivered();
      }
    }
  }

  /**
   * 标记为发送失败
   * @param error 错误信息
   * @param channel 发送渠道
   */
  markAsFailed(error: string, channel?: string): void {
    this.status = 'failed';
    
    if (channel) {
      const channelEntity = this.channels?.find(c => c.channel === channel);
      if (channelEntity) {
        channelEntity.markAsFailed(error);
      }
    }
    
    // 更新统计信息
    if (this.statistics) {
      this.statistics.recordSendAttempt(channel || 'unknown', false, error);
    }
  }

  /**
   * 取消通知
   */
  cancel(): void {
    this.status = 'cancelled';
  }

  /**
   * 设置计划发送时间
   * @param scheduledAt 计划发送时间
   */
  schedule(scheduledAt: Date): void {
    this.scheduledAt = scheduledAt;
    this.status = 'pending';
  }

  /**
   * 设置过期时间
   * @param expiresAt 过期时间
   */
  setExpiration(expiresAt: Date): void {
    this.expiresAt = expiresAt;
  }

  /**
   * 启用发送渠道
   * @param channel 渠道名称
   * @param config 渠道配置
   */
  enableChannel(channel: string, config: any = {}): void {
    if (!this.channels) {
      this.channels = [];
    }
    
    let channelEntity = this.channels.find(c => c.channel === channel);
     if (!channelEntity) {
       // 创建新的渠道实体需要在服务层处理
       // 这里只是标记需要创建
       return;
     }
    
    channelEntity.enabled = true;
    Object.assign(channelEntity, config);
  }

  /**
   * 禁用发送渠道
   * @param channel 渠道名称
   */
  disableChannel(channel: string): void {
    const channelEntity = this.channels?.find(c => c.channel === channel);
    if (channelEntity) {
      channelEntity.enabled = false;
    }
  }

  /**
   * 记录打开事件
   */
  recordOpen(): void {
    if (this.statistics) {
      this.statistics.recordOpen();
    }
    
    // 自动标记为已读
    if (!this.isRead) {
      this.markAsRead();
    }
  }

  /**
   * 记录点击事件
   */
  recordClick(): void {
    if (this.statistics) {
      this.statistics.recordClick();
    }
    
    // 自动记录打开事件
    if (this.statistics && this.statistics.openCount === 0) {
      this.recordOpen();
    }
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
   * 检查是否有标签
   * @param tag 标签
   * @returns 是否有标签
   */
  hasTag(tag: string): boolean {
    return this.tags?.includes(tag) || false;
  }

  /**
   * 设置通知数据
   * @param data 通知数据
   */
  setData(data: Partial<Notification['data']>): void {
    this.data = { ...this.data, ...data };
  }

  /**
   * 获取跳转链接
   * @returns 跳转链接
   */
  getUrl(): string | null {
    return this.data?.url || null;
  }

  /**
   * 获取深度链接
   * @returns 深度链接
   */
  getDeepLink(): string | null {
    return this.data?.deepLink || null;
  }

  /**
   * 检查是否需要重试
   * @returns 是否需要重试
   */
  shouldRetry(): boolean {
    if (!this.config) return false;
     if (!this.isFailed()) return false;
     
     return this.config.canRetry();
  }

  /**
   * 增加重试次数
   */
  incrementRetryAttempt(): void {
    if (this.config) {
      this.config.incrementRetryAttempt();
    }
  }

  /**
   * 验证通知数据
   * @param data 通知数据
   * @returns 验证结果
   */
  static validate(data: Partial<Notification>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.userId || data.userId.trim().length === 0) {
      errors.push('接收者用户ID不能为空');
    }
    
    if (!data.title || data.title.trim().length === 0) {
      errors.push('通知标题不能为空');
    }
    
    if (data.title && data.title.length > 200) {
      errors.push('通知标题长度不能超过200个字符');
    }
    
    if (!data.content || data.content.trim().length === 0) {
      errors.push('通知内容不能为空');
    }
    
    if (data.content && data.content.length > 5000) {
      errors.push('通知内容长度不能超过5000个字符');
    }
    
    if (data.scheduledAt && new Date(data.scheduledAt) <= new Date()) {
      errors.push('计划发送时间必须晚于当前时间');
    }
    
    if (data.expiresAt && new Date(data.expiresAt) <= new Date()) {
      errors.push('过期时间必须晚于当前时间');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建通知实例
   * @param data 通知数据
   * @returns 通知实例
   */
  static create(data: {
    userId: string;
    type: Notification['type'];
    title: string;
    content: string;
    priority?: Notification['priority'];
    scheduledAt?: Date;
    expiresAt?: Date;
    channels?: Notification['channels'];
    data?: Notification['data'];
    senderId?: string;
    creatorId?: string;
  }): Partial<Notification> {
    return {
      userId: data.userId,
      type: data.type,
      title: data.title,
      content: data.content,
      status: 'pending',
      priority: data.priority || 'normal',
      isRead: false,
      scheduledAt: data.scheduledAt,
      expiresAt: data.expiresAt,
      channels: data.channels,
      data: data.data,
      senderId: data.senderId,
      creatorId: data.creatorId,
    };
  }

  /**
   * 创建系统通知
   * @param data 通知数据
   * @returns 系统通知实例
   */
  static createSystemNotification(data: {
    userId: string;
    title: string;
    content: string;
    priority?: Notification['priority'];
    data?: Notification['data'];
  }): Partial<Notification> {
    return Notification.create({
      ...data,
      type: 'system',
      // channels will be created separately
    });
  }

  /**
   * 创建提醒通知
   * @param data 通知数据
   * @returns 提醒通知实例
   */
  static createReminderNotification(data: {
    userId: string;
    title: string;
    content: string;
    scheduledAt: Date;
    data?: Notification['data'];
  }): Partial<Notification> {
    return Notification.create({
      ...data,
      type: 'reminder',
      priority: 'normal',
      // channels will be created separately
    });
  }

  /**
   * 创建邀请通知
   * @param data 通知数据
   * @returns 邀请通知实例
   */
  static createInvitationNotification(data: {
    userId: string;
    title: string;
    content: string;
    senderId: string;
    data?: Notification['data'];
  }): Partial<Notification> {
    return Notification.create({
      ...data,
      type: 'invitation',
      priority: 'high',
      channels: {
        inApp: { enabled: true, delivered: false },
        email: { enabled: true, delivered: false },
      },
    });
  }
}