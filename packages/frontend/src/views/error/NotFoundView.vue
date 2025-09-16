<template>
  <div class="not-found-view">
    <div class="error-container">
      <div class="error-illustration">
        <div class="error-code">404</div>
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#ff4d4f"/>
          </svg>
        </div>
      </div>
      
      <div class="error-content">
        <h1 class="error-title">页面未找到</h1>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被移动。
        </p>
        
        <div class="error-actions">
          <a-button type="primary" @click="goHome">
            返回首页
          </a-button>
          <a-button @click="goBack">
            返回上页
          </a-button>
        </div>
        
        <div class="error-suggestions">
          <h3>您可以尝试：</h3>
          <ul>
            <li>检查URL地址是否正确</li>
            <li>返回首页重新导航</li>
            <li>使用搜索功能查找内容</li>
            <li>联系管理员获取帮助</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

/**
 * 返回首页
 */
const goHome = () => {
  router.push('/')
}

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
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.error-container {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.error-illustration {
  margin-bottom: 40px;
  position: relative;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #ff4d4f;
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-icon {
  display: inline-block;
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-content {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: 32px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 16px 0;
}

.error-description {
  font-size: 16px;
  color: #8c8c8c;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
}

.error-suggestions {
  text-align: left;
  background: #f8f9fa;
  padding: 24px;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
}

.error-suggestions h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.error-suggestions ul {
  margin: 0;
  padding-left: 20px;
  color: #595959;
}

.error-suggestions li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.error-suggestions li:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-content {
    padding: 24px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .error-actions .ant-btn {
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .not-found-view {
    padding: 16px;
  }
  
  .error-code {
    font-size: 60px;
  }
  
  .error-icon {
    width: 60px;
    height: 60px;
  }
  
  .error-content {
    padding: 20px;
  }
}
</style>