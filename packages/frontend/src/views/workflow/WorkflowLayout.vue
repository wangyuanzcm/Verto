<template>
  <div class="workflow-layout">
    <!-- 侧边栏 -->
    <div class="workflow-sidebar">
      <div class="sidebar-header">
        <h3 class="sidebar-title">
          <ApartmentOutlined />
          工作流管理
        </h3>
      </div>
      
      <div class="sidebar-content">
        <a-menu
          v-model:selected-keys="selectedMenuKeys"
          mode="inline"
          :inline-collapsed="false"
          @click="handleMenuClick"
        >
          <a-menu-item key="overview">
            <DashboardOutlined />
            <span>工作流概览</span>
          </a-menu-item>
          
          <a-menu-item key="templates">
            <FileTextOutlined />
            <span>流程模板</span>
          </a-menu-item>
          
          <a-menu-item key="instances">
            <PlayCircleOutlined />
            <span>流程实例</span>
          </a-menu-item>
          
          <a-menu-item key="tasks">
            <CheckSquareOutlined />
            <span>我的任务</span>
          </a-menu-item>
          
          <a-menu-item key="approvals">
            <AuditOutlined />
            <span>待审批</span>
          </a-menu-item>
          
          <a-menu-divider />
          
          <a-sub-menu key="design" title="流程设计">
            <template #icon>
              <DesktopOutlined />
            </template>
            
            <a-menu-item key="designer">
              <EditOutlined />
              <span>流程设计器</span>
            </a-menu-item>
            
            <a-menu-item key="forms">
              <FormOutlined />
              <span>表单设计</span>
            </a-menu-item>
            
            <a-menu-item key="rules">
              <SettingOutlined />
              <span>业务规则</span>
            </a-menu-item>
          </a-sub-menu>
          
          <a-sub-menu key="monitor" title="监控分析">
            <template #icon>
              <BarChartOutlined />
            </template>
            
            <a-menu-item key="analytics">
              <LineChartOutlined />
              <span>流程分析</span>
            </a-menu-item>
            
            <a-menu-item key="performance">
              <DashboardOutlined />
              <span>性能监控</span>
            </a-menu-item>
            
            <a-menu-item key="logs">
              <FileSearchOutlined />
              <span>操作日志</span>
            </a-menu-item>
          </a-sub-menu>
          
          <a-menu-divider />
          
          <a-menu-item key="settings">
            <SettingOutlined />
            <span>系统设置</span>
          </a-menu-item>
        </a-menu>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="workflow-main">
      <!-- 头部 -->
      <div class="main-header">
        <div class="header-left">
          <!-- 面包屑导航 -->
          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item>
              <HomeOutlined />
              <span>首页</span>
            </a-breadcrumb-item>
            <a-breadcrumb-item>
              <ApartmentOutlined />
              <span>工作流管理</span>
            </a-breadcrumb-item>
            <a-breadcrumb-item v-if="currentPageTitle">
              {{ currentPageTitle }}
            </a-breadcrumb-item>
          </a-breadcrumb>
          
          <!-- 页面标题 -->
          <h1 class="page-title">{{ currentPageTitle || '工作流概览' }}</h1>
        </div>
        
        <div class="header-right">
          <!-- 工具栏 -->
          <a-space>
            <a-tooltip title="刷新">
              <a-button @click="handleRefresh" :loading="refreshLoading">
                <ReloadOutlined />
              </a-button>
            </a-tooltip>
            
            <a-tooltip title="全屏">
              <a-button @click="toggleFullscreen">
                <FullscreenOutlined v-if="!isFullscreen" />
                <FullscreenExitOutlined v-else />
              </a-button>
            </a-tooltip>
            
            <a-dropdown>
              <template #overlay>
                <a-menu @click="handleQuickAction">
                  <a-menu-item key="new-template">
                    <PlusOutlined />
                    新建流程模板
                  </a-menu-item>
                  <a-menu-item key="new-instance">
                    <PlayCircleOutlined />
                    启动流程实例
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="import">
                    <ImportOutlined />
                    导入流程
                  </a-menu-item>
                  <a-menu-item key="export">
                    <ExportOutlined />
                    导出流程
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="help">
                    <QuestionCircleOutlined />
                    帮助文档
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button>
                快速操作
                <DownOutlined />
              </a-button>
            </a-dropdown>
          </a-space>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
    
    <!-- 新建流程模板模态框 -->
    <a-modal
      v-model:open="newTemplateModalVisible"
      title="新建流程模板"
      width="600px"
      @ok="handleCreateTemplate"
      @cancel="resetTemplateForm"
      :confirm-loading="createLoading"
    >
      <a-form
        ref="templateFormRef"
        :model="templateForm"
        :rules="templateRules"
        layout="vertical"
      >
        <a-row :gutter="[16, 0]">
          <a-col :span="12">
            <a-form-item label="模板名称" name="name">
              <a-input
                v-model:value="templateForm.name"
                placeholder="请输入模板名称"
              />
            </a-form-item>
          </a-col>
          
          <a-col :span="12">
            <a-form-item label="模板分类" name="category">
              <a-select
                v-model:value="templateForm.category"
                placeholder="选择模板分类"
              >
                <a-select-option value="approval">审批流程</a-select-option>
                <a-select-option value="business">业务流程</a-select-option>
                <a-select-option value="hr">人事流程</a-select-option>
                <a-select-option value="finance">财务流程</a-select-option>
                <a-select-option value="project">项目流程</a-select-option>
                <a-select-option value="custom">自定义</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="模板描述" name="description">
          <a-textarea
            v-model:value="templateForm.description"
            placeholder="请输入模板描述"
            :rows="3"
            :max-length="200"
            show-count
          />
        </a-form-item>
        
        <a-row :gutter="[16, 0]">
          <a-col :span="12">
            <a-form-item label="优先级" name="priority">
              <a-select
                v-model:value="templateForm.priority"
                placeholder="选择优先级"
              >
                <a-select-option value="low">低</a-select-option>
                <a-select-option value="medium">中</a-select-option>
                <a-select-option value="high">高</a-select-option>
                <a-select-option value="urgent">紧急</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <a-col :span="12">
            <a-form-item label="预计时长" name="estimatedDuration">
              <a-input-number
                v-model:value="templateForm.estimatedDuration"
                placeholder="预计时长（小时）"
                :min="1"
                :max="720"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="标签">
          <a-select
            v-model:value="templateForm.tags"
            mode="tags"
            placeholder="添加标签（回车确认）"
            :max-tag-count="5"
          >
            <a-select-option value="审批">审批</a-select-option>
            <a-select-option value="自动化">自动化</a-select-option>
            <a-select-option value="通知">通知</a-select-option>
            <a-select-option value="条件">条件</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="模板设置">
          <a-space direction="vertical" style="width: 100%">
            <a-checkbox v-model:checked="templateForm.isPublic">
              公开模板（其他用户可以使用此模板）
            </a-checkbox>
            <a-checkbox v-model:checked="templateForm.allowCopy">
              允许复制（其他用户可以复制此模板）
            </a-checkbox>
            <a-checkbox v-model:checked="templateForm.enableNotification">
              启用通知（流程状态变更时发送通知）
            </a-checkbox>
          </a-space>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 启动流程实例模态框 -->
    <a-modal
      v-model:open="newInstanceModalVisible"
      title="启动流程实例"
      width="500px"
      @ok="handleStartInstance"
      @cancel="resetInstanceForm"
      :confirm-loading="startLoading"
    >
      <a-form
        ref="instanceFormRef"
        :model="instanceForm"
        :rules="instanceRules"
        layout="vertical"
      >
        <a-form-item label="选择流程模板" name="templateId">
          <a-select
            v-model:value="instanceForm.templateId"
            placeholder="选择要启动的流程模板"
            show-search
            :filter-option="filterTemplateOption"
          >
            <a-select-option
              v-for="template in availableTemplates"
              :key="template.id"
              :value="template.id"
            >
              <div class="template-option">
                <span class="template-name">{{ template.name }}</span>
                <a-tag :color="getTemplateCategoryColor(template.category)" size="small">
                  {{ getTemplateCategoryName(template.category) }}
                </a-tag>
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="实例标题" name="title">
          <a-input
            v-model:value="instanceForm.title"
            placeholder="请输入实例标题"
          />
        </a-form-item>
        
        <a-form-item label="实例描述" name="description">
          <a-textarea
            v-model:value="instanceForm.description"
            placeholder="请输入实例描述（可选）"
            :rows="3"
            :max-length="200"
            show-count
          />
        </a-form-item>
        
        <a-form-item label="优先级" name="priority">
          <a-radio-group v-model:value="instanceForm.priority">
            <a-radio value="low">低</a-radio>
            <a-radio value="medium">中</a-radio>
            <a-radio value="high">高</a-radio>
            <a-radio value="urgent">紧急</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="预期完成时间" name="expectedCompletionTime">
          <a-date-picker
            v-model:value="instanceForm.expectedCompletionTime"
            placeholder="选择预期完成时间"
            style="width: 100%"
            :disabled-date="disabledDate"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ApartmentOutlined,
  DashboardOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  CheckSquareOutlined,
  AuditOutlined,
  DesktopOutlined,
  EditOutlined,
  FormOutlined,
  SettingOutlined,
  BarChartOutlined,
  LineChartOutlined,
  FileSearchOutlined,
  HomeOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  DownOutlined,
  PlusOutlined,
  ImportOutlined,
  ExportOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 路由
const router = useRouter()
const route = useRoute()

// 响应式数据
const refreshLoading = ref(false)
const createLoading = ref(false)
const startLoading = ref(false)
const isFullscreen = ref(false)
const newTemplateModalVisible = ref(false)
const newInstanceModalVisible = ref(false)
const selectedMenuKeys = ref(['overview'])

// 表单引用
const templateFormRef = ref()
const instanceFormRef = ref()

// 流程模板表单
const templateForm = reactive({
  name: '',
  category: '',
  description: '',
  priority: 'medium',
  estimatedDuration: 24,
  tags: [],
  isPublic: false,
  allowCopy: true,
  enableNotification: true
})

// 流程实例表单
const instanceForm = reactive({
  templateId: '',
  title: '',
  description: '',
  priority: 'medium',
  expectedCompletionTime: null
})

// 表单验证规则
const templateRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 2, max: 50, message: '模板名称长度为2-50个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择模板分类', trigger: 'change' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ]
}

const instanceRules = {
  templateId: [
    { required: true, message: '请选择流程模板', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入实例标题', trigger: 'blur' },
    { min: 2, max: 100, message: '实例标题长度为2-100个字符', trigger: 'blur' }
  ]
}

// 可用的流程模板
const availableTemplates = ref([
  {
    id: '1',
    name: '请假申请流程',
    category: 'hr',
    description: '员工请假申请审批流程'
  },
  {
    id: '2',
    name: '采购申请流程',
    category: 'finance',
    description: '物品采购申请审批流程'
  },
  {
    id: '3',
    name: '项目立项流程',
    category: 'project',
    description: '新项目立项审批流程'
  },
  {
    id: '4',
    name: '合同审批流程',
    category: 'business',
    description: '合同签署审批流程'
  }
])

// 计算属性
/**
 * 当前页面标题
 */
const currentPageTitle = computed(() => {
  const titleMap = {
    overview: '工作流概览',
    templates: '流程模板',
    instances: '流程实例',
    tasks: '我的任务',
    approvals: '待审批',
    designer: '流程设计器',
    forms: '表单设计',
    rules: '业务规则',
    analytics: '流程分析',
    performance: '性能监控',
    logs: '操作日志',
    settings: '系统设置'
  }
  
  const currentKey = selectedMenuKeys.value[0]
  return titleMap[currentKey] || ''
})

// 方法
/**
 * 获取模板分类颜色
 */
const getTemplateCategoryColor = (category: string) => {
  const colors = {
    approval: 'blue',
    business: 'green',
    hr: 'orange',
    finance: 'red',
    project: 'purple',
    custom: 'default'
  }
  return colors[category] || 'default'
}

/**
 * 获取模板分类名称
 */
const getTemplateCategoryName = (category: string) => {
  const names = {
    approval: '审批流程',
    business: '业务流程',
    hr: '人事流程',
    finance: '财务流程',
    project: '项目流程',
    custom: '自定义'
  }
  return names[category] || category
}

/**
 * 菜单点击处理
 */
const handleMenuClick = ({ key }: { key: string }) => {
  selectedMenuKeys.value = [key]
  
  // 根据菜单项导航到对应路由
  const routeMap = {
    overview: '/workflow/overview',
    templates: '/workflow/templates',
    instances: '/workflow/instances',
    tasks: '/workflow/tasks',
    approvals: '/workflow/approvals',
    designer: '/workflow/designer',
    forms: '/workflow/forms',
    rules: '/workflow/rules',
    analytics: '/workflow/analytics',
    performance: '/workflow/performance',
    logs: '/workflow/logs',
    settings: '/workflow/settings'
  }
  
  const targetRoute = routeMap[key]
  if (targetRoute && route.path !== targetRoute) {
    router.push(targetRoute)
  }
}

/**
 * 刷新处理
 */
const handleRefresh = async () => {
  refreshLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('页面已刷新')
  } catch (error) {
    message.error('刷新失败')
  } finally {
    refreshLoading.value = false
  }
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
 * 快速操作处理
 */
const handleQuickAction = ({ key }: { key: string }) => {
  switch (key) {
    case 'new-template':
      newTemplateModalVisible.value = true
      break
    case 'new-instance':
      newInstanceModalVisible.value = true
      break
    case 'import':
      message.info('导入流程功能开发中')
      break
    case 'export':
      message.info('导出流程功能开发中')
      break
    case 'help':
      message.info('帮助文档功能开发中')
      break
  }
}

/**
 * 创建流程模板
 */
const handleCreateTemplate = async () => {
  try {
    await templateFormRef.value.validate()
    createLoading.value = true
    
    // 模拟创建请求
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    message.success(`流程模板 ${templateForm.name} 创建成功`)
    newTemplateModalVisible.value = false
    resetTemplateForm()
    
    // 跳转到流程设计器
    router.push('/workflow/designer')
  } catch (error) {
    console.error('创建失败:', error)
  } finally {
    createLoading.value = false
  }
}

/**
 * 启动流程实例
 */
const handleStartInstance = async () => {
  try {
    await instanceFormRef.value.validate()
    startLoading.value = true
    
    // 模拟启动请求
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    message.success(`流程实例 ${instanceForm.title} 启动成功`)
    newInstanceModalVisible.value = false
    resetInstanceForm()
    
    // 跳转到流程实例页面
    router.push('/workflow/instances')
  } catch (error) {
    console.error('启动失败:', error)
  } finally {
    startLoading.value = false
  }
}

/**
 * 重置模板表单
 */
const resetTemplateForm = () => {
  templateFormRef.value?.resetFields()
  Object.assign(templateForm, {
    name: '',
    category: '',
    description: '',
    priority: 'medium',
    estimatedDuration: 24,
    tags: [],
    isPublic: false,
    allowCopy: true,
    enableNotification: true
  })
}

/**
 * 重置实例表单
 */
const resetInstanceForm = () => {
  instanceFormRef.value?.resetFields()
  Object.assign(instanceForm, {
    templateId: '',
    title: '',
    description: '',
    priority: 'medium',
    expectedCompletionTime: null
  })
}

/**
 * 过滤模板选项
 */
const filterTemplateOption = (input: string, option: any) => {
  const template = availableTemplates.value.find(t => t.id === option.value)
  if (!template) return false
  
  return template.name.toLowerCase().includes(input.toLowerCase()) ||
         template.description.toLowerCase().includes(input.toLowerCase())
}

/**
 * 禁用日期（不能选择过去的日期）
 */
const disabledDate = (current: any) => {
  return current && current < dayjs().startOf('day')
}

/**
 * 监听全屏状态变化
 */
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 生命周期
onMounted(() => {
  // 监听全屏状态变化
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  
  // 根据当前路由设置选中的菜单项
  const pathToKeyMap = {
    '/workflow/overview': 'overview',
    '/workflow/templates': 'templates',
    '/workflow/instances': 'instances',
    '/workflow/tasks': 'tasks',
    '/workflow/approvals': 'approvals',
    '/workflow/designer': 'designer',
    '/workflow/forms': 'forms',
    '/workflow/rules': 'rules',
    '/workflow/analytics': 'analytics',
    '/workflow/performance': 'performance',
    '/workflow/logs': 'logs',
    '/workflow/settings': 'settings'
  }
  
  const currentKey = pathToKeyMap[route.path] || 'overview'
  selectedMenuKeys.value = [currentKey]
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.workflow-layout {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

.workflow-sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-content {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.workflow-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-header {
  background: white;
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.breadcrumb {
  margin-bottom: 8px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

.header-right {
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.template-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.template-name {
  flex: 1;
  min-width: 0;
  margin-right: 8px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 菜单样式优化 */
:deep(.ant-menu) {
  border-right: none;
}

:deep(.ant-menu-item) {
  margin: 4px 16px;
  border-radius: 6px;
  height: 40px;
  line-height: 40px;
}

:deep(.ant-menu-item-selected) {
  background-color: #e6f7ff;
  color: #1890ff;
}

:deep(.ant-menu-item:hover) {
  background-color: #f5f5f5;
}

:deep(.ant-menu-submenu-title) {
  margin: 4px 16px;
  border-radius: 6px;
  height: 40px;
  line-height: 40px;
}

:deep(.ant-menu-submenu-title:hover) {
  background-color: #f5f5f5;
}

:deep(.ant-menu-sub) {
  background: transparent;
}

:deep(.ant-menu-sub .ant-menu-item) {
  margin: 2px 32px;
  height: 36px;
  line-height: 36px;
}

/* 面包屑样式优化 */
:deep(.ant-breadcrumb) {
  font-size: 14px;
}

:deep(.ant-breadcrumb-link) {
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.ant-breadcrumb-link:hover) {
  color: #1890ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .workflow-sidebar {
    width: 200px;
  }
  
  .main-header {
    padding: 12px 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-right {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
}

@media (max-width: 576px) {
  .workflow-layout {
    flex-direction: column;
  }
  
  .workflow-sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .sidebar-content {
    max-height: 200px;
  }
  
  .main-content {
    padding: 12px;
  }
}
</style>