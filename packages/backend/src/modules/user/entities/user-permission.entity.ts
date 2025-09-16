import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from './user-role.entity';

/**
 * 用户权限实体
 */
@Entity('user_permissions')
@Index(['code'], { unique: true })
@Index(['module'])
@Index(['category'])
@Index(['status'])
@Index(['level'])
export class UserPermission extends BaseEntity {
  @ApiProperty({ description: '权限代码' })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '权限代码（如：user:create）',
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

  @ApiProperty({ description: '所属模块' })
  @Column({
    type: 'varchar',
    length: 50,
    comment: '所属模块（如：user、project、requirement等）',
  })
  module: string;

  @ApiProperty({ description: '权限分类' })
  @Column({
    type: 'enum',
    enum: ['system', 'business', 'data', 'ui', 'api'],
    default: 'business',
    comment: '权限分类',
  })
  category: 'system' | 'business' | 'data' | 'ui' | 'api';

  @ApiProperty({ description: '操作类型' })
  @Column({
    type: 'enum',
    enum: ['create', 'read', 'update', 'delete', 'manage', 'execute', 'approve', 'export', 'import', 'share', 'publish', 'archive', 'restore', 'assign', 'review', 'comment', 'download', 'upload', 'all'],
    comment: '操作类型',
  })
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'execute' | 'approve' | 'export' | 'import' | 'share' | 'publish' | 'archive' | 'restore' | 'assign' | 'review' | 'comment' | 'download' | 'upload' | 'all';

  @ApiProperty({ description: '权限级别' })
  @Column({
    type: 'int',
    default: 1,
    comment: '权限级别（数字越大权限越高）',
  })
  level: number;

  @ApiProperty({ description: '权限状态' })
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'deprecated'],
    default: 'active',
    comment: '权限状态',
  })
  status: 'active' | 'inactive' | 'deprecated';

  @ApiProperty({ description: '是否为系统权限' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为系统权限（系统权限不可删除）',
  })
  isSystem: boolean;

  @ApiProperty({ description: '是否为危险权限' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为危险权限（需要特殊审批）',
  })
  isDangerous: boolean;

  @ApiProperty({ description: '父权限代码', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '父权限代码',
  })
  parentCode?: string;

  @ApiProperty({ description: '权限路径', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '权限路径（层级结构）',
  })
  path?: string;

  @ApiProperty({ description: '权限深度' })
  @Column({
    type: 'int',
    default: 1,
    comment: '权限深度（层级深度）',
  })
  depth: number;

  @ApiProperty({ description: '依赖权限', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '依赖权限列表',
  })
  dependencies?: string[];

  @ApiProperty({ description: '互斥权限', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '互斥权限列表',
  })
  conflicts?: string[];

  @ApiProperty({ description: '权限配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '权限配置信息',
  })
  config?: {
    // 资源限制
    resources?: {
      paths?: string[]; // 允许访问的路径
      methods?: string[]; // 允许的HTTP方法
      apis?: string[]; // 允许的API接口
      fields?: string[]; // 允许访问的字段
      conditions?: Record<string, any>; // 访问条件
    };
    
    // 时间限制
    timeRestrictions?: {
      validFrom?: string; // 生效时间
      validTo?: string; // 失效时间
      allowedHours?: {
        start: string;
        end: string;
      };
      allowedDays?: number[]; // 0-6, 0为周日
      timezone?: string;
    };
    
    // 数量限制
    limits?: {
      maxOperations?: number; // 最大操作次数
      maxRecords?: number; // 最大记录数
      maxFileSize?: number; // 最大文件大小
      maxConcurrent?: number; // 最大并发数
      dailyLimit?: number; // 每日限制
      monthlyLimit?: number; // 每月限制
    };
    
    // 审批配置
    approval?: {
      required?: boolean; // 是否需要审批
      approvers?: string[]; // 审批人列表
      autoApprove?: boolean; // 是否自动审批
      approvalTimeout?: number; // 审批超时时间（小时）
    };
    
    // 日志配置
    logging?: {
      enabled?: boolean; // 是否记录日志
      level?: 'info' | 'warn' | 'error'; // 日志级别
      details?: boolean; // 是否记录详细信息
      retention?: number; // 日志保留天数
    };
    
    // 通知配置
    notification?: {
      onGrant?: boolean; // 授权时通知
      onRevoke?: boolean; // 撤销时通知
      onUse?: boolean; // 使用时通知
      recipients?: string[]; // 通知接收人
    };
  };

  @ApiProperty({ description: '权限标签', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '权限标签',
  })
  tags?: string[];

  @ApiProperty({ description: '权限图标', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '权限图标',
  })
  icon?: string;

  @ApiProperty({ description: '权限颜色', required: false })
  @Column({
    type: 'varchar',
    length: 7,
    nullable: true,
    comment: '权限颜色（十六进制）',
  })
  color?: string;

  @ApiProperty({ description: '排序权重' })
  @Column({
    type: 'int',
    default: 0,
    comment: '排序权重',
  })
  sortOrder: number;

  @ApiProperty({ description: '使用次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '权限使用次数',
  })
  usageCount: number;

  @ApiProperty({ description: '最后使用时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后使用时间',
  })
  lastUsedAt?: Date;

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
  @ApiProperty({ description: '拥有此权限的角色', type: () => [UserRole] })
  @ManyToMany(() => UserRole)
  @JoinTable({
    name: 'role_permission_assignments',
    joinColumn: { name: 'permissionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: UserRole[];

  /**
   * 检查是否为活跃状态
   * @returns 是否活跃
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * 检查是否为系统权限
   * @returns 是否为系统权限
   */
  isSystemPermission(): boolean {
    return this.isSystem;
  }

  /**
   * 检查是否为危险权限
   * @returns 是否为危险权限
   */
  isDangerousPermission(): boolean {
    return this.isDangerous;
  }

  /**
   * 检查是否已弃用
   * @returns 是否已弃用
   */
  isDeprecated(): boolean {
    return this.status === 'deprecated';
  }

  /**
   * 检查是否有父权限
   * @returns 是否有父权限
   */
  hasParent(): boolean {
    return !!this.parentCode;
  }

  /**
   * 检查是否为根权限
   * @returns 是否为根权限
   */
  isRoot(): boolean {
    return !this.parentCode;
  }

  /**
   * 检查是否有依赖权限
   * @returns 是否有依赖权限
   */
  hasDependencies(): boolean {
    return !!(this.dependencies && this.dependencies.length > 0);
  }

  /**
   * 检查是否有冲突权限
   * @returns 是否有冲突权限
   */
  hasConflicts(): boolean {
    return !!(this.conflicts && this.conflicts.length > 0);
  }

  /**
   * 检查是否与指定权限冲突
   * @param permissionCode 权限代码
   * @returns 是否冲突
   */
  conflictsWith(permissionCode: string): boolean {
    return this.conflicts?.includes(permissionCode) || false;
  }

  /**
   * 检查是否依赖指定权限
   * @param permissionCode 权限代码
   * @returns 是否依赖
   */
  dependsOn(permissionCode: string): boolean {
    return this.dependencies?.includes(permissionCode) || false;
  }

  /**
   * 检查时间限制
   * @param currentTime 当前时间
   * @returns 是否在允许时间内
   */
  isTimeAllowed(currentTime: Date = new Date()): boolean {
    const restrictions = this.config?.timeRestrictions;
    if (!restrictions) return true;
    
    // 检查有效期
    if (restrictions.validFrom) {
      const validFrom = new Date(restrictions.validFrom);
      if (currentTime < validFrom) return false;
    }
    
    if (restrictions.validTo) {
      const validTo = new Date(restrictions.validTo);
      if (currentTime > validTo) return false;
    }
    
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
   * 检查是否需要审批
   * @returns 是否需要审批
   */
  requiresApproval(): boolean {
    return this.config?.approval?.required === true;
  }

  /**
   * 检查是否超出使用限制
   * @param limitType 限制类型
   * @param currentValue 当前值
   * @returns 是否超出限制
   */
  isLimitExceeded(limitType: string, currentValue: number): boolean {
    const limit = this.config?.limits?.[limitType];
    return limit !== undefined && currentValue >= limit;
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
   * 弃用权限
   */
  deprecate(): void {
    this.status = 'deprecated';
  }

  /**
   * 增加使用次数
   */
  incrementUsage(): void {
    this.usageCount += 1;
    this.lastUsedAt = new Date();
  }

  /**
   * 重置使用次数
   */
  resetUsage(): void {
    this.usageCount = 0;
    this.lastUsedAt = null;
  }

  /**
   * 添加依赖权限
   * @param permissionCode 权限代码
   */
  addDependency(permissionCode: string): void {
    if (!this.dependencies) {
      this.dependencies = [];
    }
    
    if (!this.dependencies.includes(permissionCode)) {
      this.dependencies.push(permissionCode);
    }
  }

  /**
   * 移除依赖权限
   * @param permissionCode 权限代码
   */
  removeDependency(permissionCode: string): void {
    if (this.dependencies) {
      this.dependencies = this.dependencies.filter(dep => dep !== permissionCode);
    }
  }

  /**
   * 添加冲突权限
   * @param permissionCode 权限代码
   */
  addConflict(permissionCode: string): void {
    if (!this.conflicts) {
      this.conflicts = [];
    }
    
    if (!this.conflicts.includes(permissionCode)) {
      this.conflicts.push(permissionCode);
    }
  }

  /**
   * 移除冲突权限
   * @param permissionCode 权限代码
   */
  removeConflict(permissionCode: string): void {
    if (this.conflicts) {
      this.conflicts = this.conflicts.filter(conflict => conflict !== permissionCode);
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
   * 获取权限信息
   * @returns 权限信息
   */
  getInfo(): {
    id: string;
    code: string;
    name: string;
    description?: string;
    module: string;
    category: string;
    action: string;
    level: number;
    status: string;
    isSystem: boolean;
    isDangerous: boolean;
    parentCode?: string;
    path?: string;
    depth: number;
    dependencies?: string[];
    conflicts?: string[];
    tags?: string[];
    icon?: string;
    color?: string;
    sortOrder: number;
    usageCount: number;
    lastUsedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      module: this.module,
      category: this.category,
      action: this.action,
      level: this.level,
      status: this.status,
      isSystem: this.isSystem,
      isDangerous: this.isDangerous,
      parentCode: this.parentCode,
      path: this.path,
      depth: this.depth,
      dependencies: this.dependencies,
      conflicts: this.conflicts,
      tags: this.tags,
      icon: this.icon,
      color: this.color,
      sortOrder: this.sortOrder,
      usageCount: this.usageCount,
      lastUsedAt: this.lastUsedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * 验证权限数据
   * @param data 权限数据
   * @returns 验证结果
   */
  static validate(data: Partial<UserPermission>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.code || data.code.trim().length === 0) {
      errors.push('权限代码不能为空');
    } else if (data.code.length > 100) {
      errors.push('权限代码长度不能超过100个字符');
    } else if (!/^[a-z_]+:[a-z_]+$/.test(data.code)) {
      errors.push('权限代码格式不正确，应为：模块:操作（如：user:create）');
    }
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('权限名称不能为空');
    } else if (data.name.length > 100) {
      errors.push('权限名称长度不能超过100个字符');
    }
    
    if (!data.module || data.module.trim().length === 0) {
      errors.push('所属模块不能为空');
    } else if (data.module.length > 50) {
      errors.push('所属模块长度不能超过50个字符');
    }
    
    if (data.level !== undefined && data.level < 1) {
      errors.push('权限级别不能小于1');
    }
    
    if (data.description && data.description.length > 1000) {
      errors.push('权限描述长度不能超过1000个字符');
    }
    
    if (data.parentCode && data.parentCode === data.code) {
      errors.push('父权限不能是自己');
    }
    
    if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
      errors.push('权限颜色必须为有效的十六进制颜色值');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
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
    category?: 'system' | 'business' | 'data' | 'ui' | 'api';
    action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'execute' | 'approve' | 'export' | 'import' | 'share' | 'publish' | 'archive' | 'restore' | 'assign' | 'review' | 'comment' | 'download' | 'upload' | 'all';
    level?: number;
    isSystem?: boolean;
    isDangerous?: boolean;
    parentCode?: string;
    dependencies?: string[];
    conflicts?: string[];
    icon?: string;
    color?: string;
    creatorId?: string;
  }): Partial<UserPermission> {
    const parts = data.code.split(':');
    const path = data.parentCode ? `${data.parentCode}.${data.code}` : data.code;
    const depth = path.split('.').length;
    
    return {
      code: data.code,
      name: data.name,
      description: data.description,
      module: data.module,
      category: data.category || 'business',
      action: data.action,
      level: data.level || 1,
      status: 'active',
      isSystem: data.isSystem || false,
      isDangerous: data.isDangerous || false,
      parentCode: data.parentCode,
      path,
      depth,
      dependencies: data.dependencies,
      conflicts: data.conflicts,
      icon: data.icon,
      color: data.color,
      sortOrder: 0,
      usageCount: 0,
      creatorId: data.creatorId,
    };
  }

  /**
   * 获取系统预定义权限
   * @returns 系统权限列表
   */
  static getSystemPermissions(): Partial<UserPermission>[] {
    const permissions: Partial<UserPermission>[] = [];
    
    // 用户管理权限
    const userPermissions = [
      { action: 'create', name: '创建用户', description: '创建新用户账号' },
      { action: 'read', name: '查看用户', description: '查看用户信息' },
      { action: 'update', name: '编辑用户', description: '编辑用户信息' },
      { action: 'delete', name: '删除用户', description: '删除用户账号', isDangerous: true },
      { action: 'manage', name: '管理用户', description: '完整的用户管理权限', isDangerous: true },
      { action: 'assign', name: '分配角色', description: '为用户分配角色', isDangerous: true },
    ];
    
    userPermissions.forEach((perm, index) => {
      permissions.push({
        code: `user:${perm.action}`,
        name: perm.name,
        description: perm.description,
        module: 'user',
        category: 'business',
        action: perm.action as any,
        level: perm.isDangerous ? 90 : 50,
        status: 'active',
        isSystem: true,
        isDangerous: perm.isDangerous || false,
        icon: 'user',
        color: '#1890ff',
        sortOrder: index + 1,
      });
    });
    
    // 项目管理权限
    const projectPermissions = [
      { action: 'create', name: '创建项目', description: '创建新项目' },
      { action: 'read', name: '查看项目', description: '查看项目信息' },
      { action: 'update', name: '编辑项目', description: '编辑项目信息' },
      { action: 'delete', name: '删除项目', description: '删除项目', isDangerous: true },
      { action: 'manage', name: '管理项目', description: '完整的项目管理权限' },
      { action: 'export', name: '导出项目', description: '导出项目数据' },
      { action: 'import', name: '导入项目', description: '导入项目数据' },
      { action: 'archive', name: '归档项目', description: '归档项目' },
      { action: 'restore', name: '恢复项目', description: '恢复已归档项目' },
    ];
    
    projectPermissions.forEach((perm, index) => {
      permissions.push({
        code: `project:${perm.action}`,
        name: perm.name,
        description: perm.description,
        module: 'project',
        category: 'business',
        action: perm.action as any,
        level: perm.isDangerous ? 80 : 60,
        status: 'active',
        isSystem: true,
        isDangerous: perm.isDangerous || false,
        icon: 'project-diagram',
        color: '#52c41a',
        sortOrder: index + 1,
      });
    });
    
    // 需求管理权限
    const requirementPermissions = [
      { action: 'create', name: '创建需求', description: '创建新需求' },
      { action: 'read', name: '查看需求', description: '查看需求信息' },
      { action: 'update', name: '编辑需求', description: '编辑需求信息' },
      { action: 'delete', name: '删除需求', description: '删除需求' },
      { action: 'assign', name: '分配需求', description: '分配需求给用户' },
      { action: 'review', name: '评审需求', description: '评审需求' },
      { action: 'approve', name: '审批需求', description: '审批需求' },
      { action: 'comment', name: '评论需求', description: '对需求进行评论' },
    ];
    
    requirementPermissions.forEach((perm, index) => {
      permissions.push({
        code: `requirement:${perm.action}`,
        name: perm.name,
        description: perm.description,
        module: 'requirement',
        category: 'business',
        action: perm.action as any,
        level: 60,
        status: 'active',
        isSystem: true,
        isDangerous: false,
        icon: 'file-text',
        color: '#fa8c16',
        sortOrder: index + 1,
      });
    });
    
    // 原型管理权限
    const prototypePermissions = [
      { action: 'create', name: '创建原型', description: '创建新原型' },
      { action: 'read', name: '查看原型', description: '查看原型信息' },
      { action: 'update', name: '编辑原型', description: '编辑原型信息' },
      { action: 'delete', name: '删除原型', description: '删除原型' },
      { action: 'publish', name: '发布原型', description: '发布原型' },
      { action: 'share', name: '分享原型', description: '分享原型给他人' },
      { action: 'comment', name: '评论原型', description: '对原型进行评论' },
    ];
    
    prototypePermissions.forEach((perm, index) => {
      permissions.push({
        code: `prototype:${perm.action}`,
        name: perm.name,
        description: perm.description,
        module: 'prototype',
        category: 'business',
        action: perm.action as any,
        level: 60,
        status: 'active',
        isSystem: true,
        isDangerous: false,
        icon: 'layout',
        color: '#eb2f96',
        sortOrder: index + 1,
      });
    });
    
    // 物料管理权限
    const materialPermissions = [
      { action: 'create', name: '创建物料', description: '创建新物料' },
      { action: 'read', name: '查看物料', description: '查看物料信息' },
      { action: 'update', name: '编辑物料', description: '编辑物料信息' },
      { action: 'delete', name: '删除物料', description: '删除物料' },
      { action: 'publish', name: '发布物料', description: '发布物料' },
      { action: 'download', name: '下载物料', description: '下载物料文件' },
      { action: 'upload', name: '上传物料', description: '上传物料文件' },
    ];
    
    materialPermissions.forEach((perm, index) => {
      permissions.push({
        code: `material:${perm.action}`,
        name: perm.name,
        description: perm.description,
        module: 'material',
        category: 'business',
        action: perm.action as any,
        level: 60,
        status: 'active',
        isSystem: true,
        isDangerous: false,
        icon: 'appstore',
        color: '#722ed1',
        sortOrder: index + 1,
      });
    });
    
    // 系统管理权限
    const systemPermissions = [
      { action: 'read', name: '查看系统设置', description: '查看系统配置信息' },
      { action: 'update', name: '修改系统设置', description: '修改系统配置', isDangerous: true },
      { action: 'manage', name: '系统管理', description: '完整的系统管理权限', isDangerous: true },
    ];
    
    systemPermissions.forEach((perm, index) => {
      permissions.push({
        code: `system:${perm.action}`,
        name: perm.name,
        description: perm.description,
        module: 'system',
        category: 'system',
        action: perm.action as any,
        level: perm.isDangerous ? 100 : 80,
        status: 'active',
        isSystem: true,
        isDangerous: perm.isDangerous || false,
        icon: 'setting',
        color: '#ff4d4f',
        sortOrder: index + 1,
      });
    });
    
    return permissions;
  }
}