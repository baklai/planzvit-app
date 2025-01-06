<script setup lang="jsx">
import { ref } from 'vue';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import { dateTimeToStr } from '@/service/DataFilters';
import { useSyslog } from '@/stores/api/syslogs';

const toast = useToast();
const confirm = useConfirm();

const { findAll, removeOne, removeAll } = useSyslog();

const refMenu = ref();
const refDataTable = ref();

const globalFilter = ref({
  field: 'host',
  matchMode: FilterMatchMode.CONTAINS,
  placeholder: 'Пошук за IP-адресою'
});

const columns = ref([
  {
    header: { text: 'IP-адреса', width: '12rem' },
    column: {
      field: 'host',
      render(value) {
        return (
          <Tag class="!bg-surface-500/20 px-6 !text-base !font-normal !text-white" value={value} />
        );
      }
    },
    sorter: { field: 'host' },
    filter: {
      field: 'host',
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
      filterOperator: FilterOperator.AND,
      showFilterMatchModes: true
    },
    selectable: true,
    exportable: true,
    filtrable: true,
    sortable: true,
    frozen: true
  },

  {
    header: { text: 'Дата і час', width: '12rem' },
    column: {
      field: 'createdAt',
      render(value) {
        return <span>{dateTimeToStr(value) || '-'}</span>;
      }
    },
    sorter: { field: 'createdAt' },
    filter: {
      field: 'createdAt',
      value: null,
      matchMode: FilterMatchMode.DATE_IS
    },
    selectable: true,
    exportable: true,
    filtrable: true,
    sortable: true,
    frozen: false
  },

  {
    header: { text: 'Користувач', width: '12rem' },
    column: {
      field: 'profile',
      render(value) {
        return (
          <Tag class="!bg-surface-500/20 px-6 !text-base !font-normal !text-white" value={value} />
        );
      }
    },
    sorter: { field: 'profile' },
    filter: {
      field: 'profile',
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
      filterOperator: FilterOperator.AND,
      showFilterMatchModes: true
    },
    selectable: true,
    exportable: true,
    filtrable: true,
    sortable: true,
    frozen: true
  },

  {
    header: { text: 'Метод', width: '10rem' },
    column: {
      field: 'method',
      render(value) {
        return (
          <Tag
            class={[
              { 'bg-gray-500/80': value },
              { '!bg-blue-500/80': value.toUpperCase() === 'GET' },
              { '!bg-green-500/80': value.toUpperCase() === 'POST' },
              {
                '!bg-orange-500/80':
                  value.toUpperCase() === 'PUT' || value.toUpperCase() === 'PUTCH'
              },
              { '!bg-red-500/80': value.toUpperCase() === 'DELETE' },

              '!w-24 !rounded px-2 !text-base !font-semibold !text-white'
            ]}
            value={value}
          />
        );
      }
    },
    sorter: { field: 'method' },
    filter: {
      field: 'method',
      value: null,
      matchMode: FilterMatchMode.CONTAINS
    },
    selectable: true,
    exportable: true,
    filtrable: true,
    sortable: true,
    frozen: false
  },

  {
    header: { text: 'Статус', width: '10rem' },
    column: {
      field: 'status',
      render(value) {
        return (
          <Tag
            class={[
              { '!text-blue-500': value < 200 },
              { '!text-green-500': value >= 200 && value < 300 },
              { '!text-gray-500': value >= 300 && value < 400 },
              { '!text-orange-500': value >= 400 && value < 500 },
              { '!text-red-500': value >= 500 },

              '!rounded px-6 !text-base !font-bold',
              '!bg-surface-500/20'
            ]}
            value={value}
          />
        );
      }
    },
    sorter: { field: 'status' },
    selectable: true,
    exportable: true,
    filtrable: false,
    sortable: true,
    frozen: false
  },

  {
    header: { text: 'URL-адреса', width: '20rem' },
    column: {
      field: 'baseUrl',
      render(value) {
        return <span>{value}</span>;
      }
    },
    sorter: { field: 'baseUrl' },
    filter: {
      field: 'baseUrl',
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
    header: { text: 'Агент користувача', width: '30rem' },
    column: {
      field: 'userAgent',
      render(value) {
        return <span>{value}</span>;
      }
    },
    sorter: { field: 'userAgent' },
    filter: {
      field: 'userAgent',
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

const confirmDeleteAll = () => {
  confirm.require({
    message: 'Ви бажаєте видалити всі записи?',
    header: 'Підтвердження видалення записів',
    icon: 'pi pi-question',
    acceptIcon: 'pi pi-check',
    acceptClass: '',
    rejectIcon: 'pi pi-times',
    accept: async () => {
      await removeAll({});
      await refDataTable.value.update({});
      toast.add({
        severity: 'success',
        summary: 'Інформація',
        detail: 'Всі записи видалено',
        life: 3000
      });
    },
    reject: () => {
      toast.add({
        severity: 'info',
        summary: 'Інформація',
        detail: 'Видалення записів не підтверджено',
        life: 3000
      });
    }
  });
};
</script>

<template>
  <div class="flex h-full w-full">
    <OptionsMenu
      ref="refMenu"
      @view="data => false"
      @create="data => false"
      @update="data => false"
      @delete="data => refDataTable.delete(data)"
    />

    <AppDataTable
      ref="refDataTable"
      :columns="columns"
      :globalFilter="globalFilter"
      :storageKey="`app-datatable-${$route.name}`"
      :exportFileName="$route.name"
      :onUpdate="findAll"
      :onDelete="removeOne"
      @toggle-menu="(event, data) => refMenu.toggle(event, data)"
      @toggle-modal="data => false"
    >
      <template #icon>
        <i class="mr-2 hidden sm:block">
          <i class="pi pi-arrow-right-arrow-left mx-2 hidden text-4xl sm:block" />
        </i>
      </template>

      <template #title>
        {{ $route?.meta?.title }}
      </template>

      <template #subtitle>
        {{ $route?.meta?.description }}
      </template>

      <template #actions>
        <Button
          size="large"
          variant="text"
          severity="secondary"
          icon="pi pi-trash"
          v-tooltip.bottom="'Видалити записи'"
          @click="confirmDeleteAll"
        />
      </template>
    </AppDataTable>
  </div>
</template>
