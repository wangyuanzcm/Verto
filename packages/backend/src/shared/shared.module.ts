import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// 服务
import { CryptoService } from './services/crypto.service';
import { EmailService } from './services/email.service';
import { FileService } from './services/file.service';
import { RedisService } from './services/redis.service';
import { LoggerService } from './services/logger.service';

// 守卫
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';

// 拦截器
import { CacheInterceptor } from './interceptors/cache.interceptor';

// 管道
import { ParseObjectIdPipe } from './pipes/parse-object-id.pipe';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    // 服务
    CryptoService,
    EmailService,
    FileService,
    RedisService,
    LoggerService,
    
    // 守卫
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    
    // 拦截器
    CacheInterceptor,
    
    // 管道
    ParseObjectIdPipe,
  ],
  exports: [
    JwtModule,
    
    // 服务
    CryptoService,
    EmailService,
    FileService,
    RedisService,
    LoggerService,
    
    // 守卫
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    
    // 拦截器
    CacheInterceptor,
    
    // 管道
    ParseObjectIdPipe,
  ],
})
export class SharedModule {}