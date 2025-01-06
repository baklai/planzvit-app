import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

import useLocalStorage from '@/service/LocalStorage';

export const useApp = defineStore('app', () => {
  const profile = ref(null);

  const accessToken = ref(null);
  const refreshToken = ref(null);
  const rememberToken = ref(useLocalStorage('app-auth-remember', false));

  const loggedIn = computed(() => {
    return (
      profile.value !== null &&
      profile.value?.isActivated &&
      accessToken.value !== null &&
      refreshToken.value !== null
    );
  });

  const isActivated = computed(() => {
    return profile.value?.isActivated;
  });

  const isAdmin = computed(() => {
    return profile.value?.isAdmin;
  });

  function setProfile(value) {
    profile.value = value;
  }

  function getAccessToken() {
    return accessToken.value;
  }

  function setAccessToken(value) {
    accessToken.value = value;
  }

  function getRefreshToken() {
    if (rememberToken.value) {
      refreshToken.value = localStorage.getItem('app-auth-token');
    }
    return refreshToken.value;
  }

  function setRefreshToken(value) {
    refreshToken.value = value;
    if (rememberToken.value) {
      localStorage.setItem('app-auth-token', value);
    }
  }

  function setRememberToken(value) {
    rememberToken.value = value;
  }

  function resetAccessRefreshToken() {
    profile.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem('app-auth-token');
  }

  return {
    profile,
    isAdmin,
    isActivated,
    loggedIn,
    setProfile,
    getAccessToken,
    setAccessToken,
    getRefreshToken,
    setRefreshToken,
    setRememberToken,
    resetAccessRefreshToken
  };
});
