<template>
  <a-pagination
    v-if="total > 0"
    v-model:current="internalCurrent"
    v-model:page-size="internalPageSize"
    :total="total"
    :page-size-options="pageSizeOptions"
    :show-size-changer="showSizeChanger"
    :show-quick-jumper="showQuickJumper"
    :show-total="showTotal ? showTotalFn : undefined"
    :simple="simple"
    :size="size"
    :disabled="disabled"
    :hide-on-single-page="hideOnSinglePage"
    :responsive="responsive"
    @change="handlePageChange"
    @show-size-change="handleSizeChange"
  >
    <!-- 自定义总数显示 -->
    <template v-if="$slots.total" #buildOptionText="{ value }">
      <slot name="total" :total="total" :page-size="value"></slot>
    </template>

    <!-- 自定义页码项 -->
    <template v-if="$slots.itemRender" #itemRender="{ type, page, originalElement }">
      <slot name="itemRender" :type="type" :page="page" :original-element="originalElement"></slot>
    </template>
  </a-pagination>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

/**
 * 分页组件属性接口
 */
interface PaginationProps {
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
 * 分页组件事件接口
 */
interface PaginationEmits {
  /** 页码变化 */
  'update:current': [current: number]
  /** 每页条数变化 */
  'update:pageSize': [pageSize: number]
  /** 页码变化事件 */
  'change': [current: number, pageSize: number]
  /** 每页条数变化事件 */
  'size-change': [current: number, pageSize: number]
}

// 定义属性
const props = withDefaults(defineProps<PaginationProps>(), {
  current: 1,
  pageSize: 10,
  pageSizeOptions: () => ['10', '20', '50', '100'],
  showTotal: true,
  showSizeChanger: true,
  showQuickJumper: true,
  simple: false,
  size: 'default',
  disabled: false,
  hideOnSinglePage: false,
  responsive: true
})

// 定义事件
const emit = defineEmits<PaginationEmits>()

// 响应式数据
const internalCurrent = ref(props.current)
const internalPageSize = ref(props.pageSize)

/**
 * 显示总数的函数
 * @param total 总数
 * @param range 当前范围
 */
const showTotalFn = (total: number, range: [number, number]) => {
  return `共 ${total} 条，第 ${range[0]}-${range[1]} 条`
}

/**
 * 处理页码变化
 * @param current 当前页码
 * @param pageSize 每页条数
 */
const handlePageChange = (current: number, pageSize: number) => {
  internalCurrent.value = current
  emit('update:current', current)
  emit('change', current, pageSize)
}

/**
 * 处理每页条数变化
 * @param current 当前页码
 * @param pageSize 每页条数
 */
const handleSizeChange = (current: number, pageSize: number) => {
  internalPageSize.value = pageSize
  internalCurrent.value = current
  emit('update:pageSize', pageSize)
  emit('update:current', current)
  emit('size-change', current, pageSize)
  emit('change', current, pageSize)
}

// 监听属性变化
watch(() => props.current, (newCurrent) => {
  internalCurrent.value = newCurrent
}, { immediate: true })

watch(() => props.pageSize, (newPageSize) => {
  internalPageSize.value = newPageSize
}, { immediate: true })
</script>

<style scoped>
/* 自定义样式覆盖 */
:deep(.ant-pagination) {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

:deep(.ant-pagination-item) {
  border-radius: 6px;
  transition: all 0.2s;
}

:deep(.ant-pagination-item:hover) {
  border-color: #40a9ff;
}

:deep(.ant-pagination-item-active) {
  border-color: #1890ff;
  background: #1890ff;
}

:deep(.ant-pagination-item-active:hover) {
  border-color: #40a9ff;
  background: #40a9ff;
}

:deep(.ant-pagination-prev),
:deep(.ant-pagination-next) {
  border-radius: 6px;
  transition: all 0.2s;
}

:deep(.ant-pagination-prev:hover),
:deep(.ant-pagination-next:hover) {
  border-color: #40a9ff;
  color: #40a9ff;
}

:deep(.ant-pagination-options) {
  margin-left: 16px;
}

:deep(.ant-pagination-options-size-changer) {
  border-radius: 6px;
}

:deep(.ant-pagination-options-quick-jumper input) {
  border-radius: 6px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.ant-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  :deep(.ant-pagination-total-text) {
    width: 100%;
    text-align: center;
    margin-bottom: 8px;
  }
  
  :deep(.ant-pagination-options) {
    margin-left: 0;
    margin-top: 8px;
  }
}

/* 暗色主题 */
@media (prefers-color-scheme: dark) {
  :deep(.ant-pagination-item) {
    border-color: #434343;
    background: #1f1f1f;
    color: #d9d9d9;
  }
  
  :deep(.ant-pagination-item:hover) {
    border-color: #177ddc;
    color: #177ddc;
  }
  
  :deep(.ant-pagination-item-active) {
    border-color: #1668dc;
    background: #1668dc;
    color: #ffffff;
  }
  
  :deep(.ant-pagination-item-active:hover) {
    border-color: #177ddc;
    background: #177ddc;
  }
  
  :deep(.ant-pagination-prev),
  :deep(.ant-pagination-next) {
    border-color: #434343;
    background: #1f1f1f;
    color: #d9d9d9;
  }
  
  :deep(.ant-pagination-prev:hover),
  :deep(.ant-pagination-next:hover) {
    border-color: #177ddc;
    color: #177ddc;
  }
  
  :deep(.ant-pagination-disabled) {
    border-color: #2a2a2a;
    background: #262626;
    color: #595959;
  }
}
</style>