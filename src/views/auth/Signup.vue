<script setup>
import { ref, inject, onMounted } from 'vue';
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const $auth = inject('auth');

const { values, errors, handleSubmit, resetForm, defineField } = useForm({
  validationSchema: yup.object({
    email: yup.string().email().required('Потрібно вказати значення'),
    fullname: yup.string().required('Потрібно вказати значення'),
    password: yup.string().min(6).required('Потрібно вказати значення'),
    phone: yup.string().required('Потрібно вказати значення')
  }),
  initialValues: {}
});

const loading = ref(false);

const [email, emailAttrs] = defineField('email');
const [fullname, fullnameAttrs] = defineField('fullname');
const [password, passwordAttrs] = defineField('password');
const [phone, phoneAttrs] = defineField('phone');

const onSignup = handleSubmit(async values => {
  try {
    loading.value = true;

    await $auth.signup(values);

    toast.add({
      severity: 'success',
      summary: 'Інформація',
      detail:
        "Ваш обліковий запис зареєстровано. Будь ласка, зв'яжіться з адміністратором для активації облікового запису.",
      life: 10000
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
          Зареєструйтесь в додатку, щоб продовжити
        </span>
      </div>
    </template>

    <template #content>
      <form
        @submit.prevent="onSignup"
        class="flex w-[25rem] flex-col justify-center gap-6"
        autocomplete="off"
      >
        <div class="flex flex-col gap-2">
          <label for="fullname" class="block font-medium"> Повне ім'я </label>

          <IconField>
            <InputIcon icon="pi pi-user" />
            <InputText
              id="fullname"
              v-model="fullname"
              v-bind="fullnameAttrs"
              :invalid="!!errors?.fullname"
              placeholder="Повне ім'я"
              class="w-full pl-10 text-xl"
              aria-describedby="fullname-help"
            />
          </IconField>

          <small id="fullname-help" class="text-red-500" v-if="errors?.fullname">
            {{ errors.fullname }}
          </small>
        </div>

        <div class="flex flex-col gap-2">
          <label for="email" class="block font-medium"> Електронна пошта </label>
          <IconField>
            <InputIcon icon="pi pi-at" />
            <InputText
              id="email"
              size="large"
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
          <label for="phone" class="block font-medium"> Номер телефону </label>
          <IconField>
            <InputIcon icon="pi pi-phone" />
            <InputMask
              id="phone"
              date="phone"
              mask="+99(999)999-99-99"
              v-model="phone"
              v-bind="phoneAttrs"
              :invalid="!!errors?.phone"
              placeholder="Номер телефону"
              class="w-full pl-10 text-xl"
              aria-describedby="phone-help"
            />
          </IconField>
          <small id="phone-help" class="text-red-500" v-if="errors?.phone">
            {{ errors.phone }}
          </small>
        </div>

        <Button
          type="submit"
          size="large"
          icon="pi pi-sign-in"
          :loading="loading"
          label="Зареєструватися"
          aria-label="Зареєструватися"
          aria-describedby="submit-help"
        />

        <RouterLink
          :to="{ name: 'signin' }"
          class="cursor-pointer text-center font-bold text-primary"
        >
          Увійти в додаток
        </RouterLink>
      </form>
    </template>
  </Card>
</template>
