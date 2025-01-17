import { useApp } from '@/stores/app';

export default {
  install: async (app, options) => {
    const { $toast, $axios } = app.config.globalProperties;

    const store = useApp();

    app.config.globalProperties.$planzvit = {
      ...options,

      get profile() {
        return store?.profile;
      },

      get loggedIn() {
        return store?.loggedIn;
      },

      get isModerator() {
        return store?.isModerator;
      },

      get isAdministrator() {
        return store?.isAdministrator;
      },

      get isActivated() {
        return store?.isActivated;
      },

      async updateNotices() {
        store.notices = await $axios.get('/notices', {});
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
