<script setup lang="jsx">
import { FilterMatchMode } from '@primevue/core/api';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, inject, onMounted, ref, watchEffect } from 'vue';

import AppLoading from '@/components/AppLoading.vue';

import { dateToMonthStr } from '@/service/DataFilters';
import { getObjField } from '@/service/ObjectMethods';
import { departmentJobsReport } from '@/service/ReportsSheetToXlsx';
import { useReport } from '@/stores/api/reports';

const toast = useToast();
const confirm = useConfirm();

const $planzvit = inject('planzvit');

const Report = useReport();

const records = ref([]);
const datepiker = ref(new Date());
const department = ref();
const departments = ref([]);
const services = ref([]);
const branches = ref([]);
const subdivisions = ref([]);

const loading = ref(false);

const exportmenu = ref();
const exportmenuitems = ref([
  {
    label: 'Експорт звітів',
    items: [
      {
        label: 'Щомісячний звіт',
        icon: 'pi pi-download',
        command: () => onExportToExcel()
      },

      {
        label: 'Щомісячний оптзвіт',
        icon: 'pi pi-download',
        command: () => onExportToExcel(true)
      }
    ]
  },

  {
    label: 'Генерація звітів',
    items: [
      {
        label: 'Оновити щомісячний звіт',
        icon: 'pi pi-replay',
        disabled: !$planzvit?.isAdministrator,
        command: () => onCreateReport()
      },
      {
        label: 'Створити щомісячний звіт',
        icon: 'pi pi-sparkles',
        disabled: !$planzvit?.isAdministrator,
        command: () => onCreateReport()
      }
    ]
  },

  {
    label: 'Закриття/відкриття звітів',
    items: [
      {
        label: 'Закрити поточний звіт',
        icon: 'pi pi-lock',
        disabled: !$planzvit?.isAdministrator,
        command: () => onClosedReport(true)
      },
      {
        label: 'Відкрити поточний звіт',
        icon: 'pi pi-lock-open',
        disabled: !$planzvit?.isAdministrator,
        command: () => onClosedReport(false)
      }
    ]
  },

  {
    label: 'Видалення звітів',
    items: [
      {
        label: 'Видалити поточний звіт',
        icon: 'pi pi-trash',
        disabled: !$planzvit?.isAdministrator,
        command: () => onDeleteReport()
      }
    ]
  }
]);

const filters = ref({
  'service.code': { value: null, matchMode: FilterMatchMode.IN },
  'service.name': { value: null, matchMode: FilterMatchMode.IN },
  'branch.name': { value: null, matchMode: FilterMatchMode.IN },
  'subdivision.name': { value: null, matchMode: FilterMatchMode.IN }
});

const previousJobCountAll = computed(() => {
  return records.value.reduce((sum, item) => sum + item.previousJobCount, 0);
});

const changesJobCountAll = computed(() => {
  return records.value.reduce((sum, item) => sum + item.changesJobCount, 0);
});

const currentJobCountAll = computed(() => {
  return records.value.reduce((sum, item) => sum + item.currentJobCount, 0);
});

const toggle = event => {
  exportmenu.value.toggle(event);
};

const onUpdateRecords = async () => {
  if (!department.value || !datepiker.value) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Оберіть місяць, рік та відділ',
      life: 5000
    });

    return;
  }

  try {
    loading.value = true;

    records.value = await Report.findAll(department.value.id, {});
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

const onCellEditComplete = async event => {
  const { data, newValue, field } = event;

  try {
    const { previousJobCount, changesJobCount, currentJobCount } = await Report.updateOne(
      data['id'],
      { changesJobCount: newValue }
    );

    data['previousJobCount'] = previousJobCount;
    data['changesJobCount'] = changesJobCount;
    data['currentJobCount'] = currentJobCount;
  } catch (err) {
    event.preventDefault();

    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Не вдалося оновити запис',
      life: 5000
    });
  }
};

const onExportToExcel = async (optimized = false) => {
  if (!department.value || !datepiker.value) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Оберіть місяць, рік та відділ',
      life: 5000
    });

    return;
  }

  loading.value = true;

  try {
    const records = await Report.findAll(department.value.id, {})
      .then(items =>
        items.filter(item => {
          if (!optimized) return true;

          return (
            item.previousJobCount !== 0 || item.changesJobCount !== 0 || item.currentJobCount !== 0
          );
        })
      )
      .then(items =>
        items.map(item => {
          return {
            code: item.service.code,
            name: item.service.name,
            branch: item.branch.name,
            subdivision: item.subdivision.name,
            previousJobCount: item?.previousJobCount || 0,
            changesJobCount: item?.changesJobCount || 0,
            currentJobCount: item?.currentJobCount || 0
          };
        })
      );

    const buffer = await departmentJobsReport(
      [{ department: { ...department.value }, records }],
      datepiker.value
    );

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const objectURL = URL.createObjectURL(blob);

    const aLink = document.createElement('a');
    aLink.href = objectURL;
    aLink.download = `${department.value.name} Щомісячний звіт за ${dateToMonthStr(datepiker.value)}.xlsx`;
    aLink.click();

    URL.revokeObjectURL(objectURL);
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

const onCreateReport = async () => {
  if (!department.value || !datepiker.value) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Оберіть місяць, рік та відділ',
      life: 5000
    });

    return;
  }

  try {
    loading.value = true;

    confirm.require({
      message: 'Ви бажаєте створити/оновити цей щомісячний звіт?',
      header: 'Підтвердити зміну щомісячного звіту',
      icon: 'pi pi-question',
      acceptIcon: 'pi pi-check',
      acceptClass: '',
      rejectIcon: 'pi pi-times',
      accept: async () => {
        try {
          await Report.createOne(department.value.id, {});

          await onUpdateRecords();

          toast.add({
            severity: 'success',
            summary: 'Інформація',
            detail: 'Щомісячний звіт створено/оновлено',
            life: 5000
          });
        } catch (err) {
          toast.add({
            severity: 'warn',
            summary: 'Попередження',
            detail: 'Запис не видалено',
            life: 5000
          });
        } finally {
          loading.value = false;
        }
      },
      reject: async () => {
        loading.value = false;
        await onUpdateRecords();
        toast.add({
          severity: 'info',
          summary: 'Інформація',
          detail: 'Зміну щомісячного звіту не підтверджено',
          life: 5000
        });
      }
    });
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

const onClosedReport = async (completed = false) => {
  if (!department.value || !datepiker.value) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Оберіть місяць, рік та відділ',
      life: 5000
    });

    return;
  }

  try {
    loading.value = true;

    confirm.require({
      message: `Ви бажаєте ${completed ? 'закрити' : 'відкрити'} цей щомісячний звіт?`,
      header: 'Підтвердити зміну статусу щомісячного звіту',
      icon: 'pi pi-question',
      acceptIcon: 'pi pi-check',
      acceptClass: '',
      rejectIcon: 'pi pi-times',
      accept: async () => {
        try {
          await Report.updateStatusOne(department.value.id, {
            completed: completed
          });

          toast.add({
            severity: 'success',
            summary: 'Інформація',
            detail: `Щомісячний звіт ${completed ? 'закрито' : 'відкрито'} на редагування`,
            life: 5000
          });
        } catch (err) {
          toast.add({
            severity: 'warn',
            summary: 'Попередження',
            detail: 'Статус не оновлено',
            life: 5000
          });
        } finally {
          await onUpdateRecords();
          loading.value = false;
        }
      },
      reject: async () => {
        loading.value = false;
        await onUpdateRecords();
        toast.add({
          severity: 'info',
          summary: 'Інформація',
          detail: 'Зміну статусу щомісячного звіту не підтверджено',
          life: 5000
        });
      }
    });
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

const onDeleteReport = async () => {
  if (!department.value || !datepiker.value) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Оберіть місяць, рік та відділ',
      life: 5000
    });

    return;
  }

  try {
    loading.value = true;

    confirm.require({
      message: 'Ви бажаєте видалити цей щомісячний звіт?',
      header: 'Підтвердити видалення щомісячного звіту',
      icon: 'pi pi-question',
      acceptIcon: 'pi pi-check',
      acceptClass: '',
      rejectIcon: 'pi pi-times',
      accept: async () => {
        try {
          await Report.removeOne(department.value.id, {});

          await onUpdateRecords();

          toast.add({
            severity: 'success',
            summary: 'Інформація',
            detail: 'Щомісячного звіт видалено',
            life: 5000
          });
        } catch (err) {
          toast.add({
            severity: 'warn',
            summary: 'Попередження',
            detail: 'Запис не видалено',
            life: 5000
          });
        } finally {
          loading.value = false;
        }
      },
      reject: async () => {
        loading.value = false;
        await onUpdateRecords();
        toast.add({
          severity: 'info',
          summary: 'Інформація',
          detail: 'Видалення щомісячного звіту не підтверджено',
          life: 5000
        });
      }
    });
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

watchEffect(async () => {
  if (department.value && datepiker.value) {
    await onUpdateRecords();
  }
});

onMounted(async () => {
  try {
    const collections = await Report.findCollecrions();

    departments.value = collections.deparments;
    services.value = collections.services;
    branches.value = collections.branches;
    subdivisions.value = collections.subdivisions;
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
      removableSort
      resizableColumns
      scrollHeight="flex"
      sortMode="multiple"
      responsiveLayout="scroll"
      columnResizeMode="expand"
      editMode="cell"
      filterDisplay="menu"
      :loading="loading"
      style="height: calc(100vh - 8rem)"
      v-model:value="records"
      v-model:filters="filters"
      :virtualScrollerOptions="{ itemSize: 46 }"
      @cell-edit-complete="onCellEditComplete"
      class="min-w-full overflow-x-auto text-base"
      :pt="{ mask: { class: ['!bg-transparent', 'dark:!bg-transparent'] } }"
    >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-1">
            <i class="pi pi-file-excel mr-2 hidden sm:block" style="font-size: 2.5rem" />
            <div class="flex flex-col">
              <h3 class="text-2xl font-normal">
                {{ department?.name ? `${department.name} - ` : '' }}
                <span>{{ $route?.meta?.title }}</span>
                {{ datepiker ? `за ${dateToMonthStr(datepiker)}` : '' }}
              </h3>
              <p class="text-base font-normal text-surface-500">
                {{ $route?.meta?.description }}
              </p>
            </div>
          </div>

          <div class="flex w-full flex-wrap items-center justify-between gap-x-4 sm:w-max">
            <FloatLabel class="w-[20rem]" variant="in">
              <Select
                inputId="department"
                v-model="department"
                variant="filled"
                :options="departments"
                optionLabel="name"
                class="w-full"
                :disabled="loading"
              />
              <label for="department">Оберіть відділ</label>
            </FloatLabel>

            <FloatLabel variant="in">
              <DatePicker
                inputId="datepiker"
                v-model="datepiker"
                view="month"
                showIcon
                iconDisplay="input"
                dateFormat="mm/yy"
                variant="filled"
                :disabled="loading"
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
          </div>
        </div>
      </template>

      <Column
        frozen
        header="#"
        :reorderableColumn="false"
        style="width: 3rem; text-align: center"
        :pt="{ columntitle: { class: ['m-auto'] } }"
      >
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column
        sortable
        header="Код роботи"
        field="service.code"
        filterField="service.code"
        style="width: 10%"
        :showFilterMatchModes="false"
        :filterMenuStyle="{ width: '20rem' }"
      >
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            @change="filterCallback()"
            v-model="filterModel.value"
            :options="services || []"
            optionLabel="code"
            optionValue="code"
            dataKey="id"
            placeholder="Код роботи"
            :maxSelectedLabels="1"
            filter
            display="chip"
            autoFilterFocus
            resetFilterOnHide
            filterMatchMode="contains"
            filterPlaceholder="Пошук у списку"
            :virtualScrollerOptions="{ itemSize: 32 }"
            class="w-full"
          >
            <template #option="slotProps">
              <div class="flex h-full items-center text-base">
                <span>{{ slotProps.option.code }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>

      <Column
        sortable
        header="Назва роботи"
        field="service.name"
        filterField="service.name"
        style="max-width: 20rem"
        :showFilterMatchModes="false"
        :filterMenuStyle="{ width: '20rem' }"
      >
        <template #body="{ data, field }">
          <div
            class="overflow-hidden text-ellipsis whitespace-nowrap px-2"
            v-tooltip.bottom="getObjField(data, field)"
          >
            <span>{{ getObjField(data, field) }}</span>
          </div>
        </template>

        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            @change="filterCallback()"
            v-model="filterModel.value"
            :options="services || []"
            optionLabel="name"
            optionValue="name"
            dataKey="id"
            placeholder="Назва роботи"
            :maxSelectedLabels="0"
            filter
            display="chip"
            autoFilterFocus
            resetFilterOnHide
            filterMatchMode="contains"
            filterPlaceholder="Пошук у списку"
            :virtualScrollerOptions="{ itemSize: 32 }"
            class="w-full"
          >
            <template #option="slotProps">
              <div class="flex h-full items-center text-base">
                <span>{{ slotProps.option.name }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>

      <Column
        sortable
        header="Служба/філія"
        field="branch.name"
        filterField="branch.name"
        style="width: 10%"
        :showFilterMatchModes="false"
        :filterMenuStyle="{ width: '20rem' }"
      >
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            @change="filterCallback()"
            v-model="filterModel.value"
            :options="branches || []"
            optionLabel="name"
            optionValue="name"
            dataKey="id"
            placeholder="Служба/філія"
            :maxSelectedLabels="0"
            filter
            display="chip"
            autoFilterFocus
            resetFilterOnHide
            filterMatchMode="contains"
            filterPlaceholder="Пошук у списку"
            :virtualScrollerOptions="{ itemSize: 32 }"
            class="w-full"
          >
            <template #option="slotProps">
              <div class="flex h-full items-center text-base">
                <span>{{ slotProps.option.name }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>

      <Column
        sortable
        header="Структурний підрозділ"
        field="subdivision.name"
        filterField="subdivision.name"
        style="width: 20%"
        :showFilterMatchModes="false"
        :filterMenuStyle="{ width: '20rem' }"
      >
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            @change="filterCallback()"
            v-model="filterModel.value"
            :options="subdivisions || []"
            optionLabel="name"
            optionValue="name"
            dataKey="id"
            placeholder="Структурний підрозділ"
            :maxSelectedLabels="0"
            filter
            display="chip"
            autoFilterFocus
            resetFilterOnHide
            filterMatchMode="contains"
            filterPlaceholder="Пошук у списку"
            :virtualScrollerOptions="{ itemSize: 32 }"
            class="w-full"
          >
            <template #option="slotProps">
              <div class="flex h-full items-center text-base">
                <span>{{ slotProps.option.name }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>

      <Column field="previousJobCount" style="width: 10%; text-align: center">
        <template #header>
          <div class="flex w-full flex-col text-center">
            <span>Кількість робіт</span>
            <span>за попередній місяць</span>
          </div>
        </template>
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

      <Column field="changesJobCount" style="width: 10%; text-align: center; cursor: pointer">
        <template #header>
          <div class="flex w-full flex-col text-center">
            <span>Кількість робіт</span>
            <span>Поточні зміни (+/-)</span>
          </div>
        </template>

        <template #body="{ data, field }">
          <span>{{ $data['completed'] }}</span>

          <i class="pi pi-lock text-muted-color" v-if="data['completed'] === true"></i>

          <div class="w-full" v-else>
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
          </div>
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
            :disabled="data['completed'] === true"
          />
        </template>
      </Column>

      <Column field="currentJobCount" style="width: 10%; text-align: center">
        <template #header>
          <div class="flex w-full flex-col text-center">
            <span>Кількість робіт</span>
            <span>за поточний місяць</span>
          </div>
        </template>
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

      <ColumnGroup type="footer" v-if="records.length">
        <Row>
          <Column
            :footer="records.length"
            style="text-align: center"
            class="!text-xs !text-muted-color"
          />
          <Column footer="Всього:" :colspan="4" footerStyle="text-align:right" />

          <Column style="width: 10%; text-align: center">
            <template #footer>
              <Tag severity="info" class="min-w-[4rem]" :value="previousJobCountAll" />
            </template>
          </Column>

          <Column style="width: 10%; text-align: center">
            <template #footer>
              <Tag severity="info" class="min-w-[4rem]" :value="changesJobCountAll" />
            </template>
          </Column>

          <Column style="width: 10%; text-align: center">
            <template #footer>
              <Tag severity="info" class="min-w-[4rem]" :value="currentJobCountAll" />
            </template>
          </Column>
        </Row>
      </ColumnGroup>
    </DataTable>
  </div>
</template>
