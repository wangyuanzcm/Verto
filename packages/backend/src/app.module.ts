import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

// 配置文件
import { validationSchema, getAppConfig } from './config/app.config';
import { getDatabaseConfig } from './config/database.config';
import { getRedisConfig } from './config/redis.config';

// 业务模块
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectModule } from './modules/project/project.module';
import { RequirementModule } from './modules/requirement/requirement.module';
import { PrototypeModule } from './modules/prototype/prototype.module';
import { MaterialModule } from './modules/material/material.module';
import { SystemModule } from './modules/system/system.module';
import { UploadModule } from './modules/upload/upload.module';

// 共享模块
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema,
      cache: true,
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // 缓存模块
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getRedisConfig,
      inject: [ConfigService],
      isGlobal: true,
    }),

    // 限流模块
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('THROTTLE_TTL', 60),
        limit: configService.get('THROTTLE_LIMIT', 10),
      }),
      inject: [ConfigService],
    }),

    // 定时任务模块
    ScheduleModule.forRoot(),

    // 日志模块
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.colorize(),
              winston.format.simple(),
            ),
          }),
          new winston.transports.File({
            filename: configService.get('LOG_FILE', './logs/app.log'),
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
            maxsize: 20971520, // 20MB
            maxFiles: 5,
          }),
        ],
        level: configService.get('LOG_LEVEL', 'info'),
      }),
      inject: [ConfigService],
    }),

    // 共享模块
    SharedModule,

    // 业务模块
    AuthModule,
    UserModule,
    ProjectModule,
    RequirementModule,
    PrototypeModule,
    MaterialModule,
    SystemModule,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private configService: ConfigService) {
    const config = getAppConfig(this.configService);
    console.log(`🚀 Application starting in ${config.env} mode`);
    console.log(`📊 Database: ${this.configService.get('DB_HOST')}:${this.configService.get('DB_PORT')}`);
    console.log(`🔴 Redis: ${this.configService.get('REDIS_HOST')}:${this.configService.get('REDIS_PORT')}`);
  }
}