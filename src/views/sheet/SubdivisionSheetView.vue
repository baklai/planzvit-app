<script setup>
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watchEffect } from 'vue';

import AppLoading from '@/components/AppLoading.vue';

import { dateToMonthStr } from '@/service/DataFilters.js';
import { monthlySubdivisionReport } from '@/service/ReportsSheetToXlsx';
import { useSheet } from '@/stores/api/sheets';
import { useSubdivision } from '@/stores/api/subdivisions';

const toast = useToast();

const Subdivision = useSubdivision();
const Sheet = useSheet();

const loading = ref(false);

const subdivision = ref();
const subdivisionId = ref();
const subdivisions = ref([]);
const datepiker = ref(new Date());

const exportmenu = ref();
const exportmenuitems = ref([]);

const toggle = event => {
  exportmenu.value.toggle(event);
};

const onUpdateRecords = async () => {
  if (!subdivisionId.value || !datepiker.value) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Оберіть дату та підрозділ',
      life: 3000
    });

    return;
  }

  try {
    loading.value = true;

    const [response] = await Sheet.getSubdivisionsById(subdivisionId.value, {
      monthOfReport: datepiker.value.getMonth() + 1,
      yearOfReport: datepiker.value.getFullYear()
    });

    subdivision.value = response;
  } catch (err) {
    subdivision.value = null;
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
  if (!subdivisionId.value || !datepiker.value) return;

  loading.value = true;

  try {
    const [response] = await Sheet.getSubdivisionsById(subdivisionId.value, {
      monthOfReport: datepiker.value.getMonth() + 1,
      yearOfReport: datepiker.value.getFullYear()
    });

    const data = response.services.map(item => {
      return {
        code: item.code,
        name: item.name,
        subdivision: response.subdivision.name,
        totalJobCount: item.totalJobCount,
        department: `${item.department.manager} ${item.department.phone}`
      };
    });

    const buffer = await monthlySubdivisionReport(
      [
        {
          data,
          branch: response.branch,
          subdivision: response.subdivision
        }
      ],
      datepiker.value
    );

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const objectURL = URL.createObjectURL(blob);

    const aLink = document.createElement('a');
    aLink.href = objectURL;
    aLink.download = `${response.subdivision.name} Щомісячний звіт за ${dateToMonthStr(datepiker.value)}.xlsx`;
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
  if (!subdivisions?.value?.length || !datepiker?.value) return;

  loading.value = true;

  try {
    const deparmentsRecords = await Promise.all([
      ...subdivisions.value.map(({ id }) =>
        Sheet.getSubdivisionsById(id, {
          monthOfReport: datepiker.value.getMonth() + 1,
          yearOfReport: datepiker.value.getFullYear()
        })
      )
    ]);

    const reports = deparmentsRecords.map((records, index) => {
      return {
        department: { ...departments.value[index] },
        datetime: datepiker.value,
        data: records.map(item => {
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

    const buffer = await departmentJobsReport(reports);

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `ВП СХ Щомісячний звіт за ${dateToMonthStr(datepiker.value)}.xlsx`;
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

watchEffect(async () => {
  if (subdivisionId.value && datepiker.value) {
    await onUpdateRecords();
  }
});

onMounted(async () => {
  try {
    const { docs } = await Subdivision.findAll({ offset: 0, limit: 10000 });

    subdivisions.value = docs;

    exportmenuitems.value = [
      {
        label: 'Поточні звіти',
        items: [
          {
            label: 'Кількісний звіт',
            icon: 'pi pi-download',
            command: () => onExportToExcel()
          },
          {
            label: 'Економічний звіт',
            icon: 'pi pi-download',
            command: () => onExportToExcel()
          }
        ]
      },
      {
        label: 'Комплексні звіти',
        items: [
          {
            label: 'Кількісний звіт',
            icon: 'pi pi-download',
            command: () => onExportAllToExcel()
          },
          {
            label: 'Економічний звіт',
            icon: 'pi pi-download',
            command: () => onExportAllToExcel()
          }
        ]
      }
    ];
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
        :value="subdivision?.services || []"
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
                  {{ subdivision?.subdivision?.name ? `${subdivision?.subdivision?.name} | ` : '' }}
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
            v-if="!loading && !subdivision?.services && !subdivision?.services?.length"
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
          <template #body>
            {{ subdivision?.subdivision?.name || '-' }}
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

        <ColumnGroup type="footer" v-if="subdivision?.services?.length">
          <Row>
            <Column
              :footer="subdivision.services.length"
              style="text-align: center"
              class="!text-xs !text-muted-color"
            />
            <Column footer="Всього:" :colspan="3" class="uppercase" style="text-align: right" />
            <Column :footer="subdivision?.totalJobCount || 0" style="text-align: center" />
            <Column
              :footer="subdivision?.totalPrice || 0"
              :colspan="2"
              style="text-align: center"
            />
          </Row>
        </ColumnGroup>
      </DataTable>
    </div>

    <Tabs scrollable showNavigators lazy v-model:value="subdivisionId">
      <TabList>
        <Tab v-for="tab in subdivisions" :key="tab.id" :value="tab.id">
          {{ tab.name }}
        </Tab>
      </TabList>
    </Tabs>
  </div>
</template>
