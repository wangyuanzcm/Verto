import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { FileMetadata } from './file-metadata.entity';
import { FileProcessing } from './file-processing.entity';
import { FileAccessControl } from './file-access-control.entity';
import { FileStatistics } from './file-statistics.entity';

/**
 * 文件实体
 */
@Entity('files')
@Index(['originalName'])
@Index(['mimeType'])
@Index(['size'])
@Index(['uploaderId'])
@Index(['status'])
@Index(['isPublic'])
@Index(['category'])
@Index(['createdAt'])
@Index(['uploaderId', 'category'])
@Index(['status', 'createdAt'])
export class File extends BaseEntity {
  @ApiProperty({ description: '原始文件名' })
  @Column({
    type: 'varchar',
    length: 255,
    comment: '原始文件名',
  })
  originalName: string;

  @ApiProperty({ description: '存储文件名' })
  @Column({
    type: 'varchar',
    length: 255,
    comment: '存储文件名（UUID）',
  })
  fileName: string;

  @ApiProperty({ description: '文件路径' })
  @Column({
    type: 'varchar',
    length: 500,
    comment: '文件存储路径',
  })
  filePath: string;

  @ApiProperty({ description: '文件大小（字节）' })
  @Column({
    type: 'bigint',
    comment: '文件大小（字节）',
  })
  size: number;

  @ApiProperty({ description: 'MIME类型' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: 'MIME类型',
  })
  mimeType: string;

  @ApiProperty({ description: '文件扩展名' })
  @Column({
    type: 'varchar',
    length: 20,
    comment: '文件扩展名',
  })
  extension: string;

  @ApiProperty({ description: '文件MD5哈希' })
  @Column({
    type: 'varchar',
    length: 32,
    comment: '文件MD5哈希值',
  })
  md5Hash: string;

  @ApiProperty({ description: '文件SHA256哈希', required: false })
  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
    comment: '文件SHA256哈希值',
  })
  sha256Hash?: string;

  @ApiProperty({ description: '文件分类' })
  @Column({
    type: 'enum',
    enum: ['image', 'document', 'video', 'audio', 'archive', 'code', 'other'],
    comment: '文件分类',
  })
  category: 'image' | 'document' | 'video' | 'audio' | 'archive' | 'code' | 'other';

  @ApiProperty({ description: '文件状态' })
  @Column({
    type: 'enum',
    enum: ['uploading', 'processing', 'completed', 'failed', 'deleted'],
    default: 'uploading',
    comment: '文件状态',
  })
  status: 'uploading' | 'processing' | 'completed' | 'failed' | 'deleted';

  @ApiProperty({ description: '是否公开' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否公开访问',
  })
  isPublic: boolean;

  @ApiProperty({ description: '是否临时文件' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否临时文件',
  })
  isTemporary: boolean;

  @ApiProperty({ description: '上传者ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '上传者用户ID',
  })
  uploaderId: string;

  @ApiProperty({ description: '存储类型' })
  @Column({
    type: 'enum',
    enum: ['local', 'oss', 's3', 'cos', 'qiniu', 'upyun'],
    default: 'local',
    comment: '存储类型',
  })
  storageType: 'local' | 'oss' | 's3' | 'cos' | 'qiniu' | 'upyun';

  @ApiProperty({ description: '存储桶名称', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '存储桶名称',
  })
  bucket?: string;

  @ApiProperty({ description: '存储区域', required: false })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '存储区域',
  })
  region?: string;

  @ApiProperty({ description: '访问URL', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '文件访问URL',
  })
  url?: string;

  @ApiProperty({ description: '缩略图URL', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '缩略图URL',
  })
  thumbnailUrl?: string;

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

  @ApiProperty({ description: '过期时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '文件过期时间',
  })
  expiresAt?: Date;

  @ApiProperty({ description: '文件描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '文件描述',
  })
  description?: string;

  @ApiProperty({ description: '文件标签', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '文件标签',
  })
  tags?: string[];

  // 元数据关联已移至 FileMetadata 实体

  // 处理信息关联已移至 FileProcessing 实体

  // 访问控制关联已移至 FileAccessControl 实体

  // 统计信息关联已移至 FileStatistics 实体

  // 关联关系
  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaderId' })
  uploader: User;

  @OneToOne(() => FileMetadata, metadata => metadata.file, { cascade: true })
  metadata: FileMetadata;

  @OneToOne(() => FileProcessing, processing => processing.file, { cascade: true })
  processing: FileProcessing;

  @OneToOne(() => FileAccessControl, accessControl => accessControl.file, { cascade: true })
  accessControl: FileAccessControl;

  @OneToOne(() => FileStatistics, statistics => statistics.file, { cascade: true })
  statistics: FileStatistics;

  /**
   * 检查文件是否已完成上传
   * @returns 是否已完成
   */
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * 检查文件是否失败
   * @returns 是否失败
   */
  isFailed(): boolean {
    return this.status === 'failed';
  }

  /**
   * 检查文件是否已删除
   * @returns 是否已删除
   */
  isDeleted(): boolean {
    return this.status === 'deleted';
  }

  /**
   * 检查文件是否为图片
   * @returns 是否为图片
   */
  isImage(): boolean {
    return this.category === 'image';
  }

  /**
   * 检查文件是否为视频
   * @returns 是否为视频
   */
  isVideo(): boolean {
    return this.category === 'video';
  }

  /**
   * 检查文件是否为音频
   * @returns 是否为音频
   */
  isAudio(): boolean {
    return this.category === 'audio';
  }

  /**
   * 检查文件是否为文档
   * @returns 是否为文档
   */
  isDocument(): boolean {
    return this.category === 'document';
  }

  /**
   * 检查文件是否过期
   * @returns 是否过期
   */
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  /**
   * 检查文件是否为临时文件
   * @returns 是否为临时文件
   */
  isTemporaryFile(): boolean {
    return this.isTemporary;
  }

  /**
   * 检查用户是否可以访问文件
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以访问
   */
  canAccess(userId?: string, userRoles?: string[]): boolean {
    // 公开文件可以访问
    if (this.isPublic) return true;
    
    // 文件所有者可以访问
    if (userId && this.uploaderId === userId) return true;
    
    // 如果没有访问控制设置，只有上传者可以访问
    if (!this.accessControl) {
      return false;
    }
    
    // 使用访问控制实体的方法
    return this.accessControl.canRead(userId, userRoles);
  }

  /**
   * 检查用户是否可以编辑文件
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以编辑
   */
  canEdit(userId?: string, userRoles?: string[]): boolean {
    // 文件所有者可以编辑
    if (userId && this.uploaderId === userId) return true;
    
    // 如果没有访问控制设置，只有上传者可以编辑
    if (!this.accessControl) {
      return false;
    }
    
    // 使用访问控制实体的方法
    return this.accessControl.canWrite(userId, userRoles);
  }

  /**
   * 检查用户是否可以删除文件
   * @param userId 用户ID
   * @param userRoles 用户角色
   * @returns 是否可以删除
   */
  canDelete(userId?: string, userRoles?: string[]): boolean {
    // 文件所有者可以删除
    if (userId && this.uploaderId === userId) return true;
    
    // 如果没有访问控制设置，只有上传者可以删除
    if (!this.accessControl) {
      return false;
    }
    
    // 使用访问控制实体的方法
    return this.accessControl.canDelete(userId, userRoles);
  }

  /**
   * 获取文件大小的可读格式
   * @returns 可读的文件大小
   */
  getReadableSize(): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = this.size;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
  }

  /**
   * 获取文件类型图标
   * @returns 文件类型图标
   */
  getTypeIcon(): string {
    const iconMap: Record<string, string> = {
      // 图片
      'image/jpeg': 'image',
      'image/png': 'image',
      'image/gif': 'image',
      'image/svg+xml': 'image',
      'image/webp': 'image',
      
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
      
      // 压缩包
      'application/zip': 'archive',
      'application/x-rar-compressed': 'archive',
      'application/x-7z-compressed': 'archive',
      'application/x-tar': 'archive',
      
      // 代码
      'text/javascript': 'code',
      'text/css': 'code',
      'text/html': 'code',
      'application/json': 'code',
      'text/xml': 'code',
    };
    
    return iconMap[this.mimeType] || 'file';
  }

  /**
   * 增加下载次数
   */
  incrementDownloadCount(): void {
    this.downloadCount += 1;
    this.lastDownloadAt = new Date();
    
    // 更新统计信息
    if (this.statistics) {
      this.statistics.incrementDownloads();
    }
  }

  /**
   * 标记为已删除
   */
  markAsDeleted(): void {
    this.status = 'deleted';
  }

  /**
   * 设置过期时间
   * @param hours 小时数
   */
  setExpiresIn(hours: number): void {
    this.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
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
   * 获取文件尺寸信息（通过元数据）
   */
  getDimensions(): { width: number; height: number } | null {
    return this.metadata?.getDimensions() || null;
  }

  /**
   * 获取媒体文件时长（通过元数据）
   */
  getDuration(): number | null {
    return this.metadata?.getDuration() || null;
  }

  /**
   * 检查是否有缩略图（通过处理信息）
   */
  hasThumbnails(): boolean {
    return this.processing?.hasThumbnails() || false;
  }

  /**
   * 获取指定尺寸的缩略图（通过处理信息）
   */
  getThumbnail(size: string): { url: string; width: number; height: number } | null {
    return this.processing?.getThumbnail(size) || null;
  }

  /**
   * 获取总下载次数（通过统计信息）
   */
  getTotalDownloads(): number {
    return this.statistics?.getTotalDownloads() || 0;
  }

  /**
   * 获取平均评分（通过统计信息）
   */
  getAverageRating(): number {
    return this.statistics?.getAverageRating() || 0;
  }

  /**
   * 检查是否为热门文件（通过统计信息）
   */
  isPopular(threshold: number = 100): boolean {
    return this.statistics?.isPopular(threshold) || false;
  }

  /**
   * 验证文件数据
   * @param data 文件数据
   * @returns 验证结果
   */
  static validate(data: Partial<File>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.originalName || data.originalName.trim().length === 0) {
      errors.push('原始文件名不能为空');
    }
    
    if (!data.fileName || data.fileName.trim().length === 0) {
      errors.push('存储文件名不能为空');
    }
    
    if (!data.filePath || data.filePath.trim().length === 0) {
      errors.push('文件路径不能为空');
    }
    
    if (data.size === undefined || data.size < 0) {
      errors.push('文件大小无效');
    }
    
    if (!data.mimeType || data.mimeType.trim().length === 0) {
      errors.push('MIME类型不能为空');
    }
    
    if (!data.extension || data.extension.trim().length === 0) {
      errors.push('文件扩展名不能为空');
    }
    
    if (!data.md5Hash || !/^[a-f0-9]{32}$/i.test(data.md5Hash)) {
      errors.push('MD5哈希值格式无效');
    }
    
    if (data.sha256Hash && !/^[a-f0-9]{64}$/i.test(data.sha256Hash)) {
      errors.push('SHA256哈希值格式无效');
    }
    
    if (!data.uploaderId || data.uploaderId.trim().length === 0) {
      errors.push('上传者ID不能为空');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 根据MIME类型获取文件分类
   * @param mimeType MIME类型
   * @returns 文件分类
   */
  static getCategoryFromMimeType(mimeType: string): File['category'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    
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
      'text/rtf',
    ];
    
    if (documentTypes.includes(mimeType)) return 'document';
    
    const archiveTypes = [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
    ];
    
    if (archiveTypes.includes(mimeType)) return 'archive';
    
    const codeTypes = [
      'text/javascript',
      'text/css',
      'text/html',
      'application/json',
      'text/xml',
      'application/xml',
      'text/x-python',
      'text/x-java-source',
      'text/x-c',
      'text/x-c++',
    ];
    
    if (codeTypes.includes(mimeType) || mimeType.startsWith('text/')) return 'code';
    
    return 'other';
  }

  /**
   * 创建文件实例
   * @param data 文件数据
   * @returns 文件实例
   */
  static create(data: {
    originalName: string;
    fileName: string;
    filePath: string;
    size: number;
    mimeType: string;
    extension: string;
    md5Hash: string;
    sha256Hash?: string;
    uploaderId: string;
    storageType?: File['storageType'];
    bucket?: string;
    region?: string;
    isPublic?: boolean;
    isTemporary?: boolean;
    description?: string;
    tags?: string[];
  }): Partial<File> {
    return {
      originalName: data.originalName,
      fileName: data.fileName,
      filePath: data.filePath,
      size: data.size,
      mimeType: data.mimeType,
      extension: data.extension,
      md5Hash: data.md5Hash,
      sha256Hash: data.sha256Hash,
      category: this.getCategoryFromMimeType(data.mimeType),
      status: 'uploading',
      isPublic: data.isPublic || false,
      isTemporary: data.isTemporary || false,
      uploaderId: data.uploaderId,
      storageType: data.storageType || 'local',
      bucket: data.bucket,
      region: data.region,
      downloadCount: 0,
      description: data.description,
      tags: data.tags,
    };
  }
}