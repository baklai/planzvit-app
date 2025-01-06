import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { usePrimeVue } from 'primevue/config';

import useLocalStorage from '@/service/LocalStorage';

export const useConfig = defineStore('config', () => {
  const primevue = usePrimeVue();

  const appScale = ref(useLocalStorage('app-scale', 12));
  const appRipple = ref(useLocalStorage('app-ripple', false));
  const appSideBarMini = ref(useLocalStorage('app-sidebar-mini', false));
  const appSideBarMode = ref(useLocalStorage('app-sidebar-mode', 'static'));
  const appTheme = ref(useLocalStorage('app-theme', 'light'));

  const appSideBarVisible = ref(null);
  const activeMenuItem = ref(null);

  watch(appTheme, toggleAppTheme);
  watch(appScale, toggleAppScale);
  watch(appRipple, toggleAppRipple);
  watch(appSideBarMode, toggleAppSideBarMode);

  const isDarkAppTheme = computed(() => appTheme.value === 'dark');

  function setActiveMenuItem(item) {
    activeMenuItem.value = item.value || item;
  }

  function toggleAppScale() {
    document.documentElement.style.fontSize = `${appScale.value}px`;
  }

  function toggleAppTheme() {
    document.documentElement.className = appTheme.value;
  }

  function toggleAppRipple() {
    primevue.config.ripple = appRipple.value;
  }

  function toggleAppSideBarMode() {
    appSideBarVisible.value = true;
  }

  function toggleAppSideBar() {
    appSideBarVisible.value = !appSideBarVisible.value;
  }

  function initAppConfigs() {
    toggleAppScale();
    toggleAppTheme();
    toggleAppRipple();
    toggleAppSideBar();
  }

  function setDefaultConfigs() {
    appScale.value = 12;
    appRipple.value = false;
    appTheme.value = 'light';
    appSideBarMode.value = 'static';
    document.documentElement.style = '';
  }

  return {
    appTheme,
    appScale,
    appRipple,
    appSideBarMini,
    appSideBarMode,
    appSideBarVisible,
    activeMenuItem,
    isDarkAppTheme,
    toggleAppScale,
    toggleAppTheme,
    toggleAppRipple,
    toggleAppSideBar,
    setActiveMenuItem,
    initAppConfigs,
    setDefaultConfigs
  };
});
