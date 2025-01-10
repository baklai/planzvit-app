<script setup lang="jsx">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';

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

onMounted(async () => {
  try {
    const response = await Department.findAll({ offset: 0, limit: 1000 });

    departments.value = response?.docs?.map(({ id, name, description }) => {
      return { id, name, description };
    });

    if (department.value && datepiker.value) {
      await onUpdateRecords();
    }
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
      showGridlines
      alwaysShowPaginator
      ref="refReportTable"
      scrollHeight="flex"
      responsiveLayout="scroll"
      columnResizeMode="expand"
      editMode="cell"
      :loading="loading"
      style="height: calc(100vh - 13rem)"
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
                <span>Щомісячний звіт</span>
                {{ datepiker ? `за ${dateToMonthStr(datepiker)}` : '' }}
              </h3>
              <p class="text-base font-normal text-surface-500">
                Звіт про надання послуг з програмно-технологічного супроводу
              </p>
            </div>
          </div>
          <div class="flex w-full flex-wrap items-center justify-between gap-2 sm:w-max">
            <div class="flex w-full justify-between gap-2 sm:w-max">
              <DatePicker
                v-model="datepiker"
                view="month"
                dateFormat="mm/yy"
                variant="filled"
                placeholder="Оберіть місяць"
                size="large"
                @value-change="onUpdateRecords"
              />

              <Select
                v-model="department"
                variant="filled"
                size="large"
                :options="departments"
                optionLabel="name"
                placeholder="Оберіть відділ"
                class="w-full md:w-56"
                @value-change="onUpdateRecords"
              />
            </div>
          </div>
        </div>
      </template>

      <template #loading>
        <div class="flex items-center justify-center">
          <ProgressSpinner
            style="width: 80px; height: 80px"
            strokeWidth="3"
            fill="transparent"
            animationDuration=".8s"
          />
        </div>
      </template>

      <template #empty>
        <div
          v-if="!loading && !records?.length"
          class="absolute left-0 z-20 flex h-full w-full items-stretch justify-center bg-none text-center"
          style="height: calc(100vh - 30rem)"
        >
          <div class="m-auto flex flex-col gap-4">
            <i class="pi pi-search text-surface-500" style="font-size: 5rem"></i>
            <h5 class="text-2xl font-semibold">Записів не знайдено</h5>
            <p class="max-w-[30rem] text-base text-surface-500">
              Спробуйте змінити пошукові запити у фільтрі або створіть новий щомісячний звіт
            </p>
            <Button class="m-auto my-4 w-max" label="Створити звіт" @click="initOneReport" />
          </div>
        </div>
      </template>

      <ColumnGroup type="header">
        <Row>
          <Column header="#" :rowspan="2" />
          <Column header="Код роботи" :rowspan="2" />
          <Column header="Назва системи" :rowspan="2" />
          <Column header="Служба/філія" :rowspan="2" />
          <Column header="Структурний підрозділ" :rowspan="2" />

          <Column header="Кількість робіт" :colspan="3" headerClass="!uppercase" />
        </Row>

        <Row>
          <Column header="Попередній місяць" field="previousMonthJobCount" />
          <Column header="Поточні зміни (+/-)" field="currentMonthJobChanges" />
          <Column header="Поточний місяць" field="currentMonthJobCount" />
        </Row>
      </ColumnGroup>

      <Column frozen headerStyle="width: 3rem;" style="text-align: center">
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column field="service.code" style="width: 10%"></Column>
      <Column field="service.name" style="width: 30%"></Column>
      <Column field="branch.name" style="width: 10%"></Column>

      <Column field="subdivision" style="width: 20%">
        <template #body="slotProps">
          {{
            slotProps.data?.branch?.subdivisions?.find(
              ({ id }) => id === slotProps.data.subdivision
            )?.name || '-'
          }}
        </template>
      </Column>

      <Column field="previousMonthJobCount" style="width: 10%; text-align: center">
        <template #body="{ data, field }">
          <span v-if="data[field] !== 0">
            <Tag
              :class="[
                '!min-w-[4rem]',
                '!text-base',
                '!font-bold',
                '!text-white',
                data[field] > 0 ? '!bg-primary/90' : '!bg-red-500/90'
              ]"
              :value="data[field] || '-'"
            />
          </span>
          <span v-else>
            {{ data[field] }}
          </span>
        </template>
      </Column>

      <Column field="currentMonthJobChanges" style="width: 10%; text-align: center">
        <template #body="{ data, field }">
          <span v-if="data[field] !== 0">
            <Tag
              :class="[
                '!min-w-[4rem]',
                '!text-base',
                '!font-bold',
                '!text-white',
                data[field] > 0 ? '!bg-primary/90' : '!bg-red-500/90'
              ]"
              :value="data[field] || '-'"
            />
          </span>
          <span v-else>
            {{ data[field] }}
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
          >
            <template #incrementbuttonicon>
              <span class="pi pi-plus" />
            </template>
            <template #decrementbuttonicon>
              <span class="pi pi-minus" />
            </template>
          </InputNumber>
        </template>
      </Column>

      <Column field="currentMonthJobCount" style="width: 10%; text-align: center">
        <template #body="{ data, field }">
          <span v-if="data[field] !== 0">
            <Tag
              :severity="data[field] > 0 ? 'success' : 'danger'"
              :value="data[field]"
              class="min-w-[4rem]"
            />
          </span>
          <span v-else>
            {{ data[field] }}
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
