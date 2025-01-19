import { defineStore } from 'pinia';
import { inject } from 'vue';

export const useArchive = defineStore('archive', () => {
  const $axios = inject('axios');

  async function getReportsById(id, params) {
    try {
      return await $axios.get(`/archives/reports/${id}`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function getReportsByIds(params) {
    try {
      return await $axios.get(`/archives/reports`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function getBranchesById(id, params) {
    try {
      return await $axios.get(`/archives/branches/${id}`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function getBranchesByIds(params) {
    try {
      return await $axios.get(`/archives/branches`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function getSubdivisionsById(id, params) {
    try {
      return await $axios.get(`/archives/subdivisions/${id}`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function getSubdivisionsByIds(params) {
    try {
      return await $axios.get(`/archives/subdivisions`, { params });
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
