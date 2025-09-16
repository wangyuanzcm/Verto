<template>
  <div class="requirement-new-view">
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <a-button type="text" @click="goBack" class="back-btn">
            <ArrowLeftOutlined />
            返回
          </a-button>
          <div class="title-section">
            <h1>新建需求</h1>
            <p>创建新的产品需求文档</p>
          </div>
        </div>
        <div class="header-actions">
          <a-button @click="saveDraft" :loading="savingDraft">
            保存草稿
          </a-button>
          <a-button type="primary" @click="submitRequirement" :loading="submitting">
            提交需求
          </a-button>
        </div>
      </div>
    </div>

    <div class="requirement-form">
      <a-form
        :model="requirementForm"
        :rules="rules"
        layout="vertical"
        ref="formRef"
        @finish="onFinish"
      >
        <!-- 基本信息 -->
        <a-card title="基本信息" class="form-card">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="需求标题" name="title">
                <a-input
                  v-model:value="requirementForm.title"
                  placeholder="请输入需求标题"
                  size="large"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="需求类型" name="type">
                <a-select
                  v-model:value="requirementForm.type"
                  placeholder="选择需求类型"
                  size="large"
                >
                  <a-select-option value="feature">功能需求</a-select-option>
                  <a-select-option value="enhancement">功能增强</a-select-option>
                  <a-select-option value="bugfix">问题修复</a-select-option>
                  <a-select-option value="performance">性能优化</a-select-option>
                  <a-select-option value="ui">界面优化</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="优先级" name="priority">
                <a-select
                  v-model:value="requirementForm.priority"
                  placeholder="选择优先级"
                  size="large"
                >
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
              <a-form-item label="预期完成时间" name="expectedDate">
                <a-date-picker
                  v-model:value="requirementForm.expectedDate"
                  placeholder="选择预期完成时间"
                  size="large"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="负责人" name="assignee">
                <a-select
                  v-model:value="requirementForm.assignee"
                  placeholder="选择负责人"
                  size="large"
                  show-search
                  :filter-option="filterOption"
                >
                  <a-select-option
                    v-for="user in userList"
                    :key="user.id"
                    :value="user.id"
                  >
                    <div class="user-option">
                      <a-avatar :size="24" :src="user.avatar">
                        {{ user.name.charAt(0) }}
                      </a-avatar>
                      <span>{{ user.name }}</span>
                    </div>
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="需求描述" name="description">
            <a-textarea
              v-model:value="requirementForm.description"
              placeholder="详细描述需求的背景、目标和具体要求..."
              :rows="4"
              show-count
              :maxlength="1000"
            />
          </a-form-item>
        </a-card>

        <!-- 详细规格 -->
        <a-card title="详细规格" class="form-card">
          <a-form-item label="用户故事" name="userStory">
            <a-textarea
              v-model:value="requirementForm.userStory"
              placeholder="作为[用户角色]，我希望[功能描述]，以便[价值/目标]..."
              :rows="3"
            />
          </a-form-item>

          <a-form-item label="验收标准">
            <div class="acceptance-criteria">
              <div
                v-for="(criteria, index) in requirementForm.acceptanceCriteria"
                :key="index"
                class="criteria-item"
              >
                <a-input
                  v-model:value="criteria.content"
                  placeholder="输入验收标准"
                  class="criteria-input"
                />
                <a-button
                  type="text"
                  danger
                  @click="removeCriteria(index)"
                  :disabled="requirementForm.acceptanceCriteria.length <= 1"
                >
                  <DeleteOutlined />
                </a-button>
              </div>
              <a-button type="dashed" @click="addCriteria" block>
                <PlusOutlined />
                添加验收标准
              </a-button>
            </div>
          </a-form-item>

          <a-form-item label="技术要求">
            <a-textarea
              v-model:value="requirementForm.technicalRequirements"
              placeholder="描述技术实现要求、性能指标、兼容性等..."
              :rows="3"
            />
          </a-form-item>
        </a-card>

        <!-- 附件和关联 -->
        <a-card title="附件和关联" class="form-card">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="相关文档">
                <a-upload
                  v-model:file-list="requirementForm.attachments"
                  :before-upload="beforeUpload"
                  multiple
                >
                  <a-button>
                    <UploadOutlined />
                    上传文档
                  </a-button>
                </a-upload>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="关联项目">
                <a-select
                  v-model:value="requirementForm.relatedProjects"
                  placeholder="选择关联项目"
                  mode="multiple"
                  :options="projectOptions"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="标签">
            <a-select
              v-model:value="requirementForm.tags"
              placeholder="添加标签"
              mode="tags"
              style="width: 100%"
              :options="tagOptions"
            />
          </a-form-item>
        </a-card>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs, { type Dayjs } from 'dayjs'
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons-vue'
import type { Rule } from 'ant-design-vue/es/form'
import type { UploadProps } from 'ant-design-vue'

const router = useRouter()
const formRef = ref()

// 表单数据
const requirementForm = reactive({
  title: '',
  type: '',
  priority: '',
  expectedDate: null as Dayjs | null,
  assignee: '',
  description: '',
  userStory: '',
  acceptanceCriteria: [{ content: '' }],
  technicalRequirements: '',
  attachments: [],
  relatedProjects: [],
  tags: []
})

// 状态
const submitting = ref(false)
const savingDraft = ref(false)

// 用户列表
const userList = ref([
  { id: '1', name: '张三', avatar: '' },
  { id: '2', name: '李四', avatar: '' },
  { id: '3', name: '王五', avatar: '' },
  { id: '4', name: '赵六', avatar: '' }
])

// 项目选项
const projectOptions = ref([
  { label: '电商平台', value: 'ecommerce' },
  { label: '管理系统', value: 'admin' },
  { label: '移动应用', value: 'mobile' }
])

// 标签选项
const tagOptions = ref([
  { label: '前端', value: 'frontend' },
  { label: '后端', value: 'backend' },
  { label: 'UI/UX', value: 'ui-ux' },
  { label: '数据库', value: 'database' },
  { label: 'API', value: 'api' }
])

// 表单验证规则
const rules: Record<string, Rule[]> = {
  title: [
    { required: true, message: '请输入需求标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度应在5-100个字符之间', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择需求类型', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入需求描述', trigger: 'blur' },
    { min: 10, message: '描述至少需要10个字符', trigger: 'blur' }
  ]
}

/**
 * 返回上一页
 */
const goBack = () => {
  router.back()
}

/**
 * 用户搜索过滤
 */
const filterOption = (input: string, option: any) => {
  return option.children.props.children[1].children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

/**
 * 添加验收标准
 */
const addCriteria = () => {
  requirementForm.acceptanceCriteria.push({ content: '' })
}

/**
 * 删除验收标准
 */
const removeCriteria = (index: number) => {
  if (requirementForm.acceptanceCriteria.length > 1) {
    requirementForm.acceptanceCriteria.splice(index, 1)
  }
}

/**
 * 文件上传前验证
 */
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isValidType = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ].includes(file.type)
  
  if (!isValidType) {
    message.error('只能上传 PDF、Word 文档或图片文件!')
    return false
  }
  
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('文件大小不能超过 10MB!')
    return false
  }
  
  return false // 阻止自动上传，手动处理
}

/**
 * 保存草稿
 */
const saveDraft = async () => {
  savingDraft.value = true
  try {
    // TODO: 调用API保存草稿
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('草稿保存成功')
  } catch (error) {
    message.error('保存草稿失败')
  } finally {
    savingDraft.value = false
  }
}

/**
 * 提交需求
 */
const submitRequirement = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true
    
    // TODO: 调用API提交需求
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    message.success('需求提交成功')
    router.push('/requirements')
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

/**
 * 表单提交处理
 */
const onFinish = (values: any) => {
  console.log('表单数据:', values)
  submitRequirement()
}

/**
 * 加载初始数据
 */
const loadInitialData = async () => {
  try {
    // TODO: 加载用户列表、项目列表等数据
    console.log('加载初始数据')
  } catch (error) {
    message.error('加载数据失败')
  }
}

onMounted(() => {
  loadInitialData()
})
</script>

<style scoped>
.requirement-new-view {
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  background: white;
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: #666;
}

.back-btn:hover {
  color: #1890ff;
  background: #f0f8ff;
}

.title-section h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

.title-section p {
  margin: 4px 0 0 0;
  color: #8c8c8c;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.requirement-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.form-card {
  margin-bottom: 24px;
}

.form-card :deep(.ant-card-head-title) {
  font-weight: 600;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.acceptance-criteria {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 16px;
  background: #fafafa;
}

.criteria-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.criteria-item:last-of-type {
  margin-bottom: 16px;
}

.criteria-input {
  flex: 1;
}

@media (max-width: 768px) {
  .page-header {
    padding: 12px 16px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-left {
    width: 100%;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .requirement-form {
    padding: 16px;
  }
  
  .criteria-item {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>