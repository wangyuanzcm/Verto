<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :fullscreen="fullscreen"
    :top="top"
    :modal="modal"
    :modal-class="modalClass"
    :append-to-body="appendToBody"
    :lock-scroll="lockScroll"
    :custom-class="customClass"
    :open-delay="openDelay"
    :close-delay="closeDelay"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :before-close="handleBeforeClose"
    :center="center"
    :align-center="alignCenter"
    :destroy-on-close="destroyOnClose"
    :draggable="draggable"
    :overflow="overflow"
    :header="header"
    :footer="footer"
    @open="handleOpen"
    @opened="handleOpened"
    @close="handleClose"
    @closed="handleClosed"
    @open-auto-focus="handleOpenAutoFocus"
    @close-auto-focus="handleCloseAutoFocus"
  >
    <!-- 自定义头部 -->
    <template v-if="$slots.header" #header="{ close, titleId, titleClass }">
      <slot name="header" :close="close" :title-id="titleId" :title-class="titleClass" />
    </template>
    
    <!-- 对话框内容 -->
    <div class="v-dialog__content">
      <!-- 加载状态 -->
      <div v-if="loading" class="v-dialog__loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>{{ loadingText }}</span>
      </div>
      
      <!-- 主要内容 -->
      <div v-else class="v-dialog__body">
        <!-- 图标 -->
        <div v-if="icon || type" class="v-dialog__icon">
          <el-icon :class="iconClass">
            <component :is="iconComponent" />
          </el-icon>
        </div>
        
        <!-- 消息内容 -->
        <div class="v-dialog__message">
          <div v-if="message" class="v-dialog__text" v-html="message" />
          <slot v-else />
        </div>
      </div>
      
      <!-- 表单内容 -->
      <div v-if="$slots.form" class="v-dialog__form">
        <slot name="form" />
      </div>
    </div>
    
    <!-- 自定义底部 -->
    <template v-if="$slots.footer || showFooter" #footer>
      <slot name="footer">
        <div class="v-dialog__footer">
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
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElDialog, ElIcon } from 'element-plus'
import {
  Loading,
  InfoFilled,
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled,
  QuestionFilled
} from '@element-plus/icons-vue'
import VButton from './VButton.vue'

/**
 * 自定义对话框组件
 * 基于Element Plus Dialog扩展，提供更多功能和预设样式
 */

// 对话框类型
type DialogType = 'info' | 'success' | 'warning' | 'error' | 'confirm'

// 定义组件属性
interface Props {
  /** 是否显示对话框 */
  modelValue: boolean
  /** 对话框标题 */
  title?: string
  /** 对话框宽度 */
  width?: string | number
  /** 是否全屏 */
  fullscreen?: boolean
  /** 对话框CSS中的top值 */
  top?: string
  /** 是否需要遮罩层 */
  modal?: boolean
  /** 遮罩层的自定义类名 */
  modalClass?: string
  /** 是否插入至body元素上 */
  appendToBody?: boolean
  /** 是否在对话框出现时将body滚动锁定 */
  lockScroll?: boolean
  /** 对话框的自定义类名 */
  customClass?: string
  /** 对话框打开的延时时间 */
  openDelay?: number
  /** 对话框关闭的延时时间 */
  closeDelay?: number
  /** 是否可以通过点击modal关闭对话框 */
  closeOnClickModal?: boolean
  /** 是否可以通过按下ESC关闭对话框 */
  closeOnPressEscape?: boolean
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 关闭前的回调 */
  beforeClose?: Function
  /** 是否对头部和底部采用居中布局 */
  center?: boolean
  /** 是否水平垂直对齐对话框 */
  alignCenter?: boolean
  /** 关闭时销毁对话框中的元素 */
  destroyOnClose?: boolean
  /** 是否可拖拽 */
  draggable?: boolean
  /** 拖拽时是否可以超出可视区域 */
  overflow?: boolean
  /** 是否自定义头部 */
  header?: boolean
  /** 是否自定义底部 */
  footer?: boolean
  /** 对话框类型 */
  type?: DialogType
  /** 自定义图标 */
  icon?: any
  /** 消息内容 */
  message?: string
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
  /** 是否加载中 */
  loading?: boolean
  /** 加载文本 */
  loadingText?: string
}

// 定义默认值
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  width: '50%',
  fullscreen: false,
  top: '15vh',
  modal: true,
  appendToBody: false,
  lockScroll: true,
  openDelay: 0,
  closeDelay: 0,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  showClose: true,
  center: false,
  alignCenter: false,
  destroyOnClose: false,
  draggable: false,
  overflow: false,
  header: true,
  footer: true,
  showFooter: true,
  showCancel: true,
  showConfirm: true,
  cancelText: '取消',
  confirmText: '确定',
  confirmType: 'primary',
  buttonSize: 'default',
  confirmLoading: false,
  loading: false,
  loadingText: '加载中...'
})

// 定义事件
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  open: []
  opened: []
  close: []
  closed: []
  openAutoFocus: []
  closeAutoFocus: []
  confirm: []
  cancel: []
}>

// 响应式数据
const dialogVisible = ref(props.modelValue)

// 计算属性
const iconComponent = computed(() => {
  if (props.icon) {
    return props.icon
  }
  
  switch (props.type) {
    case 'info':
      return InfoFilled
    case 'success':
      return SuccessFilled
    case 'warning':
      return WarningFilled
    case 'error':
      return CircleCloseFilled
    case 'confirm':
      return QuestionFilled
    default:
      return null
  }
})

const iconClass = computed(() => {
  const baseClass = 'v-dialog__icon-inner'
  if (props.type) {
    return `${baseClass} v-dialog__icon--${props.type}`
  }
  return baseClass
})

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    dialogVisible.value = newValue
  }
)

// 监听dialogVisible变化
watch(
  dialogVisible,
  (newValue) => {
    emit('update:modelValue', newValue)
  }
)

/**
 * 处理关闭前回调
 */
const handleBeforeClose = (done: Function) => {
  if (props.beforeClose) {
    props.beforeClose(done)
  } else {
    done()
  }
}

/**
 * 处理打开事件
 */
const handleOpen = () => {
  emit('open')
}

/**
 * 处理打开完成事件
 */
const handleOpened = () => {
  emit('opened')
}

/**
 * 处理关闭事件
 */
const handleClose = () => {
  emit('close')
}

/**
 * 处理关闭完成事件
 */
const handleClosed = () => {
  emit('closed')
}

/**
 * 处理打开时自动聚焦事件
 */
const handleOpenAutoFocus = () => {
  emit('openAutoFocus')
}

/**
 * 处理关闭时自动聚焦事件
 */
const handleCloseAutoFocus = () => {
  emit('closeAutoFocus')
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
  dialogVisible.value = false
}

/**
 * 关闭对话框
 */
const close = () => {
  dialogVisible.value = false
}

/**
 * 打开对话框
 */
const open = () => {
  dialogVisible.value = true
}

// 暴露方法
defineExpose({
  close,
  open
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.v-dialog {
  &__content {
    min-height: 60px;
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
  
  &__body {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 8px 0;
  }
  
  &__icon {
    flex-shrink: 0;
    
    &-inner {
      font-size: 24px;
      
      &.v-dialog__icon--info {
        color: var(--el-color-info);
      }
      
      &.v-dialog__icon--success {
        color: var(--el-color-success);
      }
      
      &.v-dialog__icon--warning {
        color: var(--el-color-warning);
      }
      
      &.v-dialog__icon--error {
        color: var(--el-color-danger);
      }
      
      &.v-dialog__icon--confirm {
        color: var(--el-color-warning);
      }
    }
  }
  
  &__message {
    flex: 1;
    min-width: 0;
  }
  
  &__text {
    font-size: $font-size-base;
    line-height: 1.6;
    color: var(--el-text-color-primary);
    word-wrap: break-word;
    
    :deep(p) {
      margin: 0 0 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    :deep(ul),
    :deep(ol) {
      margin: 0 0 12px;
      padding-left: 20px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    :deep(code) {
      padding: 2px 4px;
      background-color: var(--el-fill-color-light);
      border-radius: 3px;
      font-family: $font-family-mono;
      font-size: 0.9em;
    }
    
    :deep(pre) {
      padding: 12px;
      background-color: var(--el-fill-color-light);
      border-radius: $border-radius-base;
      overflow-x: auto;
      
      code {
        padding: 0;
        background-color: transparent;
      }
    }
  }
  
  &__form {
    margin-top: 20px;
  }
  
  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    
    .v-button {
      min-width: 80px;
    }
  }
  
  // 响应式设计
  @include mobile {
    &__body {
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
    }
    
    &__icon {
      &-inner {
        font-size: 32px;
      }
    }
    
    &__footer {
      flex-direction: column-reverse;
      
      .v-button {
        width: 100%;
      }
    }
  }
  
  @include tablet {
    &__footer {
      flex-wrap: wrap;
      
      .v-button {
        min-width: 100px;
      }
    }
  }
}

// Element Plus Dialog 样式增强
:deep(.el-dialog) {
  border-radius: $border-radius-large;
  overflow: hidden;
  
  .el-dialog__header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-blank);
    
    .el-dialog__title {
      font-size: $font-size-large;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    
    .el-dialog__headerbtn {
      top: 16px;
      right: 20px;
      width: 32px;
      height: 32px;
      
      .el-dialog__close {
        font-size: 16px;
        color: var(--el-text-color-placeholder);
        
        &:hover {
          color: var(--el-color-primary);
        }
      }
    }
  }
  
  .el-dialog__body {
    padding: 24px;
    color: var(--el-text-color-primary);
    line-height: 1.6;
  }
  
  .el-dialog__footer {
    padding: 16px 24px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-blank);
  }
  
  // 全屏模式
  &.is-fullscreen {
    border-radius: 0;
    
    .el-dialog__header {
      .el-dialog__headerbtn {
        top: 20px;
        right: 24px;
      }
    }
  }
  
  // 居中对齐
  &.is-align-center {
    .el-dialog__header,
    .el-dialog__body,
    .el-dialog__footer {
      text-align: center;
    }
  }
}

// 遮罩层样式
:deep(.el-overlay) {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

// 动画增强
:deep(.el-dialog) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-overlay-dialog) {
  .el-dialog {
    transform: scale(0.9);
    opacity: 0;
    
    &.el-dialog--center {
      transform: scale(0.9) translate(-50%, -50%);
    }
  }
  
  &.is-opened {
    .el-dialog {
      transform: scale(1);
      opacity: 1;
      
      &.el-dialog--center {
        transform: scale(1) translate(-50%, -50%);
      }
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .v-dialog {
    &__loading {
      color: var(--el-text-color-regular);
    }
    
    &__text {
      color: var(--el-text-color-primary);
      
      :deep(code) {
        background-color: var(--el-fill-color-darker);
      }
      
      :deep(pre) {
        background-color: var(--el-fill-color-darker);
      }
    }
  }
  
  :deep(.el-dialog) {
    .el-dialog__header {
      background-color: var(--el-fill-color-dark);
    }
    
    .el-dialog__footer {
      background-color: var(--el-fill-color-dark);
    }
  }
  
  :deep(.el-overlay) {
    background-color: rgba(0, 0, 0, 0.7);
  }
}
</style>