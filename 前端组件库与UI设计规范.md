# 前端组件库与UI设计规范

## 1. 设计系统概览

### 1.1 设计原则
- **一致性**: 统一的视觉语言和交互模式
- **可用性**: 简洁直观的用户界面
- **可访问性**: 支持无障碍访问
- **响应式**: 适配不同屏幕尺寸
- **可扩展性**: 支持主题定制和组件扩展
- **性能优先**: 轻量级组件，按需加载

### 1.2 技术栈
```
┌─────────────────────────────────────────────────────────┐
│                    Vue 3 + TypeScript                   │
├─────────────────────────────────────────────────────────┤
│  Ant Design Vue  │  自定义组件库  │  图标库(Iconify)    │
├─────────────────────────────────────────────────────────┤
│  UnoCSS/Tailwind │  CSS Variables │  PostCSS           │
├─────────────────────────────────────────────────────────┤
│  Storybook       │  Vitest        │  Chromatic         │
└─────────────────────────────────────────────────────────┘
```

## 2. 设计令牌 (Design Tokens)

### 2.1 颜色系统

#### 2.1.1 主色调
```css
:root {
  /* 主色调 - 蓝色系 */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;  /* 主色 */
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-primary-950: #172554;

  /* 辅助色调 - 绿色系 */
  --color-success-50: #f0fdf4;
  --color-success-100: #dcfce7;
  --color-success-200: #bbf7d0;
  --color-success-300: #86efac;
  --color-success-400: #4ade80;
  --color-success-500: #22c55e;  /* 成功色 */
  --color-success-600: #16a34a;
  --color-success-700: #15803d;
  --color-success-800: #166534;
  --color-success-900: #14532d;

  /* 警告色调 - 橙色系 */
  --color-warning-50: #fffbeb;
  --color-warning-100: #fef3c7;
  --color-warning-200: #fde68a;
  --color-warning-300: #fcd34d;
  --color-warning-400: #fbbf24;
  --color-warning-500: #f59e0b;  /* 警告色 */
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;
  --color-warning-800: #92400e;
  --color-warning-900: #78350f;

  /* 错误色调 - 红色系 */
  --color-error-50: #fef2f2;
  --color-error-100: #fee2e2;
  --color-error-200: #fecaca;
  --color-error-300: #fca5a5;
  --color-error-400: #f87171;
  --color-error-500: #ef4444;  /* 错误色 */
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;
  --color-error-800: #991b1b;
  --color-error-900: #7f1d1d;
}
```

#### 2.1.2 中性色
```css
:root {
  /* 中性色 - 灰色系 */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-gray-950: #030712;

  /* 语义化颜色 */
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --color-text-tertiary: var(--color-gray-400);
  --color-text-disabled: var(--color-gray-300);
  
  --color-bg-primary: #ffffff;
  --color-bg-secondary: var(--color-gray-50);
  --color-bg-tertiary: var(--color-gray-100);
  --color-bg-disabled: var(--color-gray-200);
  
  --color-border-primary: var(--color-gray-200);
  --color-border-secondary: var(--color-gray-300);
  --color-border-focus: var(--color-primary-500);
}
```

#### 2.1.3 暗色主题
```css
[data-theme="dark"] {
  --color-text-primary: var(--color-gray-100);
  --color-text-secondary: var(--color-gray-300);
  --color-text-tertiary: var(--color-gray-500);
  --color-text-disabled: var(--color-gray-600);
  
  --color-bg-primary: var(--color-gray-900);
  --color-bg-secondary: var(--color-gray-800);
  --color-bg-tertiary: var(--color-gray-700);
  --color-bg-disabled: var(--color-gray-600);
  
  --color-border-primary: var(--color-gray-700);
  --color-border-secondary: var(--color-gray-600);
  --color-border-focus: var(--color-primary-400);
}
```

### 2.2 字体系统

#### 2.2.1 字体族
```css
:root {
  /* 字体族 */
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  --font-family-serif: 'Crimson Pro', 'Source Serif Pro', serif;
}
```

#### 2.2.2 字体大小
```css
:root {
  /* 字体大小 */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */
  --font-size-6xl: 3.75rem;   /* 60px */

  /* 行高 */
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;

  /* 字重 */
  --font-weight-thin: 100;
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;
  --font-weight-black: 900;
}
```

### 2.3 间距系统

```css
:root {
  /* 间距系统 - 基于 4px 网格 */
  --spacing-0: 0;
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  --spacing-20: 5rem;     /* 80px */
  --spacing-24: 6rem;     /* 96px */
  --spacing-32: 8rem;     /* 128px */
}
```

### 2.4 阴影系统

```css
:root {
  /* 阴影系统 */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-base: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

  /* 特殊阴影 */
  --shadow-focus: 0 0 0 3px rgb(59 130 246 / 0.1);
  --shadow-error: 0 0 0 3px rgb(239 68 68 / 0.1);
}
```

### 2.5 圆角系统

```css
:root {
  /* 圆角系统 */
  --radius-none: 0;
  --radius-sm: 0.125rem;   /* 2px */
  --radius-base: 0.25rem;  /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-3xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;
}
```

## 3. 组件库架构

### 3.1 目录结构

```
src/components/
├── base/                    # 基础组件
│   ├── Button/
│   │   ├── index.vue
│   │   ├── Button.stories.ts
│   │   ├── Button.test.ts
│   │   └── types.ts
│   ├── Input/
│   ├── Select/
│   └── ...
├── layout/                  # 布局组件
│   ├── Container/
│   ├── Grid/
│   ├── Sidebar/
│   └── ...
├── feedback/                # 反馈组件
│   ├── Alert/
│   ├── Message/
│   ├── Modal/
│   └── ...
├── navigation/              # 导航组件
│   ├── Menu/
│   ├── Breadcrumb/
│   ├── Pagination/
│   └── ...
├── data-display/            # 数据展示组件
│   ├── Table/
│   ├── List/
│   ├── Card/
│   └── ...
├── business/                # 业务组件
│   ├── ProjectCard/
│   ├── RequirementForm/
│   ├── MaterialLibrary/
│   └── ...
├── charts/                  # 图表组件
│   ├── LineChart/
│   ├── BarChart/
│   ├── PieChart/
│   └── ...
└── index.ts                 # 组件导出
```

### 3.2 组件开发规范

#### 3.2.1 组件命名规范
- 使用 PascalCase 命名组件
- 组件名称应该具有描述性
- 避免使用缩写，除非是广泛认知的缩写

```typescript
// ✅ 好的命名
UserProfileCard
ProjectManagementTable
RequirementStatusBadge

// ❌ 避免的命名
UPC
PMT
RSB
```

#### 3.2.2 Props 设计规范

```typescript
// 组件 Props 接口定义
interface ButtonProps {
  /**
   * 按钮类型
   * @default 'default'
   */
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'text' | 'link'
  
  /**
   * 按钮尺寸
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large'
  
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  
  /**
   * 是否加载中
   * @default false
   */
  loading?: boolean
  
  /**
   * 按钮图标
   */
  icon?: string
  
  /**
   * 图标位置
   * @default 'left'
   */
  iconPosition?: 'left' | 'right'
  
  /**
   * 是否为块级按钮
   * @default false
   */
  block?: boolean
  
  /**
   * 点击事件
   */
  onClick?: (event: MouseEvent) => void
}
```

#### 3.2.3 组件模板结构

```vue
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <Icon
      v-if="icon && iconPosition === 'left'"
      :name="icon"
      :class="iconClasses"
    />
    
    <span v-if="loading" class="loading-spinner" />
    
    <span class="button-content">
      <slot />
    </span>
    
    <Icon
      v-if="icon && iconPosition === 'right'"
      :name="icon"
      :class="iconClasses"
    />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonProps } from './types'

// Props 定义
const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
  loading: false,
  iconPosition: 'left',
  block: false
})

// Emits 定义
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 计算属性
const buttonClasses = computed(() => {
  return [
    'btn',
    `btn--${props.type}`,
    `btn--${props.size}`,
    {
      'btn--disabled': props.disabled,
      'btn--loading': props.loading,
      'btn--block': props.block
    }
  ]
})

const iconClasses = computed(() => {
  return [
    'btn__icon',
    `btn__icon--${props.iconPosition}`
  ]
})

// 事件处理
const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return
  emit('click', event)
  props.onClick?.(event)
}
</script>

<style scoped>
.btn {
  @apply inline-flex items-center justify-center;
  @apply font-medium transition-all duration-200;
  @apply border border-solid rounded-md;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
  
  /* 尺寸变体 */
  &--small {
    @apply px-3 py-1.5 text-sm;
    @apply h-8;
  }
  
  &--medium {
    @apply px-4 py-2 text-base;
    @apply h-10;
  }
  
  &--large {
    @apply px-6 py-3 text-lg;
    @apply h-12;
  }
  
  /* 类型变体 */
  &--default {
    @apply bg-white border-gray-300 text-gray-700;
    @apply hover:bg-gray-50 focus:ring-gray-500;
  }
  
  &--primary {
    @apply bg-primary-500 border-primary-500 text-white;
    @apply hover:bg-primary-600 focus:ring-primary-500;
  }
  
  &--success {
    @apply bg-success-500 border-success-500 text-white;
    @apply hover:bg-success-600 focus:ring-success-500;
  }
  
  /* 状态变体 */
  &--disabled {
    @apply opacity-50 cursor-not-allowed;
    @apply pointer-events-none;
  }
  
  &--loading {
    @apply cursor-wait;
  }
  
  &--block {
    @apply w-full;
  }
}

.btn__icon {
  @apply w-4 h-4;
  
  &--left {
    @apply mr-2;
  }
  
  &--right {
    @apply ml-2;
  }
}

.loading-spinner {
  @apply w-4 h-4 mr-2;
  @apply border-2 border-current border-t-transparent;
  @apply rounded-full animate-spin;
}

.button-content {
  @apply flex items-center;
}
</style>
```

### 3.3 组件测试规范

#### 3.3.1 单元测试

```typescript
// Button.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './index.vue'

describe('Button', () => {
  it('renders correctly', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me'
      }
    })
    
    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('btn')
    expect(wrapper.classes()).toContain('btn--default')
    expect(wrapper.classes()).toContain('btn--medium')
  })
  
  it('emits click event when clicked', async () => {
    const wrapper = mount(Button)
    
    await wrapper.trigger('click')
    
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
  
  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      }
    })
    
    await wrapper.trigger('click')
    
    expect(wrapper.emitted('click')).toBeUndefined()
  })
  
  it('shows loading state correctly', () => {
    const wrapper = mount(Button, {
      props: {
        loading: true
      }
    })
    
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(wrapper.classes()).toContain('btn--loading')
  })
  
  it('renders icon correctly', () => {
    const wrapper = mount(Button, {
      props: {
        icon: 'plus',
        iconPosition: 'left'
      }
    })
    
    const icon = wrapper.find('.btn__icon')
    expect(icon.exists()).toBe(true)
    expect(icon.classes()).toContain('btn__icon--left')
  })
})
```

#### 3.3.2 Storybook 故事

```typescript
// Button.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3'
import Button from './index.vue'

const meta: Meta<typeof Button> = {
  title: 'Base/Button',
  component: Button,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger', 'text', 'link']
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large']
    },
    disabled: {
      control: 'boolean'
    },
    loading: {
      control: 'boolean'
    },
    block: {
      control: 'boolean'
    },
    onClick: { action: 'clicked' }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: 'default'
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Default Button</Button>'
  })
}

export const Primary: Story = {
  args: {
    type: 'primary'
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Primary Button</Button>'
  })
}

export const WithIcon: Story = {
  args: {
    type: 'primary',
    icon: 'plus'
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Add Item</Button>'
  })
}

export const Loading: Story = {
  args: {
    type: 'primary',
    loading: true
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Loading...</Button>'
  })
}

export const AllSizes: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="flex items-center gap-4">
        <Button size="small">Small</Button>
        <Button size="medium">Medium</Button>
        <Button size="large">Large</Button>
      </div>
    `
  })
}

export const AllTypes: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="flex flex-wrap gap-4">
        <Button type="default">Default</Button>
        <Button type="primary">Primary</Button>
        <Button type="success">Success</Button>
        <Button type="warning">Warning</Button>
        <Button type="danger">Danger</Button>
        <Button type="text">Text</Button>
        <Button type="link">Link</Button>
      </div>
    `
  })
}
```

## 4. 业务组件设计

### 4.1 项目卡片组件

```vue
<template>
  <div class="project-card">
    <div class="project-card__header">
      <div class="project-card__title">
        <h3>{{ project.name }}</h3>
        <Badge :type="statusType" :text="statusText" />
      </div>
      <div class="project-card__actions">
        <Dropdown :items="actionItems" @select="handleAction">
          <Button type="text" icon="more-vertical" />
        </Dropdown>
      </div>
    </div>
    
    <div class="project-card__content">
      <p class="project-card__description">{{ project.description }}</p>
      
      <div class="project-card__meta">
        <div class="meta-item">
          <Icon name="users" />
          <span>{{ project.memberCount }} 成员</span>
        </div>
        <div class="meta-item">
          <Icon name="file-text" />
          <span>{{ project.requirementCount }} 需求</span>
        </div>
        <div class="meta-item">
          <Icon name="calendar" />
          <span>{{ formatDate(project.updatedAt) }}</span>
        </div>
      </div>
    </div>
    
    <div class="project-card__footer">
      <div class="project-card__members">
        <AvatarGroup :users="project.members" :max="3" />
      </div>
      <div class="project-card__progress">
        <Progress :percent="project.progress" :show-info="false" />
        <span class="progress-text">{{ project.progress }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
}

const props = defineProps<ProjectCardProps>()

const emit = defineEmits<{
  edit: [project: Project]
  delete: [project: Project]
  view: [project: Project]
}>()

const statusType = computed(() => {
  const statusMap = {
    planning: 'default',
    development: 'primary',
    testing: 'warning',
    production: 'success',
    archived: 'secondary'
  }
  return statusMap[props.project.status] || 'default'
})

const statusText = computed(() => {
  const statusMap = {
    planning: '规划中',
    development: '开发中',
    testing: '测试中',
    production: '已上线',
    archived: '已归档'
  }
  return statusMap[props.project.status] || '未知'
})

const actionItems = computed(() => [
  { key: 'view', label: '查看详情', icon: 'eye' },
  { key: 'edit', label: '编辑项目', icon: 'edit' },
  { key: 'delete', label: '删除项目', icon: 'trash', danger: true }
])

const handleAction = (key: string) => {
  switch (key) {
    case 'view':
      emit('view', props.project)
      break
    case 'edit':
      emit('edit', props.project)
      break
    case 'delete':
      emit('delete', props.project)
      break
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.project-card {
  @apply bg-white rounded-lg border border-gray-200;
  @apply p-6 hover:shadow-md transition-shadow duration-200;
  @apply cursor-pointer;
}

.project-card__header {
  @apply flex items-start justify-between mb-4;
}

.project-card__title {
  @apply flex-1;
  
  h3 {
    @apply text-lg font-semibold text-gray-900 mb-1;
    @apply line-clamp-1;
  }
}

.project-card__actions {
  @apply flex-shrink-0;
}

.project-card__content {
  @apply mb-4;
}

.project-card__description {
  @apply text-gray-600 text-sm mb-3;
  @apply line-clamp-2;
}

.project-card__meta {
  @apply flex items-center gap-4 text-xs text-gray-500;
}

.meta-item {
  @apply flex items-center gap-1;
}

.project-card__footer {
  @apply flex items-center justify-between;
}

.project-card__members {
  @apply flex-1;
}

.project-card__progress {
  @apply flex items-center gap-2 flex-shrink-0;
}

.progress-text {
  @apply text-xs text-gray-500 min-w-[3rem] text-right;
}
</style>
```

### 4.2 需求表单组件

```vue
<template>
  <Form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 18 }"
    @finish="handleSubmit"
  >
    <FormItem label="需求标题" name="title">
      <Input
        v-model:value="formData.title"
        placeholder="请输入需求标题"
        :maxlength="100"
        show-count
      />
    </FormItem>
    
    <FormItem label="需求描述" name="description">
      <Textarea
        v-model:value="formData.description"
        placeholder="请详细描述需求内容"
        :rows="4"
        :maxlength="1000"
        show-count
      />
    </FormItem>
    
    <FormItem label="验收标准" name="acceptanceCriteria">
      <Textarea
        v-model:value="formData.acceptanceCriteria"
        placeholder="请输入验收标准"
        :rows="3"
      />
    </FormItem>
    
    <FormItem label="所属项目" name="projectId">
      <Select
        v-model:value="formData.projectId"
        placeholder="请选择项目"
        :options="projectOptions"
        :loading="projectsLoading"
      />
    </FormItem>
    
    <FormItem label="负责人" name="assigneeId">
      <UserSelect
        v-model:value="formData.assigneeId"
        placeholder="请选择负责人"
        :project-id="formData.projectId"
      />
    </FormItem>
    
    <FormItem label="优先级" name="priority">
      <Radio.Group v-model:value="formData.priority">
        <Radio value="low">低</Radio>
        <Radio value="medium">中</Radio>
        <Radio value="high">高</Radio>
        <Radio value="urgent">紧急</Radio>
      </Radio.Group>
    </FormItem>
    
    <FormItem label="需求类型" name="type">
      <Select
        v-model:value="formData.type"
        placeholder="请选择需求类型"
        :options="typeOptions"
      />
    </FormItem>
    
    <FormItem label="故事点" name="storyPoints">
      <InputNumber
        v-model:value="formData.storyPoints"
        :min="1"
        :max="21"
        placeholder="请输入故事点"
      />
    </FormItem>
    
    <FormItem label="预估工时" name="estimatedHours">
      <InputNumber
        v-model:value="formData.estimatedHours"
        :min="0.5"
        :step="0.5"
        :precision="1"
        placeholder="请输入预估工时（小时）"
      />
    </FormItem>
    
    <FormItem label="截止日期" name="dueDate">
      <DatePicker
        v-model:value="formData.dueDate"
        placeholder="请选择截止日期"
        :disabled-date="disabledDate"
      />
    </FormItem>
    
    <FormItem label="标签" name="tags">
      <TagInput
        v-model:value="formData.tags"
        placeholder="请输入标签，按回车添加"
      />
    </FormItem>
    
    <FormItem label="附件" name="attachments">
      <FileUpload
        v-model:value="formData.attachments"
        :multiple="true"
        :max-count="5"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
      />
    </FormItem>
    
    <FormItem :wrapper-col="{ offset: 6, span: 18 }">
      <Space>
        <Button type="primary" html-type="submit" :loading="submitting">
          {{ isEdit ? '更新需求' : '创建需求' }}
        </Button>
        <Button @click="handleCancel">
          取消
        </Button>
        <Button v-if="isEdit" type="text" @click="handlePreview">
          预览
        </Button>
      </Space>
    </FormItem>
  </Form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { Requirement, CreateRequirementDto } from '@/types'
import { useProjects } from '@/composables/useProjects'

interface RequirementFormProps {
  requirement?: Requirement
  visible?: boolean
}

const props = withDefaults(defineProps<RequirementFormProps>(), {
  visible: false
})

const emit = defineEmits<{
  submit: [data: CreateRequirementDto]
  cancel: []
  preview: [requirement: Requirement]
}>()

const formRef = ref()
const submitting = ref(false)

const { projects, loading: projectsLoading, fetchProjects } = useProjects()

const isEdit = computed(() => !!props.requirement)

const formData = reactive<CreateRequirementDto>({
  title: '',
  description: '',
  acceptanceCriteria: '',
  projectId: undefined,
  assigneeId: undefined,
  priority: 'medium',
  type: 'feature',
  storyPoints: undefined,
  estimatedHours: undefined,
  dueDate: undefined,
  tags: [],
  attachments: []
})

const formRules = {
  title: [
    { required: true, message: '请输入需求标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入需求描述', trigger: 'blur' },
    { min: 10, message: '描述至少 10 个字符', trigger: 'blur' }
  ],
  projectId: [
    { required: true, message: '请选择所属项目', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择需求类型', trigger: 'change' }
  ]
}

const projectOptions = computed(() => {
  return projects.value.map(project => ({
    label: project.name,
    value: project.id
  }))
})

const typeOptions = [
  { label: '功能需求', value: 'feature' },
  { label: '缺陷修复', value: 'bug' },
  { label: '性能优化', value: 'improvement' },
  { label: '技术任务', value: 'task' }
]

const disabledDate = (current: Date) => {
  return current && current < new Date().setHours(0, 0, 0, 0)
}

const handleSubmit = async (values: CreateRequirementDto) => {
  try {
    submitting.value = true
    emit('submit', values)
    message.success(isEdit.value ? '需求更新成功' : '需求创建成功')
  } catch (error) {
    message.error('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  formRef.value?.resetFields()
  emit('cancel')
}

const handlePreview = () => {
  if (props.requirement) {
    emit('preview', props.requirement)
  }
}

// 监听需求数据变化，填充表单
watch(
  () => props.requirement,
  (requirement) => {
    if (requirement) {
      Object.assign(formData, {
        title: requirement.title,
        description: requirement.description,
        acceptanceCriteria: requirement.acceptanceCriteria,
        projectId: requirement.projectId,
        assigneeId: requirement.assigneeId,
        priority: requirement.priority,
        type: requirement.type,
        storyPoints: requirement.storyPoints,
        estimatedHours: requirement.estimatedHours,
        dueDate: requirement.dueDate,
        tags: requirement.tags || [],
        attachments: requirement.attachments || []
      })
    } else {
      formRef.value?.resetFields()
    }
  },
  { immediate: true }
)

// 组件挂载时获取项目列表
fetchProjects()
</script>
```

## 5. 响应式设计

### 5.1 断点系统

```css
:root {
  /* 断点定义 */
  --breakpoint-xs: 480px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* 媒体查询 Mixins */
@media (min-width: 480px) {
  .xs\:block { display: block; }
  .xs\:hidden { display: none; }
}

@media (min-width: 640px) {
  .sm\:block { display: block; }
  .sm\:hidden { display: none; }
  .sm\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (min-width: 768px) {
  .md\:block { display: block; }
  .md\:hidden { display: none; }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\:flex-row { flex-direction: row; }
}

@media (min-width: 1024px) {
  .lg\:block { display: block; }
  .lg\:hidden { display: none; }
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (min-width: 1280px) {
  .xl\:block { display: block; }
  .xl\:hidden { display: none; }
  .xl\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}
```

### 5.2 响应式布局组件

```vue
<template>
  <div class="responsive-grid" :class="gridClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ResponsiveGridProps {
  cols?: number | {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: number | string
}

const props = withDefaults(defineProps<ResponsiveGridProps>(), {
  cols: 1,
  gap: 4
})

const gridClasses = computed(() => {
  const classes = ['grid']
  
  if (typeof props.cols === 'number') {
    classes.push(`grid-cols-${props.cols}`)
  } else {
    Object.entries(props.cols).forEach(([breakpoint, cols]) => {
      if (breakpoint === 'xs') {
        classes.push(`grid-cols-${cols}`)
      } else {
        classes.push(`${breakpoint}:grid-cols-${cols}`)
      }
    })
  }
  
  classes.push(`gap-${props.gap}`)
  
  return classes
})
</script>
```

## 6. 主题系统

### 6.1 主题配置

```typescript
// theme.config.ts
export interface ThemeConfig {
  name: string
  colors: {
    primary: string
    success: string
    warning: string
    error: string
    info: string
  }
  fonts: {
    sans: string
    mono: string
  }
  borderRadius: {
    sm: string
    base: string
    lg: string
  }
  shadows: {
    sm: string
    base: string
    lg: string
  }
}

export const defaultTheme: ThemeConfig = {
  name: 'default',
  colors: {
    primary: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4'
  },
  fonts: {
    sans: 'Inter, sans-serif',
    mono: 'JetBrains Mono, monospace'
  },
  borderRadius: {
    sm: '0.125rem',
    base: '0.25rem',
    lg: '0.5rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  }
}

export const darkTheme: ThemeConfig = {
  ...defaultTheme,
  name: 'dark'
}
```

### 6.2 主题切换组合式函数

```typescript
// composables/useTheme.ts
import { ref, computed, watch } from 'vue'
import type { ThemeConfig } from '@/config/theme'
import { defaultTheme, darkTheme } from '@/config/theme'

const currentTheme = ref<string>('default')
const themes = ref<Record<string, ThemeConfig>>({
  default: defaultTheme,
  dark: darkTheme
})

export function useTheme() {
  const theme = computed(() => themes.value[currentTheme.value])
  
  const setTheme = (themeName: string) => {
    if (themes.value[themeName]) {
      currentTheme.value = themeName
      applyTheme(themes.value[themeName])
      localStorage.setItem('theme', themeName)
    }
  }
  
  const applyTheme = (themeConfig: ThemeConfig) => {
    const root = document.documentElement
    
    // 应用颜色变量
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
    
    // 应用字体变量
    Object.entries(themeConfig.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value)
    })
    
    // 应用其他样式变量
    Object.entries(themeConfig.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value)
    })
    
    Object.entries(themeConfig.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value)
    })
    
    // 设置主题类名
    root.setAttribute('data-theme', themeConfig.name)
  }
  
  const registerTheme = (name: string, config: ThemeConfig) => {
    themes.value[name] = config
  }
  
  const toggleDarkMode = () => {
    const newTheme = currentTheme.value === 'dark' ? 'default' : 'dark'
    setTheme(newTheme)
  }
  
  const isDark = computed(() => currentTheme.value === 'dark')
  
  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme && themes.value[savedTheme]) {
      setTheme(savedTheme)
    } else {
      // 检测系统主题偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'default')
    }
  }
  
  return {
    currentTheme: computed(() => currentTheme.value),
    theme,
    themes: computed(() => themes.value),
    isDark,
    setTheme,
    registerTheme,
    toggleDarkMode,
    initTheme
  }
}
```

## 7. 性能优化

### 7.1 组件懒加载

```typescript
// 路由级别懒加载
const routes = [
  {
    path: '/projects',
    component: () => import('@/views/ProjectManagement.vue')
  },
  {
    path: '/requirements',
    component: () => import('@/views/RequirementManagement.vue')
  }
]

// 组件级别懒加载
const LazyChart = defineAsyncComponent({
  loader: () => import('@/components/charts/LineChart.vue'),
  loadingComponent: () => h('div', { class: 'loading' }, 'Loading...'),
  errorComponent: () => h('div', { class: 'error' }, 'Error loading component'),
  delay: 200,
  timeout: 3000
})
```

### 7.2 虚拟滚动

```vue
<template>
  <div class="virtual-list" ref="containerRef">
    <div class="virtual-list__phantom" :style="{ height: totalHeight + 'px' }" />
    <div class="virtual-list__content" :style="contentStyle">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        class="virtual-list__item"
        :style="{ height: itemHeight + 'px' }"
      >
        <slot :item="item" :index="item.index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface VirtualListProps {
  items: any[]
  itemHeight: number
  containerHeight: number
  buffer?: number
}

const props = withDefaults(defineProps<VirtualListProps>(), {
  buffer: 5
})

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)

const totalHeight = computed(() => props.items.length * props.itemHeight)

const startIndex = computed(() => {
  return Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.buffer)
})

const endIndex = computed(() => {
  const visibleCount = Math.ceil(props.containerHeight / props.itemHeight)
  return Math.min(props.items.length - 1, startIndex.value + visibleCount + props.buffer)
})

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value + 1).map((item, index) => ({
    ...item,
    index: startIndex.value + index
  }))
})

const contentStyle = computed(() => ({
  transform: `translateY(${startIndex.value * props.itemHeight}px)`
}))

const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
}

onMounted(() => {
  containerRef.value?.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  containerRef.value?.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.virtual-list {
  @apply relative overflow-auto;
}

.virtual-list__phantom {
  @apply absolute top-0 left-0 right-0;
}

.virtual-list__content {
  @apply absolute top-0 left-0 right-0;
}

.virtual-list__item {
  @apply flex items-center;
}
</style>
```

## 8. 代码规范

### 8.1 命名规范

```typescript
// ✅ 组件命名 - PascalCase
const UserProfileCard = defineComponent({})
const ProjectManagementTable = defineComponent({})

// ✅ 变量命名 - camelCase
const userName = ref('')
const isLoading = ref(false)
const userList = ref([])

// ✅ 常量命名 - SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'
const MAX_FILE_SIZE = 10 * 1024 * 1024

// ✅ 类型命名 - PascalCase
interface UserProfile {
  id: number
  name: string
}

type ProjectStatus = 'planning' | 'development' | 'testing' | 'production'

// ✅ 枚举命名 - PascalCase
enum UserRole {
  Admin = 'admin',
  Developer = 'developer',
  Tester = 'tester'
}
```

### 8.2 文件组织规范

```
src/
├── components/              # 组件目录
│   ├── base/               # 基础组件
│   ├── business/           # 业务组件
│   └── layout/             # 布局组件
├── views/                  # 页面组件
├── composables/            # 组合式函数
├── utils/                  # 工具函数
├── types/                  # 类型定义
├── api/                    # API 接口
├── stores/                 # 状态管理
├── router/                 # 路由配置
├── assets/                 # 静态资源
│   ├── images/
│   ├── icons/
│   └── styles/
└── config/                 # 配置文件
```

### 8.3 注释规范

```typescript
/**
 * 用户管理相关的组合式函数
 * @description 提供用户的增删改查功能
 * @author 张三
 * @since 1.0.0
 */
export function useUsers() {
  /**
   * 用户列表
   */
  const users = ref<User[]>([])
  
  /**
   * 加载状态
   */
  const loading = ref(false)
  
  /**
   * 获取用户列表
   * @param params 查询参数
   * @returns Promise<User[]>
   */
  const fetchUsers = async (params?: UserQueryParams): Promise<User[]> => {
    try {
      loading.value = true
      const response = await userApi.getUsers(params)
      users.value = response.data
      return response.data
    } catch (error) {
      console.error('获取用户列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 创建用户
   * @param userData 用户数据
   * @returns Promise<User>
   */
  const createUser = async (userData: CreateUserDto): Promise<User> => {
    // 实现逻辑...
  }
  
  return {
    users: readonly(users),
    loading: readonly(loading),
    fetchUsers,
    createUser
  }
}
```

---

本文档详细定义了前端组件库和UI设计规范，包括设计系统、组件开发规范、响应式设计、主题系统、性能优化和代码规范等内容，为前端开发提供了完整的指导框架。