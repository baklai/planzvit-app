<script setup lang="jsx">
import { ref, computed, watchEffect, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import ExcelJS from 'exceljs';

import AppLoading from '@/components/AppLoading.vue';

import { useReport } from '@/stores/api/reports';
import { dateToMonthStr } from '@/service/DataFilters.js';

const toast = useToast();

const Report = useReport();

const records = ref([]);
const datepiker = ref();
const department = ref();
const departments = ref([]);
const services = ref([]);
const branches = ref([]);
const subdivisions = ref([]);

const filters = ref({
  'service.code': { value: null, matchMode: FilterMatchMode.IN },
  'service.name': { value: null, matchMode: FilterMatchMode.IN },
  'branch.name': { value: null, matchMode: FilterMatchMode.IN },
  subdivision: { value: null, matchMode: FilterMatchMode.IN }
});

const previousJobCountAll = computed(() => {
  return records.value.reduce((sum, item) => sum + item.previousJobCount, 0);
});

const changesJobCountAll = computed(() => {
  return records.value.reduce((sum, item) => sum + item.changesJobCount, 0);
});

const currentJobCountAll = computed(() => {
  return records.value.reduce((sum, item) => sum + item.currentJobCount, 0);
});

const loading = ref(false);

const onUpdateRecords = async () => {
  if (!department.value || !datepiker.value) return;

  try {
    loading.value = true;

    records.value = await Report.findAll({
      department: department.value.id,
      monthOfReport: datepiker.value.getMonth() + 1,
      yearOfReport: datepiker.value.getFullYear()
    });
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
    if (field === 'changesJobCount') {
      data[field] = newValue;

      data['currentJobCount'] = data['previousJobCount'] + data['changesJobCount'];

      await Report.updateOne(data['id'], {
        changesJobCount: data['changesJobCount'],
        currentJobCount: data['currentJobCount']
      });
    } else {
      event.preventDefault();
    }
  } catch (err) {
    event.preventDefault();
  }
};

const onExportToExcel = async () => {
  if (!records.value?.length || !department.value || !datepiker.value) return;

  const data = records.value.map(item => {
    return {
      code: item.service.code,
      name: item.service.name,
      branch: item.branch.name,
      subdivision:
        item.branch?.subdivisions?.find(({ id }) => id === item?.subdivision)?.name || '-',
      previousJobCount: item.previousJobCount,
      changesJobCount: item.changesJobCount,
      currentJobCount: item.currentJobCount
    };
  });

  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet(department.value.name);

  worksheet.columns = [
    { header: '№ роботи', key: 'code', width: 15 },
    { header: 'Назва системи', key: 'name', width: 50 },
    { header: 'Служба (філія)', key: 'branch', width: 25 },
    { header: 'Структурний підрозділ', key: 'subdivision', width: 40 },
    {
      header: 'Кількість робочих місць (робіт) - попередній місяць',
      key: 'previousJobCount',
      width: 20
    },
    {
      header: 'Кількість нових робочих місць (робіт) за теперешній місяць',
      key: 'changesJobCount',
      width: 20
    },
    { header: 'Кількість робочих місць (робіт) всього', key: 'currentJobCount', width: 20 }
  ];

  worksheet.addRows(data);

  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).height = 100;

  worksheet.eachRow(row => {
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      cell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${department.value.name} Щомісячний звіт за ${dateToMonthStr(datepiker.value)}.xlsx`;
  link.click();

  URL.revokeObjectURL(url);
};

const onCreateReport = async () => {
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

watchEffect(async () => {
  if (department.value && datepiker.value) {
    await onUpdateRecords();
  }
});

onMounted(async () => {
  try {
    const response = await Report.findCollecrions();

    departments.value = response.deparments;
    services.value = response.services;
    branches.value = response.branches;
    subdivisions.value = response.subdivisions;
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
      :lazy="false"
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
      :filterDisplay="records.length ? 'row' : null"
      :loading="loading"
      style="height: calc(100vh - 8rem)"
      v-model:value="records"
      v-model:filters="filters"
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
              <Button
                severity="success"
                icon="pi pi-download"
                label="Завантажити звіт"
                @click="onExportToExcel"
                class="mx-4"
                v-if="records?.length"
              />

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
          class="absolute left-0 z-20 mt-6 flex h-full w-full items-stretch justify-center bg-none text-center"
          style="height: calc(100vh - 30rem)"
        >
          <div class="m-auto flex flex-col justify-center gap-4">
            <i class="pi pi-search text-surface-500" style="font-size: 5rem"></i>
            <h5 class="text-2xl font-semibold">Записів не знайдено</h5>
            <p class="w-[30rem] text-wrap text-center text-base text-surface-500">
              Спробуйте змінити пошукові запити у фільтрі або зверніться до адміністратора для
              створення нового щомісячного звіту
            </p>

            <Button
              class="m-auto my-4 w-max"
              label="Створити звіт"
              @click="onCreateReport"
              v-if="$planzvit.profile.role === 'administrator'"
            />
          </div>
        </div>
      </template>

      <ColumnGroup type="header">
        <Row>
          <Column header="#" :rowspan="2" frozen :pt="{ columntitle: { class: ['m-auto'] } }" />
          <Column header="Код роботи" :rowspan="2" frozen />
          <Column header="Назва роботи" :rowspan="2" />
          <Column header="Служба/філія" :rowspan="2" />
          <Column header="Структурний підрозділ" :rowspan="2" />
          <Column
            header="Кількість робіт"
            :colspan="6"
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
            field="previousJobCount"
            :colspan="1"
            :pt="{ columntitle: { class: ['m-auto'] } }"
          />
          <Column
            header="Поточні зміни (+/-)"
            field="changesJobCount"
            :colspan="1"
            :pt="{ columntitle: { class: ['m-auto'] } }"
          />
          <Column
            header="Поточний місяць"
            field="currentJobCount"
            :colspan="1"
            :pt="{ columntitle: { class: ['m-auto'] } }"
          />
        </Row>
      </ColumnGroup>

      <Column style="width: 3rem; text-align: center" frozen>
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column
        frozen
        field="service.code"
        filterField="service.code"
        :showFilterMenu="false"
        style="width: 10%"
      >
        <template #filter="{ filterModel, filterCallback }" v-if="records.length">
          <MultiSelect
            @change="filterCallback()"
            v-model="filterModel.value"
            :options="services || []"
            optionLabel="code"
            optionValue="code"
            dataKey="id"
            placeholder="Код роботи"
            :selectionLimit="10"
            :maxSelectedLabels="1"
            filter
            class="w-full"
            display="chip"
            autoFilterFocus
            resetFilterOnHide
          >
            <template #option="slotProps">
              <div class="flex items-center gap-2">
                <span>{{ slotProps.option.code }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>

      <Column
        field="service.name"
        filterField="service.name"
        :showFilterMenu="false"
        style="width: 30%"
      >
        <template #filter="{ filterModel, filterCallback }" v-if="records.length">
          <MultiSelect
            @change="filterCallback()"
            v-model="filterModel.value"
            :options="services || []"
            optionLabel="name"
            optionValue="name"
            dataKey="id"
            placeholder="Назва роботи"
            :selectionLimit="10"
            :maxSelectedLabels="1"
            filter
            class="w-full"
            display="chip"
            autoFilterFocus
            resetFilterOnHide
          >
            <template #option="slotProps">
              <div class="flex items-center gap-2">
                <span>{{ slotProps.option.name }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>

      <Column
        field="branch.name"
        filterField="branch.name"
        :showFilterMenu="false"
        style="width: 10%"
      >
        <template #filter="{ filterModel, filterCallback }" v-if="records.length">
          <MultiSelect
            @change="filterCallback()"
            v-model="filterModel.value"
            :options="branches || []"
            optionLabel="name"
            optionValue="name"
            dataKey="id"
            placeholder="Служба/філія"
            :selectionLimit="10"
            :maxSelectedLabels="1"
            filter
            class="w-full"
            display="chip"
            autoFilterFocus
            resetFilterOnHide
          >
            <template #option="slotProps">
              <div class="flex items-center gap-2">
                <span>{{ slotProps.option.name }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>

      <Column
        field="subdivision"
        filterField="subdivision"
        :showFilterMenu="false"
        style="width: 20%"
      >
        <template #body="{ data }">
          {{ subdivisions?.find(({ id }) => id === data?.subdivision)?.name || '-' }}
        </template>

        <template #filter="{ filterModel, filterCallback }" v-if="records.length">
          <MultiSelect
            @change="filterCallback()"
            v-model="filterModel.value"
            :options="subdivisions || []"
            optionLabel="name"
            optionValue="id"
            dataKey="id"
            placeholder="Служба/філія"
            :selectionLimit="10"
            :maxSelectedLabels="1"
            filter
            class="w-full"
            display="chip"
            autoFilterFocus
            resetFilterOnHide
          >
            <template #option="slotProps">
              <div class="flex items-center gap-2">
                <span>{{ slotProps.option.name }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>

      <Column field="previousJobCount" style="width: 10%; text-align: center">
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

      <Column field="changesJobCount" style="width: 10%; text-align: center; cursor: pointer">
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

      <Column field="currentJobCount" style="width: 10%; text-align: center">
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

      <ColumnGroup type="footer" v-if="records.length">
        <Row>
          <Column footer="Всього:" :colspan="5" footerStyle="text-align:right" />
          <Column :footer="previousJobCountAll" style="width: 10%; text-align: center" />
          <Column :footer="changesJobCountAll" style="width: 10%; text-align: center" />
          <Column :footer="currentJobCountAll" style="width: 10%; text-align: center" />
        </Row>
      </ColumnGroup>
    </DataTable>
  </div>
</template>
