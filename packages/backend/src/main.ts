import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { getAppConfig } from './config/app.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({}),
  });

  const configService = app.get(ConfigService);
  const config = getAppConfig(configService);

  // 全局配置
  app.setGlobalPrefix(config.api.prefix);
  
  // API 版本控制
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: config.api.version,
  });

  // 安全中间件
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // CORS 配置
  app.enableCors(config.cors);

  // 全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局拦截器
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger 文档
  if (config.env !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(config.swagger.title)
      .setDescription(config.swagger.description)
      .setVersion(config.swagger.version)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Auth', '认证相关接口')
      .addTag('User', '用户管理接口')
      .addTag('Project', '项目管理接口')
      .addTag('Requirement', '需求管理接口')
      .addTag('Prototype', '原型设计接口')
      .addTag('Material', '物料管理接口')
      .addTag('System', '系统管理接口')
      .addTag('Upload', '文件上传接口')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(config.swagger.path, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    console.log(`📚 Swagger documentation available at: http://localhost:${config.port}/${config.swagger.path}`);
  }

  // 启动应用
  await app.listen(config.port);
  
  console.log(`🎉 Application is running on: http://localhost:${config.port}`);
  console.log(`🔗 API endpoint: http://localhost:${config.port}/${config.api.prefix}/${config.api.version}`);
  
  // 优雅关闭
  process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('❌ Error starting application:', error);
  process.exit(1);
});