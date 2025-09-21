import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { rules } from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';

/**
 * 组件管理列配置
 */
export const componentColumns: BasicColumn[] = [
  {
    title: '组件名称',
    align: 'center',
    dataIndex: 'name',
  },
  {
    title: '组件类型',
    align: 'center',
    dataIndex: 'type',
    customRender: ({ text }) => {
      const typeMap = {
        'form': '表单组件',
        'display': '展示组件',
        'layout': '布局组件',
        'business': '业务组件',
      };
      return typeMap[text] || text;
    },
  },
  {
    title: '版本',
    align: 'center',
    dataIndex: 'version',
  },
  {
    title: '描述',
    align: 'center',
    dataIndex: 'description',
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'status',
    customRender: ({ text }) => {
      return render.renderDict(text, 'valid_status');
    },
  },
  {
    title: '创建时间',
    align: 'center',
    dataIndex: 'createTime',
    sorter: true,
  },
];

/**
 * 模板管理列配置
 */
export const templateColumns: BasicColumn[] = [
  {
    title: '模板名称',
    align: 'center',
    dataIndex: 'name',
  },
  {
    title: '模板类型',
    align: 'center',
    dataIndex: 'type',
    customRender: ({ text }) => {
      const typeMap = {
        'page': '页面模板',
        'component': '组件模板',
        'layout': '布局模板',
        'business': '业务模板',
      };
      return typeMap[text] || text;
    },
  },
  {
    title: '版本',
    align: 'center',
    dataIndex: 'version',
  },
  {
    title: '描述',
    align: 'center',
    dataIndex: 'description',
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'status',
    customRender: ({ text }) => {
      return render.renderDict(text, 'valid_status');
    },
  },
  {
    title: '创建时间',
    align: 'center',
    dataIndex: 'createTime',
    sorter: true,
  },
];

/**
 * 组件管理搜索表单配置
 */
export const componentSearchFormSchema: FormSchema[] = [
  {
    label: '组件名称',
    field: 'name',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '组件类型',
    field: 'type',
    component: 'Select',
    componentProps: {
      options: [
        { label: '表单组件', value: 'form' },
        { label: '展示组件', value: 'display' },
        { label: '布局组件', value: 'layout' },
        { label: '业务组件', value: 'business' },
      ],
    },
    colProps: { span: 6 },
  },
  {
    label: '状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'valid_status',
    },
    colProps: { span: 6 },
  },
];

/**
 * 模板管理搜索表单配置
 */
export const templateSearchFormSchema: FormSchema[] = [
  {
    label: '模板名称',
    field: 'name',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '模板类型',
    field: 'type',
    component: 'Select',
    componentProps: {
      options: [
        { label: '页面模板', value: 'page' },
        { label: '组件模板', value: 'component' },
        { label: '布局模板', value: 'layout' },
        { label: '业务模板', value: 'business' },
      ],
    },
    colProps: { span: 6 },
  },
  {
    label: '状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'valid_status',
    },
    colProps: { span: 6 },
  },
];

/**
 * 组件管理表单配置
 */
export const componentFormSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '组件名称',
    field: 'name',
    component: 'Input',
    required: true,
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入组件名称!' }];
    },
  },
  {
    label: '组件类型',
    field: 'type',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '表单组件', value: 'form' },
        { label: '展示组件', value: 'display' },
        { label: '布局组件', value: 'layout' },
        { label: '业务组件', value: 'business' },
      ],
    },
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请选择组件类型!' }];
    },
  },
  {
    label: '版本',
    field: 'version',
    component: 'Input',
    required: true,
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入版本号!' }];
    },
  },
  {
    label: '组件代码',
    field: 'code',
    component: 'JCodeEditor',
    componentProps: {
      language: 'javascript',
      height: 300,
    },
    required: true,
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入组件代码!' }];
    },
  },
  {
    label: '描述',
    field: 'description',
    component: 'InputTextArea',
    componentProps: {
      rows: 4,
    },
  },
  {
    label: '状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'valid_status',
    },
    defaultValue: '1',
  },
];

/**
 * 模板管理表单配置
 */
export const templateFormSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '模板名称',
    field: 'name',
    component: 'Input',
    required: true,
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入模板名称!' }];
    },
  },
  {
    label: '模板类型',
    field: 'type',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '页面模板', value: 'page' },
        { label: '组件模板', value: 'component' },
        { label: '布局模板', value: 'layout' },
        { label: '业务模板', value: 'business' },
      ],
    },
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请选择模板类型!' }];
    },
  },
  {
    label: '版本',
    field: 'version',
    component: 'Input',
    required: true,
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入版本号!' }];
    },
  },
  {
    label: '模板内容',
    field: 'content',
    component: 'JCodeEditor',
    componentProps: {
      language: 'html',
      height: 300,
    },
    required: true,
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入模板内容!' }];
    },
  },
  {
    label: '描述',
    field: 'description',
    component: 'InputTextArea',
    componentProps: {
      rows: 4,
    },
  },
  {
    label: '状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'valid_status',
    },
    defaultValue: '1',
  },
];