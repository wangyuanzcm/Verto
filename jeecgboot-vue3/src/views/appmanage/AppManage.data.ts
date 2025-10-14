import { FormSchema } from '@/components/Form';
import { BasicColumn } from '@/components/Table';

/**
 * 应用管理表单配置
 */
export const formSchema: FormSchema[] = [
  {
    label: 'id',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '项目来源',
    field: 'projectSource',
    required: true,
    component: 'RadioGroup',
    componentProps: {
      options: [
        { label: '添加已有项目', value: 'existing' },
        { label: '创建新项目', value: 'new' },
      ],
    },
    defaultValue: 'existing',
  },
  {
    label: '应用简称',
    field: 'appName',
    required: true,
    component: 'Input',
    componentProps: {
      placeholder: '请输入应用简称',
      showCount: true,
      maxlength: 50,
    },
  },
  {
    label: '应用描述',
    field: 'appDescription',
    required: true,
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入应用描述',
      rows: 4,
      showCount: true,
      maxlength: 500,
    },
  },
  {
    label: 'Git地址',
    field: 'gitUrl',
    required: true,
    component: 'Input',
    slot: 'gitUrl',
    ifShow: ({ values }) => values?.projectSource === 'existing',
    componentProps: {
      placeholder: '请选择或搜索已有仓库',
    },
  },
  {
    label: 'Git前缀',
    field: 'gitPrefix',
    component: 'Input',
    slot: 'gitPrefix',
    ifShow: ({ values }) => values?.projectSource === 'new',
    componentProps: {
      placeholder: '已根据当前用户权限自动设置',
      disabled: true,
    },
  },
  {
    label: '项目类型路径',
    field: 'appPath',
    component: 'Select',
    ifShow: ({ values }) => values?.projectSource === 'new',
    componentProps: {
      options: [
        { label: 'web', value: 'web' },
        { label: 'h5', value: 'h5' },
        { label: 'miniprogram', value: 'miniprogram' },
      ],
      placeholder: '请选择项目类型路径',
    },
    required: true,
  },
  {
    label: '项目名称',
    field: 'repoName',
    component: 'Input',
    ifShow: ({ values }) => values?.projectSource === 'new',
    componentProps: {
      placeholder: '仅填写项目名称，例如 user-center',
      showCount: true,
      maxlength: 100,
    },
    rules: [
      {
        pattern: /^[a-zA-Z0-9-_]+$/,
        message: '仅允许字母、数字、-、_ 组成的项目名称',
      },
    ],
    required: true,
  },
  {
    label: '仓库可见性',
    field: 'repoVisibility',
    component: 'Select',
    componentProps: {
      options: [
        { label: '私有', value: 'private' },
        { label: '公开', value: 'public' },
      ],
      placeholder: '请选择仓库可见性',
    },
    ifShow: ({ values }) => values?.projectSource === 'new',
    defaultValue: 'private',
  },
  {
    label: 'Git访问令牌',
    field: 'gitToken',
    component: 'InputPassword',
    componentProps: {
      placeholder: '可选：用于创建仓库的令牌（GitHub需repo权限）',
    },
    ifShow: ({ values }) => values?.projectSource === 'new',
    required: false,
  },
  {
    label: '所属领域',
    field: 'domain',
    required: true,
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'app_domain',
      placeholder: '请选择所属领域',
      mode: undefined, // 单选
    },
  },
  {
    label: '应用负责人',
    field: 'managers',
    required: true,
    component: 'Input', // 使用slot方式，这里改为Input占位
    slot: 'managers', // 指定使用slot
    componentProps: {
      placeholder: '请选择应用负责人',
    },
  },
];

/**
 * 搜索表单配置
 */
export const searchFormSchema: FormSchema[] = [
  {
    label: '应用简称',
    field: 'appName',
    component: 'Input',
    componentProps: {
      placeholder: '请输入应用简称',
    },
  },
  {
    label: '所属领域',
    field: 'domain',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'app_domain',
      placeholder: '请选择所属领域',
    },
  },
];

/**
 * 表格列配置
 */
export const columns: BasicColumn[] = [
  {
    title: '应用简称',
    dataIndex: 'appName',
    width: 150,
  },
  {
    title: '应用描述',
    dataIndex: 'appDescription',
    width: 200,
    ellipsis: true,
  },
  {
    title: 'Git地址',
    dataIndex: 'gitUrl',
    width: 200,
    ellipsis: true,
  },
  {
    title: '所属领域',
    dataIndex: 'domain_dictText',
    width: 120,
  },
  {
    title: '应用负责人',
    dataIndex: 'managers_dictText',
    width: 150,
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 150,
    sorter: true,
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    width: 150,
    sorter: true,
  },
];

/**
 * 应用数据接口
 */
export interface AppManageModel {
  id?: string;
  projectSource?: 'existing' | 'new';
  appName: string;
  appDescription: string;
  gitUrl: string;
  repoVisibility?: 'private' | 'public';
  gitToken?: string;
  templateType?: string;
  domain: string;
  managers: string[];
  createTime?: string;
  updateTime?: string;
  createBy?: string;
  updateBy?: string;
}

/**
 * 查询参数接口
 */
export interface AppManageQueryParam {
  appName?: string;
  domain?: string;
  pageNo?: number;
  pageSize?: number;
}