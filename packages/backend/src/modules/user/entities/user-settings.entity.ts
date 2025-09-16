import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';
import { Language, Theme } from '../../../common/enums';

/**
 * 用户设置实体
 */
@Entity('user_settings')
@Index(['userId'], { unique: true })
export class UserSettings extends BaseEntity {
  @ApiProperty({ description: '用户ID' })
  @Column({
    type: 'uuid',
    comment: '用户ID',
  })
  userId: string;

  @ApiProperty({ description: '通知设置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '通知设置',
  })
  notifications?: {
    email?: {
      enabled?: boolean;
      projectUpdates?: boolean;
      taskAssignments?: boolean;
      mentions?: boolean;
      systemNotices?: boolean;
    };
    push?: {
      enabled?: boolean;
      projectUpdates?: boolean;
      taskAssignments?: boolean;
      mentions?: boolean;
      systemNotices?: boolean;
    };
    sms?: {
      enabled?: boolean;
      securityAlerts?: boolean;
      importantUpdates?: boolean;
    };
  };

  @ApiProperty({ description: '隐私设置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '隐私设置',
  })
  privacy?: {
    profileVisibility?: 'public' | 'private' | 'friends';
    showEmail?: boolean;
    showPhone?: boolean;
    showBirthday?: boolean;
    allowDirectMessages?: boolean;
    allowProjectInvitations?: boolean;
  };

  @ApiProperty({ description: '界面设置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '界面设置',
  })
  interface?: {
    sidebarCollapsed?: boolean;
    gridView?: boolean;
    compactMode?: boolean;
    showAvatars?: boolean;
    animationsEnabled?: boolean;
    soundEnabled?: boolean;
  };

  @ApiProperty({ description: '工作偏好', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '工作偏好',
  })
  workPreferences?: {
    defaultProjectView?: 'kanban' | 'list' | 'calendar' | 'gantt';
    autoSaveInterval?: number;
    defaultTaskPriority?: 'low' | 'medium' | 'high' | 'urgent';
    workingHours?: {
      start?: string;
      end?: string;
      timezone?: string;
    };
    weekStartDay?: 'sunday' | 'monday';
  };

  @ApiProperty({ description: '安全设置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '安全设置',
  })
  security?: {
    sessionTimeout?: number;
    requirePasswordChange?: boolean;
    allowMultipleSessions?: boolean;
    ipWhitelist?: string[];
    loginNotifications?: boolean;
  };

  @ApiProperty({ description: '集成设置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '集成设置',
  })
  integrations?: {
    github?: {
      enabled?: boolean;
      token?: string;
      repositories?: string[];
    };
    slack?: {
      enabled?: boolean;
      webhook?: string;
      channels?: string[];
    };
    jira?: {
      enabled?: boolean;
      url?: string;
      username?: string;
      token?: string;
    };
  };

  // 关联关系
  @ApiProperty({ description: '用户', type: () => User })
  @OneToOne(() => User, user => user.settings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  // 业务方法

  /**
   * 获取通知设置
   * @param type 通知类型
   * @returns 通知设置
   */
  getNotificationSetting(type: 'email' | 'push' | 'sms'): any {
    return this.notifications?.[type] || {};
  }

  /**
   * 设置通知偏好
   * @param type 通知类型
   * @param settings 设置值
   */
  setNotificationSetting(type: 'email' | 'push' | 'sms', settings: any): void {
    if (!this.notifications) {
      this.notifications = {};
    }
    this.notifications[type] = { ...this.notifications[type], ...settings };
  }

  /**
   * 检查是否启用某种通知
   * @param type 通知类型
   * @param category 通知分类
   * @returns 是否启用
   */
  isNotificationEnabled(type: 'email' | 'push' | 'sms', category?: string): boolean {
    const setting = this.getNotificationSetting(type);
    if (!setting.enabled) return false;
    if (category) {
      return setting[category] !== false;
    }
    return true;
  }

  /**
   * 获取隐私设置
   * @param key 设置键
   * @returns 设置值
   */
  getPrivacySetting(key: string): any {
    return this.privacy?.[key];
  }

  /**
   * 设置隐私偏好
   * @param key 设置键
   * @param value 设置值
   */
  setPrivacySetting(key: string, value: any): void {
    if (!this.privacy) {
      this.privacy = {};
    }
    this.privacy[key] = value;
  }

  /**
   * 检查资料可见性
   * @returns 可见性级别
   */
  getProfileVisibility(): string {
    return this.privacy?.profileVisibility || 'private';
  }

  /**
   * 获取界面设置
   * @param key 设置键
   * @returns 设置值
   */
  getInterfaceSetting(key: string): any {
    return this.interface?.[key];
  }

  /**
   * 设置界面偏好
   * @param key 设置键
   * @param value 设置值
   */
  setInterfaceSetting(key: string, value: any): void {
    if (!this.interface) {
      this.interface = {};
    }
    this.interface[key] = value;
  }

  /**
   * 获取工作偏好
   * @param key 设置键
   * @returns 设置值
   */
  getWorkPreference(key: string): any {
    return this.workPreferences?.[key];
  }

  /**
   * 设置工作偏好
   * @param key 设置键
   * @param value 设置值
   */
  setWorkPreference(key: string, value: any): void {
    if (!this.workPreferences) {
      this.workPreferences = {};
    }
    this.workPreferences[key] = value;
  }

  /**
   * 获取默认项目视图
   * @returns 视图类型
   */
  getDefaultProjectView(): string {
    return this.workPreferences?.defaultProjectView || 'kanban';
  }

  /**
   * 获取安全设置
   * @param key 设置键
   * @returns 设置值
   */
  getSecuritySetting(key: string): any {
    return this.security?.[key];
  }

  /**
   * 设置安全偏好
   * @param key 设置键
   * @param value 设置值
   */
  setSecuritySetting(key: string, value: any): void {
    if (!this.security) {
      this.security = {};
    }
    this.security[key] = value;
  }

  /**
   * 获取会话超时时间
   * @returns 超时时间（分钟）
   */
  getSessionTimeout(): number {
    return this.security?.sessionTimeout || 30;
  }

  /**
   * 获取集成设置
   * @param service 服务名称
   * @returns 集成设置
   */
  getIntegrationSetting(service: 'github' | 'slack' | 'jira'): any {
    return this.integrations?.[service] || {};
  }

  /**
   * 设置集成配置
   * @param service 服务名称
   * @param settings 设置值
   */
  setIntegrationSetting(service: 'github' | 'slack' | 'jira', settings: any): void {
    if (!this.integrations) {
      this.integrations = {};
    }
    this.integrations[service] = { ...this.integrations[service], ...settings };
  }

  /**
   * 检查集成是否启用
   * @param service 服务名称
   * @returns 是否启用
   */
  isIntegrationEnabled(service: 'github' | 'slack' | 'jira'): boolean {
    return this.getIntegrationSetting(service).enabled || false;
  }

  /**
   * 验证设置完整性
   * @returns 验证结果
   */
  validateSettings(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证工作时间设置
    if (this.workPreferences?.workingHours) {
      const { start, end } = this.workPreferences.workingHours;
      if (start && end && start >= end) {
        errors.push('工作开始时间不能晚于结束时间');
      }
    }

    // 验证会话超时设置
    const timeout = this.getSessionTimeout();
    if (timeout < 5 || timeout > 480) {
      errors.push('会话超时时间必须在5-480分钟之间');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 重置为默认设置
   */
  resetToDefaults(): void {
    this.notifications = {
      email: { enabled: true, projectUpdates: true, taskAssignments: true },
      push: { enabled: true, projectUpdates: true, taskAssignments: true },
      sms: { enabled: false },
    };
    this.privacy = {
      profileVisibility: 'private',
      showEmail: false,
      showPhone: false,
      allowDirectMessages: true,
      allowProjectInvitations: true,
    };
    this.interface = {
      sidebarCollapsed: false,
      gridView: false,
      compactMode: false,
      showAvatars: true,
      animationsEnabled: true,
      soundEnabled: true,
    };
    this.workPreferences = {
      defaultProjectView: 'kanban',
      autoSaveInterval: 30,
      defaultTaskPriority: 'medium',
      weekStartDay: 'monday',
    };
    this.security = {
      sessionTimeout: 30,
      requirePasswordChange: false,
      allowMultipleSessions: true,
      loginNotifications: true,
    };
    this.integrations = {};
  }

  /**
   * 创建用户设置
   * @param data 设置数据
   * @returns 用户设置实例
   */
  static create(data: {
    userId: string;
    notifications?: UserSettings['notifications'];
    privacy?: UserSettings['privacy'];
    interface?: UserSettings['interface'];
    workPreferences?: UserSettings['workPreferences'];
    security?: UserSettings['security'];
    integrations?: UserSettings['integrations'];
  }): UserSettings {
    const settings = new UserSettings();
    settings.userId = data.userId;
    settings.notifications = data.notifications;
    settings.privacy = data.privacy;
    settings.interface = data.interface;
    settings.workPreferences = data.workPreferences;
    settings.security = data.security;
    settings.integrations = data.integrations;
    
    // 如果没有提供设置，使用默认值
    if (!data.notifications && !data.privacy && !data.interface && 
        !data.workPreferences && !data.security && !data.integrations) {
      settings.resetToDefaults();
    }
    
    return settings;
  }
}