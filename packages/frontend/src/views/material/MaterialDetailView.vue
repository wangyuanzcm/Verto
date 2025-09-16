<template>
  <div class="material-detail">
    <!-- 头部操作栏 -->
    <div class="detail-header">
      <div class="header-left">
        <a-button type="text" @click="goBack">
          <ArrowLeftOutlined />
          返回
        </a-button>
        
        <a-divider type="vertical" />
        
        <div class="breadcrumb">
          <a-breadcrumb>
            <a-breadcrumb-item>
              <router-link to="/material">物料管理</router-link>
            </a-breadcrumb-item>
            <a-breadcrumb-item>
              <router-link to="/material/list">物料列表</router-link>
            </a-breadcrumb-item>
            <a-breadcrumb-item>{{ material?.name }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>
      </div>
      
      <div class="header-right">
        <a-space>
          <a-button @click="handleRefresh">
            <ReloadOutlined />
            刷新
          </a-button>
          
          <a-dropdown>
            <template #overlay>
              <a-menu @click="handleMenuClick">
                <a-menu-item key="edit">
                  <EditOutlined />
                  编辑物料
                </a-menu-item>
                <a-menu-item key="copy">
                  <CopyOutlined />
                  复制物料
                </a-menu-item>
                <a-menu-item key="export">
                  <ExportOutlined />
                  导出物料
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="delete" danger>
                  <DeleteOutlined />
                  删除物料
                </a-menu-item>
              </a-menu>
            </template>
            <a-button>
              更多操作
              <DownOutlined />
            </a-button>
          </a-dropdown>
          
          <a-button type="primary" @click="handleDownload">
            <DownloadOutlined />
            下载物料
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="detail-content">
      <a-row :gutter="24">
        <!-- 左侧主要信息 -->
        <a-col :span="16">
          <!-- 基本信息 -->
          <a-card title="基本信息" class="info-card">
            <div class="material-header">
              <div class="material-icon">
                <img v-if="material?.icon" :src="material.icon" :alt="material.name" />
                <FileOutlined v-else />
              </div>
              
              <div class="material-info">
                <h2 class="material-name">{{ material?.name }}</h2>
                <p class="material-description">{{ material?.description }}</p>
                
                <div class="material-meta">
                  <a-space wrap>
                    <a-tag v-for="tag in material?.tags" :key="tag" color="blue">
                      {{ tag }}
                    </a-tag>
                    <span class="version">版本: v{{ material?.version }}</span>
                    <span class="author">作者: {{ material?.author }}</span>
                    <span class="created-time">创建时间: {{ formatDate(material?.createdAt) }}</span>
                  </a-space>
                </div>
              </div>
            </div>
            
            <a-divider />
            
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="物料类型">
                <a-tag :color="getTypeColor(material?.type)">{{ getTypeName(material?.type) }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="技术栈">
                <a-space>
                  <a-tag v-for="framework in material?.frameworks" :key="framework">
                    {{ framework }}
                  </a-tag>
                </a-space>
              </a-descriptions-item>
              <a-descriptions-item label="文件大小">{{ formatFileSize(material?.size) }}</a-descriptions-item>
              <a-descriptions-item label="下载次数">{{ material?.downloads }}</a-descriptions-item>
              <a-descriptions-item label="评分">
                <a-rate :value="material?.rating" disabled allow-half />
                <span class="rating-text">({{ material?.rating }}/5)</span>
              </a-descriptions-item>
              <a-descriptions-item label="最后更新">{{ formatDate(material?.updatedAt) }}</a-descriptions-item>
              <a-descriptions-item label="许可证">{{ material?.license }}</a-descriptions-item>
              <a-descriptions-item label="状态">
                <a-badge 
                  :status="getStatusBadge(material?.status)" 
                  :text="getStatusText(material?.status)" 
                />
              </a-descriptions-item>
            </a-descriptions>
          </a-card>

          <!-- 预览区域 -->
          <a-card title="预览" class="preview-card">
            <a-tabs v-model:activeKey="previewTab">
              <a-tab-pane key="demo" tab="演示">
                <div class="demo-container">
                  <iframe 
                    v-if="material?.demoUrl" 
                    :src="material.demoUrl" 
                    frameborder="0"
                    class="demo-iframe"
                  ></iframe>
                  <div v-else class="demo-placeholder">
                    <FileImageOutlined />
                    <p>暂无演示</p>
                  </div>
                </div>
              </a-tab-pane>
              
              <a-tab-pane key="code" tab="代码">
                <div class="code-container">
                  <div class="code-header">
                    <a-space>
                      <span>{{ material?.mainFile || 'index.vue' }}</span>
                      <a-button size="small" @click="copyCode">
                        <CopyOutlined />
                        复制代码
                      </a-button>
                    </a-space>
                  </div>
                  <pre class="code-content"><code>{{ material?.code }}</code></pre>
                </div>
              </a-tab-pane>
              
              <a-tab-pane key="props" tab="属性">
                <a-table 
                  :columns="propsColumns" 
                  :data-source="material?.props" 
                  :pagination="false"
                  size="small"
                />
              </a-tab-pane>
              
              <a-tab-pane key="events" tab="事件">
                <a-table 
                  :columns="eventsColumns" 
                  :data-source="material?.events" 
                  :pagination="false"
                  size="small"
                />
              </a-tab-pane>
            </a-tabs>
          </a-card>

          <!-- 文档说明 -->
          <a-card title="文档说明" class="docs-card">
            <div class="docs-content" v-html="material?.docs"></div>
          </a-card>

          <!-- 使用示例 -->
          <a-card title="使用示例" class="examples-card">
            <a-collapse>
              <a-collapse-panel 
                v-for="(example, index) in material?.examples" 
                :key="index"
                :header="example.title"
              >
                <div class="example-content">
                  <p class="example-description">{{ example.description }}</p>
                  <pre class="example-code"><code>{{ example.code }}</code></pre>
                </div>
              </a-collapse-panel>
            </a-collapse>
          </a-card>
        </a-col>

        <!-- 右侧信息 -->
        <a-col :span="8">
          <!-- 统计信息 -->
          <a-card title="统计信息" class="stats-card">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ material?.downloads }}</div>
                <div class="stat-label">下载次数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ material?.views }}</div>
                <div class="stat-label">浏览次数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ material?.likes }}</div>
                <div class="stat-label">点赞数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ material?.forks }}</div>
                <div class="stat-label">Fork数</div>
              </div>
            </div>
          </a-card>

          <!-- 依赖信息 -->
          <a-card title="依赖信息" class="dependencies-card">
            <div class="dependencies-list">
              <div v-for="dep in material?.dependencies" :key="dep.name" class="dependency-item">
                <div class="dep-info">
                  <span class="dep-name">{{ dep.name }}</span>
                  <span class="dep-version">{{ dep.version }}</span>
                </div>
                <a-tag size="small" :color="dep.required ? 'red' : 'default'">
                  {{ dep.required ? '必需' : '可选' }}
                </a-tag>
              </div>
            </div>
          </a-card>

          <!-- 版本历史 -->
          <a-card title="版本历史" class="versions-card">
            <a-timeline>
              <a-timeline-item 
                v-for="version in material?.versions" 
                :key="version.version"
                :color="version.version === material?.version ? 'green' : 'blue'"
              >
                <div class="version-info">
                  <div class="version-header">
                    <span class="version-number">v{{ version.version }}</span>
                    <span class="version-date">{{ formatDate(version.date) }}</span>
                  </div>
                  <p class="version-description">{{ version.description }}</p>
                  <div class="version-changes">
                    <a-tag v-for="change in version.changes" :key="change" size="small">
                      {{ change }}
                    </a-tag>
                  </div>
                </div>
              </a-timeline-item>
            </a-timeline>
          </a-card>

          <!-- 相关物料 -->
          <a-card title="相关物料" class="related-card">
            <div class="related-list">
              <div 
                v-for="related in material?.related" 
                :key="related.id"
                class="related-item"
                @click="viewRelated(related)"
              >
                <div class="related-icon">
                  <img v-if="related.icon" :src="related.icon" :alt="related.name" />
                  <FileOutlined v-else />
                </div>
                <div class="related-info">
                  <div class="related-name">{{ related.name }}</div>
                  <div class="related-description">{{ related.description }}</div>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 评论区域 -->
    <div class="comments-section">
      <a-card title="评论">
        <div class="comment-form">
          <a-textarea
            v-model:value="newComment"
            placeholder="写下你的评论..."
            :rows="3"
            :maxlength="500"
            show-count
          />
          <div class="comment-actions">
            <a-button type="primary" @click="submitComment" :loading="submittingComment">
              发表评论
            </a-button>
          </div>
        </div>
        
        <a-divider />
        
        <div class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-avatar">
              <a-avatar :src="comment.user.avatar" :alt="comment.user.name">
                {{ comment.user.name.charAt(0) }}
              </a-avatar>
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-author">{{ comment.user.name }}</span>
                <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <div class="comment-text">{{ comment.content }}</div>
              <div class="comment-actions">
                <a-space>
                  <a-button type="text" size="small" @click="likeComment(comment)">
                    <LikeOutlined :class="{ liked: comment.liked }" />
                    {{ comment.likes }}
                  </a-button>
                  <a-button type="text" size="small" @click="replyComment(comment)">
                    <MessageOutlined />
                    回复
                  </a-button>
                </a-space>
              </div>
            </div>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  EditOutlined,
  CopyOutlined,
  ExportOutlined,
  DeleteOutlined,
  DownOutlined,
  DownloadOutlined,
  FileOutlined,
  FileImageOutlined,
  LikeOutlined,
  MessageOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const previewTab = ref('demo')
const newComment = ref('')
const submittingComment = ref(false)

const material = ref({
  id: 'MAT-001',
  name: 'Button 按钮组件',
  description: '通用按钮组件，支持多种样式、尺寸和状态，适用于各种交互场景',
  type: 'component',
  frameworks: ['Vue', 'React'],
  tags: ['按钮', '基础组件', '交互'],
  version: '2.1.0',
  author: '张三',
  license: 'MIT',
  status: 'published',
  size: 15360,
  downloads: 15420,
  views: 8960,
  likes: 234,
  forks: 45,
  rating: 4.8,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:20:00Z',
  icon: 'https://via.placeholder.com/64x64',
  demoUrl: 'https://example.com/button-demo',
  mainFile: 'Button.vue',
  code: `<template>\n  <button :class="buttonClass" :disabled="disabled" @click="handleClick">\n    <slot />\n  </button>\n</template>\n\n<script setup>\ndefineProps({\n  type: { type: String, default: 'default' },\n  size: { type: String, default: 'medium' },\n  disabled: { type: Boolean, default: false }\n})\n\ndefineEmits(['click'])\n</script>`,
  docs: '<h3>按钮组件</h3><p>这是一个通用的按钮组件，支持多种样式和尺寸...</p>',
  props: [
    { name: 'type', type: 'string', default: 'default', description: '按钮类型：primary, default, dashed, text, link' },
    { name: 'size', type: 'string', default: 'medium', description: '按钮尺寸：large, medium, small' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '是否禁用' },
    { name: 'loading', type: 'boolean', default: 'false', description: '是否加载中' }
  ],
  events: [
    { name: 'click', params: 'event', description: '点击按钮时触发' },
    { name: 'focus', params: 'event', description: '获得焦点时触发' },
    { name: 'blur', params: 'event', description: '失去焦点时触发' }
  ],
  examples: [
    {
      title: '基础用法',
      description: '最简单的用法',
      code: '<Button type="primary">主要按钮</Button>'
    },
    {
      title: '不同尺寸',
      description: '按钮有大、中、小三种尺寸',
      code: '<Button size="large">大按钮</Button>\n<Button size="medium">中按钮</Button>\n<Button size="small">小按钮</Button>'
    }
  ],
  dependencies: [
    { name: 'vue', version: '^3.0.0', required: true },
    { name: 'ant-design-vue', version: '^4.0.0', required: false }
  ],
  versions: [
    {
      version: '2.1.0',
      date: '2024-01-20T14:20:00Z',
      description: '新增loading状态支持',
      changes: ['新功能', 'Bug修复']
    },
    {
      version: '2.0.0',
      date: '2024-01-15T10:30:00Z',
      description: '重构组件架构，提升性能',
      changes: ['重构', '性能优化']
    }
  ],
  related: [
    {
      id: 'MAT-002',
      name: 'Input 输入框',
      description: '文本输入组件',
      icon: 'https://via.placeholder.com/32x32'
    },
    {
      id: 'MAT-003',
      name: 'Form 表单',
      description: '表单容器组件',
      icon: 'https://via.placeholder.com/32x32'
    }
  ]
})

const comments = ref([
  {
    id: 'COMMENT-001',
    user: {
      id: 'USER-001',
      name: '李四',
      avatar: 'https://via.placeholder.com/32x32'
    },
    content: '这个组件很好用，API设计得很清晰！',
    likes: 5,
    liked: false,
    createdAt: '2024-01-21T09:30:00Z'
  },
  {
    id: 'COMMENT-002',
    user: {
      id: 'USER-002',
      name: '王五',
      avatar: 'https://via.placeholder.com/32x32'
    },
    content: '希望能增加更多的样式选项',
    likes: 2,
    liked: true,
    createdAt: '2024-01-20T16:45:00Z'
  }
])

// 表格列定义
const propsColumns = [
  { title: '属性名', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '默认值', dataIndex: 'default', key: 'default' },
  { title: '说明', dataIndex: 'description', key: 'description' }
]

const eventsColumns = [
  { title: '事件名', dataIndex: 'name', key: 'name' },
  { title: '参数', dataIndex: 'params', key: 'params' },
  { title: '说明', dataIndex: 'description', key: 'description' }
]

// 方法
/**
 * 返回上一页
 */
const goBack = () => {
  router.go(-1)
}

/**
 * 刷新页面
 */
const handleRefresh = () => {
  window.location.reload()
}

/**
 * 处理菜单点击
 */
const handleMenuClick = ({ key }: { key: string }) => {
  switch (key) {
    case 'edit':
      router.push(`/material/edit/${route.params.id}`)
      break
    case 'copy':
      message.info('复制物料功能开发中')
      break
    case 'export':
      message.info('导出物料功能开发中')
      break
    case 'delete':
      message.info('删除物料功能开发中')
      break
  }
}

/**
 * 下载物料
 */
const handleDownload = () => {
  message.info('下载物料功能开发中')
}

/**
 * 复制代码
 */
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(material.value.code)
    message.success('代码已复制到剪贴板')
  } catch (error) {
    message.error('复制失败')
  }
}

/**
 * 查看相关物料
 */
const viewRelated = (related: any) => {
  router.push(`/material/detail/${related.id}`)
}

/**
 * 提交评论
 */
const submitComment = async () => {
  if (!newComment.value.trim()) {
    message.warning('请输入评论内容')
    return
  }
  
  submittingComment.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const comment = {
      id: `COMMENT-${Date.now()}`,
      user: {
        id: 'USER-CURRENT',
        name: '当前用户',
        avatar: 'https://via.placeholder.com/32x32'
      },
      content: newComment.value,
      likes: 0,
      liked: false,
      createdAt: new Date().toISOString()
    }
    
    comments.value.unshift(comment)
    newComment.value = ''
    message.success('评论发表成功')
  } catch (error) {
    message.error('评论发表失败')
  } finally {
    submittingComment.value = false
  }
}

/**
 * 点赞评论
 */
const likeComment = (comment: any) => {
  comment.liked = !comment.liked
  comment.likes += comment.liked ? 1 : -1
  message.success(comment.liked ? '点赞成功' : '取消点赞')
}

/**
 * 回复评论
 */
const replyComment = (comment: any) => {
  newComment.value = `@${comment.user.name} `
}

/**
 * 获取类型颜色
 */
const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    component: 'blue',
    template: 'green',
    plugin: 'orange',
    theme: 'purple'
  }
  return colors[type] || 'default'
}

/**
 * 获取类型名称
 */
const getTypeName = (type: string) => {
  const names: Record<string, string> = {
    component: '组件',
    template: '模板',
    plugin: '插件',
    theme: '主题'
  }
  return names[type] || type
}

/**
 * 获取状态徽章
 */
const getStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    draft: 'default',
    published: 'success',
    deprecated: 'warning',
    archived: 'error'
  }
  return badges[status] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    deprecated: '已废弃',
    archived: '已归档'
  }
  return texts[status] || status
}

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  // 根据路由参数加载物料详情
  const materialId = route.params.id
  console.log('Loading material:', materialId)
})
</script>

<style scoped>
.material-detail {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
}

.breadcrumb {
  margin-left: 16px;
}

.detail-content {
  margin-bottom: 24px;
}

.info-card,
.preview-card,
.docs-card,
.examples-card,
.stats-card,
.dependencies-card,
.versions-card,
.related-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.material-header {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.material-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 32px;
  color: #666;
}

.material-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.material-info {
  flex: 1;
}

.material-name {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 500;
  color: #262626;
}

.material-description {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 16px;
  line-height: 1.5;
}

.material-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #999;
}

.version,
.author,
.created-time {
  color: #999;
}

.rating-text {
  margin-left: 8px;
  color: #666;
}

.demo-container {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  min-height: 300px;
}

.demo-iframe {
  width: 100%;
  height: 400px;
}

.demo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #bfbfbf;
  font-size: 48px;
}

.demo-placeholder p {
  margin-top: 16px;
  font-size: 16px;
}

.code-container {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.code-content {
  padding: 16px;
  margin: 0;
  background: #f8f8f8;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
}

.docs-content {
  line-height: 1.6;
}

.docs-content h3 {
  margin-top: 0;
}

.example-content {
  padding: 16px 0;
}

.example-description {
  margin-bottom: 12px;
  color: #666;
}

.example-code {
  margin: 0;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.dependencies-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dependency-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.dep-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dep-name {
  font-weight: 500;
  color: #262626;
}

.dep-version {
  font-size: 12px;
  color: #666;
}

.version-info {
  padding: 8px 0;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.version-number {
  font-weight: 500;
  color: #262626;
}

.version-date {
  font-size: 12px;
  color: #999;
}

.version-description {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.version-changes {
  display: flex;
  gap: 4px;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.related-item:hover {
  background: #e6f7ff;
  border-color: #1890ff;
}

.related-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 4px;
  font-size: 16px;
  color: #666;
}

.related-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.related-info {
  flex: 1;
}

.related-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.related-description {
  font-size: 12px;
  color: #666;
}

.comments-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comment-form {
  margin-bottom: 24px;
}

.comment-actions {
  margin-top: 12px;
  text-align: right;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 500;
  color: #262626;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  color: #666;
  line-height: 1.5;
  margin-bottom: 8px;
}

.comment-actions .ant-btn {
  padding: 0;
  height: auto;
}

.liked {
  color: #1890ff;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .detail-content :deep(.ant-col:first-child) {
    width: 100% !important;
    margin-bottom: 24px;
  }
  
  .detail-content :deep(.ant-col:last-child) {
    width: 100% !important;
  }
}

@media (max-width: 768px) {
  .material-detail {
    padding: 16px;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-left {
    justify-content: center;
  }
  
  .header-right {
    justify-content: center;
  }
  
  .material-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .material-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .comment-item {
    flex-direction: column;
  }
  
  .comment-header {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .version-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>