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
import { Material } from './material.entity';
import { User } from '../../user/entities/user.entity';

/**
 * 物料评论实体
 */
@Entity('material_comments')
@Index(['materialId'])
@Index(['authorId'])
@Index(['parentId'])
@Index(['status'])
@Index(['type'])
@Index(['createdAt'])
export class MaterialComment extends BaseEntity {
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
    default: CommentType.COMMENT,
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

  @ApiProperty({ description: '物料ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '物料ID',
  })
  materialId: string;

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
    comment: '父评论ID',
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

  @ApiProperty({ description: '回复目标用户ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '回复目标用户ID',
  })
  replyToUserId?: string;

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
    comment: '评论路径（用于快速查询子评论）',
  })
  path: string;

  @ApiProperty({ description: '评分', required: false })
  @Column({
    type: 'decimal',
    precision: 3,
    scale: 1,
    nullable: true,
    comment: '评分（1-5分）',
  })
  rating?: number;

  @ApiProperty({ description: '点赞数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '点赞数',
  })
  likeCount: number;

  @ApiProperty({ description: '踩数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '踩数',
  })
  dislikeCount: number;

  @ApiProperty({ description: '回复数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '回复数',
  })
  replyCount: number;

  @ApiProperty({ description: '是否置顶' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否置顶',
  })
  isPinned: boolean;

  @ApiProperty({ description: '是否精华' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否精华',
  })
  isHighlighted: boolean;

  @ApiProperty({ description: '是否已解决' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否已解决（用于问题类评论）',
  })
  isResolved: boolean;

  @ApiProperty({ description: '是否匿名' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否匿名评论',
  })
  isAnonymous: boolean;

  @ApiProperty({ description: '是否已编辑' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否已编辑',
  })
  isEdited: boolean;

  @ApiProperty({ description: 'IP地址', required: false })
  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
    comment: 'IP地址',
  })
  ipAddress?: string;

  @ApiProperty({ description: '用户代理', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '用户代理',
  })
  userAgent?: string;

  @ApiProperty({ description: '评论标签', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '评论标签',
  })
  tags?: string[];

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
    device?: string;
    browser?: string;
    os?: string;
    location?: {
      country?: string;
      region?: string;
      city?: string;
      timezone?: string;
    };
    referrer?: string;
    source?: string;
    campaign?: string;
    medium?: string;
    term?: string;
    content?: string;
  };

  @ApiProperty({ description: '审核信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '审核信息',
  })
  moderation?: {
    isReviewed: boolean;
    reviewedBy?: string;
    reviewedAt?: Date;
    reviewNotes?: string;
    isApproved: boolean;
    rejectionReason?: string;
    autoModerated: boolean;
    moderationScore?: number;
    flags?: {
      spam: boolean;
      inappropriate: boolean;
      offensive: boolean;
      copyright: boolean;
      other: boolean;
    };
  };

  @ApiProperty({ description: '编辑历史', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '编辑历史',
  })
  editHistory?: {
    editedAt: Date;
    editedBy: string;
    previousContent: string;
    reason?: string;
  }[];

  @ApiProperty({ description: '自定义字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '自定义字段',
  })
  customFields?: Record<string, any>;

  @ApiProperty({ description: '最后编辑时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后编辑时间',
  })
  lastEditedAt?: Date;

  @ApiProperty({ description: '解决时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '解决时间',
  })
  resolvedAt?: Date;

  @ApiProperty({ description: '置顶时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '置顶时间',
  })
  pinnedAt?: Date;

  @ApiProperty({ description: '精华时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '精华时间',
  })
  highlightedAt?: Date;

  // 关联关系
  @ApiProperty({ description: '所属物料', type: () => Material })
  @ManyToOne(() => Material, material => material.comments)
  @JoinColumn({ name: 'materialId' })
  material: Material;

  @ApiProperty({ description: '评论作者', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ApiProperty({ description: '回复目标用户', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'replyToUserId' })
  replyToUser?: User;

  @ApiProperty({ description: '父评论', type: () => MaterialComment })
  @ManyToOne(() => MaterialComment, comment => comment.replies)
  @JoinColumn({ name: 'parentId' })
  parent?: MaterialComment;

  @ApiProperty({ description: '子评论', type: () => [MaterialComment] })
  @OneToMany(() => MaterialComment, comment => comment.parent)
  replies: MaterialComment[];

  @ApiProperty({ description: '根评论', type: () => MaterialComment })
  @ManyToOne(() => MaterialComment)
  @JoinColumn({ name: 'rootId' })
  root?: MaterialComment;

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
    return this.authorId === userId || this.canModerate(userId);
  }

  /**
   * 检查是否可以审核
   * @param userId 用户ID
   * @returns 是否可以审核
   */
  canModerate(userId: string): boolean {
    // 这里应该检查用户是否有审核权限
    // 暂时返回false，实际应该根据用户角色判断
    return false;
  }

  /**
   * 检查是否可以解决
   * @param userId 用户ID
   * @returns 是否可以解决
   */
  canResolve(userId: string): boolean {
    return this.type === CommentType.QUESTION && 
           (this.authorId === userId || this.canModerate(userId));
  }

  /**
   * 检查是否可以置顶
   * @param userId 用户ID
   * @returns 是否可以置顶
   */
  canPin(userId: string): boolean {
    return this.canModerate(userId);
  }

  /**
   * 检查是否可以设为精华
   * @param userId 用户ID
   * @returns 是否可以设为精华
   */
  canHighlight(userId: string): boolean {
    return this.canModerate(userId);
  }

  /**
   * 检查是否为根评论
   * @returns 是否为根评论
   */
  isRootComment(): boolean {
    return !this.parentId;
  }

  /**
   * 检查是否为回复
   * @returns 是否为回复
   */
  isReply(): boolean {
    return !!this.parentId;
  }

  /**
   * 检查是否为问题
   * @returns 是否为问题
   */
  isQuestion(): boolean {
    return this.type === CommentType.QUESTION;
  }

  /**
   * 检查是否为建议
   * @returns 是否为建议
   */
  isSuggestion(): boolean {
    return this.type === CommentType.SUGGESTION;
  }

  /**
   * 检查是否为反馈
   * @returns 是否为反馈
   */
  isFeedback(): boolean {
    return this.type === CommentType.FEEDBACK;
  }

  /**
   * 检查是否为评价
   * @returns 是否为评价
   */
  isReview(): boolean {
    return this.type === CommentType.REVIEW;
  }

  /**
   * 增加点赞数
   */
  incrementLikeCount(): void {
    this.likeCount += 1;
  }

  /**
   * 减少点赞数
   */
  decrementLikeCount(): void {
    if (this.likeCount > 0) {
      this.likeCount -= 1;
    }
  }

  /**
   * 增加踩数
   */
  incrementDislikeCount(): void {
    this.dislikeCount += 1;
  }

  /**
   * 减少踩数
   */
  decrementDislikeCount(): void {
    if (this.dislikeCount > 0) {
      this.dislikeCount -= 1;
    }
  }

  /**
   * 增加回复数
   */
  incrementReplyCount(): void {
    this.replyCount += 1;
  }

  /**
   * 减少回复数
   */
  decrementReplyCount(): void {
    if (this.replyCount > 0) {
      this.replyCount -= 1;
    }
  }

  /**
   * 置顶评论
   */
  pin(): void {
    this.isPinned = true;
    this.pinnedAt = new Date();
  }

  /**
   * 取消置顶
   */
  unpin(): void {
    this.isPinned = false;
    this.pinnedAt = null;
  }

  /**
   * 设为精华
   */
  highlight(): void {
    this.isHighlighted = true;
    this.highlightedAt = new Date();
  }

  /**
   * 取消精华
   */
  unhighlight(): void {
    this.isHighlighted = false;
    this.highlightedAt = null;
  }

  /**
   * 标记为已解决
   */
  resolve(): void {
    if (this.type === CommentType.QUESTION) {
      this.isResolved = true;
      this.resolvedAt = new Date();
    }
  }

  /**
   * 取消解决状态
   */
  unresolve(): void {
    this.isResolved = false;
    this.resolvedAt = null;
  }

  /**
   * 软删除评论
   */
  softDelete(): void {
    this.status = CommentStatus.DELETED;
    this.content = '[该评论已被删除]';
  }

  /**
   * 隐藏评论
   */
  hide(): void {
    this.status = CommentStatus.HIDDEN;
  }

  /**
   * 显示评论
   */
  show(): void {
    this.status = CommentStatus.ACTIVE;
  }

  /**
   * 标记为垃圾评论
   */
  markAsSpam(): void {
    this.status = CommentStatus.SPAM;
  }

  /**
   * 编辑评论
   * @param newContent 新内容
   * @param userId 编辑者ID
   * @param reason 编辑原因
   */
  edit(newContent: string, userId: string, reason?: string): void {
    if (!this.editHistory) {
      this.editHistory = [];
    }
    
    this.editHistory.push({
      editedAt: new Date(),
      editedBy: userId,
      previousContent: this.content,
      reason,
    });
    
    this.content = newContent;
    this.isEdited = true;
    this.lastEditedAt = new Date();
  }

  /**
   * 设置评分
   * @param rating 评分
   */
  setRating(rating: number): void {
    if (rating >= 1 && rating <= 5) {
      this.rating = rating;
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
   * 设置审核信息
   * @param moderation 审核信息
   */
  setModeration(moderation: {
    isReviewed: boolean;
    reviewedBy?: string;
    reviewedAt?: Date;
    reviewNotes?: string;
    isApproved: boolean;
    rejectionReason?: string;
    autoModerated?: boolean;
    moderationScore?: number;
    flags?: {
      spam: boolean;
      inappropriate: boolean;
      offensive: boolean;
      copyright: boolean;
      other: boolean;
    };
  }): void {
    this.moderation = { ...this.moderation, ...moderation };
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
  getPathArray(): string[] {
    return this.path.split('/').filter(id => id);
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
    materialId: string;
    authorId: string;
    parentId?: string;
    rootId?: string;
    replyToUserId?: string;
    level: number;
    path: string;
    rating?: number;
    likeCount: number;
    dislikeCount: number;
    replyCount: number;
    isPinned: boolean;
    isHighlighted: boolean;
    isResolved: boolean;
    isAnonymous: boolean;
    isEdited: boolean;
    tags?: string[];
    mentions?: string[];
    lastEditedAt?: Date;
    resolvedAt?: Date;
    pinnedAt?: Date;
    highlightedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      content: this.content,
      type: this.type,
      status: this.status,
      materialId: this.materialId,
      authorId: this.authorId,
      parentId: this.parentId,
      rootId: this.rootId,
      replyToUserId: this.replyToUserId,
      level: this.level,
      path: this.path,
      rating: this.rating,
      likeCount: this.likeCount,
      dislikeCount: this.dislikeCount,
      replyCount: this.replyCount,
      isPinned: this.isPinned,
      isHighlighted: this.isHighlighted,
      isResolved: this.isResolved,
      isAnonymous: this.isAnonymous,
      isEdited: this.isEdited,
      tags: this.tags,
      mentions: this.mentions,
      lastEditedAt: this.lastEditedAt,
      resolvedAt: this.resolvedAt,
      pinnedAt: this.pinnedAt,
      highlightedAt: this.highlightedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * 生成评论路径
   * @param parentPath 父评论路径
   * @param commentId 评论ID
   * @returns 评论路径
   */
  static generatePath(parentPath: string, commentId: string): string {
    return parentPath ? `${parentPath}/${commentId}` : `/${commentId}`;
  }

  /**
   * 验证评论数据
   * @param data 评论数据
   * @returns 验证结果
   */
  static validate(data: Partial<MaterialComment>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.content || data.content.trim().length === 0) {
      errors.push('评论内容不能为空');
    }
    
    if (data.content && data.content.length > 10000) {
      errors.push('评论内容不能超过10000个字符');
    }
    
    if (!data.materialId) {
      errors.push('物料ID不能为空');
    }
    
    if (!data.authorId) {
      errors.push('作者ID不能为空');
    }
    
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      errors.push('评分必须在1-5之间');
    }
    
    if (data.level && data.level < 1) {
      errors.push('评论层级不能小于1');
    }
    
    if (data.likeCount && data.likeCount < 0) {
      errors.push('点赞数不能为负数');
    }
    
    if (data.dislikeCount && data.dislikeCount < 0) {
      errors.push('踩数不能为负数');
    }
    
    if (data.replyCount && data.replyCount < 0) {
      errors.push('回复数不能为负数');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建评论实例
   * @param data 评论数据
   * @returns 评论实例
   */
  static create(data: {
    content: string;
    materialId: string;
    authorId: string;
    type?: CommentType;
    parentId?: string;
    rootId?: string;
    replyToUserId?: string;
    rating?: number;
    isAnonymous?: boolean;
    tags?: string[];
    mentions?: string[];
    ipAddress?: string;
    userAgent?: string;
  }): Partial<MaterialComment> {
    const level = data.parentId ? 2 : 1; // 简化处理，实际应该根据父评论层级计算
    const path = data.parentId ? `/${data.parentId}` : '';
    
    return {
      content: data.content,
      type: data.type || CommentType.COMMENT,
      status: CommentStatus.ACTIVE,
      materialId: data.materialId,
      authorId: data.authorId,
      parentId: data.parentId,
      rootId: data.rootId || data.parentId,
      replyToUserId: data.replyToUserId,
      level,
      path,
      rating: data.rating,
      likeCount: 0,
      dislikeCount: 0,
      replyCount: 0,
      isPinned: false,
      isHighlighted: false,
      isResolved: false,
      isAnonymous: data.isAnonymous || false,
      isEdited: false,
      tags: data.tags,
      mentions: data.mentions,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    };
  }
}