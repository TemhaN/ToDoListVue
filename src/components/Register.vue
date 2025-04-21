<script lang="ts" setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import type { RegisterDto } from '@/types';

const authStore = useAuthStore();
const router = useRouter();
const form = ref<RegisterDto>({ email: '', password: '', username: '' });
const error = ref<string | null>(null);
const isLoading = ref(false);

async function register() {
	error.value = null;
	isLoading.value = true;
	try {
		await authStore.register(
			form.value.email,
			form.value.username,
			form.value.password
		);
		router.push('/');
	} catch (err) {
		error.value = (err as Error).message;
	}
	isLoading.value = false;
}
</script>

<template>
	<div
		class="d-flex align-items-center justify-content-center min-vh-100 bg-light"
	>
		<div
			class="card border-0 shadow-sm rounded-5 overflow-hidden col-md-6 col-lg-5 col-xl-4"
		>
			<div class="card-body p-5">
				<div class="text-center mb-5">
					<h2 class="fw-bold mb-1">Создать аккаунт</h2>
					<p class="text-muted">Введите данные для регистрации</p>
				</div>

				<form @submit.prevent="register" class="needs-validation" novalidate>
					<div class="mb-3">
						<label for="username" class="form-label">Имя пользователя</label>
						<div class="input-group">
							<input
								v-model="form.username"
								type="text"
								class="form-control py-2"
								id="username"
								placeholder="Введите имя пользователя"
								required
							/>
						</div>
					</div>

					<div class="mb-3">
						<label for="email" class="form-label">Email</label>
						<div class="input-group">
							<input
								v-model="form.email"
								type="email"
								class="form-control py-2"
								id="email"
								placeholder="your@email.com"
								required
							/>
						</div>
					</div>

					<div class="mb-4">
						<label for="password" class="form-label">Пароль</label>
						<div class="input-group">
							<input
								v-model="form.password"
								type="password"
								class="form-control py-2"
								id="password"
								placeholder="••••••••"
								required
							/>
						</div>
					</div>

					<div class="d-grid mb-3">
						<button
							type="submit"
							class="btn btn-primary btn-lg rounded-pill py-2 fw-bold"
							:disabled="isLoading"
						>
							<template v-if="isLoading">
								<span
									class="spinner-border spinner-border-sm me-2"
									role="status"
								></span>
								Регистрация...
							</template>
							<template v-else>
								<i class="bi bi-person-plus me-2"></i>Зарегистрироваться
							</template>
						</button>
					</div>

					<div
						v-if="error"
						class="alert alert-danger alert-dismissible fade show rounded-3"
						role="alert"
					>
						{{ error }}
						<button
							type="button"
							class="btn-close"
							@click="error = null"
						></button>
					</div>

					<div class="text-center mt-4">
						<p class="text-muted mb-0">
							Уже есть аккаунт?
							<router-link
								to="/login"
								class="text-decoration-none fw-bold text-primary"
							>
								Войти
							</router-link>
						</p>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>
