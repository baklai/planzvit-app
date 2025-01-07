<script setup></script>

<template>
  <Button
    size="large"
    variant="text"
    severity="secondary"
    :icon="$planzvit.loggedIn ? 'pi pi-sign-out' : 'pi pi-sign-in'"
    v-tooltip="$planzvit.loggedIn ? 'Вийти' : 'Увійти'"
    @click="$planzvit.loggedIn ? $auth.signout() : $router.push({ name: 'signin' })"
  />
</template>
