import { capitalizeFirstLetter } from '@/service/DataFilters';

const DEFAULT_LIFE = 5000;

export default {
  install: async (app, { life }) => {
    const { $toast } = app.config.globalProperties;

    app.config.globalProperties.$error = error => {
      let message = 'Системна помилка';
      if (typeof error === 'string') {
        message = capitalizeFirstLetter(error);
      } else if (typeof error?.message === 'string') {
        message = capitalizeFirstLetter(error.message);
      } else if (Array.isArray(error?.message)) {
        message = error.message.map(msg => capitalizeFirstLetter(msg)).join('\n');
      }
      $toast.add({
        severity: 'error',
        summary: 'Помилка',
        detail: message,
        life: life || DEFAULT_LIFE
      });
    };

    app.provide('error', app.config.globalProperties.$error);
  }
};
