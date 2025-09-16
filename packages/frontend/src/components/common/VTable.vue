<template>
  <div class="v-table">
    <!-- 表格工具栏 -->
    <div v-if="showToolbar" class="v-table__toolbar">
      <div class="v-table__toolbar-left">
        <slot name="toolbar-left">
          <h3 v-if="title" class="v-table__title">{{ title }}</h3>
        </slot>
      </div>
      <div class="v-table__toolbar-right">
        <slot name="toolbar-right">
          <!-- 搜索框 -->
          <el-input
            v-if="searchable"
            v-model="searchKeyword"
            :placeholder="searchPlaceholder"
            class="v-table__search"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <!-- 刷新按钮 -->
          <VButton
            v-if="refreshable"
            type="default"
            :icon="Refresh"
            :loading="loading"
            @click="handleRefresh"
          >
            刷新
          </VButton>
          
          <!-- 列设置 -->
          <el-popover
            v-if="columnSettable"
            placement="bottom-end"
            :width="200"
            trigger="click"
          >
            <template #reference>
              <VButton type="default" :icon="Setting">
                列设置
              </VButton>
            </template>
            <div class="v-table__column-settings">
              <el-checkbox
                v-for="col in settableColumns"
                :key="col.prop"
                v-model="col.visible"
                :label="col.label"
                @change="handleColumnVisibilityChange"
              />
            </div>
          </el-popover>
        </slot>
      </div>
    </div>
    
    <!-- 表格主体 -->
    <div class="v-table__wrapper">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="displayData"
        :height="height"
        :max-height="maxHeight"
        :stripe="stripe"
        :border="border"
        :size="size"
        :fit="fit"
        :show-header="showHeader"
        :highlight-current-row="highlightCurrentRow"
        :row-class-name="rowClassName"
        :row-style="rowStyle"
        :cell-class-name="cellClassName"
        :cell-style="cellStyle"
        :header-row-class-name="headerRowClassName"
        :header-row-style="headerRowStyle"
        :header-cell-class-name="headerCellClassName"
        :header-cell-style="headerCellStyle"
        :row-key="rowKey"
        :empty-text="emptyText"
        :default-expand-all="defaultExpandAll"
        :expand-row-keys="expandRowKeys"
        :default-sort="defaultSort"
        :tooltip-effect="tooltipEffect"
        :show-summary="showSummary"
        :sum-text="sumText"
        :summary-method="summaryMethod"
        :span-method="spanMethod"
        :select-on-indeterminate="selectOnIndeterminate"
        :indent="indent"
        :lazy="lazy"
        :load="load"
        :tree-props="treeProps"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange"
        @cell-mouse-enter="handleCellMouseEnter"
        @cell-mouse-leave="handleCellMouseLeave"
        @cell-click="handleCellClick"
        @cell-dblclick="handleCellDblclick"
        @row-click="handleRowClick"
        @row-contextmenu="handleRowContextmenu"
        @row-dblclick="handleRowDblclick"
        @header-click="handleHeaderClick"
        @header-contextmenu="handleHeaderContextmenu"
        @sort-change="handleSortChange"
        @filter-change="handleFilterChange"
        @current-change="handleCurrentChange"
        @header-dragend="handleHeaderDragend"
        @expand-change="handleExpandChange"
      >
        <!-- 选择列 -->
        <el-table-column
          v-if="selectable"
          type="selection"
          :width="selectionWidth"
          :fixed="selectionFixed"
          :selectable="selectableFunction"
        />
        
        <!-- 索引列 -->
        <el-table-column
          v-if="showIndex"
          type="index"
          :label="indexLabel"
          :width="indexWidth"
          :fixed="indexFixed"
          :index="indexMethod"
        />
        
        <!-- 展开列 -->
        <el-table-column
          v-if="expandable"
          type="expand"
          :width="expandWidth"
          :fixed="expandFixed"
        >
          <template #default="{ row, $index }">
            <slot name="expand" :row="row" :index="$index" />
          </template>
        </el-table-column>
        
        <!-- 数据列 -->
        <template v-for="column in visibleColumns" :key="column.prop">
          <el-table-column
            v-if="!column.children"
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth"
            :fixed="column.fixed"
            :render-header="column.renderHeader"
            :sortable="column.sortable"
            :sort-method="column.sortMethod"
            :sort-by="column.sortBy"
            :sort-orders="column.sortOrders"
            :resizable="column.resizable"
            :formatter="column.formatter"
            :show-overflow-tooltip="column.showOverflowTooltip"
            :align="column.align"
            :header-align="column.headerAlign"
            :class-name="column.className"
            :label-class-name="column.labelClassName"
            :filters="column.filters"
            :filter-placement="column.filterPlacement"
            :filter-multiple="column.filterMultiple"
            :filter-method="column.filterMethod"
            :filtered-value="column.filteredValue"
          >
            <template v-if="column.slot" #default="scope">
              <slot :name="column.slot" v-bind="scope" />
            </template>
            <template v-else-if="column.render" #default="scope">
              <component :is="column.render(scope.row, scope.column, scope.cellValue, scope.$index)" />
            </template>
          </el-table-column>
          
          <!-- 多级表头 -->
          <el-table-column
            v-else
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth"
            :fixed="column.fixed"
            :align="column.align"
            :header-align="column.headerAlign"
            :class-name="column.className"
            :label-class-name="column.labelClassName"
          >
            <template v-for="child in column.children" :key="child.prop">
              <el-table-column
                :prop="child.prop"
                :label="child.label"
                :width="child.width"
                :min-width="child.minWidth"
                :fixed="child.fixed"
                :render-header="child.renderHeader"
                :sortable="child.sortable"
                :sort-method="child.sortMethod"
                :sort-by="child.sortBy"
                :sort-orders="child.sortOrders"
                :resizable="child.resizable"
                :formatter="child.formatter"
                :show-overflow-tooltip="child.showOverflowTooltip"
                :align="child.align"
                :header-align="child.headerAlign"
                :class-name="child.className"
                :label-class-name="child.labelClassName"
                :filters="child.filters"
                :filter-placement="child.filterPlacement"
                :filter-multiple="child.filterMultiple"
                :filter-method="child.filterMethod"
                :filtered-value="child.filteredValue"
              >
                <template v-if="child.slot" #default="scope">
                  <slot :name="child.slot" v-bind="scope" />
                </template>
                <template v-else-if="child.render" #default="scope">
                  <component :is="child.render(scope.row, scope.column, scope.cellValue, scope.$index)" />
                </template>
              </el-table-column>
            </template>
          </el-table-column>
        </template>
        
        <!-- 操作列 -->
        <el-table-column
          v-if="$slots.actions"
          :label="actionsLabel"
          :width="actionsWidth"
          :min-width="actionsMinWidth"
          :fixed="actionsFixed"
          :align="actionsAlign"
          class-name="v-table__actions"
        >
          <template #default="scope">
            <slot name="actions" v-bind="scope" />
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 分页器 -->
    <div v-if="pagination && total > 0" class="v-table__pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        :background="paginationBackground"
        :small="paginationSmall"
        :disabled="loading"
        @size-change="handleSizeChange"
        @current-change="handleCurrentPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, type Ref } from 'vue'
import { ElTable, ElTableColumn, ElInput, ElIcon, ElCheckbox, ElPopover, ElPagination } from 'element-plus'
import { Search, Refresh, Setting } from '@element-plus/icons-vue'
import VButton from './VButton.vue'
import { debounce } from '@/utils'

/**
 * 自定义表格组件
 * 基于Element Plus Table扩展，提供更多功能和自定义选项
 */

// 表格列接口
interface TableColumn {
  prop?: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  renderHeader?: Function
  sortable?: boolean | 'custom'
  sortMethod?: Function
  sortBy?: string | string[] | Function
  sortOrders?: string[]
  resizable?: boolean
  formatter?: Function
  showOverflowTooltip?: boolean
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  className?: string
  labelClassName?: string
  filters?: Array<{ text: string; value: any }>
  filterPlacement?: string
  filterMultiple?: boolean
  filterMethod?: Function
  filteredValue?: any[]
  slot?: string
  render?: Function
  visible?: boolean
  children?: TableColumn[]
}

// 定义组件属性
interface Props {
  /** 表格数据 */
  data: any[]
  /** 表格列配置 */
  columns: TableColumn[]
  /** 表格标题 */
  title?: string
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 是否可搜索 */
  searchable?: boolean
  /** 搜索占位符 */
  searchPlaceholder?: string
  /** 是否可刷新 */
  refreshable?: boolean
  /** 是否可设置列 */
  columnSettable?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 表格高度 */
  height?: string | number
  /** 表格最大高度 */
  maxHeight?: string | number
  /** 是否为斑马纹表格 */
  stripe?: boolean
  /** 是否带有纵向边框 */
  border?: boolean
  /** 表格尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 列的宽度是否自撑开 */
  fit?: boolean
  /** 是否显示表头 */
  showHeader?: boolean
  /** 是否要高亮当前行 */
  highlightCurrentRow?: boolean
  /** 行的className的回调方法 */
  rowClassName?: string | Function
  /** 行的style的回调方法 */
  rowStyle?: object | Function
  /** 单元格的className的回调方法 */
  cellClassName?: string | Function
  /** 单元格的style的回调方法 */
  cellStyle?: object | Function
  /** 表头行的className的回调方法 */
  headerRowClassName?: string | Function
  /** 表头行的style的回调方法 */
  headerRowStyle?: object | Function
  /** 表头单元格的className的回调方法 */
  headerCellClassName?: string | Function
  /** 表头单元格的style的回调方法 */
  headerCellStyle?: object | Function
  /** 行数据的Key */
  rowKey?: string | Function
  /** 空数据时显示的文本内容 */
  emptyText?: string
  /** 是否默认展开所有行 */
  defaultExpandAll?: boolean
  /** 可以通过该属性设置目前的展开行 */
  expandRowKeys?: any[]
  /** 默认的排序列的prop和顺序 */
  defaultSort?: object
  /** tooltip effect属性 */
  tooltipEffect?: 'dark' | 'light'
  /** 是否在表尾显示合计行 */
  showSummary?: boolean
  /** 合计行第一列的文本 */
  sumText?: string
  /** 自定义的合计计算方法 */
  summaryMethod?: Function
  /** 合并行或列的计算方法 */
  spanMethod?: Function
  /** 在多选表格中，当仅有部分行被选中时，点击表头的多选框时的行为 */
  selectOnIndeterminate?: boolean
  /** 展示树形数据时，树节点的缩进 */
  indent?: number
  /** 是否懒加载子节点数据 */
  lazy?: boolean
  /** 加载子节点数据的函数 */
  load?: Function
  /** 渲染嵌套数据的配置选项 */
  treeProps?: object
  /** 是否可选择 */
  selectable?: boolean
  /** 选择列宽度 */
  selectionWidth?: string | number
  /** 选择列是否固定 */
  selectionFixed?: boolean | 'left' | 'right'
  /** 仅对type=selection的列有效，类型为Function，Function的返回值用来决定这一行的CheckBox是否可以勾选 */
  selectableFunction?: Function
  /** 是否显示索引 */
  showIndex?: boolean
  /** 索引列标题 */
  indexLabel?: string
  /** 索引列宽度 */
  indexWidth?: string | number
  /** 索引列是否固定 */
  indexFixed?: boolean | 'left' | 'right'
  /** 自定义索引 */
  indexMethod?: Function
  /** 是否可展开 */
  expandable?: boolean
  /** 展开列宽度 */
  expandWidth?: string | number
  /** 展开列是否固定 */
  expandFixed?: boolean | 'left' | 'right'
  /** 操作列标题 */
  actionsLabel?: string
  /** 操作列宽度 */
  actionsWidth?: string | number
  /** 操作列最小宽度 */
  actionsMinWidth?: string | number
  /** 操作列是否固定 */
  actionsFixed?: boolean | 'left' | 'right'
  /** 操作列对齐方式 */
  actionsAlign?: 'left' | 'center' | 'right'
  /** 是否显示分页 */
  pagination?: boolean
  /** 总条数 */
  total?: number
  /** 当前页码 */
  currentPage?: number
  /** 每页显示条目个数 */
  pageSize?: number
  /** 每页显示个数选择器的选项设置 */
  pageSizes?: number[]
  /** 分页组件布局 */
  paginationLayout?: string
  /** 是否为分页按钮添加背景色 */
  paginationBackground?: boolean
  /** 是否使用小型分页样式 */
  paginationSmall?: boolean
}

// 定义默认值
const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  columns: () => [],
  showToolbar: true,
  searchable: true,
  searchPlaceholder: '请输入关键词搜索',
  refreshable: true,
  columnSettable: true,
  loading: false,
  stripe: true,
  border: true,
  size: 'default',
  fit: true,
  showHeader: true,
  highlightCurrentRow: false,
  emptyText: '暂无数据',
  defaultExpandAll: false,
  tooltipEffect: 'dark',
  showSummary: false,
  sumText: '合计',
  selectOnIndeterminate: true,
  indent: 16,
  lazy: false,
  selectable: false,
  selectionWidth: 55,
  selectionFixed: 'left',
  showIndex: false,
  indexLabel: '#',
  indexWidth: 60,
  indexFixed: 'left',
  expandable: false,
  expandWidth: 55,
  expandFixed: 'left',
  actionsLabel: '操作',
  actionsWidth: 120,
  actionsMinWidth: 120,
  actionsFixed: 'right',
  actionsAlign: 'center',
  pagination: true,
  total: 0,
  currentPage: 1,
  pageSize: 20,
  pageSizes: () => [10, 20, 50, 100],
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  paginationBackground: true,
  paginationSmall: false
})

// 定义事件
const emit = defineEmits<{
  refresh: []
  search: [keyword: string]
  select: [selection: any[], row: any]
  selectAll: [selection: any[]]
  selectionChange: [selection: any[]]
  cellMouseEnter: [row: any, column: any, cell: any, event: Event]
  cellMouseLeave: [row: any, column: any, cell: any, event: Event]
  cellClick: [row: any, column: any, cell: any, event: Event]
  cellDblclick: [row: any, column: any, cell: any, event: Event]
  rowClick: [row: any, column: any, event: Event]
  rowContextmenu: [row: any, column: any, event: Event]
  rowDblclick: [row: any, column: any, event: Event]
  headerClick: [column: any, event: Event]
  headerContextmenu: [column: any, event: Event]
  sortChange: [data: { column: any; prop: string; order: string }]
  filterChange: [filters: any]
  currentChange: [currentRow: any, oldCurrentRow: any]
  headerDragend: [newWidth: number, oldWidth: number, column: any, event: Event]
  expandChange: [row: any, expandedRows: any[]]
  sizeChange: [size: number]
  currentPageChange: [page: number]
}>

// 响应式数据
const tableRef: Ref<InstanceType<typeof ElTable> | null> = ref(null)
const searchKeyword = ref('')
const settableColumns = ref<TableColumn[]>([])

// 计算属性
const visibleColumns = computed(() => {
  return props.columns.filter(column => column.visible !== false)
})

const displayData = computed(() => {
  if (!searchKeyword.value) {
    return props.data
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  return props.data.filter(row => {
    return Object.values(row).some(value => {
      return String(value).toLowerCase().includes(keyword)
    })
  })
})

// 监听列配置变化
watch(
  () => props.columns,
  (newColumns) => {
    settableColumns.value = newColumns.map(col => ({
      ...col,
      visible: col.visible !== false
    }))
  },
  { immediate: true, deep: true }
)

// 防抖搜索
const handleSearch = debounce((keyword: string) => {
  emit('search', keyword)
}, 300)

/**
 * 处理刷新
 */
const handleRefresh = () => {
  emit('refresh')
}

/**
 * 处理列可见性变化
 */
const handleColumnVisibilityChange = () => {
  // 更新原始列配置
  props.columns.forEach(col => {
    const settableCol = settableColumns.value.find(sc => sc.prop === col.prop)
    if (settableCol) {
      col.visible = settableCol.visible
    }
  })
}

/**
 * 处理选择
 */
const handleSelect = (selection: any[], row: any) => {
  emit('select', selection, row)
}

/**
 * 处理全选
 */
const handleSelectAll = (selection: any[]) => {
  emit('selectAll', selection)
}

/**
 * 处理选择变化
 */
const handleSelectionChange = (selection: any[]) => {
  emit('selectionChange', selection)
}

/**
 * 处理单元格鼠标进入
 */
const handleCellMouseEnter = (row: any, column: any, cell: any, event: Event) => {
  emit('cellMouseEnter', row, column, cell, event)
}

/**
 * 处理单元格鼠标离开
 */
const handleCellMouseLeave = (row: any, column: any, cell: any, event: Event) => {
  emit('cellMouseLeave', row, column, cell, event)
}

/**
 * 处理单元格点击
 */
const handleCellClick = (row: any, column: any, cell: any, event: Event) => {
  emit('cellClick', row, column, cell, event)
}

/**
 * 处理单元格双击
 */
const handleCellDblclick = (row: any, column: any, cell: any, event: Event) => {
  emit('cellDblclick', row, column, cell, event)
}

/**
 * 处理行点击
 */
const handleRowClick = (row: any, column: any, event: Event) => {
  emit('rowClick', row, column, event)
}

/**
 * 处理行右键菜单
 */
const handleRowContextmenu = (row: any, column: any, event: Event) => {
  emit('rowContextmenu', row, column, event)
}

/**
 * 处理行双击
 */
const handleRowDblclick = (row: any, column: any, event: Event) => {
  emit('rowDblclick', row, column, event)
}

/**
 * 处理表头点击
 */
const handleHeaderClick = (column: any, event: Event) => {
  emit('headerClick', column, event)
}

/**
 * 处理表头右键菜单
 */
const handleHeaderContextmenu = (column: any, event: Event) => {
  emit('headerContextmenu', column, event)
}

/**
 * 处理排序变化
 */
const handleSortChange = (data: { column: any; prop: string; order: string }) => {
  emit('sortChange', data)
}

/**
 * 处理筛选变化
 */
const handleFilterChange = (filters: any) => {
  emit('filterChange', filters)
}

/**
 * 处理当前行变化
 */
const handleCurrentChange = (currentRow: any, oldCurrentRow: any) => {
  emit('currentChange', currentRow, oldCurrentRow)
}

/**
 * 处理表头拖拽结束
 */
const handleHeaderDragend = (newWidth: number, oldWidth: number, column: any, event: Event) => {
  emit('headerDragend', newWidth, oldWidth, column, event)
}

/**
 * 处理展开变化
 */
const handleExpandChange = (row: any, expandedRows: any[]) => {
  emit('expandChange', row, expandedRows)
}

/**
 * 处理每页条数变化
 */
const handleSizeChange = (size: number) => {
  emit('sizeChange', size)
}

/**
 * 处理当前页变化
 */
const handleCurrentPageChange = (page: number) => {
  emit('currentPageChange', page)
}

/**
 * 清除选择
 */
const clearSelection = () => {
  tableRef.value?.clearSelection()
}

/**
 * 切换所有行的选中状态
 */
const toggleAllSelection = () => {
  tableRef.value?.toggleAllSelection()
}

/**
 * 切换某一行的选中状态
 */
const toggleRowSelection = (row: any, selected?: boolean) => {
  tableRef.value?.toggleRowSelection(row, selected)
}

/**
 * 设置某一行为选中状态
 */
const setCurrentRow = (row: any) => {
  tableRef.value?.setCurrentRow(row)
}

/**
 * 清除排序
 */
const clearSort = () => {
  tableRef.value?.clearSort()
}

/**
 * 清除筛选
 */
const clearFilter = (columnKeys?: string[]) => {
  tableRef.value?.clearFilter(columnKeys)
}

/**
 * 对表格进行重新布局
 */
const doLayout = () => {
  nextTick(() => {
    tableRef.value?.doLayout()
  })
}

/**
 * 手动排序
 */
const sort = (prop: string, order: string) => {
  tableRef.value?.sort(prop, order)
}

// 暴露方法
defineExpose({
  clearSelection,
  toggleAllSelection,
  toggleRowSelection,
  setCurrentRow,
  clearSort,
  clearFilter,
  doLayout,
  sort
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.v-table {
  background-color: var(--el-bg-color);
  border-radius: $border-radius-base;
  overflow: hidden;
  
  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-blank);
    
    &-left {
      flex: 1;
      min-width: 0;
    }
    
    &-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
  
  &__title {
    margin: 0;
    font-size: $font-size-large;
    font-weight: 600;
    color: var(--el-text-color-primary);
    @include text-ellipsis;
  }
  
  &__search {
    width: 240px;
  }
  
  &__wrapper {
    position: relative;
  }
  
  &__column-settings {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .el-checkbox {
      margin: 0;
    }
  }
  
  &__pagination {
    display: flex;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-blank);
  }
  
  // 操作列样式
  :deep(.v-table__actions) {
    .cell {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
  
  // 响应式设计
  @include mobile {
    &__toolbar {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      padding: 12px 16px;
      
      &-left,
      &-right {
        flex: none;
      }
      
      &-right {
        flex-direction: column;
        align-items: stretch;
      }
    }
    
    &__search {
      width: 100%;
    }
    
    &__pagination {
      padding: 12px 16px;
      justify-content: center;
      
      :deep(.el-pagination) {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
    
    // 隐藏部分列
    :deep(.el-table) {
      .el-table__cell {
        &:nth-child(n+4) {
          display: none;
        }
      }
    }
  }
  
  @include tablet {
    &__toolbar {
      padding: 14px 18px;
      
      &-right {
        gap: 10px;
      }
    }
    
    &__search {
      width: 200px;
    }
    
    &__pagination {
      padding: 14px 18px;
    }
  }
}

// 表格样式增强
:deep(.el-table) {
  // 表头样式
  .el-table__header-wrapper {
    .el-table__header {
      th {
        background-color: var(--el-fill-color-light);
        color: var(--el-text-color-primary);
        font-weight: 600;
        
        &:first-child {
          border-top-left-radius: $border-radius-base;
        }
        
        &:last-child {
          border-top-right-radius: $border-radius-base;
        }
      }
    }
  }
  
  // 行样式
  .el-table__body-wrapper {
    .el-table__body {
      tr {
        transition: background-color 0.2s ease;
        
        &:hover {
          background-color: var(--el-fill-color-light) !important;
        }
        
        &.current-row {
          background-color: var(--el-color-primary-light-9) !important;
        }
      }
    }
  }
  
  // 空数据样式
  .el-table__empty-block {
    padding: 60px 0;
    
    .el-table__empty-text {
      color: var(--el-text-color-placeholder);
      font-size: $font-size-base;
    }
  }
  
  // 固定列阴影
  .el-table__fixed,
  .el-table__fixed-right {
    &::before {
      background-color: transparent;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.12);
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .v-table {
    &__toolbar {
      background-color: var(--el-fill-color-dark);
    }
    
    &__pagination {
      background-color: var(--el-fill-color-dark);
    }
  }
  
  :deep(.el-table) {
    .el-table__header-wrapper {
      .el-table__header {
        th {
          background-color: var(--el-fill-color-darker);
        }
      }
    }
  }
}
</style>