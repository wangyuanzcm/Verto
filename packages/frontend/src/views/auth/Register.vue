<template>
  <div class="register-container">
    <!-- 背景装饰 -->
    <div class="register-bg">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
      <div class="bg-shape shape-4"></div>
    </div>
    
    <!-- 注册表单 -->
    <div class="register-form-container">
      <div class="register-form">
        <!-- Logo和标题 -->
        <div class="register-header">
          <div class="logo">
            <el-icon :size="48" color="#409eff">
              <component :is="'Grid'" />
            </el-icon>
          </div>
          <h1 class="title">加入 Verto</h1>
          <p class="subtitle">开始您的智能原型设计之旅</p>
        </div>
        
        <!-- 注册步骤指示器 -->
        <el-steps :active="currentStep" align-center class="register-steps">
          <el-step title="基本信息" icon="User" />
          <el-step title="验证邮箱" icon="Message" />
          <el-step title="完成注册" icon="Check" />
        </el-steps>
        
        <!-- 步骤1: 基本信息 -->
        <div v-show="currentStep === 0" class="step-content">
          <el-form
            ref="basicInfoFormRef"
            :model="registerForm"
            :rules="basicInfoRules"
            class="register-form-content"
            size="large"
            @keyup.enter="handleNextStep"
          >
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item prop="firstName">
                  <el-input
                    v-model="registerForm.firstName"
                    placeholder="名"
                    prefix-icon="User"
                    clearable
                    :disabled="loading"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="lastName">
                  <el-input
                    v-model="registerForm.lastName"
                    placeholder="姓"
                    prefix-icon="User"
                    clearable
                    :disabled="loading"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item prop="email">
              <el-input
                v-model="registerForm.email"
                placeholder="请输入邮箱"
                prefix-icon="Message"
                clearable
                :disabled="loading"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                show-password
                clearable
                :disabled="loading"
              />
            </el-form-item>
            
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="确认密码"
                prefix-icon="Lock"
                show-password
                clearable
                :disabled="loading"
              />
            </el-form-item>
            
            <el-form-item prop="company">
              <el-input
                v-model="registerForm.company"
                placeholder="公司/组织（可选）"
                prefix-icon="OfficeBuilding"
                clearable
                :disabled="loading"
              />
            </el-form-item>
            
            <el-form-item prop="agreeTerms">
              <el-checkbox v-model="registerForm.agreeTerms" :disabled="loading">
                我已阅读并同意
                <el-link type="primary" :underline="false" @click="showTerms">
                  《用户协议》
                </el-link>
                和
                <el-link type="primary" :underline="false" @click="showPrivacy">
                  《隐私政策》
                </el-link>
              </el-checkbox>
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="step-button"
                :loading="loading"
                @click="handleNextStep"
              >
                下一步
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 步骤2: 验证邮箱 -->
        <div v-show="currentStep === 1" class="step-content">
          <div class="verification-content">
            <el-icon :size="64" color="#409eff" class="verification-icon">
              <component :is="'Message'" />
            </el-icon>
            
            <h3>验证您的邮箱</h3>
            <p class="verification-text">
              我们已向 <strong>{{ registerForm.email }}</strong> 发送了验证码
            </p>
            
            <el-form
              ref="verificationFormRef"
              :model="verificationForm"
              :rules="verificationRules"
              class="verification-form"
              @keyup.enter="handleVerifyEmail"
            >
              <el-form-item prop="code">
                <el-input
                  v-model="verificationForm.code"
                  placeholder="请输入6位验证码"
                  maxlength="6"
                  show-word-limit
                  clearable
                  :disabled="loading"
                  class="verification-input"
                />
              </el-form-item>
            </el-form>
            
            <div class="verification-actions">
              <el-button
                type="primary"
                size="large"
                class="step-button"
                :loading="loading"
                @click="handleVerifyEmail"
              >
                验证邮箱
              </el-button>
              
              <div class="resend-section">
                <span v-if="resendCountdown > 0" class="resend-text">
                  {{ resendCountdown }}秒后可重新发送
                </span>
                <el-link
                  v-else
                  type="primary"
                  :underline="false"
                  :disabled="loading"
                  @click="handleResendCode"
                >
                  重新发送验证码
                </el-link>
              </div>
            </div>
            
            <el-button
              type="text"
              class="back-button"
              :disabled="loading"
              @click="handlePrevStep"
            >
              返回上一步
            </el-button>
          </div>
        </div>
        
        <!-- 步骤3: 完成注册 -->
        <div v-show="currentStep === 2" class="step-content">
          <div class="success-content">
            <el-icon :size="64" color="#67c23a" class="success-icon">
              <component :is="'Check'" />
            </el-icon>
            
            <h3>注册成功！</h3>
            <p class="success-text">
              欢迎加入 Verto！您的账户已创建成功。
            </p>
            
            <div class="success-actions">
              <el-button
                type="primary"
                size="large"
                class="step-button"
                @click="goToLogin"
              >
                立即登录
              </el-button>
              
              <el-button
                size="large"
                class="step-button"
                @click="goToDashboard"
              >
                进入控制台
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 登录链接 -->
        <div v-if="currentStep === 0" class="login-link">
          <span>已有账号？</span>
          <el-link type="primary" :underline="false" @click="goToLogin">
            立即登录
          </el-link>
        </div>
      </div>
    </div>
    
    <!-- 用户协议对话框 -->
    <el-dialog
      v-model="termsVisible"
      title="用户协议"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="terms-content">
        <h4>1. 服务条款</h4>
        <p>欢迎使用 Verto 智能原型设计与项目管理平台...</p>
        
        <h4>2. 用户责任</h4>
        <p>用户在使用本服务时应遵守相关法律法规...</p>
        
        <h4>3. 知识产权</h4>
        <p>本平台的所有内容和功能均受知识产权保护...</p>
        
        <!-- 更多条款内容 -->
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="termsVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 隐私政策对话框 -->
    <el-dialog
      v-model="privacyVisible"
      title="隐私政策"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="privacy-content">
        <h4>1. 信息收集</h4>
        <p>我们收集您提供的个人信息以提供更好的服务...</p>
        
        <h4>2. 信息使用</h4>
        <p>我们使用收集的信息来改善我们的服务...</p>
        
        <h4>3. 信息保护</h4>
        <p>我们采取适当的安全措施保护您的个人信息...</p>
        
        <!-- 更多隐私政策内容 -->
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="privacyVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

/**
 * 注册页面组件
 * 提供多步骤用户注册流程
 */

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

// 表单引用
const basicInfoFormRef = ref<FormInstance>()
const verificationFormRef = ref<FormInstance>()

// 当前步骤
const currentStep = ref(0)

// 加载状态
const loading = ref(false)

// 重发验证码倒计时
const resendCountdown = ref(0)
let resendTimer: NodeJS.Timeout | null = null

// 对话框显示状态
const termsVisible = ref(false)
const privacyVisible = ref(false)

// 注册表单数据
const registerForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  company: '',
  agreeTerms: false
})

// 验证表单数据
const verificationForm = reactive({
  code: ''
})

// 基本信息验证规则
const basicInfoRules: FormRules = {
  firstName: [
    { required: true, message: '请输入名', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  lastName: [
    { required: true, message: '请输入姓', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
      message: '密码必须包含大小写字母和数字',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  agreeTerms: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请同意用户协议和隐私政策'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 验证码验证规则
const verificationRules: FormRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码只能包含数字', trigger: 'blur' }
  ]
}

/**
 * 处理下一步
 */
const handleNextStep = async () => {
  if (currentStep.value === 0) {
    if (!basicInfoFormRef.value) return
    
    try {
      const valid = await basicInfoFormRef.value.validate()
      if (!valid) return
      
      loading.value = true
      
      // 发送验证码
      await sendVerificationCode()
      
      currentStep.value = 1
      startResendCountdown()
      
    } catch (error: any) {
      console.error('发送验证码失败:', error)
      ElMessage.error(error.message || '发送验证码失败')
    } finally {
      loading.value = false
    }
  }
}

/**
 * 处理上一步
 */
const handlePrevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    
    if (resendTimer) {
      clearInterval(resendTimer)
      resendTimer = null
      resendCountdown.value = 0
    }
  }
}

/**
 * 发送验证码
 */
const sendVerificationCode = async () => {
  try {
    // 这里应该调用发送验证码接口
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    
    ElMessage.success('验证码已发送到您的邮箱')
    
  } catch (error: any) {
    throw new Error(error.message || '发送验证码失败')
  }
}

/**
 * 处理验证邮箱
 */
const handleVerifyEmail = async () => {
  if (!verificationFormRef.value) return
  
  try {
    const valid = await verificationFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    // 验证邮箱
    await verifyEmailCode()
    
    // 注册用户
    await registerUser()
    
    currentStep.value = 2
    
    if (resendTimer) {
      clearInterval(resendTimer)
      resendTimer = null
      resendCountdown.value = 0
    }
    
  } catch (error: any) {
    console.error('验证失败:', error)
    ElMessage.error(error.message || '验证失败')
  } finally {
    loading.value = false
  }
}

/**
 * 验证邮箱验证码
 */
const verifyEmailCode = async () => {
  try {
    // 这里应该调用验证码验证接口
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    
    // 模拟验证失败
    if (verificationForm.code !== '123456') {
      throw new Error('验证码错误')
    }
    
  } catch (error: any) {
    throw new Error(error.message || '验证码验证失败')
  }
}

/**
 * 注册用户
 */
const registerUser = async () => {
  try {
    // 这里应该调用用户注册接口
    await userStore.register({
      firstName: registerForm.firstName,
      lastName: registerForm.lastName,
      email: registerForm.email,
      password: registerForm.password,
      company: registerForm.company
    })
    
    ElNotification.success({
      title: '注册成功',
      message: '欢迎加入 Verto！',
      duration: 3000
    })
    
  } catch (error: any) {
    throw new Error(error.message || '注册失败')
  }
}

/**
 * 重新发送验证码
 */
const handleResendCode = async () => {
  try {
    loading.value = true
    
    await sendVerificationCode()
    startResendCountdown()
    
  } catch (error: any) {
    console.error('重发验证码失败:', error)
    ElMessage.error(error.message || '重发验证码失败')
  } finally {
    loading.value = false
  }
}

/**
 * 开始重发倒计时
 */
const startResendCountdown = () => {
  resendCountdown.value = 60
  
  resendTimer = setInterval(() => {
    resendCountdown.value--
    
    if (resendCountdown.value <= 0) {
      clearInterval(resendTimer!)
      resendTimer = null
    }
  }, 1000)
}

/**
 * 显示用户协议
 */
const showTerms = () => {
  termsVisible.value = true
}

/**
 * 显示隐私政策
 */
const showPrivacy = () => {
  privacyVisible.value = true
}

/**
 * 跳转到登录页面
 */
const goToLogin = () => {
  router.push('/auth/login')
}

/**
 * 跳转到控制台
 */
const goToDashboard = () => {
  router.push('/dashboard')
}

/**
 * 组件挂载时的初始化
 */
onMounted(() => {
  // 如果已经登录，直接跳转到首页
  if (userStore.isLoggedIn) {
    router.push('/dashboard')
    return
  }
  
  // 设置页面标题
  appStore.setPageTitle('注册')
})

/**
 * 组件卸载时清理定时器
 */
onUnmounted(() => {
  if (resendTimer) {
    clearInterval(resendTimer)
    resendTimer = null
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.register-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  @include flex-center;
}

.register-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
  
  .bg-shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 8s ease-in-out infinite;
    
    &.shape-1 {
      width: 180px;
      height: 180px;
      top: 5%;
      left: 5%;
      animation-delay: 0s;
    }
    
    &.shape-2 {
      width: 120px;
      height: 120px;
      top: 70%;
      right: 10%;
      animation-delay: 2s;
    }
    
    &.shape-3 {
      width: 80px;
      height: 80px;
      bottom: 15%;
      left: 15%;
      animation-delay: 4s;
    }
    
    &.shape-4 {
      width: 60px;
      height: 60px;
      top: 30%;
      right: 30%;
      animation-delay: 6s;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
  }
}

.register-form-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 480px;
  padding: 0 $spacing-base;
}

.register-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: $border-radius-large * 2;
  padding: $spacing-xl;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideInUp 0.6s ease-out;
}

.register-header {
  text-align: center;
  margin-bottom: $spacing-lg;
  
  .logo {
    margin-bottom: $spacing-md;
  }
  
  .title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $text-color-primary;
    margin: 0 0 $spacing-sm 0;
  }
  
  .subtitle {
    font-size: $font-size-base;
    color: $text-color-secondary;
    margin: 0;
  }
}

.register-steps {
  margin-bottom: $spacing-xl;
  
  :deep(.el-step__title) {
    font-size: $font-size-small;
  }
}

.step-content {
  min-height: 400px;
  
  .step-button {
    width: 100%;
    height: 48px;
    font-size: $font-size-medium;
    font-weight: $font-weight-primary;
  }
}

.register-form-content {
  :deep(.el-form-item) {
    margin-bottom: $spacing-md;
  }
}

.verification-content {
  text-align: center;
  
  .verification-icon {
    margin-bottom: $spacing-lg;
  }
  
  h3 {
    font-size: $font-size-xl;
    color: $text-color-primary;
    margin: 0 0 $spacing-md 0;
  }
  
  .verification-text {
    color: $text-color-secondary;
    margin-bottom: $spacing-xl;
    line-height: 1.6;
    
    strong {
      color: $primary-color;
    }
  }
  
  .verification-form {
    margin-bottom: $spacing-lg;
    
    .verification-input {
      text-align: center;
      
      :deep(.el-input__inner) {
        text-align: center;
        font-size: $font-size-lg;
        letter-spacing: 4px;
      }
    }
  }
  
  .verification-actions {
    margin-bottom: $spacing-lg;
    
    .resend-section {
      margin-top: $spacing-md;
      
      .resend-text {
        color: $text-color-placeholder;
        font-size: $font-size-small;
      }
    }
  }
  
  .back-button {
    color: $text-color-secondary;
    
    &:hover {
      color: $primary-color;
    }
  }
}

.success-content {
  text-align: center;
  
  .success-icon {
    margin-bottom: $spacing-lg;
  }
  
  h3 {
    font-size: $font-size-xl;
    color: $text-color-primary;
    margin: 0 0 $spacing-md 0;
  }
  
  .success-text {
    color: $text-color-secondary;
    margin-bottom: $spacing-xl;
    line-height: 1.6;
  }
  
  .success-actions {
    display: flex;
    gap: $spacing-md;
    
    .step-button {
      flex: 1;
    }
  }
}

.login-link {
  text-align: center;
  margin-top: $spacing-lg;
  font-size: $font-size-small;
  color: $text-color-secondary;
  
  .el-link {
    margin-left: $spacing-xs;
    font-size: $font-size-small;
  }
}

// 对话框内容样式
.terms-content,
.privacy-content {
  max-height: 400px;
  overflow-y: auto;
  
  h4 {
    color: $text-color-primary;
    margin: $spacing-lg 0 $spacing-sm 0;
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  p {
    color: $text-color-regular;
    line-height: 1.6;
    margin-bottom: $spacing-md;
  }
}

// 响应式设计
@include respond-below(sm) {
  .register-form-container {
    max-width: 100%;
    padding: 0 $spacing-md;
  }
  
  .register-form {
    padding: $spacing-lg;
  }
  
  .register-header {
    .title {
      font-size: $font-size-2xl;
    }
  }
  
  .step-content {
    min-height: 350px;
  }
  
  .success-actions {
    flex-direction: column;
    
    .step-button {
      width: 100%;
    }
  }
  
  .register-steps {
    :deep(.el-step__title) {
      display: none;
    }
  }
}

// 暗色主题适配
@include dark-theme {
  .register-form {
    background: rgba(45, 45, 45, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
    
    .register-header {
      .title {
        color: $white;
      }
      
      .subtitle {
        color: rgba(255, 255, 255, 0.7);
      }
    }
    
    .verification-content,
    .success-content {
      h3 {
        color: $white;
      }
      
      .verification-text,
      .success-text {
        color: rgba(255, 255, 255, 0.7);
      }
      
      .back-button {
        color: rgba(255, 255, 255, 0.7);
        
        &:hover {
          color: $primary-color;
        }
      }
    }
    
    .login-link {
      color: rgba(255, 255, 255, 0.7);
    }
  }
  
  .terms-content,
  .privacy-content {
    h4 {
      color: $white;
    }
    
    p {
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

// 动画效果
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 步骤切换动画
.step-content {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 表单项动画
:deep(.el-form-item) {
  animation: fadeInUp 0.6s ease-out;
  
  @for $i from 1 through 8 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.1}s;
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 对话框样式
:deep(.el-dialog) {
  border-radius: $border-radius-large;
  
  .el-dialog__header {
    padding: $spacing-lg $spacing-lg $spacing-md;
    border-bottom: 1px solid $border-color-lighter;
  }
  
  .el-dialog__body {
    padding: $spacing-lg;
  }
  
  .el-dialog__footer {
    padding: $spacing-md $spacing-lg $spacing-lg;
    border-top: 1px solid $border-color-lighter;
  }
}

// 步骤指示器样式覆盖
:deep(.el-steps) {
  .el-step__head {
    .el-step__icon {
      border-radius: 50%;
    }
  }
  
  .el-step.is-process {
    .el-step__head {
      .el-step__icon {
        background-color: $primary-color;
        border-color: $primary-color;
      }
    }
  }
  
  .el-step.is-finish {
    .el-step__head {
      .el-step__icon {
        background-color: $success-color;
        border-color: $success-color;
      }
    }
  }
}
</style>