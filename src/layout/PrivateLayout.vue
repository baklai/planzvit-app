<script setup>
import AppSideBar from '@/components/AppSideBar.vue';
import AppTopBar from '@/components/AppTopBar.vue';
</script>

<template>
  <div class="flex h-screen p-4">
    <AppSideBar class="hidden md:flex" />

    <div class="flex flex-1 flex-col overflow-hidden pl-4">
      <AppTopBar />

      <main class="flex-1 overflow-hidden">
        <RouterView />
      </main>
    </div>
  </div>

  <ConfirmDialog>
    <template #container="{ message, acceptCallback, rejectCallback }">
      <div class="flex flex-col items-center rounded bg-surface-0 p-8 dark:bg-surface-900">
        <div
          class="-mt-20 inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-contrast"
        >
          <i :class="[message?.icon || 'pi pi-question', '!text-5xl']"></i>
        </div>
        <span class="mb-2 mt-6 block text-2xl font-bold">{{ message.header }}</span>
        <p class="mb-0">{{ message.message }}</p>
        <div class="mt-6 flex items-center gap-2">
          <Button
            label="Так"
            :icon="message.acceptIcon || ''"
            @click="acceptCallback"
            class="w-32"
          ></Button>
          <Button
            label="Ні"
            outlined
            :icon="message.rejectIcon || ''"
            @click="rejectCallback"
            class="w-32"
          ></Button>
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>
