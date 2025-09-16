/// <reference types="vite/client" />

/**
 * 环境变量类型声明
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_WEBSOCKET_URL: string;
  readonly VITE_UPLOAD_URL: string;
  readonly VITE_ENABLE_MOCK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Vue组件类型声明
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

/**
 * Electron API类型声明
 */
declare global {
  interface Window {
    electronAPI: {
      ping: () => void;
      onMenuAction: (callback: (action: string) => void) => void;
      removeMenuListener: (callback: (action: string) => void) => void;
      getVersion: () => Promise<string>;
      openExternal: (url: string) => void;
      showSaveDialog: (options: any) => Promise<any>;
      showOpenDialog: (options: any) => Promise<any>;
      fs: {
        readFile: (path: string) => Promise<string>;
        writeFile: (path: string, data: string) => Promise<void>;
        exists: (path: string) => Promise<boolean>;
      };
    };
  }
}

export {};