<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import { useReport } from '@/stores/api/reports';

const toast = useToast();
const confirm = useConfirm();

const { getDepartment, getDepartments, getBranches } = useReport();

defineExpose({
  toggle: async () => {
    try {
      departments.value = await getDepartments();

      visible.value = true;
    } catch (err) {
      visible.value = false;
    }
  }
});

const report = ref();
const branches = ref([]);
const services = ref([]);
const department = ref([]);
const departments = ref([]);

const visible = ref(false);
const loading = ref(false);

const refMenu = ref();
const options = ref([
  {
    label: 'Зберегти запис',
    icon: 'pi pi-save',
    command: async () => await onSaveRecord()
  }
]);

// const onGenerateReport = async event => {
//   try {
//     loading.value = true;

//     department.value = await getDepartment({ id: event.id });

//     branches.value = await getBranches();
//     services.value = department.value?.services || [];

//     const data = services.value.map(service => {
//       const data = branches.value.map(branch => {
//         const data = branch.subdivisions.map(subdivision => {
//           return {
//             service: { id: service.code, code: service.code, name: service.name },
//             branch: { id: branch.id, name: branch.name },
//             subdivision: { id: subdivision.id, name: subdivision.name },
//             countJobsPreviousMonth: 0,
//             countJobsCurrentMonth: 0,
//             totalCountOfJobs: 0
//           };
//         });
//         return [...data];
//       });
//       return [...data];
//     });

//     report.value = data.flat(Infinity);
//   } catch (err) {
//     toast.add({
//       severity: 'warn',
//       summary: 'Попередження',
//       detail: err.message,
//       life: 5000
//     });
//   } finally {
//     loading.value = false;
//   }
// };

const onGenerateReport = async event => {
  try {
    loading.value = true;

    department.value = await getDepartment({ id: event.id });
    branches.value = await getBranches();
    services.value = department.value?.services || [];

    const data = [];
    for (const service of services.value) {
      for (const branch of branches.value) {
        for (const subdivision of branch.subdivisions) {
          data.push({
            service: { id: service.code, code: service.code, name: service.name },
            branch: { id: branch.id, name: branch.name },
            subdivision: { id: subdivision.id, name: subdivision.name },
            countJobsPreviousMonth: 0,
            countJobsCurrentMonth: 0,
            totalCountOfJobs: 0
          });

          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
    }

    report.value = data;
  } catch (err) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: err.message,
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

const onCellEditComplete = event => {
  const { data, newValue, field } = event;

  try {
    data[field] = newValue;
  } catch (err) {
    event.preventDefault();
  }
};

const onSaveRecord = async values => {
  try {
    loading.value = true;

    // await Report.createOne({});

    toast.add({
      severity: 'success',
      summary: 'Інформація',
      detail: values?.id ? 'Запис оновлено' : 'Запис створено',
      life: 5000
    });
  } catch (err) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: values?.id ? 'Запис не оновлено' : 'Запис не створено',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

const onCloseModal = async () => {
  report.value = null;
  loading.value = false;
  departments.value = [];
};
</script>

<template>
  <Menu ref="refMenu" popup :model="options">
    <template #item="{ label, item, props }">
      <a :href="item.url" v-bind="props.action">
        <span v-bind="props.icon" />
        <span v-bind="props.label">{{ label }}</span>
      </a>
    </template>
  </Menu>

  <Dialog
    modal
    closable
    :maximizable="!!report"
    :draggable="false"
    v-model:visible="visible"
    :class="[
      'mx-auto w-[30rem]',
      {
        '!w-[90vw]': !!report
      }
    ]"
    @hide="onCloseModal"
  >
    <template #header>
      <div class="flex w-full justify-between">
        <div class="flex items-center justify-center">
          <Avatar icon="pi pi-file" class="mr-4" size="large" />
          <div>
            <p class="line-height-2 text-lg font-bold">Щомісячний звіт</p>
            <p class="line-height-2 text-base font-normal text-surface-500">
              Подання щомісячного звіту
            </p>
          </div>
        </div>

        <div class="flex items-center">
          <Button
            rounded
            variant="text"
            severity="secondary"
            icon="pi pi-ellipsis-v"
            v-tooltip.bottom="'Меню опцій'"
            @click="event => refMenu.toggle(event)"
            v-if="report"
          />
        </div>
      </div>
    </template>

    <div v-if="loading" class="flex h-full w-full flex-col justify-center text-center">
      <ProgressSpinner v-if="loading" />
      <p>Почекайте, щомісячний звіт готується...</p>
    </div>

    <div v-if="!report && !loading" class="flex flex-col gap-2">
      <Button
        variant="outlined"
        severity="secondary"
        v-for="item in departments"
        @click="() => onGenerateReport(item)"
      >
        <div class="flex flex-col gap-2">
          <p class="font-bold text-primary">{{ item.name }}</p>
          <p>{{ item.description }}</p>
        </div>
      </Button>
    </div>

    <DataTable
      id="report-table"
      showGridlines
      scrollable
      scrollHeight="flex"
      resizableColumns
      columnResizeMode="expand"
      v-model:value="report"
      class="text-lg"
      editMode="cell"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 15, 20, 50]"
      @cell-edit-complete="onCellEditComplete"
      v-if="report"
    >
      <Column frozen header="№" headerStyle="width:3rem">
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column field="service.code" header="Код роботи" style="width: 10%"></Column>
      <Column field="service.name" header="Назва системи" style="width: 30%"></Column>
      <Column field="branch.name" header="Служба (філія)" style="width: 10%"></Column>
      <Column field="subdivision.name" header="Структурний підрозділ" style="width: 20%"></Column>

      <Column
        field="countJobsPreviousMonth"
        header="Кількість робочих місць (робіт) - попередній місяць"
        style="width: 10%"
      ></Column>

      <Column
        field="countJobsCurrentMonth"
        header="Кількість нових робочих місць (робіт) за теперешній місяць"
        style="width: 10%"
      >
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" autofocus fluid />
        </template>
      </Column>

      <Column
        field="totalCountOfJobs"
        header="Кількість робочих місць (робіт) всього"
        style="width: 10%"
      ></Column>

      <!-- <ColumnGroup type="footer">
        <Row>
          <Column footer="Totals:" :colspan="3" footerStyle="text-align:right" />
          <Column :footer="lastYearTotal" />
          <Column :footer="thisYearTotal" />
        </Row>
      </ColumnGroup> -->

      <template #footer> In total there are {{ report ? report.length : 0 }} report. </template>
    </DataTable>

    <template #footer>
      <Button
        severity="secondary"
        icon="pi pi-times"
        label="Скасувати"
        :disabled="loading"
        @click="visible = false"
        v-if="report"
      />

      <Button
        severity="success"
        :icon="loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
        label="Зберегти"
        :disabled="loading"
        @click="onSaveRecord"
        v-if="report"
      />
    </template>
  </Dialog>
</template>
