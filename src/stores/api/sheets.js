import { inject } from 'vue';
import { defineStore } from 'pinia';

export const useSheet = defineStore('sheet', () => {
  const $axios = inject('axios');

  async function findOneForBranches(id, params) {
    try {
      return await $axios.get(`/sheets/branches/${id}`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function findOneForSubdivision(id, params) {
    try {
      return await $axios.get(`/sheets/subdivisions/${id}`, { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return { findOneForBranches, findOneForSubdivision };
});
