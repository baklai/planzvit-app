<script setup>
import AppTopBar from '@/components/AppTopBar.vue';
import AppSideBar from '@/components/AppSideBar.vue';
</script>

<template>
  <div class="flex h-screen min-h-screen w-full min-w-full items-start gap-6 overflow-hidden p-4">
    <AppSideBar />

    <div class="h-full flex-1">
      <AppTopBar class="mb-4" />

      <main class="h-full w-full">
        <RouterView />
      </main>
    </div>
  </div>

  <ConfirmDialog class="max-w-md">
    <template #container="{ message, acceptCallback, rejectCallback }">
      <div class="flex flex-col items-center rounded-md p-5">
        <div
          class="-mt-20 inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-contrast"
        >
          <i :class="[message?.icon || 'pi pi-question', '!text-4xl']"></i>
        </div>
        <span class="mb-2 mt-4 block text-center text-2xl font-bold">
          {{ message.message }}
        </span>
        <p>{{ message.header }}</p>
        <div class="mt-4 flex items-center gap-2">
          <Button
            label="Так"
            :icon="message.acceptIcon || ''"
            @click="acceptCallback"
            class="w-[8rem]"
          />

          <Button
            outlined
            label="Ні"
            :icon="message.rejectIcon || ''"
            @click="rejectCallback"
            class="w-[8rem]"
          />
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>
