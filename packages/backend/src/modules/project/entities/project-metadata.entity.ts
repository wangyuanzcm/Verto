import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Project } from './project.entity';

/**
 * 项目元数据实体
 */
@Entity('project_metadata')
@Index(['projectId'], { unique: true })
@Index(['version'])
@Index(['environment'])
export class ProjectMetadata extends BaseEntity {
  @ApiProperty({ description: '项目ID' })
  @Column({
    type: 'uuid',
    comment: '项目ID',
  })
  projectId: string;

  @ApiProperty({ description: '项目版本', required: false })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '项目版本',
  })
  version?: string;

  @ApiProperty({ description: '环境信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '环境信息',
  })
  environment?: {
    development?: Record<string, any>;
    staging?: Record<string, any>;
    production?: Record<string, any>;
  };

  @ApiProperty({ description: '技术栈', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '技术栈',
  })
  techStack?: {
    frontend?: string[];
    backend?: string[];
    database?: string[];
    devops?: string[];
    testing?: string[];
  };

  @ApiProperty({ description: '依赖信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '依赖信息',
  })
  dependencies?: {
    production?: Record<string, string>;
    development?: Record<string, string>;
    peer?: Record<string, string>;
  };

  @ApiProperty({ description: '构建信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '构建信息',
  })
  buildInfo?: {
    buildTool?: string;
    buildScript?: string;
    outputDir?: string;
    entryPoint?: string;
    publicPath?: string;
  };

  @ApiProperty({ description: '部署信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '部署信息',
  })
  deploymentInfo?: {
    platform?: string;
    region?: string;
    domain?: string;
    ssl?: boolean;
    cdn?: string;
  };

  @ApiProperty({ description: '许可证信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '许可证信息',
  })
  license?: {
    type?: string;
    url?: string;
    file?: string;
    year?: number;
    holder?: string;
  };

  @ApiProperty({ description: '作者信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '作者信息',
  })
  authors?: {
    name: string;
    email?: string;
    role?: string;
    url?: string;
  }[];

  @ApiProperty({ description: '贡献者信息', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '贡献者信息',
  })
  contributors?: {
    name: string;
    email?: string;
    contributions?: string[];
    url?: string;
  }[];

  @ApiProperty({ description: '关键词', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '关键词',
  })
  keywords?: string[];

  @ApiProperty({ description: '分类标签', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '分类标签',
  })
  categories?: string[];

  @ApiProperty({ description: '外部链接', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '外部链接',
  })
  links?: {
    homepage?: string;
    repository?: string;
    documentation?: string;
    issues?: string;
    wiki?: string;
    demo?: string;
  };

  @ApiProperty({ description: '自定义元数据', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '自定义元数据',
  })
  customMetadata?: Record<string, any>;

  // 关联关系
  @ApiProperty({ description: '关联项目', type: () => Project })
  @OneToOne(() => Project, project => project.metadata, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  /**
   * 获取环境配置
   */
  getEnvironmentConfig(env: 'development' | 'staging' | 'production'): Record<string, any> {
    return this.environment?.[env] || {};
  }

  /**
   * 设置环境配置
   */
  setEnvironmentConfig(env: 'development' | 'staging' | 'production', config: Record<string, any>): void {
    if (!this.environment) {
      this.environment = {};
    }
    this.environment[env] = { ...this.environment[env], ...config };
  }

  /**
   * 获取技术栈
   */
  getTechStack(): NonNullable<ProjectMetadata['techStack']> {
    return this.techStack || {};
  }

  /**
   * 添加技术栈
   */
  addTechStack(category: keyof NonNullable<ProjectMetadata['techStack']>, tech: string): void {
    if (!this.techStack) {
      this.techStack = {};
    }
    if (!this.techStack[category]) {
      this.techStack[category] = [];
    }
    if (!this.techStack[category]!.includes(tech)) {
      this.techStack[category]!.push(tech);
    }
  }

  /**
   * 移除技术栈
   */
  removeTechStack(category: keyof NonNullable<ProjectMetadata['techStack']>, tech: string): void {
    if (this.techStack?.[category]) {
      this.techStack[category] = this.techStack[category]!.filter(t => t !== tech);
    }
  }

  /**
   * 获取依赖信息
   */
  getDependencies(type?: 'production' | 'development' | 'peer'): Record<string, string> {
    if (type) {
      return this.dependencies?.[type] || {};
    }
    return {
      ...this.dependencies?.production,
      ...this.dependencies?.development,
      ...this.dependencies?.peer,
    };
  }

  /**
   * 添加依赖
   */
  addDependency(type: 'production' | 'development' | 'peer', name: string, version: string): void {
    if (!this.dependencies) {
      this.dependencies = {};
    }
    if (!this.dependencies[type]) {
      this.dependencies[type] = {};
    }
    this.dependencies[type]![name] = version;
  }

  /**
   * 移除依赖
   */
  removeDependency(type: 'production' | 'development' | 'peer', name: string): void {
    if (this.dependencies?.[type]) {
      delete this.dependencies[type]![name];
    }
  }

  /**
   * 获取构建信息
   */
  getBuildInfo(): NonNullable<ProjectMetadata['buildInfo']> {
    return this.buildInfo || {};
  }

  /**
   * 设置构建信息
   */
  setBuildInfo(buildInfo: NonNullable<ProjectMetadata['buildInfo']>): void {
    this.buildInfo = { ...this.buildInfo, ...buildInfo };
  }

  /**
   * 获取部署信息
   */
  getDeploymentInfo(): NonNullable<ProjectMetadata['deploymentInfo']> {
    return this.deploymentInfo || {};
  }

  /**
   * 设置部署信息
   */
  setDeploymentInfo(deploymentInfo: NonNullable<ProjectMetadata['deploymentInfo']>): void {
    this.deploymentInfo = { ...this.deploymentInfo, ...deploymentInfo };
  }

  /**
   * 获取许可证信息
   */
  getLicense(): NonNullable<ProjectMetadata['license']> {
    return this.license || {};
  }

  /**
   * 设置许可证信息
   */
  setLicense(license: NonNullable<ProjectMetadata['license']>): void {
    this.license = { ...this.license, ...license };
  }

  /**
   * 获取作者列表
   */
  getAuthors(): NonNullable<ProjectMetadata['authors']> {
    return this.authors || [];
  }

  /**
   * 添加作者
   */
  addAuthor(author: NonNullable<ProjectMetadata['authors']>[0]): void {
    if (!this.authors) {
      this.authors = [];
    }
    const existingIndex = this.authors.findIndex(a => a.email === author.email);
    if (existingIndex >= 0) {
      this.authors[existingIndex] = { ...this.authors[existingIndex], ...author };
    } else {
      this.authors.push(author);
    }
  }

  /**
   * 移除作者
   */
  removeAuthor(email: string): void {
    if (this.authors) {
      this.authors = this.authors.filter(a => a.email !== email);
    }
  }

  /**
   * 获取贡献者列表
   */
  getContributors(): NonNullable<ProjectMetadata['contributors']> {
    return this.contributors || [];
  }

  /**
   * 添加贡献者
   */
  addContributor(contributor: NonNullable<ProjectMetadata['contributors']>[0]): void {
    if (!this.contributors) {
      this.contributors = [];
    }
    const existingIndex = this.contributors.findIndex(c => c.email === contributor.email);
    if (existingIndex >= 0) {
      this.contributors[existingIndex] = { ...this.contributors[existingIndex], ...contributor };
    } else {
      this.contributors.push(contributor);
    }
  }

  /**
   * 移除贡献者
   */
  removeContributor(email: string): void {
    if (this.contributors) {
      this.contributors = this.contributors.filter(c => c.email !== email);
    }
  }

  /**
   * 获取关键词
   */
  getKeywords(): string[] {
    return this.keywords || [];
  }

  /**
   * 添加关键词
   */
  addKeyword(keyword: string): void {
    if (!this.keywords) {
      this.keywords = [];
    }
    if (!this.keywords.includes(keyword)) {
      this.keywords.push(keyword);
    }
  }

  /**
   * 移除关键词
   */
  removeKeyword(keyword: string): void {
    if (this.keywords) {
      this.keywords = this.keywords.filter(k => k !== keyword);
    }
  }

  /**
   * 获取分类标签
   */
  getCategories(): string[] {
    return this.categories || [];
  }

  /**
   * 添加分类标签
   */
  addCategory(category: string): void {
    if (!this.categories) {
      this.categories = [];
    }
    if (!this.categories.includes(category)) {
      this.categories.push(category);
    }
  }

  /**
   * 移除分类标签
   */
  removeCategory(category: string): void {
    if (this.categories) {
      this.categories = this.categories.filter(c => c !== category);
    }
  }

  /**
   * 获取外部链接
   */
  getLinks(): NonNullable<ProjectMetadata['links']> {
    return this.links || {};
  }

  /**
   * 设置外部链接
   */
  setLinks(links: NonNullable<ProjectMetadata['links']>): void {
    this.links = { ...this.links, ...links };
  }

  /**
   * 获取自定义元数据
   */
  getCustomMetadata(key?: string): any {
    if (key) {
      return this.customMetadata?.[key];
    }
    return this.customMetadata || {};
  }

  /**
   * 设置自定义元数据
   */
  setCustomMetadata(key: string, value: any): void {
    if (!this.customMetadata) {
      this.customMetadata = {};
    }
    this.customMetadata[key] = value;
  }

  /**
   * 移除自定义元数据
   */
  removeCustomMetadata(key: string): void {
    if (this.customMetadata) {
      delete this.customMetadata[key];
    }
  }

  /**
   * 获取项目摘要信息
   */
  getSummary(): {
    version?: string;
    techStack: string[];
    authors: string[];
    keywords: string[];
    categories: string[];
    license?: string;
  } {
    const allTechStack = Object.values(this.getTechStack()).flat();
    const authorNames = this.getAuthors().map(a => a.name);
    
    return {
      version: this.version,
      techStack: allTechStack,
      authors: authorNames,
      keywords: this.getKeywords(),
      categories: this.getCategories(),
      license: this.license?.type,
    };
  }

  /**
   * 验证元数据完整性
   */
  validateMetadata(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证版本格式
    if (this.version && !/^\d+\.\d+\.\d+/.test(this.version)) {
      errors.push('版本号格式不正确，应为 x.y.z 格式');
    }

    // 验证作者信息
    if (this.authors) {
      this.authors.forEach((author, index) => {
        if (!author.name) {
          errors.push(`作者 ${index + 1} 缺少姓名`);
        }
        if (author.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(author.email)) {
          errors.push(`作者 ${index + 1} 邮箱格式不正确`);
        }
      });
    }

    // 验证链接格式
    if (this.links) {
      Object.entries(this.links).forEach(([key, url]) => {
        if (url && !/^https?:\/\/.+/.test(url)) {
          errors.push(`${key} 链接格式不正确`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}