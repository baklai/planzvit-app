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
      path: '/table',
      name: 'table',
      meta: {
        auth: true,
        title: 'База даних',
        description: 'База даних системи'
      },
      redirect: { name: 'table-dashboard' },
      component: () => import('@/views/table/TableView.vue'),
      children: [
        {
          path: 'statistics',
          name: 'table-statistics',
          meta: {
            title: 'Статистика по базі',
            description: 'Статистика по базі даних системи'
          },
          component: () => import('@/views/table/StatisticsView.vue')
        },
        {
          path: 'departments',
          name: 'table-departments',
          meta: {
            title: 'Відділи підрозділу',
            description: 'Перелік відділів підрозділу'
          },
          component: () => import('@/views/table/DepartmentsView.vue')
        },
        {
          path: 'services',
          name: 'table-services',
          meta: {
            title: 'Системи підтримки',
            description: 'Список систем підтримки'
          },
          component: () => import('@/views/table/ServicesView.vue')
        },
        {
          path: 'profiles',
          name: 'table-profiles',
          meta: {
            title: 'Профілі користувачів',
            description: 'Список профілів користувачів'
          },
          component: () => import('@/views/table/ProfilesView.vue')
        },
        {
          path: 'syslogs',
          name: 'table-syslogs',
          meta: {
            title: 'Аудит активності',
            description: 'Журнал аудиту активності'
          },
          component: () => import('@/views/table/SyslogsView.vue')
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
