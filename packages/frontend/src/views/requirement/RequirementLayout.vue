<template>
  <div class="requirement-layout">
    <div class="layout-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <FileTextOutlined class="title-icon" />
            需求管理
          </h1>
          <p class="page-description">管理产品需求，跟踪开发进度</p>
        </div>
        <div class="header-actions">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索需求..."
            style="width: 300px"
            @search="onSearch"
          />
          <a-button type="primary" @click="createRequirement">
            <PlusOutlined />
            新建需求
          </a-button>
        </div>
      </div>
    </div>

    <div class="layout-content">
      <div class="content-sidebar">
        <a-menu
          v-model:selected-keys="selectedKeys"
          mode="inline"
          class="sidebar-menu"
          @click="onMenuClick"
        >
          <a-menu-item key="all">
            <template #icon><AppstoreOutlined /></template>
            全部需求
            <a-badge :count="stats.total" :offset="[10, 0]" />
          </a-menu-item>
          <a-menu-item key="pending">
            <template #icon><ClockCircleOutlined /></template>
            待处理
            <a-badge :count="stats.pending" :offset="[10, 0]" />
          </a-menu-item>
          <a-menu-item key="in-progress">
            <template #icon><SyncOutlined /></template>
            进行中
            <a-badge :count="stats.inProgress" :offset="[10, 0]" />
          </a-menu-item>
          <a-menu-item key="testing">
            <template #icon><BugOutlined /></template>
            测试中
            <a-badge :count="stats.testing" :offset="[10, 0]" />
          </a-menu-item>
          <a-menu-item key="completed">
            <template #icon><CheckCircleOutlined /></template>
            已完成
            <a-badge :count="stats.completed" :offset="[10, 0]" />
          </a-menu-item>
          <a-menu-item key="rejected">
            <template #icon><CloseCircleOutlined /></template>
            已拒绝
            <a-badge :count="stats.rejected" :offset="[10, 0]" />
          </a-menu-item>
          
          <a-menu-divider />
          
          <a-menu-item-group title="按类型筛选">
            <a-menu-item key="feature">
              <template #icon><StarOutlined /></template>
              功能需求
            </a-menu-item>
            <a-menu-item key="enhancement">
              <template #icon><RiseOutlined /></template>
              功能增强
            </a-menu-item>
            <a-menu-item key="bugfix">
              <template #icon><BugOutlined /></template>
              问题修复
            </a-menu-item>
            <a-menu-item key="performance">
              <template #icon><ThunderboltOutlined /></template>
              性能优化
            </a-menu-item>
          </a-menu-item-group>
          
          <a-menu-divider />
          
          <a-menu-item-group title="按优先级筛选">
            <a-menu-item key="high-priority">
              <template #icon><ExclamationCircleOutlined /></template>
              高优先级
            </a-menu-item>
            <a-menu-item key="medium-priority">
              <template #icon><MinusCircleOutlined /></template>
              中优先级
            </a-menu-item>
            <a-menu-item key="low-priority">
              <template #icon><InfoCircleOutlined /></template>
              低优先级
            </a-menu-item>
          </a-menu-item-group>
        </a-menu>
      </div>

      <div class="content-main">
        <div class="main-toolbar">
          <div class="toolbar-left">
            <a-breadcrumb>
              <a-breadcrumb-item>
                <router-link to="/">首页</router-link>
              </a-breadcrumb-item>
              <a-breadcrumb-item>
                <router-link to="/requirements">需求管理</router-link>
              </a-breadcrumb-item>
              <a-breadcrumb-item v-if="currentBreadcrumb">
                {{ currentBreadcrumb }}
              </a-breadcrumb-item>
            </a-breadcrumb>
          </div>
          <div class="toolbar-right">
            <a-tooltip title="刷新">
              <a-button type="text" @click="refresh" :loading="refreshing">
                <ReloadOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="导出">
              <a-button type="text" @click="exportData">
                <ExportOutlined />
              </a-button>
            </a-tooltip>
            <a-dropdown>
              <template #overlay>
                <a-menu @click="onViewModeChange">
                  <a-menu-item key="list">
                    <UnorderedListOutlined />
                    列表视图
                  </a-menu-item>
                  <a-menu-item key="card">
                    <AppstoreOutlined />
                    卡片视图
                  </a-menu-item>
                  <a-menu-item key="kanban">
                    <TableOutlined />
                    看板视图
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button type="text">
                <EyeOutlined />
                <DownOutlined />
              </a-button>
            </a-dropdown>
          </div>
        </div>

        <div class="main-content">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  FileTextOutlined,
  PlusOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  BugOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StarOutlined,
  RiseOutlined,
  ThunderboltOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  ExportOutlined,
  UnorderedListOutlined,
  TableOutlined,
  EyeOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

// 搜索关键词
const searchKeyword = ref('')

// 选中的菜单项
const selectedKeys = ref(['all'])

// 刷新状态
const refreshing = ref(false)

// 需求统计数据
const stats = reactive({
  total: 0,
  pending: 0,
  inProgress: 0,
  testing: 0,
  completed: 0,
  rejected: 0
})

// 当前面包屑
const currentBreadcrumb = computed(() => {
  const routeName = route.name as string
  const breadcrumbMap: Record<string, string> = {
    'RequirementList': '需求列表',
    'RequirementDetail': '需求详情',
    'RequirementNew': '新建需求',
    'RequirementEdit': '编辑需求'
  }
  return breadcrumbMap[routeName] || ''
})

/**
 * 搜索需求
 */
const onSearch = (value: string) => {
  console.log('搜索需求:', value)
  // TODO: 实现搜索逻辑
}

/**
 * 创建新需求
 */
const createRequirement = () => {
  router.push('/requirements/new')
}

/**
 * 菜单点击处理
 */
const onMenuClick = ({ key }: { key: string }) => {
  console.log('菜单点击:', key)
  
  // 根据菜单项更新路由查询参数
  const query: Record<string, any> = { ...route.query }
  
  if (key === 'all') {
    delete query.status
    delete query.type
    delete query.priority
  } else if (['pending', 'in-progress', 'testing', 'completed', 'rejected'].includes(key)) {
    query.status = key
    delete query.type
    delete query.priority
  } else if (['feature', 'enhancement', 'bugfix', 'performance'].includes(key)) {
    query.type = key
    delete query.status
    delete query.priority
  } else if (key.endsWith('-priority')) {
    query.priority = key.replace('-priority', '')
    delete query.status
    delete query.type
  }
  
  router.push({ query })
}

/**
 * 刷新数据
 */
const refresh = async () => {
  refreshing.value = true
  try {
    await loadStats()
    message.success('数据已刷新')
  } catch (error) {
    message.error('刷新失败')
  } finally {
    refreshing.value = false
  }
}

/**
 * 导出数据
 */
const exportData = () => {
  message.info('导出功能开发中...')
}

/**
 * 视图模式切换
 */
const onViewModeChange = ({ key }: { key: string }) => {
  console.log('切换视图模式:', key)
  // TODO: 实现视图模式切换
}

/**
 * 加载统计数据
 */
const loadStats = async () => {
  try {
    // TODO: 调用API获取统计数据
    // 模拟数据
    Object.assign(stats, {
      total: 156,
      pending: 23,
      inProgress: 45,
      testing: 12,
      completed: 68,
      rejected: 8
    })
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

/**
 * 根据路由更新选中的菜单项
 */
const updateSelectedKeys = () => {
  const { status, type, priority } = route.query
  
  if (status) {
    selectedKeys.value = [status as string]
  } else if (type) {
    selectedKeys.value = [type as string]
  } else if (priority) {
    selectedKeys.value = [`${priority}-priority`]
  } else {
    selectedKeys.value = ['all']
  }
}

// 监听路由变化
watch(
  () => route.query,
  () => {
    updateSelectedKeys()
  },
  { immediate: true }
)

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.requirement-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.layout-header {
  background: white;
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: #1890ff;
}

.page-description {
  margin: 4px 0 0 0;
  color: #8c8c8c;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.layout-content {
  flex: 1;
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  overflow: hidden;
}

.content-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #f0f0f0;
  flex-shrink: 0;
  overflow-y: auto;
}

.sidebar-menu {
  border-right: none;
  padding: 16px 0;
}

.sidebar-menu :deep(.ant-menu-item) {
  margin: 0;
  padding: 8px 24px;
  height: auto;
  line-height: 1.5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-menu :deep(.ant-menu-item-group-title) {
  padding: 8px 24px;
  font-size: 12px;
  color: #8c8c8c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sidebar-menu :deep(.ant-menu-item-group-list .ant-menu-item) {
  padding-left: 40px;
}

.content-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-toolbar {
  background: white;
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.toolbar-left {
  flex: 1;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.main-content {
  flex: 1;
  overflow: auto;
  background: #f5f5f5;
}

@media (max-width: 1200px) {
  .layout-content {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .layout-header {
    padding: 12px 16px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .header-actions .ant-input-search {
    width: 200px !important;
  }
  
  .content-sidebar {
    width: 240px;
  }
  
  .main-toolbar {
    padding: 8px 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .toolbar-right {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .content-sidebar {
    display: none;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions .ant-input-search {
    width: 100% !important;
  }
}
</style>