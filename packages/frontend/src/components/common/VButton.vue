<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="nativeType"
    @click="handleClick"
  >
    <el-icon v-if="loading" class="v-button__loading">
      <Loading />
    </el-icon>
    <el-icon v-else-if="icon && iconPosition === 'left'" class="v-button__icon">
      <component :is="icon" />
    </el-icon>
    
    <span v-if="$slots.default" class="v-button__text">
      <slot />
    </span>
    
    <el-icon v-if="icon && iconPosition === 'right'" class="v-button__icon">
      <component :is="icon" />
    </el-icon>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElIcon } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

/**
 * 自定义按钮组件
 * 基于Element Plus Button扩展，提供更多自定义样式和功能
 */

// 定义组件属性
interface Props {
  /** 按钮类型 */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'default'
  /** 按钮尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 是否为朴素按钮 */
  plain?: boolean
  /** 是否为圆角按钮 */
  round?: boolean
  /** 是否为圆形按钮 */
  circle?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 图标组件 */
  icon?: any
  /** 图标位置 */
  iconPosition?: 'left' | 'right'
  /** 原生type属性 */
  nativeType?: 'button' | 'submit' | 'reset'
  /** 是否为块级按钮 */
  block?: boolean
  /** 自定义样式变体 */
  variant?: 'gradient' | 'shadow' | 'outline' | 'ghost'
}

// 定义默认值
const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'default',
  plain: false,
  round: false,
  circle: false,
  disabled: false,
  loading: false,
  iconPosition: 'left',
  nativeType: 'button',
  block: false
})

// 定义事件
const emit = defineEmits<{
  click: [event: MouseEvent]
}>

// 计算按钮样式类
const buttonClasses = computed(() => {
  const classes = ['v-button']
  
  // 基础类型
  classes.push(`v-button--${props.type}`)
  
  // 尺寸
  if (props.size !== 'default') {
    classes.push(`v-button--${props.size}`)
  }
  
  // 状态修饰符
  if (props.plain) classes.push('v-button--plain')
  if (props.round) classes.push('v-button--round')
  if (props.circle) classes.push('v-button--circle')
  if (props.disabled) classes.push('v-button--disabled')
  if (props.loading) classes.push('v-button--loading')
  if (props.block) classes.push('v-button--block')
  
  // 样式变体
  if (props.variant) {
    classes.push(`v-button--${props.variant}`)
  }
  
  return classes
})

/**
 * 处理点击事件
 * @param event 鼠标事件
 */
const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.v-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: $border-radius-base;
  font-size: $font-size-base;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease-in-out;
  outline: none;
  
  &:focus {
    outline: 2px solid var(--el-color-primary-light-7);
    outline-offset: 2px;
  }
  
  // 基础类型样式
  &--default {
    color: var(--el-text-color-regular);
    background-color: var(--el-fill-color-blank);
    border-color: var(--el-border-color);
    
    &:hover:not(.v-button--disabled) {
      color: var(--el-color-primary);
      border-color: var(--el-color-primary-light-7);
      background-color: var(--el-color-primary-light-9);
    }
    
    &:active:not(.v-button--disabled) {
      color: var(--el-color-primary-dark-2);
      border-color: var(--el-color-primary-dark-2);
      background-color: var(--el-color-primary-light-8);
    }
  }
  
  &--primary {
    color: #fff;
    background-color: var(--el-color-primary);
    border-color: var(--el-color-primary);
    
    &:hover:not(.v-button--disabled) {
      background-color: var(--el-color-primary-light-3);
      border-color: var(--el-color-primary-light-3);
    }
    
    &:active:not(.v-button--disabled) {
      background-color: var(--el-color-primary-dark-2);
      border-color: var(--el-color-primary-dark-2);
    }
  }
  
  &--success {
    color: #fff;
    background-color: var(--el-color-success);
    border-color: var(--el-color-success);
    
    &:hover:not(.v-button--disabled) {
      background-color: var(--el-color-success-light-3);
      border-color: var(--el-color-success-light-3);
    }
    
    &:active:not(.v-button--disabled) {
      background-color: var(--el-color-success-dark-2);
      border-color: var(--el-color-success-dark-2);
    }
  }
  
  &--warning {
    color: #fff;
    background-color: var(--el-color-warning);
    border-color: var(--el-color-warning);
    
    &:hover:not(.v-button--disabled) {
      background-color: var(--el-color-warning-light-3);
      border-color: var(--el-color-warning-light-3);
    }
    
    &:active:not(.v-button--disabled) {
      background-color: var(--el-color-warning-dark-2);
      border-color: var(--el-color-warning-dark-2);
    }
  }
  
  &--danger {
    color: #fff;
    background-color: var(--el-color-danger);
    border-color: var(--el-color-danger);
    
    &:hover:not(.v-button--disabled) {
      background-color: var(--el-color-danger-light-3);
      border-color: var(--el-color-danger-light-3);
    }
    
    &:active:not(.v-button--disabled) {
      background-color: var(--el-color-danger-dark-2);
      border-color: var(--el-color-danger-dark-2);
    }
  }
  
  &--info {
    color: #fff;
    background-color: var(--el-color-info);
    border-color: var(--el-color-info);
    
    &:hover:not(.v-button--disabled) {
      background-color: var(--el-color-info-light-3);
      border-color: var(--el-color-info-light-3);
    }
    
    &:active:not(.v-button--disabled) {
      background-color: var(--el-color-info-dark-2);
      border-color: var(--el-color-info-dark-2);
    }
  }
  
  &--text {
    color: var(--el-color-primary);
    background-color: transparent;
    border-color: transparent;
    padding: 8px 12px;
    
    &:hover:not(.v-button--disabled) {
      color: var(--el-color-primary-light-3);
      background-color: var(--el-color-primary-light-9);
    }
    
    &:active:not(.v-button--disabled) {
      color: var(--el-color-primary-dark-2);
      background-color: var(--el-color-primary-light-8);
    }
  }
  
  // 尺寸变体
  &--large {
    padding: 12px 20px;
    font-size: $font-size-large;
    
    &.v-button--circle {
      width: 48px;
      height: 48px;
      padding: 0;
    }
  }
  
  &--small {
    padding: 6px 12px;
    font-size: $font-size-small;
    
    &.v-button--circle {
      width: 32px;
      height: 32px;
      padding: 0;
    }
  }
  
  // 修饰符
  &--plain {
    background-color: transparent;
    
    &.v-button--primary {
      color: var(--el-color-primary);
      border-color: var(--el-color-primary-light-5);
      
      &:hover:not(.v-button--disabled) {
        color: #fff;
        background-color: var(--el-color-primary);
        border-color: var(--el-color-primary);
      }
    }
    
    &.v-button--success {
      color: var(--el-color-success);
      border-color: var(--el-color-success-light-5);
      
      &:hover:not(.v-button--disabled) {
        color: #fff;
        background-color: var(--el-color-success);
        border-color: var(--el-color-success);
      }
    }
    
    &.v-button--warning {
      color: var(--el-color-warning);
      border-color: var(--el-color-warning-light-5);
      
      &:hover:not(.v-button--disabled) {
        color: #fff;
        background-color: var(--el-color-warning);
        border-color: var(--el-color-warning);
      }
    }
    
    &.v-button--danger {
      color: var(--el-color-danger);
      border-color: var(--el-color-danger-light-5);
      
      &:hover:not(.v-button--disabled) {
        color: #fff;
        background-color: var(--el-color-danger);
        border-color: var(--el-color-danger);
      }
    }
    
    &.v-button--info {
      color: var(--el-color-info);
      border-color: var(--el-color-info-light-5);
      
      &:hover:not(.v-button--disabled) {
        color: #fff;
        background-color: var(--el-color-info);
        border-color: var(--el-color-info);
      }
    }
  }
  
  &--round {
    border-radius: 20px;
  }
  
  &--circle {
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: 50%;
    
    .v-button__text {
      display: none;
    }
  }
  
  &--block {
    display: flex;
    width: 100%;
  }
  
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover,
    &:active,
    &:focus {
      transform: none;
      box-shadow: none;
    }
  }
  
  &--loading {
    cursor: default;
    pointer-events: none;
  }
  
  // 样式变体
  &--gradient {
    &.v-button--primary {
      background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
      
      &:hover:not(.v-button--disabled) {
        background: linear-gradient(135deg, var(--el-color-primary-light-3), var(--el-color-primary));
      }
    }
    
    &.v-button--success {
      background: linear-gradient(135deg, var(--el-color-success), var(--el-color-success-light-3));
      
      &:hover:not(.v-button--disabled) {
        background: linear-gradient(135deg, var(--el-color-success-light-3), var(--el-color-success));
      }
    }
  }
  
  &--shadow {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    &:hover:not(.v-button--disabled) {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }
    
    &:active:not(.v-button--disabled) {
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      transform: translateY(0);
    }
  }
  
  &--outline {
    background-color: transparent;
    
    &.v-button--primary {
      color: var(--el-color-primary);
      border-color: var(--el-color-primary);
      border-width: 2px;
      
      &:hover:not(.v-button--disabled) {
        color: #fff;
        background-color: var(--el-color-primary);
      }
    }
  }
  
  &--ghost {
    background-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover:not(.v-button--disabled) {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
  
  // 图标和文本
  &__icon {
    font-size: 1em;
    
    &:only-child {
      margin: 0;
    }
  }
  
  &__loading {
    animation: v-button-loading 1s linear infinite;
  }
  
  &__text {
    flex: 1;
  }
  
  // 响应式设计
  @include mobile {
    &:not(.v-button--small) {
      padding: 10px 16px;
      font-size: $font-size-base;
    }
    
    &.v-button--large {
      padding: 12px 20px;
    }
  }
}

// 加载动画
@keyframes v-button-loading {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .v-button {
    &--default {
      background-color: var(--el-fill-color-light);
      border-color: var(--el-border-color-light);
    }
    
    &--ghost {
      background-color: rgba(0, 0, 0, 0.1);
      border-color: rgba(0, 0, 0, 0.2);
      
      &:hover:not(.v-button--disabled) {
        background-color: rgba(0, 0, 0, 0.2);
      }
    }
  }
}
</style>