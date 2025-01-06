<script setup lang="jsx">
import { ref } from 'vue';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';

import AppDataTable from '@/components/AppDataTable.vue';
import OptionsMenu from '@/components/menus/OptionsMenu.vue';
import ProfileModal from '@/components/modals/ProfileModal.vue';
import { useProfile } from '@/stores/api/profiles';

const { findAll, removeOne } = useProfile();

const refMenu = ref();
const refModal = ref();
const refDataTable = ref();

const globalFilter = ref({
  field: 'fullname',
  matchMode: FilterMatchMode.STARTS_WITH,
  placeholder: "Пошук за і'мям"
});

const columns = ref([
  {
    header: { text: "Повне і'мя", width: '20rem' },
    column: {
      field: 'fullname',
      render(value) {
        return <span>{value}</span>;
      }
    },
    sorter: { field: 'fullname' },
    filter: {
      field: 'fullname',
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
    header: { text: 'Електронна адреса', width: '20rem' },
    column: {
      field: 'email',
      render(value) {
        return <span>{value}</span>;
      }
    },
    sorter: { field: 'email' },
    filter: {
      field: 'email',
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
    header: { text: 'Номер телефону', width: '20rem' },
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
    header: { text: 'Статус профілю', width: '10rem' },
    column: {
      field: 'enabled',
      render(value) {
        return value ? <i class={'pi pi-check !font-bold text-green-500'}></i> : <span>-</span>;
      }
    },
    sorter: { field: 'enabled' },
    filter: {
      field: 'enabled',
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
    header: { text: 'Роль корстувача', width: '10rem' },
    column: {
      field: 'role',
      render(value) {
        return (
          <Tag
            class={['h-8 w-12 !text-base !font-semibold !text-white', '!bg-green-500/20']}
            value={value || '-'}
          />
        );
      }
    },
    sorter: { field: 'role' },
    filter: {
      field: 'role',
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

    <ProfileModal ref="refModal" @close="() => refDataTable.update({})" />

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
        <i class="pi pi-users mx-2 hidden text-4xl sm:block" />
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
