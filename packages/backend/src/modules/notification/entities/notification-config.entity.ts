import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Notification } from './notification.entity';

/**
 * 通知配置实体
 */
@Entity('notification_configs')
@Index(['notificationId'], { unique: true })
@Index(['templateId'])
@Index(['batchId'])
export class NotificationConfig extends BaseEntity {
  @ApiProperty({ description: '通知ID' })
  @Column({
    type: 'varchar',
    length: 36,
    unique: true,
    comment: '通知ID',
  })
  notificationId: string;

  @ApiProperty({ description: '重试配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '重试配置',
  })
  retry?: {
    enabled: boolean;
    maxAttempts: number;
    currentAttempt: number;
    nextRetryAt?: Date;
    backoffMultiplier: number;
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
    retryChannels?: string[]; // 指定重试的渠道
  };

  @ApiProperty({ description: '批量发送配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '批量发送配置',
  })
  batch?: {
    enabled: boolean;
    batchId?: string;
    batchSize?: number;
    batchIndex?: number;
    totalBatches?: number;
    delayBetweenBatches?: number; // 批次间延迟（毫秒）
    priority?: number; // 批次优先级
  };

  @ApiProperty({ description: '模板配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '模板配置',
  })
  template?: {
    id?: string;
    name?: string;
    version?: string;
    variables?: Record<string, any>;
    fallbackTemplate?: string; // 备用模板
    customTemplate?: {
      subject?: string;
      body?: string;
      html?: string;
    };
  };

  @ApiProperty({ description: '个性化配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '个性化配置',
  })
  personalization?: {
    language?: string;
    timezone?: string;
    format?: string;
    locale?: string;
    currency?: string;
    dateFormat?: string;
    timeFormat?: string;
    numberFormat?: string;
  };

  @ApiProperty({ description: '追踪配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '追踪配置',
  })
  tracking?: {
    enabled: boolean;
    trackOpen?: boolean;
    trackClick?: boolean;
    trackingId?: string;
    pixelUrl?: string;
    analyticsProvider?: string;
    customEvents?: string[];
  };

  @ApiProperty({ description: '限流配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '限流配置',
  })
  rateLimit?: {
    enabled: boolean;
    maxPerMinute?: number;
    maxPerHour?: number;
    maxPerDay?: number;
    burstLimit?: number;
    windowSize?: number; // 时间窗口大小（秒）
  };

  @ApiProperty({ description: '优先级配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '优先级配置',
  })
  priority?: {
    level: 'low' | 'normal' | 'high' | 'urgent';
    weight?: number;
    queueName?: string;
    maxWaitTime?: number; // 最大等待时间（毫秒）
    escalationRules?: {
      condition: string;
      newPriority: string;
      delay: number;
    }[];
  };

  @ApiProperty({ description: '安全配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '安全配置',
  })
  security?: {
    encryption?: {
      enabled: boolean;
      algorithm?: string;
      keyId?: string;
    };
    signature?: {
      enabled: boolean;
      algorithm?: string;
      keyId?: string;
    };
    ipWhitelist?: string[];
    userAgentFilter?: string[];
    contentFilter?: {
      enabled: boolean;
      rules: string[];
    };
  };

  @ApiProperty({ description: '模板ID', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '模板ID',
  })
  templateId?: string;

  @ApiProperty({ description: '批次ID', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '批次ID',
  })
  batchId?: string;

  // 关联关系
  @OneToOne(() => Notification, notification => notification.config)
  @JoinColumn({ name: 'notificationId' })
  notification: Notification;

  /**
   * 检查是否启用重试
   */
  isRetryEnabled(): boolean {
    return this.retry?.enabled === true;
  }

  /**
   * 检查是否可以重试
   */
  canRetry(): boolean {
    if (!this.isRetryEnabled()) return false;
    
    const maxAttempts = this.retry?.maxAttempts || 3;
    const currentAttempt = this.retry?.currentAttempt || 0;
    
    return currentAttempt < maxAttempts;
  }

  /**
   * 计算下次重试时间
   */
  calculateNextRetryTime(): Date | null {
    if (!this.canRetry()) return null;
    
    const currentAttempt = this.retry?.currentAttempt || 0;
    const multiplier = this.retry?.backoffMultiplier || 2;
    const strategy = this.retry?.backoffStrategy || 'exponential';
    
    let delayMs = 0;
    
    switch (strategy) {
      case 'linear':
        delayMs = (currentAttempt + 1) * 60000; // 1, 2, 3 分钟
        break;
      case 'exponential':
        delayMs = Math.pow(multiplier, currentAttempt) * 60000; // 2, 4, 8 分钟
        break;
      case 'fixed':
        delayMs = 5 * 60000; // 固定5分钟
        break;
    }
    
    return new Date(Date.now() + delayMs);
  }

  /**
   * 增加重试次数
   */
  incrementRetryAttempt(): void {
    if (!this.retry) {
      this.retry = {
        enabled: true,
        maxAttempts: 3,
        currentAttempt: 0,
        backoffMultiplier: 2,
        backoffStrategy: 'exponential',
      };
    }
    
    this.retry.currentAttempt += 1;
    this.retry.nextRetryAt = this.calculateNextRetryTime();
  }

  /**
   * 重置重试状态
   */
  resetRetry(): void {
    if (this.retry) {
      this.retry.currentAttempt = 0;
      this.retry.nextRetryAt = undefined;
    }
  }

  /**
   * 检查是否启用批量发送
   */
  isBatchEnabled(): boolean {
    return this.batch?.enabled === true;
  }

  /**
   * 获取批次延迟时间
   */
  getBatchDelay(): number {
    return this.batch?.delayBetweenBatches || 0;
  }

  /**
   * 检查是否启用追踪
   */
  isTrackingEnabled(): boolean {
    return this.tracking?.enabled === true;
  }

  /**
   * 检查是否追踪打开
   */
  shouldTrackOpen(): boolean {
    return this.isTrackingEnabled() && (this.tracking?.trackOpen === true);
  }

  /**
   * 检查是否追踪点击
   */
  shouldTrackClick(): boolean {
    return this.isTrackingEnabled() && (this.tracking?.trackClick === true);
  }

  /**
   * 获取模板变量
   */
  getTemplateVariables(): Record<string, any> {
    return this.template?.variables || {};
  }

  /**
   * 设置模板变量
   */
  setTemplateVariable(key: string, value: any): void {
    if (!this.template) {
      this.template = {};
    }
    if (!this.template.variables) {
      this.template.variables = {};
    }
    this.template.variables[key] = value;
  }

  /**
   * 获取个性化语言
   */
  getLanguage(): string {
    return this.personalization?.language || 'zh-CN';
  }

  /**
   * 获取时区
   */
  getTimezone(): string {
    return this.personalization?.timezone || 'Asia/Shanghai';
  }

  /**
   * 检查IP是否在白名单中
   */
  isIpWhitelisted(ip: string): boolean {
    if (!this.security?.ipWhitelist) return true;
    return this.security.ipWhitelist.includes(ip);
  }

  /**
   * 检查是否启用加密
   */
  isEncryptionEnabled(): boolean {
    return this.security?.encryption?.enabled === true;
  }

  /**
   * 检查是否启用签名
   */
  isSignatureEnabled(): boolean {
    return this.security?.signature?.enabled === true;
  }

  /**
   * 获取限流配置
   */
  getRateLimit(): {
    maxPerMinute: number;
    maxPerHour: number;
    maxPerDay: number;
  } {
    return {
      maxPerMinute: this.rateLimit?.maxPerMinute || 60,
      maxPerHour: this.rateLimit?.maxPerHour || 1000,
      maxPerDay: this.rateLimit?.maxPerDay || 10000,
    };
  }

  /**
   * 验证配置数据
   */
  static validate(data: Partial<NotificationConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.notificationId) {
      errors.push('通知ID不能为空');
    }

    // 验证重试配置
    if (data.retry) {
      if (data.retry.maxAttempts && data.retry.maxAttempts < 1) {
        errors.push('最大重试次数必须大于0');
      }
      if (data.retry.backoffMultiplier && data.retry.backoffMultiplier < 1) {
        errors.push('退避倍数必须大于等于1');
      }
    }

    // 验证批量配置
    if (data.batch) {
      if (data.batch.batchSize && data.batch.batchSize < 1) {
        errors.push('批次大小必须大于0');
      }
      if (data.batch.delayBetweenBatches && data.batch.delayBetweenBatches < 0) {
        errors.push('批次延迟不能为负数');
      }
    }

    // 验证限流配置
    if (data.rateLimit) {
      if (data.rateLimit.maxPerMinute && data.rateLimit.maxPerMinute < 1) {
        errors.push('每分钟最大发送数必须大于0');
      }
      if (data.rateLimit.maxPerHour && data.rateLimit.maxPerHour < 1) {
        errors.push('每小时最大发送数必须大于0');
      }
      if (data.rateLimit.maxPerDay && data.rateLimit.maxPerDay < 1) {
        errors.push('每天最大发送数必须大于0');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}