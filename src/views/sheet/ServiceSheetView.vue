<script setup lang="jsx">
import { ref, computed, watchEffect, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';

import AppLoading from '@/components/AppLoading.vue';

import { useService } from '@/stores/api/services';
import { dateToMonthStr } from '@/service/DataFilters.js';

const toast = useToast();

const Service = useService();

const records = ref([]);

const loading = ref(false);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const onUpdateRecords = async () => {
  try {
    loading.value = true;

    const { docs } = await Service.findAll({
      offset: 0,
      limit: 1000
    });

    records.value = docs;
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
    await Service.updateOne(data['id'], {
      price: data[field]
    });
  } catch (err) {
    event.preventDefault();
  }
};

onMounted(async () => {
  try {
    await onUpdateRecords();
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
      responsiveLayout="scroll"
      columnResizeMode="expand"
      :loading="loading"
      editMode="cell"
      style="height: calc(100vh - 12rem)"
      v-model:value="records"
      v-model:filters="filters"
      :virtualScrollerOptions="{ itemSize: 46 }"
      :globalFilterFields="['code', 'name']"
      @cell-edit-complete="onCellEditComplete"
      tableStyle="min-width: 50rem"
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

          <div class="flex w-full flex-wrap items-center justify-between sm:w-max">
            <FloatLabel variant="in" v-if="filters['global']">
              <IconField>
                <InputIcon class="pi pi-search" />
                <InputText
                  id="in_search"
                  v-model="filters['global'].value"
                  autocomplete="off"
                  variant="filled"
                />
                <InputIcon
                  class="pi pi-times cursor-pointer"
                  v-tooltip.bottom="'Очистити фільтр'"
                  @click="filters['global'].value = null"
                />
              </IconField>
              <label for="in_search">Пошук за кодом та назвою</label>
            </FloatLabel>
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
              icon="pi pi-filter-slash text-sm"
              class="m-auto my-4 w-max"
              label="Очистити фільтри"
              @click="filters['global'].value = null"
            />
          </div>
        </div>
      </template>

      <Column
        frozen
        header="#"
        :reorderableColumn="false"
        style="width: 3rem !important; text-align: center"
        :pt="{ columntitle: { class: ['m-auto'] } }"
      >
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column
        header="Код сервісу"
        field="code"
        style="width: 15rem"
        :pt="{ columntitle: { class: ['m-auto'] } }"
      >
        <template #body="{ data, field }">
          <div class="w-full text-center">
            <Tag severity="secondary" class="min-w-[10rem]" :value="data[field]" />
          </div>
        </template>
      </Column>

      <Column
        field="price"
        header="Вартість підтримки (грн)"
        style="width: 20rem; text-align: center"
        :pt="{ columntitle: { class: ['m-auto'] } }"
      >
        <template #body="{ data, field }">
          <span v-if="data[field] !== 0">
            <Tag
              :severity="data[field] > 0 ? 'success' : 'warn'"
              :value="data[field]"
              class="min-w-[4rem] !text-lg"
            />
          </span>
          <span v-else>
            <Tag severity="secondary" class="min-w-[4rem]" :value="data[field] || 0" />
          </span>
        </template>

        <template #editor="{ data, field }">
          <InputNumber
            fluid
            autofocus
            variant="filled"
            v-model="data[field]"
            inputId="locale-user"
            :maxFractionDigits="2"
            inputClass="!text-center !text-xl"
          />
        </template>
      </Column>

      <Column header="Назва сервісу" field="name" style="max-width: 50rem">
        <template #body="{ data, field }">
          <div class="overflow-hidden text-ellipsis whitespace-nowrap px-2">
            <span>{{ data[field] }}</span>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
