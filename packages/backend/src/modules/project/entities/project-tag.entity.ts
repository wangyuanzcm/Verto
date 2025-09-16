import {
  Entity,
  Column,
  ManyToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Project } from './project.entity';

/**
 * 项目标签实体
 */
@Entity('project_tags')
@Index(['name'], { unique: true })
@Index(['category'])
@Index(['usageCount'])
export class ProjectTag extends BaseEntity {
  @ApiProperty({ description: '标签名称' })
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '标签名称',
  })
  name: string;

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
    length: 7,
    nullable: true,
    comment: '标签颜色（十六进制）',
  })
  color?: string;

  @ApiProperty({ description: '标签图标', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '标签图标',
  })
  icon?: string;

  @ApiProperty({ description: '使用次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '使用次数',
  })
  usageCount: number;

  @ApiProperty({ description: '是否为系统标签' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为系统标签',
  })
  isSystem: boolean;

  @ApiProperty({ description: '是否为推荐标签' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为推荐标签',
  })
  isRecommended: boolean;

  @ApiProperty({ description: '标签权重' })
  @Column({
    type: 'int',
    default: 0,
    comment: '标签权重（用于排序）',
  })
  weight: number;

  @ApiProperty({ description: '标签别名', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '标签别名',
  })
  aliases?: string[];

  @ApiProperty({ description: '标签元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '标签元数据',
  })
  metadata?: Record<string, any>;

  @ApiProperty({ description: '最后使用时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后使用时间',
  })
  lastUsedAt?: Date;

  // 关联关系
  @ApiProperty({ description: '使用该标签的项目', type: () => [Project] })
  @ManyToMany(() => Project, project => project.tags)
  projects: Project[];

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
   * 增加使用次数
   */
  incrementUsage(): void {
    this.usageCount += 1;
    this.lastUsedAt = new Date();
  }

  /**
   * 减少使用次数
   */
  decrementUsage(): void {
    if (this.usageCount > 0) {
      this.usageCount -= 1;
    }
  }

  /**
   * 获取显示名称
   * @returns 显示名称
   */
  getDisplayName(): string {
    return this.displayName || this.name;
  }

  /**
   * 检查是否为热门标签
   * @returns 是否热门
   */
  isPopular(): boolean {
    return this.usageCount >= 10;
  }

  /**
   * 检查是否为新标签
   * @returns 是否为新标签
   */
  isNew(): boolean {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.createdAt > oneWeekAgo;
  }

  /**
   * 检查是否匹配搜索关键词
   * @param keyword 关键词
   * @returns 是否匹配
   */
  matches(keyword: string): boolean {
    const lowerKeyword = keyword.toLowerCase();
    
    // 检查名称
    if (this.name.toLowerCase().includes(lowerKeyword)) {
      return true;
    }
    
    // 检查显示名称
    if (this.displayName && this.displayName.toLowerCase().includes(lowerKeyword)) {
      return true;
    }
    
    // 检查描述
    if (this.description && this.description.toLowerCase().includes(lowerKeyword)) {
      return true;
    }
    
    // 检查别名
    if (this.aliases) {
      return this.aliases.some(alias => alias.toLowerCase().includes(lowerKeyword));
    }
    
    return false;
  }

  /**
   * 获取标签样式
   * @returns 样式对象
   */
  getStyle(): { color?: string; backgroundColor?: string; borderColor?: string } {
    if (!this.color) {
      return {};
    }
    
    // 如果有颜色，生成对应的样式
    const color = this.color;
    const backgroundColor = color + '20'; // 添加透明度
    const borderColor = color;
    
    return {
      color,
      backgroundColor,
      borderColor,
    };
  }

  /**
   * 获取标签的完整信息
   * @returns 标签信息
   */
  getInfo(): {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    category?: string;
    color?: string;
    icon?: string;
    usageCount: number;
    isSystem: boolean;
    isRecommended: boolean;
    isPopular: boolean;
    isNew: boolean;
    style: Record<string, string>;
  } {
    return {
      id: this.id,
      name: this.name,
      displayName: this.getDisplayName(),
      description: this.description,
      category: this.category,
      color: this.color,
      icon: this.icon,
      usageCount: this.usageCount,
      isSystem: this.isSystem,
      isRecommended: this.isRecommended,
      isPopular: this.isPopular(),
      isNew: this.isNew(),
      style: this.getStyle(),
    };
  }

  /**
   * 添加别名
   * @param alias 别名
   */
  addAlias(alias: string): void {
    if (!this.aliases) {
      this.aliases = [];
    }
    
    if (!this.aliases.includes(alias)) {
      this.aliases.push(alias);
    }
  }

  /**
   * 移除别名
   * @param alias 别名
   */
  removeAlias(alias: string): void {
    if (this.aliases) {
      this.aliases = this.aliases.filter(a => a !== alias);
    }
  }

  /**
   * 设置元数据
   * @param key 键
   * @param value 值
   */
  setMetadata(key: string, value: any): void {
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
   * 生成随机颜色
   * @returns 十六进制颜色
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
   * 创建系统标签
   * @param name 标签名称
   * @param displayName 显示名称
   * @param category 分类
   * @param color 颜色
   * @returns 标签数据
   */
  static createSystemTag(
    name: string,
    displayName?: string,
    category?: string,
    color?: string
  ): Partial<ProjectTag> {
    return {
      name,
      displayName,
      category,
      color: color || ProjectTag.generateRandomColor(),
      isSystem: true,
      isRecommended: true,
      weight: 100,
    };
  }

  /**
   * 验证标签名称
   * @param name 标签名称
   * @returns 验证结果
   */
  static validateName(name: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: '标签名称不能为空' };
    }
    
    if (name.length > 50) {
      return { valid: false, error: '标签名称不能超过50个字符' };
    }
    
    // 检查是否包含特殊字符
    const invalidChars = /[<>"'&]/;
    if (invalidChars.test(name)) {
      return { valid: false, error: '标签名称不能包含特殊字符' };
    }
    
    return { valid: true };
  }

  /**
   * 标准化标签名称
   * @param name 原始名称
   * @returns 标准化后的名称
   */
  static normalizeName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-') // 空格替换为连字符
      .replace(/[^a-z0-9\-_]/g, '') // 移除特殊字符
      .replace(/--+/g, '-') // 多个连字符合并为一个
      .replace(/^-+|-+$/g, ''); // 移除首尾连字符
  }
}