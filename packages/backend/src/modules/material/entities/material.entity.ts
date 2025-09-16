import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { MaterialType, MaterialStatus, MaterialCategory } from '../../../common/enums';
import { User } from '../../user/entities/user.entity';
import { Project } from '../../project/entities/project.entity';
import { MaterialTag } from './material-tag.entity';
import { MaterialVersion } from './material-version.entity';
import { MaterialComment } from './material-comment.entity';
import { MaterialConfig } from './material-config.entity';
import { MaterialMetadata } from './material-metadata.entity';
import { MaterialStatistics } from './material-statistics.entity';
import { MaterialSettings } from './material-settings.entity';
import { MaterialCustomFields } from './material-custom-fields.entity';

/**
 * 物料实体
 */
@Entity('materials')
@Index(['code'], { unique: true })
@Index(['name'])
@Index(['type'])
@Index(['category'])
@Index(['status'])
@Index(['creatorId'])
@Index(['projectId'])
@Index(['isPublic'])
@Index(['isTemplate'])
@Index(['createdAt'])
export class Material extends BaseEntity {
  @ApiProperty({ description: '物料编号' })
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '物料编号',
  })
  code: string;

  @ApiProperty({ description: '物料名称' })
  @Column({
    type: 'varchar',
    length: 200,
    comment: '物料名称',
  })
  name: string;

  @ApiProperty({ description: '物料描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '物料描述',
  })
  description?: string;

  @ApiProperty({ description: '物料类型', enum: MaterialType })
  @Column({
    type: 'enum',
    enum: MaterialType,
    comment: '物料类型',
  })
  type: MaterialType;

  @ApiProperty({ description: '物料分类', enum: MaterialCategory })
  @Column({
    type: 'enum',
    enum: MaterialCategory,
    comment: '物料分类',
  })
  category: MaterialCategory;

  @ApiProperty({ description: '物料状态', enum: MaterialStatus })
  @Column({
    type: 'enum',
    enum: MaterialStatus,
    default: MaterialStatus.DRAFT,
    comment: '物料状态',
  })
  status: MaterialStatus;

  @ApiProperty({ description: '创建者ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '创建者ID',
  })
  creatorId: string;

  @ApiProperty({ description: '项目ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '所属项目ID',
  })
  projectId?: string;

  @ApiProperty({ description: '父物料ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '父物料ID（用于物料继承）',
  })
  parentId?: string;

  @ApiProperty({ description: '物料版本' })
  @Column({
    type: 'varchar',
    length: 50,
    default: '1.0.0',
    comment: '物料版本',
  })
  version: string;

  @ApiProperty({ description: '物料图标', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '物料图标URL',
  })
  icon?: string;

  @ApiProperty({ description: '物料缩略图', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '物料缩略图URL',
  })
  thumbnail?: string;

  @ApiProperty({ description: '物料预览图', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '物料预览图URLs',
  })
  previewImages?: string[];

  // 物料配置关联已移至 MaterialConfig 实体

  @ApiProperty({ description: '物料内容' })
  @Column({
    type: 'longtext',
    comment: '物料内容（代码、模板等）',
  })
  content: string;

  @ApiProperty({ description: '物料样式', required: false })
  @Column({
    type: 'longtext',
    nullable: true,
    comment: '物料样式（CSS等）',
  })
  styles?: string;

  @ApiProperty({ description: '物料脚本', required: false })
  @Column({
    type: 'longtext',
    nullable: true,
    comment: '物料脚本（JavaScript等）',
  })
  scripts?: string;

  @ApiProperty({ description: '物料文档', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '物料使用文档',
  })
  documentation?: string;

  @ApiProperty({ description: '使用示例', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '物料使用示例',
  })
  examples?: string;

  // 物料元数据关联已移至 MaterialMetadata 实体

  // 物料统计关联已移至 MaterialStatistics 实体

  // 物料设置关联已移至 MaterialSettings 实体

  @ApiProperty({ description: '是否公开' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否公开',
  })
  isPublic: boolean;

  @ApiProperty({ description: '是否为模板' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为模板',
  })
  isTemplate: boolean;

  @ApiProperty({ description: '是否为官方物料' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为官方物料',
  })
  isOfficial: boolean;

  @ApiProperty({ description: '是否已验证' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否已验证',
  })
  isVerified: boolean;

  @ApiProperty({ description: '是否推荐' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否推荐',
  })
  isRecommended: boolean;

  @ApiProperty({ description: '是否已弃用' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否已弃用',
  })
  isDeprecated: boolean;

  @ApiProperty({ description: '排序权重' })
  @Column({
    type: 'int',
    default: 0,
    comment: '排序权重',
  })
  sortOrder: number;

  @ApiProperty({ description: '下载次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '下载次数',
  })
  downloadCount: number;

  @ApiProperty({ description: '使用次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '使用次数',
  })
  useCount: number;

  @ApiProperty({ description: '点赞数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '点赞数',
  })
  likeCount: number;

  @ApiProperty({ description: '收藏数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '收藏数',
  })
  favoriteCount: number;

  @ApiProperty({ description: '评分' })
  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    comment: '平均评分',
  })
  rating: number;

  @ApiProperty({ description: '评分次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '评分次数',
  })
  ratingCount: number;

  @ApiProperty({ description: '文件大小（字节）' })
  @Column({
    type: 'bigint',
    default: 0,
    comment: '文件大小（字节）',
  })
  fileSize: number;

  @ApiProperty({ description: '压缩后大小（字节）' })
  @Column({
    type: 'bigint',
    default: 0,
    comment: '压缩后大小（字节）',
  })
  compressedSize: number;

  @ApiProperty({ description: '最后使用时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后使用时间',
  })
  lastUsedAt?: Date;

  @ApiProperty({ description: '发布时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '发布时间',
  })
  publishedAt?: Date;

  @ApiProperty({ description: '弃用时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '弃用时间',
  })
  deprecatedAt?: Date;

  // 自定义字段关联已移至 MaterialCustomFields 实体

  // 关联关系
  @ApiProperty({ description: '创建者', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ApiProperty({ description: '所属项目', type: () => Project })
  @ManyToOne(() => Project, project => project.materials)
  @JoinColumn({ name: 'projectId' })
  project?: Project;

  @ApiProperty({ description: '父物料', type: () => Material })
  @ManyToOne(() => Material, material => material.children)
  @JoinColumn({ name: 'parentId' })
  parent?: Material;

  @ApiProperty({ description: '子物料', type: () => [Material] })
  @OneToMany(() => Material, material => material.parent)
  children: Material[];

  @ApiProperty({ description: '物料标签', type: () => [MaterialTag] })
  @ManyToMany(() => MaterialTag, tag => tag.materials)
  @JoinTable({
    name: 'material_tag_relations',
    joinColumn: { name: 'materialId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: MaterialTag[];

  @ApiProperty({ description: '物料版本', type: () => [MaterialVersion] })
  @OneToMany(() => MaterialVersion, version => version.material)
  versions: MaterialVersion[];

  @ApiProperty({ description: '物料评论', type: () => [MaterialComment] })
  @OneToMany(() => MaterialComment, comment => comment.material)
  comments: MaterialComment[];

  // 关联的拆分实体
  @ApiProperty({ description: '物料配置', type: () => MaterialConfig })
  @OneToOne(() => MaterialConfig, config => config.material)
  config: MaterialConfig;

  @ApiProperty({ description: '物料元数据', type: () => MaterialMetadata })
  @OneToOne(() => MaterialMetadata, metadata => metadata.material)
  metadata: MaterialMetadata;

  @ApiProperty({ description: '物料统计', type: () => MaterialStatistics })
  @OneToOne(() => MaterialStatistics, statistics => statistics.material)
  statistics: MaterialStatistics;

  @ApiProperty({ description: '物料设置', type: () => MaterialSettings })
  @OneToOne(() => MaterialSettings, settings => settings.material)
  settings: MaterialSettings;

  // 自定义字段关联
  @ApiProperty({ description: '物料自定义字段', type: () => MaterialCustomFields })
  @OneToOne(() => MaterialCustomFields, customFields => customFields.material)
  customFields: MaterialCustomFields;

  /**
   * 检查是否可以编辑
   * @param userId 用户ID
   * @returns 是否可以编辑
   */
  canEdit(userId: string): boolean {
    return this.creatorId === userId || this.status === MaterialStatus.DRAFT;
  }

  /**
   * 检查是否可以删除
   * @param userId 用户ID
   * @returns 是否可以删除
   */
  canDelete(userId: string): boolean {
    return this.creatorId === userId && 
           [MaterialStatus.DRAFT, MaterialStatus.REJECTED].includes(this.status);
  }

  /**
   * 检查是否可以发布
   * @returns 是否可以发布
   */
  canPublish(): boolean {
    return [MaterialStatus.DRAFT, MaterialStatus.REJECTED].includes(this.status) && this.content && !!this.config;
  }

  /**
   * 获取配置值
   */
  getConfigValue(key: string): any {
    return this.config?.getConfigValue(key);
  }

  /**
   * 设置配置值
   */
  setConfigValue(key: string, value: any): void {
    if (this.config) {
      this.config.setConfigValue(key, value);
    }
    this.updatedAt = new Date();
  }

  /**
   * 获取元数据值
   */
  getMetadataValue(key: string): any {
    return this.metadata?.getMetadataValue(key);
  }

  /**
   * 设置元数据值
   */
  setMetadataValue(key: string, value: any): void {
    if (this.metadata) {
      this.metadata.setMetadataValue(key, value);
    }
    this.updatedAt = new Date();
  }

  /**
   * 获取设置值
   */
  getSettingValue(key: string): any {
    return this.settings?.getSettingValue(key);
  }

  /**
   * 设置设置值
   */
  setSettingValue(key: string, value: any): void {
    if (this.settings) {
      this.settings.setSettingValue(key, value);
    }
    this.updatedAt = new Date();
  }

  /**
   * 检查是否可以下载
   * @returns 是否可以下载
   */
  canDownload(): boolean {
    return this.status === MaterialStatus.PUBLISHED && !this.isDeprecated && this.settings?.allowDownload !== false;
  }

  /**
   * 检查是否可以使用
   * @returns 是否可以使用
   */
  canUse(): boolean {
    return this.status === MaterialStatus.PUBLISHED && !this.isDeprecated;
  }

  /**
   * 检查是否可以评论
   * @returns 是否可以评论
   */
  canComment(): boolean {
    return this.status === MaterialStatus.PUBLISHED && this.settings?.allowComment !== false;
  }

  /**
   * 检查是否可以评分
   * @returns 是否可以评分
   */
  canRate(): boolean {
    return this.status === MaterialStatus.PUBLISHED && this.settings?.allowRating !== false;
  }

  /**
   * 检查是否可以Fork
   * @returns 是否可以Fork
   */
  canFork(): boolean {
    return this.status === MaterialStatus.PUBLISHED && this.settings?.allowFork !== false;
  }

  /**
   * 检查是否为组件类型
   * @returns 是否为组件
   */
  isComponent(): boolean {
    return this.type === MaterialType.COMPONENT;
  }

  /**
   * 检查是否为模板类型
   * @returns 是否为模板
   */
  isTemplateType(): boolean {
    return this.type === MaterialType.TEMPLATE;
  }

  /**
   * 检查是否为区块类型
   * @returns 是否为区块
   */
  isBlock(): boolean {
    return this.type === MaterialType.BLOCK;
  }

  /**
   * 检查是否为页面类型
   * @returns 是否为页面
   */
  isPage(): boolean {
    return this.type === MaterialType.PAGE;
  }

  /**
   * 检查是否为主题类型
   * @returns 是否为主题
   */
  isTheme(): boolean {
    return this.type === MaterialType.THEME;
  }

  /**
   * 检查是否为插件类型
   * @returns 是否为插件
   */
  isPlugin(): boolean {
    return this.type === MaterialType.PLUGIN;
  }

  /**
   * 发布物料
   */
  publish(): void {
    if (this.canPublish()) {
      this.status = MaterialStatus.PUBLISHED;
      this.publishedAt = new Date();
    }
  }

  /**
   * 弃用物料
   */
  deprecate(): void {
    this.isDeprecated = true;
    this.deprecatedAt = new Date();
  }

  /**
   * 取消弃用
   */
  undeprecate(): void {
    this.isDeprecated = false;
    this.deprecatedAt = null;
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
   * 标记为官方
   */
  markAsOfficial(): void {
    this.isOfficial = true;
  }

  /**
   * 取消官方标记
   */
  unmarkAsOfficial(): void {
    this.isOfficial = false;
  }

  /**
   * 标记为已验证
   */
  markAsVerified(): void {
    this.isVerified = true;
  }

  /**
   * 取消验证标记
   */
  unmarkAsVerified(): void {
    this.isVerified = false;
  }

  /**
   * 增加下载次数
   */
  incrementDownloadCount(): void {
    this.downloadCount += 1;
    if (this.statistics) {
      this.statistics.incrementDownloadCount();
    }
    this.updateLastUsed();
  }

  /**
   * 增加使用次数
   */
  incrementUseCount(): void {
    this.useCount += 1;
    if (this.statistics) {
      this.statistics.incrementUseCount();
    }
    this.updateLastUsed();
  }

  /**
   * 增加点赞数
   */
  incrementLikeCount(): void {
    this.likeCount += 1;
    if (this.statistics) {
      this.statistics.incrementLikeCount();
    }
  }

  /**
   * 减少点赞数
   */
  decrementLikeCount(): void {
    if (this.likeCount > 0) {
      this.likeCount -= 1;
    }
    if (this.statistics) {
      this.statistics.decrementLikeCount();
    }
  }

  /**
   * 增加收藏数
   */
  incrementFavoriteCount(): void {
    this.favoriteCount += 1;
    if (this.statistics) {
      this.statistics.incrementFavoriteCount();
    }
  }

  /**
   * 减少收藏数
   */
  decrementFavoriteCount(): void {
    if (this.favoriteCount > 0) {
      this.favoriteCount -= 1;
    }
    if (this.statistics) {
      this.statistics.decrementFavoriteCount();
    }
  }

  /**
   * 更新评分
   * @param newRating 新评分
   */
  updateRating(newRating: number): void {
    const totalRating = this.rating * this.ratingCount + newRating;
    this.ratingCount += 1;
    this.rating = Number((totalRating / this.ratingCount).toFixed(2));
    if (this.statistics) {
      this.statistics.updateRating(newRating);
    }
  }

  /**
   * 更新最后使用时间
   */
  updateLastUsed(): void {
    this.lastUsedAt = new Date();
  }

  /**
   * 更新统计信息
   * @param stats 统计信息
   */
  updateStats(stats: {
    viewCount?: number;
    downloadCount?: number;
    useCount?: number;
    likeCount?: number;
    forkCount?: number;
    starCount?: number;
    commentCount?: number;
    ratingCount?: number;
    averageRating?: number;
    lastUsedAt?: Date;
    popularityScore?: number;
  }): void {
    if (this.statistics) {
      Object.assign(this.statistics, stats);
    }
  }

  /**
   * 计算流行度评分
   * @returns 流行度评分
   */
  calculatePopularityScore(): number {
    const weights = {
      download: 0.3,
      use: 0.25,
      like: 0.2,
      rating: 0.15,
      comment: 0.1,
    };
    
    const normalizedDownload = Math.min(this.downloadCount / 1000, 1);
    const normalizedUse = Math.min(this.useCount / 500, 1);
    const normalizedLike = Math.min(this.likeCount / 100, 1);
    const normalizedRating = this.rating / 5;
    const normalizedComment = Math.min((this.statistics?.commentCount || 0) / 50, 1);
    
    return Number((
      normalizedDownload * weights.download +
      normalizedUse * weights.use +
      normalizedLike * weights.like +
      normalizedRating * weights.rating +
      normalizedComment * weights.comment
    ).toFixed(2));
  }

  /**
   * 添加标签
   * @param tag 标签
   */
  addTag(tag: MaterialTag): void {
    if (!this.tags) {
      this.tags = [];
    }
    
    if (!this.tags.find(t => t.id === tag.id)) {
      this.tags.push(tag);
    }
  }

  /**
   * 移除标签
   * @param tagId 标签ID
   */
  removeTag(tagId: string): void {
    if (this.tags) {
      this.tags = this.tags.filter(tag => tag.id !== tagId);
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
   * 获取物料信息
   * @returns 物料信息
   */
  getInfo(): {
    id: string;
    code: string;
    name: string;
    description?: string;
    type: MaterialType;
    category: MaterialCategory;
    status: MaterialStatus;
    version: string;
    icon?: string;
    thumbnail?: string;
    isPublic: boolean;
    isTemplate: boolean;
    isOfficial: boolean;
    isVerified: boolean;
    isRecommended: boolean;
    isDeprecated: boolean;
    downloadCount: number;
    useCount: number;
    likeCount: number;
    favoriteCount: number;
    rating: number;
    ratingCount: number;
    fileSize: number;
    compressedSize: number;
    creatorId: string;
    projectId?: string;
    parentId?: string;
    lastUsedAt?: Date;
    publishedAt?: Date;
    deprecatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      type: this.type,
      category: this.category,
      status: this.status,
      version: this.version,
      icon: this.icon,
      thumbnail: this.thumbnail,
      isPublic: this.isPublic,
      isTemplate: this.isTemplate,
      isOfficial: this.isOfficial,
      isVerified: this.isVerified,
      isRecommended: this.isRecommended,
      isDeprecated: this.isDeprecated,
      downloadCount: this.downloadCount,
      useCount: this.useCount,
      likeCount: this.likeCount,
      favoriteCount: this.favoriteCount,
      rating: this.rating,
      ratingCount: this.ratingCount,
      fileSize: this.fileSize,
      compressedSize: this.compressedSize,
      creatorId: this.creatorId,
      projectId: this.projectId,
      parentId: this.parentId,
      lastUsedAt: this.lastUsedAt,
      publishedAt: this.publishedAt,
      deprecatedAt: this.deprecatedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * 生成物料编号
   * @param type 物料类型
   * @param category 物料分类
   * @returns 物料编号
   */
  static generateCode(type: MaterialType, category: MaterialCategory): string {
    const typePrefix = {
      [MaterialType.COMPONENT]: 'COMP',
      [MaterialType.TEMPLATE]: 'TMPL',
      [MaterialType.BLOCK]: 'BLOCK',
      [MaterialType.PAGE]: 'PAGE',
      [MaterialType.THEME]: 'THEME',
      [MaterialType.PLUGIN]: 'PLUGIN',
    }[type];
    
    const categoryPrefix = {
      [MaterialCategory.BASIC]: 'B',
      [MaterialCategory.FORM]: 'F',
      [MaterialCategory.LAYOUT]: 'L',
      [MaterialCategory.NAVIGATION]: 'N',
      [MaterialCategory.DATA_DISPLAY]: 'D',
      [MaterialCategory.FEEDBACK]: 'FB',
      [MaterialCategory.BUSINESS]: 'BZ',
      [MaterialCategory.CHART]: 'C',
      [MaterialCategory.MEDIA]: 'M',
      [MaterialCategory.OTHER]: 'O',
    }[category];
    
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    return `${typePrefix}_${categoryPrefix}_${timestamp}_${random}`;
  }

  /**
   * 验证物料数据
   * @param data 物料数据
   * @returns 验证结果
   */
  static validate(data: Partial<Material>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('物料名称不能为空');
    }
    
    if (!data.type) {
      errors.push('物料类型不能为空');
    }
    
    if (!data.category) {
      errors.push('物料分类不能为空');
    }
    
    if (!data.content || data.content.trim().length === 0) {
      errors.push('物料内容不能为空');
    }
    
    if (!data.content || data.content.trim().length === 0) {
      errors.push('物料内容不能为空');
    }
    
    if (!data.creatorId) {
      errors.push('创建者ID不能为空');
    }
    
    if (data.rating && (data.rating < 0 || data.rating > 5)) {
      errors.push('评分必须在0-5之间');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建物料实例
   * @param data 物料数据
   * @returns 物料实例
   */
  static create(data: {
    name: string;
    type: MaterialType;
    category: MaterialCategory;
    content: string;
    creatorId: string;
    description?: string;
    projectId?: string;
    parentId?: string;
    icon?: string;
    thumbnail?: string;
    styles?: string;
    scripts?: string;
    documentation?: string;
    examples?: string;
    isPublic?: boolean;
    isTemplate?: boolean;
  }): Partial<Material> {
    return {
      code: Material.generateCode(data.type, data.category),
      name: data.name,
      description: data.description,
      type: data.type,
      category: data.category,
      content: data.content,
      // config关联实体需要在服务层单独创建
      creatorId: data.creatorId,
      projectId: data.projectId,
      parentId: data.parentId,
      icon: data.icon,
      thumbnail: data.thumbnail,
      styles: data.styles,
      scripts: data.scripts,
      documentation: data.documentation,
      examples: data.examples,
      version: '1.0.0',
      status: MaterialStatus.DRAFT,
      isPublic: data.isPublic || false,
      isTemplate: data.isTemplate || false,
      isOfficial: false,
      isVerified: false,
      isRecommended: false,
      isDeprecated: false,
      sortOrder: 0,
      downloadCount: 0,
      useCount: 0,
      likeCount: 0,
      favoriteCount: 0,
      rating: 0,
      ratingCount: 0,
      fileSize: 0,
      compressedSize: 0,
    };
  }
}