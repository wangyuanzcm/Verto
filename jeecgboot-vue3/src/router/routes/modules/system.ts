import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const system: AppRouteModule = {
  path: '/system',
  name: 'System',
  component: LAYOUT,
  redirect: '/system/user',
  meta: {
    orderNo: 2000,
    icon: 'ion:settings-outline',
    title: '系统管理',
  },
  children: [
    {
      path: 'user',
      name: 'UserManagement',
      meta: {
        title: '用户管理',
        ignoreKeepAlive: true,
      },
      component: () => import('/@/views/system/user/index.vue'),
    },
    {
      path: 'staff',
      name: 'StaffManagement',
      meta: {
        title: '人员管理',
        ignoreKeepAlive: true,
      },
      component: () => import('/@/views/system/staff/index.vue'),
    },
    {
      path: 'role',
      name: 'RoleManagement',
      meta: {
        title: '角色管理',
        ignoreKeepAlive: true,
      },
      component: () => import('/@/views/system/role/index.vue'),
    },
    {
      path: 'menu',
      name: 'MenuManagement',
      meta: {
        title: '菜单管理',
        ignoreKeepAlive: true,
      },
      component: () => import('/@/views/system/menu/index.vue'),
    },
    {
      path: 'depart',
      name: 'DepartManagement',
      meta: {
        title: '部门管理',
        ignoreKeepAlive: true,
      },
      component: () => import('/@/views/system/depart/index.vue'),
    },
    {
      path: 'position',
      name: 'PositionManagement',
      meta: {
        title: '职务管理',
        ignoreKeepAlive: true,
      },
      component: () => import('/@/views/system/position/index.vue'),
    },
    {
      path: 'dict',
      name: 'DictManagement',
      meta: {
        title: '字典管理',
        ignoreKeepAlive: true,
      },
      component: () => import('/@/views/system/dict/index.vue'),
    },
  ],
};

export default system;