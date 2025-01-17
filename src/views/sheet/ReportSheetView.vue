<script setup lang="jsx">
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watchEffect } from 'vue';

import AppLoading from '@/components/AppLoading.vue';

import { dateToMonthStr } from '@/service/DataFilters';
import { getObjField } from '@/service/ObjectMethods';
import { departmentJobsReport } from '@/service/ReportsSheetToXlsx';
import { useDepartment } from '@/stores/api/departments';
import { useSheet } from '@/stores/api/sheets';

const toast = useToast();

const Sheet = useSheet();
const Department = useDepartment();

const records = ref([]);
const department = ref();
const departments = ref([]);
const datepiker = ref(new Date());

const exportmenu = ref();
const exportmenuitems = ref([
  {
    label: 'Поточні звіти',
    items: [
      {
        label: 'Щомісячний звіт',
        icon: 'pi pi-download',
        command: () => onExportToExcel()
      }
    ]
  },
  {
    label: 'Комплексні звіти',
    items: [
      {
        label: 'Щомісячний звіт',
        icon: 'pi pi-download',
        command: () => onExportAllToExcel()
      }
    ]
  }
]);

const loading = ref(false);

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
  if (!department.value || !datepiker.value) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Оберіть місяць, рік та відділ',
      life: 5000
    });

    return;
  }

  try {
    loading.value = true;

    records.value = await Sheet.getReportsById(department.value, {});
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

const onExportToExcel = async () => {
  if (!department.value || !departments.value?.length || !datepiker.value) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Оберіть місяць, рік та відділ',
      life: 5000
    });

    return;
  }

  loading.value = true;

  try {
    const response = await Sheet.getReportsById(department.value, {});

    const records = response.map(item => {
      return {
        code: item.service.code,
        name: item.service.name,
        branch: item.branch.name,
        subdivision: item.subdivision.name,
        previousJobCount: item.previousJobCount,
        changesJobCount: item.changesJobCount,
        currentJobCount: item.currentJobCount
      };
    });

    const selectDepartment = departments.value.find(({ id }) => id === department.value);

    const buffer = await departmentJobsReport(
      [{ department: selectDepartment, records }],
      datepiker.value
    );

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const objectURL = URL.createObjectURL(blob);

    const aLink = document.createElement('a');
    aLink.href = objectURL;
    aLink.download = `${selectDepartment.name} Щомісячний звіт за ${dateToMonthStr(datepiker.value)}.xlsx`;
    aLink.click();

    URL.revokeObjectURL(objectURL);
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

const onExportAllToExcel = async () => {
  if (!departments?.value?.length || !datepiker?.value) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Оберіть місяць, рік та відділ',
      life: 5000
    });

    return;
  }

  loading.value = true;

  try {
    const response = await Sheet.getReportsByIds({});

    const reports = response.map(({ department, records }) => {
      return {
        department: department,
        records: records.map(item => {
          return {
            code: item.service.code,
            name: item.service.name,
            branch: item.branch.name,
            subdivision: item.subdivision.name,
            previousJobCount: item.previousJobCount,
            changesJobCount: item.changesJobCount,
            currentJobCount: item.currentJobCount
          };
        })
      };
    });

    const buffer = await departmentJobsReport(reports, datepiker.value);

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const objectURL = URL.createObjectURL(blob);

    const aLink = document.createElement('a');
    aLink.href = objectURL;
    aLink.download = `ВП СХ Щомісячний звіт за ${dateToMonthStr(datepiker.value)}.xlsx`;
    aLink.click();

    URL.revokeObjectURL(objectURL);
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
    const { docs } = await Department.findAll({ offset: 0, limit: 1000 });

    departments.value = docs;
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
        :loading="loading"
        style="height: calc(100vh - 15.5rem)"
        v-model:value="records"
        :virtualScrollerOptions="{ itemSize: 46 }"
        class="min-w-full overflow-x-auto text-base"
        :pt="{ mask: { class: ['!bg-transparent', 'dark:!bg-transparent'] } }"
      >
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-1">
              <i class="pi pi-file-excel mr-2 hidden sm:block" style="font-size: 2.5rem" />
              <div class="flex flex-col">
                <h3 class="text-2xl font-normal">
                  <span>{{ $route?.meta?.title }}</span>
                </h3>
                <p class="text-base font-normal text-surface-500">
                  {{ $route?.meta?.description }}
                </p>
              </div>
            </div>

            <div class="flex w-full flex-wrap items-center justify-between gap-x-4 sm:w-max">
              <FloatLabel variant="in">
                <DatePicker
                  showIcon
                  :disabled="loading"
                  inputId="datepiker"
                  v-model="datepiker"
                  iconDisplay="input"
                  dateFormat="mm/yy"
                  variant="filled"
                  view="month"
                />
                <label for="datepiker">Оберіть рік та місяць</label>
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
                :pt="{ list: { class: ['!gap-y-1'] }, itemcontent: { class: ['!py-1'] } }"
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
        </Column>

        <Column
          field="branch.name"
          filterField="branch.name"
          :showFilterMenu="false"
          style="width: 10%"
        >
        </Column>

        <Column
          field="subdivision.name"
          filterField="subdivision.name"
          :showFilterMenu="false"
          style="width: 20%"
        >
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
            <Column
              :footer="records.length"
              style="text-align: center"
              class="!text-xs !text-muted-color"
            />
            <Column footer="Всього:" :colspan="4" footerStyle="text-align:right" />
            <Column style="width: 10%; text-align: center">
              <template #footer>
                <Tag severity="info" class="min-w-[4rem]" :value="previousJobCountAll" />
              </template>
            </Column>

            <Column style="width: 10%; text-align: center">
              <template #footer>
                <Tag severity="info" class="min-w-[4rem]" :value="changesJobCountAll" />
              </template>
            </Column>

            <Column style="width: 10%; text-align: center">
              <template #footer>
                <Tag severity="info" class="min-w-[4rem]" :value="currentJobCountAll" />
              </template>
            </Column>
          </Row>
        </ColumnGroup>
      </DataTable>
    </div>

    <Tabs scrollable showNavigators lazy v-model:value="department">
      <TabList>
        <Tab v-for="tab in departments" :key="tab.id" :value="tab.id">
          {{ tab.name }}
        </Tab>
      </TabList>
    </Tabs>
  </div>
</template>
