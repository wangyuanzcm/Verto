import {
  Entity,
  Column,
  ManyToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Material } from './material.entity';

/**
 * 物料标签实体
 */
@Entity('material_tags')
@Index(['name'], { unique: true })
@Index(['slug'], { unique: true })
@Index(['category'])
@Index(['isSystem'])
@Index(['isActive'])
@Index(['sortOrder'])
export class MaterialTag extends BaseEntity {
  @ApiProperty({ description: '标签名称' })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '标签名称',
  })
  name: string;

  @ApiProperty({ description: '标签别名' })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '标签别名（URL友好）',
  })
  slug: string;

  @ApiProperty({ description: '标签显示名称', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '标签显示名称',
  })
  displayName?: string;

  @ApiProperty({ description: '标签描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '标签描述',
  })
  description?: string;

  @ApiProperty({ description: '标签分类', required: false })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '标签分类',
  })
  category?: string;

  @ApiProperty({ description: '标签颜色', required: false })
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '标签颜色（十六进制）',
  })
  color?: string;

  @ApiProperty({ description: '标签图标', required: false })
  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: '标签图标',
  })
  icon?: string;

  @ApiProperty({ description: '标签元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '标签元数据',
  })
  metadata?: {
    keywords?: string[];
    aliases?: string[];
    relatedTags?: string[];
    weight?: number;
    priority?: number;
    group?: string;
    level?: number;
    parent?: string;
    children?: string[];
  };

  @ApiProperty({ description: '是否为系统标签' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为系统标签',
  })
  isSystem: boolean;

  @ApiProperty({ description: '是否激活' })
  @Column({
    type: 'boolean',
    default: true,
    comment: '是否激活',
  })
  isActive: boolean;

  @ApiProperty({ description: '是否推荐' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否推荐',
  })
  isRecommended: boolean;

  @ApiProperty({ description: '是否热门' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否热门',
  })
  isHot: boolean;

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
    comment: '使用次数',
  })
  useCount: number;

  @ApiProperty({ description: '物料数量' })
  @Column({
    type: 'int',
    default: 0,
    comment: '关联的物料数量',
  })
  materialCount: number;

  @ApiProperty({ description: '最后使用时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后使用时间',
  })
  lastUsedAt?: Date;

  // 关联关系
  @ApiProperty({ description: '关联物料', type: () => [Material] })
  @ManyToMany(() => Material, material => material.tags)
  materials: Material[];

  /**
   * 检查是否可以编辑
   * @returns 是否可以编辑
   */
  canEdit(): boolean {
    return !this.isSystem;
  }

  /**
   * 检查是否可以删除
   * @returns 是否可以删除
   */
  canDelete(): boolean {
    return !this.isSystem && this.materialCount === 0;
  }

  /**
   * 检查是否为热门标签
   * @returns 是否为热门标签
   */
  isPopular(): boolean {
    return this.useCount >= 10 || this.materialCount >= 5;
  }

  /**
   * 激活标签
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * 停用标签
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * 标记为推荐
   */
  markAsRecommended(): void {
    this.isRecommended = true;
  }

  /**
   * 取消推荐
   */
  unmarkAsRecommended(): void {
    this.isRecommended = false;
  }

  /**
   * 标记为热门
   */
  markAsHot(): void {
    this.isHot = true;
  }

  /**
   * 取消热门
   */
  unmarkAsHot(): void {
    this.isHot = false;
  }

  /**
   * 增加使用次数
   */
  incrementUseCount(): void {
    this.useCount += 1;
    this.lastUsedAt = new Date();
    
    // 自动标记为热门
    if (this.useCount >= 20) {
      this.markAsHot();
    }
  }

  /**
   * 减少使用次数
   */
  decrementUseCount(): void {
    if (this.useCount > 0) {
      this.useCount -= 1;
    }
    
    // 取消热门标记
    if (this.useCount < 10) {
      this.unmarkAsHot();
    }
  }

  /**
   * 增加物料数量
   */
  incrementMaterialCount(): void {
    this.materialCount += 1;
    
    // 自动标记为热门
    if (this.materialCount >= 10) {
      this.markAsHot();
    }
  }

  /**
   * 减少物料数量
   */
  decrementMaterialCount(): void {
    if (this.materialCount > 0) {
      this.materialCount -= 1;
    }
    
    // 取消热门标记
    if (this.materialCount < 5) {
      this.unmarkAsHot();
    }
  }

  /**
   * 更新最后使用时间
   */
  updateLastUsed(): void {
    this.lastUsedAt = new Date();
  }

  /**
   * 设置元数据
   * @param metadata 元数据
   */
  setMetadata(metadata: {
    keywords?: string[];
    aliases?: string[];
    relatedTags?: string[];
    weight?: number;
    priority?: number;
    group?: string;
    level?: number;
    parent?: string;
    children?: string[];
  }): void {
    this.metadata = { ...this.metadata, ...metadata };
  }

  /**
   * 添加关键词
   * @param keyword 关键词
   */
  addKeyword(keyword: string): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    
    if (!this.metadata.keywords) {
      this.metadata.keywords = [];
    }
    
    if (!this.metadata.keywords.includes(keyword)) {
      this.metadata.keywords.push(keyword);
    }
  }

  /**
   * 移除关键词
   * @param keyword 关键词
   */
  removeKeyword(keyword: string): void {
    if (this.metadata?.keywords) {
      this.metadata.keywords = this.metadata.keywords.filter(k => k !== keyword);
    }
  }

  /**
   * 添加别名
   * @param alias 别名
   */
  addAlias(alias: string): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    
    if (!this.metadata.aliases) {
      this.metadata.aliases = [];
    }
    
    if (!this.metadata.aliases.includes(alias)) {
      this.metadata.aliases.push(alias);
    }
  }

  /**
   * 移除别名
   * @param alias 别名
   */
  removeAlias(alias: string): void {
    if (this.metadata?.aliases) {
      this.metadata.aliases = this.metadata.aliases.filter(a => a !== alias);
    }
  }

  /**
   * 添加相关标签
   * @param tagId 标签ID
   */
  addRelatedTag(tagId: string): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    
    if (!this.metadata.relatedTags) {
      this.metadata.relatedTags = [];
    }
    
    if (!this.metadata.relatedTags.includes(tagId)) {
      this.metadata.relatedTags.push(tagId);
    }
  }

  /**
   * 移除相关标签
   * @param tagId 标签ID
   */
  removeRelatedTag(tagId: string): void {
    if (this.metadata?.relatedTags) {
      this.metadata.relatedTags = this.metadata.relatedTags.filter(t => t !== tagId);
    }
  }

  /**
   * 获取标签信息
   * @returns 标签信息
   */
  getInfo(): {
    id: string;
    name: string;
    slug: string;
    displayName?: string;
    description?: string;
    category?: string;
    color?: string;
    icon?: string;
    isSystem: boolean;
    isActive: boolean;
    isRecommended: boolean;
    isHot: boolean;
    sortOrder: number;
    useCount: number;
    materialCount: number;
    lastUsedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      displayName: this.displayName,
      description: this.description,
      category: this.category,
      color: this.color,
      icon: this.icon,
      isSystem: this.isSystem,
      isActive: this.isActive,
      isRecommended: this.isRecommended,
      isHot: this.isHot,
      sortOrder: this.sortOrder,
      useCount: this.useCount,
      materialCount: this.materialCount,
      lastUsedAt: this.lastUsedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * 生成标签别名
   * @param name 标签名称
   * @returns 标签别名
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }

  /**
   * 生成随机颜色
   * @returns 十六进制颜色值
   */
  static generateRandomColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * 验证标签数据
   * @param data 标签数据
   * @returns 验证结果
   */
  static validate(data: Partial<MaterialTag>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('标签名称不能为空');
    } else if (data.name.length > 100) {
      errors.push('标签名称长度不能超过100个字符');
    }
    
    if (data.slug && data.slug.length > 100) {
      errors.push('标签别名长度不能超过100个字符');
    }
    
    if (data.displayName && data.displayName.length > 100) {
      errors.push('标签显示名称长度不能超过100个字符');
    }
    
    if (data.category && data.category.length > 50) {
      errors.push('标签分类长度不能超过50个字符');
    }
    
    if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
      errors.push('标签颜色格式不正确');
    }
    
    if (data.sortOrder && data.sortOrder < 0) {
      errors.push('排序权重不能为负数');
    }
    
    if (data.useCount && data.useCount < 0) {
      errors.push('使用次数不能为负数');
    }
    
    if (data.materialCount && data.materialCount < 0) {
      errors.push('物料数量不能为负数');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建标签实例
   * @param data 标签数据
   * @returns 标签实例
   */
  static create(data: {
    name: string;
    displayName?: string;
    description?: string;
    category?: string;
    color?: string;
    icon?: string;
    isSystem?: boolean;
    isRecommended?: boolean;
    sortOrder?: number;
  }): Partial<MaterialTag> {
    return {
      name: data.name,
      slug: MaterialTag.generateSlug(data.name),
      displayName: data.displayName || data.name,
      description: data.description,
      category: data.category,
      color: data.color || MaterialTag.generateRandomColor(),
      icon: data.icon,
      isSystem: data.isSystem || false,
      isActive: true,
      isRecommended: data.isRecommended || false,
      isHot: false,
      sortOrder: data.sortOrder || 0,
      useCount: 0,
      materialCount: 0,
    };
  }

  /**
   * 创建系统标签
   * @param data 标签数据
   * @returns 系统标签实例
   */
  static createSystemTag(data: {
    name: string;
    displayName?: string;
    description?: string;
    category?: string;
    color?: string;
    icon?: string;
    sortOrder?: number;
  }): Partial<MaterialTag> {
    return {
      ...MaterialTag.create(data),
      isSystem: true,
      isRecommended: true,
    };
  }

  /**
   * 获取默认系统标签
   * @returns 默认系统标签列表
   */
  static getDefaultSystemTags(): Partial<MaterialTag>[] {
    return [
      MaterialTag.createSystemTag({
        name: 'basic',
        displayName: '基础',
        description: '基础组件',
        category: 'component',
        color: '#4ECDC4',
        icon: 'basic',
        sortOrder: 1,
      }),
      MaterialTag.createSystemTag({
        name: 'form',
        displayName: '表单',
        description: '表单组件',
        category: 'component',
        color: '#45B7D1',
        icon: 'form',
        sortOrder: 2,
      }),
      MaterialTag.createSystemTag({
        name: 'layout',
        displayName: '布局',
        description: '布局组件',
        category: 'component',
        color: '#96CEB4',
        icon: 'layout',
        sortOrder: 3,
      }),
      MaterialTag.createSystemTag({
        name: 'navigation',
        displayName: '导航',
        description: '导航组件',
        category: 'component',
        color: '#FFEAA7',
        icon: 'navigation',
        sortOrder: 4,
      }),
      MaterialTag.createSystemTag({
        name: 'data-display',
        displayName: '数据展示',
        description: '数据展示组件',
        category: 'component',
        color: '#DDA0DD',
        icon: 'data-display',
        sortOrder: 5,
      }),
      MaterialTag.createSystemTag({
        name: 'feedback',
        displayName: '反馈',
        description: '反馈组件',
        category: 'component',
        color: '#98D8C8',
        icon: 'feedback',
        sortOrder: 6,
      }),
      MaterialTag.createSystemTag({
        name: 'business',
        displayName: '业务',
        description: '业务组件',
        category: 'component',
        color: '#F7DC6F',
        icon: 'business',
        sortOrder: 7,
      }),
      MaterialTag.createSystemTag({
        name: 'chart',
        displayName: '图表',
        description: '图表组件',
        category: 'component',
        color: '#BB8FCE',
        icon: 'chart',
        sortOrder: 8,
      }),
      MaterialTag.createSystemTag({
        name: 'media',
        displayName: '媒体',
        description: '媒体组件',
        category: 'component',
        color: '#85C1E9',
        icon: 'media',
        sortOrder: 9,
      }),
      MaterialTag.createSystemTag({
        name: 'mobile',
        displayName: '移动端',
        description: '移动端适配',
        category: 'platform',
        color: '#F8C471',
        icon: 'mobile',
        sortOrder: 10,
      }),
      MaterialTag.createSystemTag({
        name: 'responsive',
        displayName: '响应式',
        description: '响应式设计',
        category: 'feature',
        color: '#82E0AA',
        icon: 'responsive',
        sortOrder: 11,
      }),
      MaterialTag.createSystemTag({
        name: 'accessibility',
        displayName: '无障碍',
        description: '无障碍访问',
        category: 'feature',
        color: '#F1948A',
        icon: 'accessibility',
        sortOrder: 12,
      }),
    ];
  }
}