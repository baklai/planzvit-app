import { inject } from 'vue';
import { defineStore } from 'pinia';

export const useReport = defineStore('report', () => {
  const $axios = inject('axios');

  async function getDepartment({ id }) {
    try {
      return await $axios.get(`/reports/departments/${id}`);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function getDepartments() {
    try {
      return await $axios.get('/reports/departments');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function getBranches() {
    try {
      return await $axios.get('/reports/branches');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return { getDepartment, getDepartments, getBranches };
});
