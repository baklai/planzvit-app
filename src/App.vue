<script setup></script>

<template>
  <component :is="$route.meta.layout">
    <slot />
  </component>

  <Toast position="top-right" class="z-100" />
</template>
