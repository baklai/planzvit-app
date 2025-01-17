<script setup>
import { useToast } from 'primevue/usetoast';
import { useForm } from 'vee-validate';
import { ref } from 'vue';
import * as yup from 'yup';

import { useNotice } from '@/stores/api/notices';

const toast = useToast();

const Notice = useNotice();

const { values, errors, handleSubmit, resetForm, defineField } = useForm({
  validationSchema: yup.object({
    title: yup.string().required('Потрібно вказати значення'),
    text: yup.string().required('Потрібно вказати значення'),
    profiles: yup.array().required('Потрібно вказати значення')
  }),
  initialValues: {}
});

const emits = defineEmits(['close']);

defineExpose({
  toggle: async () => {
    try {
      records.value = await Notice.findAllProfiles();

      visible.value = true;
    } catch (err) {
      visible.value = false;
    }
  }
});

const visible = ref(false);

const records = ref([]);

const [title, titleAttrs] = defineField('title');
const [text, textAttrs] = defineField('text');
const [profiles, profilesAttrs] = defineField('profiles');

const onSendNotice = handleSubmit(async () => {
  try {
    await Notice.createOne({
      title: values.title,
      text: values.text,
      profiles: values.profiles.map(({ id }) => id)
    });
    toast.add({
      severity: 'success',
      summary: 'Інформація',
      detail: 'Всі повідомлення відправлено',
      life: 3000
    });
  } catch (err) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: err?.message,
      life: 3000
    });
  } finally {
    visible.value = false;
  }
});

const onCloseModal = () => {
  resetForm({ values: {} }, { force: true });
  emits('close', {});
};
</script>

<template>
  <Dialog
    closable
    draggable
    v-model:visible="visible"
    class="mx-auto w-[90vw] md:w-[60vw] lg:w-[50vw] xl:w-[35vw] 2xl:w-[25vw]"
    @hide="onCloseModal"
  >
    <template #header>
      <div class="flex w-full justify-between">
        <div class="flex items-center justify-center">
          <i class="pi pi-bell mr-4" style="font-size: 2rem"></i>
          <div>
            <p class="line-height-2 text-lg font-bold">Сповіщення</p>
            <p class="line-height-2 text-base font-normal text-surface-500">Системні сповіщення</p>
          </div>
        </div>
      </div>
    </template>

    <form class="flex flex-col gap-y-4" @submit.prevent="onSendNotice">
      <div class="flex flex-col gap-2">
        <label for="profiles" class="font-bold">Профілі сповіщень</label>
        <MultiSelect
          id="profiles"
          filter
          v-model="profiles"
          v-bind="profilesAttrs"
          :options="records"
          optionLabel="fullname"
          :maxSelectedLabels="3"
          placeholder="Профілі сповіщень"
          :invalid="!!errors?.profiles"
          aria-describedby="profiles-help"
        >
          <template #option="slotProps">
            <div class="flex items-center">
              <Avatar icon="pi pi-user" shape="circle" class="mr-2" />
              <p class="font-semibold">{{ slotProps.option.fullname }}</p>
            </div>
          </template>
        </MultiSelect>
        <small id="profiles-help" class="text-red-500" v-if="errors?.profiles">
          {{ errors.profiles }}
        </small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="title" class="font-bold">Заголовок сповіщення</label>
        <InputText
          id="title"
          v-model="title"
          v-bind="titleAttrs"
          placeholder="Заголовок сповіщення"
          :invalid="!!errors?.title"
          aria-describedby="title-help"
        />
        <small id="title-help" class="text-red-500" v-if="errors?.title">
          {{ errors.title }}
        </small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="text" class="font-bold">Текст сповіщення</label>
        <Textarea
          rows="5"
          id="text"
          v-model="text"
          v-bind="textAttrs"
          placeholder="Текст сповіщення"
          :invalid="!!errors?.text"
          aria-describedby="text-help"
        />
        <small id="text-help" class="text-red-500" v-if="errors?.text">
          {{ errors.text }}
        </small>
      </div>
    </form>

    <template #footer>
      <Button text plain icon="pi pi-times" label="Скасувати" @click="visible = !visible" />
      <Button
        text
        plain
        icon="pi pi-send"
        label="Відправити"
        v-tooltip.bottom="'Надіслати сповіщення'"
        @click="onSendNotice"
      />
    </template>
  </Dialog>
</template>
