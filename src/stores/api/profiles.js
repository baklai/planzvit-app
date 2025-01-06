import { inject } from 'vue';
import { defineStore } from 'pinia';

import { useScope } from '@/stores/scopes';

export const useProfile = defineStore('profile', () => {
  const $axios = inject('axios');
  const $scope = useScope();

  async function findAll(params) {
    try {
      return await $axios.get('/profiles', { params });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function findOne({ id }) {
    try {
      const profile = await $axios.get(`/profiles/${id}`);
      return {
        ...profile,
        scope: $scope.getCustomScope(profile.scope)
      };
    } catch (err) {
      throw new Error(err);
    }
  }

  async function createOne({ scope, ...payload }) {
    try {
      return await $axios.post('/profiles', {
        ...payload,
        scope: $scope.getScopeKeyList(scope)
      });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function updateOne(id, { scope, ...payload }) {
    try {
      return await $axios.put(`/profiles/${id}`, {
        ...payload,
        scope: $scope.getScopeKeyList(scope)
      });
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
