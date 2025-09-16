<template>
  <div class="material-layout">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      width="240"
      class="layout-sider"
    >
      <div class="sider-header">
        <div class="logo">
          <AppstoreOutlined />
          <span v-show="!collapsed">物料管理</span>
        </div>
      </div>
      
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        :inline-collapsed="collapsed"
        @click="handleMenuClick"
      >
        <a-menu-item key="list">
          <template #icon>
            <UnorderedListOutlined />
          </template>
          <span>物料列表</span>
        </a-menu-item>
        
        <a-menu-item key="library">
          <template #icon>
            <BookOutlined />
          </template>
          <span>组件库</span>
        </a-menu-item>
        
        <a-menu-item key="templates">
          <template #icon>
            <LayoutOutlined />
          </template>
          <span>模板库</span>
        </a-menu-item>
        
        <a-menu-item key="icons">
          <template #icon>
            <SmileOutlined />
          </template>
          <span>图标库</span>
        </a-menu-item>
        
        <a-menu-divider />
        
        <a-menu-item key="upload">
          <template #icon>
            <CloudUploadOutlined />
          </template>
          <span>上传物料</span>
        </a-menu-item>
        
        <a-menu-item key="settings">
          <template #icon>
            <SettingOutlined />
          </template>
          <span>物料设置</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    
    <!-- 主要内容区域 -->
    <a-layout class="main-layout">
      <!-- 头部 -->
      <a-layout-header class="layout-header">
        <div class="header-left">
          <a-button
            type="text"
            @click="toggleCollapsed"
            class="collapse-btn"
          >
            <template #icon>
              <MenuUnfoldOutlined v-if="collapsed" />
              <MenuFoldOutlined v-else />
            </template>
          </a-button>
          
          <!-- 面包屑导航 -->
          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item>
              <HomeOutlined />
              <span>首页</span>
            </a-breadcrumb-item>
            <a-breadcrumb-item>
              <AppstoreOutlined />
              <span>物料管理</span>
            </a-breadcrumb-item>
            <a-breadcrumb-item v-if="currentPageTitle">
              {{ currentPageTitle }}
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        
        <div class="header-right">
          <!-- 工具栏 -->
          <a-space>
            <a-input-search
              v-model:value="searchKeyword"
              placeholder="搜索物料..."
              style="width: 200px"
              @search="handleSearch"
            />
            
            <a-button @click="handleRefresh">
              <template #icon>
                <ReloadOutlined />
              </template>
              刷新
            </a-button>
            
            <a-button type="primary" @click="handleNewMaterial">
              <template #icon>
                <PlusOutlined />
              </template>
              新建物料
            </a-button>
            
            <a-dropdown>
              <template #overlay>
                <a-menu @click="handleToolbarAction">
                  <a-menu-item key="import">
                    <ImportOutlined />
                    导入物料
                  </a-menu-item>
                  <a-menu-item key="export">
                    <ExportOutlined />
                    导出物料
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="batch-delete">
                    <DeleteOutlined />
                    批量删除
                  </a-menu-item>
                  <a-menu-item key="batch-publish">
                    <CloudUploadOutlined />
                    批量发布
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button>
                更多操作
                <DownOutlined />
              </a-button>
            </a-dropdown>
          </a-space>
        </div>
      </a-layout-header>
      
      <!-- 内容区域 -->
      <a-layout-content class="layout-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  AppstoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UnorderedListOutlined,
  BookOutlined,
  LayoutOutlined,
  SmileOutlined,
  CloudUploadOutlined,
  SettingOutlined,
  HomeOutlined,
  ReloadOutlined,
  PlusOutlined,
  ImportOutlined,
  ExportOutlined,
  DeleteOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

// 路由相关
const router = useRouter()
const route = useRoute()

// 响应式数据
const collapsed = ref(false)
const searchKeyword = ref('')
const selectedKeys = ref(['list'])

// 计算属性
const currentPageTitle = computed(() => {
  const routeName = route.name as string
  const titles: Record<string, string> = {
    'MaterialList': '物料列表',
    'MaterialLibrary': '组件库',
    'MaterialDetail': '物料详情',
    'MaterialTemplates': '模板库',
    'MaterialIcons': '图标库',
    'MaterialUpload': '上传物料',
    'MaterialSettings': '物料设置'
  }
  return titles[routeName] || ''
})

// 监听路由变化更新选中的菜单
watch(
  () => route.name,
  (newName) => {
    const routeMenuMap: Record<string, string> = {
      'MaterialList': 'list',
      'MaterialLibrary': 'library',
      'MaterialDetail': 'list',
      'MaterialTemplates': 'templates',
      'MaterialIcons': 'icons',
      'MaterialUpload': 'upload',
      'MaterialSettings': 'settings'
    }
    const menuKey = routeMenuMap[newName as string]
    if (menuKey) {
      selectedKeys.value = [menuKey]
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
  const routes: Record<string, string> = {
    list: '/material/list',
    library: '/material/library',
    templates: '/material/templates',
    icons: '/material/icons',
    upload: '/material/upload',
    settings: '/material/settings'
  }
  
  const targetRoute = routes[key]
  if (targetRoute && route.path !== targetRoute) {
    router.push(targetRoute)
  }
}

/**
 * 处理搜索
 */
const handleSearch = (value: string) => {
  // 这里可以触发全局搜索事件或者跳转到搜索页面
  message.info(`搜索: ${value}`)
}

/**
 * 处理刷新
 */
const handleRefresh = () => {
  // 触发当前页面刷新
  window.location.reload()
}

/**
 * 处理新建物料
 */
const handleNewMaterial = () => {
  router.push('/material/upload')
}

/**
 * 处理工具栏操作
 */
const handleToolbarAction = ({ key }: { key: string }) => {
  switch (key) {
    case 'import':
      message.info('导入物料功能开发中...')
      break
    case 'export':
      message.info('导出物料功能开发中...')
      break
    case 'batch-delete':
      message.info('批量删除功能开发中...')
      break
    case 'batch-publish':
      message.info('批量发布功能开发中...')
      break
  }
}
</script>

<style scoped>
.material-layout {
  height: 100vh;
  display: flex;
}

.layout-sider {
  background: #001529;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sider-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #303030;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 16px;
  font-weight: 500;
}

.logo .anticon {
  font-size: 20px;
  color: #1890ff;
}

.main-layout {
  flex: 1;
  background: #f5f5f5;
}

.layout-header {
  background: white;
  padding: 0 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 16px;
}

.breadcrumb {
  display: flex;
  align-items: center;
}

.breadcrumb :deep(.ant-breadcrumb-link) {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-right {
  display: flex;
  align-items: center;
}

.layout-content {
  padding: 24px;
  overflow-y: auto;
}

.content-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 112px);
}

/* 菜单样式覆盖 */
:deep(.ant-menu-dark) {
  background: #001529;
}

:deep(.ant-menu-dark .ant-menu-item-selected) {
  background-color: #1890ff;
}

:deep(.ant-menu-dark .ant-menu-item:hover) {
  background-color: rgba(24, 144, 255, 0.2);
}

:deep(.ant-menu-dark .ant-menu-item) {
  margin: 4px 8px;
  border-radius: 6px;
}

:deep(.ant-menu-dark .ant-menu-divider) {
  background-color: #303030;
  margin: 8px 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .layout-header {
    padding: 0 16px;
    flex-direction: column;
    height: auto;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-left,
  .header-right {
    justify-content: center;
  }
  
  .breadcrumb {
    justify-content: center;
  }
  
  .layout-content {
    padding: 16px;
  }
  
  .layout-sider {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s;
  }
  
  .layout-sider:not(.ant-layout-sider-collapsed) {
    transform: translateX(0);
  }
}

@media (max-width: 576px) {
  .header-right :deep(.ant-space) {
    flex-direction: column;
    width: 100%;
  }
  
  .header-right :deep(.ant-input-search) {
    width: 100% !important;
  }
}
</style>