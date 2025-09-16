/**
 * 通用组件类型定义
 */

/**
 * 按钮组件属性接口
 */
export interface ButtonProps {
  /** 按钮类型 */
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link'
  /** 按钮大小 */
  size?: 'large' | 'middle' | 'small'
  /** 按钮形状 */
  shape?: 'default' | 'circle' | 'round'
  /** 是否为危险按钮 */
  danger?: boolean
  /** 是否为幽灵按钮 */
  ghost?: boolean
  /** 是否为块级按钮 */
  block?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 图标 */
  icon?: string
  /** HTML类型 */
  htmlType?: 'button' | 'submit' | 'reset'
  /** 自定义样式类名 */
  customClass?: string
}

/**
 * 图标组件属性接口
 */
export interface IconProps {
  /** 图标名称 */
  name: string
  /** 图标大小 */
  size?: 'small' | 'medium' | 'large' | number | string
  /** 图标颜色 */
  color?: string
  /** 是否旋转 */
  spin?: boolean
  /** 旋转角度 */
  rotate?: number
  /** 双色图标颜色 */
  twoToneColor?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义样式类名 */
  customClass?: string
}

/**
 * 输入框组件属性接口
 */
export interface InputProps {
  /** 输入框值 */
  value?: string
  /** 输入框类型 */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  /** 输入框大小 */
  size?: 'large' | 'middle' | 'small'
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否必填 */
  required?: boolean
  /** 最大长度 */
  maxlength?: number
  /** 是否显示字数统计 */
  showCount?: boolean
  /** 是否允许清除 */
  allowClear?: boolean
  /** 前缀图标 */
  prefixIcon?: string
  /** 后缀图标 */
  suffixIcon?: string
  /** 标签文本 */
  label?: string
  /** 帮助文本 */
  helpText?: string
  /** 错误文本 */
  errorText?: string
  /** 验证状态 */
  status?: 'error' | 'warning' | 'success' | 'validating'
  /** 自定义样式类名 */
  customClass?: string
}

/**
 * 模态框组件属性接口
 */
export interface ModalProps {
  /** 是否可见 */
  visible?: boolean
  /** 标题 */
  title?: string
  /** 宽度 */
  width?: string | number
  /** 高度 */
  height?: string | number
  /** 是否显示关闭按钮 */
  closable?: boolean
  /** 是否显示遮罩 */
  mask?: boolean
  /** 点击遮罩是否关闭 */
  maskClosable?: boolean
  /** 是否支持键盘ESC关闭 */
  keyboard?: boolean
  /** 是否居中显示 */
  centered?: boolean
  /** 是否可拖拽 */
  draggable?: boolean
  /** 是否可调整大小 */
  resizable?: boolean
  /** 确认按钮文字 */
  okText?: string
  /** 取消按钮文字 */
  cancelText?: string
  /** 确认按钮类型 */
  okType?: 'primary' | 'default' | 'dashed' | 'text' | 'link'
  /** 确认按钮是否加载中 */
  confirmLoading?: boolean
  /** 是否显示底部按钮 */
  footer?: boolean
  /** 自定义样式类名 */
  customClass?: string
}

/**
 * 表格列配置接口
 */
export interface TableColumn {
  /** 列标题 */
  title: string
  /** 列数据索引 */
  dataIndex: string
  /** 列键值 */
  key?: string
  /** 列宽度 */
  width?: string | number
  /** 列最小宽度 */
  minWidth?: string | number
  /** 列最大宽度 */
  maxWidth?: string | number
  /** 是否固定列 */
  fixed?: 'left' | 'right' | boolean
  /** 列对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 是否可排序 */
  sortable?: boolean
  /** 是否可筛选 */
  filterable?: boolean
  /** 筛选选项 */
  filters?: Array<{ text: string; value: any }>
  /** 是否可调整列宽 */
  resizable?: boolean
  /** 自定义渲染函数 */
  render?: (value: any, record: any, index: number) => any
  /** 自定义样式类名 */
  customClass?: string
}

/**
 * 表格组件属性接口
 */
export interface TableProps {
  /** 表格数据 */
  dataSource?: any[]
  /** 表格列配置 */
  columns?: TableColumn[]
  /** 行键值字段 */
  rowKey?: string | ((record: any) => string)
  /** 是否显示边框 */
  bordered?: boolean
  /** 表格大小 */
  size?: 'large' | 'middle' | 'small'
  /** 是否显示表头 */
  showHeader?: boolean
  /** 是否可选择行 */
  rowSelection?: {
    type?: 'checkbox' | 'radio'
    selectedRowKeys?: any[]
    onChange?: (selectedRowKeys: any[], selectedRows: any[]) => void
    onSelect?: (record: any, selected: boolean, selectedRows: any[]) => void
    onSelectAll?: (selected: boolean, selectedRows: any[], changeRows: any[]) => void
  }
  /** 是否可展开行 */
  expandable?: {
    expandedRowKeys?: any[]
    onExpand?: (expanded: boolean, record: any) => void
    onExpandedRowsChange?: (expandedRows: any[]) => void
  }
  /** 分页配置 */
  pagination?: {
    current?: number
    pageSize?: number
    total?: number
    showSizeChanger?: boolean
    showQuickJumper?: boolean
    showTotal?: boolean
  } | false
  /** 加载状态 */
  loading?: boolean
  /** 空数据提示 */
  emptyText?: string
  /** 滚动配置 */
  scroll?: {
    x?: string | number | boolean
    y?: string | number
  }
  /** 自定义样式类名 */
  customClass?: string
}

/**
 * 分页组件属性接口
 */
export interface PaginationProps {
  /** 当前页码 */
  current?: number
  /** 每页条数 */
  pageSize?: number
  /** 总条数 */
  total: number
  /** 每页条数选项 */
  pageSizeOptions?: string[]
  /** 是否显示总数 */
  showTotal?: boolean
  /** 是否显示每页条数选择器 */
  showSizeChanger?: boolean
  /** 是否显示快速跳转 */
  showQuickJumper?: boolean
  /** 简单模式 */
  simple?: boolean
  /** 分页器大小 */
  size?: 'small' | 'default'
  /** 是否禁用 */
  disabled?: boolean
  /** 只有一页时是否隐藏 */
  hideOnSinglePage?: boolean
  /** 响应式 */
  responsive?: boolean
}

/**
 * 通用事件接口
 */
export interface CommonEvents {
  /** 点击事件 */
  onClick?: (event: MouseEvent) => void
  /** 变化事件 */
  onChange?: (value: any) => void
  /** 输入事件 */
  onInput?: (value: any) => void
  /** 焦点事件 */
  onFocus?: (event: FocusEvent) => void
  /** 失焦事件 */
  onBlur?: (event: FocusEvent) => void
}

/**
 * 组件状态类型
 */
export type ComponentStatus = 'error' | 'warning' | 'success' | 'validating' | 'default'

/**
 * 组件大小类型
 */
export type ComponentSize = 'large' | 'middle' | 'small'

/**
 * 组件主题类型
 */
export type ComponentTheme = 'light' | 'dark' | 'auto'