<template>
  <div class="material-library">
    <!-- 搜索和筛选栏 -->
    <div class="search-bar">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索组件名称、描述或标签..."
            size="large"
            @search="handleSearch"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input-search>
        </a-col>
        
        <a-col :span="4">
          <a-select
            v-model:value="selectedFramework"
            placeholder="选择框架"
            size="large"
            style="width: 100%"
            allowClear
            @change="handleFrameworkChange"
          >
            <a-select-option value="vue">Vue</a-select-option>
            <a-select-option value="react">React</a-select-option>
            <a-select-option value="angular">Angular</a-select-option>
            <a-select-option value="vanilla">原生JS</a-select-option>
          </a-select>
        </a-col>
        
        <a-col :span="4">
          <a-select
            v-model:value="selectedSort"
            placeholder="排序方式"
            size="large"
            style="width: 100%"
            @change="handleSortChange"
          >
            <a-select-option value="popular">最受欢迎</a-select-option>
            <a-select-option value="newest">最新发布</a-select-option>
            <a-select-option value="updated">最近更新</a-select-option>
            <a-select-option value="downloads">下载量</a-select-option>
          </a-select>
        </a-col>
        
        <a-col :span="8">
          <div class="view-controls">
            <a-radio-group v-model:value="viewMode" @change="handleViewModeChange">
              <a-radio-button value="grid">
                <AppstoreOutlined />
                网格
              </a-radio-button>
              <a-radio-button value="list">
                <UnorderedListOutlined />
                列表
              </a-radio-button>
            </a-radio-group>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 分类导航 -->
    <div class="category-nav">
      <a-tabs v-model:activeKey="activeCategory" @change="handleCategoryChange">
        <a-tab-pane key="all" tab="全部组件" />
        <a-tab-pane key="basic" tab="基础组件" />
        <a-tab-pane key="form" tab="表单组件" />
        <a-tab-pane key="data" tab="数据展示" />
        <a-tab-pane key="feedback" tab="反馈组件" />
        <a-tab-pane key="navigation" tab="导航组件" />
        <a-tab-pane key="layout" tab="布局组件" />
        <a-tab-pane key="other" tab="其他" />
      </a-tabs>
    </div>

    <!-- 组件展示区域 -->
    <div class="components-container">
      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="grid-view">
        <a-row :gutter="[24, 24]">
          <a-col 
            v-for="component in filteredComponents" 
            :key="component.id"
            :xs="24" 
            :sm="12" 
            :md="8" 
            :lg="6" 
            :xl="4"
          >
            <a-card
              hoverable
              class="component-card"
              @click="viewComponent(component)"
            >
              <template #cover>
                <div class="card-cover">
                  <div class="component-preview">
                    <img v-if="component.preview" :src="component.preview" :alt="component.name" />
                    <div v-else class="preview-placeholder">
                      <component :is="component.icon" />
                    </div>
                  </div>
                  
                  <!-- 快速操作 -->
                  <div class="quick-actions">
                    <a-tooltip title="预览">
                      <a-button type="text" size="small" @click.stop="showPreview(component)">
                        <EyeOutlined />
                      </a-button>
                    </a-tooltip>
                    <a-tooltip title="复制代码">
                      <a-button type="text" size="small" @click.stop="copyCode(component)">
                        <CopyOutlined />
                      </a-button>
                    </a-tooltip>
                    <a-tooltip title="下载">
                      <a-button type="text" size="small" @click.stop="downloadComponent(component)">
                        <DownloadOutlined />
                      </a-button>
                    </a-tooltip>
                  </div>
                </div>
              </template>
              
              <a-card-meta
                :title="component.name"
                :description="component.description"
              />
              
              <div class="card-footer">
                <div class="component-info">
                  <a-space size="small">
                    <a-tag v-for="tag in component.tags.slice(0, 2)" :key="tag" size="small">
                      {{ tag }}
                    </a-tag>
                    <span v-if="component.tags.length > 2" class="more-tags">
                      +{{ component.tags.length - 2 }}
                    </span>
                  </a-space>
                </div>
                
                <div class="component-stats">
                  <span class="downloads">
                    <DownloadOutlined />
                    {{ formatNumber(component.downloads) }}
                  </span>
                  <span class="rating">
                    <StarFilled />
                    {{ component.rating }}
                  </span>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 列表视图 -->
      <div v-else class="list-view">
        <div class="component-list">
          <div 
            v-for="component in filteredComponents" 
            :key="component.id"
            class="component-item"
            @click="viewComponent(component)"
          >
            <div class="item-left">
              <div class="component-icon">
                <img v-if="component.preview" :src="component.preview" :alt="component.name" />
                <component v-else :is="component.icon" />
              </div>
              
              <div class="component-info">
                <h4 class="component-name">{{ component.name }}</h4>
                <p class="component-description">{{ component.description }}</p>
                
                <div class="component-meta">
                  <a-space>
                    <a-tag v-for="framework in component.frameworks" :key="framework" size="small">
                      {{ framework }}
                    </a-tag>
                    <span class="version">v{{ component.version }}</span>
                    <span class="author">by {{ component.author }}</span>
                  </a-space>
                </div>
              </div>
            </div>
            
            <div class="item-right">
              <div class="component-stats">
                <div class="stat-item">
                  <DownloadOutlined />
                  <span>{{ formatNumber(component.downloads) }}</span>
                </div>
                <div class="stat-item">
                  <StarFilled />
                  <span>{{ component.rating }}</span>
                </div>
                <div class="stat-item">
                  <ClockCircleOutlined />
                  <span>{{ formatDate(component.updatedAt) }}</span>
                </div>
              </div>
              
              <div class="component-actions">
                <a-space>
                  <a-button size="small" @click.stop="showPreview(component)">
                    <EyeOutlined />
                    预览
                  </a-button>
                  <a-button size="small" @click.stop="copyCode(component)">
                    <CopyOutlined />
                    复制
                  </a-button>
                  <a-button type="primary" size="small" @click.stop="downloadComponent(component)">
                    <DownloadOutlined />
                    下载
                  </a-button>
                </a-space>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMore">
        <a-button 
          type="dashed" 
          size="large" 
          :loading="loading" 
          @click="loadMore"
          block
        >
          加载更多
        </a-button>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredComponents.length === 0 && !loading" class="empty-state">
        <a-empty description="暂无组件">
          <template #image>
            <AppstoreOutlined style="font-size: 64px; color: #bfbfbf;" />
          </template>
          <a-button type="primary" @click="handleReset">
            重置筛选
          </a-button>
        </a-empty>
      </div>
    </div>

    <!-- 组件预览抽屉 -->
    <a-drawer
      v-model:open="previewVisible"
      title="组件预览"
      width="60%"
      placement="right"
    >
      <div v-if="previewComponent" class="preview-content">
        <div class="preview-header">
          <h3>{{ previewComponent.name }}</h3>
          <p>{{ previewComponent.description }}</p>
        </div>
        
        <a-tabs>
          <a-tab-pane key="preview" tab="预览">
            <div class="component-preview-area">
              <iframe 
                v-if="previewComponent.demoUrl" 
                :src="previewComponent.demoUrl" 
                frameborder="0"
                style="width: 100%; height: 400px;"
              ></iframe>
              <div v-else class="preview-placeholder">
                <FileImageOutlined />
                <p>暂无预览</p>
              </div>
            </div>
          </a-tab-pane>
          
          <a-tab-pane key="code" tab="代码">
            <a-typography-paragraph copyable>
              <pre><code>{{ previewComponent.code }}</code></pre>
            </a-typography-paragraph>
          </a-tab-pane>
          
          <a-tab-pane key="props" tab="属性">
            <a-table 
              :columns="propsColumns" 
              :data-source="previewComponent.props" 
              :pagination="false"
              size="small"
            />
          </a-tab-pane>
          
          <a-tab-pane key="docs" tab="文档">
            <div class="component-docs" v-html="previewComponent.docs"></div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  EyeOutlined,
  CopyOutlined,
  DownloadOutlined,
  StarFilled,
  ClockCircleOutlined,
  FileImageOutlined,
  ButtonOutlined,
  FormOutlined,
  TableOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const selectedFramework = ref(undefined)
const selectedSort = ref('popular')
const viewMode = ref('grid')
const activeCategory = ref('all')
const previewVisible = ref(false)
const previewComponent = ref(null)
const hasMore = ref(true)

const components = ref([
  {
    id: 'COMP-001',
    name: 'Button 按钮',
    description: '通用按钮组件，支持多种样式、尺寸和状态',
    category: 'basic',
    frameworks: ['Vue', 'React'],
    tags: ['按钮', '基础', '交互'],
    downloads: 15420,
    rating: 4.8,
    version: '2.1.0',
    author: '张三',
    preview: 'https://via.placeholder.com/200x150',
    icon: ButtonOutlined,
    updatedAt: '2024-01-20T10:30:00Z',
    demoUrl: 'https://example.com/button-demo',
    code: `<template>\n  <a-button type="primary">按钮</a-button>\n</template>`,
    props: [
      { name: 'type', type: 'string', default: 'default', description: '按钮类型' },
      { name: 'size', type: 'string', default: 'middle', description: '按钮尺寸' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '是否禁用' }
    ],
    docs: '<h3>按钮组件</h3><p>这是一个通用的按钮组件...</p>'
  },
  {
    id: 'COMP-002',
    name: 'Input 输入框',
    description: '文本输入组件，支持多种输入类型和验证',
    category: 'form',
    frameworks: ['Vue'],
    tags: ['输入框', '表单', '验证'],
    downloads: 12350,
    rating: 4.6,
    version: '1.8.0',
    author: '李四',
    preview: 'https://via.placeholder.com/200x150',
    icon: FormOutlined,
    updatedAt: '2024-01-19T14:20:00Z',
    demoUrl: 'https://example.com/input-demo',
    code: `<template>\n  <a-input placeholder="请输入" />\n</template>`,
    props: [
      { name: 'placeholder', type: 'string', default: '', description: '占位符' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '是否禁用' },
      { name: 'maxLength', type: 'number', default: '', description: '最大长度' }
    ],
    docs: '<h3>输入框组件</h3><p>这是一个文本输入组件...</p>'
  },
  {
    id: 'COMP-003',
    name: 'Table 表格',
    description: '数据表格组件，支持排序、筛选、分页等功能',
    category: 'data',
    frameworks: ['Vue', 'React', 'Angular'],
    tags: ['表格', '数据', '分页'],
    downloads: 8960,
    rating: 4.9,
    version: '3.2.1',
    author: '王五',
    preview: 'https://via.placeholder.com/200x150',
    icon: TableOutlined,
    updatedAt: '2024-01-18T09:15:00Z',
    demoUrl: 'https://example.com/table-demo',
    code: `<template>\n  <a-table :columns="columns" :data-source="data" />\n</template>`,
    props: [
      { name: 'columns', type: 'array', default: '[]', description: '表格列配置' },
      { name: 'dataSource', type: 'array', default: '[]', description: '数据源' },
      { name: 'pagination', type: 'object|boolean', default: 'true', description: '分页配置' }
    ],
    docs: '<h3>表格组件</h3><p>这是一个功能强大的数据表格组件...</p>'
  }
])

// 属性表格列定义
const propsColumns = [
  { title: '属性名', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '默认值', dataIndex: 'default', key: 'default' },
  { title: '说明', dataIndex: 'description', key: 'description' }
]

// 计算属性
const filteredComponents = computed(() => {
  let result = components.value
  
  // 分类筛选
  if (activeCategory.value !== 'all') {
    result = result.filter(comp => comp.category === activeCategory.value)
  }
  
  // 框架筛选
  if (selectedFramework.value) {
    result = result.filter(comp => 
      comp.frameworks.some(fw => fw.toLowerCase() === selectedFramework.value)
    )
  }
  
  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(comp => 
      comp.name.toLowerCase().includes(keyword) ||
      comp.description.toLowerCase().includes(keyword) ||
      comp.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }
  
  // 排序
  switch (selectedSort.value) {
    case 'popular':
      result.sort((a, b) => b.downloads - a.downloads)
      break
    case 'newest':
    case 'updated':
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      break
    case 'downloads':
      result.sort((a, b) => b.downloads - a.downloads)
      break
  }
  
  return result
})

// 方法
/**
 * 处理搜索
 */
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

/**
 * 处理框架变化
 */
const handleFrameworkChange = () => {
  // 筛选逻辑已在计算属性中处理
}

/**
 * 处理排序变化
 */
const handleSortChange = () => {
  // 排序逻辑已在计算属性中处理
}

/**
 * 处理视图模式变化
 */
const handleViewModeChange = () => {
  // 视图切换逻辑
}

/**
 * 处理分类变化
 */
const handleCategoryChange = () => {
  // 分类筛选逻辑已在计算属性中处理
}

/**
 * 查看组件详情
 */
const viewComponent = (component: any) => {
  previewComponent.value = component
  previewVisible.value = true
}

/**
 * 预览组件
 */
const showPreview = (component: any) => {
  previewComponent.value = component
  previewVisible.value = true
}

/**
 * 复制代码
 */
const copyCode = async (component: any) => {
  try {
    await navigator.clipboard.writeText(component.code)
    message.success('代码已复制到剪贴板')
  } catch (error) {
    message.error('复制失败')
  }
}

/**
 * 下载组件
 */
const downloadComponent = (component: any) => {
  message.info(`下载组件: ${component.name}`)
}

/**
 * 加载更多
 */
const loadMore = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 这里应该加载更多数据
    hasMore.value = false
  } catch (error) {
    message.error('加载失败')
  } finally {
    loading.value = false
  }
}

/**
 * 重置筛选
 */
const handleReset = () => {
  searchKeyword.value = ''
  selectedFramework.value = undefined
  selectedSort.value = 'popular'
  activeCategory.value = 'all'
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

// 生命周期
onMounted(() => {
  // 初始化加载
})
</script>

<style scoped>
.material-library {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.search-bar {
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.view-controls {
  display: flex;
  justify-content: flex-end;
}

.category-nav {
  background: white;
  padding: 0 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.components-container {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.grid-view .component-card {
  height: 100%;
  transition: all 0.3s;
}

.grid-view .component-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-cover {
  position: relative;
  height: 150px;
  overflow: hidden;
}

.component-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.component-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  font-size: 32px;
  color: #bfbfbf;
}

.quick-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.component-card:hover .quick-actions {
  opacity: 1;
}

.quick-actions .ant-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-footer {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.component-stats {
  display: flex;
  gap: 12px;
  color: #666;
  font-size: 12px;
}

.downloads,
.rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.more-tags {
  color: #666;
  font-size: 12px;
}

.list-view .component-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.component-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.component-item:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.1);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.component-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 24px;
  color: #666;
}

.component-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.component-info {
  flex: 1;
}

.component-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: #262626;
}

.component-description {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
}

.component-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.version,
.author {
  color: #999;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.item-right .component-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: right;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 12px;
}

.load-more {
  margin-top: 32px;
}

.empty-state {
  padding: 64px 0;
  text-align: center;
}

.preview-content {
  height: 100%;
}

.preview-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.preview-header h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.preview-header p {
  margin: 0;
  color: #666;
}

.component-preview-area {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.component-docs {
  line-height: 1.6;
}

.component-docs h3 {
  margin-top: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .material-library {
    padding: 16px;
  }
  
  .search-bar,
  .category-nav,
  .components-container {
    padding: 16px;
  }
  
  .search-bar :deep(.ant-row) {
    flex-direction: column;
  }
  
  .search-bar :deep(.ant-col) {
    width: 100% !important;
    margin-bottom: 12px;
  }
  
  .component-item {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .item-left {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .item-right {
    align-items: center;
  }
  
  .item-right .component-stats {
    flex-direction: row;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .view-controls {
    justify-content: center;
  }
  
  .card-footer {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  
  .component-stats {
    justify-content: center;
  }
}
</style>