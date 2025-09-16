import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Notification } from './notification.entity';

/**
 * 通知渠道实体
 */
@Entity('notification_channels')
@Index(['notificationId'])
@Index(['channel'])
@Index(['status'])
export class NotificationChannel extends BaseEntity {
  @ApiProperty({ description: '通知ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '通知ID',
  })
  notificationId: string;

  @ApiProperty({ description: '渠道类型' })
  @Column({
    type: 'enum',
    enum: ['inApp', 'email', 'sms', 'push', 'wechat'],
    comment: '渠道类型',
  })
  channel: 'inApp' | 'email' | 'sms' | 'push' | 'wechat';

  @ApiProperty({ description: '是否启用' })
  @Column({
    type: 'boolean',
    default: true,
    comment: '是否启用',
  })
  enabled: boolean;

  @ApiProperty({ description: '发送状态' })
  @Column({
    type: 'enum',
    enum: ['pending', 'sending', 'delivered', 'failed'],
    default: 'pending',
    comment: '发送状态',
  })
  status: 'pending' | 'sending' | 'delivered' | 'failed';

  @ApiProperty({ description: '接收地址', required: false })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '接收地址（邮箱、手机号等）',
  })
  address?: string;

  @ApiProperty({ description: '发送时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '发送时间',
  })
  sentAt?: Date;

  @ApiProperty({ description: '送达时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '送达时间',
  })
  deliveredAt?: Date;

  @ApiProperty({ description: '消息ID', required: false })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '第三方服务返回的消息ID',
  })
  messageId?: string;

  @ApiProperty({ description: '错误信息', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '发送失败的错误信息',
  })
  error?: string;

  @ApiProperty({ description: '重试次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '重试次数',
  })
  retryCount: number;

  @ApiProperty({ description: '下次重试时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '下次重试时间',
  })
  nextRetryAt?: Date;

  @ApiProperty({ description: '渠道配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '渠道特定配置',
  })
  config?: {
    // 邮件配置
    email?: {
      subject?: string;
      template?: string;
      attachments?: string[];
    };
    // 短信配置
    sms?: {
      template?: string;
      signature?: string;
    };
    // 推送配置
    push?: {
      title?: string;
      badge?: number;
      sound?: string;
      icon?: string;
    };
    // 微信配置
    wechat?: {
      templateId?: string;
      url?: string;
      miniprogram?: {
        appid: string;
        pagepath: string;
      };
    };
  };

  // 关联关系
  @ManyToOne(() => Notification, notification => notification.channels)
  @JoinColumn({ name: 'notificationId' })
  notification: Notification;

  /**
   * 检查是否已发送
   */
  isSent(): boolean {
    return this.status === 'delivered';
  }

  /**
   * 检查是否发送失败
   */
  isFailed(): boolean {
    return this.status === 'failed';
  }

  /**
   * 检查是否可以重试
   */
  canRetry(maxRetries: number = 3): boolean {
    return this.status === 'failed' && this.retryCount < maxRetries;
  }

  /**
   * 标记为发送中
   */
  markAsSending(): void {
    this.status = 'sending';
    this.sentAt = new Date();
  }

  /**
   * 标记为已送达
   */
  markAsDelivered(messageId?: string): void {
    this.status = 'delivered';
    this.deliveredAt = new Date();
    if (messageId) {
      this.messageId = messageId;
    }
    this.error = null;
  }

  /**
   * 标记为发送失败
   */
  markAsFailed(error: string): void {
    this.status = 'failed';
    this.error = error;
    this.retryCount += 1;
    
    // 计算下次重试时间（指数退避）
    if (this.canRetry()) {
      const backoffMinutes = Math.pow(2, this.retryCount) * 5; // 5, 10, 20, 40 分钟
      this.nextRetryAt = new Date(Date.now() + backoffMinutes * 60 * 1000);
    }
  }

  /**
   * 重置重试状态
   */
  resetRetry(): void {
    this.retryCount = 0;
    this.nextRetryAt = null;
    this.error = null;
  }

  /**
   * 获取渠道显示名称
   */
  getChannelDisplayName(): string {
    const names = {
      inApp: '应用内通知',
      email: '邮件',
      sms: '短信',
      push: '推送通知',
      wechat: '微信',
    };
    return names[this.channel] || this.channel;
  }

  /**
   * 验证渠道数据
   */
  static validate(data: Partial<NotificationChannel>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.notificationId) {
      errors.push('通知ID不能为空');
    }

    if (!data.channel) {
      errors.push('渠道类型不能为空');
    }

    const validChannels = ['inApp', 'email', 'sms', 'push', 'wechat'];
    if (data.channel && !validChannels.includes(data.channel)) {
      errors.push('无效的渠道类型');
    }

    // 验证地址格式
    if (data.channel === 'email' && data.address) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.address)) {
        errors.push('邮箱地址格式不正确');
      }
    }

    if (data.channel === 'sms' && data.address) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(data.address)) {
        errors.push('手机号格式不正确');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}