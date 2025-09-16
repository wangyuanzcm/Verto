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
 * 项目配置实体
 */
@Entity('project_configs')
@Index(['projectId'], { unique: true })
export class ProjectConfig extends BaseEntity {
  @ApiProperty({ description: '项目ID' })
  @Column({
    type: 'uuid',
    comment: '项目ID',
  })
  projectId: string;

  @ApiProperty({ description: '工作流配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '工作流配置',
  })
  workflow?: {
    enableApproval?: boolean;
    approvalSteps?: string[];
    autoAssign?: boolean;
    defaultAssignee?: string;
  };

  @ApiProperty({ description: '通知配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '通知配置',
  })
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    frequency?: 'immediate' | 'daily' | 'weekly';
  };

  @ApiProperty({ description: '集成配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '集成配置',
  })
  integrations?: {
    git?: {
      provider?: 'github' | 'gitlab' | 'bitbucket';
      repository?: string;
      branch?: string;
    };
    ci?: {
      provider?: 'jenkins' | 'github-actions' | 'gitlab-ci';
      config?: Record<string, any>;
    };
  };

  @ApiProperty({ description: '安全配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '安全配置',
  })
  security?: {
    requireApproval?: boolean;
    allowGuestAccess?: boolean;
    ipWhitelist?: string[];
    twoFactorRequired?: boolean;
  };

  @ApiProperty({ description: '自定义字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '自定义字段',
  })
  customFields?: Record<string, any>;

  // 关联关系
  @ApiProperty({ description: '关联项目', type: () => Project })
  @OneToOne(() => Project, project => project.config, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  /**
   * 获取工作流配置
   */
  getWorkflowConfig(): NonNullable<ProjectConfig['workflow']> {
    return this.workflow || {};
  }

  /**
   * 设置工作流配置
   */
  setWorkflowConfig(config: NonNullable<ProjectConfig['workflow']>): void {
    this.workflow = { ...this.workflow, ...config };
  }

  /**
   * 获取通知配置
   */
  getNotificationConfig(): NonNullable<ProjectConfig['notifications']> {
    return this.notifications || {};
  }

  /**
   * 设置通知配置
   */
  setNotificationConfig(config: NonNullable<ProjectConfig['notifications']>): void {
    this.notifications = { ...this.notifications, ...config };
  }

  /**
   * 获取集成配置
   */
  getIntegrationConfig(): NonNullable<ProjectConfig['integrations']> {
    return this.integrations || {};
  }

  /**
   * 设置集成配置
   */
  setIntegrationConfig(config: NonNullable<ProjectConfig['integrations']>): void {
    this.integrations = { ...this.integrations, ...config };
  }

  /**
   * 获取安全配置
   */
  getSecurityConfig(): NonNullable<ProjectConfig['security']> {
    return this.security || {};
  }

  /**
   * 设置安全配置
   */
  setSecurityConfig(config: NonNullable<ProjectConfig['security']>): void {
    this.security = { ...this.security, ...config };
  }

  /**
   * 获取自定义字段值
   */
  getCustomField(key: string): any {
    return this.customFields?.[key];
  }

  /**
   * 设置自定义字段值
   */
  setCustomField(key: string, value: any): void {
    if (!this.customFields) {
      this.customFields = {};
    }
    this.customFields[key] = value;
  }

  /**
   * 移除自定义字段
   */
  removeCustomField(key: string): void {
    if (this.customFields) {
      delete this.customFields[key];
    }
  }

  /**
   * 检查是否启用了工作流审批
   */
  isApprovalEnabled(): boolean {
    return this.workflow?.enableApproval || false;
  }

  /**
   * 检查是否启用了自动分配
   */
  isAutoAssignEnabled(): boolean {
    return this.workflow?.autoAssign || false;
  }

  /**
   * 检查是否需要双因子认证
   */
  isTwoFactorRequired(): boolean {
    return this.security?.twoFactorRequired || false;
  }

  /**
   * 检查IP是否在白名单中
   */
  isIpAllowed(ip: string): boolean {
    const whitelist = this.security?.ipWhitelist;
    if (!whitelist || whitelist.length === 0) {
      return true;
    }
    return whitelist.includes(ip);
  }

  /**
   * 验证配置完整性
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证工作流配置
    if (this.workflow?.enableApproval && (!this.workflow.approvalSteps || this.workflow.approvalSteps.length === 0)) {
      errors.push('启用审批时必须配置审批步骤');
    }

    if (this.workflow?.autoAssign && !this.workflow.defaultAssignee) {
      errors.push('启用自动分配时必须配置默认分配人');
    }

    // 验证集成配置
    if (this.integrations?.git?.provider && !this.integrations.git.repository) {
      errors.push('配置Git集成时必须指定仓库');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}