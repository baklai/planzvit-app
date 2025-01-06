<script setup>
const props = defineProps({
  fill: {
    type: String,
    default: 'currentColor'
  },
  width: {
    type: String,
    default: '14'
  },
  height: {
    type: String,
    default: '14'
  }
});
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :width="width"
    :height="height"
    :fill="fill"
  >
    <path
      d="M14,6H22V22H14V6M2,4H22V2H2V4M2,8H12V6H2V8M9,22H12V10H9V22M2,22H7V10H2V22Z"
    />
  </svg>
</template>
