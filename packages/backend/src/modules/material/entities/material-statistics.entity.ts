import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Material } from './material.entity';

/**
 * 物料统计实体
 * 存储物料的统计信息，包括浏览量、下载量、使用量、点赞数等
 */
@Entity('material_statistics')
@Index(['materialId'], { unique: true })
@Index(['viewCount'])
@Index(['downloadCount'])
@Index(['useCount'])
@Index(['popularityScore'])
@Index(['lastUsedAt'])
export class MaterialStatistics extends BaseEntity {
  @ApiProperty({ description: '物料ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '关联的物料ID',
  })
  materialId: string;

  @ApiProperty({ description: '浏览次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '浏览次数',
  })
  viewCount: number;

  @ApiProperty({ description: '下载次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '下载次数',
  })
  downloadCount: number;

  @ApiProperty({ description: '使用次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '使用次数',
  })
  useCount: number;

  @ApiProperty({ description: '点赞数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '点赞数',
  })
  likeCount: number;

  @ApiProperty({ description: 'Fork数' })
  @Column({
    type: 'int',
    default: 0,
    comment: 'Fork数',
  })
  forkCount: number;

  @ApiProperty({ description: '收藏数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '收藏数',
  })
  starCount: number;

  @ApiProperty({ description: '评论数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '评论数',
  })
  commentCount: number;

  @ApiProperty({ description: '评分次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '评分次数',
  })
  ratingCount: number;

  @ApiProperty({ description: '平均评分' })
  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    comment: '平均评分',
  })
  averageRating: number;

  @ApiProperty({ description: '最后使用时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后使用时间',
  })
  lastUsedAt?: Date;

  @ApiProperty({ description: '热度分数' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '热度分数',
  })
  popularityScore: number;

  @ApiProperty({ description: '今日浏览量' })
  @Column({
    type: 'int',
    default: 0,
    comment: '今日浏览量',
  })
  todayViewCount: number;

  @ApiProperty({ description: '本周浏览量' })
  @Column({
    type: 'int',
    default: 0,
    comment: '本周浏览量',
  })
  weekViewCount: number;

  @ApiProperty({ description: '本月浏览量' })
  @Column({
    type: 'int',
    default: 0,
    comment: '本月浏览量',
  })
  monthViewCount: number;

  @ApiProperty({ description: '统计重置时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '统计数据最后重置时间',
  })
  lastResetAt?: Date;

  // 关联关系
  @ApiProperty({ description: '关联物料', type: () => Material })
  @OneToOne(() => Material, material => material.statistics)
  @JoinColumn({ name: 'materialId' })
  material: Material;

  /**
   * 增加浏览次数
   */
  incrementViewCount(): void {
    this.viewCount++;
    this.todayViewCount++;
    this.weekViewCount++;
    this.monthViewCount++;
    this.updatePopularityScore();
  }

  /**
   * 增加下载次数
   */
  incrementDownloadCount(): void {
    this.downloadCount++;
    this.updatePopularityScore();
  }

  /**
   * 增加使用次数
   */
  incrementUseCount(): void {
    this.useCount++;
    this.lastUsedAt = new Date();
    this.updatePopularityScore();
  }

  /**
   * 增加点赞数
   */
  incrementLikeCount(): void {
    this.likeCount++;
    this.updatePopularityScore();
  }

  /**
   * 减少点赞数
   */
  decrementLikeCount(): void {
    if (this.likeCount > 0) {
      this.likeCount--;
      this.updatePopularityScore();
    }
  }

  /**
   * 增加Fork数
   */
  incrementForkCount(): void {
    this.forkCount++;
    this.updatePopularityScore();
  }

  /**
   * 增加收藏数
   */
  incrementStarCount(): void {
    this.starCount++;
    this.updatePopularityScore();
  }

  /**
   * 减少收藏数
   */
  decrementStarCount(): void {
    if (this.starCount > 0) {
      this.starCount--;
      this.updatePopularityScore();
    }
  }

  /**
   * 增加评论数
   */
  incrementCommentCount(): void {
    this.commentCount++;
    this.updatePopularityScore();
  }

  /**
   * 减少评论数
   */
  decrementCommentCount(): void {
    if (this.commentCount > 0) {
      this.commentCount--;
      this.updatePopularityScore();
    }
  }

  /**
   * 更新评分
   */
  updateRating(newRating: number): void {
    const totalRating = this.averageRating * this.ratingCount + newRating;
    this.ratingCount++;
    this.averageRating = Number((totalRating / this.ratingCount).toFixed(2));
    this.updatePopularityScore();
  }

  /**
   * 计算并更新热度分数
   */
  updatePopularityScore(): void {
    // 热度分数计算公式：考虑各种互动行为的权重
    const viewWeight = 1;
    const downloadWeight = 5;
    const useWeight = 3;
    const likeWeight = 2;
    const forkWeight = 10;
    const starWeight = 4;
    const commentWeight = 3;
    const ratingWeight = this.averageRating * 2;

    // 时间衰减因子（最近使用的物料权重更高）
    let timeDecay = 1;
    if (this.lastUsedAt) {
      const daysSinceLastUse = (Date.now() - this.lastUsedAt.getTime()) / (1000 * 60 * 60 * 24);
      timeDecay = Math.max(0.1, 1 - daysSinceLastUse / 365); // 一年内线性衰减
    }

    this.popularityScore = Number((
      (this.viewCount * viewWeight +
       this.downloadCount * downloadWeight +
       this.useCount * useWeight +
       this.likeCount * likeWeight +
       this.forkCount * forkWeight +
       this.starCount * starWeight +
       this.commentCount * commentWeight +
       this.ratingCount * ratingWeight) * timeDecay
    ).toFixed(2));
  }

  /**
   * 重置周期性统计
   */
  resetPeriodicStats(): void {
    this.todayViewCount = 0;
    this.weekViewCount = 0;
    this.monthViewCount = 0;
    this.lastResetAt = new Date();
  }

  /**
   * 重置今日统计
   */
  resetTodayStats(): void {
    this.todayViewCount = 0;
  }

  /**
   * 重置本周统计
   */
  resetWeekStats(): void {
    this.weekViewCount = 0;
  }

  /**
   * 重置本月统计
   */
  resetMonthStats(): void {
    this.monthViewCount = 0;
  }

  /**
   * 获取互动总数
   */
  getTotalInteractions(): number {
    return this.likeCount + this.forkCount + this.starCount + this.commentCount + this.ratingCount;
  }

  /**
   * 获取使用率（下载后实际使用的比例）
   */
  getUsageRate(): number {
    if (this.downloadCount === 0) return 0;
    return Number(((this.useCount / this.downloadCount) * 100).toFixed(2));
  }

  /**
   * 检查是否为热门物料
   */
  isPopular(): boolean {
    return this.popularityScore > 100 || this.downloadCount > 1000 || this.useCount > 500;
  }

  /**
   * 检查是否为新物料（最近7天内创建）
   */
  isNew(): boolean {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return this.createdAt > sevenDaysAgo;
  }

  /**
   * 检查是否为活跃物料（最近30天内有使用）
   */
  isActive(): boolean {
    if (!this.lastUsedAt) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.lastUsedAt > thirtyDaysAgo;
  }
}