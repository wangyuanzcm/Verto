import { FormSchema } from '/@/components/Form';

// 模板类型
export interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
  tags: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  configTemplate: string;
}

// 模板列表
export const templateList: Template[] = [
  {
    id: '1',
    name: 'Vue3 管理后台',
    type: 'vue-admin',
    description: '基于Vue3 + TypeScript + Vite的现代化管理后台模板',
    icon: 'logos:vue',
    tags: ['Vue3', 'TypeScript', '管理后台'],
    dependencies: {
      'vue': '^3.3.0',
      'vue-router': '^4.2.0',
      'pinia': '^2.1.0',
      'ant-design-vue': '^4.0.0',
      'axios': '^1.4.0',
    },
    devDependencies: {
      'vite': '^4.4.0',
      'typescript': '^5.0.0',
      '@vitejs/plugin-vue': '^4.2.0',
      'eslint': '^8.45.0',
      'prettier': '^3.0.0',
    },
    configTemplate: `// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})`,
  },
  {
    id: '2',
    name: 'React 管理后台',
    type: 'react-admin',
    description: '基于React + TypeScript + Vite的企业级管理后台模板',
    icon: 'logos:react',
    tags: ['React', 'TypeScript', '管理后台'],
    dependencies: {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'react-router-dom': '^6.14.0',
      'antd': '^5.8.0',
      'axios': '^1.4.0',
    },
    devDependencies: {
      'vite': '^4.4.0',
      'typescript': '^5.0.0',
      '@vitejs/plugin-react': '^4.0.0',
      'eslint': '^8.45.0',
      'prettier': '^3.0.0',
    },
    configTemplate: `// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})`,
  },
  {
    id: '3',
    name: 'Vue3 移动端应用',
    type: 'vue-mobile',
    description: '基于Vue3 + Vant的移动端应用模板',
    icon: 'logos:vue',
    tags: ['Vue3', 'Vant', '移动端'],
    dependencies: {
      'vue': '^3.3.0',
      'vue-router': '^4.2.0',
      'pinia': '^2.1.0',
      'vant': '^4.6.0',
      'axios': '^1.4.0',
    },
    devDependencies: {
      'vite': '^4.4.0',
      'typescript': '^5.0.0',
      '@vitejs/plugin-vue': '^4.2.0',
      'postcss': '^8.4.0',
      'autoprefixer': '^10.4.0',
    },
    configTemplate: `// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  css: {
    postcss: {
      plugins: [
        require('autoprefixer')
      ]
    }
  }
})`,
  },
  {
    id: '4',
    name: 'Node.js 微服务',
    type: 'node-microservice',
    description: '基于Node.js + Express + TypeScript的微服务模板',
    icon: 'logos:nodejs',
    tags: ['Node.js', 'Express', '微服务'],
    dependencies: {
      'express': '^4.18.0',
      'cors': '^2.8.5',
      'helmet': '^7.0.0',
      'dotenv': '^16.3.0',
      'mongoose': '^7.4.0',
    },
    devDependencies: {
      'typescript': '^5.0.0',
      '@types/express': '^4.17.0',
      '@types/cors': '^2.8.0',
      'nodemon': '^3.0.0',
      'ts-node': '^10.9.0',
    },
    configTemplate: `// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}`,
  },
  {
    id: '5',
    name: 'Electron 桌面应用',
    type: 'electron-app',
    description: '基于Electron + Vue3的跨平台桌面应用模板',
    icon: 'logos:electron',
    tags: ['Electron', 'Vue3', '桌面应用'],
    dependencies: {
      'vue': '^3.3.0',
      'electron': '^25.0.0',
      'electron-builder': '^24.0.0',
    },
    devDependencies: {
      'vite': '^4.4.0',
      'typescript': '^5.0.0',
      '@vitejs/plugin-vue': '^4.2.0',
      'electron-vite': '^1.0.0',
    },
    configTemplate: `// electron.vite.config.ts
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    plugins: [vue()]
  }
})`,
  },
  {
    id: '6',
    name: 'Next.js 全栈应用',
    type: 'nextjs-fullstack',
    description: '基于Next.js + TypeScript的全栈应用模板',
    icon: 'logos:nextjs',
    tags: ['Next.js', 'TypeScript', '全栈'],
    dependencies: {
      'next': '^13.4.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      '@next/font': '^13.4.0',
    },
    devDependencies: {
      'typescript': '^5.0.0',
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      'eslint': '^8.45.0',
      'eslint-config-next': '^13.4.0',
    },
    configTemplate: `// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig`,
  },
];

/**
 * 获取模板表单配置
 */
export function getTemplateFormSchema(templateType: string): FormSchema[] {
  const baseSchema: FormSchema[] = [
    {
      field: 'appName',
      label: '应用名称',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入应用名称',
      },
      rules: [
        { required: true, message: '请输入应用名称' },
        { pattern: /^[a-zA-Z][a-zA-Z0-9-_]*$/, message: '应用名称只能包含字母、数字、横线和下划线，且必须以字母开头' },
      ],
    },
    {
      field: 'appDescription',
      label: '应用描述',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入应用描述',
        rows: 3,
      },
    },
    {
      field: 'version',
      label: '版本号',
      component: 'Input',
      defaultValue: '1.0.0',
      componentProps: {
        placeholder: '请输入版本号',
      },
      rules: [
        { pattern: /^\d+\.\d+\.\d+$/, message: '版本号格式不正确，应为 x.y.z 格式' },
      ],
    },
    {
      field: 'author',
      label: '作者',
      component: 'Input',
      componentProps: {
        placeholder: '请输入作者名称',
      },
    },
    {
      field: 'license',
      label: '许可证',
      component: 'Select',
      defaultValue: 'MIT',
      componentProps: {
        options: [
          { label: 'MIT', value: 'MIT' },
          { label: 'Apache-2.0', value: 'Apache-2.0' },
          { label: 'GPL-3.0', value: 'GPL-3.0' },
          { label: 'BSD-3-Clause', value: 'BSD-3-Clause' },
          { label: 'ISC', value: 'ISC' },
        ],
      },
    },
  ];

  // 根据模板类型添加特定配置
  switch (templateType) {
    case 'vue-admin':
    case 'vue-mobile':
      return [
        ...baseSchema,
        {
          field: 'useTypeScript',
          label: '使用TypeScript',
          component: 'Switch',
          defaultValue: true,
        },
        {
          field: 'useRouter',
          label: '使用Vue Router',
          component: 'Switch',
          defaultValue: true,
        },
        {
          field: 'usePinia',
          label: '使用Pinia状态管理',
          component: 'Switch',
          defaultValue: true,
        },
        {
          field: 'useEslint',
          label: '使用ESLint',
          component: 'Switch',
          defaultValue: true,
        },
      ];

    case 'react-admin':
      return [
        ...baseSchema,
        {
          field: 'useTypeScript',
          label: '使用TypeScript',
          component: 'Switch',
          defaultValue: true,
        },
        {
          field: 'useRouter',
          label: '使用React Router',
          component: 'Switch',
          defaultValue: true,
        },
        {
          field: 'useRedux',
          label: '使用Redux状态管理',
          component: 'Switch',
          defaultValue: false,
        },
        {
          field: 'useAntd',
          label: '使用Ant Design',
          component: 'Switch',
          defaultValue: true,
        },
      ];

    case 'node-microservice':
      return [
        ...baseSchema,
        {
          field: 'port',
          label: '服务端口',
          component: 'InputNumber',
          defaultValue: 3000,
          componentProps: {
            min: 1000,
            max: 65535,
          },
        },
        {
          field: 'useDatabase',
          label: '数据库类型',
          component: 'Select',
          componentProps: {
            options: [
              { label: '不使用数据库', value: 'none' },
              { label: 'MongoDB', value: 'mongodb' },
              { label: 'MySQL', value: 'mysql' },
              { label: 'PostgreSQL', value: 'postgresql' },
            ],
          },
          defaultValue: 'mongodb',
        },
        {
          field: 'useAuth',
          label: '使用身份验证',
          component: 'Switch',
          defaultValue: true,
        },
      ];

    case 'electron-app':
      return [
        ...baseSchema,
        {
          field: 'windowWidth',
          label: '窗口宽度',
          component: 'InputNumber',
          defaultValue: 1200,
          componentProps: {
            min: 800,
            max: 2000,
          },
        },
        {
          field: 'windowHeight',
          label: '窗口高度',
          component: 'InputNumber',
          defaultValue: 800,
          componentProps: {
            min: 600,
            max: 1500,
          },
        },
        {
          field: 'resizable',
          label: '允许调整窗口大小',
          component: 'Switch',
          defaultValue: true,
        },
      ];

    default:
      return baseSchema;
  }
}