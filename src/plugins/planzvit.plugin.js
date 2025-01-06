import { useApp } from '@/stores/app';

export default {
  install: async (app, options) => {
    const { $toast } = app.config.globalProperties;

    const store = useApp();

    app.config.globalProperties.$planzvit = {
      ...options,

      get profile() {
        return store?.profile;
      },

      get loggedIn() {
        return store?.loggedIn;
      },

      get isAdmin() {
        return store?.isAdmin;
      },

      get isActivated() {
        return store?.isActivated;
      },

      hasScope(scope) {
        if (store?.isAdmin) return true;
        if (options?.unless?.includes(scope)) return true;
        return store?.profile?.scope?.includes(scope);
      },

      notImplemented() {
        $toast.add({
          severity: 'info',
          summary: 'Інформація',
          detail: 'Цей функціонал ще не реалізований',
          life: 5000
        });
      }
    };

    app.provide('planzvit', app.config.globalProperties.$planzvit);
  }
};
