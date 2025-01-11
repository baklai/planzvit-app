import { inject } from 'vue';
import { defineStore } from 'pinia';

export const useStatistic = defineStore('statistic', () => {
  const $axios = inject('axios');

  async function dashboard() {
    try {
      return await $axios.get('/statistics/dashboard');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function database() {
    try {
      return await $axios.get('/statistics/database');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function datacore() {
    try {
      return await $axios.get('/statistics/datacore');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return { dashboard, database, datacore };
});
