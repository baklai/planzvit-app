import { defineStore } from 'pinia';
import { inject } from 'vue';

export const useSheet = defineStore('sheet', () => {
  const $axios = inject('axios');

  async function findOneForBranches(id, params) {
    try {
      return await $axios.get(`/sheets/branches/${id}`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function findOneForSubdivision(params) {
    try {
      return await $axios.get(`/sheets/subdivisions`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return { findOneForBranches, findOneForSubdivision };
});
