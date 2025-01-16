<script setup>
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watchEffect } from 'vue';

import AppLoading from '@/components/AppLoading.vue';
import { dateToMonthStr } from '@/service/DataFilters.js';
import { useBranch } from '@/stores/api/branches';
import { useSheet } from '@/stores/api/sheets';

const toast = useToast();
const Branch = useBranch();
const Sheet = useSheet();

const loading = ref(false);

const records = ref([]);
const datepiker = ref(new Date());
const branch = ref();
const branches = ref([]);

const totalPriceAll = ref();
const totalJobCountAll = ref();

const exportmenu = ref();
const exportmenuitems = ref([]);

const toggle = event => {
  exportmenu.value.toggle(event);
};

const selectBranch = computed(() => {
  return branches.value.find(({ id }) => id === branch.value) || null;
});

const onUpdateRecords = async () => {
  if (!branch.value || !datepiker.value) return;

  try {
    loading.value = true;

    const [response] = await Sheet.getBranchesById(branch.value, {
      monthOfReport: datepiker.value.getMonth() + 1,
      yearOfReport: datepiker.value.getFullYear()
    });

    totalJobCountAll.value = response.totalJobCount;
    totalPriceAll.value = response.totalPrice;

    records.value = response.subdivisions.flatMap(subdivision =>
      subdivision.services.map(service => ({
        ...service,
        id: `${subdivision.id}-${service.id}`,
        subdivision: subdivision.name,
        subdivisionTotalJobCount: subdivision.totalJobCount,
        subdivisionTotalPrice: subdivision.totalPrice
      }))
    );
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

watchEffect(async () => {
  if (branch.value && datepiker.value) {
    await onUpdateRecords();
  }
});

onMounted(async () => {
  try {
    const { docs } = await Branch.findAll({ offset: 0, limit: 1000 });

    branches.value = docs.map(({ id, name, description }) => {
      return { id, name, description };
    });

    exportmenuitems.value = [
      {
        label: 'Поточні звіти',
        items: [
          {
            label: 'Кількісний звіт',
            icon: 'pi pi-download',
            command: () => false
          },
          {
            label: 'Економічний звіт',
            icon: 'pi pi-download',
            command: () => false
          }
        ]
      },
      {
        label: 'Комплексні звіти',
        items: [
          {
            label: 'Кількісний звіт',
            icon: 'pi pi-download',
            command: () => false
          },
          {
            label: 'Економічний звіт',
            icon: 'pi pi-download',
            command: () => false
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
        showGridlines
        size="small"
        scrollHeight="flex"
        responsiveLayout="scroll"
        columnResizeMode="expand"
        :loading="loading"
        style="height: calc(100vh - 15.5rem)"
        v-model:value="records"
        rowGroupMode="subheader"
        groupRowsBy="subdivisionTotalJobCount"
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
                  {{ selectBranch?.name ? `${selectBranch.name} | ` : '' }}
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

        <Column header="Код роботи" field="code" class="min-w-[12rem]" />

        <Column header="Назва роботи" field="name" class="min-w-[12rem]" />

        <Column header="Структурний підрозділ" field="subdivision" class="min-w-[12rem]" />

        <Column
          header="Кількість робіт"
          field="totalJobCount"
          class="min-w-[12rem]"
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

        <Column header="subdivisionTotalJobCount" field="subdivisionTotalJobCount" />

        <template #groupheader="slotProps">
          <div class="flex items-center gap-2">
            <span class="uppercase text-primary">Структурний підрозділ:</span>
            <span>{{ slotProps.data.subdivision }}</span>
          </div>
        </template>

        <template #groupfooter="slotProps">
          <div class="flex flex-col">
            <p>Виконано {{ slotProps.data.subdivisionTotalJobCount }} робіт</p>
            <p>Сумарна вартісь {{ slotProps.data.subdivisionTotalPrice }} грн.</p>
          </div>
        </template>

        <ColumnGroup type="footer" v-if="records.length">
          <Row>
            <Column
              :footer="records.length"
              style="text-align: center"
              class="!text-xs !text-muted-color"
            />
            <Column :colspan="3" footer="Разом:" class="uppercase" style="text-align: end" />
            <Column :colspan="1" :footer="totalJobCountAll" style="text-align: center" />
            <Column :colspan="2" :footer="totalPriceAll" style="text-align: center" />
          </Row>
        </ColumnGroup>
      </DataTable>
    </div>

    <Tabs scrollable showNavigators lazy v-model:value="branch">
      <TabList>
        <Tab v-for="tab in branches" :key="tab.id" :value="tab.id">
          {{ tab.name }}
        </Tab>
      </TabList>
    </Tabs>
  </div>
</template>
