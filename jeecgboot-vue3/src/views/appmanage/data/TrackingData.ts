/**
 * 埋点管理数据配置
 */
import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';

/**
 * 埋点列表表格列配置
 */
export const trackingColumns: BasicColumn[] = [
  {
    title: '事件名称',
    dataIndex: 'eventName',
    width: 150,
    align: 'left',
  },
  {
    title: '事件类型',
    dataIndex: 'eventType',
    width: 120,
    customRender: ({ record }) => {
      const typeMap = {
        click: '点击事件',
        view: '页面浏览',
        form: '表单提交',
        scroll: '滚动事件',
        custom: '自定义事件',
      };
      return typeMap[record.eventType] || record.eventType;
    },
  },
  {
    title: '描述',
    dataIndex: 'description',
    width: 200,
    ellipsis: true,
  },
  {
    title: '选择器',
    dataIndex: 'selector',
    width: 180,
    ellipsis: true,
  },
  {
    title: '触发条件',
    dataIndex: 'triggerCondition',
    width: 150,
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    key: 'status',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 160,
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    width: 160,
  },
];

/**
 * 埋点表单配置
 */
export const trackingFormSchema: FormSchema[] = [
  {
    field: 'eventName',
    label: '事件名称',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入事件名称',
    },
  },
  {
    field: 'eventType',
    label: '事件类型',
    component: 'Select',
    required: true,
    componentProps: {
      placeholder: '请选择事件类型',
      options: [
        { label: '点击事件', value: 'click' },
        { label: '页面浏览', value: 'view' },
        { label: '表单提交', value: 'form' },
        { label: '滚动事件', value: 'scroll' },
        { label: '自定义事件', value: 'custom' },
      ],
    },
  },
  {
    field: 'description',
    label: '描述',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入事件描述',
      rows: 3,
    },
  },
  {
    field: 'selector',
    label: '选择器',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入CSS选择器或XPath',
    },
  },
  {
    field: 'triggerCondition',
    label: '触发条件',
    component: 'Input',
    componentProps: {
      placeholder: '请输入触发条件（可选）',
    },
  },
  {
    field: 'dataFields',
    label: '数据字段',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入需要收集的数据字段（JSON格式）',
      rows: 4,
    },
  },
  {
    field: 'status',
    label: '状态',
    component: 'RadioButtonGroup',
    defaultValue: 'active',
    componentProps: {
      options: [
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' },
        { label: '待审核', value: 'pending' },
      ],
    },
  },
];

/**
 * 埋点模拟数据
 */
export const trackingData = [
  {
    id: '1',
    eventName: '用户登录',
    eventType: 'form',
    description: '用户登录表单提交事件',
    selector: '#login-form',
    triggerCondition: 'form submit',
    dataFields: '{"username": "string", "loginTime": "timestamp"}',
    status: 'active',
    createTime: '2024-01-10 10:00:00',
    updateTime: '2024-01-15 14:30:00',
  },
  {
    id: '2',
    eventName: '页面浏览',
    eventType: 'view',
    description: '应用详情页面浏览事件',
    selector: '.app-detail',
    triggerCondition: 'page load',
    dataFields: '{"pageUrl": "string", "viewTime": "timestamp", "userId": "string"}',
    status: 'active',
    createTime: '2024-01-12 09:15:00',
    updateTime: '2024-01-16 11:20:00',
  },
  {
    id: '3',
    eventName: '按钮点击',
    eventType: 'click',
    description: '主要操作按钮点击事件',
    selector: '.primary-button',
    triggerCondition: 'click',
    dataFields: '{"buttonText": "string", "clickTime": "timestamp", "userId": "string"}',
    status: 'active',
    createTime: '2024-01-14 16:45:00',
    updateTime: '2024-01-17 09:30:00',
  },
  {
    id: '4',
    eventName: '滚动监听',
    eventType: 'scroll',
    description: '页面滚动深度监听',
    selector: 'window',
    triggerCondition: 'scroll > 50%',
    dataFields: '{"scrollDepth": "number", "scrollTime": "timestamp"}',
    status: 'pending',
    createTime: '2024-01-16 13:20:00',
    updateTime: '2024-01-18 15:10:00',
  },
  {
    id: '5',
    eventName: '文件下载',
    eventType: 'click',
    description: '文件下载链接点击事件',
    selector: '.download-link',
    triggerCondition: 'click',
    dataFields: '{"fileName": "string", "fileSize": "number", "downloadTime": "timestamp"}',
    status: 'inactive',
    createTime: '2024-01-18 11:30:00',
    updateTime: '2024-01-19 10:15:00',
  },
];