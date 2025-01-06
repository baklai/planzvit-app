<script setup>
const props = defineProps({
  crud: {
    type: Boolean,
    default: true
  },
  items: {
    type: Array,
    default: () => []
  }
});

const emits = defineEmits({
  view: ({ id }) => {
    if (id) return true;
    return false;
  },
  create: null,
  update: ({ id }) => {
    if (id) return true;
    return false;
  },
  delete: ({ id }) => {
    if (id) return true;
    return false;
  }
});

defineExpose({
  toggle: (event, data) => {
    record.value = data;
    refMenu.value.toggle(event);
  }
});

const record = ref({});

const refMenu = ref();

const crudOptions = computed(() => [
  {
    label: 'Переглянути запис',
    icon: 'pi pi-eye',
    command: () => emits('view', record.value)
  },
  {
    label: 'Створити запис',
    icon: 'pi pi-plus-circle',
    command: () => emits('create', {})
  },
  {
    label: 'Оновити запис',
    icon: 'pi pi-file-edit',
    command: () => emits('update', record.value)
  },
  {
    label: 'Видалити запис',
    icon: 'pi pi-trash',
    command: () => emits('delete', record.value)
  }
]);

const customOptions = computed(() => [...props.items]);

const options = computed(() => [
  ...(props.crud ? crudOptions.value : []),
  ...customOptions.value
]);
</script>

<template>
  <Menu ref="refMenu" popup :model="options" :class="['py-2']">
    <template #item="{ label, item, props }">
      <a :href="item.url" v-bind="props.action">
        <span v-bind="props.icon" />
        <span v-bind="props.label">{{ label }}</span>
      </a>
    </template>
  </Menu>
</template>
