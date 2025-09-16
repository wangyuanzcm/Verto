<template>
  <div class="material-list">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-select
            v-model:value="filters.category"
            placeholder="选择分类"
            style="width: 100%"
            allowClear
            @change="handleFilterChange"
          >
            <a-select-option value="component">组件</a-select-option>
            <a-select-option value="template">模板</a-select-option>
            <a-select-option value="icon">图标</a-select-option>
            <a-select-option value="asset">资源</a-select-option>
          </a-select>
        </a-col>
        
        <a-col :span="6">
          <a-select
            v-model:value="filters.status"
            placeholder="选择状态"
            style="width: 100%"
            allowClear
            @change="handleFilterChange"
          >
            <a-select-option value="draft">草稿</a-select-option>
            <a-select-option value="published">已发布</a-select-option>
            <a-select-option value="deprecated">已废弃</a-select-option>
          </a-select>
        </a-col>
        
        <a-col :span="6">
          <a-select
            v-model:value="filters.framework"
            placeholder="选择框架"
            style="width: 100%"
            allowClear
            @change="handleFilterChange"
          >
            <a-select-option value="vue">Vue</a-select-option>
            <a-select-option value="react">React</a-select-option>
            <a-select-option value="angular">Angular</a-select-option>
            <a-select-option value="vanilla">原生JS</a-select-option>
          </a-select>
        </a-col>
        
        <a-col :span="6">
          <a-space>
            <a-button @click="handleReset">
              <template #icon>
                <ReloadOutlined />
              </template>
              重置
            </a-button>
            <a-button type="primary" @click="handleSearch">
              <template #icon>
                <SearchOutlined />
              </template>
              搜索
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-left">
        <a-space>
          <a-checkbox
            v-model:checked="selectAll"
            :indeterminate="indeterminate"
            @change="handleSelectAll"
          >
            全选
          </a-checkbox>
          <span class="selected-info" v-if="selectedRowKeys.length > 0">
            已选择 {{ selectedRowKeys.length }} 项
          </span>
        </a-space>
      </div>
      
      <div class="action-right">
        <a-space>
          <a-button 
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchPublish"
          >
            <template #icon>
              <CloudUploadOutlined />
            </template>
            批量发布
          </a-button>
          
          <a-button 
            danger
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchDelete"
          >
            <template #icon>
              <DeleteOutlined />
            </template>
            批量删除
          </a-button>
          
          <a-button type="primary" @click="handleCreate">
            <template #icon>
              <PlusOutlined />
            </template>
            新建物料
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 视图切换 -->
    <div class="view-toggle">
      <a-radio-group v-model:value="viewMode" @change="handleViewModeChange">
        <a-radio-button value="table">
          <template #icon>
            <TableOutlined />
          </template>
          表格视图
        </a-radio-button>
        <a-radio-button value="card">
          <template #icon>
            <AppstoreOutlined />
          </template>
          卡片视图
        </a-radio-button>
      </a-radio-group>
    </div>

    <!-- 表格视图 -->
    <div v-if="viewMode === 'table'" class="table-view">
      <a-table
        :columns="columns"
        :data-source="materials"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="material-name">
              <a-avatar :src="record.thumbnail" :size="32" shape="square">
                <template #icon>
                  <FileImageOutlined />
                </template>
              </a-avatar>
              <div class="name-info">
                <a @click="viewDetail(record.id)">{{ record.name }}</a>
                <div class="description">{{ record.description }}</div>
              </div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'category'">
            <a-tag :color="getCategoryColor(record.category)">
              {{ getCategoryText(record.category) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'framework'">
            <a-space>
              <a-tag v-for="fw in record.frameworks" :key="fw" size="small">
                {{ fw }}
              </a-tag>
            </a-space>
          </template>
          
          <template v-else-if="column.key === 'downloads'">
            <span>{{ formatNumber(record.downloads) }}</span>
          </template>
          
          <template v-else-if="column.key === 'updatedAt'">
            <span>{{ formatDate(record.updatedAt) }}</span>
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewDetail(record.id)">
                查看
              </a-button>
              <a-button type="link" size="small" @click="editMaterial(record.id)">
                编辑
              </a-button>
              <a-dropdown>
                <template #overlay>
                  <a-menu @click="({ key }) => handleAction(key, record)">
                    <a-menu-item key="duplicate">
                      <CopyOutlined />
                      复制
                    </a-menu-item>
                    <a-menu-item key="download">
                      <DownloadOutlined />
                      下载
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="publish" v-if="record.status === 'draft'">
                      <CloudUploadOutlined />
                      发布
                    </a-menu-item>
                    <a-menu-item key="unpublish" v-if="record.status === 'published'">
                      <StopOutlined />
                      下架
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="delete" danger>
                      <DeleteOutlined />
                      删除
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="link" size="small">
                  更多
                  <DownOutlined />
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
          v-for="material in materials" 
          :key="material.id"
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="6" 
          :xl="4"
        >
          <a-card
            hoverable
            class="material-card"
            @click="viewDetail(material.id)"
          >
            <template #cover>
              <div class="card-cover">
                <img v-if="material.thumbnail" :src="material.thumbnail" :alt="material.name" />
                <div v-else class="placeholder-cover">
                  <FileImageOutlined />
                </div>
                
                <!-- 选择框 -->
                <a-checkbox
                  class="card-checkbox"
                  :checked="selectedRowKeys.includes(material.id)"
                  @click.stop
                  @change="(e) => handleCardSelect(material.id, e.target.checked)"
                />
                
                <!-- 状态标签 -->
                <a-tag class="status-tag" :color="getStatusColor(material.status)">
                  {{ getStatusText(material.status) }}
                </a-tag>
              </div>
            </template>
            
            <template #actions>
              <EyeOutlined key="view" @click.stop="viewDetail(material.id)" />
              <EditOutlined key="edit" @click.stop="editMaterial(material.id)" />
              <DownloadOutlined key="download" @click.stop="downloadMaterial(material.id)" />
              <a-dropdown @click.stop>
                <template #overlay>
                  <a-menu @click="({ key }) => handleAction(key, material)">
                    <a-menu-item key="duplicate">
                      <CopyOutlined />
                      复制
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="delete" danger>
                      <DeleteOutlined />
                      删除
                    </a-menu-item>
                  </a-menu>
                </template>
                <MoreOutlined key="more" />
              </a-dropdown>
            </template>
            
            <a-card-meta
              :title="material.name"
              :description="material.description"
            />
            
            <div class="card-footer">
              <div class="card-tags">
                <a-tag :color="getCategoryColor(material.category)" size="small">
                  {{ getCategoryText(material.category) }}
                </a-tag>
                <a-tag v-for="fw in material.frameworks.slice(0, 2)" :key="fw" size="small">
                  {{ fw }}
                </a-tag>
              </div>
              
              <div class="card-stats">
                <span class="downloads">
                  <DownloadOutlined />
                  {{ formatNumber(material.downloads) }}
                </span>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  ReloadOutlined,
  SearchOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  TableOutlined,
  AppstoreOutlined,
  FileImageOutlined,
  CopyOutlined,
  DownloadOutlined,
  StopOutlined,
  DownOutlined,
  EyeOutlined,
  EditOutlined,
  MoreOutlined
} from '@ant-design/icons-vue'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const viewMode = ref('table')
const selectedRowKeys = ref<string[]>([])
const selectAll = ref(false)
const indeterminate = ref(false)

const filters = reactive({
  category: undefined,
  status: undefined,
  framework: undefined
})

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true
})

const materials = ref([
  {
    id: 'MAT-001',
    name: 'Button 按钮组件',
    description: '通用按钮组件，支持多种样式和尺寸',
    category: 'component',
    status: 'published',
    frameworks: ['Vue', 'React'],
    downloads: 1234,
    thumbnail: 'https://via.placeholder.com/200x150',
    author: '张三',
    version: '1.2.0',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: 'MAT-002',
    name: 'Login Template',
    description: '登录页面模板，包含多种登录方式',
    category: 'template',
    status: 'published',
    frameworks: ['Vue'],
    downloads: 856,
    thumbnail: 'https://via.placeholder.com/200x150',
    author: '李四',
    version: '2.1.0',
    updatedAt: '2024-01-19T14:20:00Z'
  },
  {
    id: 'MAT-003',
    name: 'Icon Set',
    description: '常用图标集合，包含200+个图标',
    category: 'icon',
    status: 'draft',
    frameworks: ['Vue', 'React', 'Angular'],
    downloads: 2341,
    thumbnail: null,
    author: '王五',
    version: '1.0.0',
    updatedAt: '2024-01-18T09:15:00Z'
  }
])

// 表格列定义
const columns = [
  {
    title: '物料名称',
    key: 'name',
    width: 300,
    fixed: 'left'
  },
  {
    title: '分类',
    key: 'category',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '支持框架',
    key: 'framework',
    width: 150
  },
  {
    title: '下载量',
    key: 'downloads',
    width: 100,
    sorter: true
  },
  {
    title: '作者',
    dataIndex: 'author',
    width: 100
  },
  {
    title: '版本',
    dataIndex: 'version',
    width: 100
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 150,
    sorter: true
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

// 行选择配置
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
    updateSelectAllState()
  },
  onSelectAll: (selected: boolean, selectedRows: any[], changeRows: any[]) => {
    updateSelectAllState()
  }
}))

// 方法
/**
 * 更新全选状态
 */
const updateSelectAllState = () => {
  const total = materials.value.length
  const selected = selectedRowKeys.value.length
  
  selectAll.value = selected === total && total > 0
  indeterminate.value = selected > 0 && selected < total
}

/**
 * 处理全选
 */
const handleSelectAll = (e: any) => {
  if (e.target.checked) {
    selectedRowKeys.value = materials.value.map(item => item.id)
  } else {
    selectedRowKeys.value = []
  }
  updateSelectAllState()
}

/**
 * 处理卡片选择
 */
const handleCardSelect = (id: string, checked: boolean) => {
  if (checked) {
    selectedRowKeys.value.push(id)
  } else {
    selectedRowKeys.value = selectedRowKeys.value.filter(key => key !== id)
  }
  updateSelectAllState()
}

/**
 * 处理筛选变化
 */
const handleFilterChange = () => {
  loadMaterials()
}

/**
 * 处理重置
 */
const handleReset = () => {
  Object.keys(filters).forEach(key => {
    filters[key as keyof typeof filters] = undefined
  })
  loadMaterials()
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  pagination.current = 1
  loadMaterials()
}

/**
 * 处理视图模式切换
 */
const handleViewModeChange = () => {
  // 视图切换逻辑
}

/**
 * 处理表格变化
 */
const handleTableChange = (pag: any, filters: any, sorter: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadMaterials()
}

/**
 * 处理分页变化
 */
const handlePageChange = (page: number, pageSize: number) => {
  pagination.current = page
  pagination.pageSize = pageSize
  loadMaterials()
}

/**
 * 查看详情
 */
const viewDetail = (id: string) => {
  router.push(`/material/${id}`)
}

/**
 * 编辑物料
 */
const editMaterial = (id: string) => {
  router.push(`/material/${id}/edit`)
}

/**
 * 下载物料
 */
const downloadMaterial = (id: string) => {
  message.info('下载功能开发中...')
}

/**
 * 处理创建
 */
const handleCreate = () => {
  router.push('/material/upload')
}

/**
 * 处理批量发布
 */
const handleBatchPublish = () => {
  Modal.confirm({
    title: '确认发布',
    content: `确定要发布选中的 ${selectedRowKeys.value.length} 个物料吗？`,
    onOk: () => {
      message.success('批量发布成功')
      selectedRowKeys.value = []
      loadMaterials()
    }
  })
}

/**
 * 处理批量删除
 */
const handleBatchDelete = () => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个物料吗？此操作不可恢复。`,
    okType: 'danger',
    onOk: () => {
      message.success('批量删除成功')
      selectedRowKeys.value = []
      loadMaterials()
    }
  })
}

/**
 * 处理操作
 */
const handleAction = (key: string, record: any) => {
  switch (key) {
    case 'duplicate':
      message.info('复制功能开发中...')
      break
    case 'download':
      downloadMaterial(record.id)
      break
    case 'publish':
      message.info('发布功能开发中...')
      break
    case 'unpublish':
      message.info('下架功能开发中...')
      break
    case 'delete':
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除物料 "${record.name}" 吗？此操作不可恢复。`,
        okType: 'danger',
        onOk: () => {
          message.success('删除成功')
          loadMaterials()
        }
      })
      break
  }
}

/**
 * 获取分类颜色
 */
const getCategoryColor = (category: string) => {
  const colors = {
    component: 'blue',
    template: 'green',
    icon: 'orange',
    asset: 'purple'
  }
  return colors[category as keyof typeof colors] || 'default'
}

/**
 * 获取分类文本
 */
const getCategoryText = (category: string) => {
  const texts = {
    component: '组件',
    template: '模板',
    icon: '图标',
    asset: '资源'
  }
  return texts[category as keyof typeof texts] || category
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colors = {
    draft: 'default',
    published: 'success',
    deprecated: 'error'
  }
  return colors[status as keyof typeof colors] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const texts = {
    draft: '草稿',
    published: '已发布',
    deprecated: '已废弃'
  }
  return texts[status as keyof typeof texts] || status
}

/**
 * 格式化数字
 */
const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

/**
 * 加载物料列表
 */
const loadMaterials = async () => {
  loading.value = true
  try {
    // 这里应该调用API获取物料列表
    await new Promise(resolve => setTimeout(resolve, 1000))
    pagination.total = 100
  } catch (error) {
    message.error('加载物料列表失败')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadMaterials()
})
</script>

<style scoped>
.material-list {
  padding: 24px;
}

.filter-bar {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.selected-info {
  color: #666;
  font-size: 14px;
}

.view-toggle {
  margin-bottom: 16px;
  text-align: right;
}

.table-view {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.material-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.name-info {
  flex: 1;
}

.name-info a {
  font-weight: 500;
  color: #1890ff;
}

.description {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}

.card-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.material-card {
  position: relative;
  transition: all 0.3s;
}

.material-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-cover {
  position: relative;
  height: 150px;
  overflow: hidden;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f5f5f5;
  color: #bfbfbf;
  font-size: 32px;
}

.card-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
}

.status-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

.card-footer {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.card-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 12px;
}

.downloads {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-wrapper {
  margin-top: 24px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .material-list {
    padding: 16px;
  }
  
  .filter-bar {
    padding: 16px;
  }
  
  .action-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .action-left,
  .action-right {
    justify-content: center;
  }
  
  .view-toggle {
    text-align: center;
  }
  
  .card-view {
    padding: 16px;
  }
}

@media (max-width: 576px) {
  .filter-bar :deep(.ant-row) {
    flex-direction: column;
  }
  
  .filter-bar :deep(.ant-col) {
    width: 100% !important;
    margin-bottom: 12px;
  }
  
  .action-right :deep(.ant-space) {
    flex-direction: column;
    width: 100%;
  }
}
</style>