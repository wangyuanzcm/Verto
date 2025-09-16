import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { RouteLocationNormalized } from 'vue-router';

/**
 * 应用主题类型
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * 窗口大小信息
 */
export interface WindowSize {
  width: number;
  height: number;
}

/**
 * 当前路由信息
 */
export interface CurrentRoute {
  path: string;
  name: string;
  meta: any;
}

/**
 * 应用配置信息
 */
export interface AppConfig {
  title: string;
  version: string;
  apiBaseUrl: string;
  websocketUrl: string;
  uploadUrl: string;
  enableMock: boolean;
}

/**
 * 应用状态管理
 */
export const useAppStore = defineStore('app', () => {
  // 应用基础状态
  const appReady = ref(false);
  const loading = ref(false);
  const onlineStatus = ref(true);
  
  // 主题相关
  const themeMode = ref<ThemeMode>('auto');
  const isDarkMode = ref(false);
  
  // 窗口信息
  const windowSize = ref<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  // 路由信息
  const currentRoute = ref<CurrentRoute>({
    path: '/',
    name: 'Dashboard',
    meta: {}
  });
  
  // 侧边栏状态
  const sidebarCollapsed = ref(false);
  const sidebarWidth = ref(240);
  
  // 模态框状态
  const commandPaletteVisible = ref(false);
  const shortcutHelpVisible = ref(false);
  
  // 应用配置
  const config = ref<AppConfig>({
    title: 'Verto',
    version: '1.0.0',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    websocketUrl: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3000',
    uploadUrl: import.meta.env.VITE_UPLOAD_URL || 'http://localhost:3000/upload',
    enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true'
  });
  
  // 计算属性
  const isMobile = computed(() => windowSize.value.width < 768);
  const isTablet = computed(() => windowSize.value.width >= 768 && windowSize.value.width < 1024);
  const isDesktop = computed(() => windowSize.value.width >= 1024);
  
  const effectiveTheme = computed(() => {
    if (themeMode.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return themeMode.value;
  });
  
  const sidebarCollapsedWidth = computed(() => sidebarCollapsed.value ? 64 : sidebarWidth.value);
  
  /**
   * 初始化应用
   */
  const initApp = async () => {
    try {
      loading.value = true;
      
      // 从本地存储恢复设置
      await restoreSettings();
      
      // 初始化主题
      await initTheme();
      
      // 监听系统主题变化
      watchSystemTheme();
      
      console.log('应用初始化完成');
    } catch (error) {
      console.error('应用初始化失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * 从本地存储恢复设置
   */
  const restoreSettings = async () => {
    try {
      const savedTheme = localStorage.getItem('verto-theme');
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        themeMode.value = savedTheme as ThemeMode;
      }
      
      const savedSidebarCollapsed = localStorage.getItem('verto-sidebar-collapsed');
      if (savedSidebarCollapsed !== null) {
        sidebarCollapsed.value = JSON.parse(savedSidebarCollapsed);
      }
      
      const savedSidebarWidth = localStorage.getItem('verto-sidebar-width');
      if (savedSidebarWidth) {
        sidebarWidth.value = parseInt(savedSidebarWidth, 10);
      }
    } catch (error) {
      console.error('恢复设置失败:', error);
    }
  };
  
  /**
   * 初始化主题
   */
  const initTheme = async () => {
    const theme = effectiveTheme.value;
    isDarkMode.value = theme === 'dark';
    
    // 设置HTML类名
    document.documentElement.classList.toggle('dark', isDarkMode.value);
    
    // 设置Element Plus主题
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  /**
   * 监听系统主题变化
   */
  const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (themeMode.value === 'auto') {
        isDarkMode.value = e.matches;
        initTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
  };
  
  /**
   * 设置主题模式
   */
  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode;
    localStorage.setItem('verto-theme', mode);
    initTheme();
  };
  
  /**
   * 切换主题
   */
  const toggleTheme = () => {
    const newMode = isDarkMode.value ? 'light' : 'dark';
    setThemeMode(newMode);
  };
  
  /**
   * 设置应用就绪状态
   */
  const setAppReady = (ready: boolean) => {
    appReady.value = ready;
  };
  
  /**
   * 设置加载状态
   */
  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading;
  };
  
  /**
   * 设置在线状态
   */
  const setOnlineStatus = (online: boolean) => {
    onlineStatus.value = online;
  };
  
  /**
   * 更新窗口大小
   */
  const updateWindowSize = (size: WindowSize) => {
    windowSize.value = size;
  };
  
  /**
   * 设置当前路由
   */
  const setCurrentRoute = (route: CurrentRoute) => {
    currentRoute.value = route;
  };
  
  /**
   * 切换侧边栏折叠状态
   */
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
    localStorage.setItem('verto-sidebar-collapsed', JSON.stringify(sidebarCollapsed.value));
  };
  
  /**
   * 设置侧边栏宽度
   */
  const setSidebarWidth = (width: number) => {
    sidebarWidth.value = Math.max(200, Math.min(400, width));
    localStorage.setItem('verto-sidebar-width', sidebarWidth.value.toString());
  };
  
  /**
   * 切换命令面板
   */
  const toggleCommandPalette = () => {
    commandPaletteVisible.value = !commandPaletteVisible.value;
  };
  
  /**
   * 切换快捷键帮助
   */
  const toggleShortcutHelp = () => {
    shortcutHelpVisible.value = !shortcutHelpVisible.value;
  };
  
  /**
   * 关闭所有模态框
   */
  const closeAllModals = () => {
    commandPaletteVisible.value = false;
    shortcutHelpVisible.value = false;
  };
  
  /**
   * 更新应用配置
   */
  const updateConfig = (newConfig: Partial<AppConfig>) => {
    config.value = { ...config.value, ...newConfig };
  };
  
  return {
    // 状态
    appReady,
    loading,
    onlineStatus,
    themeMode,
    isDarkMode,
    windowSize,
    currentRoute,
    sidebarCollapsed,
    sidebarWidth,
    commandPaletteVisible,
    shortcutHelpVisible,
    config,
    
    // 计算属性
    isMobile,
    isTablet,
    isDesktop,
    effectiveTheme,
    sidebarCollapsedWidth,
    
    // 方法
    initApp,
    setThemeMode,
    toggleTheme,
    setAppReady,
    setLoading,
    setOnlineStatus,
    updateWindowSize,
    setCurrentRoute,
    toggleSidebar,
    setSidebarWidth,
    toggleCommandPalette,
    toggleShortcutHelp,
    closeAllModals,
    updateConfig
  };
});