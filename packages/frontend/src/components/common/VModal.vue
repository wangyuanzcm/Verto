<template>
  <Teleport to="body">
    <Transition
      name="modal"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="modelValue"
        class="v-modal"
        :class="modalClass"
        @click="handleMaskClick"
      >
        <!-- 遮罩层 -->
        <div class="v-modal__mask" />
        
        <!-- 模态框容器 -->
        <div
          class="v-modal__wrapper"
          :class="wrapperClass"
          @click.stop
        >
          <div
            ref="modalRef"
            class="v-modal__container"
            :class="containerClass"
            :style="containerStyle"
          >
            <!-- 头部 -->
            <div v-if="showHeader" class="v-modal__header">
              <slot name="header">
                <div class="v-modal__title">
                  <el-icon v-if="icon" class="v-modal__icon">
                    <component :is="icon" />
                  </el-icon>
                  <span>{{ title }}</span>
                </div>
                <button
                  v-if="showClose"
                  class="v-modal__close"
                  @click="handleClose"
                >
                  <el-icon><Close /></el-icon>
                </button>
              </slot>
            </div>
            
            <!-- 内容区域 -->
            <div class="v-modal__body" :class="bodyClass">
              <!-- 加载状态 -->
              <div v-if="loading" class="v-modal__loading">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span v-if="loadingText">{{ loadingText }}</span>
              </div>
              
              <!-- 主要内容 -->
              <div v-else class="v-modal__content">
                <slot />
              </div>
            </div>
            
            <!-- 底部 -->
            <div v-if="showFooter || $slots.footer" class="v-modal__footer">
              <slot name="footer">
                <div class="v-modal__actions">
                  <VButton
                    v-if="showCancel"
                    :size="buttonSize"
                    @click="handleCancel"
                  >
                    {{ cancelText }}
                  </VButton>
                  <VButton
                    v-if="showConfirm"
                    :type="confirmType"
                    :size="buttonSize"
                    :loading="confirmLoading"
                    @click="handleConfirm"
                  >
                    {{ confirmText }}
                  </VButton>
                </div>
              </slot>
            </div>
            
            <!-- 调整大小手柄 -->
            <div
              v-if="resizable"
              class="v-modal__resize-handle"
              @mousedown="handleResizeStart"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ElIcon } from 'element-plus'
import { Close, Loading } from '@element-plus/icons-vue'
import VButton from './VButton.vue'

/**
 * 自定义模态框组件
 * 提供更灵活的模态框实现，支持拖拽、调整大小等功能
 */

// 模态框尺寸类型
type ModalSize = 'small' | 'medium' | 'large' | 'full'

// 定义组件属性
interface Props {
  /** 是否显示模态框 */
  modelValue: boolean
  /** 模态框标题 */
  title?: string
  /** 模态框图标 */
  icon?: any
  /** 模态框尺寸 */
  size?: ModalSize
  /** 自定义宽度 */
  width?: string | number
  /** 自定义高度 */
  height?: string | number
  /** 最小宽度 */
  minWidth?: string | number
  /** 最小高度 */
  minHeight?: string | number
  /** 最大宽度 */
  maxWidth?: string | number
  /** 最大高度 */
  maxHeight?: string | number
  /** 是否显示头部 */
  showHeader?: boolean
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 是否显示底部 */
  showFooter?: boolean
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 是否显示确认按钮 */
  showConfirm?: boolean
  /** 取消按钮文本 */
  cancelText?: string
  /** 确认按钮文本 */
  confirmText?: string
  /** 确认按钮类型 */
  confirmType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 按钮尺寸 */
  buttonSize?: 'large' | 'default' | 'small'
  /** 确认按钮加载状态 */
  confirmLoading?: boolean
  /** 是否可拖拽 */
  draggable?: boolean
  /** 是否可调整大小 */
  resizable?: boolean
  /** 是否点击遮罩关闭 */
  maskClosable?: boolean
  /** 是否按ESC关闭 */
  escClosable?: boolean
  /** 是否锁定滚动 */
  lockScroll?: boolean
  /** 是否居中显示 */
  centered?: boolean
  /** 层级 */
  zIndex?: number
  /** 自定义类名 */
  customClass?: string
  /** 内容区域类名 */
  bodyClass?: string
  /** 是否加载中 */
  loading?: boolean
  /** 加载文本 */
  loadingText?: string
  /** 关闭前回调 */
  beforeClose?: (done: () => void) => void
}

// 定义默认值
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  size: 'medium',
  showHeader: true,
  showClose: true,
  showFooter: false,
  showCancel: true,
  showConfirm: true,
  cancelText: '取消',
  confirmText: '确定',
  confirmType: 'primary',
  buttonSize: 'default',
  confirmLoading: false,
  draggable: false,
  resizable: false,
  maskClosable: true,
  escClosable: true,
  lockScroll: true,
  centered: true,
  zIndex: 2000,
  loadingText: '加载中...'
})

// 定义事件
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  open: []
  opened: []
  close: []
  closed: []
  confirm: []
  cancel: []
}>()

// 响应式数据
const modalRef = ref<HTMLElement>()
const isDragging = ref(false)
const isResizing = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const modalPosition = ref({ x: 0, y: 0 })
const modalSize = ref({ width: 0, height: 0 })

// 计算属性
const modalClass = computed(() => {
  return [
    {
      'v-modal--centered': props.centered,
      'v-modal--dragging': isDragging.value,
      'v-modal--resizing': isResizing.value
    },
    props.customClass
  ]
})

const wrapperClass = computed(() => {
  return [
    `v-modal__wrapper--${props.size}`,
    {
      'v-modal__wrapper--centered': props.centered
    }
  ]
})

const containerClass = computed(() => {
  return [
    `v-modal__container--${props.size}`,
    {
      'v-modal__container--draggable': props.draggable,
      'v-modal__container--resizable': props.resizable
    }
  ]
})

const containerStyle = computed(() => {
  const style: Record<string, any> = {
    zIndex: props.zIndex
  }
  
  // 自定义尺寸
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  if (props.minWidth) {
    style.minWidth = typeof props.minWidth === 'number' ? `${props.minWidth}px` : props.minWidth
  }
  if (props.minHeight) {
    style.minHeight = typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight
  }
  if (props.maxWidth) {
    style.maxWidth = typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth
  }
  if (props.maxHeight) {
    style.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
  }
  
  // 拖拽位置
  if (props.draggable && (modalPosition.value.x !== 0 || modalPosition.value.y !== 0)) {
    style.transform = `translate(${modalPosition.value.x}px, ${modalPosition.value.y}px)`
  }
  
  // 调整大小
  if (props.resizable && (modalSize.value.width > 0 || modalSize.value.height > 0)) {
    if (modalSize.value.width > 0) {
      style.width = `${modalSize.value.width}px`
    }
    if (modalSize.value.height > 0) {
      style.height = `${modalSize.value.height}px`
    }
  }
  
  return style
})

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      handleOpen()
    } else {
      handleClose()
    }
  }
)

// 监听锁定滚动
watch(
  () => props.modelValue,
  (newValue) => {
    if (props.lockScroll) {
      if (newValue) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  }
)

/**
 * 处理遮罩点击
 */
const handleMaskClick = () => {
  if (props.maskClosable) {
    handleClose()
  }
}

/**
 * 处理关闭
 */
const handleClose = () => {
  if (props.beforeClose) {
    props.beforeClose(() => {
      emit('update:modelValue', false)
      emit('close')
    })
  } else {
    emit('update:modelValue', false)
    emit('close')
  }
}

/**
 * 处理打开
 */
const handleOpen = () => {
  emit('open')
  nextTick(() => {
    // 重置位置和大小
    modalPosition.value = { x: 0, y: 0 }
    modalSize.value = { width: 0, height: 0 }
  })
}

/**
 * 处理确认
 */
const handleConfirm = () => {
  emit('confirm')
}

/**
 * 处理取消
 */
const handleCancel = () => {
  emit('cancel')
  handleClose()
}

/**
 * 处理拖拽开始
 */
const handleDragStart = (event: MouseEvent) => {
  if (!props.draggable) return
  
  isDragging.value = true
  dragOffset.value = {
    x: event.clientX - modalPosition.value.x,
    y: event.clientY - modalPosition.value.y
  }
  
  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
  event.preventDefault()
}

/**
 * 处理拖拽移动
 */
const handleDragMove = (event: MouseEvent) => {
  if (!isDragging.value) return
  
  modalPosition.value = {
    x: event.clientX - dragOffset.value.x,
    y: event.clientY - dragOffset.value.y
  }
}

/**
 * 处理拖拽结束
 */
const handleDragEnd = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
}

/**
 * 处理调整大小开始
 */
const handleResizeStart = (event: MouseEvent) => {
  if (!props.resizable || !modalRef.value) return
  
  isResizing.value = true
  const rect = modalRef.value.getBoundingClientRect()
  const startX = event.clientX
  const startY = event.clientY
  const startWidth = rect.width
  const startHeight = rect.height
  
  const handleResizeMove = (moveEvent: MouseEvent) => {
    const deltaX = moveEvent.clientX - startX
    const deltaY = moveEvent.clientY - startY
    
    modalSize.value = {
      width: Math.max(300, startWidth + deltaX),
      height: Math.max(200, startHeight + deltaY)
    }
  }
  
  const handleResizeEnd = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
  }
  
  document.addEventListener('mousemove', handleResizeMove)
  document.addEventListener('mouseup', handleResizeEnd)
  event.preventDefault()
}

/**
 * 处理键盘事件
 */
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.escClosable && props.modelValue) {
    handleClose()
  }
}

/**
 * 动画事件处理
 */
const onEnter = () => {
  // 进入动画开始
}

const onAfterEnter = () => {
  emit('opened')
}

const onLeave = () => {
  // 离开动画开始
}

const onAfterLeave = () => {
  emit('closed')
  if (props.lockScroll) {
    document.body.style.overflow = ''
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  
  // 添加拖拽事件监听
  if (props.draggable && modalRef.value) {
    const header = modalRef.value.querySelector('.v-modal__header')
    if (header) {
      header.addEventListener('mousedown', handleDragStart)
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  
  if (props.lockScroll) {
    document.body.style.overflow = ''
  }
})

// 暴露方法
defineExpose({
  close: handleClose,
  open: handleOpen
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.v-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  
  &__mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
  }
  
  &__wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    
    &--centered {
      align-items: center;
      justify-content: center;
    }
    
    &--small {
      .v-modal__container {
        max-width: 400px;
      }
    }
    
    &--medium {
      .v-modal__container {
        max-width: 600px;
      }
    }
    
    &--large {
      .v-modal__container {
        max-width: 800px;
      }
    }
    
    &--full {
      padding: 0;
      
      .v-modal__container {
        width: 100%;
        height: 100%;
        max-width: none;
        max-height: none;
        border-radius: 0;
      }
    }
  }
  
  &__container {
    position: relative;
    width: 100%;
    max-height: 90vh;
    background-color: var(--el-bg-color);
    border-radius: $border-radius-large;
    box-shadow: var(--el-box-shadow-dark);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    &--draggable {
      .v-modal__header {
        cursor: move;
        user-select: none;
      }
    }
    
    &--resizable {
      resize: both;
      overflow: auto;
    }
  }
  
  &__header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-blank);
  }
  
  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: $font-size-large;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  
  &__icon {
    font-size: 20px;
    color: var(--el-color-primary);
  }
  
  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    border-radius: $border-radius-base;
    color: var(--el-text-color-placeholder);
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }
    
    .el-icon {
      font-size: 16px;
    }
  }
  
  &__body {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    
    @include scrollbar;
  }
  
  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: var(--el-text-color-regular);
    
    .el-icon {
      font-size: 32px;
      margin-bottom: 12px;
      color: var(--el-color-primary);
    }
    
    span {
      font-size: $font-size-base;
    }
  }
  
  &__content {
    min-height: 60px;
  }
  
  &__footer {
    flex-shrink: 0;
    padding: 16px 24px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-blank);
  }
  
  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    
    .v-button {
      min-width: 80px;
    }
  }
  
  &__resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 16px;
    height: 16px;
    cursor: se-resize;
    background: linear-gradient(
      -45deg,
      transparent 0%,
      transparent 40%,
      var(--el-border-color) 40%,
      var(--el-border-color) 60%,
      transparent 60%
    );
    
    &::before {
      content: '';
      position: absolute;
      bottom: 4px;
      right: 4px;
      width: 8px;
      height: 8px;
      background: linear-gradient(
        -45deg,
        transparent 0%,
        transparent 40%,
        var(--el-border-color) 40%,
        var(--el-border-color) 60%,
        transparent 60%
      );
    }
  }
  
  // 拖拽状态
  &--dragging {
    .v-modal__container {
      transition: none;
    }
  }
  
  // 调整大小状态
  &--resizing {
    .v-modal__container {
      transition: none;
    }
  }
  
  // 响应式设计
  @include mobile {
    &__wrapper {
      padding: 10px;
      
      &--small,
      &--medium,
      &--large {
        .v-modal__container {
          max-width: none;
          width: 100%;
        }
      }
    }
    
    &__header {
      padding: 16px 20px 12px;
    }
    
    &__body {
      padding: 20px;
    }
    
    &__footer {
      padding: 12px 20px 16px;
    }
    
    &__actions {
      flex-direction: column-reverse;
      
      .v-button {
        width: 100%;
      }
    }
  }
  
  @include tablet {
    &__wrapper {
      padding: 15px;
    }
    
    &__actions {
      flex-wrap: wrap;
      
      .v-button {
        min-width: 100px;
      }
    }
  }
}

// 动画
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  .v-modal__mask {
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .v-modal__container {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  
  .v-modal__mask {
    opacity: 0;
  }
  
  .v-modal__container {
    transform: scale(0.9) translateY(-20px);
    opacity: 0;
  }
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  
  .v-modal__mask {
    opacity: 1;
  }
  
  .v-modal__container {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .v-modal {
    &__mask {
      background-color: rgba(0, 0, 0, 0.7);
    }
    
    &__container {
      background-color: var(--el-bg-color-page);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.8);
    }
    
    &__header {
      background-color: var(--el-fill-color-dark);
    }
    
    &__footer {
      background-color: var(--el-fill-color-dark);
    }
    
    &__close {
      &:hover {
        background-color: var(--el-fill-color-darker);
      }
    }
  }
}
</style>