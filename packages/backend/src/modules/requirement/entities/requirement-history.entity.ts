import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Requirement } from './requirement.entity';
import { User } from '../../user/entities/user.entity';

/**
 * 需求历史记录实体
 */
@Entity('requirement_histories')
@Index(['requirementId'])
@Index(['operatorId'])
@Index(['action'])
@Index(['createdAt'])
export class RequirementHistory extends BaseEntity {
  @ApiProperty({ description: '操作类型' })
  @Column({
    type: 'varchar',
    length: 50,
    comment: '操作类型（create, update, delete, status_change, assign, etc.）',
  })
  action: string;

  @ApiProperty({ description: '操作描述' })
  @Column({
    type: 'varchar',
    length: 500,
    comment: '操作描述',
  })
  description: string;

  @ApiProperty({ description: '需求ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '需求ID',
  })
  requirementId: string;

  @ApiProperty({ description: '操作者ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '操作者ID',
  })
  operatorId: string;

  @ApiProperty({ description: '变更前的值', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '变更前的值',
  })
  oldValues?: Record<string, any>;

  @ApiProperty({ description: '变更后的值', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '变更后的值',
  })
  newValues?: Record<string, any>;

  @ApiProperty({ description: '变更的字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '变更的字段列表',
  })
  changedFields?: string[];

  @ApiProperty({ description: '操作来源', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '操作来源（web, api, mobile, system, etc.）',
  })
  source?: string;

  @ApiProperty({ description: '用户代理', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '用户代理信息',
  })
  userAgent?: string;

  @ApiProperty({ description: 'IP地址', required: false })
  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
    comment: 'IP地址',
  })
  ipAddress?: string;

  @ApiProperty({ description: '会话ID', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '会话ID',
  })
  sessionId?: string;

  @ApiProperty({ description: '请求ID', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '请求ID（用于追踪）',
  })
  requestId?: string;

  @ApiProperty({ description: '操作耗时（毫秒）', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '操作耗时（毫秒）',
  })
  duration?: number;

  @ApiProperty({ description: '是否为系统操作' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为系统自动操作',
  })
  isSystemAction: boolean;

  @ApiProperty({ description: '操作结果', required: false })
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '操作结果（success, failed, partial）',
  })
  result?: string;

  @ApiProperty({ description: '错误信息', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '错误信息（如果操作失败）',
  })
  errorMessage?: string;

  @ApiProperty({ description: '额外数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '额外的操作数据',
  })
  extraData?: Record<string, any>;

  @ApiProperty({ description: '操作标签', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '操作标签',
  })
  tags?: string[];

  @ApiProperty({ description: '关联的实体', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '关联的实体信息',
  })
  relatedEntities?: {
    type: string;
    id: string;
    name?: string;
  }[];

  // 关联关系
  @ApiProperty({ description: '所属需求', type: () => Requirement })
  @ManyToOne(() => Requirement, requirement => requirement.histories)
  @JoinColumn({ name: 'requirementId' })
  requirement: Requirement;

  @ApiProperty({ description: '操作者', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'operatorId' })
  operator: User;

  /**
   * 检查是否为创建操作
   * @returns 是否为创建操作
   */
  isCreateAction(): boolean {
    return this.action === 'create';
  }

  /**
   * 检查是否为更新操作
   * @returns 是否为更新操作
   */
  isUpdateAction(): boolean {
    return this.action === 'update';
  }

  /**
   * 检查是否为删除操作
   * @returns 是否为删除操作
   */
  isDeleteAction(): boolean {
    return this.action === 'delete';
  }

  /**
   * 检查是否为状态变更操作
   * @returns 是否为状态变更操作
   */
  isStatusChangeAction(): boolean {
    return this.action === 'status_change';
  }

  /**
   * 检查是否为分配操作
   * @returns 是否为分配操作
   */
  isAssignAction(): boolean {
    return this.action === 'assign';
  }

  /**
   * 检查操作是否成功
   * @returns 操作是否成功
   */
  isSuccessful(): boolean {
    return this.result === 'success' || !this.result;
  }

  /**
   * 检查操作是否失败
   * @returns 操作是否失败
   */
  isFailed(): boolean {
    return this.result === 'failed';
  }

  /**
   * 检查是否有字段变更
   * @returns 是否有字段变更
   */
  hasFieldChanges(): boolean {
    return this.changedFields && this.changedFields.length > 0;
  }

  /**
   * 检查特定字段是否发生变更
   * @param fieldName 字段名
   * @returns 字段是否变更
   */
  hasFieldChanged(fieldName: string): boolean {
    return this.changedFields ? this.changedFields.includes(fieldName) : false;
  }

  /**
   * 获取字段的旧值
   * @param fieldName 字段名
   * @returns 旧值
   */
  getOldValue(fieldName: string): any {
    return this.oldValues?.[fieldName];
  }

  /**
   * 获取字段的新值
   * @param fieldName 字段名
   * @returns 新值
   */
  getNewValue(fieldName: string): any {
    return this.newValues?.[fieldName];
  }

  /**
   * 获取字段变更的描述
   * @param fieldName 字段名
   * @returns 变更描述
   */
  getFieldChangeDescription(fieldName: string): string | null {
    if (!this.hasFieldChanged(fieldName)) {
      return null;
    }
    
    const oldValue = this.getOldValue(fieldName);
    const newValue = this.getNewValue(fieldName);
    
    return `${fieldName}: ${oldValue} → ${newValue}`;
  }

  /**
   * 获取所有字段变更的描述
   * @returns 变更描述列表
   */
  getAllFieldChangesDescription(): string[] {
    if (!this.hasFieldChanges()) {
      return [];
    }
    
    return this.changedFields!.map(field => this.getFieldChangeDescription(field)!).filter(Boolean);
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
   * 检查是否包含标签
   * @param tag 标签
   * @returns 是否包含
   */
  hasTag(tag: string): boolean {
    return this.tags ? this.tags.includes(tag) : false;
  }

  /**
   * 添加关联实体
   * @param entity 实体信息
   */
  addRelatedEntity(entity: { type: string; id: string; name?: string }): void {
    if (!this.relatedEntities) {
      this.relatedEntities = [];
    }
    
    // 检查是否已存在
    const exists = this.relatedEntities.some(
      e => e.type === entity.type && e.id === entity.id
    );
    
    if (!exists) {
      this.relatedEntities.push(entity);
    }
  }

  /**
   * 移除关联实体
   * @param type 实体类型
   * @param id 实体ID
   */
  removeRelatedEntity(type: string, id: string): void {
    if (this.relatedEntities) {
      this.relatedEntities = this.relatedEntities.filter(
        e => !(e.type === type && e.id === id)
      );
    }
  }

  /**
   * 设置额外数据
   * @param key 键
   * @param value 值
   */
  setExtraData(key: string, value: any): void {
    if (!this.extraData) {
      this.extraData = {};
    }
    
    this.extraData[key] = value;
  }

  /**
   * 获取额外数据
   * @param key 键
   * @returns 值
   */
  getExtraData(key: string): any {
    return this.extraData?.[key];
  }

  /**
   * 移除额外数据
   * @param key 键
   */
  removeExtraData(key: string): void {
    if (this.extraData) {
      delete this.extraData[key];
    }
  }

  /**
   * 获取操作的完整信息
   * @returns 操作信息
   */
  getInfo(): {
    id: string;
    action: string;
    description: string;
    operatorId: string;
    isSystemAction: boolean;
    isSuccessful: boolean;
    hasFieldChanges: boolean;
    changedFieldsCount: number;
    source?: string;
    result?: string;
    duration?: number;
    createdAt: Date;
  } {
    return {
      id: this.id,
      action: this.action,
      description: this.description,
      operatorId: this.operatorId,
      isSystemAction: this.isSystemAction,
      isSuccessful: this.isSuccessful(),
      hasFieldChanges: this.hasFieldChanges(),
      changedFieldsCount: this.changedFields?.length || 0,
      source: this.source,
      result: this.result,
      duration: this.duration,
      createdAt: this.createdAt,
    };
  }

  /**
   * 创建历史记录
   * @param data 历史记录数据
   * @returns 历史记录实例
   */
  static create(data: {
    action: string;
    description: string;
    requirementId: string;
    operatorId: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    changedFields?: string[];
    source?: string;
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
    requestId?: string;
    isSystemAction?: boolean;
    extraData?: Record<string, any>;
  }): RequirementHistory {
    const history = new RequirementHistory();
    
    history.action = data.action;
    history.description = data.description;
    history.requirementId = data.requirementId;
    history.operatorId = data.operatorId;
    history.oldValues = data.oldValues;
    history.newValues = data.newValues;
    history.changedFields = data.changedFields;
    history.source = data.source;
    history.userAgent = data.userAgent;
    history.ipAddress = data.ipAddress;
    history.sessionId = data.sessionId;
    history.requestId = data.requestId;
    history.isSystemAction = data.isSystemAction || false;
    history.extraData = data.extraData;
    history.result = 'success';
    
    return history;
  }

  /**
   * 创建创建操作的历史记录
   * @param requirementId 需求ID
   * @param operatorId 操作者ID
   * @param values 创建的值
   * @param context 上下文信息
   * @returns 历史记录实例
   */
  static createForCreate(
    requirementId: string,
    operatorId: string,
    values: Record<string, any>,
    context?: {
      source?: string;
      userAgent?: string;
      ipAddress?: string;
      sessionId?: string;
      requestId?: string;
    }
  ): RequirementHistory {
    return RequirementHistory.create({
      action: 'create',
      description: '创建需求',
      requirementId,
      operatorId,
      newValues: values,
      ...context,
    });
  }

  /**
   * 创建更新操作的历史记录
   * @param requirementId 需求ID
   * @param operatorId 操作者ID
   * @param oldValues 旧值
   * @param newValues 新值
   * @param changedFields 变更字段
   * @param context 上下文信息
   * @returns 历史记录实例
   */
  static createForUpdate(
    requirementId: string,
    operatorId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    changedFields: string[],
    context?: {
      source?: string;
      userAgent?: string;
      ipAddress?: string;
      sessionId?: string;
      requestId?: string;
    }
  ): RequirementHistory {
    const description = `更新需求 (${changedFields.join(', ')})`;
    
    return RequirementHistory.create({
      action: 'update',
      description,
      requirementId,
      operatorId,
      oldValues,
      newValues,
      changedFields,
      ...context,
    });
  }

  /**
   * 创建状态变更操作的历史记录
   * @param requirementId 需求ID
   * @param operatorId 操作者ID
   * @param oldStatus 旧状态
   * @param newStatus 新状态
   * @param context 上下文信息
   * @returns 历史记录实例
   */
  static createForStatusChange(
    requirementId: string,
    operatorId: string,
    oldStatus: string,
    newStatus: string,
    context?: {
      source?: string;
      userAgent?: string;
      ipAddress?: string;
      sessionId?: string;
      requestId?: string;
    }
  ): RequirementHistory {
    const description = `状态变更: ${oldStatus} → ${newStatus}`;
    
    return RequirementHistory.create({
      action: 'status_change',
      description,
      requirementId,
      operatorId,
      oldValues: { status: oldStatus },
      newValues: { status: newStatus },
      changedFields: ['status'],
      ...context,
    });
  }

  /**
   * 创建分配操作的历史记录
   * @param requirementId 需求ID
   * @param operatorId 操作者ID
   * @param oldAssigneeId 旧负责人ID
   * @param newAssigneeId 新负责人ID
   * @param context 上下文信息
   * @returns 历史记录实例
   */
  static createForAssign(
    requirementId: string,
    operatorId: string,
    oldAssigneeId: string | null,
    newAssigneeId: string | null,
    context?: {
      source?: string;
      userAgent?: string;
      ipAddress?: string;
      sessionId?: string;
      requestId?: string;
    }
  ): RequirementHistory {
    let description: string;
    
    if (!oldAssigneeId && newAssigneeId) {
      description = '分配负责人';
    } else if (oldAssigneeId && !newAssigneeId) {
      description = '取消分配';
    } else {
      description = '重新分配负责人';
    }
    
    return RequirementHistory.create({
      action: 'assign',
      description,
      requirementId,
      operatorId,
      oldValues: { assigneeId: oldAssigneeId },
      newValues: { assigneeId: newAssigneeId },
      changedFields: ['assigneeId'],
      ...context,
    });
  }

  /**
   * 验证历史记录数据
   * @param data 历史记录数据
   * @returns 验证结果
   */
  static validate(data: Partial<RequirementHistory>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.action || data.action.trim().length === 0) {
      errors.push('操作类型不能为空');
    }
    
    if (!data.description || data.description.trim().length === 0) {
      errors.push('操作描述不能为空');
    }
    
    if (!data.requirementId) {
      errors.push('需求ID不能为空');
    }
    
    if (!data.operatorId) {
      errors.push('操作者ID不能为空');
    }
    
    if (data.description && data.description.length > 500) {
      errors.push('操作描述不能超过500个字符');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}