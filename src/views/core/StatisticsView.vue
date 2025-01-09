<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';

import { useStatistic } from '@/stores/api/statistics';
import { dateToStr } from '@/service/DataFilters';

const toast = useToast();
const Statistic = useStatistic();

const statistic = ref();

onMounted(async () => {
  try {
    statistic.value = await Statistic.datacore();
  } catch (err) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: err.message,
      life: 3000
    });
  }
});
</script>

<template>
  <div class="flex h-full w-full flex-wrap gap-4">
    <div class="flex w-full">
      <div class="w-full p-4 lg:w-1/4 xl:w-1/5">
        <div class="mb-0 rounded-lg border p-6">
          <div class="mb-3 flex justify-between">
            <div>
              <span class="mb-3 block text-2xl font-bold">Кількість профілів</span>
            </div>
            <div
              class="flex h-12 min-w-10 items-center justify-center rounded bg-primary-500/50 p-2 text-2xl font-bold"
            >
              {{ statistic?.profiles || '-' }}
            </div>
          </div>
          <span class="mr-2 font-medium text-green-500">Актуально на</span>
          <span class="">{{ dateToStr(Date.now()) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
