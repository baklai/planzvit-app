<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import { useDepartment } from '@/stores/api/departments';

const toast = useToast();
const confirm = useConfirm();

const Department = useDepartment();

defineExpose({
  toggle: async () => {
    try {
      const { docs } = await Department.findAll({ offset: 0, limit: 100 });

      departments.value = docs;

      visible.value = true;
    } catch (err) {
      visible.value = false;
    }
  }
});

const report = ref();
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

const onGenerateReport = async event => {
  try {
    // report.value = await Report.findOne({ id: event.id });
  } catch (err) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: err.message,
      life: 5000
    });
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
    class="mx-auto w-[90vw] md:w-[80vw] lg:w-[60vw] xl:w-[50vw] 2xl:w-[30vw]"
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

    <ProgressBar mode="indeterminate" style="height: 6px" v-if="loading" />

    <div v-if="!report" class="flex flex-col gap-2">
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

    <form
      class="flex flex-col gap-y-4 md:flex-row md:flex-wrap"
      @submit.prevent="onSaveRecord"
      v-if="report"
    ></form>

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
