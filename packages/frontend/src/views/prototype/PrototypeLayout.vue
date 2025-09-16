<template>
  <div class="prototype-layout">
    <a-layout class="layout-container">
      <!-- 侧边栏 -->
      <a-layout-sider
        v-model:collapsed="collapsed"
        :trigger="null"
        collapsible
        class="layout-sider"
        :width="240"
      >
        <div class="sider-header">
          <h3 v-if="!collapsed">原型设计</h3>
          <MenuFoldOutlined v-if="!collapsed" @click="toggleCollapsed" />
          <MenuUnfoldOutlined v-else @click="toggleCollapsed" />
        </div>
        
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="inline"
          theme="light"
          class="sider-menu"
          @click="handleMenuClick"
        >
          <a-menu-item key="list">
            <template #icon>
              <UnorderedListOutlined />
            </template>
            原型列表
          </a-menu-item>
          <a-menu-item key="new">
            <template #icon>
              <PlusOutlined />
            </template>
            新建原型
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      
      <!-- 主要内容区域 -->
      <a-layout class="layout-content">
        <!-- 头部 -->
        <a-layout-header class="content-header">
          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item>
              <router-link to="/">首页</router-link>
            </a-breadcrumb-item>
            <a-breadcrumb-item>
              <router-link to="/prototype">原型设计</router-link>
            </a-breadcrumb-item>
            <a-breadcrumb-item v-if="currentPageTitle">
              {{ currentPageTitle }}
            </a-breadcrumb-item>
          </a-breadcrumb>
          
          <div class="header-actions">
            <a-button @click="handleRefresh">
              <template #icon>
                <ReloadOutlined />
              </template>
              刷新
            </a-button>
            <a-button type="primary" @click="handleNewPrototype">
              <template #icon>
                <PlusOutlined />
              </template>
              新建原型
            </a-button>
          </div>
        </a-layout-header>
        
        <!-- 内容区域 -->
        <a-layout-content class="main-content">
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'

// 路由相关
const router = useRouter()
const route = useRoute()

// 响应式数据
const collapsed = ref(false)
const selectedKeys = ref(['list'])

// 计算属性
const currentPageTitle = computed(() => {
  return route.meta.title as string
})

// 监听路由变化
watch(
  () => route.name,
  (newName) => {
    if (newName === 'PrototypeList') {
      selectedKeys.value = ['list']
    } else if (newName === 'PrototypeNew') {
      selectedKeys.value = ['new']
    }
  },
  { immediate: true }
)

// 方法
/**
 * 切换侧边栏折叠状态
 */
const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
}

/**
 * 处理菜单点击
 */
const handleMenuClick = ({ key }: { key: string }) => {
  switch (key) {
    case 'list':
      router.push('/prototype')
      break
    case 'new':
      router.push('/prototype/new')
      break
  }
}

/**
 * 处理刷新
 */
const handleRefresh = () => {
  window.location.reload()
}

/**
 * 处理新建原型
 */
const handleNewPrototype = () => {
  router.push('/prototype/new')
}
</script>

<style scoped>
.prototype-layout {
  height: 100vh;
  background: #f5f5f5;
}

.layout-container {
  height: 100%;
}

.layout-sider {
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.sider-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.sider-menu {
  border-right: none;
}

.layout-content {
  display: flex;
  flex-direction: column;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  height: 64px;
}

.breadcrumb {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    height: auto;
    padding: 16px;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .main-content {
    padding: 16px;
  }
}
</style>