import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProjectStatus, ProjectType, ProjectPriority, ProjectVisibility } from '../../../common/enums';
import { User } from '../../user/entities/user.entity';
import { UserProject } from '../../user/entities/user-project.entity';
import { Requirement } from '../../requirement/entities/requirement.entity';
import { Prototype } from '../../prototype/entities/prototype.entity';
import { Material } from '../../material/entities/material.entity';
import { ProjectTemplate } from './project-template.entity';
import { ProjectTag } from './project-tag.entity';
import { ProjectConfig } from './project-config.entity';
import { ProjectSettings } from './project-settings.entity';
import { ProjectStatistics } from './project-statistics.entity';
import { ProjectMetadata } from './project-metadata.entity';

/**
 * 项目实体
 */
@Entity('projects')
@Index(['name'])
@Index(['code'], { unique: true })
@Index(['status'])
@Index(['type'])
@Index(['priority'])
@Index(['visibility'])
@Index(['ownerId'])
@Index(['templateId'])
export class Project extends BaseEntity {
  @ApiProperty({ description: '项目名称' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '项目名称',
  })
  name: string;

  @ApiProperty({ description: '项目代码' })
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '项目代码（唯一标识）',
  })
  code: string;

  @ApiProperty({ description: '项目描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '项目描述',
  })
  description?: string;

  @ApiProperty({ description: '项目状态', enum: ProjectStatus })
  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
    comment: '项目状态',
  })
  status: ProjectStatus;

  @ApiProperty({ description: '项目类型', enum: ProjectType })
  @Column({
    type: 'enum',
    enum: ProjectType,
    comment: '项目类型',
  })
  type: ProjectType;

  @ApiProperty({ description: '项目优先级', enum: ProjectPriority })
  @Column({
    type: 'enum',
    enum: ProjectPriority,
    default: ProjectPriority.MEDIUM,
    comment: '项目优先级',
  })
  priority: ProjectPriority;

  @ApiProperty({ description: '项目可见性', enum: ProjectVisibility })
  @Column({
    type: 'enum',
    enum: ProjectVisibility,
    default: ProjectVisibility.PRIVATE,
    comment: '项目可见性',
  })
  visibility: ProjectVisibility;

  @ApiProperty({ description: '项目所有者ID' })
  @Column({
    type: 'uuid',
    comment: '项目所有者ID',
  })
  ownerId: string;

  @ApiProperty({ description: '项目模板ID', required: false })
  @Column({
    type: 'uuid',
    nullable: true,
    comment: '项目模板ID',
  })
  templateId?: string;

  @ApiProperty({ description: '项目图标', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '项目图标URL',
  })
  icon?: string;

  @ApiProperty({ description: '项目封面', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '项目封面URL',
  })
  cover?: string;

  @ApiProperty({ description: '项目颜色', required: false })
  @Column({
    type: 'varchar',
    length: 7,
    nullable: true,
    comment: '项目颜色（十六进制）',
  })
  color?: string;

  @ApiProperty({ description: '开始时间', required: false })
  @Column({
    type: 'date',
    nullable: true,
    comment: '开始时间',
  })
  startDate?: Date;

  @ApiProperty({ description: '结束时间', required: false })
  @Column({
    type: 'date',
    nullable: true,
    comment: '结束时间',
  })
  endDate?: Date;

  @ApiProperty({ description: '计划开始时间', required: false })
  @Column({
    type: 'date',
    nullable: true,
    comment: '计划开始时间',
  })
  plannedStartDate?: Date;

  @ApiProperty({ description: '计划结束时间', required: false })
  @Column({
    type: 'date',
    nullable: true,
    comment: '计划结束时间',
  })
  plannedEndDate?: Date;

  @ApiProperty({ description: '实际开始时间', required: false })
  @Column({
    type: 'date',
    nullable: true,
    comment: '实际开始时间',
  })
  actualStartDate?: Date;

  @ApiProperty({ description: '实际结束时间', required: false })
  @Column({
    type: 'date',
    nullable: true,
    comment: '实际结束时间',
  })
  actualEndDate?: Date;

  @ApiProperty({ description: '项目预算', required: false })
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    comment: '项目预算',
  })
  budget?: number;

  @ApiProperty({ description: '已花费金额', required: false })
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '已花费金额',
  })
  spent: number;

  @ApiProperty({ description: '项目进度（0-100）' })
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: '项目进度（0-100）',
  })
  progress: number;

  @ApiProperty({ description: '团队规模', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '团队规模',
  })
  teamSize?: number;

  // 项目配置关联已移至 ProjectConfig 实体

  // 项目设置关联已移至 ProjectSettings 实体

  // 项目统计关联已移至 ProjectStatistics 实体

  // 项目元数据关联已移至 ProjectMetadata 实体

  @ApiProperty({ description: '最后活跃时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后活跃时间',
  })
  lastActiveAt?: Date;

  @ApiProperty({ description: '归档时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '归档时间',
  })
  archivedAt?: Date;

  @ApiProperty({ description: '归档原因', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '归档原因',
  })
  archiveReason?: string;

  // 关联关系
  @ApiProperty({ description: '项目所有者', type: () => User })
  @ManyToOne(() => User, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ApiProperty({ description: '项目模板', type: () => ProjectTemplate, required: false })
  @ManyToOne(() => ProjectTemplate, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'templateId' })
  template?: ProjectTemplate;

  @ApiProperty({ description: '项目成员关联', type: () => [UserProject] })
  @OneToMany(() => UserProject, userProject => userProject.project)
  userProjects: UserProject[];

  @ApiProperty({ description: '项目成员', type: () => [User] })
  @ManyToMany(() => User, user => user.projects)
  @JoinTable({
    name: 'user_projects',
    joinColumn: {
      name: 'projectId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  members: User[];

  @ApiProperty({ description: '项目需求', type: () => [Requirement] })
  @OneToMany(() => Requirement, requirement => requirement.project)
  requirements: Requirement[];

  @ApiProperty({ description: '项目原型', type: () => [Prototype] })
  @OneToMany(() => Prototype, prototype => prototype.project)
  prototypes: Prototype[];

  @ApiProperty({ description: '项目物料', type: () => [Material] })
  @OneToMany(() => Material, material => material.project)
  materials: Material[];

  @ApiProperty({ description: '项目标签', type: () => [ProjectTag] })
  @ManyToMany(() => ProjectTag, tag => tag.projects, {
    cascade: true,
  })
  @JoinTable({
    name: 'project_tag_relations',
    joinColumn: {
      name: 'projectId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tagId',
      referencedColumnName: 'id',
    },
  })
  tags: ProjectTag[];

  // 关联拆分实体
  @ApiProperty({ description: '项目配置', type: () => ProjectConfig, required: false })
  @OneToOne(() => ProjectConfig, config => config.project, {
    cascade: true,
  })
  config?: ProjectConfig;

  @ApiProperty({ description: '项目设置', type: () => ProjectSettings, required: false })
  @OneToOne(() => ProjectSettings, settings => settings.project, {
    cascade: true,
  })
  settings?: ProjectSettings;

  @ApiProperty({ description: '项目统计', type: () => ProjectStatistics, required: false })
  @OneToOne(() => ProjectStatistics, statistics => statistics.project, {
    cascade: true,
  })
  statistics?: ProjectStatistics;

  @ApiProperty({ description: '项目元数据', type: () => ProjectMetadata, required: false })
  @OneToOne(() => ProjectMetadata, metadata => metadata.project, {
    cascade: true,
  })
  metadata?: ProjectMetadata;

  /**
   * 检查用户是否为项目成员
   * @param userId 用户ID
   * @returns 是否为成员
   */
  hasMember(userId: string): boolean {
    return this.members?.some(member => member.id === userId) || false;
  }

  /**
   * 检查用户是否为项目所有者
   * @param userId 用户ID
   * @returns 是否为所有者
   */
  isOwner(userId: string): boolean {
    return this.ownerId === userId;
  }

  /**
   * 检查项目是否活跃
   * @returns 是否活跃
   */
  isActive(): boolean {
    return this.status === ProjectStatus.ACTIVE;
  }

  /**
   * 检查项目是否已完成
   * @returns 是否已完成
   */
  isCompleted(): boolean {
    return this.status === ProjectStatus.COMPLETED;
  }

  /**
   * 检查项目是否已归档
   * @returns 是否已归档
   */
  isArchived(): boolean {
    return this.status === ProjectStatus.ARCHIVED;
  }

  /**
   * 检查项目是否已暂停
   * @returns 是否已暂停
   */
  isSuspended(): boolean {
    return this.status === ProjectStatus.SUSPENDED;
  }

  /**
   * 检查项目是否已取消
   * @returns 是否已取消
   */
  isCancelled(): boolean {
    return this.status === ProjectStatus.CANCELLED;
  }

  /**
   * 检查项目是否公开
   * @returns 是否公开
   */
  isPublic(): boolean {
    return this.visibility === ProjectVisibility.PUBLIC;
  }

  /**
   * 检查项目是否私有
   * @returns 是否私有
   */
  isPrivate(): boolean {
    return this.visibility === ProjectVisibility.PRIVATE;
  }

  /**
   * 检查项目是否内部可见
   * @returns 是否内部可见
   */
  isInternal(): boolean {
    return this.visibility === ProjectVisibility.INTERNAL;
  }

  /**
   * 获取项目持续时间（天数）
   * @returns 持续天数
   */
  getDuration(): number | null {
    if (!this.startDate || !this.endDate) {
      return null;
    }
    
    return Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * 获取计划持续时间（天数）
   * @returns 计划持续天数
   */
  getPlannedDuration(): number | null {
    if (!this.plannedStartDate || !this.plannedEndDate) {
      return null;
    }
    
    return Math.ceil((this.plannedEndDate.getTime() - this.plannedStartDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * 获取实际持续时间（天数）
   * @returns 实际持续天数
   */
  getActualDuration(): number | null {
    if (!this.actualStartDate) {
      return null;
    }
    
    const endDate = this.actualEndDate || new Date();
    return Math.ceil((endDate.getTime() - this.actualStartDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * 检查项目是否延期
   * @returns 是否延期
   */
  isDelayed(): boolean {
    if (!this.plannedEndDate) {
      return false;
    }
    
    const now = new Date();
    return now > this.plannedEndDate && !this.isCompleted();
  }

  /**
   * 获取延期天数
   * @returns 延期天数
   */
  getDelayDays(): number {
    if (!this.isDelayed()) {
      return 0;
    }
    
    const now = new Date();
    return Math.ceil((now.getTime() - this.plannedEndDate!.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * 获取预算使用率
   * @returns 预算使用率（0-1）
   */
  getBudgetUsageRate(): number {
    if (!this.budget || this.budget === 0) {
      return 0;
    }
    
    return Math.min(this.spent / this.budget, 1);
  }

  /**
   * 检查预算是否超支
   * @returns 是否超支
   */
  isBudgetExceeded(): boolean {
    if (!this.budget) {
      return false;
    }
    
    return this.spent > this.budget;
  }

  /**
   * 获取状态显示名称
   * @returns 状态名称
   */
  getStatusDisplayName(): string {
    const statusNames = {
      [ProjectStatus.PLANNING]: '规划中',
      [ProjectStatus.ACTIVE]: '进行中',
      [ProjectStatus.SUSPENDED]: '已暂停',
      [ProjectStatus.COMPLETED]: '已完成',
      [ProjectStatus.CANCELLED]: '已取消',
      [ProjectStatus.ARCHIVED]: '已归档',
    };
    
    return statusNames[this.status] || this.status;
  }

  /**
   * 获取类型显示名称
   * @returns 类型名称
   */
  getTypeDisplayName(): string {
    const typeNames = {
      [ProjectType.WEB]: 'Web应用',
      [ProjectType.MOBILE]: '移动应用',
      [ProjectType.DESKTOP]: '桌面应用',
      [ProjectType.API]: 'API服务',
      [ProjectType.LIBRARY]: '库/框架',
      [ProjectType.TOOL]: '工具',
      [ProjectType.GAME]: '游戏',
      [ProjectType.OTHER]: '其他',
    };
    
    return typeNames[this.type] || this.type;
  }

  /**
   * 获取优先级显示名称
   * @returns 优先级名称
   */
  getPriorityDisplayName(): string {
    const priorityNames = {
      [ProjectPriority.LOW]: '低',
      [ProjectPriority.MEDIUM]: '中',
      [ProjectPriority.HIGH]: '高',
      [ProjectPriority.URGENT]: '紧急',
    };
    
    return priorityNames[this.priority] || this.priority;
  }

  /**
   * 获取可见性显示名称
   * @returns 可见性名称
   */
  getVisibilityDisplayName(): string {
    const visibilityNames = {
      [ProjectVisibility.PUBLIC]: '公开',
      [ProjectVisibility.INTERNAL]: '内部',
      [ProjectVisibility.PRIVATE]: '私有',
    };
    
    return visibilityNames[this.visibility] || this.visibility;
  }

  /**
   * 更新最后活跃时间
   */
  updateLastActive(): void {
    this.lastActiveAt = new Date();
  }

  /**
   * 归档项目
   * @param reason 归档原因
   */
  archive(reason?: string): void {
    this.status = ProjectStatus.ARCHIVED;
    this.archivedAt = new Date();
    if (reason) {
      this.archiveReason = reason;
    }
  }

  /**
   * 取消归档
   */
  unarchive(): void {
    this.status = ProjectStatus.ACTIVE;
    this.archivedAt = null;
    this.archiveReason = null;
  }

  /**
   * 更新项目统计
   * @param stats 统计数据
   */
  updateStatistics(stats: Partial<ProjectStatistics>): void {
    // 统计数据更新需要通过 ProjectStatistics 实体处理
    // 在服务层中实现具体的统计更新逻辑
    throw new Error('统计数据更新需要通过 ProjectStatistics 实体处理');
  }

  /**
   * 计算项目健康度评分
   * @returns 健康度评分（0-100）
   */
  calculateHealthScore(): number {
    let score = 100;
    
    // 进度评分（30%）
    const progressScore = this.progress;
    score = score * 0.3 + progressScore * 0.3;
    
    // 时间评分（25%）
    let timeScore = 100;
    if (this.isDelayed()) {
      const delayDays = this.getDelayDays();
      timeScore = Math.max(0, 100 - delayDays * 5); // 每延期一天扣5分
    }
    score = score * 0.75 + timeScore * 0.25;
    
    // 预算评分（25%）
    let budgetScore = 100;
    if (this.budget) {
      const usageRate = this.getBudgetUsageRate();
      if (usageRate > 1) {
        budgetScore = Math.max(0, 100 - (usageRate - 1) * 100); // 超支扣分
      } else if (usageRate > 0.9) {
        budgetScore = 90; // 接近预算上限
      }
    }
    score = score * 0.75 + budgetScore * 0.25;
    
    // 活跃度评分（20%）
    let activityScore = 100;
    if (this.lastActiveAt) {
      const daysSinceLastActive = Math.floor((Date.now() - this.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastActive > 7) {
        activityScore = Math.max(0, 100 - daysSinceLastActive * 2); // 每天不活跃扣2分
      }
    }
    score = score * 0.8 + activityScore * 0.2;
    
    return Math.round(Math.max(0, Math.min(100, score)));
  }
}