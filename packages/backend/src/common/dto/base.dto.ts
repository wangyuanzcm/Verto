import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsUUID,
  Min,
  Max,
  IsIn,
  IsDateString,
} from 'class-validator';

/**
 * 分页查询基础DTO
 */
export class PaginationDto {
  @ApiPropertyOptional({ description: '页码', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页码必须是数字' })
  @Min(1, { message: '页码不能小于1' })
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '每页数量必须是数字' })
  @Min(1, { message: '每页数量不能小于1' })
  @Max(100, { message: '每页数量不能超过100' })
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: '排序字段' })
  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  sortBy?: string;

  @ApiPropertyOptional({ description: '排序方向', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'], { message: '排序方向只能是ASC或DESC' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  keyword?: string;
}

/**
 * 基础查询DTO
 */
export class BaseQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: '是否启用必须是布尔值' })
  isActive?: boolean;

  @ApiPropertyOptional({ description: '创建者ID' })
  @IsOptional()
  @IsUUID('4', { message: '创建者ID格式不正确' })
  createdBy?: string;

  @ApiPropertyOptional({ description: '创建开始时间' })
  @IsOptional()
  @IsDateString({}, { message: '创建开始时间格式不正确' })
  createdAtStart?: string;

  @ApiPropertyOptional({ description: '创建结束时间' })
  @IsOptional()
  @IsDateString({}, { message: '创建结束时间格式不正确' })
  createdAtEnd?: string;
}

/**
 * 基础创建DTO
 */
export class BaseCreateDto {
  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean({ message: '是否启用必须是布尔值' })
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: '排序权重', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '排序权重必须是数字' })
  sortOrder?: number = 0;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;
}

/**
 * 基础更新DTO
 */
export class BaseUpdateDto {
  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean({ message: '是否启用必须是布尔值' })
  isActive?: boolean;

  @ApiPropertyOptional({ description: '排序权重' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '排序权重必须是数字' })
  sortOrder?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;
}

/**
 * ID参数DTO
 */
export class IdParamDto {
  @ApiProperty({ description: 'ID' })
  @IsUUID('4', { message: 'ID格式不正确' })
  id: string;
}

/**
 * 批量操作DTO
 */
export class BatchOperationDto {
  @ApiProperty({ description: 'ID列表', type: [String] })
  @IsUUID('4', { each: true, message: 'ID格式不正确' })
  ids: string[];
}

/**
 * 状态更新DTO
 */
export class StatusUpdateDto {
  @ApiProperty({ description: '是否启用' })
  @IsBoolean({ message: '是否启用必须是布尔值' })
  isActive: boolean;
}

/**
 * 排序更新DTO
 */
export class SortUpdateDto {
  @ApiProperty({ description: 'ID' })
  @IsUUID('4', { message: 'ID格式不正确' })
  id: string;

  @ApiProperty({ description: '排序权重' })
  @Type(() => Number)
  @IsNumber({}, { message: '排序权重必须是数字' })
  sortOrder: number;
}

/**
 * 批量排序更新DTO
 */
export class BatchSortUpdateDto {
  @ApiProperty({ description: '排序列表', type: [SortUpdateDto] })
  @Type(() => SortUpdateDto)
  items: SortUpdateDto[];
}