<script setup>
import AppLogoImg from '@/components/AppLogoImg.vue';
import BtnNotifications from '@/components/buttons/BtnNotifications.vue';
import BtnFullScreen from '@/components/buttons/BtnFullScreen.vue';
import BtnMainMenu from '@/components/buttons/BtnMainMenu.vue';
import BtnToggleTheme from '@/components/buttons/BtnToggleTheme.vue';
</script>

<template>
  <header class="flex h-[6rem] flex-wrap items-start justify-between gap-4 p-1">
    <div class="hidden md:flex md:flex-col">
      <div class="mb-2 text-sm font-light text-muted-color">
        Виробничий підрозділ "Східне відділення" філії "ГІОЦ"
      </div>
      <div class="flex items-center text-xl font-semibold leading-normal">
        <span class="text-center text-2xl font-bold tracking-wide text-primary">
          <sup>PLAN</sup>/<sub>ZVIT</sub>
        </span>
        <Divider layout="vertical" />
        <div>
          <p>{{ $route?.meta?.title }}</p>
          <p class="text-sm font-light text-muted-color">
            {{ $route?.meta?.description }}
          </p>
        </div>
      </div>
    </div>

    <AppLogoImg
      width="32"
      height="32"
      fill="currentColor"
      class="cursor-pointer text-primary md:hidden"
      @click="$router.push({ name: 'home' })"
    />

    <div class="flex flex-nowrap gap-x-4 whitespace-nowrap">
      <BtnToggleTheme />
      <BtnFullScreen />
      <BtnNotifications />
      <BtnMainMenu />
    </div>
  </header>
</template>
