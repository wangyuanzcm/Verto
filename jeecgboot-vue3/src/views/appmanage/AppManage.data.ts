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
    componentProps: {
      placeholder: '请输入Git仓库地址',
    },
    rules: [
      {
        pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        message: '请输入有效的Git地址',
      },
    ],
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
    component: 'JSelectUser',
    componentProps: {
      placeholder: '请选择应用负责人',
      mode: 'multiple', // 多选
      labelInValue: true,
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
  appName: string;
  appDescription: string;
  gitUrl: string;
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