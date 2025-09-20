import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

const appmanage: AppRouteModule = {
  path: '/super/appmanage',
  name: 'AppManage',
  component: LAYOUT,
  redirect: '/super/appmanage/list',
  meta: {
    orderNo: 100,
    icon: 'ant-design:appstore-outlined',
    title: '应用管理',
  },
  children: [
    {
      path: 'list',
      name: 'AppManageList',
      component: () => import('/@/views/super/appmanage/AppManageList.vue'),
      meta: {
        title: '应用列表',
        hideMenu: false,
      },
    },
    {
      path: 'detail/:id',
      name: 'AppManageDetail',
      component: () => import('/@/views/super/appmanage/AppManageDetail.vue'),
      meta: {
        title: '应用详情',
        hideMenu: true,
        hideTab: false,
        currentActiveMenu: '/super/appmanage/list',
      },
    },
  ],
};

export default appmanage;