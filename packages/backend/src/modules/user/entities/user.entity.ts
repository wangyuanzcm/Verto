import {
  Entity,
  Column,
  ManyToMany,
  OneToMany,
  OneToOne,
  JoinTable,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserStatus, UserRole, Gender, Language, Theme } from '../../../common/enums';
import { Role } from './role.entity';
import { Project } from '../../project/entities/project.entity';
import { UserProject } from './user-project.entity';
import { LoginLog } from './login-log.entity';
import { UserSettings } from './user-settings.entity';

/**
 * 用户实体
 */
@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
@Index(['phone'], { unique: true, where: 'phone IS NOT NULL' })
export class User extends BaseEntity {
  @ApiProperty({ description: '用户名' })
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '用户名',
  })
  username: string;

  @ApiProperty({ description: '邮箱' })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '邮箱',
  })
  email: string;

  @Exclude()
  @Column({
    type: 'varchar',
    length: 255,
    comment: '密码',
  })
  password: string;

  @ApiProperty({ description: '昵称' })
  @Column({
    type: 'varchar',
    length: 50,
    comment: '昵称',
  })
  nickname: string;

  @ApiProperty({ description: '真实姓名', required: false })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '真实姓名',
  })
  realName?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '头像URL',
  })
  avatar?: string;

  @ApiProperty({ description: '手机号', required: false })
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    unique: true,
    comment: '手机号',
  })
  phone?: string;

  @ApiProperty({ description: '性别', enum: Gender, required: false })
  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
    comment: '性别',
  })
  gender?: Gender;

  @ApiProperty({ description: '生日', required: false })
  @Column({
    type: 'date',
    nullable: true,
    comment: '生日',
  })
  birthday?: Date;

  @ApiProperty({ description: '个人简介', required: false })
  @Column({
    type: 'text',
    nullable: true,
    comment: '个人简介',
  })
  bio?: string;

  @ApiProperty({ description: '用户状态', enum: UserStatus })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    comment: '用户状态',
  })
  status: UserStatus;

  @ApiProperty({ description: '默认角色', enum: UserRole })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER,
    comment: '默认角色',
  })
  defaultRole: UserRole;

  @ApiProperty({ description: '语言偏好', enum: Language })
  @Column({
    type: 'enum',
    enum: Language,
    default: Language.ZH_CN,
    comment: '语言偏好',
  })
  language: Language;

  @ApiProperty({ description: '主题偏好', enum: Theme })
  @Column({
    type: 'enum',
    enum: Theme,
    default: Theme.LIGHT,
    comment: '主题偏好',
  })
  theme: Theme;

  @ApiProperty({ description: '时区', required: false })
  @Column({
    type: 'varchar',
    length: 50,
    default: 'Asia/Shanghai',
    comment: '时区',
  })
  timezone: string;

  @ApiProperty({ description: '最后登录时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后登录时间',
  })
  lastLoginAt?: Date;

  @ApiProperty({ description: '最后登录IP', required: false })
  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
    comment: '最后登录IP',
  })
  lastLoginIp?: string;

  @ApiProperty({ description: '登录失败次数' })
  @Column({
    type: 'int',
    default: 0,
    comment: '登录失败次数',
  })
  loginFailCount: number;

  @ApiProperty({ description: '账户锁定时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '账户锁定时间',
  })
  lockedAt?: Date;

  @ApiProperty({ description: '邮箱验证时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '邮箱验证时间',
  })
  emailVerifiedAt?: Date;

  @ApiProperty({ description: '手机验证时间', required: false })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '手机验证时间',
  })
  phoneVerifiedAt?: Date;

  @ApiProperty({ description: '双因子认证密钥', required: false })
  @Exclude()
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '双因子认证密钥',
  })
  twoFactorSecret?: string;

  @ApiProperty({ description: '是否启用双因子认证' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否启用双因子认证',
  })
  twoFactorEnabled: boolean;

  @ApiProperty({ description: '双因子认证恢复码', required: false })
  @Exclude()
  @Column({
    type: 'json',
    nullable: true,
    comment: '双因子认证恢复码',
  })
  twoFactorRecoveryCodes?: string[];

  // 用户设置关联已移至 UserSettings 实体

  // 关联关系
  @ApiProperty({ description: '用户角色', type: () => [Role] })
  @ManyToMany(() => Role, role => role.users, {
    cascade: true,
  })
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @ApiProperty({ description: '用户项目关联', type: () => [UserProject] })
  @OneToMany(() => UserProject, userProject => userProject.user)
  userProjects: UserProject[];

  @ApiProperty({ description: '参与的项目', type: () => [Project] })
  @ManyToMany(() => Project, project => project.members)
  projects: Project[];

  @ApiProperty({ description: '登录日志', type: () => [LoginLog] })
  @OneToMany(() => LoginLog, loginLog => loginLog.user)
  loginLogs: LoginLog[];

  @ApiProperty({ description: '用户设置', type: () => UserSettings, required: false })
  @OneToOne(() => UserSettings, settings => settings.user, {
    cascade: true,
  })
  settings?: UserSettings;

  /**
   * 检查用户是否有指定角色
   * @param roleName 角色名称
   * @returns 是否有该角色
   */
  hasRole(roleName: UserRole): boolean {
    return this.roles?.some(role => role.name === roleName) || this.defaultRole === roleName;
  }

  /**
   * 检查用户是否有指定权限
   * @param permissionCode 权限代码
   * @returns 是否有该权限
   */
  hasPermission(permissionCode: string): boolean {
    return this.roles?.some(role => 
      role.permissions?.some(permission => permission.code === permissionCode)
    ) || false;
  }

  /**
   * 获取用户所有权限代码
   * @returns 权限代码数组
   */
  getPermissionCodes(): string[] {
    const codes = new Set<string>();
    this.roles?.forEach(role => {
      role.permissions?.forEach(permission => {
        codes.add(permission.code);
      });
    });
    return Array.from(codes);
  }

  /**
   * 检查账户是否被锁定
   * @returns 是否被锁定
   */
  isLocked(): boolean {
    if (this.status === UserStatus.LOCKED) {
      return true;
    }
    
    if (this.lockedAt) {
      // 检查锁定是否过期（24小时后自动解锁）
      const lockDuration = 24 * 60 * 60 * 1000; // 24小时
      return Date.now() - this.lockedAt.getTime() < lockDuration;
    }
    
    return false;
  }

  /**
   * 检查邮箱是否已验证
   * @returns 是否已验证
   */
  isEmailVerified(): boolean {
    return !!this.emailVerifiedAt;
  }

  /**
   * 检查手机是否已验证
   * @returns 是否已验证
   */
  isPhoneVerified(): boolean {
    return !!this.phoneVerifiedAt;
  }

  /**
   * 获取显示名称
   * @returns 显示名称
   */
  getDisplayName(): string {
    return this.realName || this.nickname || this.username;
  }
}