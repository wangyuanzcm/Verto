import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

const appmanage: AppRouteModule = {
  path: '/appmanage',
  name: 'AppManage',
  component: LAYOUT,
  redirect: '/appmanage/list',
  meta: {
    orderNo: 100,
    icon: 'ant-design:appstore-outlined',
    title: '应用管理',
  },
  children: [
    {
      path: 'list',
      name: 'AppManageList',
      component: () => import('/@/views/appmanage/AppManageList.vue'),
      meta: {
        title: '应用列表',
        hideMenu: false,
      },
    },
    {
      path: 'detail/:id',
      name: 'AppManageDetail',
      component: () => import('/@/views/appmanage/AppManageDetail.vue'),
      meta: {
        title: '应用详情',
        hideMenu: true,
        hideTab: false,
        currentActiveMenu: '/appmanage/list',
      },
    },
    {
      path: 'config',
      name: 'ConfigManage',
      component: () => import('/@/views/appmanage/config/ConfigList.vue'),
      meta: {
        title: '配置中心',
        hideMenu: false,
      },
    },
    {
      path: 'config/detail/:id',
      name: 'ConfigDetail',
      component: () => import('/@/views/appmanage/config/ConfigDetail.vue'),
      meta: {
        title: '配置详情',
        hideMenu: true,
        hideTab: false,
        currentActiveMenu: '/appmanage/config',
      },
    },
  ],
};

export default appmanage;