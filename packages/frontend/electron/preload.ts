import { contextBridge, ipcRenderer } from 'electron';

/**
 * Electron API接口定义
 */
export interface ElectronAPI {
  /**
   * 发送ping消息到主进程
   */
  ping: () => void;
  
  /**
   * 监听菜单事件
   */
  onMenuAction: (callback: (action: string) => void) => void;
  
  /**
   * 移除菜单事件监听器
   */
  removeMenuListener: (callback: (action: string) => void) => void;
  
  /**
   * 获取应用版本信息
   */
  getVersion: () => Promise<string>;
  
  /**
   * 打开外部链接
   */
  openExternal: (url: string) => void;
  
  /**
   * 显示保存对话框
   */
  showSaveDialog: (options: any) => Promise<any>;
  
  /**
   * 显示打开对话框
   */
  showOpenDialog: (options: any) => Promise<any>;
  
  /**
   * 文件系统操作
   */
  fs: {
    readFile: (path: string) => Promise<string>;
    writeFile: (path: string, data: string) => Promise<void>;
    exists: (path: string) => Promise<boolean>;
  };
}

/**
 * 暴露给渲染进程的API
 */
const electronAPI: ElectronAPI = {
  ping: () => ipcRenderer.invoke('ping'),
  
  onMenuAction: (callback) => {
    const menuActions = [
      'menu-new-project',
      'menu-open-project', 
      'menu-about'
    ];
    
    menuActions.forEach(action => {
      ipcRenderer.on(action, () => callback(action));
    });
  },
  
  removeMenuListener: (callback) => {
    const menuActions = [
      'menu-new-project',
      'menu-open-project',
      'menu-about'
    ];
    
    menuActions.forEach(action => {
      ipcRenderer.removeListener(action, callback);
    });
  },
  
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  fs: {
    readFile: (path) => ipcRenderer.invoke('fs-read-file', path),
    writeFile: (path, data) => ipcRenderer.invoke('fs-write-file', path, data),
    exists: (path) => ipcRenderer.invoke('fs-exists', path)
  }
};

/**
 * 在渲染进程中暴露Electron API
 */
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  } catch (error) {
    console.error('Failed to expose electronAPI:', error);
  }
} else {
  // 如果上下文隔离被禁用，直接在window对象上设置
  (window as any).electronAPI = electronAPI;
}

/**
 * 类型声明，供TypeScript使用
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}