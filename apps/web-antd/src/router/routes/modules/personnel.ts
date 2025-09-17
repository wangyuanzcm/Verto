import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

/**
 * 人员管理路由配置
 * 包含用户管理、角色管理、部门管理等功能
 */
const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:users',
      keepAlive: true,
      order: 3,
      title: $t('personnel.title'),
    },
    name: 'Personnel',
    path: '/personnel',
    children: [
      {
        name: 'UserManagement',
        path: '/personnel/users',
        component: () => import('#/views/personnel/user.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:user-check',
          title: $t('personnel.user.title'),
        },
      },
      {
        name: 'RoleManagement',
        path: '/personnel/roles',
        component: () => import('#/views/personnel/role.vue'),
        meta: {
          icon: 'lucide:shield-check',
          title: $t('personnel.role.title'),
        },
      },
      {
        name: 'DepartmentManagement',
        path: '/personnel/departments',
        component: () => import('#/views/personnel/department.vue'),
        meta: {
          icon: 'lucide:building',
          title: $t('personnel.department.title'),
        },
      },
    ],
  },
];

export default routes;
