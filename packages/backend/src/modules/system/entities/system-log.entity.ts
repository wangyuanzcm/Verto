import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

/**
 * 系统日志实体
 */
@Entity('system_logs')
@Index(['level'])
@Index(['module'])
@Index(['action'])
@Index(['userId'])
@Index(['ip'])
@Index(['createdAt'])
@Index(['level', 'createdAt'])
@Index(['module', 'action'])
export class SystemLog extends BaseEntity {
  @ApiProperty({ description: '日志级别' })
  @Column({
    type: 'enum',
    enum: ['debug', 'info', 'warn', 'error', 'fatal'],
    comment: '日志级别',
  })
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';

  @ApiProperty({ description: '模块名称' })
  @Column({
    type: 'varchar',
    length: 50,
    comment: '模块名称',
  })
  module: string;

  @ApiProperty({ description: '操作动作' })
  @Column({
    type: 'varchar',
    length: 50,
    comment: '操作动作',
  })
  action: string;

  @ApiProperty({ description: '日志消息' })
  @Column({
    type: 'text',
    comment: '日志消息',
  })
  message: string;

  @ApiProperty({ description: '详细描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '详细描述',
  })
  description?: string;

  @ApiProperty({ description: '用户ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '操作用户ID',
  })
  userId?: string;

  @ApiProperty({ description: 'IP地址', required: false })
  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
    comment: 'IP地址',
  })
  ip?: string;

  @ApiProperty({ description: '用户代理', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '用户代理',
  })
  userAgent?: string;

  @ApiProperty({ description: '请求方法', required: false })
  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '请求方法',
  })
  method?: string;

  @ApiProperty({ description: '请求URL', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '请求URL',
  })
  url?: string;

  @ApiProperty({ description: '响应状态码', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '响应状态码',
  })
  statusCode?: number;

  @ApiProperty({ description: '响应时间（毫秒）', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '响应时间（毫秒）',
  })
  responseTime?: number;

  @ApiProperty({ description: '请求数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '请求数据',
  })
  requestData?: {
    // 请求头
    headers?: Record<string, string>;
    
    // 查询参数
    query?: Record<string, any>;
    
    // 请求体
    body?: any;
    
    // 路径参数
    params?: Record<string, string>;
    
    // 文件信息
    files?: {
      fieldname: string;
      originalname: string;
      mimetype: string;
      size: number;
    }[];
  };

  @ApiProperty({ description: '响应数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '响应数据',
  })
  responseData?: {
    // 响应头
    headers?: Record<string, string>;
    
    // 响应体（可能被截断）
    body?: any;
    
    // 响应大小
    size?: number;
    
    // 是否被截断
    truncated?: boolean;
  };

  @ApiProperty({ description: '错误信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '错误信息',
  })
  error?: {
    // 错误名称
    name: string;
    
    // 错误消息
    message: string;
    
    // 错误堆栈
    stack?: string;
    
    // 错误代码
    code?: string;
    
    // 内部错误
    cause?: any;
    
    // 错误详情
    details?: Record<string, any>;
  };

  @ApiProperty({ description: '上下文信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '上下文信息',
  })
  context?: {
    // 会话ID
    sessionId?: string;
    
    // 请求ID
    requestId?: string;
    
    // 事务ID
    transactionId?: string;
    
    // 关联实体
    relatedEntities?: {
      type: string;
      id: string;
      name?: string;
    }[];
    
    // 业务数据
    businessData?: Record<string, any>;
    
    // 标签
    tags?: string[];
    
    // 环境信息
    environment?: {
      nodeVersion?: string;
      platform?: string;
      memory?: {
        used: number;
        total: number;
      };
      cpu?: {
        usage: number;
      };
    };
  };

  @ApiProperty({ description: '元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '元数据',
  })
  metadata?: {
    // 日志来源
    source?: 'api' | 'web' | 'mobile' | 'system' | 'cron' | 'webhook';
    
    // 日志分类
    category?: 'security' | 'performance' | 'business' | 'system' | 'debug';
    
    // 重要程度
    severity?: 'low' | 'medium' | 'high' | 'critical';
    
    // 是否已处理
    handled?: boolean;
    
    // 处理时间
    handledAt?: Date;
    
    // 处理人
    handledBy?: string;
    
    // 处理备注
    handledNote?: string;
    
    // 告警信息
    alert?: {
      enabled: boolean;
      sent: boolean;
      sentAt?: Date;
      recipients?: string[];
    };
    
    // 统计信息
    stats?: {
      occurrenceCount?: number; // 发生次数
      firstOccurrence?: Date; // 首次发生
      lastOccurrence?: Date; // 最后发生
      pattern?: string; // 模式识别
    };
  };

  @ApiProperty({ description: '地理位置信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '地理位置信息',
  })
  location?: {
    // 国家
    country?: string;
    
    // 省份/州
    region?: string;
    
    // 城市
    city?: string;
    
    // 经纬度
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    
    // ISP信息
    isp?: string;
    
    // 组织
    organization?: string;
    
    // 时区
    timezone?: string;
  };

  // 关联关系
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  /**
   * 检查是否为错误日志
   * @returns 是否为错误日志
   */
  isError(): boolean {
    return this.level === 'error' || this.level === 'fatal';
  }

  /**
   * 检查是否为警告日志
   * @returns 是否为警告日志
   */
  isWarning(): boolean {
    return this.level === 'warn';
  }

  /**
   * 检查是否为调试日志
   * @returns 是否为调试日志
   */
  isDebug(): boolean {
    return this.level === 'debug';
  }

  /**
   * 检查是否为安全相关日志
   * @returns 是否为安全相关日志
   */
  isSecurity(): boolean {
    return this.metadata?.category === 'security';
  }

  /**
   * 检查是否为性能相关日志
   * @returns 是否为性能相关日志
   */
  isPerformance(): boolean {
    return this.metadata?.category === 'performance';
  }

  /**
   * 检查是否需要告警
   * @returns 是否需要告警
   */
  needsAlert(): boolean {
    if (!this.metadata?.alert?.enabled) return false;
    if (this.metadata.alert.sent) return false;
    
    // 错误和致命错误需要告警
    if (this.level === 'error' || this.level === 'fatal') return true;
    
    // 高严重程度需要告警
    if (this.metadata.severity === 'critical' || this.metadata.severity === 'high') return true;
    
    return false;
  }

  /**
   * 标记为已处理
   * @param handledBy 处理人
   * @param note 处理备注
   */
  markAsHandled(handledBy: string, note?: string): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    
    this.metadata.handled = true;
    this.metadata.handledAt = new Date();
    this.metadata.handledBy = handledBy;
    if (note) {
      this.metadata.handledNote = note;
    }
  }

  /**
   * 标记告警已发送
   * @param recipients 接收人列表
   */
  markAlertSent(recipients: string[]): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    
    if (!this.metadata.alert) {
      this.metadata.alert = { enabled: true, sent: false };
    }
    
    this.metadata.alert.sent = true;
    this.metadata.alert.sentAt = new Date();
    this.metadata.alert.recipients = recipients;
  }

  /**
   * 获取格式化的日志消息
   * @returns 格式化的日志消息
   */
  getFormattedMessage(): string {
    const timestamp = this.createdAt.toISOString();
    const level = this.level.toUpperCase().padEnd(5);
    const module = this.module.padEnd(15);
    const action = this.action.padEnd(20);
    
    let message = `[${timestamp}] ${level} ${module} ${action} ${this.message}`;
    
    if (this.userId) {
      message += ` (User: ${this.userId})`;
    }
    
    if (this.ip) {
      message += ` (IP: ${this.ip})`;
    }
    
    return message;
  }

  /**
   * 获取简化的日志数据（用于API返回）
   * @param includeDetails 是否包含详细信息
   * @returns 简化的日志数据
   */
  toSimpleObject(includeDetails = false): any {
    const simple: any = {
      id: this.id,
      level: this.level,
      module: this.module,
      action: this.action,
      message: this.message,
      userId: this.userId,
      ip: this.ip,
      statusCode: this.statusCode,
      responseTime: this.responseTime,
      createdAt: this.createdAt,
    };
    
    if (includeDetails) {
      simple.description = this.description;
      simple.userAgent = this.userAgent;
      simple.method = this.method;
      simple.url = this.url;
      simple.error = this.error;
      simple.metadata = this.metadata;
    }
    
    return simple;
  }

  /**
   * 验证日志数据
   * @param data 日志数据
   * @returns 验证结果
   */
  static validate(data: Partial<SystemLog>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.level) {
      errors.push('日志级别不能为空');
    } else if (!['debug', 'info', 'warn', 'error', 'fatal'].includes(data.level)) {
      errors.push('日志级别无效');
    }
    
    if (!data.module || data.module.trim().length === 0) {
      errors.push('模块名称不能为空');
    }
    
    if (!data.action || data.action.trim().length === 0) {
      errors.push('操作动作不能为空');
    }
    
    if (!data.message || data.message.trim().length === 0) {
      errors.push('日志消息不能为空');
    }
    
    if (data.ip && !/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(data.ip) && 
        !/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(data.ip)) {
      errors.push('IP地址格式无效');
    }
    
    if (data.statusCode && (data.statusCode < 100 || data.statusCode > 599)) {
      errors.push('状态码无效');
    }
    
    if (data.responseTime && data.responseTime < 0) {
      errors.push('响应时间不能为负数');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建日志实例
   * @param data 日志数据
   * @returns 日志实例
   */
  static create(data: {
    level: SystemLog['level'];
    module: string;
    action: string;
    message: string;
    description?: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    method?: string;
    url?: string;
    statusCode?: number;
    responseTime?: number;
    requestData?: SystemLog['requestData'];
    responseData?: SystemLog['responseData'];
    error?: SystemLog['error'];
    context?: SystemLog['context'];
    metadata?: SystemLog['metadata'];
    location?: SystemLog['location'];
  }): Partial<SystemLog> {
    return {
      level: data.level,
      module: data.module,
      action: data.action,
      message: data.message,
      description: data.description,
      userId: data.userId,
      ip: data.ip,
      userAgent: data.userAgent,
      method: data.method,
      url: data.url,
      statusCode: data.statusCode,
      responseTime: data.responseTime,
      requestData: data.requestData,
      responseData: data.responseData,
      error: data.error,
      context: data.context,
      metadata: data.metadata,
      location: data.location,
    };
  }

  /**
   * 创建API请求日志
   * @param data API请求数据
   * @returns 日志实例
   */
  static createApiLog(data: {
    method: string;
    url: string;
    statusCode: number;
    responseTime: number;
    userId?: string;
    ip?: string;
    userAgent?: string;
    requestData?: any;
    responseData?: any;
    error?: any;
  }): Partial<SystemLog> {
    const level: SystemLog['level'] = data.statusCode >= 500 ? 'error' : 
                                     data.statusCode >= 400 ? 'warn' : 'info';
    
    return this.create({
      level,
      module: 'api',
      action: 'request',
      message: `${data.method} ${data.url} ${data.statusCode}`,
      userId: data.userId,
      ip: data.ip,
      userAgent: data.userAgent,
      method: data.method,
      url: data.url,
      statusCode: data.statusCode,
      responseTime: data.responseTime,
      requestData: data.requestData,
      responseData: data.responseData,
      error: data.error,
      metadata: {
        source: 'api',
        category: data.statusCode >= 400 ? 'security' : 'business',
        severity: data.statusCode >= 500 ? 'high' : 
                 data.statusCode >= 400 ? 'medium' : 'low',
      },
    });
  }

  /**
   * 创建安全日志
   * @param data 安全事件数据
   * @returns 日志实例
   */
  static createSecurityLog(data: {
    action: string;
    message: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    details?: any;
  }): Partial<SystemLog> {
    const level: SystemLog['level'] = data.severity === 'critical' ? 'fatal' :
                                     data.severity === 'high' ? 'error' :
                                     data.severity === 'medium' ? 'warn' : 'info';
    
    return this.create({
      level,
      module: 'security',
      action: data.action,
      message: data.message,
      userId: data.userId,
      ip: data.ip,
      userAgent: data.userAgent,
      context: {
        businessData: data.details,
      },
      metadata: {
        source: 'system',
        category: 'security',
        severity: data.severity || 'medium',
        alert: {
          enabled: (data.severity === 'critical' || data.severity === 'high'),
          sent: false,
        },
      },
    });
  }

  /**
   * 创建性能日志
   * @param data 性能数据
   * @returns 日志实例
   */
  static createPerformanceLog(data: {
    action: string;
    message: string;
    responseTime: number;
    threshold?: number;
    details?: any;
  }): Partial<SystemLog> {
    const threshold = data.threshold || 1000;
    const level: SystemLog['level'] = data.responseTime > threshold * 2 ? 'error' :
                                     data.responseTime > threshold ? 'warn' : 'info';
    
    return this.create({
      level,
      module: 'performance',
      action: data.action,
      message: data.message,
      responseTime: data.responseTime,
      context: {
        businessData: {
          threshold,
          ...data.details,
        },
      },
      metadata: {
        source: 'system',
        category: 'performance',
        severity: data.responseTime > threshold * 2 ? 'high' :
                 data.responseTime > threshold ? 'medium' : 'low',
      },
    });
  }

  /**
   * 创建业务日志
   * @param data 业务数据
   * @returns 日志实例
   */
  static createBusinessLog(data: {
    module: string;
    action: string;
    message: string;
    userId?: string;
    entityType?: string;
    entityId?: string;
    details?: any;
  }): Partial<SystemLog> {
    return this.create({
      level: 'info',
      module: data.module,
      action: data.action,
      message: data.message,
      userId: data.userId,
      context: {
        relatedEntities: data.entityType && data.entityId ? [{
          type: data.entityType,
          id: data.entityId,
        }] : undefined,
        businessData: data.details,
      },
      metadata: {
        source: 'system',
        category: 'business',
        severity: 'low',
      },
    });
  }
}