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
import { User } from '../../user/entities/user.entity';
import { Role } from './role.entity';

/**
 * 用户角色关联实体
 */
@Entity('user_roles')
@Unique(['userId', 'roleId'])
@Index(['userId'])
@Index(['roleId'])
@Index(['status'])
@Index(['assignedAt'])
@Index(['expiresAt'])
export class UserRole extends BaseEntity {
  @ApiProperty({ description: '用户ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '用户ID',
  })
  userId: string;

  @ApiProperty({ description: '角色ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '角色ID',
  })
  roleId: string;

  @ApiProperty({ description: '分配状态' })
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'expired', 'revoked'],
    default: 'active',
    comment: '分配状态',
  })
  status: 'active' | 'inactive' | 'expired' | 'revoked';

  @ApiProperty({ description: '分配时间' })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '分配时间',
  })
  assignedAt: Date;

  @ApiProperty({ description: '分配者ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '分配者ID',
  })
  assignedBy?: string;

  @ApiProperty({ description: '过期时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '过期时间',
  })
  expiresAt?: Date;

  @ApiProperty({ description: '撤销时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '撤销时间',
  })
  revokedAt?: Date;

  @ApiProperty({ description: '撤销者ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '撤销者ID',
  })
  revokedBy?: string;

  @ApiProperty({ description: '撤销原因', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '撤销原因',
  })
  revokeReason?: string;

  @ApiProperty({ description: '备注', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '备注',
  })
  remark?: string;

  @ApiProperty({ description: '扩展数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '扩展数据',
  })
  metadata?: Record<string, any>;

  // 关联关系
  @ApiProperty({ description: '用户', type: () => User })
  @ManyToOne(() => User, user => user.userRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: '角色', type: () => Role })
  @ManyToOne(() => Role, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ApiProperty({ description: '分配者', type: () => User })
  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assigned_by' })
  assignedByUser?: User;

  @ApiProperty({ description: '撤销者', type: () => User })
  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'revoked_by' })
  revokedByUser?: User;

  /**
   * 检查角色分配是否激活
   * @returns 是否激活
   */
  isActive(): boolean {
    return this.status === 'active' && !this.isExpired();
  }

  /**
   * 检查角色分配是否已过期
   * @returns 是否已过期
   */
  isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return new Date() > this.expiresAt;
  }

  /**
   * 检查角色分配是否已撤销
   * @returns 是否已撤销
   */
  isRevoked(): boolean {
    return this.status === 'revoked';
  }

  /**
   * 检查角色分配是否有效
   * @returns 是否有效
   */
  isValid(): boolean {
    return this.isActive() && !this.isExpired() && !this.isRevoked();
  }

  /**
   * 激活角色分配
   */
  activate(): void {
    this.status = 'active';
    this.revokedAt = null;
    this.revokedBy = null;
    this.revokeReason = null;
  }

  /**
   * 停用角色分配
   */
  deactivate(): void {
    this.status = 'inactive';
  }

  /**
   * 撤销角色分配
   * @param revokedBy 撤销者ID
   * @param reason 撤销原因
   */
  revoke(revokedBy: string, reason?: string): void {
    this.status = 'revoked';
    this.revokedAt = new Date();
    this.revokedBy = revokedBy;
    this.revokeReason = reason;
  }

  /**
   * 设置过期时间
   * @param expiresAt 过期时间
   */
  setExpiration(expiresAt: Date): void {
    this.expiresAt = expiresAt;
  }

  /**
   * 移除过期时间
   */
  removeExpiration(): void {
    this.expiresAt = null;
  }

  /**
   * 检查过期并更新状态
   */
  checkAndUpdateExpiration(): void {
    if (this.isExpired() && this.status === 'active') {
      this.status = 'expired';
    }
  }

  /**
   * 获取剩余有效天数
   * @returns 剩余天数，null表示永不过期
   */
  getRemainingDays(): number | null {
    if (!this.expiresAt) {
      return null;
    }
    const now = new Date();
    const diffTime = this.expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * 添加元数据
   * @param key 键
   * @param value 值
   */
  addMetadata(key: string, value: any): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
  }

  /**
   * 获取元数据
   * @param key 键
   * @returns 值
   */
  getMetadata(key: string): any {
    return this.metadata?.[key];
  }

  /**
   * 移除元数据
   * @param key 键
   */
  removeMetadata(key: string): void {
    if (this.metadata) {
      delete this.metadata[key];
    }
  }

  /**
   * 创建用户角色关联实例
   * @param data 关联数据
   * @returns 关联实例
   */
  static create(data: {
    userId: string;
    roleId: string;
    assignedBy?: string;
    expiresAt?: Date;
    remark?: string;
    metadata?: Record<string, any>;
  }): Partial<UserRole> {
    return {
      userId: data.userId,
      roleId: data.roleId,
      status: 'active',
      assignedAt: new Date(),
      assignedBy: data.assignedBy,
      expiresAt: data.expiresAt,
      remark: data.remark,
      metadata: data.metadata,
    };
  }
}