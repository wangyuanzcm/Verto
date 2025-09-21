import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

/**
 * 物料管理路由配置
 * 包含组件管理和模板管理两个子模块
 */
const material: AppRouteModule = {
  path: '/material',
  name: 'Material',
  component: LAYOUT,
  redirect: '/material/component',
  meta: {
    orderNo: 3000,
    icon: 'ant-design:appstore-outlined',
    title: '物料管理',
  },
  children: [
    {
      path: 'component',
      name: 'ComponentManagement',
      component: () => import('/@/views/material/component/index.vue'),
      meta: {
        title: '组件管理',
        ignoreKeepAlive: true,
      },
    },
    {
      path: 'template',
      name: 'TemplateManagement',
      component: () => import('/@/views/material/template/index.vue'),
      meta: {
        title: '模板管理',
        ignoreKeepAlive: true,
      },
    },
  ],
};

export default material;