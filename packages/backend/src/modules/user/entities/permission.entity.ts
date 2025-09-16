import {
  Entity,
  Column,
  ManyToMany,
  Tree,
  TreeParent,
  TreeChildren,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PermissionType } from '../../../common/enums';
import { Role } from './role.entity';

/**
 * 权限实体
 */
@Entity('permissions')
@Tree('closure-table')
@Index(['code'], { unique: true })
@Index(['module', 'action'])
export class Permission extends BaseEntity {
  @ApiProperty({ description: '权限名称' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '权限名称',
  })
  name: string;

  @ApiProperty({ description: '权限代码' })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '权限代码（格式：module:action）',
  })
  code: string;

  @ApiProperty({ description: '权限类型', enum: PermissionType })
  @Column({
    type: 'enum',
    enum: PermissionType,
    comment: '权限类型',
  })
  type: PermissionType;

  @ApiProperty({ description: '所属模块' })
  @Column({
    type: 'varchar',
    length: 50,
    comment: '所属模块',
  })
  module: string;

  @ApiProperty({ description: '操作动作' })
  @Column({
    type: 'varchar',
    length: 50,
    comment: '操作动作',
  })
  action: string;

  @ApiProperty({ description: '权限描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '权限描述',
  })
  description?: string;

  @ApiProperty({ description: '资源路径', required: false })
  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: '资源路径（API路径或页面路径）',
  })
  resource?: string;

  @ApiProperty({ description: 'HTTP方法', required: false })
  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: 'HTTP方法（GET、POST、PUT、DELETE等）',
  })
  method?: string;

  @ApiProperty({ description: '权限图标', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '权限图标',
  })
  icon?: string;

  @ApiProperty({ description: '权限级别' })
  @Column({
    type: 'int',
    default: 1,
    comment: '权限级别（数字越大权限越高）',
  })
  level: number;

  @ApiProperty({ description: '是否为系统权限' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为系统权限（系统权限不可删除）',
  })
  isSystem: boolean;

  @ApiProperty({ description: '是否需要审批' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否需要审批',
  })
  requiresApproval: boolean;

  @ApiProperty({ description: '权限条件', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '权限条件（如时间限制、IP限制等）',
  })
  conditions?: Record<string, any>;

  @ApiProperty({ description: '权限配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '权限配置',
  })
  config?: Record<string, any>;

  // 树形结构关联
  @ApiProperty({ description: '父权限', type: () => Permission, required: false })
  @TreeParent()
  parent?: Permission;

  @ApiProperty({ description: '子权限', type: () => [Permission] })
  @TreeChildren()
  children: Permission[];

  // 角色关联
  @ApiProperty({ description: '拥有该权限的角色', type: () => [Role] })
  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];

  /**
   * 检查权限是否匹配指定的模块和动作
   * @param module 模块名
   * @param action 动作名
   * @returns 是否匹配
   */
  matches(module: string, action: string): boolean {
    return this.module === module && this.action === action;
  }

  /**
   * 检查权限是否匹配指定的代码
   * @param code 权限代码
   * @returns 是否匹配
   */
  matchesCode(code: string): boolean {
    return this.code === code;
  }

  /**
   * 检查权限是否匹配指定的资源和方法
   * @param resource 资源路径
   * @param method HTTP方法
   * @returns 是否匹配
   */
  matchesResource(resource: string, method?: string): boolean {
    if (this.resource !== resource) {
      return false;
    }
    
    if (method && this.method && this.method !== method) {
      return false;
    }
    
    return true;
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
   * 获取权限显示名称
   * @returns 显示名称
   */
  getDisplayName(): string {
    return this.name;
  }

  /**
   * 获取权限完整路径
   * @returns 权限路径
   */
  getFullPath(): string {
    const paths: string[] = [];
    let current: Permission = this;
    
    while (current) {
      paths.unshift(current.name);
      current = current.parent;
    }
    
    return paths.join(' > ');
  }

  /**
   * 检查权限条件是否满足
   * @param context 上下文信息
   * @returns 是否满足条件
   */
  checkConditions(context: Record<string, any> = {}): boolean {
    if (!this.conditions) {
      return true;
    }

    // 时间限制检查
    if (this.conditions.timeRestriction) {
      const now = new Date();
      const { startTime, endTime } = this.conditions.timeRestriction;
      
      if (startTime && now < new Date(startTime)) {
        return false;
      }
      
      if (endTime && now > new Date(endTime)) {
        return false;
      }
    }

    // IP限制检查
    if (this.conditions.ipRestriction && context.ip) {
      const allowedIps = this.conditions.ipRestriction.allowedIps || [];
      const blockedIps = this.conditions.ipRestriction.blockedIps || [];
      
      if (blockedIps.includes(context.ip)) {
        return false;
      }
      
      if (allowedIps.length > 0 && !allowedIps.includes(context.ip)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 比较权限级别
   * @param otherPermission 其他权限
   * @returns 级别比较结果（1: 高于, 0: 等于, -1: 低于）
   */
  compareLevel(otherPermission: Permission): number {
    if (this.level > otherPermission.level) return 1;
    if (this.level < otherPermission.level) return -1;
    return 0;
  }
}