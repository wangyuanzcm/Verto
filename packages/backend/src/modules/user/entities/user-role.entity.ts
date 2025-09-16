import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';

/**
 * 用户角色实体
 */
@Entity('user_roles')
@Index(['name'], { unique: true })
@Index(['code'], { unique: true })
@Index(['status'])
@Index(['level'])
export class UserRole extends BaseEntity {
  @ApiProperty({ description: '角色名称' })
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '角色名称',
  })
  name: string;

  @ApiProperty({ description: '角色代码' })
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '角色代码',
  })
  code: string;

  @ApiProperty({ description: '角色描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '角色描述',
  })
  description?: string;

  @ApiProperty({ description: '角色级别' })
  @Column({
    type: 'int',
    default: 1,
    comment: '角色级别（数字越大权限越高）',
  })
  level: number;

  @ApiProperty({ description: '角色状态' })
  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
    comment: '角色状态',
  })
  status: 'active' | 'inactive';

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

  @ApiProperty({ description: '权限列表' })
  @Column({
    type: 'json',
    comment: '权限列表',
  })
  permissions: string[];

  @ApiProperty({ description: '角色配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '角色配置信息',
  })
  config?: {
    // 功能权限
    features?: {
      project?: {
        create?: boolean;
        read?: boolean;
        update?: boolean;
        delete?: boolean;
        manage?: boolean;
        export?: boolean;
        import?: boolean;
      };
      requirement?: {
        create?: boolean;
        read?: boolean;
        update?: boolean;
        delete?: boolean;
        assign?: boolean;
        review?: boolean;
        approve?: boolean;
      };
      prototype?: {
        create?: boolean;
        read?: boolean;
        update?: boolean;
        delete?: boolean;
        publish?: boolean;
        share?: boolean;
        comment?: boolean;
      };
      material?: {
        create?: boolean;
        read?: boolean;
        update?: boolean;
        delete?: boolean;
        publish?: boolean;
        download?: boolean;
        upload?: boolean;
      };
      user?: {
        create?: boolean;
        read?: boolean;
        update?: boolean;
        delete?: boolean;
        manage?: boolean;
        assign_role?: boolean;
      };
      system?: {
        settings?: boolean;
        logs?: boolean;
        backup?: boolean;
        restore?: boolean;
        monitor?: boolean;
      };
    };
    
    // 数据权限
    dataScope?: {
      type: 'all' | 'department' | 'self' | 'custom';
      departments?: string[];
      users?: string[];
    };
    
    // 操作限制
    limits?: {
      maxProjects?: number;
      maxRequirements?: number;
      maxPrototypes?: number;
      maxMaterials?: number;
      maxStorage?: number; // MB
      maxFileSize?: number; // MB
      maxTeamMembers?: number;
      dailyApiCalls?: number;
    };
    
    // 界面权限
    ui?: {
      menus?: string[];
      buttons?: string[];
      tabs?: string[];
      fields?: string[];
      hiddenMenus?: string[];
      hiddenButtons?: string[];
    };
    
    // 时间限制
    timeRestrictions?: {
      allowedHours?: {
        start: string;
        end: string;
      };
      allowedDays?: number[]; // 0-6, 0为周日
      timezone?: string;
    };
    
    // IP限制
    ipRestrictions?: {
      allowedIps?: string[];
      blockedIps?: string[];
      allowedCountries?: string[];
      blockedCountries?: string[];
    };
  };

  @ApiProperty({ description: '角色标签', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '角色标签',
  })
  tags?: string[];

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

  @ApiProperty({ description: '排序权重' })
  @Column({
    type: 'int',
    default: 0,
    comment: '排序权重',
  })
  sortOrder: number;

  @ApiProperty({ description: '用户数量' })
  @Column({
    type: 'int',
    default: 0,
    comment: '拥有此角色的用户数量',
  })
  userCount: number;

  @ApiProperty({ description: '自定义字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '自定义字段',
  })
  customFields?: Record<string, any>;

  @ApiProperty({ description: '创建者ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '创建者ID',
  })
  creatorId?: string;

  @ApiProperty({ description: '最后修改者ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '最后修改者ID',
  })
  updaterId?: string;

  // 关联关系
  @ApiProperty({ description: '拥有此角色的用户', type: () => [User] })
  @ManyToMany(() => User)
  @JoinTable({
    name: 'user_role_assignments',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  users: User[];

  /**
   * 检查是否为活跃状态
   * @returns 是否活跃
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * 检查是否为系统角色
   * @returns 是否为系统角色
   */
  isSystemRole(): boolean {
    return this.isSystem;
  }

  /**
   * 检查是否为默认角色
   * @returns 是否为默认角色
   */
  isDefaultRole(): boolean {
    return this.isDefault;
  }

  /**
   * 检查是否有指定权限
   * @param permission 权限代码
   * @returns 是否有权限
   */
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  /**
   * 检查是否有任一权限
   * @param permissions 权限代码列表
   * @returns 是否有任一权限
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * 检查是否有所有权限
   * @param permissions 权限代码列表
   * @returns 是否有所有权限
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * 检查功能权限
   * @param feature 功能模块
   * @param action 操作类型
   * @returns 是否有权限
   */
  hasFeaturePermission(feature: string, action: string): boolean {
    return this.config?.features?.[feature]?.[action] === true;
  }

  /**
   * 检查数据权限范围
   * @returns 数据权限范围
   */
  getDataScope(): {
    type: 'all' | 'department' | 'self' | 'custom';
    departments?: string[];
    users?: string[];
  } {
    return this.config?.dataScope || { type: 'self' };
  }

  /**
   * 检查操作限制
   * @param limitType 限制类型
   * @returns 限制值
   */
  getLimit(limitType: string): number | undefined {
    return this.config?.limits?.[limitType];
  }

  /**
   * 检查是否超出限制
   * @param limitType 限制类型
   * @param currentValue 当前值
   * @returns 是否超出限制
   */
  isLimitExceeded(limitType: string, currentValue: number): boolean {
    const limit = this.getLimit(limitType);
    return limit !== undefined && currentValue >= limit;
  }

  /**
   * 检查时间限制
   * @param currentTime 当前时间
   * @returns 是否在允许时间内
   */
  isTimeAllowed(currentTime: Date = new Date()): boolean {
    const restrictions = this.config?.timeRestrictions;
    if (!restrictions) return true;
    
    // 检查允许的小时
    if (restrictions.allowedHours) {
      const hour = currentTime.getHours();
      const start = parseInt(restrictions.allowedHours.start.split(':')[0]);
      const end = parseInt(restrictions.allowedHours.end.split(':')[0]);
      
      if (start <= end) {
        if (hour < start || hour > end) return false;
      } else {
        if (hour < start && hour > end) return false;
      }
    }
    
    // 检查允许的天
    if (restrictions.allowedDays) {
      const day = currentTime.getDay();
      if (!restrictions.allowedDays.includes(day)) return false;
    }
    
    return true;
  }

  /**
   * 检查IP限制
   * @param ip IP地址
   * @param country 国家代码
   * @returns 是否允许访问
   */
  isIpAllowed(ip: string, country?: string): boolean {
    const restrictions = this.config?.ipRestrictions;
    if (!restrictions) return true;
    
    // 检查被阻止的IP
    if (restrictions.blockedIps?.includes(ip)) return false;
    
    // 检查允许的IP
    if (restrictions.allowedIps?.length && !restrictions.allowedIps.includes(ip)) {
      return false;
    }
    
    // 检查国家限制
    if (country) {
      if (restrictions.blockedCountries?.includes(country)) return false;
      if (restrictions.allowedCountries?.length && !restrictions.allowedCountries.includes(country)) {
        return false;
      }
    }
    
    return true;
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
   * 设为默认角色
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
   * 添加权限
   * @param permission 权限代码
   */
  addPermission(permission: string): void {
    if (!this.permissions.includes(permission)) {
      this.permissions.push(permission);
    }
  }

  /**
   * 移除权限
   * @param permission 权限代码
   */
  removePermission(permission: string): void {
    this.permissions = this.permissions.filter(p => p !== permission);
  }

  /**
   * 批量添加权限
   * @param permissions 权限代码列表
   */
  addPermissions(permissions: string[]): void {
    permissions.forEach(permission => this.addPermission(permission));
  }

  /**
   * 批量移除权限
   * @param permissions 权限代码列表
   */
  removePermissions(permissions: string[]): void {
    permissions.forEach(permission => this.removePermission(permission));
  }

  /**
   * 设置权限
   * @param permissions 权限代码列表
   */
  setPermissions(permissions: string[]): void {
    this.permissions = [...new Set(permissions)];
  }

  /**
   * 清空权限
   */
  clearPermissions(): void {
    this.permissions = [];
  }

  /**
   * 设置功能权限
   * @param feature 功能模块
   * @param permissions 权限配置
   */
  setFeaturePermissions(feature: string, permissions: Record<string, boolean>): void {
    if (!this.config) {
      this.config = {};
    }
    
    if (!this.config.features) {
      this.config.features = {};
    }
    
    this.config.features[feature] = { ...this.config.features[feature], ...permissions };
  }

  /**
   * 设置数据权限范围
   * @param dataScope 数据权限范围
   */
  setDataScope(dataScope: {
    type: 'all' | 'department' | 'self' | 'custom';
    departments?: string[];
    users?: string[];
  }): void {
    if (!this.config) {
      this.config = {};
    }
    
    this.config.dataScope = dataScope;
  }

  /**
   * 设置操作限制
   * @param limits 限制配置
   */
  setLimits(limits: Record<string, number>): void {
    if (!this.config) {
      this.config = {};
    }
    
    this.config.limits = { ...this.config.limits, ...limits };
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
   * 增加用户数量
   */
  incrementUserCount(): void {
    this.userCount += 1;
  }

  /**
   * 减少用户数量
   */
  decrementUserCount(): void {
    if (this.userCount > 0) {
      this.userCount -= 1;
    }
  }

  /**
   * 更新用户数量
   * @param count 用户数量
   */
  updateUserCount(count: number): void {
    this.userCount = Math.max(0, count);
  }

  /**
   * 获取角色信息
   * @returns 角色信息
   */
  getInfo(): {
    id: string;
    name: string;
    code: string;
    description?: string;
    level: number;
    status: string;
    isSystem: boolean;
    isDefault: boolean;
    permissions: string[];
    tags?: string[];
    color?: string;
    icon?: string;
    sortOrder: number;
    userCount: number;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      description: this.description,
      level: this.level,
      status: this.status,
      isSystem: this.isSystem,
      isDefault: this.isDefault,
      permissions: this.permissions,
      tags: this.tags,
      color: this.color,
      icon: this.icon,
      sortOrder: this.sortOrder,
      userCount: this.userCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * 验证角色数据
   * @param data 角色数据
   * @returns 验证结果
   */
  static validate(data: Partial<UserRole>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('角色名称不能为空');
    } else if (data.name.length > 50) {
      errors.push('角色名称长度不能超过50个字符');
    }
    
    if (!data.code || data.code.trim().length === 0) {
      errors.push('角色代码不能为空');
    } else if (data.code.length > 50) {
      errors.push('角色代码长度不能超过50个字符');
    } else if (!/^[A-Z_]+$/.test(data.code)) {
      errors.push('角色代码只能包含大写字母和下划线');
    }
    
    if (data.level !== undefined && data.level < 1) {
      errors.push('角色级别不能小于1');
    }
    
    if (data.description && data.description.length > 1000) {
      errors.push('角色描述长度不能超过1000个字符');
    }
    
    if (!data.permissions || !Array.isArray(data.permissions)) {
      errors.push('权限列表不能为空且必须为数组');
    }
    
    if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
      errors.push('角色颜色必须为有效的十六进制颜色值');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建角色实例
   * @param data 角色数据
   * @returns 角色实例
   */
  static create(data: {
    name: string;
    code: string;
    description?: string;
    level?: number;
    permissions: string[];
    isSystem?: boolean;
    isDefault?: boolean;
    color?: string;
    icon?: string;
    creatorId?: string;
  }): Partial<UserRole> {
    return {
      name: data.name,
      code: data.code,
      description: data.description,
      level: data.level || 1,
      status: 'active',
      isSystem: data.isSystem || false,
      isDefault: data.isDefault || false,
      permissions: data.permissions,
      color: data.color,
      icon: data.icon,
      sortOrder: 0,
      userCount: 0,
      creatorId: data.creatorId,
    };
  }

  /**
   * 获取系统预定义角色
   * @returns 系统角色列表
   */
  static getSystemRoles(): Partial<UserRole>[] {
    return [
      {
        name: '超级管理员',
        code: 'SUPER_ADMIN',
        description: '系统超级管理员，拥有所有权限',
        level: 100,
        status: 'active',
        isSystem: true,
        isDefault: false,
        permissions: ['*'],
        color: '#ff4d4f',
        icon: 'crown',
        sortOrder: 1,
      },
      {
        name: '管理员',
        code: 'ADMIN',
        description: '系统管理员，拥有大部分管理权限',
        level: 90,
        status: 'active',
        isSystem: true,
        isDefault: false,
        permissions: [
          'user:read', 'user:create', 'user:update',
          'project:*', 'requirement:*', 'prototype:*', 'material:*',
          'system:settings', 'system:logs'
        ],
        color: '#fa8c16',
        icon: 'user-tie',
        sortOrder: 2,
      },
      {
        name: '项目经理',
        code: 'PROJECT_MANAGER',
        description: '项目经理，负责项目管理和团队协调',
        level: 80,
        status: 'active',
        isSystem: true,
        isDefault: false,
        permissions: [
          'project:*', 'requirement:*', 'prototype:read', 'prototype:comment',
          'material:read', 'material:download', 'user:read'
        ],
        color: '#1890ff',
        icon: 'project-diagram',
        sortOrder: 3,
      },
      {
        name: '产品经理',
        code: 'PRODUCT_MANAGER',
        description: '产品经理，负责需求管理和产品设计',
        level: 70,
        status: 'active',
        isSystem: true,
        isDefault: false,
        permissions: [
          'project:read', 'requirement:*', 'prototype:*',
          'material:read', 'material:download', 'user:read'
        ],
        color: '#52c41a',
        icon: 'lightbulb',
        sortOrder: 4,
      },
      {
        name: '设计师',
        code: 'DESIGNER',
        description: '设计师，负责原型设计和界面设计',
        level: 60,
        status: 'active',
        isSystem: true,
        isDefault: false,
        permissions: [
          'project:read', 'requirement:read', 'prototype:*',
          'material:*', 'user:read'
        ],
        color: '#eb2f96',
        icon: 'palette',
        sortOrder: 5,
      },
      {
        name: '开发者',
        code: 'DEVELOPER',
        description: '开发者，负责功能开发和技术实现',
        level: 50,
        status: 'active',
        isSystem: true,
        isDefault: false,
        permissions: [
          'project:read', 'requirement:read', 'requirement:update',
          'prototype:read', 'prototype:comment', 'material:*', 'user:read'
        ],
        color: '#722ed1',
        icon: 'code',
        sortOrder: 6,
      },
      {
        name: '测试员',
        code: 'TESTER',
        description: '测试员，负责功能测试和质量保证',
        level: 40,
        status: 'active',
        isSystem: true,
        isDefault: false,
        permissions: [
          'project:read', 'requirement:read', 'requirement:update',
          'prototype:read', 'prototype:comment', 'material:read', 'user:read'
        ],
        color: '#fa541c',
        icon: 'bug',
        sortOrder: 7,
      },
      {
        name: '普通用户',
        code: 'USER',
        description: '普通用户，基础查看和参与权限',
        level: 10,
        status: 'active',
        isSystem: true,
        isDefault: true,
        permissions: [
          'project:read', 'requirement:read', 'prototype:read',
          'material:read', 'material:download', 'user:read'
        ],
        color: '#13c2c2',
        icon: 'user',
        sortOrder: 8,
      },
    ];
  }
}