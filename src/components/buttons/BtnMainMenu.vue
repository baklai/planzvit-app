<script setup>
import { ref } from 'vue';

const refMenu = ref();

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

  <Menu ref="refMenu" popup :model="[]" class="w-[22rem] px-4 py-2">
    <template #start>
      <div class="my-2 flex items-center">
        <div class="flex items-center">
          <Avatar icon="pi pi-user" class="mr-3" size="large" />
          <div>
            <p class="m-0 font-bold">
              {{ user?.fullname }}
            </p>
            <p class="line-height-3 m-0">
              {{ user?.email }}
            </p>
          </div>
        </div>
      </div>
      <div class="max-h-[30rem] w-full overflow-scroll px-2 py-2"></div>
    </template>

    <template #item="{ label, item, props }">
      <a :href="item.url" v-bind="props.action">
        <span v-bind="props.icon" />
        <span v-bind="props.label">{{ label }}</span>
      </a>
    </template>

    <template #end>
      <div class="flex content-center items-center justify-between py-2"></div>
    </template>
  </Menu>
</template>
