<script setup>
import { ref } from 'vue';

const animation = ref([0.2, 0.3, 0.4, 0.1, 0.2, 0.3, 0, 0.1, 0.2]);
</script>

<template>
  <div class="spin-grid">
    <div
      class="spin-grid-cube"
      v-for="(item, index) in animation"
      :key="`cube-${index}`"
      :style="{ animationDelay: `${item}s` }"
    ></div>
  </div>
</template>

<style scoped>
.spin-grid {
  position: relative;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 80px;
  transform: translate(-50%, -50%);
}

.spin-grid-cube {
  float: left;
  width: 33.33%;
  height: 33.33%;
  background-color: var(--p-primary-500);
  animation: spin 1.3s infinite ease-in-out;
}

@keyframes spin {
  0%,
  70%,
  100% {
    transform: scale3D(1, 1, 1);
  }
  35% {
    transform: scale3D(0, 0, 1);
  }
}
</style>
