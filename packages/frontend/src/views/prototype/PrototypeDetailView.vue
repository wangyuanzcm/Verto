<template>
  <div class="prototype-detail">
    <!-- 头部操作栏 -->
    <div class="detail-header">
      <a-button type="text" @click="goBack" class="back-btn">
        <template #icon>
          <ArrowLeftOutlined />
        </template>
        返回
      </a-button>
      
      <div class="header-actions">
        <a-button @click="handleEdit">
          <template #icon>
            <EditOutlined />
          </template>
          编辑原型
        </a-button>
        <a-button @click="handlePreview">
          <template #icon>
            <EyeOutlined />
          </template>
          预览
        </a-button>
        <a-button type="primary" @click="handleExport">
          <template #icon>
            <ExportOutlined />
          </template>
          导出
        </a-button>
        <a-dropdown>
          <template #overlay>
            <a-menu @click="handleMenuClick">
              <a-menu-item key="duplicate">
                <CopyOutlined />
                复制原型
              </a-menu-item>
              <a-menu-item key="share">
                <ShareAltOutlined />
                分享链接
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="archive">
                <InboxOutlined />
                归档
              </a-menu-item>
              <a-menu-item key="delete" danger>
                <DeleteOutlined />
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>
            更多
            <DownOutlined />
          </a-button>
        </a-dropdown>
      </div>
    </div>

    <!-- 原型基本信息 -->
    <a-card class="info-card" title="基本信息">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="原型名称">
          {{ prototype.name }}
        </a-descriptions-item>
        <a-descriptions-item label="原型类型">
          <a-tag color="blue">{{ getTypeText(prototype.type) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(prototype.status)">
            {{ getStatusText(prototype.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="设备尺寸">
          {{ prototype.deviceSize }}
        </a-descriptions-item>
        <a-descriptions-item label="创建人">
          <a-avatar :size="24" :src="prototype.creator?.avatar" />
          {{ prototype.creator?.name }}
        </a-descriptions-item>
        <a-descriptions-item label="关联项目">
          <a v-if="prototype.project" @click="viewProject(prototype.project.id)">
            {{ prototype.project.name }}
          </a>
          <span v-else>-</span>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ formatDate(prototype.createdAt) }}
        </a-descriptions-item>
        <a-descriptions-item label="更新时间">
          {{ formatDate(prototype.updatedAt) }}
        </a-descriptions-item>
      </a-descriptions>
      
      <div v-if="prototype.description" class="description-section">
        <h4>描述</h4>
        <p>{{ prototype.description }}</p>
      </div>
      
      <div v-if="prototype.tags?.length" class="tags-section">
        <h4>标签</h4>
        <a-space wrap>
          <a-tag v-for="tag in prototype.tags" :key="tag" color="default">
            {{ tag }}
          </a-tag>
        </a-space>
      </div>
    </a-card>

    <!-- 原型预览 -->
    <a-card class="preview-card" title="原型预览">
      <div class="preview-container">
        <div class="preview-toolbar">
          <a-space>
            <a-select v-model:value="previewScale" style="width: 120px">
              <a-select-option value="0.5">50%</a-select-option>
              <a-select-option value="0.75">75%</a-select-option>
              <a-select-option value="1">100%</a-select-option>
              <a-select-option value="1.25">125%</a-select-option>
              <a-select-option value="1.5">150%</a-select-option>
            </a-select>
            <a-button @click="handleFullscreen">
              <template #icon>
                <FullscreenOutlined />
              </template>
              全屏预览
            </a-button>
          </a-space>
        </div>
        
        <div class="preview-frame" :style="previewStyle">
          <div v-if="prototype.thumbnail" class="preview-image">
            <img :src="prototype.thumbnail" :alt="prototype.name" />
          </div>
          <div v-else class="preview-placeholder">
            <FileImageOutlined />
            <p>暂无预览图</p>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 版本历史 -->
    <a-card class="version-card" title="版本历史">
      <a-timeline>
        <a-timeline-item
          v-for="version in versions"
          :key="version.id"
          :color="version.id === prototype.currentVersion ? 'green' : 'blue'"
        >
          <template #dot>
            <CheckCircleOutlined v-if="version.id === prototype.currentVersion" style="color: #52c41a" />
          </template>
          <div class="version-item">
            <div class="version-header">
              <span class="version-name">{{ version.name }}</span>
              <span class="version-time">{{ formatDate(version.createdAt) }}</span>
            </div>
            <div class="version-description">{{ version.description }}</div>
            <div class="version-author">
              <a-avatar :size="20" :src="version.author.avatar" />
              {{ version.author.name }}
            </div>
            <div class="version-actions">
              <a-button size="small" @click="previewVersion(version)">
                预览
              </a-button>
              <a-button size="small" @click="restoreVersion(version)" v-if="version.id !== prototype.currentVersion">
                恢复
              </a-button>
            </div>
          </div>
        </a-timeline-item>
      </a-timeline>
    </a-card>

    <!-- 评论区 -->
    <a-card class="comment-card" title="评论">
      <a-comment>
        <template #avatar>
          <a-avatar :src="currentUser.avatar" />
        </template>
        <template #content>
          <a-form-item>
            <a-textarea
              v-model:value="newComment"
              :rows="4"
              placeholder="添加评论..."
            />
          </a-form-item>
          <a-form-item>
            <a-button
              type="primary"
              @click="submitComment"
              :loading="submittingComment"
              :disabled="!newComment.trim()"
            >
              添加评论
            </a-button>
          </a-form-item>
        </template>
      </a-comment>
      
      <a-list
        :data-source="comments"
        :loading="loadingComments"
        item-layout="horizontal"
      >
        <template #renderItem="{ item }">
          <a-comment
            :author="item.author.name"
            :datetime="formatDate(item.createdAt)"
          >
            <template #avatar>
              <a-avatar :src="item.author.avatar" />
            </template>
            <template #content>
              <p>{{ item.content }}</p>
            </template>
          </a-comment>
        </template>
      </a-list>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  EditOutlined,
  EyeOutlined,
  ExportOutlined,
  DownOutlined,
  CopyOutlined,
  ShareAltOutlined,
  InboxOutlined,
  DeleteOutlined,
  FullscreenOutlined,
  FileImageOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'

// 路由相关
const router = useRouter()
const route = useRoute()

// 响应式数据
const previewScale = ref('1')
const newComment = ref('')
const submittingComment = ref(false)
const loadingComments = ref(false)

const prototype = ref({
  id: 'PROTO-001',
  name: '用户登录页面原型',
  description: '包含用户名密码登录、手机号登录、第三方登录等功能的原型设计',
  type: 'web',
  status: 'designing',
  deviceSize: '1920x1080',
  thumbnail: 'https://via.placeholder.com/800x600',
  currentVersion: 'v1.2',
  creator: {
    id: '1',
    name: '张三',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1'
  },
  project: {
    id: '1',
    name: '电商平台项目'
  },
  tags: ['登录页面', 'Web端', '用户认证'],
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:20:00Z'
})

const versions = ref([
  {
    id: 'v1.2',
    name: 'v1.2',
    description: '添加第三方登录功能，优化移动端适配',
    author: {
      name: '张三',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1'
    },
    createdAt: '2024-01-20T14:20:00Z'
  },
  {
    id: 'v1.1',
    name: 'v1.1',
    description: '修复表单验证问题，调整页面布局',
    author: {
      name: '李四',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=2'
    },
    createdAt: '2024-01-18T09:15:00Z'
  },
  {
    id: 'v1.0',
    name: 'v1.0',
    description: '初始版本，包含基本的登录功能',
    author: {
      name: '张三',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1'
    },
    createdAt: '2024-01-15T10:30:00Z'
  }
])

const comments = ref([
  {
    id: '1',
    content: '登录页面的设计很不错，建议在移动端适配上再优化一下',
    author: {
      name: '王五',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=3'
    },
    createdAt: '2024-01-16T09:00:00Z'
  }
])

const currentUser = ref({
  id: '1',
  name: '当前用户',
  avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=current'
})

// 计算属性
const previewStyle = computed(() => {
  return {
    transform: `scale(${previewScale.value})`,
    transformOrigin: 'top left'
  }
})

// 方法
/**
 * 返回上一页
 */
const goBack = () => {
  router.go(-1)
}

/**
 * 处理编辑
 */
const handleEdit = () => {
  router.push(`/prototype/${route.params.id}/editor`)
}

/**
 * 处理预览
 */
const handlePreview = () => {
  message.info('预览功能开发中...')
}

/**
 * 处理导出
 */
const handleExport = () => {
  message.info('导出功能开发中...')
}

/**
 * 处理菜单点击
 */
const handleMenuClick = ({ key }: { key: string }) => {
  switch (key) {
    case 'duplicate':
      message.info('复制原型功能开发中...')
      break
    case 'share':
      message.info('分享链接功能开发中...')
      break
    case 'archive':
      message.info('归档功能开发中...')
      break
    case 'delete':
      message.info('删除功能开发中...')
      break
  }
}

/**
 * 处理全屏预览
 */
const handleFullscreen = () => {
  message.info('全屏预览功能开发中...')
}

/**
 * 查看项目
 */
const viewProject = (projectId: string) => {
  router.push(`/projects/${projectId}`)
}

/**
 * 预览版本
 */
const previewVersion = (version: any) => {
  message.info(`预览版本 ${version.name} 功能开发中...`)
}

/**
 * 恢复版本
 */
const restoreVersion = (version: any) => {
  message.info(`恢复到版本 ${version.name} 功能开发中...`)
}

/**
 * 获取类型文本
 */
const getTypeText = (type: string) => {
  const texts = {
    web: 'Web页面',
    mobile: '移动端页面',
    desktop: '桌面应用',
    component: '组件原型'
  }
  return texts[type as keyof typeof texts] || type
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colors = {
    draft: 'default',
    designing: 'processing',
    reviewing: 'warning',
    approved: 'success',
    rejected: 'error'
  }
  return colors[status as keyof typeof colors] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const texts = {
    draft: '草稿',
    designing: '设计中',
    reviewing: '评审中',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return texts[status as keyof typeof texts] || status
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

/**
 * 提交评论
 */
const submitComment = async () => {
  if (!newComment.value.trim()) return
  
  submittingComment.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    comments.value.unshift({
      id: Date.now().toString(),
      content: newComment.value,
      author: currentUser.value,
      createdAt: new Date().toISOString()
    })
    
    newComment.value = ''
    message.success('评论添加成功')
  } catch (error) {
    message.error('评论添加失败')
  } finally {
    submittingComment.value = false
  }
}

/**
 * 加载原型详情
 */
const loadPrototypeDetail = async () => {
  try {
    // 这里应该调用API获取原型详情
  } catch (error) {
    message.error('加载原型详情失败')
  }
}

/**
 * 加载评论列表
 */
const loadComments = async () => {
  loadingComments.value = true
  try {
    // 这里应该调用API获取评论列表
  } catch (error) {
    message.error('加载评论失败')
  } finally {
    loadingComments.value = false
  }
}

// 生命周期
onMounted(() => {
  loadPrototypeDetail()
  loadComments()
})
</script>

<style scoped>
.prototype-detail {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.info-card,
.preview-card,
.version-card,
.comment-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.description-section,
.tags-section {
  margin-top: 24px;
}

.description-section h4,
.tags-section h4 {
  margin-bottom: 12px;
  color: #262626;
}

.preview-container {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.preview-toolbar {
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-frame {
  padding: 24px;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  transition: transform 0.3s;
}

.preview-image img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-placeholder {
  text-align: center;
  color: #bfbfbf;
}

.preview-placeholder .anticon {
  font-size: 48px;
  margin-bottom: 16px;
}

.version-item {
  padding: 12px 0;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.version-name {
  font-weight: 500;
  font-size: 16px;
}

.version-time {
  color: #666;
  font-size: 12px;
}

.version-description {
  color: #666;
  margin-bottom: 8px;
}

.version-author {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}

.version-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .prototype-detail {
    padding: 16px;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .preview-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}
</style>