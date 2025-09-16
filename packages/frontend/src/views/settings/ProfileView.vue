<template>
  <div class="profile-view">
    <div class="page-header">
      <h1>个人资料</h1>
      <p>管理您的个人信息和偏好设置</p>
    </div>

    <div class="profile-content">
      <!-- 头像设置 -->
      <a-card title="头像设置" class="profile-card">
        <div class="avatar-section">
          <div class="avatar-display">
            <a-avatar :size="80" :src="userProfile.avatar">
              <template #icon><UserOutlined /></template>
            </a-avatar>
          </div>
          <div class="avatar-actions">
            <a-upload
              :show-upload-list="false"
              :before-upload="beforeAvatarUpload"
              @change="handleAvatarChange"
            >
              <a-button type="primary">
                <UploadOutlined />
                上传头像
              </a-button>
            </a-upload>
            <a-button @click="removeAvatar" v-if="userProfile.avatar">
              删除头像
            </a-button>
          </div>
        </div>
      </a-card>

      <!-- 基本信息 -->
      <a-card title="基本信息" class="profile-card">
        <a-form
          :model="userProfile"
          :rules="rules"
          layout="vertical"
          @finish="saveProfile"
          ref="profileFormRef"
        >
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="用户名" name="username">
                <a-input v-model:value="userProfile.username" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="邮箱" name="email">
                <a-input v-model:value="userProfile.email" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="姓名" name="realName">
                <a-input v-model:value="userProfile.realName" placeholder="请输入真实姓名" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="手机号" name="phone">
                <a-input v-model:value="userProfile.phone" placeholder="请输入手机号" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="部门" name="department">
                <a-select v-model:value="userProfile.department" placeholder="选择部门">
                  <a-select-option value="frontend">前端开发</a-select-option>
                  <a-select-option value="backend">后端开发</a-select-option>
                  <a-select-option value="design">UI设计</a-select-option>
                  <a-select-option value="product">产品经理</a-select-option>
                  <a-select-option value="test">测试工程师</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="职位" name="position">
                <a-input v-model:value="userProfile.position" placeholder="请输入职位" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="个人简介" name="bio">
            <a-textarea
              v-model:value="userProfile.bio"
              placeholder="介绍一下自己..."
              :rows="4"
              :maxlength="200"
              show-count
            />
          </a-form-item>

          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="saving">
              保存更改
            </a-button>
            <a-button @click="resetForm" style="margin-left: 8px">
              重置
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>

      <!-- 偏好设置 -->
      <a-card title="偏好设置" class="profile-card">
        <a-form layout="vertical">
          <a-form-item label="语言设置">
            <a-select v-model:value="preferences.language" style="width: 200px">
              <a-select-option value="zh-CN">简体中文</a-select-option>
              <a-select-option value="en-US">English</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="时区设置">
            <a-select v-model:value="preferences.timezone" style="width: 200px">
              <a-select-option value="Asia/Shanghai">北京时间 (UTC+8)</a-select-option>
              <a-select-option value="America/New_York">纽约时间 (UTC-5)</a-select-option>
              <a-select-option value="Europe/London">伦敦时间 (UTC+0)</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="主题设置">
            <a-radio-group v-model:value="preferences.theme">
              <a-radio value="light">浅色主题</a-radio>
              <a-radio value="dark">深色主题</a-radio>
              <a-radio value="auto">跟随系统</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="通知设置">
            <a-checkbox-group v-model:value="preferences.notifications">
              <a-checkbox value="email">邮件通知</a-checkbox>
              <a-checkbox value="browser">浏览器通知</a-checkbox>
              <a-checkbox value="mobile">移动端推送</a-checkbox>
            </a-checkbox-group>
          </a-form-item>

          <a-form-item>
            <a-button type="primary" @click="savePreferences" :loading="savingPreferences">
              保存偏好
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import {
  UserOutlined,
  UploadOutlined
} from '@ant-design/icons-vue'
import type { Rule } from 'ant-design-vue/es/form'
import type { UploadProps } from 'ant-design-vue'

const userStore = useUserStore()
const profileFormRef = ref()

// 用户资料数据
const userProfile = reactive({
  username: 'admin',
  email: 'admin@verto.com',
  realName: '管理员',
  phone: '',
  department: 'frontend',
  position: '前端工程师',
  bio: '',
  avatar: ''
})

// 偏好设置
const preferences = reactive({
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  theme: 'light',
  notifications: ['email', 'browser']
})

// 保存状态
const saving = ref(false)
const savingPreferences = ref(false)

// 表单验证规则
const rules: Record<string, Rule[]> = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ]
}

/**
 * 上传头像前的验证
 */
const beforeAvatarUpload: UploadProps['beforeUpload'] = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

/**
 * 处理头像上传
 */
const handleAvatarChange: UploadProps['onChange'] = (info) => {
  if (info.file.status === 'uploading') {
    return
  }
  if (info.file.status === 'done') {
    // 获取上传结果
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      userProfile.avatar = reader.result as string
    })
    reader.readAsDataURL(info.file.originFileObj!)
    message.success('头像上传成功')
  }
  if (info.file.status === 'error') {
    message.error('头像上传失败')
  }
}

/**
 * 删除头像
 */
const removeAvatar = () => {
  userProfile.avatar = ''
  message.success('头像已删除')
}

/**
 * 保存个人资料
 */
const saveProfile = async () => {
  saving.value = true
  try {
    // TODO: 调用API保存用户资料
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('个人资料保存成功')
  } catch (error) {
    message.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

/**
 * 重置表单
 */
const resetForm = () => {
  profileFormRef.value?.resetFields()
  loadUserProfile()
}

/**
 * 保存偏好设置
 */
const savePreferences = async () => {
  savingPreferences.value = true
  try {
    // TODO: 调用API保存偏好设置
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('偏好设置保存成功')
  } catch (error) {
    message.error('保存失败，请重试')
  } finally {
    savingPreferences.value = false
  }
}

/**
 * 加载用户资料
 */
const loadUserProfile = async () => {
  try {
    // TODO: 从API加载用户资料
    // 模拟数据
    Object.assign(userProfile, {
      username: 'admin',
      email: 'admin@verto.com',
      realName: '管理员',
      phone: '13800138000',
      department: 'frontend',
      position: '前端工程师',
      bio: '热爱技术，专注于前端开发和用户体验设计。',
      avatar: ''
    })
  } catch (error) {
    message.error('加载用户资料失败')
  }
}

/**
 * 加载偏好设置
 */
const loadPreferences = async () => {
  try {
    // TODO: 从API加载偏好设置
    // 模拟数据
    Object.assign(preferences, {
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      theme: 'light',
      notifications: ['email', 'browser']
    })
  } catch (error) {
    message.error('加载偏好设置失败')
  }
}

onMounted(() => {
  loadUserProfile()
  loadPreferences()
})
</script>

<style scoped>
.profile-view {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

.page-header p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.profile-content {
  max-width: 800px;
}

.profile-card {
  margin-bottom: 24px;
}

.profile-card :deep(.ant-card-head-title) {
  font-weight: 600;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar-display {
  flex-shrink: 0;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar-actions .ant-btn {
  width: 120px;
}

@media (max-width: 768px) {
  .profile-view {
    padding: 16px;
  }
  
  .profile-content {
    max-width: 100%;
  }
  
  .avatar-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .avatar-actions {
    flex-direction: row;
    width: 100%;
  }
  
  .avatar-actions .ant-btn {
    flex: 1;
    width: auto;
  }
}

@media (max-width: 480px) {
  .avatar-actions {
    flex-direction: column;
  }
  
  .avatar-actions .ant-btn {
    width: 100%;
  }
}
</style>