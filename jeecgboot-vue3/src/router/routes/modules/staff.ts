import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

/**
 * 人员管理路由模块
 * 包含人员管理相关的所有路由配置
 */
const staff: AppRouteModule = {
  path: '/staff',
  name: 'Staff',
  component: LAYOUT,
  redirect: '/staff/list',
  meta: {
    orderNo: 1500,
    icon: 'ion:people-outline',
    title: '人员管理',
  },
  children: [
    {
      path: 'list',
      name: 'StaffList',
      meta: {
        title: '人员列表',
        ignoreKeepAlive: true,
        currentActiveMenu: '/staff/list',
      },
      component: () => import('/@/views/staff/index.vue'),
    },
    {
      path: 'detail/:id',
      name: 'StaffDetail',
      meta: {
        title: '人员详情',
        ignoreKeepAlive: true,
        hideMenu: true,
        currentActiveMenu: '/staff/list',
      },
      component: () => import('/@/views/staff/StaffDetail.vue'),
    },
    {
      path: 'edit/:id',
      name: 'StaffEdit',
      meta: {
        title: '编辑人员',
        ignoreKeepAlive: true,
        hideMenu: true,
        currentActiveMenu: '/staff/list',
      },
      component: () => import('/@/views/staff/StaffEdit.vue'),
    },
    {
      path: 'create',
      name: 'StaffCreate',
      meta: {
        title: '新增人员',
        ignoreKeepAlive: true,
        hideMenu: true,
        currentActiveMenu: '/staff/list',
      },
      component: () => import('/@/views/staff/StaffCreate.vue'),
    },
  ],
};

export default staff;