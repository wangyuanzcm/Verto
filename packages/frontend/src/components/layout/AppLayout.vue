<template>
  <div class="app-layout" :class="layoutClass">
    <!-- 侧边栏 -->
    <aside
      v-if="showSidebar"
      class="app-layout__sidebar"
      :class="sidebarClass"
      :style="sidebarStyle"
    >
      <div class="app-layout__sidebar-content">
        <!-- Logo区域 -->
        <div class="app-layout__logo">
          <slot name="logo">
            <div class="app-layout__logo-content">
              <img v-if="logo" :src="logo" :alt="title" class="app-layout__logo-image" />
              <span v-if="title" class="app-layout__logo-text">{{ title }}</span>
            </div>
          </slot>
        </div>
        
        <!-- 导航菜单 -->
        <nav class="app-layout__nav">
          <slot name="nav" />
        </nav>
        
        <!-- 侧边栏底部 -->
        <div class="app-layout__sidebar-footer">
          <slot name="sidebar-footer" />
        </div>
      </div>
      
      <!-- 折叠按钮 -->
      <button
        v-if="collapsible"
        class="app-layout__collapse-btn"
        @click="toggleCollapse"
      >
        <el-icon>
          <component :is="collapsed ? Expand : Fold" />
        </el-icon>
      </button>
    </aside>
    
    <!-- 主要内容区域 -->
    <div class="app-layout__main" :class="mainClass">
      <!-- 顶部栏 -->
      <header v-if="showHeader" class="app-layout__header" :class="headerClass">
        <div class="app-layout__header-content">
          <!-- 左侧内容 -->
          <div class="app-layout__header-left">
            <!-- 移动端菜单按钮 -->
            <button
              v-if="showMobileMenu"
              class="app-layout__mobile-menu-btn"
              @click="toggleMobileMenu"
            >
              <el-icon><Menu /></el-icon>
            </button>
            
            <!-- 面包屑 -->
            <div v-if="showBreadcrumb" class="app-layout__breadcrumb">
              <slot name="breadcrumb" />
            </div>
            
            <slot name="header-left" />
          </div>
          
          <!-- 中间内容 -->
          <div class="app-layout__header-center">
            <slot name="header-center" />
          </div>
          
          <!-- 右侧内容 -->
          <div class="app-layout__header-right">
            <slot name="header-right" />
          </div>
        </div>
      </header>
      
      <!-- 内容区域 -->
      <main class="app-layout__content" :class="contentClass">
        <!-- 标签页 -->
        <div v-if="showTabs" class="app-layout__tabs">
          <slot name="tabs" />
        </div>
        
        <!-- 页面内容 -->
        <div class="app-layout__page" :class="pageClass">
          <slot />
        </div>
      </main>
      
      <!-- 底部 -->
      <footer v-if="showFooter" class="app-layout__footer" :class="footerClass">
        <slot name="footer" />
      </footer>
    </div>
    
    <!-- 移动端遮罩 -->
    <div
      v-if="showMobileMenu && mobileMenuVisible"
      class="app-layout__mobile-mask"
      @click="closeMobileMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElIcon } from 'element-plus'
import { Menu, Expand, Fold } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'

/**
 * 应用布局组件
 * 提供完整的应用布局结构，支持响应式设计和多种布局模式
 */

// 布局模式类型
type LayoutMode = 'sidebar' | 'top' | 'mix'

// 定义组件属性
interface Props {
  /** 布局模式 */
  mode?: LayoutMode
  /** 应用标题 */
  title?: string
  /** 应用Logo */
  logo?: string
  /** 是否显示侧边栏 */
  showSidebar?: boolean
  /** 是否显示顶部栏 */
  showHeader?: boolean
  /** 是否显示底部 */
  showFooter?: boolean
  /** 是否显示面包屑 */
  showBreadcrumb?: boolean
  /** 是否显示标签页 */
  showTabs?: boolean
  /** 是否可折叠侧边栏 */
  collapsible?: boolean
  /** 侧边栏宽度 */
  sidebarWidth?: string | number
  /** 折叠后侧边栏宽度 */
  collapsedWidth?: string | number
  /** 顶部栏高度 */
  headerHeight?: string | number
  /** 底部高度 */
  footerHeight?: string | number
  /** 是否固定顶部栏 */
  fixedHeader?: boolean
  /** 是否固定侧边栏 */
  fixedSidebar?: boolean
  /** 自定义类名 */
  customClass?: string
  /** 侧边栏类名 */
  sidebarClass?: string
  /** 顶部栏类名 */
  headerClass?: string
  /** 内容区域类名 */
  contentClass?: string
  /** 页面类名 */
  pageClass?: string
  /** 底部类名 */
  footerClass?: string
}

// 定义默认值
const props = withDefaults(defineProps<Props>(), {
  mode: 'sidebar',
  title: 'Verto',
  showSidebar: true,
  showHeader: true,
  showFooter: false,
  showBreadcrumb: true,
  showTabs: false,
  collapsible: true,
  sidebarWidth: 240,
  collapsedWidth: 64,
  headerHeight: 60,
  footerHeight: 60,
  fixedHeader: true,
  fixedSidebar: true
})

// 定义事件
const emit = defineEmits<{
  'collapse-change': [collapsed: boolean]
  'mobile-menu-change': [visible: boolean]
}>()

// 使用store
const appStore = useAppStore()

// 响应式数据
const collapsed = ref(false)
const mobileMenuVisible = ref(false)
const isMobile = ref(false)

// 计算属性
const layoutClass = computed(() => {
  return [
    `app-layout--${props.mode}`,
    {
      'app-layout--collapsed': collapsed.value,
      'app-layout--mobile': isMobile.value,
      'app-layout--mobile-menu-open': mobileMenuVisible.value,
      'app-layout--fixed-header': props.fixedHeader,
      'app-layout--fixed-sidebar': props.fixedSidebar
    },
    props.customClass
  ]
})

const sidebarClass = computed(() => {
  return [
    {
      'app-layout__sidebar--collapsed': collapsed.value,
      'app-layout__sidebar--fixed': props.fixedSidebar
    },
    props.sidebarClass
  ]
})

const mainClass = computed(() => {
  return {
    'app-layout__main--no-sidebar': !props.showSidebar,
    'app-layout__main--collapsed': collapsed.value
  }
})

const showMobileMenu = computed(() => {
  return isMobile.value && props.showSidebar
})

const sidebarStyle = computed(() => {
  const style: Record<string, any> = {}
  
  if (collapsed.value) {
    style.width = typeof props.collapsedWidth === 'number' 
      ? `${props.collapsedWidth}px` 
      : props.collapsedWidth
  } else {
    style.width = typeof props.sidebarWidth === 'number' 
      ? `${props.sidebarWidth}px` 
      : props.sidebarWidth
  }
  
  return style
})

/**
 * 切换折叠状态
 */
const toggleCollapse = () => {
  collapsed.value = !collapsed.value
  emit('collapse-change', collapsed.value)
  appStore.setSidebarCollapsed(collapsed.value)
}

/**
 * 切换移动端菜单
 */
const toggleMobileMenu = () => {
  mobileMenuVisible.value = !mobileMenuVisible.value
  emit('mobile-menu-change', mobileMenuVisible.value)
}

/**
 * 关闭移动端菜单
 */
const closeMobileMenu = () => {
  mobileMenuVisible.value = false
  emit('mobile-menu-change', false)
}

/**
 * 检查是否为移动端
 */
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    mobileMenuVisible.value = false
  }
}

/**
 * 处理窗口大小变化
 */
const handleResize = () => {
  checkMobile()
}

// 监听store中的折叠状态
watch(
  () => appStore.sidebarCollapsed,
  (newValue) => {
    collapsed.value = newValue
  },
  { immediate: true }
)

// 生命周期
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 暴露方法
defineExpose({
  toggleCollapse,
  toggleMobileMenu,
  closeMobileMenu
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  
  &__sidebar {
    position: relative;
    flex-shrink: 0;
    background-color: var(--el-bg-color-page);
    border-right: 1px solid var(--el-border-color-lighter);
    transition: width 0.3s ease;
    z-index: 1001;
    
    &--fixed {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
    }
    
    &--collapsed {
      .app-layout__logo-text {
        opacity: 0;
        width: 0;
      }
      
      .app-layout__nav {
        :deep(.el-menu-item),
        :deep(.el-sub-menu__title) {
          padding-left: 20px !important;
          
          span {
            opacity: 0;
            width: 0;
          }
        }
      }
    }
  }
  
  &__sidebar-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  &__logo {
    flex-shrink: 0;
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  
  &__logo-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  &__logo-image {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
  
  &__logo-text {
    font-size: $font-size-large;
    font-weight: 600;
    color: var(--el-text-color-primary);
    transition: all 0.3s ease;
    white-space: nowrap;
    overflow: hidden;
  }
  
  &__nav {
    flex: 1;
    padding: 16px 0;
    overflow-y: auto;
    
    @include scrollbar;
  }
  
  &__sidebar-footer {
    flex-shrink: 0;
    padding: 16px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
  
  &__collapse-btn {
    position: absolute;
    top: 50%;
    right: -12px;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    border: 1px solid var(--el-border-color);
    border-radius: 50%;
    background-color: var(--el-bg-color);
    color: var(--el-text-color-regular);
    cursor: pointer;
    transition: all 0.2s;
    z-index: 1002;
    
    &:hover {
      background-color: var(--el-color-primary);
      color: white;
      border-color: var(--el-color-primary);
    }
    
    .el-icon {
      font-size: 12px;
    }
  }
  
  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    transition: margin-left 0.3s ease;
  }
  
  &__header {
    flex-shrink: 0;
    background-color: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-lighter);
    z-index: 1000;
  }
  
  &__header-content {
    display: flex;
    align-items: center;
    height: 60px;
    padding: 0 24px;
  }
  
  &__header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  &__header-center {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  &__header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  &__mobile-menu-btn {
    display: none;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: none;
    border-radius: $border-radius-base;
    color: var(--el-text-color-regular);
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }
    
    .el-icon {
      font-size: 18px;
    }
  }
  
  &__breadcrumb {
    :deep(.el-breadcrumb) {
      font-size: $font-size-base;
      
      .el-breadcrumb__item {
        .el-breadcrumb__inner {
          color: var(--el-text-color-regular);
          
          &:hover {
            color: var(--el-color-primary);
          }
        }
        
        &:last-child {
          .el-breadcrumb__inner {
            color: var(--el-text-color-primary);
            font-weight: 500;
          }
        }
      }
    }
  }
  
  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  &__tabs {
    flex-shrink: 0;
    background-color: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  
  &__page {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    background-color: var(--el-fill-color-blank);
    
    @include scrollbar;
  }
  
  &__footer {
    flex-shrink: 0;
    padding: 16px 24px;
    background-color: var(--el-bg-color);
    border-top: 1px solid var(--el-border-color-lighter);
    text-align: center;
    color: var(--el-text-color-regular);
    font-size: $font-size-small;
  }
  
  &__mobile-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }
  
  // 布局模式
  &--top {
    flex-direction: column;
    
    .app-layout__sidebar {
      display: none;
    }
    
    .app-layout__main {
      margin-left: 0;
    }
  }
  
  &--mix {
    .app-layout__header {
      margin-left: 240px;
    }
    
    &.app-layout--collapsed {
      .app-layout__header {
        margin-left: 64px;
      }
    }
  }
  
  // 固定头部
  &--fixed-header {
    .app-layout__header {
      position: fixed;
      top: 0;
      right: 0;
      left: 240px;
      z-index: 1000;
    }
    
    .app-layout__content {
      margin-top: 60px;
    }
    
    &.app-layout--collapsed {
      .app-layout__header {
        left: 64px;
      }
    }
    
    &.app-layout--no-sidebar {
      .app-layout__header {
        left: 0;
      }
    }
  }
  
  // 固定侧边栏
  &--fixed-sidebar {
    .app-layout__main {
      margin-left: 240px;
    }
    
    &.app-layout--collapsed {
      .app-layout__main {
        margin-left: 64px;
      }
    }
    
    &.app-layout--no-sidebar {
      .app-layout__main {
        margin-left: 0;
      }
    }
  }
  
  // 移动端适配
  &--mobile {
    .app-layout__mobile-menu-btn {
      display: flex;
    }
    
    .app-layout__sidebar {
      position: fixed;
      top: 0;
      left: -100%;
      height: 100vh;
      width: 280px !important;
      transition: left 0.3s ease;
      z-index: 1001;
    }
    
    .app-layout__main {
      margin-left: 0;
    }
    
    .app-layout__header {
      left: 0 !important;
    }
    
    &.app-layout--mobile-menu-open {
      .app-layout__sidebar {
        left: 0;
      }
    }
    
    .app-layout__page {
      padding: 16px;
    }
  }
  
  // 响应式设计
  @include mobile {
    .app-layout__header-content {
      padding: 0 16px;
    }
    
    .app-layout__page {
      padding: 16px;
    }
    
    .app-layout__footer {
      padding: 12px 16px;
    }
  }
  
  @include tablet {
    .app-layout__header-content {
      padding: 0 20px;
    }
    
    .app-layout__page {
      padding: 20px;
    }
  }
}

// Element Plus Menu 样式增强
:deep(.el-menu) {
  border-right: none;
  background-color: transparent;
  
  .el-menu-item,
  .el-sub-menu__title {
    height: 48px;
    line-height: 48px;
    margin: 4px 12px;
    border-radius: $border-radius-base;
    transition: all 0.2s;
    
    &:hover {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
    
    &.is-active {
      background-color: var(--el-color-primary-light-8);
      color: var(--el-color-primary);
      font-weight: 500;
    }
  }
  
  .el-sub-menu {
    .el-menu {
      background-color: var(--el-fill-color-lighter);
      
      .el-menu-item {
        margin: 2px 8px;
        height: 40px;
        line-height: 40px;
      }
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .app-layout {
    &__sidebar {
      background-color: var(--el-bg-color-page);
    }
    
    &__collapse-btn {
      background-color: var(--el-bg-color-page);
      border-color: var(--el-border-color-darker);
    }
    
    &__mobile-mask {
      background-color: rgba(0, 0, 0, 0.7);
    }
  }
}
</style>