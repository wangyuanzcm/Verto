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
 * 通知统计实体
 */
@Entity('notification_statistics')
@Index(['notificationId'], { unique: true })
@Index(['openCount'])
@Index(['clickCount'])
export class NotificationStatistics extends BaseEntity {
  @ApiProperty({ description: '通知ID' })
  @Column({
    type: 'varchar',
    length: 36,
    unique: true,
    comment: '通知ID',
  })
  notificationId: string;

  @ApiProperty({ description: '发送尝试次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '发送尝试次数',
  })
  sendAttempts: number;

  @ApiProperty({ description: '发送错误次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '发送错误次数',
  })
  sendErrors: number;

  @ApiProperty({ description: '最后发送错误', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '最后一次发送错误信息',
  })
  lastSendError?: string;

  @ApiProperty({ description: '打开次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '通知打开次数',
  })
  openCount: number;

  @ApiProperty({ description: '点击次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '通知点击次数',
  })
  clickCount: number;

  @ApiProperty({ description: '首次打开时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '首次打开时间',
  })
  firstOpenAt?: Date;

  @ApiProperty({ description: '最后打开时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后打开时间',
  })
  lastOpenAt?: Date;

  @ApiProperty({ description: '首次点击时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '首次点击时间',
  })
  firstClickAt?: Date;

  @ApiProperty({ description: '最后点击时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后点击时间',
  })
  lastClickAt?: Date;

  @ApiProperty({ description: '渠道统计', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '各渠道统计信息',
  })
  channelStats?: {
    [channel: string]: {
      attempts: number;
      successes: number;
      failures: number;
      lastAttemptAt?: Date;
      avgDeliveryTime?: number; // 平均送达时间（毫秒）
      errorRate?: number; // 错误率
    };
  };

  @ApiProperty({ description: '用户行为统计', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '用户行为统计',
  })
  userBehavior?: {
    readTime?: number; // 阅读时长（秒）
    interactionCount?: number; // 交互次数
    shareCount?: number; // 分享次数
    dismissCount?: number; // 忽略次数
    deviceInfo?: {
      platform?: string;
      browser?: string;
      os?: string;
    };
    location?: {
      country?: string;
      region?: string;
      city?: string;
    };
  };

  @ApiProperty({ description: '性能统计', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '性能统计',
  })
  performance?: {
    deliveryTime?: number; // 送达时间（毫秒）
    renderTime?: number; // 渲染时间（毫秒）
    loadTime?: number; // 加载时间（毫秒）
    responseTime?: number; // 响应时间（毫秒）
  };

  // 关联关系
  @OneToOne(() => Notification, notification => notification.statistics)
  @JoinColumn({ name: 'notificationId' })
  notification: Notification;

  /**
   * 记录发送尝试
   */
  recordSendAttempt(channel: string, success: boolean, error?: string): void {
    this.sendAttempts += 1;
    
    if (!success) {
      this.sendErrors += 1;
      if (error) {
        this.lastSendError = error;
      }
    }

    // 更新渠道统计
    if (!this.channelStats) {
      this.channelStats = {};
    }
    
    if (!this.channelStats[channel]) {
      this.channelStats[channel] = {
        attempts: 0,
        successes: 0,
        failures: 0,
      };
    }
    
    this.channelStats[channel].attempts += 1;
    this.channelStats[channel].lastAttemptAt = new Date();
    
    if (success) {
      this.channelStats[channel].successes += 1;
    } else {
      this.channelStats[channel].failures += 1;
    }
    
    // 计算错误率
    this.channelStats[channel].errorRate = 
      this.channelStats[channel].failures / this.channelStats[channel].attempts;
  }

  /**
   * 记录打开事件
   */
  recordOpen(): void {
    this.openCount += 1;
    const now = new Date();
    
    if (!this.firstOpenAt) {
      this.firstOpenAt = now;
    }
    this.lastOpenAt = now;
  }

  /**
   * 记录点击事件
   */
  recordClick(): void {
    this.clickCount += 1;
    const now = new Date();
    
    if (!this.firstClickAt) {
      this.firstClickAt = now;
    }
    this.lastClickAt = now;
  }

  /**
   * 记录用户行为
   */
  recordUserBehavior(behavior: Partial<NotificationStatistics['userBehavior']>): void {
    if (!this.userBehavior) {
      this.userBehavior = {};
    }
    
    Object.assign(this.userBehavior, behavior);
  }

  /**
   * 记录性能数据
   */
  recordPerformance(performance: Partial<NotificationStatistics['performance']>): void {
    if (!this.performance) {
      this.performance = {};
    }
    
    Object.assign(this.performance, performance);
  }

  /**
   * 获取点击率
   */
  getClickThroughRate(): number {
    if (this.openCount === 0) return 0;
    return (this.clickCount / this.openCount) * 100;
  }

  /**
   * 获取成功率
   */
  getSuccessRate(): number {
    if (this.sendAttempts === 0) return 0;
    return ((this.sendAttempts - this.sendErrors) / this.sendAttempts) * 100;
  }

  /**
   * 获取渠道成功率
   */
  getChannelSuccessRate(channel: string): number {
    if (!this.channelStats || !this.channelStats[channel]) return 0;
    
    const stats = this.channelStats[channel];
    if (stats.attempts === 0) return 0;
    
    return (stats.successes / stats.attempts) * 100;
  }

  /**
   * 获取平均送达时间
   */
  getAverageDeliveryTime(channel?: string): number {
    if (channel && this.channelStats && this.channelStats[channel]) {
      return this.channelStats[channel].avgDeliveryTime || 0;
    }
    
    return this.performance?.deliveryTime || 0;
  }

  /**
   * 检查是否为热门通知
   */
  isPopular(openThreshold: number = 10, clickThreshold: number = 5): boolean {
    return this.openCount >= openThreshold || this.clickCount >= clickThreshold;
  }

  /**
   * 获取用户参与度评分
   */
  getEngagementScore(): number {
    let score = 0;
    
    // 打开得分（最高40分）
    score += Math.min(this.openCount * 4, 40);
    
    // 点击得分（最高30分）
    score += Math.min(this.clickCount * 6, 30);
    
    // 分享得分（最高20分）
    if (this.userBehavior?.shareCount) {
      score += Math.min(this.userBehavior.shareCount * 10, 20);
    }
    
    // 阅读时长得分（最高10分）
    if (this.userBehavior?.readTime) {
      score += Math.min(this.userBehavior.readTime / 6, 10); // 每6秒1分
    }
    
    return Math.min(score, 100);
  }

  /**
   * 重置统计数据
   */
  reset(): void {
    this.sendAttempts = 0;
    this.sendErrors = 0;
    this.lastSendError = null;
    this.openCount = 0;
    this.clickCount = 0;
    this.firstOpenAt = null;
    this.lastOpenAt = null;
    this.firstClickAt = null;
    this.lastClickAt = null;
    this.channelStats = null;
    this.userBehavior = null;
    this.performance = null;
  }

  /**
   * 导出统计报告
   */
  exportReport(): {
    basic: {
      sendAttempts: number;
      sendErrors: number;
      openCount: number;
      clickCount: number;
      successRate: number;
      clickThroughRate: number;
      engagementScore: number;
    };
    channels: { [channel: string]: any };
    performance: any;
    userBehavior: any;
  } {
    return {
      basic: {
        sendAttempts: this.sendAttempts,
        sendErrors: this.sendErrors,
        openCount: this.openCount,
        clickCount: this.clickCount,
        successRate: this.getSuccessRate(),
        clickThroughRate: this.getClickThroughRate(),
        engagementScore: this.getEngagementScore(),
      },
      channels: this.channelStats || {},
      performance: this.performance || {},
      userBehavior: this.userBehavior || {},
    };
  }
}