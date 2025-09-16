import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Project } from '../../project/entities/project.entity';
import { Requirement } from '../../requirement/entities/requirement.entity';

/**
 * 测试用例实体
 */
@Entity('test_cases')
@Index(['title'])
@Index(['type'])
@Index(['status'])
@Index(['priority'])
@Index(['creatorId'])
@Index(['assigneeId'])
@Index(['projectId'])
@Index(['isActive'])
@Index(['category'])
@Index(['createdAt'])
@Index(['projectId', 'status'])
@Index(['assigneeId', 'priority'])
@Index(['creatorId', 'type'])
@Index(['status', 'priority'])
export class TestCase extends BaseEntity {
  @ApiProperty({ description: '测试用例标题' })
  @Column({
    type: 'varchar',
    length: 200,
    comment: '测试用例标题',
  })
  title: string;

  @ApiProperty({ description: '测试用例描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '测试用例描述',
  })
  description?: string;

  @ApiProperty({ description: '测试类型' })
  @Column({
    type: 'enum',
    enum: ['unit', 'integration', 'system', 'acceptance', 'performance', 'security', 'usability', 'compatibility', 'regression', 'smoke', 'sanity', 'exploratory'],
    comment: '测试类型',
  })
  type: 'unit' | 'integration' | 'system' | 'acceptance' | 'performance' | 'security' | 'usability' | 'compatibility' | 'regression' | 'smoke' | 'sanity' | 'exploratory';

  @ApiProperty({ description: '测试状态' })
  @Column({
    type: 'enum',
    enum: ['draft', 'ready', 'in_progress', 'passed', 'failed', 'blocked', 'skipped', 'obsolete'],
    default: 'draft',
    comment: '测试状态',
  })
  status: 'draft' | 'ready' | 'in_progress' | 'passed' | 'failed' | 'blocked' | 'skipped' | 'obsolete';

  @ApiProperty({ description: '优先级' })
  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    comment: '测试优先级',
  })
  priority: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({ description: '测试分类' })
  @Column({
    type: 'varchar',
    length: 50,
    comment: '测试分类',
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

  @ApiProperty({ description: '负责人ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '负责人用户ID',
  })
  assigneeId?: string;

  @ApiProperty({ description: '项目ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '关联项目ID',
  })
  projectId?: string;

  @ApiProperty({ description: '测试套件ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '测试套件ID',
  })
  testSuiteId?: string;

  @ApiProperty({ description: '测试用例编号', required: false })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    unique: true,
    comment: '测试用例编号',
  })
  testCaseNumber?: string;

  @ApiProperty({ description: '版本号' })
  @Column({
    type: 'varchar',
    length: 20,
    default: '1.0',
    comment: '测试用例版本号',
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

  @ApiProperty({ description: '自动化级别' })
  @Column({
    type: 'enum',
    enum: ['manual', 'semi_automated', 'automated'],
    default: 'manual',
    comment: '自动化级别',
  })
  automationLevel: 'manual' | 'semi_automated' | 'automated';

  @ApiProperty({ description: '测试详情', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '测试详情',
  })
  details?: {
    // 前置条件
    preconditions?: {
      id: string;
      description: string;
      type: 'system_state' | 'data_setup' | 'environment' | 'user_state' | 'configuration';
      required: boolean;
      setupInstructions?: string;
      verificationCriteria?: string;
    }[];
    
    // 测试步骤
    steps?: {
      stepNumber: number;
      action: string;
      expectedResult: string;
      
      // 步骤详情
      details?: {
        inputData?: {
          name: string;
          value: any;
          type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'file';
          description?: string;
          validation?: string;
        }[];
        
        uiElements?: {
          element: string;
          selector?: string;
          action: 'click' | 'input' | 'select' | 'hover' | 'drag' | 'verify';
          value?: any;
          description?: string;
        }[];
        
        apiCalls?: {
          method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
          url: string;
          headers?: Record<string, string>;
          body?: any;
          expectedStatus: number;
          expectedResponse?: any;
        }[];
        
        databaseOperations?: {
          operation: 'select' | 'insert' | 'update' | 'delete';
          table: string;
          query: string;
          expectedResult?: any;
        }[];
        
        fileOperations?: {
          operation: 'create' | 'read' | 'update' | 'delete' | 'upload' | 'download';
          path: string;
          content?: any;
          expectedResult?: any;
        }[];
      };
      
      // 验证点
      verifications?: {
        type: 'ui' | 'api' | 'database' | 'file' | 'performance' | 'security';
        description: string;
        criteria: string;
        method: string;
        expectedValue: any;
        tolerance?: string; // 容差（用于性能测试等）
      }[];
      
      // 分支和循环
      branches?: {
        condition: string;
        trueSteps: number[]; // 条件为真时执行的步骤
        falseSteps: number[]; // 条件为假时执行的步骤
      }[];
      
      loops?: {
        condition: string;
        steps: number[];
        maxIterations?: number;
      }[];
    }[];
    
    // 后置条件
    postconditions?: {
      id: string;
      description: string;
      type: 'cleanup' | 'verification' | 'data_restore' | 'state_reset';
      required: boolean;
      cleanupInstructions?: string;
    }[];
    
    // 测试数据
    testData?: {
      // 输入数据
      inputs?: {
        name: string;
        type: 'static' | 'dynamic' | 'generated' | 'imported';
        value?: any;
        source?: string; // 数据源
        generator?: string; // 生成器配置
        validation?: {
          rules: string[];
          format?: string;
          range?: { min: any; max: any };
        };
        description?: string;
      }[];
      
      // 期望输出
      expectedOutputs?: {
        name: string;
        type: 'exact' | 'pattern' | 'range' | 'contains' | 'custom';
        value: any;
        pattern?: string; // 正则表达式或模式
        validator?: string; // 自定义验证器
        description?: string;
      }[];
      
      // 数据集
      datasets?: {
        name: string;
        description?: string;
        source: 'file' | 'database' | 'api' | 'generated';
        location?: string;
        format?: 'json' | 'csv' | 'xml' | 'sql';
        size?: number;
        records: Record<string, any>[];
      }[];
    };
    
    // 环境要求
    environment?: {
      // 系统要求
      system?: {
        os: string[];
        browser?: string[];
        device?: string[];
        resolution?: string[];
        network?: string[];
      };
      
      // 软件要求
      software?: {
        applications: {
          name: string;
          version: string;
          configuration?: Record<string, any>;
        }[];
        
        services: {
          name: string;
          version?: string;
          endpoint?: string;
          configuration?: Record<string, any>;
        }[];
        
        databases: {
          type: string;
          version?: string;
          schema?: string;
          data?: string;
        }[];
      };
      
      // 配置要求
      configuration?: {
        settings: Record<string, any>;
        features: string[];
        permissions: string[];
        integrations: string[];
      };
    };
    
    // 自动化配置
    automation?: {
      // 脚本信息
      script?: {
        language: 'javascript' | 'python' | 'java' | 'csharp' | 'ruby' | 'other';
        framework: string; // 测试框架
        file: string; // 脚本文件路径
        function?: string; // 入口函数
        parameters?: Record<string, any>;
      };
      
      // 执行配置
      execution?: {
        timeout: number; // 超时时间（秒）
        retries: number; // 重试次数
        parallel: boolean; // 是否并行执行
        dependencies: string[]; // 依赖的测试用例
        tags: string[]; // 标签（用于分组执行）
      };
      
      // 报告配置
      reporting?: {
        screenshots: boolean; // 是否截图
        videos: boolean; // 是否录制视频
        logs: boolean; // 是否收集日志
        metrics: boolean; // 是否收集性能指标
        artifacts: string[]; // 其他产物
      };
    };
    
    // 风险和注意事项
    risks?: {
      id: string;
      description: string;
      category: 'data_loss' | 'system_impact' | 'security' | 'performance' | 'compatibility';
      probability: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      mitigation: string;
      contingency?: string;
    }[];
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
    executedAt: Date;
    duration: number; // 执行时间（分钟）
    
    // 执行结果
    result: 'passed' | 'failed' | 'blocked' | 'skipped';
    
    // 执行环境
    environment: {
      os?: string;
      browser?: string;
      device?: string;
      version?: string;
      configuration?: Record<string, any>;
    };
    
    // 步骤结果
    stepResults?: {
      stepNumber: number;
      status: 'passed' | 'failed' | 'skipped';
      actualResult?: string;
      screenshot?: string;
      logs?: string[];
      duration?: number;
      error?: {
        message: string;
        stack?: string;
        type: string;
      };
    }[];
    
    // 缺陷信息
    defects?: {
      id: string;
      title: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      status: 'open' | 'in_progress' | 'resolved' | 'closed';
      assignee?: string;
      
      // 重现信息
      reproduction?: {
        steps: string[];
        frequency: 'always' | 'sometimes' | 'rarely';
        conditions: string[];
      };
    }[];
    
    // 附件
    attachments?: {
      id: string;
      name: string;
      type: 'screenshot' | 'video' | 'log' | 'report' | 'other';
      url?: string;
      fileId?: string;
      size?: number;
      description?: string;
    }[];
    
    // 性能指标（用于性能测试）
    performance?: {
      responseTime?: number; // 响应时间（毫秒）
      throughput?: number; // 吞吐量
      cpuUsage?: number; // CPU使用率
      memoryUsage?: number; // 内存使用量
      networkUsage?: number; // 网络使用量
      customMetrics?: Record<string, number>;
    };
    
    // 覆盖率信息（用于代码覆盖率测试）
    coverage?: {
      lines: number; // 行覆盖率
      functions: number; // 函数覆盖率
      branches: number; // 分支覆盖率
      statements: number; // 语句覆盖率
      files: {
        path: string;
        coverage: number;
      }[];
    };
    
    // 备注
    notes?: string;
  }[];

  @ApiProperty({ description: '关联需求', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '关联需求',
  })
  requirements?: {
    requirementId: string;
    relationship: 'tests' | 'verifies' | 'validates' | 'covers';
    coverage: 'full' | 'partial' | 'minimal';
    description?: string;
  }[];

  @ApiProperty({ description: '依赖关系', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '依赖关系',
  })
  dependencies?: {
    // 前置测试用例
    prerequisites?: {
      testCaseId: string;
      relationship: 'must_pass' | 'should_pass' | 'data_dependency';
      description?: string;
    }[];
    
    // 后续测试用例
    dependents?: {
      testCaseId: string;
      relationship: 'blocks' | 'affects' | 'provides_data';
      description?: string;
    }[];
    
    // 外部依赖
    external?: {
      type: 'service' | 'database' | 'file' | 'environment' | 'third_party';
      name: string;
      description: string;
      availability: 'always' | 'scheduled' | 'on_demand';
      fallback?: string;
    }[];
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
    // 复杂度评估
    complexity?: {
      overall: 'low' | 'medium' | 'high' | 'very_high';
      
      factors: {
        data_complexity: 'low' | 'medium' | 'high';
        logic_complexity: 'low' | 'medium' | 'high';
        ui_complexity: 'low' | 'medium' | 'high';
        integration_complexity: 'low' | 'medium' | 'high';
        environment_complexity: 'low' | 'medium' | 'high';
      };
      
      score?: number; // 复杂度评分 (1-10)
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
    };
    
    // 质量指标
    quality?: {
      reliability: number; // 可靠性 (1-5)
      maintainability: number; // 可维护性 (1-5)
      reusability: number; // 可重用性 (1-5)
      clarity: number; // 清晰度 (1-5)
      completeness: number; // 完整性 (1-5)
      
      // 历史指标
      passRate?: number; // 历史通过率
      avgExecutionTime?: number; // 平均执行时间
      defectDetectionRate?: number; // 缺陷检出率
    };
    
    // 业务价值
    businessValue?: {
      criticality: 'low' | 'medium' | 'high' | 'critical';
      userImpact: 'low' | 'medium' | 'high';
      businessRisk: 'low' | 'medium' | 'high';
      complianceRequirement: boolean;
      customerFacing: boolean;
    };
    
    // 自定义字段
    custom?: Record<string, any>;
  };

  // 关联关系
  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigneeId' })
  assignee?: User;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'projectId' })
  project?: Project;

  @ManyToMany(() => Requirement)
  @JoinTable({
    name: 'test_case_requirements',
    joinColumn: { name: 'testCaseId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'requirementId', referencedColumnName: 'id' },
  })
  relatedRequirements: Requirement[];

  /**
   * 检查测试用例是否激活
   * @returns 是否激活
   */
  isActiveTestCase(): boolean {
    return this.isActive && this.status !== 'obsolete';
  }

  /**
   * 检查测试用例是否已通过
   * @returns 是否已通过
   */
  isPassed(): boolean {
    return this.status === 'passed';
  }

  /**
   * 检查测试用例是否失败
   * @returns 是否失败
   */
  isFailed(): boolean {
    return this.status === 'failed';
  }

  /**
   * 检查测试用例是否被阻塞
   * @returns 是否被阻塞
   */
  isBlocked(): boolean {
    return this.status === 'blocked';
  }

  /**
   * 检查测试用例是否跳过
   * @returns 是否跳过
   */
  isSkipped(): boolean {
    return this.status === 'skipped';
  }

  /**
   * 检查测试用例是否自动化
   * @returns 是否自动化
   */
  isAutomated(): boolean {
    return this.automationLevel === 'automated';
  }

  /**
   * 检查用户是否可以查看测试用例
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以查看
   */
  canView(userId: string, userRoles: string[]): boolean {
    // 创建者和负责人可以查看
    if (this.creatorId === userId || this.assigneeId === userId) return true;
    
    // 检查项目权限（需要在项目实体中实现）
    // 这里简化处理，实际应该检查用户是否是项目成员
    
    return false;
  }

  /**
   * 检查用户是否可以编辑测试用例
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以编辑
   */
  canEdit(userId: string, userRoles: string[]): boolean {
    // 废弃的测试用例不能编辑
    if (this.status === 'obsolete') return false;
    
    // 创建者可以编辑
    if (this.creatorId === userId) return true;
    
    // 负责人可以编辑
    if (this.assigneeId === userId) return true;
    
    return false;
  }

  /**
   * 检查用户是否可以执行测试用例
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以执行
   */
  canExecute(userId: string, userRoles: string[]): boolean {
    // 草稿和废弃的测试用例不能执行
    if (['draft', 'obsolete'].includes(this.status)) return false;
    
    // 负责人可以执行
    if (this.assigneeId === userId) return true;
    
    // 测试人员可以执行
    if (userRoles.includes('tester')) return true;
    
    return false;
  }

  /**
   * 开始执行测试
   * @param executorId 执行人ID
   */
  startExecution(executorId: string): void {
    if (this.status === 'ready') {
      this.status = 'in_progress';
      this.assigneeId = executorId;
    }
  }

  /**
   * 标记测试通过
   * @param executorId 执行人ID
   * @param duration 执行时间（分钟）
   * @param notes 备注
   */
  markAsPassed(executorId: string, duration?: number, notes?: string): void {
    this.status = 'passed';
    this.actualDuration = duration;
    
    this.addExecutionRecord(executorId, 'passed', duration, notes);
  }

  /**
   * 标记测试失败
   * @param executorId 执行人ID
   * @param duration 执行时间（分钟）
   * @param notes 备注
   * @param defects 缺陷信息
   */
  markAsFailed(
    executorId: string,
    duration?: number,
    notes?: string,
    defects?: {
      title: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }[]
  ): void {
    this.status = 'failed';
    this.actualDuration = duration;
    
    this.addExecutionRecord(executorId, 'failed', duration, notes, defects);
  }

  /**
   * 标记测试被阻塞
   * @param executorId 执行人ID
   * @param reason 阻塞原因
   */
  markAsBlocked(executorId: string, reason: string): void {
    this.status = 'blocked';
    
    this.addExecutionRecord(executorId, 'blocked', undefined, reason);
  }

  /**
   * 标记测试跳过
   * @param executorId 执行人ID
   * @param reason 跳过原因
   */
  markAsSkipped(executorId: string, reason: string): void {
    this.status = 'skipped';
    
    this.addExecutionRecord(executorId, 'skipped', undefined, reason);
  }

  /**
   * 重置测试状态
   */
  reset(): void {
    this.status = 'ready';
    this.actualDuration = undefined;
  }

  /**
   * 标记为废弃
   * @param reason 废弃原因
   */
  markAsObsolete(reason: string): void {
    this.status = 'obsolete';
    this.isActive = false;
    
    if (!this.metadata) {
      this.metadata = {};
    }
    
    this.metadata.obsoleteReason = reason;
    this.metadata.obsoleteDate = new Date();
  }

  /**
   * 分配负责人
   * @param assigneeId 负责人ID
   */
  assign(assigneeId: string): void {
    this.assigneeId = assigneeId;
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
   * 添加执行记录
   * @param executorId 执行人ID
   * @param result 执行结果
   * @param duration 执行时间
   * @param notes 备注
   * @param defects 缺陷信息
   */
  private addExecutionRecord(
    executorId: string,
    result: 'passed' | 'failed' | 'blocked' | 'skipped',
    duration?: number,
    notes?: string,
    defects?: any[]
  ): void {
    if (!this.executionHistory) {
      this.executionHistory = [];
    }
    
    const execution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      executedBy: executorId,
      executedAt: new Date(),
      duration: duration || 0,
      result,
      environment: {}, // 需要从执行环境获取
      notes,
    };
    
    if (defects && defects.length > 0) {
      execution['defects'] = defects.map(defect => ({
        id: `defect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...defect,
        status: 'open',
      }));
    }
    
    this.executionHistory.push(execution);
  }

  /**
   * 获取最后执行结果
   * @returns 最后执行结果
   */
  getLastExecutionResult(): {
    result: string;
    executedAt: Date;
    executedBy: string;
    duration: number;
  } | null {
    if (!this.executionHistory || this.executionHistory.length === 0) {
      return null;
    }
    
    const lastExecution = this.executionHistory[this.executionHistory.length - 1];
    return {
      result: lastExecution.result,
      executedAt: lastExecution.executedAt,
      executedBy: lastExecution.executedBy,
      duration: lastExecution.duration,
    };
  }

  /**
   * 获取通过率
   * @returns 通过率（百分比）
   */
  getPassRate(): number {
    if (!this.executionHistory || this.executionHistory.length === 0) {
      return 0;
    }
    
    const passedCount = this.executionHistory.filter(exec => exec.result === 'passed').length;
    return Math.round((passedCount / this.executionHistory.length) * 100);
  }

  /**
   * 获取平均执行时间
   * @returns 平均执行时间（分钟）
   */
  getAverageExecutionTime(): number {
    if (!this.executionHistory || this.executionHistory.length === 0) {
      return 0;
    }
    
    const totalDuration = this.executionHistory.reduce((sum, exec) => sum + exec.duration, 0);
    return Math.round(totalDuration / this.executionHistory.length);
  }

  /**
   * 获取测试用例摘要
   * @returns 测试用例摘要
   */
  getSummary(): {
    id: string;
    title: string;
    type: string;
    status: string;
    priority: string;
    automationLevel: string;
    assignee?: string;
    passRate: number;
    lastExecuted?: Date;
  } {
    const lastExecution = this.getLastExecutionResult();
    
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      status: this.status,
      priority: this.priority,
      automationLevel: this.automationLevel,
      assignee: this.assigneeId,
      passRate: this.getPassRate(),
      lastExecuted: lastExecution?.executedAt,
    };
  }

  /**
   * 验证测试用例数据
   * @param data 测试用例数据
   * @returns 验证结果
   */
  static validate(data: Partial<TestCase>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.title || data.title.trim().length === 0) {
      errors.push('测试用例标题不能为空');
    }
    
    if (data.title && data.title.length > 200) {
      errors.push('测试用例标题长度不能超过200个字符');
    }
    
    if (!data.type) {
      errors.push('测试类型不能为空');
    }
    
    if (!data.category || data.category.trim().length === 0) {
      errors.push('测试分类不能为空');
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
   * 创建测试用例实例
   * @param data 测试用例数据
   * @returns 测试用例实例
   */
  static create(data: {
    title: string;
    description?: string;
    type: TestCase['type'];
    category: string;
    priority?: TestCase['priority'];
    creatorId: string;
    assigneeId?: string;
    projectId?: string;
    testSuiteId?: string;
    automationLevel?: TestCase['automationLevel'];
    estimatedDuration?: number;
    details?: TestCase['details'];
    tags?: string[];
  }): Partial<TestCase> {
    const testCase: Partial<TestCase> = {
      title: data.title,
      description: data.description,
      type: data.type,
      status: 'draft',
      priority: data.priority || 'medium',
      category: data.category,
      isActive: true,
      creatorId: data.creatorId,
      assigneeId: data.assigneeId,
      projectId: data.projectId,
      testSuiteId: data.testSuiteId,
      version: '1.0',
      automationLevel: data.automationLevel || 'manual',
      estimatedDuration: data.estimatedDuration,
      details: data.details,
      tags: data.tags,
      executionHistory: [],
    };
    
    return testCase;
  }
}