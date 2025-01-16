import { defineStore } from 'pinia';
import { inject } from 'vue';

export const useSheet = defineStore('sheet', () => {
  const $axios = inject('axios');

  async function getReportsById(id, params) {
    try {
      return await $axios.get(`/sheets/reports/${id}`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function getReportsByIds(params) {
    try {
      return await $axios.get(`/sheets/reports`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function getBranchesById(id, params) {
    try {
      return await $axios.get(`/sheets/branches/${id}`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function getBranchesByIds(params) {
    try {
      return await $axios.get(`/sheets/branches`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function getSubdivisionsById(id, params) {
    try {
      return await $axios.get(`/sheets/subdivisions/${id}`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function getSubdivisionsByIds(params) {
    try {
      return await $axios.get(`/sheets/subdivisions`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return {
    getReportsById,
    getReportsByIds,
    getBranchesById,
    getBranchesByIds,
    getSubdivisionsById,
    getSubdivisionsByIds
  };
});
