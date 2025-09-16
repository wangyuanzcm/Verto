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
import { TestCase } from './test-case.entity';

/**
 * 测试套件实体
 */
@Entity('test_suites')
@Index(['name'])
@Index(['type'])
@Index(['status'])
@Index(['creatorId'])
@Index(['projectId'])
@Index(['isActive'])
@Index(['category'])
@Index(['createdAt'])
@Index(['projectId', 'status'])
@Index(['creatorId', 'type'])
export class TestSuite extends BaseEntity {
  @ApiProperty({ description: '测试套件名称' })
  @Column({
    type: 'varchar',
    length: 200,
    comment: '测试套件名称',
  })
  name: string;

  @ApiProperty({ description: '测试套件描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '测试套件描述',
  })
  description?: string;

  @ApiProperty({ description: '套件类型' })
  @Column({
    type: 'enum',
    enum: ['functional', 'regression', 'smoke', 'sanity', 'integration', 'system', 'acceptance', 'performance', 'security', 'compatibility', 'usability', 'custom'],
    comment: '测试套件类型',
  })
  type: 'functional' | 'regression' | 'smoke' | 'sanity' | 'integration' | 'system' | 'acceptance' | 'performance' | 'security' | 'compatibility' | 'usability' | 'custom';

  @ApiProperty({ description: '套件状态' })
  @Column({
    type: 'enum',
    enum: ['draft', 'ready', 'running', 'completed', 'paused', 'cancelled', 'archived'],
    default: 'draft',
    comment: '测试套件状态',
  })
  status: 'draft' | 'ready' | 'running' | 'completed' | 'paused' | 'cancelled' | 'archived';

  @ApiProperty({ description: '套件分类' })
  @Column({
    type: 'varchar',
    length: 50,
    comment: '测试套件分类',
  })
  category: string;

  @ApiProperty({ description: '是否激活' })
  @Column({
    type: 'boolean',
    default: true,
    comment: '是否激活',
  })
  isActive: boolean;

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

  @ApiProperty({ description: '版本号' })
  @Column({
    type: 'varchar',
    length: 20,
    default: '1.0',
    comment: '测试套件版本号',
  })
  version: string;

  @ApiProperty({ description: '预估执行时间', required: false })
  @Column({
    type: 'integer',
    nullable: true,
    comment: '预估执行时间（分钟）',
  })
  estimatedDuration?: number;

  @ApiProperty({ description: '实际执行时间', required: false })
  @Column({
    type: 'integer',
    nullable: true,
    comment: '实际执行时间（分钟）',
  })
  actualDuration?: number;

  @ApiProperty({ description: '执行优先级' })
  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    comment: '执行优先级',
  })
  priority: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({ description: '自动化级别' })
  @Column({
    type: 'enum',
    enum: ['manual', 'semi_automated', 'automated'],
    default: 'manual',
    comment: '自动化级别',
  })
  automationLevel: 'manual' | 'semi_automated' | 'automated';

  @ApiProperty({ description: '套件配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '测试套件配置',
  })
  configuration?: {
    // 执行配置
    execution?: {
      // 执行模式
      mode: 'sequential' | 'parallel' | 'mixed';
      
      // 并行度（仅在parallel或mixed模式下有效）
      parallelism?: number;
      
      // 超时设置
      timeout?: {
        suite: number; // 套件总超时时间（分钟）
        testCase: number; // 单个测试用例超时时间（分钟）
      };
      
      // 重试配置
      retry?: {
        enabled: boolean;
        maxAttempts: number;
        retryOn: ('failed' | 'blocked' | 'error')[];
        delay?: number; // 重试间隔（秒）
      };
      
      // 失败处理
      failureHandling?: {
        stopOnFirstFailure: boolean;
        continueOnBlocked: boolean;
        maxFailures?: number; // 最大失败数，超过则停止
      };
      
      // 依赖处理
      dependencies?: {
        enforceOrder: boolean; // 是否强制按依赖顺序执行
        skipDependentsOnFailure: boolean; // 依赖失败时是否跳过后续
      };
    };
    
    // 环境配置
    environment?: {
      // 目标环境
      targets?: {
        name: string;
        type: 'development' | 'testing' | 'staging' | 'production';
        url?: string;
        configuration?: Record<string, any>;
      }[];
      
      // 浏览器配置（用于UI测试）
      browsers?: {
        name: 'chrome' | 'firefox' | 'safari' | 'edge' | 'ie';
        version?: string;
        headless?: boolean;
        viewport?: { width: number; height: number };
        options?: Record<string, any>;
      }[];
      
      // 设备配置（用于移动端测试）
      devices?: {
        name: string;
        type: 'mobile' | 'tablet' | 'desktop';
        os: string;
        version?: string;
        resolution?: string;
      }[];
      
      // 数据库配置
      databases?: {
        name: string;
        type: string;
        connection: string;
        schema?: string;
        testData?: string;
      }[];
      
      // 服务配置
      services?: {
        name: string;
        endpoint: string;
        authentication?: {
          type: 'none' | 'basic' | 'bearer' | 'oauth' | 'api_key';
          credentials?: Record<string, string>;
        };
        healthCheck?: string;
      }[];
    };
    
    // 报告配置
    reporting?: {
      // 报告格式
      formats: ('html' | 'json' | 'xml' | 'junit' | 'allure' | 'custom')[];
      
      // 输出路径
      outputPath?: string;
      
      // 包含内容
      include?: {
        screenshots: boolean;
        videos: boolean;
        logs: boolean;
        metrics: boolean;
        coverage: boolean;
        traces: boolean;
      };
      
      // 通知配置
      notifications?: {
        email?: {
          enabled: boolean;
          recipients: string[];
          onSuccess: boolean;
          onFailure: boolean;
          template?: string;
        };
        
        slack?: {
          enabled: boolean;
          webhook: string;
          channel?: string;
          onSuccess: boolean;
          onFailure: boolean;
        };
        
        webhook?: {
          enabled: boolean;
          url: string;
          method: 'POST' | 'PUT';
          headers?: Record<string, string>;
          payload?: Record<string, any>;
        };
      };
    };
    
    // 数据管理
    dataManagement?: {
      // 测试数据策略
      strategy: 'static' | 'dynamic' | 'generated' | 'imported';
      
      // 数据源
      sources?: {
        name: string;
        type: 'file' | 'database' | 'api' | 'generator';
        location: string;
        format?: 'json' | 'csv' | 'xml' | 'sql';
        mapping?: Record<string, string>;
      }[];
      
      // 数据清理
      cleanup?: {
        enabled: boolean;
        strategy: 'after_each' | 'after_suite' | 'manual';
        preserveOnFailure: boolean;
      };
      
      // 数据隔离
      isolation?: {
        enabled: boolean;
        level: 'test_case' | 'test_suite' | 'execution';
        method: 'transaction' | 'snapshot' | 'recreation';
      };
    };
    
    // 集成配置
    integrations?: {
      // CI/CD集成
      cicd?: {
        provider: 'jenkins' | 'gitlab' | 'github' | 'azure' | 'bamboo' | 'teamcity';
        configuration?: Record<string, any>;
      };
      
      // 缺陷管理集成
      defectTracking?: {
        provider: 'jira' | 'azure_devops' | 'github' | 'gitlab' | 'bugzilla';
        configuration?: Record<string, any>;
        autoCreateDefects?: boolean;
      };
      
      // 测试管理集成
      testManagement?: {
        provider: 'testlink' | 'testrail' | 'qtest' | 'zephyr';
        configuration?: Record<string, any>;
        syncResults?: boolean;
      };
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
    executedBy: string; // 执行人ID
    startedAt: Date;
    completedAt?: Date;
    duration?: number; // 执行时间（分钟）
    
    // 执行结果
    result: 'passed' | 'failed' | 'partial' | 'cancelled' | 'error';
    
    // 执行统计
    statistics: {
      total: number; // 总测试用例数
      passed: number; // 通过数
      failed: number; // 失败数
      blocked: number; // 阻塞数
      skipped: number; // 跳过数
      error: number; // 错误数
      passRate: number; // 通过率
    };
    
    // 执行环境
    environment?: {
      target?: string;
      browser?: string;
      device?: string;
      os?: string;
      configuration?: Record<string, any>;
    };
    
    // 测试用例结果
    testCaseResults?: {
      testCaseId: string;
      status: 'passed' | 'failed' | 'blocked' | 'skipped' | 'error';
      duration: number;
      startedAt: Date;
      completedAt?: Date;
      error?: string;
      defects?: string[]; // 关联的缺陷ID
    }[];
    
    // 性能指标
    performance?: {
      avgResponseTime?: number;
      maxResponseTime?: number;
      minResponseTime?: number;
      throughput?: number;
      errorRate?: number;
      customMetrics?: Record<string, number>;
    };
    
    // 覆盖率信息
    coverage?: {
      overall: number;
      byType: Record<string, number>;
      byModule: Record<string, number>;
      details?: {
        lines: number;
        functions: number;
        branches: number;
        statements: number;
      };
    };
    
    // 附件
    attachments?: {
      id: string;
      name: string;
      type: 'report' | 'log' | 'screenshot' | 'video' | 'other';
      url?: string;
      fileId?: string;
      size?: number;
    }[];
    
    // 备注
    notes?: string;
    
    // 中断信息（如果执行被中断）
    interruption?: {
      reason: 'user_cancelled' | 'timeout' | 'system_error' | 'resource_limit';
      timestamp: Date;
      details?: string;
    };
  }[];

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
    // 套件统计
    statistics?: {
      totalTestCases: number;
      automatedTestCases: number;
      manualTestCases: number;
      
      // 按类型分组
      byType: Record<string, number>;
      
      // 按优先级分组
      byPriority: Record<string, number>;
      
      // 按状态分组
      byStatus: Record<string, number>;
      
      // 历史统计
      historical?: {
        totalExecutions: number;
        avgPassRate: number;
        avgDuration: number;
        lastExecuted?: Date;
        trend: 'improving' | 'stable' | 'declining';
      };
    };
    
    // 质量指标
    quality?: {
      stability: number; // 稳定性 (1-5)
      reliability: number; // 可靠性 (1-5)
      maintainability: number; // 可维护性 (1-5)
      coverage: number; // 覆盖率 (1-5)
      efficiency: number; // 效率 (1-5)
      
      // 质量趋势
      trend?: {
        direction: 'improving' | 'stable' | 'declining';
        factors: string[];
        recommendations?: string[];
      };
    };
    
    // 业务价值
    businessValue?: {
      criticality: 'low' | 'medium' | 'high' | 'critical';
      userImpact: 'low' | 'medium' | 'high';
      businessRisk: 'low' | 'medium' | 'high';
      complianceRequirement: boolean;
      customerFacing: boolean;
      
      // ROI指标
      roi?: {
        defectsPrevented: number;
        costSavings: number;
        timeToMarket: number;
      };
    };
    
    // 维护信息
    maintenance?: {
      lastReviewed?: Date;
      reviewedBy?: string;
      nextReviewDue?: Date;
      maintenanceNotes?: string[];
      
      // 变更频率
      changeFrequency: 'stable' | 'occasional' | 'frequent' | 'volatile';
      
      // 维护成本
      maintenanceCost: 'low' | 'medium' | 'high';
      
      // 技术债务
      technicalDebt?: {
        level: 'low' | 'medium' | 'high';
        issues: string[];
        plan?: string;
      };
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

  @OneToMany(() => TestCase, testCase => testCase.testSuiteId)
  testCases: TestCase[];

  /**
   * 检查测试套件是否激活
   * @returns 是否激活
   */
  isActiveSuite(): boolean {
    return this.isActive && this.status !== 'archived';
  }

  /**
   * 检查测试套件是否可以执行
   * @returns 是否可以执行
   */
  canExecute(): boolean {
    return ['ready', 'paused'].includes(this.status) && this.isActive;
  }

  /**
   * 检查测试套件是否正在运行
   * @returns 是否正在运行
   */
  isRunning(): boolean {
    return this.status === 'running';
  }

  /**
   * 检查测试套件是否已完成
   * @returns 是否已完成
   */
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * 检查测试套件是否被暂停
   * @returns 是否被暂停
   */
  isPaused(): boolean {
    return this.status === 'paused';
  }

  /**
   * 检查测试套件是否被取消
   * @returns 是否被取消
   */
  isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  /**
   * 检查用户是否可以查看测试套件
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以查看
   */
  canView(userId: string, userRoles: string[]): boolean {
    // 创建者可以查看
    if (this.creatorId === userId) return true;
    
    // 检查项目权限（需要在项目实体中实现）
    // 这里简化处理，实际应该检查用户是否是项目成员
    
    return false;
  }

  /**
   * 检查用户是否可以编辑测试套件
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以编辑
   */
  canEdit(userId: string, userRoles: string[]): boolean {
    // 归档的测试套件不能编辑
    if (this.status === 'archived') return false;
    
    // 正在运行的测试套件不能编辑
    if (this.status === 'running') return false;
    
    // 创建者可以编辑
    if (this.creatorId === userId) return true;
    
    return false;
  }

  /**
   * 检查用户是否可以执行测试套件
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以执行
   */
  canExecuteBy(userId: string, userRoles: string[]): boolean {
    // 检查套件是否可以执行
    if (!this.canExecute()) return false;
    
    // 创建者可以执行
    if (this.creatorId === userId) return true;
    
    // 测试人员可以执行
    if (userRoles.includes('tester')) return true;
    
    return false;
  }

  /**
   * 开始执行测试套件
   * @param executorId 执行人ID
   * @param environment 执行环境
   */
  startExecution(executorId: string, environment?: any): string {
    if (!this.canExecute()) {
      throw new Error('测试套件当前状态不允许执行');
    }
    
    this.status = 'running';
    
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!this.executionHistory) {
      this.executionHistory = [];
    }
    
    const execution = {
      id: executionId,
      executedBy: executorId,
      startedAt: new Date(),
      result: 'running' as any,
      statistics: {
        total: 0,
        passed: 0,
        failed: 0,
        blocked: 0,
        skipped: 0,
        error: 0,
        passRate: 0,
      },
      environment,
      testCaseResults: [],
    };
    
    this.executionHistory.push(execution);
    
    return executionId;
  }

  /**
   * 暂停执行
   * @param reason 暂停原因
   */
  pauseExecution(reason?: string): void {
    if (this.status === 'running') {
      this.status = 'paused';
      
      // 更新当前执行记录
      if (this.executionHistory && this.executionHistory.length > 0) {
        const currentExecution = this.executionHistory[this.executionHistory.length - 1];
        currentExecution.interruption = {
          reason: 'user_cancelled',
          timestamp: new Date(),
          details: reason,
        };
      }
    }
  }

  /**
   * 恢复执行
   */
  resumeExecution(): void {
    if (this.status === 'paused') {
      this.status = 'running';
    }
  }

  /**
   * 取消执行
   * @param reason 取消原因
   */
  cancelExecution(reason?: string): void {
    if (['running', 'paused'].includes(this.status)) {
      this.status = 'cancelled';
      
      // 更新当前执行记录
      if (this.executionHistory && this.executionHistory.length > 0) {
        const currentExecution = this.executionHistory[this.executionHistory.length - 1];
        currentExecution.result = 'cancelled';
        currentExecution.completedAt = new Date();
        currentExecution.duration = Math.round(
          (new Date().getTime() - currentExecution.startedAt.getTime()) / (1000 * 60)
        );
        currentExecution.interruption = {
          reason: 'user_cancelled',
          timestamp: new Date(),
          details: reason,
        };
      }
    }
  }

  /**
   * 完成执行
   * @param statistics 执行统计
   * @param result 执行结果
   */
  completeExecution(
    statistics: {
      total: number;
      passed: number;
      failed: number;
      blocked: number;
      skipped: number;
      error: number;
    },
    result?: 'passed' | 'failed' | 'partial'
  ): void {
    if (this.status === 'running') {
      this.status = 'completed';
      
      // 计算通过率
      const passRate = statistics.total > 0 ? 
        Math.round((statistics.passed / statistics.total) * 100) : 0;
      
      // 确定结果
      let finalResult: 'passed' | 'failed' | 'partial';
      if (result) {
        finalResult = result;
      } else if (statistics.failed === 0 && statistics.error === 0) {
        finalResult = 'passed';
      } else if (statistics.passed === 0) {
        finalResult = 'failed';
      } else {
        finalResult = 'partial';
      }
      
      // 更新当前执行记录
      if (this.executionHistory && this.executionHistory.length > 0) {
        const currentExecution = this.executionHistory[this.executionHistory.length - 1];
        currentExecution.result = finalResult;
        currentExecution.completedAt = new Date();
        currentExecution.duration = Math.round(
          (new Date().getTime() - currentExecution.startedAt.getTime()) / (1000 * 60)
        );
        currentExecution.statistics = {
          ...statistics,
          passRate,
        };
      }
      
      // 更新实际执行时间
      if (this.executionHistory && this.executionHistory.length > 0) {
        this.actualDuration = this.executionHistory[this.executionHistory.length - 1].duration;
      }
    }
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.status = 'ready';
    this.actualDuration = undefined;
  }

  /**
   * 归档测试套件
   * @param reason 归档原因
   */
  archive(reason?: string): void {
    this.status = 'archived';
    this.isActive = false;
    
    if (!this.metadata) {
      this.metadata = {};
    }
    
    this.metadata.archiveReason = reason;
    this.metadata.archiveDate = new Date();
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
  getLastExecutionResult(): {
    result: string;
    startedAt: Date;
    completedAt?: Date;
    executedBy: string;
    duration?: number;
    statistics: any;
  } | null {
    if (!this.executionHistory || this.executionHistory.length === 0) {
      return null;
    }
    
    const lastExecution = this.executionHistory[this.executionHistory.length - 1];
    return {
      result: lastExecution.result,
      startedAt: lastExecution.startedAt,
      completedAt: lastExecution.completedAt,
      executedBy: lastExecution.executedBy,
      duration: lastExecution.duration,
      statistics: lastExecution.statistics,
    };
  }

  /**
   * 获取平均通过率
   * @returns 平均通过率（百分比）
   */
  getAveragePassRate(): number {
    if (!this.executionHistory || this.executionHistory.length === 0) {
      return 0;
    }
    
    const completedExecutions = this.executionHistory.filter(
      exec => exec.result !== 'running' && exec.statistics
    );
    
    if (completedExecutions.length === 0) {
      return 0;
    }
    
    const totalPassRate = completedExecutions.reduce(
      (sum, exec) => sum + exec.statistics.passRate,
      0
    );
    
    return Math.round(totalPassRate / completedExecutions.length);
  }

  /**
   * 获取平均执行时间
   * @returns 平均执行时间（分钟）
   */
  getAverageExecutionTime(): number {
    if (!this.executionHistory || this.executionHistory.length === 0) {
      return 0;
    }
    
    const completedExecutions = this.executionHistory.filter(
      exec => exec.duration !== undefined
    );
    
    if (completedExecutions.length === 0) {
      return 0;
    }
    
    const totalDuration = completedExecutions.reduce(
      (sum, exec) => sum + (exec.duration || 0),
      0
    );
    
    return Math.round(totalDuration / completedExecutions.length);
  }

  /**
   * 获取测试套件摘要
   * @returns 测试套件摘要
   */
  getSummary(): {
    id: string;
    name: string;
    type: string;
    status: string;
    priority: string;
    automationLevel: string;
    testCaseCount: number;
    avgPassRate: number;
    lastExecuted?: Date;
  } {
    const lastExecution = this.getLastExecutionResult();
    
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      priority: this.priority,
      automationLevel: this.automationLevel,
      testCaseCount: this.metadata?.statistics?.totalTestCases || 0,
      avgPassRate: this.getAveragePassRate(),
      lastExecuted: lastExecution?.startedAt,
    };
  }

  /**
   * 更新统计信息
   * @param testCases 测试用例列表
   */
  updateStatistics(testCases: TestCase[]): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    
    if (!this.metadata.statistics) {
      this.metadata.statistics = {
        totalTestCases: 0,
        automatedTestCases: 0,
        manualTestCases: 0,
        byType: {},
        byPriority: {},
        byStatus: {},
      };
    }
    
    const stats = this.metadata.statistics;
    
    // 重置统计
    stats.totalTestCases = testCases.length;
    stats.automatedTestCases = testCases.filter(tc => tc.automationLevel === 'automated').length;
    stats.manualTestCases = testCases.filter(tc => tc.automationLevel === 'manual').length;
    
    // 按类型统计
    stats.byType = {};
    testCases.forEach(tc => {
      stats.byType[tc.type] = (stats.byType[tc.type] || 0) + 1;
    });
    
    // 按优先级统计
    stats.byPriority = {};
    testCases.forEach(tc => {
      stats.byPriority[tc.priority] = (stats.byPriority[tc.priority] || 0) + 1;
    });
    
    // 按状态统计
    stats.byStatus = {};
    testCases.forEach(tc => {
      stats.byStatus[tc.status] = (stats.byStatus[tc.status] || 0) + 1;
    });
    
    // 更新预估执行时间
    const totalEstimated = testCases.reduce(
      (sum, tc) => sum + (tc.estimatedDuration || 0),
      0
    );
    this.estimatedDuration = totalEstimated;
  }

  /**
   * 验证测试套件数据
   * @param data 测试套件数据
   * @returns 验证结果
   */
  static validate(data: Partial<TestSuite>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('测试套件名称不能为空');
    }
    
    if (data.name && data.name.length > 200) {
      errors.push('测试套件名称长度不能超过200个字符');
    }
    
    if (!data.type) {
      errors.push('套件类型不能为空');
    }
    
    if (!data.category || data.category.trim().length === 0) {
      errors.push('套件分类不能为空');
    }
    
    if (!data.creatorId || data.creatorId.trim().length === 0) {
      errors.push('创建者ID不能为空');
    }
    
    if (data.estimatedDuration && data.estimatedDuration < 0) {
      errors.push('预估执行时间不能为负数');
    }
    
    if (data.actualDuration && data.actualDuration < 0) {
      errors.push('实际执行时间不能为负数');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建测试套件实例
   * @param data 测试套件数据
   * @returns 测试套件实例
   */
  static create(data: {
    name: string;
    description?: string;
    type: TestSuite['type'];
    category: string;
    priority?: TestSuite['priority'];
    creatorId: string;
    projectId?: string;
    automationLevel?: TestSuite['automationLevel'];
    estimatedDuration?: number;
    configuration?: TestSuite['configuration'];
    tags?: string[];
  }): Partial<TestSuite> {
    const testSuite: Partial<TestSuite> = {
      name: data.name,
      description: data.description,
      type: data.type,
      status: 'draft',
      category: data.category,
      isActive: true,
      creatorId: data.creatorId,
      projectId: data.projectId,
      version: '1.0',
      priority: data.priority || 'medium',
      automationLevel: data.automationLevel || 'manual',
      estimatedDuration: data.estimatedDuration,
      configuration: data.configuration,
      tags: data.tags,
      executionHistory: [],
    };
    
    return testSuite;
  }
}