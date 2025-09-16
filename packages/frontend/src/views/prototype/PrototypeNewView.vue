<template>
  <div class="prototype-new">
    <a-card class="form-card">
      <template #title>
        <div class="card-header">
          <a-button type="text" @click="goBack" class="back-btn">
            <template #icon>
              <ArrowLeftOutlined />
            </template>
            返回
          </a-button>
          <span class="card-title">新建原型</span>
        </div>
      </template>
      
      <template #extra>
        <a-space>
          <a-button @click="handleSaveDraft" :loading="savingDraft">
            保存草稿
          </a-button>
          <a-button type="primary" @click="handleSubmit" :loading="submitting">
            创建原型
          </a-button>
        </a-space>
      </template>

      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        layout="vertical"
        class="prototype-form"
      >
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item label="原型名称" name="name" required>
              <a-input
                v-model:value="formData.name"
                placeholder="请输入原型名称"
                size="large"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item label="原型描述" name="description">
              <a-textarea
                v-model:value="formData.description"
                placeholder="请输入原型描述"
                :rows="4"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="关联项目" name="projectId">
              <a-select
                v-model:value="formData.projectId"
                placeholder="请选择关联项目"
                size="large"
                allow-clear
              >
                <a-select-option
                  v-for="project in projects"
                  :key="project.id"
                  :value="project.id"
                >
                  {{ project.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="关联需求" name="requirementId">
              <a-select
                v-model:value="formData.requirementId"
                placeholder="请选择关联需求"
                size="large"
                allow-clear
                :disabled="!formData.projectId"
              >
                <a-select-option
                  v-for="requirement in filteredRequirements"
                  :key="requirement.id"
                  :value="requirement.id"
                >
                  {{ requirement.title }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="原型类型" name="type" required>
              <a-select
                v-model:value="formData.type"
                placeholder="请选择原型类型"
                size="large"
              >
                <a-select-option value="web">Web页面</a-select-option>
                <a-select-option value="mobile">移动端页面</a-select-option>
                <a-select-option value="desktop">桌面应用</a-select-option>
                <a-select-option value="component">组件原型</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="设备尺寸" name="deviceSize">
              <a-select
                v-model:value="formData.deviceSize"
                placeholder="请选择设备尺寸"
                size="large"
              >
                <a-select-option value="desktop">桌面端 (1920x1080)</a-select-option>
                <a-select-option value="tablet">平板 (768x1024)</a-select-option>
                <a-select-option value="mobile">手机 (375x667)</a-select-option>
                <a-select-option value="custom">自定义尺寸</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24" v-if="formData.deviceSize === 'custom'">
          <a-col :span="12">
            <a-form-item label="宽度 (px)" name="customWidth">
              <a-input-number
                v-model:value="formData.customWidth"
                placeholder="请输入宽度"
                :min="320"
                :max="3840"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="高度 (px)" name="customHeight">
              <a-input-number
                v-model:value="formData.customHeight"
                placeholder="请输入高度"
                :min="240"
                :max="2160"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item label="标签" name="tags">
              <a-select
                v-model:value="formData.tags"
                mode="tags"
                placeholder="请输入标签，按回车添加"
                size="large"
                :token-separators="[',']"
              >
                <a-select-option
                  v-for="tag in commonTags"
                  :key="tag"
                  :value="tag"
                >
                  {{ tag }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item label="模板选择" name="templateId">
              <div class="template-grid">
                <div
                  v-for="template in templates"
                  :key="template.id"
                  class="template-item"
                  :class="{ active: formData.templateId === template.id }"
                  @click="selectTemplate(template.id)"
                >
                  <div class="template-preview">
                    <img v-if="template.preview" :src="template.preview" :alt="template.name" />
                    <div v-else class="preview-placeholder">
                      <FileImageOutlined />
                    </div>
                  </div>
                  <div class="template-info">
                    <div class="template-name">{{ template.name }}</div>
                    <div class="template-description">{{ template.description }}</div>
                  </div>
                </div>
              </div>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  FileImageOutlined
} from '@ant-design/icons-vue'

// 路由
const router = useRouter()

// 响应式数据
const formRef = ref()
const submitting = ref(false)
const savingDraft = ref(false)

const formData = reactive({
  name: '',
  description: '',
  projectId: undefined,
  requirementId: undefined,
  type: 'web',
  deviceSize: 'desktop',
  customWidth: 1920,
  customHeight: 1080,
  tags: [],
  templateId: undefined
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入原型名称', trigger: 'blur' },
    { min: 2, max: 50, message: '原型名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择原型类型', trigger: 'change' }
  ],
  customWidth: [
    { required: true, message: '请输入宽度', trigger: 'blur', when: () => formData.deviceSize === 'custom' }
  ],
  customHeight: [
    { required: true, message: '请输入高度', trigger: 'blur', when: () => formData.deviceSize === 'custom' }
  ]
}

// 模拟数据
const projects = ref([
  { id: '1', name: '电商平台项目' },
  { id: '2', name: '管理后台项目' },
  { id: '3', name: '移动应用项目' }
])

const requirements = ref([
  { id: '1', title: '用户登录功能', projectId: '1' },
  { id: '2', title: '商品列表页面', projectId: '1' },
  { id: '3', title: '用户管理模块', projectId: '2' },
  { id: '4', title: '数据统计页面', projectId: '2' }
])

const commonTags = ref([
  '登录页面', '列表页面', '详情页面', '表单页面', '移动端', 'PC端', '管理后台'
])

const templates = ref([
  {
    id: '1',
    name: '空白模板',
    description: '从空白画布开始设计',
    preview: null
  },
  {
    id: '2',
    name: '登录页面模板',
    description: '包含用户名密码登录表单',
    preview: 'https://via.placeholder.com/200x150'
  },
  {
    id: '3',
    name: '列表页面模板',
    description: '包含搜索、筛选、表格等组件',
    preview: 'https://via.placeholder.com/200x150'
  },
  {
    id: '4',
    name: '详情页面模板',
    description: '包含详情展示、操作按钮等',
    preview: 'https://via.placeholder.com/200x150'
  }
])

// 计算属性
const filteredRequirements = computed(() => {
  if (!formData.projectId) return []
  return requirements.value.filter(req => req.projectId === formData.projectId)
})

// 监听项目变化，清空需求选择
watch(
  () => formData.projectId,
  () => {
    formData.requirementId = undefined
  }
)

// 方法
/**
 * 返回上一页
 */
const goBack = () => {
  router.go(-1)
}

/**
 * 选择模板
 */
const selectTemplate = (templateId: string) => {
  formData.templateId = formData.templateId === templateId ? undefined : templateId
}

/**
 * 保存草稿
 */
const handleSaveDraft = async () => {
  savingDraft.value = true
  try {
    // 这里应该调用API保存草稿
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('草稿保存成功')
  } catch (error) {
    message.error('草稿保存失败')
  } finally {
    savingDraft.value = false
  }
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    // 这里应该调用API创建原型
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    message.success('原型创建成功')
    router.push('/prototype')
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.prototype-new {
  max-width: 1200px;
  margin: 0 auto;
}

.form-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
}

.prototype-form {
  margin-top: 24px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.template-item {
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.template-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.template-item.active {
  border-color: #1890ff;
  background: #f6ffed;
}

.template-preview {
  width: 100%;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.template-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  color: #bfbfbf;
  font-size: 24px;
}

.template-info {
  text-align: center;
}

.template-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.template-description {
  font-size: 12px;
  color: #666;
}

@media (max-width: 768px) {
  .prototype-new {
    margin: 0;
  }
  
  .template-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .template-preview {
    height: 100px;
  }
}
</style>