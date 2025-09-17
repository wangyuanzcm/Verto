import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    component: () => import('#/layouts').then((m) => m.BasicLayout),
    meta: {
      icon: 'lucide:folder-open',
      title: '应用管理',
    },
    name: 'Application',
    path: '/application',
    children: [
      {
        name: 'ApplicationList',
        path: '/application/list',
        component: () => import('#/views/application/list.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:list',
          title: '应用列表',
        },
      },
      {
        name: 'ApplicationCreate',
        path: '/application/create',
        component: () => import('#/views/application/form.vue'),
        meta: {
          hideInMenu: true,
          icon: 'lucide:plus',
          title: '创建应用',
        },
      },
      {
        name: 'ApplicationDetail',
        path: '/application/detail/:id',
        component: () => import('#/views/application/detail.vue'),
        meta: {
          hideInMenu: true,
          icon: 'lucide:eye',
          title: '应用详情',
        },
      },
      {
        name: 'ApplicationTemplate',
        path: '/application/template',
        component: () => import('#/views/application/template.vue'),
        meta: {
          icon: 'lucide:layout-template',
          title: '应用模板',
        },
      },
      {
        name: 'ApplicationPipeline',
        path: '/application/pipeline',
        component: () => import('#/views/application/pipeline.vue'),
        meta: {
          icon: 'lucide:git-branch',
          title: '应用流水线',
        },
      },
    ],
  },
];

export default routes;
