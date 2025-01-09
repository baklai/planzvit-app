import { createRouter, createWebHashHistory } from 'vue-router';
import { inject } from 'vue';

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
      component: () => import('@/views/Index.vue'),
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
      meta: { auth: true },
      redirect: { name: 'report-monthly' },
      component: () => import('@/views/report/ReportView.vue'),
      children: [
        {
          path: 'monthly',
          name: 'report-monthly',
          meta: {
            title: 'Щомісячний звіт',
            description: 'Звіт про надання послуг з програмно-технологічного супроводу'
          },
          component: () => import('@/views/report/MonthlyView.vue')
        }
      ]
    },

    {
      path: '/table',
      name: 'table',
      meta: { auth: true },
      redirect: { name: 'table-statistics' },
      component: () => import('@/views/table/TableView.vue'),
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
        }
      ]
    },

    {
      path: '/core',
      name: 'core',
      meta: { auth: true },
      redirect: { name: 'core-statistics' },
      component: () => import('@/views/core/CoreView.vue'),
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
    document.title = `PZ • Програмно-технологічний супровід`;
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
  } else if (to?.meta?.admin && !store.isAdmin) {
    return { name: 'access-denied' };
  } else {
    return;
  }
});

export default router;
