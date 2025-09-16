import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: any = null;

    // HTTP 异常
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const response = exceptionResponse as any;
        message = response.message || response.error || exception.message;
        code = response.code || this.getErrorCode(status);
        details = response.details;
      }
    }
    // 数据库查询异常
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = this.handleDatabaseError(exception);
      code = 'DATABASE_ERROR';
    }
    // 其他异常
    else if (exception instanceof Error) {
      message = exception.message;
      code = 'UNKNOWN_ERROR';
    }

    // 构建错误响应
    const errorResponse = {
      success: false,
      code,
      message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(details && { details }),
    };

    // 记录错误日志
    const logMessage = `${request.method} ${request.url} - ${status} - ${message}`;
    
    if (status >= 500) {
      this.logger.error(logMessage, exception instanceof Error ? exception.stack : exception);
    } else {
      this.logger.warn(logMessage);
    }

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const statusCodeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };
    
    return statusCodeMap[status] || 'UNKNOWN_ERROR';
  }

  private handleDatabaseError(error: QueryFailedError): string {
    const message = error.message;
    
    // MySQL 错误处理
    if (message.includes('Duplicate entry')) {
      return '数据已存在，请检查唯一性约束';
    }
    
    if (message.includes('foreign key constraint')) {
      return '外键约束错误，请检查关联数据';
    }
    
    if (message.includes('Data too long')) {
      return '数据长度超出限制';
    }
    
    if (message.includes('cannot be null')) {
      return '必填字段不能为空';
    }
    
    return '数据库操作失败';
  }
}