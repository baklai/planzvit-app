<script setup lang="jsx">
import { ref } from 'vue';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';

import AppDataTable from '@/components/AppDataTable.vue';
import OptionsMenu from '@/components/menus/OptionsMenu.vue';
import ServiceModal from '@/components/modals/ServiceModal.vue';

import { useService } from '@/stores/api/services';

const { findAll, removeOne } = useService();

const refMenu = ref();
const refModal = ref();
const refDataTable = ref();

const globalFilter = ref({
  field: 'name',
  matchMode: FilterMatchMode.STARTS_WITH,
  placeholder: 'Пошук за назвою системи'
});

const columns = ref([
  {
    header: { text: 'Код сервісу', width: '10rem' },
    column: {
      field: 'code',
      render(value) {
        return <span>{value}</span>;
      }
    },
    sorter: { field: 'code' },
    filter: {
      field: 'code',
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
      filterOperator: FilterOperator.AND,
      showFilterMatchModes: true
    },
    selectable: true,
    exportable: true,
    filtrable: true,
    sortable: true,
    frozen: false
  },

  {
    header: { text: 'Назва сервісу', width: '20rem' },
    column: {
      field: 'name',
      render(value) {
        return <span>{value}</span>;
      }
    },
    sorter: { field: 'name' },
    filter: {
      field: 'name',
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
      filterOperator: FilterOperator.AND,
      showFilterMatchModes: true
    },
    selectable: true,
    exportable: true,
    filtrable: true,
    sortable: true,
    frozen: false
  },

  {
    header: { text: 'Вартість підтримки (грн/шт)', width: '20rem' },
    column: {
      field: 'price',
      render(value) {
        return (
          <Tag
            class={['!min-w-[3rem]', '!text-base', '!font-bold', '!text-white', '!bg-green-500/20']}
            value={value || '-'}
          />
        );
      }
    },
    sorter: { field: 'price' },
    filter: {
      field: 'price',
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
      filterOperator: FilterOperator.AND,
      showFilterMatchModes: true
    },
    selectable: true,
    exportable: true,
    filtrable: true,
    sortable: true,
    frozen: false
  }
]);
</script>

<template>
  <div class="flex h-full w-full">
    <OptionsMenu
      ref="refMenu"
      @view="data => refModal.toggle(data)"
      @create="data => refModal.toggle(data)"
      @update="data => refModal.toggle(data)"
      @delete="data => refDataTable.delete(data)"
    />

    <ServiceModal ref="refModal" @close="() => refDataTable.update({})" />

    <AppDataTable
      ref="refDataTable"
      :columns="columns"
      :globalFilter="globalFilter"
      :storageKey="`app-datatable-${$route.name}`"
      :exportFileName="$route.name"
      :onUpdate="findAll"
      :onDelete="removeOne"
      @toggle-menu="(event, data) => refMenu.toggle(event, data)"
      @toggle-modal="data => refModal.toggle(data)"
    >
      <template #icon>
        <i class="pi pi-file-excel mx-2 hidden sm:block" style="font-size: 2.5rem" />
      </template>
      <template #title>
        {{ $route?.meta?.title }}
      </template>
      <template #subtitle>
        {{ $route?.meta?.description }}
      </template>
    </AppDataTable>
  </div>
</template>
