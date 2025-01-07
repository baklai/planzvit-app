<script setup lang="jsx">
import { ref } from 'vue';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';

import AppDataTable from '@/components/AppDataTable.vue';
import OptionsMenu from '@/components/menus/OptionsMenu.vue';
import BranchModal from '@/components/modals/BranchModal.vue';

import { useBranch } from '@/stores/api/branches';

const { findAll, removeOne } = useBranch();

const refMenu = ref();
const refModal = ref();
const refDataTable = ref();

const globalFilter = ref({
  field: 'name',
  matchMode: FilterMatchMode.STARTS_WITH,
  placeholder: 'Пошук за назвою служби (філії)'
});

const columns = ref([
  {
    header: { text: 'Назва служби (філії)', width: '12rem' },
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
    header: { text: 'Повна назва служби (філії)', width: '20rem' },
    column: {
      field: 'description',
      render(value) {
        return <span>{value}</span>;
      }
    },
    sorter: { field: 'description' },
    filter: {
      field: 'description',
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
    header: { text: 'Кількість підрозділів', width: '10rem' },
    column: {
      field: 'subdivisions',
      render(value) {
        return (
          <Tag
            class={[
              '!min-w-[3rem]',
              '!text-base',
              '!font-semibold',
              '!text-white',
              '!bg-green-500/20'
            ]}
            value={value?.length || '-'}
          />
        );
      }
    },
    sorter: { field: 'subdivisions' },
    filter: {
      field: 'subdivisions',
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

    <BranchModal ref="refModal" @close="() => refDataTable.update({})" />

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
