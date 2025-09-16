import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { File } from '../../file/entities/file.entity';

/**
 * 上传任务实体
 */
@Entity('upload_tasks')
@Index(['taskId'], { unique: true })
@Index(['status'])
@Index(['uploaderId'])
@Index(['uploadType'])
@Index(['createdAt'])
@Index(['completedAt'])
export class UploadTask extends BaseEntity {
  @ApiProperty({ description: '任务ID' })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '上传任务ID',
  })
  taskId: string;

  @ApiProperty({ description: '原始文件名' })
  @Column({
    type: 'varchar',
    length: 255,
    comment: '原始文件名',
  })
  originalName: string;

  @ApiProperty({ description: '文件大小' })
  @Column({
    type: 'bigint',
    comment: '文件大小（字节）',
  })
  fileSize: number;

  @ApiProperty({ description: 'MIME类型' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: 'MIME类型',
  })
  mimeType: string;

  @ApiProperty({ description: '上传类型' })
  @Column({
    type: 'enum',
    enum: ['single', 'chunk', 'resumable'],
    comment: '上传类型',
  })
  uploadType: 'single' | 'chunk' | 'resumable';

  @ApiProperty({ description: '上传状态' })
  @Column({
    type: 'enum',
    enum: ['pending', 'uploading', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    comment: '上传状态',
  })
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';

  @ApiProperty({ description: '上传进度' })
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: '上传进度（0-100）',
  })
  progress: number;

  @ApiProperty({ description: '已上传大小' })
  @Column({
    type: 'bigint',
    default: 0,
    comment: '已上传大小（字节）',
  })
  uploadedSize: number;

  @ApiProperty({ description: '分片总数', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '分片总数',
  })
  totalChunks?: number;

  @ApiProperty({ description: '已上传分片数', required: false })
  @Column({
    type: 'int',
    default: 0,
    comment: '已上传分片数',
  })
  uploadedChunks: number;

  @ApiProperty({ description: '分片大小', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '分片大小（字节）',
  })
  chunkSize?: number;

  @ApiProperty({ description: '文件MD5', required: false })
  @Column({
    type: 'varchar',
    length: 32,
    nullable: true,
    comment: '文件MD5哈希',
  })
  fileMd5?: string;

  @ApiProperty({ description: '上传者ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '上传者ID',
  })
  uploaderId: string;

  @ApiProperty({ description: '存储路径', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '文件存储路径',
  })
  storagePath?: string;

  @ApiProperty({ description: '临时路径', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '临时文件路径',
  })
  tempPath?: string;

  @ApiProperty({ description: '开始时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '开始上传时间',
  })
  startedAt?: Date;

  @ApiProperty({ description: '完成时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '上传完成时间',
  })
  completedAt?: Date;

  @ApiProperty({ description: '失败时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '上传失败时间',
  })
  failedAt?: Date;

  @ApiProperty({ description: '错误信息', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '错误信息',
  })
  errorMessage?: string;

  @ApiProperty({ description: '重试次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '重试次数',
  })
  retryCount: number;

  @ApiProperty({ description: '最大重试次数' })
  @Column({
    type: 'int',
    default: 3,
    comment: '最大重试次数',
  })
  maxRetries: number;

  @ApiProperty({ description: '上传配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '上传配置',
  })
  uploadConfig?: {
    allowedTypes?: string[];
    maxSize?: number;
    compress?: boolean;
    watermark?: boolean;
    [key: string]: any;
  };

  @ApiProperty({ description: '扩展数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '扩展数据',
  })
  metadata?: Record<string, any>;

  // 关联关系
  @ApiProperty({ description: '上传者', type: () => User })
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'uploader_id' })
  uploader: User;

  @ApiProperty({ description: '关联文件', type: () => File })
  @ManyToOne(() => File, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'file_id' })
  file?: File;

  /**
   * 检查是否为待处理状态
   * @returns 是否为待处理
   */
  isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * 检查是否正在上传
   * @returns 是否正在上传
   */
  isUploading(): boolean {
    return this.status === 'uploading';
  }

  /**
   * 检查是否正在处理
   * @returns 是否正在处理
   */
  isProcessing(): boolean {
    return this.status === 'processing';
  }

  /**
   * 检查是否已完成
   * @returns 是否已完成
   */
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * 检查是否失败
   * @returns 是否失败
   */
  isFailed(): boolean {
    return this.status === 'failed';
  }

  /**
   * 检查是否已取消
   * @returns 是否已取消
   */
  isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  /**
   * 检查是否为分片上传
   * @returns 是否为分片上传
   */
  isChunkUpload(): boolean {
    return this.uploadType === 'chunk' || this.uploadType === 'resumable';
  }

  /**
   * 检查是否可以重试
   * @returns 是否可以重试
   */
  canRetry(): boolean {
    return this.isFailed() && this.retryCount < this.maxRetries;
  }

  /**
   * 开始上传
   */
  start(): void {
    this.status = 'uploading';
    this.startedAt = new Date();
    this.progress = 0;
    this.uploadedSize = 0;
    this.uploadedChunks = 0;
  }

  /**
   * 更新上传进度
   * @param uploadedSize 已上传大小
   * @param uploadedChunks 已上传分片数
   */
  updateProgress(uploadedSize: number, uploadedChunks?: number): void {
    this.uploadedSize = uploadedSize;
    this.progress = Math.min(100, (uploadedSize / this.fileSize) * 100);
    
    if (uploadedChunks !== undefined) {
      this.uploadedChunks = uploadedChunks;
    }
  }

  /**
   * 标记为处理中
   */
  markAsProcessing(): void {
    this.status = 'processing';
    this.progress = 100;
  }

  /**
   * 标记为完成
   * @param storagePath 存储路径
   */
  markAsCompleted(storagePath?: string): void {
    this.status = 'completed';
    this.progress = 100;
    this.completedAt = new Date();
    if (storagePath) {
      this.storagePath = storagePath;
    }
  }

  /**
   * 标记为失败
   * @param errorMessage 错误信息
   */
  markAsFailed(errorMessage: string): void {
    this.status = 'failed';
    this.failedAt = new Date();
    this.errorMessage = errorMessage;
  }

  /**
   * 取消上传
   */
  cancel(): void {
    this.status = 'cancelled';
  }

  /**
   * 重试上传
   */
  retry(): void {
    if (this.canRetry()) {
      this.retryCount++;
      this.status = 'pending';
      this.errorMessage = null;
      this.failedAt = null;
      this.progress = 0;
      this.uploadedSize = 0;
      this.uploadedChunks = 0;
    }
  }

  /**
   * 重置任务
   */
  reset(): void {
    this.status = 'pending';
    this.progress = 0;
    this.uploadedSize = 0;
    this.uploadedChunks = 0;
    this.retryCount = 0;
    this.errorMessage = null;
    this.startedAt = null;
    this.completedAt = null;
    this.failedAt = null;
  }

  /**
   * 获取上传耗时（秒）
   * @returns 耗时秒数
   */
  getDuration(): number | null {
    if (!this.startedAt) {
      return null;
    }
    
    const endTime = this.completedAt || this.failedAt || new Date();
    return Math.floor((endTime.getTime() - this.startedAt.getTime()) / 1000);
  }

  /**
   * 获取上传速度（字节/秒）
   * @returns 上传速度
   */
  getUploadSpeed(): number | null {
    const duration = this.getDuration();
    if (!duration || duration === 0) {
      return null;
    }
    return Math.floor(this.uploadedSize / duration);
  }

  /**
   * 添加元数据
   * @param key 键
   * @param value 值
   */
  addMetadata(key: string, value: any): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
  }

  /**
   * 创建上传任务实例
   * @param data 任务数据
   * @returns 任务实例
   */
  static create(data: {
    taskId: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    uploadType: UploadTask['uploadType'];
    uploaderId: string;
    totalChunks?: number;
    chunkSize?: number;
    fileMd5?: string;
    uploadConfig?: UploadTask['uploadConfig'];
    metadata?: Record<string, any>;
  }): Partial<UploadTask> {
    return {
      taskId: data.taskId,
      originalName: data.originalName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      uploadType: data.uploadType,
      status: 'pending',
      progress: 0,
      uploadedSize: 0,
      totalChunks: data.totalChunks,
      uploadedChunks: 0,
      chunkSize: data.chunkSize,
      fileMd5: data.fileMd5,
      uploaderId: data.uploaderId,
      retryCount: 0,
      maxRetries: 3,
      uploadConfig: data.uploadConfig,
      metadata: data.metadata,
    };
  }
}