<template>
  <div class="settings-layout">
    <div class="settings-container">
      <!-- 侧边导航 -->
      <div class="settings-sidebar">
        <div class="sidebar-header">
          <h2>设置</h2>
        </div>
        
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="inline"
          class="settings-menu"
          @click="handleMenuClick"
        >
          <a-menu-item key="profile">
            <template #icon>
              <UserOutlined />
            </template>
            个人资料
          </a-menu-item>
          
          <a-menu-item key="account">
            <template #icon>
              <SettingOutlined />
            </template>
            账户设置
          </a-menu-item>
          
          <a-menu-item key="security">
            <template #icon>
              <SafetyOutlined />
            </template>
            安全设置
          </a-menu-item>
          
          <a-menu-item key="notification">
            <template #icon>
              <BellOutlined />
            </template>
            通知设置
          </a-menu-item>
          
          <a-menu-divider />
          
          <a-menu-item key="system" v-if="isAdmin">
            <template #icon>
              <ControlOutlined />
            </template>
            系统配置
          </a-menu-item>
          
          <a-menu-item key="team" v-if="isAdmin">
            <template #icon>
              <TeamOutlined />
            </template>
            团队管理
          </a-menu-item>
        </a-menu>
      </div>
      
      <!-- 主要内容区域 -->
      <div class="settings-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  UserOutlined,
  SettingOutlined,
  SafetyOutlined,
  BellOutlined,
  ControlOutlined,
  TeamOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 当前选中的菜单项
const selectedKeys = ref<string[]>([])

// 是否为管理员
const isAdmin = computed(() => {
  return userStore.user?.role === 'admin'
})

/**
 * 处理菜单点击
 */
const handleMenuClick = ({ key }: { key: string }) => {
  const routeMap: Record<string, string> = {
    profile: '/settings/profile',
    account: '/settings/account',
    security: '/settings/security',
    notification: '/settings/notification',
    system: '/settings/system',
    team: '/settings/team'
  }
  
  const targetRoute = routeMap[key]
  if (targetRoute && targetRoute !== route.path) {
    router.push(targetRoute)
  }
}

/**
 * 根据当前路由更新选中的菜单项
 */
const updateSelectedKeys = () => {
  const path = route.path
  const keyMap: Record<string, string> = {
    '/settings/profile': 'profile',
    '/settings/account': 'account',
    '/settings/security': 'security',
    '/settings/notification': 'notification',
    '/settings/system': 'system',
    '/settings/team': 'team'
  }
  
  const key = keyMap[path]
  if (key) {
    selectedKeys.value = [key]
  }
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    updateSelectedKeys()
  },
  { immediate: true }
)
</script>

<style scoped>
.settings-layout {
  min-height: 100vh;
  background: #f5f5f5;
}

.settings-container {
  display: flex;
  min-height: 100vh;
}

.settings-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

.settings-menu {
  border: none;
  padding: 16px 0;
}

.settings-menu :deep(.ant-menu-item) {
  margin: 4px 16px;
  border-radius: 6px;
  height: 40px;
  line-height: 40px;
}

.settings-menu :deep(.ant-menu-item-selected) {
  background: #e6f7ff;
  color: #1890ff;
}

.settings-menu :deep(.ant-menu-item:hover) {
  background: #f5f5f5;
}

.settings-menu :deep(.ant-menu-divider) {
  margin: 16px 24px;
}

.settings-content {
  flex: 1;
  min-width: 0;
  background: #f5f5f5;
}

@media (max-width: 1024px) {
  .settings-container {
    flex-direction: column;
  }
  
  .settings-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .settings-menu {
    display: flex;
    overflow-x: auto;
    padding: 8px 16px;
  }
  
  .settings-menu :deep(.ant-menu-item) {
    margin: 0 8px;
    white-space: nowrap;
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .sidebar-header {
    padding: 16px;
  }
  
  .sidebar-header h2 {
    font-size: 18px;
  }
  
  .settings-menu {
    padding: 8px;
  }
  
  .settings-menu :deep(.ant-menu-item) {
    margin: 0 4px;
    padding: 0 12px;
    font-size: 14px;
  }
}
</style>