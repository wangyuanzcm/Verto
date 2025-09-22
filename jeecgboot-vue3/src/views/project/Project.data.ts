import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { rules } from '/@/utils/helper/validator';
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
  WEB = 'web',
  MOBILE = 'mobile',
  API = 'api',
  DESKTOP = 'desktop',
  LIBRARY = 'library',
}

/**
 * 项目数据接口
 */
export interface ProjectModel {
  id: string;
  projectName: string;
  projectCode: string;
  projectDescription?: string;
  projectType: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  appId: string;
  appName?: string;
  gitUrl?: string;
  gitBranch?: string;
  version?: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  teamMembers?: string[];
  teamMembersText?: string;
  projectManager?: string;
  projectManagerText?: string;
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
 * 项目搜索表单配置
 */
export const searchFormSchema: FormSchema[] = [
  {
    field: 'projectName',
    label: '项目名称',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'projectCode',
    label: '项目编码',
    component: 'Input',
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
        { label: '已部署', value: ProjectStatus.DEPLOYED },
        { label: '维护中', value: ProjectStatus.MAINTENANCE },
        { label: '已归档', value: ProjectStatus.ARCHIVED },
      ],
    },
    colProps: { span: 6 },
  },
  {
    field: 'projectType',
    label: '项目类型',
    component: 'Select',
    componentProps: {
      options: [
        { label: 'Web应用', value: ProjectType.WEB },
        { label: '移动应用', value: ProjectType.MOBILE },
        { label: 'API服务', value: ProjectType.API },
        { label: '桌面应用', value: ProjectType.DESKTOP },
        { label: '组件库', value: ProjectType.LIBRARY },
      ],
    },
    colProps: { span: 6 },
  },
];

/**
 * 项目表格列配置
 */
export const columns: BasicColumn[] = [
  {
    title: '项目名称',
    dataIndex: 'projectName',
    width: 200,
    fixed: 'left',
  },
  {
    title: '项目编码',
    dataIndex: 'projectCode',
    width: 150,
  },
  {
    title: '项目类型',
    dataIndex: 'projectType',
    width: 120,
    customRender: ({ record }) => {
      const typeMap = {
        [ProjectType.WEB]: { text: 'Web应用', color: 'blue' },
        [ProjectType.MOBILE]: { text: '移动应用', color: 'green' },
        [ProjectType.API]: { text: 'API服务', color: 'orange' },
        [ProjectType.DESKTOP]: { text: '桌面应用', color: 'purple' },
        [ProjectType.LIBRARY]: { text: '组件库', color: 'cyan' },
      };
      const type = typeMap[record.projectType];
      return render.renderTag(type?.text || record.projectType, type?.color);
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
    title: '优先级',
    dataIndex: 'priority',
    width: 100,
    customRender: ({ record }) => {
      const priorityMap = {
        [ProjectPriority.LOW]: { text: '低', color: 'default' },
        [ProjectPriority.MEDIUM]: { text: '中', color: 'blue' },
        [ProjectPriority.HIGH]: { text: '高', color: 'orange' },
        [ProjectPriority.URGENT]: { text: '紧急', color: 'red' },
      };
      const priority = priorityMap[record.priority];
      return render.renderTag(priority?.text || record.priority, priority?.color);
    },
  },
  {
    title: '进度',
    dataIndex: 'progress',
    width: 120,
    customRender: ({ record }) => {
      return render.renderProgress(record.progress);
    },
  },
  {
    title: '项目经理',
    dataIndex: 'projectManagerText',
    width: 120,
  },
  {
    title: '团队成员',
    dataIndex: 'teamMembersText',
    width: 200,
    ellipsis: true,
  },
  {
    title: '开始时间',
    dataIndex: 'startDate',
    width: 120,
    customRender: ({ record }) => {
      return render.renderDate(record.startDate);
    },
  },
  {
    title: '预计结束',
    dataIndex: 'endDate',
    width: 120,
    customRender: ({ record }) => {
      return render.renderDate(record.endDate);
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 150,
    customRender: ({ record }) => {
      return render.renderDate(record.createTime);
    },
  },
];

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
    field: 'projectName',
    label: '项目名称',
    component: 'Input',
    required: true,
    rules: rules.duplicateCheckRule('/project/duplicateCheck', 'projectName', 'id'),
  },
  {
    field: 'projectCode',
    label: '项目编码',
    component: 'Input',
    required: true,
    rules: rules.duplicateCheckRule('/project/duplicateCheck', 'projectCode', 'id'),
  },
  {
    field: 'projectDescription',
    label: '项目描述',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
      maxlength: 500,
      showCount: true,
    },
  },
  {
    field: 'projectType',
    label: '项目类型',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: 'Web应用', value: ProjectType.WEB },
        { label: '移动应用', value: ProjectType.MOBILE },
        { label: 'API服务', value: ProjectType.API },
        { label: '桌面应用', value: ProjectType.DESKTOP },
        { label: '组件库', value: ProjectType.LIBRARY },
      ],
    },
  },
  {
    field: 'appId',
    label: '所属应用',
    component: 'JSelectInput',
    required: true,
    componentProps: {
      placeholder: '请选择所属应用',
      dictOptions: [],
    },
  },
  {
    field: 'status',
    label: '项目状态',
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
  },
  {
    field: 'progress',
    label: '项目进度',
    component: 'InputNumber',
    componentProps: {
      min: 0,
      max: 100,
      formatter: (value: number) => `${value}%`,
      parser: (value: string) => value.replace('%', ''),
    },
    defaultValue: 0,
  },
  {
    field: 'gitUrl',
    label: 'Git仓库地址',
    component: 'Input',
    componentProps: {
      placeholder: '请输入Git仓库地址',
    },
  },
  {
    field: 'gitBranch',
    label: 'Git分支',
    component: 'Input',
    componentProps: {
      placeholder: '请输入Git分支名称',
    },
    defaultValue: 'main',
  },
  {
    field: 'version',
    label: '版本号',
    component: 'Input',
    componentProps: {
      placeholder: '请输入版本号',
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
    field: 'endDate',
    label: '预计结束时间',
    component: 'DatePicker',
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
    },
  },
  {
    field: 'estimatedHours',
    label: '预计工时(小时)',
    component: 'InputNumber',
    componentProps: {
      min: 0,
      precision: 1,
    },
  },
  {
    field: 'actualHours',
    label: '实际工时(小时)',
    component: 'InputNumber',
    componentProps: {
      min: 0,
      precision: 1,
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
    key: 'tasks',
    name: '任务管理',
    component: 'ProjectTasks',
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
    key: 'deployment',
    name: '部署配置',
    component: 'ProjectDeployment',
  },
  {
    key: 'statistics',
    name: '统计分析',
    component: 'ProjectStatistics',
  },
];

/**
 * 项目详情页面标签页配置
 * 为了兼容ProjectDetail.vue中的导入，提供别名导出
 */
export const projectDetailTabs = projectTabList;