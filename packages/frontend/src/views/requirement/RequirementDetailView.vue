<template>
  <div class="requirement-detail">
    <!-- 头部操作栏 -->
    <div class="detail-header">
      <a-button type="text" @click="goBack" class="back-btn">
        <template #icon>
          <ArrowLeftOutlined />
        </template>
        返回
      </a-button>
      
      <div class="header-actions">
        <a-button @click="handleEdit" :disabled="!canEdit">
          <template #icon>
            <EditOutlined />
          </template>
          编辑
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
                复制需求
              </a-menu-item>
              <a-menu-item key="archive">
                <InboxOutlined />
                归档
              </a-menu-item>
              <a-menu-divider />
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

    <!-- 需求基本信息 -->
    <a-card class="info-card" title="基本信息">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="需求编号">
          <a-tag color="blue">{{ requirement.id }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="需求标题">
          {{ requirement.title }}
        </a-descriptions-item>
        <a-descriptions-item label="优先级">
          <a-tag :color="getPriorityColor(requirement.priority)">
            {{ getPriorityText(requirement.priority) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(requirement.status)">
            {{ getStatusText(requirement.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建人">
          <a-avatar :size="24" :src="requirement.creator?.avatar" />
          {{ requirement.creator?.name }}
        </a-descriptions-item>
        <a-descriptions-item label="负责人">
          <a-avatar :size="24" :src="requirement.assignee?.avatar" />
          {{ requirement.assignee?.name }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ formatDate(requirement.createdAt) }}
        </a-descriptions-item>
        <a-descriptions-item label="更新时间">
          {{ formatDate(requirement.updatedAt) }}
        </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <!-- 需求描述 -->
    <a-card class="description-card" title="需求描述">
      <div class="description-content" v-html="requirement.description"></div>
    </a-card>

    <!-- 验收标准 -->
    <a-card class="acceptance-card" title="验收标准">
      <a-list :data-source="requirement.acceptanceCriteria" size="small">
        <template #renderItem="{ item, index }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                <span class="criteria-index">{{ index + 1 }}.</span>
                {{ item.title }}
              </template>
              <template #description>
                {{ item.description }}
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-card>

    <!-- 附件 -->
    <a-card class="attachment-card" title="附件" v-if="requirement.attachments?.length">
      <a-list :data-source="requirement.attachments" size="small">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #avatar>
                <FileOutlined />
              </template>
              <template #title>
                <a @click="downloadAttachment(item)">{{ item.name }}</a>
              </template>
              <template #description>
                {{ formatFileSize(item.size) }} · {{ formatDate(item.uploadedAt) }}
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
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
  ExportOutlined,
  DownOutlined,
  CopyOutlined,
  InboxOutlined,
  DeleteOutlined,
  FileOutlined
} from '@ant-design/icons-vue'

// 路由相关
const router = useRouter()
const route = useRoute()

// 响应式数据
const requirement = ref({
  id: 'REQ-001',
  title: '用户登录功能',
  description: '<p>实现用户登录功能，包括用户名密码登录、手机号登录、第三方登录等方式。</p>',
  priority: 'high',
  status: 'in_progress',
  creator: {
    id: '1',
    name: '张三',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1'
  },
  assignee: {
    id: '2',
    name: '李四',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=2'
  },
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:20:00Z',
  acceptanceCriteria: [
    {
      title: '用户名密码登录',
      description: '用户可以使用用户名和密码进行登录，登录成功后跳转到首页'
    },
    {
      title: '手机号登录',
      description: '用户可以使用手机号和验证码进行登录'
    },
    {
      title: '第三方登录',
      description: '支持微信、QQ、微博等第三方平台登录'
    }
  ],
  attachments: [
    {
      id: '1',
      name: '登录流程图.png',
      size: 1024000,
      uploadedAt: '2024-01-15T10:30:00Z',
      url: '/api/attachments/1'
    }
  ]
})

const comments = ref([
  {
    id: '1',
    content: '这个需求的优先级应该调整为高优先级',
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

const newComment = ref('')
const submittingComment = ref(false)
const loadingComments = ref(false)

// 计算属性
const canEdit = computed(() => {
  // 这里可以根据用户权限判断是否可以编辑
  return true
})

// 方法
/**
 * 返回上一页
 */
const goBack = () => {
  router.go(-1)
}

/**
 * 处理编辑操作
 */
const handleEdit = () => {
  router.push(`/requirements/${route.params.id}/edit`)
}

/**
 * 处理导出操作
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
      message.info('复制需求功能开发中...')
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
 * 获取优先级颜色
 */
const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    urgent: 'purple'
  }
  return colors[priority as keyof typeof colors] || 'default'
}

/**
 * 获取优先级文本
 */
const getPriorityText = (priority: string) => {
  const texts = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return texts[priority as keyof typeof texts] || priority
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colors = {
    draft: 'default',
    pending: 'orange',
    in_progress: 'blue',
    testing: 'cyan',
    completed: 'green',
    rejected: 'red'
  }
  return colors[status as keyof typeof colors] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const texts = {
    draft: '草稿',
    pending: '待处理',
    in_progress: '进行中',
    testing: '测试中',
    completed: '已完成',
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
 * 格式化文件大小
 */
const formatFileSize = (size: number) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

/**
 * 下载附件
 */
const downloadAttachment = (attachment: any) => {
  window.open(attachment.url, '_blank')
}

/**
 * 提交评论
 */
const submitComment = async () => {
  if (!newComment.value.trim()) return
  
  submittingComment.value = true
  try {
    // 模拟API调用
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
 * 加载需求详情
 */
const loadRequirementDetail = async () => {
  try {
    // 这里应该调用API获取需求详情
    // const response = await api.getRequirement(route.params.id)
    // requirement.value = response.data
  } catch (error) {
    message.error('加载需求详情失败')
  }
}

/**
 * 加载评论列表
 */
const loadComments = async () => {
  loadingComments.value = true
  try {
    // 这里应该调用API获取评论列表
    // const response = await api.getRequirementComments(route.params.id)
    // comments.value = response.data
  } catch (error) {
    message.error('加载评论失败')
  } finally {
    loadingComments.value = false
  }
}

// 生命周期
onMounted(() => {
  loadRequirementDetail()
  loadComments()
})
</script>

<style scoped>
.requirement-detail {
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
.description-card,
.acceptance-card,
.attachment-card,
.comment-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.description-content {
  line-height: 1.6;
  color: #666;
}

.criteria-index {
  font-weight: bold;
  color: #1890ff;
  margin-right: 8px;
}

@media (max-width: 768px) {
  .requirement-detail {
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
}
</style>