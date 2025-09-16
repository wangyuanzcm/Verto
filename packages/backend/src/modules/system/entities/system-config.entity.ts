import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * 系统配置实体
 */
@Entity('system_configs')
@Index(['key'])
@Index(['category'])
@Index(['isActive'])
@Index(['isSystem'])
export class SystemConfig extends BaseEntity {
  @ApiProperty({ description: '配置键名' })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '配置键名',
  })
  key: string;

  @ApiProperty({ description: '配置值' })
  @Column({
    type: 'text',
    comment: '配置值',
  })
  value: string;

  @ApiProperty({ description: '配置名称' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '配置名称',
  })
  name: string;

  @ApiProperty({ description: '配置描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '配置描述',
  })
  description?: string;

  @ApiProperty({ description: '配置分类' })
  @Column({
    type: 'varchar',
    length: 50,
    comment: '配置分类',
  })
  category: string;

  @ApiProperty({ description: '数据类型' })
  @Column({
    type: 'enum',
    enum: ['string', 'number', 'boolean', 'json', 'array', 'object'],
    default: 'string',
    comment: '数据类型',
  })
  dataType: 'string' | 'number' | 'boolean' | 'json' | 'array' | 'object';

  @ApiProperty({ description: '是否激活' })
  @Column({
    type: 'boolean',
    default: true,
    comment: '是否激活',
  })
  isActive: boolean;

  @ApiProperty({ description: '是否为系统配置' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为系统配置，系统配置不可删除',
  })
  isSystem: boolean;

  @ApiProperty({ description: '是否只读' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否只读',
  })
  isReadonly: boolean;

  @ApiProperty({ description: '是否敏感信息' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否敏感信息，敏感信息不会在日志中显示',
  })
  isSensitive: boolean;

  @ApiProperty({ description: '排序权重' })
  @Column({
    type: 'int',
    default: 0,
    comment: '排序权重，数值越大越靠前',
  })
  sortOrder: number;

  @ApiProperty({ description: '默认值', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '默认值',
  })
  defaultValue?: string;

  @ApiProperty({ description: '验证规则', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '验证规则',
  })
  validation?: {
    // 基础验证
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    
    // 格式验证
    pattern?: string; // 正则表达式
    format?: 'email' | 'url' | 'ip' | 'phone' | 'date' | 'datetime';
    
    // 选项验证
    enum?: any[]; // 枚举值
    
    // 自定义验证
    custom?: {
      function: string; // 验证函数
      message: string; // 错误消息
    }[];
  };

  @ApiProperty({ description: '配置选项', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '配置选项',
  })
  options?: {
    // 显示选项
    display?: {
      type: 'input' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'switch' | 'slider' | 'color' | 'file';
      placeholder?: string;
      helpText?: string;
      width?: string;
      height?: string;
    };
    
    // 选择选项
    choices?: {
      label: string;
      value: any;
      description?: string;
      disabled?: boolean;
    }[];
    
    // 依赖选项
    dependencies?: {
      key: string; // 依赖的配置键
      value: any; // 依赖的值
      operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin';
    }[];
    
    // 权限选项
    permissions?: {
      read?: string[]; // 可读角色
      write?: string[]; // 可写角色
    };
    
    // 缓存选项
    cache?: {
      enabled: boolean;
      ttl?: number; // 缓存时间（秒）
      key?: string; // 缓存键
    };
  };

  @ApiProperty({ description: '配置元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '配置元数据',
  })
  metadata?: {
    // 版本信息
    version?: string;
    changelog?: {
      version: string;
      date: Date;
      changes: string[];
    }[];
    
    // 环境信息
    environment?: 'development' | 'testing' | 'staging' | 'production';
    
    // 标签信息
    tags?: string[];
    
    // 关联信息
    relatedConfigs?: string[]; // 相关配置键
    
    // 使用统计
    usage?: {
      readCount: number;
      writeCount: number;
      lastReadAt?: Date;
      lastWriteAt?: Date;
    };
    
    // 备份信息
    backup?: {
      enabled: boolean;
      frequency?: 'daily' | 'weekly' | 'monthly';
      retention?: number; // 保留天数
      lastBackupAt?: Date;
    };
  };

  @ApiProperty({ description: '配置历史', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '配置变更历史',
  })
  history?: {
    timestamp: Date;
    oldValue: string;
    newValue: string;
    changedBy: string;
    reason?: string;
    ip?: string;
    userAgent?: string;
  }[];

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

  /**
   * 检查是否激活
   * @returns 是否激活
   */
  isActiveConfig(): boolean {
    return this.isActive;
  }

  /**
   * 检查是否为系统配置
   * @returns 是否为系统配置
   */
  isSystemConfig(): boolean {
    return this.isSystem;
  }

  /**
   * 检查是否只读
   * @returns 是否只读
   */
  isReadonlyConfig(): boolean {
    return this.isReadonly;
  }

  /**
   * 检查是否为敏感信息
   * @returns 是否为敏感信息
   */
  isSensitiveConfig(): boolean {
    return this.isSensitive;
  }

  /**
   * 检查是否可编辑
   * @param userRole 用户角色
   * @returns 是否可编辑
   */
  canEdit(userRole: string): boolean {
    if (this.isReadonly) return false;
    
    const writeRoles = this.options?.permissions?.write;
    if (!writeRoles) return true;
    
    return writeRoles.includes(userRole) || writeRoles.includes('*');
  }

  /**
   * 检查是否可读
   * @param userRole 用户角色
   * @returns 是否可读
   */
  canRead(userRole: string): boolean {
    const readRoles = this.options?.permissions?.read;
    if (!readRoles) return true;
    
    return readRoles.includes(userRole) || readRoles.includes('*');
  }

  /**
   * 获取解析后的值
   * @returns 解析后的值
   */
  getParsedValue(): any {
    try {
      switch (this.dataType) {
        case 'number':
          return Number(this.value);
        case 'boolean':
          return this.value === 'true' || this.value === '1';
        case 'json':
        case 'array':
        case 'object':
          return JSON.parse(this.value);
        default:
          return this.value;
      }
    } catch (error) {
      console.warn(`Failed to parse config value for key ${this.key}:`, error);
      return this.value;
    }
  }

  /**
   * 设置值
   * @param value 值
   */
  setValue(value: any): void {
    switch (this.dataType) {
      case 'json':
      case 'array':
      case 'object':
        this.value = JSON.stringify(value);
        break;
      default:
        this.value = String(value);
        break;
    }
  }

  /**
   * 验证值
   * @param value 值
   * @returns 验证结果
   */
  validateValue(value: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const validation = this.validation;
    
    if (!validation) {
      return { valid: true, errors: [] };
    }
    
    // 必填验证
    if (validation.required && (value === null || value === undefined || value === '')) {
      errors.push(`${this.name}不能为空`);
    }
    
    if (value !== null && value !== undefined && value !== '') {
      // 类型验证
      switch (this.dataType) {
        case 'number':
          const num = Number(value);
          if (isNaN(num)) {
            errors.push(`${this.name}必须是数字`);
          } else {
            if (validation.min !== undefined && num < validation.min) {
              errors.push(`${this.name}不能小于${validation.min}`);
            }
            if (validation.max !== undefined && num > validation.max) {
              errors.push(`${this.name}不能大于${validation.max}`);
            }
          }
          break;
          
        case 'string':
          const str = String(value);
          if (validation.minLength !== undefined && str.length < validation.minLength) {
            errors.push(`${this.name}长度不能少于${validation.minLength}个字符`);
          }
          if (validation.maxLength !== undefined && str.length > validation.maxLength) {
            errors.push(`${this.name}长度不能超过${validation.maxLength}个字符`);
          }
          if (validation.pattern) {
            const regex = new RegExp(validation.pattern);
            if (!regex.test(str)) {
              errors.push(`${this.name}格式不正确`);
            }
          }
          break;
          
        case 'json':
        case 'array':
        case 'object':
          try {
            JSON.parse(String(value));
          } catch {
            errors.push(`${this.name}必须是有效的JSON格式`);
          }
          break;
      }
      
      // 枚举验证
      if (validation.enum && !validation.enum.includes(value)) {
        errors.push(`${this.name}必须是以下值之一：${validation.enum.join(', ')}`);
      }
      
      // 格式验证
      if (validation.format) {
        const formatPatterns = {
          email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          url: /^https?:\/\/.+/,
          ip: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
          phone: /^[1][3-9]\d{9}$/,
          date: /^\d{4}-\d{2}-\d{2}$/,
          datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
        };
        
        const pattern = formatPatterns[validation.format];
        if (pattern && !pattern.test(String(value))) {
          errors.push(`${this.name}格式不正确`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 激活配置
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * 停用配置
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * 重置为默认值
   */
  resetToDefault(): void {
    if (this.defaultValue !== null && this.defaultValue !== undefined) {
      this.value = this.defaultValue;
    }
  }

  /**
   * 记录配置变更
   * @param oldValue 旧值
   * @param newValue 新值
   * @param changedBy 修改者ID
   * @param reason 修改原因
   * @param ip IP地址
   * @param userAgent 用户代理
   */
  recordChange(
    oldValue: string,
    newValue: string,
    changedBy: string,
    reason?: string,
    ip?: string,
    userAgent?: string
  ): void {
    if (!this.history) {
      this.history = [];
    }
    
    this.history.unshift({
      timestamp: new Date(),
      oldValue,
      newValue,
      changedBy,
      reason,
      ip,
      userAgent,
    });
    
    // 保持最近100条记录
    if (this.history.length > 100) {
      this.history = this.history.slice(0, 100);
    }
  }

  /**
   * 更新使用统计
   * @param type 操作类型
   */
  updateUsageStats(type: 'read' | 'write'): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    
    if (!this.metadata.usage) {
      this.metadata.usage = {
        readCount: 0,
        writeCount: 0,
      };
    }
    
    if (type === 'read') {
      this.metadata.usage.readCount += 1;
      this.metadata.usage.lastReadAt = new Date();
    } else {
      this.metadata.usage.writeCount += 1;
      this.metadata.usage.lastWriteAt = new Date();
    }
  }

  /**
   * 获取显示值（敏感信息会被遮蔽）
   * @returns 显示值
   */
  getDisplayValue(): string {
    if (this.isSensitive) {
      return '***';
    }
    return this.value;
  }

  /**
   * 检查依赖条件
   * @param configs 所有配置
   * @returns 是否满足依赖条件
   */
  checkDependencies(configs: Map<string, SystemConfig>): boolean {
    const dependencies = this.options?.dependencies;
    if (!dependencies || dependencies.length === 0) {
      return true;
    }
    
    return dependencies.every(dep => {
      const depConfig = configs.get(dep.key);
      if (!depConfig) return false;
      
      const depValue = depConfig.getParsedValue();
      const operator = dep.operator || 'eq';
      
      switch (operator) {
        case 'eq': return depValue === dep.value;
        case 'ne': return depValue !== dep.value;
        case 'gt': return depValue > dep.value;
        case 'gte': return depValue >= dep.value;
        case 'lt': return depValue < dep.value;
        case 'lte': return depValue <= dep.value;
        case 'in': return Array.isArray(dep.value) && dep.value.includes(depValue);
        case 'nin': return Array.isArray(dep.value) && !dep.value.includes(depValue);
        default: return false;
      }
    });
  }

  /**
   * 验证配置数据
   * @param data 配置数据
   * @returns 验证结果
   */
  static validate(data: Partial<SystemConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.key || data.key.trim().length === 0) {
      errors.push('配置键名不能为空');
    }
    
    if (data.key && !/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(data.key)) {
      errors.push('配置键名格式不正确，只能包含字母、数字、点、下划线和连字符，且必须以字母开头');
    }
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('配置名称不能为空');
    }
    
    if (!data.category || data.category.trim().length === 0) {
      errors.push('配置分类不能为空');
    }
    
    if (data.value === null || data.value === undefined) {
      errors.push('配置值不能为空');
    }
    
    if (data.sortOrder && (data.sortOrder < 0 || data.sortOrder > 9999)) {
      errors.push('排序权重必须在0-9999之间');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建配置实例
   * @param data 配置数据
   * @returns 配置实例
   */
  static create(data: {
    key: string;
    value: any;
    name: string;
    description?: string;
    category: string;
    dataType?: SystemConfig['dataType'];
    isSystem?: boolean;
    isReadonly?: boolean;
    isSensitive?: boolean;
    defaultValue?: any;
    validation?: SystemConfig['validation'];
    options?: SystemConfig['options'];
    creatorId?: string;
  }): Partial<SystemConfig> {
    const config: Partial<SystemConfig> = {
      key: data.key,
      name: data.name,
      description: data.description,
      category: data.category,
      dataType: data.dataType || 'string',
      isActive: true,
      isSystem: data.isSystem || false,
      isReadonly: data.isReadonly || false,
      isSensitive: data.isSensitive || false,
      sortOrder: 0,
      validation: data.validation,
      options: data.options,
      creatorId: data.creatorId,
    };
    
    // 设置值
    const tempConfig = Object.assign(new SystemConfig(), config);
    tempConfig.setValue(data.value);
    config.value = tempConfig.value;
    
    // 设置默认值
    if (data.defaultValue !== undefined) {
      tempConfig.setValue(data.defaultValue);
      config.defaultValue = tempConfig.value;
    }
    
    return config;
  }

  /**
   * 获取默认系统配置
   * @returns 系统配置列表
   */
  static getDefaultConfigs(): Partial<SystemConfig>[] {
    return [
      {
        key: 'system.name',
        value: 'Verto',
        name: '系统名称',
        description: '系统显示名称',
        category: '基础设置',
        dataType: 'string',
        isSystem: true,
        sortOrder: 100,
      },
      {
        key: 'system.version',
        value: '1.0.0',
        name: '系统版本',
        description: '当前系统版本号',
        category: '基础设置',
        dataType: 'string',
        isSystem: true,
        isReadonly: true,
        sortOrder: 99,
      },
      {
        key: 'system.logo',
        value: '/assets/logo.png',
        name: '系统Logo',
        description: '系统Logo图片路径',
        category: '基础设置',
        dataType: 'string',
        isSystem: true,
        sortOrder: 98,
      },
      {
        key: 'system.timezone',
        value: 'Asia/Shanghai',
        name: '系统时区',
        description: '系统默认时区',
        category: '基础设置',
        dataType: 'string',
        isSystem: true,
        sortOrder: 97,
      },
      {
        key: 'auth.session_timeout',
        value: '7200',
        name: '会话超时时间',
        description: '用户会话超时时间（秒）',
        category: '认证设置',
        dataType: 'number',
        isSystem: true,
        validation: {
          required: true,
          min: 300,
          max: 86400,
        },
        sortOrder: 90,
      },
      {
        key: 'auth.password_policy',
        value: JSON.stringify({
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
          maxAge: 90,
        }),
        name: '密码策略',
        description: '用户密码复杂度要求',
        category: '认证设置',
        dataType: 'json',
        isSystem: true,
        sortOrder: 89,
      },
      {
        key: 'notification.email_enabled',
        value: 'true',
        name: '启用邮件通知',
        description: '是否启用邮件通知功能',
        category: '通知设置',
        dataType: 'boolean',
        isSystem: true,
        sortOrder: 80,
      },
      {
        key: 'notification.sms_enabled',
        value: 'false',
        name: '启用短信通知',
        description: '是否启用短信通知功能',
        category: '通知设置',
        dataType: 'boolean',
        isSystem: true,
        sortOrder: 79,
      },
      {
        key: 'storage.max_file_size',
        value: '10485760',
        name: '最大文件大小',
        description: '允许上传的最大文件大小（字节）',
        category: '存储设置',
        dataType: 'number',
        isSystem: true,
        validation: {
          required: true,
          min: 1024,
          max: 1073741824,
        },
        sortOrder: 70,
      },
      {
        key: 'storage.allowed_extensions',
        value: JSON.stringify([
          '.jpg', '.jpeg', '.png', '.gif', '.bmp',
          '.pdf', '.doc', '.docx', '.xls', '.xlsx',
          '.ppt', '.pptx', '.txt', '.zip', '.rar'
        ]),
        name: '允许的文件扩展名',
        description: '允许上传的文件扩展名列表',
        category: '存储设置',
        dataType: 'array',
        isSystem: true,
        sortOrder: 69,
      },
    ];
  }
}