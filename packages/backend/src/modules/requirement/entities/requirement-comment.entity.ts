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
import { Requirement } from './requirement.entity';
import { User } from '../../user/entities/user.entity';

/**
 * 需求评论实体
 */
@Entity('requirement_comments')
@Index(['requirementId'])
@Index(['authorId'])
@Index(['parentId'])
export class RequirementComment extends BaseEntity {
  @ApiProperty({ description: '评论内容' })
  @Column({
    type: 'text',
    comment: '评论内容',
  })
  content: string;

  @ApiProperty({ description: '评论类型', required: false })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '评论类型（comment, suggestion, question, etc.）',
  })
  type?: string;

  @ApiProperty({ description: '需求ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '需求ID',
  })
  requirementId: string;

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

  @ApiProperty({ description: '是否已编辑' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否已编辑',
  })
  isEdited: boolean;

  @ApiProperty({ description: '编辑时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '编辑时间',
  })
  editedAt?: Date;

  @ApiProperty({ description: '是否置顶' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否置顶',
  })
  isPinned: boolean;

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
    size: number;
    type: string;
  }[];

  @ApiProperty({ description: '提及的用户', required: false })
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
  metadata?: Record<string, any>;

  // 关联关系
  @ApiProperty({ description: '所属需求', type: () => Requirement })
  @ManyToOne(() => Requirement, requirement => requirement.comments)
  @JoinColumn({ name: 'requirementId' })
  requirement: Requirement;

  @ApiProperty({ description: '评论作者', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ApiProperty({ description: '父评论', type: () => RequirementComment })
  @ManyToOne(() => RequirementComment, comment => comment.replies)
  @JoinColumn({ name: 'parentId' })
  parent?: RequirementComment;

  @ApiProperty({ description: '回复评论', type: () => [RequirementComment] })
  @OneToMany(() => RequirementComment, comment => comment.parent)
  replies: RequirementComment[];

  /**
   * 检查是否可以编辑
   * @param userId 用户ID
   * @returns 是否可以编辑
   */
  canEdit(userId: string): boolean {
    return this.authorId === userId;
  }

  /**
   * 检查是否可以删除
   * @param userId 用户ID
   * @returns 是否可以删除
   */
  canDelete(userId: string): boolean {
    return this.authorId === userId;
  }

  /**
   * 检查是否为回复
   * @returns 是否为回复
   */
  isReply(): boolean {
    return !!this.parentId;
  }

  /**
   * 检查是否有回复
   * @returns 是否有回复
   */
  hasReplies(): boolean {
    return this.repliesCount > 0;
  }

  /**
   * 检查是否有附件
   * @returns 是否有附件
   */
  hasAttachments(): boolean {
    return this.attachments && this.attachments.length > 0;
  }

  /**
   * 检查是否提及了用户
   * @param userId 用户ID
   * @returns 是否提及
   */
  mentionsUser(userId: string): boolean {
    return this.mentions ? this.mentions.includes(userId) : false;
  }

  /**
   * 获取评论层级
   * @returns 层级深度
   */
  getLevel(): number {
    let level = 0;
    let current = this.parent;
    
    while (current) {
      level++;
      current = current.parent;
    }
    
    return level;
  }

  /**
   * 获取根评论
   * @returns 根评论
   */
  getRoot(): RequirementComment {
    let current: RequirementComment = this;
    
    while (current.parent) {
      current = current.parent;
    }
    
    return current;
  }

  /**
   * 添加附件
   * @param attachment 附件信息
   */
  addAttachment(attachment: {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
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
   * 标记为已编辑
   */
  markAsEdited(): void {
    this.isEdited = true;
    this.editedAt = new Date();
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
   * 获取评论摘要
   * @param maxLength 最大长度
   * @returns 评论摘要
   */
  getSummary(maxLength: number = 100): string {
    if (this.content.length <= maxLength) {
      return this.content;
    }
    
    return this.content.substring(0, maxLength) + '...';
  }

  /**
   * 检查评论是否为新评论
   * @param hours 小时数阈值
   * @returns 是否为新评论
   */
  isNew(hours: number = 24): boolean {
    const now = new Date();
    const diffTime = now.getTime() - this.createdAt.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    
    return diffHours <= hours;
  }

  /**
   * 获取评论的完整信息
   * @returns 评论信息
   */
  getInfo(): {
    id: string;
    content: string;
    summary: string;
    type?: string;
    authorId: string;
    parentId?: string;
    isReply: boolean;
    hasReplies: boolean;
    hasAttachments: boolean;
    isEdited: boolean;
    isPinned: boolean;
    isNew: boolean;
    likesCount: number;
    repliesCount: number;
    level: number;
    createdAt: Date;
    editedAt?: Date;
  } {
    return {
      id: this.id,
      content: this.content,
      summary: this.getSummary(),
      type: this.type,
      authorId: this.authorId,
      parentId: this.parentId,
      isReply: this.isReply(),
      hasReplies: this.hasReplies(),
      hasAttachments: this.hasAttachments(),
      isEdited: this.isEdited,
      isPinned: this.isPinned,
      isNew: this.isNew(),
      likesCount: this.likesCount,
      repliesCount: this.repliesCount,
      level: this.getLevel(),
      createdAt: this.createdAt,
      editedAt: this.editedAt,
    };
  }

  /**
   * 验证评论数据
   * @param data 评论数据
   * @returns 验证结果
   */
  static validate(data: Partial<RequirementComment>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.content || data.content.trim().length === 0) {
      errors.push('评论内容不能为空');
    }
    
    if (data.content && data.content.length > 10000) {
      errors.push('评论内容不能超过10000个字符');
    }
    
    if (!data.requirementId) {
      errors.push('需求ID不能为空');
    }
    
    if (!data.authorId) {
      errors.push('作者ID不能为空');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 解析评论中的提及用户
   * @param content 评论内容
   * @returns 提及的用户ID列表
   */
  static parseMentions(content: string): string[] {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      const userId = match[2];
      if (!mentions.includes(userId)) {
        mentions.push(userId);
      }
    }
    
    return mentions;
  }

  /**
   * 格式化评论内容（处理提及、链接等）
   * @param content 原始内容
   * @returns 格式化后的内容
   */
  static formatContent(content: string): string {
    // 处理用户提及
    content = content.replace(
      /@\[([^\]]+)\]\(([^)]+)\)/g,
      '<span class="mention" data-user-id="$2">@$1</span>'
    );
    
    // 处理链接
    content = content.replace(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
      '<a href="$&" target="_blank" rel="noopener noreferrer">$&</a>'
    );
    
    // 处理换行
    content = content.replace(/\n/g, '<br>');
    
    return content;
  }

  /**
   * 创建系统评论
   * @param requirementId 需求ID
   * @param content 评论内容
   * @param type 评论类型
   * @returns 评论数据
   */
  static createSystemComment(
    requirementId: string,
    content: string,
    type: string = 'system'
  ): Partial<RequirementComment> {
    return {
      requirementId,
      content,
      type,
      authorId: 'system', // 系统用户ID
    };
  }
}