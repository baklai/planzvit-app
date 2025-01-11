<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';

import AppLoading from '@/components/AppLoading.vue';
import { useDocument } from '@/stores/api/documents';
import { useBranch } from '@/stores/api/branches';
import { dateToMonthStr } from '@/service/DataFilters.js';

const toast = useToast();
const Branch = useBranch();
const Document = useDocument();

const loading = ref(false);

const records = ref([]);
const datepiker = ref();
const totalRecords = ref();
const subdivision = ref();
const subdivisions = ref([]);

const onUpdateRecords = async () => {
  if (!subdivision.value || !datepiker.value) return;

  try {
    loading.value = true;

    records.value = await Document.findOneForSubdivision(subdivision.value, {
      monthOfReport: datepiker.value.getMonth() + 1,
      yearOfReport: datepiker.value.getFullYear()
    });

    totalRecords.value = records.value.length;
  } catch (err) {
    records.value = [];
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

const selectSubdivision = computed(() => {
  return subdivisions.value.find(({ id }) => id === subdivision.value) || null;
});

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
        showGridlines
        resizableColumns
        scrollHeight="flex"
        sortMode="multiple"
        responsiveLayout="scroll"
        columnResizeMode="expand"
        :loading="loading"
        style="height: calc(100vh - 15.5rem)"
        v-model:value="records"
        :virtualScrollerOptions="{ itemSize: 46 }"
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
                <h3 class="text-2xl font-normal">
                  {{ selectSubdivision?.name ? `${selectSubdivision.name} - ` : '' }}
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
            class="absolute left-0 z-20 flex h-full w-full items-stretch justify-center bg-none text-center"
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

        <Column header="" style="width: 5%; text-align: center" frozen>
          <template #body="slotProps">
            {{ slotProps.index + 1 }}
          </template>
        </Column>

        <Column header="Код роботи" field="service.code" style="width: 10%" frozen />

        <Column header="Назва системи" field="service.name" style="width: 40%" />

        <Column header="Структурний підрозділ" field="subdivision.name" style="width: 30%" />

        <Column
          header="Кількість робіт"
          field="currentMonthJobCount"
          style="width: 15%; text-align: center"
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

        <ColumnGroup type="footer" v-if="totalRecords">
          <Row>
            <Column footer="Всього:" :colspan="5" footerStyle="text-align:right" />
            <Column :footer="allCurrentMonthJobCount" style="width: 10%; text-align: center" />
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
