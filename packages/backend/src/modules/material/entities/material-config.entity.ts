import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Material } from './material.entity';

/**
 * 物料配置实体
 * 存储物料的配置信息，包括尺寸、样式、属性、事件、插槽、依赖等
 */
@Entity('material_configs')
@Index(['materialId'], { unique: true })
export class MaterialConfig extends BaseEntity {
  @ApiProperty({ description: '物料ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '关联的物料ID',
  })
  materialId: string;

  @ApiProperty({ description: '宽度', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '物料宽度',
  })
  width?: number;

  @ApiProperty({ description: '高度', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '物料高度',
  })
  height?: number;

  @ApiProperty({ description: '最小宽度', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '最小宽度',
  })
  minWidth?: number;

  @ApiProperty({ description: '最小高度', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '最小高度',
  })
  minHeight?: number;

  @ApiProperty({ description: '最大宽度', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '最大宽度',
  })
  maxWidth?: number;

  @ApiProperty({ description: '最大高度', required: false })
  @Column({
    type: 'int',
    nullable: true,
    comment: '最大高度',
  })
  maxHeight?: number;

  @ApiProperty({ description: '宽高比', required: false })
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '宽高比',
  })
  aspectRatio?: string;

  @ApiProperty({ description: '是否可调整大小' })
  @Column({
    type: 'boolean',
    default: true,
    comment: '是否可调整大小',
  })
  resizable: boolean;

  @ApiProperty({ description: '是否可拖拽' })
  @Column({
    type: 'boolean',
    default: true,
    comment: '是否可拖拽',
  })
  draggable: boolean;

  @ApiProperty({ description: '是否可旋转' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否可旋转',
  })
  rotatable: boolean;

  @ApiProperty({ description: '默认样式', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '默认样式配置',
  })
  defaultStyle?: Record<string, any>;

  @ApiProperty({ description: '自定义样式', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '自定义样式配置',
  })
  customStyles?: Record<string, any>;

  @ApiProperty({ description: 'CSS类名', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: 'CSS类名列表',
  })
  cssClasses?: string[];

  @ApiProperty({ description: '属性配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '物料属性配置',
  })
  properties?: {
    name: string;
    type: string;
    label: string;
    description?: string;
    defaultValue?: any;
    required?: boolean;
    options?: any[];
    validation?: Record<string, any>;
  }[];

  @ApiProperty({ description: '事件配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '物料事件配置',
  })
  events?: {
    name: string;
    label: string;
    description?: string;
    parameters?: {
      name: string;
      type: string;
      description?: string;
    }[];
  }[];

  @ApiProperty({ description: '插槽配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '物料插槽配置',
  })
  slots?: {
    name: string;
    label: string;
    description?: string;
    required?: boolean;
    multiple?: boolean;
    acceptTypes?: string[];
  }[];

  @ApiProperty({ description: '依赖配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '物料依赖配置',
  })
  dependencies?: {
    name: string;
    version: string;
    type: 'npm' | 'cdn' | 'local';
    url?: string;
    required?: boolean;
  }[];

  // 关联关系
  @ApiProperty({ description: '关联物料', type: () => Material })
  @OneToOne(() => Material, material => material.config)
  @JoinColumn({ name: 'materialId' })
  material: Material;

  /**
   * 检查是否有必需的属性
   */
  hasRequiredProperties(): boolean {
    if (!this.properties) return true;
    return this.properties.some(prop => prop.required);
  }

  /**
   * 获取属性配置
   */
  getProperty(name: string) {
    return this.properties?.find(prop => prop.name === name);
  }

  /**
   * 获取事件配置
   */
  getEvent(name: string) {
    return this.events?.find(event => event.name === name);
  }

  /**
   * 获取插槽配置
   */
  getSlot(name: string) {
    return this.slots?.find(slot => slot.name === name);
  }

  /**
   * 检查是否有依赖
   */
  hasDependencies(): boolean {
    return this.dependencies && this.dependencies.length > 0;
  }

  /**
   * 获取必需的依赖
   */
  getRequiredDependencies() {
    return this.dependencies?.filter(dep => dep.required) || [];
  }

  /**
   * 验证配置完整性
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证尺寸配置
    if (this.minWidth && this.maxWidth && this.minWidth > this.maxWidth) {
      errors.push('最小宽度不能大于最大宽度');
    }
    if (this.minHeight && this.maxHeight && this.minHeight > this.maxHeight) {
      errors.push('最小高度不能大于最大高度');
    }

    // 验证属性配置
    if (this.properties) {
      this.properties.forEach((prop, index) => {
        if (!prop.name || !prop.type) {
          errors.push(`属性 ${index + 1} 缺少必要字段`);
        }
      });
    }

    // 验证事件配置
    if (this.events) {
      this.events.forEach((event, index) => {
        if (!event.name) {
          errors.push(`事件 ${index + 1} 缺少名称`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}