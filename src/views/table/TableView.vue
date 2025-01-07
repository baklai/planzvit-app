<script setup>
import { ref } from 'vue';

const items = ref([
  {
    route: '/table/statistics',
    label: 'Статистика по базі',
    icon: 'pi pi-chart-bar'
  },
  {
    route: '/table/departments',
    label: 'Відділи підрозділу',
    icon: 'pi pi-table'
  },
  { route: '/table/services', label: 'Системи підтримки', icon: 'pi pi-table' },
  {
    route: '/table/profiles',
    label: 'Профілі користувачів',
    icon: 'pi pi-users'
  },
  {
    route: '/table/syslogs',
    label: 'Аудит активності',
    icon: 'pi pi-arrow-right-arrow-left'
  }
]);
</script>

<template>
  <Tabs :value="$route.path" class="mt-4">
    <TabList>
      <Tab v-for="tab in items" :key="tab.label" :value="tab.route">
        <router-link v-if="tab.route" v-slot="{ href, navigate }" :to="tab.route" custom>
          <a v-ripple :href="href" @click="navigate" class="flex items-center gap-2 text-inherit">
            <i :class="tab.icon" />
            <span>{{ tab.label }}</span>
          </a>
        </router-link>
      </Tab>
    </TabList>
  </Tabs>

  <div class="w-full">
    <RouterView />
  </div>
</template>
