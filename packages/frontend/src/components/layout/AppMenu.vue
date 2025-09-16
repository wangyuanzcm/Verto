<template>
  <el-menu
    :default-active="activeMenu"
    :collapse="collapsed"
    :unique-opened="uniqueOpened"
    :router="router"
    :mode="mode"
    class="app-menu"
    :class="menuClass"
    @select="handleSelect"
    @open="handleOpen"
    @close="handleClose"
  >
    <template v-for="item in menuItems" :key="item.path">
      <!-- 单级菜单 -->
      <el-menu-item
        v-if="!item.children || item.children.length === 0"
        :index="item.path"
        :disabled="item.disabled"
        @click="handleMenuClick(item)"
      >
        <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon>
        <template #title>
          <span>{{ item.title }}</span>
          <el-badge
            v-if="item.badge"
            :value="item.badge.value"
            :type="item.badge.type"
            :is-dot="item.badge.isDot"
            class="app-menu__badge"
          />
        </template>
      </el-menu-item>
      
      <!-- 多级菜单 -->
      <el-sub-menu
        v-else
        :index="item.path"
        :disabled="item.disabled"
      >
        <template #title>
          <el-icon v-if="item.icon">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.title }}</span>
          <el-badge
            v-if="item.badge"
            :value="item.badge.value"
            :type="item.badge.type"
            :is-dot="item.badge.isDot"
            class="app-menu__badge"
          />
        </template>
        
        <!-- 递归渲染子菜单 -->
        <AppMenuItem
          v-for="child in item.children"
          :key="child.path"
          :item="child"
          :collapsed="collapsed"
          @select="handleSelect"
          @click="handleMenuClick"
        />
      </el-sub-menu>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMenu, ElMenuItem, ElSubMenu, ElIcon, ElBadge } from 'element-plus'
import AppMenuItem from './AppMenuItem.vue'

/**
 * 应用导航菜单组件
 * 支持多级菜单、图标、徽章、权限控制等功能
 */

// 菜单项类型
interface MenuBadge {
  value: string | number
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  isDot?: boolean
}

interface MenuItem {
  path: string
  title: string
  icon?: any
  badge?: MenuBadge
  disabled?: boolean
  hidden?: boolean
  children?: MenuItem[]
  meta?: Record<string, any>
}

// 定义组件属性
interface Props {
  /** 菜单数据 */
  menuItems: MenuItem[]
  /** 是否折叠 */
  collapsed?: boolean
  /** 菜单模式 */
  mode?: 'vertical' | 'horizontal'
  /** 是否只保持一个子菜单的展开 */
  uniqueOpened?: boolean
  /** 是否启用路由模式 */
  router?: boolean
  /** 自定义类名 */
  customClass?: string
  /** 当前激活菜单 */
  activeMenu?: string
}

// 定义默认值
const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  mode: 'vertical',
  uniqueOpened: true,
  router: true
})

// 定义事件
const emit = defineEmits<{
  select: [index: string, indexPath: string[], item: MenuItem]
  open: [index: string, indexPath: string[]]
  close: [index: string, indexPath: string[]]
  'menu-click': [item: MenuItem]
}>()

// 路由相关
const route = useRoute()
const router = useRouter()

// 计算属性
const menuClass = computed(() => {
  return [
    {
      'app-menu--collapsed': props.collapsed,
      'app-menu--horizontal': props.mode === 'horizontal'
    },
    props.customClass
  ]
})

const activeMenu = computed(() => {
  if (props.activeMenu) {
    return props.activeMenu
  }
  return route.path
})

/**
 * 处理菜单选择
 */
const handleSelect = (index: string, indexPath: string[]) => {
  const item = findMenuItem(props.menuItems, index)
  if (item) {
    emit('select', index, indexPath, item)
  }
}

/**
 * 处理子菜单展开
 */
const handleOpen = (index: string, indexPath: string[]) => {
  emit('open', index, indexPath)
}

/**
 * 处理子菜单关闭
 */
const handleClose = (index: string, indexPath: string[]) => {
  emit('close', index, indexPath)
}

/**
 * 处理菜单点击
 */
const handleMenuClick = (item: MenuItem) => {
  emit('menu-click', item)
  
  // 如果是外链，在新窗口打开
  if (item.meta?.isExternal) {
    window.open(item.path, '_blank')
    return
  }
  
  // 如果启用了路由模式且路径不同，则跳转
  if (props.router && item.path !== route.path) {
    router.push(item.path)
  }
}

/**
 * 递归查找菜单项
 */
const findMenuItem = (items: MenuItem[], path: string): MenuItem | null => {
  for (const item of items) {
    if (item.path === path) {
      return item
    }
    if (item.children) {
      const found = findMenuItem(item.children, path)
      if (found) {
        return found
      }
    }
  }
  return null
}

/**
 * 获取菜单项的完整路径
 */
const getMenuPath = (items: MenuItem[], targetPath: string, currentPath: string[] = []): string[] | null => {
  for (const item of items) {
    const path = [...currentPath, item.path]
    
    if (item.path === targetPath) {
      return path
    }
    
    if (item.children) {
      const found = getMenuPath(item.children, targetPath, path)
      if (found) {
        return found
      }
    }
  }
  return null
}

// 监听路由变化，更新菜单状态
watch(
  () => route.path,
  (newPath) => {
    // 可以在这里处理路由变化时的逻辑
  },
  { immediate: true }
)

// 暴露方法
defineExpose({
  findMenuItem,
  getMenuPath
})
</script>

<script setup lang="ts">
// AppMenuItem 子组件
const AppMenuItem = {
  name: 'AppMenuItem',
  props: {
    item: {
      type: Object as () => MenuItem,
      required: true
    },
    collapsed: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select', 'click'],
  setup(props: any, { emit }: any) {
    const handleClick = () => {
      emit('click', props.item)
    }
    
    const handleSelect = (index: string, indexPath: string[]) => {
      emit('select', index, indexPath)
    }
    
    return {
      handleClick,
      handleSelect
    }
  },
  template: `
    <template v-if="!item.children || item.children.length === 0">
      <el-menu-item
        :index="item.path"
        :disabled="item.disabled"
        @click="handleClick"
      >
        <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon>
        <template #title>
          <span>{{ item.title }}</span>
          <el-badge
            v-if="item.badge"
            :value="item.badge.value"
            :type="item.badge.type"
            :is-dot="item.badge.isDot"
            class="app-menu__badge"
          />
        </template>
      </el-menu-item>
    </template>
    
    <template v-else>
      <el-sub-menu
        :index="item.path"
        :disabled="item.disabled"
      >
        <template #title>
          <el-icon v-if="item.icon">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.title }}</span>
          <el-badge
            v-if="item.badge"
            :value="item.badge.value"
            :type="item.badge.type"
            :is-dot="item.badge.isDot"
            class="app-menu__badge"
          />
        </template>
        
        <AppMenuItem
          v-for="child in item.children"
          :key="child.path"
          :item="child"
          :collapsed="collapsed"
          @select="handleSelect"
          @click="$emit('click', $event)"
        />
      </el-sub-menu>
    </template>
  `
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.app-menu {
  border-right: none;
  background-color: transparent;
  
  &__badge {
    margin-left: 8px;
  }
  
  // 垂直菜单样式
  &:not(.app-menu--horizontal) {
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      height: 48px;
      line-height: 48px;
      margin: 4px 12px;
      border-radius: $border-radius-base;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 100%;
        background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
        transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: -1;
      }
      
      &:hover {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        transform: translateX(2px);
        
        &::before {
          width: 4px;
        }
      }
      
      &.is-active {
        background: linear-gradient(90deg, var(--el-color-primary-light-8), var(--el-color-primary-light-9));
        color: var(--el-color-primary);
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.2);
        
        &::before {
          width: 4px;
        }
        
        &::after {
          content: '';
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          background-color: var(--el-color-primary);
          border-radius: 50%;
        }
      }
      
      .el-icon {
        margin-right: 8px;
        font-size: 18px;
        transition: all 0.3s;
      }
    }
    
    // 子菜单样式
    :deep(.el-sub-menu) {
      .el-menu {
        background-color: var(--el-fill-color-lighter);
        border-radius: 0 0 $border-radius-base $border-radius-base;
        margin: 0 12px;
        padding: 4px 0;
        
        .el-menu-item {
          margin: 2px 8px;
          height: 40px;
          line-height: 40px;
          padding-left: 40px !important;
          font-size: $font-size-small;
          
          &::before {
            left: 8px;
            width: 2px;
          }
          
          &:hover {
            transform: translateX(4px);
          }
          
          &.is-active {
            &::after {
              right: 8px;
              width: 4px;
              height: 4px;
            }
          }
        }
      }
      
      &.is-opened {
        > .el-sub-menu__title {
          background-color: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
        }
      }
    }
  }
  
  // 水平菜单样式
  &--horizontal {
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      height: 60px;
      line-height: 60px;
      padding: 0 20px;
      border-bottom: 3px solid transparent;
      transition: all 0.3s;
      
      &:hover {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }
      
      &.is-active {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        border-bottom-color: var(--el-color-primary);
        font-weight: 500;
      }
    }
    
    :deep(.el-sub-menu) {
      .el-menu {
        top: 60px;
        border: 1px solid var(--el-border-color-light);
        border-radius: $border-radius-base;
        box-shadow: var(--el-box-shadow-light);
        
        .el-menu-item {
          height: 40px;
          line-height: 40px;
          border-bottom: none;
          
          &:hover {
            background-color: var(--el-fill-color-light);
          }
        }
      }
    }
  }
  
  // 折叠状态
  &--collapsed {
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      padding-left: 20px !important;
      
      span {
        opacity: 0;
        width: 0;
        transition: all 0.3s;
      }
      
      .app-menu__badge {
        opacity: 0;
        width: 0;
      }
    }
    
    :deep(.el-sub-menu) {
      .el-sub-menu__icon-arrow {
        opacity: 0;
      }
    }
    
    // 折叠时的提示
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      position: relative;
      
      &:hover {
        &::after {
          content: attr(title);
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 12px;
          padding: 8px 12px;
          background-color: var(--el-color-info-dark-2);
          color: white;
          border-radius: $border-radius-base;
          font-size: $font-size-small;
          white-space: nowrap;
          z-index: 1000;
          opacity: 0;
          animation: tooltip-fade-in 0.3s ease forwards;
        }
      }
    }
  }
}

// 提示动画
@keyframes tooltip-fade-in {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

// 菜单项动画
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  &:hover {
    .el-icon {
      transform: scale(1.1);
    }
  }
}

// 激活状态动画
:deep(.el-menu-item.is-active) {
  animation: menu-item-active 0.3s ease;
}

@keyframes menu-item-active {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(4px);
  }
  100% {
    transform: translateX(2px);
  }
}

// 徽章样式增强
.app-menu__badge {
  :deep(.el-badge__content) {
    font-size: 10px;
    padding: 0 4px;
    height: 16px;
    line-height: 16px;
    min-width: 16px;
  }
  
  :deep(.el-badge__content.is-dot) {
    width: 6px;
    height: 6px;
    right: 0;
    top: 2px;
  }
}

// 响应式设计
@include mobile {
  .app-menu {
    &:not(.app-menu--horizontal) {
      :deep(.el-menu-item),
      :deep(.el-sub-menu__title) {
        margin: 2px 8px;
        height: 44px;
        line-height: 44px;
      }
      
      :deep(.el-sub-menu) {
        .el-menu {
          margin: 0 8px;
          
          .el-menu-item {
            margin: 1px 4px;
            height: 36px;
            line-height: 36px;
            padding-left: 32px !important;
          }
        }
      }
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .app-menu {
    :deep(.el-sub-menu) {
      .el-menu {
        background-color: var(--el-fill-color-darker);
      }
    }
    
    &--collapsed {
      :deep(.el-menu-item),
      :deep(.el-sub-menu__title) {
        &:hover {
          &::after {
            background-color: var(--el-color-info-light-3);
            color: var(--el-text-color-primary);
          }
        }
      }
    }
  }
}
</style>