import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  method: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    
    return next.handle().pipe(
      map((data) => {
        // 如果数据已经是标准格式，直接返回
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // 处理分页数据
        if (data && typeof data === 'object' && 'items' in data && 'total' in data) {
          return {
            success: true,
            code: 'SUCCESS',
            message: '操作成功',
            data: {
              items: data.items,
              pagination: {
                total: data.total,
                page: data.page || 1,
                pageSize: data.pageSize || 20,
                totalPages: Math.ceil(data.total / (data.pageSize || 20)),
              },
            },
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
          };
        }

        // 标准响应格式
        return {
          success: true,
          code: 'SUCCESS',
          message: '操作成功',
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        };
      }),
    );
  }
}