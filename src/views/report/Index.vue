<script setup>
definePageMeta({
  layout: 'primary',
  title: 'Планово-економічні звіти',
  description: 'Перелік планово-економічних звітів',
  middleware: ['authenticated']
});

const items = ref([
  {
    route: '/report/default',
    label: 'Планово-економічний звіт',
    icon: 'pi pi-file-excel'
  }
]);
</script>

<template>
  <Tabs :value="$route.path" class="mt-4">
    <TabList>
      <Tab v-for="tab in items" :key="tab.label" :value="tab.route">
        <router-link
          v-if="tab.route"
          v-slot="{ href, navigate }"
          :to="tab.route"
          custom
        >
          <a
            v-ripple
            :href="href"
            @click="navigate"
            class="flex items-center gap-2 text-inherit"
          >
            <i :class="tab.icon" />
            <span>{{ tab.label }}</span>
          </a>
        </router-link>
      </Tab>
    </TabList>
  </Tabs>

  <div class="w-full">
    <NuxtPage />
  </div>
</template>
