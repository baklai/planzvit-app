import { defineStore } from 'pinia';
import { inject } from 'vue';

export const useNotice = defineStore('notice', () => {
  const $axios = inject('axios');

  async function findAll(params) {
    try {
      return await $axios.get('/notices', { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function createOne({ title, text, profiles }) {
    try {
      return await $axios.post('/notices', { title, text, profiles });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function removeOne({ id }) {
    try {
      return await $axios.delete(`/notices/${id}`);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function findAllProfiles() {
    try {
      return await $axios.get('/notices/profiles');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return { findAll, createOne, removeOne, findAllProfiles };
});
