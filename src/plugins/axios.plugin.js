import axios from 'axios';

import { useApp } from '@/stores/app';

export default {
  install: (app, { baseURL, prefixAPI = '/', options, refresh }) => {
    const { $router } = app.config.globalProperties;
    const store = useApp();

    const axiosInstance = axios.create({
      baseURL: baseURL + prefixAPI,
      timeout: options.timeout,
      headers: options.headers
    });

    axiosInstance.interceptors.request.use(config => {
      if (config?.params?.filters) {
        config.params.filters =
          config?.params?.filters && Object.keys(config.params.filters).length
            ? JSON.stringify(config.params.filters)
            : null;
      }

      if (config?.params?.sort) {
        config.params.sort =
          config?.params?.sort && Object.keys(config.params.sort).length
            ? JSON.stringify(config.params.sort)
            : null;
      }

      return config;
    });

    axiosInstance.interceptors.request.use(
      async config => {
        const token = store.getAccessToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    axiosInstance.interceptors.response.use(
      response => {
        return response.data;
      },
      async error => {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Час очікування запиту минув. Спробуйте пізніше.');
        }
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !axiosInstance?.defaults?._retry) {
          axiosInstance.defaults._retry = true;
          try {
            const token = store.getRefreshToken();
            if (!token) {
              throw new Error('Неавторизований');
            }
            store.setAccessToken(token);
            const { accessToken, refreshToken } = await axiosInstance({
              method: refresh.method,
              url: refresh.url
            });
            store.setAccessToken(accessToken);
            store.setRefreshToken(refreshToken);
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            return axiosInstance(originalRequest);
          } catch (error) {
            store.resetAccessRefreshToken();
            $router.push({ name: 'signin' });
            if (error.response && error.response.data) {
              return Promise.reject(error.response.data);
            }
            return Promise.reject(error);
          } finally {
            axiosInstance.defaults._retry = false;
          }
        }
        return Promise.reject(error);
      }
    );

    app.config.globalProperties.$axios = axiosInstance;

    app.provide('axios', app.config.globalProperties.$axios);
  }
};
