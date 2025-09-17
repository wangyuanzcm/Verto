import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:file-text',
      title: '需求管理',
    },
    name: 'Requirement',
    path: '/requirement',
    component: () => import('#/layouts').then((m) => m.BasicLayout),
    children: [
      {
        name: 'RequirementList',
        path: '/requirement/list',
        component: () => import('#/views/requirement/list.vue'),
        meta: {
          icon: 'lucide:list',
          title: '需求列表',
        },
      },
      {
        name: 'RequirementCreate',
        path: '/requirement/create',
        component: () => import('#/views/requirement/create.vue'),
        meta: {
          icon: 'lucide:plus',
          title: '创建需求',
        },
      },
      {
        name: 'RequirementDetail',
        path: '/requirement/detail/:id',
        component: () => import('#/views/requirement/detail.vue'),
        meta: {
          hideInMenu: true,
          icon: 'lucide:eye',
          title: '需求详情',
        },
      },
      {
        name: 'RequirementEdit',
        path: '/requirement/edit/:id',
        component: () => import('#/views/requirement/edit.vue'),
        meta: {
          hideInMenu: true,
          icon: 'lucide:edit',
          title: '编辑需求',
        },
      },
      {
        name: 'RequirementReview',
        path: '/requirement/review',
        component: () => import('#/views/requirement/review.vue'),
        meta: {
          icon: 'lucide:check-circle',
          title: '需求评审',
        },
      },
      {
        name: 'RequirementAnalysis',
        path: '/requirement/analysis',
        component: () => import('#/views/requirement/analysis.vue'),
        meta: {
          icon: 'lucide:bar-chart',
          title: '需求分析',
        },
      },
    ],
  },
];

export default routes;
