<script lang="ts" setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import type { RegisterDto } from '@/types';

const authStore = useAuthStore();
const router = useRouter();
const form = ref<RegisterDto>({ email: '', password: '', username: '' });
const error = ref<string | null>(null);

async function register() {
  try {
    await authStore.register(form.value);
    router.push('/');
  } catch (err) {
    error.value = (err as Error).message;
  }
}
</script>

<template>
  <div class="container mt-5">
    <h2>Регистрация</h2>
    <form @submit.prevent="register">
      <div class="mb-3">
        <label for="username" class="form-label">Имя пользователя</label>
        <input v-model="form.username" type="text" class="form-control" id="username" required />
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input v-model="form.email" type="email" class="form-control" id="email" required />
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Пароль</label>
        <input v-model="form.password" type="password" class="form-control" id="password" required />
      </div>
      <button type="submit" class="btn btn-primary">Зарегистрироваться</button>
      <p v-if="error" class="text-danger mt-2">{{ error }}</p>
      <p class="mt-2">
        Уже есть аккаунт? <router-link to="/login">Войти</router-link>
      </p>
    </form>
  </div>
</template>