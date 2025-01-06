import { inject } from 'vue';
import { defineStore } from 'pinia';

export const useStatistic = defineStore('statistic', () => {
  const $axios = inject('axios');

  async function network() {
    try {
      return await $axios.get('/statistics/network');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function request() {
    try {
      return await $axios.get('/statistics/request');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function inspector() {
    try {
      return await $axios.get('/statistics/inspector');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function dashboard() {
    try {
      return await $axios.get('/statistics/dashboard');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return { network, request, inspector, dashboard };
});
