import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

const points: AppRouteModule = {
  path: '/points',
  name: 'Points',
  component: LAYOUT,
  redirect: '/points/manage',
  meta: {
    orderNo: 1200,
    icon: 'ion:trophy-outline',
    title: '积分管理',
  },
  children: [
    {
      path: 'manage',
      name: 'PointsManage',
      meta: {
        title: '积分管理',
        ignoreKeepAlive: true,
      },
      component: () => import('/@/views/points/PointsManage.vue'),
    },
  ],
};

export default points;