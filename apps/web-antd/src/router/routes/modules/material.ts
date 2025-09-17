import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:package',
      keepAlive: true,
      order: 2,
      title: '物料管理',
    },
    name: 'Material',
    path: '/material',
    component: () => import('#/layouts').then((m) => m.BasicLayout),
    children: [
      {
        name: 'MaterialList',
        path: '/material/list',
        component: () => import('#/views/material/list.vue'),
        meta: {
          icon: 'lucide:list',
          title: '物料列表',
        },
      },
      {
        name: 'ComponentLibrary',
        path: '/material/components',
        component: () => import('#/views/material/components.vue'),
        meta: {
          icon: 'lucide:component',
          title: '组件库',
        },
      },
      {
        name: 'CodeSnippets',
        path: '/material/snippets',
        component: () => import('#/views/material/snippets.vue'),
        meta: {
          icon: 'lucide:code',
          title: '代码片段',
        },
      },
      {
        name: 'MaterialTemplates',
        path: '/material/templates',
        component: () => import('#/views/material/templates.vue'),
        meta: {
          icon: 'lucide:layout-template',
          title: '物料模板',
        },
      },
      {
        name: 'MaterialDetail',
        path: '/material/detail/:id',
        component: () => import('#/views/material/detail.vue'),
        meta: {
          hideInMenu: true,
          title: '物料详情',
        },
      },
      {
        name: 'MaterialCreate',
        path: '/material/create',
        component: () => import('#/views/material/modules/form.vue'),
        meta: {
          hideInMenu: true,
          title: '创建物料',
        },
      },
    ],
  },
];

export default routes;
