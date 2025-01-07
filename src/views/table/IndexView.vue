<script setup>
import { ref } from 'vue';

const items = ref([
  {
    route: '/table/statistics',
    label: 'Статистична інформація',
    icon: 'pi pi-chart-bar'
  },
  {
    route: '/table/departments',
    label: 'Перелік відділів',
    icon: 'pi pi-table'
  },
  { route: '/table/services', label: 'Сервіси підтримки', icon: 'pi pi-table' },
  { route: '/table/branches', label: 'Перелік служб (філій)', icon: 'pi pi-table' }
]);
</script>

<template>
  <Tabs :value="$route.path" class="mt-4">
    <TabList>
      <Tab
        v-for="tab in items"
        :key="tab.label"
        :value="tab.route"
        @click="$router.push({ path: tab.route })"
      >
        <router-link v-if="tab.route" v-slot="{ href, navigate }" :to="tab.route" custom>
          <a v-ripple :href="href" @click="navigate" class="flex items-center gap-2 text-inherit">
            <i :class="tab.icon" />
            <span>{{ tab.label }}</span>
          </a>
        </router-link>
      </Tab>
    </TabList>
  </Tabs>

  <div class="h-full w-full overflow-auto">
    <RouterView />
  </div>
</template>
