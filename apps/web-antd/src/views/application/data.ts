import type { VbenFormSchema } from '@vben/common-ui';

/**
 * 项目管理相关的数据配置
 * 包含表单schema、表格配置等
 */

/**
 * 项目表单Schema配置
 * @returns 表单配置
 */
export function useProjectFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入项目名称',
      },
      fieldName: 'name',
      label: '项目名称',
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入项目描述',
        rows: 3,
      },
      fieldName: 'description',
      label: '项目描述',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: 'Vue3 + TypeScript', value: 'vue3-admin' },
          { label: 'React + Next.js', value: 'react-nextjs' },
          { label: 'Vue3 + Nuxt', value: 'vue3-nuxt' },
          { label: 'Angular + TypeScript', value: 'angular-ts' },
          { label: 'Node.js + Express', value: 'nodejs-express' },
          { label: 'Python + Django', value: 'python-django' },
        ],
        placeholder: '请选择项目模板',
      },
      fieldName: 'template',
      label: '项目模板',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '活跃', value: 'active' },
          { label: '非活跃', value: 'inactive' },
          { label: '已归档', value: 'archived' },
        ],
        placeholder: '请选择项目状态',
      },
      fieldName: 'status',
      label: '项目状态',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        mode: 'tags',
        options: [
          { label: 'Vue3', value: 'Vue3' },
          { label: 'React', value: 'React' },
          { label: 'TypeScript', value: 'TypeScript' },
          { label: 'JavaScript', value: 'JavaScript' },
          { label: 'Node.js', value: 'Node.js' },
          { label: 'Python', value: 'Python' },
          { label: 'Admin', value: 'Admin' },
          { label: 'Dashboard', value: 'Dashboard' },
          { label: 'E-commerce', value: 'E-commerce' },
          { label: 'Blog', value: 'Blog' },
        ],
        placeholder: '请选择项目标签',
      },
      fieldName: 'tags',
      label: '项目标签',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入代码仓库地址',
      },
      fieldName: 'repository',
      label: '代码仓库',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入项目主页地址',
      },
      fieldName: 'homepage',
      label: '项目主页',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入文档地址',
      },
      fieldName: 'documentation',
      label: '项目文档',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: 'MIT', value: 'MIT' },
          { label: 'Apache-2.0', value: 'Apache-2.0' },
          { label: 'GPL-3.0', value: 'GPL-3.0' },
          { label: 'BSD-3-Clause', value: 'BSD-3-Clause' },
          { label: 'ISC', value: 'ISC' },
          { label: '其他', value: 'other' },
        ],
        placeholder: '请选择开源协议',
      },
      fieldName: 'license',
      label: '开源协议',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '公开', value: 'public' },
          { label: '私有', value: 'private' },
        ],
      },
      fieldName: 'visibility',
      label: '可见性',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        mode: 'multiple',
        options: [
          { label: '用户认证', value: '用户认证' },
          { label: '权限管理', value: '权限管理' },
          { label: '数据可视化', value: '数据可视化' },
          { label: '多语言支持', value: '多语言支持' },
          { label: '主题切换', value: '主题切换' },
          { label: '响应式设计', value: '响应式设计' },
          { label: '代码生成', value: '代码生成' },
          { label: '文件上传', value: '文件上传' },
          { label: '消息推送', value: '消息推送' },
          { label: 'API集成', value: 'API集成' },
        ],
        placeholder: '请选择项目特性',
      },
      fieldName: 'features',
      label: '项目特性',
    },
    {
      component: 'Select',
      componentProps: {
        mode: 'multiple',
        options: [
          { label: 'Vue3', value: 'Vue3' },
          { label: 'React', value: 'React' },
          { label: 'Angular', value: 'Angular' },
          { label: 'TypeScript', value: 'TypeScript' },
          { label: 'JavaScript', value: 'JavaScript' },
          { label: 'Vite', value: 'Vite' },
          { label: 'Webpack', value: 'Webpack' },
          { label: 'Pinia', value: 'Pinia' },
          { label: 'Redux', value: 'Redux' },
          { label: 'Ant Design Vue', value: 'Ant Design Vue' },
          { label: 'Element Plus', value: 'Element Plus' },
          { label: 'Material-UI', value: 'Material-UI' },
          { label: 'TailwindCSS', value: 'TailwindCSS' },
          { label: 'Sass', value: 'Sass' },
          { label: 'Less', value: 'Less' },
        ],
        placeholder: '请选择技术栈',
      },
      fieldName: 'technologies',
      label: '技术栈',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 1,
        max: 365,
        placeholder: '请输入预计工期（天）',
      },
      fieldName: 'estimatedDuration',
      label: '预计工期（天）',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '低', value: 'low' },
          { label: '中', value: 'medium' },
          { label: '高', value: 'high' },
          { label: '紧急', value: 'urgent' },
        ],
        placeholder: '请选择优先级',
      },
      fieldName: 'priority',
      label: '优先级',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 0,
        formatter: (value: number) =>
          `¥ ${value}`.replaceAll(/\B(?=(?:\d{3})+(?!\d))/g, ','),
        parser: (value: string) => value.replaceAll(/¥\s?|,*/g, ''),
        placeholder: '请输入项目预算',
      },
      fieldName: 'budget',
      label: '项目预算（元）',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 1,
        max: 50,
        placeholder: '请输入团队规模',
      },
      fieldName: 'teamSize',
      label: '团队规模（人）',
    },
    {
      component: 'DatePicker',
      componentProps: {
        placeholder: '请选择开始日期',
        format: 'YYYY-MM-DD',
      },
      fieldName: 'startDate',
      label: '开始日期',
    },
    {
      component: 'DatePicker',
      componentProps: {
        placeholder: '请选择结束日期',
        format: 'YYYY-MM-DD',
      },
      fieldName: 'endDate',
      label: '结束日期',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入项目备注',
        rows: 4,
      },
      fieldName: 'notes',
      label: '项目备注',
    },
  ];
}

/**
 * 项目列表搜索表单Schema配置
 * @returns 搜索表单配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入项目名称',
      },
      fieldName: 'name',
      label: '项目名称',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '全部', value: '' },
          { label: '活跃', value: 'active' },
          { label: '非活跃', value: 'inactive' },
          { label: '已归档', value: 'archived' },
        ],
        placeholder: '请选择状态',
      },
      fieldName: 'status',
      label: '状态',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '全部', value: '' },
          { label: 'Vue3 + TypeScript', value: 'vue3-admin' },
          { label: 'React + Next.js', value: 'react-nextjs' },
          { label: 'Vue3 + Nuxt', value: 'vue3-nuxt' },
          { label: 'Angular + TypeScript', value: 'angular-ts' },
          { label: 'Node.js + Express', value: 'nodejs-express' },
          { label: 'Python + Django', value: 'python-django' },
        ],
        placeholder: '请选择模板',
      },
      fieldName: 'template',
      label: '模板',
    },
    {
      component: 'RangePicker',
      componentProps: {
        placeholder: ['开始日期', '结束日期'],
        format: 'YYYY-MM-DD',
      },
      fieldName: 'dateRange',
      label: '创建时间',
    },
  ];
}

/**
 * 项目选项数据
 * 用于需求管理等模块的项目选择
 */
export const projectOptions = [
  {
    label: 'Vue3 Admin Dashboard',
    value: 'proj_001',
    description: '基于Vue3的现代化管理后台系统',
  },
  {
    label: 'React E-commerce',
    value: 'proj_002',
    description: '电商平台前端项目',
  },
  {
    label: 'Vue3 Blog System',
    value: 'proj_003',
    description: '个人博客系统',
  },
  {
    label: 'Angular CRM',
    value: 'proj_004',
    description: '客户关系管理系统',
  },
  {
    label: 'Node.js API Server',
    value: 'proj_005',
    description: 'RESTful API服务器',
  },
];

/**
 * 项目状态选项
 */
export const projectStatusOptions = [
  { label: '活跃', value: 'active', color: 'green' },
  { label: '非活跃', value: 'inactive', color: 'orange' },
  { label: '已归档', value: 'archived', color: 'red' },
];

/**
 * 项目优先级选项
 */
export const projectPriorityOptions = [
  { label: '低', value: 'low', color: 'green' },
  { label: '中', value: 'medium', color: 'blue' },
  { label: '高', value: 'high', color: 'orange' },
  { label: '紧急', value: 'urgent', color: 'red' },
];

/**
 * 项目模板选项
 */
export const projectTemplateOptions = [
  {
    label: 'Vue3 + TypeScript',
    value: 'vue3-admin',
    description: '基于Vue3和TypeScript的现代化前端框架',
    category: 'web',
    technologies: ['Vue3', 'TypeScript', 'Vite', 'Pinia'],
  },
  {
    label: 'React + Next.js',
    value: 'react-nextjs',
    description: '基于React和Next.js的全栈框架',
    category: 'web',
    technologies: ['React', 'Next.js', 'TypeScript', 'Redux'],
  },
  {
    label: 'Vue3 + Nuxt',
    value: 'vue3-nuxt',
    description: '基于Vue3和Nuxt的全栈框架',
    category: 'web',
    technologies: ['Vue3', 'Nuxt', 'TypeScript', 'Pinia'],
  },
  {
    label: 'Angular + TypeScript',
    value: 'angular-ts',
    description: '基于Angular和TypeScript的企业级框架',
    category: 'web',
    technologies: ['Angular', 'TypeScript', 'RxJS', 'NgRx'],
  },
  {
    label: 'Node.js + Express',
    value: 'nodejs-express',
    description: '基于Node.js和Express的后端API框架',
    category: 'api',
    technologies: ['Node.js', 'Express', 'TypeScript', 'MongoDB'],
  },
  {
    label: 'Python + Django',
    value: 'python-django',
    description: '基于Python和Django的Web框架',
    category: 'api',
    technologies: ['Python', 'Django', 'PostgreSQL', 'Redis'],
  },
];

/**
 * 获取项目状态颜色
 * @param status 状态值
 * @returns 颜色
 */
export function getProjectStatusColor(status: string): string {
  const option = projectStatusOptions.find((item) => item.value === status);
  return option?.color || 'default';
}

/**
 * 获取项目优先级颜色
 * @param priority 优先级值
 * @returns 颜色
 */
export function getProjectPriorityColor(priority: string): string {
  const option = projectPriorityOptions.find((item) => item.value === priority);
  return option?.color || 'default';
}

/**
 * 获取项目模板信息
 * @param templateValue 模板值
 * @returns 模板信息
 */
export function getProjectTemplate(templateValue: string) {
  return projectTemplateOptions.find((item) => item.value === templateValue);
}
