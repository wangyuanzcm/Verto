<template>
  <div :class="tableWrapperClasses">
    <!-- 表格工具栏 -->
    <div v-if="showToolbar" class="table-toolbar">
      <!-- 左侧工具 -->
      <div class="table-toolbar-left">
        <slot name="toolbar-left">
          <!-- 批量操作按钮 -->
          <div v-if="selectedRowKeys.length > 0" class="table-batch-actions">
            <span class="table-batch-count">已选择 {{ selectedRowKeys.length }} 项</span>
            <slot name="batch-actions" :selectedRowKeys="selectedRowKeys" :selectedRows="selectedRows">
              <a-button
                type="primary"
                danger
                size="small"
                @click="handleBatchDelete"
              >
                <template #icon>
                  <DeleteOutlined />
                </template>
                批量删除
              </a-button>
            </slot>
          </div>
        </slot>
      </div>
      
      <!-- 右侧工具 -->
      <div class="table-toolbar-right">
        <slot name="toolbar-right">
          <!-- 刷新按钮 -->
          <a-button
            v-if="showRefresh"
            type="text"
            size="small"
            @click="handleRefresh"
          >
            <template #icon>
              <ReloadOutlined />
            </template>
          </a-button>
          
          <!-- 列设置按钮 -->
          <a-button
            v-if="showColumnSetting"
            type="text"
            size="small"
            @click="handleColumnSetting"
          >
            <template #icon>
              <SettingOutlined />
            </template>
          </a-button>
          
          <!-- 全屏按钮 -->
          <a-button
            v-if="showFullscreen"
            type="text"
            size="small"
            @click="handleFullscreen"
          >
            <template #icon>
              <FullscreenOutlined v-if="!isFullscreen" />
              <FullscreenExitOutlined v-else />
            </template>
          </a-button>
        </slot>
      </div>
    </div>
    
    <!-- Ant Design Vue 表格 -->
    <a-table
      :columns="processedColumns"
      :data-source="dataSource"
      :row-key="rowKey"
      :row-selection="processedRowSelection"
      :pagination="processedPagination"
      :loading="loading"
      :size="size"
      :bordered="bordered"
      :show-header="showHeader"
      :scroll="scroll"
      :row-class-name="getRowClassName"
      :custom-row="getCustomRow"
      :locale="locale"
      :class="customClass"
      @change="handleTableChange"
      @expand="handleExpand"
      @expandedRowsChange="handleExpandedRowsChange"
    >
      <!-- 自定义列插槽 -->
      <template
        v-for="column in columns.filter(col => col.slot)"
        :key="column.key || column.dataIndex"
        #[column.slot]="{ record, index, text }"
      >
        <slot
          :name="column.slot"
          :record="record"
          :index="index"
          :text="text"
          :value="text"
        />
      </template>
      
      <!-- 空数据插槽 -->
      <template #emptyText>
        <slot name="empty">
          <div class="table-empty-content">
            <InboxOutlined class="table-empty-icon" />
            <p class="table-empty-text">{{ emptyText }}</p>
          </div>
        </slot>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  DeleteOutlined,
  ReloadOutlined,
  SettingOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  InboxOutlined
} from '@ant-design/icons-vue'

/**
 * 表格列配置接口
 */
interface TableColumn {
  /** 列标题 */
  title: string
  /** 数据索引 */
  dataIndex?: string
  /** 列键值 */
  key?: string
  /** 列宽度 */
  width?: number | string
  /** 最小宽度 */
  minWidth?: number | string
  /** 最大宽度 */
  maxWidth?: number | string
  /** 是否固定列 */
  fixed?: 'left' | 'right' | boolean
  /** 文本对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 是否可排序 */
  sorter?: boolean | ((a: any, b: any) => number)
  /** 排序方向 */
  sortOrder?: 'ascend' | 'descend' | null
  /** 筛选器 */
  filters?: Array<{ text: string; value: any }>
  /** 筛选值 */
  filteredValue?: any[]
  /** 自定义渲染插槽 */
  slot?: string
  /** 是否可调整大小 */
  resizable?: boolean
  /** 是否显示 */
  visible?: boolean
  /** 列样式类名 */
  className?: string
  /** 自定义渲染函数 */
  customRender?: (value: any, record: any, index: number) => any
  /** 是否省略 */
  ellipsis?: boolean
}

/**
 * 行选择配置接口
 */
interface RowSelection {
  /** 选择类型 */
  type?: 'checkbox' | 'radio'
  /** 选中的行键值 */
  selectedRowKeys?: (string | number)[]
  /** 选择变化回调 */
  onChange?: (selectedRowKeys: (string | number)[], selectedRows: any[]) => void
  /** 选择所有回调 */
  onSelectAll?: (selected: boolean, selectedRows: any[], changeRows: any[]) => void
  /** 选择行回调 */
  onSelect?: (record: any, selected: boolean, selectedRows: any[], nativeEvent: Event) => void
  /** 获取选择框属性 */
  getCheckboxProps?: (record: any) => { disabled?: boolean; name?: string }
  /** 固定选择列 */
  fixed?: boolean
  /** 选择列宽度 */
  columnWidth?: number | string
  /** 选择列标题 */
  columnTitle?: string
}

/**
 * 分页配置接口
 */
interface PaginationConfig {
  /** 当前页码 */
  current?: number
  /** 每页条数 */
  pageSize?: number
  /** 总条数 */
  total?: number
  /** 是否显示每页条数选择器 */
  showSizeChanger?: boolean
  /** 是否显示快速跳转 */
  showQuickJumper?: boolean
  /** 是否显示总数 */
  showTotal?: boolean | ((total: number, range: [number, number]) => string)
  /** 每页条数选项 */
  pageSizeOptions?: string[]
  /** 分页器位置 */
  position?: ['topLeft' | 'topCenter' | 'topRight', 'bottomLeft' | 'bottomCenter' | 'bottomRight']
  /** 分页器尺寸 */
  size?: 'default' | 'small'
}

/**
 * 表格组件属性接口
 */
interface TableProps {
  /** 表格列配置 */
  columns: TableColumn[]
  /** 表格数据 */
  dataSource?: any[]
  /** 行键值字段 */
  rowKey?: string | ((record: any) => string)
  /** 是否加载中 */
  loading?: boolean
  /** 表格尺寸 */
  size?: 'default' | 'middle' | 'small'
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否显示表头 */
  showHeader?: boolean
  /** 行选择配置 */
  rowSelection?: RowSelection
  /** 分页配置 */
  pagination?: PaginationConfig | false
  /** 滚动配置 */
  scroll?: { x?: number | string; y?: number | string }
  /** 空数据文本 */
  emptyText?: string
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 是否显示刷新按钮 */
  showRefresh?: boolean
  /** 是否显示列设置按钮 */
  showColumnSetting?: boolean
  /** 是否显示全屏按钮 */
  showFullscreen?: boolean
  /** 国际化配置 */
  locale?: any
  /** 自定义类名 */
  customClass?: string
}

/**
 * 表格组件事件接口
 */
interface TableEmits {
  /** 表格变化事件 */
  (e: 'change', pagination: any, filters: any, sorter: any, extra: any): void
  /** 行点击事件 */
  (e: 'row-click', record: any, index: number): void
  /** 行双击事件 */
  (e: 'row-dblclick', record: any, index: number): void
  /** 选择变化事件 */
  (e: 'selection-change', selectedRowKeys: (string | number)[], selectedRows: any[]): void
  /** 展开事件 */
  (e: 'expand', expanded: boolean, record: any): void
  /** 展开行变化事件 */
  (e: 'expanded-rows-change', expandedRows: (string | number)[]): void
  /** 刷新事件 */
  (e: 'refresh'): void
  /** 批量删除事件 */
  (e: 'batch-delete', selectedRowKeys: (string | number)[], selectedRows: any[]): void
}

// 定义属性和事件
const props = withDefaults(defineProps<TableProps>(), {
  dataSource: () => [],
  rowKey: 'id',
  loading: false,
  size: 'default',
  bordered: false,
  showHeader: true,
  pagination: () => ({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
    pageSizeOptions: ['10', '20', '50', '100']
  }),
  emptyText: '暂无数据',
  showToolbar: true,
  showRefresh: true,
  showColumnSetting: true,
  showFullscreen: true
})

const emit = defineEmits<TableEmits>()

// 响应式数据
const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<any[]>([])
const isFullscreen = ref(false)

/**
 * 计算处理后的列配置
 */
const processedColumns = computed(() => {
  return props.columns.map(column => ({
    ...column,
    // 转换排序字段
    sortOrder: column.sortOrder === 'asc' ? 'ascend' : 
               column.sortOrder === 'desc' ? 'descend' : null
  }))
})

/**
 * 计算处理后的行选择配置
 */
const processedRowSelection = computed(() => {
  if (!props.rowSelection) return undefined
  
  return {
    ...props.rowSelection,
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: (string | number)[], rows: any[]) => {
      selectedRowKeys.value = keys
      selectedRows.value = rows
      emit('selection-change', keys, rows)
      props.rowSelection?.onChange?.(keys, rows)
    },
    onSelect: (record: any, selected: boolean, rows: any[], nativeEvent: Event) => {
      props.rowSelection?.onSelect?.(record, selected, rows, nativeEvent)
    },
    onSelectAll: (selected: boolean, rows: any[], changeRows: any[]) => {
      props.rowSelection?.onSelectAll?.(selected, rows, changeRows)
    }
  }
})

/**
 * 计算处理后的分页配置
 */
const processedPagination = computed(() => {
  if (props.pagination === false) return false
  
  return {
    ...props.pagination,
    showTotal: (total: number, range: [number, number]) => {
      if (typeof props.pagination?.showTotal === 'function') {
        return props.pagination.showTotal(total, range)
      }
      return `共 ${total} 条，第 ${range[0]}-${range[1]} 条`
    }
  }
})

/**
 * 计算表格包装器样式类名
 */
const tableWrapperClasses = computed(() => {
  return [
    'table-wrapper',
    `table-wrapper-${props.size}`,
    {
      'table-wrapper-bordered': props.bordered,
      'table-wrapper-loading': props.loading,
      'table-wrapper-fullscreen': isFullscreen.value
    },
    props.customClass
  ]
})

/**
 * 获取行类名
 * @param record 行数据
 * @param index 行索引
 */
const getRowClassName = (record: any, index: number): string => {
  const classes = [
    'table-row',
    {
      'table-row-selected': selectedRowKeys.value.includes(
        typeof props.rowKey === 'function' ? props.rowKey(record) : record[props.rowKey]
      ),
      'table-row-even': index % 2 === 0,
      'table-row-odd': index % 2 === 1
    }
  ]
  
  return classes.filter(Boolean).join(' ')
}

/**
 * 获取自定义行属性
 * @param record 行数据
 * @param index 行索引
 */
const getCustomRow = (record: any, index: number) => {
  return {
    onClick: () => {
      emit('row-click', record, index)
    },
    onDblclick: () => {
      emit('row-dblclick', record, index)
    }
  }
}

/**
 * 处理表格变化
 * @param pagination 分页配置
 * @param filters 筛选配置
 * @param sorter 排序配置
 * @param extra 额外信息
 */
const handleTableChange = (pagination: any, filters: any, sorter: any, extra: any) => {
  emit('change', pagination, filters, sorter, extra)
}

/**
 * 处理展开
 * @param expanded 是否展开
 * @param record 行数据
 */
const handleExpand = (expanded: boolean, record: any) => {
  emit('expand', expanded, record)
}

/**
 * 处理展开行变化
 * @param expandedRows 展开的行
 */
const handleExpandedRowsChange = (expandedRows: (string | number)[]) => {
  emit('expanded-rows-change', expandedRows)
}

/**
 * 处理刷新
 */
const handleRefresh = () => {
  emit('refresh')
}

/**
 * 处理批量删除
 */
const handleBatchDelete = () => {
  emit('batch-delete', selectedRowKeys.value, selectedRows.value)
}

/**
 * 处理列设置
 */
const handleColumnSetting = () => {
  // TODO: 实现列设置逻辑
  console.log('Column setting')
}

/**
 * 处理全屏
 */
const handleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  
  if (isFullscreen.value) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

// 监听行选择配置变化
watch(() => props.rowSelection?.selectedRowKeys, (newKeys) => {
  if (newKeys) {
    selectedRowKeys.value = [...newKeys]
  }
}, { immediate: true })

// 暴露方法
defineExpose({
  selectedRowKeys,
  selectedRows,
  clearSelection: () => {
    selectedRowKeys.value = []
    selectedRows.value = []
  },
  selectAll: () => {
    const allKeys = props.dataSource.map((record, index) => 
      typeof props.rowKey === 'function' ? props.rowKey(record) : record[props.rowKey]
    )
    selectedRowKeys.value = allKeys
    selectedRows.value = [...props.dataSource]
  },
  refresh: handleRefresh
})
</script>

<style scoped>
.table-wrapper {
  @apply w-full;
}

.table-toolbar {
  @apply flex items-center justify-between mb-4 px-4 py-2 bg-gray-50 rounded-t-lg border border-b-0 border-gray-200;
}

.table-toolbar-left,
.table-toolbar-right {
  @apply flex items-center space-x-2;
}

.table-container {
  @apply overflow-x-auto;
}

.table-container-bordered {
  @apply border border-gray-200 rounded-lg;
}

.table {
  @apply w-full table-auto;
}

.table-bordered {
  @apply border-collapse;
}

.table-striped tbody tr:nth-child(even) {
  @apply bg-gray-50;
}

.table-hoverable tbody tr:hover {
  @apply bg-gray-100;
}

/* 表格尺寸 */
.table-small .table-cell {
  @apply px-2 py-1 text-xs;
}

.table-medium .table-cell {
  @apply px-3 py-2 text-sm;
}

.table-large .table-cell {
  @apply px-4 py-3 text-base;
}

/* 表头样式 */
.table-header {
  @apply bg-gray-100;
}

.table-header-cell {
  @apply font-semibold text-gray-900 border-b border-gray-200;
}

.table-header-content {
  @apply flex items-center justify-between;
}

.table-header-title {
  @apply flex-1;
}

.table-sort-icon,
.table-filter-icon {
  @apply ml-1 text-gray-400 cursor-pointer hover:text-gray-600;
}

.table-cell-sortable {
  @apply cursor-pointer hover:bg-gray-200;
}

/* 表体样式 */
.table-body {
  @apply bg-white;
}

.table-row {
  @apply border-b border-gray-200 transition-colors duration-200;
}

.table-row-selected {
  @apply bg-blue-50;
}

.table-cell {
  @apply px-3 py-2 text-sm text-gray-900 whitespace-nowrap;
}

.table-cell-content {
  @apply truncate;
}

/* 对齐方式 */
.table-cell-left {
  @apply text-left;
}

.table-cell-center {
  @apply text-center;
}

.table-cell-right {
  @apply text-right;
}

/* 特殊列样式 */
.table-cell-selection {
  @apply w-12 text-center;
}

.table-cell-index {
  @apply w-16 text-center text-gray-500;
}

.table-cell-actions {
  @apply w-24 text-center;
}

.table-actions {
  @apply flex items-center justify-center space-x-1;
}

/* 固定列样式 */
.table-cell-fixed-left {
  @apply sticky left-0 bg-white z-10;
}

.table-cell-fixed-right {
  @apply sticky right-0 bg-white z-10;
}

/* 空数据和加载状态 */
.table-empty,
.table-loading {
  @apply text-center py-8;
}

.table-empty-content {
  @apply flex flex-col items-center justify-center text-gray-500;
}

.table-empty-icon {
  @apply mb-2 text-gray-300;
}

.table-empty-text {
  @apply text-sm;
}

.table-loading-content {
  @apply flex items-center justify-center text-gray-500;
}

/* 分页器 */
.table-pagination {
  @apply mt-4 flex justify-end;
}

/* 暗色主题支持 */
.dark .table-toolbar {
  @apply bg-gray-800 border-gray-700;
}

.dark .table-container-bordered {
  @apply border-gray-700;
}

.dark .table-striped tbody tr:nth-child(even) {
  @apply bg-gray-800;
}

.dark .table-hoverable tbody tr:hover {
  @apply bg-gray-700;
}

.dark .table-header {
  @apply bg-gray-800;
}

.dark .table-header-cell {
  @apply text-gray-100 border-gray-700;
}

.dark .table-body {
  @apply bg-gray-900;
}

.dark .table-row {
  @apply border-gray-700;
}

.dark .table-row-selected {
  @apply bg-blue-900;
}

.dark .table-cell {
  @apply text-gray-100;
}

.dark .table-cell-index {
  @apply text-gray-400;
}

.dark .table-cell-fixed-left,
.dark .table-cell-fixed-right {
  @apply bg-gray-900;
}

.dark .table-empty-content,
.dark .table-loading-content {
  @apply text-gray-400;
}

.dark .table-empty-icon {
  @apply text-gray-600;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .table-toolbar {
    @apply flex-col space-y-2 items-stretch;
  }
  
  .table-toolbar-left,
  .table-toolbar-right {
    @apply justify-center;
  }
  
  .table-cell {
    @apply px-2 py-1 text-xs;
  }
  
  .table-actions {
    @apply flex-col space-x-0 space-y-1;
  }
}

/* 滚动条样式 */
.table-container::-webkit-scrollbar {
  @apply h-2;
}

.table-container::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded;
}

.table-container::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded hover:bg-gray-400;
}

.dark .table-container::-webkit-scrollbar-track {
  @apply bg-gray-700;
}

.dark .table-container::-webkit-scrollbar-thumb {
  @apply bg-gray-600 hover:bg-gray-500;
}
</style>