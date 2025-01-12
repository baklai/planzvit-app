<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';

import AppLoading from '@/components/AppLoading.vue';
import { useSheet } from '@/stores/api/sheets';
import { useBranch } from '@/stores/api/branches';
import { dateToMonthStr } from '@/service/DataFilters.js';

const toast = useToast();
const Branch = useBranch();
const Sheet = useSheet();

const loading = ref(false);

const records = ref([]);
const datepiker = ref();
const subdivision = ref();
const subdivisions = ref([]);

const totalPriceAll = ref();
const totalJobCountAll = ref();

const selectSubdivision = computed(() => {
  return subdivisions.value.find(({ id }) => id === subdivision.value) || null;
});

const onUpdateRecords = async () => {
  if (!subdivision.value || !datepiker.value) return;

  try {
    loading.value = true;

    const [response] = await Sheet.findOneForSubdivision(subdivision.value, {
      monthOfReport: datepiker.value.getMonth() + 1,
      yearOfReport: datepiker.value.getFullYear()
    });

    records.value = response?.services || [];
    totalPriceAll.value = response?.totalPrice || 0;
    totalJobCountAll.value = response?.totalJobCount || 0;
  } catch (err) {
    records.value = [];
    totalPriceAll.value = 0;
    totalJobCountAll.value = 0;
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: err.message,
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

watchEffect(async () => {
  if (subdivision.value && datepiker.value) {
    await onUpdateRecords();
  }
});

onMounted(async () => {
  try {
    const { docs } = await Branch.findAll({ offset: 0, limit: 1000 });

    subdivisions.value = docs.flatMap(obj => obj.subdivisions);
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
  <div class="flex flex-col">
    <div class="flex w-full overflow-x-auto">
      <DataTable
        lazy
        rowHover
        scrollable
        dataKey="id"
        size="small"
        showGridlines
        resizableColumns
        columnResizeMode="expand"
        scrollHeight="flex"
        sortMode="multiple"
        responsiveLayout="scroll"
        :loading="loading"
        style="height: calc(100vh - 15.5rem)"
        v-model:value="records"
        class="min-w-full overflow-x-auto text-base"
        :pt="{
          mask: {
            class: ['!bg-transparent', 'dark:!bg-transparent']
          }
        }"
      >
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-1">
              <i class="pi pi-file-excel mr-2 hidden sm:block" style="font-size: 2.5rem" />
              <div class="flex flex-col">
                <h3 class="text-xl font-normal">
                  {{ selectSubdivision?.name ? `${selectSubdivision.name} | ` : '' }}
                  <span>{{ $route?.meta?.title }}</span>
                  {{ datepiker ? `за ${dateToMonthStr(datepiker)}` : '' }}
                </h3>
                <p class="text-base font-normal text-surface-500">
                  {{ $route?.meta?.description }}
                </p>
              </div>
            </div>

            <div class="flex w-full flex-wrap items-center justify-between sm:w-max">
              <FloatLabel class="w-[20rem]" variant="in">
                <DatePicker
                  inputId="datepiker"
                  v-model="datepiker"
                  view="month"
                  showIcon
                  iconDisplay="input"
                  dateFormat="mm/yy"
                  variant="filled"
                />
                <label for="datepiker">Оберіть рік та місяць</label>
              </FloatLabel>
            </div>
          </div>
        </template>

        <template #loading>
          <div class="flex items-center justify-center">
            <AppLoading />
          </div>
        </template>

        <template #empty>
          <div
            v-if="!loading && !records?.length"
            class="absolute left-0 z-20 mt-6 flex h-full w-full items-stretch justify-center bg-none text-center"
            style="height: calc(100vh - 30rem)"
          >
            <div class="m-auto flex flex-col justify-center gap-4">
              <i class="pi pi-search text-surface-500" style="font-size: 5rem"></i>
              <h5 class="text-2xl font-semibold">Записів не знайдено</h5>
              <p class="w-[30rem] text-wrap text-center text-base text-surface-500">
                Спробуйте змінити пошукові запити у фільтрі або створіть новий щомісячний звіт
              </p>
            </div>
          </div>
        </template>

        <Column
          frozen
          header="#"
          class="min-w-[4rem]"
          style="text-align: center"
          :pt="{ columntitle: { class: ['m-auto'] } }"
        >
          <template #body="slotProps">
            {{ slotProps.index + 1 }}
          </template>
        </Column>

        <Column frozen header="Код роботи" field="code" class="min-w-[12rem]" />

        <Column header="Назва роботи" field="name" class="min-w-[35rem]" />

        <Column header="Структурний підрозділ" field="subdivision" class="min-w-[25rem]">
          <template #body="{ data }">
            {{ selectSubdivision?.name || '-' }}
          </template>
        </Column>

        <Column
          header="Кількість робіт"
          field="totalJobCount"
          class="min-w-[15rem]"
          style="text-align: center"
          :pt="{ columntitle: { class: ['m-auto'] } }"
        >
          <template #body="{ data, field }">
            <span v-if="data[field] === 0">
              <Tag severity="secondary" class="min-w-[4rem]" :value="data[field] || 0" />
            </span>
            <span v-else>
              <Tag severity="success" class="min-w-[4rem]" :value="data[field] || 0" />
            </span>
          </template>
        </Column>

        <Column
          header="Вартість роботи, грн."
          field="price"
          class="min-w-[15rem]"
          style="text-align: center"
          :pt="{ columntitle: { class: ['m-auto'] } }"
        />

        <Column
          header="Сумарна вартість, грн."
          field="totalPrice"
          class="min-w-[15rem]"
          style="text-align: center"
          :pt="{ columntitle: { class: ['m-auto'] } }"
        >
          <template #body="{ data, field }">
            <span v-if="data[field] === 0">
              <Tag severity="secondary" class="min-w-[4rem]" :value="data[field] || 0" />
            </span>
            <span v-else>
              <Tag severity="success" class="min-w-[4rem]" :value="data[field] || 0" />
            </span>
          </template>
        </Column>

        <ColumnGroup type="footer" v-if="records.length">
          <Row>
            <Column footer="Всього:" :colspan="4" class="uppercase" style="text-align: right" />
            <Column :footer="totalJobCountAll" style="text-align: center" />
            <Column :footer="totalPriceAll" :colspan="2" style="text-align: center" />
          </Row>
        </ColumnGroup>
      </DataTable>
    </div>

    <Tabs scrollable showNavigators lazy v-model:value="subdivision">
      <TabList>
        <Tab v-for="tab in subdivisions" :key="tab.id" :value="tab.id">
          {{ tab.name }}
        </Tab>
      </TabList>
    </Tabs>
  </div>
</template>
