import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { File } from './file.entity';

/**
 * 文件统计信息实体
 * 存储文件的访问、下载、分享等统计数据
 */
@Entity('file_statistics')
@Index(['fileId'])
export class FileStatistics extends BaseEntity {
  @ApiProperty({ description: '文件ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '关联的文件ID',
  })
  fileId: string;

  @ApiProperty({ description: '查看统计', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '文件查看统计',
  })
  views?: {
    total: number;
    unique: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };

  @ApiProperty({ description: '下载统计', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '文件下载统计',
  })
  downloads?: {
    total: number;
    unique: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byCountry?: Record<string, number>;
    byDevice?: Record<string, number>;
  };

  @ApiProperty({ description: '分享统计', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '文件分享统计',
  })
  shares?: {
    total: number;
    byPlatform?: Record<string, number>;
  };

  @ApiProperty({ description: '评分统计', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '文件评分统计',
  })
  ratings?: {
    average: number;
    count: number;
    distribution: Record<string, number>; // 1-5星分布
  };

  @ApiProperty({ description: '最后更新时间' })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '统计数据最后更新时间',
  })
  lastUpdatedAt: Date;

  // 关联关系
  @OneToOne(() => File, file => file.statistics)
  @JoinColumn({ name: 'fileId' })
  file: File;

  /**
   * 增加查看次数
   */
  incrementViews(isUnique: boolean = false): void {
    if (!this.views) {
      this.views = {
        total: 0,
        unique: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
      };
    }

    this.views.total += 1;
    this.views.today += 1;
    this.views.thisWeek += 1;
    this.views.thisMonth += 1;

    if (isUnique) {
      this.views.unique += 1;
    }

    this.lastUpdatedAt = new Date();
  }

  /**
   * 增加下载次数
   */
  incrementDownloads(isUnique: boolean = false, country?: string, device?: string): void {
    if (!this.downloads) {
      this.downloads = {
        total: 0,
        unique: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        byCountry: {},
        byDevice: {},
      };
    }

    this.downloads.total += 1;
    this.downloads.today += 1;
    this.downloads.thisWeek += 1;
    this.downloads.thisMonth += 1;

    if (isUnique) {
      this.downloads.unique += 1;
    }

    // 按国家统计
    if (country) {
      if (!this.downloads.byCountry) {
        this.downloads.byCountry = {};
      }
      this.downloads.byCountry[country] = (this.downloads.byCountry[country] || 0) + 1;
    }

    // 按设备统计
    if (device) {
      if (!this.downloads.byDevice) {
        this.downloads.byDevice = {};
      }
      this.downloads.byDevice[device] = (this.downloads.byDevice[device] || 0) + 1;
    }

    this.lastUpdatedAt = new Date();
  }

  /**
   * 增加分享次数
   */
  incrementShares(platform?: string): void {
    if (!this.shares) {
      this.shares = {
        total: 0,
        byPlatform: {},
      };
    }

    this.shares.total += 1;

    if (platform) {
      if (!this.shares.byPlatform) {
        this.shares.byPlatform = {};
      }
      this.shares.byPlatform[platform] = (this.shares.byPlatform[platform] || 0) + 1;
    }

    this.lastUpdatedAt = new Date();
  }

  /**
   * 添加评分
   */
  addRating(rating: number): void {
    if (rating < 1 || rating > 5) {
      throw new Error('评分必须在1-5之间');
    }

    if (!this.ratings) {
      this.ratings = {
        average: 0,
        count: 0,
        distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
      };
    }

    // 更新分布
    this.ratings.distribution[rating.toString()] += 1;
    this.ratings.count += 1;

    // 重新计算平均分
    let totalScore = 0;
    for (const [score, count] of Object.entries(this.ratings.distribution)) {
      totalScore += parseInt(score) * count;
    }
    this.ratings.average = totalScore / this.ratings.count;

    this.lastUpdatedAt = new Date();
  }

  /**
   * 重置今日统计
   */
  resetDailyStats(): void {
    if (this.views) {
      this.views.today = 0;
    }
    if (this.downloads) {
      this.downloads.today = 0;
    }
    this.lastUpdatedAt = new Date();
  }

  /**
   * 重置本周统计
   */
  resetWeeklyStats(): void {
    if (this.views) {
      this.views.thisWeek = 0;
    }
    if (this.downloads) {
      this.downloads.thisWeek = 0;
    }
    this.lastUpdatedAt = new Date();
  }

  /**
   * 重置本月统计
   */
  resetMonthlyStats(): void {
    if (this.views) {
      this.views.thisMonth = 0;
    }
    if (this.downloads) {
      this.downloads.thisMonth = 0;
    }
    this.lastUpdatedAt = new Date();
  }

  /**
   * 获取总查看次数
   */
  getTotalViews(): number {
    return this.views?.total || 0;
  }

  /**
   * 获取总下载次数
   */
  getTotalDownloads(): number {
    return this.downloads?.total || 0;
  }

  /**
   * 获取总分享次数
   */
  getTotalShares(): number {
    return this.shares?.total || 0;
  }

  /**
   * 获取平均评分
   */
  getAverageRating(): number {
    return this.ratings?.average || 0;
  }

  /**
   * 获取评分数量
   */
  getRatingCount(): number {
    return this.ratings?.count || 0;
  }

  /**
   * 获取最受欢迎的下载国家
   */
  getTopDownloadCountries(limit: number = 5): { country: string; count: number }[] {
    if (!this.downloads?.byCountry) return [];

    return Object.entries(this.downloads.byCountry)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 获取最受欢迎的下载设备
   */
  getTopDownloadDevices(limit: number = 5): { device: string; count: number }[] {
    if (!this.downloads?.byDevice) return [];

    return Object.entries(this.downloads.byDevice)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 获取最受欢迎的分享平台
   */
  getTopSharePlatforms(limit: number = 5): { platform: string; count: number }[] {
    if (!this.shares?.byPlatform) return [];

    return Object.entries(this.shares.byPlatform)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 获取评分分布百分比
   */
  getRatingDistributionPercentage(): Record<string, number> {
    if (!this.ratings?.distribution || this.ratings.count === 0) {
      return { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    }

    const result: Record<string, number> = {};
    for (const [rating, count] of Object.entries(this.ratings.distribution)) {
      result[rating] = (count / this.ratings.count) * 100;
    }
    return result;
  }

  /**
   * 检查是否为热门文件（基于下载量）
   */
  isPopular(threshold: number = 100): boolean {
    return this.getTotalDownloads() >= threshold;
  }

  /**
   * 检查是否为高评分文件
   */
  isHighRated(threshold: number = 4.0): boolean {
    return this.getAverageRating() >= threshold && this.getRatingCount() >= 5;
  }

  /**
   * 获取文件热度分数（综合评分）
   */
  getPopularityScore(): number {
    const viewsScore = Math.min(this.getTotalViews() / 1000, 1) * 30;
    const downloadsScore = Math.min(this.getTotalDownloads() / 100, 1) * 40;
    const sharesScore = Math.min(this.getTotalShares() / 50, 1) * 20;
    const ratingScore = (this.getAverageRating() / 5) * 10;

    return Math.round(viewsScore + downloadsScore + sharesScore + ratingScore);
  }

  /**
   * 创建文件统计实例
   */
  static create(data: {
    fileId: string;
    views?: FileStatistics['views'];
    downloads?: FileStatistics['downloads'];
    shares?: FileStatistics['shares'];
    ratings?: FileStatistics['ratings'];
  }): Partial<FileStatistics> {
    const statistics = new FileStatistics();
    statistics.fileId = data.fileId;
    statistics.views = data.views || {
      total: 0,
      unique: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
    };
    statistics.downloads = data.downloads || {
      total: 0,
      unique: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      byCountry: {},
      byDevice: {},
    };
    statistics.shares = data.shares || {
      total: 0,
      byPlatform: {},
    };
    statistics.ratings = data.ratings || {
      average: 0,
      count: 0,
      distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    };
    statistics.lastUpdatedAt = new Date();
    return statistics;
  }
}