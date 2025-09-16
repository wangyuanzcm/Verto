import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Project } from '../../project/entities/project.entity';

/**
 * API接口实体
 */
@Entity('apis')
@Index(['name'])
@Index(['method'])
@Index(['status'])
@Index(['creatorId'])
@Index(['projectId'])
@Index(['isActive'])
@Index(['category'])
@Index(['version'])
@Index(['createdAt'])
@Index(['projectId', 'status'])
@Index(['creatorId', 'category'])
@Index(['method', 'path'])
export class Api extends BaseEntity {
  @ApiProperty({ description: 'API名称' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: 'API接口名称',
  })
  name: string;

  @ApiProperty({ description: 'API描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: 'API接口描述',
  })
  description?: string;

  @ApiProperty({ description: 'HTTP方法' })
  @Column({
    type: 'enum',
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    comment: 'HTTP请求方法',
  })
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

  @ApiProperty({ description: 'API路径' })
  @Column({
    type: 'varchar',
    length: 500,
    comment: 'API请求路径',
  })
  path: string;

  @ApiProperty({ description: 'API分类' })
  @Column({
    type: 'varchar',
    length: 50,
    comment: 'API分类',
  })
  category: string;

  @ApiProperty({ description: 'API版本' })
  @Column({
    type: 'varchar',
    length: 20,
    default: 'v1',
    comment: 'API版本',
  })
  version: string;

  @ApiProperty({ description: 'API状态' })
  @Column({
    type: 'enum',
    enum: ['draft', 'design', 'development', 'testing', 'published', 'deprecated', 'archived'],
    default: 'draft',
    comment: 'API状态',
  })
  status: 'draft' | 'design' | 'development' | 'testing' | 'published' | 'deprecated' | 'archived';

  @ApiProperty({ description: '是否激活' })
  @Column({
    type: 'boolean',
    default: true,
    comment: '是否激活',
  })
  isActive: boolean;

  @ApiProperty({ description: '是否公开' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否公开API',
  })
  isPublic: boolean;

  @ApiProperty({ description: '是否需要认证' })
  @Column({
    type: 'boolean',
    default: true,
    comment: '是否需要认证',
  })
  requiresAuth: boolean;

  @ApiProperty({ description: '创建者ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '创建者用户ID',
  })
  creatorId: string;

  @ApiProperty({ description: '项目ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '关联项目ID',
  })
  projectId?: string;

  @ApiProperty({ description: '基础URL', required: false })
  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: 'API基础URL',
  })
  baseUrl?: string;

  @ApiProperty({ description: '请求参数定义', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '请求参数定义',
  })
  parameters?: {
    // 路径参数
    path?: {
      name: string;
      type: 'string' | 'number' | 'boolean';
      description?: string;
      required?: boolean;
      example?: any;
      pattern?: string; // 正则表达式
      enum?: any[];
    }[];
    
    // 查询参数
    query?: {
      name: string;
      type: 'string' | 'number' | 'boolean' | 'array';
      description?: string;
      required?: boolean;
      example?: any;
      default?: any;
      minimum?: number;
      maximum?: number;
      minLength?: number;
      maxLength?: number;
      pattern?: string;
      enum?: any[];
      items?: {
        type: string;
        enum?: any[];
      };
    }[];
    
    // 请求头参数
    header?: {
      name: string;
      type: 'string' | 'number' | 'boolean';
      description?: string;
      required?: boolean;
      example?: any;
      enum?: any[];
    }[];
    
    // Cookie参数
    cookie?: {
      name: string;
      type: 'string' | 'number' | 'boolean';
      description?: string;
      required?: boolean;
      example?: any;
    }[];
  };

  @ApiProperty({ description: '请求体定义', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '请求体定义',
  })
  requestBody?: {
    description?: string;
    required?: boolean;
    
    // 内容类型
    content: {
      [mediaType: string]: {
        schema: {
          type: 'object' | 'array' | 'string' | 'number' | 'boolean';
          properties?: {
            [key: string]: {
              type: 'string' | 'number' | 'boolean' | 'object' | 'array';
              description?: string;
              required?: boolean;
              example?: any;
              default?: any;
              format?: string;
              pattern?: string;
              minimum?: number;
              maximum?: number;
              minLength?: number;
              maxLength?: number;
              enum?: any[];
              items?: any;
              properties?: any;
            };
          };
          required?: string[];
          example?: any;
        };
        
        // 示例
        examples?: {
          [name: string]: {
            summary?: string;
            description?: string;
            value: any;
          };
        };
      };
    };
  };

  @ApiProperty({ description: '响应定义', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '响应定义',
  })
  responses?: {
    [statusCode: string]: {
      description: string;
      
      // 响应头
      headers?: {
        [name: string]: {
          description?: string;
          schema: {
            type: 'string' | 'number' | 'boolean';
            format?: string;
            enum?: any[];
          };
          example?: any;
        };
      };
      
      // 响应内容
      content?: {
        [mediaType: string]: {
          schema: {
            type: 'object' | 'array' | 'string' | 'number' | 'boolean';
            properties?: {
              [key: string]: {
                type: 'string' | 'number' | 'boolean' | 'object' | 'array';
                description?: string;
                format?: string;
                example?: any;
                items?: any;
                properties?: any;
              };
            };
            items?: any;
            example?: any;
          };
          
          // 示例
          examples?: {
            [name: string]: {
              summary?: string;
              description?: string;
              value: any;
            };
          };
        };
      };
    };
  };

  @ApiProperty({ description: '认证配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '认证配置',
  })
  authentication?: {
    // 认证类型
    type: 'none' | 'basic' | 'bearer' | 'apikey' | 'oauth2' | 'openid';
    
    // 基础认证
    basic?: {
      username: string;
      password: string;
    };
    
    // Bearer Token
    bearer?: {
      format?: 'JWT' | 'custom';
      bearerFormat?: string;
    };
    
    // API Key
    apiKey?: {
      name: string;
      in: 'query' | 'header' | 'cookie';
    };
    
    // OAuth2
    oauth2?: {
      flows: {
        authorizationCode?: {
          authorizationUrl: string;
          tokenUrl: string;
          refreshUrl?: string;
          scopes: { [scope: string]: string };
        };
        implicit?: {
          authorizationUrl: string;
          refreshUrl?: string;
          scopes: { [scope: string]: string };
        };
        password?: {
          tokenUrl: string;
          refreshUrl?: string;
          scopes: { [scope: string]: string };
        };
        clientCredentials?: {
          tokenUrl: string;
          refreshUrl?: string;
          scopes: { [scope: string]: string };
        };
      };
    };
    
    // OpenID Connect
    openIdConnect?: {
      openIdConnectUrl: string;
    };
  };

  @ApiProperty({ description: '限流配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '限流配置',
  })
  rateLimit?: {
    // 是否启用限流
    enabled: boolean;
    
    // 限流策略
    strategy: 'fixed_window' | 'sliding_window' | 'token_bucket' | 'leaky_bucket';
    
    // 限制配置
    limits: {
      // 每秒请求数
      requestsPerSecond?: number;
      
      // 每分钟请求数
      requestsPerMinute?: number;
      
      // 每小时请求数
      requestsPerHour?: number;
      
      // 每天请求数
      requestsPerDay?: number;
      
      // 并发请求数
      concurrentRequests?: number;
    };
    
    // 限流维度
    dimension: 'ip' | 'user' | 'api_key' | 'custom';
    
    // 自定义维度
    customDimension?: {
      header?: string;
      query?: string;
      path?: string;
    };
    
    // 超限处理
    onExceeded: {
      action: 'reject' | 'queue' | 'throttle';
      message?: string;
      retryAfter?: number; // 秒
    };
  };

  @ApiProperty({ description: '缓存配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '缓存配置',
  })
  cache?: {
    // 是否启用缓存
    enabled: boolean;
    
    // 缓存策略
    strategy: 'memory' | 'redis' | 'database' | 'cdn';
    
    // 缓存时间（秒）
    ttl: number;
    
    // 缓存键模板
    keyTemplate?: string;
    
    // 缓存条件
    conditions?: {
      methods?: string[]; // 缓存的HTTP方法
      statusCodes?: number[]; // 缓存的状态码
      headers?: { [name: string]: string }; // 缓存的请求头条件
    };
    
    // 缓存失效
    invalidation?: {
      // 自动失效
      auto?: {
        onUpdate: boolean; // 数据更新时失效
        onDelete: boolean; // 数据删除时失效
      };
      
      // 手动失效
      manual?: {
        endpoints: string[]; // 失效缓存的端点
        patterns: string[]; // 失效缓存的模式
      };
    };
  };

  @ApiProperty({ description: '监控配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '监控配置',
  })
  monitoring?: {
    // 是否启用监控
    enabled: boolean;
    
    // 监控指标
    metrics: {
      // 响应时间
      responseTime: boolean;
      
      // 请求数量
      requestCount: boolean;
      
      // 错误率
      errorRate: boolean;
      
      // 吞吐量
      throughput: boolean;
      
      // 可用性
      availability: boolean;
    };
    
    // 告警配置
    alerts?: {
      // 响应时间告警
      responseTime?: {
        threshold: number; // 毫秒
        duration: number; // 持续时间（秒）
      };
      
      // 错误率告警
      errorRate?: {
        threshold: number; // 百分比
        duration: number; // 持续时间（秒）
      };
      
      // 可用性告警
      availability?: {
        threshold: number; // 百分比
        duration: number; // 持续时间（秒）
      };
      
      // 告警通知
      notifications: {
        channels: ('email' | 'sms' | 'webhook' | 'slack')[];
        recipients: string[];
      };
    };
    
    // 日志配置
    logging?: {
      level: 'debug' | 'info' | 'warn' | 'error';
      includeRequest: boolean;
      includeResponse: boolean;
      includeHeaders: boolean;
      maskSensitiveData: boolean;
    };
  };

  @ApiProperty({ description: '测试配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '测试配置',
  })
  testing?: {
    // 测试用例
    testCases: {
      id: string;
      name: string;
      description?: string;
      
      // 测试请求
      request: {
        parameters?: { [name: string]: any };
        headers?: { [name: string]: string };
        body?: any;
      };
      
      // 期望响应
      expectedResponse: {
        statusCode: number;
        headers?: { [name: string]: string };
        body?: any;
        
        // 断言
        assertions?: {
          type: 'equals' | 'contains' | 'regex' | 'jsonPath' | 'custom';
          field?: string; // JSON路径或字段名
          value?: any;
          pattern?: string; // 正则表达式
          script?: string; // 自定义脚本
        }[];
      };
      
      // 前置条件
      preconditions?: {
        type: 'api_call' | 'database' | 'custom';
        config: any;
      }[];
      
      // 后置操作
      postconditions?: {
        type: 'cleanup' | 'verify' | 'custom';
        config: any;
      }[];
      
      // 测试数据
      testData?: {
        variables: { [name: string]: any };
        fixtures: string[];
      };
    }[];
    
    // 性能测试
    performance?: {
      enabled: boolean;
      
      // 负载配置
      load: {
        users: number; // 并发用户数
        duration: number; // 测试时长（秒）
        rampUp: number; // 加压时间（秒）
      };
      
      // 性能指标
      metrics: {
        responseTime: {
          average: number;
          p95: number;
          p99: number;
        };
        throughput: number; // 每秒请求数
        errorRate: number; // 错误率
      };
    };
    
    // 自动化测试
    automation?: {
      enabled: boolean;
      schedule: string; // Cron表达式
      onDeploy: boolean; // 部署时自动测试
      onChange: boolean; // 变更时自动测试
    };
  };

  @ApiProperty({ description: '文档配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '文档配置',
  })
  documentation?: {
    // 概述
    summary?: string;
    
    // 详细描述
    description?: string;
    
    // 外部文档
    externalDocs?: {
      description?: string;
      url: string;
    };
    
    // 标签
    tags?: string[];
    
    // 示例
    examples?: {
      name: string;
      description?: string;
      request: {
        url: string;
        method: string;
        headers?: { [name: string]: string };
        body?: any;
      };
      response: {
        statusCode: number;
        headers?: { [name: string]: string };
        body: any;
      };
    }[];
    
    // 代码示例
    codeExamples?: {
      language: 'curl' | 'javascript' | 'python' | 'java' | 'php' | 'go' | 'ruby';
      code: string;
      description?: string;
    }[];
    
    // 变更日志
    changelog?: {
      version: string;
      date: Date;
      changes: string[];
      breaking?: boolean;
    }[];
    
    // 迁移指南
    migration?: {
      fromVersion: string;
      toVersion: string;
      steps: string[];
      breakingChanges: string[];
    }[];
  };

  @ApiProperty({ description: '统计信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: 'API统计信息',
  })
  statistics?: {
    // 使用统计
    usage?: {
      totalRequests: number;
      uniqueUsers: number;
      lastUsedAt?: Date;
      popularEndpoints: {
        path: string;
        count: number;
      }[];
    };
    
    // 性能统计
    performance?: {
      averageResponseTime: number; // 毫秒
      p95ResponseTime: number;
      p99ResponseTime: number;
      throughput: number; // 每秒请求数
      errorRate: number; // 错误率（0-1）
    };
    
    // 错误统计
    errors?: {
      total: number;
      by4xx: number;
      by5xx: number;
      commonErrors: {
        statusCode: number;
        message: string;
        count: number;
      }[];
    };
    
    // 版本统计
    versions?: {
      [version: string]: {
        requests: number;
        users: number;
        lastUsed: Date;
      };
    };
  };

  @ApiProperty({ description: '标签', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: 'API标签',
  })
  tags?: string[];

  @ApiProperty({ description: '元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: 'API元数据',
  })
  metadata?: {
    // 业务信息
    business?: {
      owner: string; // 业务负责人
      department: string; // 所属部门
      purpose: string; // 业务目的
      criticality: 'low' | 'medium' | 'high' | 'critical'; // 重要性
    };
    
    // 技术信息
    technical?: {
      implementation: string; // 实现方式
      dependencies: string[]; // 依赖服务
      database: string[]; // 数据库表
      cacheKeys: string[]; // 缓存键
    };
    
    // 合规信息
    compliance?: {
      dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
      gdprCompliant: boolean;
      retentionPeriod?: number; // 数据保留期（天）
      encryptionRequired: boolean;
    };
    
    // 生命周期
    lifecycle?: {
      plannedDeprecation?: Date;
      supportEndDate?: Date;
      migrationPath?: string;
      replacementApi?: string;
    };
    
    // 自定义字段
    custom?: Record<string, any>;
  };

  // 关联关系
  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'projectId' })
  project?: Project;

  /**
   * 检查API是否激活
   * @returns 是否激活
   */
  isActiveApi(): boolean {
    return this.isActive && this.status === 'published';
  }

  /**
   * 检查API是否已发布
   * @returns 是否已发布
   */
  isPublished(): boolean {
    return this.status === 'published';
  }

  /**
   * 检查API是否已弃用
   * @returns 是否已弃用
   */
  isDeprecated(): boolean {
    return this.status === 'deprecated';
  }

  /**
   * 检查API是否已归档
   * @returns 是否已归档
   */
  isArchived(): boolean {
    return this.status === 'archived';
  }

  /**
   * 检查用户是否可以访问API
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以访问
   */
  canAccess(userId: string, userRoles: string[]): boolean {
    // 公开API可以访问
    if (this.isPublic) return true;
    
    // 创建者可以访问
    if (this.creatorId === userId) return true;
    
    // 检查项目权限（需要在项目实体中实现）
    // 这里简化处理，实际应该检查用户是否是项目成员
    
    return false;
  }

  /**
   * 检查用户是否可以编辑API
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以编辑
   */
  canEdit(userId: string, userRoles: string[]): boolean {
    // 创建者可以编辑
    if (this.creatorId === userId) return true;
    
    // 检查项目权限
    // 实际应该检查用户是否有项目编辑权限
    
    return false;
  }

  /**
   * 检查用户是否可以删除API
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以删除
   */
  canDelete(userId: string, userRoles: string[]): boolean {
    // 已发布的API不能删除，只能弃用
    if (this.isPublished()) return false;
    
    // 创建者可以删除
    if (this.creatorId === userId) return true;
    
    return false;
  }

  /**
   * 发布API
   */
  publish(): void {
    this.status = 'published';
    this.isActive = true;
  }

  /**
   * 弃用API
   */
  deprecate(): void {
    this.status = 'deprecated';
  }

  /**
   * 归档API
   */
  archive(): void {
    this.status = 'archived';
    this.isActive = false;
  }

  /**
   * 激活API
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * 停用API
   */
  deactivate(): void {
    this.isActive = false;
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
   * 更新使用统计
   * @param userId 用户ID
   */
  updateUsageStats(userId?: string): void {
    if (!this.statistics) {
      this.statistics = {};
    }
    
    if (!this.statistics.usage) {
      this.statistics.usage = {
        totalRequests: 0,
        uniqueUsers: 0,
        popularEndpoints: [],
      };
    }
    
    this.statistics.usage.totalRequests += 1;
    this.statistics.usage.lastUsedAt = new Date();
    
    // 更新唯一用户数（简化处理）
    if (userId) {
      // 实际应该维护用户列表或使用更复杂的统计方法
      this.statistics.usage.uniqueUsers += 1;
    }
  }

  /**
   * 更新性能统计
   * @param responseTime 响应时间（毫秒）
   * @param statusCode 状态码
   */
  updatePerformanceStats(responseTime: number, statusCode: number): void {
    if (!this.statistics) {
      this.statistics = {};
    }
    
    if (!this.statistics.performance) {
      this.statistics.performance = {
        averageResponseTime: responseTime,
        p95ResponseTime: responseTime,
        p99ResponseTime: responseTime,
        throughput: 0,
        errorRate: 0,
      };
    }
    
    // 更新平均响应时间（简化计算）
    const perf = this.statistics.performance;
    const totalRequests = this.statistics.usage?.totalRequests || 1;
    
    perf.averageResponseTime = ((perf.averageResponseTime * (totalRequests - 1)) + responseTime) / totalRequests;
    
    // 更新错误统计
    if (!this.statistics.errors) {
      this.statistics.errors = {
        total: 0,
        by4xx: 0,
        by5xx: 0,
        commonErrors: [],
      };
    }
    
    if (statusCode >= 400) {
      this.statistics.errors.total += 1;
      
      if (statusCode >= 400 && statusCode < 500) {
        this.statistics.errors.by4xx += 1;
      } else if (statusCode >= 500) {
        this.statistics.errors.by5xx += 1;
      }
    }
    
    // 重新计算错误率
    perf.errorRate = this.statistics.errors.total / totalRequests;
  }

  /**
   * 获取完整的API路径
   * @returns 完整路径
   */
  getFullPath(): string {
    const basePath = this.baseUrl || '';
    const versionPath = this.version ? `/${this.version}` : '';
    return `${basePath}${versionPath}${this.path}`;
  }

  /**
   * 获取API摘要
   * @returns API摘要
   */
  getSummary(): {
    id: string;
    name: string;
    method: string;
    path: string;
    status: string;
    version: string;
    isPublic: boolean;
    lastUsed?: Date;
  } {
    return {
      id: this.id,
      name: this.name,
      method: this.method,
      path: this.path,
      status: this.status,
      version: this.version,
      isPublic: this.isPublic,
      lastUsed: this.statistics?.usage?.lastUsedAt,
    };
  }

  /**
   * 验证API数据
   * @param data API数据
   * @returns 验证结果
   */
  static validate(data: Partial<Api>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('API名称不能为空');
    }
    
    if (data.name && data.name.length > 100) {
      errors.push('API名称长度不能超过100个字符');
    }
    
    if (!data.method) {
      errors.push('HTTP方法不能为空');
    }
    
    if (!data.path || data.path.trim().length === 0) {
      errors.push('API路径不能为空');
    }
    
    if (data.path && !data.path.startsWith('/')) {
      errors.push('API路径必须以/开头');
    }
    
    if (!data.category || data.category.trim().length === 0) {
      errors.push('API分类不能为空');
    }
    
    if (!data.creatorId || data.creatorId.trim().length === 0) {
      errors.push('创建者ID不能为空');
    }
    
    if (data.version && !/^v\d+(\.\d+)*$/.test(data.version)) {
      errors.push('版本号格式无效，应为v1、v1.0、v1.0.0等格式');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建API实例
   * @param data API数据
   * @returns API实例
   */
  static create(data: {
    name: string;
    description?: string;
    method: Api['method'];
    path: string;
    category: string;
    version?: string;
    creatorId: string;
    projectId?: string;
    baseUrl?: string;
    isPublic?: boolean;
    requiresAuth?: boolean;
    parameters?: Api['parameters'];
    requestBody?: Api['requestBody'];
    responses?: Api['responses'];
    tags?: string[];
  }): Partial<Api> {
    return {
      name: data.name,
      description: data.description,
      method: data.method,
      path: data.path,
      category: data.category,
      version: data.version || 'v1',
      status: 'draft',
      isActive: false,
      isPublic: data.isPublic || false,
      requiresAuth: data.requiresAuth !== false,
      creatorId: data.creatorId,
      projectId: data.projectId,
      baseUrl: data.baseUrl,
      parameters: data.parameters,
      requestBody: data.requestBody,
      responses: data.responses,
      tags: data.tags,
      statistics: {
        usage: {
          totalRequests: 0,
          uniqueUsers: 0,
          popularEndpoints: [],
        },
        performance: {
          averageResponseTime: 0,
          p95ResponseTime: 0,
          p99ResponseTime: 0,
          throughput: 0,
          errorRate: 0,
        },
        errors: {
          total: 0,
          by4xx: 0,
          by5xx: 0,
          commonErrors: [],
        },
      },
    };
  }
}