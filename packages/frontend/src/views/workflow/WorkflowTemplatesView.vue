<template>
  <div class="workflow-templates">
    <!-- 头部操作栏 -->
    <div class="header-actions">
      <div class="header-left">
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索流程模板..."
          style="width: 300px"
          @search="handleSearch"
        />
        
        <a-select
          v-model:value="categoryFilter"
          placeholder="选择分类"
          style="width: 150px; margin-left: 12px"
          allow-clear
          @change="handleCategoryChange"
        >
          <a-select-option value="">全部分类</a-select-option>
          <a-select-option value="approval">审批流程</a-select-option>
          <a-select-option value="business">业务流程</a-select-option>
          <a-select-option value="hr">人事流程</a-select-option>
          <a-select-option value="finance">财务流程</a-select-option>
          <a-select-option value="project">项目流程</a-select-option>
          <a-select-option value="custom">自定义</a-select-option>
        </a-select>
        
        <a-select
          v-model:value="statusFilter"
          placeholder="选择状态"
          style="width: 120px; margin-left: 12px"
          allow-clear
          @change="handleStatusChange"
        >
          <a-select-option value="">全部状态</a-select-option>
          <a-select-option value="active">启用</a-select-option>
          <a-select-option value="inactive">禁用</a-select-option>
          <a-select-option value="draft">草稿</a-select-option>
        </a-select>
      </div>
      
      <div class="header-right">
        <a-space>
          <a-tooltip title="刷新">
            <a-button @click="handleRefresh" :loading="loading">
              <ReloadOutlined />
            </a-button>
          </a-tooltip>
          
          <a-dropdown>
            <template #overlay>
              <a-menu @click="handleBatchAction">
                <a-menu-item key="enable">
                  <CheckCircleOutlined />
                  批量启用
                </a-menu-item>
                <a-menu-item key="disable">
                  <StopOutlined />
                  批量禁用
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="export">
                  <ExportOutlined />
                  导出模板
                </a-menu-item>
                <a-menu-item key="delete" danger>
                  <DeleteOutlined />
                  批量删除
                </a-menu-item>
              </a-menu>
            </template>
            <a-button :disabled="selectedRowKeys.length === 0">
              批量操作
              <DownOutlined />
            </a-button>
          </a-dropdown>
          
          <a-button type="primary" @click="createTemplate">
            <PlusOutlined />
            新建模板
          </a-button>
        </a-space>
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div class="stats-bar">
      <a-row :gutter="[16, 16]">
        <a-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">总模板数</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ stats.active }}</div>
            <div class="stat-label">启用中</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ stats.thisMonth }}</div>
            <div class="stat-label">本月新增</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ stats.popular }}</div>
            <div class="stat-label">热门模板</div>
          </div>
        </a-col>
      </a-row>
    </div>
    
    <!-- 视图切换 -->
    <div class="view-controls">
      <a-radio-group v-model:value="viewMode" @change="handleViewModeChange">
        <a-radio-button value="table">
          <TableOutlined />
          表格视图
        </a-radio-button>
        <a-radio-button value="card">
          <AppstoreOutlined />
          卡片视图
        </a-radio-button>
      </a-radio-group>
      
      <div class="sort-controls">
        <span>排序：</span>
        <a-select
          v-model:value="sortBy"
          style="width: 120px"
          @change="handleSortChange"
        >
          <a-select-option value="createTime">创建时间</a-select-option>
          <a-select-option value="updateTime">更新时间</a-select-option>
          <a-select-option value="usageCount">使用次数</a-select-option>
          <a-select-option value="name">名称</a-select-option>
        </a-select>
        
        <a-button
          type="text"
          @click="toggleSortOrder"
          :icon="sortOrder === 'asc' ? h(SortAscendingOutlined) : h(SortDescendingOutlined)"
        />
      </div>
    </div>
    
    <!-- 表格视图 -->
    <div v-if="viewMode === 'table'" class="table-view">
      <a-table
        :columns="tableColumns"
        :data-source="filteredTemplates"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="template-name-cell">
              <div class="template-icon">
                <component :is="getTemplateIcon(record.category)" />
              </div>
              <div class="template-info">
                <div class="name">{{ record.name }}</div>
                <div class="description">{{ record.description }}</div>
              </div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'category'">
            <a-tag :color="getCategoryColor(record.category)">
              {{ getCategoryName(record.category) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'status'">
            <a-badge
              :status="getStatusBadge(record.status)"
              :text="getStatusText(record.status)"
            />
          </template>
          
          <template v-else-if="column.key === 'usageCount'">
            <div class="usage-cell">
              <span class="count">{{ record.usageCount }}</span>
              <span class="trend" :class="getUsageTrend(record.usageTrend)">
                <component :is="getUsageTrendIcon(record.usageTrend)" />
                {{ record.usageTrend }}%
              </span>
            </div>
          </template>
          
          <template v-else-if="column.key === 'creator'">
            <div class="creator-cell">
              <a-avatar :size="24" :src="record.creator.avatar">
                {{ record.creator.name.charAt(0) }}
              </a-avatar>
              <span class="name">{{ record.creator.name }}</span>
            </div>
          </template>
          
          <template v-else-if="column.key === 'createTime'">
            <div class="time-cell">
              <div class="date">{{ formatDate(record.createTime) }}</div>
              <div class="relative">{{ formatRelativeTime(record.createTime) }}</div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-tooltip title="启动流程">
                <a-button
                  type="text"
                  size="small"
                  @click="startProcess(record)"
                  :disabled="record.status !== 'active'"
                >
                  <PlayCircleOutlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="编辑">
                <a-button type="text" size="small" @click="editTemplate(record)">
                  <EditOutlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="复制">
                <a-button type="text" size="small" @click="copyTemplate(record)">
                  <CopyOutlined />
                </a-button>
              </a-tooltip>
              
              <a-dropdown>
                <template #overlay>
                  <a-menu @click="({ key }) => handleTemplateAction(key, record)">
                    <a-menu-item key="view">
                      <EyeOutlined />
                      查看详情
                    </a-menu-item>
                    <a-menu-item key="export">
                      <ExportOutlined />
                      导出模板
                    </a-menu-item>
                    <a-menu-item key="version">
                      <BranchesOutlined />
                      版本管理
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="enable" v-if="record.status !== 'active'">
                      <CheckCircleOutlined />
                      启用
                    </a-menu-item>
                    <a-menu-item key="disable" v-if="record.status === 'active'">
                      <StopOutlined />
                      禁用
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="delete" danger>
                      <DeleteOutlined />
                      删除
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="text" size="small">
                  <MoreOutlined />
                </a-button>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>
    
    <!-- 卡片视图 -->
    <div v-else class="card-view">
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="template in filteredTemplates"
          :key="template.id"
          :xs="24"
          :sm="12"
          :lg="8"
          :xl="6"
        >
          <a-card
            class="template-card"
            :class="{ selected: selectedRowKeys.includes(template.id) }"
            @click="toggleCardSelection(template.id)"
          >
            <template #cover>
              <div class="card-cover">
                <div class="template-icon-large">
                  <component :is="getTemplateIcon(template.category)" />
                </div>
                <div class="template-status">
                  <a-badge
                    :status="getStatusBadge(template.status)"
                    :text="getStatusText(template.status)"
                  />
                </div>
              </div>
            </template>
            
            <template #actions>
              <a-tooltip title="启动流程">
                <PlayCircleOutlined
                  @click.stop="startProcess(template)"
                  :class="{ disabled: template.status !== 'active' }"
                />
              </a-tooltip>
              
              <a-tooltip title="编辑">
                <EditOutlined @click.stop="editTemplate(template)" />
              </a-tooltip>
              
              <a-tooltip title="复制">
                <CopyOutlined @click.stop="copyTemplate(template)" />
              </a-tooltip>
              
              <a-dropdown @click.stop>
                <template #overlay>
                  <a-menu @click="({ key }) => handleTemplateAction(key, template)">
                    <a-menu-item key="view">
                      <EyeOutlined />
                      查看详情
                    </a-menu-item>
                    <a-menu-item key="export">
                      <ExportOutlined />
                      导出模板
                    </a-menu-item>
                    <a-menu-item key="version">
                      <BranchesOutlined />
                      版本管理
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="enable" v-if="template.status !== 'active'">
                      <CheckCircleOutlined />
                      启用
                    </a-menu-item>
                    <a-menu-item key="disable" v-if="template.status === 'active'">
                      <StopOutlined />
                      禁用
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="delete" danger>
                      <DeleteOutlined />
                      删除
                    </a-menu-item>
                  </a-menu>
                </template>
                <MoreOutlined />
              </a-dropdown>
            </template>
            
            <a-card-meta
              :title="template.name"
              :description="template.description"
            />
            
            <div class="card-content">
              <div class="template-meta">
                <a-tag :color="getCategoryColor(template.category)" size="small">
                  {{ getCategoryName(template.category) }}
                </a-tag>
                
                <div class="usage-info">
                  <PlayCircleOutlined />
                  {{ template.usageCount }}次使用
                </div>
              </div>
              
              <div class="template-footer">
                <div class="creator">
                  <a-avatar :size="20" :src="template.creator.avatar">
                    {{ template.creator.name.charAt(0) }}
                  </a-avatar>
                  <span>{{ template.creator.name }}</span>
                </div>
                
                <div class="create-time">
                  {{ formatRelativeTime(template.createTime) }}
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
      
      <!-- 卡片视图分页 -->
      <div class="card-pagination">
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :show-size-changer="true"
          :show-quick-jumper="true"
          :show-total="(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`"
          @change="handlePageChange"
        />
      </div>
    </div>
    
    <!-- 模板详情模态框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="模板详情"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedTemplate" class="template-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="模板名称">
            {{ selectedTemplate.name }}
          </a-descriptions-item>
          
          <a-descriptions-item label="模板分类">
            <a-tag :color="getCategoryColor(selectedTemplate.category)">
              {{ getCategoryName(selectedTemplate.category) }}
            </a-tag>
          </a-descriptions-item>
          
          <a-descriptions-item label="模板状态">
            <a-badge
              :status="getStatusBadge(selectedTemplate.status)"
              :text="getStatusText(selectedTemplate.status)"
            />
          </a-descriptions-item>
          
          <a-descriptions-item label="使用次数">
            {{ selectedTemplate.usageCount }}
          </a-descriptions-item>
          
          <a-descriptions-item label="创建者">
            <div class="creator-info">
              <a-avatar :size="24" :src="selectedTemplate.creator.avatar">
                {{ selectedTemplate.creator.name.charAt(0) }}
              </a-avatar>
              <span>{{ selectedTemplate.creator.name }}</span>
            </div>
          </a-descriptions-item>
          
          <a-descriptions-item label="创建时间">
            {{ formatDate(selectedTemplate.createTime) }}
          </a-descriptions-item>
          
          <a-descriptions-item label="更新时间">
            {{ formatDate(selectedTemplate.updateTime) }}
          </a-descriptions-item>
          
          <a-descriptions-item label="平均耗时">
            {{ selectedTemplate.avgDuration }}小时
          </a-descriptions-item>
          
          <a-descriptions-item label="模板描述" :span="2">
            {{ selectedTemplate.description }}
          </a-descriptions-item>
          
          <a-descriptions-item label="标签" :span="2">
            <a-space>
              <a-tag v-for="tag in selectedTemplate.tags" :key="tag" color="blue">
                {{ tag }}
              </a-tag>
            </a-space>
          </a-descriptions-item>
        </a-descriptions>
        
        <div class="detail-actions">
          <a-space>
            <a-button type="primary" @click="startProcess(selectedTemplate)">
              <PlayCircleOutlined />
              启动流程
            </a-button>
            
            <a-button @click="editTemplate(selectedTemplate)">
              <EditOutlined />
              编辑模板
            </a-button>
            
            <a-button @click="copyTemplate(selectedTemplate)">
              <CopyOutlined />
              复制模板
            </a-button>
            
            <a-button @click="exportTemplate(selectedTemplate)">
              <ExportOutlined />
              导出模板
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  ReloadOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ExportOutlined,
  DeleteOutlined,
  DownOutlined,
  PlusOutlined,
  TableOutlined,
  AppstoreOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  PlayCircleOutlined,
  EditOutlined,
  CopyOutlined,
  EyeOutlined,
  BranchesOutlined,
  MoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  TeamOutlined,
  ShoppingOutlined,
  FileProtectOutlined,
  ProjectOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

// 扩展dayjs
dayjs.extend(relativeTime)

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const viewMode = ref('table')
const sortBy = ref('createTime')
const sortOrder = ref('desc')
const selectedRowKeys = ref([])
const detailModalVisible = ref(false)
const selectedTemplate = ref(null)

// 统计数据
const stats = reactive({
  total: 48,
  active: 36,
  thisMonth: 8,
  popular: 12
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 48,
  showSizeChanger: true,
  showQuickJumper: true
})

// 模板数据
const templates = ref([
  {
    id: '1',
    name: '请假申请流程',
    description: '员工请假申请审批流程，支持年假、病假、事假等多种类型',
    category: 'hr',
    status: 'active',
    usageCount: 156,
    usageTrend: 12,
    avgDuration: 4,
    creator: {
      id: 'user1',
      name: '张三',
      avatar: ''
    },
    createTime: new Date('2024-01-15'),
    updateTime: new Date('2024-01-20'),
    tags: ['审批', '人事', '自动化']
  },
  {
    id: '2',
    name: '采购申请流程',
    description: '物品采购申请审批流程，包含预算审核、供应商选择等环节',
    category: 'finance',
    status: 'active',
    usageCount: 89,
    usageTrend: -5,
    avgDuration: 12,
    creator: {
      id: 'user2',
      name: '李四',
      avatar: ''
    },
    createTime: new Date('2024-01-10'),
    updateTime: new Date('2024-01-18'),
    tags: ['采购', '财务', '审批']
  },
  {
    id: '3',
    name: '合同审批流程',
    description: '合同签署审批流程，支持多级审批和法务审核',
    category: 'business',
    status: 'active',
    usageCount: 67,
    usageTrend: 8,
    avgDuration: 24,
    creator: {
      id: 'user3',
      name: '王五',
      avatar: ''
    },
    createTime: new Date('2024-01-08'),
    updateTime: new Date('2024-01-16'),
    tags: ['合同', '法务', '审批']
  },
  {
    id: '4',
    name: '项目立项流程',
    description: '新项目立项审批流程，包含可行性分析、资源评估等',
    category: 'project',
    status: 'draft',
    usageCount: 34,
    usageTrend: 15,
    avgDuration: 48,
    creator: {
      id: 'user4',
      name: '赵六',
      avatar: ''
    },
    createTime: new Date('2024-01-05'),
    updateTime: new Date('2024-01-12'),
    tags: ['项目', '立项', '评估']
  },
  {
    id: '5',
    name: '员工入职流程',
    description: '新员工入职办理流程，包含资料收集、账号开通等',
    category: 'hr',
    status: 'active',
    usageCount: 123,
    usageTrend: 20,
    avgDuration: 8,
    creator: {
      id: 'user5',
      name: '孙七',
      avatar: ''
    },
    createTime: new Date('2024-01-03'),
    updateTime: new Date('2024-01-10'),
    tags: ['入职', '人事', '自动化']
  },
  {
    id: '6',
    name: '报销申请流程',
    description: '员工报销申请审批流程，支持差旅、办公等多种费用类型',
    category: 'finance',
    status: 'inactive',
    usageCount: 78,
    usageTrend: -10,
    avgDuration: 6,
    creator: {
      id: 'user6',
      name: '周八',
      avatar: ''
    },
    createTime: new Date('2024-01-01'),
    updateTime: new Date('2024-01-08'),
    tags: ['报销', '财务', '审批']
  }
])

// 表格列配置
const tableColumns = [
  {
    title: '模板名称',
    key: 'name',
    width: 300,
    fixed: 'left'
  },
  {
    title: '分类',
    key: 'category',
    width: 120
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '使用次数',
    key: 'usageCount',
    width: 120,
    sorter: true
  },
  {
    title: '创建者',
    key: 'creator',
    width: 120
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 150,
    sorter: true
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 行选择配置
const rowSelection = {
  selectedRowKeys,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
  },
  onSelectAll: (selected: boolean, selectedRows: any[], changeRows: any[]) => {
    console.log('选择全部:', selected, selectedRows, changeRows)
  }
}

// 计算属性
/**
 * 过滤后的模板列表
 */
const filteredTemplates = computed(() => {
  let result = [...templates.value]
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(template => 
      template.name.toLowerCase().includes(keyword) ||
      template.description.toLowerCase().includes(keyword) ||
      template.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }
  
  // 分类过滤
  if (categoryFilter.value) {
    result = result.filter(template => template.category === categoryFilter.value)
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(template => template.status === statusFilter.value)
  }
  
  // 排序
  result.sort((a, b) => {
    let aValue = a[sortBy.value]
    let bValue = b[sortBy.value]
    
    if (sortBy.value === 'createTime' || sortBy.value === 'updateTime') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }
    
    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
  
  return result
})

// 方法
/**
 * 获取模板图标
 */
const getTemplateIcon = (category: string) => {
  const icons = {
    hr: UserOutlined,
    finance: ShoppingOutlined,
    business: FileProtectOutlined,
    project: ProjectOutlined,
    approval: CheckCircleOutlined,
    custom: FileTextOutlined
  }
  return icons[category] || FileTextOutlined
}

/**
 * 获取分类颜色
 */
const getCategoryColor = (category: string) => {
  const colors = {
    hr: 'orange',
    finance: 'red',
    business: 'green',
    project: 'purple',
    approval: 'blue',
    custom: 'default'
  }
  return colors[category] || 'default'
}

/**
 * 获取分类名称
 */
const getCategoryName = (category: string) => {
  const names = {
    hr: '人事流程',
    finance: '财务流程',
    business: '业务流程',
    project: '项目流程',
    approval: '审批流程',
    custom: '自定义'
  }
  return names[category] || category
}

/**
 * 获取状态徽章
 */
const getStatusBadge = (status: string) => {
  const badges = {
    active: 'success',
    inactive: 'default',
    draft: 'warning'
  }
  return badges[status] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const texts = {
    active: '启用',
    inactive: '禁用',
    draft: '草稿'
  }
  return texts[status] || status
}

/**
 * 获取使用趋势样式
 */
const getUsageTrend = (trend: number) => {
  return trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral'
}

/**
 * 获取使用趋势图标
 */
const getUsageTrendIcon = (trend: number) => {
  return trend > 0 ? ArrowUpOutlined : trend < 0 ? ArrowDownOutlined : null
}

/**
 * 格式化日期
 */
const formatDate = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

/**
 * 格式化相对时间
 */
const formatRelativeTime = (date: Date) => {
  return dayjs(date).fromNow()
}

/**
 * 搜索处理
 */
const handleSearch = (value: string) => {
  searchKeyword.value = value
  pagination.current = 1
}

/**
 * 分类变更处理
 */
const handleCategoryChange = () => {
  pagination.current = 1
}

/**
 * 状态变更处理
 */
const handleStatusChange = () => {
  pagination.current = 1
}

/**
 * 刷新处理
 */
const handleRefresh = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('刷新成功')
  } catch (error) {
    message.error('刷新失败')
  } finally {
    loading.value = false
  }
}

/**
 * 批量操作处理
 */
const handleBatchAction = ({ key }: { key: string }) => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要操作的模板')
    return
  }
  
  switch (key) {
    case 'enable':
      message.success(`已启用 ${selectedRowKeys.value.length} 个模板`)
      break
    case 'disable':
      message.success(`已禁用 ${selectedRowKeys.value.length} 个模板`)
      break
    case 'export':
      message.success(`正在导出 ${selectedRowKeys.value.length} 个模板`)
      break
    case 'delete':
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除选中的 ${selectedRowKeys.value.length} 个模板吗？`,
        onOk: () => {
          message.success(`已删除 ${selectedRowKeys.value.length} 个模板`)
          selectedRowKeys.value = []
        }
      })
      break
  }
}

/**
 * 创建模板
 */
const createTemplate = () => {
  router.push('/workflow/designer')
}

/**
 * 视图模式变更
 */
const handleViewModeChange = () => {
  // 视图切换逻辑
}

/**
 * 排序变更
 */
const handleSortChange = () => {
  // 排序逻辑
}

/**
 * 切换排序顺序
 */
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

/**
 * 表格变更处理
 */
const handleTableChange = (pag: any, filters: any, sorter: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  
  if (sorter.field) {
    sortBy.value = sorter.field
    sortOrder.value = sorter.order === 'ascend' ? 'asc' : 'desc'
  }
}

/**
 * 页面变更处理
 */
const handlePageChange = (page: number, pageSize: number) => {
  pagination.current = page
  pagination.pageSize = pageSize
}

/**
 * 切换卡片选择
 */
const toggleCardSelection = (id: string) => {
  const index = selectedRowKeys.value.indexOf(id)
  if (index > -1) {
    selectedRowKeys.value.splice(index, 1)
  } else {
    selectedRowKeys.value.push(id)
  }
}

/**
 * 启动流程
 */
const startProcess = (template: any) => {
  if (template.status !== 'active') {
    message.warning('只能启动已启用的模板')
    return
  }
  
  message.success(`启动流程: ${template.name}`)
  router.push(`/workflow/instances/new?template=${template.id}`)
}

/**
 * 编辑模板
 */
const editTemplate = (template: any) => {
  router.push(`/workflow/designer/${template.id}`)
}

/**
 * 复制模板
 */
const copyTemplate = (template: any) => {
  message.success(`复制模板: ${template.name}`)
  router.push(`/workflow/designer?copy=${template.id}`)
}

/**
 * 导出模板
 */
const exportTemplate = (template: any) => {
  message.success(`导出模板: ${template.name}`)
}

/**
 * 模板操作处理
 */
const handleTemplateAction = (key: string, template: any) => {
  switch (key) {
    case 'view':
      selectedTemplate.value = template
      detailModalVisible.value = true
      break
    case 'export':
      exportTemplate(template)
      break
    case 'version':
      message.info('版本管理功能开发中')
      break
    case 'enable':
      message.success(`已启用模板: ${template.name}`)
      template.status = 'active'
      break
    case 'disable':
      message.success(`已禁用模板: ${template.name}`)
      template.status = 'inactive'
      break
    case 'delete':
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除模板 "${template.name}" 吗？`,
        onOk: () => {
          message.success(`已删除模板: ${template.name}`)
          const index = templates.value.findIndex(t => t.id === template.id)
          if (index > -1) {
            templates.value.splice(index, 1)
          }
        }
      })
      break
  }
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.workflow-templates {
  padding: 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  flex-shrink: 0;
}

.stats-bar {
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
}

.view-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.table-view {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.template-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.template-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #1890ff;
}

.template-info .name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.template-info .description {
  font-size: 12px;
  color: #8c8c8c;
}

.usage-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.usage-cell .count {
  font-weight: 500;
  color: #262626;
}

.usage-cell .trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.usage-cell .trend.positive {
  color: #52c41a;
}

.usage-cell .trend.negative {
  color: #ff4d4f;
}

.usage-cell .trend.neutral {
  color: #8c8c8c;
}

.creator-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.creator-cell .name {
  font-size: 14px;
  color: #262626;
}

.time-cell .date {
  font-size: 14px;
  color: #262626;
  margin-bottom: 2px;
}

.time-cell .relative {
  font-size: 12px;
  color: #8c8c8c;
}

.card-view {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.template-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.template-card.selected {
  border-color: #1890ff;
}

.card-cover {
  height: 120px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.template-icon-large {
  font-size: 36px;
  color: #1890ff;
}

.template-status {
  position: absolute;
  top: 12px;
  right: 12px;
}

.card-content {
  margin-top: 16px;
}

.template-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.usage-info {
  font-size: 12px;
  color: #8c8c8c;
  display: flex;
  align-items: center;
  gap: 4px;
}

.template-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #8c8c8c;
}

.creator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-pagination {
  margin-top: 24px;
  text-align: center;
}

.template-detail {
  padding: 16px 0;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-actions {
  margin-top: 24px;
  text-align: center;
}

/* 卡片操作图标样式 */
:deep(.ant-card-actions > li) {
  margin: 0;
}

:deep(.ant-card-actions > li > span) {
  cursor: pointer;
  color: #8c8c8c;
  transition: color 0.3s ease;
}

:deep(.ant-card-actions > li > span:hover) {
  color: #1890ff;
}

:deep(.ant-card-actions > li > span.disabled) {
  color: #d9d9d9;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .header-left {
    flex-direction: column;
    gap: 8px;
  }
  
  .view-controls {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .sort-controls {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .stats-bar :deep(.ant-col) {
    margin-bottom: 12px;
  }
  
  .template-footer {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-actions,
.stats-bar,
.view-controls,
.table-view,
.card-view {
  animation: fadeInUp 0.6s ease-out;
}

.template-card {
  animation: fadeInUp 0.6s ease-out;
}

.template-card:nth-child(1) { animation-delay: 0.1s; }
.template-card:nth-child(2) { animation-delay: 0.2s; }
.template-card:nth-child(3) { animation-delay: 0.3s; }
.template-card:nth-child(4) { animation-delay: 0.4s; }
</style>