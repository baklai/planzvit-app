<script setup>
import { ref, watch } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import { useBranch } from '@/stores/api/branches';

const toast = useToast();
const confirm = useConfirm();

const { findOne, createOne, updateOne, removeOne } = useBranch();

const { values, errors, handleSubmit, controlledValues, setValues, resetForm, defineField } =
  useForm({
    validationSchema: yup.object({
      name: yup.string().required('Потрібно вказати значення'),
      description: yup.string().required('Потрібно вказати значення')
    }),
    initialValues: {}
  });

const emits = defineEmits(['close']);

const subdivisions = ref([]);

defineExpose({
  toggle: async ({ id }) => {
    try {
      if (id) {
        const data = await findOne({ id });
        subdivisions.value = data.subdivisions;
        setValues({ id: data.id, name: data.name, description: data.description });
      } else {
        subdivisions.value = [];
      }

      visible.value = true;
    } catch (err) {
      visible.value = false;
    }
  }
});

const visible = ref(false);
const loading = ref(false);

const refMenu = ref();
const options = ref([
  {
    label: 'Створити запис',
    icon: 'pi pi-plus-circle',
    command: async () => await onCreateRecord()
  },
  {
    label: 'Зберегти запис',
    icon: 'pi pi-save',
    command: async () => await onSaveRecord()
  },
  {
    label: 'Видалити запис',
    icon: 'pi pi-trash',
    command: async () => await onRemoveRecord()
  }
]);

const [name, nameAttrs] = defineField('name');
const [description, descriptionAttrs] = defineField('description');

const onCellEditComplete = event => {
  const { data, newValue, field } = event;

  try {
    data[field] = newValue;
  } catch (err) {
    event.preventDefault();
  }
};

const onCellRemoveComplete = event => {
  subdivisions.value = subdivisions.value.filter(
    value => value.name !== event.name && value.description !== event.description
  );
};

const onCreateRecord = async () => {
  resetForm({ values: {} }, { force: true });
  subdivisions.value = [];
  toast.add({
    severity: 'success',
    summary: 'Інформація',
    detail: 'Введіть новий запис',
    life: 5000
  });
};

const onRemoveRecord = async () => {
  try {
    loading.value = true;

    if (!values?.id) {
      return toast.add({
        severity: 'warn',
        summary: 'Попередження',
        detail: 'Запис не вибрано',
        life: 5000
      });
    }

    confirm.require({
      message: 'Ви бажаєте видалити цей запис?',
      header: 'Підтвердити видалення запису',
      icon: 'pi pi-question',
      acceptIcon: 'pi pi-check',
      acceptClass: '',
      rejectIcon: 'pi pi-times',
      accept: async () => {
        try {
          await removeOne(values);
          subdivisions.value = [];
          toast.add({
            severity: 'success',
            summary: 'Інформація',
            detail: 'Запис видалено',
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
          visible.value = false;
        }
      },
      reject: () => {
        toast.add({
          severity: 'info',
          summary: 'Інформація',
          detail: 'Видалення запису не підтверджено',
          life: 5000
        });
      }
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
};

const onSaveRecord = handleSubmit(async values => {
  try {
    loading.value = true;

    const sanitizeSubdivisions = subdivisions => {
      return subdivisions.map(({ createdAt, updatedAt, id, ...rest }) => rest);
    };

    if (values?.id) {
      await updateOne(values.id, {
        ...controlledValues.value,
        subdivisions: sanitizeSubdivisions(subdivisions.value)
      });
    } else {
      await createOne({
        ...controlledValues.value,
        subdivisions: sanitizeSubdivisions(subdivisions.value)
      });
    }
    toast.add({
      severity: 'success',
      summary: 'Інформація',
      detail: values?.id ? 'Запис оновлено' : 'Запис створено',
      life: 5000
    });
    visible.value = false;
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
});

const onCloseModal = async () => {
  resetForm({ values: {} }, { force: true });
  loading.value = false;
  emits('close', {});
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
    :draggable="false"
    v-model:visible="visible"
    class="mx-auto w-[90vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] 2xl:w-[40vw]"
    @hide="onCloseModal"
  >
    <template #header>
      <div class="flex w-full justify-between">
        <div class="flex items-center justify-center">
          <Avatar icon="pi pi-file" class="mr-4" size="large" />
          <div>
            <p class="line-height-2 text-lg font-bold">Відділ підрозділу</p>
            <p class="line-height-2 text-base font-normal text-surface-500">
              {{ values?.id ? 'Редагуваня обраного запису' : 'Створення нового запису' }}
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
          />
        </div>
      </div>
    </template>

    <ProgressBar mode="indeterminate" style="height: 6px" v-if="loading" />

    <form class="flex flex-col gap-y-4 md:flex-row md:flex-wrap" @submit.prevent="onSaveRecord">
      <div class="flex flex-col space-y-4 md:w-1/2 md:pr-2">
        <div class="flex flex-col gap-2">
          <label for="name" class="font-bold"> Назва служби (філії) </label>
          <InputText
            id="name"
            v-model="name"
            v-bind="nameAttrs"
            placeholder="Назва служби (філії)"
            :invalid="!!errors?.name"
            aria-describedby="name-help"
          />
          <small id="name-help" class="text-red-500" v-if="errors?.name">
            {{ errors.name }}
          </small>
        </div>
      </div>

      <div class="flex flex-col space-y-4 md:w-1/2 md:pr-2">
        <div class="flex flex-col gap-2">
          <label for="description" class="font-bold"> Повна назва служби (філії) </label>
          <InputText
            id="description"
            v-model="description"
            v-bind="descriptionAttrs"
            placeholder="Повна назва служби (філії)"
            :invalid="!!errors?.description"
            aria-describedby="description-help"
          />
          <small id="description-help" class="text-red-500" v-if="errors?.description">
            {{ errors.description }}
          </small>
        </div>
      </div>

      <div class="flex w-full flex-col space-y-4">
        <DataTable
          id="subdivisions"
          scrollable
          showGridlines
          editMode="cell"
          scrollHeight="300px"
          v-model:value="subdivisions"
          @cell-edit-complete="onCellEditComplete"
        >
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-4">
              <label for="subdivisions" class="font-semibold uppercase">
                Перелік структурних підрозділів
              </label>
              <Button
                rounded
                size="large"
                variant="text"
                severity="secondary"
                icon="pi pi-plus-circle text-primary"
                v-tooltip.bottom="'Додати запис'"
                @click="subdivisions.push({ name: '', description: '' })"
              />
            </div>
          </template>

          <Column header="#" headerStyle="width:3rem">
            <template #body="slotProps">
              {{ slotProps.index + 1 }}
            </template>
          </Column>

          <Column field="name" header="Назва підрозділу" style="width: 35%">
            <template #editor="{ data, field }">
              <InputText v-model="data[field]" autofocus fluid />
            </template>
          </Column>

          <Column field="description" header="Опис підрозділу">
            <template #editor="{ data, field }">
              <InputText v-model="data[field]" autofocus fluid />
            </template>
          </Column>

          <Column style="width: 1rem">
            <template #body="slotProps">
              <Button
                rounded
                variant="text"
                severity="danger"
                icon="pi pi-trash"
                @click="onCellRemoveComplete(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </form>

    <template #footer>
      <Button
        severity="secondary"
        icon="pi pi-times"
        label="Скасувати"
        :disabled="loading"
        @click="visible = false"
      />

      <Button
        severity="success"
        :icon="loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
        label="Зберегти"
        :disabled="loading"
        @click="onSaveRecord"
      />
    </template>
  </Dialog>
</template>
