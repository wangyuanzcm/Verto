import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Requirement } from './requirement.entity';

/**
 * 需求自定义字段实体
 */
@Entity('requirement_custom_fields')
@Index(['requirementId'], { unique: true })
export class RequirementCustomFields extends BaseEntity {
  @ApiProperty({ description: '需求ID' })
  @Column({
    type: 'uuid',
    comment: '需求ID',
  })
  requirementId: string;

  @ApiProperty({ description: '文本字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '文本类型自定义字段',
  })
  textFields?: Record<string, string>;

  @ApiProperty({ description: '数字字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '数字类型自定义字段',
  })
  numberFields?: Record<string, number>;

  @ApiProperty({ description: '日期字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '日期类型自定义字段',
  })
  dateFields?: Record<string, string>;

  @ApiProperty({ description: '布尔字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '布尔类型自定义字段',
  })
  booleanFields?: Record<string, boolean>;

  @ApiProperty({ description: '选择字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '选择类型自定义字段',
  })
  selectFields?: Record<string, string | string[]>;

  @ApiProperty({ description: '文件字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '文件类型自定义字段',
  })
  fileFields?: Record<string, {
    url: string;
    name: string;
    size: number;
    type: string;
  }[]>;

  @ApiProperty({ description: '用户字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '用户类型自定义字段',
  })
  userFields?: Record<string, string | string[]>;

  @ApiProperty({ description: '富文本字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '富文本类型自定义字段',
  })
  richTextFields?: Record<string, string>;

  @ApiProperty({ description: '标签字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '标签类型自定义字段',
  })
  tagFields?: Record<string, string[]>;

  @ApiProperty({ description: '链接字段', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '链接类型自定义字段',
  })
  urlFields?: Record<string, {
    url: string;
    title?: string;
    description?: string;
  }>;

  // 关联关系
  @ApiProperty({ description: '需求', type: () => Requirement })
  @OneToOne(() => Requirement, requirement => requirement.customFields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'requirementId' })
  requirement: Requirement;

  // 业务方法

  /**
   * 设置文本字段
   * @param key 字段键
   * @param value 字段值
   */
  setTextField(key: string, value: string): void {
    if (!this.textFields) {
      this.textFields = {};
    }
    this.textFields[key] = value;
  }

  /**
   * 获取文本字段
   * @param key 字段键
   * @returns 字段值
   */
  getTextField(key: string): string | undefined {
    return this.textFields?.[key];
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
   * 设置日期字段
   * @param key 字段键
   * @param value 字段值
   */
  setDateField(key: string, value: string): void {
    if (!this.dateFields) {
      this.dateFields = {};
    }
    this.dateFields[key] = value;
  }

  /**
   * 获取日期字段
   * @param key 字段键
   * @returns 字段值
   */
  getDateField(key: string): string | undefined {
    return this.dateFields?.[key];
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
   * 设置选择字段
   * @param key 字段键
   * @param value 字段值
   */
  setSelectField(key: string, value: string | string[]): void {
    if (!this.selectFields) {
      this.selectFields = {};
    }
    this.selectFields[key] = value;
  }

  /**
   * 获取选择字段
   * @param key 字段键
   * @returns 字段值
   */
  getSelectField(key: string): string | string[] | undefined {
    return this.selectFields?.[key];
  }

  /**
   * 设置文件字段
   * @param key 字段键
   * @param files 文件列表
   */
  setFileField(key: string, files: { url: string; name: string; size: number; type: string }[]): void {
    if (!this.fileFields) {
      this.fileFields = {};
    }
    this.fileFields[key] = files;
  }

  /**
   * 获取文件字段
   * @param key 字段键
   * @returns 文件列表
   */
  getFileField(key: string): { url: string; name: string; size: number; type: string }[] | undefined {
    return this.fileFields?.[key];
  }

  /**
   * 添加文件到字段
   * @param key 字段键
   * @param file 文件信息
   */
  addFileToField(key: string, file: { url: string; name: string; size: number; type: string }): void {
    if (!this.fileFields) {
      this.fileFields = {};
    }
    if (!this.fileFields[key]) {
      this.fileFields[key] = [];
    }
    this.fileFields[key].push(file);
  }

  /**
   * 从字段移除文件
   * @param key 字段键
   * @param fileUrl 文件URL
   */
  removeFileFromField(key: string, fileUrl: string): void {
    if (this.fileFields?.[key]) {
      this.fileFields[key] = this.fileFields[key].filter(file => file.url !== fileUrl);
    }
  }

  /**
   * 设置用户字段
   * @param key 字段键
   * @param userIds 用户ID或用户ID列表
   */
  setUserField(key: string, userIds: string | string[]): void {
    if (!this.userFields) {
      this.userFields = {};
    }
    this.userFields[key] = userIds;
  }

  /**
   * 获取用户字段
   * @param key 字段键
   * @returns 用户ID或用户ID列表
   */
  getUserField(key: string): string | string[] | undefined {
    return this.userFields?.[key];
  }

  /**
   * 设置富文本字段
   * @param key 字段键
   * @param content 富文本内容
   */
  setRichTextField(key: string, content: string): void {
    if (!this.richTextFields) {
      this.richTextFields = {};
    }
    this.richTextFields[key] = content;
  }

  /**
   * 获取富文本字段
   * @param key 字段键
   * @returns 富文本内容
   */
  getRichTextField(key: string): string | undefined {
    return this.richTextFields?.[key];
  }

  /**
   * 设置标签字段
   * @param key 字段键
   * @param tags 标签列表
   */
  setTagField(key: string, tags: string[]): void {
    if (!this.tagFields) {
      this.tagFields = {};
    }
    this.tagFields[key] = tags;
  }

  /**
   * 获取标签字段
   * @param key 字段键
   * @returns 标签列表
   */
  getTagField(key: string): string[] | undefined {
    return this.tagFields?.[key];
  }

  /**
   * 添加标签到字段
   * @param key 字段键
   * @param tag 标签
   */
  addTagToField(key: string, tag: string): void {
    if (!this.tagFields) {
      this.tagFields = {};
    }
    if (!this.tagFields[key]) {
      this.tagFields[key] = [];
    }
    if (!this.tagFields[key].includes(tag)) {
      this.tagFields[key].push(tag);
    }
  }

  /**
   * 从字段移除标签
   * @param key 字段键
   * @param tag 标签
   */
  removeTagFromField(key: string, tag: string): void {
    if (this.tagFields?.[key]) {
      this.tagFields[key] = this.tagFields[key].filter(t => t !== tag);
    }
  }

  /**
   * 设置链接字段
   * @param key 字段键
   * @param link 链接信息
   */
  setUrlField(key: string, link: { url: string; title?: string; description?: string }): void {
    if (!this.urlFields) {
      this.urlFields = {};
    }
    this.urlFields[key] = link;
  }

  /**
   * 获取链接字段
   * @param key 字段键
   * @returns 链接信息
   */
  getUrlField(key: string): { url: string; title?: string; description?: string } | undefined {
    return this.urlFields?.[key];
  }

  /**
   * 获取所有自定义字段
   * @returns 所有自定义字段的合并对象
   */
  getAllFields(): Record<string, any> {
    return {
      ...this.textFields,
      ...this.numberFields,
      ...this.dateFields,
      ...this.booleanFields,
      ...this.selectFields,
      ...this.fileFields,
      ...this.userFields,
      ...this.richTextFields,
      ...this.tagFields,
      ...this.urlFields,
    };
  }

  /**
   * 设置字段值（通用方法）
   * @param key 字段键
   * @param value 字段值
   * @param type 字段类型
   */
  setField(key: string, value: any, type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'file' | 'user' | 'richText' | 'tag' | 'url'): void {
    switch (type) {
      case 'text':
        this.setTextField(key, value);
        break;
      case 'number':
        this.setNumberField(key, value);
        break;
      case 'date':
        this.setDateField(key, value);
        break;
      case 'boolean':
        this.setBooleanField(key, value);
        break;
      case 'select':
        this.setSelectField(key, value);
        break;
      case 'file':
        this.setFileField(key, value);
        break;
      case 'user':
        this.setUserField(key, value);
        break;
      case 'richText':
        this.setRichTextField(key, value);
        break;
      case 'tag':
        this.setTagField(key, value);
        break;
      case 'url':
        this.setUrlField(key, value);
        break;
    }
  }

  /**
   * 获取字段值（通用方法）
   * @param key 字段键
   * @param type 字段类型
   * @returns 字段值
   */
  getField(key: string, type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'file' | 'user' | 'richText' | 'tag' | 'url'): any {
    switch (type) {
      case 'text':
        return this.getTextField(key);
      case 'number':
        return this.getNumberField(key);
      case 'date':
        return this.getDateField(key);
      case 'boolean':
        return this.getBooleanField(key);
      case 'select':
        return this.getSelectField(key);
      case 'file':
        return this.getFileField(key);
      case 'user':
        return this.getUserField(key);
      case 'richText':
        return this.getRichTextField(key);
      case 'tag':
        return this.getTagField(key);
      case 'url':
        return this.getUrlField(key);
      default:
        return undefined;
    }
  }

  /**
   * 移除字段
   * @param key 字段键
   * @param type 字段类型
   */
  removeField(key: string, type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'file' | 'user' | 'richText' | 'tag' | 'url'): void {
    switch (type) {
      case 'text':
        if (this.textFields) delete this.textFields[key];
        break;
      case 'number':
        if (this.numberFields) delete this.numberFields[key];
        break;
      case 'date':
        if (this.dateFields) delete this.dateFields[key];
        break;
      case 'boolean':
        if (this.booleanFields) delete this.booleanFields[key];
        break;
      case 'select':
        if (this.selectFields) delete this.selectFields[key];
        break;
      case 'file':
        if (this.fileFields) delete this.fileFields[key];
        break;
      case 'user':
        if (this.userFields) delete this.userFields[key];
        break;
      case 'richText':
        if (this.richTextFields) delete this.richTextFields[key];
        break;
      case 'tag':
        if (this.tagFields) delete this.tagFields[key];
        break;
      case 'url':
        if (this.urlFields) delete this.urlFields[key];
        break;
    }
  }

  /**
   * 检查字段是否存在
   * @param key 字段键
   * @returns 是否存在
   */
  hasField(key: string): boolean {
    return !!(this.textFields?.[key] !== undefined ||
             this.numberFields?.[key] !== undefined ||
             this.dateFields?.[key] !== undefined ||
             this.booleanFields?.[key] !== undefined ||
             this.selectFields?.[key] !== undefined ||
             this.fileFields?.[key] !== undefined ||
             this.userFields?.[key] !== undefined ||
             this.richTextFields?.[key] !== undefined ||
             this.tagFields?.[key] !== undefined ||
             this.urlFields?.[key] !== undefined);
  }

  /**
   * 获取所有字段键
   * @returns 字段键列表
   */
  getFieldKeys(): string[] {
    const keys = new Set<string>();
    
    Object.keys(this.textFields || {}).forEach(key => keys.add(key));
    Object.keys(this.numberFields || {}).forEach(key => keys.add(key));
    Object.keys(this.dateFields || {}).forEach(key => keys.add(key));
    Object.keys(this.booleanFields || {}).forEach(key => keys.add(key));
    Object.keys(this.selectFields || {}).forEach(key => keys.add(key));
    Object.keys(this.fileFields || {}).forEach(key => keys.add(key));
    Object.keys(this.userFields || {}).forEach(key => keys.add(key));
    Object.keys(this.richTextFields || {}).forEach(key => keys.add(key));
    Object.keys(this.tagFields || {}).forEach(key => keys.add(key));
    Object.keys(this.urlFields || {}).forEach(key => keys.add(key));
    
    return Array.from(keys);
  }

  /**
   * 清空所有自定义字段
   */
  clearAllFields(): void {
    this.textFields = {};
    this.numberFields = {};
    this.dateFields = {};
    this.booleanFields = {};
    this.selectFields = {};
    this.fileFields = {};
    this.userFields = {};
    this.richTextFields = {};
    this.tagFields = {};
    this.urlFields = {};
  }

  /**
   * 验证自定义字段
   * @returns 验证结果
   */
  validateFields(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 验证文件字段
    if (this.fileFields) {
      Object.entries(this.fileFields).forEach(([key, files]) => {
        files.forEach((file, index) => {
          if (!file.url || !file.name) {
            errors.push(`字段 ${key} 的第 ${index + 1} 个文件缺少必要信息`);
          }
        });
      });
    }
    
    // 验证链接字段
    if (this.urlFields) {
      Object.entries(this.urlFields).forEach(([key, link]) => {
        if (!link.url) {
          errors.push(`字段 ${key} 的链接URL不能为空`);
        } else {
          try {
            new URL(link.url);
          } catch {
            errors.push(`字段 ${key} 的链接URL格式不正确`);
          }
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建需求自定义字段
   * @param data 字段数据
   * @returns 自定义字段实例
   */
  static create(data: {
    requirementId: string;
    textFields?: Record<string, string>;
    numberFields?: Record<string, number>;
    dateFields?: Record<string, string>;
    booleanFields?: Record<string, boolean>;
    selectFields?: Record<string, string | string[]>;
    fileFields?: Record<string, { url: string; name: string; size: number; type: string }[]>;
    userFields?: Record<string, string | string[]>;
    richTextFields?: Record<string, string>;
    tagFields?: Record<string, string[]>;
    urlFields?: Record<string, { url: string; title?: string; description?: string }>;
  }): RequirementCustomFields {
    const customFields = new RequirementCustomFields();
    customFields.requirementId = data.requirementId;
    customFields.textFields = data.textFields;
    customFields.numberFields = data.numberFields;
    customFields.dateFields = data.dateFields;
    customFields.booleanFields = data.booleanFields;
    customFields.selectFields = data.selectFields;
    customFields.fileFields = data.fileFields;
    customFields.userFields = data.userFields;
    customFields.richTextFields = data.richTextFields;
    customFields.tagFields = data.tagFields;
    customFields.urlFields = data.urlFields;
    
    return customFields;
  }
}