import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { File } from './file.entity';

/**
 * 文件元数据实体
 * 存储文件的详细元数据信息
 */
@Entity('file_metadata')
export class FileMetadata extends BaseEntity {
  @ApiProperty({ description: '文件ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '关联的文件ID',
  })
  fileId: string;

  @ApiProperty({ description: '图片元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '图片文件元数据',
  })
  image?: {
    width: number;
    height: number;
    format: string;
    colorSpace?: string;
    hasAlpha?: boolean;
    orientation?: number;
    dpi?: {
      x: number;
      y: number;
    };
    exif?: Record<string, any>;
  };

  @ApiProperty({ description: '视频元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '视频文件元数据',
  })
  video?: {
    duration: number; // 秒
    width: number;
    height: number;
    frameRate: number;
    bitrate: number;
    codec: string;
    format: string;
    hasAudio: boolean;
    audioCodec?: string;
    audioBitrate?: number;
    audioChannels?: number;
    audioSampleRate?: number;
  };

  @ApiProperty({ description: '音频元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '音频文件元数据',
  })
  audio?: {
    duration: number; // 秒
    bitrate: number;
    codec: string;
    format: string;
    channels: number;
    sampleRate: number;
    title?: string;
    artist?: string;
    album?: string;
    year?: number;
    genre?: string;
  };

  @ApiProperty({ description: '文档元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '文档文件元数据',
  })
  document?: {
    pageCount?: number;
    wordCount?: number;
    characterCount?: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
    keywords?: string[];
  };

  @ApiProperty({ description: '压缩包元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '压缩包文件元数据',
  })
  archive?: {
    fileCount: number;
    uncompressedSize: number;
    compressionRatio: number;
    format: string;
    hasPassword: boolean;
    files?: {
      name: string;
      size: number;
      compressedSize: number;
      crc32?: string;
      isDirectory: boolean;
    }[];
  };

  @ApiProperty({ description: '代码文件元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '代码文件元数据',
  })
  code?: {
    language: string;
    lineCount: number;
    characterCount: number;
    encoding: string;
    hasShebang: boolean;
    dependencies?: string[];
    functions?: string[];
    classes?: string[];
  };

  // 关联关系
  @OneToOne(() => File, file => file.metadata)
  @JoinColumn({ name: 'fileId' })
  file: File;

  /**
   * 检查是否有图片元数据
   */
  hasImageMetadata(): boolean {
    return !!this.image;
  }

  /**
   * 检查是否有视频元数据
   */
  hasVideoMetadata(): boolean {
    return !!this.video;
  }

  /**
   * 检查是否有音频元数据
   */
  hasAudioMetadata(): boolean {
    return !!this.audio;
  }

  /**
   * 检查是否有文档元数据
   */
  hasDocumentMetadata(): boolean {
    return !!this.document;
  }

  /**
   * 检查是否有压缩包元数据
   */
  hasArchiveMetadata(): boolean {
    return !!this.archive;
  }

  /**
   * 检查是否有代码文件元数据
   */
  hasCodeMetadata(): boolean {
    return !!this.code;
  }

  /**
   * 获取文件尺寸信息（适用于图片和视频）
   */
  getDimensions(): { width: number; height: number } | null {
    if (this.image) {
      return { width: this.image.width, height: this.image.height };
    }
    if (this.video) {
      return { width: this.video.width, height: this.video.height };
    }
    return null;
  }

  /**
   * 获取媒体文件时长（适用于音频和视频）
   */
  getDuration(): number | null {
    if (this.video) {
      return this.video.duration;
    }
    if (this.audio) {
      return this.audio.duration;
    }
    return null;
  }

  /**
   * 格式化时长为可读字符串
   */
  getFormattedDuration(): string | null {
    const duration = this.getDuration();
    if (!duration) return null;

    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * 创建文件元数据实例
   */
  static create(data: {
    fileId: string;
    image?: FileMetadata['image'];
    video?: FileMetadata['video'];
    audio?: FileMetadata['audio'];
    document?: FileMetadata['document'];
    archive?: FileMetadata['archive'];
    code?: FileMetadata['code'];
  }): Partial<FileMetadata> {
    const metadata = new FileMetadata();
    metadata.fileId = data.fileId;
    metadata.image = data.image;
    metadata.video = data.video;
    metadata.audio = data.audio;
    metadata.document = data.document;
    metadata.archive = data.archive;
    metadata.code = data.code;
    return metadata;
  }
}