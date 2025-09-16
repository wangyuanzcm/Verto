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
 * 项目设置实体
 */
@Entity('project_settings')
@Index(['projectId'], { unique: true })
export class ProjectSettings extends BaseEntity {
  @ApiProperty({ description: '项目ID' })
  @Column({
    type: 'uuid',
    comment: '项目ID',
  })
  projectId: string;

  @ApiProperty({ description: '权限设置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '权限设置',
  })
  permissions?: {
    allowMemberInvite?: boolean;
    allowMemberRemove?: boolean;
    allowRequirementCreate?: boolean;
    allowRequirementEdit?: boolean;
    allowPrototypeCreate?: boolean;
    allowPrototypeEdit?: boolean;
    allowMaterialUpload?: boolean;
    allowMaterialDownload?: boolean;
  };

  @ApiProperty({ description: '可见性设置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '可见性设置',
  })
  visibility?: {
    showProgress?: boolean;
    showMembers?: boolean;
    showStatistics?: boolean;
    showTimeline?: boolean;
    allowPublicView?: boolean;
  };

  @ApiProperty({ description: '通知设置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '通知设置',
  })
  notifications?: {
    onRequirementChange?: boolean;
    onPrototypeUpdate?: boolean;
    onMemberJoin?: boolean;
    onMemberLeave?: boolean;
    onDeadlineApproach?: boolean;
    onStatusChange?: boolean;
    emailDigest?: 'none' | 'daily' | 'weekly';
  };

  @ApiProperty({ description: '自动化设置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '自动化设置',
  })
  automation?: {
    autoArchive?: boolean;
    autoArchiveDays?: number;
    autoBackup?: boolean;
    autoBackupFrequency?: 'daily' | 'weekly' | 'monthly';
    autoProgressUpdate?: boolean;
  };

  @ApiProperty({ description: '模板设置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '模板设置',
  })
  templates?: {
    defaultRequirementTemplate?: string;
    defaultPrototypeTemplate?: string;
    customTemplates?: Record<string, any>;
  };

  @ApiProperty({ description: '质量设置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '质量设置',
  })
  quality?: {
    requireReview?: boolean;
    requireApproval?: boolean;
    minimumReviewers?: number;
    allowSelfReview?: boolean;
    requireTestCoverage?: boolean;
    minimumCoverage?: number;
  };

  // 关联关系
  @ApiProperty({ description: '关联项目', type: () => Project })
  @OneToOne(() => Project, project => project.settings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  /**
   * 获取权限设置
   */
  getPermissions(): NonNullable<ProjectSettings['permissions']> {
    return this.permissions || {};
  }

  /**
   * 设置权限
   */
  setPermissions(permissions: NonNullable<ProjectSettings['permissions']>): void {
    this.permissions = { ...this.permissions, ...permissions };
  }

  /**
   * 检查是否允许某个权限
   */
  hasPermission(permission: keyof NonNullable<ProjectSettings['permissions']>): boolean {
    return this.permissions?.[permission] || false;
  }

  /**
   * 获取可见性设置
   */
  getVisibility(): NonNullable<ProjectSettings['visibility']> {
    return this.visibility || {};
  }

  /**
   * 设置可见性
   */
  setVisibility(visibility: NonNullable<ProjectSettings['visibility']>): void {
    this.visibility = { ...this.visibility, ...visibility };
  }

  /**
   * 检查是否显示某个内容
   */
  isVisible(item: keyof NonNullable<ProjectSettings['visibility']>): boolean {
    return this.visibility?.[item] !== false;
  }

  /**
   * 获取通知设置
   */
  getNotifications(): NonNullable<ProjectSettings['notifications']> {
    return this.notifications || {};
  }

  /**
   * 设置通知
   */
  setNotifications(notifications: NonNullable<ProjectSettings['notifications']>): void {
    this.notifications = { ...this.notifications, ...notifications };
  }

  /**
   * 检查是否启用某个通知
   */
  isNotificationEnabled(type: keyof NonNullable<ProjectSettings['notifications']>): boolean {
    return this.notifications?.[type] !== false;
  }

  /**
   * 获取自动化设置
   */
  getAutomation(): NonNullable<ProjectSettings['automation']> {
    return this.automation || {};
  }

  /**
   * 设置自动化
   */
  setAutomation(automation: NonNullable<ProjectSettings['automation']>): void {
    this.automation = { ...this.automation, ...automation };
  }

  /**
   * 检查是否启用自动归档
   */
  isAutoArchiveEnabled(): boolean {
    return this.automation?.autoArchive || false;
  }

  /**
   * 获取自动归档天数
   */
  getAutoArchiveDays(): number {
    return this.automation?.autoArchiveDays || 365;
  }

  /**
   * 检查是否启用自动备份
   */
  isAutoBackupEnabled(): boolean {
    return this.automation?.autoBackup || false;
  }

  /**
   * 获取模板设置
   */
  getTemplates(): NonNullable<ProjectSettings['templates']> {
    return this.templates || {};
  }

  /**
   * 设置模板
   */
  setTemplates(templates: NonNullable<ProjectSettings['templates']>): void {
    this.templates = { ...this.templates, ...templates };
  }

  /**
   * 获取质量设置
   */
  getQuality(): NonNullable<ProjectSettings['quality']> {
    return this.quality || {};
  }

  /**
   * 设置质量要求
   */
  setQuality(quality: NonNullable<ProjectSettings['quality']>): void {
    this.quality = { ...this.quality, ...quality };
  }

  /**
   * 检查是否需要代码审查
   */
  isReviewRequired(): boolean {
    return this.quality?.requireReview || false;
  }

  /**
   * 检查是否需要审批
   */
  isApprovalRequired(): boolean {
    return this.quality?.requireApproval || false;
  }

  /**
   * 获取最小审查人数
   */
  getMinimumReviewers(): number {
    return this.quality?.minimumReviewers || 1;
  }

  /**
   * 检查是否允许自审
   */
  isSelfReviewAllowed(): boolean {
    return this.quality?.allowSelfReview || false;
  }

  /**
   * 检查是否需要测试覆盖率
   */
  isTestCoverageRequired(): boolean {
    return this.quality?.requireTestCoverage || false;
  }

  /**
   * 获取最小测试覆盖率
   */
  getMinimumCoverage(): number {
    return this.quality?.minimumCoverage || 80;
  }

  /**
   * 验证设置完整性
   */
  validateSettings(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证自动化设置
    if (this.automation?.autoArchive && (!this.automation.autoArchiveDays || this.automation.autoArchiveDays <= 0)) {
      errors.push('启用自动归档时必须设置有效的归档天数');
    }

    // 验证质量设置
    if (this.quality?.requireReview && (!this.quality.minimumReviewers || this.quality.minimumReviewers <= 0)) {
      errors.push('启用代码审查时必须设置有效的最小审查人数');
    }

    if (this.quality?.requireTestCoverage && (!this.quality.minimumCoverage || this.quality.minimumCoverage < 0 || this.quality.minimumCoverage > 100)) {
      errors.push('启用测试覆盖率时必须设置有效的最小覆盖率（0-100）');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}