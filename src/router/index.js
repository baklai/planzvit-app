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
      component: () => import('@/views/table/Index.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'table-dashboard',
          meta: {
            title: 'Статистика по базі',
            description: 'Статистика по базі даних системи'
          },
          component: () => import('@/views/table/dashboard.vue')
        },
        {
          path: 'departments',
          name: 'table-departments',
          meta: {
            title: 'Відділи підрозділу',
            description: 'Перелік відділів підрозділу'
          },
          component: () => import('@/views/table/Departments.vue')
        },
        {
          path: 'services',
          name: 'table-services',
          meta: {
            title: 'Системи підтримки',
            description: 'Список систем підтримки'
          },
          component: () => import('@/views/table/Services.vue')
        },
        {
          path: 'profiles',
          name: 'table-profiles',
          meta: {
            title: 'Профілі користувачів',
            description: 'Список профілів користувачів'
          },
          component: () => import('@/views/table/Profiles.vue')
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
          component: () => import('@/views/auth/Signin.vue')
        },
        {
          path: 'signup',
          name: 'signup',
          component: () => import('@/views/auth/Signup.vue')
        },
        {
          path: 'reset',
          name: 'reset',
          component: () => import('@/views/auth/Reset.vue')
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
