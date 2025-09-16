import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Project } from './project.entity';

/**
 * 项目统计实体
 */
@Entity('project_statistics')
@Index(['projectId'], { unique: true })
@Index(['totalRequirements'])
@Index(['completedRequirements'])
@Index(['totalPrototypes'])
@Index(['completedPrototypes'])
@Index(['totalMembers'])
export class ProjectStatistics extends BaseEntity {
  @ApiProperty({ description: '项目ID' })
  @Column({
    type: 'uuid',
    comment: '项目ID',
  })
  projectId: string;

  @ApiProperty({ description: '需求总数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '需求总数',
  })
  totalRequirements: number;

  @ApiProperty({ description: '已完成需求数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '已完成需求数',
  })
  completedRequirements: number;

  @ApiProperty({ description: '原型总数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '原型总数',
  })
  totalPrototypes: number;

  @ApiProperty({ description: '已完成原型数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '已完成原型数',
  })
  completedPrototypes: number;

  @ApiProperty({ description: '物料总数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '物料总数',
  })
  totalMaterials: number;

  @ApiProperty({ description: '成员总数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '成员总数',
  })
  totalMembers: number;

  @ApiProperty({ description: '提交总数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '提交总数',
  })
  totalCommits: number;

  @ApiProperty({ description: '问题总数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '问题总数',
  })
  totalIssues: number;

  @ApiProperty({ description: '开放问题数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '开放问题数',
  })
  openIssues: number;

  @ApiProperty({ description: '已关闭问题数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '已关闭问题数',
  })
  closedIssues: number;

  @ApiProperty({ description: '代码行数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '代码行数',
  })
  linesOfCode: number;

  @ApiProperty({ description: '测试覆盖率' })
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: '测试覆盖率',
  })
  testCoverage: number;

  @ApiProperty({ description: '活跃天数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '活跃天数',
  })
  activeDays: number;

  @ApiProperty({ description: '最后统计时间' })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '最后统计时间',
  })
  lastCalculatedAt: Date;

  // 关联关系
  @ApiProperty({ description: '关联项目', type: () => Project })
  @OneToOne(() => Project, project => project.statistics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  /**
   * 增加需求数量
   */
  incrementRequirements(count: number = 1): void {
    this.totalRequirements += count;
    this.updateCalculatedTime();
  }

  /**
   * 减少需求数量
   */
  decrementRequirements(count: number = 1): void {
    this.totalRequirements = Math.max(0, this.totalRequirements - count);
    this.updateCalculatedTime();
  }

  /**
   * 增加已完成需求数量
   */
  incrementCompletedRequirements(count: number = 1): void {
    this.completedRequirements += count;
    this.updateCalculatedTime();
  }

  /**
   * 减少已完成需求数量
   */
  decrementCompletedRequirements(count: number = 1): void {
    this.completedRequirements = Math.max(0, this.completedRequirements - count);
    this.updateCalculatedTime();
  }

  /**
   * 增加原型数量
   */
  incrementPrototypes(count: number = 1): void {
    this.totalPrototypes += count;
    this.updateCalculatedTime();
  }

  /**
   * 减少原型数量
   */
  decrementPrototypes(count: number = 1): void {
    this.totalPrototypes = Math.max(0, this.totalPrototypes - count);
    this.updateCalculatedTime();
  }

  /**
   * 增加已完成原型数量
   */
  incrementCompletedPrototypes(count: number = 1): void {
    this.completedPrototypes += count;
    this.updateCalculatedTime();
  }

  /**
   * 减少已完成原型数量
   */
  decrementCompletedPrototypes(count: number = 1): void {
    this.completedPrototypes = Math.max(0, this.completedPrototypes - count);
    this.updateCalculatedTime();
  }

  /**
   * 增加物料数量
   */
  incrementMaterials(count: number = 1): void {
    this.totalMaterials += count;
    this.updateCalculatedTime();
  }

  /**
   * 减少物料数量
   */
  decrementMaterials(count: number = 1): void {
    this.totalMaterials = Math.max(0, this.totalMaterials - count);
    this.updateCalculatedTime();
  }

  /**
   * 增加成员数量
   */
  incrementMembers(count: number = 1): void {
    this.totalMembers += count;
    this.updateCalculatedTime();
  }

  /**
   * 减少成员数量
   */
  decrementMembers(count: number = 1): void {
    this.totalMembers = Math.max(0, this.totalMembers - count);
    this.updateCalculatedTime();
  }

  /**
   * 增加提交数量
   */
  incrementCommits(count: number = 1): void {
    this.totalCommits += count;
    this.updateCalculatedTime();
  }

  /**
   * 增加问题数量
   */
  incrementIssues(count: number = 1): void {
    this.totalIssues += count;
    this.openIssues += count;
    this.updateCalculatedTime();
  }

  /**
   * 关闭问题
   */
  closeIssue(): void {
    if (this.openIssues > 0) {
      this.openIssues--;
      this.closedIssues++;
      this.updateCalculatedTime();
    }
  }

  /**
   * 重新打开问题
   */
  reopenIssue(): void {
    if (this.closedIssues > 0) {
      this.closedIssues--;
      this.openIssues++;
      this.updateCalculatedTime();
    }
  }

  /**
   * 更新代码行数
   */
  updateLinesOfCode(lines: number): void {
    this.linesOfCode = Math.max(0, lines);
    this.updateCalculatedTime();
  }

  /**
   * 更新测试覆盖率
   */
  updateTestCoverage(coverage: number): void {
    this.testCoverage = Math.max(0, Math.min(100, coverage));
    this.updateCalculatedTime();
  }

  /**
   * 增加活跃天数
   */
  incrementActiveDays(): void {
    this.activeDays++;
    this.updateCalculatedTime();
  }

  /**
   * 获取需求完成率
   */
  getRequirementCompletionRate(): number {
    if (this.totalRequirements === 0) return 0;
    return (this.completedRequirements / this.totalRequirements) * 100;
  }

  /**
   * 获取原型完成率
   */
  getPrototypeCompletionRate(): number {
    if (this.totalPrototypes === 0) return 0;
    return (this.completedPrototypes / this.totalPrototypes) * 100;
  }

  /**
   * 获取问题解决率
   */
  getIssueResolutionRate(): number {
    if (this.totalIssues === 0) return 0;
    return (this.closedIssues / this.totalIssues) * 100;
  }

  /**
   * 获取项目健康度评分
   */
  getHealthScore(): number {
    const requirementScore = this.getRequirementCompletionRate() * 0.3;
    const prototypeScore = this.getPrototypeCompletionRate() * 0.2;
    const issueScore = this.getIssueResolutionRate() * 0.2;
    const testScore = this.testCoverage * 0.3;

    return Math.round(requirementScore + prototypeScore + issueScore + testScore);
  }

  /**
   * 获取项目活跃度
   */
  getActivityLevel(): 'low' | 'medium' | 'high' {
    const recentActivity = this.totalCommits + this.totalIssues + this.totalRequirements;
    
    if (recentActivity >= 100) return 'high';
    if (recentActivity >= 20) return 'medium';
    return 'low';
  }

  /**
   * 批量更新统计数据
   */
  updateStatistics(stats: Partial<Omit<ProjectStatistics, 'id' | 'projectId' | 'project' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): void {
    Object.assign(this, stats);
    this.updateCalculatedTime();
  }

  /**
   * 重置统计数据
   */
  resetStatistics(): void {
    this.totalRequirements = 0;
    this.completedRequirements = 0;
    this.totalPrototypes = 0;
    this.completedPrototypes = 0;
    this.totalMaterials = 0;
    this.totalMembers = 0;
    this.totalCommits = 0;
    this.totalIssues = 0;
    this.openIssues = 0;
    this.closedIssues = 0;
    this.linesOfCode = 0;
    this.testCoverage = 0;
    this.activeDays = 0;
    this.updateCalculatedTime();
  }

  /**
   * 更新计算时间
   */
  private updateCalculatedTime(): void {
    this.lastCalculatedAt = new Date();
  }

  /**
   * 获取统计摘要
   */
  getSummary(): {
    requirements: { total: number; completed: number; rate: number };
    prototypes: { total: number; completed: number; rate: number };
    issues: { total: number; open: number; closed: number; rate: number };
    materials: number;
    members: number;
    commits: number;
    linesOfCode: number;
    testCoverage: number;
    activeDays: number;
    healthScore: number;
    activityLevel: string;
  } {
    return {
      requirements: {
        total: this.totalRequirements,
        completed: this.completedRequirements,
        rate: this.getRequirementCompletionRate(),
      },
      prototypes: {
        total: this.totalPrototypes,
        completed: this.completedPrototypes,
        rate: this.getPrototypeCompletionRate(),
      },
      issues: {
        total: this.totalIssues,
        open: this.openIssues,
        closed: this.closedIssues,
        rate: this.getIssueResolutionRate(),
      },
      materials: this.totalMaterials,
      members: this.totalMembers,
      commits: this.totalCommits,
      linesOfCode: this.linesOfCode,
      testCoverage: this.testCoverage,
      activeDays: this.activeDays,
      healthScore: this.getHealthScore(),
      activityLevel: this.getActivityLevel(),
    };
  }
}