<script setup>
import { ref } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import { useProfile } from '@/stores/api/profiles';

const toast = useToast();
const confirm = useConfirm();

const { findOne, createOne, updateOne, removeOne } = useProfile();

const { values, errors, handleSubmit, controlledValues, setValues, resetForm, defineField } =
  useForm({
    validationSchema: yup.object({
      email: yup.string().email().required('Потрібно вказати значення'),
      phone: yup.string().required('Потрібно вказати значення'),
      fullname: yup.string().required('Потрібно вказати значення'),
      isActivated: yup.boolean().required('Потрібно вказати значення'),
      role: yup.string().required('Потрібно вказати значення')
    }),
    initialValues: {
      isActivated: false,
      role: 'user'
    }
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

const [email, emailAttrs] = defineField('email');
const [phone, phoneAttrs] = defineField('phone');
const [fullname, fullnameAttrs] = defineField('fullname');
const [isActivated, isActivatedAttrs] = defineField('isActivated');
const [role, roleAttrs] = defineField('role');

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
            <p class="line-height-2 text-lg font-bold">Профіль користувача</p>
            <p class="line-height-2 text-base font-normal text-surface-500">
              {{ values?.id ? 'Редагування обраного запису' : 'Створення нового запису' }}
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
      <div class="flex w-full flex-col gap-2">
        <label for="fullname" class="block font-medium"> Повне ім'я </label>

        <IconField>
          <InputIcon class="pi pi-user" />
          <InputText
            id="fullname"
            class="w-full"
            v-model="fullname"
            v-bind="fullnameAttrs"
            :invalid="!!errors?.fullname"
            placeholder="Повне ім'я"
            aria-describedby="fullname-help"
          />
        </IconField>

        <small id="fullname-help" class="text-red-500" v-if="errors?.fullname">
          {{ errors.fullname }}
        </small>
      </div>

      <div class="flex w-full flex-col gap-2">
        <label for="email" class="block font-medium"> Електронна пошта </label>
        <IconField>
          <InputIcon class="pi pi-at" />
          <InputText
            id="email"
            class="w-full"
            v-model="email"
            v-bind="emailAttrs"
            placeholder="Електронна пошта"
            :invalid="!!errors?.email"
            aria-describedby="email-help"
          />
        </IconField>
        <small id="email-help" class="text-red-500" v-if="errors?.email">
          {{ errors.email }}
        </small>
      </div>

      <div class="mb-4 flex w-full flex-col gap-2">
        <label for="phone" class="block font-medium"> Номер телефону </label>
        <IconField>
          <InputIcon class="pi pi-phone" />
          <InputMask
            id="phone"
            date="phone"
            class="w-full"
            mask="+99(999)999-99-99"
            v-model="phone"
            v-bind="phoneAttrs"
            :invalid="!!errors?.phone"
            placeholder="Номер телефону"
            aria-describedby="phone-help"
          />
        </IconField>
        <small id="phone-help" class="text-red-500" v-if="errors?.phone">
          {{ errors.phone }}
        </small>
      </div>

      <div class="flex w-full flex-col gap-2">
        <label for="role" class="block font-medium"> Роль користувача </label>
        <Select
          id="role"
          class="w-full"
          v-model="role"
          v-bind="roleAttrs"
          :options="['user', 'moderator', 'administrator']"
          placeholder="Роль користувача"
          :invalid="!!errors?.role"
          aria-describedby="role-help"
        />

        <small id="role-help" class="text-red-500" v-if="errors?.role">
          {{ errors.role }}
        </small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="isActivated" class="block font-medium"> Статус профілю </label>
        <ToggleSwitch
          id="isActivated"
          class="w-full"
          v-model="isActivated"
          v-bind="isActivatedAttrs"
          :invalid="!!errors?.email"
          aria-describedby="isActivated-help"
        />
        <small id="isActivated-help" class="text-red-500" v-if="errors?.isActivated">
          {{ errors.isActivated }}
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
