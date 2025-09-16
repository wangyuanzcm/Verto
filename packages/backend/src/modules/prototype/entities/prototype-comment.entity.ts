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
import { CommentType, CommentStatus } from '../../../common/enums';
import { Prototype } from './prototype.entity';
import { PrototypePage } from './prototype-page.entity';
import { User } from '../../user/entities/user.entity';

/**
 * 原型评论实体
 */
@Entity('prototype_comments')
@Index(['prototypeId'])
@Index(['pageId'])
@Index(['authorId'])
@Index(['parentId'])
@Index(['type'])
@Index(['status'])
@Index(['createdAt'])
export class PrototypeComment extends BaseEntity {
  @ApiProperty({ description: '评论内容' })
  @Column({
    type: 'text',
    comment: '评论内容',
  })
  content: string;

  @ApiProperty({ description: '评论类型', enum: CommentType })
  @Column({
    type: 'enum',
    enum: CommentType,
    default: CommentType.GENERAL,
    comment: '评论类型',
  })
  type: CommentType;

  @ApiProperty({ description: '评论状态', enum: CommentStatus })
  @Column({
    type: 'enum',
    enum: CommentStatus,
    default: CommentStatus.ACTIVE,
    comment: '评论状态',
  })
  status: CommentStatus;

  @ApiProperty({ description: '原型ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '原型ID',
  })
  prototypeId: string;

  @ApiProperty({ description: '页面ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '页面ID（如果是页面级评论）',
  })
  pageId?: string;

  @ApiProperty({ description: '作者ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '作者ID',
  })
  authorId: string;

  @ApiProperty({ description: '父评论ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '父评论ID（用于回复）',
  })
  parentId?: string;

  @ApiProperty({ description: '根评论ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '根评论ID',
  })
  rootId?: string;

  @ApiProperty({ description: '评论层级' })
  @Column({
    type: 'int',
    default: 1,
    comment: '评论层级',
  })
  level: number;

  @ApiProperty({ description: '评论路径' })
  @Column({
    type: 'varchar',
    length: 500,
    comment: '评论路径（用于层级查询）',
  })
  path: string;

  @ApiProperty({ description: '坐标位置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '评论在页面上的坐标位置',
  })
  position?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };

  @ApiProperty({ description: '关联组件ID', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '关联的组件ID',
  })
  componentId?: string;

  @ApiProperty({ description: '关联元素选择器', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '关联的页面元素选择器',
  })
  elementSelector?: string;

  @ApiProperty({ description: '评论标签', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '评论标签',
  })
  tags?: string[];

  @ApiProperty({ description: '优先级' })
  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    comment: '评论优先级',
  })
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @ApiProperty({ description: '严重程度', required: false })
  @Column({
    type: 'enum',
    enum: ['minor', 'major', 'critical', 'blocker'],
    nullable: true,
    comment: '问题严重程度（用于缺陷类评论）',
  })
  severity?: 'minor' | 'major' | 'critical' | 'blocker';

  @ApiProperty({ description: '评论颜色', required: false })
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '评论标记颜色',
  })
  color?: string;

  @ApiProperty({ description: '附件信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '附件信息',
  })
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    mimeType: string;
  }[];

  @ApiProperty({ description: '提及用户', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '提及的用户ID列表',
  })
  mentions?: string[];

  @ApiProperty({ description: '评论元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '评论元数据',
  })
  metadata?: {
    browser?: string;
    device?: string;
    screenSize?: { width: number; height: number };
    userAgent?: string;
    timestamp?: Date;
    version?: string;
    environment?: string;
  };

  @ApiProperty({ description: '是否已解决' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否已解决',
  })
  isResolved: boolean;

  @ApiProperty({ description: '是否置顶' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否置顶',
  })
  isPinned: boolean;

  @ApiProperty({ description: '是否私有' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否私有评论',
  })
  isPrivate: boolean;

  @ApiProperty({ description: '是否为系统评论' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为系统生成的评论',
  })
  isSystem: boolean;

  @ApiProperty({ description: '点赞数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '点赞数',
  })
  likesCount: number;

  @ApiProperty({ description: '回复数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '回复数',
  })
  repliesCount: number;

  @ApiProperty({ description: '解决者ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '解决者ID',
  })
  resolvedById?: string;

  @ApiProperty({ description: '解决时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '解决时间',
  })
  resolvedAt?: Date;

  @ApiProperty({ description: '解决说明', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '解决说明',
  })
  resolutionNote?: string;

  @ApiProperty({ description: '最后编辑时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后编辑时间',
  })
  lastEditedAt?: Date;

  @ApiProperty({ description: '编辑历史', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '编辑历史',
  })
  editHistory?: {
    timestamp: Date;
    content: string;
    editorId: string;
    reason?: string;
  }[];

  @ApiProperty({ description: '自定义字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '自定义字段',
  })
  customFields?: Record<string, any>;

  // 关联关系
  @ApiProperty({ description: '所属原型', type: () => Prototype })
  @ManyToOne(() => Prototype, prototype => prototype.comments)
  @JoinColumn({ name: 'prototypeId' })
  prototype: Prototype;

  @ApiProperty({ description: '所属页面', type: () => PrototypePage })
  @ManyToOne(() => PrototypePage, page => page.comments)
  @JoinColumn({ name: 'pageId' })
  page?: PrototypePage;

  @ApiProperty({ description: '评论作者', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ApiProperty({ description: '解决者', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'resolvedById' })
  resolvedBy?: User;

  @ApiProperty({ description: '父评论', type: () => PrototypeComment })
  @ManyToOne(() => PrototypeComment, comment => comment.replies)
  @JoinColumn({ name: 'parentId' })
  parent?: PrototypeComment;

  @ApiProperty({ description: '回复评论', type: () => [PrototypeComment] })
  @OneToMany(() => PrototypeComment, comment => comment.parent)
  replies: PrototypeComment[];

  /**
   * 检查是否可以编辑
   * @param userId 用户ID
   * @returns 是否可以编辑
   */
  canEdit(userId: string): boolean {
    return this.authorId === userId && this.status === CommentStatus.ACTIVE;
  }

  /**
   * 检查是否可以删除
   * @param userId 用户ID
   * @returns 是否可以删除
   */
  canDelete(userId: string): boolean {
    return this.authorId === userId || this.prototype?.canEdit(userId);
  }

  /**
   * 检查是否可以解决
   * @param userId 用户ID
   * @returns 是否可以解决
   */
  canResolve(userId: string): boolean {
    return !this.isResolved && (this.authorId === userId || this.prototype?.canEdit(userId));
  }

  /**
   * 检查是否为根评论
   * @returns 是否为根评论
   */
  isRootComment(): boolean {
    return !this.parentId;
  }

  /**
   * 检查是否有回复
   * @returns 是否有回复
   */
  hasReplies(): boolean {
    return this.repliesCount > 0;
  }

  /**
   * 检查是否为页面级评论
   * @returns 是否为页面级评论
   */
  isPageComment(): boolean {
    return !!this.pageId;
  }

  /**
   * 检查是否为组件级评论
   * @returns 是否为组件级评论
   */
  isComponentComment(): boolean {
    return !!this.componentId;
  }

  /**
   * 检查是否为位置评论
   * @returns 是否为位置评论
   */
  isPositionComment(): boolean {
    return !!this.position;
  }

  /**
   * 检查是否为缺陷评论
   * @returns 是否为缺陷评论
   */
  isBugComment(): boolean {
    return this.type === CommentType.BUG;
  }

  /**
   * 检查是否为建议评论
   * @returns 是否为建议评论
   */
  isSuggestionComment(): boolean {
    return this.type === CommentType.SUGGESTION;
  }

  /**
   * 检查是否为审批评论
   * @returns 是否为审批评论
   */
  isApprovalComment(): boolean {
    return this.type === CommentType.APPROVAL;
  }

  /**
   * 检查是否为高优先级
   * @returns 是否为高优先级
   */
  isHighPriority(): boolean {
    return ['high', 'urgent'].includes(this.priority);
  }

  /**
   * 检查是否为严重问题
   * @returns 是否为严重问题
   */
  isCritical(): boolean {
    return this.severity === 'critical' || this.severity === 'blocker';
  }

  /**
   * 解决评论
   * @param userId 解决者ID
   * @param note 解决说明
   */
  resolve(userId: string, note?: string): void {
    if (this.canResolve(userId)) {
      this.isResolved = true;
      this.resolvedById = userId;
      this.resolvedAt = new Date();
      this.resolutionNote = note;
    }
  }

  /**
   * 重新打开评论
   */
  reopen(): void {
    this.isResolved = false;
    this.resolvedById = undefined;
    this.resolvedAt = undefined;
    this.resolutionNote = undefined;
  }

  /**
   * 置顶评论
   */
  pin(): void {
    this.isPinned = true;
  }

  /**
   * 取消置顶
   */
  unpin(): void {
    this.isPinned = false;
  }

  /**
   * 设为私有
   */
  makePrivate(): void {
    this.isPrivate = true;
  }

  /**
   * 设为公开
   */
  makePublic(): void {
    this.isPrivate = false;
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
   * 增加回复数
   */
  incrementReplies(): void {
    this.repliesCount += 1;
  }

  /**
   * 减少回复数
   */
  decrementReplies(): void {
    if (this.repliesCount > 0) {
      this.repliesCount -= 1;
    }
  }

  /**
   * 更新最后编辑时间
   */
  updateLastEditedAt(): void {
    this.lastEditedAt = new Date();
  }

  /**
   * 编辑评论内容
   * @param newContent 新内容
   * @param editorId 编辑者ID
   * @param reason 编辑原因
   */
  editContent(newContent: string, editorId: string, reason?: string): void {
    if (!this.editHistory) {
      this.editHistory = [];
    }
    
    // 保存编辑历史
    this.editHistory.push({
      timestamp: new Date(),
      content: this.content,
      editorId,
      reason,
    });
    
    this.content = newContent;
    this.updateLastEditedAt();
  }

  /**
   * 设置位置
   * @param position 位置信息
   */
  setPosition(position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  }): void {
    this.position = position;
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
   * 添加附件
   * @param attachment 附件信息
   */
  addAttachment(attachment: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    mimeType: string;
  }): void {
    if (!this.attachments) {
      this.attachments = [];
    }
    
    this.attachments.push(attachment);
  }

  /**
   * 移除附件
   * @param attachmentId 附件ID
   */
  removeAttachment(attachmentId: string): void {
    if (this.attachments) {
      this.attachments = this.attachments.filter(att => att.id !== attachmentId);
    }
  }

  /**
   * 添加提及用户
   * @param userId 用户ID
   */
  addMention(userId: string): void {
    if (!this.mentions) {
      this.mentions = [];
    }
    
    if (!this.mentions.includes(userId)) {
      this.mentions.push(userId);
    }
  }

  /**
   * 移除提及用户
   * @param userId 用户ID
   */
  removeMention(userId: string): void {
    if (this.mentions) {
      this.mentions = this.mentions.filter(id => id !== userId);
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
   * 获取评论层级路径
   * @returns 层级路径数组
   */
  getPathHierarchy(): string[] {
    return this.path.split('/').filter(segment => segment.length > 0);
  }

  /**
   * 生成评论路径
   * @param parentPath 父评论路径
   * @param commentId 评论ID
   * @returns 评论路径
   */
  static generatePath(parentPath: string | undefined, commentId: string): string {
    if (parentPath) {
      return `${parentPath}/${commentId}`;
    }
    return commentId;
  }

  /**
   * 获取评论信息
   * @returns 评论信息
   */
  getInfo(): {
    id: string;
    content: string;
    type: CommentType;
    status: CommentStatus;
    priority: string;
    severity?: string;
    level: number;
    isResolved: boolean;
    isPinned: boolean;
    isPrivate: boolean;
    isSystem: boolean;
    likesCount: number;
    repliesCount: number;
    prototypeId: string;
    pageId?: string;
    authorId: string;
    parentId?: string;
    rootId?: string;
    componentId?: string;
    position?: { x: number; y: number; width?: number; height?: number };
    tags?: string[];
    color?: string;
    resolvedById?: string;
    resolvedAt?: Date;
    lastEditedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      content: this.content,
      type: this.type,
      status: this.status,
      priority: this.priority,
      severity: this.severity,
      level: this.level,
      isResolved: this.isResolved,
      isPinned: this.isPinned,
      isPrivate: this.isPrivate,
      isSystem: this.isSystem,
      likesCount: this.likesCount,
      repliesCount: this.repliesCount,
      prototypeId: this.prototypeId,
      pageId: this.pageId,
      authorId: this.authorId,
      parentId: this.parentId,
      rootId: this.rootId,
      componentId: this.componentId,
      position: this.position,
      tags: this.tags,
      color: this.color,
      resolvedById: this.resolvedById,
      resolvedAt: this.resolvedAt,
      lastEditedAt: this.lastEditedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * 验证评论数据
   * @param data 评论数据
   * @returns 验证结果
   */
  static validate(data: Partial<PrototypeComment>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.content || data.content.trim().length === 0) {
      errors.push('评论内容不能为空');
    }
    
    if (!data.prototypeId) {
      errors.push('原型ID不能为空');
    }
    
    if (!data.authorId) {
      errors.push('作者ID不能为空');
    }
    
    if (data.level && data.level < 1) {
      errors.push('评论层级必须大于等于1');
    }
    
    if (data.position) {
      if (data.position.x < 0 || data.position.y < 0) {
        errors.push('评论位置坐标不能为负数');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建系统评论
   * @param data 评论数据
   * @returns 系统评论数据
   */
  static createSystemComment(data: {
    content: string;
    prototypeId: string;
    pageId?: string;
    type?: CommentType;
    metadata?: Record<string, any>;
  }): Partial<PrototypeComment> {
    return {
      content: data.content,
      prototypeId: data.prototypeId,
      pageId: data.pageId,
      type: data.type || CommentType.GENERAL,
      isSystem: true,
      isPrivate: false,
      priority: 'low',
      status: CommentStatus.ACTIVE,
      level: 1,
      metadata: data.metadata,
    };
  }
}