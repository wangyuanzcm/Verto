<template>
  <div class="requirement-edit-view">
    <!-- 头部操作栏 -->
    <div class="header-actions">
      <div class="header-left">
        <a-button @click="handleBack">
          <ArrowLeftOutlined />
          返回
        </a-button>
        <a-divider type="vertical" />
        <h2 class="page-title">编辑需求</h2>
        <a-tag color="blue" class="requirement-id">REQ-{{ requirementId }}</a-tag>
      </div>
      
      <div class="header-right">
        <a-space>
          <a-button @click="handleSaveDraft" :loading="savingDraft">
            <SaveOutlined />
            保存草稿
          </a-button>
          <a-button type="primary" @click="handleSubmit" :loading="submitting">
            <CheckOutlined />
            保存更改
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <a-row :gutter="24">
        <!-- 左侧表单区域 -->
        <a-col :span="16">
          <a-card title="需求信息" class="form-card">
            <a-form
              ref="formRef"
              :model="formData"
              :rules="formRules"
              layout="vertical"
              class="requirement-form"
            >
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="需求标题" name="title">
                    <a-input 
                      v-model:value="formData.title" 
                      placeholder="请输入需求标题"
                      :maxlength="100"
                      show-count
                    />
                  </a-form-item>
                </a-col>
                
                <a-col :span="12">
                  <a-form-item label="需求类型" name="type">
                    <a-select v-model:value="formData.type" placeholder="请选择需求类型">
                      <a-select-option value="feature">功能需求</a-select-option>
                      <a-select-option value="improvement">改进需求</a-select-option>
                      <a-select-option value="bug">缺陷修复</a-select-option>
                      <a-select-option value="performance">性能优化</a-select-option>
                      <a-select-option value="security">安全需求</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-row :gutter="16">
                <a-col :span="8">
                  <a-form-item label="优先级" name="priority">
                    <a-select v-model:value="formData.priority" placeholder="请选择优先级">
                      <a-select-option value="high">
                        <a-tag color="red">高</a-tag>
                      </a-select-option>
                      <a-select-option value="medium">
                        <a-tag color="orange">中</a-tag>
                      </a-select-option>
                      <a-select-option value="low">
                        <a-tag color="green">低</a-tag>
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                
                <a-col :span="8">
                  <a-form-item label="状态" name="status">
                    <a-select v-model:value="formData.status" placeholder="请选择状态">
                      <a-select-option value="pending">
                        <a-tag color="default">待处理</a-tag>
                      </a-select-option>
                      <a-select-option value="in_progress">
                        <a-tag color="processing">进行中</a-tag>
                      </a-select-option>
                      <a-select-option value="review">
                        <a-tag color="warning">评审中</a-tag>
                      </a-select-option>
                      <a-select-option value="completed">
                        <a-tag color="success">已完成</a-tag>
                      </a-select-option>
                      <a-select-option value="rejected">
                        <a-tag color="error">已拒绝</a-tag>
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                
                <a-col :span="8">
                  <a-form-item label="需求来源" name="source">
                    <a-select v-model:value="formData.source" placeholder="请选择需求来源">
                      <a-select-option value="customer">客户反馈</a-select-option>
                      <a-select-option value="internal">内部需求</a-select-option>
                      <a-select-option value="market">市场调研</a-select-option>
                      <a-select-option value="competitor">竞品分析</a-select-option>
                      <a-select-option value="data">数据分析</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="所属项目" name="projectId">
                    <a-select v-model:value="formData.projectId" placeholder="请选择项目">
                      <a-select-option v-for="project in projects" :key="project.id" :value="project.id">
                        {{ project.name }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                
                <a-col :span="12">
                  <a-form-item label="进度" name="progress">
                    <a-slider 
                      v-model:value="formData.progress" 
                      :min="0" 
                      :max="100"
                      :step="5"
                      :tooltip-formatter="(value) => `${value}%`"
                    />
                    <div class="progress-display">{{ formData.progress }}%</div>
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="预期开始时间" name="expectedStartDate">
                    <a-date-picker 
                      v-model:value="formData.expectedStartDate" 
                      placeholder="请选择开始时间"
                      style="width: 100%"
                    />
                  </a-form-item>
                </a-col>
                
                <a-col :span="12">
                  <a-form-item label="预期完成时间" name="expectedEndDate">
                    <a-date-picker 
                      v-model:value="formData.expectedEndDate" 
                      placeholder="请选择完成时间"
                      style="width: 100%"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-form-item label="需求描述" name="description">
                <div class="editor-container">
                  <div class="editor-toolbar">
                    <a-space>
                      <a-button size="small" @click="insertTemplate('user-story')">
                        <UserOutlined />
                        用户故事
                      </a-button>
                      <a-button size="small" @click="insertTemplate('acceptance-criteria')">
                        <CheckSquareOutlined />
                        验收标准
                      </a-button>
                      <a-button size="small" @click="insertTemplate('business-rules')">
                        <BookOutlined />
                        业务规则
                      </a-button>
                      <a-divider type="vertical" />
                      <a-button size="small" @click="formatText('bold')">
                        <BoldOutlined />
                      </a-button>
                      <a-button size="small" @click="formatText('italic')">
                        <ItalicOutlined />
                      </a-button>
                      <a-button size="small" @click="formatText('underline')">
                        <UnderlineOutlined />
                      </a-button>
                    </a-space>
                  </div>
                  <a-textarea 
                    v-model:value="formData.description" 
                    placeholder="请详细描述需求内容，包括背景、目标、功能点等"
                    :rows="10"
                    :maxlength="5000"
                    show-count
                  />
                </div>
              </a-form-item>
              
              <a-form-item label="验收标准" name="acceptanceCriteria">
                <div class="criteria-list">
                  <div v-for="(criteria, index) in formData.acceptanceCriteria" :key="index" class="criteria-item">
                    <div class="criteria-input">
                      <a-textarea 
                        v-model:value="criteria.content" 
                        placeholder="请输入验收标准"
                        :rows="2"
                        :maxlength="200"
                      />
                    </div>
                    <div class="criteria-actions">
                      <a-button type="text" @click="moveCriteriaUp(index)" :disabled="index === 0">
                        <UpOutlined />
                      </a-button>
                      <a-button type="text" @click="moveCriteriaDown(index)" :disabled="index === formData.acceptanceCriteria.length - 1">
                        <DownOutlined />
                      </a-button>
                      <a-button type="text" danger @click="removeCriteria(index)" :disabled="formData.acceptanceCriteria.length <= 1">
                        <DeleteOutlined />
                      </a-button>
                    </div>
                  </div>
                  
                  <a-button type="dashed" @click="addCriteria" block>
                    <PlusOutlined />
                    添加验收标准
                  </a-button>
                </div>
              </a-form-item>
              
              <a-form-item label="关联需求" name="relatedRequirements">
                <a-select 
                  v-model:value="formData.relatedRequirements" 
                  mode="multiple"
                  placeholder="请选择关联的需求"
                  :filter-option="false"
                  :not-found-content="null"
                  @search="handleSearchRequirements"
                >
                  <a-select-option v-for="req in searchedRequirements" :key="req.id" :value="req.id">
                    <div class="requirement-option">
                      <span class="req-title">{{ req.title }}</span>
                      <a-tag :color="getStatusColor(req.status)" size="small">
                        {{ getStatusText(req.status) }}
                      </a-tag>
                    </div>
                  </a-select-option>
                </a-select>
              </a-form-item>
              
              <a-form-item label="标签" name="tags">
                <div class="tags-section">
                  <div class="tags-list">
                    <a-tag 
                      v-for="tag in formData.tags" 
                      :key="tag"
                      closable
                      @close="removeTag(tag)"
                    >
                      {{ tag }}
                    </a-tag>
                  </div>
                  
                  <div class="add-tag">
                    <a-input
                      v-model:value="newTag"
                      placeholder="添加标签"
                      style="width: 120px"
                      @press-enter="addTag"
                    />
                    <a-button @click="addTag" :disabled="!newTag.trim()">
                      <PlusOutlined />
                      添加
                    </a-button>
                  </div>
                </div>
              </a-form-item>
              
              <a-form-item label="附件" name="attachments">
                <div class="attachments-section">
                  <!-- 现有附件 -->
                  <div v-if="existingAttachments.length > 0" class="existing-attachments">
                    <h4>现有附件</h4>
                    <div class="attachment-list">
                      <div v-for="attachment in existingAttachments" :key="attachment.id" class="attachment-item">
                        <div class="attachment-info">
                          <FileOutlined class="attachment-icon" />
                          <div class="attachment-details">
                            <div class="attachment-name">{{ attachment.name }}</div>
                            <div class="attachment-meta">
                              {{ formatFileSize(attachment.size) }} • {{ formatDate(attachment.uploadTime) }}
                            </div>
                          </div>
                        </div>
                        <div class="attachment-actions">
                          <a-button size="small" @click="downloadAttachment(attachment)">
                            <DownloadOutlined />
                          </a-button>
                          <a-button size="small" danger @click="removeExistingAttachment(attachment)">
                            <DeleteOutlined />
                          </a-button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 新增附件 -->
                  <div class="new-attachments">
                    <h4>{{ existingAttachments.length > 0 ? '新增附件' : '上传附件' }}</h4>
                    <a-upload
                      v-model:file-list="fileList"
                      name="file"
                      multiple
                      :before-upload="beforeUpload"
                      @remove="handleRemoveFile"
                    >
                      <a-button>
                        <UploadOutlined />
                        上传附件
                      </a-button>
                    </a-upload>
                    <div class="upload-tips">
                      <p>• 支持上传图片、文档、原型文件等</p>
                      <p>• 单个文件大小不超过 10MB</p>
                      <p>• 最多上传 10 个文件</p>
                    </div>
                  </div>
                </div>
              </a-form-item>
            </a-form>
          </a-card>
        </a-col>
        
        <!-- 右侧信息面板 -->
        <a-col :span="8">
          <!-- 分配信息 -->
          <a-card title="分配信息" class="info-card">
            <a-form layout="vertical">
              <a-form-item label="需求负责人">
                <a-select v-model:value="formData.assigneeId" placeholder="请选择负责人" allow-clear>
                  <a-select-option v-for="user in users" :key="user.id" :value="user.id">
                    <div class="user-option">
                      <a-avatar :size="24" :src="user.avatar">{{ user.name.charAt(0) }}</a-avatar>
                      <span class="user-name">{{ user.name }}</span>
                    </div>
                  </a-select-option>
                </a-select>
              </a-form-item>
              
              <a-form-item label="评审人员">
                <a-select 
                  v-model:value="formData.reviewers" 
                  mode="multiple"
                  placeholder="请选择评审人员"
                >
                  <a-select-option v-for="user in users" :key="user.id" :value="user.id">
                    <div class="user-option">
                      <a-avatar :size="24" :src="user.avatar">{{ user.name.charAt(0) }}</a-avatar>
                      <span class="user-name">{{ user.name }}</span>
                    </div>
                  </a-select-option>
                </a-select>
              </a-form-item>
              
              <a-form-item label="抄送人员">
                <a-select 
                  v-model:value="formData.ccUsers" 
                  mode="multiple"
                  placeholder="请选择抄送人员"
                >
                  <a-select-option v-for="user in users" :key="user.id" :value="user.id">
                    <div class="user-option">
                      <a-avatar :size="24" :src="user.avatar">{{ user.name.charAt(0) }}</a-avatar>
                      <span class="user-name">{{ user.name }}</span>
                    </div>
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </a-card>
          
          <!-- 变更记录 -->
          <a-card title="本次变更" class="info-card">
            <a-form layout="vertical">
              <a-form-item label="变更说明">
                <a-textarea 
                  v-model:value="changeNote" 
                  placeholder="请说明本次变更的原因和内容"
                  :rows="3"
                  :maxlength="500"
                  show-count
                />
              </a-form-item>
              
              <a-form-item label="通知相关人员">
                <a-checkbox-group v-model:value="notifyUsers">
                  <div class="notify-options">
                    <a-checkbox value="assignee">负责人</a-checkbox>
                    <a-checkbox value="reviewers">评审人员</a-checkbox>
                    <a-checkbox value="creator">创建人</a-checkbox>
                    <a-checkbox value="watchers">关注人员</a-checkbox>
                  </div>
                </a-checkbox-group>
              </a-form-item>
            </a-form>
          </a-card>
          
          <!-- 操作历史 -->
          <a-card title="最近操作" class="info-card">
            <a-timeline size="small">
              <a-timeline-item v-for="action in recentActions" :key="action.id">
                <template #dot>
                  <component :is="getActionIcon(action.type)" class="timeline-icon" />
                </template>
                <div class="action-item">
                  <div class="action-header">
                    <span class="action-user">{{ action.user }}</span>
                    <span class="action-time">{{ formatDate(action.time) }}</span>
                  </div>
                  <div class="action-content">{{ action.content }}</div>
                </div>
              </a-timeline-item>
            </a-timeline>
          </a-card>
          
          <!-- 快速操作 -->
          <a-card title="快速操作" class="info-card">
            <div class="quick-actions">
              <a-button block @click="handlePreview" class="action-btn">
                <EyeOutlined />
                预览需求
              </a-button>
              
              <a-button block @click="handleDuplicate" class="action-btn">
                <CopyOutlined />
                复制需求
              </a-button>
              
              <a-button block @click="handleExport" class="action-btn">
                <ExportOutlined />
                导出需求
              </a-button>
              
              <a-button block @click="handleCreateTask" class="action-btn">
                <PlusOutlined />
                创建任务
              </a-button>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance, UploadProps } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CheckOutlined,
  UserOutlined,
  CheckSquareOutlined,
  BookOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  DeleteOutlined,
  PlusOutlined,
  UpOutlined,
  DownOutlined,
  UploadOutlined,
  FileOutlined,
  DownloadOutlined,
  EyeOutlined,
  CopyOutlined,
  ExportOutlined,
  EditOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 路由
const router = useRouter()
const route = useRoute()

// 响应式数据
const formRef = ref<FormInstance>()
const savingDraft = ref(false)
const submitting = ref(false)
const newTag = ref('')
const fileList = ref([])
const searchedRequirements = ref([])
const changeNote = ref('')
const notifyUsers = ref(['assignee'])
const requirementId = ref(route.params.id as string)

const formData = reactive({
  title: '',
  type: '',
  priority: '',
  status: '',
  source: '',
  projectId: '',
  progress: 0,
  expectedStartDate: null,
  expectedEndDate: null,
  description: '',
  acceptanceCriteria: [{ content: '' }],
  relatedRequirements: [],
  tags: [],
  assigneeId: '',
  reviewers: [],
  ccUsers: []
})

// 现有附件
const existingAttachments = ref([
  {
    id: '1',
    name: '需求原型.sketch',
    size: 2048576,
    type: 'sketch',
    uploadTime: '2024-01-16T09:00:00Z'
  },
  {
    id: '2',
    name: '用户调研报告.pdf',
    size: 5242880,
    type: 'pdf',
    uploadTime: '2024-01-17T14:30:00Z'
  }
])

// 模拟数据
const projects = ref([
  { id: '1', name: 'Verto 产品原型设计平台' },
  { id: '2', name: '移动端App项目' },
  { id: '3', name: '管理后台系统' }
])

const users = ref([
  { id: '1', name: '张三', avatar: 'https://via.placeholder.com/32x32' },
  { id: '2', name: '李四', avatar: 'https://via.placeholder.com/32x32' },
  { id: '3', name: '王五', avatar: 'https://via.placeholder.com/32x32' },
  { id: '4', name: '赵六', avatar: 'https://via.placeholder.com/32x32' }
])

const recentActions = ref([
  {
    id: '1',
    type: 'updated',
    user: '李四',
    time: '2024-01-20T15:30:00Z',
    content: '更新了需求描述'
  },
  {
    id: '2',
    type: 'status_changed',
    user: '张三',
    time: '2024-01-19T10:15:00Z',
    content: '状态变更为进行中'
  },
  {
    id: '3',
    type: 'assigned',
    user: '张三',
    time: '2024-01-18T14:20:00Z',
    content: '分配给李四'
  }
])

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入需求标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择需求类型', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  projectId: [
    { required: true, message: '请选择所属项目', trigger: 'change' }
  ],
  source: [
    { required: true, message: '请选择需求来源', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入需求描述', trigger: 'blur' },
    { min: 20, message: '描述至少20个字符', trigger: 'blur' }
  ]
}

// 计算属性
const totalAttachments = computed(() => {
  return existingAttachments.value.length + fileList.value.length
})

// 方法
/**
 * 返回上一页
 */
const handleBack = () => {
  router.go(-1)
}

/**
 * 插入模板内容
 */
const insertTemplate = (type: string) => {
  const templates = {
    'user-story': '作为一个[用户角色]，我希望[功能描述]，以便[业务价值]。',
    'acceptance-criteria': '给定[前置条件]，当[操作行为]，那么[预期结果]。',
    'business-rules': '业务规则：\n1. [规则1]\n2. [规则2]\n3. [规则3]'
  }
  
  const template = templates[type]
  if (template) {
    const currentDesc = formData.description
    formData.description = currentDesc ? `${currentDesc}\n\n${template}` : template
  }
}

/**
 * 格式化文本
 */
const formatText = (type: string) => {
  // 这里可以实现富文本编辑功能
  message.info(`${type} 格式化功能开发中`)
}

/**
 * 添加验收标准
 */
const addCriteria = () => {
  formData.acceptanceCriteria.push({ content: '' })
}

/**
 * 移除验收标准
 */
const removeCriteria = (index: number) => {
  if (formData.acceptanceCriteria.length > 1) {
    formData.acceptanceCriteria.splice(index, 1)
  }
}

/**
 * 上移验收标准
 */
const moveCriteriaUp = (index: number) => {
  if (index > 0) {
    const item = formData.acceptanceCriteria.splice(index, 1)[0]
    formData.acceptanceCriteria.splice(index - 1, 0, item)
  }
}

/**
 * 下移验收标准
 */
const moveCriteriaDown = (index: number) => {
  if (index < formData.acceptanceCriteria.length - 1) {
    const item = formData.acceptanceCriteria.splice(index, 1)[0]
    formData.acceptanceCriteria.splice(index + 1, 0, item)
  }
}

/**
 * 添加标签
 */
const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !formData.tags.includes(tag)) {
    formData.tags.push(tag)
    newTag.value = ''
  } else if (formData.tags.includes(tag)) {
    message.warning('该标签已存在')
  }
}

/**
 * 移除标签
 */
const removeTag = (tag: string) => {
  const index = formData.tags.indexOf(tag)
  if (index > -1) {
    formData.tags.splice(index, 1)
  }
}

/**
 * 搜索需求
 */
const handleSearchRequirements = (value: string) => {
  // 模拟搜索
  if (value) {
    searchedRequirements.value = [
      { id: '1', title: `相关需求: ${value}`, status: 'pending' },
      { id: '2', title: `关联需求: ${value}`, status: 'completed' }
    ]
  } else {
    searchedRequirements.value = []
  }
}

/**
 * 文件上传前验证
 */
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('文件大小不能超过 10MB!')
    return false
  }
  
  if (totalAttachments.value >= 10) {
    message.error('最多只能上传 10 个文件!')
    return false
  }
  
  return false // 阻止自动上传
}

/**
 * 移除文件
 */
const handleRemoveFile = (file: any) => {
  const index = fileList.value.indexOf(file)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}

/**
 * 下载附件
 */
const downloadAttachment = (attachment: any) => {
  message.success(`下载 ${attachment.name}`)
}

/**
 * 移除现有附件
 */
const removeExistingAttachment = (attachment: any) => {
  const index = existingAttachments.value.findIndex(a => a.id === attachment.id)
  if (index > -1) {
    existingAttachments.value.splice(index, 1)
    message.success('附件已移除')
  }
}

/**
 * 保存草稿
 */
const handleSaveDraft = async () => {
  savingDraft.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('草稿保存成功')
  } catch (error) {
    message.error('保存失败，请重试')
  } finally {
    savingDraft.value = false
  }
}

/**
 * 提交更改
 */
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    // 验证验收标准
    const validCriteria = formData.acceptanceCriteria.filter(c => c.content.trim())
    if (validCriteria.length === 0) {
      message.error('请至少添加一条验收标准')
      return
    }
    
    // 验证变更说明
    if (!changeNote.value.trim()) {
      message.error('请填写变更说明')
      return
    }
    
    submitting.value = true
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    message.success('需求更新成功')
    router.push(`/requirements/${requirementId.value}`)
  } catch (error) {
    message.error('请检查表单信息')
  } finally {
    submitting.value = false
  }
}

/**
 * 预览需求
 */
const handlePreview = () => {
  router.push(`/requirements/${requirementId.value}`)
}

/**
 * 复制需求
 */
const handleDuplicate = () => {
  router.push(`/requirements/new?copy=${requirementId.value}`)
}

/**
 * 导出需求
 */
const handleExport = () => {
  message.success('导出功能开发中')
}

/**
 * 创建任务
 */
const handleCreateTask = () => {
  router.push(`/tasks/new?requirement=${requirementId.value}`)
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return dayjs(date).format('MM-DD HH:mm')
}

/**
 * 格式化文件大小
 */
const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colors = {
    pending: 'default',
    in_progress: 'processing',
    review: 'warning',
    completed: 'success',
    rejected: 'error',
    archived: 'default'
  }
  return colors[status] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const texts = {
    pending: '待处理',
    in_progress: '进行中',
    review: '评审中',
    completed: '已完成',
    rejected: '已拒绝',
    archived: '已归档'
  }
  return texts[status] || status
}

/**
 * 获取操作图标
 */
const getActionIcon = (type: string) => {
  const icons = {
    updated: EditOutlined,
    status_changed: ClockCircleOutlined,
    assigned: UserOutlined,
    created: PlusOutlined
  }
  return icons[type] || EditOutlined
}

/**
 * 加载需求数据
 */
const loadRequirementData = async () => {
  try {
    // 模拟加载数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 填充表单数据
    Object.assign(formData, {
      title: '用户登录功能优化',
      type: 'improvement',
      priority: 'high',
      status: 'in_progress',
      source: 'customer',
      projectId: '1',
      progress: 65,
      expectedStartDate: dayjs('2024-01-25'),
      expectedEndDate: dayjs('2024-02-15'),
      description: `需求背景：\n当前用户登录流程存在以下问题：\n1. 登录页面加载速度较慢\n2. 验证码识别困难\n3. 忘记密码流程复杂\n4. 移动端适配不佳\n\n优化目标：\n作为一个用户，我希望能够快速、便捷地登录系统，以便开始使用产品功能。`,
      acceptanceCriteria: [
        { content: '登录页面在3G网络下加载时间不超过2秒' },
        { content: '验证码识别成功率达到95%以上' },
        { content: '忘记密码流程步骤不超过3步' },
        { content: '移动端登录成功率达到98%以上' }
      ],
      relatedRequirements: [],
      tags: ['登录', '性能优化', '用户体验'],
      assigneeId: '2',
      reviewers: ['3', '4'],
      ccUsers: []
    })
  } catch (error) {
    message.error('加载需求数据失败')
  }
}

// 生命周期
onMounted(() => {
  loadRequirementData()
})
</script>

<style scoped>
.requirement-edit-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #262626;
}

.requirement-id {
  margin: 0;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.form-card,
.info-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.requirement-form {
  margin-bottom: 0;
}

.progress-display {
  text-align: center;
  margin-top: 8px;
  font-weight: 500;
  color: #262626;
}

.editor-container {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
}

.editor-toolbar {
  padding: 8px 12px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.editor-toolbar + .ant-input {
  border: none;
  border-radius: 0;
}

.criteria-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.criteria-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.criteria-input {
  flex: 1;
}

.criteria-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tags-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.add-tag {
  display: flex;
  gap: 8px;
  align-items: center;
}

.attachments-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.existing-attachments h4,
.new-attachments h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.attachment-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.attachment-icon {
  font-size: 20px;
  color: #666;
}

.attachment-details {
  flex: 1;
}

.attachment-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.attachment-meta {
  font-size: 12px;
  color: #666;
}

.attachment-actions {
  display: flex;
  gap: 8px;
}

.upload-tips {
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}

.upload-tips p {
  margin: 2px 0;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  flex: 1;
}

.requirement-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.req-title {
  flex: 1;
  margin-right: 8px;
}

.notify-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-item {
  margin-bottom: 8px;
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.action-user {
  font-weight: 500;
  color: #262626;
}

.action-time {
  font-size: 12px;
  color: #999;
}

.action-content {
  color: #666;
  font-size: 13px;
}

.timeline-icon {
  font-size: 12px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content :deep(.ant-col:first-child) {
    width: 100% !important;
    margin-bottom: 24px;
  }
  
  .main-content :deep(.ant-col:last-child) {
    width: 100% !important;
  }
}

@media (max-width: 768px) {
  .header-actions {
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
  
  .main-content {
    padding: 16px;
  }
  
  .requirement-form :deep(.ant-col) {
    width: 100% !important;
    margin-bottom: 0;
  }
  
  .criteria-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .criteria-actions {
    flex-direction: row;
    justify-content: flex-end;
    margin-top: 8px;
  }
  
  .add-tag {
    flex-direction: column;
    align-items: stretch;
  }
  
  .add-tag .ant-input {
    width: 100% !important;
    margin-bottom: 8px;
  }
  
  .attachment-item {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .attachment-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 576px) {
  .header-actions {
    padding: 12px 16px;
  }
  
  .page-title {
    font-size: 16px;
  }
  
  .main-content {
    padding: 12px;
  }
  
  .header-right :deep(.ant-space) {
    flex-direction: column;
    width: 100%;
  }
  
  .header-right :deep(.ant-space-item) {
    width: 100%;
  }
  
  .header-right .ant-btn {
    width: 100%;
  }
  
  .editor-toolbar :deep(.ant-space) {
    flex-wrap: wrap;
  }
}
</style>