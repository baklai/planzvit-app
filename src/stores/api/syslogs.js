import { inject } from 'vue';
import { defineStore } from 'pinia';

export const useSyslog = defineStore('syslog', () => {
  const $axios = inject('axios');

  async function findAll(params) {
    try {
      return await $axios.get('/syslogs', { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function findOne({ id }) {
    try {
      return await $axios.get(`/syslogs/${id}`);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function removeOne({ id }) {
    try {
      return await $axios.delete(`/syslogs/${id}`);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function removeAll() {
    try {
      return await $axios.delete('/syslogs');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return { findAll, findOne, removeOne, removeAll };
});
