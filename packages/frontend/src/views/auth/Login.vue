<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="login-bg">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>
    
    <!-- 登录表单 -->
    <div class="login-form-container">
      <div class="login-form">
        <!-- Logo和标题 -->
        <div class="login-header">
          <div class="logo">
            <el-icon :size="48" color="#409eff">
              <component :is="'Grid'" />
            </el-icon>
          </div>
          <h1 class="title">Verto</h1>
          <p class="subtitle">智能原型设计与项目管理平台</p>
        </div>
        
        <!-- 登录表单 -->
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form-content"
          size="large"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="email">
            <el-input
              v-model="loginForm.email"
              placeholder="请输入邮箱"
              prefix-icon="Message"
              clearable
              :disabled="loading"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              clearable
              :disabled="loading"
            />
          </el-form-item>
          
          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="loginForm.rememberMe" :disabled="loading">
                记住我
              </el-checkbox>
              <el-link type="primary" :underline="false" @click="showForgotPassword">
                忘记密码？
              </el-link>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 其他登录方式 -->
        <div class="login-divider">
          <span>或</span>
        </div>
        
        <div class="social-login">
          <el-button
            class="social-button github"
            :disabled="loading"
            @click="handleSocialLogin('github')"
          >
            <el-icon><component :is="'Platform'" /></el-icon>
            GitHub
          </el-button>
          
          <el-button
            class="social-button google"
            :disabled="loading"
            @click="handleSocialLogin('google')"
          >
            <el-icon><component :is="'ChromeFilled'" /></el-icon>
            Google
          </el-button>
        </div>
        
        <!-- 注册链接 -->
        <div class="register-link">
          <span>还没有账号？</span>
          <el-link type="primary" :underline="false" @click="goToRegister">
            立即注册
          </el-link>
        </div>
      </div>
    </div>
    
    <!-- 忘记密码对话框 -->
    <el-dialog
      v-model="forgotPasswordVisible"
      title="重置密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="forgotPasswordFormRef"
        :model="forgotPasswordForm"
        :rules="forgotPasswordRules"
        label-width="80px"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="forgotPasswordForm.email"
            placeholder="请输入注册邮箱"
            prefix-icon="Message"
            clearable
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="forgotPasswordVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="forgotPasswordLoading"
            @click="handleForgotPassword"
          >
            发送重置邮件
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

/**
 * 登录页面组件
 * 提供用户登录、社交登录、忘记密码等功能
 */

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

// 表单引用
const loginFormRef = ref<FormInstance>()
const forgotPasswordFormRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)
const forgotPasswordLoading = ref(false)

// 忘记密码对话框
const forgotPasswordVisible = ref(false)

// 登录表单数据
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// 忘记密码表单数据
const forgotPasswordForm = reactive({
  email: ''
})

// 登录表单验证规则
const loginRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 忘记密码表单验证规则
const forgotPasswordRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

/**
 * 处理登录
 */
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    // 调用登录接口
    await userStore.login({
      email: loginForm.email,
      password: loginForm.password,
      rememberMe: loginForm.rememberMe
    })
    
    ElMessage.success('登录成功')
    
    // 跳转到首页或之前访问的页面
    const redirect = router.currentRoute.value.query.redirect as string
    await router.push(redirect || '/dashboard')
    
  } catch (error: any) {
    console.error('登录失败:', error)
    ElMessage.error(error.message || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

/**
 * 处理社交登录
 * @param provider 登录提供商
 */
const handleSocialLogin = async (provider: 'github' | 'google') => {
  try {
    loading.value = true
    
    // 这里应该调用社交登录接口
    ElMessage.info(`${provider} 登录功能开发中...`)
    
  } catch (error: any) {
    console.error('社交登录失败:', error)
    ElMessage.error(error.message || '社交登录失败')
  } finally {
    loading.value = false
  }
}

/**
 * 显示忘记密码对话框
 */
const showForgotPassword = () => {
  forgotPasswordForm.email = loginForm.email
  forgotPasswordVisible.value = true
}

/**
 * 处理忘记密码
 */
const handleForgotPassword = async () => {
  if (!forgotPasswordFormRef.value) return
  
  try {
    const valid = await forgotPasswordFormRef.value.validate()
    if (!valid) return
    
    forgotPasswordLoading.value = true
    
    // 这里应该调用忘记密码接口
    await new Promise(resolve => setTimeout(resolve, 2000)) // 模拟API调用
    
    ElNotification.success({
      title: '邮件发送成功',
      message: '重置密码邮件已发送到您的邮箱，请查收',
      duration: 5000
    })
    
    forgotPasswordVisible.value = false
    
  } catch (error: any) {
    console.error('发送重置邮件失败:', error)
    ElMessage.error(error.message || '发送重置邮件失败')
  } finally {
    forgotPasswordLoading.value = false
  }
}

/**
 * 跳转到注册页面
 */
const goToRegister = () => {
  router.push('/auth/register')
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
  appStore.setPageTitle('登录')
  
  // 从本地存储恢复记住的邮箱
  const rememberedEmail = localStorage.getItem('verto_remembered_email')
  if (rememberedEmail) {
    loginForm.email = rememberedEmail
    loginForm.rememberMe = true
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  @include flex-center;
}

.login-bg {
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
    animation: float 6s ease-in-out infinite;
    
    &.shape-1 {
      width: 200px;
      height: 200px;
      top: 10%;
      left: 10%;
      animation-delay: 0s;
    }
    
    &.shape-2 {
      width: 150px;
      height: 150px;
      top: 60%;
      right: 15%;
      animation-delay: 2s;
    }
    
    &.shape-3 {
      width: 100px;
      height: 100px;
      bottom: 20%;
      left: 20%;
      animation-delay: 4s;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.login-form-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 400px;
  padding: 0 $spacing-base;
}

.login-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: $border-radius-large * 2;
  padding: $spacing-xl;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: $spacing-xl;
  
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

.login-form-content {
  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .login-button {
    width: 100%;
    height: 48px;
    font-size: $font-size-medium;
    font-weight: $font-weight-primary;
  }
}

.login-divider {
  position: relative;
  text-align: center;
  margin: $spacing-lg 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: $border-color-light;
  }
  
  span {
    background: rgba(255, 255, 255, 0.95);
    padding: 0 $spacing-md;
    color: $text-color-secondary;
    font-size: $font-size-small;
  }
}

.social-login {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
  
  .social-button {
    flex: 1;
    height: 44px;
    border: 1px solid $border-color-light;
    background: $white;
    color: $text-color-regular;
    
    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
    
    &.github:hover {
      border-color: #333;
      color: #333;
    }
    
    &.google:hover {
      border-color: #db4437;
      color: #db4437;
    }
    
    .el-icon {
      margin-right: $spacing-xs;
    }
  }
}

.register-link {
  text-align: center;
  font-size: $font-size-small;
  color: $text-color-secondary;
  
  .el-link {
    margin-left: $spacing-xs;
    font-size: $font-size-small;
  }
}

// 响应式设计
@include respond-below(sm) {
  .login-form-container {
    max-width: 100%;
    padding: 0 $spacing-md;
  }
  
  .login-form {
    padding: $spacing-lg;
  }
  
  .login-header {
    .title {
      font-size: $font-size-2xl;
    }
  }
  
  .social-login {
    flex-direction: column;
    
    .social-button {
      width: 100%;
    }
  }
}

// 暗色主题适配
@include dark-theme {
  .login-form {
    background: rgba(45, 45, 45, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
    
    .login-header {
      .title {
        color: $white;
      }
      
      .subtitle {
        color: rgba(255, 255, 255, 0.7);
      }
    }
    
    .login-divider {
      &::before {
        background: rgba(255, 255, 255, 0.2);
      }
      
      span {
        background: rgba(45, 45, 45, 0.95);
        color: rgba(255, 255, 255, 0.7);
      }
    }
    
    .social-login {
      .social-button {
        background: rgba(60, 60, 60, 0.8);
        border-color: rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.8);
      }
    }
    
    .register-link {
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

// 动画效果
.login-form {
  animation: slideInUp 0.6s ease-out;
}

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

// 表单项动画
:deep(.el-form-item) {
  animation: fadeInUp 0.6s ease-out;
  
  @for $i from 1 through 5 {
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
</style>