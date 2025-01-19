import { useApp } from '@/stores/app';

export default {
  install: async (app, { endpoints }) => {
    const { $error, $axios, $router, $toast } = app.config.globalProperties;

    const store = useApp();

    app.config.globalProperties.$auth = {
      async me() {
        try {
          const profile = await $axios({
            method: endpoints.profile.method,
            url: endpoints.profile.url
          });
          store.setProfile(profile);
        } catch (err) {
          if (err && err?.statusCode === 401) {
            $error(new Error('Несанкціонований доступ'));
          } else {
            $error(err);
          }
        }
      },

      async signin({ email, password, remember = false }) {
        try {
          const { accessToken, refreshToken } = await $axios({
            method: endpoints.signin.method,
            url: endpoints.signin.url,
            data: { email, password }
          });

          store.setAccessToken(accessToken);
          store.setRefreshToken(refreshToken);
          store.setRememberToken(remember);

          await this.me();
          $router.push({ name: 'home' });
        } catch (err) {
          $error(err);
          throw err;
        }
      },

      async signup({ email, fullname, phone, password }) {
        try {
          await $axios({
            method: endpoints.signup.method,
            url: endpoints.signup.url,
            data: { email, fullname, phone, password }
          });
          $router.push({ name: 'home' });
        } catch (err) {
          $error(err);
          throw err;
        }
      },

      async signout() {
        await $axios({ method: endpoints.signout.method, url: endpoints.signout.url });
        store.resetAccessRefreshToken();
        $router.push({ name: 'signin' });
        $toast.add({
          severity: 'info',
          summary: 'Інформація',
          detail: 'Вихід успішно виконано',
          life: 3000
        });
      },

      async refresh() {
        try {
          const token = store.getRefreshToken();
          if (!token) {
            throw new Error('Неавторизований');
          }
          store.setAccessToken(token);
          const { accessToken, refreshToken } = await $axios({
            method: endpoints.refresh.method,
            url: endpoints.refresh.url
          });
          store.setAccessToken(accessToken);
          store.setRefreshToken(refreshToken);
          return accessToken;
        } catch (error) {
          store.resetAccessRefreshToken();
          $router.push({ name: 'signin' });
          throw error;
        }
      }
    };

    app.provide('auth', app.config.globalProperties.$auth);
  }
};
