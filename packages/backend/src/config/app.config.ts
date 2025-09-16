import { ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

// 环境变量验证 schema
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  
  // 数据库配置
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().default('root'),
  DB_PASSWORD: Joi.string().default('root'),
  DB_DATABASE: Joi.string().default('verto'),
  
  // Redis 配置
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional(),
  REDIS_DB: Joi.number().default(0),
  REDIS_TTL: Joi.number().default(3600),
  
  // JWT 配置
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  
  // 文件上传配置
  UPLOAD_PATH: Joi.string().default('./uploads'),
  MAX_FILE_SIZE: Joi.number().default(10485760), // 10MB
  
  // 邮件配置
  MAIL_HOST: Joi.string().optional(),
  MAIL_PORT: Joi.number().default(587),
  MAIL_USER: Joi.string().optional(),
  MAIL_PASS: Joi.string().optional(),
  MAIL_FROM: Joi.string().optional(),
  
  // 限流配置
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(10),
  
  // 日志配置
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  LOG_FILE: Joi.string().default('./logs/app.log'),
});

// 应用配置
export const getAppConfig = (configService: ConfigService) => ({
  // 基础配置
  env: configService.get('NODE_ENV', 'development'),
  port: configService.get('PORT', 3000),
  
  // 安全配置
  cors: {
    origin: configService.get('CORS_ORIGIN', '*'),
    credentials: true,
  },
  
  // JWT 配置
  jwt: {
    secret: configService.get('JWT_SECRET'),
    expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
    refreshSecret: configService.get('JWT_REFRESH_SECRET'),
    refreshExpiresIn: configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
  },
  
  // 文件上传配置
  upload: {
    path: configService.get('UPLOAD_PATH', './uploads'),
    maxFileSize: configService.get('MAX_FILE_SIZE', 10485760),
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  
  // 邮件配置
  mail: {
    host: configService.get('MAIL_HOST'),
    port: configService.get('MAIL_PORT', 587),
    secure: false,
    auth: {
      user: configService.get('MAIL_USER'),
      pass: configService.get('MAIL_PASS'),
    },
    from: configService.get('MAIL_FROM'),
  },
  
  // 限流配置
  throttle: {
    ttl: configService.get('THROTTLE_TTL', 60),
    limit: configService.get('THROTTLE_LIMIT', 10),
  },
  
  // 日志配置
  logging: {
    level: configService.get('LOG_LEVEL', 'info'),
    file: configService.get('LOG_FILE', './logs/app.log'),
    maxFiles: '14d',
    maxSize: '20m',
  },
  
  // 分页配置
  pagination: {
    defaultPage: 1,
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  
  // API 配置
  api: {
    prefix: 'api',
    version: 'v1',
    timeout: 30000,
  },
  
  // Swagger 配置
  swagger: {
    title: 'Verto API',
    description: '前端全流程管理平台 API 文档',
    version: '1.0.0',
    path: 'docs',
  },
});

// 开发环境配置
export const developmentConfig = {
  database: {
    logging: true,
    synchronize: true,
  },
  cors: {
    origin: true,
  },
};

// 生产环境配置
export const productionConfig = {
  database: {
    logging: false,
    synchronize: false,
  },
  cors: {
    origin: process.env.FRONTEND_URL || false,
  },
};

// 测试环境配置
export const testConfig = {
  database: {
    logging: false,
    synchronize: true,
  },
};