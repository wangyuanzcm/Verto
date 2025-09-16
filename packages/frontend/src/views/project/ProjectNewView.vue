<template>
  <div class="project-new">
    <div class="page-header">
      <el-button 
        type="text" 
        @click="$router.back()"
        class="back-button"
      >
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2>创建新项目</h2>
    </div>

    <el-card class="form-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        size="large"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="项目名称" prop="name">
              <el-input 
                v-model="form.name" 
                placeholder="请输入项目名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目编码" prop="code">
              <el-input 
                v-model="form.code" 
                placeholder="请输入项目编码"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入项目描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="项目类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择项目类型">
                <el-option label="Web应用" value="web" />
                <el-option label="移动应用" value="mobile" />
                <el-option label="桌面应用" value="desktop" />
                <el-option label="API服务" value="api" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="form.priority" placeholder="请选择优先级">
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择项目状态">
                <el-option label="进行中" value="active" />
                <el-option label="已暂停" value="paused" />
                <el-option label="计划中" value="planning" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startDate">
              <el-date-picker
                v-model="form.startDate"
                type="date"
                placeholder="请选择开始时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止时间" prop="deadline">
              <el-date-picker
                v-model="form.deadline"
                type="date"
                placeholder="请选择截止时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="项目负责人" prop="ownerId">
          <el-select 
            v-model="form.ownerId" 
            placeholder="请选择项目负责人"
            filterable
            remote
            :remote-method="searchUsers"
            :loading="userLoading"
          >
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="团队成员">
          <el-select 
            v-model="form.memberIds" 
            placeholder="请选择团队成员"
            multiple
            filterable
            remote
            :remote-method="searchUsers"
            :loading="userLoading"
          >
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="技术栈">
          <el-select 
            v-model="form.technologies" 
            placeholder="请选择技术栈"
            multiple
            allow-create
            filterable
          >
            <el-option label="Vue.js" value="vue" />
            <el-option label="React" value="react" />
            <el-option label="Angular" value="angular" />
            <el-option label="Node.js" value="nodejs" />
            <el-option label="Java" value="java" />
            <el-option label="Python" value="python" />
            <el-option label="TypeScript" value="typescript" />
            <el-option label="JavaScript" value="javascript" />
          </el-select>
        </el-form-item>

        <el-form-item label="项目模板">
          <el-radio-group v-model="form.template">
            <el-radio label="blank">空白项目</el-radio>
            <el-radio label="basic">基础模板</el-radio>
            <el-radio label="advanced">高级模板</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            创建项目
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

interface User {
  id: string
  name: string
  email: string
}

interface ProjectForm {
  name: string
  code: string
  description: string
  type: string
  priority: string
  status: string
  startDate: string
  deadline: string
  ownerId: string
  memberIds: string[]
  technologies: string[]
  template: string
}

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const userLoading = ref(false)
const users = ref<User[]>([])

// 表单数据
const form = reactive<ProjectForm>({
  name: '',
  code: '',
  description: '',
  type: '',
  priority: 'medium',
  status: 'active',
  startDate: '',
  deadline: '',
  ownerId: '',
  memberIds: [],
  technologies: [],
  template: 'blank'
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '项目名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入项目编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '项目编码只能包含字母、数字、下划线和横线', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入项目描述', trigger: 'blur' },
    { max: 500, message: '项目描述不能超过 500 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择项目类型', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择项目状态', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  deadline: [
    { required: true, message: '请选择截止时间', trigger: 'change' }
  ],
  ownerId: [
    { required: true, message: '请选择项目负责人', trigger: 'change' }
  ]
}

/**
 * 搜索用户
 * @param query 搜索关键词
 */
const searchUsers = async (query: string) => {
  if (!query) {
    users.value = []
    return
  }
  
  userLoading.value = true
  try {
    // TODO: 调用API搜索用户
    // 模拟数据
    users.value = [
      { id: '1', name: '张三', email: 'zhangsan@example.com' },
      { id: '2', name: '李四', email: 'lisi@example.com' },
      { id: '3', name: '王五', email: 'wangwu@example.com' }
    ].filter(user => user.name.includes(query))
  } catch (error) {
    ElMessage.error('搜索用户失败')
  } finally {
    userLoading.value = false
  }
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    // TODO: 调用API创建项目
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    
    ElMessage.success('项目创建成功')
    router.push('/project')
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      ElMessage.error('创建项目失败，请重试')
    }
  } finally {
    submitting.value = false
  }
}

/**
 * 重置表单
 */
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}

/**
 * 加载初始数据
 */
const loadInitialData = async () => {
  try {
    // TODO: 加载用户列表等初始数据
    users.value = [
      { id: '1', name: '张三', email: 'zhangsan@example.com' },
      { id: '2', name: '李四', email: 'lisi@example.com' },
      { id: '3', name: '王五', email: 'wangwu@example.com' }
    ]
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

// 生命周期
onMounted(() => {
  loadInitialData()
})
</script>

<style scoped lang="scss">
.project-new {
  .page-header {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    
    .back-button {
      margin-right: 16px;
      padding: 8px;
      
      .el-icon {
        margin-right: 4px;
      }
    }
    
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .form-card {
    max-width: 800px;
    
    :deep(.el-form-item__label) {
      font-weight: 500;
    }
    
    :deep(.el-textarea__inner) {
      resize: vertical;
    }
  }
}
</style>