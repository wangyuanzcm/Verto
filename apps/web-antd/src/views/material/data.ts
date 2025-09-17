import type { VxeGridPropTypes } from 'vxe-table';

import type { VbenFormSchema } from '@vben/common-ui';

import { h } from 'vue';

import { Download, Edit, ExternalLink, Eye, Trash2 } from '@vben/icons';

import { Button, Rate, Space, Switch, Tag } from 'ant-design-vue';

/**
 * 表格列配置
 * @param onActionClick 操作按钮点击回调
 * @param onStatusChange 状态切换回调
 */
export function useColumns(
  onActionClick: (params: any) => void,
  onStatusChange: (status: string, row: any) => void,
): VxeGridPropTypes.Columns {
  return [
    {
      type: 'seq',
      width: 60,
      title: '序号',
    },
    {
      field: 'name',
      title: '物料名称',
      width: 200,
      slots: {
        default: ({ row }) => {
          return h('div', { class: 'flex items-center gap-2' }, [
            row.isOfficial && h(Tag, { color: 'gold' }, () => '官方'),
            h('span', { class: 'font-medium' }, row.name),
          ]);
        },
      },
    },
    {
      field: 'type',
      title: '类型',
      width: 100,
      slots: {
        default: ({ row }) => {
          const typeMap = {
            component: { color: 'blue', text: '组件' },
            snippet: { color: 'green', text: '代码片段' },
            template: { color: 'purple', text: '模板' },
            library: { color: 'orange', text: '库' },
          };
          const config = typeMap[row.type as keyof typeof typeMap];
          return h(Tag, { color: config.color }, () => config.text);
        },
      },
    },
    {
      field: 'category',
      title: '分类',
      width: 120,
    },
    {
      field: 'framework',
      title: '框架',
      width: 100,
      slots: {
        default: ({ row }) => {
          return h(Tag, { color: 'cyan' }, () => row.framework);
        },
      },
    },
    {
      field: 'language',
      title: '语言',
      width: 100,
    },
    {
      field: 'version',
      title: '版本',
      width: 100,
      slots: {
        default: ({ row }) => {
          return h(Tag, { color: 'geekblue' }, () => row.version);
        },
      },
    },
    {
      field: 'status',
      title: '状态',
      width: 120,
      slots: {
        default: ({ row }) => {
          return h(Switch, {
            checked: row.status === 'published',
            checkedChildren: '已发布',
            unCheckedChildren: '草稿',
            onChange: (checked: boolean) => {
              onStatusChange(checked ? 'published' : 'draft', row);
            },
          });
        },
      },
    },
    {
      field: 'downloadCount',
      title: '下载量',
      width: 100,
      slots: {
        default: ({ row }) => {
          return h(
            'span',
            { class: 'text-blue-600 font-medium' },
            row.downloadCount.toLocaleString(),
          );
        },
      },
    },
    {
      field: 'rating',
      title: '评分',
      width: 120,
      slots: {
        default: ({ row }) => {
          return h('div', { class: 'flex items-center gap-1' }, [
            h(Rate, {
              value: row.rating,
              disabled: true,
              allowHalf: true,
              style: { fontSize: '12px' },
            }),
            h('span', { class: 'text-xs text-gray-500' }, row.rating),
          ]);
        },
      },
    },
    {
      field: 'author',
      title: '作者',
      width: 120,
    },
    {
      field: 'tags',
      title: '标签',
      width: 200,
      slots: {
        default: ({ row }) => {
          return h(
            'div',
            { class: 'flex flex-wrap gap-1' },
            row.tags
              ?.slice(0, 3)
              .map((tag: string) =>
                h(Tag, { size: 'small', color: 'default' }, () => tag),
              ),
          );
        },
      },
    },
    {
      field: 'updateTime',
      title: '更新时间',
      width: 160,
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      slots: {
        default: ({ row }) => {
          return h(Space, { size: 'small' }, () => [
            h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => onActionClick({ code: 'view', row }),
              },
              () => [h(Eye, { class: 'size-3' }), '查看'],
            ),
            row.preview &&
              h(
                Button,
                {
                  size: 'small',
                  type: 'link',
                  onClick: () => onActionClick({ code: 'preview', row }),
                },
                () => [h(ExternalLink, { class: 'size-3' }), '预览'],
              ),
            h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => onActionClick({ code: 'download', row }),
              },
              () => [h(Download, { class: 'size-3' }), '下载'],
            ),
            h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => onActionClick({ code: 'edit', row }),
              },
              () => [h(Edit, { class: 'size-3' }), '编辑'],
            ),
            h(
              Button,
              {
                size: 'small',
                type: 'link',
                danger: true,
                onClick: () => onActionClick({ code: 'delete', row }),
              },
              () => [h(Trash2, { class: 'size-3' }), '删除'],
            ),
          ]);
        },
      },
    },
  ];
}

/**
 * 搜索表单配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入物料名称',
      },
      fieldName: 'name',
      label: '物料名称',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '组件', value: 'component' },
          { label: '代码片段', value: 'snippet' },
          { label: '模板', value: 'template' },
          { label: '库', value: 'library' },
        ],
        placeholder: '请选择物料类型',
      },
      fieldName: 'type',
      label: '类型',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: 'Vue3', value: 'Vue3' },
          { label: 'React', value: 'React' },
          { label: 'Angular', value: 'Angular' },
          { label: 'Vanilla', value: 'Vanilla' },
        ],
        placeholder: '请选择框架',
      },
      fieldName: 'framework',
      label: '框架',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: 'TypeScript', value: 'TypeScript' },
          { label: 'JavaScript', value: 'JavaScript' },
          { label: 'CSS', value: 'CSS' },
          { label: 'SCSS', value: 'SCSS' },
          { label: 'Less', value: 'Less' },
        ],
        placeholder: '请选择语言',
      },
      fieldName: 'language',
      label: '语言',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '已发布', value: 'published' },
          { label: '草稿', value: 'draft' },
          { label: '已废弃', value: 'deprecated' },
        ],
        placeholder: '请选择状态',
      },
      fieldName: 'status',
      label: '状态',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入作者',
      },
      fieldName: 'author',
      label: '作者',
    },
    {
      component: 'RangePicker',
      componentProps: {
        format: 'YYYY-MM-DD',
        placeholder: ['开始时间', '结束时间'],
        style: { width: '100%' },
      },
      fieldName: 'createTime',
      label: '创建时间',
    },
  ];
}

/**
 * 物料表单配置
 */
export function useMaterialFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入物料名称',
      },
      fieldName: 'name',
      label: '物料名称',
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入物料描述',
        rows: 3,
      },
      fieldName: 'description',
      label: '物料描述',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '组件', value: 'component' },
          { label: '代码片段', value: 'snippet' },
          { label: '模板', value: 'template' },
          { label: '库', value: 'library' },
        ],
        placeholder: '请选择物料类型',
      },
      fieldName: 'type',
      label: '类型',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入分类',
      },
      fieldName: 'category',
      label: '分类',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: 'Vue3', value: 'Vue3' },
          { label: 'React', value: 'React' },
          { label: 'Angular', value: 'Angular' },
          { label: 'Vanilla', value: 'Vanilla' },
        ],
        placeholder: '请选择框架',
      },
      fieldName: 'framework',
      label: '框架',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: 'TypeScript', value: 'TypeScript' },
          { label: 'JavaScript', value: 'JavaScript' },
          { label: 'CSS', value: 'CSS' },
          { label: 'SCSS', value: 'SCSS' },
          { label: 'Less', value: 'Less' },
        ],
        placeholder: '请选择语言',
      },
      fieldName: 'language',
      label: '语言',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入版本号，如：v1.0.0',
      },
      fieldName: 'version',
      label: '版本',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '已发布', value: 'published' },
          { label: '草稿', value: 'draft' },
          { label: '已废弃', value: 'deprecated' },
        ],
        placeholder: '请选择状态',
      },
      fieldName: 'status',
      label: '状态',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入作者',
      },
      fieldName: 'author',
      label: '作者',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入预览地址',
      },
      fieldName: 'preview',
      label: '预览地址',
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
      component: 'Select',
      componentProps: {
        mode: 'tags',
        placeholder: '请输入标签，按回车添加',
        tokenSeparators: [',', ' '],
      },
      fieldName: 'tags',
      label: '标签',
    },
    {
      component: 'Switch',
      componentProps: {
        checkedChildren: '是',
        unCheckedChildren: '否',
      },
      fieldName: 'isOfficial',
      label: '官方物料',
    },
  ];
}
