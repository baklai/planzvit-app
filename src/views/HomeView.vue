<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';

import { useStatistic } from '@/stores/api/statistics';
import { GenerateColors } from '@/service/GenerateColors';
import { dateToStr } from '@/service/DataFilters';

const toast = useToast();
const Statistic = useStatistic();

const statistic = ref();

const departmentChart = ref();
const departmentChartOptions = ref();

const branchChart = ref();
const branchChartOptions = ref();

const departmentReportChart = ref();
const departmentReportOptions = ref();

const branchReportChart = ref();
const branchReportChartOptions = ref();

const setDepartmentChartData = data => {
  const documentStyle = getComputedStyle(document.documentElement);
  const colors = GenerateColors(data.length);

  return {
    labels: data.map(({ name }) => name),
    datasets: [
      {
        type: 'bar',
        label: 'Кількість сервісів',
        backgroundColor: colors.map(color => color.backgroundColor),
        borderColor: colors.map(color => color.borderColor),
        borderWidth: 1,
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
        label: 'Кількість підрозділів',
        backgroundColor: data.map(item => 'rgba(6, 182, 212, 0.2)'),
        borderColor: data.map(item => 'rgb(6, 182, 212)'),
        borderWidth: 1,
        data: data.map(({ subdivisionsCount }) => subdivisionsCount)
      }
    ]
  };
};

const setDepartmentReportChartData = data => {
  const documentStyle = getComputedStyle(document.documentElement);
  const colors = GenerateColors(data.length);

  return {
    labels: data.map(({ department }) => department),
    datasets: [
      {
        type: 'bar',
        label: 'Кількість виконаних робіт',
        backgroundColor: colors.map(color => color.backgroundColor),
        borderColor: colors.map(color => color.borderColor),
        borderWidth: 1,
        data: data.map(({ currentJobCount }) => currentJobCount)
      }
    ]
  };
};

const setBranchReportChartData = data => {
  const documentStyle = getComputedStyle(document.documentElement);

  return {
    labels: data.map(({ branch }) => branch),
    datasets: [
      {
        type: 'bar',
        label: 'Кількість виконаних робіт',
        backgroundColor: data.map(item => 'rgba(6, 182, 212, 0.2)'),
        borderColor: data.map(item => 'rgb(6, 182, 212)'),
        borderWidth: 1,
        data: data.map(({ currentJobCount }) => currentJobCount)
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
        color: primaryColor,
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
    statistic.value = await Statistic.dashboard();

    departmentChart.value = setDepartmentChartData(statistic.value.departmentChart);
    departmentChartOptions.value = setChartOptions('Кількість сервісів по відділах');

    branchChart.value = setBranchChartData(statistic.value.branchChart);
    branchChartOptions.value = setChartOptions('Кількість підрозділів по службах (філіях)');

    departmentReportChart.value = setDepartmentReportChartData(
      statistic.value.departmentReportChart
    );
    departmentReportOptions.value = setChartOptions(
      'Кількість виконаних робіт по відділах за поточний місяць'
    );

    branchReportChart.value = setBranchReportChartData(statistic.value.branchReportChart);
    branchReportChartOptions.value = setChartOptions(
      'Кількість виконаних робіт по службам (філіям) за поточний місяць'
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
  <div class="flex h-full w-full flex-wrap overflow-auto">
    <div class="flex w-full flex-wrap">
      <div class="w-full p-4 lg:w-1/4 xl:w-1/4">
        <div class="rounded-lg border p-6">
          <div class="mb-3 flex justify-between">
            <div>
              <span class="mb-3 block text-lg font-bold">Підтримка відділів</span>
            </div>
            <div
              class="flex h-12 min-w-[4rem] items-center justify-center rounded bg-primary/20 p-2 text-xl font-bold"
            >
              {{ statistic?.departmentsServicesCount || '-' }}
            </div>
          </div>
          <span class="mr-2 font-medium text-primary">Актуально на</span>
          <span>{{ dateToStr(Date.now()) }}</span>
        </div>
      </div>

      <div class="w-full p-4 lg:w-1/4 xl:w-1/4">
        <div class="rounded-lg border p-6">
          <div class="mb-3 flex justify-between">
            <div>
              <span class="mb-3 block text-lg font-bold">Кількість сервісів</span>
            </div>
            <div
              class="flex h-12 min-w-[4rem] items-center justify-center rounded bg-primary/20 p-2 text-xl font-bold"
            >
              {{ statistic?.servicesCount || '-' }}
            </div>
          </div>
          <span class="mr-2 font-medium text-primary">Актуально на</span>
          <span>{{ dateToStr(Date.now()) }}</span>
        </div>
      </div>

      <div class="w-full p-4 lg:w-1/4 xl:w-1/4">
        <div class="rounded-lg border p-6">
          <div class="mb-3 flex justify-between">
            <div>
              <span class="mb-3 block text-lg font-bold">Кількість служб (філій)</span>
            </div>
            <div
              class="flex h-12 min-w-[4rem] items-center justify-center rounded bg-primary/20 p-2 text-xl font-bold"
            >
              {{ statistic?.branchesCount || '-' }}
            </div>
          </div>
          <span class="mr-2 font-medium text-primary">Актуально на</span>
          <span>{{ dateToStr(Date.now()) }}</span>
        </div>
      </div>

      <div class="w-full p-4 lg:w-1/4 xl:w-1/4">
        <div class="rounded-lg border p-6">
          <div class="mb-3 flex justify-between">
            <div>
              <span class="mb-3 block text-lg font-bold">Кількість підрозділів</span>
            </div>
            <div
              class="flex h-12 min-w-[4rem] items-center justify-center rounded bg-primary/20 p-2 text-xl font-bold"
            >
              {{ statistic?.subdivisionsCount || '-' }}
            </div>
          </div>
          <span class="mr-2 font-medium text-primary">Актуально на</span>
          <span>{{ dateToStr(Date.now()) }}</span>
        </div>
      </div>
    </div>

    <div class="flex w-full flex-row gap-4">
      <div class="w-full p-4">
        <Chart
          type="bar"
          :data="departmentChart"
          :options="departmentChartOptions"
          class="min-h-[30rem]"
        />
      </div>

      <div class="w-full p-4">
        <Chart type="bar" :data="branchChart" :options="branchChartOptions" class="min-h-[30rem]" />
      </div>
    </div>

    <div class="flex w-full flex-row gap-4">
      <div class="w-full p-4">
        <Chart
          type="bar"
          :data="departmentReportChart"
          :options="departmentReportOptions"
          class="min-h-[30rem]"
        />
      </div>

      <div class="w-full p-4">
        <Chart
          type="bar"
          :data="branchReportChart"
          :options="branchReportChartOptions"
          class="min-h-[30rem]"
        />
      </div>
    </div>
  </div>
</template>
