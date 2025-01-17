import { defineStore } from 'pinia';
import { inject } from 'vue';

export const useReport = defineStore('report', () => {
  const $axios = inject('axios');

  async function findAll(department, params) {
    try {
      return await $axios.get(`/reports/${department}`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function createOne(department, { ...payload }) {
    try {
      return await $axios.post(`/reports/${department}`, { ...payload });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function updateOne(id, { ...payload }) {
    try {
      return await $axios.put(`/reports/${id}`, { ...payload });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function updateStatusOne(id, { ...payload }) {
    try {
      return await $axios.put(`/reports/${id}/status`, { ...payload });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function removeOne(department, params) {
    try {
      return await $axios.delete(`/reports/${department}`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function findCollecrions() {
    try {
      return await $axios.get('/reports/collections/data');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return { findAll, createOne, updateOne, updateStatusOne, removeOne, findCollecrions };
});
