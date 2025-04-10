<script lang="ts" setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import type { LoginDto } from '@/types';

const authStore = useAuthStore();
const router = useRouter();
const form = ref<LoginDto>({ email: '', password: '' });
const error = ref<string | null>(null);

async function login() {
  try {
    await authStore.login(form.value);
    router.push('/');
  } catch (err) {
    error.value = (err as Error).message;
  }
}
</script>

<template>
  <div class="container mt-5">
    <h2>Вход</h2>
    <form @submit.prevent="login">
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input v-model="form.email" type="email" class="form-control" id="email" required />
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Пароль</label>
        <input v-model="form.password" type="password" class="form-control" id="password" required />
      </div>
      <button type="submit" class="btn btn-primary">Войти</button>
      <p v-if="error" class="text-danger mt-2">{{ error }}</p>
      <p class="mt-2">
        Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link>
      </p>
    </form>
  </div>
</template>