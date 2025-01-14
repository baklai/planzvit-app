<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';

import { useStatistic } from '@/stores/api/statistics';
import { dateToStr } from '@/service/DataFilters';

const toast = useToast();
const Statistic = useStatistic();

const statistic = ref({});
const currentDate = ref();

const chartDataActivity = ref();
const chartDataActivityOptions = ref();

const chartDataActivityProfiles = ref();
const chartDataActivityProfilesOptions = ref();

const setChartDataActivity = () => {
  return {
    labels: statistic.value.activityAPIChrat.map(({ date }) => dateToStr(date)),
    datasets: [
      {
        label: 'API',
        fill: true,
        tension: 0.4,
        color: '#666',
        borderColor: 'rgb(34,197,94,0.5)',
        backgroundColor: 'rgba(34,197,94,0.2)',
        data: statistic.value.activityAPIChrat.map(({ count }) => count)
      }
    ]
  };
};

const setChartDataActivityProfiles = () => {
  return {
    labels: statistic.value.activityProfilesChart.map(({ profile }) => profile),
    datasets: [
      {
        type: 'bar',
        label: 'GET',
        fill: true,
        tension: 0.4,
        color: '#666',
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgb(59, 130, 246, 0.5)',
        data: statistic.value.activityProfilesChart.map(({ methods }) =>
          methods.filter(({ method }) => method === 'GET').map(({ count }) => count)
        )
      },
      {
        type: 'bar',
        label: 'POST',
        fill: true,
        tension: 0.4,
        color: '#666',
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgb(34, 197, 94, 0.5)',
        data: statistic.value.activityProfilesChart.map(({ methods }) =>
          methods.filter(({ method }) => method === 'POST').map(({ count }) => count)
        )
      },
      {
        type: 'bar',
        label: 'PUT',
        fill: true,
        tension: 0.4,
        color: '#666',
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgb(249, 115, 22, 0.5)',
        data: statistic.value.activityProfilesChart.map(({ methods }) =>
          methods.filter(({ method }) => method === 'PUT').map(({ count }) => count)
        )
      },
      {
        type: 'bar',
        label: 'DELETE',
        fill: true,
        tension: 0.4,
        color: '#666',
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgb(239, 68, 68, 0.5)',
        data: statistic.value.activityProfilesChart.map(({ methods }) =>
          methods.filter(({ method }) => method === 'DELETE').map(({ count }) => count)
        )
      }
    ]
  };
};

const setChartOptions = titleText => {
  const documentStyle = getComputedStyle(document.documentElement);
  const primaryColor = documentStyle.getPropertyValue('--p-primary-color');
  const textColor = documentStyle.getPropertyValue('--p-text-color');
  const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
  const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

  return {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: {
      title: {
        display: true,
        color: textColor,
        font: { weight: 'bold', size: 14 },
        text: titleText || ''
      },
      tooltips: {
        mode: 'index',
        intersect: false
      },
      legend: {
        display: false,

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
  try {
    statistic.value = await Statistic.datacore();

    currentDate.value = dateToStr(Date.now());

    chartDataActivity.value = setChartDataActivity();
    chartDataActivityOptions.value = setChartOptions('Активність API за поточний місяць');

    chartDataActivityProfiles.value = setChartDataActivityProfiles();
    chartDataActivityProfilesOptions.value = setChartOptions(
      'Активність профілю за поточний тиждень'
    );
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
    <div class="flex w-full flex-wrap content-start">
      <div class="w-full p-4 xl:w-2/4">
        <div class="p-6">
          <Chart
            type="line"
            :data="chartDataActivity"
            :options="chartDataActivityOptions"
            class="!h-[30rem]"
          />
        </div>
      </div>

      <div class="w-full p-4 xl:w-2/4">
        <div class="p-6">
          <Chart
            type="bar"
            :data="chartDataActivityProfiles"
            :options="chartDataActivityProfilesOptions"
            class="!h-[30rem]"
          />
        </div>
      </div>
    </div>

    <div class="flex w-full flex-wrap">
      <div class="w-full p-4 lg:w-1/4 xl:w-1/5">
        <div class="rounded-lg border p-6">
          <div class="mb-3 flex justify-between">
            <div>
              <span class="mb-3 block text-lg font-bold">Кількість профілів</span>
            </div>
            <div
              class="flex h-12 min-w-[4rem] items-center justify-center rounded bg-primary/20 p-2 text-2xl font-bold"
            >
              {{ statistic?.profilesCount || '-' }}
            </div>
          </div>
          <span class="mr-2 font-medium text-primary">Актуально на</span>
          <span>{{ dateToStr(Date.now()) }}</span>
        </div>
      </div>

      <div class="w-full p-4 lg:w-1/4 xl:w-1/5">
        <div class="rounded-lg border p-6">
          <div class="mb-3 flex justify-between">
            <div>
              <span class="mb-3 block text-lg font-bold">Кількість відділів</span>
            </div>
            <div
              class="flex h-12 min-w-[4rem] items-center justify-center rounded bg-primary/20 p-2 text-2xl font-bold"
            >
              {{ statistic?.departmentsCount || '-' }}
            </div>
          </div>
          <span class="mr-2 font-medium text-primary">Актуально на</span>
          <span>{{ dateToStr(Date.now()) }}</span>
        </div>
      </div>

      <div class="w-full p-4 lg:w-1/4 xl:w-1/5">
        <div class="rounded-lg border p-6">
          <div class="mb-3 flex justify-between">
            <div>
              <span class="mb-3 block text-lg font-bold">Кількість сервісів</span>
            </div>
            <div
              class="flex h-12 min-w-[4rem] items-center justify-center rounded bg-primary/20 p-2 text-2xl font-bold"
            >
              {{ statistic?.servicesCount || '-' }}
            </div>
          </div>
          <span class="mr-2 font-medium text-primary">Актуально на</span>
          <span>{{ dateToStr(Date.now()) }}</span>
        </div>
      </div>

      <div class="w-full p-4 lg:w-1/4 xl:w-1/5">
        <div class="rounded-lg border p-6">
          <div class="mb-3 flex justify-between">
            <div>
              <span class="mb-3 block text-lg font-bold">Кількість служб (філій)</span>
            </div>
            <div
              class="flex h-12 min-w-[4rem] items-center justify-center rounded bg-primary/20 p-2 text-2xl font-bold"
            >
              {{ statistic?.branchesCount || '-' }}
            </div>
          </div>
          <span class="mr-2 font-medium text-primary">Актуально на</span>
          <span>{{ dateToStr(Date.now()) }}</span>
        </div>
      </div>

      <div class="w-full p-4 lg:w-1/4 xl:w-1/5">
        <div class="rounded-lg border p-6">
          <div class="mb-3 flex justify-between">
            <div>
              <span class="mb-3 block text-lg font-bold">Кількість підрозділів</span>
            </div>
            <div
              class="flex h-12 min-w-[4rem] items-center justify-center rounded bg-primary/20 p-2 text-2xl font-bold"
            >
              {{ statistic?.subdivisionsCount || '-' }}
            </div>
          </div>
          <span class="mr-2 font-medium text-primary">Актуально на</span>
          <span>{{ dateToStr(Date.now()) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
