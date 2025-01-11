<script setup lang="jsx">
import { ref, computed, watchEffect, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';

import AppLoading from '@/components/AppLoading.vue';
import { useReport } from '@/stores/api/reports';
import { useDepartment } from '@/stores/api/departments';
import { dateToMonthStr } from '@/service/DataFilters.js';

const toast = useToast();

const Report = useReport();
const Department = useDepartment();

const records = ref([]);
const totalRecords = ref();
const datepiker = ref();
const department = ref();
const departments = ref([]);

const allPreviousMonthJobCount = computed(() => {
  return records.value.reduce((sum, item) => sum + item.previousMonthJobCount, 0);
});

const allCurrentMonthJobChanges = computed(() => {
  return records.value.reduce((sum, item) => sum + item.currentMonthJobChanges, 0);
});

const allCurrentMonthJobCount = computed(() => {
  return records.value.reduce((sum, item) => sum + item.currentMonthJobCount, 0);
});

const loading = ref(false);

const initOneReport = async () => {
  if (!department.value || !datepiker.value) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Вкажіть місяць, рік та відділ підрозділу!',
      life: 5000
    });

    return;
  }

  try {
    loading.value = true;

    await Report.createOne({
      department: department.value.id,
      monthOfReport: datepiker.value.getMonth() + 1,
      yearOfReport: datepiker.value.getFullYear()
    });

    await onUpdateRecords();
  } catch (err) {
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

const onUpdateRecords = async () => {
  if (!department.value || !datepiker.value) return;

  try {
    loading.value = true;

    const { docs, totalDocs } = await Report.findAll({
      offset: 0,
      limit: 10000,
      filters: {
        department: department.value.id,
        monthOfReport: datepiker.value.getMonth() + 1,
        yearOfReport: datepiker.value.getFullYear()
      },
      sortField: null,
      sortOrder: null
    });

    records.value = docs;
    totalRecords.value = totalDocs;
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

const onCellEditComplete = async event => {
  const { data, newValue, field } = event;

  try {
    data[field] = newValue;

    if (field === 'currentMonthJobChanges') {
      data['currentMonthJobCount'] = data['previousMonthJobCount'] + data['currentMonthJobChanges'];

      await Report.updateOne(data['id'], {
        currentMonthJobChanges: data['currentMonthJobChanges'],
        currentMonthJobCount: data['currentMonthJobCount']
      });
    }
  } catch (err) {
    event.preventDefault();
  }
};

watchEffect(async () => {
  if (department.value && datepiker.value) {
    await onUpdateRecords();
  }
});

onMounted(async () => {
  try {
    const response = await Department.findAll({ offset: 0, limit: 1000 });

    departments.value = response?.docs?.map(({ id, name, description }) => {
      return { id, name, description };
    });
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
  <div class="flex w-full overflow-x-auto">
    <DataTable
      lazy
      rowHover
      scrollable
      dataKey="id"
      size="small"
      showGridlines
      resizableColumns
      scrollHeight="flex"
      sortMode="multiple"
      responsiveLayout="scroll"
      columnResizeMode="expand"
      editMode="cell"
      :loading="loading"
      style="height: calc(100vh - 8rem)"
      v-model:value="records"
      :virtualScrollerOptions="{ itemSize: 46 }"
      @cell-edit-complete="onCellEditComplete"
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
                {{ department?.name ? `${department.name} - ` : '' }}
                <span>{{ $route?.meta?.title }}</span>
                {{ datepiker ? `за ${dateToMonthStr(datepiker)}` : '' }}
              </h3>
              <p class="text-base font-normal text-surface-500">
                {{ $route?.meta?.description }}
              </p>
            </div>
          </div>

          <div class="flex w-full flex-wrap items-center justify-between sm:w-max">
            <div class="flex w-full justify-between sm:w-max">
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

              <FloatLabel class="w-[20rem]" variant="in">
                <Select
                  inputId="department"
                  v-model="department"
                  variant="filled"
                  :options="departments"
                  optionLabel="name"
                  class="w-full"
                />
                <label for="department">Оберіть відділ</label>
              </FloatLabel>
            </div>
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
            <Button class="m-auto my-4 w-max" label="Створити звіт" @click="initOneReport" />
          </div>
        </div>
      </template>

      <ColumnGroup type="header">
        <Row>
          <Column header="" :rowspan="2" frozen />
          <Column header="Код роботи" :rowspan="2" frozen />
          <Column header="Назва системи" :rowspan="2" />
          <Column header="Служба/філія" :rowspan="2" />
          <Column header="Структурний підрозділ" :rowspan="2" />
          <Column
            header="Кількість робіт"
            :colspan="3"
            :pt="{
              columntitle: {
                class: ['m-auto', 'uppercase']
              }
            }"
          />
        </Row>

        <Row>
          <Column
            header="Попередній місяць"
            field="previousMonthJobCount"
            :pt="{ columntitle: { class: ['m-auto'] } }"
          />
          <Column
            header="Поточні зміни (+/-)"
            field="currentMonthJobChanges"
            :pt="{ columntitle: { class: ['m-auto'] } }"
          />
          <Column
            header="Поточний місяць"
            field="currentMonthJobCount"
            :pt="{ columntitle: { class: ['m-auto'] } }"
          />
        </Row>
      </ColumnGroup>

      <Column style="width: 3rem; text-align: center" frozen>
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column field="service.code" style="width: 10%" frozen />
      <Column field="service.name" style="width: 30%" />
      <Column field="branch.name" style="width: 10%" />
      <Column field="subdivision" style="width: 20%">
        <template #body="{ data }">
          {{ data?.branch?.subdivisions?.find(({ id }) => id === data?.subdivision)?.name || '-' }}
        </template>
      </Column>

      <Column field="previousMonthJobCount" style="width: 10%; text-align: center">
        <template #body="{ data, field }">
          <span v-if="data[field] !== 0">
            <Tag
              :severity="data[field] > 0 ? 'success' : 'warn'"
              class="min-w-[4rem]"
              :value="data[field] || '-'"
            />
          </span>
          <span v-else>
            <Tag severity="secondary" class="min-w-[4rem]" :value="data[field] || 0" />
          </span>
        </template>
      </Column>

      <Column
        field="currentMonthJobChanges"
        style="width: 10%; text-align: center; cursor: pointer"
      >
        <template #body="{ data, field }">
          <span v-if="data[field] !== 0">
            <Tag
              :severity="data[field] > 0 ? 'success' : 'warn'"
              class="min-w-[4rem] font-bold"
              :value="data[field] || '-'"
            />
          </span>
          <span v-else>
            <Tag severity="secondary" class="min-w-[4rem]" :value="data[field] || 0" />
          </span>
        </template>

        <template #editor="{ data, field }">
          <InputNumber
            v-model="data[field]"
            showButtons
            buttonLayout="horizontal"
            :step="1"
            size="small"
            inputId="integeronly"
            autofocus
            fluid
            variant="filled"
            inputClass="text-center w-48 h-10 text-base"
          >
          </InputNumber>
        </template>
      </Column>

      <Column field="currentMonthJobCount" style="width: 10%; text-align: center">
        <template #body="{ data, field }">
          <span v-if="data[field] !== 0">
            <Tag
              :severity="data[field] > 0 ? 'success' : 'warn'"
              class="min-w-[4rem]"
              :value="data[field] || '-'"
            />
          </span>
          <span v-else>
            <Tag severity="secondary" class="min-w-[4rem]" :value="data[field] || 0" />
          </span>
        </template>
      </Column>

      <ColumnGroup type="footer" v-if="totalRecords">
        <Row>
          <Column footer="Всього:" :colspan="5" footerStyle="text-align:right" />
          <Column :footer="allPreviousMonthJobCount" style="width: 10%; text-align: center" />
          <Column :footer="allCurrentMonthJobChanges" style="width: 10%; text-align: center" />
          <Column :footer="allCurrentMonthJobCount" style="width: 10%; text-align: center" />
        </Row>
      </ColumnGroup>
    </DataTable>
  </div>
</template>
