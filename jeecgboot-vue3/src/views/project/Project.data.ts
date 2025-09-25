import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';
import { getAppList, getUserList } from './Project.api';

/**
 * 项目类型枚举
 */
export enum ProjectType {
  REQUIREMENT = 'requirement', // 需求
  BUG = 'bug', // BUG
}

/**
 * 项目状态枚举
 */
export enum ProjectStatus {
  PLANNING = 'planning', // 规划中
  DEVELOPING = 'developing', // 开发中
  TESTING = 'testing', // 测试中
  ONLINE = 'online', // 已上线
  RELEASED = 'released', // 已发布
  CLOSED = 'closed', // 已关闭
}

/**
 * 项目模型接口
 */
export interface ProjectModel {
  id?: string;
  projectType: ProjectType; // 项目类型（需求/BUG）
  requirementId?: string; // 需求ID
  bugId?: string; // BUG ID
  title: string; // 项目标题
  description?: string; // 项目描述
  relatedAppId: string; // 关联应用ID
  relatedAppName?: string; // 关联应用名称
  developerId: string; // 开发人员ID
  developerName?: string; // 开发人员姓名
  designLinks: DesignLink[]; // 原型/设计稿链接
  startTime?: string; // 开始时间
  testTime?: string; // 提测时间
  onlineTime?: string; // 上线时间
  releaseTime?: string; // 发布时间
  status: ProjectStatus; // 项目状态
  gitBranch?: string; // Git分支名称
  appConfig?: AppConfig; // 应用配置
  pipelineStatus?: PipelineStatus; // 流水线状态
  createTime?: string; // 创建时间
  updateTime?: string; // 更新时间
}

/**
 * 设计链接接口
 */
export interface DesignLink {
  id?: string;
  title: string; // 链接标题
  url: string; // 链接地址
  type: 'prototype' | 'design'; // 链接类型：原型/设计稿
}

/**
 * 应用配置接口
 */
export interface AppConfig {
  trackingConfig?: TrackingConfig; // 埋点配置
  pipelineConfig?: PipelineConfig; // 流水线配置
  codeReviewConfig?: CodeReviewConfig; // 代码审核配置
}

/**
 * 埋点配置接口
 */
export interface TrackingConfig {
  enabled: boolean; // 是否启用埋点
  trackingId?: string; // 埋点ID
  events: TrackingEvent[]; // 埋点事件
}

/**
 * 埋点事件接口
 */
export interface TrackingEvent {
  name: string; // 事件名称
  description?: string; // 事件描述
  parameters: string[]; // 事件参数
}

/**
 * 流水线配置接口
 */
export interface PipelineConfig {
  enabled: boolean; // 是否启用流水线
  stages: PipelineStage[]; // 流水线阶段
  autoTrigger: boolean; // 是否自动触发
}

/**
 * 流水线阶段接口
 */
export interface PipelineStage {
  name: string; // 阶段名称
  type: 'build' | 'test' | 'deploy' | 'review'; // 阶段类型
  enabled: boolean; // 是否启用
  config: Record<string, any>; // 阶段配置
}

/**
 * 代码审核配置接口
 */
export interface CodeReviewConfig {
  enabled: boolean; // 是否启用代码审核
  reviewers: string[]; // 审核人员ID列表
  requiredApprovals: number; // 需要的审批数量
  autoMerge: boolean; // 是否自动合并
}

/**
 * 流水线状态接口
 */
export interface PipelineStatus {
  id?: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled'; // 流水线状态
  currentStage?: string; // 当前阶段
  progress: number; // 进度百分比
  startTime?: string; // 开始时间
  endTime?: string; // 结束时间
  logs?: PipelineLog[]; // 执行日志
}

/**
 * 流水线日志接口
 */
export interface PipelineLog {
  timestamp: string; // 时间戳
  level: 'info' | 'warn' | 'error'; // 日志级别
  message: string; // 日志消息
  stage?: string; // 所属阶段
}

/**
 * 项目列表表格列配置
 */
export const columns: BasicColumn[] = [
  {
    title: '项目类型',
    dataIndex: 'projectType',
    width: 100,
    customRender: ({ record }) => {
      const type = record.projectType;
      const color = type === ProjectType.REQUIREMENT ? 'blue' : 'red';
      const text = type === ProjectType.REQUIREMENT ? '需求' : 'BUG';
      return h(Tag, { color }, () => text);
    },
  },
  {
    title: '需求/BUG ID',
    dataIndex: 'itemId',
    width: 120,
    customRender: ({ record }) => {
      return record.requirementId || record.bugId || '-';
    },
  },
  {
    title: '项目标题',
    dataIndex: 'title',
    width: 200,
  },
  {
    title: '关联应用',
    dataIndex: 'relatedAppName',
    width: 150,
  },
  {
    title: '开发人员',
    dataIndex: 'developerName',
    width: 120,
  },
  {
    title: '项目状态',
    dataIndex: 'status',
    width: 100,
    customRender: ({ record }) => {
      const status = record.status;
      const statusConfig = {
        [ProjectStatus.PLANNING]: { color: 'default', text: '规划中' },
        [ProjectStatus.DEVELOPING]: { color: 'processing', text: '开发中' },
        [ProjectStatus.TESTING]: { color: 'warning', text: '测试中' },
        [ProjectStatus.ONLINE]: { color: 'success', text: '已上线' },
        [ProjectStatus.RELEASED]: { color: 'success', text: '已发布' },
        [ProjectStatus.CLOSED]: { color: 'default', text: '已关闭' },
      };
      const config = statusConfig[status] || { color: 'default', text: status };
      return h(Tag, { color: config.color }, () => config.text);
    },
  },
  {
    title: 'Git分支',
    dataIndex: 'gitBranch',
    width: 150,
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    width: 150,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 150,
  },
];

/**
 * 搜索表单配置
 */
export const searchFormSchema: FormSchema[] = [
  {
    field: 'projectType',
    label: '项目类型',
    component: 'Select',
    componentProps: {
      options: [
        { label: '需求', value: ProjectType.REQUIREMENT },
        { label: 'BUG', value: ProjectType.BUG },
      ],
    },
    colProps: { span: 6 },
  },
  {
    field: 'status',
    label: '项目状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '规划中', value: ProjectStatus.PLANNING },
        { label: '开发中', value: ProjectStatus.DEVELOPING },
        { label: '测试中', value: ProjectStatus.TESTING },
        { label: '已上线', value: ProjectStatus.ONLINE },
        { label: '已发布', value: ProjectStatus.RELEASED },
        { label: '已关闭', value: ProjectStatus.CLOSED },
      ],
    },
    colProps: { span: 6 },
  },
  {
    field: 'relatedAppId',
    label: '关联应用',
    component: 'ApiSelect',
    componentProps: {
      api: () => Promise.resolve([]), // 这里需要调用实际的应用列表API
      labelField: 'name',
      valueField: 'id',
    },
    colProps: { span: 6 },
  },
  {
    field: 'developerId',
    label: '开发人员',
    component: 'ApiSelect',
    componentProps: {
      api: () => Promise.resolve([]), // 这里需要调用实际的人员列表API
      labelField: 'name',
      valueField: 'id',
    },
    colProps: { span: 6 },
  },
];

/**
 * 项目表单配置
 */
export const formSchema: FormSchema[] = [
  {
    field: 'projectType',
    label: '项目类型',
    component: 'RadioButtonGroup',
    required: true,
    componentProps: {
      options: [
        { label: '需求', value: ProjectType.REQUIREMENT },
        { label: 'BUG', value: ProjectType.BUG },
      ],
    },
    colProps: { span: 24 },
  },
  {
    field: 'requirementId',
    label: '需求ID',
    component: 'Input',
    required: true,
    show: ({ values }) => values.projectType === ProjectType.REQUIREMENT,
    colProps: { span: 12 },
  },
  {
    field: 'bugId',
    label: 'BUG ID',
    component: 'Input',
    required: true,
    show: ({ values }) => values.projectType === ProjectType.BUG,
    colProps: { span: 12 },
  },
  {
    field: 'title',
    label: '项目标题',
    component: 'Input',
    required: true,
    colProps: { span: 12 },
  },
  {
    field: 'description',
    label: '项目描述',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
    },
    colProps: { span: 24 },
  },
  {
    field: 'relatedAppId',
    label: '关联应用',
    component: 'ApiSelect',
    required: true,
    componentProps: {
      api: () => Promise.resolve([]), // 这里需要调用实际的应用列表API
      labelField: 'name',
      valueField: 'id',
    },
    colProps: { span: 12 },
  },
  {
    field: 'developerId',
    label: '开发人员',
    component: 'ApiSelect',
    required: true,
    componentProps: {
      api: () => Promise.resolve([]), // 这里需要调用实际的人员列表API
      labelField: 'name',
      valueField: 'id',
    },
    colProps: { span: 12 },
  },
  {
    field: 'designLinks',
    label: '原型/设计稿链接',
    component: 'Input',
    slot: 'designLinks',
    colProps: { span: 24 },
  },
  {
    field: 'startTime',
    label: '开始时间',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
    },
    colProps: { span: 12 },
  },
  {
    field: 'testTime',
    label: '提测时间',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
    },
    colProps: { span: 12 },
  },
  {
    field: 'onlineTime',
    label: '上线时间',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
    },
    colProps: { span: 12 },
  },
  {
    field: 'releaseTime',
    label: '发布时间',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
    },
    colProps: { span: 12 },
  },
  {
    field: 'status',
    label: '项目状态',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '规划中', value: ProjectStatus.PLANNING },
        { label: '开发中', value: ProjectStatus.DEVELOPING },
        { label: '测试中', value: ProjectStatus.TESTING },
        { label: '已上线', value: ProjectStatus.ONLINE },
        { label: '已发布', value: ProjectStatus.RELEASED },
        { label: '已关闭', value: ProjectStatus.CLOSED },
      ],
    },
    colProps: { span: 12 },
  },
];

/**
 * 项目表单数据接口
 */
export interface ProjectFormData {
  id?: string;
  type: ProjectType;
  requirementId?: string;
  bugId?: string;
  title: string;
  description?: string;
  appId: string;
  developerId: string;
  status: ProjectStatus;
  priority: 'low' | 'medium' | 'high';
  gitBranch?: string;
  designLinks: DesignLink[];
  startTime?: string;
  testTime?: string;
  onlineTime?: string;
  releaseTime?: string;
  remark?: string;
}

/**
 * 分步表单 - 第一步：基本信息
 */
export const step1Schemas: FormSchema[] = [
  {
    field: 'type',
    label: '项目类型',
    component: 'RadioButtonGroup',
    required: true,
    componentProps: {
      options: [
        { label: '需求', value: ProjectType.REQUIREMENT },
        { label: 'BUG', value: ProjectType.BUG },
      ],
    },
    colProps: { span: 24 },
  },
  {
    field: 'requirementId',
    label: '需求ID',
    component: 'Input',
    required: true,
    show: ({ values }) => values.type === ProjectType.REQUIREMENT,
    colProps: { span: 12 },
  },
  {
    field: 'bugId',
    label: 'BUG ID',
    component: 'Input',
    required: true,
    show: ({ values }) => values.type === ProjectType.BUG,
    colProps: { span: 12 },
  },
  {
    field: 'title',
    label: '项目标题',
    component: 'Input',
    required: true,
    colProps: { span: 12 },
  },
  {
    field: 'priority',
    label: '优先级',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '低', value: 'low' },
        { label: '中', value: 'medium' },
        { label: '高', value: 'high' },
      ],
    },
    colProps: { span: 12 },
  },
  {
    field: 'description',
    label: '项目描述',
    component: 'InputTextArea',
    componentProps: {
      rows: 4,
      placeholder: '请详细描述项目需求或BUG情况...',
    },
    colProps: { span: 24 },
  },
];

/**
 * 分步表单 - 第二步：关联配置
 */
export const step2Schemas: FormSchema[] = [
  {
    field: 'appId',
    label: '关联应用',
    component: 'ApiSelect',
    required: true,
    componentProps: {
      api: getAppList, // 调用应用列表API
      labelField: 'appName',
      valueField: 'id',
      placeholder: '请选择关联的应用',
      resultField: 'records', // 从分页数据中提取 records 字段
    },
    colProps: { span: 12 },
  },
  {
    field: 'developerId',
    label: '开发人员',
    component: 'ApiSelect',
    required: true,
    componentProps: {
      api: getUserList, // 调用用户列表API
      labelField: 'realname',
      valueField: 'id',
      placeholder: '请选择开发人员',
      resultField: 'records', // 从分页数据中提取 records 字段
    },
    colProps: { span: 12 },
  },
  {
    field: 'designLinks',
    label: '原型/设计稿链接',
    component: 'Input',
    slot: 'designLinks',
    helpMessage: '可添加多个原型或设计稿链接',
    colProps: { span: 24 },
  },
  {
    field: 'status',
    label: '项目状态',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '规划中', value: ProjectStatus.PLANNING },
        { label: '开发中', value: ProjectStatus.DEVELOPING },
        { label: '测试中', value: ProjectStatus.TESTING },
        { label: '已上线', value: ProjectStatus.ONLINE },
        { label: '已发布', value: ProjectStatus.RELEASED },
        { label: '已关闭', value: ProjectStatus.CLOSED },
      ],
    },
    colProps: { span: 12 },
  },
];

/**
 * 分步表单 - 第三步：技术配置
 */
export const step3Schemas: FormSchema[] = [
  {
    field: 'startTime',
    label: '开始时间',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      placeholder: '请选择开始时间',
    },
    colProps: { span: 12 },
  },
  {
    field: 'testTime',
    label: '提测时间',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      placeholder: '请选择提测时间',
    },
    colProps: { span: 12 },
  },
  {
    field: 'onlineTime',
    label: '上线时间',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      placeholder: '请选择上线时间',
    },
    colProps: { span: 12 },
  },
  {
    field: 'releaseTime',
    label: '发布时间',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      placeholder: '请选择发布时间',
    },
    colProps: { span: 12 },
  },
  {
    field: 'gitBranch',
    label: 'Git分支',
    component: 'Input',
    componentProps: {
      placeholder: '系统将根据项目类型自动生成分支名称',
      disabled: true,
    },
    helpMessage: '分支名称将根据项目类型和ID自动生成',
    colProps: { span: 12 },
  },
  {
    field: 'remark',
    label: '备注信息',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
      placeholder: '请输入其他备注信息...',
    },
    colProps: { span: 24 },
  },
];

/**
 * 设计链接表单配置
 */
export const designLinkFormSchema: FormSchema[] = [
  {
    field: 'title',
    label: '链接标题',
    component: 'Input',
    required: true,
    colProps: { span: 12 },
  },
  {
    field: 'type',
    label: '链接类型',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '原型', value: 'prototype' },
        { label: '设计稿', value: 'design' },
      ],
    },
    colProps: { span: 12 },
  },
  {
    field: 'url',
    label: '链接地址',
    component: 'Input',
    required: true,
    colProps: { span: 24 },
  },
];