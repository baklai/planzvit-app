<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const menu = ref();

const reports = ref([
  {
    label: 'Звіт за місяць',
    icon: 'pi pi-file-excel',
    command: () => {
      router.push({ name: 'report-monthly' });
    }
  }
]);

const toggle = event => {
  menu.value.toggle(event);
};
</script>

<template>
  <Button
    size="large"
    variant="text"
    icon="pi pi-file-excel !text-2xl"
    severity="secondary"
    class="bg-transparent text-muted-color hover:bg-emphasis"
    v-tooltip="'Звіти про надання послуг з програмно-технологічного супроводу'"
    @click="toggle"
  />

  <Menu :popup="true" :model="reports" ref="menu">
    <template #item="{ item, props }">
      <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </router-link>
      <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
        <span :class="item.icon" />
        <span class="ml-2">{{ item.label }}</span>
      </a>
    </template>
  </Menu>
</template>
