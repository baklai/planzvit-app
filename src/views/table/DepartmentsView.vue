<script setup lang="jsx">
import { ref } from 'vue';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';

import AppDataTable from '@/components/AppDataTable.vue';
import OptionsMenu from '@/components/menus/OptionsMenu.vue';
import DepartmentModal from '@/components/modals/DepartmentModal.vue';

import { useDepartment } from '@/stores/api/departments';

const { findAll, removeOne } = useDepartment();

const refMenu = ref();
const refModal = ref();
const refDataTable = ref();

const globalFilter = ref({
  field: 'name',
  matchMode: FilterMatchMode.STARTS_WITH,
  placeholder: 'Пошук за назвою відділу'
});

const columns = ref([
  {
    header: { text: 'Назва відділу', width: '16rem' },
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
    header: { text: 'Повна назва відділу', width: '13rem' },
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
    header: { text: 'Начальник відділу', width: '16rem' },
    column: {
      field: 'manager',
      render(value) {
        return <span>{value}</span>;
      }
    },
    sorter: { field: 'manager' },
    filter: {
      field: 'manager',
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
    header: { text: 'Номер телефону', width: '16rem' },
    column: {
      field: 'phone',
      render(value) {
        return <span>{value}</span>;
      }
    },
    sorter: { field: 'phone' },
    filter: {
      field: 'phone',
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
    header: { text: 'Кількість сервісів', width: '13rem' },
    column: {
      field: 'services',
      render(value) {
        return (
          <Tag
            class={['min-w-20', '!text-base', '!font-bold', '!text-white', '!bg-green-500/20']}
            value={value.length || '-'}
          />
        );
      }
    },
    sorter: { field: 'services' },
    filter: {
      field: 'services',
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
      filterOperator: FilterOperator.AND,
      showFilterMatchModes: true
    },
    selectable: true,
    exportable: true,
    filtrable: false,
    sortable: false,
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

    <DepartmentModal ref="refModal" @close="() => refDataTable.update({})" />

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
        <i class="pi pi-file-excel mx-2 hidden text-4xl sm:block" />
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
