<script setup>
import BtnToggleTheme from '@/components/buttons/BtnToggleTheme.vue';
import BtnMainMenu from '@/components/buttons/BtnMainMenu.vue';
</script>

<template>
  <header class="flex flex-wrap items-start justify-between gap-4 p-1">
    <div class="flex-1">
      <div class="mb-2 font-medium leading-normal text-muted-color">
        Виробничий підрозділ "Східне відділення" філії "ГІОЦ"
      </div>
      <div class="flex items-center text-xl font-semibold leading-normal">
        <span class="text-center text-2xl font-bold tracking-wide text-primary">
          <sup>PLAN</sup>/<sub>ZVIT</sub>
        </span>
        <Divider layout="vertical" />
        <div>
          <p>{{ $route?.meta?.title }}</p>
          <p class="font-medium text-muted-color">
            {{ $route?.meta?.description }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex flex-nowrap gap-x-4 whitespace-nowrap">
      <BtnToggleTheme />
      <BtnMainMenu />
    </div>
  </header>
</template>
