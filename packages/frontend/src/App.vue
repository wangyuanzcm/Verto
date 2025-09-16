<template>
  <div id="app" class="app-container">
    <!-- 应用布局 -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    
    <!-- 全局加载遮罩 -->
    <el-loading
      v-loading="globalLoading"
      :text="loadingText"
      background="rgba(0, 0, 0, 0.7)"
      element-loading-spinner="el-icon-loading"
    />
    
    <!-- 全局消息提示容器 -->
    <div id="message-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { useUserStore } from '@/stores/user';

/**
 * 应用根组件
 * 负责全局状态管理、路由控制、主题切换等核心功能
 */

const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();

// 全局加载状态
const globalLoading = ref(false);
const loadingText = ref('加载中...');

/**
 * 初始化应用
 */
const initApp = async () => {
  try {
    globalLoading.value = true;
    loadingText.value = '正在初始化应用...';
    
    // 初始化应用配置
    await appStore.initApp();
    
    // 检查用户登录状态
    if (userStore.token) {
      loadingText.value = '正在验证用户信息...';
      await userStore.getUserInfo();
    }
    
    // 设置应用就绪状态
    appStore.setAppReady(true);
    
  } catch (error) {
    console.error('应用初始化失败:', error);
    ElMessage.error('应用初始化失败，请刷新页面重试');
  } finally {
    globalLoading.value = false;
  }
};

/**
 * 处理窗口大小变化
 */
const handleResize = () => {
  appStore.updateWindowSize({
    width: window.innerWidth,
    height: window.innerHeight
  });
};

/**
 * 处理在线状态变化
 */
const handleOnline = () => {
  appStore.setOnlineStatus(true);
  ElMessage.success('网络连接已恢复');
};

const handleOffline = () => {
  appStore.setOnlineStatus(false);
  ElMessage.warning('网络连接已断开');
};

/**
 * 处理键盘快捷键
 */
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl/Cmd + K: 打开命令面板
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    appStore.toggleCommandPalette();
  }
  
  // Ctrl/Cmd + /: 打开快捷键帮助
  if ((event.ctrlKey || event.metaKey) && event.key === '/') {
    event.preventDefault();
    appStore.toggleShortcutHelp();
  }
  
  // ESC: 关闭模态框
  if (event.key === 'Escape') {
    appStore.closeAllModals();
  }
};

/**
 * 组件挂载时的处理
 */
onMounted(async () => {
  // 初始化应用
  await initApp();
  
  // 添加事件监听器
  window.addEventListener('resize', handleResize);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  window.addEventListener('keydown', handleKeydown);
  
  // 初始化窗口大小
  handleResize();
  
  // 设置初始在线状态
  appStore.setOnlineStatus(navigator.onLine);
});

/**
 * 组件卸载时的清理
 */
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style lang="scss">
.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

// 路由过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 全局滚动条样式
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--el-fill-color-dark);
  border-radius: 4px;
  
  &:hover {
    background: var(--el-fill-color-darker);
  }
}

// 选中文本样式
::selection {
  background-color: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
}

// 焦点样式
:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}

// 禁用状态样式
.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

// 响应式断点
@media (max-width: 768px) {
  .app-container {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .app-container {
    font-size: 12px;
  }
}
</style>