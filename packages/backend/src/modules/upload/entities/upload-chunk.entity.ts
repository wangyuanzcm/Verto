import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UploadTask } from './upload-task.entity';

/**
 * 上传分片实体
 */
@Entity('upload_chunks')
@Unique(['taskId', 'chunkIndex'])
@Index(['taskId'])
@Index(['chunkIndex'])
@Index(['status'])
@Index(['uploadedAt'])
export class UploadChunk extends BaseEntity {
  @ApiProperty({ description: '任务ID' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '上传任务ID',
  })
  taskId: string;

  @ApiProperty({ description: '分片索引' })
  @Column({
    type: 'int',
    comment: '分片索引（从0开始）',
  })
  chunkIndex: number;

  @ApiProperty({ description: '分片大小' })
  @Column({
    type: 'int',
    comment: '分片大小（字节）',
  })
  chunkSize: number;

  @ApiProperty({ description: '分片MD5' })
  @Column({
    type: 'varchar',
    length: 32,
    comment: '分片MD5哈希',
  })
  chunkMd5: string;

  @ApiProperty({ description: '分片状态' })
  @Column({
    type: 'enum',
    enum: ['pending', 'uploading', 'completed', 'failed'],
    default: 'pending',
    comment: '分片状态',
  })
  status: 'pending' | 'uploading' | 'completed' | 'failed';

  @ApiProperty({ description: '存储路径', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '分片存储路径',
  })
  storagePath?: string;

  @ApiProperty({ description: '临时路径', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '分片临时路径',
  })
  tempPath?: string;

  @ApiProperty({ description: '开始上传时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '开始上传时间',
  })
  startedAt?: Date;

  @ApiProperty({ description: '上传完成时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '上传完成时间',
  })
  uploadedAt?: Date;

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

  @ApiProperty({ description: '上传耗时（毫秒）', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '上传耗时（毫秒）',
  })
  duration?: number;

  @ApiProperty({ description: 'ETag', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'ETag（用于云存储）',
  })
  etag?: string;

  @ApiProperty({ description: '扩展数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '扩展数据',
  })
  metadata?: Record<string, any>;

  // 关联关系
  @ApiProperty({ description: '上传任务', type: () => UploadTask })
  @ManyToOne(() => UploadTask, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: UploadTask;

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
   * 检查是否可以重试
   * @returns 是否可以重试
   */
  canRetry(): boolean {
    return this.isFailed() && this.retryCount < 3;
  }

  /**
   * 开始上传
   */
  startUpload(): void {
    this.status = 'uploading';
    this.startedAt = new Date();
    this.errorMessage = null;
    this.failedAt = null;
  }

  /**
   * 标记为完成
   * @param storagePath 存储路径
   * @param etag ETag
   */
  markAsCompleted(storagePath?: string, etag?: string): void {
    this.status = 'completed';
    this.uploadedAt = new Date();
    
    if (storagePath) {
      this.storagePath = storagePath;
    }
    
    if (etag) {
      this.etag = etag;
    }
    
    // 计算上传耗时
    if (this.startedAt) {
      this.duration = this.uploadedAt.getTime() - this.startedAt.getTime();
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
   * 重试上传
   */
  retry(): void {
    if (this.canRetry()) {
      this.retryCount++;
      this.status = 'pending';
      this.errorMessage = null;
      this.failedAt = null;
      this.startedAt = null;
      this.uploadedAt = null;
      this.duration = null;
    }
  }

  /**
   * 重置分片
   */
  reset(): void {
    this.status = 'pending';
    this.retryCount = 0;
    this.errorMessage = null;
    this.startedAt = null;
    this.uploadedAt = null;
    this.failedAt = null;
    this.duration = null;
    this.storagePath = null;
    this.etag = null;
  }

  /**
   * 验证分片MD5
   * @param md5 要验证的MD5
   * @returns 是否匹配
   */
  validateMd5(md5: string): boolean {
    return this.chunkMd5 === md5;
  }

  /**
   * 获取上传速度（字节/秒）
   * @returns 上传速度
   */
  getUploadSpeed(): number | null {
    if (!this.duration || this.duration === 0) {
      return null;
    }
    return Math.floor((this.chunkSize / this.duration) * 1000);
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
   * 创建上传分片实例
   * @param data 分片数据
   * @returns 分片实例
   */
  static create(data: {
    taskId: string;
    chunkIndex: number;
    chunkSize: number;
    chunkMd5: string;
    tempPath?: string;
    metadata?: Record<string, any>;
  }): Partial<UploadChunk> {
    return {
      taskId: data.taskId,
      chunkIndex: data.chunkIndex,
      chunkSize: data.chunkSize,
      chunkMd5: data.chunkMd5,
      status: 'pending',
      tempPath: data.tempPath,
      retryCount: 0,
      metadata: data.metadata,
    };
  }
}