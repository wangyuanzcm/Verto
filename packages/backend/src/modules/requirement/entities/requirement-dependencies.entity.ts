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
 * 需求依赖关系实体
 */
@Entity('requirement_dependencies')
@Index(['requirementId'], { unique: true })
export class RequirementDependencies extends BaseEntity {
  @ApiProperty({ description: '需求ID' })
  @Column({
    type: 'uuid',
    comment: '需求ID',
  })
  requirementId: string;

  @ApiProperty({ description: '前置需求', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '前置需求列表',
  })
  prerequisites?: {
    id: string;
    title: string;
    type: 'blocking' | 'related' | 'duplicate' | 'subtask';
    status: string;
    priority: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
  }[];

  @ApiProperty({ description: '后续需求', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '后续需求列表',
  })
  dependents?: {
    id: string;
    title: string;
    type: 'blocking' | 'related' | 'duplicate' | 'subtask';
    status: string;
    priority: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
  }[];

  @ApiProperty({ description: '相关需求', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '相关需求列表',
  })
  related?: {
    id: string;
    title: string;
    type: 'blocking' | 'related' | 'duplicate' | 'subtask';
    status: string;
    priority: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
  }[];

  @ApiProperty({ description: '重复需求', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '重复需求列表',
  })
  duplicates?: {
    id: string;
    title: string;
    type: 'blocking' | 'related' | 'duplicate' | 'subtask';
    status: string;
    priority: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
  }[];

  @ApiProperty({ description: '子任务', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '子任务列表',
  })
  subtasks?: {
    id: string;
    title: string;
    type: 'blocking' | 'related' | 'duplicate' | 'subtask';
    status: string;
    priority: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
    progress?: number;
    assigneeId?: string;
    assigneeName?: string;
    estimatedHours?: number;
    actualHours?: number;
  }[];

  @ApiProperty({ description: '父任务', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '父任务信息',
  })
  parent?: {
    id: string;
    title: string;
    type: 'blocking' | 'related' | 'duplicate' | 'subtask';
    status: string;
    priority: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
  };

  @ApiProperty({ description: '依赖图配置', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '依赖图可视化配置',
  })
  graphConfig?: {
    layout: 'hierarchical' | 'force' | 'circular' | 'grid';
    direction: 'top-bottom' | 'bottom-top' | 'left-right' | 'right-left';
    nodeSpacing: number;
    levelSpacing: number;
    showLabels: boolean;
    showTypes: boolean;
    colorScheme: Record<string, string>;
    customStyles?: Record<string, any>;
  };

  @ApiProperty({ description: '依赖统计', required: false })
  @Column({
    type: 'json',
    nullable: true,
    comment: '依赖关系统计信息',
  })
  statistics?: {
    totalPrerequisites: number;
    totalDependents: number;
    totalRelated: number;
    totalDuplicates: number;
    totalSubtasks: number;
    completedSubtasks: number;
    blockedByCount: number;
    blockingCount: number;
    criticalPath: string[];
    estimatedImpact: 'low' | 'medium' | 'high' | 'critical';
    lastUpdated: string;
  };

  // 关联关系
  @ApiProperty({ description: '需求', type: () => Requirement })
  @OneToOne(() => Requirement, requirement => requirement.dependencies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'requirementId' })
  requirement: Requirement;

  // 业务方法

  /**
   * 添加前置需求
   * @param prerequisite 前置需求信息
   */
  addPrerequisite(prerequisite: {
    id: string;
    title: string;
    type: 'blocking' | 'related' | 'duplicate' | 'subtask';
    status: string;
    priority: number;
    description?: string;
  }): void {
    if (!this.prerequisites) {
      this.prerequisites = [];
    }
    
    // 检查是否已存在
    const exists = this.prerequisites.some(p => p.id === prerequisite.id);
    if (!exists) {
      this.prerequisites.push({
        ...prerequisite,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      this.updateStatistics();
    }
  }

  /**
   * 移除前置需求
   * @param requirementId 需求ID
   */
  removePrerequisite(requirementId: string): void {
    if (this.prerequisites) {
      this.prerequisites = this.prerequisites.filter(p => p.id !== requirementId);
      this.updateStatistics();
    }
  }

  /**
   * 添加后续需求
   * @param dependent 后续需求信息
   */
  addDependent(dependent: {
    id: string;
    title: string;
    type: 'blocking' | 'related' | 'duplicate' | 'subtask';
    status: string;
    priority: number;
    description?: string;
  }): void {
    if (!this.dependents) {
      this.dependents = [];
    }
    
    // 检查是否已存在
    const exists = this.dependents.some(d => d.id === dependent.id);
    if (!exists) {
      this.dependents.push({
        ...dependent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      this.updateStatistics();
    }
  }

  /**
   * 移除后续需求
   * @param requirementId 需求ID
   */
  removeDependent(requirementId: string): void {
    if (this.dependents) {
      this.dependents = this.dependents.filter(d => d.id !== requirementId);
      this.updateStatistics();
    }
  }

  /**
   * 添加相关需求
   * @param related 相关需求信息
   */
  addRelated(related: {
    id: string;
    title: string;
    type: 'blocking' | 'related' | 'duplicate' | 'subtask';
    status: string;
    priority: number;
    description?: string;
  }): void {
    if (!this.related) {
      this.related = [];
    }
    
    // 检查是否已存在
    const exists = this.related.some(r => r.id === related.id);
    if (!exists) {
      this.related.push({
        ...related,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      this.updateStatistics();
    }
  }

  /**
   * 移除相关需求
   * @param requirementId 需求ID
   */
  removeRelated(requirementId: string): void {
    if (this.related) {
      this.related = this.related.filter(r => r.id !== requirementId);
      this.updateStatistics();
    }
  }

  /**
   * 添加重复需求
   * @param duplicate 重复需求信息
   */
  addDuplicate(duplicate: {
    id: string;
    title: string;
    type: 'blocking' | 'related' | 'duplicate' | 'subtask';
    status: string;
    priority: number;
    description?: string;
  }): void {
    if (!this.duplicates) {
      this.duplicates = [];
    }
    
    // 检查是否已存在
    const exists = this.duplicates.some(d => d.id === duplicate.id);
    if (!exists) {
      this.duplicates.push({
        ...duplicate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      this.updateStatistics();
    }
  }

  /**
   * 移除重复需求
   * @param requirementId 需求ID
   */
  removeDuplicate(requirementId: string): void {
    if (this.duplicates) {
      this.duplicates = this.duplicates.filter(d => d.id !== requirementId);
      this.updateStatistics();
    }
  }

  /**
   * 添加子任务
   * @param subtask 子任务信息
   */
  addSubtask(subtask: {
    id: string;
    title: string;
    type: 'blocking' | 'related' | 'duplicate' | 'subtask';
    status: string;
    priority: number;
    description?: string;
    progress?: number;
    assigneeId?: string;
    assigneeName?: string;
    estimatedHours?: number;
    actualHours?: number;
  }): void {
    if (!this.subtasks) {
      this.subtasks = [];
    }
    
    // 检查是否已存在
    const exists = this.subtasks.some(s => s.id === subtask.id);
    if (!exists) {
      this.subtasks.push({
        ...subtask,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      this.updateStatistics();
    }
  }

  /**
   * 移除子任务
   * @param requirementId 需求ID
   */
  removeSubtask(requirementId: string): void {
    if (this.subtasks) {
      this.subtasks = this.subtasks.filter(s => s.id !== requirementId);
      this.updateStatistics();
    }
  }

  /**
   * 更新子任务进度
   * @param requirementId 需求ID
   * @param progress 进度百分比
   */
  updateSubtaskProgress(requirementId: string, progress: number): void {
    if (this.subtasks) {
      const subtask = this.subtasks.find(s => s.id === requirementId);
      if (subtask) {
        subtask.progress = Math.max(0, Math.min(100, progress));
        subtask.updatedAt = new Date().toISOString();
        this.updateStatistics();
      }
    }
  }

  /**
   * 设置父任务
   * @param parent 父任务信息
   */
  setParent(parent: {
    id: string;
    title: string;
    type: 'blocking' | 'related' | 'duplicate' | 'subtask';
    status: string;
    priority: number;
    description?: string;
  }): void {
    this.parent = {
      ...parent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.updateStatistics();
  }

  /**
   * 移除父任务
   */
  removeParent(): void {
    this.parent = undefined;
    this.updateStatistics();
  }

  /**
   * 获取所有依赖关系
   * @returns 所有依赖关系
   */
  getAllDependencies(): {
    prerequisites: any[];
    dependents: any[];
    related: any[];
    duplicates: any[];
    subtasks: any[];
    parent?: any;
  } {
    return {
      prerequisites: this.prerequisites || [],
      dependents: this.dependents || [],
      related: this.related || [],
      duplicates: this.duplicates || [],
      subtasks: this.subtasks || [],
      parent: this.parent,
    };
  }

  /**
   * 检查是否被阻塞
   * @returns 是否被阻塞
   */
  isBlocked(): boolean {
    if (!this.prerequisites) return false;
    
    return this.prerequisites.some(p => 
      p.type === 'blocking' && 
      !['completed', 'closed', 'resolved'].includes(p.status.toLowerCase())
    );
  }

  /**
   * 检查是否阻塞其他需求
   * @returns 是否阻塞其他需求
   */
  isBlocking(): boolean {
    if (!this.dependents) return false;
    
    return this.dependents.some(d => d.type === 'blocking');
  }

  /**
   * 获取阻塞的需求列表
   * @returns 阻塞的需求列表
   */
  getBlockingRequirements(): any[] {
    if (!this.prerequisites) return [];
    
    return this.prerequisites.filter(p => 
      p.type === 'blocking' && 
      !['completed', 'closed', 'resolved'].includes(p.status.toLowerCase())
    );
  }

  /**
   * 获取被阻塞的需求列表
   * @returns 被阻塞的需求列表
   */
  getBlockedRequirements(): any[] {
    if (!this.dependents) return [];
    
    return this.dependents.filter(d => d.type === 'blocking');
  }

  /**
   * 计算子任务完成进度
   * @returns 完成进度百分比
   */
  calculateSubtaskProgress(): number {
    if (!this.subtasks || this.subtasks.length === 0) return 0;
    
    const totalProgress = this.subtasks.reduce((sum, subtask) => {
      return sum + (subtask.progress || 0);
    }, 0);
    
    return Math.round(totalProgress / this.subtasks.length);
  }

  /**
   * 获取关键路径
   * @returns 关键路径需求ID列表
   */
  getCriticalPath(): string[] {
    return this.statistics?.criticalPath || [];
  }

  /**
   * 设置依赖图配置
   * @param config 图配置
   */
  setGraphConfig(config: {
    layout?: 'hierarchical' | 'force' | 'circular' | 'grid';
    direction?: 'top-bottom' | 'bottom-top' | 'left-right' | 'right-left';
    nodeSpacing?: number;
    levelSpacing?: number;
    showLabels?: boolean;
    showTypes?: boolean;
    colorScheme?: Record<string, string>;
    customStyles?: Record<string, any>;
  }): void {
    this.graphConfig = {
      layout: 'hierarchical',
      direction: 'top-bottom',
      nodeSpacing: 100,
      levelSpacing: 150,
      showLabels: true,
      showTypes: true,
      colorScheme: {
        blocking: '#ff4757',
        related: '#3742fa',
        duplicate: '#ffa502',
        subtask: '#2ed573',
      },
      ...this.graphConfig,
      ...config,
    };
  }

  /**
   * 更新统计信息
   */
  private updateStatistics(): void {
    const completedSubtasks = this.subtasks?.filter(s => 
      ['completed', 'closed', 'resolved'].includes(s.status.toLowerCase())
    ).length || 0;
    
    const blockedByCount = this.prerequisites?.filter(p => 
      p.type === 'blocking' && 
      !['completed', 'closed', 'resolved'].includes(p.status.toLowerCase())
    ).length || 0;
    
    const blockingCount = this.dependents?.filter(d => d.type === 'blocking').length || 0;
    
    // 计算预估影响
    let estimatedImpact: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const totalDependencies = (this.prerequisites?.length || 0) + (this.dependents?.length || 0);
    
    if (totalDependencies >= 10 || blockingCount >= 5) {
      estimatedImpact = 'critical';
    } else if (totalDependencies >= 5 || blockingCount >= 3) {
      estimatedImpact = 'high';
    } else if (totalDependencies >= 2 || blockingCount >= 1) {
      estimatedImpact = 'medium';
    }
    
    this.statistics = {
      totalPrerequisites: this.prerequisites?.length || 0,
      totalDependents: this.dependents?.length || 0,
      totalRelated: this.related?.length || 0,
      totalDuplicates: this.duplicates?.length || 0,
      totalSubtasks: this.subtasks?.length || 0,
      completedSubtasks,
      blockedByCount,
      blockingCount,
      criticalPath: this.statistics?.criticalPath || [],
      estimatedImpact,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * 验证依赖关系
   * @returns 验证结果
   */
  validateDependencies(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 检查循环依赖
    const allDependencyIds = new Set<string>();
    
    this.prerequisites?.forEach(p => {
      if (p.id === this.requirementId) {
        errors.push('不能将自己设置为前置需求');
      }
      allDependencyIds.add(p.id);
    });
    
    this.dependents?.forEach(d => {
      if (d.id === this.requirementId) {
        errors.push('不能将自己设置为后续需求');
      }
      if (allDependencyIds.has(d.id)) {
        errors.push(`需求 ${d.id} 存在循环依赖`);
      }
    });
    
    // 检查父子关系
    if (this.parent && this.parent.id === this.requirementId) {
      errors.push('不能将自己设置为父任务');
    }
    
    this.subtasks?.forEach(s => {
      if (s.id === this.requirementId) {
        errors.push('不能将自己设置为子任务');
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建需求依赖关系
   * @param data 依赖关系数据
   * @returns 依赖关系实例
   */
  static create(data: {
    requirementId: string;
    prerequisites?: any[];
    dependents?: any[];
    related?: any[];
    duplicates?: any[];
    subtasks?: any[];
    parent?: any;
    graphConfig?: any;
  }): RequirementDependencies {
    const dependencies = new RequirementDependencies();
    dependencies.requirementId = data.requirementId;
    dependencies.prerequisites = data.prerequisites;
    dependencies.dependents = data.dependents;
    dependencies.related = data.related;
    dependencies.duplicates = data.duplicates;
    dependencies.subtasks = data.subtasks;
    dependencies.parent = data.parent;
    dependencies.graphConfig = data.graphConfig;
    
    // 初始化统计信息
    dependencies.updateStatistics();
    
    return dependencies;
  }
}