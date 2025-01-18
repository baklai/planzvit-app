<script setup>
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { useForm } from 'vee-validate';
import { ref } from 'vue';
import * as yup from 'yup';

import { useBranch } from '@/stores/api/branches';
import { useSubdivision } from '@/stores/api/subdivisions';

const toast = useToast();
const confirm = useConfirm();

const { findOne, createOne, updateOne, removeOne } = useBranch();

const Subdivision = useSubdivision();

const { values, errors, handleSubmit, controlledValues, setValues, resetForm, defineField } =
  useForm({
    validationSchema: yup.object({
      name: yup.string().required('Потрібно вказати значення'),
      description: yup.string().required('Потрібно вказати значення')
    }),
    initialValues: {}
  });

const emits = defineEmits(['close']);

defineExpose({
  toggle: async ({ id }) => {
    try {
      if (id) {
        setValues(await findOne({ id }));
      }

      const { docs } = await Subdivision.findAll({ limit: 10000, offset: 0 });

      subdivisionList.value = docs;

      visible.value = true;
    } catch (err) {
      visible.value = false;
    }
  }
});

const visible = ref(false);
const loading = ref(false);

const subdivisionList = ref([]);

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
const [subdivisions, subdivisionsAttrs] = defineField('subdivisions');

const onCreateRecord = async () => {
  resetForm({ values: {} }, { force: true });

  toast.add({
    severity: 'success',
    summary: 'Інформація',
    detail: 'Введіть новий запис',
    life: 5000
  });
};

const onRemoveRecord = () => {
  if (!values?.id) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Запис не вибрано',
      life: 5000
    });

    return;
  }

  return confirm.require({
    message: 'Підтвердіть видалення запису.',
    header: 'Ви бажаєте видалити цей запис?',
    icon: 'pi pi-question',
    acceptIcon: 'pi pi-check',
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
      visible.value = false;

      toast.add({
        severity: 'info',
        summary: 'Інформація',
        detail: 'Видалення запису не підтверджено',
        life: 5000
      });
    }
  });
};

const onSaveRecord = handleSubmit(async values => {
  try {
    loading.value = true;

    if (values?.id) {
      await updateOne(values.id, controlledValues.value);
    } else {
      await createOne(controlledValues.value);
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
    class="mx-auto w-[90vw] md:w-[70vw] lg:w-[50vw] xl:w-[40vw] 2xl:w-[30vw]"
    @hide="onCloseModal"
  >
    <template #header>
      <div class="flex w-full justify-between">
        <div class="flex items-center justify-center">
          <Avatar icon="pi pi-file" class="mr-4" size="large" />
          <div>
            <p class="line-height-2 text-lg font-bold">Служба (філія)</p>
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

    <form
      class="flex flex-col gap-y-4 md:flex-row md:flex-wrap"
      @submit.prevent="onSaveRecord"
      v-focustrap
    >
      <div class="flex w-full flex-col space-y-4">
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

      <div class="flex w-full flex-col space-y-4">
        <div class="flex flex-col gap-2">
          <label for="description" class="font-bold"> Повна назва служби (філії) </label>
          <Textarea
            id="description"
            rows="3"
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
        <label for="subdivisions" class="font-bold"> Перелік структурних підрозділів </label>
        <MultiSelect
          fluid
          filter
          display="chip"
          name="subdivisions"
          resetFilterOnClear
          v-model="subdivisions"
          v-bind="subdivisionsAttrs"
          optionValue="id"
          optionLabel="name"
          :maxSelectedLabels="3"
          :options="subdivisionList || []"
          placeholder="Перелік структурних підрозділів"
          overlayClass="w-5"
        >
          <template #option="slotProps">
            <div class="flex items-center">
              <div>
                {{ slotProps.option.name }}
                <span class="truncate">({{ slotProps.option.description }})</span>
              </div>
            </div>
          </template>
        </MultiSelect>
        <small id="subdivisions-help" class="text-red-500" v-if="errors?.subdivisions">
          {{ errors.subdivisions }}
        </small>
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
