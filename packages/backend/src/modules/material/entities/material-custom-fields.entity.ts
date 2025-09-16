import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Material } from './material.entity';

/**
 * 物料自定义字段实体
 */
@Entity('material_custom_fields')
@Index(['materialId'], { unique: true })
export class MaterialCustomFields extends BaseEntity {
  @ApiProperty({ description: '物料ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '物料ID',
  })
  materialId: string;

  @ApiProperty({ description: '字符串类型字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '字符串类型自定义字段',
  })
  stringFields?: Record<string, string>;

  @ApiProperty({ description: '数字类型字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '数字类型自定义字段',
  })
  numberFields?: Record<string, number>;

  @ApiProperty({ description: '布尔类型字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '布尔类型自定义字段',
  })
  booleanFields?: Record<string, boolean>;

  @ApiProperty({ description: '日期类型字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '日期类型自定义字段',
  })
  dateFields?: Record<string, string>;

  @ApiProperty({ description: '数组类型字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '数组类型自定义字段',
  })
  arrayFields?: Record<string, any[]>;

  @ApiProperty({ description: '对象类型字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '对象类型自定义字段',
  })
  objectFields?: Record<string, Record<string, any>>;

  // 关联关系
  @ApiProperty({ description: '关联物料', type: () => Material })
  @OneToOne(() => Material, material => material.customFields)
  @JoinColumn({ name: 'materialId' })
  material: Material;

  /**
   * 设置字符串字段
   * @param key 字段键
   * @param value 字段值
   */
  setStringField(key: string, value: string): void {
    if (!this.stringFields) {
      this.stringFields = {};
    }
    this.stringFields[key] = value;
  }

  /**
   * 获取字符串字段
   * @param key 字段键
   * @returns 字段值
   */
  getStringField(key: string): string | undefined {
    return this.stringFields?.[key];
  }

  /**
   * 设置数字字段
   * @param key 字段键
   * @param value 字段值
   */
  setNumberField(key: string, value: number): void {
    if (!this.numberFields) {
      this.numberFields = {};
    }
    this.numberFields[key] = value;
  }

  /**
   * 获取数字字段
   * @param key 字段键
   * @returns 字段值
   */
  getNumberField(key: string): number | undefined {
    return this.numberFields?.[key];
  }

  /**
   * 设置布尔字段
   * @param key 字段键
   * @param value 字段值
   */
  setBooleanField(key: string, value: boolean): void {
    if (!this.booleanFields) {
      this.booleanFields = {};
    }
    this.booleanFields[key] = value;
  }

  /**
   * 获取布尔字段
   * @param key 字段键
   * @returns 字段值
   */
  getBooleanField(key: string): boolean | undefined {
    return this.booleanFields?.[key];
  }

  /**
   * 设置日期字段
   * @param key 字段键
   * @param value 字段值
   */
  setDateField(key: string, value: Date | string): void {
    if (!this.dateFields) {
      this.dateFields = {};
    }
    this.dateFields[key] = value instanceof Date ? value.toISOString() : value;
  }

  /**
   * 获取日期字段
   * @param key 字段键
   * @returns 字段值
   */
  getDateField(key: string): Date | undefined {
    const value = this.dateFields?.[key];
    return value ? new Date(value) : undefined;
  }

  /**
   * 设置数组字段
   * @param key 字段键
   * @param value 字段值
   */
  setArrayField(key: string, value: any[]): void {
    if (!this.arrayFields) {
      this.arrayFields = {};
    }
    this.arrayFields[key] = value;
  }

  /**
   * 获取数组字段
   * @param key 字段键
   * @returns 字段值
   */
  getArrayField(key: string): any[] | undefined {
    return this.arrayFields?.[key];
  }

  /**
   * 设置对象字段
   * @param key 字段键
   * @param value 字段值
   */
  setObjectField(key: string, value: Record<string, any>): void {
    if (!this.objectFields) {
      this.objectFields = {};
    }
    this.objectFields[key] = value;
  }

  /**
   * 获取对象字段
   * @param key 字段键
   * @returns 字段值
   */
  getObjectField(key: string): Record<string, any> | undefined {
    return this.objectFields?.[key];
  }

  /**
   * 移除字段
   * @param type 字段类型
   * @param key 字段键
   */
  removeField(type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object', key: string): void {
    switch (type) {
      case 'string':
        if (this.stringFields) {
          delete this.stringFields[key];
        }
        break;
      case 'number':
        if (this.numberFields) {
          delete this.numberFields[key];
        }
        break;
      case 'boolean':
        if (this.booleanFields) {
          delete this.booleanFields[key];
        }
        break;
      case 'date':
        if (this.dateFields) {
          delete this.dateFields[key];
        }
        break;
      case 'array':
        if (this.arrayFields) {
          delete this.arrayFields[key];
        }
        break;
      case 'object':
        if (this.objectFields) {
          delete this.objectFields[key];
        }
        break;
    }
  }

  /**
   * 获取所有字段
   * @returns 所有自定义字段
   */
  getAllFields(): Record<string, any> {
    return {
      ...this.stringFields,
      ...this.numberFields,
      ...this.booleanFields,
      ...this.dateFields,
      ...this.arrayFields,
      ...this.objectFields,
    };
  }

  /**
   * 清空所有字段
   */
  clearAllFields(): void {
    this.stringFields = {};
    this.numberFields = {};
    this.booleanFields = {};
    this.dateFields = {};
    this.arrayFields = {};
    this.objectFields = {};
  }

  /**
   * 验证字段值
   * @param type 字段类型
   * @param value 字段值
   * @returns 是否有效
   */
  static validateFieldValue(type: string, value: any): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return false;
    }
  }
}