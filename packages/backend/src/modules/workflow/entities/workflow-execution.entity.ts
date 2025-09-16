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
import { Workflow } from './workflow.entity';

/**
 * 工作流执行实体
 */
@Entity('workflow_executions')
@Index(['workflowId'])
@Index(['executorId'])
@Index(['status'])
@Index(['startedAt'])
@Index(['completedAt'])
@Index(['priority'])
@Index(['triggerType'])
@Index(['workflowId', 'status'])
@Index(['executorId', 'startedAt'])
@Index(['status', 'startedAt'])
export class WorkflowExecution extends BaseEntity {
  @ApiProperty({ description: '工作流ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '关联工作流ID',
  })
  workflowId: string;

  @ApiProperty({ description: '执行者ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '执行者用户ID',
  })
  executorId: string;

  @ApiProperty({ description: '执行状态' })
  @Column({
    type: 'enum',
    enum: ['pending', 'running', 'paused', 'completed', 'failed', 'cancelled', 'timeout'],
    default: 'pending',
    comment: '执行状态',
  })
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'timeout';

  @ApiProperty({ description: '执行优先级' })
  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    comment: '执行优先级',
  })
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @ApiProperty({ description: '触发类型' })
  @Column({
    type: 'enum',
    enum: ['manual', 'event', 'schedule', 'webhook', 'api', 'dependency'],
    comment: '触发类型',
  })
  triggerType: 'manual' | 'event' | 'schedule' | 'webhook' | 'api' | 'dependency';

  @ApiProperty({ description: '触发数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '触发数据',
  })
  triggerData?: {
    // 手动触发
    manual?: {
      reason?: string;
      parameters?: Record<string, any>;
    };
    
    // 事件触发
    event?: {
      eventType: string;
      entityId: string;
      entityType: string;
      eventData: any;
      timestamp: Date;
    };
    
    // 定时触发
    schedule?: {
      scheduledTime: Date;
      cronExpression: string;
      timezone?: string;
    };
    
    // Webhook触发
    webhook?: {
      url: string;
      method: string;
      headers: Record<string, string>;
      body: any;
      timestamp: Date;
    };
    
    // API触发
    api?: {
      endpoint: string;
      method: string;
      parameters: Record<string, any>;
      requestId?: string;
    };
    
    // 依赖触发
    dependency?: {
      parentExecutionId: string;
      parentWorkflowId: string;
      dependencyType: 'success' | 'completion' | 'failure';
    };
  };

  @ApiProperty({ description: '输入参数', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '执行输入参数',
  })
  inputData?: Record<string, any>;

  @ApiProperty({ description: '输出结果', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '执行输出结果',
  })
  outputData?: Record<string, any>;

  @ApiProperty({ description: '执行上下文', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '执行上下文数据',
  })
  context?: {
    // 环境变量
    environment?: Record<string, string>;
    
    // 全局变量
    variables?: Record<string, any>;
    
    // 执行配置
    config?: {
      timeout?: number;
      retryPolicy?: {
        enabled: boolean;
        maxRetries: number;
        retryDelay: number;
        currentRetry?: number;
      };
      notifications?: {
        onStart?: boolean;
        onComplete?: boolean;
        onError?: boolean;
        recipients?: string[];
      };
    };
    
    // 权限上下文
    permissions?: {
      userId: string;
      roles: string[];
      scopes: string[];
    };
    
    // 审计信息
    audit?: {
      traceId: string;
      sessionId?: string;
      clientInfo?: {
        ip: string;
        userAgent?: string;
        location?: string;
      };
    };
  };

  @ApiProperty({ description: '当前节点ID', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '当前执行节点ID',
  })
  currentNodeId?: string;

  @ApiProperty({ description: '节点执行历史', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '节点执行历史',
  })
  nodeHistory?: {
    nodeId: string;
    nodeName: string;
    nodeType: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'cancelled';
    startedAt: Date;
    completedAt?: Date;
    duration?: number; // 执行时间（毫秒）
    input?: any;
    output?: any;
    error?: {
      message: string;
      code?: string;
      stack?: string;
      details?: any;
    };
    retries?: {
      attempt: number;
      startedAt: Date;
      completedAt?: Date;
      error?: string;
    }[];
    assignee?: {
      userId?: string;
      userName?: string;
      assignedAt: Date;
      acceptedAt?: Date;
    };
    approvals?: {
      approverId: string;
      approverName: string;
      action: 'approve' | 'reject' | 'delegate';
      comment?: string;
      timestamp: Date;
      delegateTo?: string;
    }[];
    metadata?: Record<string, any>;
  }[];

  @ApiProperty({ description: '执行进度', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '执行进度信息',
  })
  progress?: {
    // 总体进度
    overall: {
      percentage: number; // 0-100
      completedNodes: number;
      totalNodes: number;
      currentPhase?: string;
    };
    
    // 节点进度
    nodes: {
      [nodeId: string]: {
        status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
        percentage: number;
        message?: string;
        estimatedCompletion?: Date;
      };
    };
    
    // 里程碑
    milestones?: {
      name: string;
      description?: string;
      targetDate?: Date;
      completedDate?: Date;
      status: 'pending' | 'completed' | 'overdue';
    }[];
    
    // 性能指标
    metrics?: {
      throughput?: number; // 每秒处理数
      latency?: number; // 平均延迟（毫秒）
      errorRate?: number; // 错误率（0-1）
      resourceUsage?: {
        cpu?: number; // CPU使用率（0-1）
        memory?: number; // 内存使用量（字节）
        network?: number; // 网络使用量（字节/秒）
      };
    };
  };

  @ApiProperty({ description: '开始时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '执行开始时间',
  })
  startedAt?: Date;

  @ApiProperty({ description: '完成时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '执行完成时间',
  })
  completedAt?: Date;

  @ApiProperty({ description: '暂停时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '执行暂停时间',
  })
  pausedAt?: Date;

  @ApiProperty({ description: '恢复时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '执行恢复时间',
  })
  resumedAt?: Date;

  @ApiProperty({ description: '执行时长', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '执行时长（秒）',
  })
  duration?: number;

  @ApiProperty({ description: '错误信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '执行错误信息',
  })
  error?: {
    message: string;
    code?: string;
    type?: 'system' | 'business' | 'validation' | 'timeout' | 'permission' | 'network';
    stack?: string;
    nodeId?: string; // 出错的节点ID
    timestamp: Date;
    details?: any;
    
    // 错误处理
    handling?: {
      strategy: 'retry' | 'skip' | 'rollback' | 'escalate' | 'manual';
      attempts?: number;
      maxAttempts?: number;
      nextRetryAt?: Date;
      escalatedTo?: string[];
      resolution?: {
        action: string;
        resolvedBy: string;
        resolvedAt: Date;
        comment?: string;
      };
    };
    
    // 影响分析
    impact?: {
      severity: 'low' | 'medium' | 'high' | 'critical';
      affectedSystems?: string[];
      affectedUsers?: string[];
      businessImpact?: string;
      technicalImpact?: string;
    };
  };

  @ApiProperty({ description: '重试信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '重试信息',
  })
  retryInfo?: {
    enabled: boolean;
    maxRetries: number;
    currentRetry: number;
    retryDelay: number; // 重试延迟（秒）
    retryStrategy: 'fixed' | 'exponential' | 'linear';
    lastRetryAt?: Date;
    nextRetryAt?: Date;
    
    // 重试历史
    history: {
      attempt: number;
      startedAt: Date;
      completedAt?: Date;
      status: 'success' | 'failed';
      error?: string;
      duration?: number;
    }[];
    
    // 重试条件
    conditions?: {
      errorTypes?: string[]; // 可重试的错误类型
      httpCodes?: number[]; // 可重试的HTTP状态码
      customConditions?: string[]; // 自定义重试条件
    };
  };

  @ApiProperty({ description: '通知记录', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '通知发送记录',
  })
  notifications?: {
    type: 'start' | 'progress' | 'complete' | 'error' | 'pause' | 'resume' | 'cancel';
    channel: 'email' | 'sms' | 'push' | 'webhook' | 'slack' | 'teams';
    recipients: string[];
    subject?: string;
    content: string;
    sentAt: Date;
    status: 'sent' | 'failed' | 'pending';
    error?: string;
    messageId?: string;
    
    // 通知配置
    config?: {
      template?: string;
      variables?: Record<string, any>;
      attachments?: {
        name: string;
        url: string;
        type: string;
      }[];
    };
  }[];

  @ApiProperty({ description: '审批记录', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '审批记录',
  })
  approvals?: {
    nodeId: string;
    approverId: string;
    approverName: string;
    action: 'approve' | 'reject' | 'delegate' | 'request_info';
    comment?: string;
    timestamp: Date;
    
    // 审批配置
    config?: {
      required: boolean;
      timeout?: number; // 审批超时时间（小时）
      escalation?: {
        enabled: boolean;
        escalateTo: string[];
        escalateAfter: number; // 升级时间（小时）
      };
    };
    
    // 委托信息
    delegation?: {
      delegateTo: string;
      delegateToName: string;
      reason?: string;
      delegatedAt: Date;
    };
    
    // 附件
    attachments?: {
      name: string;
      url: string;
      type: string;
      uploadedAt: Date;
    }[];
  }[];

  @ApiProperty({ description: '执行日志', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '执行日志',
  })
  logs?: {
    timestamp: Date;
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    nodeId?: string;
    category?: 'system' | 'business' | 'security' | 'performance';
    details?: any;
    
    // 日志上下文
    context?: {
      userId?: string;
      sessionId?: string;
      traceId?: string;
      correlationId?: string;
    };
    
    // 性能信息
    performance?: {
      duration?: number;
      memoryUsage?: number;
      cpuUsage?: number;
    };
  }[];

  @ApiProperty({ description: '元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '执行元数据',
  })
  metadata?: {
    // 执行环境
    environment?: {
      platform: string;
      version: string;
      hostname: string;
      processId: number;
    };
    
    // 性能统计
    performance?: {
      totalCpuTime: number; // 总CPU时间（毫秒）
      totalMemoryUsage: number; // 总内存使用（字节）
      peakMemoryUsage: number; // 峰值内存使用（字节）
      networkRequests: number; // 网络请求数
      databaseQueries: number; // 数据库查询数
    };
    
    // 业务指标
    business?: {
      recordsProcessed?: number;
      transactionsCompleted?: number;
      errorsEncountered?: number;
      warningsGenerated?: number;
    };
    
    // 合规信息
    compliance?: {
      dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
      retentionPeriod?: number; // 保留期（天）
      encryptionRequired?: boolean;
      auditRequired?: boolean;
    };
    
    // 标签
    tags?: string[];
    
    // 自定义字段
    custom?: Record<string, any>;
  };

  // 关联关系
  @ManyToOne(() => Workflow)
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'executorId' })
  executor: User;

  /**
   * 检查执行是否正在运行
   * @returns 是否正在运行
   */
  isRunning(): boolean {
    return this.status === 'running';
  }

  /**
   * 检查执行是否已完成
   * @returns 是否已完成
   */
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * 检查执行是否失败
   * @returns 是否失败
   */
  isFailed(): boolean {
    return this.status === 'failed';
  }

  /**
   * 检查执行是否被取消
   * @returns 是否被取消
   */
  isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  /**
   * 检查执行是否暂停
   * @returns 是否暂停
   */
  isPaused(): boolean {
    return this.status === 'paused';
  }

  /**
   * 检查执行是否超时
   * @returns 是否超时
   */
  isTimeout(): boolean {
    return this.status === 'timeout';
  }

  /**
   * 检查执行是否可以暂停
   * @returns 是否可以暂停
   */
  canPause(): boolean {
    return this.status === 'running';
  }

  /**
   * 检查执行是否可以恢复
   * @returns 是否可以恢复
   */
  canResume(): boolean {
    return this.status === 'paused';
  }

  /**
   * 检查执行是否可以取消
   * @returns 是否可以取消
   */
  canCancel(): boolean {
    return ['pending', 'running', 'paused'].includes(this.status);
  }

  /**
   * 检查执行是否可以重试
   * @returns 是否可以重试
   */
  canRetry(): boolean {
    if (!this.isFailed() && !this.isTimeout()) return false;
    
    if (!this.retryInfo?.enabled) return false;
    
    return this.retryInfo.currentRetry < this.retryInfo.maxRetries;
  }

  /**
   * 开始执行
   */
  start(): void {
    this.status = 'running';
    this.startedAt = new Date();
    
    // 初始化进度
    if (!this.progress) {
      this.progress = {
        overall: {
          percentage: 0,
          completedNodes: 0,
          totalNodes: 0,
        },
        nodes: {},
      };
    }
    
    this.addLog('info', '工作流执行开始');
  }

  /**
   * 完成执行
   * @param outputData 输出数据
   */
  complete(outputData?: Record<string, any>): void {
    this.status = 'completed';
    this.completedAt = new Date();
    
    if (this.startedAt) {
      this.duration = Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000);
    }
    
    if (outputData) {
      this.outputData = outputData;
    }
    
    // 更新进度
    if (this.progress) {
      this.progress.overall.percentage = 100;
    }
    
    this.addLog('info', '工作流执行完成');
  }

  /**
   * 执行失败
   * @param error 错误信息
   */
  fail(error: {
    message: string;
    code?: string;
    type?: WorkflowExecution['error']['type'];
    nodeId?: string;
    details?: any;
  }): void {
    this.status = 'failed';
    this.completedAt = new Date();
    
    if (this.startedAt) {
      this.duration = Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000);
    }
    
    this.error = {
      ...error,
      timestamp: new Date(),
    };
    
    this.addLog('error', `工作流执行失败: ${error.message}`, error.nodeId, error.details);
  }

  /**
   * 暂停执行
   */
  pause(): void {
    if (!this.canPause()) return;
    
    this.status = 'paused';
    this.pausedAt = new Date();
    
    this.addLog('info', '工作流执行暂停');
  }

  /**
   * 恢复执行
   */
  resume(): void {
    if (!this.canResume()) return;
    
    this.status = 'running';
    this.resumedAt = new Date();
    this.pausedAt = undefined;
    
    this.addLog('info', '工作流执行恢复');
  }

  /**
   * 取消执行
   */
  cancel(): void {
    if (!this.canCancel()) return;
    
    this.status = 'cancelled';
    this.completedAt = new Date();
    
    if (this.startedAt) {
      this.duration = Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000);
    }
    
    this.addLog('info', '工作流执行取消');
  }

  /**
   * 设置超时
   */
  timeout(): void {
    this.status = 'timeout';
    this.completedAt = new Date();
    
    if (this.startedAt) {
      this.duration = Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000);
    }
    
    this.error = {
      message: '执行超时',
      code: 'EXECUTION_TIMEOUT',
      type: 'timeout',
      timestamp: new Date(),
    };
    
    this.addLog('error', '工作流执行超时');
  }

  /**
   * 更新当前节点
   * @param nodeId 节点ID
   */
  updateCurrentNode(nodeId: string): void {
    this.currentNodeId = nodeId;
    
    // 更新节点历史
    if (!this.nodeHistory) {
      this.nodeHistory = [];
    }
    
    // 查找现有节点记录
    let nodeRecord = this.nodeHistory.find(n => n.nodeId === nodeId);
    
    if (!nodeRecord) {
      // 创建新的节点记录
      nodeRecord = {
        nodeId,
        nodeName: '', // 需要从工作流定义中获取
        nodeType: '', // 需要从工作流定义中获取
        status: 'running',
        startedAt: new Date(),
      };
      this.nodeHistory.push(nodeRecord);
    } else {
      // 更新现有记录
      nodeRecord.status = 'running';
      nodeRecord.startedAt = new Date();
    }
    
    this.addLog('info', `开始执行节点: ${nodeId}`, nodeId);
  }

  /**
   * 完成节点执行
   * @param nodeId 节点ID
   * @param output 输出数据
   */
  completeNode(nodeId: string, output?: any): void {
    if (!this.nodeHistory) return;
    
    const nodeRecord = this.nodeHistory.find(n => n.nodeId === nodeId);
    if (!nodeRecord) return;
    
    nodeRecord.status = 'completed';
    nodeRecord.completedAt = new Date();
    nodeRecord.duration = nodeRecord.completedAt.getTime() - nodeRecord.startedAt.getTime();
    
    if (output) {
      nodeRecord.output = output;
    }
    
    // 更新进度
    if (this.progress) {
      this.progress.overall.completedNodes += 1;
      this.progress.overall.percentage = Math.floor(
        (this.progress.overall.completedNodes / this.progress.overall.totalNodes) * 100
      );
      
      this.progress.nodes[nodeId] = {
        status: 'completed',
        percentage: 100,
      };
    }
    
    this.addLog('info', `节点执行完成: ${nodeId}`, nodeId, { output });
  }

  /**
   * 节点执行失败
   * @param nodeId 节点ID
   * @param error 错误信息
   */
  failNode(nodeId: string, error: { message: string; code?: string; details?: any }): void {
    if (!this.nodeHistory) return;
    
    const nodeRecord = this.nodeHistory.find(n => n.nodeId === nodeId);
    if (!nodeRecord) return;
    
    nodeRecord.status = 'failed';
    nodeRecord.completedAt = new Date();
    nodeRecord.duration = nodeRecord.completedAt.getTime() - nodeRecord.startedAt.getTime();
    nodeRecord.error = error;
    
    // 更新进度
    if (this.progress) {
      this.progress.nodes[nodeId] = {
        status: 'failed',
        percentage: 0,
        message: error.message,
      };
    }
    
    this.addLog('error', `节点执行失败: ${nodeId} - ${error.message}`, nodeId, error);
  }

  /**
   * 添加日志
   * @param level 日志级别
   * @param message 日志消息
   * @param nodeId 节点ID
   * @param details 详细信息
   */
  addLog(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    nodeId?: string,
    details?: any
  ): void {
    if (!this.logs) {
      this.logs = [];
    }
    
    this.logs.push({
      timestamp: new Date(),
      level,
      message,
      nodeId,
      details,
      context: {
        userId: this.executorId,
        traceId: this.context?.audit?.traceId,
      },
    });
  }

  /**
   * 添加通知记录
   * @param notification 通知信息
   */
  addNotification(notification: {
    type: WorkflowExecution['notifications'][0]['type'];
    channel: WorkflowExecution['notifications'][0]['channel'];
    recipients: string[];
    subject?: string;
    content: string;
    status?: 'sent' | 'failed' | 'pending';
    error?: string;
  }): void {
    if (!this.notifications) {
      this.notifications = [];
    }
    
    this.notifications.push({
      ...notification,
      sentAt: new Date(),
      status: notification.status || 'pending',
    });
  }

  /**
   * 添加审批记录
   * @param approval 审批信息
   */
  addApproval(approval: {
    nodeId: string;
    approverId: string;
    approverName: string;
    action: 'approve' | 'reject' | 'delegate' | 'request_info';
    comment?: string;
  }): void {
    if (!this.approvals) {
      this.approvals = [];
    }
    
    this.approvals.push({
      ...approval,
      timestamp: new Date(),
    });
    
    this.addLog('info', `审批操作: ${approval.action}`, approval.nodeId, {
      approverId: approval.approverId,
      comment: approval.comment,
    });
  }

  /**
   * 更新进度
   * @param nodeId 节点ID
   * @param percentage 进度百分比
   * @param message 进度消息
   */
  updateProgress(nodeId: string, percentage: number, message?: string): void {
    if (!this.progress) {
      this.progress = {
        overall: {
          percentage: 0,
          completedNodes: 0,
          totalNodes: 0,
        },
        nodes: {},
      };
    }
    
    this.progress.nodes[nodeId] = {
      status: 'running',
      percentage: Math.max(0, Math.min(100, percentage)),
      message,
    };
    
    // 计算总体进度
    const nodeProgresses = Object.values(this.progress.nodes);
    const totalProgress = nodeProgresses.reduce((sum, node) => sum + node.percentage, 0);
    this.progress.overall.percentage = Math.floor(totalProgress / nodeProgresses.length);
  }

  /**
   * 获取执行摘要
   * @returns 执行摘要
   */
  getSummary(): {
    id: string;
    workflowId: string;
    status: string;
    progress: number;
    duration?: number;
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
  } {
    return {
      id: this.id,
      workflowId: this.workflowId,
      status: this.status,
      progress: this.progress?.overall.percentage || 0,
      duration: this.duration,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      error: this.error?.message,
    };
  }

  /**
   * 验证执行数据
   * @param data 执行数据
   * @returns 验证结果
   */
  static validate(data: Partial<WorkflowExecution>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.workflowId || data.workflowId.trim().length === 0) {
      errors.push('工作流ID不能为空');
    }
    
    if (!data.executorId || data.executorId.trim().length === 0) {
      errors.push('执行者ID不能为空');
    }
    
    if (!data.triggerType) {
      errors.push('触发类型不能为空');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建执行实例
   * @param data 执行数据
   * @returns 执行实例
   */
  static create(data: {
    workflowId: string;
    executorId: string;
    triggerType: WorkflowExecution['triggerType'];
    triggerData?: WorkflowExecution['triggerData'];
    inputData?: Record<string, any>;
    priority?: WorkflowExecution['priority'];
    context?: WorkflowExecution['context'];
  }): Partial<WorkflowExecution> {
    return {
      workflowId: data.workflowId,
      executorId: data.executorId,
      status: 'pending',
      priority: data.priority || 'medium',
      triggerType: data.triggerType,
      triggerData: data.triggerData,
      inputData: data.inputData,
      context: data.context,
      progress: {
        overall: {
          percentage: 0,
          completedNodes: 0,
          totalNodes: 0,
        },
        nodes: {},
      },
      logs: [],
      notifications: [],
      approvals: [],
    };
  }
}