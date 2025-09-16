import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { File } from './file.entity';

/**
 * 文件处理信息实体
 * 存储文件处理过程中的状态和结果
 */
@Entity('file_processing')
@Index(['status'])
@Index(['fileId'])
@Index(['status', 'createdAt'])
export class FileProcessing extends BaseEntity {
  @ApiProperty({ description: '文件ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '关联的文件ID',
  })
  fileId: string;

  @ApiProperty({ description: '处理状态' })
  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    comment: '处理状态',
  })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @ApiProperty({ description: '处理进度' })
  @Column({
    type: 'int',
    default: 0,
    comment: '处理进度 0-100',
  })
  progress: number;

  @ApiProperty({ description: '开始时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '处理开始时间',
  })
  startedAt?: Date;

  @ApiProperty({ description: '完成时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '处理完成时间',
  })
  completedAt?: Date;

  @ApiProperty({ description: '错误信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '处理错误信息',
  })
  error?: {
    code: string;
    message: string;
    details?: any;
  };

  @ApiProperty({ description: '处理任务列表', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '处理任务列表',
  })
  tasks?: {
    type: 'thumbnail' | 'compress' | 'convert' | 'extract' | 'scan';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    result?: any;
    error?: string;
  }[];

  @ApiProperty({ description: '处理结果', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '处理结果',
  })
  results?: {
    thumbnails?: {
      size: string; // 'small', 'medium', 'large'
      url: string;
      width: number;
      height: number;
    }[];
    compressed?: {
      url: string;
      size: number;
      quality: number;
    };
    converted?: {
      format: string;
      url: string;
      size: number;
    }[];
    extracted?: {
      text?: string;
      images?: string[];
      metadata?: any;
    };
    scanned?: {
      virusFound: boolean;
      threats?: string[];
      scanEngine: string;
      scanTime: Date;
    };
  };

  // 关联关系
  @OneToOne(() => File, file => file.processing)
  @JoinColumn({ name: 'fileId' })
  file: File;

  /**
   * 检查是否正在处理中
   */
  isProcessing(): boolean {
    return this.status === 'processing';
  }

  /**
   * 检查是否处理完成
   */
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * 检查是否处理失败
   */
  isFailed(): boolean {
    return this.status === 'failed';
  }

  /**
   * 检查是否等待处理
   */
  isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * 开始处理
   */
  startProcessing(): void {
    this.status = 'processing';
    this.startedAt = new Date();
    this.progress = 0;
  }

  /**
   * 更新处理进度
   */
  updateProgress(progress: number): void {
    this.progress = Math.max(0, Math.min(100, progress));
  }

  /**
   * 完成处理
   */
  completeProcessing(): void {
    this.status = 'completed';
    this.completedAt = new Date();
    this.progress = 100;
  }

  /**
   * 标记处理失败
   */
  failProcessing(error: { code: string; message: string; details?: any }): void {
    this.status = 'failed';
    this.completedAt = new Date();
    this.error = error;
  }

  /**
   * 添加处理任务
   */
  addTask(task: {
    type: 'thumbnail' | 'compress' | 'convert' | 'extract' | 'scan';
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    result?: any;
    error?: string;
  }): void {
    if (!this.tasks) {
      this.tasks = [];
    }
    this.tasks.push({
      status: 'pending',
      ...task,
    });
  }

  /**
   * 更新任务状态
   */
  updateTask(
    taskType: 'thumbnail' | 'compress' | 'convert' | 'extract' | 'scan',
    updates: {
      status?: 'pending' | 'processing' | 'completed' | 'failed';
      progress?: number;
      result?: any;
      error?: string;
    }
  ): void {
    if (!this.tasks) return;

    const task = this.tasks.find(t => t.type === taskType);
    if (task) {
      Object.assign(task, updates);
    }
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(taskType: 'thumbnail' | 'compress' | 'convert' | 'extract' | 'scan'): string | null {
    if (!this.tasks) return null;
    const task = this.tasks.find(t => t.type === taskType);
    return task?.status || null;
  }

  /**
   * 检查是否有缩略图
   */
  hasThumbnails(): boolean {
    return !!(this.results?.thumbnails && this.results.thumbnails.length > 0);
  }

  /**
   * 获取指定尺寸的缩略图
   */
  getThumbnail(size: string): { url: string; width: number; height: number } | null {
    if (!this.results?.thumbnails) return null;
    return this.results.thumbnails.find(t => t.size === size) || null;
  }

  /**
   * 检查是否有压缩版本
   */
  hasCompressed(): boolean {
    return !!this.results?.compressed;
  }

  /**
   * 检查是否有转换版本
   */
  hasConverted(): boolean {
    return !!(this.results?.converted && this.results.converted.length > 0);
  }

  /**
   * 获取指定格式的转换版本
   */
  getConverted(format: string): { url: string; size: number } | null {
    if (!this.results?.converted) return null;
    return this.results.converted.find(c => c.format === format) || null;
  }

  /**
   * 检查是否已扫描病毒
   */
  isScanned(): boolean {
    return !!this.results?.scanned;
  }

  /**
   * 检查是否发现病毒
   */
  hasVirus(): boolean {
    return this.results?.scanned?.virusFound || false;
  }

  /**
   * 获取处理耗时（毫秒）
   */
  getProcessingDuration(): number | null {
    if (!this.startedAt || !this.completedAt) return null;
    return this.completedAt.getTime() - this.startedAt.getTime();
  }

  /**
   * 获取格式化的处理耗时
   */
  getFormattedDuration(): string | null {
    const duration = this.getProcessingDuration();
    if (!duration) return null;

    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * 创建文件处理实例
   */
  static create(data: {
    fileId: string;
    status?: FileProcessing['status'];
    tasks?: FileProcessing['tasks'];
  }): Partial<FileProcessing> {
    const processing = new FileProcessing();
    processing.fileId = data.fileId;
    processing.status = data.status || 'pending';
    processing.progress = 0;
    processing.tasks = data.tasks || [];
    return processing;
  }
}