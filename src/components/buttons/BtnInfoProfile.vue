<script setup>
import { ref } from 'vue';

const popover = ref();

const toggle = event => {
  popover.value.toggle(event);
};
</script>

<template>
  <Button
    size="large"
    variant="text"
    icon="pi pi-user"
    severity="secondary"
    class="bg-transparent text-muted-color hover:bg-emphasis"
    v-tooltip="'Обліковий запис'"
    @click="toggle"
    v-if="$planzvit?.loggedIn && $planzvit?.profile"
  />

  <Popover ref="popover">
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <Avatar icon="pi pi-user" class="mr-2" size="xlarge" shape="circle" />
        <div>
          <span class="font-medium">{{ $planzvit?.profile?.fullname }}</span>
          <div class="text-sm text-surface-500 dark:text-surface-400">
            {{ $planzvit?.profile?.email }}
          </div>
          <div class="text-sm text-surface-500 dark:text-surface-400">
            {{ $planzvit?.profile?.phone }}
          </div>
        </div>
      </div>
    </div>
  </Popover>
</template>
