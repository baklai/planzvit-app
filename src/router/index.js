import { inject } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';

import PrivateLayout from '@/layout/PrivateLayout.vue';
import PublicLayout from '@/layout/PublicLayout.vue';

import { useApp } from '@/stores/app';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      meta: {
        title: 'Планзвіт',
        description: 'Програмно-технологічний супровід'
      },
      component: () => import('@/views/HomeView.vue'),
      beforeEnter: (to, from) => {
        const store = useApp();
        if (!store.loggedIn) {
          return { path: '/auth/signin' };
        } else {
          return true;
        }
      }
    },

    {
      path: '/report',
      name: 'report',
      meta: {
        auth: true,
        roles: ['user', 'moderator', 'administrator'],
        title: 'Щомісячний звіт',
        description: 'Звіт про надання послуг з програмно-технологічного супроводу'
      },
      component: () => import('@/views/ReportView.vue')
    },

    {
      path: '/sheet',
      name: 'sheet',
      meta: {
        auth: true,
        roles: ['moderator', 'administrator'],
        title: 'Акти здавання-приймання послуг',
        description: 'Акти здавання-приймання послуг, які надаються на вимогу'
      },
      component: () => import('@/views/sheet/MainSheetView.vue'),
      children: [
        {
          path: 'service',
          name: 'sheet-service',
          meta: {
            title: 'Вартість робіт',
            description: 'Вартість робіт, що підтримуються'
          },
          component: () => import('@/views/sheet/ServiceSheetView.vue')
        },
        {
          path: 'report',
          name: 'sheet-report',
          meta: {
            title: 'Щомісячні звіти',
            description: 'Звіти про надання послуг з програмно-технологічного супроводу'
          },
          component: () => import('@/views/sheet/ReportSheetView.vue')
        },
        {
          path: 'branch',
          name: 'sheet-branch',
          meta: {
            title: 'Акт послуг службам (філіям)',
            description: 'Акт послуг, який надаються службам (філіям)'
          },
          component: () => import('@/views/sheet/BranchSheetView.vue')
        },
        {
          path: 'subdivision',
          name: 'sheet-subdivision',
          meta: {
            title: 'Акт послуг підрозділам',
            description: 'Акт послуг, який надаються підрозділам'
          },
          component: () => import('@/views/sheet/SubdivisionSheetView.vue')
        }
      ]
    },

    {
      path: '/table',
      name: 'table',
      meta: { auth: true, roles: ['moderator', 'administrator'] },
      redirect: { name: 'table-statistics' },
      component: () => import('@/views/table/MainTableView.vue'),
      children: [
        {
          path: 'statistics',
          name: 'table-statistics',
          meta: {
            title: 'Статистична інформація',
            description: 'Статистика по базі даних системи'
          },
          component: () => import('@/views/table/StatisticsView.vue')
        },
        {
          path: 'departments',
          name: 'table-departments',
          meta: {
            title: 'Перелік відділів',
            description: 'Перелік відділів виробничого підрозділу'
          },
          component: () => import('@/views/table/DepartmentsView.vue')
        },
        {
          path: 'services',
          name: 'table-services',
          meta: {
            title: 'Сервіси підтримки',
            description: 'Перелік сервісів, що підтримуються'
          },
          component: () => import('@/views/table/ServicesView.vue')
        },
        {
          path: 'branches',
          name: 'table-branches',
          meta: {
            title: 'Перелік служб (філій)',
            description: 'Перелік служб (філії), що обслуговуються'
          },
          component: () => import('@/views/table/BranchesView.vue')
        },
        {
          path: 'subdivisions',
          name: 'table-subdivisions',
          meta: {
            title: 'Перелік структурних підрозділів)',
            description: 'Перелік структурних підрозділів, що обслуговуються'
          },
          component: () => import('@/views/table/SubdivisionsView.vue')
        }
      ]
    },

    {
      path: '/core',
      name: 'core',
      meta: { auth: true, roles: ['administrator'] },
      redirect: { name: 'core-statistics' },
      component: () => import('@/views/core/MainCoreView.vue'),
      children: [
        {
          path: 'statistics',
          name: 'core-statistics',
          meta: {
            title: 'Статистична інформація',
            description: 'Статистика по базі даних системи'
          },
          component: () => import('@/views/core/StatisticsView.vue')
        },
        {
          path: 'profiles',
          name: 'core-profiles',
          meta: {
            title: 'Профілі користувачів',
            description: 'Список профілів користувачів'
          },
          component: () => import('@/views/core/ProfilesView.vue')
        },
        {
          path: 'syslogs',
          name: 'core-syslogs',
          meta: {
            title: 'Аудит активності',
            description: 'Журнал аудиту активності'
          },
          component: () => import('@/views/core/SyslogsView.vue')
        }
      ]
    },

    {
      path: '/auth',
      redirect: { name: 'signin' },
      children: [
        {
          path: 'signin',
          name: 'signin',
          component: () => import('@/views/auth/SigninView.vue')
        },
        {
          path: 'signup',
          name: 'signup',
          component: () => import('@/views/auth/SignupView.vue')
        },
        {
          path: 'reset',
          name: 'reset',
          component: () => import('@/views/auth/ResetView.vue')
        }
      ]
    },

    {
      path: '/access-denied',
      name: 'access-denied',
      component: () => import('@/views/error/AccessDenied.vue')
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/error/NotFound.vue')
    }
  ]
});

router.beforeEach((to, from) => {
  const title = to?.meta?.title;
  if (title) {
    document.title = `PZ • ${title}`;
  } else {
    document.title = 'PZ • Програмно-технологічний супровід';
  }

  const description = to.meta.description;
  if (description) {
    const metaDescriptionTag = document.querySelector('meta[name="description"]');
    if (metaDescriptionTag) {
      metaDescriptionTag.setAttribute('content', description);
    }
  }

  return;
});

router.beforeEach(async (to, from) => {
  const store = useApp();
  const $auth = inject('auth');

  if (!store.loggedIn && store.getRefreshToken()) {
    await $auth.me();
  }

  if (store.loggedIn && to.name !== 'signin' && to.name !== 'signup') {
    to.meta.layout = PrivateLayout;
  } else {
    to.meta.layout = PublicLayout;
  }

  if (to.name !== 'signin' && to.name !== 'signup' && to?.meta?.auth && !store.loggedIn) {
    return { name: 'signin' };
  } else if (to?.meta?.roles && !to?.meta?.roles.includes(store.profile.role)) {
    return { name: 'access-denied' };
  } else {
    return;
  }
});

export default router;
