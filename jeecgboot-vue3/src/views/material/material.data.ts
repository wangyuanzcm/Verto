import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { rules } from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { unref } from 'vue';

/**
 * 组件管理列配置
 */
export const componentColumns: BasicColumn[] = [
  {
    title: '组件名称',
    align: 'center',
    dataIndex: 'componentName',
    width: 150,
  },
  {
    title: '分发方式',
    align: 'center',
    dataIndex: 'distributionType',
    width: 120,
    customRender: ({ text }) => {
      const typeMap = {
        'npm': 'NPM包',
        'federation': '模块联邦',
      };
      return typeMap[text] || text;
    },
  },
  {
    title: '组件类型',
    align: 'center',
    dataIndex: 'componentType',
    width: 120,
    customRender: ({ text }) => {
      const typeMap = {
        'form': '表单组件',
        'display': '展示组件',
        'layout': '布局组件',
        'business': '业务组件',
        'page': '页面组件',
      };
      return typeMap[text] || text;
    },
  },
  {
    title: '技术栈',
    align: 'center',
    dataIndex: 'techStack',
    width: 120,
    customRender: ({ text }) => {
      if (!text) return '-';
      const stackMap = {
        'vue3': 'Vue3',
        'react': 'React',
        'angular': 'Angular',
        'vanilla': 'Vanilla JS',
      };
      return stackMap[text] || text;
    },
  },
  {
    title: '版本',
    align: 'center',
    dataIndex: 'version',
    width: 100,
  },
  {
    title: '关联项目',
    align: 'center',
    dataIndex: 'relatedProject',
    width: 150,
    customRender: ({ text, record }) => {
      if (record.distributionType === 'federation' && text) {
        return text;
      }
      return record.distributionType === 'npm' ? '无' : '-';
    },
  },
  {
    title: 'Tag版本',
    align: 'center',
    dataIndex: 'projectTag',
    width: 120,
    customRender: ({ text, record }) => {
      if (record.distributionType === 'federation' && text) {
        return `v${text}`;
      }
      return record.distributionType === 'federation' ? '未指定' : '-';
    },
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'status',
    width: 100,
    customRender: ({ text }) => {
      return render.renderDict(text, 'valid_status');
    },
  },
  {
    title: '创建时间',
    align: 'center',
    dataIndex: 'createTime',
    width: 150,
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
    dataIndex: 'templateName',
  },
  {
    title: '模板类型',
    align: 'center',
    dataIndex: 'templateType',
    customRender: ({ text }) => {
      const typeMap = {
        'page': '页面模板',
        'component': '组件模板',
        'layout': '布局模板',
        'business': '业务模板',
        'application': '应用模板',
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
    field: 'componentName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '组件类型',
    field: 'componentType',
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
 * 模板搜索表单配置
 */
export const templateSearchFormSchema: FormSchema[] = [
  {
    label: '模板名称',
    field: 'templateName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '模板类型',
    field: 'templateType',
    component: 'Select',
    componentProps: {
      options: [
        { label: '页面模板', value: 'page' },
        { label: '应用模板', value: 'application' },
        { label: '布局模板', value: 'layout' },
        { label: '组件模板', value: 'component' },
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
    field: 'componentName',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入组件名称',
    },
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入组件名称!' }];
    },
  },
  {
    label: '分发方式',
    field: 'distributionType',
    component: 'RadioButtonGroup',
    required: true,
    defaultValue: 'npm',
    componentProps: {
      options: [
        { label: 'NPM包', value: 'npm' },
        { label: '模块联邦', value: 'federation' },
      ],
    },
  },
  {
    label: '组件类型',
    field: 'componentType',
    component: 'Select',
    required: true,
    componentProps: {
      placeholder: '请选择组件类型',
      options: [
        { label: '表单组件', value: 'form' },
        { label: '展示组件', value: 'display' },
        { label: '布局组件', value: 'layout' },
        { label: '业务组件', value: 'business' },
        { label: '页面组件', value: 'page' },
      ],
    },
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请选择组件类型!' }];
    },
  },
  {
    label: '技术栈',
    field: 'techStack',
    component: 'Select',
    required: true,
    componentProps: {
      placeholder: '请选择技术栈',
      options: [
        { label: 'Vue3', value: 'vue3' },
        { label: 'React', value: 'react' },
        { label: 'Angular', value: 'angular' },
        { label: 'Vanilla JS', value: 'vanilla' },
      ],
    },
  },
  {
    label: '版本',
    field: 'version',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入版本号，如：1.0.0',
    },
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入版本号!' }];
    },
  },
  {
    label: '关联项目',
    field: 'relatedProject',
    component: 'Input',
    ifShow: ({ values }) => values.distributionType === 'federation',
    required: ({ values }) => values.distributionType === 'federation',
    componentProps: {
      placeholder: '请输入关联的业务项目名称',
    },
  },
  {
    label: '项目仓库地址',
    field: 'projectRepository',
    component: 'Input',
    ifShow: ({ values }) => values.distributionType === 'federation',
    componentProps: {
      placeholder: '请输入项目Git仓库地址',
    },
  },
  {
    label: 'Tag版本',
    field: 'projectTag',
    component: 'Input',
    ifShow: ({ values }) => values.distributionType === 'federation',
    required: ({ values }) => values.distributionType === 'federation',
    componentProps: {
      placeholder: '请输入项目Tag版本，如：1.2.0',
      addonBefore: 'v',
    },
  },
  {
    label: '远程模块名',
    field: 'remoteModuleName',
    component: 'Input',
    ifShow: ({ values }) => values.distributionType === 'federation',
    required: ({ values }) => values.distributionType === 'federation',
    componentProps: {
      placeholder: '请输入模块联邦导出的模块名',
    },
  },
  {
    label: 'NPM包名',
    field: 'npmPackageName',
    component: 'Input',
    ifShow: ({ values }) => values.distributionType === 'npm',
    required: ({ values }) => values.distributionType === 'npm',
    componentProps: {
      placeholder: '请输入NPM包名，如：@company/component-name',
    },
  },
  {
    label: '包仓库地址',
    field: 'packageRepository',
    component: 'Input',
    ifShow: ({ values }) => values.distributionType === 'npm',
    componentProps: {
      placeholder: '请输入NPM包仓库地址（可选）',
    },
  },
  {
    label: '组件代码',
    field: 'componentCode',
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
      placeholder: '请输入组件描述',
      rows: 3,
    },
  },
  {
    label: '使用说明',
    field: 'usageInstructions',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入组件使用说明和示例代码',
      rows: 4,
    },
  },
  {
    label: '状态',
    field: 'status',
    component: 'JDictSelectTag',
    required: true,
    componentProps: {
      dictCode: 'valid_status',
      placeholder: '请选择状态',
    },
    defaultValue: '1',
  },
];

/**
 * 模板管理表单配置
 */
/**
 * 模板表单配置
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
    field: 'templateName',
    component: 'Input',
    required: true,
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入模板名称!' }];
    },
  },
  {
    label: '模板代码',
    field: 'templateCode',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入唯一的模板代码',
    },
    dynamicRules: ({ model, schema }) => {
      return [
        { required: true, message: '请输入模板代码!' },
        { pattern: /^[a-zA-Z0-9_-]+$/, message: '模板代码只能包含字母、数字、下划线和横线!' },
      ];
    },
    // 编辑模式下不可修改编码
    dynamicDisabled: (params) => !!params.values.id,
  },
  {
    label: '模板类型',
    field: 'templateType',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '页面模板', value: 'page' },
        { label: '应用模板', value: 'application' },
        { label: '布局模板', value: 'layout' },
        { label: '组件模板', value: 'component' },
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
    field: 'sourceCode',
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