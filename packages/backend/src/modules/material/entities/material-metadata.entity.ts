import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Material } from './material.entity';

/**
 * 物料元数据实体
 * 存储物料的元数据信息，包括作者、许可证、关键词、仓库等
 */
@Entity('material_metadata')
@Index(['materialId'], { unique: true })
@Index(['author'])
@Index(['license'])
@Index(['framework'])
@Index(['language'])
export class MaterialMetadata extends BaseEntity {
  @ApiProperty({ description: '物料ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '关联的物料ID',
  })
  materialId: string;

  @ApiProperty({ description: '作者', required: false })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '物料作者',
  })
  author?: string;

  @ApiProperty({ description: '许可证', required: false })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '许可证类型',
  })
  license?: string;

  @ApiProperty({ description: '关键词', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '关键词列表',
  })
  keywords?: string[];

  @ApiProperty({ description: '仓库地址', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '代码仓库地址',
  })
  repository?: string;

  @ApiProperty({ description: '主页地址', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '项目主页地址',
  })
  homepage?: string;

  @ApiProperty({ description: 'Bug反馈地址', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Bug反馈地址',
  })
  bugs?: string;

  @ApiProperty({ description: '更新日志', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '更新日志',
  })
  changelog?: string;

  @ApiProperty({ description: 'README内容', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: 'README文档内容',
  })
  readme?: string;

  @ApiProperty({ description: '框架类型', required: false })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '使用的框架类型',
  })
  framework?: string;

  @ApiProperty({ description: '编程语言', required: false })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '主要编程语言',
  })
  language?: string;

  @ApiProperty({ description: '支持平台', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '支持的平台列表',
  })
  platform?: string[];

  @ApiProperty({ description: '支持浏览器', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '支持的浏览器列表',
  })
  browser?: string[];

  @ApiProperty({ description: 'Node.js版本要求', required: false })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Node.js版本要求',
  })
  node?: string;

  @ApiProperty({ description: '文件大小（字节）', required: false })
  @Column({
    type: 'bigint',
    nullable: true,
    comment: '原始文件大小',
  })
  size?: number;

  @ApiProperty({ description: 'Gzip压缩后大小（字节）', required: false })
  @Column({
    type: 'bigint',
    nullable: true,
    comment: 'Gzip压缩后大小',
  })
  gzipSize?: number;

  @ApiProperty({ description: '构建时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后构建时间',
  })
  buildTime?: Date;

  @ApiProperty({ description: '最后修改时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后修改时间',
  })
  lastModified?: Date;

  // 关联关系
  @ApiProperty({ description: '关联物料', type: () => Material })
  @OneToOne(() => Material, material => material.metadata)
  @JoinColumn({ name: 'materialId' })
  material: Material;

  /**
   * 检查是否有关键词
   */
  hasKeywords(): boolean {
    return this.keywords && this.keywords.length > 0;
  }

  /**
   * 添加关键词
   */
  addKeyword(keyword: string): void {
    if (!this.keywords) {
      this.keywords = [];
    }
    if (!this.keywords.includes(keyword)) {
      this.keywords.push(keyword);
    }
  }

  /**
   * 移除关键词
   */
  removeKeyword(keyword: string): void {
    if (this.keywords) {
      this.keywords = this.keywords.filter(k => k !== keyword);
    }
  }

  /**
   * 检查是否支持指定平台
   */
  supportsPlatform(platform: string): boolean {
    return this.platform ? this.platform.includes(platform) : false;
  }

  /**
   * 检查是否支持指定浏览器
   */
  supportsBrowser(browser: string): boolean {
    return this.browser ? this.browser.includes(browser) : false;
  }

  /**
   * 获取压缩比率
   */
  getCompressionRatio(): number {
    if (!this.size || !this.gzipSize || this.size === 0) {
      return 0;
    }
    return (1 - this.gzipSize / this.size) * 100;
  }

  /**
   * 格式化文件大小
   */
  getFormattedSize(): string {
    if (!this.size) return '未知';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.size;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * 格式化Gzip压缩后大小
   */
  getFormattedGzipSize(): string {
    if (!this.gzipSize) return '未知';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.gzipSize;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * 检查元数据完整性
   */
  isComplete(): boolean {
    return !!(this.author && this.license && this.framework && this.language);
  }

  /**
   * 更新构建信息
   */
  updateBuildInfo(size?: number, gzipSize?: number): void {
    this.buildTime = new Date();
    if (size !== undefined) {
      this.size = size;
    }
    if (gzipSize !== undefined) {
      this.gzipSize = gzipSize;
    }
    this.lastModified = new Date();
  }
}