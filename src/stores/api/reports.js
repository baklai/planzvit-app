import { defineStore } from 'pinia';
import { inject } from 'vue';

export const useReport = defineStore('report', () => {
  const $axios = inject('axios');

  async function updateReportByReportId(id, { ...payload }) {
    try {
      return await $axios.put(`/reports/${id}`, { ...payload });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function findFiltersByReport() {
    try {
      return await $axios.get('/reports/filters');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function createReportArchive({ ...payload }) {
    try {
      return await $axios.post('/reports/archive/', { ...payload });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function createReportByDepartmentId(department, { ...payload }) {
    try {
      return await $axios.post(`/reports/department/${department}`, { ...payload });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function findReportByDepartmentId(department, params) {
    try {
      return await $axios.get(`/reports/department/${department}`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function updateReportByDepartmentId(id, { ...payload }) {
    try {
      return await $axios.put(`/reports/department/${id}`, { ...payload });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function removeReportByDepartmentId(department, params) {
    try {
      return await $axios.delete(`/reports/department/${department}`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return {
    updateReportByReportId,
    findFiltersByReport,
    createReportArchive,
    createReportByDepartmentId,
    findReportByDepartmentId,
    updateReportByDepartmentId,
    removeReportByDepartmentId
  };
});
