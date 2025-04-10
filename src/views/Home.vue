<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
</script>

<template>
  <div class="container mt-5">
    <h1>TODO List</h1>
    <p>В системе</p>
    <button class="btn btn-danger" @click="authStore.logout">Выйти</button>
  </div>
</template>