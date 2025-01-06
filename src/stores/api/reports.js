import { inject } from 'vue';
import { defineStore } from 'pinia';

export const useReport = defineStore('report', () => {
  const $axios = inject('axios');

  async function findAll(params) {
    try {
      return await $axios.get('/reports', { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function findOne({ id }) {
    try {
      return await $axios.get(`/reports/${id}`);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function createOne({ ...payload }) {
    try {
      return await $axios.post('/reports', { ...payload });
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

  async function removeOne({ id }) {
    try {
      return await $axios.delete(`/reports/${id}`);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function generateReport({ id }) {
    try {
      return await $axios.get(`/reports/${id}/report`, {
        timeout: 60000
      });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return { findAll, findOne, createOne, updateOne, removeOne, generateReport };
});
