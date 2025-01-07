<script setup>
import { ref, onMounted, watchEffect } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const isFullScreen = ref(false);

const toggleFullScreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else if (document.documentElement.mozRequestFullScreen) {
    // Firefox
    document.documentElement.mozRequestFullScreen();
  } else if (document.documentElement.webkitRequestFullscreen) {
    // Chrome, Safari and Opera
    document.documentElement.webkitRequestFullscreen();
  } else if (document.documentElement.msRequestFullscreen) {
    // IE/Edge
    document.documentElement.msRequestFullscreen();
  }
};

onMounted(() => {
  window.addEventListener('fullscreenchange', event => {
    isFullScreen.value = document.fullscreenElement !== null && !!event;
  });
});

watchEffect(() => {
  if (isFullScreen.value) {
    toast.add({
      severity: 'info',
      summary: 'Інформація',
      detail: 'Додаток тепер у повноекранному режимі (вийти з повноекранного режиму: Esc)',
      life: 3000
    });
  }
});
</script>

<template>
  <Button
    variant="text"
    severity="secondary"
    v-tooltip.bottom="isFullScreen ? 'Зменшити' : 'Збільшити'"
    @click="toggleFullScreen"
  >
    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="20"
        height="20"
      >
        <path
          d="M18 18V20H4A2 2 0 0 1 2 18V8H4V18M22 6V14A2 2 0 0 1 20 16H8A2 2 0 0 1 6 14V6A2 2 0 0 1 8 4H20A2 2 0 0 1 22 6M20 6H8V14H20Z"
        />
      </svg>
    </template>
  </Button>
</template>
