import { inject } from 'vue';
import { defineStore } from 'pinia';

export const useDepartment = defineStore('department', () => {
  const $axios = inject('axios');

  async function findAll(params) {
    try {
      return await $axios.get('/departments', { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function findOne({ id }) {
    try {
      return await $axios.get(`/departments/${id}`);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function createOne({ ...payload }) {
    try {
      return await $axios.post('/departments', { ...payload });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function updateOne(id, { ...payload }) {
    try {
      return await $axios.put(`/departments/${id}`, { ...payload });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function removeOne({ id }) {
    try {
      return await $axios.delete(`/departments/${id}`);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return { findAll, findOne, createOne, updateOne, removeOne };
});
