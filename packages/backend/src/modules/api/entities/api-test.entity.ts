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
import { Api } from './api.entity';

/**
 * API测试实体
 */
@Entity('api_tests')
@Index(['name'])
@Index(['type'])
@Index(['status'])
@Index(['apiId'])
@Index(['creatorId'])
@Index(['environment'])
@Index(['isActive'])
@Index(['createdAt'])
@Index(['apiId', 'status'])
@Index(['creatorId', 'type'])
@Index(['environment', 'status'])
export class ApiTest extends BaseEntity {
  @ApiProperty({ description: '测试名称' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '测试名称',
  })
  name: string;

  @ApiProperty({ description: '测试描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '测试描述',
  })
  description?: string;

  @ApiProperty({ description: '测试类型' })
  @Column({
    type: 'enum',
    enum: ['unit', 'integration', 'functional', 'performance', 'security', 'smoke', 'regression'],
    comment: '测试类型',
  })
  type: 'unit' | 'integration' | 'functional' | 'performance' | 'security' | 'smoke' | 'regression';

  @ApiProperty({ description: '测试状态' })
  @Column({
    type: 'enum',
    enum: ['draft', 'ready', 'running', 'passed', 'failed', 'skipped', 'blocked'],
    default: 'draft',
    comment: '测试状态',
  })
  status: 'draft' | 'ready' | 'running' | 'passed' | 'failed' | 'skipped' | 'blocked';

  @ApiProperty({ description: '是否激活' })
  @Column({
    type: 'boolean',
    default: true,
    comment: '是否激活',
  })
  isActive: boolean;

  @ApiProperty({ description: '测试环境' })
  @Column({
    type: 'varchar',
    length: 50,
    default: 'development',
    comment: '测试环境',
  })
  environment: string;

  @ApiProperty({ description: '优先级' })
  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    comment: '测试优先级',
  })
  priority: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({ description: 'API ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '关联API ID',
  })
  apiId: string;

  @ApiProperty({ description: '创建者ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '创建者用户ID',
  })
  creatorId: string;

  @ApiProperty({ description: '测试配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '测试配置',
  })
  config?: {
    // 超时设置
    timeout?: {
      request: number; // 请求超时（毫秒）
      total: number; // 总超时（毫秒）
    };
    
    // 重试设置
    retry?: {
      enabled: boolean;
      maxAttempts: number;
      delay: number; // 重试间隔（毫秒）
      backoff: 'fixed' | 'exponential' | 'linear';
    };
    
    // 并发设置
    concurrency?: {
      enabled: boolean;
      maxConcurrent: number;
      rampUp: number; // 加压时间（秒）
      duration: number; // 持续时间（秒）
    };
    
    // 数据设置
    data?: {
      // 测试数据源
      source: 'inline' | 'file' | 'database' | 'api';
      
      // 内联数据
      inline?: {
        variables: { [key: string]: any };
        datasets: any[];
      };
      
      // 文件数据
      file?: {
        path: string;
        format: 'json' | 'csv' | 'xml' | 'yaml';
        encoding?: string;
      };
      
      // 数据库数据
      database?: {
        connection: string;
        query: string;
        parameters?: { [key: string]: any };
      };
      
      // API数据
      api?: {
        url: string;
        method: string;
        headers?: { [key: string]: string };
        body?: any;
        transform?: string; // 数据转换脚本
      };
    };
    
    // 环境设置
    environment?: {
      variables: { [key: string]: string };
      baseUrl?: string;
      headers?: { [key: string]: string };
      authentication?: {
        type: 'none' | 'basic' | 'bearer' | 'apikey';
        credentials?: { [key: string]: string };
      };
    };
    
    // 报告设置
    reporting?: {
      format: ('json' | 'xml' | 'html' | 'junit')[];
      outputPath?: string;
      includeDetails: boolean;
      includeTimings: boolean;
      includeScreenshots: boolean;
    };
  };

  @ApiProperty({ description: '测试步骤', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '测试步骤',
  })
  steps?: {
    id: string;
    name: string;
    description?: string;
    type: 'request' | 'assertion' | 'script' | 'delay' | 'loop' | 'condition';
    order: number;
    enabled: boolean;
    
    // 请求步骤
    request?: {
      method: string;
      url: string;
      headers?: { [key: string]: string };
      parameters?: { [key: string]: any };
      body?: any;
      
      // 前置脚本
      preScript?: string;
      
      // 后置脚本
      postScript?: string;
    };
    
    // 断言步骤
    assertion?: {
      type: 'status' | 'header' | 'body' | 'time' | 'custom';
      
      // 状态码断言
      status?: {
        operator: 'equals' | 'in' | 'between';
        value: number | number[];
      };
      
      // 响应头断言
      header?: {
        name: string;
        operator: 'equals' | 'contains' | 'regex' | 'exists';
        value?: string;
        pattern?: string;
      };
      
      // 响应体断言
      body?: {
        type: 'json' | 'text' | 'xml';
        path?: string; // JSON路径或XPath
        operator: 'equals' | 'contains' | 'regex' | 'exists' | 'type' | 'length';
        value?: any;
        pattern?: string;
      };
      
      // 响应时间断言
      time?: {
        operator: 'less' | 'greater' | 'between';
        value: number | [number, number]; // 毫秒
      };
      
      // 自定义断言
      custom?: {
        script: string; // JavaScript代码
        message?: string;
      };
    };
    
    // 脚本步骤
    script?: {
      language: 'javascript' | 'python' | 'shell';
      code: string;
      variables?: { [key: string]: any };
    };
    
    // 延迟步骤
    delay?: {
      duration: number; // 毫秒
      reason?: string;
    };
    
    // 循环步骤
    loop?: {
      type: 'count' | 'condition' | 'data';
      
      // 计数循环
      count?: {
        times: number;
        variable?: string; // 循环变量名
      };
      
      // 条件循环
      condition?: {
        script: string; // 条件脚本
        maxIterations?: number;
      };
      
      // 数据循环
      data?: {
        source: string; // 数据源变量名
        variable: string; // 当前项变量名
        index?: string; // 索引变量名
      };
      
      // 循环体
      steps: string[]; // 步骤ID列表
    };
    
    // 条件步骤
    condition?: {
      script: string; // 条件脚本
      
      // 真分支
      ifTrue?: {
        steps: string[]; // 步骤ID列表
      };
      
      // 假分支
      ifFalse?: {
        steps: string[]; // 步骤ID列表
      };
    };
    
    // 步骤配置
    config?: {
      timeout?: number;
      retry?: {
        enabled: boolean;
        maxAttempts: number;
        delay: number;
      };
      continueOnError?: boolean;
      skipOnCondition?: string; // 跳过条件脚本
    };
  }[];

  @ApiProperty({ description: '测试数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '测试数据',
  })
  testData?: {
    // 全局变量
    variables?: { [key: string]: any };
    
    // 数据集
    datasets?: {
      name: string;
      description?: string;
      data: any[];
      schema?: {
        [field: string]: {
          type: 'string' | 'number' | 'boolean' | 'object' | 'array';
          required?: boolean;
          description?: string;
        };
      };
    }[];
    
    // 固定数据
    fixtures?: {
      name: string;
      description?: string;
      data: any;
    }[];
    
    // 动态数据
    generators?: {
      name: string;
      type: 'faker' | 'random' | 'sequence' | 'custom';
      config: any;
    }[];
    
    // 数据关系
    relationships?: {
      parent: string;
      child: string;
      type: 'one-to-one' | 'one-to-many' | 'many-to-many';
      foreignKey: string;
    }[];
  };

  @ApiProperty({ description: '期望结果', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '期望结果',
  })
  expectedResults?: {
    // 响应断言
    response?: {
      statusCode?: number | number[];
      headers?: { [key: string]: string | RegExp };
      body?: any;
      time?: {
        max?: number; // 最大响应时间（毫秒）
        min?: number; // 最小响应时间（毫秒）
      };
    };
    
    // 性能断言
    performance?: {
      responseTime?: {
        average?: number;
        p95?: number;
        p99?: number;
      };
      throughput?: {
        min?: number; // 最小吞吐量（请求/秒）
      };
      errorRate?: {
        max?: number; // 最大错误率（0-1）
      };
      concurrency?: {
        max?: number; // 最大并发数
      };
    };
    
    // 安全断言
    security?: {
      vulnerabilities?: {
        none: boolean; // 无漏洞
        maxSeverity?: 'low' | 'medium' | 'high' | 'critical';
      };
      authentication?: {
        required: boolean;
        methods: string[];
      };
      authorization?: {
        enforced: boolean;
        roles: string[];
      };
      dataProtection?: {
        encrypted: boolean;
        masked: boolean;
      };
    };
    
    // 功能断言
    functional?: {
      features: {
        name: string;
        working: boolean;
        criteria: string[];
      }[];
      
      workflows: {
        name: string;
        steps: {
          name: string;
          success: boolean;
          output?: any;
        }[];
      }[];
    };
    
    // 数据断言
    data?: {
      integrity: boolean;
      consistency: boolean;
      
      validation: {
        schema: boolean;
        constraints: boolean;
        relationships: boolean;
      };
      
      persistence: {
        created: boolean;
        updated: boolean;
        deleted: boolean;
      };
    };
    
    // 集成断言
    integration?: {
      services: {
        name: string;
        available: boolean;
        responseTime?: number;
      }[];
      
      dependencies: {
        name: string;
        version?: string;
        compatible: boolean;
      }[];
      
      communication: {
        protocol: string;
        successful: boolean;
        dataFormat: string;
      }[];
    };
  };

  @ApiProperty({ description: '执行历史', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '执行历史',
  })
  executionHistory?: {
    id: string;
    startTime: Date;
    endTime?: Date;
    duration?: number; // 毫秒
    status: 'running' | 'passed' | 'failed' | 'skipped' | 'timeout' | 'error';
    environment: string;
    
    // 执行结果
    results?: {
      // 步骤结果
      steps: {
        id: string;
        name: string;
        status: 'passed' | 'failed' | 'skipped' | 'error';
        startTime: Date;
        endTime?: Date;
        duration?: number;
        
        // 请求信息
        request?: {
          method: string;
          url: string;
          headers: { [key: string]: string };
          body?: any;
        };
        
        // 响应信息
        response?: {
          statusCode: number;
          headers: { [key: string]: string };
          body: any;
          time: number;
          size: number;
        };
        
        // 断言结果
        assertions?: {
          type: string;
          description: string;
          passed: boolean;
          actual?: any;
          expected?: any;
          message?: string;
        }[];
        
        // 错误信息
        error?: {
          type: string;
          message: string;
          stack?: string;
        };
        
        // 日志
        logs?: {
          level: 'debug' | 'info' | 'warn' | 'error';
          message: string;
          timestamp: Date;
        }[];
      }[];
      
      // 总体统计
      summary: {
        total: number;
        passed: number;
        failed: number;
        skipped: number;
        errors: number;
        
        duration: number;
        startTime: Date;
        endTime: Date;
        
        performance?: {
          averageResponseTime: number;
          minResponseTime: number;
          maxResponseTime: number;
          totalRequests: number;
          successfulRequests: number;
          failedRequests: number;
        };
      };
      
      // 覆盖率
      coverage?: {
        statements: number; // 语句覆盖率
        branches: number; // 分支覆盖率
        functions: number; // 函数覆盖率
        lines: number; // 行覆盖率
        
        details?: {
          file: string;
          statements: { covered: number; total: number };
          branches: { covered: number; total: number };
          functions: { covered: number; total: number };
          lines: { covered: number; total: number };
        }[];
      };
    };
    
    // 执行环境
    executionEnvironment?: {
      os: string;
      runtime: string;
      version: string;
      memory: number;
      cpu: string;
    };
    
    // 触发信息
    trigger?: {
      type: 'manual' | 'scheduled' | 'webhook' | 'ci_cd';
      user?: string;
      source?: string;
      reason?: string;
    };
  }[];

  @ApiProperty({ description: '调度配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '调度配置',
  })
  schedule?: {
    // 是否启用调度
    enabled: boolean;
    
    // 调度类型
    type: 'cron' | 'interval' | 'event';
    
    // Cron表达式
    cron?: {
      expression: string; // 如: '0 0 * * *'
      timezone?: string;
    };
    
    // 间隔调度
    interval?: {
      value: number;
      unit: 'seconds' | 'minutes' | 'hours' | 'days';
    };
    
    // 事件调度
    event?: {
      type: 'api_change' | 'deployment' | 'webhook' | 'manual';
      conditions?: {
        [key: string]: any;
      };
    };
    
    // 调度选项
    options?: {
      maxConcurrent?: number; // 最大并发执行数
      timeout?: number; // 超时时间（秒）
      retryOnFailure?: boolean;
      notifyOnFailure?: boolean;
      notifyOnSuccess?: boolean;
    };
    
    // 下次执行时间
    nextRun?: Date;
    
    // 最后执行时间
    lastRun?: Date;
  };

  @ApiProperty({ description: '标签', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '测试标签',
  })
  tags?: string[];

  @ApiProperty({ description: '元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '测试元数据',
  })
  metadata?: {
    // 测试信息
    testInfo?: {
      author: string;
      reviewer?: string;
      version: string;
      lastModified: Date;
      complexity: 'low' | 'medium' | 'high';
      estimatedDuration: number; // 预估执行时间（秒）
    };
    
    // 需求关联
    requirements?: {
      id: string;
      name: string;
      type: 'functional' | 'non-functional' | 'business';
      priority: 'low' | 'medium' | 'high' | 'critical';
    }[];
    
    // 缺陷关联
    bugs?: {
      id: string;
      title: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      status: 'open' | 'in_progress' | 'resolved' | 'closed';
    }[];
    
    // 依赖关系
    dependencies?: {
      type: 'test' | 'service' | 'data' | 'environment';
      name: string;
      version?: string;
      required: boolean;
    }[];
    
    // 风险评估
    risks?: {
      type: 'technical' | 'business' | 'security' | 'performance';
      description: string;
      probability: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      mitigation?: string;
    }[];
    
    // 自定义字段
    custom?: Record<string, any>;
  };

  // 关联关系
  @ManyToOne(() => Api)
  @JoinColumn({ name: 'apiId' })
  api: Api;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  /**
   * 检查测试是否可以执行
   * @returns 是否可以执行
   */
  canExecute(): boolean {
    return this.isActive && 
           this.status !== 'running' && 
           this.status !== 'blocked' &&
           this.steps && 
           this.steps.length > 0;
  }

  /**
   * 检查测试是否正在运行
   * @returns 是否正在运行
   */
  isRunning(): boolean {
    return this.status === 'running';
  }

  /**
   * 检查测试是否通过
   * @returns 是否通过
   */
  isPassed(): boolean {
    return this.status === 'passed';
  }

  /**
   * 检查测试是否失败
   * @returns 是否失败
   */
  isFailed(): boolean {
    return this.status === 'failed';
  }

  /**
   * 检查用户是否可以执行测试
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以执行
   */
  canExecuteBy(userId: string, userRoles: string[]): boolean {
    // 创建者可以执行
    if (this.creatorId === userId) return true;
    
    // 检查项目权限（需要通过API关联）
    // 实际应该检查用户是否有项目测试权限
    
    return false;
  }

  /**
   * 检查用户是否可以编辑测试
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以编辑
   */
  canEdit(userId: string, userRoles: string[]): boolean {
    // 正在运行的测试不能编辑
    if (this.isRunning()) return false;
    
    // 创建者可以编辑
    if (this.creatorId === userId) return true;
    
    return false;
  }

  /**
   * 检查用户是否可以删除测试
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以删除
   */
  canDelete(userId: string, userRoles: string[]): boolean {
    // 正在运行的测试不能删除
    if (this.isRunning()) return false;
    
    // 创建者可以删除
    if (this.creatorId === userId) return true;
    
    return false;
  }

  /**
   * 开始执行测试
   */
  startExecution(): void {
    this.status = 'running';
    
    // 添加执行历史记录
    if (!this.executionHistory) {
      this.executionHistory = [];
    }
    
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.executionHistory.push({
      id: executionId,
      startTime: new Date(),
      status: 'running',
      environment: this.environment,
      trigger: {
        type: 'manual',
        reason: 'Manual execution',
      },
    });
  }

  /**
   * 完成测试执行
   * @param status 执行状态
   * @param results 执行结果
   */
  completeExecution(
    status: 'passed' | 'failed' | 'skipped' | 'timeout' | 'error',
    results?: any
  ): void {
    this.status = status;
    
    if (this.executionHistory && this.executionHistory.length > 0) {
      const lastExecution = this.executionHistory[this.executionHistory.length - 1];
      lastExecution.endTime = new Date();
      lastExecution.status = status;
      lastExecution.duration = lastExecution.endTime.getTime() - lastExecution.startTime.getTime();
      
      if (results) {
        lastExecution.results = results;
      }
    }
  }

  /**
   * 停止测试执行
   */
  stopExecution(): void {
    if (this.isRunning()) {
      this.completeExecution('skipped');
    }
  }

  /**
   * 重置测试状态
   */
  reset(): void {
    this.status = 'ready';
  }

  /**
   * 激活测试
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * 停用测试
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
   * 获取最后执行结果
   * @returns 最后执行结果
   */
  getLastExecutionResult(): any {
    if (!this.executionHistory || this.executionHistory.length === 0) {
      return null;
    }
    
    return this.executionHistory[this.executionHistory.length - 1];
  }

  /**
   * 获取执行统计
   * @returns 执行统计
   */
  getExecutionStats(): {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    successRate: number;
    averageDuration: number;
  } {
    if (!this.executionHistory || this.executionHistory.length === 0) {
      return {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        successRate: 0,
        averageDuration: 0,
      };
    }
    
    const total = this.executionHistory.length;
    const passed = this.executionHistory.filter(h => h.status === 'passed').length;
    const failed = this.executionHistory.filter(h => h.status === 'failed').length;
    const skipped = this.executionHistory.filter(h => h.status === 'skipped').length;
    
    const completedExecutions = this.executionHistory.filter(h => h.duration);
    const averageDuration = completedExecutions.length > 0
      ? completedExecutions.reduce((sum, h) => sum + (h.duration || 0), 0) / completedExecutions.length
      : 0;
    
    return {
      total,
      passed,
      failed,
      skipped,
      successRate: total > 0 ? passed / total : 0,
      averageDuration,
    };
  }

  /**
   * 验证测试数据
   * @param data 测试数据
   * @returns 验证结果
   */
  static validate(data: Partial<ApiTest>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('测试名称不能为空');
    }
    
    if (data.name && data.name.length > 100) {
      errors.push('测试名称长度不能超过100个字符');
    }
    
    if (!data.type) {
      errors.push('测试类型不能为空');
    }
    
    if (!data.apiId || data.apiId.trim().length === 0) {
      errors.push('API ID不能为空');
    }
    
    if (!data.creatorId || data.creatorId.trim().length === 0) {
      errors.push('创建者ID不能为空');
    }
    
    if (!data.environment || data.environment.trim().length === 0) {
      errors.push('测试环境不能为空');
    }
    
    if (data.steps && data.steps.length === 0) {
      errors.push('测试步骤不能为空');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建测试实例
   * @param data 测试数据
   * @returns 测试实例
   */
  static create(data: {
    name: string;
    description?: string;
    type: ApiTest['type'];
    apiId: string;
    creatorId: string;
    environment?: string;
    priority?: ApiTest['priority'];
    config?: ApiTest['config'];
    steps?: ApiTest['steps'];
    testData?: ApiTest['testData'];
    expectedResults?: ApiTest['expectedResults'];
    tags?: string[];
  }): Partial<ApiTest> {
    return {
      name: data.name,
      description: data.description,
      type: data.type,
      status: 'draft',
      isActive: true,
      environment: data.environment || 'development',
      priority: data.priority || 'medium',
      apiId: data.apiId,
      creatorId: data.creatorId,
      config: data.config,
      steps: data.steps,
      testData: data.testData,
      expectedResults: data.expectedResults,
      tags: data.tags,
      executionHistory: [],
    };
  }
}