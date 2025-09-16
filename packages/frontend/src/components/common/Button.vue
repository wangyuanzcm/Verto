<template>
  <a-button
    :type="antdType"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    :danger="danger"
    :ghost="ghost"
    :block="block"
    :shape="shape"
    :html-type="nativeType"
    :class="customClass"
    @click="handleClick"
  >
    <!-- 左侧图标 -->
    <template v-if="icon && !loading" #icon>
      <component :is="icon" />
    </template>
    
    <!-- 按钮内容 -->
    <slot />
  </a-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * 按钮组件属性接口
 */
interface ButtonProps {
  /** 按钮类型 */
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link'
  /** 按钮尺寸 */
  size?: 'small' | 'middle' | 'large'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 是否为块级按钮 */
  block?: boolean
  /** 是否为危险按钮 */
  danger?: boolean
  /** 是否为幽灵按钮 */
  ghost?: boolean
  /** 按钮形状 */
  shape?: 'default' | 'circle' | 'round'
  /** 左侧图标 */
  icon?: any
  /** 原生按钮类型 */
  nativeType?: 'button' | 'submit' | 'reset'
  /** 自定义类名 */
  customClass?: string
}

/**
 * 按钮组件事件接口
 */
interface ButtonEmits {
  /** 点击事件 */
  (e: 'click', event: MouseEvent): void
}

// 定义属性和事件
const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'default',
  size: 'middle',
  disabled: false,
  loading: false,
  block: false,
  danger: false,
  ghost: false,
  shape: 'default',
  nativeType: 'button'
})

const emit = defineEmits<ButtonEmits>()

/**
 * 转换为Ant Design Vue的type
 */
const antdType = computed(() => {
  return props.type
})

/**
 * 处理按钮点击事件
 * @param event 鼠标事件
 */
const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  
  emit('click', event)
}

// 暴露方法
defineExpose({
  focus: () => {
    // 获取按钮元素并聚焦
  },
  blur: () => {
    // 获取按钮元素并失焦
  }
})
</script>

<style scoped>
/* 自定义样式可以在这里添加 */
</style>