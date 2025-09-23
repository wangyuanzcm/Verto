import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';

/**
 * 项目状态枚举
 */
export enum ProjectStatus {
  PLANNING = 'planning',
  DEVELOPING = 'developing',
  TESTING = 'testing',
  DEPLOYED = 'deployed',
  MAINTENANCE = 'maintenance',
  ARCHIVED = 'archived',
}

/**
 * 项目优先级枚举
 */
export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * 项目类型枚举
 */
export enum ProjectType {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  API = 'API',
  DESKTOP = 'DESKTOP',
  LIBRARY = 'LIBRARY',
}

/**
 * 任务类型枚举（需求或BUG）
 */
export enum TaskType {
  REQUIREMENT = 'REQUIREMENT', // 需求
  BUG = 'BUG', // BUG
}

/**
 * 开发模式枚举
 */
export enum DevelopmentMode {
  L1 = 'L1', // 直接下载项目开发
  L2 = 'L2', // 使用模板开发
  L3 = 'L3', // 在线可视化配置
}

/**
 * Git分支创建模式枚举
 */
export enum BranchCreateMode {
  MANUAL = 'MANUAL', // 手动创建
  AUTO = 'AUTO', // 自动创建
}

/**
 * 项目数据接口（需求/BUG管理）
 */
export interface ProjectModel {
  id: string;
  status: ProjectStatus;
  
  // 项目类型相关字段
  taskType: TaskType; // 项目类型：需求或BUG
  requirementId?: string; // 需求ID（当taskType为REQUIREMENT时）
  bugId?: string; // BUG ID（当taskType为BUG时）
  
  // 需求相关字段（仅当taskType为REQUIREMENT时有效）
  zentaoUrl?: string; // 禅道需求链接
  uiDesignUrl?: string; // UI设计稿链接
  prototypeUrl?: string; // 原型图链接
  designDocUrl?: string; // 设计文档链接
  
  // 时间节点
  startDate?: string; // 项目开始时间
  testDate?: string; // 项目提测时间
  onlineDate?: string; // 项目上线时间
  releaseDate?: string; // 项目发布时间
  
  // 人员配置
  teamMembers?: string[]; // 开发人员
  teamMembersText?: string;
  projectManager?: string;
  projectManagerText?: string;
  
  // 关联应用（一个需求可能对应多个应用）
  relatedApps?: RelatedApp[];
  
  // Git分支管理相关字段
  branchCreateMode?: BranchCreateMode; // 分支创建模式
  gitBranches?: GitBranch[]; // Git分支列表
  
  // 开发模式相关字段
  developmentMode?: DevelopmentMode; // 开发模式
  templateId?: string; // 模板ID（L2模式使用）
  configData?: any; // 配置数据（L3模式使用）
  
  // 其他字段
  techStack?: string[];
  techStackText?: string;
  environment?: {
    dev?: string;
    test?: string;
    prod?: string;
  };
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/**
 * 关联应用接口
 */
export interface RelatedApp {
  id: string;
  appName: string;
  appCode: string;
  appType: string; // 应用类型
  gitUrl?: string; // Git仓库地址
  pipelineUrl?: string; // 应用流水线地址
  status: string;
  deployStatus?: string;
  developer?: string; // 开发负责人
  developerText?: string;
  tester?: string; // 测试负责人
  testerText?: string;
  description?: string; // 应用描述
  createTime?: string;
  updateTime?: string;
}

/**
 * Git分支接口
 */
export interface GitBranch {
  id: string;
  appId: string; // 关联应用ID
  branchName: string; // 分支名称
  branchType: 'feature' | 'fix'; // 分支类型
  status: 'created' | 'developing' | 'merged' | 'deleted'; // 分支状态
  createMode: BranchCreateMode; // 创建模式
  gitUrl: string; // Git仓库地址
  createTime?: string;
  updateTime?: string;
}

/**
 * 项目搜索表单配置
 */
export const searchFormSchema: FormSchema[] = [
  {
    field: 'taskType',
    label: '项目类型',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '需求', value: TaskType.REQUIREMENT },
        { label: 'BUG', value: TaskType.BUG },
      ],
    },
    colProps: { span: 6 },
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '规划中', value: ProjectStatus.PLANNING },
        { label: '开发中', value: ProjectStatus.DEVELOPING },
        { label: '测试中', value: ProjectStatus.TESTING },
        { label: '已部署', value: ProjectStatus.DEPLOYED },
        { label: '维护中', value: ProjectStatus.MAINTENANCE },
        { label: '已归档', value: ProjectStatus.ARCHIVED },
      ],
    },
    colProps: { span: 6 },
  },
  {
    field: 'developmentMode',
    label: '开发模式',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: 'L1-直接开发', value: DevelopmentMode.L1 },
        { label: 'L2-模板开发', value: DevelopmentMode.L2 },
        { label: 'L3-可视化配置', value: DevelopmentMode.L3 },
      ],
    },
    colProps: { span: 6 },
  },
  {
    field: 'projectManager',
    label: '项目经理',
    component: 'JSelectUser',
    componentProps: {
      placeholder: '请选择项目经理',
      labelKey: 'realname',
      rowKey: 'username',
    },
    colProps: { span: 6 },
  },
];

/**
 * 开发模板接口（L2模式使用）
 */
export interface DevelopmentTemplate {
  id: string;
  templateName: string;
  templateCode: string;
  templateType: string; // 模板类型
  description?: string;
  configSchema?: any; // 配置模式定义
  defaultConfig?: any; // 默认配置
  createTime?: string;
  updateTime?: string;
}

/**
 * 流水线配置接口
 */
export interface PipelineConfig {
  id: string;
  projectId: string;
  appId: string;
  pipelineName: string;
  pipelineType: 'build' | 'deploy' | 'test'; // 流水线类型
  config: any; // 流水线配置
  status: 'pending' | 'running' | 'success' | 'failed'; // 流水线状态
  createTime?: string;
  updateTime?: string;
}

/**
 * 项目开发流程状态接口
 */
export interface ProjectWorkflow {
  id: string;
  projectId: string;
  currentStep: 'created' | 'branch_created' | 'developing' | 'testing' | 'deploying' | 'completed'; // 当前步骤
  developmentMode: DevelopmentMode;
  steps: WorkflowStep[];
  createTime?: string;
  updateTime?: string;
}

/**
 * 工作流步骤接口
 */
export interface WorkflowStep {
  id: string;
  stepName: string;
  stepType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  description?: string;
  startTime?: string;
  endTime?: string;
}

/**
 * 基础表格列配置（公共字段）
 */
export const baseColumns: BasicColumn[] = [
  {
    title: '项目类型',
    dataIndex: 'taskType',
    width: 100,
    fixed: 'left',
    customRender: ({ record }) => {
      const typeMap = {
        [TaskType.REQUIREMENT]: { text: '需求', color: 'blue' },
        [TaskType.BUG]: { text: 'BUG', color: 'red' },
      };
      const type = typeMap[record.taskType];
      return render.renderTag(type?.text || record.taskType, type?.color);
    },
  },
  {
    title: 'ID',
    dataIndex: 'taskId',
    width: 120,
    customRender: ({ record }) => {
      return record.taskType === TaskType.REQUIREMENT ? record.requirementId : record.bugId;
    },
  },
  {
    title: '禅道链接',
    dataIndex: 'zentaoUrl',
    width: 120,
    customRender: ({ record }) => {
      if (record.zentaoUrl) {
        return render.renderHref(record.zentaoUrl);
      }
      return '-';
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    customRender: ({ record }) => {
      const statusMap = {
        [ProjectStatus.PLANNING]: { text: '规划中', color: 'default' },
        [ProjectStatus.DEVELOPING]: { text: '开发中', color: 'processing' },
        [ProjectStatus.TESTING]: { text: '测试中', color: 'warning' },
        [ProjectStatus.DEPLOYED]: { text: '已部署', color: 'success' },
        [ProjectStatus.MAINTENANCE]: { text: '维护中', color: 'cyan' },
        [ProjectStatus.ARCHIVED]: { text: '已归档', color: 'default' },
      };
      const status = statusMap[record.status];
      return render.renderTag(status?.text || record.status, status?.color);
    },
  },
  {
    title: '项目经理',
    dataIndex: 'projectManagerText',
    width: 120,
  },
  {
    title: '开始时间',
    dataIndex: 'startDate',
    width: 120,
    customRender: ({ record }) => {
      return render.renderDate(record.startDate);
    },
  },
];

/**
 * 需求类型专用列配置
 */
export const requirementColumns: BasicColumn[] = [
  ...baseColumns,
  {
    title: '提测时间',
    dataIndex: 'testDate',
    width: 120,
    customRender: ({ record }) => {
      return render.renderDate(record.testDate);
    },
  },
  {
    title: '上线时间',
    dataIndex: 'onlineDate',
    width: 120,
    customRender: ({ record }) => {
      return render.renderDate(record.onlineDate);
    },
  },
  {
    title: '关联应用',
    dataIndex: 'relatedApps',
    width: 150,
    customRender: ({ record }) => {
      if (record.relatedApps && record.relatedApps.length > 0) {
        return record.relatedApps.map(app => app.appName).join(', ');
      }
      return '-';
    },
  },
  {
    title: '开发模式',
    dataIndex: 'developmentMode',
    width: 100,
    align: 'center',
    customRender: ({ record }) => {
      const modeMap = {
        [DevelopmentMode.L1]: { text: 'L1-直接开发', color: 'green' },
        [DevelopmentMode.L2]: { text: 'L2-模板开发', color: 'blue' },
        [DevelopmentMode.L3]: { text: 'L3-可视化配置', color: 'purple' },
      };
      const mode = modeMap[record.developmentMode];
      return mode ? render.renderTag(mode.text, mode.color) : '-';
    },
  },
  {
    title: 'Git分支状态',
    dataIndex: 'branchStatus',
    width: 120,
    align: 'center',
    customRender: ({ record }) => {
      if (!record.gitBranches || record.gitBranches.length === 0) {
        return render.renderTag('未创建', 'default');
      }
      const createdCount = record.gitBranches.filter(b => b.status === 'created').length;
      const developingCount = record.gitBranches.filter(b => b.status === 'developing').length;
      const mergedCount = record.gitBranches.filter(b => b.status === 'merged').length;
      
      if (mergedCount > 0) {
        return render.renderTag(`已合并(${mergedCount})`, 'success');
      } else if (developingCount > 0) {
        return render.renderTag(`开发中(${developingCount})`, 'processing');
      } else if (createdCount > 0) {
        return render.renderTag(`已创建(${createdCount})`, 'warning');
      }
      return render.renderTag('未知状态', 'default');
    },
  },
];

/**
 * BUG类型专用列配置
 */
export const bugColumns: BasicColumn[] = [
  ...baseColumns,
  {
    title: '修复时间',
    dataIndex: 'testDate',
    width: 120,
    customRender: ({ record }) => {
      return render.renderDate(record.testDate);
    },
  },
  {
    title: '验证时间',
    dataIndex: 'onlineDate',
    width: 120,
    customRender: ({ record }) => {
      return render.renderDate(record.onlineDate);
    },
  },
  {
    title: '影响应用',
    dataIndex: 'relatedApps',
    width: 150,
    customRender: ({ record }) => {
      if (record.relatedApps && record.relatedApps.length > 0) {
        return record.relatedApps.map(app => app.appName).join(', ');
      }
      return '-';
    },
  },
];

/**
 * 动态获取表格列配置
 */
export function getColumns(taskType?: TaskType): BasicColumn[] {
  if (taskType === TaskType.BUG) {
    return bugColumns;
  } else if (taskType === TaskType.REQUIREMENT) {
    return requirementColumns;
  }
  // 默认返回需求列配置
  return requirementColumns;
}

/**
 * 兼容性导出（保持原有的columns导出）
 */
export const columns = requirementColumns;

/**
 * 项目表单配置
 */
export const formSchema: FormSchema[] = [
  {
    field: 'id',
    label: 'ID',
    component: 'Input',
    show: false,
  },
  {
    field: 'taskType',
    label: '项目类型',
    component: 'Select',
    required: true,
    defaultValue: TaskType.REQUIREMENT,
    componentProps: {
      options: [
        { label: '需求', value: TaskType.REQUIREMENT },
        { label: 'BUG', value: TaskType.BUG },
      ],
    },
  },
  {
    field: 'requirementId',
    label: '需求ID',
    component: 'Input',
    required: true,
    ifShow: ({ values }) => values.taskType === TaskType.REQUIREMENT,
    componentProps: {
      placeholder: '请输入需求ID',
    },
  },
  {
    field: 'bugId',
    label: 'BUG ID',
    component: 'Input',
    required: true,
    ifShow: ({ values }) => values.taskType === TaskType.BUG,
    componentProps: {
      placeholder: '请输入BUG ID',
    },
  },
  {
    field: 'zentaoUrl',
    label: '禅道链接',
    component: 'Input',
    componentProps: {
      placeholder: '请输入禅道链接',
    },
  },
  {
    field: 'uiDesignUrl',
    label: 'UI设计稿链接',
    component: 'Input',
    ifShow: ({ values }) => values.taskType === TaskType.REQUIREMENT,
    componentProps: {
      placeholder: '请输入UI设计稿链接',
    },
  },
  {
    field: 'prototypeUrl',
    label: '原型图链接',
    component: 'Input',
    ifShow: ({ values }) => values.taskType === TaskType.REQUIREMENT,
    componentProps: {
      placeholder: '请输入原型图链接',
    },
  },
  {
    field: 'designDocUrl',
    label: '设计文档链接',
    component: 'Input',
    ifShow: ({ values }) => values.taskType === TaskType.REQUIREMENT,
    componentProps: {
      placeholder: '请输入设计文档链接',
    },
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    defaultValue: ProjectStatus.PLANNING,
    componentProps: {
      options: [
        { label: '规划中', value: ProjectStatus.PLANNING },
        { label: '开发中', value: ProjectStatus.DEVELOPING },
        { label: '测试中', value: ProjectStatus.TESTING },
        { label: '已部署', value: ProjectStatus.DEPLOYED },
        { label: '维护中', value: ProjectStatus.MAINTENANCE },
        { label: '已归档', value: ProjectStatus.ARCHIVED },
      ],
    },
  },
  {
    field: 'startDate',
    label: '开始时间',
    component: 'DatePicker',
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
    },
  },
  {
    field: 'testDate',
    label: '提测时间',
    component: 'DatePicker',
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
    },
  },
  {
    field: 'onlineDate',
    label: '上线时间',
    component: 'DatePicker',
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
    },
  },
  {
    field: 'releaseDate',
    label: '发布时间',
    component: 'DatePicker',
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
    },
  },
  {
    field: 'projectManager',
    label: '项目经理',
    component: 'JSelectUser',
    componentProps: {
      placeholder: '请选择项目经理',
      labelKey: 'realname',
      rowKey: 'username',
    },
  },
  {
    field: 'teamMembers',
    label: '团队成员',
    component: 'JSelectUser',
    componentProps: {
      placeholder: '请选择团队成员',
      labelKey: 'realname',
      rowKey: 'username',
      multiple: true,
    },
  },
  {
    field: 'techStack',
    label: '技术栈',
    component: 'Select',
    componentProps: {
      mode: 'tags',
      placeholder: '请输入技术栈',
      options: [
        { label: 'Vue3', value: 'Vue3' },
        { label: 'React', value: 'React' },
        { label: 'Angular', value: 'Angular' },
        { label: 'Node.js', value: 'Node.js' },
        { label: 'Java', value: 'Java' },
        { label: 'Python', value: 'Python' },
        { label: 'Go', value: 'Go' },
        { label: 'Rust', value: 'Rust' },
        { label: 'TypeScript', value: 'TypeScript' },
        { label: 'JavaScript', value: 'JavaScript' },
      ],
    },
  },
  {
    field: 'developmentMode',
    label: '开发模式',
    component: 'Select',
    required: true,
    defaultValue: DevelopmentMode.L1,
    componentProps: {
      options: [
        { label: 'L1 - 直接下载项目开发', value: DevelopmentMode.L1 },
        { label: 'L2 - 使用模板开发', value: DevelopmentMode.L2 },
        { label: 'L3 - 在线可视化配置', value: DevelopmentMode.L3 },
      ],
    },
  },
  {
    field: 'branchCreateMode',
    label: 'Git分支创建模式',
    component: 'Select',
    defaultValue: BranchCreateMode.MANUAL,
    componentProps: {
      options: [
        { label: '手动创建', value: BranchCreateMode.MANUAL },
        { label: '自动创建', value: BranchCreateMode.AUTO },
      ],
    },
  },
];

/**
 * 项目详情Tab配置
 */
export interface ProjectTabItem {
  key: string;
  name: string;
  component: string;
}

export const projectTabList: ProjectTabItem[] = [
  {
    key: 'basic',
    name: '基本信息',
    component: 'ProjectBasicInfo',
  },
  {
    key: 'relatedApps',
    name: '关联应用',
    component: 'ProjectRelatedApps',
  },
  {
    key: 'gitBranches',
    name: 'Git分支管理',
    component: 'ProjectGitBranches',
  },
  {
    key: 'workflow',
    name: '开发流程',
    component: 'ProjectWorkflow',
  },
  {
    key: 'pipelines',
    name: '流水线管理',
    component: 'PipelineManager',
  },
  {
    key: 'workflow',
    name: '开发流程',
    component: 'ProjectWorkflow',
  },
  {
    key: 'timeline',
    name: '时间节点',
    component: 'ProjectTimeline',
  },
  {
    key: 'members',
    name: '团队成员',
    component: 'ProjectMembers',
  },
  {
    key: 'files',
    name: '文件管理',
    component: 'ProjectFiles',
  },
  {
    key: 'statistics',
    name: '统计分析',
    component: 'ProjectStatistics',
  },
];

/**
 * 分步表单配置
 */
// 基本信息表单配置（创建向导第一步）
export const basicFormSchema: FormSchema[] = [
  {
    field: 'taskType',
    label: '任务类型',
    component: 'Select',
    required: true,
    componentProps: {
      placeholder: '请选择任务类型',
      options: [
        { label: '需求', value: TaskType.REQUIREMENT },
        { label: 'BUG', value: TaskType.BUG },
      ],
    },
    colProps: { lg: 24, md: 24 },
  },
  {
    field: 'requirementId',
    label: '需求ID',
    component: 'Input',
    required: true,
    ifShow: ({ values }) => values.taskType === TaskType.REQUIREMENT,
    componentProps: {
      placeholder: '请输入需求ID',
    },
    colProps: { lg: 24, md: 24 },
  },
  {
    field: 'bugId',
    label: 'BUG ID',
    component: 'Input',
    required: true,
    ifShow: ({ values }) => values.taskType === TaskType.BUG,
    componentProps: {
      placeholder: '请输入BUG ID',
    },
    colProps: { lg: 24, md: 24 },
  },
  {
    field: 'projectName',
    label: '项目名称',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入项目名称',
    },
    colProps: { lg: 24, md: 24 },
  },
  {
    field: 'projectCode',
    label: '项目编码',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入项目编码',
    },
    colProps: { lg: 24, md: 24 },
  },
  {
    field: 'description',
    label: '项目描述',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入项目描述',
      rows: 3,
    },
    colProps: { lg: 24, md: 24 },
  },
];

// 详细配置表单配置（创建向导第二步）
export const detailFormSchema: FormSchema[] = [
  {
    field: 'prototypeUrl',
    label: '需求原型',
    component: 'Input',
    ifShow: ({ values }) => values.taskType === TaskType.REQUIREMENT,
    componentProps: {
      placeholder: '请输入原型链接',
    },
    colProps: { lg: 24, md: 24 },
  },
  {
    field: 'uiUrl',
    label: '需求UI',
    component: 'Input',
    ifShow: ({ values }) => values.taskType === TaskType.REQUIREMENT,
    componentProps: {
      placeholder: '请输入UI链接',
    },
    colProps: { lg: 24, md: 24 },
  },
  {
    field: 'designDocUrl',
    label: '设计文档',
    component: 'Input',
    ifShow: ({ values }) => values.taskType === TaskType.REQUIREMENT,
    componentProps: {
      placeholder: '请输入设计文档链接',
    },
    colProps: { lg: 24, md: 24 },
  },
  {
    field: 'relatedApps',
    label: '关联应用',
    component: 'Select',
    required: true,
    componentProps: {
      mode: 'multiple',
      placeholder: '请选择关联应用',
      options: [], // 动态加载
    },
    colProps: { lg: 24, md: 24 },
  },
  {
    field: 'developers',
    label: '开发人员',
    component: 'Select',
    componentProps: {
      mode: 'multiple',
      placeholder: '请选择开发人员',
      options: [], // 动态加载
    },
    colProps: { lg: 24, md: 24 },
  },
  {
    field: 'priority',
    label: '优先级',
    component: 'Select',
    defaultValue: ProjectPriority.MEDIUM,
    componentProps: {
      options: [
        { label: '低', value: ProjectPriority.LOW },
        { label: '中', value: ProjectPriority.MEDIUM },
        { label: '高', value: ProjectPriority.HIGH },
        { label: '紧急', value: ProjectPriority.URGENT },
      ],
    },
    colProps: { lg: 24, md: 24 },
  },
];

// 开发设置表单配置（创建向导第三步）
export const devFormSchema: FormSchema[] = [
  {
    field: 'developmentMode',
    label: '开发模式',
    component: 'Select',
    required: true,
    defaultValue: DevelopmentMode.L1,
    componentProps: {
      options: [
        { label: 'L1 - 直接开发', value: DevelopmentMode.L1 },
        { label: 'L2 - 模板开发', value: DevelopmentMode.L2 },
        { label: 'L3 - 可视化配置', value: DevelopmentMode.L3 },
      ],
    },
    colProps: { lg: 24, md: 24 },
  },
  {
    field: 'templateId',
    label: '开发模板',
    component: 'Select',
    ifShow: ({ values }) => values.developmentMode === DevelopmentMode.L2,
    componentProps: {
      placeholder: '请选择开发模板',
      options: [], // 动态加载
    },
    colProps: { lg: 24, md: 24 },
  },
  {
    field: 'startTime',
    label: '项目开始时间',
    component: 'DatePicker',
    componentProps: {
      format: 'YYYY-MM-DD',
      placeholder: '请选择开始时间',
    },
    colProps: { lg: 12, md: 24 },
  },
  {
    field: 'testTime',
    label: '项目提测时间',
    component: 'DatePicker',
    componentProps: {
      format: 'YYYY-MM-DD',
      placeholder: '请选择提测时间',
    },
    colProps: { lg: 12, md: 24 },
  },
  {
    field: 'onlineTime',
    label: '项目上线时间',
    component: 'DatePicker',
    componentProps: {
      format: 'YYYY-MM-DD',
      placeholder: '请选择上线时间',
    },
    colProps: { lg: 12, md: 24 },
  },
  {
    field: 'releaseTime',
    label: '项目发布时间',
    component: 'DatePicker',
    componentProps: {
      format: 'YYYY-MM-DD',
      placeholder: '请选择发布时间',
    },
    colProps: { lg: 12, md: 24 },
  },
];

/**
 * 项目详情页面标签页配置
 * 为了兼容ProjectDetail.vue中的导入，提供别名导出
 */
export const projectDetailTabs = [
  {
    key: 'basic',
    name: '基本信息',
    component: 'ProjectBasicInfo',
  },
  {
    key: 'relatedApps',
    name: '关联应用',
    component: 'ProjectRelatedApps',
  },
  {
    key: 'gitBranches',
    name: 'Git分支管理',
    component: 'ProjectGitBranches',
  },
  {
    key: 'workflow',
    name: '开发流程',
    component: 'ProjectWorkflow',
  },
  {
    key: 'timeline',
    name: '时间节点',
    component: 'ProjectTimeline',
  },
  {
    key: 'members',
    name: '团队成员',
    component: 'ProjectMembers',
  },
  {
    key: 'files',
    name: '文件管理',
    component: 'ProjectFiles',
  },
  {
    key: 'statistics',
    name: '统计分析',
    component: 'ProjectStatistics',
  },
];

/**
 * 关联应用表单配置
 */
export const relatedAppFormSchema: FormSchema[] = [
  {
    field: 'id',
    label: 'ID',
    component: 'Input',
    show: false,
  },
  {
    field: 'projectId',
    label: '项目ID',
    component: 'Input',
    show: false,
  },
  {
    field: 'appName',
    label: '应用名称',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入应用名称',
    },
  },
  {
    field: 'appCode',
    label: '应用编码',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入应用编码',
    },
  },
  {
    field: 'appType',
    label: '应用类型',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: 'Web应用', value: 'web' },
        { label: '移动应用', value: 'mobile' },
        { label: 'API服务', value: 'api' },
        { label: '桌面应用', value: 'desktop' },
        { label: '小程序', value: 'miniprogram' },
      ],
    },
  },
  {
    field: 'gitUrl',
    label: 'Git仓库地址',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入Git仓库地址',
    },
  },
  {
    field: 'developer',
    label: '开发负责人',
    component: 'JSelectUser',
    componentProps: {
      placeholder: '请选择开发负责人',
      labelKey: 'realname',
      rowKey: 'username',
    },
  },
  {
    field: 'tester',
    label: '测试负责人',
    component: 'JSelectUser',
    componentProps: {
      placeholder: '请选择测试负责人',
      labelKey: 'realname',
      rowKey: 'username',
    },
  },
  {
    field: 'status',
    label: '应用状态',
    component: 'Select',
    defaultValue: 'development',
    componentProps: {
      options: [
        { label: '开发中', value: 'development' },
        { label: '测试中', value: 'testing' },
        { label: '已上线', value: 'production' },
        { label: '维护中', value: 'maintenance' },
      ],
    },
  },
  {
    field: 'pipelineUrl',
    label: '流水线地址',
    component: 'Input',
    componentProps: {
      placeholder: '请输入流水线地址',
    },
  },
  {
    field: 'description',
    label: '应用描述',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
      maxlength: 200,
      showCount: true,
      placeholder: '请输入应用描述',
    },
  },
];

/**
 * 时间节点表单配置
 */
export const timelineFormSchema: FormSchema[] = [
  {
    field: 'id',
    label: 'ID',
    component: 'Input',
    show: false,
  },
  {
    field: 'projectId',
    label: '项目ID',
    component: 'Input',
    show: false,
  },
  {
    field: 'title',
    label: '节点名称',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入节点名称',
    },
  },
  {
    field: 'description',
    label: '节点描述',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
      maxlength: 200,
      showCount: true,
      placeholder: '请输入节点描述',
    },
  },
  {
    field: 'planTime',
    label: '计划时间',
    component: 'DatePicker',
    required: true,
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请选择计划时间',
    },
  },
  {
    field: 'actualTime',
    label: '实际时间',
    component: 'DatePicker',
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请选择实际时间',
    },
  },
  {
    field: 'owner',
    label: '负责人',
    component: 'JSelectUser',
    required: true,
    componentProps: {
      placeholder: '请选择负责人',
      labelKey: 'realname',
      rowKey: 'username',
    },
  },
  {
    field: 'status',
    label: '节点状态',
    component: 'Select',
    defaultValue: 'pending',
    componentProps: {
      options: [
        { label: '待开始', value: 'pending' },
        { label: '进行中', value: 'in_progress' },
        { label: '已完成', value: 'completed' },
        { label: '已延期', value: 'delayed' },
      ],
    },
  },
  {
    field: 'priority',
    label: '优先级',
    component: 'Select',
    defaultValue: 'medium',
    componentProps: {
      options: [
        { label: '低', value: 'low' },
        { label: '中', value: 'medium' },
        { label: '高', value: 'high' },
        { label: '紧急', value: 'urgent' },
      ],
    },
  },
];