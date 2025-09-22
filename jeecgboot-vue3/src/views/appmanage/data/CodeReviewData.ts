/**
 * 代码审查数据配置
 */
import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';

/**
 * 代码审查规则列表表格列配置
 */
export const codeReviewColumns: BasicColumn[] = [
  {
    title: '规则名称',
    dataIndex: 'ruleName',
    width: 180,
    align: 'left',
  },
  {
    title: '规则类型',
    dataIndex: 'ruleType',
    width: 120,
    customRender: ({ record }) => {
      const typeMap = {
        syntax: '语法检查',
        style: '代码风格',
        security: '安全检查',
        performance: '性能优化',
        complexity: '复杂度检查',
        naming: '命名规范',
      };
      return typeMap[record.ruleType] || record.ruleType;
    },
  },
  {
    title: '严重程度',
    dataIndex: 'severity',
    width: 100,
    key: 'severity',
  },
  {
    title: '描述',
    dataIndex: 'description',
    width: 250,
    ellipsis: true,
  },
  {
    title: '文件类型',
    dataIndex: 'fileExtensions',
    width: 120,
    customRender: ({ record }) => {
      return record.fileExtensions?.join(', ') || '-';
    },
  },
  {
    title: '自动修复',
    dataIndex: 'autoFix',
    width: 100,
    customRender: ({ record }) => {
      return record.autoFix ? '支持' : '不支持';
    },
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
];

/**
 * 代码审查规则表单配置
 */
export const codeReviewFormSchema: FormSchema[] = [
  {
    field: 'ruleName',
    label: '规则名称',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入规则名称',
    },
  },
  {
    field: 'ruleType',
    label: '规则类型',
    component: 'Select',
    required: true,
    componentProps: {
      placeholder: '请选择规则类型',
      options: [
        { label: '语法检查', value: 'syntax' },
        { label: '代码风格', value: 'style' },
        { label: '安全检查', value: 'security' },
        { label: '性能优化', value: 'performance' },
        { label: '复杂度检查', value: 'complexity' },
        { label: '命名规范', value: 'naming' },
      ],
    },
  },
  {
    field: 'severity',
    label: '严重程度',
    component: 'Select',
    required: true,
    componentProps: {
      placeholder: '请选择严重程度',
      options: [
        { label: '低', value: 'low' },
        { label: '中', value: 'medium' },
        { label: '高', value: 'high' },
        { label: '严重', value: 'critical' },
      ],
    },
  },
  {
    field: 'description',
    label: '规则描述',
    component: 'InputTextArea',
    required: true,
    componentProps: {
      placeholder: '请输入规则描述',
      rows: 3,
    },
  },
  {
    field: 'pattern',
    label: '匹配模式',
    component: 'InputTextArea',
    required: true,
    componentProps: {
      placeholder: '请输入正则表达式或匹配模式',
      rows: 4,
    },
  },
  {
    field: 'fileExtensions',
    label: '文件类型',
    component: 'Select',
    componentProps: {
      mode: 'multiple',
      placeholder: '请选择适用的文件类型',
      options: [
        { label: 'JavaScript (.js)', value: 'js' },
        { label: 'TypeScript (.ts)', value: 'ts' },
        { label: 'Vue (.vue)', value: 'vue' },
        { label: 'React (.jsx)', value: 'jsx' },
        { label: 'React TypeScript (.tsx)', value: 'tsx' },
        { label: 'CSS (.css)', value: 'css' },
        { label: 'Less (.less)', value: 'less' },
        { label: 'Sass (.scss)', value: 'scss' },
        { label: 'HTML (.html)', value: 'html' },
        { label: 'JSON (.json)', value: 'json' },
      ],
    },
  },
  {
    field: 'excludePaths',
    label: '排除路径',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入要排除的文件路径（每行一个）',
      rows: 3,
    },
  },
  {
    field: 'autoFix',
    label: '自动修复',
    component: 'Switch',
    componentProps: {
      checkedChildren: '支持',
      unCheckedChildren: '不支持',
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
      ],
    },
  },
];

/**
 * 代码审查规则模拟数据
 */
export const codeReviewData = [
  {
    id: '1',
    ruleName: '禁用console.log',
    ruleType: 'style',
    severity: 'medium',
    description: '生产环境中不应该包含console.log语句',
    pattern: 'console\\.log\\(',
    fileExtensions: ['js', 'ts', 'vue'],
    excludePaths: 'node_modules/\ntest/',
    autoFix: true,
    status: 'active',
    createTime: '2024-01-10 10:00:00',
    updateTime: '2024-01-15 14:30:00',
  },
  {
    id: '2',
    ruleName: '函数复杂度检查',
    ruleType: 'complexity',
    severity: 'high',
    description: '函数的圈复杂度不应超过10',
    pattern: 'cyclomatic-complexity > 10',
    fileExtensions: ['js', 'ts', 'jsx', 'tsx'],
    excludePaths: 'test/\nspec/',
    autoFix: false,
    status: 'active',
    createTime: '2024-01-12 09:15:00',
    updateTime: '2024-01-16 11:20:00',
  },
  {
    id: '3',
    ruleName: '变量命名规范',
    ruleType: 'naming',
    severity: 'low',
    description: '变量名应使用驼峰命名法',
    pattern: '^[a-z][a-zA-Z0-9]*$',
    fileExtensions: ['js', 'ts', 'vue'],
    excludePaths: 'node_modules/',
    autoFix: false,
    status: 'active',
    createTime: '2024-01-14 16:45:00',
    updateTime: '2024-01-17 09:30:00',
  },
  {
    id: '4',
    ruleName: 'SQL注入检查',
    ruleType: 'security',
    severity: 'critical',
    description: '检查潜在的SQL注入漏洞',
    pattern: 'SELECT.*\\+.*|INSERT.*\\+.*|UPDATE.*\\+.*',
    fileExtensions: ['js', 'ts'],
    excludePaths: 'test/\nnode_modules/',
    autoFix: false,
    status: 'active',
    createTime: '2024-01-16 13:20:00',
    updateTime: '2024-01-18 15:10:00',
  },
  {
    id: '5',
    ruleName: '未使用的导入',
    ruleType: 'style',
    severity: 'low',
    description: '移除未使用的import语句',
    pattern: 'import.*from.*(?!.*used)',
    fileExtensions: ['js', 'ts', 'vue', 'jsx', 'tsx'],
    excludePaths: 'node_modules/',
    autoFix: true,
    status: 'inactive',
    createTime: '2024-01-18 11:30:00',
    updateTime: '2024-01-19 10:15:00',
  },
  {
    id: '6',
    ruleName: '性能优化建议',
    ruleType: 'performance',
    severity: 'medium',
    description: '检查可能影响性能的代码模式',
    pattern: 'for.*in.*|while.*true.*',
    fileExtensions: ['js', 'ts', 'vue'],
    excludePaths: 'test/\nnode_modules/',
    autoFix: false,
    status: 'active',
    createTime: '2024-01-20 08:45:00',
    updateTime: '2024-01-21 16:20:00',
  },
];