import type { VbenFormSchema, VxeGridPropTypes } from '@vben/common-ui';

import { h } from 'vue';

import { Avatar, Button, Progress, Space, Tag, Tooltip } from 'ant-design-vue';

// 需求类型选项
export const requirementTypeOptions = [
  { label: '功能需求', value: 'feature', color: 'blue' },
  { label: 'Bug修复', value: 'bug', color: 'red' },
  { label: '改进优化', value: 'improvement', color: 'green' },
  { label: '任务', value: 'task', color: 'orange' },
];

// 优先级选项
export const priorityOptions = [
  { label: '低', value: 'low', color: 'default' },
  { label: '中', value: 'medium', color: 'orange' },
  { label: '高', value: 'high', color: 'red' },
  { label: '紧急', value: 'urgent', color: 'magenta' },
];

// 状态选项
export const statusOptions = [
  { label: '草稿', value: 'draft', color: 'default' },
  { label: '待审核', value: 'pending', color: 'orange' },
  { label: '已批准', value: 'approved', color: 'green' },
  { label: '已拒绝', value: 'rejected', color: 'red' },
  { label: '开发中', value: 'developing', color: 'blue' },
  { label: '测试中', value: 'testing', color: 'purple' },
  { label: '已完成', value: 'completed', color: 'success' },
];

// 评审状态选项
export const reviewStatusOptions = [
  { label: '待评审', value: 'pending', color: 'orange' },
  { label: '已批准', value: 'approved', color: 'green' },
  { label: '已拒绝', value: 'rejected', color: 'red' },
];

// 项目选项（模拟数据）
export const projectOptions = [
  { label: 'Vue3 Admin Dashboard', value: 'proj_001' },
  { label: 'React E-commerce', value: 'proj_002' },
  { label: 'Vue3 Blog System', value: 'proj_003' },
  { label: 'React Native App', value: 'proj_004' },
  { label: 'Next.js Portfolio', value: 'proj_005' },
];

// 用户选项（模拟数据）
export const userOptions = [
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
  { label: '赵六', value: '赵六' },
  { label: '产品经理', value: '产品经理' },
  { label: '技术总监', value: '技术总监' },
  { label: '测试工程师', value: '测试工程师' },
];

/**
 * 获取标签颜色
 * @param value 值
 * @param options 选项数组
 * @returns 颜色
 */
function getTagColor(value: string, options: any[]) {
  const option = options.find((opt) => opt.value === value);
  return option?.color || 'default';
}

/**
 * 获取标签文本
 * @param value 值
 * @param options 选项数组
 * @returns 文本
 */
function getTagLabel(value: string, options: any[]) {
  const option = options.find((opt) => opt.value === value);
  return option?.label || value;
}

/**
 * 获取需求表格列配置
 * @param actions 操作回调函数
 * @param actions.onCopy 复制操作回调
 * @param actions.onDelete 删除操作回调
 * @param actions.onEdit 编辑操作回调
 * @param actions.onView 查看操作回调
 * @returns 列配置
 */
export function getRequirementTableColumns(actions?: {
  onCopy?: (record: any) => void;
  onDelete?: (record: any) => void;
  onEdit?: (record: any) => void;
  onView?: (record: any) => void;
}): VxeGridPropTypes.Columns {
  return [
    {
      type: 'checkbox',
      width: 50,
      fixed: 'left',
    },
    {
      field: 'id',
      title: 'ID',
      width: 80,
      fixed: 'left',
    },
    {
      field: 'title',
      title: '需求标题',
      width: 200,
      fixed: 'left',
      slots: {
        default: ({ row }) => {
          return h(
            'div',
            {
              class: 'cursor-pointer hover:text-blue-600 font-medium',
              onClick: () => actions?.onView?.(row),
            },
            row.title,
          );
        },
      },
    },
    {
      field: 'type',
      title: '类型',
      width: 100,
      slots: {
        default: ({ row }) => {
          return h(
            Tag,
            {
              color: getTagColor(row.type, requirementTypeOptions),
            },
            () => getTagLabel(row.type, requirementTypeOptions),
          );
        },
      },
    },
    {
      field: 'priority',
      title: '优先级',
      width: 100,
      slots: {
        default: ({ row }) => {
          return h(
            Tag,
            {
              color: getTagColor(row.priority, priorityOptions),
            },
            () => getTagLabel(row.priority, priorityOptions),
          );
        },
      },
    },
    {
      field: 'status',
      title: '状态',
      width: 100,
      slots: {
        default: ({ row }) => {
          return h(
            Tag,
            {
              color: getTagColor(row.status, statusOptions),
            },
            () => getTagLabel(row.status, statusOptions),
          );
        },
      },
    },
    {
      field: 'assignee',
      title: '指派人',
      width: 100,
      slots: {
        default: ({ row }) => {
          if (!row.assignee) {
            return h('span', { class: 'text-gray-400' }, '未指派');
          }
          return h('div', { class: 'flex items-center gap-2' }, [
            h(Avatar, { size: 'small' }, () => row.assignee[0]),
            h('span', row.assignee),
          ]);
        },
      },
    },
    {
      field: 'reporter',
      title: '报告人',
      width: 100,
      slots: {
        default: ({ row }) => {
          return h('div', { class: 'flex items-center gap-2' }, [
            h(Avatar, { size: 'small' }, () => row.reporter[0]),
            h('span', row.reporter),
          ]);
        },
      },
    },
    {
      field: 'projectName',
      title: '所属项目',
      width: 150,
      slots: {
        default: ({ row }) => {
          return (
            row.projectName || h('span', { class: 'text-gray-400' }, '未关联')
          );
        },
      },
    },
    {
      field: 'progress',
      title: '进度',
      width: 120,
      slots: {
        default: ({ row }) => {
          let percent = 0;
          switch (row.status) {
            case 'approved': {
              percent = 20;
              break;
            }
            case 'completed': {
              percent = 100;
              break;
            }
            case 'developing': {
              percent = 60;
              break;
            }
            case 'draft': {
              percent = 0;
              break;
            }
            case 'pending': {
              percent = 10;
              break;
            }
            case 'testing': {
              percent = 80;
              break;
            }
            default: {
              percent = 0;
            }
          }

          return h(Progress, {
            percent,
            size: 'small',
            showInfo: false,
          });
        },
      },
    },
    {
      field: 'estimatedHours',
      title: '预估工时',
      width: 100,
      slots: {
        default: ({ row }) => {
          return row.estimatedHours ? `${row.estimatedHours}h` : '-';
        },
      },
    },
    {
      field: 'actualHours',
      title: '实际工时',
      width: 100,
      slots: {
        default: ({ row }) => {
          return row.actualHours ? `${row.actualHours}h` : '-';
        },
      },
    },
    {
      field: 'dueDate',
      title: '截止日期',
      width: 120,
      slots: {
        default: ({ row }) => {
          if (!row.dueDate) return '-';

          const dueDate = new Date(row.dueDate);
          const now = new Date();
          const isOverdue = dueDate < now && row.status !== 'completed';

          return h(
            'span',
            {
              class: isOverdue ? 'text-red-500 font-medium' : 'text-gray-600',
            },
            row.dueDate,
          );
        },
      },
    },
    {
      field: 'reviewStatus',
      title: '评审状态',
      width: 100,
      slots: {
        default: ({ row }) => {
          if (!row.reviewStatus) return '-';

          return h(
            Tag,
            {
              color: getTagColor(row.reviewStatus, reviewStatusOptions),
              size: 'small',
            },
            () => getTagLabel(row.reviewStatus, reviewStatusOptions),
          );
        },
      },
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 150,
      sortable: true,
    },
    {
      field: 'updateTime',
      title: '更新时间',
      width: 150,
      sortable: true,
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      slots: {
        default: ({ row }) => {
          return h(Space, { size: 'small' }, () => [
            h(Tooltip, { title: '查看详情' }, () =>
              h(
                Button,
                {
                  type: 'link',
                  size: 'small',
                  onClick: () => actions?.onView?.(row),
                },
                () => h('lucide:eye', { class: 'size-4' }),
              ),
            ),
            h(Tooltip, { title: '编辑' }, () =>
              h(
                Button,
                {
                  type: 'link',
                  size: 'small',
                  onClick: () => actions?.onEdit?.(row),
                },
                () => h('lucide:edit', { class: 'size-4' }),
              ),
            ),
            h(Tooltip, { title: '复制' }, () =>
              h(
                Button,
                {
                  type: 'link',
                  size: 'small',
                  onClick: () => actions?.onCopy?.(row),
                },
                () => h('lucide:copy', { class: 'size-4' }),
              ),
            ),
            h(Tooltip, { title: '删除' }, () =>
              h(
                Button,
                {
                  type: 'link',
                  size: 'small',
                  danger: true,
                  onClick: () => actions?.onDelete?.(row),
                },
                () => h('lucide:trash-2', { class: 'size-4' }),
              ),
            ),
          ]);
        },
      },
    },
  ];
}

/**
 * 获取需求搜索表单配置
 * @returns 表单配置
 */
export function getRequirementSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入需求标题',
      },
      fieldName: 'title',
      label: '需求标题',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: requirementTypeOptions,
        placeholder: '请选择需求类型',
      },
      fieldName: 'type',
      label: '需求类型',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: statusOptions,
        placeholder: '请选择状态',
      },
      fieldName: 'status',
      label: '状态',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: priorityOptions,
        placeholder: '请选择优先级',
      },
      fieldName: 'priority',
      label: '优先级',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: projectOptions,
        placeholder: '请选择项目',
      },
      fieldName: 'projectId',
      label: '所属项目',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: userOptions,
        placeholder: '请选择指派人',
      },
      fieldName: 'assignee',
      label: '指派人',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: reviewStatusOptions,
        placeholder: '请选择评审状态',
      },
      fieldName: 'reviewStatus',
      label: '评审状态',
    },
    {
      component: 'RangePicker',
      componentProps: {
        placeholder: ['开始日期', '结束日期'],
      },
      fieldName: 'dateRange',
      label: '创建时间',
    },
  ];
}

/**
 * 获取需求表单配置
 * @returns 表单配置
 */
export function getRequirementFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入需求标题',
      },
      fieldName: 'title',
      label: '需求标题',
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入需求描述',
        rows: 4,
      },
      fieldName: 'description',
      label: '需求描述',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: requirementTypeOptions,
        placeholder: '请选择需求类型',
      },
      fieldName: 'type',
      label: '需求类型',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: priorityOptions,
        placeholder: '请选择优先级',
      },
      fieldName: 'priority',
      label: '优先级',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: projectOptions,
        placeholder: '请选择关联项目',
      },
      fieldName: 'projectId',
      label: '关联项目',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: userOptions,
        placeholder: '请选择指派人',
      },
      fieldName: 'assignee',
      label: '指派人',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 0,
        placeholder: '请输入预估工时',
        style: { width: '100%' },
      },
      fieldName: 'estimatedHours',
      label: '预估工时(小时)',
    },
    {
      component: 'DatePicker',
      componentProps: {
        placeholder: '请选择截止日期',
        style: { width: '100%' },
      },
      fieldName: 'dueDate',
      label: '截止日期',
    },
    {
      component: 'Select',
      componentProps: {
        mode: 'multiple',
        options: userOptions,
        placeholder: '请选择评审人',
      },
      fieldName: 'reviewers',
      label: '评审人',
    },
    {
      component: 'Select',
      componentProps: {
        mode: 'tags',
        placeholder: '请输入标签',
      },
      fieldName: 'tags',
      label: '标签',
    },
    {
      component: 'Upload',
      componentProps: {
        action: '/api/upload',
        listType: 'text',
        multiple: true,
      },
      fieldName: 'attachments',
      label: '附件',
    },
  ];
}
