import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

// 配置类型枚举
export enum ConfigType {
  PIPELINE = 'pipeline',
  TRACKING = 'tracking',
  CODE_REVIEW = 'code_review',
}

// 配置状态枚举
export enum ConfigStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  DRAFT = 'draft',
}

// 环境类型枚举
export enum EnvironmentType {
  DEV = 'dev',
  TEST = 'test',
  STAGING = 'staging',
  PROD = 'prod',
}

// 配置模型接口
export interface ConfigModel {
  id?: string;
  name: string;
  type: ConfigType;
  status: ConfigStatus;
  environment: EnvironmentType;
  description?: string;
  config: any;
  appId: string;
  createdBy?: string;
  createdTime?: string;
  updatedBy?: string;
  updatedTime?: string;
}

// 流水线配置模型
export interface PipelineConfig {
  stages: PipelineStage[];
  triggers: PipelineTrigger[];
  variables: PipelineVariable[];
  notifications: PipelineNotification[];
}

export interface PipelineStage {
  id: string;
  name: string;
  type: 'build' | 'test' | 'deploy' | 'approval';
  script?: string;
  image?: string;
  environment?: string;
  dependencies?: string[];
  timeout?: number;
  retryCount?: number;
}

export interface PipelineTrigger {
  type: 'push' | 'merge_request' | 'schedule' | 'manual';
  branches?: string[];
  schedule?: string;
  conditions?: any;
}

export interface PipelineVariable {
  key: string;
  value: string;
  type: 'env' | 'file';
  protected: boolean;
  masked: boolean;
}

export interface PipelineNotification {
  type: 'email' | 'webhook' | 'slack';
  recipients: string[];
  events: string[];
  template?: string;
}

// 埋点配置模型
export interface TrackingConfig {
  events: TrackingEvent[];
  properties: TrackingProperty[];
  filters: TrackingFilter[];
  sampling: TrackingSampling;
}

export interface TrackingEvent {
  id: string;
  name: string;
  category: string;
  description?: string;
  properties: string[];
  enabled: boolean;
}

export interface TrackingProperty {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  required: boolean;
  description?: string;
  defaultValue?: any;
}

export interface TrackingFilter {
  type: 'include' | 'exclude';
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface TrackingSampling {
  enabled: boolean;
  rate: number;
  strategy: 'random' | 'user_based' | 'session_based';
}

// 代码审查配置模型
export interface CodeReviewConfig {
  rules: CodeReviewRule[];
  reviewers: CodeReviewer[];
  approvals: CodeApproval;
  automation: CodeAutomation;
}

export interface CodeReviewRule {
  id: string;
  name: string;
  type: 'quality' | 'security' | 'performance' | 'style';
  severity: 'error' | 'warning' | 'info';
  pattern?: string;
  message: string;
  enabled: boolean;
}

export interface CodeReviewer {
  userId: string;
  username: string;
  role: 'required' | 'optional' | 'owner';
  expertise: string[];
}

export interface CodeApproval {
  required: number;
  dismissStale: boolean;
  requireCodeOwner: boolean;
  restrictPush: boolean;
}

export interface CodeAutomation {
  autoAssign: boolean;
  autoMerge: boolean;
  autoTest: boolean;
  autoFormat: boolean;
}

// 配置搜索表单配置
export const configSearchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '配置名称',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'type',
    label: '配置类型',
    component: 'Select',
    componentProps: {
      options: [
        { label: '流水线配置', value: ConfigType.PIPELINE },
        { label: '埋点配置', value: ConfigType.TRACKING },
        { label: '代码审查配置', value: ConfigType.CODE_REVIEW },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '启用', value: ConfigStatus.ENABLED },
        { label: '禁用', value: ConfigStatus.DISABLED },
        { label: '草稿', value: ConfigStatus.DRAFT },
      ],
    },
    colProps: { span: 8 },
  },
];

// 配置表格列配置
export const configColumns: BasicColumn[] = [
  {
    title: '配置名称',
    dataIndex: 'name',
    width: 200,
  },
  {
    title: '配置类型',
    dataIndex: 'type',
    width: 120,
    customRender: ({ record }) => {
      const typeMap = {
        [ConfigType.PIPELINE]: { text: '流水线配置', color: 'blue' },
        [ConfigType.TRACKING]: { text: '埋点配置', color: 'green' },
        [ConfigType.CODE_REVIEW]: { text: '代码审查配置', color: 'purple' },
      };
      const type = typeMap[record.type];
      if (!type) {
        return h(Tag, { color: 'default' }, () => record.type || '未知类型');
      }
      return h(Tag, { color: type.color }, () => type.text);
    },
  },
  {
    title: '环境',
    dataIndex: 'environment',
    width: 100,
    customRender: ({ record }) => {
      const envMap = {
        [EnvironmentType.DEV]: { text: '开发', color: 'default' },
        [EnvironmentType.TEST]: { text: '测试', color: 'orange' },
        [EnvironmentType.STAGING]: { text: '预发', color: 'cyan' },
        [EnvironmentType.PROD]: { text: '生产', color: 'red' },
      };
      const env = envMap[record.environment];
      if (!env) {
        return h(Tag, { color: 'default' }, () => record.environment || '未知环境');
      }
      return h(Tag, { color: env.color }, () => env.text);
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    customRender: ({ record }) => {
      const statusMap = {
        [ConfigStatus.ENABLED]: { text: '启用', color: 'success' },
        [ConfigStatus.DISABLED]: { text: '禁用', color: 'error' },
        [ConfigStatus.DRAFT]: { text: '草稿', color: 'warning' },
      };
      const status = statusMap[record.status];
      if (!status) {
        return h(Tag, { color: 'default' }, () => record.status || '未知状态');
      }
      return h(Tag, { color: status.color }, () => status.text);
    },
  },
  {
    title: '描述',
    dataIndex: 'description',
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createdTime',
    width: 180,
  },
];

// 配置表单配置
export const configFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '配置名称',
    component: 'Input',
    required: true,
  },
  {
    field: 'type',
    label: '配置类型',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '流水线配置', value: ConfigType.PIPELINE },
        { label: '埋点配置', value: ConfigType.TRACKING },
        { label: '代码审查配置', value: ConfigType.CODE_REVIEW },
      ],
    },
  },
  {
    field: 'environment',
    label: '环境',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '开发环境', value: EnvironmentType.DEV },
        { label: '测试环境', value: EnvironmentType.TEST },
        { label: '预发环境', value: EnvironmentType.STAGING },
        { label: '生产环境', value: EnvironmentType.PROD },
      ],
    },
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '启用', value: ConfigStatus.ENABLED },
        { label: '禁用', value: ConfigStatus.DISABLED },
        { label: '草稿', value: ConfigStatus.DRAFT },
      ],
    },
  },
  {
    field: 'description',
    label: '描述',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
    },
  },
];

// 配置详情Tab配置
export const configDetailTabs = [
  {
    key: 'basic',
    tab: '基本信息',
    component: 'ConfigBasicInfo',
  },
  {
    key: 'content',
    tab: '配置内容',
    component: 'ConfigContent',
  },
  {
    key: 'history',
    tab: '变更历史',
    component: 'ConfigHistory',
  },
  {
    key: 'preview',
    tab: '配置预览',
    component: 'ConfigPreview',
  },
];