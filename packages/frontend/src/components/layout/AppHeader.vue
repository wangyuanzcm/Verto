<template>
  <header class="app-header" :class="headerClass">
    <!-- 左侧区域 -->
    <div class="app-header__left">
      <!-- Logo 和标题 -->
      <div class="app-header__brand" @click="handleBrandClick">
        <img 
          v-if="logo" 
          :src="logo" 
          :alt="title" 
          class="app-header__logo"
        />
        <span v-if="showTitle" class="app-header__title">{{ title }}</span>
      </div>
      
      <!-- 折叠按钮 -->
      <el-button
        v-if="showCollapseButton"
        type="text"
        class="app-header__collapse"
        @click="handleCollapse"
      >
        <el-icon>
          <Fold v-if="!collapsed" />
          <Expand v-else />
        </el-icon>
      </el-button>
      
      <!-- 面包屑导航 -->
      <el-breadcrumb
        v-if="showBreadcrumb && breadcrumbs.length > 0"
        class="app-header__breadcrumb"
        separator="/"
      >
        <el-breadcrumb-item
          v-for="(item, index) in breadcrumbs"
          :key="index"
          :to="item.path"
        >
          <el-icon v-if="item.icon">
            <component :is="item.icon" />
          </el-icon>
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <!-- 中间区域 -->
    <div class="app-header__center">
      <!-- 搜索框 -->
      <div v-if="showSearch" class="app-header__search">
        <el-input
          v-model="searchValue"
          :placeholder="searchPlaceholder"
          :prefix-icon="Search"
          clearable
          @input="handleSearch"
          @keyup.enter="handleSearchEnter"
          @clear="handleSearchClear"
        >
          <template #suffix>
            <el-button
              v-if="searchValue"
              type="text"
              size="small"
              @click="handleSearchEnter"
            >
              搜索
            </el-button>
          </template>
        </el-input>
      </div>
    </div>
    
    <!-- 右侧区域 -->
    <div class="app-header__right">
      <!-- 自定义操作按钮 -->
      <div v-if="actions.length > 0" class="app-header__actions">
        <el-button
          v-for="action in actions"
          :key="action.key"
          :type="action.type || 'text'"
          :size="action.size || 'default'"
          :disabled="action.disabled"
          :loading="action.loading"
          class="app-header__action"
          @click="handleActionClick(action)"
        >
          <el-icon v-if="action.icon">
            <component :is="action.icon" />
          </el-icon>
          <span v-if="action.text">{{ action.text }}</span>
          <el-badge
            v-if="action.badge"
            :value="action.badge.value"
            :type="action.badge.type"
            :is-dot="action.badge.isDot"
          />
        </el-button>
      </div>
      
      <!-- 通知中心 -->
      <el-dropdown
        v-if="showNotification"
        class="app-header__notification"
        trigger="click"
        @command="handleNotificationCommand"
      >
        <el-button type="text" class="app-header__notification-btn">
          <el-badge :value="notificationCount" :hidden="notificationCount === 0">
            <el-icon><Bell /></el-icon>
          </el-badge>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu class="app-header__notification-menu">
            <div class="notification-header">
              <span>通知中心</span>
              <el-button type="text" size="small" @click="handleClearNotifications">
                清空
              </el-button>
            </div>
            <el-scrollbar max-height="300px">
              <div v-if="notifications.length === 0" class="notification-empty">
                <el-empty description="暂无通知" :image-size="60" />
              </div>
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="notification-item"
                :class="{ 'is-unread': !notification.read }"
                @click="handleNotificationClick(notification)"
              >
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-desc">{{ notification.content }}</div>
                  <div class="notification-time">{{ formatTime(notification.time) }}</div>
                </div>
                <el-button
                  type="text"
                  size="small"
                  class="notification-close"
                  @click.stop="handleRemoveNotification(notification)"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
            </el-scrollbar>
            <div class="notification-footer">
              <el-button type="text" size="small" @command="'viewAll'">
                查看全部
              </el-button>
            </div>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <!-- 全屏切换 -->
      <el-button
        v-if="showFullscreen"
        type="text"
        class="app-header__fullscreen"
        @click="handleFullscreen"
      >
        <el-icon>
          <FullScreen v-if="!isFullscreen" />
          <Aim v-else />
        </el-icon>
      </el-button>
      
      <!-- 主题切换 -->
      <el-dropdown
        v-if="showTheme"
        class="app-header__theme"
        @command="handleThemeCommand"
      >
        <el-button type="text">
          <el-icon>
            <Sunny v-if="currentTheme === 'light'" />
            <Moon v-else-if="currentTheme === 'dark'" />
            <Monitor v-else />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="light">
              <el-icon><Sunny /></el-icon>
              浅色主题
            </el-dropdown-item>
            <el-dropdown-item command="dark">
              <el-icon><Moon /></el-icon>
              深色主题
            </el-dropdown-item>
            <el-dropdown-item command="auto">
              <el-icon><Monitor /></el-icon>
              跟随系统
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <!-- 用户菜单 -->
      <el-dropdown
        v-if="showUserMenu"
        class="app-header__user"
        @command="handleUserCommand"
      >
        <div class="app-header__user-info">
          <el-avatar
            :src="userInfo.avatar"
            :size="32"
            class="app-header__avatar"
          >
            <el-icon><User /></el-icon>
          </el-avatar>
          <span v-if="showUserName" class="app-header__username">
            {{ userInfo.name || '用户' }}
          </span>
          <el-icon class="app-header__user-arrow"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  ElButton,
  ElIcon,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElInput,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElBadge,
  ElAvatar,
  ElScrollbar,
  ElEmpty
} from 'element-plus'
import {
  Fold,
  Expand,
  Search,
  Bell,
  Close,
  FullScreen,
  Aim,
  Sunny,
  Moon,
  Monitor,
  User,
  ArrowDown,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'
import { formatTime } from '@/utils'

/**
 * 应用顶部导航栏组件
 * 包含Logo、导航、搜索、通知、用户菜单等功能
 */

// 面包屑项类型
interface BreadcrumbItem {
  title: string
  path?: string
  icon?: any
}

// 操作按钮类型
interface ActionButton {
  key: string
  text?: string
  icon?: any
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  loading?: boolean
  badge?: {
    value: string | number
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    isDot?: boolean
  }
}

// 通知类型
interface Notification {
  id: string
  title: string
  content: string
  time: Date
  read: boolean
  type?: 'info' | 'success' | 'warning' | 'error'
}

// 用户信息类型
interface UserInfo {
  name?: string
  avatar?: string
  email?: string
}

// 定义组件属性
interface Props {
  /** Logo 图片地址 */
  logo?: string
  /** 应用标题 */
  title?: string
  /** 是否显示标题 */
  showTitle?: boolean
  /** 是否显示折叠按钮 */
  showCollapseButton?: boolean
  /** 是否折叠 */
  collapsed?: boolean
  /** 是否显示面包屑 */
  showBreadcrumb?: boolean
  /** 面包屑数据 */
  breadcrumbs?: BreadcrumbItem[]
  /** 是否显示搜索框 */
  showSearch?: boolean
  /** 搜索框占位符 */
  searchPlaceholder?: string
  /** 操作按钮列表 */
  actions?: ActionButton[]
  /** 是否显示通知中心 */
  showNotification?: boolean
  /** 通知列表 */
  notifications?: Notification[]
  /** 是否显示全屏按钮 */
  showFullscreen?: boolean
  /** 是否显示主题切换 */
  showTheme?: boolean
  /** 当前主题 */
  currentTheme?: 'light' | 'dark' | 'auto'
  /** 是否显示用户菜单 */
  showUserMenu?: boolean
  /** 是否显示用户名 */
  showUserName?: boolean
  /** 用户信息 */
  userInfo?: UserInfo
  /** 是否固定 */
  fixed?: boolean
  /** 自定义类名 */
  customClass?: string
}

// 定义默认值
const props = withDefaults(defineProps<Props>(), {
  title: 'Verto',
  showTitle: true,
  showCollapseButton: true,
  collapsed: false,
  showBreadcrumb: true,
  breadcrumbs: () => [],
  showSearch: true,
  searchPlaceholder: '搜索...',
  actions: () => [],
  showNotification: true,
  notifications: () => [],
  showFullscreen: true,
  showTheme: true,
  currentTheme: 'auto',
  showUserMenu: true,
  showUserName: true,
  userInfo: () => ({}),
  fixed: true
})

// 定义事件
const emit = defineEmits<{
  'brand-click': []
  collapse: [collapsed: boolean]
  search: [value: string]
  'search-enter': [value: string]
  'search-clear': []
  'action-click': [action: ActionButton]
  'notification-click': [notification: Notification]
  'notification-command': [command: string]
  'theme-change': [theme: string]
  'user-command': [command: string]
}>()

// 响应式数据
const searchValue = ref('')
const isFullscreen = ref(false)

// 计算属性
const headerClass = computed(() => {
  return [
    {
      'app-header--fixed': props.fixed,
      'app-header--collapsed': props.collapsed
    },
    props.customClass
  ]
})

const notificationCount = computed(() => {
  return props.notifications.filter(n => !n.read).length
})

/**
 * 处理品牌点击
 */
const handleBrandClick = () => {
  emit('brand-click')
}

/**
 * 处理折叠切换
 */
const handleCollapse = () => {
  emit('collapse', !props.collapsed)
}

/**
 * 处理搜索输入
 */
const handleSearch = (value: string) => {
  emit('search', value)
}

/**
 * 处理搜索回车
 */
const handleSearchEnter = () => {
  emit('search-enter', searchValue.value)
}

/**
 * 处理搜索清空
 */
const handleSearchClear = () => {
  searchValue.value = ''
  emit('search-clear')
}

/**
 * 处理操作按钮点击
 */
const handleActionClick = (action: ActionButton) => {
  emit('action-click', action)
}

/**
 * 处理通知点击
 */
const handleNotificationClick = (notification: Notification) => {
  emit('notification-click', notification)
}

/**
 * 处理通知命令
 */
const handleNotificationCommand = (command: string) => {
  emit('notification-command', command)
}

/**
 * 处理清空通知
 */
const handleClearNotifications = () => {
  emit('notification-command', 'clear')
}

/**
 * 处理移除通知
 */
const handleRemoveNotification = (notification: Notification) => {
  emit('notification-command', `remove:${notification.id}`)
}

/**
 * 处理全屏切换
 */
const handleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

/**
 * 处理主题切换
 */
const handleThemeCommand = (theme: string) => {
  emit('theme-change', theme)
}

/**
 * 处理用户菜单命令
 */
const handleUserCommand = (command: string) => {
  emit('user-command', command)
}

/**
 * 监听全屏状态变化
 */
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 生命周期
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})

// 暴露方法
defineExpose({
  searchValue,
  isFullscreen
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 24px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  
  &--fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
  }
  
  &__left {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  }
  
  &__center {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    max-width: 600px;
    margin: 0 24px;
  }
  
  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  
  // 品牌区域
  &__brand {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: $border-radius-base;
    transition: all 0.3s;
    
    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }
  
  &__logo {
    width: 32px;
    height: 32px;
    margin-right: 12px;
    border-radius: $border-radius-small;
  }
  
  &__title {
    font-size: $font-size-large;
    font-weight: 600;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }
  
  // 折叠按钮
  &__collapse {
    margin-left: 16px;
    padding: 8px;
    
    :deep(.el-icon) {
      font-size: 18px;
    }
  }
  
  // 面包屑
  &__breadcrumb {
    margin-left: 24px;
    
    :deep(.el-breadcrumb__item) {
      .el-breadcrumb__inner {
        display: flex;
        align-items: center;
        gap: 4px;
        
        &:hover {
          color: var(--el-color-primary);
        }
      }
    }
  }
  
  // 搜索框
  &__search {
    width: 100%;
    max-width: 400px;
    
    :deep(.el-input) {
      .el-input__wrapper {
        border-radius: 20px;
        background-color: var(--el-fill-color-light);
        border: none;
        transition: all 0.3s;
        
        &:hover {
          background-color: var(--el-fill-color);
        }
        
        &.is-focus {
          background-color: var(--el-bg-color);
          box-shadow: 0 0 0 1px var(--el-color-primary);
        }
      }
    }
  }
  
  // 操作按钮
  &__actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  &__action {
    position: relative;
    
    :deep(.el-badge) {
      .el-badge__content {
        top: 2px;
        right: 2px;
      }
    }
  }
  
  // 通知中心
  &__notification {
    &-btn {
      position: relative;
      padding: 8px;
      
      :deep(.el-icon) {
        font-size: 18px;
      }
    }
    
    &-menu {
      width: 320px;
      
      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--el-border-color-lighter);
        font-weight: 500;
      }
      
      .notification-empty {
        padding: 24px;
        text-align: center;
      }
      
      .notification-item {
        display: flex;
        align-items: flex-start;
        padding: 12px 16px;
        border-bottom: 1px solid var(--el-border-color-lighter);
        cursor: pointer;
        transition: background-color 0.3s;
        
        &:hover {
          background-color: var(--el-fill-color-light);
        }
        
        &.is-unread {
          background-color: var(--el-color-primary-light-9);
          
          &::before {
            content: '';
            position: absolute;
            left: 8px;
            top: 50%;
            transform: translateY(-50%);
            width: 6px;
            height: 6px;
            background-color: var(--el-color-primary);
            border-radius: 50%;
          }
        }
        
        .notification-content {
          flex: 1;
          min-width: 0;
        }
        
        .notification-title {
          font-weight: 500;
          margin-bottom: 4px;
          @include text-ellipsis;
        }
        
        .notification-desc {
          font-size: $font-size-small;
          color: var(--el-text-color-regular);
          margin-bottom: 4px;
          @include text-ellipsis(2);
        }
        
        .notification-time {
          font-size: $font-size-extra-small;
          color: var(--el-text-color-placeholder);
        }
        
        .notification-close {
          margin-left: 8px;
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        &:hover {
          .notification-close {
            opacity: 1;
          }
        }
      }
      
      .notification-footer {
        padding: 8px 16px;
        text-align: center;
        border-top: 1px solid var(--el-border-color-lighter);
      }
    }
  }
  
  // 全屏按钮
  &__fullscreen {
    padding: 8px;
    
    :deep(.el-icon) {
      font-size: 18px;
    }
  }
  
  // 主题切换
  &__theme {
    :deep(.el-button) {
      padding: 8px;
      
      .el-icon {
        font-size: 18px;
      }
    }
  }
  
  // 用户菜单
  &__user {
    &-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: $border-radius-base;
      cursor: pointer;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }
    
    &-arrow {
      font-size: 12px;
      color: var(--el-text-color-placeholder);
      transition: transform 0.3s;
    }
  }
  
  &__avatar {
    border: 2px solid var(--el-border-color-lighter);
    transition: border-color 0.3s;
    
    &:hover {
      border-color: var(--el-color-primary);
    }
  }
  
  &__username {
    font-size: $font-size-base;
    font-weight: 500;
    color: var(--el-text-color-primary);
    max-width: 100px;
    @include text-ellipsis;
  }
}

// 折叠状态样式
.app-header--collapsed {
  .app-header__breadcrumb {
    margin-left: 16px;
  }
}

// 响应式设计
@include tablet {
  .app-header {
    padding: 0 16px;
    
    &__center {
      margin: 0 16px;
    }
    
    &__search {
      max-width: 300px;
    }
    
    &__username {
      display: none;
    }
  }
}

@include mobile {
  .app-header {
    height: 56px;
    padding: 0 12px;
    
    &__center {
      display: none;
    }
    
    &__breadcrumb {
      display: none;
    }
    
    &__actions {
      gap: 2px;
    }
    
    &__action,
    &__notification-btn,
    &__fullscreen,
    &__theme :deep(.el-button) {
      padding: 6px;
      
      :deep(.el-icon) {
        font-size: 16px;
      }
    }
    
    &__username {
      display: none;
    }
    
    &__user-arrow {
      display: none;
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .app-header {
    border-bottom-color: var(--el-border-color);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  }
}

// 动画效果
.app-header {
  :deep(.el-dropdown) {
    .el-dropdown-menu {
      animation: dropdown-fade-in 0.3s ease;
    }
  }
}

@keyframes dropdown-fade-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>