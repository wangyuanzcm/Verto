<template>
  <a-modal
    v-model:open="internalVisible"
    :title="title"
    :width="width"
    :centered="centered"
    :closable="closable"
    :mask-closable="maskClosable"
    :keyboard="escClosable"
    :z-index="zIndex"
    :get-container="getContainer"
    :wrap-class-name="wrapClassName"
    :body-style="bodyStyle"
    :mask-style="maskStyle"
    :confirm-loading="confirmLoading"
    :cancel-text="cancelText"
    :ok-text="confirmText"
    :ok-type="confirmType"
    :ok-button-props="confirmButtonProps"
    :cancel-button-props="cancelButtonProps"
    :destroy-on-close="destroyOnClose"
    :force-render="forceRender"
    :footer="showFooter ? undefined : null"
    @ok="handleConfirm"
    @cancel="handleCancel"
    @after-close="handleAfterClose"
  >
    <!-- 自定义标题 -->
    <template v-if="$slots.title" #title>
      <slot name="title"></slot>
    </template>

    <!-- 模态框内容 -->
    <slot></slot>

    <!-- 自定义底部 -->
    <template v-if="$slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ButtonProps } from 'ant-design-vue'

/**
 * 模态框组件属性接口
 */
interface ModalProps {
  /** 是否显示模态框 */
  visible?: boolean
  /** 模态框标题 */
  title?: string
  /** 模态框宽度 */
  width?: string | number
  /** 是否显示头部 */
  showHeader?: boolean
  /** 是否显示底部 */
  showFooter?: boolean
  /** 是否可关闭 */
  closable?: boolean
  /** 是否点击遮罩层关闭 */
  maskClosable?: boolean
  /** 是否按ESC键关闭 */
  escClosable?: boolean
  /** 是否显示取消按钮 */
  showCancelButton?: boolean
  /** 是否显示确认按钮 */
  showConfirmButton?: boolean
  /** 取消按钮文本 */
  cancelText?: string
  /** 确认按钮文本 */
  confirmText?: string
  /** 按钮尺寸 */
  buttonSize?: 'small' | 'medium' | 'large'
  /** 取消按钮加载状态 */
  cancelLoading?: boolean
  /** 确认按钮加载状态 */
  confirmLoading?: boolean
  /** 模态框层级 */
  zIndex?: number
  /** 是否居中显示 */
  centered?: boolean
  /** 是否全屏显示 */
  fullscreen?: boolean
  /** 是否可拖拽 */
  draggable?: boolean
  /** 是否可调整大小 */
  resizable?: boolean
  /** 自定义类名 */
  customClass?: string
  /** 内容区域自定义类名 */
  bodyClass?: string
  /** 是否锁定滚动 */
  lockScroll?: boolean
  /** 是否销毁内容 */
  destroyOnClose?: boolean
  /** 指定 Modal 挂载的 HTML 节点 */
  getContainer?: string | HTMLElement | (() => HTMLElement) | false
  /** 包装器的类名 */
  wrapClassName?: string
  /** Modal body 样式 */
  bodyStyle?: Record<string, string>
  /** 遮罩样式 */
  maskStyle?: Record<string, string>
  /** 确认按钮类型 */
  confirmType?: 'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'default'
  /** 确认按钮属性 */
  confirmButtonProps?: ButtonProps
  /** 取消按钮属性 */
  cancelButtonProps?: ButtonProps
  /** 强制渲染 Modal */
  forceRender?: boolean
}

/**
 * 模态框组件事件接口
 */
interface ModalEmits {
  /** 显示状态更新事件 */
  (e: 'update:visible', visible: boolean): void
  /** 确认事件 */
  (e: 'confirm'): void
  /** 取消事件 */
  (e: 'cancel'): void
  /** 关闭事件 */
  (e: 'close'): void
  /** 打开事件 */
  (e: 'open'): void
  /** 打开后事件 */
  (e: 'opened'): void
  /** 关闭后事件 */
  (e: 'closed'): void
}

// 定义属性和事件
const props = withDefaults(defineProps<ModalProps>(), {
  visible: false,
  width: 520,
  showHeader: true,
  showFooter: true,
  closable: true,
  maskClosable: true,
  escClosable: true,
  showCancelButton: true,
  showConfirmButton: true,
  cancelText: '取消',
  confirmText: '确定',
  buttonSize: 'medium',
  cancelLoading: false,
  confirmLoading: false,
  zIndex: 1000,
  centered: true,
  fullscreen: false,
  draggable: false,
  resizable: false,
  lockScroll: true,
  destroyOnClose: false,
  confirmType: 'primary',
  forceRender: false
})

const emit = defineEmits<ModalEmits>()

// 响应式数据
const internalVisible = ref(props.visible)

/**
 * 处理取消
 */
const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
  emit('close')
}

/**
 * 处理确认
 */
const handleConfirm = () => {
  emit('confirm')
}

/**
 * 处理关闭后
 */
const handleAfterClose = () => {
  emit('closed')
}

// 监听显示状态变化
watch(() => props.visible, (newVisible) => {
  internalVisible.value = newVisible
  if (newVisible) {
    emit('open')
  }
}, { immediate: true })

watch(internalVisible, (newVisible) => {
  if (newVisible !== props.visible) {
    emit('update:visible', newVisible)
    if (newVisible) {
      emit('open')
    } else {
      emit('close')
    }
  }
})
</script>

<style scoped>
/* 自定义样式覆盖 */
:deep(.ant-modal-content) {
  border-radius: 8px;
}

:deep(.ant-modal-header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
}

:deep(.ant-modal-title) {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

:deep(.ant-modal-body) {
  padding: 24px;
  color: #595959;
  font-size: 14px;
  line-height: 1.5714;
}

:deep(.ant-modal-footer) {
  border-top: 1px solid #f0f0f0;
  padding: 16px 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.ant-modal-content) {
    margin: 16px;
  }
  
  :deep(.ant-modal-header),
  :deep(.ant-modal-body),
  :deep(.ant-modal-footer) {
    padding-left: 16px;
    padding-right: 16px;
  }
}

/* 暗色主题 */
@media (prefers-color-scheme: dark) {
  :deep(.ant-modal-content) {
    background: #1f1f1f;
  }
  
  :deep(.ant-modal-header) {
    background: #1f1f1f;
    border-bottom-color: #303030;
  }
  
  :deep(.ant-modal-title) {
    color: #ffffff;
  }
  
  :deep(.ant-modal-body) {
    background: #1f1f1f;
    color: #d9d9d9;
  }
  
  :deep(.ant-modal-footer) {
    background: #1f1f1f;
    border-top-color: #303030;
  }
}
</style>