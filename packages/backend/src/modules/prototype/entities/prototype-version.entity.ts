import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { VersionType, VersionStatus } from '../../../common/enums';
import { Prototype } from './prototype.entity';
import { User } from '../../user/entities/user.entity';

/**
 * 原型版本实体
 */
@Entity('prototype_versions')
@Index(['prototypeId'])
@Index(['creatorId'])
@Index(['version'], { unique: true })
@Index(['status'])
@Index(['type'])
@Index(['createdAt'])
export class PrototypeVersion extends BaseEntity {
  @ApiProperty({ description: '版本号' })
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '版本号',
  })
  version: string;

  @ApiProperty({ description: '版本名称', required: false })
  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: '版本名称',
  })
  name?: string;

  @ApiProperty({ description: '版本描述', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '版本描述',
  })
  description?: string;

  @ApiProperty({ description: '版本类型', enum: VersionType })
  @Column({
    type: 'enum',
    enum: VersionType,
    default: VersionType.MINOR,
    comment: '版本类型',
  })
  type: VersionType;

  @ApiProperty({ description: '版本状态', enum: VersionStatus })
  @Column({
    type: 'enum',
    enum: VersionStatus,
    default: VersionStatus.DRAFT,
    comment: '版本状态',
  })
  status: VersionStatus;

  @ApiProperty({ description: '原型ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '原型ID',
  })
  prototypeId: string;

  @ApiProperty({ description: '创建者ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '创建者ID',
  })
  creatorId: string;

  @ApiProperty({ description: '基于版本ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '基于的版本ID',
  })
  baseVersionId?: string;

  @ApiProperty({ description: '版本标签', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '版本标签',
  })
  tags?: string[];

  @ApiProperty({ description: '变更日志', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '变更日志',
  })
  changelog?: string;

  @ApiProperty({ description: '变更摘要', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '变更摘要',
  })
  changeSummary?: {
    added: number;
    modified: number;
    deleted: number;
    pagesChanged: number;
    componentsChanged: number;
    interactionsChanged: number;
  };

  @ApiProperty({ description: '版本数据', required: false })
  @Column({
    type: 'longtext',
    nullable: true,
    comment: '版本数据快照（JSON格式）',
  })
  versionData?: string;

  @ApiProperty({ description: '版本配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '版本配置',
  })
  config?: {
    autoSave?: boolean;
    compression?: boolean;
    includeAssets?: boolean;
    includeComments?: boolean;
    includeHistory?: boolean;
  };

  @ApiProperty({ description: '版本统计', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '版本统计信息',
  })
  stats?: {
    pagesCount: number;
    componentsCount: number;
    interactionsCount: number;
    animationsCount: number;
    commentsCount: number;
    fileSize: number;
    dataSize: number;
  };

  @ApiProperty({ description: '版本元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '版本元数据',
  })
  metadata?: {
    buildNumber?: number;
    commitHash?: string;
    branch?: string;
    environment?: string;
    buildTime?: Date;
    buildDuration?: number;
    dependencies?: Record<string, string>;
    tools?: Record<string, string>;
  };

  @ApiProperty({ description: '文件信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '版本文件信息',
  })
  files?: {
    id: string;
    name: string;
    path: string;
    url: string;
    type: string;
    size: number;
    checksum: string;
    mimeType: string;
  }[];

  @ApiProperty({ description: '预览信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '版本预览信息',
  })
  preview?: {
    thumbnailUrl?: string;
    previewUrl?: string;
    screenshotUrls?: string[];
    videoUrl?: string;
    demoUrl?: string;
  };

  @ApiProperty({ description: '是否为当前版本' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为当前版本',
  })
  isCurrent: boolean;

  @ApiProperty({ description: '是否为发布版本' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为发布版本',
  })
  isRelease: boolean;

  @ApiProperty({ description: '是否为里程碑版本' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为里程碑版本',
  })
  isMilestone: boolean;

  @ApiProperty({ description: '是否为预发布版本' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为预发布版本',
  })
  isPrerelease: boolean;

  @ApiProperty({ description: '是否已归档' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否已归档',
  })
  isArchived: boolean;

  @ApiProperty({ description: '下载次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '下载次数',
  })
  downloadCount: number;

  @ApiProperty({ description: '文件大小（字节）' })
  @Column({
    type: 'bigint',
    default: 0,
    comment: '文件大小（字节）',
  })
  fileSize: number;

  @ApiProperty({ description: '压缩后大小（字节）' })
  @Column({
    type: 'bigint',
    default: 0,
    comment: '压缩后大小（字节）',
  })
  compressedSize: number;

  @ApiProperty({ description: '校验和' })
  @Column({
    type: 'varchar',
    length: 128,
    comment: '文件校验和',
  })
  checksum: string;

  @ApiProperty({ description: '发布时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '发布时间',
  })
  releasedAt?: Date;

  @ApiProperty({ description: '归档时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '归档时间',
  })
  archivedAt?: Date;

  @ApiProperty({ description: '过期时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '版本过期时间',
  })
  expiresAt?: Date;

  @ApiProperty({ description: '自定义字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '自定义字段',
  })
  customFields?: Record<string, any>;

  // 关联关系
  @ApiProperty({ description: '所属原型', type: () => Prototype })
  @ManyToOne(() => Prototype, prototype => prototype.versions)
  @JoinColumn({ name: 'prototypeId' })
  prototype: Prototype;

  @ApiProperty({ description: '创建者', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ApiProperty({ description: '基于版本', type: () => PrototypeVersion })
  @ManyToOne(() => PrototypeVersion)
  @JoinColumn({ name: 'baseVersionId' })
  baseVersion?: PrototypeVersion;

  /**
   * 检查是否可以编辑
   * @param userId 用户ID
   * @returns 是否可以编辑
   */
  canEdit(userId: string): boolean {
    return this.creatorId === userId && this.status === VersionStatus.DRAFT;
  }

  /**
   * 检查是否可以删除
   * @param userId 用户ID
   * @returns 是否可以删除
   */
  canDelete(userId: string): boolean {
    return this.creatorId === userId && 
           this.status === VersionStatus.DRAFT && 
           !this.isCurrent && 
           !this.isRelease;
  }

  /**
   * 检查是否可以发布
   * @returns 是否可以发布
   */
  canRelease(): boolean {
    return [VersionStatus.DRAFT, VersionStatus.TESTING].includes(this.status) && !this.isRelease;
  }

  /**
   * 检查是否可以归档
   * @returns 是否可以归档
   */
  canArchive(): boolean {
    return this.status === VersionStatus.RELEASED && !this.isCurrent && !this.isArchived;
  }

  /**
   * 检查是否可以下载
   * @returns 是否可以下载
   */
  canDownload(): boolean {
    return [VersionStatus.RELEASED, VersionStatus.ARCHIVED].includes(this.status);
  }

  /**
   * 检查是否为主版本
   * @returns 是否为主版本
   */
  isMajorVersion(): boolean {
    return this.type === VersionType.MAJOR;
  }

  /**
   * 检查是否为次版本
   * @returns 是否为次版本
   */
  isMinorVersion(): boolean {
    return this.type === VersionType.MINOR;
  }

  /**
   * 检查是否为补丁版本
   * @returns 是否为补丁版本
   */
  isPatchVersion(): boolean {
    return this.type === VersionType.PATCH;
  }

  /**
   * 检查版本是否过期
   * @returns 是否过期
   */
  isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  /**
   * 设置为当前版本
   */
  setAsCurrent(): void {
    this.isCurrent = true;
  }

  /**
   * 取消当前版本
   */
  unsetAsCurrent(): void {
    this.isCurrent = false;
  }

  /**
   * 发布版本
   */
  release(): void {
    if (this.canRelease()) {
      this.status = VersionStatus.RELEASED;
      this.isRelease = true;
      this.releasedAt = new Date();
    }
  }

  /**
   * 归档版本
   */
  archive(): void {
    if (this.canArchive()) {
      this.status = VersionStatus.ARCHIVED;
      this.isArchived = true;
      this.archivedAt = new Date();
    }
  }

  /**
   * 标记为里程碑
   */
  markAsMilestone(): void {
    this.isMilestone = true;
  }

  /**
   * 取消里程碑标记
   */
  unmarkAsMilestone(): void {
    this.isMilestone = false;
  }

  /**
   * 标记为预发布
   */
  markAsPrerelease(): void {
    this.isPrerelease = true;
  }

  /**
   * 取消预发布标记
   */
  unmarkAsPrerelease(): void {
    this.isPrerelease = false;
  }

  /**
   * 增加下载次数
   */
  incrementDownloadCount(): void {
    this.downloadCount += 1;
  }

  /**
   * 更新文件大小
   * @param size 文件大小
   * @param compressedSize 压缩后大小
   */
  updateFileSize(size: number, compressedSize?: number): void {
    this.fileSize = size;
    if (compressedSize !== undefined) {
      this.compressedSize = compressedSize;
    }
  }

  /**
   * 更新校验和
   * @param checksum 校验和
   */
  updateChecksum(checksum: string): void {
    this.checksum = checksum;
  }

  /**
   * 更新统计信息
   * @param stats 统计信息
   */
  updateStats(stats: {
    pagesCount?: number;
    componentsCount?: number;
    interactionsCount?: number;
    animationsCount?: number;
    commentsCount?: number;
    fileSize?: number;
    dataSize?: number;
  }): void {
    this.stats = { ...this.stats, ...stats };
  }

  /**
   * 更新变更摘要
   * @param summary 变更摘要
   */
  updateChangeSummary(summary: {
    added?: number;
    modified?: number;
    deleted?: number;
    pagesChanged?: number;
    componentsChanged?: number;
    interactionsChanged?: number;
  }): void {
    this.changeSummary = { ...this.changeSummary, ...summary };
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
   * 添加文件
   * @param file 文件信息
   */
  addFile(file: {
    id: string;
    name: string;
    path: string;
    url: string;
    type: string;
    size: number;
    checksum: string;
    mimeType: string;
  }): void {
    if (!this.files) {
      this.files = [];
    }
    
    this.files.push(file);
  }

  /**
   * 移除文件
   * @param fileId 文件ID
   */
  removeFile(fileId: string): void {
    if (this.files) {
      this.files = this.files.filter(file => file.id !== fileId);
    }
  }

  /**
   * 获取文件
   * @param fileId 文件ID
   * @returns 文件信息
   */
  getFile(fileId: string): any {
    return this.files?.find(file => file.id === fileId);
  }

  /**
   * 设置预览信息
   * @param preview 预览信息
   */
  setPreview(preview: {
    thumbnailUrl?: string;
    previewUrl?: string;
    screenshotUrls?: string[];
    videoUrl?: string;
    demoUrl?: string;
  }): void {
    this.preview = { ...this.preview, ...preview };
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
   * 比较版本号
   * @param otherVersion 其他版本号
   * @returns 比较结果 (-1: 小于, 0: 等于, 1: 大于)
   */
  compareVersion(otherVersion: string): number {
    return PrototypeVersion.compareVersions(this.version, otherVersion);
  }

  /**
   * 获取版本信息
   * @returns 版本信息
   */
  getInfo(): {
    id: string;
    version: string;
    name?: string;
    description?: string;
    type: VersionType;
    status: VersionStatus;
    isCurrent: boolean;
    isRelease: boolean;
    isMilestone: boolean;
    isPrerelease: boolean;
    isArchived: boolean;
    downloadCount: number;
    fileSize: number;
    compressedSize: number;
    checksum: string;
    prototypeId: string;
    creatorId: string;
    baseVersionId?: string;
    tags?: string[];
    releasedAt?: Date;
    archivedAt?: Date;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      version: this.version,
      name: this.name,
      description: this.description,
      type: this.type,
      status: this.status,
      isCurrent: this.isCurrent,
      isRelease: this.isRelease,
      isMilestone: this.isMilestone,
      isPrerelease: this.isPrerelease,
      isArchived: this.isArchived,
      downloadCount: this.downloadCount,
      fileSize: this.fileSize,
      compressedSize: this.compressedSize,
      checksum: this.checksum,
      prototypeId: this.prototypeId,
      creatorId: this.creatorId,
      baseVersionId: this.baseVersionId,
      tags: this.tags,
      releasedAt: this.releasedAt,
      archivedAt: this.archivedAt,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * 生成版本号
   * @param type 版本类型
   * @param currentVersion 当前版本号
   * @returns 新版本号
   */
  static generateVersion(type: VersionType, currentVersion?: string): string {
    if (!currentVersion) {
      return '1.0.0';
    }
    
    const parts = currentVersion.split('.').map(Number);
    const [major = 0, minor = 0, patch = 0] = parts;
    
    switch (type) {
      case VersionType.MAJOR:
        return `${major + 1}.0.0`;
      case VersionType.MINOR:
        return `${major}.${minor + 1}.0`;
      case VersionType.PATCH:
        return `${major}.${minor}.${patch + 1}`;
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  /**
   * 比较两个版本号
   * @param version1 版本号1
   * @param version2 版本号2
   * @returns 比较结果 (-1: version1 < version2, 0: 相等, 1: version1 > version2)
   */
  static compareVersions(version1: string, version2: string): number {
    const parts1 = version1.split('.').map(Number);
    const parts2 = version2.split('.').map(Number);
    
    const maxLength = Math.max(parts1.length, parts2.length);
    
    for (let i = 0; i < maxLength; i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }
    
    return 0;
  }

  /**
   * 验证版本号格式
   * @param version 版本号
   * @returns 是否有效
   */
  static isValidVersion(version: string): boolean {
    const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/;
    return versionRegex.test(version);
  }

  /**
   * 验证版本数据
   * @param data 版本数据
   * @returns 验证结果
   */
  static validate(data: Partial<PrototypeVersion>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.version || data.version.trim().length === 0) {
      errors.push('版本号不能为空');
    } else if (!PrototypeVersion.isValidVersion(data.version)) {
      errors.push('版本号格式不正确');
    }
    
    if (!data.prototypeId) {
      errors.push('原型ID不能为空');
    }
    
    if (!data.creatorId) {
      errors.push('创建者ID不能为空');
    }
    
    if (!data.checksum || data.checksum.trim().length === 0) {
      errors.push('校验和不能为空');
    }
    
    if (data.fileSize && data.fileSize < 0) {
      errors.push('文件大小不能为负数');
    }
    
    if (data.compressedSize && data.compressedSize < 0) {
      errors.push('压缩后大小不能为负数');
    }
    
    if (data.downloadCount && data.downloadCount < 0) {
      errors.push('下载次数不能为负数');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建版本快照
   * @param data 版本数据
   * @returns 版本快照数据
   */
  static createSnapshot(data: {
    version: string;
    prototypeId: string;
    creatorId: string;
    type?: VersionType;
    description?: string;
    changelog?: string;
    versionData?: string;
    baseVersionId?: string;
  }): Partial<PrototypeVersion> {
    return {
      version: data.version,
      prototypeId: data.prototypeId,
      creatorId: data.creatorId,
      type: data.type || VersionType.MINOR,
      description: data.description,
      changelog: data.changelog,
      versionData: data.versionData,
      baseVersionId: data.baseVersionId,
      status: VersionStatus.DRAFT,
      isCurrent: false,
      isRelease: false,
      isMilestone: false,
      isPrerelease: false,
      isArchived: false,
      downloadCount: 0,
      fileSize: 0,
      compressedSize: 0,
      checksum: '',
    };
  }
}