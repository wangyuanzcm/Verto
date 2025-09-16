import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // 获取用户信息（如果已认证）
    const user = request.user as any;
    const userId = user?.id || 'anonymous';

    // 记录请求开始
    this.logger.log(
      `📥 ${method} ${url} - IP: ${ip} - User: ${userId} - UA: ${userAgent}`,
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;
          
          // 记录成功响应
          this.logger.log(
            `📤 ${method} ${url} - ${statusCode} - ${duration}ms - User: ${userId}`,
          );

          // 记录详细信息（仅在开发环境）
          if (process.env.NODE_ENV === 'development') {
            this.logger.debug(`Request Body: ${JSON.stringify(request.body)}`);
            this.logger.debug(`Response Data: ${JSON.stringify(data)}`);
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;
          
          // 记录错误响应
          this.logger.error(
            `❌ ${method} ${url} - ${statusCode} - ${duration}ms - User: ${userId} - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}