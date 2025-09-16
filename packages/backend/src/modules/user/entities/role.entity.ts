import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../../../common/enums';
import { User } from './user.entity';
import { Permission } from './permission.entity';

/**
 * 角色实体
 */
@Entity('roles')
@Index(['name'], { unique: true })
@Index(['code'], { unique: true })
export class Role extends BaseEntity {
  @ApiProperty({ description: '角色名称' })
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '角色名称',
  })
  name: string;

  @ApiProperty({ description: '角色代码', enum: UserRole })
  @Column({
    type: 'enum',
    enum: UserRole,
    unique: true,
    comment: '角色代码',
  })
  code: UserRole;

  @ApiProperty({ description: '角色描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '角色描述',
  })
  description?: string;

  @ApiProperty({ description: '角色颜色', required: false })
  @Column({
    type: 'varchar',
    length: 7,
    nullable: true,
    comment: '角色颜色（十六进制）',
  })
  color?: string;

  @ApiProperty({ description: '角色图标', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '角色图标',
  })
  icon?: string;

  @ApiProperty({ description: '角色级别' })
  @Column({
    type: 'int',
    default: 1,
    comment: '角色级别（数字越大权限越高）',
  })
  level: number;

  @ApiProperty({ description: '是否为系统角色' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为系统角色（系统角色不可删除）',
  })
  isSystem: boolean;

  @ApiProperty({ description: '是否为默认角色' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为默认角色（新用户默认分配）',
  })
  isDefault: boolean;

  @ApiProperty({ description: '角色配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '角色配置',
  })
  config?: Record<string, any>;

  // 关联关系
  @ApiProperty({ description: '拥有该角色的用户', type: () => [User] })
  @ManyToMany(() => User, user => user.roles)
  users: User[];

  @ApiProperty({ description: '角色权限', type: () => [Permission] })
  @ManyToMany(() => Permission, permission => permission.roles, {
    cascade: true,
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];

  /**
   * 检查角色是否有指定权限
   * @param permissionCode 权限代码
   * @returns 是否有该权限
   */
  hasPermission(permissionCode: string): boolean {
    return this.permissions?.some(permission => permission.code === permissionCode) || false;
  }

  /**
   * 获取角色所有权限代码
   * @returns 权限代码数组
   */
  getPermissionCodes(): string[] {
    return this.permissions?.map(permission => permission.code) || [];
  }

  /**
   * 检查是否可以删除
   * @returns 是否可以删除
   */
  canDelete(): boolean {
    return !this.isSystem;
  }

  /**
   * 检查是否可以编辑
   * @returns 是否可以编辑
   */
  canEdit(): boolean {
    return !this.isSystem;
  }

  /**
   * 获取角色显示名称
   * @returns 显示名称
   */
  getDisplayName(): string {
    return this.name;
  }

  /**
   * 比较角色级别
   * @param otherRole 其他角色
   * @returns 级别比较结果（1: 高于, 0: 等于, -1: 低于）
   */
  compareLevel(otherRole: Role): number {
    if (this.level > otherRole.level) return 1;
    if (this.level < otherRole.level) return -1;
    return 0;
  }
}