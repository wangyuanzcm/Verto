<template>
  <div class="not-found-view">
    <div class="not-found-container">
      <!-- 404图标和标题 -->
      <div class="error-icon">
        <div class="error-number">404</div>
        <div class="error-illustration">
          <svg viewBox="0 0 200 200" class="illustration-svg">
            <!-- 背景圆圈 -->
            <circle cx="100" cy="100" r="80" fill="#f0f2f5" stroke="#d9d9d9" stroke-width="2"/>
            
            <!-- 问号 -->
            <text x="100" y="120" text-anchor="middle" font-size="60" font-weight="bold" fill="#1890ff">?</text>
            
            <!-- 装饰元素 -->
            <circle cx="60" cy="60" r="3" fill="#52c41a" opacity="0.6">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="140" cy="70" r="2" fill="#faad14" opacity="0.8">
              <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="150" cy="140" r="4" fill="#f5222d" opacity="0.7">
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
      </div>
      
      <!-- 错误信息 -->
      <div class="error-content">
        <h1 class="error-title">页面未找到</h1>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被移动。
        </p>
        <p class="error-suggestion">
          请检查URL是否正确，或者尝试以下操作：
        </p>
        
        <!-- 建议操作 -->
        <div class="suggestions">
          <div class="suggestion-item">
            <CheckCircleOutlined class="suggestion-icon" />
            <span>检查网址拼写是否正确</span>
          </div>
          <div class="suggestion-item">
            <CheckCircleOutlined class="suggestion-icon" />
            <span>返回上一页重新尝试</span>
          </div>
          <div class="suggestion-item">
            <CheckCircleOutlined class="suggestion-icon" />
            <span>访问首页查找所需内容</span>
          </div>
          <div class="suggestion-item">
            <CheckCircleOutlined class="suggestion-icon" />
            <span>联系管理员获取帮助</span>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="error-actions">
          <a-space size="large">
            <a-button size="large" @click="goBack">
              <ArrowLeftOutlined />
              返回上页
            </a-button>
            <a-button type="primary" size="large" @click="goHome">
              <HomeOutlined />
              回到首页
            </a-button>
            <a-button size="large" @click="refresh">
              <ReloadOutlined />
              刷新页面
            </a-button>
          </a-space>
        </div>
        
        <!-- 快速导航 -->
        <div class="quick-nav">
          <h3 class="quick-nav-title">快速导航</h3>
          <div class="nav-links">
            <a-button type="link" @click="navigateTo('/dashboard')">
              <DashboardOutlined />
              工作台
            </a-button>
            <a-button type="link" @click="navigateTo('/projects')">
              <ProjectOutlined />
              项目管理
            </a-button>
            <a-button type="link" @click="navigateTo('/requirements')">
              <FileTextOutlined />
              需求管理
            </a-button>
            <a-button type="link" @click="navigateTo('/prototypes')">
              <SketchOutlined />
              原型设计
            </a-button>
            <a-button type="link" @click="navigateTo('/materials')">
              <AppstoreOutlined />
              物料管理
            </a-button>
            <a-button type="link" @click="navigateTo('/settings')">
              <SettingOutlined />
              系统设置
            </a-button>
          </div>
        </div>
        
        <!-- 联系信息 -->
        <div class="contact-info">
          <a-alert
            message="需要帮助？"
            description="如果问题持续存在，请联系技术支持团队获取帮助。"
            type="info"
            show-icon
            action=""
          >
            <template #action>
              <a-space>
                <a-button size="small" type="primary" ghost @click="contactSupport">
                  联系支持
                </a-button>
                <a-button size="small" @click="reportIssue">
                  报告问题
                </a-button>
              </a-space>
            </template>
          </a-alert>
        </div>
      </div>
    </div>
    
    <!-- 页面信息 -->
    <div class="page-info">
      <div class="info-item">
        <span class="info-label">错误代码:</span>
        <span class="info-value">404</span>
      </div>
      <div class="info-item">
        <span class="info-label">请求路径:</span>
        <span class="info-value">{{ currentPath }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">时间戳:</span>
        <span class="info-value">{{ currentTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  HomeOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  ProjectOutlined,
  FileTextOutlined,
  SketchOutlined,
  AppstoreOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 路由
const router = useRouter()
const route = useRoute()

// 响应式数据
const currentPath = ref('')
const currentTime = ref('')

// 方法
/**
 * 返回上一页
 */
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

/**
 * 回到首页
 */
const goHome = () => {
  router.push('/')
}

/**
 * 刷新页面
 */
const refresh = () => {
  window.location.reload()
}

/**
 * 导航到指定页面
 */
const navigateTo = (path: string) => {
  router.push(path).catch(() => {
    message.error('页面跳转失败，请稍后重试')
  })
}

/**
 * 联系支持
 */
const contactSupport = () => {
  // 这里可以打开客服聊天窗口或跳转到联系页面
  message.info('正在为您转接技术支持...')
  
  // 模拟联系支持
  setTimeout(() => {
    message.success('已为您创建支持工单，我们会尽快回复')
  }, 1500)
}

/**
 * 报告问题
 */
const reportIssue = () => {
  // 这里可以打开问题报告表单
  const issueData = {
    path: currentPath.value,
    time: currentTime.value,
    userAgent: navigator.userAgent,
    error: '404 - Page Not Found'
  }
  
  console.log('Issue Report:', issueData)
  message.success('问题报告已提交，感谢您的反馈')
}

/**
 * 更新当前时间
 */
const updateCurrentTime = () => {
  currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
}

// 生命周期
onMounted(() => {
  currentPath.value = route.fullPath
  updateCurrentTime()
  
  // 每秒更新时间
  const timer = setInterval(updateCurrentTime, 1000)
  
  // 组件卸载时清除定时器
  onUnmounted(() => {
    clearInterval(timer)
  })
})
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
  position: relative;
}

.not-found-container {
  max-width: 800px;
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 60px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.not-found-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #1890ff, #52c41a, #faad14, #f5222d);
}

.error-icon {
  margin-bottom: 40px;
  position: relative;
}

.error-number {
  font-size: 120px;
  font-weight: 900;
  color: #1890ff;
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 0 4px 8px rgba(24, 144, 255, 0.2);
  background: linear-gradient(45deg, #1890ff, #52c41a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-illustration {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.illustration-svg {
  width: 200px;
  height: 200px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.error-content {
  max-width: 600px;
  margin: 0 auto;
}

.error-title {
  font-size: 32px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 16px 0;
}

.error-description {
  font-size: 16px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.error-suggestion {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0 0 32px 0;
}

.suggestions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
  text-align: left;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
  transition: all 0.3s;
}

.suggestion-item:hover {
  background: #e6f7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.suggestion-icon {
  color: #52c41a;
  font-size: 16px;
  flex-shrink: 0;
}

.error-actions {
  margin-bottom: 40px;
}

.quick-nav {
  margin-bottom: 40px;
  padding: 24px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.quick-nav-title {
  font-size: 18px;
  font-weight: 500;
  color: #262626;
  margin: 0 0 20px 0;
}

.nav-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.nav-links .ant-btn {
  height: auto;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  transition: all 0.3s;
}

.nav-links .ant-btn:hover {
  background: #e6f7ff;
  color: #1890ff;
  transform: translateY(-1px);
}

.contact-info {
  margin-bottom: 20px;
}

.page-info {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 12px;
  min-width: 200px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #8c8c8c;
  font-weight: 500;
}

.info-value {
  color: #262626;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .not-found-container {
    padding: 40px 20px;
    margin: 20px;
  }
  
  .error-number {
    font-size: 80px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .illustration-svg {
    width: 150px;
    height: 150px;
  }
  
  .suggestions {
    grid-template-columns: 1fr;
  }
  
  .error-actions :deep(.ant-space) {
    flex-direction: column;
    width: 100%;
  }
  
  .error-actions :deep(.ant-space-item) {
    width: 100%;
  }
  
  .error-actions .ant-btn {
    width: 100%;
  }
  
  .nav-links {
    grid-template-columns: 1fr;
  }
  
  .page-info {
    position: static;
    margin-top: 20px;
    width: 100%;
    max-width: 400px;
  }
}

@media (max-width: 576px) {
  .not-found-view {
    padding: 20px 10px;
  }
  
  .not-found-container {
    padding: 30px 15px;
    margin: 10px;
  }
  
  .error-number {
    font-size: 60px;
  }
  
  .error-title {
    font-size: 20px;
  }
  
  .illustration-svg {
    width: 120px;
    height: 120px;
  }
  
  .suggestion-item {
    padding: 12px;
  }
  
  .quick-nav {
    padding: 16px;
  }
  
  .nav-links .ant-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
}

/* 动画效果 */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.error-illustration {
  animation: float 3s ease-in-out infinite;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.not-found-container {
  animation: fadeInUp 0.6s ease-out;
}

.suggestion-item {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.suggestion-item:nth-child(1) { animation-delay: 0.1s; }
.suggestion-item:nth-child(2) { animation-delay: 0.2s; }
.suggestion-item:nth-child(3) { animation-delay: 0.3s; }
.suggestion-item:nth-child(4) { animation-delay: 0.4s; }
</style>