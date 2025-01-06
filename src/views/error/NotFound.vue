<script setup>
import { useConfig } from '@/stores/config';

const $config = useConfig();
</script>

<template>
  <div class="flex h-full w-full flex-col place-content-center items-center">
    <h1 class="mb-2 text-6xl font-bold">Не знайдено</h1>
    <span class="mb-8 text-surface-500"> Запитаний ресурс недоступний </span>
    <img
      :src="$config?.appTheme === 'light' ? '/img/404-dark.webp' : '/img/404-light.webp'"
      alt="Не знайдено"
      width="300"
      class="mb-6"
    />
    <div class="font-semibold uppercase text-primary-600 hover:text-primary-500">
      <i class="pi pi-home mr-2"></i>
      <RouterLink :to="{ name: 'home' }"> Повернутися на головну сторінку </RouterLink>
    </div>
  </div>
</template>
