<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';

import { useBranch } from '@/stores/api/branches';

const toast = useToast();
const Branch = useBranch();

const loading = ref(false);

const records = ref([]);
const datepiker = ref();
const subdivision = ref();
const subdivisions = ref([]);

watchEffect(async () => {
  if (subdivision.value && datepiker.value) {
    console.log('subdivision and datepiker', subdivision.value, datepiker.value);
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
        editMode="cell"
        :loading="loading"
        style="height: calc(100vh - 12rem)"
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
                    @value-change="onUpdateRecords"
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
                    @value-change="onUpdateRecords"
                  />
                  <label for="department">Оберіть відділ</label>
                </FloatLabel>
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

        <Column field="currentMonthJobChanges" style="width: 10%; text-align: center">
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

    <Tabs scrollable showNavigators lazy v-model:value="subdivision">
      <TabList>
        <Tab v-for="tab in subdivisions" :key="tab.id" :value="tab.id">
          {{ tab.name }}
        </Tab>
      </TabList>
    </Tabs>
  </div>
</template>
