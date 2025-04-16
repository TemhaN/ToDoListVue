import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import { AUTH_API_URL } from '@/api/config';
import { useRouter } from 'vue-router';

export interface User {
	id: number;
	email: string;
	username: string;
}

export const useAuthStore = defineStore('auth', () => {
	const token = ref<string | null>(null);
	const user = ref<User | null>(null);
	const router = useRouter();

	async function login(email: string, password: string) {
		try {
			const response = await axios.post<{ token: string }>(
				`${AUTH_API_URL}/login`,
				{
					email,
					password,
				}
			);
			token.value = response.data.token;
			localStorage.setItem('token', token.value);
			await fetchUser();
			router.push('/');
		} catch (error) {
			throw new Error(
				'Ошибка входа: ' +
					(error.response?.data?.message || 'Неверный формат данных')
			);
		}
	}

	async function register(email: string, username: string, password: string) {
		try {
			const response = await axios.post<{ token: string }>(
				`${AUTH_API_URL}/register`,
				{
					email,
					username,
					password,
				}
			);
			token.value = response.data.token;
			localStorage.setItem('token', token.value);
			await fetchUser();
			router.push('/');
		} catch (error) {
			throw new Error(
				'Ошибка регистрации: ' +
					(error.response?.data?.message || 'Неверный формат данных')
			);
		}
	}

	async function fetchUser() {
		if (!token.value) {
			throw new Error('Токен авторизации отсутствует');
		}

		try {
			const response = await axios.get<User>(`${AUTH_API_URL}/me`, {
				headers: {
					Authorization: `Bearer ${token.value}`,
				},
			});
			user.value = response.data;
		} catch (error) {
			throw new Error(
				'Ошибка получения данных пользователя: ' +
					(error.response?.data?.message || 'Неверный формат данных')
			);
		}
	}

	function logout() {
		token.value = null;
		user.value = null;
		localStorage.removeItem('token');
		router.push('/login');
	}

	async function initialize() {
		const storedToken = localStorage.getItem('token');
		if (storedToken) {
			token.value = storedToken;
			try {
				await fetchUser();
			} catch (error) {
				logout();
			}
		}
	}

	return {
		token,
		user,
		login,
		register,
		fetchUser,
		logout,
		initialize,
	};
});
