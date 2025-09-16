import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { LoginStatus, LoginType } from '../../../common/enums';
import { User } from './user.entity';

/**
 * 登录日志实体
 */
@Entity('login_logs')
@Index(['userId'])
@Index(['loginTime'])
@Index(['status'])
@Index(['ip'])
@Index(['userAgent'])
export class LoginLog extends BaseEntity {
  @ApiProperty({ description: '用户ID' })
  @Column({
    type: 'uuid',
    comment: '用户ID',
  })
  userId: string;

  @ApiProperty({ description: '登录类型', enum: LoginType })
  @Column({
    type: 'enum',
    enum: LoginType,
    comment: '登录类型',
  })
  type: LoginType;

  @ApiProperty({ description: '登录状态', enum: LoginStatus })
  @Column({
    type: 'enum',
    enum: LoginStatus,
    comment: '登录状态',
  })
  status: LoginStatus;

  @ApiProperty({ description: '登录时间' })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '登录时间',
  })
  loginTime: Date;

  @ApiProperty({ description: '登出时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '登出时间',
  })
  logoutTime?: Date;

  @ApiProperty({ description: '登录IP地址' })
  @Column({
    type: 'varchar',
    length: 45,
    comment: '登录IP地址',
  })
  ip: string;

  @ApiProperty({ description: 'IP地址位置', required: false })
  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: 'IP地址位置',
  })
  location?: string;

  @ApiProperty({ description: '用户代理' })
  @Column({
    type: 'text',
    comment: '用户代理（浏览器信息）',
  })
  userAgent: string;

  @ApiProperty({ description: '设备类型', required: false })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '设备类型（desktop、mobile、tablet）',
  })
  deviceType?: string;

  @ApiProperty({ description: '操作系统', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '操作系统',
  })
  os?: string;

  @ApiProperty({ description: '浏览器', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '浏览器',
  })
  browser?: string;

  @ApiProperty({ description: '浏览器版本', required: false })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '浏览器版本',
  })
  browserVersion?: string;

  @ApiProperty({ description: '登录来源', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '登录来源（web、mobile、api等）',
  })
  source?: string;

  @ApiProperty({ description: '会话ID', required: false })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '会话ID',
  })
  sessionId?: string;

  @ApiProperty({ description: '会话持续时间（秒）', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '会话持续时间（秒）',
  })
  sessionDuration?: number;

  @ApiProperty({ description: '失败原因', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '失败原因',
  })
  failureReason?: string;

  @ApiProperty({ description: '失败次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '失败次数',
  })
  failureCount: number;

  @ApiProperty({ description: '是否可疑登录' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否可疑登录',
  })
  isSuspicious: boolean;

  @ApiProperty({ description: '风险评分', required: false })
  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
    comment: '风险评分（0-1）',
  })
  riskScore?: number;

  @ApiProperty({ description: '双因子认证状态', required: false })
  @Column({
    type: 'boolean',
    nullable: true,
    comment: '双因子认证状态',
  })
  twoFactorUsed?: boolean;

  @ApiProperty({ description: '记住登录状态' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '记住登录状态',
  })
  rememberMe: boolean;

  @ApiProperty({ description: '额外信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '额外信息',
  })
  metadata?: Record<string, any>;

  // 关联关系
  @ApiProperty({ description: '用户', type: () => User })
  @ManyToOne(() => User, user => user.loginLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * 检查是否登录成功
   * @returns 是否成功
   */
  isSuccess(): boolean {
    return this.status === LoginStatus.SUCCESS;
  }

  /**
   * 检查是否登录失败
   * @returns 是否失败
   */
  isFailure(): boolean {
    return this.status === LoginStatus.FAILURE;
  }

  /**
   * 检查是否已登出
   * @returns 是否已登出
   */
  isLoggedOut(): boolean {
    return !!this.logoutTime;
  }

  /**
   * 检查会话是否活跃
   * @returns 是否活跃
   */
  isSessionActive(): boolean {
    return this.isSuccess() && !this.isLoggedOut();
  }

  /**
   * 设置登出时间并计算会话持续时间
   */
  logout(): void {
    this.logoutTime = new Date();
    
    if (this.loginTime) {
      this.sessionDuration = Math.floor(
        (this.logoutTime.getTime() - this.loginTime.getTime()) / 1000
      );
    }
  }

  /**
   * 获取会话持续时间（格式化）
   * @returns 格式化的持续时间
   */
  getFormattedDuration(): string {
    if (!this.sessionDuration) {
      return '未知';
    }

    const hours = Math.floor(this.sessionDuration / 3600);
    const minutes = Math.floor((this.sessionDuration % 3600) / 60);
    const seconds = this.sessionDuration % 60;

    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟${seconds}秒`;
    } else {
      return `${seconds}秒`;
    }
  }

  /**
   * 获取登录类型显示名称
   * @returns 类型名称
   */
  getTypeDisplayName(): string {
    const typeNames = {
      [LoginType.PASSWORD]: '密码登录',
      [LoginType.EMAIL]: '邮箱登录',
      [LoginType.PHONE]: '手机登录',
      [LoginType.OAUTH]: '第三方登录',
      [LoginType.SSO]: '单点登录',
      [LoginType.API]: 'API登录',
    };
    
    return typeNames[this.type] || this.type;
  }

  /**
   * 获取状态显示名称
   * @returns 状态名称
   */
  getStatusDisplayName(): string {
    const statusNames = {
      [LoginStatus.SUCCESS]: '成功',
      [LoginStatus.FAILURE]: '失败',
      [LoginStatus.BLOCKED]: '被阻止',
      [LoginStatus.EXPIRED]: '已过期',
    };
    
    return statusNames[this.status] || this.status;
  }

  /**
   * 检查是否为异常登录
   * @param userLastLogin 用户上次登录信息
   * @returns 是否异常
   */
  isAnomalous(userLastLogin?: { ip: string; location?: string; userAgent: string }): boolean {
    if (!userLastLogin) {
      return false;
    }

    // IP地址变化
    if (this.ip !== userLastLogin.ip) {
      return true;
    }

    // 地理位置变化（如果有位置信息）
    if (this.location && userLastLogin.location && this.location !== userLastLogin.location) {
      return true;
    }

    // 设备变化（简单检查用户代理）
    if (this.userAgent !== userLastLogin.userAgent) {
      return true;
    }

    return false;
  }

  /**
   * 计算风险评分
   * @param context 上下文信息
   * @returns 风险评分
   */
  calculateRiskScore(context: {
    isNewDevice?: boolean;
    isNewLocation?: boolean;
    recentFailures?: number;
    timeOfDay?: number; // 0-23
  } = {}): number {
    let score = 0;

    // 新设备风险
    if (context.isNewDevice) {
      score += 0.3;
    }

    // 新位置风险
    if (context.isNewLocation) {
      score += 0.4;
    }

    // 最近失败次数风险
    if (context.recentFailures) {
      score += Math.min(context.recentFailures * 0.1, 0.3);
    }

    // 异常时间风险（深夜登录）
    if (context.timeOfDay !== undefined) {
      if (context.timeOfDay >= 0 && context.timeOfDay <= 5) {
        score += 0.2;
      }
    }

    // 已标记为可疑
    if (this.isSuspicious) {
      score += 0.5;
    }

    return Math.min(score, 1.0);
  }

  /**
   * 标记为可疑登录
   * @param reason 原因
   */
  markAsSuspicious(reason?: string): void {
    this.isSuspicious = true;
    
    if (reason) {
      if (!this.metadata) {
        this.metadata = {};
      }
      this.metadata.suspiciousReason = reason;
    }
  }
}