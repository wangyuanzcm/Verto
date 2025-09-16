import {
  Entity,
  Column,
  Index,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Permission } from './permission.entity';

/**
 * 角色实体
 */
@Entity('roles')
@Index(['code'], { unique: true })
@Index(['name'])
@Index(['status'])
@Index(['type'])
export class Role extends BaseEntity {
  @ApiProperty({ description: '角色编码' })
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '角色编码',
  })
  code: string;

  @ApiProperty({ description: '角色名称' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '角色名称',
  })
  name: string;

  @ApiProperty({ description: '角色描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '角色描述',
  })
  description?: string;

  @ApiProperty({ description: '角色类型' })
  @Column({
    type: 'enum',
    enum: ['system', 'custom', 'project'],
    default: 'custom',
    comment: '角色类型',
  })
  type: 'system' | 'custom' | 'project';

  @ApiProperty({ description: '角色状态' })
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'deleted'],
    default: 'active',
    comment: '角色状态',
  })
  status: 'active' | 'inactive' | 'deleted';

  @ApiProperty({ description: '是否为默认角色' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为默认角色',
  })
  isDefault: boolean;

  @ApiProperty({ description: '角色级别' })
  @Column({
    type: 'int',
    default: 1,
    comment: '角色级别（数字越大权限越高）',
  })
  level: number;

  @ApiProperty({ description: '排序权重' })
  @Column({
    type: 'int',
    default: 0,
    comment: '排序权重',
  })
  sortOrder: number;

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

  // 关联关系
  @ApiProperty({ description: '拥有该角色的用户', type: () => [User] })
  @ManyToMany(() => User, user => user.roles)
  users: User[];

  @ApiProperty({ description: '角色权限', type: () => [Permission] })
  @ManyToMany(() => Permission, permission => permission.roles)
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
   * 检查角色是否激活
   * @returns 是否激活
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * 检查角色是否为系统角色
   * @returns 是否为系统角色
   */
  isSystemRole(): boolean {
    return this.type === 'system';
  }

  /**
   * 检查角色是否为项目角色
   * @returns 是否为项目角色
   */
  isProjectRole(): boolean {
    return this.type === 'project';
  }

  /**
   * 检查是否拥有指定权限
   * @param permissionCode 权限编码
   * @returns 是否拥有权限
   */
  hasPermission(permissionCode: string): boolean {
    if (!this.permissions) {
      return false;
    }
    return this.permissions.some(permission => 
      permission.code === permissionCode && permission.isActive()
    );
  }

  /**
   * 检查是否拥有指定模块的权限
   * @param module 模块名
   * @param action 动作名
   * @returns 是否拥有权限
   */
  hasModulePermission(module: string, action: string): boolean {
    if (!this.permissions) {
      return false;
    }
    return this.permissions.some(permission => 
      permission.module === module && 
      permission.action === action && 
      permission.isActive()
    );
  }

  /**
   * 获取角色的所有权限编码
   * @returns 权限编码数组
   */
  getPermissionCodes(): string[] {
    if (!this.permissions) {
      return [];
    }
    return this.permissions
      .filter(permission => permission.isActive())
      .map(permission => permission.code);
  }

  /**
   * 激活角色
   */
  activate(): void {
    this.status = 'active';
  }

  /**
   * 停用角色
   */
  deactivate(): void {
    this.status = 'inactive';
  }

  /**
   * 删除角色
   */
  delete(): void {
    this.status = 'deleted';
  }

  /**
   * 设置为默认角色
   */
  setAsDefault(): void {
    this.isDefault = true;
  }

  /**
   * 取消默认角色
   */
  unsetAsDefault(): void {
    this.isDefault = false;
  }

  /**
   * 创建角色实例
   * @param data 角色数据
   * @returns 角色实例
   */
  static create(data: {
    code: string;
    name: string;
    description?: string;
    type?: Role['type'];
    level?: number;
    color?: string;
    icon?: string;
  }): Partial<Role> {
    return {
      code: data.code,
      name: data.name,
      description: data.description,
      type: data.type || 'custom',
      status: 'active',
      isDefault: false,
      level: data.level || 1,
      sortOrder: 0,
      color: data.color,
      icon: data.icon,
    };
  }
}