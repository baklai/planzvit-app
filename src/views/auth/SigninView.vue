<script setup>
import { ref, inject, onMounted } from 'vue';
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { useToast } from 'primevue/usetoast';

const SUBMIT_COUNT = 5;

const toast = useToast();

const $auth = inject('auth');

const { values, errors, submitCount, handleSubmit, resetForm, defineField } = useForm({
  validationSchema: yup.object({
    email: yup.string().email().required('Потрібно вказати значення'),
    password: yup.string().min(6).required('Потрібно вказати значення')
  }),
  initialValues: {
    remember: JSON.parse(localStorage.getItem('app-auth-remember')) || false
  }
});

const loading = ref(false);

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');
const [remember, rememberAttrs] = defineField('remember');

const onSignin = handleSubmit(async values => {
  try {
    loading.value = true;

    await $auth.signin(values);

    toast.add({
      severity: 'success',
      summary: 'Інформація',
      detail: 'Авторизація пройшла успішно',
      life: 3000
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
});

const onChangeRemember = () => {
  localStorage.setItem('app-auth-remember', values.remember);
};

onMounted(() => {
  resetForm();
});
</script>

<template>
  <Card class="flex flex-col items-center justify-center p-6">
    <template #title>
      <div class="mb-8 flex flex-col items-center justify-center gap-y-2">
        <AppLogoImg fill="currentColor" width="64" height="64" />

        <div class="text-4xl font-bold tracking-wide text-primary">
          <sup>PLAN</sup>/<sub>ZVIT</sub>
        </div>
        <span class="text-center text-base text-muted-color">
          Увійдіть у додаток, щоб продовжити
        </span>
      </div>
    </template>

    <template #content>
      <form
        @submit.prevent="onSignin"
        class="flex w-[25rem] flex-col justify-center gap-y-6"
        autocomplete="off"
      >
        <div class="flex flex-col gap-2">
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

        <div class="flex flex-col gap-2">
          <label for="password" class="block font-medium"> Пароль користувача </label>

          <IconField>
            <InputIcon class="pi pi-lock z-10" />
            <Password
              fluid
              toggleMask
              inputClass="!pl-10"
              inputId="password"
              v-model="password"
              v-bind="passwordAttrs"
              :invalid="!!errors?.password"
              placeholder="Пароль користувача"
              promptLabel="Оберіть пароль"
              weakLabel="Занадто простий"
              mediumLabel="Середня складність"
              strongLabel="Складний пароль"
              aria-describedby="password-help"
            >
              <template #header>
                <h6>Поточний пароль</h6>
              </template>
              <template #footer>
                <Divider />
                <p class="mt-2">Рекомендації:</p>
                <ul class="ml-2 mt-0 list-disc pl-2 leading-normal">
                  <li>Принаймні одна маленька літера</li>
                  <li>Принаймні одна велика літера</li>
                  <li>Принаймні одна цифра</li>
                  <li>Мінімум 6 символів</li>
                </ul>
              </template>
            </Password>
          </IconField>

          <small id="password-help" class="text-red-500" v-if="errors?.password">
            {{ errors.password }}
          </small>
        </div>

        <div class="mb-4 flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <Checkbox
                binary
                inputId="remember"
                v-model="remember"
                v-bind="rememberAttrs"
                class="mr-2"
                @change="onChangeRemember"
              />
              <label for="remember"> Запам'ятати мене </label>
            </div>

            <RouterLink
              :to="{ name: 'reset' }"
              class="ml-2 cursor-pointer text-right font-bold text-primary no-underline"
            >
              Забули пароль?
            </RouterLink>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <Button
            type="submit"
            label="Увійти"
            icon="pi pi-sign-in"
            :loading="loading"
            :disabled="submitCount > SUBMIT_COUNT"
          />

          <small
            id="submit-help"
            class="block w-full text-center text-red-500"
            v-if="submitCount > SUBMIT_COUNT"
          >
            Ви використали занадто багато спроб для входу
          </small>
        </div>

        <RouterLink
          :to="{ name: 'signup' }"
          class="cursor-pointer text-center font-bold text-primary"
        >
          Зареєструватися
        </RouterLink>
      </form>
    </template>
  </Card>
</template>
