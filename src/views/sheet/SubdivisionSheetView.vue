<script setup>
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watchEffect } from 'vue';

import AppLoading from '@/components/AppLoading.vue';

import { dateToMonthStr } from '@/service/DataFilters.js';
import { subdivisionJobsReport, subdivisionJobsReportPrice } from '@/service/ReportsSheetToXlsx';
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
const exportmenuitems = ref([
  {
    label: 'Поточні звіти',
    items: [
      {
        label: 'Перелік послуг підрозділу',
        icon: 'pi pi-download',
        command: () => onExportToExcel()
      },
      {
        label: 'Акт здавання-приймання послуг',
        icon: 'pi pi-download',
        command: () => onExportToExcelPrice()
      }
    ]
  },
  {
    label: 'Комплексні звіти',
    items: [
      {
        label: 'Перелік послуг підрозділам',
        icon: 'pi pi-download',
        command: () => onExportAllToExcel()
      },
      {
        label: 'Акти здавання-приймання послуг',
        icon: 'pi pi-download',
        command: () => onExportAllToExcelPrice()
      }
    ]
  }
]);

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

    const [response] = await Sheet.getSubdivisionsById(subdivisionId.value, {});

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
  if (!subdivisionId.value || !datepiker.value) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Оберіть місяць, рік та підрозділ',
      life: 5000
    });

    return;
  }

  loading.value = true;

  try {
    const [response] = await Sheet.getSubdivisionsById(subdivisionId.value, {});

    const data = response.services
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(item => {
        return {
          code: item.code,
          name: item.name,
          subdivision: response.name,
          totalJobCount: item.totalJobCount,
          department: `${item.department.manager} ${item.department.phone}`
        };
      });

    const buffer = await subdivisionJobsReport(
      [
        {
          data,
          branch: response.branch,
          subdivision: { name: response.name, description: response.description }
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
    aLink.download = `${response.name} Перелік послуг за ${dateToMonthStr(datepiker.value)}.xlsx`;
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
  if (!subdivisions?.value?.length || !datepiker?.value) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Оберіть місяць, рік та підрозділ',
      life: 5000
    });

    return;
  }

  loading.value = true;

  try {
    const response = await Sheet.getSubdivisionsByIds({});

    const reports = response
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(record => {
        return {
          subdivision: { name: record.name, description: record.description },
          data: record.services
            .sort((a, b) => a.id.localeCompare(b.id))
            .map(item => {
              return {
                code: item.code,
                name: item.name,
                subdivision: record.name,
                totalJobCount: item.totalJobCount,
                department: `${item.department.manager} ${item.department.phone}`
              };
            })
        };
      });

    const buffer = await subdivisionJobsReport(reports, datepiker.value);

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `Перелік послуг підрозділам за ${dateToMonthStr(datepiker.value)}.xlsx`;
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

const onExportToExcelPrice = async () => {
  if (!subdivisionId.value || !datepiker.value) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Оберіть місяць, рік та підрозділ',
      life: 5000
    });

    return;
  }

  loading.value = true;

  try {
    const [response] = await Sheet.getSubdivisionsById(subdivisionId.value, {});

    const data = response.services
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(item => {
        return {
          code: item.code,
          name: item.name,
          subdivision: response.name,
          totalJobCount: item.totalJobCount,
          price: item.price,
          totalPrice: item.totalPrice
        };
      });

    const buffer = await subdivisionJobsReportPrice(
      [
        {
          data,
          subdivision: { name: response.name, description: response.description }
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
    aLink.download = `${response.name} Акт здавання-приймання послуг за ${dateToMonthStr(datepiker.value)}.xlsx`;
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

const onExportAllToExcelPrice = async () => {
  if (!subdivisions?.value?.length || !datepiker?.value) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Оберіть місяць, рік та підрозділ',
      life: 5000
    });

    return;
  }

  loading.value = true;

  try {
    const response = await Sheet.getSubdivisionsByIds({});

    const reports = response
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(record => {
        return {
          branch: record.branch,
          subdivision: { name: record.name, description: record.description },
          data: record.services
            .sort((a, b) => a.id.localeCompare(b.id))
            .map(item => {
              return {
                code: item.code,
                name: item.name,
                subdivision: record.name,
                totalJobCount: item.totalJobCount,
                price: item.price,
                totalPrice: item.totalPrice
              };
            })
        };
      });

    const buffer = await subdivisionJobsReportPrice(reports, datepiker.value);

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `Акт здавання-приймання послуг підрозділам за ${dateToMonthStr(datepiker.value)}.xlsx`;
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
                  {{ subdivision?.name ? `${subdivision?.name} | ` : '' }}
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

        <Column header="Назва роботи" field="name" class="max-w-[40rem]">
          <template #body="{ data, field }">
            <p class="min-w-[35rem] overflow-hidden text-ellipsis px-2">
              {{ data[field] }}
            </p>
          </template>
        </Column>

        <Column header="Структурний підрозділ" field="subdivision" class="min-w-[20rem]">
          <template #body>
            <span class="px-2">
              {{ subdivision?.name || '-' }}
            </span>
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
            <Column style="text-align: center">
              <template #footer>
                <Tag severity="info" class="min-w-[4rem]" :value="subdivision?.totalJobCount" />
              </template>
            </Column>
            <Column :footer="subdivision?.totalPrice || 0" :colspan="2" style="text-align: center">
              <template #footer>
                <Tag severity="info" class="min-w-[4rem]" :value="subdivision?.totalPrice" />
              </template>
            </Column>
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
