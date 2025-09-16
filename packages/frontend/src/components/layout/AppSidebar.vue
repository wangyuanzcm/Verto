<template>
  <aside class="app-sidebar" :class="sidebarClass">
    <!-- 侧边栏头部 -->
    <div v-if="showHeader" class="app-sidebar__header">
      <slot name="header">
        <div class="app-sidebar__brand">
          <img 
            v-if="logo" 
            :src="logo" 
            :alt="title" 
            class="app-sidebar__logo"
          />
          <span v-if="!collapsed && showTitle" class="app-sidebar__title">
            {{ title }}
          </span>
        </div>
      </slot>
    </div>
    
    <!-- 用户信息区域 -->
    <div v-if="showUserInfo && userInfo" class="app-sidebar__user">
      <div class="user-card" :class="{ 'user-card--collapsed': collapsed }">
        <el-avatar
          :src="userInfo.avatar"
          :size="collapsed ? 32 : 48"
          class="user-avatar"
        >
          <el-icon><User /></el-icon>
        </el-avatar>
        <div v-if="!collapsed" class="user-info">
          <div class="user-name">{{ userInfo.name || '用户' }}</div>
          <div class="user-role">{{ userInfo.role || '管理员' }}</div>
        </div>
        <el-dropdown
          v-if="!collapsed"
          class="user-actions"
          @command="handleUserCommand"
        >
          <el-button type="text" size="small">
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <!-- 导航菜单 -->
    <div class="app-sidebar__menu">
      <el-scrollbar>
        <AppMenu
          :menu-items="menuItems"
          :collapsed="collapsed"
          :active-menu="activeMenu"
          @select="handleMenuSelect"
          @menu-click="handleMenuClick"
        />
      </el-scrollbar>
    </div>
    
    <!-- 侧边栏底部 -->
    <div v-if="showFooter" class="app-sidebar__footer">
      <slot name="footer">
        <!-- 折叠按钮 -->
        <el-button
          type="text"
          class="collapse-btn"
          @click="handleCollapse"
        >
          <el-icon>
            <Fold v-if="!collapsed" />
            <Expand v-else />
          </el-icon>
          <span v-if="!collapsed">收起菜单</span>
        </el-button>
        
        <!-- 版本信息 -->
        <div v-if="showVersion && !collapsed" class="version-info">
          <span>{{ version }}</span>
        </div>
      </slot>
    </div>
    
    <!-- 快捷操作面板 -->
    <div v-if="showQuickActions" class="app-sidebar__quick-actions">
      <div class="quick-actions-header">
        <span v-if="!collapsed">快捷操作</span>
        <el-icon v-else><Lightning /></el-icon>
      </div>
      <div class="quick-actions-list">
        <el-button
          v-for="action in quickActions"
          :key="action.key"
          :type="action.type || 'text'"
          :size="collapsed ? 'small' : 'default'"
          :disabled="action.disabled"
          :loading="action.loading"
          class="quick-action-btn"
          @click="handleQuickAction(action)"
        >
          <el-icon v-if="action.icon">
            <component :is="action.icon" />
          </el-icon>
          <span v-if="!collapsed && action.text">{{ action.text }}</span>
          <el-tooltip
            v-if="collapsed && action.text"
            :content="action.text"
            placement="right"
          >
            <span></span>
          </el-tooltip>
        </el-button>
      </div>
    </div>
    
    <!-- 拖拽调整宽度的手柄 -->
    <div
      v-if="resizable && !collapsed"
      class="app-sidebar__resize-handle"
      @mousedown="handleResizeStart"
    ></div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  ElAvatar,
  ElIcon,
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElScrollbar,
  ElTooltip
} from 'element-plus'
import {
  User,
  MoreFilled,
  Setting,
  SwitchButton,
  Fold,
  Expand,
  Lightning
} from '@element-plus/icons-vue'
import AppMenu from './AppMenu.vue'

/**
 * 应用侧边栏组件
 * 包含用户信息、导航菜单、快捷操作等功能
 */

// 菜单项类型
interface MenuItem {
  path: string
  title: string
  icon?: any
  badge?: {
    value: string | number
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    isDot?: boolean
  }
  disabled?: boolean
  hidden?: boolean
  children?: MenuItem[]
  meta?: Record<string, any>
}

// 用户信息类型
interface UserInfo {
  name?: string
  avatar?: string
  role?: string
  email?: string
}

// 快捷操作类型
interface QuickAction {
  key: string
  text?: string
  icon?: any
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
  disabled?: boolean
  loading?: boolean
}

// 定义组件属性
interface Props {
  /** Logo 图片地址 */
  logo?: string
  /** 应用标题 */
  title?: string
  /** 是否显示标题 */
  showTitle?: boolean
  /** 是否显示头部 */
  showHeader?: boolean
  /** 是否显示用户信息 */
  showUserInfo?: boolean
  /** 用户信息 */
  userInfo?: UserInfo
  /** 菜单数据 */
  menuItems?: MenuItem[]
  /** 是否折叠 */
  collapsed?: boolean
  /** 当前激活菜单 */
  activeMenu?: string
  /** 是否显示底部 */
  showFooter?: boolean
  /** 是否显示版本信息 */
  showVersion?: boolean
  /** 版本号 */
  version?: string
  /** 是否显示快捷操作 */
  showQuickActions?: boolean
  /** 快捷操作列表 */
  quickActions?: QuickAction[]
  /** 侧边栏宽度 */
  width?: number
  /** 折叠后宽度 */
  collapsedWidth?: number
  /** 是否可调整大小 */
  resizable?: boolean
  /** 自定义类名 */
  customClass?: string
}

// 定义默认值
const props = withDefaults(defineProps<Props>(), {
  title: 'Verto',
  showTitle: true,
  showHeader: true,
  showUserInfo: true,
  menuItems: () => [],
  collapsed: false,
  showFooter: true,
  showVersion: true,
  version: 'v1.0.0',
  showQuickActions: false,
  quickActions: () => [],
  width: 240,
  collapsedWidth: 64,
  resizable: true
})

// 定义事件
const emit = defineEmits<{
  collapse: [collapsed: boolean]
  'menu-select': [index: string, indexPath: string[], item: MenuItem]
  'menu-click': [item: MenuItem]
  'user-command': [command: string]
  'quick-action': [action: QuickAction]
  'width-change': [width: number]
}>()

// 响应式数据
const currentWidth = ref(props.width)
const isResizing = ref(false)

// 计算属性
const sidebarClass = computed(() => {
  return [
    {
      'app-sidebar--collapsed': props.collapsed,
      'app-sidebar--resizing': isResizing.value
    },
    props.customClass
  ]
})

const sidebarStyle = computed(() => {
  return {
    width: props.collapsed ? `${props.collapsedWidth}px` : `${currentWidth.value}px`
  }
})

/**
 * 处理折叠切换
 */
const handleCollapse = () => {
  emit('collapse', !props.collapsed)
}

/**
 * 处理菜单选择
 */
const handleMenuSelect = (index: string, indexPath: string[], item: MenuItem) => {
  emit('menu-select', index, indexPath, item)
}

/**
 * 处理菜单点击
 */
const handleMenuClick = (item: MenuItem) => {
  emit('menu-click', item)
}

/**
 * 处理用户命令
 */
const handleUserCommand = (command: string) => {
  emit('user-command', command)
}

/**
 * 处理快捷操作
 */
const handleQuickAction = (action: QuickAction) => {
  emit('quick-action', action)
}

/**
 * 处理调整大小开始
 */
const handleResizeStart = (e: MouseEvent) => {
  if (!props.resizable || props.collapsed) return
  
  isResizing.value = true
  const startX = e.clientX
  const startWidth = currentWidth.value
  
  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX
    const newWidth = Math.max(200, Math.min(400, startWidth + deltaX))
    currentWidth.value = newWidth
    emit('width-change', newWidth)
  }
  
  const handleMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

// 生命周期
onMounted(() => {
  currentWidth.value = props.width
})

// 暴露方法和数据
defineExpose({
  currentWidth,
  isResizing
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.app-sidebar {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  // 头部区域
  &__header {
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    flex-shrink: 0;
  }
  
  &__brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  &__logo {
    width: 32px;
    height: 32px;
    border-radius: $border-radius-small;
    flex-shrink: 0;
  }
  
  &__title {
    font-size: $font-size-large;
    font-weight: 600;
    color: var(--el-text-color-primary);
    white-space: nowrap;
    opacity: 1;
    transition: opacity 0.3s;
  }
  
  // 用户信息区域
  &__user {
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    flex-shrink: 0;
    
    .user-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-fill-color-light));
      border-radius: $border-radius-base;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
      }
      
      &--collapsed {
        justify-content: center;
        padding: 8px;
      }
      
      .user-avatar {
        flex-shrink: 0;
        border: 2px solid var(--el-color-primary-light-8);
        transition: all 0.3s;
        
        &:hover {
          border-color: var(--el-color-primary);
          transform: scale(1.05);
        }
      }
      
      .user-info {
        flex: 1;
        min-width: 0;
        
        .user-name {
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 2px;
          @include text-ellipsis;
        }
        
        .user-role {
          font-size: $font-size-small;
          color: var(--el-text-color-regular);
          @include text-ellipsis;
        }
      }
      
      .user-actions {
        flex-shrink: 0;
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      &:hover {
        .user-actions {
          opacity: 1;
        }
      }
    }
  }
  
  // 菜单区域
  &__menu {
    flex: 1;
    overflow: hidden;
    
    :deep(.el-scrollbar) {
      height: 100%;
      
      .el-scrollbar__view {
        padding: 8px 0;
      }
    }
  }
  
  // 快捷操作区域
  &__quick-actions {
    padding: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
    flex-shrink: 0;
    
    .quick-actions-header {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      font-size: $font-size-small;
      font-weight: 500;
      color: var(--el-text-color-regular);
    }
    
    .quick-actions-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .quick-action-btn {
      width: 100%;
      justify-content: flex-start;
      
      :deep(.el-icon) {
        margin-right: 8px;
      }
    }
  }
  
  // 底部区域
  &__footer {
    padding: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
    flex-shrink: 0;
    
    .collapse-btn {
      width: 100%;
      justify-content: flex-start;
      margin-bottom: 8px;
      
      :deep(.el-icon) {
        margin-right: 8px;
      }
    }
    
    .version-info {
      text-align: center;
      font-size: $font-size-extra-small;
      color: var(--el-text-color-placeholder);
      padding: 4px 0;
    }
  }
  
  // 调整大小手柄
  &__resize-handle {
    position: absolute;
    top: 0;
    right: 0;
    width: 4px;
    height: 100%;
    cursor: col-resize;
    background-color: transparent;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: var(--el-color-primary-light-7);
    }
    
    &:active {
      background-color: var(--el-color-primary);
    }
  }
  
  // 折叠状态
  &--collapsed {
    .app-sidebar__title {
      opacity: 0;
      width: 0;
    }
    
    .app-sidebar__header {
      padding: 16px 12px;
    }
    
    .app-sidebar__user {
      padding: 16px 12px;
    }
    
    .app-sidebar__quick-actions {
      padding: 16px 12px;
      
      .quick-action-btn {
        justify-content: center;
        
        :deep(.el-icon) {
          margin-right: 0;
        }
      }
    }
    
    .app-sidebar__footer {
      padding: 16px 12px;
      
      .collapse-btn {
        justify-content: center;
        
        :deep(.el-icon) {
          margin-right: 0;
        }
        
        span {
          display: none;
        }
      }
    }
  }
  
  // 调整大小状态
  &--resizing {
    user-select: none;
    
    * {
      pointer-events: none;
    }
  }
}

// 折叠动画
.app-sidebar {
  .app-sidebar__title,
  .user-info,
  .user-actions,
  .quick-action-btn span,
  .collapse-btn span {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

// 响应式设计
@include tablet {
  .app-sidebar {
    &:not(.app-sidebar--collapsed) {
      width: 200px;
    }
  }
}

@include mobile {
  .app-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1001;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &.is-open {
      transform: translateX(0);
    }
    
    &--collapsed {
      transform: translateX(-100%);
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .app-sidebar {
    border-right-color: var(--el-border-color);
    
    .user-card {
      background: linear-gradient(135deg, var(--el-fill-color), var(--el-fill-color-light));
      
      &::before {
        background: linear-gradient(90deg, var(--el-color-primary-light-3), var(--el-color-primary));
      }
    }
    
    &__resize-handle {
      &:hover {
        background-color: var(--el-color-primary-light-3);
      }
    }
  }
}

// 滚动条样式
.app-sidebar {
  :deep(.el-scrollbar) {
    .el-scrollbar__bar {
      &.is-vertical {
        right: 2px;
        width: 4px;
        
        .el-scrollbar__thumb {
          background-color: var(--el-border-color-light);
          border-radius: 2px;
          
          &:hover {
            background-color: var(--el-border-color);
          }
        }
      }
    }
  }
}
</style>