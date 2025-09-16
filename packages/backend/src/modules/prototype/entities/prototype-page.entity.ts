import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PageType, PageStatus } from '../../../common/enums';
import { Prototype } from './prototype.entity';
import { User } from '../../user/entities/user.entity';
import { PrototypeComment } from './prototype-comment.entity';

/**
 * 原型页面实体
 */
@Entity('prototype_pages')
@Index(['prototypeId'])
@Index(['parentId'])
@Index(['order'])
@Index(['status'])
@Index(['type'])
export class PrototypePage extends BaseEntity {
  @ApiProperty({ description: '页面名称' })
  @Column({
    type: 'varchar',
    length: 200,
    comment: '页面名称',
  })
  name: string;

  @ApiProperty({ description: '页面描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '页面描述',
  })
  description?: string;

  @ApiProperty({ description: '页面类型', enum: PageType })
  @Column({
    type: 'enum',
    enum: PageType,
    default: PageType.NORMAL,
    comment: '页面类型',
  })
  type: PageType;

  @ApiProperty({ description: '页面状态', enum: PageStatus })
  @Column({
    type: 'enum',
    enum: PageStatus,
    default: PageStatus.DRAFT,
    comment: '页面状态',
  })
  status: PageStatus;

  @ApiProperty({ description: '原型ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '原型ID',
  })
  prototypeId: string;

  @ApiProperty({ description: '父页面ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '父页面ID（用于页面层级）',
  })
  parentId?: string;

  @ApiProperty({ description: '创建者ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '创建者ID',
  })
  creatorId: string;

  @ApiProperty({ description: '页面路径' })
  @Column({
    type: 'varchar',
    length: 500,
    comment: '页面路径/URL',
  })
  path: string;

  @ApiProperty({ description: '页面排序' })
  @Column({
    type: 'int',
    default: 0,
    comment: '页面排序',
  })
  order: number;

  @ApiProperty({ description: '页面层级' })
  @Column({
    type: 'int',
    default: 1,
    comment: '页面层级',
  })
  level: number;

  @ApiProperty({ description: '页面宽度' })
  @Column({
    type: 'int',
    default: 1920,
    comment: '页面宽度（像素）',
  })
  width: number;

  @ApiProperty({ description: '页面高度' })
  @Column({
    type: 'int',
    default: 1080,
    comment: '页面高度（像素）',
  })
  height: number;

  @ApiProperty({ description: '背景颜色', required: false })
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '背景颜色',
  })
  backgroundColor?: string;

  @ApiProperty({ description: '背景图片URL', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '背景图片URL',
  })
  backgroundImageUrl?: string;

  @ApiProperty({ description: '页面缩略图URL', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '页面缩略图URL',
  })
  thumbnailUrl?: string;

  @ApiProperty({ description: '页面预览图URL', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '页面预览图URL',
  })
  previewImageUrl?: string;

  @ApiProperty({ description: '页面数据', required: false })
  @Column({
    type: 'longtext',
    nullable: true,
    comment: '页面数据（JSON格式）',
  })
  pageData?: string;

  @ApiProperty({ description: '页面样式', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '页面样式配置',
  })
  styles?: {
    layout?: Record<string, any>;
    typography?: Record<string, any>;
    colors?: Record<string, any>;
    spacing?: Record<string, any>;
    borders?: Record<string, any>;
    shadows?: Record<string, any>;
  };

  @ApiProperty({ description: '页面组件', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '页面组件配置',
  })
  components?: {
    id: string;
    type: string;
    name: string;
    props: Record<string, any>;
    style: Record<string, any>;
    position: { x: number; y: number; z: number };
    size: { width: number; height: number };
    children?: string[];
    parent?: string;
  }[];

  @ApiProperty({ description: '页面交互', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '页面交互配置',
  })
  interactions?: {
    id: string;
    type: string; // click, hover, scroll, etc.
    trigger: {
      componentId: string;
      event: string;
      conditions?: Record<string, any>;
    };
    action: {
      type: string; // navigate, show, hide, animate, etc.
      target?: string;
      params?: Record<string, any>;
      animation?: Record<string, any>;
    };
    delay?: number;
    duration?: number;
  }[];

  @ApiProperty({ description: '页面动画', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '页面动画配置',
  })
  animations?: {
    id: string;
    name: string;
    type: string; // transition, keyframe, etc.
    target: string; // component id
    properties: Record<string, any>;
    duration: number;
    delay?: number;
    easing?: string;
    loop?: boolean;
    autoplay?: boolean;
  }[];

  @ApiProperty({ description: '页面状态', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '页面状态管理',
  })
  pageState?: {
    variables: Record<string, any>;
    conditions: Record<string, any>;
    events: Record<string, any>;
  };

  @ApiProperty({ description: '页面配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '页面配置',
  })
  config?: {
    grid?: {
      enabled: boolean;
      size: number;
      snap: boolean;
    };
    rulers?: {
      enabled: boolean;
      units: string;
    };
    guides?: {
      enabled: boolean;
      snap: boolean;
    };
    zoom?: {
      level: number;
      min: number;
      max: number;
    };
    viewport?: {
      x: number;
      y: number;
    };
  };

  @ApiProperty({ description: '页面元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '页面元数据',
  })
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    author?: string;
    version?: string;
    lastModified?: Date;
    notes?: string;
  };

  @ApiProperty({ description: '是否为首页' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为首页',
  })
  isHomePage: boolean;

  @ApiProperty({ description: '是否为模板页面' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为模板页面',
  })
  isTemplate: boolean;

  @ApiProperty({ description: '是否锁定' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否锁定编辑',
  })
  isLocked: boolean;

  @ApiProperty({ description: '是否隐藏' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否隐藏',
  })
  isHidden: boolean;

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

  @ApiProperty({ description: '动画数量' })
  @Column({
    type: 'int',
    default: 0,
    comment: '动画数量',
  })
  animationsCount: number;

  @ApiProperty({ description: '最后编辑时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后编辑时间',
  })
  lastEditedAt?: Date;

  @ApiProperty({ description: '自定义字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '自定义字段',
  })
  customFields?: Record<string, any>;

  // 关联关系
  @ApiProperty({ description: '所属原型', type: () => Prototype })
  @ManyToOne(() => Prototype, prototype => prototype.pages)
  @JoinColumn({ name: 'prototypeId' })
  prototype: Prototype;

  @ApiProperty({ description: '父页面', type: () => PrototypePage })
  @ManyToOne(() => PrototypePage, page => page.children)
  @JoinColumn({ name: 'parentId' })
  parent?: PrototypePage;

  @ApiProperty({ description: '子页面', type: () => [PrototypePage] })
  @OneToMany(() => PrototypePage, page => page.parent)
  children: PrototypePage[];

  @ApiProperty({ description: '创建者', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ApiProperty({ description: '页面评论', type: () => [PrototypeComment] })
  @OneToMany(() => PrototypeComment, comment => comment.page)
  comments: PrototypeComment[];

  /**
   * 检查是否可以编辑
   * @param userId 用户ID
   * @returns 是否可以编辑
   */
  canEdit(userId: string): boolean {
    return !this.isLocked && (this.creatorId === userId || this.prototype?.canEdit(userId));
  }

  /**
   * 检查是否可以删除
   * @param userId 用户ID
   * @returns 是否可以删除
   */
  canDelete(userId: string): boolean {
    return this.creatorId === userId && this.status === PageStatus.DRAFT;
  }

  /**
   * 检查是否为根页面
   * @returns 是否为根页面
   */
  isRootPage(): boolean {
    return !this.parentId;
  }

  /**
   * 检查是否有子页面
   * @returns 是否有子页面
   */
  hasChildren(): boolean {
    return this.children && this.children.length > 0;
  }

  /**
   * 检查是否为叶子页面
   * @returns 是否为叶子页面
   */
  isLeafPage(): boolean {
    return !this.hasChildren();
  }

  /**
   * 获取页面路径层级
   * @returns 路径层级数组
   */
  getPathHierarchy(): string[] {
    return this.path.split('/').filter(segment => segment.length > 0);
  }

  /**
   * 获取页面完整路径
   * @returns 完整路径
   */
  getFullPath(): string {
    if (this.parent) {
      return `${this.parent.getFullPath()}/${this.path}`;
    }
    return this.path;
  }

  /**
   * 锁定页面
   */
  lock(): void {
    this.isLocked = true;
  }

  /**
   * 解锁页面
   */
  unlock(): void {
    this.isLocked = false;
  }

  /**
   * 隐藏页面
   */
  hide(): void {
    this.isHidden = true;
  }

  /**
   * 显示页面
   */
  show(): void {
    this.isHidden = false;
  }

  /**
   * 设置为首页
   */
  setAsHomePage(): void {
    this.isHomePage = true;
  }

  /**
   * 取消首页设置
   */
  unsetAsHomePage(): void {
    this.isHomePage = false;
  }

  /**
   * 更新页面尺寸
   * @param width 宽度
   * @param height 高度
   */
  updateSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /**
   * 更新页面背景
   * @param background 背景配置
   */
  updateBackground(background: {
    color?: string;
    imageUrl?: string;
  }): void {
    if (background.color) {
      this.backgroundColor = background.color;
    }
    if (background.imageUrl) {
      this.backgroundImageUrl = background.imageUrl;
    }
  }

  /**
   * 更新统计信息
   * @param stats 统计信息
   */
  updateStats(stats: {
    componentsCount?: number;
    interactionsCount?: number;
    animationsCount?: number;
  }): void {
    if (stats.componentsCount !== undefined) {
      this.componentsCount = stats.componentsCount;
    }
    if (stats.interactionsCount !== undefined) {
      this.interactionsCount = stats.interactionsCount;
    }
    if (stats.animationsCount !== undefined) {
      this.animationsCount = stats.animationsCount;
    }
  }

  /**
   * 更新最后编辑时间
   */
  updateLastEditedAt(): void {
    this.lastEditedAt = new Date();
  }

  /**
   * 添加组件
   * @param component 组件配置
   */
  addComponent(component: {
    id: string;
    type: string;
    name: string;
    props: Record<string, any>;
    style: Record<string, any>;
    position: { x: number; y: number; z: number };
    size: { width: number; height: number };
    children?: string[];
    parent?: string;
  }): void {
    if (!this.components) {
      this.components = [];
    }
    
    this.components.push(component);
    this.componentsCount = this.components.length;
    this.updateLastEditedAt();
  }

  /**
   * 移除组件
   * @param componentId 组件ID
   */
  removeComponent(componentId: string): void {
    if (this.components) {
      this.components = this.components.filter(comp => comp.id !== componentId);
      this.componentsCount = this.components.length;
      this.updateLastEditedAt();
    }
  }

  /**
   * 更新组件
   * @param componentId 组件ID
   * @param updates 更新内容
   */
  updateComponent(componentId: string, updates: Partial<{
    type: string;
    name: string;
    props: Record<string, any>;
    style: Record<string, any>;
    position: { x: number; y: number; z: number };
    size: { width: number; height: number };
    children: string[];
    parent: string;
  }>): void {
    if (this.components) {
      const componentIndex = this.components.findIndex(comp => comp.id === componentId);
      if (componentIndex !== -1) {
        this.components[componentIndex] = {
          ...this.components[componentIndex],
          ...updates,
        };
        this.updateLastEditedAt();
      }
    }
  }

  /**
   * 获取组件
   * @param componentId 组件ID
   * @returns 组件配置
   */
  getComponent(componentId: string): any {
    return this.components?.find(comp => comp.id === componentId);
  }

  /**
   * 添加交互
   * @param interaction 交互配置
   */
  addInteraction(interaction: {
    id: string;
    type: string;
    trigger: {
      componentId: string;
      event: string;
      conditions?: Record<string, any>;
    };
    action: {
      type: string;
      target?: string;
      params?: Record<string, any>;
      animation?: Record<string, any>;
    };
    delay?: number;
    duration?: number;
  }): void {
    if (!this.interactions) {
      this.interactions = [];
    }
    
    this.interactions.push(interaction);
    this.interactionsCount = this.interactions.length;
    this.updateLastEditedAt();
  }

  /**
   * 移除交互
   * @param interactionId 交互ID
   */
  removeInteraction(interactionId: string): void {
    if (this.interactions) {
      this.interactions = this.interactions.filter(inter => inter.id !== interactionId);
      this.interactionsCount = this.interactions.length;
      this.updateLastEditedAt();
    }
  }

  /**
   * 添加动画
   * @param animation 动画配置
   */
  addAnimation(animation: {
    id: string;
    name: string;
    type: string;
    target: string;
    properties: Record<string, any>;
    duration: number;
    delay?: number;
    easing?: string;
    loop?: boolean;
    autoplay?: boolean;
  }): void {
    if (!this.animations) {
      this.animations = [];
    }
    
    this.animations.push(animation);
    this.animationsCount = this.animations.length;
    this.updateLastEditedAt();
  }

  /**
   * 移除动画
   * @param animationId 动画ID
   */
  removeAnimation(animationId: string): void {
    if (this.animations) {
      this.animations = this.animations.filter(anim => anim.id !== animationId);
      this.animationsCount = this.animations.length;
      this.updateLastEditedAt();
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
   * 复制页面
   * @param newName 新页面名称
   * @param newPath 新页面路径
   * @returns 复制的页面数据
   */
  clone(newName: string, newPath: string): Partial<PrototypePage> {
    return {
      name: newName,
      description: this.description,
      type: this.type,
      path: newPath,
      width: this.width,
      height: this.height,
      backgroundColor: this.backgroundColor,
      backgroundImageUrl: this.backgroundImageUrl,
      pageData: this.pageData,
      styles: this.styles ? JSON.parse(JSON.stringify(this.styles)) : undefined,
      components: this.components ? JSON.parse(JSON.stringify(this.components)) : undefined,
      interactions: this.interactions ? JSON.parse(JSON.stringify(this.interactions)) : undefined,
      animations: this.animations ? JSON.parse(JSON.stringify(this.animations)) : undefined,
      pageState: this.pageState ? JSON.parse(JSON.stringify(this.pageState)) : undefined,
      config: this.config ? JSON.parse(JSON.stringify(this.config)) : undefined,
      metadata: this.metadata ? JSON.parse(JSON.stringify(this.metadata)) : undefined,
      customFields: this.customFields ? JSON.parse(JSON.stringify(this.customFields)) : undefined,
      status: PageStatus.DRAFT,
      isTemplate: false,
      isLocked: false,
      isHidden: false,
      isHomePage: false,
    };
  }

  /**
   * 获取页面信息
   * @returns 页面信息
   */
  getInfo(): {
    id: string;
    name: string;
    description?: string;
    type: PageType;
    status: PageStatus;
    path: string;
    order: number;
    level: number;
    width: number;
    height: number;
    isHomePage: boolean;
    isTemplate: boolean;
    isLocked: boolean;
    isHidden: boolean;
    componentsCount: number;
    interactionsCount: number;
    animationsCount: number;
    prototypeId: string;
    parentId?: string;
    creatorId: string;
    thumbnailUrl?: string;
    previewImageUrl?: string;
    lastEditedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      status: this.status,
      path: this.path,
      order: this.order,
      level: this.level,
      width: this.width,
      height: this.height,
      isHomePage: this.isHomePage,
      isTemplate: this.isTemplate,
      isLocked: this.isLocked,
      isHidden: this.isHidden,
      componentsCount: this.componentsCount,
      interactionsCount: this.interactionsCount,
      animationsCount: this.animationsCount,
      prototypeId: this.prototypeId,
      parentId: this.parentId,
      creatorId: this.creatorId,
      thumbnailUrl: this.thumbnailUrl,
      previewImageUrl: this.previewImageUrl,
      lastEditedAt: this.lastEditedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * 验证页面数据
   * @param data 页面数据
   * @returns 验证结果
   */
  static validate(data: Partial<PrototypePage>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('页面名称不能为空');
    }
    
    if (data.name && data.name.length > 200) {
      errors.push('页面名称不能超过200个字符');
    }
    
    if (!data.path || data.path.trim().length === 0) {
      errors.push('页面路径不能为空');
    }
    
    if (!data.prototypeId) {
      errors.push('原型ID不能为空');
    }
    
    if (!data.creatorId) {
      errors.push('创建者ID不能为空');
    }
    
    if (data.width && data.width <= 0) {
      errors.push('页面宽度必须大于0');
    }
    
    if (data.height && data.height <= 0) {
      errors.push('页面高度必须大于0');
    }
    
    if (data.order && data.order < 0) {
      errors.push('页面排序不能为负数');
    }
    
    if (data.level && data.level < 1) {
      errors.push('页面层级必须大于等于1');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建默认页面
   * @param data 页面基础数据
   * @returns 默认页面数据
   */
  static createDefault(data: {
    name: string;
    prototypeId: string;
    creatorId: string;
    path?: string;
    type?: PageType;
    width?: number;
    height?: number;
  }): Partial<PrototypePage> {
    return {
      name: data.name,
      prototypeId: data.prototypeId,
      creatorId: data.creatorId,
      path: data.path || `/${data.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: data.type || PageType.NORMAL,
      width: data.width || 1920,
      height: data.height || 1080,
      status: PageStatus.DRAFT,
      order: 0,
      level: 1,
      isHomePage: false,
      isTemplate: false,
      isLocked: false,
      isHidden: false,
      componentsCount: 0,
      interactionsCount: 0,
      animationsCount: 0,
    };
  }
}