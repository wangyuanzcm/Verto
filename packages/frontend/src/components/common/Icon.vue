<template>
  <component
    :is="iconComponent"
    :class="iconClasses"
    :style="iconStyles"
    :spin="spin"
    :rotate="rotate"
    :two-tone-color="twoToneColor"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as AntdIcons from '@ant-design/icons-vue'

/**
 * 图标组件属性接口
 */
interface IconProps {
  /** 图标名称 */
  name: string
  /** 图标大小 */
  size?: 'small' | 'medium' | 'large' | number | string
  /** 图标颜色 */
  color?: string
  /** 是否旋转 */
  spin?: boolean
  /** 旋转角度 */
  rotate?: number
  /** 双色图标颜色 */
  twoToneColor?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义样式类名 */
  customClass?: string
}

/**
 * 图标组件事件接口
 */
interface IconEmits {
  /** 点击事件 */
  'click': [event: MouseEvent]
}

// 定义属性
const props = withDefaults(defineProps<IconProps>(), {
  size: 'medium',
  color: '',
  spin: false,
  rotate: 0,
  twoToneColor: '',
  disabled: false,
  customClass: ''
})

// 定义事件
const emit = defineEmits<IconEmits>()

/**
 * 计算图标组件
 */
const iconComponent = computed(() => {
  // 将kebab-case转换为PascalCase
  const pascalName = props.name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
  
  // 尝试获取对应的图标组件
  const IconComponent = (AntdIcons as any)[pascalName] || 
                       (AntdIcons as any)[`${pascalName}Outlined`] ||
                       (AntdIcons as any)[`${pascalName}Filled`] ||
                       (AntdIcons as any)[`${pascalName}TwoTone`]
  
  return IconComponent || AntdIcons.QuestionCircleOutlined
})

/**
 * 计算图标样式类名
 */
const iconClasses = computed(() => {
  const classes = [
    'icon',
    `icon-${props.size}`,
    {
      'icon-disabled': props.disabled
    }
  ]
  
  if (props.customClass) {
    classes.push(props.customClass)
  }
  
  return classes
})

/**
 * 计算图标样式
 */
const iconStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  if (props.color) {
    styles.color = props.color
  }
  
  // 根据size设置字体大小
  if (typeof props.size === 'number') {
    styles.fontSize = `${props.size}px`
  } else if (typeof props.size === 'string' && !['small', 'medium', 'large'].includes(props.size)) {
    styles.fontSize = props.size
  }
  
  return styles
})

/**
 * 处理点击事件
 * @param event 鼠标事件
 */
const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}</script>

<style scoped>
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.icon-small {
  font-size: 12px;
}

.icon-medium {
  font-size: 14px;
}

.icon-large {
  font-size: 16px;
}

.icon-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 悬停效果 */
.icon:hover:not(.icon-disabled) {
  opacity: 0.8;
  transform: scale(1.1);
}

/* 激活效果 */
.icon:active:not(.icon-disabled) {
  transform: scale(0.95);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .icon-small {
    font-size: 10px;
  }
  
  .icon-medium {
    font-size: 12px;
  }
  
  .icon-large {
    font-size: 14px;
  }
}

/* 暗色主题 */
@media (prefers-color-scheme: dark) {
  .icon {
    color: #d9d9d9;
  }
  
  .icon-disabled {
    color: #595959;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .icon:hover:not(.icon-disabled) {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
}
</style>