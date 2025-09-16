import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { File } from './file.entity';

/**
 * 文件访问控制实体
 * 管理文件的访问权限和限制
 */
@Entity('file_access_control')
@Index(['fileId'])
export class FileAccessControl extends BaseEntity {
  @ApiProperty({ description: '文件ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '关联的文件ID',
  })
  fileId: string;

  @ApiProperty({ description: '权限设置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '权限设置',
  })
  permissions?: {
    read?: string[]; // 可读用户/角色ID
    write?: string[]; // 可写用户/角色ID
    delete?: string[]; // 可删除用户/角色ID
  };

  @ApiProperty({ description: '允许的IP地址', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '允许访问的IP地址列表',
  })
  allowedIps?: string[];

  @ApiProperty({ description: '禁止的IP地址', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '禁止访问的IP地址列表',
  })
  blockedIps?: string[];

  @ApiProperty({ description: '访问密码', required: false })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '访问密码（加密存储）',
  })
  password?: string;

  @ApiProperty({ description: '下载限制', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '下载限制设置',
  })
  downloadLimit?: {
    count: number; // 最大下载次数
    period?: number; // 时间周期（秒）
    perUser?: boolean; // 是否按用户限制
  };

  @ApiProperty({ description: '时间限制', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '时间访问限制',
  })
  timeRestriction?: {
    startTime?: string; // HH:mm
    endTime?: string; // HH:mm
    timezone?: string;
    weekdays?: number[]; // 0-6, 0=Sunday
  };

  @ApiProperty({ description: '地理位置限制', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '地理位置访问限制',
  })
  geoRestriction?: {
    allowedCountries?: string[];
    blockedCountries?: string[];
    allowedRegions?: string[];
    blockedRegions?: string[];
  };

  // 关联关系
  @OneToOne(() => File, file => file.accessControl)
  @JoinColumn({ name: 'fileId' })
  file: File;

  /**
   * 检查用户是否有读取权限
   */
  canRead(userId?: string, userRoles?: string[]): boolean {
    if (!this.permissions?.read) return true;
    
    if (userId && this.permissions.read.includes(userId)) {
      return true;
    }
    
    if (userRoles && userRoles.some(role => this.permissions.read.includes(role))) {
      return true;
    }
    
    return false;
  }

  /**
   * 检查用户是否有写入权限
   */
  canWrite(userId?: string, userRoles?: string[]): boolean {
    if (!this.permissions?.write) return false;
    
    if (userId && this.permissions.write.includes(userId)) {
      return true;
    }
    
    if (userRoles && userRoles.some(role => this.permissions.write.includes(role))) {
      return true;
    }
    
    return false;
  }

  /**
   * 检查用户是否有删除权限
   */
  canDelete(userId?: string, userRoles?: string[]): boolean {
    if (!this.permissions?.delete) return false;
    
    if (userId && this.permissions.delete.includes(userId)) {
      return true;
    }
    
    if (userRoles && userRoles.some(role => this.permissions.delete.includes(role))) {
      return true;
    }
    
    return false;
  }

  /**
   * 检查IP地址是否被允许
   */
  isIpAllowed(ip: string): boolean {
    // 如果在黑名单中，直接拒绝
    if (this.blockedIps && this.blockedIps.includes(ip)) {
      return false;
    }
    
    // 如果没有白名单，则允许
    if (!this.allowedIps || this.allowedIps.length === 0) {
      return true;
    }
    
    // 检查是否在白名单中
    return this.allowedIps.includes(ip);
  }

  /**
   * 检查当前时间是否允许访问
   */
  isTimeAllowed(currentTime?: Date): boolean {
    if (!this.timeRestriction) return true;
    
    const now = currentTime || new Date();
    const { startTime, endTime, weekdays } = this.timeRestriction;
    
    // 检查星期限制
    if (weekdays && weekdays.length > 0) {
      const dayOfWeek = now.getDay();
      if (!weekdays.includes(dayOfWeek)) {
        return false;
      }
    }
    
    // 检查时间段限制
    if (startTime && endTime) {
      const currentTimeStr = now.toTimeString().substring(0, 5); // HH:mm
      if (currentTimeStr < startTime || currentTimeStr > endTime) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * 检查地理位置是否允许访问
   */
  isGeoAllowed(country?: string, region?: string): boolean {
    if (!this.geoRestriction) return true;
    
    const { allowedCountries, blockedCountries, allowedRegions, blockedRegions } = this.geoRestriction;
    
    // 检查国家黑名单
    if (country && blockedCountries && blockedCountries.includes(country)) {
      return false;
    }
    
    // 检查地区黑名单
    if (region && blockedRegions && blockedRegions.includes(region)) {
      return false;
    }
    
    // 检查国家白名单
    if (allowedCountries && allowedCountries.length > 0) {
      if (!country || !allowedCountries.includes(country)) {
        return false;
      }
    }
    
    // 检查地区白名单
    if (allowedRegions && allowedRegions.length > 0) {
      if (!region || !allowedRegions.includes(region)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * 验证访问密码
   */
  validatePassword(inputPassword: string): boolean {
    if (!this.password) return true;
    // 这里应该使用加密比较，简化示例
    return this.password === inputPassword;
  }

  /**
   * 检查下载限制
   */
  canDownload(userId?: string, currentDownloads?: number): boolean {
    if (!this.downloadLimit) return true;
    
    const { count, perUser } = this.downloadLimit;
    
    if (perUser && userId) {
      // 按用户限制，需要查询该用户的下载次数
      // 这里需要额外的服务来统计
      return true; // 简化处理
    } else {
      // 全局限制
      return (currentDownloads || 0) < count;
    }
  }

  /**
   * 添加读取权限
   */
  addReadPermission(userOrRoleId: string): void {
    if (!this.permissions) {
      this.permissions = {};
    }
    if (!this.permissions.read) {
      this.permissions.read = [];
    }
    if (!this.permissions.read.includes(userOrRoleId)) {
      this.permissions.read.push(userOrRoleId);
    }
  }

  /**
   * 移除读取权限
   */
  removeReadPermission(userOrRoleId: string): void {
    if (this.permissions?.read) {
      this.permissions.read = this.permissions.read.filter(id => id !== userOrRoleId);
    }
  }

  /**
   * 添加写入权限
   */
  addWritePermission(userOrRoleId: string): void {
    if (!this.permissions) {
      this.permissions = {};
    }
    if (!this.permissions.write) {
      this.permissions.write = [];
    }
    if (!this.permissions.write.includes(userOrRoleId)) {
      this.permissions.write.push(userOrRoleId);
    }
  }

  /**
   * 移除写入权限
   */
  removeWritePermission(userOrRoleId: string): void {
    if (this.permissions?.write) {
      this.permissions.write = this.permissions.write.filter(id => id !== userOrRoleId);
    }
  }

  /**
   * 添加删除权限
   */
  addDeletePermission(userOrRoleId: string): void {
    if (!this.permissions) {
      this.permissions = {};
    }
    if (!this.permissions.delete) {
      this.permissions.delete = [];
    }
    if (!this.permissions.delete.includes(userOrRoleId)) {
      this.permissions.delete.push(userOrRoleId);
    }
  }

  /**
   * 移除删除权限
   */
  removeDeletePermission(userOrRoleId: string): void {
    if (this.permissions?.delete) {
      this.permissions.delete = this.permissions.delete.filter(id => id !== userOrRoleId);
    }
  }

  /**
   * 添加允许的IP
   */
  addAllowedIp(ip: string): void {
    if (!this.allowedIps) {
      this.allowedIps = [];
    }
    if (!this.allowedIps.includes(ip)) {
      this.allowedIps.push(ip);
    }
  }

  /**
   * 移除允许的IP
   */
  removeAllowedIp(ip: string): void {
    if (this.allowedIps) {
      this.allowedIps = this.allowedIps.filter(allowedIp => allowedIp !== ip);
    }
  }

  /**
   * 添加禁止的IP
   */
  addBlockedIp(ip: string): void {
    if (!this.blockedIps) {
      this.blockedIps = [];
    }
    if (!this.blockedIps.includes(ip)) {
      this.blockedIps.push(ip);
    }
  }

  /**
   * 移除禁止的IP
   */
  removeBlockedIp(ip: string): void {
    if (this.blockedIps) {
      this.blockedIps = this.blockedIps.filter(blockedIp => blockedIp !== ip);
    }
  }

  /**
   * 创建文件访问控制实例
   */
  static create(data: {
    fileId: string;
    permissions?: FileAccessControl['permissions'];
    allowedIps?: string[];
    blockedIps?: string[];
    password?: string;
    downloadLimit?: FileAccessControl['downloadLimit'];
    timeRestriction?: FileAccessControl['timeRestriction'];
    geoRestriction?: FileAccessControl['geoRestriction'];
  }): Partial<FileAccessControl> {
    const accessControl = new FileAccessControl();
    accessControl.fileId = data.fileId;
    accessControl.permissions = data.permissions;
    accessControl.allowedIps = data.allowedIps;
    accessControl.blockedIps = data.blockedIps;
    accessControl.password = data.password;
    accessControl.downloadLimit = data.downloadLimit;
    accessControl.timeRestriction = data.timeRestriction;
    accessControl.geoRestriction = data.geoRestriction;
    return accessControl;
  }
}