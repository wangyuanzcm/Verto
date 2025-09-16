<template>
  <div class="system-layout">
    <a-layout style="min-height: 100vh">
      <!-- 侧边栏 -->
      <a-layout-sider
        v-model:collapsed="collapsed"
        :trigger="null"
        collapsible
        width="250"
        class="system-sider"
      >
        <div class="sider-header">
          <div class="logo">
            <SettingOutlined v-if="collapsed" />
            <span v-else>系统管理</span>
          </div>
        </div>
        
        <a-menu
          v-model:selectedKeys="selectedKeys"
          v-model:openKeys="openKeys"
          mode="inline"
          theme="dark"
          @click="handleMenuClick"
        >
          <a-menu-item key="overview">
            <DashboardOutlined />
            <span>系统概览</span>
          </a-menu-item>
          
          <a-sub-menu key="user-management">
            <template #title>
              <UserOutlined />
              <span>用户管理</span>
            </template>
            <a-menu-item key="users">用户列表</a-menu-item>
            <a-menu-item key="roles">角色管理</a-menu-item>
            <a-menu-item key="permissions">权限管理</a-menu-item>
          </a-sub-menu>
          
          <a-sub-menu key="system-config">
            <template #title>
              <SettingOutlined />
              <span>系统配置</span>
            </template>
            <a-menu-item key="basic-config">基础配置</a-menu-item>
            <a-menu-item key="email-config">邮件配置</a-menu-item>
            <a-menu-item key="storage-config">存储配置</a-menu-item>
            <a-menu-item key="security-config">安全配置</a-menu-item>
          </a-sub-menu>
          
          <a-sub-menu key="monitoring">
            <template #title>
              <MonitorOutlined />
              <span>系统监控</span>
            </template>
            <a-menu-item key="performance">性能监控</a-menu-item>
            <a-menu-item key="logs">日志管理</a-menu-item>
            <a-menu-item key="alerts">告警管理</a-menu-item>
          </a-sub-menu>
          
          <a-sub-menu key="maintenance">
            <template #title>
              <ToolOutlined />
              <span>系统维护</span>
            </template>
            <a-menu-item key="backup">数据备份</a-menu-item>
            <a-menu-item key="cleanup">数据清理</a-menu-item>
            <a-menu-item key="updates">系统更新</a-menu-item>
          </a-sub-menu>
          
          <a-menu-item key="about">
            <InfoCircleOutlined />
            <span>关于系统</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      
      <!-- 主要内容区域 -->
      <a-layout>
        <!-- 头部 -->
        <a-layout-header class="system-header">
          <div class="header-left">
            <a-button
              type="text"
              @click="collapsed = !collapsed"
              class="trigger"
            >
              <MenuUnfoldOutlined v-if="collapsed" />
              <MenuFoldOutlined v-else />
            </a-button>
            
            <!-- 面包屑 -->
            <a-breadcrumb class="breadcrumb">
              <a-breadcrumb-item>
                <HomeOutlined />
                首页
              </a-breadcrumb-item>
              <a-breadcrumb-item>
                <SettingOutlined />
                系统管理
              </a-breadcrumb-item>
              <a-breadcrumb-item v-if="currentPageTitle">
                {{ currentPageTitle }}
              </a-breadcrumb-item>
            </a-breadcrumb>
          </div>
          
          <div class="header-right">
            <!-- 工具栏 -->
            <a-space>
              <a-tooltip title="搜索">
                <a-button type="text" @click="showSearch = true">
                  <SearchOutlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="刷新">
                <a-button type="text" @click="handleRefresh">
                  <ReloadOutlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="全屏">
                <a-button type="text" @click="toggleFullscreen">
                  <FullscreenOutlined v-if="!isFullscreen" />
                  <FullscreenExitOutlined v-else />
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="帮助">
                <a-button type="text" @click="showHelp">
                  <QuestionCircleOutlined />
                </a-button>
              </a-tooltip>
            </a-space>
          </div>
        </a-layout-header>
        
        <!-- 内容区域 -->
        <a-layout-content class="system-content">
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
    
    <!-- 搜索模态框 -->
    <a-modal
      v-model:open="showSearch"
      title="全局搜索"
      width="600px"
      :footer="null"
    >
      <div class="search-modal">
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索功能、配置项、用户等..."
          size="large"
          @search="handleSearch"
        />
        
        <div v-if="searchResults.length > 0" class="search-results">
          <div class="search-category" v-for="category in searchCategories" :key="category.key">
            <h4>{{ category.title }}</h4>
            <div class="search-items">
              <div
                v-for="item in getSearchItems(category.key)"
                :key="item.key"
                class="search-item"
                @click="navigateToItem(item)"
              >
                <component :is="item.icon" />
                <div class="item-content">
                  <div class="item-title">{{ item.title }}</div>
                  <div class="item-description">{{ item.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="searchKeyword" class="no-results">
          <a-empty description="未找到相关结果" />
        </div>
      </div>
    </a-modal>
    
    <!-- 帮助模态框 -->
    <a-modal
      v-model:open="showHelpModal"
      title="系统帮助"
      width="800px"
      :footer="null"
    >
      <div class="help-content">
        <a-tabs>
          <a-tab-pane key="quick-start" tab="快速开始">
            <div class="help-section">
              <h3>系统管理快速指南</h3>
              <a-steps direction="vertical" size="small">
                <a-step title="用户管理" description="管理系统用户、角色和权限" />
                <a-step title="系统配置" description="配置系统基础参数和功能" />
                <a-step title="监控告警" description="监控系统运行状态和性能" />
                <a-step title="数据维护" description="备份和清理系统数据" />
              </a-steps>
            </div>
          </a-tab-pane>
          
          <a-tab-pane key="features" tab="功能说明">
            <div class="help-section">
              <a-collapse>
                <a-collapse-panel key="user-management" header="用户管理">
                  <p>管理系统用户账户、角色分配和权限控制。</p>
                  <ul>
                    <li>创建和编辑用户账户</li>
                    <li>分配用户角色</li>
                    <li>设置权限范围</li>
                    <li>用户状态管理</li>
                  </ul>
                </a-collapse-panel>
                
                <a-collapse-panel key="system-config" header="系统配置">
                  <p>配置系统运行参数和功能开关。</p>
                  <ul>
                    <li>基础系统参数</li>
                    <li>邮件服务配置</li>
                    <li>文件存储配置</li>
                    <li>安全策略设置</li>
                  </ul>
                </a-collapse-panel>
                
                <a-collapse-panel key="monitoring" header="系统监控">
                  <p>实时监控系统运行状态和性能指标。</p>
                  <ul>
                    <li>CPU、内存使用率</li>
                    <li>数据库性能</li>
                    <li>API响应时间</li>
                    <li>错误日志分析</li>
                  </ul>
                </a-collapse-panel>
              </a-collapse>
            </div>
          </a-tab-pane>
          
          <a-tab-pane key="faq" tab="常见问题">
            <div class="help-section">
              <a-collapse>
                <a-collapse-panel key="faq1" header="如何重置用户密码？">
                  <p>在用户管理页面，选择目标用户，点击"重置密码"按钮，系统将发送重置邮件到用户邮箱。</p>
                </a-collapse-panel>
                
                <a-collapse-panel key="faq2" header="如何配置邮件服务？">
                  <p>进入系统配置 > 邮件配置，填写SMTP服务器信息、端口、认证信息等参数。</p>
                </a-collapse-panel>
                
                <a-collapse-panel key="faq3" header="如何查看系统日志？">
                  <p>在系统监控 > 日志管理中，可以按时间、级别、模块等条件筛选和查看系统日志。</p>
                </a-collapse-panel>
              </a-collapse>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  HomeOutlined,
  SettingOutlined,
  DashboardOutlined,
  UserOutlined,
  MonitorOutlined,
  ToolOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons-vue'

// 路由
const router = useRouter()
const route = useRoute()

// 响应式数据
const collapsed = ref(false)
const selectedKeys = ref(['overview'])
const openKeys = ref([])
const showSearch = ref(false)
const showHelpModal = ref(false)
const searchKeyword = ref('')
const isFullscreen = ref(false)

// 搜索结果
const searchResults = ref([])

// 搜索分类
const searchCategories = [
  { key: 'pages', title: '页面' },
  { key: 'configs', title: '配置' },
  { key: 'users', title: '用户' },
  { key: 'logs', title: '日志' }
]

// 页面标题映射
const pageTitleMap = {
  'overview': '系统概览',
  'users': '用户列表',
  'roles': '角色管理',
  'permissions': '权限管理',
  'basic-config': '基础配置',
  'email-config': '邮件配置',
  'storage-config': '存储配置',
  'security-config': '安全配置',
  'performance': '性能监控',
  'logs': '日志管理',
  'alerts': '告警管理',
  'backup': '数据备份',
  'cleanup': '数据清理',
  'updates': '系统更新',
  'about': '关于系统'
}

// 计算属性
/**
 * 当前页面标题
 */
const currentPageTitle = computed(() => {
  const currentKey = selectedKeys.value[0]
  return pageTitleMap[currentKey] || ''
})

// 方法
/**
 * 菜单点击处理
 */
const handleMenuClick = ({ key }: { key: string }) => {
  selectedKeys.value = [key]
  
  // 路由导航
  const routeMap = {
    'overview': '/system/overview',
    'users': '/system/users',
    'roles': '/system/roles',
    'permissions': '/system/permissions',
    'basic-config': '/system/config/basic',
    'email-config': '/system/config/email',
    'storage-config': '/system/config/storage',
    'security-config': '/system/config/security',
    'performance': '/system/monitoring/performance',
    'logs': '/system/monitoring/logs',
    'alerts': '/system/monitoring/alerts',
    'backup': '/system/maintenance/backup',
    'cleanup': '/system/maintenance/cleanup',
    'updates': '/system/maintenance/updates',
    'about': '/system/about'
  }
  
  const targetRoute = routeMap[key]
  if (targetRoute && route.path !== targetRoute) {
    router.push(targetRoute)
  }
}

/**
 * 刷新处理
 */
const handleRefresh = () => {
  window.location.reload()
}

/**
 * 切换全屏
 */
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

/**
 * 显示帮助
 */
const showHelp = () => {
  showHelpModal.value = true
}

/**
 * 搜索处理
 */
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }
  
  // 模拟搜索结果
  const mockResults = [
    {
      key: 'users-page',
      category: 'pages',
      title: '用户管理',
      description: '管理系统用户账户',
      icon: UserOutlined,
      route: '/system/users'
    },
    {
      key: 'email-config',
      category: 'configs',
      title: '邮件配置',
      description: '配置SMTP邮件服务',
      icon: SettingOutlined,
      route: '/system/config/email'
    },
    {
      key: 'system-logs',
      category: 'logs',
      title: '系统日志',
      description: '查看系统运行日志',
      icon: MonitorOutlined,
      route: '/system/monitoring/logs'
    }
  ]
  
  const keyword = searchKeyword.value.toLowerCase()
  searchResults.value = mockResults.filter(item => 
    item.title.toLowerCase().includes(keyword) ||
    item.description.toLowerCase().includes(keyword)
  )
}

/**
 * 获取搜索项目
 */
const getSearchItems = (category: string) => {
  return searchResults.value.filter(item => item.category === category)
}

/**
 * 导航到搜索项目
 */
const navigateToItem = (item: any) => {
  router.push(item.route)
  showSearch.value = false
  searchKeyword.value = ''
  searchResults.value = []
}

/**
 * 根据路由更新选中的菜单
 */
const updateSelectedKeys = () => {
  const path = route.path
  
  // 路由到菜单键的映射
  const routeToKeyMap = {
    '/system/overview': 'overview',
    '/system/users': 'users',
    '/system/roles': 'roles',
    '/system/permissions': 'permissions',
    '/system/config/basic': 'basic-config',
    '/system/config/email': 'email-config',
    '/system/config/storage': 'storage-config',
    '/system/config/security': 'security-config',
    '/system/monitoring/performance': 'performance',
    '/system/monitoring/logs': 'logs',
    '/system/monitoring/alerts': 'alerts',
    '/system/maintenance/backup': 'backup',
    '/system/maintenance/cleanup': 'cleanup',
    '/system/maintenance/updates': 'updates',
    '/system/about': 'about'
  }
  
  const key = routeToKeyMap[path]
  if (key) {
    selectedKeys.value = [key]
    
    // 设置展开的子菜单
    if (key.includes('config')) {
      openKeys.value = ['system-config']
    } else if (['performance', 'logs', 'alerts'].includes(key)) {
      openKeys.value = ['monitoring']
    } else if (['backup', 'cleanup', 'updates'].includes(key)) {
      openKeys.value = ['maintenance']
    } else if (['users', 'roles', 'permissions'].includes(key)) {
      openKeys.value = ['user-management']
    }
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

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 生命周期
onMounted(() => {
  updateSelectedKeys()
  
  // 监听全屏状态变化
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

// 组件卸载时清理事件监听
// onUnmounted(() => {
//   document.removeEventListener('fullscreenchange', handleFullscreenChange)
// })
</script>

<style scoped>
.system-layout {
  height: 100vh;
}

.system-sider {
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
}

.sider-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  margin: 16px;
  border-radius: 6px;
}

.logo {
  color: white;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.system-header {
  background: white;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 99;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.breadcrumb {
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.system-content {
  margin: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 112px);
}

.search-modal {
  padding: 16px 0;
}

.search-results {
  margin-top: 24px;
  max-height: 400px;
  overflow-y: auto;
}

.search-category {
  margin-bottom: 24px;
}

.search-category h4 {
  margin-bottom: 12px;
  color: #8c8c8c;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.search-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.search-item:hover {
  background: #f5f5f5;
}

.item-content {
  flex: 1;
}

.item-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.item-description {
  font-size: 12px;
  color: #8c8c8c;
}

.no-results {
  text-align: center;
  padding: 40px 0;
}

.help-content {
  max-height: 500px;
  overflow-y: auto;
}

.help-section {
  padding: 16px 0;
}

.help-section h3 {
  margin-bottom: 16px;
  color: #262626;
}

.help-section ul {
  margin: 8px 0;
  padding-left: 20px;
}

.help-section li {
  margin-bottom: 4px;
  color: #595959;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-sider {
    position: fixed;
    z-index: 1000;
  }
  
  .system-header {
    padding: 0 16px;
  }
  
  .header-left {
    gap: 8px;
  }
  
  .breadcrumb {
    display: none;
  }
  
  .system-content {
    margin: 16px;
    padding: 16px;
  }
}

/* 动画效果 */
.system-sider {
  transition: all 0.2s;
}

.search-item {
  transition: all 0.2s;
}

.search-item:hover {
  transform: translateX(4px);
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .system-header {
    background: #141414;
    border-bottom: 1px solid #303030;
  }
  
  .system-content {
    background: #141414;
    color: #ffffff;
  }
  
  .search-item:hover {
    background: #262626;
  }
}
</style>