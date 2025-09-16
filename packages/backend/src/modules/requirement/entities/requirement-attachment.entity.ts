import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Requirement } from './requirement.entity';
import { User } from '../../user/entities/user.entity';

/**
 * 需求附件实体
 */
@Entity('requirement_attachments')
@Index(['requirementId'])
@Index(['uploaderId'])
@Index(['fileType'])
@Index(['fileName'])
export class RequirementAttachment extends BaseEntity {
  @ApiProperty({ description: '文件名称' })
  @Column({
    type: 'varchar',
    length: 255,
    comment: '文件名称',
  })
  fileName: string;

  @ApiProperty({ description: '文件原始名称' })
  @Column({
    type: 'varchar',
    length: 255,
    comment: '文件原始名称',
  })
  originalName: string;

  @ApiProperty({ description: '文件路径' })
  @Column({
    type: 'varchar',
    length: 500,
    comment: '文件存储路径',
  })
  filePath: string;

  @ApiProperty({ description: '文件URL' })
  @Column({
    type: 'varchar',
    length: 500,
    comment: '文件访问URL',
  })
  fileUrl: string;

  @ApiProperty({ description: '文件大小（字节）' })
  @Column({
    type: 'bigint',
    comment: '文件大小（字节）',
  })
  fileSize: number;

  @ApiProperty({ description: '文件类型' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '文件MIME类型',
  })
  fileType: string;

  @ApiProperty({ description: '文件扩展名' })
  @Column({
    type: 'varchar',
    length: 20,
    comment: '文件扩展名',
  })
  fileExtension: string;

  @ApiProperty({ description: '文件MD5哈希' })
  @Column({
    type: 'varchar',
    length: 32,
    comment: '文件MD5哈希值',
  })
  fileHash: string;

  @ApiProperty({ description: '需求ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '需求ID',
  })
  requirementId: string;

  @ApiProperty({ description: '上传者ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '上传者ID',
  })
  uploaderId: string;

  @ApiProperty({ description: '附件描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '附件描述',
  })
  description?: string;

  @ApiProperty({ description: '附件分类', required: false })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '附件分类（document, image, video, etc.）',
  })
  category?: string;

  @ApiProperty({ description: '是否为图片' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为图片文件',
  })
  isImage: boolean;

  @ApiProperty({ description: '是否为文档' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为文档文件',
  })
  isDocument: boolean;

  @ApiProperty({ description: '是否为视频' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为视频文件',
  })
  isVideo: boolean;

  @ApiProperty({ description: '是否为音频' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为音频文件',
  })
  isAudio: boolean;

  @ApiProperty({ description: '下载次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '下载次数',
  })
  downloadCount: number;

  @ApiProperty({ description: '最后下载时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后下载时间',
  })
  lastDownloadAt?: Date;

  @ApiProperty({ description: '缩略图URL', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '缩略图URL（图片/视频）',
  })
  thumbnailUrl?: string;

  @ApiProperty({ description: '图片尺寸', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '图片尺寸信息',
  })
  imageDimensions?: {
    width: number;
    height: number;
  };

  @ApiProperty({ description: '视频信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '视频信息',
  })
  videoInfo?: {
    duration: number; // 时长（秒）
    width: number;
    height: number;
    bitrate: number;
    fps: number;
  };

  @ApiProperty({ description: '音频信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '音频信息',
  })
  audioInfo?: {
    duration: number; // 时长（秒）
    bitrate: number;
    sampleRate: number;
    channels: number;
  };

  @ApiProperty({ description: '文档信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '文档信息',
  })
  documentInfo?: {
    pages: number;
    author?: string;
    title?: string;
    subject?: string;
    keywords?: string;
  };

  @ApiProperty({ description: '存储提供商', required: false })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '存储提供商（local, oss, s3, etc.）',
  })
  storageProvider?: string;

  @ApiProperty({ description: '存储配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '存储配置信息',
  })
  storageConfig?: Record<string, any>;

  @ApiProperty({ description: '是否为临时文件' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为临时文件',
  })
  isTemporary: boolean;

  @ApiProperty({ description: '过期时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '文件过期时间',
  })
  expiresAt?: Date;

  @ApiProperty({ description: '附件元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '附件元数据',
  })
  metadata?: Record<string, any>;

  // 关联关系
  @ApiProperty({ description: '所属需求', type: () => Requirement })
  @ManyToOne(() => Requirement, requirement => requirement.attachments)
  @JoinColumn({ name: 'requirementId' })
  requirement: Requirement;

  @ApiProperty({ description: '上传者', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaderId' })
  uploader: User;

  /**
   * 检查是否可以删除
   * @param userId 用户ID
   * @returns 是否可以删除
   */
  canDelete(userId: string): boolean {
    return this.uploaderId === userId;
  }

  /**
   * 检查是否可以下载
   * @returns 是否可以下载
   */
  canDownload(): boolean {
    return !this.isTemporary || (this.expiresAt && this.expiresAt > new Date());
  }

  /**
   * 检查文件是否过期
   * @returns 是否过期
   */
  isExpired(): boolean {
    return this.isTemporary && this.expiresAt && this.expiresAt <= new Date();
  }

  /**
   * 获取文件大小的可读格式
   * @returns 格式化的文件大小
   */
  getFormattedSize(): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = this.fileSize;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  /**
   * 获取文件图标
   * @returns 文件图标名称
   */
  getFileIcon(): string {
    const iconMap: Record<string, string> = {
      // 图片
      'image/jpeg': 'image',
      'image/png': 'image',
      'image/gif': 'image',
      'image/webp': 'image',
      'image/svg+xml': 'image',
      
      // 文档
      'application/pdf': 'file-pdf',
      'application/msword': 'file-word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'file-word',
      'application/vnd.ms-excel': 'file-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'file-excel',
      'application/vnd.ms-powerpoint': 'file-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'file-powerpoint',
      'text/plain': 'file-text',
      'text/csv': 'file-csv',
      
      // 视频
      'video/mp4': 'video',
      'video/avi': 'video',
      'video/mov': 'video',
      'video/wmv': 'video',
      'video/flv': 'video',
      
      // 音频
      'audio/mp3': 'audio',
      'audio/wav': 'audio',
      'audio/flac': 'audio',
      'audio/aac': 'audio',
      
      // 压缩文件
      'application/zip': 'archive',
      'application/x-rar-compressed': 'archive',
      'application/x-7z-compressed': 'archive',
      'application/x-tar': 'archive',
      
      // 代码文件
      'text/javascript': 'code',
      'text/css': 'code',
      'text/html': 'code',
      'application/json': 'code',
      'text/xml': 'code',
    };
    
    return iconMap[this.fileType] || 'file';
  }

  /**
   * 检查是否为支持预览的文件类型
   * @returns 是否支持预览
   */
  isPreviewable(): boolean {
    const previewableTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript',
      'application/json', 'text/xml',
    ];
    
    return previewableTypes.includes(this.fileType);
  }

  /**
   * 增加下载次数
   */
  incrementDownloadCount(): void {
    this.downloadCount += 1;
    this.lastDownloadAt = new Date();
  }

  /**
   * 设置图片尺寸
   * @param width 宽度
   * @param height 高度
   */
  setImageDimensions(width: number, height: number): void {
    this.imageDimensions = { width, height };
  }

  /**
   * 设置视频信息
   * @param info 视频信息
   */
  setVideoInfo(info: {
    duration: number;
    width: number;
    height: number;
    bitrate: number;
    fps: number;
  }): void {
    this.videoInfo = info;
  }

  /**
   * 设置音频信息
   * @param info 音频信息
   */
  setAudioInfo(info: {
    duration: number;
    bitrate: number;
    sampleRate: number;
    channels: number;
  }): void {
    this.audioInfo = info;
  }

  /**
   * 设置文档信息
   * @param info 文档信息
   */
  setDocumentInfo(info: {
    pages: number;
    author?: string;
    title?: string;
    subject?: string;
    keywords?: string;
  }): void {
    this.documentInfo = info;
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
   * 获取附件的完整信息
   * @returns 附件信息
   */
  getInfo(): {
    id: string;
    fileName: string;
    originalName: string;
    fileUrl: string;
    fileSize: number;
    formattedSize: string;
    fileType: string;
    fileExtension: string;
    category?: string;
    description?: string;
    isImage: boolean;
    isDocument: boolean;
    isVideo: boolean;
    isAudio: boolean;
    isPreviewable: boolean;
    downloadCount: number;
    fileIcon: string;
    thumbnailUrl?: string;
    uploaderId: string;
    createdAt: Date;
  } {
    return {
      id: this.id,
      fileName: this.fileName,
      originalName: this.originalName,
      fileUrl: this.fileUrl,
      fileSize: this.fileSize,
      formattedSize: this.getFormattedSize(),
      fileType: this.fileType,
      fileExtension: this.fileExtension,
      category: this.category,
      description: this.description,
      isImage: this.isImage,
      isDocument: this.isDocument,
      isVideo: this.isVideo,
      isAudio: this.isAudio,
      isPreviewable: this.isPreviewable(),
      downloadCount: this.downloadCount,
      fileIcon: this.getFileIcon(),
      thumbnailUrl: this.thumbnailUrl,
      uploaderId: this.uploaderId,
      createdAt: this.createdAt,
    };
  }

  /**
   * 根据文件类型设置分类标志
   */
  setFileTypeFlags(): void {
    this.isImage = this.fileType.startsWith('image/');
    this.isVideo = this.fileType.startsWith('video/');
    this.isAudio = this.fileType.startsWith('audio/');
    
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'text/html',
      'text/css',
      'text/javascript',
      'application/json',
      'text/xml',
    ];
    
    this.isDocument = documentTypes.includes(this.fileType);
  }

  /**
   * 验证附件数据
   * @param data 附件数据
   * @returns 验证结果
   */
  static validate(data: Partial<RequirementAttachment>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.fileName || data.fileName.trim().length === 0) {
      errors.push('文件名不能为空');
    }
    
    if (!data.originalName || data.originalName.trim().length === 0) {
      errors.push('原始文件名不能为空');
    }
    
    if (!data.filePath || data.filePath.trim().length === 0) {
      errors.push('文件路径不能为空');
    }
    
    if (!data.fileUrl || data.fileUrl.trim().length === 0) {
      errors.push('文件URL不能为空');
    }
    
    if (!data.fileSize || data.fileSize <= 0) {
      errors.push('文件大小必须大于0');
    }
    
    if (!data.fileType || data.fileType.trim().length === 0) {
      errors.push('文件类型不能为空');
    }
    
    if (!data.fileHash || data.fileHash.trim().length === 0) {
      errors.push('文件哈希值不能为空');
    }
    
    if (!data.requirementId) {
      errors.push('需求ID不能为空');
    }
    
    if (!data.uploaderId) {
      errors.push('上传者ID不能为空');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 从文件名获取扩展名
   * @param fileName 文件名
   * @returns 扩展名
   */
  static getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1).toLowerCase() : '';
  }

  /**
   * 生成唯一文件名
   * @param originalName 原始文件名
   * @returns 唯一文件名
   */
  static generateUniqueFileName(originalName: string): string {
    const extension = RequirementAttachment.getFileExtension(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    
    return `${timestamp}_${random}${extension ? '.' + extension : ''}`;
  }

  /**
   * 检查文件大小是否超出限制
   * @param fileSize 文件大小（字节）
   * @param maxSize 最大大小（字节）
   * @returns 是否超出限制
   */
  static isFileSizeExceeded(fileSize: number, maxSize: number = 100 * 1024 * 1024): boolean {
    return fileSize > maxSize;
  }

  /**
   * 检查文件类型是否被允许
   * @param fileType 文件类型
   * @param allowedTypes 允许的文件类型列表
   * @returns 是否被允许
   */
  static isFileTypeAllowed(fileType: string, allowedTypes?: string[]): boolean {
    if (!allowedTypes || allowedTypes.length === 0) {
      return true;
    }
    
    return allowedTypes.includes(fileType);
  }
}