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
 * 工作流实体
 */
@Entity('workflows')
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
export class Workflow extends BaseEntity {
  @ApiProperty({ description: '工作流名称' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '工作流名称',
  })
  name: string;

  @ApiProperty({ description: '工作流描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '工作流描述',
  })
  description?: string;

  @ApiProperty({ description: '工作流类型' })
  @Column({
    type: 'enum',
    enum: ['approval', 'review', 'deployment', 'testing', 'notification', 'automation', 'custom'],
    comment: '工作流类型',
  })
  type: 'approval' | 'review' | 'deployment' | 'testing' | 'notification' | 'automation' | 'custom';

  @ApiProperty({ description: '工作流分类' })
  @Column({
    type: 'varchar',
    length: 50,
    comment: '工作流分类',
  })
  category: string;

  @ApiProperty({ description: '工作流状态' })
  @Column({
    type: 'enum',
    enum: ['draft', 'active', 'inactive', 'archived', 'deleted'],
    default: 'draft',
    comment: '工作流状态',
  })
  status: 'draft' | 'active' | 'inactive' | 'archived' | 'deleted';

  @ApiProperty({ description: '是否激活' })
  @Column({
    type: 'boolean',
    default: true,
    comment: '是否激活',
  })
  isActive: boolean;

  @ApiProperty({ description: '是否为模板' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为工作流模板',
  })
  isTemplate: boolean;

  @ApiProperty({ description: '版本号' })
  @Column({
    type: 'varchar',
    length: 20,
    default: '1.0.0',
    comment: '工作流版本号',
  })
  version: string;

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

  @ApiProperty({ description: '触发条件', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '工作流触发条件',
  })
  triggers?: {
    // 手动触发
    manual?: {
      enabled: boolean;
      roles?: string[]; // 可触发的角色
      users?: string[]; // 可触发的用户
    };
    
    // 事件触发
    events?: {
      type: 'create' | 'update' | 'delete' | 'status_change' | 'custom';
      entity: string; // 实体类型
      conditions?: {
        field: string;
        operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith';
        value: any;
      }[];
    }[];
    
    // 定时触发
    schedule?: {
      enabled: boolean;
      cron: string; // Cron表达式
      timezone?: string;
      startDate?: Date;
      endDate?: Date;
    };
    
    // Webhook触发
    webhook?: {
      enabled: boolean;
      url: string;
      secret?: string;
      headers?: Record<string, string>;
    };
    
    // API触发
    api?: {
      enabled: boolean;
      endpoint: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      authentication?: {
        type: 'none' | 'basic' | 'bearer' | 'apikey';
        credentials?: Record<string, string>;
      };
    };
  };

  @ApiProperty({ description: '工作流定义', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '工作流节点和连接定义',
  })
  definition?: {
    // 节点定义
    nodes: {
      id: string;
      type: 'start' | 'end' | 'task' | 'decision' | 'parallel' | 'merge' | 'delay' | 'notification' | 'approval' | 'script' | 'api' | 'condition';
      name: string;
      description?: string;
      position: {
        x: number;
        y: number;
      };
      
      // 节点配置
      config?: {
        // 任务节点配置
        task?: {
          assignee?: string; // 指定执行人
          assigneeType?: 'user' | 'role' | 'group' | 'auto';
          dueDate?: string; // 截止时间表达式
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          form?: {
            fields: {
              name: string;
              type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
              label: string;
              required?: boolean;
              options?: { label: string; value: any }[];
              validation?: any;
            }[];
          };
        };
        
        // 决策节点配置
        decision?: {
          conditions: {
            expression: string; // 条件表达式
            output: string; // 输出连接ID
          }[];
          defaultOutput?: string; // 默认输出
        };
        
        // 延迟节点配置
        delay?: {
          duration: number; // 延迟时间（秒）
          unit?: 'seconds' | 'minutes' | 'hours' | 'days';
        };
        
        // 通知节点配置
        notification?: {
          type: 'email' | 'sms' | 'push' | 'webhook';
          recipients: string[]; // 接收人
          template: string; // 通知模板
          variables?: Record<string, any>; // 模板变量
        };
        
        // 审批节点配置
        approval?: {
          approvers: string[]; // 审批人
          approvalType: 'any' | 'all' | 'majority'; // 审批类型
          autoApprove?: {
            enabled: boolean;
            conditions?: any[];
          };
          escalation?: {
            enabled: boolean;
            timeout: number; // 超时时间（小时）
            escalateTo: string[]; // 升级审批人
          };
        };
        
        // 脚本节点配置
        script?: {
          language: 'javascript' | 'python' | 'shell';
          code: string;
          timeout?: number; // 超时时间（秒）
          environment?: Record<string, string>; // 环境变量
        };
        
        // API节点配置
        api?: {
          url: string;
          method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
          headers?: Record<string, string>;
          body?: any;
          timeout?: number;
          retries?: number;
          authentication?: {
            type: 'none' | 'basic' | 'bearer' | 'apikey';
            credentials?: Record<string, string>;
          };
        };
        
        // 条件节点配置
        condition?: {
          expression: string; // 条件表达式
          trueOutput: string; // 真值输出
          falseOutput: string; // 假值输出
        };
      };
      
      // 节点样式
      style?: {
        backgroundColor?: string;
        borderColor?: string;
        textColor?: string;
        icon?: string;
      };
    }[];
    
    // 连接定义
    edges: {
      id: string;
      source: string; // 源节点ID
      target: string; // 目标节点ID
      label?: string;
      condition?: string; // 连接条件
      style?: {
        strokeColor?: string;
        strokeWidth?: number;
        strokeDasharray?: string;
      };
    }[];
    
    // 全局变量
    variables?: {
      name: string;
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      defaultValue?: any;
      description?: string;
    }[];
    
    // 全局设置
    settings?: {
      timeout?: number; // 全局超时时间（秒）
      retryPolicy?: {
        enabled: boolean;
        maxRetries: number;
        retryDelay: number; // 重试延迟（秒）
      };
      errorHandling?: {
        onError: 'stop' | 'continue' | 'retry' | 'rollback';
        notifyOnError: boolean;
        errorNotificationRecipients?: string[];
      };
      logging?: {
        enabled: boolean;
        level: 'debug' | 'info' | 'warn' | 'error';
        includeVariables: boolean;
      };
    };
  };

  @ApiProperty({ description: '输入参数定义', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '工作流输入参数定义',
  })
  inputSchema?: {
    type: 'object';
    properties: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      title?: string;
      description?: string;
      required?: boolean;
      default?: any;
      enum?: any[];
      format?: string;
      validation?: any;
    }>;
    required?: string[];
  };

  @ApiProperty({ description: '输出参数定义', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '工作流输出参数定义',
  })
  outputSchema?: {
    type: 'object';
    properties: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      title?: string;
      description?: string;
    }>;
  };

  @ApiProperty({ description: '权限设置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '工作流权限设置',
  })
  permissions?: {
    // 查看权限
    view?: {
      users?: string[];
      roles?: string[];
      public?: boolean;
    };
    
    // 执行权限
    execute?: {
      users?: string[];
      roles?: string[];
      conditions?: {
        field: string;
        operator: string;
        value: any;
      }[];
    };
    
    // 编辑权限
    edit?: {
      users?: string[];
      roles?: string[];
      ownerOnly?: boolean;
    };
    
    // 删除权限
    delete?: {
      users?: string[];
      roles?: string[];
      ownerOnly?: boolean;
    };
    
    // 管理权限
    manage?: {
      users?: string[];
      roles?: string[];
      ownerOnly?: boolean;
    };
  };

  @ApiProperty({ description: '统计信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '工作流统计信息',
  })
  statistics?: {
    // 执行统计
    executions?: {
      total: number;
      successful: number;
      failed: number;
      running: number;
      cancelled: number;
    };
    
    // 性能统计
    performance?: {
      averageDuration: number; // 平均执行时间（秒）
      minDuration: number;
      maxDuration: number;
      lastDuration?: number;
    };
    
    // 使用统计
    usage?: {
      lastExecutedAt?: Date;
      lastExecutedBy?: string;
      executionCount: number;
      uniqueUsers: number;
    };
    
    // 错误统计
    errors?: {
      count: number;
      lastErrorAt?: Date;
      commonErrors: {
        message: string;
        count: number;
      }[];
    };
  };

  @ApiProperty({ description: '配置选项', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '工作流配置选项',
  })
  options?: {
    // 并发控制
    concurrency?: {
      enabled: boolean;
      maxConcurrent: number; // 最大并发执行数
      queueLimit?: number; // 队列限制
    };
    
    // 执行限制
    limits?: {
      maxExecutionsPerDay?: number;
      maxExecutionsPerUser?: number;
      maxDuration?: number; // 最大执行时间（秒）
    };
    
    // 通知设置
    notifications?: {
      onStart?: {
        enabled: boolean;
        recipients: string[];
      };
      onComplete?: {
        enabled: boolean;
        recipients: string[];
      };
      onError?: {
        enabled: boolean;
        recipients: string[];
      };
    };
    
    // 审计设置
    audit?: {
      enabled: boolean;
      logLevel: 'basic' | 'detailed' | 'full';
      retentionDays: number;
    };
    
    // 缓存设置
    cache?: {
      enabled: boolean;
      ttl: number; // 缓存时间（秒）
      key?: string; // 缓存键模板
    };
    
    // 环境设置
    environment?: {
      variables: Record<string, string>;
      secrets: string[]; // 密钥引用
    };
  };

  @ApiProperty({ description: '标签', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '工作流标签',
  })
  tags?: string[];

  @ApiProperty({ description: '元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '工作流元数据',
  })
  metadata?: {
    // 版本信息
    version?: {
      major: number;
      minor: number;
      patch: number;
      prerelease?: string;
      build?: string;
    };
    
    // 变更日志
    changelog?: {
      version: string;
      date: Date;
      author: string;
      changes: string[];
    }[];
    
    // 依赖信息
    dependencies?: {
      workflows?: string[]; // 依赖的工作流
      services?: string[]; // 依赖的服务
      apis?: string[]; // 依赖的API
    };
    
    // 文档信息
    documentation?: {
      readme?: string;
      examples?: {
        name: string;
        description: string;
        input: any;
        expectedOutput: any;
      }[];
      troubleshooting?: {
        issue: string;
        solution: string;
      }[];
    };
    
    // 测试信息
    testing?: {
      testCases?: {
        name: string;
        input: any;
        expectedOutput: any;
        status: 'passed' | 'failed' | 'pending';
      }[];
      coverage?: number;
      lastTestRun?: Date;
    };
  };

  // 关联关系
  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'projectId' })
  project?: Project;

  /**
   * 检查工作流是否激活
   * @returns 是否激活
   */
  isActiveWorkflow(): boolean {
    return this.isActive && this.status === 'active';
  }

  /**
   * 检查工作流是否为模板
   * @returns 是否为模板
   */
  isTemplateWorkflow(): boolean {
    return this.isTemplate;
  }

  /**
   * 检查工作流是否已归档
   * @returns 是否已归档
   */
  isArchived(): boolean {
    return this.status === 'archived';
  }

  /**
   * 检查工作流是否已删除
   * @returns 是否已删除
   */
  isDeleted(): boolean {
    return this.status === 'deleted';
  }

  /**
   * 检查用户是否可以查看工作流
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以查看
   */
  canView(userId: string, userRoles: string[]): boolean {
    // 创建者可以查看
    if (this.creatorId === userId) return true;
    
    // 检查查看权限
    const viewPermissions = this.permissions?.view;
    if (!viewPermissions) return true;
    
    // 公开工作流
    if (viewPermissions.public) return true;
    
    // 检查用户权限
    if (viewPermissions.users?.includes(userId)) return true;
    
    // 检查角色权限
    if (viewPermissions.roles && userRoles.some(role => viewPermissions.roles!.includes(role))) {
      return true;
    }
    
    return false;
  }

  /**
   * 检查用户是否可以执行工作流
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @param context 执行上下文
   * @returns 是否可以执行
   */
  canExecute(userId: string, userRoles: string[], context?: any): boolean {
    // 工作流必须激活
    if (!this.isActiveWorkflow()) return false;
    
    // 检查执行权限
    const executePermissions = this.permissions?.execute;
    if (!executePermissions) return true;
    
    // 检查用户权限
    if (executePermissions.users?.includes(userId)) {
      return this.checkExecuteConditions(context, executePermissions.conditions);
    }
    
    // 检查角色权限
    if (executePermissions.roles && userRoles.some(role => executePermissions.roles!.includes(role))) {
      return this.checkExecuteConditions(context, executePermissions.conditions);
    }
    
    return false;
  }

  /**
   * 检查用户是否可以编辑工作流
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以编辑
   */
  canEdit(userId: string, userRoles: string[]): boolean {
    const editPermissions = this.permissions?.edit;
    
    // 如果设置了仅所有者可编辑
    if (editPermissions?.ownerOnly) {
      return this.creatorId === userId;
    }
    
    // 创建者可以编辑
    if (this.creatorId === userId) return true;
    
    // 检查编辑权限
    if (!editPermissions) return false;
    
    // 检查用户权限
    if (editPermissions.users?.includes(userId)) return true;
    
    // 检查角色权限
    if (editPermissions.roles && userRoles.some(role => editPermissions.roles!.includes(role))) {
      return true;
    }
    
    return false;
  }

  /**
   * 检查用户是否可以删除工作流
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以删除
   */
  canDelete(userId: string, userRoles: string[]): boolean {
    const deletePermissions = this.permissions?.delete;
    
    // 如果设置了仅所有者可删除
    if (deletePermissions?.ownerOnly) {
      return this.creatorId === userId;
    }
    
    // 创建者可以删除
    if (this.creatorId === userId) return true;
    
    // 检查删除权限
    if (!deletePermissions) return false;
    
    // 检查用户权限
    if (deletePermissions.users?.includes(userId)) return true;
    
    // 检查角色权限
    if (deletePermissions.roles && userRoles.some(role => deletePermissions.roles!.includes(role))) {
      return true;
    }
    
    return false;
  }

  /**
   * 检查执行条件
   * @param context 执行上下文
   * @param conditions 条件列表
   * @returns 是否满足条件
   */
  private checkExecuteConditions(context: any, conditions?: any[]): boolean {
    if (!conditions || conditions.length === 0) return true;
    
    return conditions.every(condition => {
      const value = this.getValueFromContext(context, condition.field);
      return this.evaluateCondition(value, condition.operator, condition.value);
    });
  }

  /**
   * 从上下文获取值
   * @param context 上下文
   * @param field 字段路径
   * @returns 字段值
   */
  private getValueFromContext(context: any, field: string): any {
    if (!context) return undefined;
    
    const parts = field.split('.');
    let value = context;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * 评估条件
   * @param value 实际值
   * @param operator 操作符
   * @param expectedValue 期望值
   * @returns 是否满足条件
   */
  private evaluateCondition(value: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'eq': return value === expectedValue;
      case 'ne': return value !== expectedValue;
      case 'gt': return value > expectedValue;
      case 'gte': return value >= expectedValue;
      case 'lt': return value < expectedValue;
      case 'lte': return value <= expectedValue;
      case 'in': return Array.isArray(expectedValue) && expectedValue.includes(value);
      case 'nin': return Array.isArray(expectedValue) && !expectedValue.includes(value);
      case 'contains': return typeof value === 'string' && value.includes(expectedValue);
      case 'startsWith': return typeof value === 'string' && value.startsWith(expectedValue);
      case 'endsWith': return typeof value === 'string' && value.endsWith(expectedValue);
      default: return false;
    }
  }

  /**
   * 激活工作流
   */
  activate(): void {
    this.isActive = true;
    this.status = 'active';
  }

  /**
   * 停用工作流
   */
  deactivate(): void {
    this.isActive = false;
    this.status = 'inactive';
  }

  /**
   * 归档工作流
   */
  archive(): void {
    this.status = 'archived';
    this.isActive = false;
  }

  /**
   * 删除工作流
   */
  markAsDeleted(): void {
    this.status = 'deleted';
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
   * 更新执行统计
   * @param status 执行状态
   * @param duration 执行时间
   */
  updateExecutionStats(status: 'successful' | 'failed' | 'cancelled', duration?: number): void {
    if (!this.statistics) {
      this.statistics = {};
    }
    
    if (!this.statistics.executions) {
      this.statistics.executions = {
        total: 0,
        successful: 0,
        failed: 0,
        running: 0,
        cancelled: 0,
      };
    }
    
    this.statistics.executions.total += 1;
    this.statistics.executions[status] += 1;
    
    // 更新性能统计
    if (duration !== undefined) {
      if (!this.statistics.performance) {
        this.statistics.performance = {
          averageDuration: duration,
          minDuration: duration,
          maxDuration: duration,
          lastDuration: duration,
        };
      } else {
        const perf = this.statistics.performance;
        const total = this.statistics.executions.total;
        
        perf.averageDuration = ((perf.averageDuration * (total - 1)) + duration) / total;
        perf.minDuration = Math.min(perf.minDuration, duration);
        perf.maxDuration = Math.max(perf.maxDuration, duration);
        perf.lastDuration = duration;
      }
    }
    
    // 更新使用统计
    if (!this.statistics.usage) {
      this.statistics.usage = {
        executionCount: 0,
        uniqueUsers: 0,
      };
    }
    
    this.statistics.usage.lastExecutedAt = new Date();
    this.statistics.usage.executionCount += 1;
  }

  /**
   * 验证工作流定义
   * @returns 验证结果
   */
  validateDefinition(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.definition) {
      errors.push('工作流定义不能为空');
      return { valid: false, errors };
    }
    
    const { nodes, edges } = this.definition;
    
    // 验证节点
    if (!nodes || nodes.length === 0) {
      errors.push('工作流必须包含至少一个节点');
    } else {
      const nodeIds = new Set<string>();
      let hasStart = false;
      let hasEnd = false;
      
      for (const node of nodes) {
        // 检查节点ID唯一性
        if (nodeIds.has(node.id)) {
          errors.push(`节点ID重复: ${node.id}`);
        }
        nodeIds.add(node.id);
        
        // 检查必需字段
        if (!node.name || node.name.trim().length === 0) {
          errors.push(`节点 ${node.id} 缺少名称`);
        }
        
        // 检查节点类型
        if (node.type === 'start') hasStart = true;
        if (node.type === 'end') hasEnd = true;
        
        // 验证节点配置
        this.validateNodeConfig(node, errors);
      }
      
      if (!hasStart) {
        errors.push('工作流必须包含一个开始节点');
      }
      
      if (!hasEnd) {
        errors.push('工作流必须包含一个结束节点');
      }
    }
    
    // 验证连接
    if (edges) {
      const edgeIds = new Set<string>();
      
      for (const edge of edges) {
        // 检查连接ID唯一性
        if (edgeIds.has(edge.id)) {
          errors.push(`连接ID重复: ${edge.id}`);
        }
        edgeIds.add(edge.id);
        
        // 检查源节点和目标节点是否存在
        const sourceExists = nodes?.some(n => n.id === edge.source);
        const targetExists = nodes?.some(n => n.id === edge.target);
        
        if (!sourceExists) {
          errors.push(`连接 ${edge.id} 的源节点 ${edge.source} 不存在`);
        }
        
        if (!targetExists) {
          errors.push(`连接 ${edge.id} 的目标节点 ${edge.target} 不存在`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证节点配置
   * @param node 节点
   * @param errors 错误列表
   */
  private validateNodeConfig(node: any, errors: string[]): void {
    const config = node.config;
    if (!config) return;
    
    switch (node.type) {
      case 'task':
        if (config.task && !config.task.assignee && config.task.assigneeType !== 'auto') {
          errors.push(`任务节点 ${node.id} 缺少执行人配置`);
        }
        break;
        
      case 'decision':
        if (config.decision && (!config.decision.conditions || config.decision.conditions.length === 0)) {
          errors.push(`决策节点 ${node.id} 缺少条件配置`);
        }
        break;
        
      case 'notification':
        if (config.notification && (!config.notification.recipients || config.notification.recipients.length === 0)) {
          errors.push(`通知节点 ${node.id} 缺少接收人配置`);
        }
        break;
        
      case 'approval':
        if (config.approval && (!config.approval.approvers || config.approval.approvers.length === 0)) {
          errors.push(`审批节点 ${node.id} 缺少审批人配置`);
        }
        break;
        
      case 'script':
        if (config.script && (!config.script.code || config.script.code.trim().length === 0)) {
          errors.push(`脚本节点 ${node.id} 缺少代码配置`);
        }
        break;
        
      case 'api':
        if (config.api && (!config.api.url || config.api.url.trim().length === 0)) {
          errors.push(`API节点 ${node.id} 缺少URL配置`);
        }
        break;
        
      case 'condition':
        if (config.condition && (!config.condition.expression || config.condition.expression.trim().length === 0)) {
          errors.push(`条件节点 ${node.id} 缺少表达式配置`);
        }
        break;
    }
  }

  /**
   * 验证工作流数据
   * @param data 工作流数据
   * @returns 验证结果
   */
  static validate(data: Partial<Workflow>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('工作流名称不能为空');
    }
    
    if (data.name && data.name.length > 100) {
      errors.push('工作流名称长度不能超过100个字符');
    }
    
    if (!data.type) {
      errors.push('工作流类型不能为空');
    }
    
    if (!data.category || data.category.trim().length === 0) {
      errors.push('工作流分类不能为空');
    }
    
    if (!data.creatorId || data.creatorId.trim().length === 0) {
      errors.push('创建者ID不能为空');
    }
    
    if (data.version && !/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(data.version)) {
      errors.push('版本号格式无效');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建工作流实例
   * @param data 工作流数据
   * @returns 工作流实例
   */
  static create(data: {
    name: string;
    description?: string;
    type: Workflow['type'];
    category: string;
    creatorId: string;
    projectId?: string;
    isTemplate?: boolean;
    definition?: Workflow['definition'];
    triggers?: Workflow['triggers'];
    permissions?: Workflow['permissions'];
    tags?: string[];
  }): Partial<Workflow> {
    return {
      name: data.name,
      description: data.description,
      type: data.type,
      category: data.category,
      status: 'draft',
      isActive: false,
      isTemplate: data.isTemplate || false,
      version: '1.0.0',
      creatorId: data.creatorId,
      projectId: data.projectId,
      definition: data.definition,
      triggers: data.triggers,
      permissions: data.permissions,
      tags: data.tags,
      statistics: {
        executions: {
          total: 0,
          successful: 0,
          failed: 0,
          running: 0,
          cancelled: 0,
        },
        usage: {
          executionCount: 0,
          uniqueUsers: 0,
        },
      },
    };
  }
}