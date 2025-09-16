<template>
  <div :class="cardClasses" :style="cardStyles">
    <!-- 卡片头部 -->
    <div v-if="$slots.header || title || extra" class="v-card__header">
      <div class="v-card__header-content">
        <slot name="header">
          <h3 v-if="title" class="v-card__title">{{ title }}</h3>
        </slot>
      </div>
      <div v-if="$slots.extra || extra" class="v-card__extra">
        <slot name="extra">
          <span v-if="extra">{{ extra }}</span>
        </slot>
      </div>
    </div>
    
    <!-- 卡片封面 -->
    <div v-if="$slots.cover || cover" class="v-card__cover">
      <slot name="cover">
        <img v-if="cover" :src="cover" :alt="title || 'Card cover'" class="v-card__cover-image" />
      </slot>
    </div>
    
    <!-- 卡片主体 -->
    <div v-if="$slots.default" class="v-card__body" :style="bodyStyles">
      <slot />
    </div>
    
    <!-- 卡片底部 -->
    <div v-if="$slots.footer || actions.length > 0" class="v-card__footer">
      <slot name="footer">
        <div v-if="actions.length > 0" class="v-card__actions">
          <VButton
            v-for="(action, index) in actions"
            :key="index"
            v-bind="action"
            @click="handleActionClick(action, index)"
          >
            {{ action.text }}
          </VButton>
        </div>
      </slot>
    </div>
    
    <!-- 加载遮罩 -->
    <div v-if="loading" class="v-card__loading">
      <el-icon class="v-card__loading-icon">
        <Loading />
      </el-icon>
      <span v-if="loadingText" class="v-card__loading-text">{{ loadingText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import { ElIcon } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import VButton from './VButton.vue'

/**
 * 自定义卡片组件
 * 提供丰富的卡片样式和功能
 */

// 动作按钮接口
interface CardAction {
  text: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'default'
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  loading?: boolean
  icon?: any
  [key: string]: any
}

// 定义组件属性
interface Props {
  /** 卡片标题 */
  title?: string
  /** 卡片额外内容 */
  extra?: string
  /** 封面图片 */
  cover?: string
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否显示阴影 */
  shadow?: 'always' | 'hover' | 'never'
  /** 卡片尺寸 */
  size?: 'small' | 'default' | 'large'
  /** 是否可悬停 */
  hoverable?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 加载文本 */
  loadingText?: string
  /** 主体内边距 */
  bodyPadding?: string | number
  /** 自定义样式 */
  customStyle?: CSSProperties
  /** 动作按钮列表 */
  actions?: CardAction[]
  /** 卡片类型 */
  type?: 'default' | 'inner' | 'meta'
  /** 背景色 */
  background?: string
  /** 是否可点击 */
  clickable?: boolean
}

// 定义默认值
const props = withDefaults(defineProps<Props>(), {
  bordered: true,
  shadow: 'hover',
  size: 'default',
  hoverable: false,
  loading: false,
  actions: () => [],
  type: 'default',
  clickable: false
})

// 定义事件
const emit = defineEmits<{
  click: [event: MouseEvent]
  actionClick: [action: CardAction, index: number]
}>

// 计算卡片样式类
const cardClasses = computed(() => {
  const classes = ['v-card']
  
  // 基础类型
  classes.push(`v-card--${props.type}`)
  
  // 尺寸
  if (props.size !== 'default') {
    classes.push(`v-card--${props.size}`)
  }
  
  // 边框
  if (props.bordered) {
    classes.push('v-card--bordered')
  }
  
  // 阴影
  classes.push(`v-card--shadow-${props.shadow}`)
  
  // 可悬停
  if (props.hoverable) {
    classes.push('v-card--hoverable')
  }
  
  // 可点击
  if (props.clickable) {
    classes.push('v-card--clickable')
  }
  
  // 加载状态
  if (props.loading) {
    classes.push('v-card--loading')
  }
  
  return classes
})

// 计算卡片样式
const cardStyles = computed(() => {
  const styles: CSSProperties = {}
  
  if (props.background) {
    styles.backgroundColor = props.background
  }
  
  return {
    ...styles,
    ...props.customStyle
  }
})

// 计算主体样式
const bodyStyles = computed(() => {
  const styles: CSSProperties = {}
  
  if (props.bodyPadding !== undefined) {
    const padding = typeof props.bodyPadding === 'number' 
      ? `${props.bodyPadding}px` 
      : props.bodyPadding
    styles.padding = padding
  }
  
  return styles
})

/**
 * 处理动作按钮点击
 * @param action 动作配置
 * @param index 按钮索引
 */
const handleActionClick = (action: CardAction, index: number) => {
  emit('actionClick', action, index)
}

/**
 * 处理卡片点击
 * @param event 鼠标事件
 */
const handleClick = (event: MouseEvent) => {
  if (props.clickable && !props.loading) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.v-card {
  position: relative;
  background-color: var(--el-bg-color);
  border-radius: $border-radius-base;
  overflow: hidden;
  transition: all 0.3s ease;
  
  // 基础类型
  &--default {
    // 默认样式
  }
  
  &--inner {
    background-color: var(--el-fill-color-light);
  }
  
  &--meta {
    .v-card__body {
      padding: 0;
    }
  }
  
  // 尺寸变体
  &--small {
    .v-card__header {
      padding: 12px 16px;
    }
    
    .v-card__body {
      padding: 12px 16px;
    }
    
    .v-card__footer {
      padding: 12px 16px;
    }
    
    .v-card__title {
      font-size: $font-size-base;
    }
  }
  
  &--large {
    .v-card__header {
      padding: 24px 32px;
    }
    
    .v-card__body {
      padding: 24px 32px;
    }
    
    .v-card__footer {
      padding: 24px 32px;
    }
    
    .v-card__title {
      font-size: $font-size-large;
    }
  }
  
  // 边框
  &--bordered {
    border: 1px solid var(--el-border-color-light);
  }
  
  // 阴影
  &--shadow-always {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &--shadow-hover {
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }
  }
  
  &--shadow-never {
    box-shadow: none;
  }
  
  // 可悬停
  &--hoverable {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
  }
  
  // 可点击
  &--clickable {
    cursor: pointer;
    
    &:hover {
      border-color: var(--el-color-primary-light-7);
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  // 加载状态
  &--loading {
    pointer-events: none;
  }
  
  // 卡片头部
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    
    &-content {
      flex: 1;
      min-width: 0;
    }
  }
  
  &__title {
    margin: 0;
    font-size: $font-size-medium;
    font-weight: 600;
    color: var(--el-text-color-primary);
    @include text-ellipsis;
  }
  
  &__extra {
    margin-left: 16px;
    color: var(--el-text-color-secondary);
    font-size: $font-size-small;
  }
  
  // 卡片封面
  &__cover {
    position: relative;
    overflow: hidden;
    
    &-image {
      width: 100%;
      height: auto;
      display: block;
      transition: transform 0.3s ease;
      
      .v-card--hoverable &:hover {
        transform: scale(1.05);
      }
    }
  }
  
  // 卡片主体
  &__body {
    padding: 20px;
    color: var(--el-text-color-regular);
    line-height: 1.6;
  }
  
  // 卡片底部
  &__footer {
    padding: 16px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-blank);
  }
  
  &__actions {
    display: flex;
    gap: 8px;
    align-items: center;
    
    &:not(:first-child) {
      margin-top: 12px;
    }
  }
  
  // 加载遮罩
  &__loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(2px);
    z-index: 10;
    
    &-icon {
      font-size: 24px;
      color: var(--el-color-primary);
      animation: v-card-loading 1s linear infinite;
    }
    
    &-text {
      margin-top: 8px;
      color: var(--el-text-color-secondary);
      font-size: $font-size-small;
    }
  }
  
  // 响应式设计
  @include mobile {
    &__header {
      padding: 12px 16px;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    
    &__extra {
      margin-left: 0;
    }
    
    &__body {
      padding: 16px;
    }
    
    &__footer {
      padding: 12px 16px;
    }
    
    &__actions {
      flex-wrap: wrap;
    }
  }
  
  @include tablet {
    &__header {
      padding: 14px 18px;
    }
    
    &__body {
      padding: 18px;
    }
    
    &__footer {
      padding: 14px 18px;
    }
  }
}

// 加载动画
@keyframes v-card-loading {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .v-card {
    &__loading {
      background-color: rgba(0, 0, 0, 0.8);
    }
    
    &--inner {
      background-color: var(--el-fill-color-dark);
    }
  }
}

// 特殊卡片样式
.v-card {
  // 信息卡片
  &--info {
    border-left: 4px solid var(--el-color-info);
    
    .v-card__title {
      color: var(--el-color-info);
    }
  }
  
  // 成功卡片
  &--success {
    border-left: 4px solid var(--el-color-success);
    
    .v-card__title {
      color: var(--el-color-success);
    }
  }
  
  // 警告卡片
  &--warning {
    border-left: 4px solid var(--el-color-warning);
    
    .v-card__title {
      color: var(--el-color-warning);
    }
  }
  
  // 危险卡片
  &--danger {
    border-left: 4px solid var(--el-color-danger);
    
    .v-card__title {
      color: var(--el-color-danger);
    }
  }
  
  // 渐变卡片
  &--gradient {
    background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-primary-light-8));
    border: none;
    
    .v-card__title {
      color: var(--el-color-primary);
    }
  }
  
  // 玻璃态卡片
  &--glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .v-card__header {
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }
    
    .v-card__footer {
      border-top-color: rgba(255, 255, 255, 0.1);
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
}
</style>