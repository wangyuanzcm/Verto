import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { RequirementStatus, RequirementPriority, RequirementType } from '../../../common/enums';
import { Project } from '../../project/entities/project.entity';
import { User } from '../../user/entities/user.entity';
import { RequirementComment } from './requirement-comment.entity';
import { RequirementHistory } from './requirement-history.entity';
import { RequirementAttachment } from './requirement-attachment.entity';
import { RequirementCustomFields } from './requirement-custom-fields.entity';
import { RequirementDependencies } from './requirement-dependencies.entity';

/**
 * 需求实体
 */
@Entity('requirements')
@Index(['projectId'])
@Index(['assigneeId'])
@Index(['reporterId'])
@Index(['status'])
@Index(['priority'])
@Index(['type'])
@Index(['parentId'])
@Index(['code'], { unique: true })
export class Requirement extends BaseEntity {
  @ApiProperty({ description: '需求编号' })
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '需求编号',
  })
  code: string;

  @ApiProperty({ description: '需求标题' })
  @Column({
    type: 'varchar',
    length: 200,
    comment: '需求标题',
  })
  title: string;

  @ApiProperty({ description: '需求描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '需求描述',
  })
  description?: string;

  @ApiProperty({ description: '需求详细内容', required: false })
  @Column({
    type: 'longtext',
    nullable: true,
    comment: '需求详细内容（富文本）',
  })
  content?: string;

  @ApiProperty({ description: '需求类型', enum: RequirementType })
  @Column({
    type: 'enum',
    enum: RequirementType,
    default: RequirementType.FUNCTIONAL,
    comment: '需求类型',
  })
  type: RequirementType;

  @ApiProperty({ description: '需求状态', enum: RequirementStatus })
  @Column({
    type: 'enum',
    enum: RequirementStatus,
    default: RequirementStatus.DRAFT,
    comment: '需求状态',
  })
  status: RequirementStatus;

  @ApiProperty({ description: '需求优先级', enum: RequirementPriority })
  @Column({
    type: 'enum',
    enum: RequirementPriority,
    default: RequirementPriority.MEDIUM,
    comment: '需求优先级',
  })
  priority: RequirementPriority;

  @ApiProperty({ description: '项目ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '项目ID',
  })
  projectId: string;

  @ApiProperty({ description: '报告人ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '报告人ID',
  })
  reporterId: string;

  @ApiProperty({ description: '负责人ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '负责人ID',
  })
  assigneeId?: string;

  @ApiProperty({ description: '父需求ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '父需求ID',
  })
  parentId?: string;

  @ApiProperty({ description: '预估工时（小时）', required: false })
  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
    comment: '预估工时（小时）',
  })
  estimatedHours?: number;

  @ApiProperty({ description: '实际工时（小时）', required: false })
  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
    comment: '实际工时（小时）',
  })
  actualHours?: number;

  @ApiProperty({ description: '计划开始时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '计划开始时间',
  })
  plannedStartAt?: Date;

  @ApiProperty({ description: '计划结束时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '计划结束时间',
  })
  plannedEndAt?: Date;

  @ApiProperty({ description: '实际开始时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '实际开始时间',
  })
  actualStartAt?: Date;

  @ApiProperty({ description: '实际结束时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '实际结束时间',
  })
  actualEndAt?: Date;

  @ApiProperty({ description: '需求标签', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '需求标签',
  })
  tags?: string[];

  @ApiProperty({ description: '验收标准', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '验收标准',
  })
  acceptanceCriteria?: string;

  @ApiProperty({ description: '业务价值评分', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '业务价值评分（1-10）',
  })
  businessValue?: number;

  @ApiProperty({ description: '技术复杂度评分', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '技术复杂度评分（1-10）',
  })
  technicalComplexity?: number;

  @ApiProperty({ description: '风险评分', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '风险评分（1-10）',
  })
  riskScore?: number;

  @ApiProperty({ description: '进度百分比' })
  @Column({
    type: 'int',
    default: 0,
    comment: '进度百分比（0-100）',
  })
  progress: number;

  @ApiProperty({ description: '需求来源', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '需求来源',
  })
  source?: string;

  @ApiProperty({ description: '需求版本' })
  @Column({
    type: 'varchar',
    length: 20,
    default: '1.0',
    comment: '需求版本',
  })
  version: string;

  @ApiProperty({ description: '是否已归档' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否已归档',
  })
  isArchived: boolean;

  // 自定义字段关联已移至 RequirementCustomFields 实体

  // 依赖关系关联已移至 RequirementDependencies 实体

  // 关联关系
  @ApiProperty({ description: '所属项目', type: () => Project })
  @ManyToOne(() => Project, project => project.requirements)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ApiProperty({ description: '报告人', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  @ApiProperty({ description: '负责人', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigneeId' })
  assignee?: User;

  @ApiProperty({ description: '父需求', type: () => Requirement })
  @ManyToOne(() => Requirement, requirement => requirement.children)
  @JoinColumn({ name: 'parentId' })
  parent?: Requirement;

  @ApiProperty({ description: '子需求', type: () => [Requirement] })
  @OneToMany(() => Requirement, requirement => requirement.parent)
  children: Requirement[];

  @ApiProperty({ description: '需求评论', type: () => [RequirementComment] })
  @OneToMany(() => RequirementComment, comment => comment.requirement)
  comments: RequirementComment[];

  @ApiProperty({ description: '需求附件', type: () => [RequirementAttachment] })
  @OneToMany(() => RequirementAttachment, attachment => attachment.requirement)
  attachments: RequirementAttachment[];

  // 关联拆分实体
  @ApiProperty({ description: '自定义字段', type: () => RequirementCustomFields, required: false })
  @OneToOne(() => RequirementCustomFields, customFields => customFields.requirement, {
    cascade: true,
    eager: false,
  })
  customFields?: RequirementCustomFields;

  @ApiProperty({ description: '依赖关系', type: () => RequirementDependencies, required: false })
  @OneToOne(() => RequirementDependencies, dependencies => dependencies.requirement, {
    cascade: true,
    eager: false,
  })
  dependencies?: RequirementDependencies;

  @ApiProperty({ description: '需求历史', type: () => [RequirementHistory] })
  @OneToMany(() => RequirementHistory, history => history.requirement)
  histories: RequirementHistory[];

  @ApiProperty({ description: '关注者', type: () => [User] })
  @ManyToMany(() => User)
  @JoinTable({
    name: 'requirement_watchers',
    joinColumn: { name: 'requirementId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  watchers: User[];

  /**
   * 检查是否可以编辑
   * @param userId 用户ID
   * @returns 是否可以编辑
   */
  canEdit(userId: string): boolean {
    return this.reporterId === userId || this.assigneeId === userId;
  }

  /**
   * 检查是否可以删除
   * @param userId 用户ID
   * @returns 是否可以删除
   */
  canDelete(userId: string): boolean {
    return this.reporterId === userId && this.status === RequirementStatus.DRAFT;
  }

  /**
   * 检查是否可以分配
   * @returns 是否可以分配
   */
  canAssign(): boolean {
    return [RequirementStatus.DRAFT, RequirementStatus.OPEN, RequirementStatus.IN_PROGRESS].includes(this.status);
  }

  /**
   * 检查是否可以开始
   * @returns 是否可以开始
   */
  canStart(): boolean {
    return [RequirementStatus.OPEN, RequirementStatus.REOPENED].includes(this.status);
  }

  /**
   * 检查是否可以完成
   * @returns 是否可以完成
   */
  canComplete(): boolean {
    return this.status === RequirementStatus.IN_PROGRESS;
  }

  /**
   * 检查是否可以关闭
   * @returns 是否可以关闭
   */
  canClose(): boolean {
    return [RequirementStatus.RESOLVED, RequirementStatus.VERIFIED].includes(this.status);
  }

  /**
   * 检查是否可以重新打开
   * @returns 是否可以重新打开
   */
  canReopen(): boolean {
    return [RequirementStatus.CLOSED, RequirementStatus.REJECTED].includes(this.status);
  }

  /**
   * 检查是否逾期
   * @returns 是否逾期
   */
  isOverdue(): boolean {
    if (!this.plannedEndAt) return false;
    
    const now = new Date();
    return now > this.plannedEndAt && ![RequirementStatus.CLOSED, RequirementStatus.RESOLVED].includes(this.status);
  }

  /**
   * 检查是否即将逾期
   * @param days 天数阈值
   * @returns 是否即将逾期
   */
  isDueSoon(days: number = 3): boolean {
    if (!this.plannedEndAt) return false;
    
    const now = new Date();
    const dueDate = new Date(this.plannedEndAt);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= days && diffDays > 0 && ![RequirementStatus.CLOSED, RequirementStatus.RESOLVED].includes(this.status);
  }

  /**
   * 计算剩余天数
   * @returns 剩余天数
   */
  getRemainingDays(): number | null {
    if (!this.plannedEndAt) return null;
    
    const now = new Date();
    const dueDate = new Date(this.plannedEndAt);
    const diffTime = dueDate.getTime() - now.getTime();
    
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 计算工期（天数）
   * @returns 工期天数
   */
  getDuration(): number | null {
    if (!this.plannedStartAt || !this.plannedEndAt) return null;
    
    const startDate = new Date(this.plannedStartAt);
    const endDate = new Date(this.plannedEndAt);
    const diffTime = endDate.getTime() - startDate.getTime();
    
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 计算实际工期
   * @returns 实际工期天数
   */
  getActualDuration(): number | null {
    if (!this.actualStartAt || !this.actualEndAt) return null;
    
    const startDate = new Date(this.actualStartAt);
    const endDate = new Date(this.actualEndAt);
    const diffTime = endDate.getTime() - startDate.getTime();
    
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 计算工时偏差
   * @returns 工时偏差百分比
   */
  getHoursVariance(): number | null {
    if (!this.estimatedHours || !this.actualHours) return null;
    
    return ((this.actualHours - this.estimatedHours) / this.estimatedHours) * 100;
  }

  /**
   * 获取优先级权重
   * @returns 优先级权重
   */
  getPriorityWeight(): number {
    const weights = {
      [RequirementPriority.CRITICAL]: 5,
      [RequirementPriority.HIGH]: 4,
      [RequirementPriority.MEDIUM]: 3,
      [RequirementPriority.LOW]: 2,
      [RequirementPriority.TRIVIAL]: 1,
    };
    
    return weights[this.priority] || 3;
  }

  /**
   * 计算需求评分
   * @returns 需求评分
   */
  getScore(): number {
    let score = 0;
    
    // 业务价值权重 40%
    if (this.businessValue) {
      score += this.businessValue * 0.4;
    }
    
    // 优先级权重 30%
    score += this.getPriorityWeight() * 2 * 0.3;
    
    // 技术复杂度权重 20%（复杂度越低分数越高）
    if (this.technicalComplexity) {
      score += (11 - this.technicalComplexity) * 0.2;
    }
    
    // 风险评分权重 10%（风险越低分数越高）
    if (this.riskScore) {
      score += (11 - this.riskScore) * 0.1;
    }
    
    return Math.round(score * 10) / 10;
  }

  /**
   * 检查是否有子需求
   * @returns 是否有子需求
   */
  hasChildren(): boolean {
    return this.children && this.children.length > 0;
  }

  /**
   * 检查是否为子需求
   * @returns 是否为子需求
   */
  isChild(): boolean {
    return !!this.parentId;
  }

  /**
   * 获取需求层级
   * @returns 层级深度
   */
  getLevel(): number {
    let level = 0;
    let current = this.parent;
    
    while (current) {
      level++;
      current = current.parent;
    }
    
    return level;
  }

  /**
   * 获取根需求
   * @returns 根需求
   */
  getRoot(): Requirement {
    let current: Requirement = this;
    
    while (current.parent) {
      current = current.parent;
    }
    
    return current;
  }

  /**
   * 检查是否被阻塞
   * @returns 是否被阻塞
   */
  isBlocked(): boolean {
    return this.dependencies?.blockedBy && this.dependencies.blockedBy.length > 0;
  }

  /**
   * 检查是否阻塞其他需求
   * @returns 是否阻塞其他需求
   */
  isBlocking(): boolean {
    return this.dependencies?.blocks && this.dependencies.blocks.length > 0;
  }

  /**
   * 添加依赖关系
   * @param type 依赖类型
   * @param requirementId 需求ID
   */
  addDependency(type: 'blocks' | 'blockedBy' | 'relates', requirementId: string): void {
    if (!this.dependencies) {
      this.dependencies = { blocks: [], blockedBy: [], relates: [] };
    }
    
    if (!this.dependencies[type].includes(requirementId)) {
      this.dependencies[type].push(requirementId);
    }
  }

  /**
   * 移除依赖关系
   * @param type 依赖类型
   * @param requirementId 需求ID
   */
  removeDependency(type: 'blocks' | 'blockedBy' | 'relates', requirementId: string): void {
    if (this.dependencies && this.dependencies[type]) {
      this.dependencies[type] = this.dependencies[type].filter(id => id !== requirementId);
    }
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
   * 设置自定义字段
   * @param key 字段名
   * @param value 字段值
   */
  setCustomField(key: string, value: any): void {
    if (!this.customFields) {
      this.customFields = {};
    }
    
    this.customFields[key] = value;
  }

  /**
   * 获取自定义字段
   * @param key 字段名
   * @returns 字段值
   */
  getCustomField(key: string): any {
    return this.customFields?.[key];
  }

  /**
   * 移除自定义字段
   * @param key 字段名
   */
  removeCustomField(key: string): void {
    if (this.customFields) {
      delete this.customFields[key];
    }
  }

  /**
   * 开始需求
   */
  start(): void {
    if (this.canStart()) {
      this.status = RequirementStatus.IN_PROGRESS;
      this.actualStartAt = new Date();
    }
  }

  /**
   * 完成需求
   */
  complete(): void {
    if (this.canComplete()) {
      this.status = RequirementStatus.RESOLVED;
      this.actualEndAt = new Date();
      this.progress = 100;
    }
  }

  /**
   * 关闭需求
   */
  close(): void {
    if (this.canClose()) {
      this.status = RequirementStatus.CLOSED;
      if (!this.actualEndAt) {
        this.actualEndAt = new Date();
      }
    }
  }

  /**
   * 重新打开需求
   */
  reopen(): void {
    if (this.canReopen()) {
      this.status = RequirementStatus.REOPENED;
      this.actualEndAt = null;
      this.progress = 0;
    }
  }

  /**
   * 拒绝需求
   */
  reject(): void {
    this.status = RequirementStatus.REJECTED;
    this.actualEndAt = new Date();
  }

  /**
   * 归档需求
   */
  archive(): void {
    this.isArchived = true;
  }

  /**
   * 取消归档
   */
  unarchive(): void {
    this.isArchived = false;
  }

  /**
   * 生成需求编号
   * @param projectCode 项目代码
   * @param sequence 序号
   * @returns 需求编号
   */
  static generateCode(projectCode: string, sequence: number): string {
    return `${projectCode}-REQ-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * 验证需求数据
   * @param data 需求数据
   * @returns 验证结果
   */
  static validate(data: Partial<Requirement>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.title || data.title.trim().length === 0) {
      errors.push('需求标题不能为空');
    }
    
    if (data.title && data.title.length > 200) {
      errors.push('需求标题不能超过200个字符');
    }
    
    if (!data.projectId) {
      errors.push('项目ID不能为空');
    }
    
    if (!data.reporterId) {
      errors.push('报告人ID不能为空');
    }
    
    if (data.businessValue && (data.businessValue < 1 || data.businessValue > 10)) {
      errors.push('业务价值评分必须在1-10之间');
    }
    
    if (data.technicalComplexity && (data.technicalComplexity < 1 || data.technicalComplexity > 10)) {
      errors.push('技术复杂度评分必须在1-10之间');
    }
    
    if (data.riskScore && (data.riskScore < 1 || data.riskScore > 10)) {
      errors.push('风险评分必须在1-10之间');
    }
    
    if (data.progress && (data.progress < 0 || data.progress > 100)) {
      errors.push('进度百分比必须在0-100之间');
    }
    
    if (data.plannedStartAt && data.plannedEndAt && data.plannedStartAt > data.plannedEndAt) {
      errors.push('计划开始时间不能晚于计划结束时间');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}