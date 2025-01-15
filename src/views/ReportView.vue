<script setup lang="jsx">
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watchEffect } from 'vue';

import AppLoading from '@/components/AppLoading.vue';

import { dateToMonthStr } from '@/service/DataFilters';
import { getObjField } from '@/service/ObjectMethods';
import { monthlyReport } from '@/service/ReportsSheetToXlsx';
import { useReport } from '@/stores/api/reports';

const toast = useToast();

const Report = useReport();

const records = ref([]);
const datepiker = ref();
const department = ref();
const departments = ref([]);
const services = ref([]);
const branches = ref([]);
const subdivisions = ref([]);

const loading = ref(false);

const exportmenu = ref();
const exportmenuitems = ref([
  {
    label: 'Експорт звітів',
    items: [
      {
        label: 'Щомісячний звіт',
        icon: 'pi pi-download',
        command: () => onExportToExcel()
      },

      {
        label: 'Щомісячний оптимізований звіт',
        icon: 'pi pi-download',
        command: () => onExportToExcel(true)
      }
    ]
  },

  {
    label: 'Генерація звітів',
    items: [
      {
        label: 'Оновити щомісячний звіт',
        icon: 'pi pi-replay',
        command: () => onCreateReport()
      },
      {
        label: 'Створити щомісячний звіт',
        icon: 'pi pi-sparkles',
        command: () => onCreateReport()
      }
    ]
  }
]);

const filters = ref({
  'service.code': { value: null, matchMode: FilterMatchMode.IN },
  'service.name': { value: null, matchMode: FilterMatchMode.IN },
  'branch.name': { value: null, matchMode: FilterMatchMode.IN },
  'subdivision.name': { value: null, matchMode: FilterMatchMode.IN }
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

const toggle = event => {
  exportmenu.value.toggle(event);
};

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

const onExportToExcel = async (optimized = false) => {
  if (!department.value || !datepiker.value) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Оберіть місяць, рік та відділ!',
      life: 5000
    });

    return;
  }

  loading.value = true;

  try {
    const response = await Report.findAll({
      department: department.value.id,
      monthOfReport: datepiker.value.getMonth() + 1,
      yearOfReport: datepiker.value.getFullYear()
    });

    const data = response
      .map(item => {
        return {
          code: item.service.code,
          name: item.service.name,
          branch: item.branch.name,
          subdivision: item.subdivision.name,
          previousJobCount: item?.previousJobCount || 0,
          changesJobCount: item?.changesJobCount || 0,
          currentJobCount: item?.currentJobCount || 0
        };
      })
      .filter(item => {
        if (!optimized) return true;

        return (
          item.previousJobCount !== 0 || item.changesJobCount !== 0 || item.currentJobCount !== 0
        );
      });

    const buffer = await monthlyReport([
      { department: { ...department.value }, datetime: datepiker.value, data }
    ]);

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${department.value.name} Щомісячний звіт за ${dateToMonthStr(datepiker.value)}.xlsx`;
    link.click();

    URL.revokeObjectURL(url);
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

const onCreateReport = async () => {
  if (!department.value || !datepiker.value) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Оберіть місяць, рік та відділ!',
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
      :pt="{ mask: { class: ['!bg-transparent', 'dark:!bg-transparent'] } }"
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

          <div class="flex w-full flex-wrap items-center justify-between gap-x-4 sm:w-max">
            <FloatLabel variant="in">
              <DatePicker
                inputId="datepiker"
                v-model="datepiker"
                view="month"
                showIcon
                iconDisplay="input"
                dateFormat="mm/yy"
                variant="filled"
                :disabled="loading"
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
                :disabled="loading"
              />
              <label for="department">Оберіть відділ</label>
            </FloatLabel>

            <Button
              size="large"
              type="button"
              icon="pi pi-ellipsis-v"
              @click="toggle"
              aria-haspopup="true"
              severity="secondary"
              aria-controls="exports_menu"
              v-tooltip.bottom="'Експорт звітів'"
              :pt="{ root: { class: ['h-14'] } }"
            />
            <Menu
              ref="exportmenu"
              id="exports_menu"
              :model="exportmenuitems"
              :popup="true"
              :pt="{ list: { class: ['!gap-y-2'] }, itemcontent: { class: ['py-2'] } }"
            />
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

      <Column
        frozen
        header="#"
        :reorderableColumn="false"
        style="width: 3rem; text-align: center"
        :pt="{ columntitle: { class: ['m-auto'] } }"
      >
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column
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
            :maxSelectedLabels="1"
            filter
            display="chip"
            autoFilterFocus
            resetFilterOnHide
            filterMatchMode="contains"
            filterPlaceholder="Пошук у списку"
            :virtualScrollerOptions="{ itemSize: 32 }"
            class="w-full"
          >
            <template #option="slotProps">
              <div class="flex h-full items-center text-base">
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
        style="max-width: 20rem"
      >
        <template #body="{ data, field }">
          <div
            class="overflow-hidden text-ellipsis whitespace-nowrap px-2"
            v-tooltip.bottom="getObjField(data, field)"
          >
            <span>{{ getObjField(data, field) }}</span>
          </div>
        </template>

        <template #filter="{ filterModel, filterCallback }" v-if="records.length">
          <MultiSelect
            @change="filterCallback()"
            v-model="filterModel.value"
            :options="services || []"
            optionLabel="name"
            optionValue="name"
            dataKey="id"
            placeholder="Назва роботи"
            :maxSelectedLabels="0"
            filter
            display="chip"
            autoFilterFocus
            resetFilterOnHide
            filterMatchMode="contains"
            filterPlaceholder="Пошук у списку"
            :virtualScrollerOptions="{ itemSize: 32 }"
            class="w-full"
          >
            <template #option="slotProps">
              <div class="flex h-full items-center text-base">
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
            :maxSelectedLabels="0"
            filter
            display="chip"
            autoFilterFocus
            resetFilterOnHide
            filterMatchMode="contains"
            filterPlaceholder="Пошук у списку"
            :virtualScrollerOptions="{ itemSize: 32 }"
            class="w-full"
          >
            <template #option="slotProps">
              <div class="flex h-full items-center text-base">
                <span>{{ slotProps.option.name }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>

      <Column
        field="subdivision.name"
        filterField="subdivision.name"
        :showFilterMenu="false"
        style="width: 20%"
      >
        <template #filter="{ filterModel, filterCallback }" v-if="records.length">
          <MultiSelect
            @change="filterCallback()"
            v-model="filterModel.value"
            :options="subdivisions || []"
            optionLabel="name"
            optionValue="name"
            dataKey="id"
            placeholder="Структурний підрозділ"
            :maxSelectedLabels="0"
            filter
            display="chip"
            autoFilterFocus
            resetFilterOnHide
            filterMatchMode="contains"
            filterPlaceholder="Пошук у списку"
            :virtualScrollerOptions="{ itemSize: 32 }"
            class="w-full"
          >
            <template #option="slotProps">
              <div class="flex h-full items-center text-base">
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
