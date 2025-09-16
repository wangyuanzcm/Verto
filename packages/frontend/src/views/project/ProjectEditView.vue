<template>
  <div class="project-edit-view">
    <a-card :bordered="false">
      <template #title>
        <div class="page-header">
          <a-button type="text" @click="$router.go(-1)">
            <ArrowLeftOutlined />
            返回
          </a-button>
          <span class="page-title">{{ isEdit ? '编辑项目' : '创建项目' }}</span>
        </div>
      </template>
      
      <div class="project-form">
        <a-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          layout="vertical"
          @finish="handleSubmit"
        >
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="项目名称" name="name">
                <a-input v-model:value="formData.name" placeholder="请输入项目名称" />
              </a-form-item>
            </a-col>
            
            <a-col :span="12">
              <a-form-item label="项目状态" name="status">
                <a-select v-model:value="formData.status" placeholder="请选择项目状态">
                  <a-select-option value="active">进行中</a-select-option>
                  <a-select-option value="inactive">已完成</a-select-option>
                  <a-select-option value="pending">待开始</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item label="项目描述" name="description">
            <a-textarea 
              v-model:value="formData.description" 
              placeholder="请输入项目描述"
              :rows="4"
            />
          </a-form-item>
          
          <a-form-item label="项目标签" name="tags">
            <a-select
              v-model:value="formData.tags"
              mode="tags"
              placeholder="请输入项目标签"
              :options="tagOptions"
            />
          </a-form-item>
          
          <a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit" :loading="loading">
                {{ isEdit ? '更新' : '创建' }}
              </a-button>
              <a-button @click="handleReset">重置</a-button>
              <a-button @click="$router.go(-1)">取消</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import type { FormInstance } from 'ant-design-vue'

// 响应式数据
const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

// 判断是否为编辑模式
const isEdit = computed(() => !!route.params.id)

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  status: 'active',
  tags: []
})

// 标签选项
const tagOptions = ref([
  { label: '前端', value: 'frontend' },
  { label: '后端', value: 'backend' },
  { label: '移动端', value: 'mobile' },
  { label: '桌面应用', value: 'desktop' },
  { label: 'Web应用', value: 'web' },
  { label: 'API', value: 'api' }
])

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '项目名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择项目状态', trigger: 'change' }
  ],
  description: [
    { max: 500, message: '描述不能超过 500 个字符', trigger: 'blur' }
  ]
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  try {
    loading.value = true
    
    // TODO: 调用API保存项目
    if (isEdit.value) {
      // 更新项目
      console.log('更新项目:', formData)
      message.success('项目更新成功')
    } else {
      // 创建项目
      console.log('创建项目:', formData)
      message.success('项目创建成功')
    }
    
    // 返回项目列表
    router.push('/projects')
  } catch (error) {
    message.error(isEdit.value ? '项目更新失败' : '项目创建失败')
  } finally {
    loading.value = false
  }
}

/**
 * 重置表单
 */
const handleReset = () => {
  formRef.value?.resetFields()
}

/**
 * 加载项目详情（编辑模式）
 */
const loadProjectDetail = async () => {
  if (!isEdit.value) return
  
  try {
    const projectId = route.params.id
    // TODO: 调用API获取项目详情
    
    // 模拟数据
    Object.assign(formData, {
      name: '示例项目',
      description: '这是一个示例项目的描述信息',
      status: 'active',
      tags: ['frontend', 'web']
    })
  } catch (error) {
    message.error('加载项目详情失败')
  }
}

// 生命周期
onMounted(() => {
  loadProjectDetail()
})
</script>

<style scoped>
.project-edit-view {
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.project-form {
  margin-top: 24px;
  max-width: 800px;
}

.ant-form-item {
  margin-bottom: 24px;
}
</style>