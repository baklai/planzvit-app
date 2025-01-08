<script setup>
import { ref, onMounted } from 'vue';

import { useStatistic } from '@/stores/api/statistics';
import { dateToStr } from '@/service/DataFilters';

const Statistic = useStatistic();

const statistic = ref();

const departmentChart = ref();
const branchChart = ref();
const chartOptions = ref();

const setDepartmentChartData = data => {
  const documentStyle = getComputedStyle(document.documentElement);

  return {
    labels: data.map(({ name }) => name),
    datasets: [
      {
        type: 'bar',
        label: 'Кількість сервісів по відділах',
        backgroundColor: documentStyle.getPropertyValue('--p-green-500'),
        data: data.map(({ servicesCount }) => servicesCount)
      }
    ]
  };
};

const setBranchChartData = data => {
  const documentStyle = getComputedStyle(document.documentElement);

  return {
    labels: data.map(({ name }) => name),
    datasets: [
      {
        type: 'bar',
        label: 'Кількість підрозділів по службах (філіях)',
        backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
        data: data.map(({ subdivisionsCount }) => subdivisionsCount)
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

onMounted(async () => {
  statistic.value = await Statistic.database();
  departmentChart.value = setDepartmentChartData(statistic.value.departmentChart);
  branchChart.value = setBranchChartData(statistic.value.branchChart);
  chartOptions.value = setChartOptions();
});
</script>

<template>
  <div class="flex h-full w-full flex-wrap">
    <div class="flex h-full w-full gap-4">
      <div class="flex w-2/3 flex-col p-4">
        <div class="w-full p-4">
          <Chart type="bar" :data="departmentChart" :options="chartOptions" class="min-h-[30rem]" />
        </div>

        <div class="w-full p-4">
          <Chart type="bar" :data="branchChart" :options="chartOptions" class="min-h-[30rem]" />
        </div>
      </div>

      <div class="flex w-1/3 flex-col p-4">
        <div class="w-full p-4">
          <div class="mb-0 rounded-lg border p-6">
            <div class="mb-3 flex justify-between">
              <div>
                <span class="mb-3 block text-2xl font-bold">Кількість відділів</span>
              </div>
              <div
                class="flex h-12 min-w-10 items-center justify-center rounded bg-primary-500/50 p-2 text-2xl font-bold"
              >
                {{ statistic?.departmentsCount || '-' }}
              </div>
            </div>
            <span class="mr-2 font-medium text-green-500">Актуально на</span>
            <span class="">{{ dateToStr(Date.now()) }}</span>
          </div>
        </div>

        <div class="w-full p-4">
          <div class="mb-0 rounded-lg border p-6">
            <div class="mb-3 flex justify-between">
              <div>
                <span class="mb-3 block text-2xl font-bold">Кількість сервісів</span>
              </div>
              <div
                class="flex h-12 min-w-10 items-center justify-center rounded bg-primary-500/50 p-2 text-2xl font-bold"
              >
                {{ statistic?.servicesCount || '-' }}
              </div>
            </div>
            <span class="mr-2 font-medium text-green-500">Актуально на</span>
            <span class="">{{ dateToStr(Date.now()) }}</span>
          </div>
        </div>

        <div class="w-full p-4">
          <div class="mb-0 rounded-lg border p-6">
            <div class="mb-3 flex justify-between">
              <div>
                <span class="mb-3 block text-2xl font-bold">Кількість служб (філій)</span>
              </div>
              <div
                class="flex h-12 min-w-10 items-center justify-center rounded bg-primary-500/50 p-2 text-2xl font-bold"
              >
                {{ statistic?.branchesCount || '-' }}
              </div>
            </div>
            <span class="mr-2 font-medium text-green-500">Актуально на</span>
            <span class="">{{ dateToStr(Date.now()) }}</span>
          </div>
        </div>

        <div class="w-full p-4">
          <div class="mb-0 rounded-lg border p-6">
            <div class="mb-3 flex justify-between">
              <div>
                <span class="mb-3 block text-2xl font-bold">Кількість підрозділів</span>
              </div>
              <div
                class="flex h-12 min-w-10 items-center justify-center rounded bg-primary-500/50 p-2 text-2xl font-bold"
              >
                {{ statistic?.subdivisionsCount || '-' }}
              </div>
            </div>
            <span class="mr-2 font-medium text-green-500">Актуально на</span>
            <span class="">{{ dateToStr(Date.now()) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
