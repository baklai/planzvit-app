<script setup>
import { ref } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import { useService } from '@/stores/api/services';

const toast = useToast();
const confirm = useConfirm();

const { findOne, createOne, updateOne, removeOne } = useService();

const { values, errors, handleSubmit, controlledValues, setValues, resetForm, defineField } =
  useForm({
    validationSchema: yup.object({
      number: yup.string().required('Потрібно вказати значення'),
      name: yup.string().required('Потрібно вказати значення'),
      price: yup.number().required('Потрібно вказати значення')
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

const [number, numberAttrs] = defineField('number');
const [name, nameAttrs] = defineField('name');
const [price, priceAttrs] = defineField('price');

const onCreateRecord = async () => {
  resetForm({ values: {} }, { force: true });
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
    class="mx-auto w-[90vw] md:w-[80vw] lg:w-[60vw] xl:w-[50vw] 2xl:w-[30vw]"
    @hide="onCloseModal"
  >
    <template #header>
      <div class="flex w-full justify-between">
        <div class="flex items-center justify-center">
          <Avatar icon="pi pi-file" class="mr-4" size="large" />
          <div>
            <p class="line-height-2 text-lg font-bold">Система підтримки</p>
            <p class="line-height-2 text-base font-normal text-surface-500">
              {{ values?.id ? 'Редагувати обраний запис' : 'Створити новий запис' }}
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
          <label for="number" class="font-bold"> Номер роботи </label>
          <InputText
            id="number"
            v-model="number"
            v-bind="numberAttrs"
            placeholder="Номер роботи"
            :invalid="!!errors?.number"
            aria-describedby="number-help"
          />
          <small id="number-help" class="text-red-500" v-if="errors?.number">
            {{ errors.number }}
          </small>
        </div>
      </div>

      <div class="flex flex-col space-y-4 md:w-1/2 md:pl-2">
        <div class="flex flex-col gap-2">
          <label for="price" class="font-bold"> Вартість роботи </label>
          <InputText
            id="price"
            v-model="price"
            v-bind="priceAttrs"
            placeholder="Вартість роботи"
            :invalid="!!errors?.price"
            aria-describedby="price-help"
          />
          <small id="price-help" class="text-red-500" v-if="errors?.price">
            {{ errors.price }}
          </small>
        </div>
      </div>

      <div class="flex w-full flex-col space-y-4">
        <div class="flex flex-col gap-2">
          <label for="name" class="font-bold"> Назва системи </label>
          <Textarea
            rows="5"
            id="name"
            v-model="name"
            v-bind="nameAttrs"
            placeholder="Назва системи"
            :invalid="!!errors?.name"
            aria-describedby="name-help"
          />
          <small id="name-help" class="text-red-500" v-if="errors?.name">
            {{ errors.name }}
          </small>
        </div>
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
