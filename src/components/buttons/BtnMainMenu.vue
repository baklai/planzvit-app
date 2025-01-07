<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const refMenu = ref();

const menu = ref([
  {
    label: 'Головна',
    icon: 'pi pi-home !text-2xl !mr-2',
    command: () => {
      router.push({ name: 'home' });
    }
  },
  {
    label: 'Звіти',
    icon: 'pi pi-file-excel !text-2xl !mr-2',
    command: () => {
      router.push({ name: 'report' });
    }
  },
  {
    label: 'База даних',
    icon: 'pi pi-database !text-2xl !mr-2',
    command: () => {
      router.push({ name: 'table' });
    }
  },
  {
    label: 'Вийти з додатку',
    icon: 'pi pi-sign-out !text-2xl !mr-2',
    command: () => {
      router.push({ name: 'signin' });
    }
  }
]);

const toggle = event => {
  refMenu.value.toggle(event);
};
</script>

<template>
  <Button
    size="large"
    variant="text"
    icon="pi pi-th-large"
    severity="secondary"
    class="bg-transparent text-muted-color hover:bg-emphasis"
    v-tooltip.left="'Головне меню'"
    @click="toggle"
  />

  <Menu ref="refMenu" popup :model="menu" class="w-[20rem] px-6 py-4 text-xl">
    <template #start>
      <div class="my-2 flex items-center text-base">
        <div class="flex items-center">
          <Avatar icon="pi pi-user" class="mr-3" size="large" />
          <div>
            <p class="m-0 font-bold">
              {{ $planzvit?.profile?.fullname }}
            </p>
            <p class="line-height-3 m-0">
              {{ $planzvit?.profile?.email }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </Menu>
</template>
