import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProjectRole, ProjectStatus } from '../../../common/enums';
import { User } from './user.entity';
import { Project } from '../../project/entities/project.entity';

/**
 * 用户项目关联实体
 */
@Entity('user_projects')
@Unique(['userId', 'projectId'])
@Index(['userId'])
@Index(['projectId'])
@Index(['role'])
@Index(['status'])
export class UserProject extends BaseEntity {
  @ApiProperty({ description: '用户ID' })
  @Column({
    type: 'uuid',
    comment: '用户ID',
  })
  userId: string;

  @ApiProperty({ description: '项目ID' })
  @Column({
    type: 'uuid',
    comment: '项目ID',
  })
  projectId: string;

  @ApiProperty({ description: '项目角色', enum: ProjectRole })
  @Column({
    type: 'enum',
    enum: ProjectRole,
    comment: '项目角色',
  })
  role: ProjectRole;

  @ApiProperty({ description: '状态', enum: ProjectStatus })
  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
    comment: '状态',
  })
  status: ProjectStatus;

  @ApiProperty({ description: '加入时间' })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '加入时间',
  })
  joinedAt: Date;

  @ApiProperty({ description: '离开时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '离开时间',
  })
  leftAt?: Date;

  @ApiProperty({ description: '邀请者ID', required: false })
  @Column({
    type: 'uuid',
    nullable: true,
    comment: '邀请者ID',
  })
  invitedBy?: string;

  @ApiProperty({ description: '邀请时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '邀请时间',
  })
  invitedAt?: Date;

  @ApiProperty({ description: '接受邀请时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '接受邀请时间',
  })
  acceptedAt?: Date;

  @ApiProperty({ description: '拒绝邀请时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '拒绝邀请时间',
  })
  rejectedAt?: Date;

  @ApiProperty({ description: '权限配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '权限配置',
  })
  permissions?: Record<string, any>;

  @ApiProperty({ description: '项目设置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '项目设置',
  })
  settings?: Record<string, any>;

  @ApiProperty({ description: '最后活跃时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后活跃时间',
  })
  lastActiveAt?: Date;

  @ApiProperty({ description: '贡献统计', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '贡献统计',
  })
  contributions?: {
    commits?: number;
    issues?: number;
    pullRequests?: number;
    reviews?: number;
    documents?: number;
  };

  @ApiProperty({ description: '备注', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '备注',
  })
  note?: string;

  // 关联关系
  @ApiProperty({ description: '用户', type: () => User })
  @ManyToOne(() => User, user => user.userProjects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: '项目', type: () => Project })
  @ManyToOne(() => Project, project => project.userProjects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  /**
   * 检查是否有指定权限
   * @param permission 权限名称
   * @returns 是否有权限
   */
  hasPermission(permission: string): boolean {
    if (!this.permissions) {
      return false;
    }
    
    return this.permissions[permission] === true;
  }

  /**
   * 检查是否为项目管理员
   * @returns 是否为管理员
   */
  isAdmin(): boolean {
    return this.role === ProjectRole.ADMIN || this.role === ProjectRole.OWNER;
  }

  /**
   * 检查是否为项目所有者
   * @returns 是否为所有者
   */
  isOwner(): boolean {
    return this.role === ProjectRole.OWNER;
  }

  /**
   * 检查是否可以管理项目
   * @returns 是否可以管理
   */
  canManage(): boolean {
    return this.isAdmin() && this.status === ProjectStatus.ACTIVE;
  }

  /**
   * 检查是否可以编辑项目
   * @returns 是否可以编辑
   */
  canEdit(): boolean {
    return (
      (this.role === ProjectRole.ADMIN || 
       this.role === ProjectRole.OWNER || 
       this.role === ProjectRole.DEVELOPER) &&
      this.status === ProjectStatus.ACTIVE
    );
  }

  /**
   * 检查是否可以查看项目
   * @returns 是否可以查看
   */
  canView(): boolean {
    return this.status === ProjectStatus.ACTIVE;
  }

  /**
   * 检查是否为活跃成员
   * @returns 是否活跃
   */
  isActive(): boolean {
    return this.status === ProjectStatus.ACTIVE && !this.leftAt;
  }

  /**
   * 检查邀请是否待处理
   * @returns 是否待处理
   */
  isPendingInvitation(): boolean {
    return this.invitedAt && !this.acceptedAt && !this.rejectedAt;
  }

  /**
   * 接受邀请
   */
  acceptInvitation(): void {
    this.acceptedAt = new Date();
    this.status = ProjectStatus.ACTIVE;
    this.joinedAt = new Date();
  }

  /**
   * 拒绝邀请
   */
  rejectInvitation(): void {
    this.rejectedAt = new Date();
    this.status = ProjectStatus.INACTIVE;
  }

  /**
   * 离开项目
   */
  leaveProject(): void {
    this.leftAt = new Date();
    this.status = ProjectStatus.INACTIVE;
  }

  /**
   * 更新最后活跃时间
   */
  updateLastActive(): void {
    this.lastActiveAt = new Date();
  }

  /**
   * 获取角色显示名称
   * @returns 角色名称
   */
  getRoleDisplayName(): string {
    const roleNames = {
      [ProjectRole.OWNER]: '所有者',
      [ProjectRole.ADMIN]: '管理员',
      [ProjectRole.DEVELOPER]: '开发者',
      [ProjectRole.DESIGNER]: '设计师',
      [ProjectRole.TESTER]: '测试员',
      [ProjectRole.VIEWER]: '查看者',
    };
    
    return roleNames[this.role] || this.role;
  }

  /**
   * 获取状态显示名称
   * @returns 状态名称
   */
  getStatusDisplayName(): string {
    const statusNames = {
      [ProjectStatus.ACTIVE]: '活跃',
      [ProjectStatus.INACTIVE]: '非活跃',
      [ProjectStatus.PENDING]: '待处理',
      [ProjectStatus.SUSPENDED]: '暂停',
    };
    
    return statusNames[this.status] || this.status;
  }

  /**
   * 获取参与天数
   * @returns 参与天数
   */
  getParticipationDays(): number {
    const endDate = this.leftAt || new Date();
    const startDate = this.joinedAt;
    
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * 更新贡献统计
   * @param type 贡献类型
   * @param increment 增量
   */
  updateContribution(type: keyof NonNullable<UserProject['contributions']>, increment: number = 1): void {
    if (!this.contributions) {
      this.contributions = {};
    }
    
    this.contributions[type] = (this.contributions[type] || 0) + increment;
  }

  /**
   * 获取总贡献数
   * @returns 总贡献数
   */
  getTotalContributions(): number {
    if (!this.contributions) {
      return 0;
    }
    
    return Object.values(this.contributions).reduce((sum, count) => sum + (count || 0), 0);
  }
}