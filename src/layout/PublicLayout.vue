<script setup>
import { ref } from 'vue';

const disabledSelectedFromHTML = ref({
  '-webkit-user-select': 'none',
  '-moz-user-select': 'none',
  '-ms-user-select': 'none',
  '-o-user-select': 'none',
  'user-select': 'none'
});
</script>

<template>
  <div
    class="flex h-screen min-h-screen min-w-full overflow-hidden bg-gradient-to-tr from-surface-950 to-primary-950"
    :style="disabledSelectedFromHTML"
  >
    <div class="h-full w-full !bg-[url(/img/bg-app.svg)] bg-cover bg-center bg-no-repeat">
      <div class="flex h-full w-full flex-col justify-center gap-y-2">
        <main class="flex flex-col items-center gap-4">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
</template>
