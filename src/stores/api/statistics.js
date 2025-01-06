import { inject } from 'vue';
import { defineStore } from 'pinia';

export const useStatistic = defineStore('statistic', () => {
  const $axios = inject('axios');

  async function database() {
    try {
      return await $axios.get('/statistics/database');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return { database };
});
