import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Prototype } from './prototype.entity';

/**
 * 原型配置实体
 */
@Entity('prototype_configs')
@Index(['prototypeId'], { unique: true })
export class PrototypeConfig extends BaseEntity {
  @ApiProperty({ description: '原型ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '原型ID',
  })
  prototypeId: string;

  @ApiProperty({ description: '屏幕尺寸', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '屏幕尺寸信息',
  })
  screenSize?: {
    width: number;
    height: number;
    unit: string; // px, dp, etc.
  };

  @ApiProperty({ description: '设计规范', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '设计规范',
  })
  designSpecs?: {
    colorPalette?: string[];
    typography?: Record<string, any>;
    spacing?: Record<string, number>;
    components?: Record<string, any>;
  };

  @ApiProperty({ description: '原型配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '原型配置',
  })
  config?: {
    theme?: string;
    layout?: string;
    navigation?: Record<string, any>;
    interactions?: Record<string, any>;
  };

  @ApiProperty({ description: '导出配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '导出配置',
  })
  exportConfig?: {
    formats?: string[]; // pdf, png, html, etc.
    quality?: number;
    includeComments?: boolean;
    includeSpecs?: boolean;
  };

  @ApiProperty({ description: '自定义字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '自定义字段',
  })
  customFields?: Record<string, any>;

  // 关联关系
  @ApiProperty({ description: '关联原型', type: () => Prototype })
  @OneToOne(() => Prototype, prototype => prototype.config)
  @JoinColumn({ name: 'prototypeId' })
  prototype: Prototype;

  /**
   * 设置屏幕尺寸
   * @param width 宽度
   * @param height 高度
   * @param unit 单位
   */
  setScreenSize(width: number, height: number, unit: string = 'px'): void {
    this.screenSize = { width, height, unit };
  }

  /**
   * 获取屏幕尺寸
   * @returns 屏幕尺寸信息
   */
  getScreenSize(): { width: number; height: number; unit: string } | undefined {
    return this.screenSize;
  }

  /**
   * 设置颜色调色板
   * @param colors 颜色数组
   */
  setColorPalette(colors: string[]): void {
    if (!this.designSpecs) {
      this.designSpecs = {};
    }
    this.designSpecs.colorPalette = colors;
  }

  /**
   * 获取颜色调色板
   * @returns 颜色数组
   */
  getColorPalette(): string[] | undefined {
    return this.designSpecs?.colorPalette;
  }

  /**
   * 设置字体规范
   * @param typography 字体规范
   */
  setTypography(typography: Record<string, any>): void {
    if (!this.designSpecs) {
      this.designSpecs = {};
    }
    this.designSpecs.typography = typography;
  }

  /**
   * 获取字体规范
   * @returns 字体规范
   */
  getTypography(): Record<string, any> | undefined {
    return this.designSpecs?.typography;
  }

  /**
   * 设置间距规范
   * @param spacing 间距规范
   */
  setSpacing(spacing: Record<string, number>): void {
    if (!this.designSpecs) {
      this.designSpecs = {};
    }
    this.designSpecs.spacing = spacing;
  }

  /**
   * 获取间距规范
   * @returns 间距规范
   */
  getSpacing(): Record<string, number> | undefined {
    return this.designSpecs?.spacing;
  }

  /**
   * 设置组件规范
   * @param components 组件规范
   */
  setComponents(components: Record<string, any>): void {
    if (!this.designSpecs) {
      this.designSpecs = {};
    }
    this.designSpecs.components = components;
  }

  /**
   * 获取组件规范
   * @returns 组件规范
   */
  getComponents(): Record<string, any> | undefined {
    return this.designSpecs?.components;
  }

  /**
   * 设置主题
   * @param theme 主题名称
   */
  setTheme(theme: string): void {
    if (!this.config) {
      this.config = {};
    }
    this.config.theme = theme;
  }

  /**
   * 获取主题
   * @returns 主题名称
   */
  getTheme(): string | undefined {
    return this.config?.theme;
  }

  /**
   * 设置布局
   * @param layout 布局配置
   */
  setLayout(layout: string): void {
    if (!this.config) {
      this.config = {};
    }
    this.config.layout = layout;
  }

  /**
   * 获取布局
   * @returns 布局配置
   */
  getLayout(): string | undefined {
    return this.config?.layout;
  }

  /**
   * 设置导航配置
   * @param navigation 导航配置
   */
  setNavigation(navigation: Record<string, any>): void {
    if (!this.config) {
      this.config = {};
    }
    this.config.navigation = navigation;
  }

  /**
   * 获取导航配置
   * @returns 导航配置
   */
  getNavigation(): Record<string, any> | undefined {
    return this.config?.navigation;
  }

  /**
   * 设置交互配置
   * @param interactions 交互配置
   */
  setInteractions(interactions: Record<string, any>): void {
    if (!this.config) {
      this.config = {};
    }
    this.config.interactions = interactions;
  }

  /**
   * 获取交互配置
   * @returns 交互配置
   */
  getInteractions(): Record<string, any> | undefined {
    return this.config?.interactions;
  }

  /**
   * 设置导出格式
   * @param formats 导出格式数组
   */
  setExportFormats(formats: string[]): void {
    if (!this.exportConfig) {
      this.exportConfig = {};
    }
    this.exportConfig.formats = formats;
  }

  /**
   * 获取导出格式
   * @returns 导出格式数组
   */
  getExportFormats(): string[] | undefined {
    return this.exportConfig?.formats;
  }

  /**
   * 设置导出质量
   * @param quality 导出质量
   */
  setExportQuality(quality: number): void {
    if (!this.exportConfig) {
      this.exportConfig = {};
    }
    this.exportConfig.quality = quality;
  }

  /**
   * 获取导出质量
   * @returns 导出质量
   */
  getExportQuality(): number | undefined {
    return this.exportConfig?.quality;
  }

  /**
   * 设置是否包含评论
   * @param includeComments 是否包含评论
   */
  setIncludeComments(includeComments: boolean): void {
    if (!this.exportConfig) {
      this.exportConfig = {};
    }
    this.exportConfig.includeComments = includeComments;
  }

  /**
   * 获取是否包含评论
   * @returns 是否包含评论
   */
  getIncludeComments(): boolean | undefined {
    return this.exportConfig?.includeComments;
  }

  /**
   * 设置是否包含规范
   * @param includeSpecs 是否包含规范
   */
  setIncludeSpecs(includeSpecs: boolean): void {
    if (!this.exportConfig) {
      this.exportConfig = {};
    }
    this.exportConfig.includeSpecs = includeSpecs;
  }

  /**
   * 获取是否包含规范
   * @returns 是否包含规范
   */
  getIncludeSpecs(): boolean | undefined {
    return this.exportConfig?.includeSpecs;
  }

  /**
   * 设置自定义字段
   * @param key 字段键
   * @param value 字段值
   */
  setCustomField(key: string, value: any): void {
    if (!this.customFields) {
      this.customFields = {};
    }
    this.customFields[key] = value;
  }

  /**
   * 获取自定义字段
   * @param key 字段键
   * @returns 字段值
   */
  getCustomField(key: string): any {
    return this.customFields?.[key];
  }

  /**
   * 移除自定义字段
   * @param key 字段键
   */
  removeCustomField(key: string): void {
    if (this.customFields) {
      delete this.customFields[key];
    }
  }

  /**
   * 获取所有自定义字段
   * @returns 所有自定义字段
   */
  getAllCustomFields(): Record<string, any> | undefined {
    return this.customFields;
  }

  /**
   * 清空所有自定义字段
   */
  clearCustomFields(): void {
    this.customFields = {};
  }

  /**
   * 验证配置
   * @returns 验证结果
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证屏幕尺寸
    if (this.screenSize) {
      if (!this.screenSize.width || this.screenSize.width <= 0) {
        errors.push('屏幕宽度必须大于0');
      }
      if (!this.screenSize.height || this.screenSize.height <= 0) {
        errors.push('屏幕高度必须大于0');
      }
      if (!this.screenSize.unit) {
        errors.push('屏幕尺寸单位不能为空');
      }
    }

    // 验证导出质量
    if (this.exportConfig?.quality !== undefined) {
      if (this.exportConfig.quality < 0 || this.exportConfig.quality > 100) {
        errors.push('导出质量必须在0-100之间');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}