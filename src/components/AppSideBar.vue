<script setup>
import { ref } from 'vue';

import ReportModal from '@/components/modals/ReportModal.vue';
import BtnInfoProfile from '@/components/buttons/BtnInfoProfile.vue';

const refReportModal = ref();
</script>

<template>
  <Panel
    class="flex h-full flex-col justify-between"
    :pt="{
      header: {
        class: ['!bg-transparent', '!border-b-0']
      },
      contentContainer: {
        class: ['flex', 'flex-col', 'h-full', 'justify-between']
      }
    }"
  >
    <template #header>
      <div class="flex flex-col items-center">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl text-primary">
            <AppLogoImg
              fill="currentColor"
              width="42"
              height="42"
              class="cursor-pointer"
              @click="$router.push({ name: 'homr' })"
            />
          </div>
        </div>

        <Divider />
      </div>
    </template>

    <div class="flex flex-col items-center gap-2">
      <Button
        size="large"
        variant="text"
        icon="pi pi-home !text-2xl"
        severity="secondary"
        class="bg-transparent text-muted-color hover:bg-emphasis"
        v-tooltip="'Головна сторінка'"
        as="router-link"
        to="/"
      />

      <Button
        size="large"
        variant="text"
        icon="pi pi-file-excel !text-2xl"
        severity="secondary"
        class="bg-transparent text-muted-color hover:bg-emphasis"
        v-tooltip="'Звіти про надання послуг'"
        as="router-link"
        to="/report"
      />

      <Button
        size="large"
        variant="text"
        icon="pi pi-plus-circle text-primary font-bold !text-2xl"
        severity="secondary"
        class="bg-transparent text-muted-color hover:bg-emphasis"
        v-tooltip="'Щомісячний звіт'"
        @click="refReportModal.toggle()"
      />
    </div>

    <template #footer>
      <div class="flex flex-col items-center">
        <BtnInfoProfile />

        <Divider />

        <Button
          size="large"
          variant="text"
          icon="pi pi-database"
          severity="secondary"
          class="bg-transparent text-muted-color hover:bg-emphasis"
          v-tooltip="'База даних'"
          as="router-link"
          to="/table"
        />

        <Button
          size="large"
          variant="text"
          icon="pi pi-sliders-h"
          severity="secondary"
          class="bg-transparent text-muted-color hover:bg-emphasis"
          v-tooltip="'Налаштування'"
          as="router-link"
          to="/core"
        />

        <Divider />

        <div class="flex items-center justify-center">
          <BtnAuth />
        </div>
      </div>
    </template>
  </Panel>

  <ReportModal ref="refReportModal" />
</template>
