import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

/**
 * 项目管理路由配置
 * 包含项目列表、项目详情等功能模块
 */
const project: AppRouteModule = {
  path: '/project',
  name: 'Project',
  component: LAYOUT,
  redirect: '/project/list',
  meta: {
    orderNo: 200,
    icon: 'ant-design:project-outlined',
    title: '项目管理',
  },
  children: [
    {
      path: 'list',
      name: 'ProjectList',
      component: () => import('/@/views/project/ProjectList.vue'),
      meta: {
        title: '项目列表',
        hideMenu: false,
      },
    },
    {
      path: 'detail/:id',
      name: 'ProjectDetail',
      component: () => import('/@/views/project/ProjectDetail.vue'),
      meta: {
        title: '项目详情',
        hideMenu: true,
        hideTab: false,
        currentActiveMenu: '/project/list',
      },
    },
    {
      path: 'edit/:id',
      name: 'ProjectEdit',
      component: () => import('/@/views/project/ProjectEdit.vue'),
      meta: {
        title: '编辑项目',
        hideMenu: true,
        hideTab: false,
        currentActiveMenu: '/project/list',
      },
    },
    {
      path: 'add',
      name: 'ProjectAdd',
      component: () => import('/@/views/project/ProjectEdit.vue'),
      meta: {
        title: '新建项目',
        hideMenu: true,
        hideTab: false,
        currentActiveMenu: '/project/list',
      },
    },
  ],
};

export default project;