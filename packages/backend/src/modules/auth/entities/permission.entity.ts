import {
  Entity,
  Column,
  Index,
  ManyToMany,
  Tree,
  TreeParent,
  TreeChildren,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Role } from './role.entity';

/**
 * 权限实体
 */
@Entity('permissions')
@Tree('closure-table')
@Index(['code'], { unique: true })
@Index(['module'])
@Index(['action'])
@Index(['status'])
@Index(['type'])
export class Permission extends BaseEntity {
  @ApiProperty({ description: '权限编码' })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '权限编码',
  })
  code: string;

  @ApiProperty({ description: '权限名称' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '权限名称',
  })
  name: string;

  @ApiProperty({ description: '权限描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '权限描述',
  })
  description?: string;

  @ApiProperty({ description: '模块名称' })
  @Column({
    type: 'varchar',
    length: 50,
    comment: '模块名称',
  })
  module: string;

  @ApiProperty({ description: '操作动作' })
  @Column({
    type: 'varchar',
    length: 50,
    comment: '操作动作',
  })
  action: string;

  @ApiProperty({ description: '权限类型' })
  @Column({
    type: 'enum',
    enum: ['menu', 'button', 'api', 'data'],
    comment: '权限类型',
  })
  type: 'menu' | 'button' | 'api' | 'data';

  @ApiProperty({ description: '权限状态' })
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'deleted'],
    default: 'active',
    comment: '权限状态',
  })
  status: 'active' | 'inactive' | 'deleted';

  @ApiProperty({ description: '资源路径', required: false })
  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: '资源路径',
  })
  resource?: string;

  @ApiProperty({ description: '权限级别' })
  @Column({
    type: 'int',
    default: 1,
    comment: '权限级别',
  })
  level: number;

  @ApiProperty({ description: '排序权重' })
  @Column({
    type: 'int',
    default: 0,
    comment: '排序权重',
  })
  sortOrder: number;

  @ApiProperty({ description: '权限图标', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '权限图标',
  })
  icon?: string;

  @ApiProperty({ description: '是否显示在菜单' })
  @Column({
    type: 'boolean',
    default: true,
    comment: '是否显示在菜单',
  })
  showInMenu: boolean;

  @ApiProperty({ description: '是否缓存页面' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否缓存页面',
  })
  keepAlive: boolean;

  @ApiProperty({ description: '外部链接', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '外部链接',
  })
  externalLink?: string;

  // 树形结构关联
  @ApiProperty({ description: '父权限', type: () => Permission })
  @TreeParent()
  parent: Permission;

  @ApiProperty({ description: '子权限', type: () => [Permission] })
  @TreeChildren()
  children: Permission[];

  // 角色关联
  @ApiProperty({ description: '拥有该权限的角色', type: () => [Role] })
  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];

  /**
   * 检查权限是否激活
   * @returns 是否激活
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * 检查是否为菜单权限
   * @returns 是否为菜单权限
   */
  isMenuPermission(): boolean {
    return this.type === 'menu';
  }

  /**
   * 检查是否为按钮权限
   * @returns 是否为按钮权限
   */
  isButtonPermission(): boolean {
    return this.type === 'button';
  }

  /**
   * 检查是否为API权限
   * @returns 是否为API权限
   */
  isApiPermission(): boolean {
    return this.type === 'api';
  }

  /**
   * 检查是否为数据权限
   * @returns 是否为数据权限
   */
  isDataPermission(): boolean {
    return this.type === 'data';
  }

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
   * 获取权限的完整路径
   * @returns 权限路径
   */
  getFullPath(): string {
    if (this.parent) {
      return `${this.parent.getFullPath()}/${this.code}`;
    }
    return this.code;
  }

  /**
   * 检查是否为根权限
   * @returns 是否为根权限
   */
  isRoot(): boolean {
    return !this.parent;
  }

  /**
   * 检查是否为叶子权限
   * @returns 是否为叶子权限
   */
  isLeaf(): boolean {
    return !this.children || this.children.length === 0;
  }

  /**
   * 激活权限
   */
  activate(): void {
    this.status = 'active';
  }

  /**
   * 停用权限
   */
  deactivate(): void {
    this.status = 'inactive';
  }

  /**
   * 删除权限
   */
  delete(): void {
    this.status = 'deleted';
  }

  /**
   * 显示在菜单
   */
  showMenu(): void {
    this.showInMenu = true;
  }

  /**
   * 隐藏菜单
   */
  hideMenu(): void {
    this.showInMenu = false;
  }

  /**
   * 启用页面缓存
   */
  enableKeepAlive(): void {
    this.keepAlive = true;
  }

  /**
   * 禁用页面缓存
   */
  disableKeepAlive(): void {
    this.keepAlive = false;
  }

  /**
   * 创建权限实例
   * @param data 权限数据
   * @returns 权限实例
   */
  static create(data: {
    code: string;
    name: string;
    description?: string;
    module: string;
    action: string;
    type: Permission['type'];
    resource?: string;
    level?: number;
    icon?: string;
    showInMenu?: boolean;
    keepAlive?: boolean;
    externalLink?: string;
    parent?: Permission;
  }): Partial<Permission> {
    return {
      code: data.code,
      name: data.name,
      description: data.description,
      module: data.module,
      action: data.action,
      type: data.type,
      status: 'active',
      resource: data.resource,
      level: data.level || 1,
      sortOrder: 0,
      icon: data.icon,
      showInMenu: data.showInMenu !== false,
      keepAlive: data.keepAlive || false,
      externalLink: data.externalLink,
      parent: data.parent,
    };
  }
}