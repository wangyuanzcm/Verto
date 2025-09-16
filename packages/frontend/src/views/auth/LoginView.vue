<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-header">
        <div class="logo">
          <img src="/logo.svg" alt="Verto" class="logo-image" />
          <h1>Verto</h1>
        </div>
        <p class="subtitle">项目管理与协作平台</p>
      </div>

      <div class="login-form">
        <el-form
          :model="loginForm"
          :rules="rules"
          @submit.prevent="handleLogin"
          label-position="top"
          size="large"
        >
          <el-form-item prop="username" label="用户名">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名或邮箱"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password" label="密码">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="loginForm.remember">
                记住我
              </el-checkbox>
              <el-button type="primary" link class="forgot-password" @click="handleForgotPassword">
                忘记密码？
              </el-button>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              native-type="submit"
              :loading="loading"
              style="width: 100%"
              size="large"
            >
              登录
            </el-button>
          </el-form-item>

          <el-form-item>
            <div class="register-link">
              还没有账号？
              <el-button type="primary" link @click="handleRegister">
                立即注册
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <div class="login-footer">
        <div class="social-login">
          <el-divider>或使用以下方式登录</el-divider>
          <div class="social-buttons">
            <el-button class="social-btn" @click="handleSocialLogin('github')">
              <el-icon><Link /></el-icon>
              GitHub
            </el-button>
            <el-button class="social-btn" @click="handleSocialLogin('google')">
              <el-icon><Link /></el-icon>
              Google
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  User,
  Lock,
  Link
} from '@element-plus/icons-vue'
import type { FormRules } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

// 加载状态
const loading = ref(false)

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    { min: 3, message: '用户名至少3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ]
}

/**
 * 处理登录
 */
const handleLogin = async (values: typeof loginForm) => {
  loading.value = true
  try {
    // TODO: 调用登录API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟登录成功
    await userStore.login({
      username: values.username,
      password: values.password,
      remember: values.remember
    })
    
    ElMessage.success('登录成功')
    
    // 跳转到仪表盘
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/dashboard')
  } catch (error) {
    ElMessage.error('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

/**
 * 处理登录失败
 */
const handleLoginFailed = (errorInfo: any) => {
  console.log('登录表单验证失败:', errorInfo)
}

/**
 * 处理忘记密码
 */
const handleForgotPassword = () => {
  // TODO: 实现忘记密码功能
  ElMessage.info('忘记密码功能开发中')
}

/**
 * 处理注册
 */
const handleRegister = () => {
  router.push('/register')
}

/**
 * 处理社交登录
 */
const handleSocialLogin = (provider: string) => {
  // TODO: 实现社交登录
  ElMessage.info(`${provider} 登录功能开发中`)
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.logo-image {
  width: 48px;
  height: 48px;
}

.logo h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #262626;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0;
  color: #8c8c8c;
  font-size: 16px;
  font-weight: 400;
}

.login-form {
  margin-bottom: 24px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password {
  padding: 0;
  height: auto;
  font-size: 14px;
}

.register-link {
  text-align: center;
  color: #8c8c8c;
  font-size: 14px;
}

.login-footer {
  margin-top: 24px;
}

.social-login {
  text-align: center;
}

.social-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.social-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: white;
  transition: all 0.2s;
}

.social-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@media (max-width: 768px) {
  .login-container {
    margin: 20px;
    padding: 24px;
  }
  
  .social-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .login-view {
    padding: 16px;
  }
  
  .login-container {
    margin: 0;
    padding: 20px;
  }
  
  .logo h1 {
    font-size: 24px;
  }
}
</style>