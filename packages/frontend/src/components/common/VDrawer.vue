<template>
  <Teleport to="body">
    <Transition
      name="drawer"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="modelValue"
        class="v-drawer"
        :class="drawerClass"
        @click="handleMaskClick"
      >
        <!-- 遮罩层 -->
        <div class="v-drawer__mask" />
        
        <!-- 抽屉容器 -->
        <div
          ref="drawerRef"
          class="v-drawer__container"
          :class="containerClass"
          :style="containerStyle"
          @click.stop
        >
          <!-- 头部 -->
          <div v-if="showHeader" class="v-drawer__header">
            <slot name="header">
              <div class="v-drawer__title">
                <el-icon v-if="icon" class="v-drawer__icon">
                  <component :is="icon" />
                </el-icon>
                <span>{{ title }}</span>
              </div>
              <button
                v-if="showClose"
                class="v-drawer__close"
                @click="handleClose"
              >
                <el-icon><Close /></el-icon>
              </button>
            </slot>
          </div>
          
          <!-- 内容区域 -->
          <div class="v-drawer__body" :class="bodyClass">
            <!-- 加载状态 -->
            <div v-if="loading" class="v-drawer__loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span v-if="loadingText">{{ loadingText }}</span>
            </div>
            
            <!-- 主要内容 -->
            <div v-else class="v-drawer__content">
              <slot />
            </div>
          </div>
          
          <!-- 底部 -->
          <div v-if="showFooter || $slots.footer" class="v-drawer__footer">
            <slot name="footer">
              <div class="v-drawer__actions">
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
 * 自定义抽屉组件
 * 提供从屏幕边缘滑出的面板，支持多个方向和自定义尺寸
 */

// 抽屉方向类型
type DrawerDirection = 'left' | 'right' | 'top' | 'bottom'

// 抽屉尺寸类型
type DrawerSize = 'small' | 'medium' | 'large'

// 定义组件属性
interface Props {
  /** 是否显示抽屉 */
  modelValue: boolean
  /** 抽屉标题 */
  title?: string
  /** 抽屉图标 */
  icon?: any
  /** 抽屉方向 */
  direction?: DrawerDirection
  /** 抽屉尺寸 */
  size?: DrawerSize
  /** 自定义宽度（left/right方向） */
  width?: string | number
  /** 自定义高度（top/bottom方向） */
  height?: string | number
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
  /** 是否点击遮罩关闭 */
  maskClosable?: boolean
  /** 是否按ESC关闭 */
  escClosable?: boolean
  /** 是否锁定滚动 */
  lockScroll?: boolean
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
  direction: 'right',
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
  maskClosable: true,
  escClosable: true,
  lockScroll: true,
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
const drawerRef = ref<HTMLElement>()

// 计算属性
const drawerClass = computed(() => {
  return [
    `v-drawer--${props.direction}`,
    props.customClass
  ]
})

const containerClass = computed(() => {
  return [
    `v-drawer__container--${props.direction}`,
    `v-drawer__container--${props.size}`
  ]
})

const containerStyle = computed(() => {
  const style: Record<string, any> = {
    zIndex: props.zIndex
  }
  
  // 自定义尺寸
  if (props.direction === 'left' || props.direction === 'right') {
    if (props.width) {
      style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
    }
  } else {
    if (props.height) {
      style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
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
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  
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

.v-drawer {
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
  
  &__container {
    position: absolute;
    background-color: var(--el-bg-color);
    box-shadow: var(--el-box-shadow-dark);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    // 右侧抽屉
    &--right {
      top: 0;
      right: 0;
      height: 100%;
      
      &.v-drawer__container--small {
        width: 300px;
      }
      
      &.v-drawer__container--medium {
        width: 400px;
      }
      
      &.v-drawer__container--large {
        width: 500px;
      }
    }
    
    // 左侧抽屉
    &--left {
      top: 0;
      left: 0;
      height: 100%;
      
      &.v-drawer__container--small {
        width: 300px;
      }
      
      &.v-drawer__container--medium {
        width: 400px;
      }
      
      &.v-drawer__container--large {
        width: 500px;
      }
    }
    
    // 顶部抽屉
    &--top {
      top: 0;
      left: 0;
      width: 100%;
      
      &.v-drawer__container--small {
        height: 200px;
      }
      
      &.v-drawer__container--medium {
        height: 300px;
      }
      
      &.v-drawer__container--large {
        height: 400px;
      }
    }
    
    // 底部抽屉
    &--bottom {
      bottom: 0;
      left: 0;
      width: 100%;
      
      &.v-drawer__container--small {
        height: 200px;
      }
      
      &.v-drawer__container--medium {
        height: 300px;
      }
      
      &.v-drawer__container--large {
        height: 400px;
      }
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
  
  // 响应式设计
  @include mobile {
    &__container {
      &--right,
      &--left {
        &.v-drawer__container--small,
        &.v-drawer__container--medium,
        &.v-drawer__container--large {
          width: 100%;
          max-width: 320px;
        }
      }
      
      &--top,
      &--bottom {
        &.v-drawer__container--small {
          height: 40%;
        }
        
        &.v-drawer__container--medium {
          height: 60%;
        }
        
        &.v-drawer__container--large {
          height: 80%;
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
    &__container {
      &--right,
      &--left {
        &.v-drawer__container--small {
          width: 280px;
        }
        
        &.v-drawer__container--medium {
          width: 360px;
        }
        
        &.v-drawer__container--large {
          width: 440px;
        }
      }
    }
    
    &__actions {
      flex-wrap: wrap;
      
      .v-button {
        min-width: 100px;
      }
    }
  }
}

// 动画 - 右侧抽屉
.v-drawer--right {
  .drawer-enter-active,
  .drawer-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    .v-drawer__mask {
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .v-drawer__container {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
  
  .drawer-enter-from,
  .drawer-leave-to {
    .v-drawer__mask {
      opacity: 0;
    }
    
    .v-drawer__container {
      transform: translateX(100%);
    }
  }
  
  .drawer-enter-to,
  .drawer-leave-from {
    .v-drawer__mask {
      opacity: 1;
    }
    
    .v-drawer__container {
      transform: translateX(0);
    }
  }
}

// 动画 - 左侧抽屉
.v-drawer--left {
  .drawer-enter-active,
  .drawer-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    .v-drawer__mask {
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .v-drawer__container {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
  
  .drawer-enter-from,
  .drawer-leave-to {
    .v-drawer__mask {
      opacity: 0;
    }
    
    .v-drawer__container {
      transform: translateX(-100%);
    }
  }
  
  .drawer-enter-to,
  .drawer-leave-from {
    .v-drawer__mask {
      opacity: 1;
    }
    
    .v-drawer__container {
      transform: translateX(0);
    }
  }
}

// 动画 - 顶部抽屉
.v-drawer--top {
  .drawer-enter-active,
  .drawer-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    .v-drawer__mask {
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .v-drawer__container {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
  
  .drawer-enter-from,
  .drawer-leave-to {
    .v-drawer__mask {
      opacity: 0;
    }
    
    .v-drawer__container {
      transform: translateY(-100%);
    }
  }
  
  .drawer-enter-to,
  .drawer-leave-from {
    .v-drawer__mask {
      opacity: 1;
    }
    
    .v-drawer__container {
      transform: translateY(0);
    }
  }
}

// 动画 - 底部抽屉
.v-drawer--bottom {
  .drawer-enter-active,
  .drawer-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    .v-drawer__mask {
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .v-drawer__container {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
  
  .drawer-enter-from,
  .drawer-leave-to {
    .v-drawer__mask {
      opacity: 0;
    }
    
    .v-drawer__container {
      transform: translateY(100%);
    }
  }
  
  .drawer-enter-to,
  .drawer-leave-from {
    .v-drawer__mask {
      opacity: 1;
    }
    
    .v-drawer__container {
      transform: translateY(0);
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .v-drawer {
    &__mask {
      background-color: rgba(0, 0, 0, 0.7);
    }
    
    &__container {
      background-color: var(--el-bg-color-page);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8);
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