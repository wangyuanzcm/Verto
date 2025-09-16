import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useAppStore } from '@/stores/app';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

/**
 * 路由配置
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
      hideInMenu: true
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: {
      title: '仪表盘',
      icon: 'Dashboard',
      requiresAuth: true
    }
  },
  {
    path: '/project',
    name: 'Project',
    component: () => import('@/views/project/ProjectLayout.vue'),
    meta: {
      title: '项目管理',
      icon: 'Folder',
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'ProjectList',
        component: () => import('@/views/project/ProjectListView.vue'),
        meta: {
          title: '项目列表',
          requiresAuth: true
        }
      },
      {
        path: 'new',
        name: 'ProjectNew',
        component: () => import('@/views/project/ProjectNewView.vue'),
        meta: {
          title: '新建项目',
          requiresAuth: true
        }
      },
      {
        path: ':id',
        name: 'ProjectDetail',
        component: () => import('@/views/project/ProjectDetailView.vue'),
        meta: {
          title: '项目详情',
          requiresAuth: true
        }
      },
      {
        path: ':id/edit',
        name: 'ProjectEdit',
        component: () => import('@/views/project/ProjectEditView.vue'),
        meta: {
          title: '编辑项目',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/requirement',
    name: 'Requirement',
    component: () => import('@/views/requirement/RequirementLayout.vue'),
    meta: {
      title: '需求管理',
      icon: 'Document',
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'RequirementList',
        component: () => import('@/views/requirement/RequirementListView.vue'),
        meta: {
          title: '需求列表',
          requiresAuth: true
        }
      },
      {
        path: 'new',
        name: 'RequirementNew',
        component: () => import('@/views/requirement/RequirementNewView.vue'),
        meta: {
          title: '新建需求',
          requiresAuth: true
        }
      },
      {
        path: ':id',
        name: 'RequirementDetail',
        component: () => import('@/views/requirement/RequirementDetailView.vue'),
        meta: {
          title: '需求详情',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/prototype',
    name: 'Prototype',
    component: () => import('@/views/prototype/PrototypeLayout.vue'),
    meta: {
      title: '原型设计',
      icon: 'Monitor',
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'PrototypeList',
        component: () => import('@/views/prototype/PrototypeListView.vue'),
        meta: {
          title: '原型列表',
          requiresAuth: true
        }
      },
      {
        path: 'new',
        name: 'PrototypeNew',
        component: () => import('@/views/prototype/PrototypeNewView.vue'),
        meta: {
          title: '新建原型',
          requiresAuth: true
        }
      },
      {
        path: ':id',
        name: 'PrototypeDetail',
        component: () => import('@/views/prototype/PrototypeDetailView.vue'),
        meta: {
          title: '原型详情',
          requiresAuth: true
        }
      },
      {
        path: ':id/editor',
        name: 'PrototypeEditor',
        component: () => import('@/views/prototype/PrototypeEditorView.vue'),
        meta: {
          title: '原型编辑器',
          requiresAuth: true,
          fullscreen: true
        }
      }
    ]
  },
  {
    path: '/material',
    name: 'Material',
    component: () => import('@/views/material/MaterialLayout.vue'),
    meta: {
      title: '物料管理',
      icon: 'Box',
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'MaterialList',
        component: () => import('@/views/material/MaterialListView.vue'),
        meta: {
          title: '物料列表',
          requiresAuth: true
        }
      },
      {
        path: 'library',
        name: 'MaterialLibrary',
        component: () => import('@/views/material/MaterialLibraryView.vue'),
        meta: {
          title: '组件库',
          requiresAuth: true
        }
      },
      {
        path: ':id',
        name: 'MaterialDetail',
        component: () => import('@/views/material/MaterialDetailView.vue'),
        meta: {
          title: '物料详情',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/SettingsLayout.vue'),
    meta: {
      title: '系统设置',
      icon: 'Setting',
      requiresAuth: true
    },
    children: [
      {
        path: '',
        redirect: '/settings/profile'
      },
      {
        path: 'profile',
        name: 'SettingsProfile',
        component: () => import('@/views/settings/ProfileView.vue'),
        meta: {
          title: '个人资料',
          requiresAuth: true
        }
      },
      {
        path: 'system',
        name: 'SettingsSystem',
        component: () => import('@/views/settings/SystemView.vue'),
        meta: {
          title: '系统配置',
          requiresAuth: true,
          requiresAdmin: true
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: {
      title: '页面未找到',
      hideInMenu: true
    }
  }
];

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

/**
 * 全局前置守卫
 */
router.beforeEach(async (to, from, next) => {
  // 开始进度条
  NProgress.start();
  
  const userStore = useUserStore();
  const appStore = useAppStore();
  
  // 设置页面标题
  const title = to.meta.title as string;
  if (title) {
    document.title = `${title} - Verto`;
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      // 未登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
      return;
    }
    
    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin && !userStore.isAdmin) {
      ElMessage.error('您没有权限访问此页面');
      next('/dashboard');
      return;
    }
  }
  
  // 如果已登录且访问登录页，重定向到仪表盘
  if (to.path === '/login' && userStore.isLoggedIn) {
    next('/dashboard');
    return;
  }
  
  // 更新当前路由信息
  appStore.setCurrentRoute({
    path: to.path,
    name: to.name as string,
    meta: to.meta
  });
  
  next();
});

/**
 * 全局后置守卫
 */
router.afterEach((to, from) => {
  // 结束进度条
  NProgress.done();
  
  // 记录路由变化
  console.log(`路由变化: ${from.path} -> ${to.path}`);
});

/**
 * 路由错误处理
 */
router.onError((error) => {
  console.error('路由错误:', error);
  NProgress.done();
  ElMessage.error('页面加载失败，请重试');
});

export default router;