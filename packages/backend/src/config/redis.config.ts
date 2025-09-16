import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

export const getRedisConfig = async (configService: ConfigService): Promise<CacheModuleOptions> => {
  const store = await redisStore({
    socket: {
      host: configService.get('REDIS_HOST', 'localhost'),
      port: configService.get('REDIS_PORT', 6379),
    },
    password: configService.get('REDIS_PASSWORD'),
    database: configService.get('REDIS_DB', 0),
    ttl: configService.get('REDIS_TTL', 3600), // 默认1小时过期
  });

  return {
    store: store as any,
    isGlobal: true,
  };
};

// Redis 连接配置
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB) || 0,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
};

// Redis 键名常量
export const REDIS_KEYS = {
  // 用户相关
  USER_TOKEN: (userId: number) => `user:token:${userId}`,
  USER_PERMISSIONS: (userId: number) => `user:permissions:${userId}`,
  USER_PROFILE: (userId: number) => `user:profile:${userId}`,
  
  // 验证码
  EMAIL_CODE: (email: string) => `email:code:${email}`,
  SMS_CODE: (phone: string) => `sms:code:${phone}`,
  
  // 项目相关
  PROJECT_DETAIL: (projectId: number) => `project:detail:${projectId}`,
  PROJECT_MEMBERS: (projectId: number) => `project:members:${projectId}`,
  
  // 需求相关
  REQUIREMENT_LIST: (projectId: number) => `requirement:list:${projectId}`,
  
  // 物料相关
  MATERIAL_LIST: (category?: string) => category ? `material:list:${category}` : 'material:list:all',
  
  // 系统配置
  SYSTEM_CONFIG: 'system:config',
  
  // 统计数据
  STATS_DASHBOARD: (userId: number) => `stats:dashboard:${userId}`,
  
  // 在线用户
  ONLINE_USERS: 'online:users',
  
  // 操作日志
  OPERATION_LOG: (userId: number, date: string) => `operation:log:${userId}:${date}`,
} as const;

// Redis TTL 常量（秒）
export const REDIS_TTL = {
  SHORT: 300,      // 5分钟
  MEDIUM: 1800,    // 30分钟
  LONG: 3600,      // 1小时
  VERY_LONG: 86400, // 24小时
  WEEK: 604800,    // 7天
} as const;