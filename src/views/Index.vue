<script setup>
import { ref, onMounted } from 'vue';

import { dateToStr } from '@/service/DataFilters';

const stats = ref();

onMounted(() => {
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});

const chartData = ref();
const chartOptions = ref();

const setChartData = () => {
  const documentStyle = getComputedStyle(document.documentElement);

  return {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        type: 'bar',
        label: 'Dataset 1',
        backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
        data: [50, 25, 12, 48, 90, 76, 42]
      },
      {
        type: 'bar',
        label: 'Dataset 2',
        backgroundColor: documentStyle.getPropertyValue('--p-gray-500'),
        data: [21, 84, 24, 75, 37, 65, 34]
      },
      {
        type: 'bar',
        label: 'Dataset 3',
        backgroundColor: documentStyle.getPropertyValue('--p-orange-500'),
        data: [41, 52, 24, 74, 23, 21, 32]
      }
    ]
  };
};

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--p-text-color');
  const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
  const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

  return {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: {
      tooltips: {
        mode: 'index',
        intersect: false
      },
      legend: {
        labels: {
          color: textColor
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder
        }
      },
      y: {
        stacked: true,
        ticks: {
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder
        }
      }
    }
  };
};
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <div class="flex w-full p-4">
      <div class="w-full p-4 lg:w-2/4 xl:w-1/4">
        <div class="panel-border mb-0 rounded-lg border p-6">
          <div class="mb-3 flex justify-between">
            <div>
              <span class="mb-3 block text-2xl font-bold">Загальна кількість профілів</span>
              <div class="text-3xl font-bold text-primary-500">
                {{ stats?.profiles || '-' }}
              </div>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded bg-green-100 p-2">
              <i class="pi pi-users text-black" style="font-size: 2rem" />
            </div>
          </div>
          <span class="mr-2 font-medium text-green-500">Актуально на</span>
          <span class="">{{ dateToStr(Date.now()) }}</span>
        </div>
      </div>

      <div class="w-full p-4 lg:w-2/4 xl:w-1/4">
        <div class="panel-border mb-0 rounded-lg border p-6">
          <div class="mb-3 flex justify-between">
            <div>
              <span class="mb-3 block text-2xl font-bold">Загальна кількість профілів</span>
              <div class="text-3xl font-bold text-primary-500">
                {{ stats?.profiles || '-' }}
              </div>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded bg-green-100 p-2">
              <i class="pi pi-users text-black" style="font-size: 2rem" />
            </div>
          </div>
          <span class="mr-2 font-medium text-green-500">Актуально на</span>
          <span class="">{{ dateToStr(Date.now()) }}</span>
        </div>
      </div>

      <div class="w-full p-4 lg:w-2/4 xl:w-1/4">
        <div class="panel-border mb-0 rounded-lg border p-6">
          <div class="mb-3 flex justify-between">
            <div>
              <span class="mb-3 block text-2xl font-bold">Загальна кількість профілів</span>
              <div class="text-3xl font-bold text-primary-500">
                {{ stats?.profiles || '-' }}
              </div>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded bg-green-100 p-2">
              <i class="pi pi-users text-black" style="font-size: 2rem" />
            </div>
          </div>
          <span class="mr-2 font-medium text-green-500">Актуально на</span>
          <span class="">{{ dateToStr(Date.now()) }}</span>
        </div>
      </div>

      <div class="w-full p-4 lg:w-2/4 xl:w-1/4">
        <div class="panel-border mb-0 rounded-lg border p-6">
          <div class="mb-3 flex justify-between">
            <div>
              <span class="mb-3 block text-2xl font-bold">Загальна кількість профілів</span>
              <div class="text-3xl font-bold text-primary-500">
                {{ stats?.profiles || '-' }}
              </div>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded bg-green-100 p-2">
              <i class="pi pi-users text-black" style="font-size: 2rem" />
            </div>
          </div>
          <span class="mr-2 font-medium text-green-500">Актуально на</span>
          <span class="">{{ dateToStr(Date.now()) }}</span>
        </div>
      </div>
    </div>

    <div class="flex-1 p-4">
      <div class="p-4">
        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-[30rem]" />
      </div>
      <div class="p-4">
        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-[30rem]" />
      </div>
    </div>

    <div class="flex-1 p-4">
      <div class="p-4">
        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-[30rem]" />
      </div>
      <div class="p-4">
        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-[30rem]" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-border {
  border: 1px solid var(--p-panel-border-color);
}
</style>
