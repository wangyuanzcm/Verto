import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import * as Icons from '@ant-design/icons-vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';

import App from './App.vue';
import router from './router';
import './styles/index.scss';

/**
 * 创建Vue应用实例
 */
const app = createApp(App);

/**
 * 创建Pinia状态管理实例
 */
const pinia = createPinia();

/**
 * 注册Ant Design Vue图标
 */
for (const [key, component] of Object.entries(Icons)) {
  app.component(key, component);
}

/**
 * 配置应用插件
 */
app.use(pinia);
app.use(router);
app.use(Antd, {
  locale: zhCN
});

/**
 * 全局错误处理
 */
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err);
  console.error('错误信息:', info);
  console.error('组件实例:', vm);
};

/**
 * 全局警告处理
 */
app.config.warnHandler = (msg, vm, trace) => {
  console.warn('全局警告:', msg);
  console.warn('组件实例:', vm);
  console.warn('组件追踪:', trace);
};

/**
 * 挂载应用
 */
app.mount('#app');

/**
 * 开发环境下的调试信息
 */
if (import.meta.env.DEV) {
  console.log('🚀 Verto应用已启动');
  console.log('📦 Vue版本:', app.version);
  console.log('🌍 环境变量:', import.meta.env);
}

/**
 * Electron环境下的特殊处理
 */
if (window.electronAPI) {
  console.log('🖥️ 运行在Electron环境中');
  
  // 监听菜单事件
  window.electronAPI.onMenuAction((action: string) => {
    console.log('菜单事件:', action);
    
    switch (action) {
      case 'menu-new-project':
        router.push('/project/new');
        break;
      case 'menu-open-project':
        // 处理打开项目逻辑
        break;
      case 'menu-about':
        // 显示关于对话框
        break;
    }
  });
}

/**
 * 导出应用实例供测试使用
 */
export default app;