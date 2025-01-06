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
      meta: { auth: true },
      redirect: { name: 'home' },
      children: [
        {
          path: 'network-info',
          name: 'network-info',
          meta: {
            title: 'Мережева інформація',
            description: 'Мережева інформація технічної підтримки'
          },
          component: () => import('@/views/auth/Signin.vue')
        }
      ]
    },

    {
      path: '/table',
      meta: { auth: true },
      redirect: { name: 'home' },
      children: [
        {
          path: 'network-info',
          name: 'network-info',
          meta: {
            title: 'Мережева інформація',
            description: 'Мережева інформація технічної підтримки'
          },
          component: () => import('@/views/auth/Signin.vue')
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
