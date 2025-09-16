<template>
  <div :class="wrapperClasses">
    <!-- 标签 -->
    <label
      v-if="label"
      :for="inputId"
      :class="labelClasses"
    >
      {{ label }}
      <span v-if="required" class="input-required">*</span>
    </label>
    
    <!-- 普通输入框 -->
    <a-input
      v-if="type !== 'password'"
      :id="inputId"
      ref="inputRef"
      v-model:value="inputValue"
      :type="inputType"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :size="size"
      :status="status"
      :allow-clear="clearable"
      :show-count="showCount"
      :autocomplete="autocomplete"
      :class="customClass"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      @keyup="handleKeyup"
      @keypress="handleKeypress"
      @pressEnter="handlePressEnter"
    >
      <!-- 前缀图标 -->
      <template v-if="prefixIcon" #prefix>
        <component :is="prefixIcon" />
      </template>
      
      <!-- 后缀图标 -->
      <template v-if="suffixIcon" #suffix>
        <component :is="suffixIcon" @click="handleSuffixIconClick" />
      </template>
    </a-input>
    
    <!-- 密码输入框 -->
    <a-input-password
      v-if="type === 'password'"
      :id="inputId"
      ref="inputRef"
      v-model:value="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :size="size"
      :status="status"
      :allow-clear="clearable"
      :show-count="showCount"
      :autocomplete="autocomplete"
      :class="customClass"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      @keyup="handleKeyup"
      @keypress="handleKeypress"
      @pressEnter="handlePressEnter"
    >
      <!-- 前缀图标 -->
      <template v-if="prefixIcon" #prefix>
        <component :is="prefixIcon" />
      </template>
    </a-input-password>
    
    <!-- 帮助文本 -->
    <div
      v-if="helpText || errorMessage"
      :class="helpTextClasses"
    >
      {{ errorMessage || helpText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

/**
 * 输入框组件属性接口
 */
interface InputProps {
  /** 输入框值 */
  modelValue?: string | number
  /** 输入框类型 */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  /** 占位符 */
  placeholder?: string
  /** 标签 */
  label?: string
  /** 是否必填 */
  required?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 最大长度 */
  maxlength?: number
  /** 输入框尺寸 */
  size?: 'small' | 'middle' | 'large'
  /** 输入框状态 */
  status?: 'error' | 'warning'
  /** 是否可清除 */
  clearable?: boolean
  /** 是否显示字符计数 */
  showCount?: boolean
  /** 前缀图标 */
  prefixIcon?: any
  /** 后缀图标 */
  suffixIcon?: any
  /** 帮助文本 */
  helpText?: string
  /** 错误信息 */
  errorMessage?: string
  /** 自动完成 */
  autocomplete?: string
  /** 自定义类名 */
  customClass?: string
}

/**
 * 输入框组件事件接口
 */
interface InputEmits {
  /** 值更新事件 */
  (e: 'update:modelValue', value: string | number): void
  /** 输入事件 */
  (e: 'input', value: string | number, event: Event): void
  /** 变化事件 */
  (e: 'change', value: string | number, event: Event): void
  /** 聚焦事件 */
  (e: 'focus', event: FocusEvent): void
  /** 失焦事件 */
  (e: 'blur', event: FocusEvent): void
  /** 键盘按下事件 */
  (e: 'keydown', event: KeyboardEvent): void
  /** 键盘抬起事件 */
  (e: 'keyup', event: KeyboardEvent): void
  /** 键盘按键事件 */
  (e: 'keypress', event: KeyboardEvent): void
  /** 回车事件 */
  (e: 'pressEnter', event: KeyboardEvent): void
  /** 清除事件 */
  (e: 'clear'): void
  /** 后置图标点击事件 */
  (e: 'suffix-icon-click', event: MouseEvent): void
}

// 定义属性和事件
const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  size: 'middle',
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
  showCount: false,
  autocomplete: 'off'
})

const emit = defineEmits<InputEmits>()

// 响应式数据
const inputRef = ref()
const inputValue = ref(props.modelValue)

// 生成唯一ID
const inputId = computed(() => {
  return `input-${Math.random().toString(36).substr(2, 9)}`
})

/**
 * 计算输入框类型
 */
const inputType = computed(() => {
  return props.type === 'password' ? 'text' : props.type
})

/**
 * 计算输入框状态
 */
const status = computed(() => {
  if (props.errorMessage) {
    return 'error'
  }
  return props.status
})

/**
 * 计算包装器样式类名
 */
const wrapperClasses = computed(() => {
  const classes = ['input-wrapper']
  
  if (props.customClass) {
    classes.push(props.customClass)
  }
  
  return classes
})

/**
 * 计算标签样式类名
 */
const labelClasses = computed(() => {
  return [
    'input-label',
    {
      'input-label-required': props.required,
      'input-label-disabled': props.disabled
    }
  ]
})

/**
 * 计算帮助文本样式类名
 */
const helpTextClasses = computed(() => {
  return [
    'input-help-text',
    {
      'input-help-text-error': props.errorMessage
    }
  ]
})

/**
 * 处理输入事件
 * @param value 输入值
 * @param event 输入事件
 */
const handleInput = (value: string | number, event?: Event) => {
  inputValue.value = value
  emit('update:modelValue', value)
  if (event) {
    emit('input', value, event)
  }
}

/**
 * 处理变化事件
 * @param event 变化事件
 */
const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value
  
  if (props.type === 'number') {
    value = target.valueAsNumber || 0
  }
  
  emit('change', value, event)
}

/**
 * 处理聚焦事件
 * @param event 聚焦事件
 */
const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

/**
 * 处理失焦事件
 * @param event 失焦事件
 */
const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

/**
 * 处理键盘按下事件
 * @param event 键盘事件
 */
const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

/**
 * 处理键盘抬起事件
 * @param event 键盘事件
 */
const handleKeyup = (event: KeyboardEvent) => {
  emit('keyup', event)
}

/**
 * 处理键盘按键事件
 * @param event 键盘事件
 */
const handleKeypress = (event: KeyboardEvent) => {
  emit('keypress', event)
}

/**
 * 处理回车事件
 * @param event 键盘事件
 */
const handlePressEnter = (event: KeyboardEvent) => {
  emit('pressEnter', event)
}

/**
 * 处理后置图标点击
 * @param event 鼠标事件
 */
const handleSuffixIconClick = (event: MouseEvent) => {
  emit('suffix-icon-click', event)
}

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue
}, { immediate: true })

// 暴露方法
defineExpose({
  focus: () => {
    inputRef.value?.focus()
  },
  blur: () => {
    inputRef.value?.blur()
  },
  select: () => {
    inputRef.value?.select()
  }
})
</script>

<style scoped>
.input-wrapper {
  @apply w-full;
}

/* 标签样式 */
.input-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.input-label-required {
  @apply after:content-['*'] after:text-red-500 after:ml-1;
}

.input-label-disabled {
  @apply text-gray-400;
}

/* 帮助文本样式 */
.input-help-text {
  @apply mt-1 text-xs text-gray-500;
}

.input-help-text-error {
  @apply text-red-500;
}

/* 必填标记样式 */
.input-required {
  @apply text-red-500 ml-1;
}

/* 暗色主题支持 */
.dark .input-label {
  @apply text-gray-300;
}

.dark .input-help-text {
  @apply text-gray-400;
}
</style>