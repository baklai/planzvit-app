<script setup>
import { ref } from 'vue';

const items = ref([
  { route: '/sheet/service', label: 'Вартість робіт', icon: 'pi pi-file-excel' },
  { route: '/sheet/report', label: 'Щомісячні звіти', icon: 'pi pi-file-excel' },
  { route: '/sheet/subdivision', label: 'Акт послуг підрозділам', icon: 'pi pi-file-excel' },
  { route: '/sheet/branch', label: 'Акт послуг службам (філіям)', icon: 'pi pi-file-excel' }
]);
</script>

<template>
  <Tabs :value="$route.path" scrollable>
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
