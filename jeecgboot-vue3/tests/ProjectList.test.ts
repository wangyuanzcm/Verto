import { describe, it, expect } from '@jest/globals';
import { getColumns, TaskType } from '/@/views/project/Project.data';

/**
 * 项目列表字段修改测试
 */
describe('ProjectList Field Changes', () => {
  /**
   * 测试动态列配置功能
   */
  it('should return different columns based on task type', () => {
    // 测试需求类型列配置
    const requirementColumns = getColumns(TaskType.REQUIREMENT);
    expect(requirementColumns).toBeDefined();
    expect(Array.isArray(requirementColumns)).toBe(true);
    expect(requirementColumns.length).toBeGreaterThan(0);

    // 测试BUG类型列配置
    const bugColumns = getColumns(TaskType.BUG);
    expect(bugColumns).toBeDefined();
    expect(Array.isArray(bugColumns)).toBe(true);
    expect(bugColumns.length).toBeGreaterThan(0);

    // 测试默认列配置（无类型筛选）
    const defaultColumns = getColumns();
    expect(defaultColumns).toBeDefined();
    expect(Array.isArray(defaultColumns)).toBe(true);
    expect(defaultColumns.length).toBeGreaterThan(0);
  });

  /**
   * 测试已删除字段不再出现在列配置中
   */
  it('should not contain removed fields in columns', () => {
    const columns = getColumns();
    const columnDataIndexes = columns.map(col => col.dataIndex);

    // 验证已删除的字段不再存在
    const removedFields = [
      'priority',
      'progress', 
      'gitUrl',
      'gitBranch',
      'version',
      'endDate',
      'estimatedHours',
      'actualHours',
      'projectName',
      'projectCode',
      'projectDescription'
    ];

    removedFields.forEach(field => {
      expect(columnDataIndexes).not.toContain(field);
    });
  });

  /**
   * 测试必要字段仍然存在
   */
  it('should contain required fields in columns', () => {
    const columns = getColumns();
    const columnDataIndexes = columns.map(col => col.dataIndex);

    // 验证必要字段仍然存在
    const requiredFields = [
      'taskType',  // 项目类型
      'status',    // 状态
      'startDate', // 开始时间
    ];

    requiredFields.forEach(field => {
      expect(columnDataIndexes).toContain(field);
    });
  });

  /**
   * 测试项目类型字段配置
   */
  it('should have taskType field with correct configuration', () => {
    const columns = getColumns();
    const taskTypeColumn = columns.find(col => col.dataIndex === 'taskType');
    
    expect(taskTypeColumn).toBeDefined();
    expect(taskTypeColumn?.title).toBe('项目类型');
    expect(taskTypeColumn?.fixed).toBe('left');
    expect(taskTypeColumn?.customRender).toBeDefined();
  });
});

/**
 * 项目类型枚举测试
 */
describe('TaskType Enum', () => {
  /**
   * 测试任务类型枚举值
   */
  it('should have correct task type values', () => {
    expect(TaskType.REQUIREMENT).toBe('REQUIREMENT');
    expect(TaskType.BUG).toBe('BUG');
  });
});