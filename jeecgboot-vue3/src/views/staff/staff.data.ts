import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { rules } from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';

/**
 * 人员管理数据模型
 */
export interface StaffModel {
  id?: string;
  name: string;
  employeeNo: string;
  email: string;
  hireDate: string;
  workLocation: string;
  skills: string[];
  phone?: string;
  status?: number;
  createTime?: string;
  updateTime?: string;
}

/**
 * 人员列表表格列配置
 */
export const columns: BasicColumn[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    width: 120,
    sorter: true,
  },
  {
    title: '工号',
    dataIndex: 'employeeNo',
    width: 120,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    width: 180,
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    width: 120,
  },
  {
    title: '入职时间',
    dataIndex: 'hireDate',
    width: 120,
    sorter: true,
  },
  {
    title: '工位位置',
    dataIndex: 'workLocation',
    width: 150,
  },
  {
    title: '擅长技能',
    dataIndex: 'skills',
    width: 200,
    customRender: ({ text }) => {
      if (Array.isArray(text)) {
        return text.join(', ');
      }
      return text || '-';
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    customRender: ({ text }) => {
      const statusMap = {
        1: { text: '在职', color: 'green' },
        0: { text: '离职', color: 'red' },
        2: { text: '休假', color: 'orange' },
      };
      const status = statusMap[text] || { text: '未知', color: 'gray' };
      return render.renderTag(status.text, status.color);
    },
  },
];

/**
 * 搜索表单配置
 */
export const searchFormSchema: FormSchema[] = [
  {
    label: '姓名',
    field: 'name',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '工号',
    field: 'employeeNo',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '邮箱',
    field: 'email',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '状态',
    field: 'status',
    component: 'Select',
    componentProps: {
      options: [
        { label: '在职', value: 1 },
        { label: '离职', value: 0 },
        { label: '休假', value: 2 },
      ],
      placeholder: '请选择状态',
    },
    colProps: { span: 6 },
  },
];

/**
 * 表单配置
 */
export const formSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '姓名',
    field: 'name',
    component: 'Input',
    required: true,
    rules: [
      { required: true, message: '请输入姓名' },
      { max: 50, message: '姓名长度不能超过50个字符' },
    ],
  },
  {
    label: '工号',
    field: 'employeeNo',
    component: 'Input',
    required: true,
    rules: [
      { required: true, message: '请输入工号' },
      { pattern: /^[A-Za-z0-9]{3,20}$/, message: '工号由3-20位字母或数字组成' },
    ],
    dynamicRules: ({ model, schema }) => rules.duplicateCheckRule('sys_staff', 'employee_no', model, schema, true),
  },
  {
    label: '邮箱',
    field: 'email',
    component: 'Input',
    required: true,
    rules: [
      { required: true, message: '请输入邮箱' },
      { type: 'email', message: '请输入正确的邮箱格式' },
    ],
    dynamicRules: ({ model, schema }) => rules.duplicateCheckRule('sys_staff', 'email', model, schema, true),
  },
  {
    label: '手机号',
    field: 'phone',
    component: 'Input',
    rules: [
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
    ],
  },
  {
    label: '入职时间',
    field: 'hireDate',
    component: 'DatePicker',
    required: true,
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请选择入职时间',
      getPopupContainer: () => document.body,
    },
  },
  {
    label: '工位位置',
    field: 'workLocation',
    component: 'Input',
    required: true,
    rules: [
      { required: true, message: '请输入工位位置' },
      { max: 100, message: '工位位置不能超过100个字符' },
    ],
    componentProps: {
      placeholder: '如：A座3楼301工位',
    },
  },
  {
    label: '擅长技能',
    field: 'skills',
    component: 'Select',
    componentProps: {
      mode: 'tags',
      placeholder: '请选择或输入擅长技能',
      options: [
        { label: 'Java', value: 'Java' },
        { label: 'Python', value: 'Python' },
        { label: 'JavaScript', value: 'JavaScript' },
        { label: 'Vue.js', value: 'Vue.js' },
        { label: 'React', value: 'React' },
        { label: 'Node.js', value: 'Node.js' },
        { label: 'Spring Boot', value: 'Spring Boot' },
        { label: 'MySQL', value: 'MySQL' },
        { label: 'Redis', value: 'Redis' },
        { label: 'Docker', value: 'Docker' },
        { label: 'Kubernetes', value: 'Kubernetes' },
        { label: 'Git', value: 'Git' },
        { label: 'Linux', value: 'Linux' },
        { label: 'UI设计', value: 'UI设计' },
        { label: '产品设计', value: '产品设计' },
        { label: '项目管理', value: '项目管理' },
        { label: '数据分析', value: '数据分析' },
        { label: '测试', value: '测试' },
        { label: '运维', value: '运维' },
        { label: '架构设计', value: '架构设计' },
      ],
      maxTagCount: 10,
    },
    required: true,
    rules: [
      { required: true, message: '请选择至少一项擅长技能' },
    ],
  },
  {
    label: '状态',
    field: 'status',
    component: 'RadioGroup',
    defaultValue: 1,
    componentProps: {
      options: [
        { label: '在职', value: 1 },
        { label: '离职', value: 0 },
        { label: '休假', value: 2 },
      ],
    },
    required: true,
  },
  {
    label: '备注',
    field: 'remark',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
      maxlength: 500,
      showCount: true,
      placeholder: '请输入备注信息',
    },
  },
];