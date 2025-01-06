<script setup>
import AppLogoImg from '@/components/AppLogoImg.vue';
</script>

<template>
  <Card class="flex flex-col items-center justify-center p-6">
    <template #title>
      <div class="mb-8 flex flex-col items-center justify-center gap-y-2">
        <AppLogoImg fill="currentColor" width="64" height="64" />

        <div class="text-4xl font-bold tracking-wide text-primary">
          <sup>PLAN</sup>/<sub>ZVIT</sub>
        </div>
        <span class="text-center text-base text-muted-color"> Забули пароль від додатку? </span>
      </div>
    </template>

    <template #content>
      <div class="flex max-w-[25rem] flex-col gap-4 text-center">
        <p class="text-xl font-semibold tracking-widest">
          Якщо ви забули пароль то з'вяжіться з адміністратором!
        </p>

        <RouterLink
          :to="{ name: 'signin' }"
          class="cursor-pointer text-center font-bold text-primary"
        >
          Увійти в додаток
        </RouterLink>
      </div>
    </template>
  </Card>
</template>
