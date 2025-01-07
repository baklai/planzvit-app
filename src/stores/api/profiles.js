import { inject } from 'vue';
import { defineStore } from 'pinia';

export const useProfile = defineStore('profile', () => {
  const $axios = inject('axios');

  async function findAll(params) {
    try {
      return await $axios.get('/profiles', { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function findOne({ id }) {
    try {
      return await $axios.get(`/profiles/${id}`);
    } catch (err) {
      throw new Error(err);
    }
  }

  async function createOne({ ...payload }) {
    try {
      return await $axios.post('/profiles', { ...payload });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function updateOne(id, { ...payload }) {
    try {
      return await $axios.put(`/profiles/${id}`, { ...payload });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function removeOne({ id }) {
    try {
      return await $axios.delete(`/profiles/${id}`);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return { findAll, findOne, createOne, updateOne, removeOne };
});
