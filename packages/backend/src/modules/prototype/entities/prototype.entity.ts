import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PrototypeStatus, PrototypeType } from '../../../common/enums';
import { Project } from '../../project/entities/project.entity';
import { User } from '../../user/entities/user.entity';
import { Requirement } from '../../requirement/entities/requirement.entity';
import { PrototypePage } from './prototype-page.entity';
import { PrototypeComment } from './prototype-comment.entity';
import { PrototypeVersion } from './prototype-version.entity';
import { PrototypeConfig } from './prototype-config.entity';

/**
 * 原型实体
 */
@Entity('prototypes')
@Index(['projectId'])
@Index(['creatorId'])
@Index(['status'])
@Index(['type'])
@Index(['code'], { unique: true })
export class Prototype extends BaseEntity {
  @ApiProperty({ description: '原型编号' })
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '原型编号',
  })
  code: string;

  @ApiProperty({ description: '原型名称' })
  @Column({
    type: 'varchar',
    length: 200,
    comment: '原型名称',
  })
  name: string;

  @ApiProperty({ description: '原型描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '原型描述',
  })
  description?: string;

  @ApiProperty({ description: '原型类型', enum: PrototypeType })
  @Column({
    type: 'enum',
    enum: PrototypeType,
    default: PrototypeType.LOW_FIDELITY,
    comment: '原型类型',
  })
  type: PrototypeType;

  @ApiProperty({ description: '原型状态', enum: PrototypeStatus })
  @Column({
    type: 'enum',
    enum: PrototypeStatus,
    default: PrototypeStatus.DRAFT,
    comment: '原型状态',
  })
  status: PrototypeStatus;

  @ApiProperty({ description: '项目ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '项目ID',
  })
  projectId: string;

  @ApiProperty({ description: '创建者ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '创建者ID',
  })
  creatorId: string;

  @ApiProperty({ description: '当前版本号' })
  @Column({
    type: 'varchar',
    length: 20,
    default: '1.0.0',
    comment: '当前版本号',
  })
  currentVersion: string;

  @ApiProperty({ description: '设备类型', required: false })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '设备类型（desktop, mobile, tablet, etc.）',
  })
  deviceType?: string;

  // 屏幕尺寸、设计规范、原型配置已移至 PrototypeConfig 实体

  @ApiProperty({ description: '封面图片URL', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '封面图片URL',
  })
  coverImageUrl?: string;

  @ApiProperty({ description: '预览URL', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '预览URL',
  })
  previewUrl?: string;

  @ApiProperty({ description: '分享链接', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '分享链接',
  })
  shareUrl?: string;

  @ApiProperty({ description: '是否公开' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否公开访问',
  })
  isPublic: boolean;

  @ApiProperty({ description: '是否为模板' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为模板',
  })
  isTemplate: boolean;

  @ApiProperty({ description: '模板分类', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '模板分类',
  })
  templateCategory?: string;

  @ApiProperty({ description: '使用次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '模板使用次数',
  })
  usageCount: number;

  @ApiProperty({ description: '点赞数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '点赞数',
  })
  likesCount: number;

  @ApiProperty({ description: '浏览次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '浏览次数',
  })
  viewsCount: number;

  @ApiProperty({ description: '页面数量' })
  @Column({
    type: 'int',
    default: 0,
    comment: '页面数量',
  })
  pagesCount: number;

  @ApiProperty({ description: '组件数量' })
  @Column({
    type: 'int',
    default: 0,
    comment: '组件数量',
  })
  componentsCount: number;

  @ApiProperty({ description: '交互数量' })
  @Column({
    type: 'int',
    default: 0,
    comment: '交互数量',
  })
  interactionsCount: number;

  @ApiProperty({ description: '发布时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '发布时间',
  })
  publishedAt?: Date;

  @ApiProperty({ description: '最后编辑时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后编辑时间',
  })
  lastEditedAt?: Date;

  @ApiProperty({ description: '原型标签', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '原型标签',
  })
  tags?: string[];

  // 自定义字段、导出配置已移至 PrototypeConfig 实体

  @ApiProperty({ description: '原型数据', required: false })
  @Column({
    type: 'longtext',
    nullable: true,
    comment: '原型数据（JSON格式）',
  })
  prototypeData?: string;

  // 关联关系
  @ApiProperty({ description: '所属项目', type: () => Project })
  @ManyToOne(() => Project, project => project.prototypes)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ApiProperty({ description: '创建者', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ApiProperty({ description: '关联需求', type: () => [Requirement] })
  @ManyToMany(() => Requirement)
  @JoinTable({
    name: 'prototype_requirements',
    joinColumn: { name: 'prototypeId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'requirementId', referencedColumnName: 'id' },
  })
  requirements: Requirement[];

  @ApiProperty({ description: '原型页面', type: () => [PrototypePage] })
  @OneToMany(() => PrototypePage, page => page.prototype)
  pages: PrototypePage[];

  @ApiProperty({ description: '原型评论', type: () => [PrototypeComment] })
  @OneToMany(() => PrototypeComment, comment => comment.prototype)
  comments: PrototypeComment[];

  @ApiProperty({ description: '版本历史', type: () => [PrototypeVersion] })
  @OneToMany(() => PrototypeVersion, version => version.prototype)
  versions: PrototypeVersion[];

  @ApiProperty({ description: '协作者', type: () => [User] })
  @ManyToMany(() => User)
  @JoinTable({
    name: 'prototype_collaborators',
    joinColumn: { name: 'prototypeId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  collaborators: User[];

  // 配置关联
  @ApiProperty({ description: '原型配置', type: () => PrototypeConfig })
  @OneToOne(() => PrototypeConfig, config => config.prototype)
  config: PrototypeConfig;

  /**
   * 检查是否可以编辑
   * @param userId 用户ID
   * @returns 是否可以编辑
   */
  canEdit(userId: string): boolean {
    return this.creatorId === userId || this.isCollaborator(userId);
  }

  /**
   * 检查是否可以删除
   * @param userId 用户ID
   * @returns 是否可以删除
   */
  canDelete(userId: string): boolean {
    return this.creatorId === userId && this.status === PrototypeStatus.DRAFT;
  }

  /**
   * 检查是否可以发布
   * @returns 是否可以发布
   */
  canPublish(): boolean {
    return [PrototypeStatus.DRAFT, PrototypeStatus.IN_REVIEW].includes(this.status);
  }

  /**
   * 检查是否可以归档
   * @returns 是否可以归档
   */
  canArchive(): boolean {
    return [PrototypeStatus.PUBLISHED, PrototypeStatus.DEPRECATED].includes(this.status);
  }

  /**
   * 检查是否为协作者
   * @param userId 用户ID
   * @returns 是否为协作者
   */
  isCollaborator(userId: string): boolean {
    return this.collaborators?.some(collaborator => collaborator.id === userId) || false;
  }

  /**
   * 检查是否有页面
   * @returns 是否有页面
   */
  hasPages(): boolean {
    return this.pagesCount > 0;
  }

  /**
   * 检查是否为高保真原型
   * @returns 是否为高保真原型
   */
  isHighFidelity(): boolean {
    return this.type === PrototypeType.HIGH_FIDELITY;
  }

  /**
   * 检查是否为交互原型
   * @returns 是否为交互原型
   */
  isInteractive(): boolean {
    return this.type === PrototypeType.INTERACTIVE;
  }

  /**
   * 增加浏览次数
   */
  incrementViews(): void {
    this.viewsCount += 1;
  }

  /**
   * 增加点赞数
   */
  incrementLikes(): void {
    this.likesCount += 1;
  }

  /**
   * 减少点赞数
   */
  decrementLikes(): void {
    if (this.likesCount > 0) {
      this.likesCount -= 1;
    }
  }

  /**
   * 增加使用次数
   */
  incrementUsage(): void {
    this.usageCount += 1;
  }

  /**
   * 更新统计信息
   * @param stats 统计信息
   */
  updateStats(stats: {
    pagesCount?: number;
    componentsCount?: number;
    interactionsCount?: number;
  }): void {
    if (stats.pagesCount !== undefined) {
      this.pagesCount = stats.pagesCount;
    }
    if (stats.componentsCount !== undefined) {
      this.componentsCount = stats.componentsCount;
    }
    if (stats.interactionsCount !== undefined) {
      this.interactionsCount = stats.interactionsCount;
    }
  }

  /**
   * 发布原型
   */
  publish(): void {
    if (this.canPublish()) {
      this.status = PrototypeStatus.PUBLISHED;
      this.publishedAt = new Date();
    }
  }

  /**
   * 归档原型
   */
  archive(): void {
    if (this.canArchive()) {
      this.status = PrototypeStatus.ARCHIVED;
    }
  }

  /**
   * 标记为已弃用
   */
  deprecate(): void {
    this.status = PrototypeStatus.DEPRECATED;
  }

  /**
   * 更新最后编辑时间
   */
  updateLastEditedAt(): void {
    this.lastEditedAt = new Date();
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
   * 设置设计规范
   * @param specs 设计规范
   */
  setDesignSpecs(specs: {
    colorPalette?: string[];
    typography?: Record<string, any>;
    spacing?: Record<string, number>;
    components?: Record<string, any>;
  }): void {
    this.designSpecs = { ...this.designSpecs, ...specs };
  }

  /**
   * 设置原型配置
   * @param config 配置
   */
  setConfig(config: {
    theme?: string;
    layout?: string;
    navigation?: Record<string, any>;
    interactions?: Record<string, any>;
  }): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取原型的完整信息
   * @returns 原型信息
   */
  getInfo(): {
    id: string;
    code: string;
    name: string;
    description?: string;
    type: PrototypeType;
    status: PrototypeStatus;
    currentVersion: string;
    deviceType?: string;
    isPublic: boolean;
    isTemplate: boolean;
    pagesCount: number;
    componentsCount: number;
    interactionsCount: number;
    likesCount: number;
    viewsCount: number;
    usageCount: number;
    creatorId: string;
    projectId: string;
    coverImageUrl?: string;
    previewUrl?: string;
    shareUrl?: string;
    publishedAt?: Date;
    lastEditedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      type: this.type,
      status: this.status,
      currentVersion: this.currentVersion,
      deviceType: this.deviceType,
      isPublic: this.isPublic,
      isTemplate: this.isTemplate,
      pagesCount: this.pagesCount,
      componentsCount: this.componentsCount,
      interactionsCount: this.interactionsCount,
      likesCount: this.likesCount,
      viewsCount: this.viewsCount,
      usageCount: this.usageCount,
      creatorId: this.creatorId,
      projectId: this.projectId,
      coverImageUrl: this.coverImageUrl,
      previewUrl: this.previewUrl,
      shareUrl: this.shareUrl,
      publishedAt: this.publishedAt,
      lastEditedAt: this.lastEditedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * 生成原型编号
   * @param projectCode 项目代码
   * @param sequence 序号
   * @returns 原型编号
   */
  static generateCode(projectCode: string, sequence: number): string {
    return `${projectCode}-PROTO-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * 生成分享链接
   * @param prototypeId 原型ID
   * @param baseUrl 基础URL
   * @returns 分享链接
   */
  static generateShareUrl(prototypeId: string, baseUrl: string): string {
    return `${baseUrl}/prototype/share/${prototypeId}`;
  }

  /**
   * 生成预览链接
   * @param prototypeId 原型ID
   * @param baseUrl 基础URL
   * @returns 预览链接
   */
  static generatePreviewUrl(prototypeId: string, baseUrl: string): string {
    return `${baseUrl}/prototype/preview/${prototypeId}`;
  }

  /**
   * 验证原型数据
   * @param data 原型数据
   * @returns 验证结果
   */
  static validate(data: Partial<Prototype>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('原型名称不能为空');
    }
    
    if (data.name && data.name.length > 200) {
      errors.push('原型名称不能超过200个字符');
    }
    
    if (!data.projectId) {
      errors.push('项目ID不能为空');
    }
    
    if (!data.creatorId) {
      errors.push('创建者ID不能为空');
    }
    
    if (data.screenSize) {
      if (!data.screenSize.width || data.screenSize.width <= 0) {
        errors.push('屏幕宽度必须大于0');
      }
      if (!data.screenSize.height || data.screenSize.height <= 0) {
        errors.push('屏幕高度必须大于0');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建模板原型
   * @param data 原型数据
   * @returns 模板原型数据
   */
  static createTemplate(data: {
    name: string;
    description?: string;
    type: PrototypeType;
    category: string;
    deviceType?: string;
    screenSize?: { width: number; height: number; unit: string };
    designSpecs?: Record<string, any>;
    prototypeData?: string;
  }): Partial<Prototype> {
    return {
      ...data,
      isTemplate: true,
      templateCategory: data.category,
      status: PrototypeStatus.PUBLISHED,
      isPublic: true,
    };
  }

  /**
   * 从模板创建原型
   * @param template 模板原型
   * @param data 新原型数据
   * @returns 新原型数据
   */
  static createFromTemplate(
    template: Prototype,
    data: {
      name: string;
      projectId: string;
      creatorId: string;
      description?: string;
    }
  ): Partial<Prototype> {
    return {
      name: data.name,
      description: data.description || template.description,
      type: template.type,
      projectId: data.projectId,
      creatorId: data.creatorId,
      deviceType: template.deviceType,
      screenSize: template.screenSize,
      designSpecs: template.designSpecs,
      config: template.config,
      prototypeData: template.prototypeData,
      status: PrototypeStatus.DRAFT,
      isTemplate: false,
      isPublic: false,
    };
  }
}