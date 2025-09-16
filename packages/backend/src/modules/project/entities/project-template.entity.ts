import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProjectType, ProjectVisibility, TemplateCategory } from '../../../common/enums';
import { User } from '../../user/entities/user.entity';
import { Project } from './project.entity';

/**
 * 项目模板实体
 */
@Entity('project_templates')
@Index(['name'])
@Index(['category'])
@Index(['type'])
@Index(['isPublic'])
@Index(['createdBy'])
export class ProjectTemplate extends BaseEntity {
  @ApiProperty({ description: '模板名称' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '模板名称',
  })
  name: string;

  @ApiProperty({ description: '模板描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '模板描述',
  })
  description?: string;

  @ApiProperty({ description: '模板分类', enum: TemplateCategory })
  @Column({
    type: 'enum',
    enum: TemplateCategory,
    comment: '模板分类',
  })
  category: TemplateCategory;

  @ApiProperty({ description: '项目类型', enum: ProjectType })
  @Column({
    type: 'enum',
    enum: ProjectType,
    comment: '项目类型',
  })
  type: ProjectType;

  @ApiProperty({ description: '模板图标', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '模板图标URL',
  })
  icon?: string;

  @ApiProperty({ description: '模板封面', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '模板封面URL',
  })
  cover?: string;

  @ApiProperty({ description: '模板颜色', required: false })
  @Column({
    type: 'varchar',
    length: 7,
    nullable: true,
    comment: '模板颜色（十六进制）',
  })
  color?: string;

  @ApiProperty({ description: '是否公开模板' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否公开模板',
  })
  isPublic: boolean;

  @ApiProperty({ description: '是否为系统模板' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为系统模板',
  })
  isSystem: boolean;

  @ApiProperty({ description: '是否为推荐模板' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为推荐模板',
  })
  isRecommended: boolean;

  @ApiProperty({ description: '模板版本' })
  @Column({
    type: 'varchar',
    length: 20,
    default: '1.0.0',
    comment: '模板版本',
  })
  version: string;

  @ApiProperty({ description: '模板标签', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '模板标签',
  })
  tags?: string[];

  @ApiProperty({ description: '使用次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '使用次数',
  })
  usageCount: number;

  @ApiProperty({ description: '评分' })
  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    comment: '评分（0-5）',
  })
  rating: number;

  @ApiProperty({ description: '评分次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '评分次数',
  })
  ratingCount: number;

  @ApiProperty({ description: '创建者ID' })
  @Column({
    type: 'uuid',
    comment: '创建者ID',
  })
  createdBy: string;

  @ApiProperty({ description: '模板配置' })
  @Column({
    type: 'json',
    comment: '模板配置',
  })
  config: {
    // 项目基础配置
    project: {
      defaultVisibility?: ProjectVisibility;
      defaultSettings?: Record<string, any>;
      requiredFields?: string[];
      optionalFields?: string[];
    };
    
    // 需求模板
    requirements?: {
      templates: Array<{
        name: string;
        description?: string;
        type: string;
        priority?: string;
        fields?: Record<string, any>;
      }>;
      categories?: string[];
    };
    
    // 原型模板
    prototypes?: {
      templates: Array<{
        name: string;
        description?: string;
        type: string;
        pages?: Array<{
          name: string;
          description?: string;
          components?: any[];
        }>;
      }>;
    };
    
    // 物料模板
    materials?: {
      categories: string[];
      defaultMaterials?: Array<{
        name: string;
        type: string;
        category: string;
        url?: string;
        description?: string;
      }>;
    };
    
    // 团队角色模板
    roles?: Array<{
      name: string;
      permissions: string[];
      description?: string;
    }>;
    
    // 工作流模板
    workflows?: Array<{
      name: string;
      description?: string;
      stages: Array<{
        name: string;
        description?: string;
        actions?: string[];
      }>;
    }>;
  };

  @ApiProperty({ description: '模板内容', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '模板内容（预设数据）',
  })
  content?: {
    requirements?: any[];
    prototypes?: any[];
    materials?: any[];
    documents?: any[];
  };

  @ApiProperty({ description: '模板元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '模板元数据',
  })
  metadata?: {
    author?: string;
    authorEmail?: string;
    website?: string;
    repository?: string;
    license?: string;
    keywords?: string[];
    changelog?: Array<{
      version: string;
      date: string;
      changes: string[];
    }>;
  };

  @ApiProperty({ description: '安装说明', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '安装说明',
  })
  installInstructions?: string;

  @ApiProperty({ description: '使用说明', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '使用说明',
  })
  usageInstructions?: string;

  @ApiProperty({ description: '最后更新时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后更新时间',
  })
  lastUpdatedAt?: Date;

  // 关联关系
  @ApiProperty({ description: '创建者', type: () => User })
  @ManyToOne(() => User, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ApiProperty({ description: '使用该模板的项目', type: () => [Project] })
  @OneToMany(() => Project, project => project.template)
  projects: Project[];

  /**
   * 检查是否可以使用
   * @param userId 用户ID
   * @returns 是否可以使用
   */
  canUse(userId?: string): boolean {
    if (this.isPublic || this.isSystem) {
      return true;
    }
    
    return userId === this.createdBy;
  }

  /**
   * 检查是否可以编辑
   * @param userId 用户ID
   * @returns 是否可以编辑
   */
  canEdit(userId: string): boolean {
    if (this.isSystem) {
      return false;
    }
    
    return userId === this.createdBy;
  }

  /**
   * 检查是否可以删除
   * @param userId 用户ID
   * @returns 是否可以删除
   */
  canDelete(userId: string): boolean {
    if (this.isSystem) {
      return false;
    }
    
    return userId === this.createdBy;
  }

  /**
   * 增加使用次数
   */
  incrementUsage(): void {
    this.usageCount += 1;
  }

  /**
   * 添加评分
   * @param rating 评分（1-5）
   */
  addRating(rating: number): void {
    if (rating < 1 || rating > 5) {
      throw new Error('评分必须在1-5之间');
    }
    
    const totalRating = this.rating * this.ratingCount + rating;
    this.ratingCount += 1;
    this.rating = Number((totalRating / this.ratingCount).toFixed(2));
  }

  /**
   * 获取分类显示名称
   * @returns 分类名称
   */
  getCategoryDisplayName(): string {
    const categoryNames = {
      [TemplateCategory.WEB_DEVELOPMENT]: 'Web开发',
      [TemplateCategory.MOBILE_DEVELOPMENT]: '移动开发',
      [TemplateCategory.DESKTOP_DEVELOPMENT]: '桌面开发',
      [TemplateCategory.GAME_DEVELOPMENT]: '游戏开发',
      [TemplateCategory.DATA_SCIENCE]: '数据科学',
      [TemplateCategory.MACHINE_LEARNING]: '机器学习',
      [TemplateCategory.DEVOPS]: 'DevOps',
      [TemplateCategory.DESIGN]: '设计',
      [TemplateCategory.MARKETING]: '营销',
      [TemplateCategory.BUSINESS]: '商业',
      [TemplateCategory.EDUCATION]: '教育',
      [TemplateCategory.RESEARCH]: '研究',
      [TemplateCategory.OTHER]: '其他',
    };
    
    return categoryNames[this.category] || this.category;
  }

  /**
   * 获取类型显示名称
   * @returns 类型名称
   */
  getTypeDisplayName(): string {
    const typeNames = {
      [ProjectType.WEB]: 'Web应用',
      [ProjectType.MOBILE]: '移动应用',
      [ProjectType.DESKTOP]: '桌面应用',
      [ProjectType.API]: 'API服务',
      [ProjectType.LIBRARY]: '库/框架',
      [ProjectType.TOOL]: '工具',
      [ProjectType.GAME]: '游戏',
      [ProjectType.OTHER]: '其他',
    };
    
    return typeNames[this.type] || this.type;
  }

  /**
   * 获取评分星级
   * @returns 星级数组
   */
  getStarRating(): { full: number; half: boolean; empty: number } {
    const fullStars = Math.floor(this.rating);
    const hasHalfStar = this.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return {
      full: fullStars,
      half: hasHalfStar,
      empty: emptyStars,
    };
  }

  /**
   * 检查是否为热门模板
   * @returns 是否热门
   */
  isPopular(): boolean {
    return this.usageCount >= 100 || this.rating >= 4.0;
  }

  /**
   * 检查是否为新模板
   * @returns 是否为新模板
   */
  isNew(): boolean {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return this.createdAt > oneMonthAgo;
  }

  /**
   * 获取模板预览数据
   * @returns 预览数据
   */
  getPreviewData(): {
    name: string;
    description?: string;
    category: string;
    type: string;
    icon?: string;
    cover?: string;
    rating: number;
    usageCount: number;
    isRecommended: boolean;
    isPopular: boolean;
    isNew: boolean;
    tags?: string[];
  } {
    return {
      name: this.name,
      description: this.description,
      category: this.getCategoryDisplayName(),
      type: this.getTypeDisplayName(),
      icon: this.icon,
      cover: this.cover,
      rating: this.rating,
      usageCount: this.usageCount,
      isRecommended: this.isRecommended,
      isPopular: this.isPopular(),
      isNew: this.isNew(),
      tags: this.tags,
    };
  }

  /**
   * 验证模板配置
   * @returns 验证结果
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.config) {
      errors.push('模板配置不能为空');
      return { valid: false, errors };
    }
    
    if (!this.config.project) {
      errors.push('项目配置不能为空');
    }
    
    // 验证需求模板
    if (this.config.requirements) {
      if (!Array.isArray(this.config.requirements.templates)) {
        errors.push('需求模板必须是数组');
      }
    }
    
    // 验证原型模板
    if (this.config.prototypes) {
      if (!Array.isArray(this.config.prototypes.templates)) {
        errors.push('原型模板必须是数组');
      }
    }
    
    // 验证角色模板
    if (this.config.roles) {
      if (!Array.isArray(this.config.roles)) {
        errors.push('角色模板必须是数组');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 更新最后更新时间
   */
  updateLastUpdated(): void {
    this.lastUpdatedAt = new Date();
  }

  /**
   * 克隆模板
   * @param newName 新名称
   * @param userId 用户ID
   * @returns 克隆的模板数据
   */
  clone(newName: string, userId: string): Partial<ProjectTemplate> {
    return {
      name: newName,
      description: this.description,
      category: this.category,
      type: this.type,
      icon: this.icon,
      cover: this.cover,
      color: this.color,
      isPublic: false,
      isSystem: false,
      isRecommended: false,
      version: '1.0.0',
      tags: this.tags ? [...this.tags] : undefined,
      createdBy: userId,
      config: JSON.parse(JSON.stringify(this.config)),
      content: this.content ? JSON.parse(JSON.stringify(this.content)) : undefined,
      metadata: this.metadata ? JSON.parse(JSON.stringify(this.metadata)) : undefined,
      installInstructions: this.installInstructions,
      usageInstructions: this.usageInstructions,
    };
  }
}