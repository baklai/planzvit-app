<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';

import { useBranch } from '@/stores/api/branches';
import { useDepartment } from '@/stores/api/departments';

const toast = useToast();

const Department = useDepartment();
const Branch = useBranch();

const loading = ref(false);
const datepiker = ref();
const records = ref([]);
const departments = ref([]);
const branches = ref([]);

const activeTab = ref(0);

onMounted(async () => {
  try {
    const { docs } = await Branch.findAll({ offset: 0, limit: 1000 });

    branches.value = docs;
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
    <div class="h-full">
      <DataTable
        lazy
        rowHover
        scrollable
        dataKey="id"
        showGridlines
        alwaysShowPaginator
        scrollHeight="flex"
        responsiveLayout="scroll"
        columnResizeMode="expand"
        :loading="loading"
        style="height: calc(100vh - 18rem)"
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
                  <!-- {{ department?.name ? `${department.name} - ` : '' }} -->
                  <span>Акт здавання-приймання послуг</span>
                  <!-- {{ datepiker ? `за ${dateToMonthStr(datepiker)}` : '' }} -->
                </h3>
                <p class="text-base font-normal text-surface-500">
                  Акт здавання-приймання послуг, який надаються підрозділом
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
              <Button class="m-auto my-4 w-max" label="Створити звіт" />
            </div>
          </div>
        </template>

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

        <Column field="previousMonthJobCount" style="width: 10%; text-align: center"> </Column>

        <Column field="currentMonthJobChanges" style="width: 10%; text-align: center"> </Column>

        <Column field="currentMonthJobCount" style="width: 10%; text-align: center"> </Column>
      </DataTable>
    </div>

    <Tabs scrollable showNavigators v-model="activeTab" @update:value="value => console.log(value)">
      <TabList>
        <Tab v-for="tab in branches" :key="tab.id" :value="tab.id">
          {{ tab.name }}
        </Tab>
      </TabList>
    </Tabs>
  </div>
</template>
