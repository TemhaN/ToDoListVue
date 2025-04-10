import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import { AUTH_API_URL } from '@/api/config';
import type { LoginDto, RegisterDto } from '@/types';

export const useAuthStore = defineStore('auth', () => {
	const token = ref<string | null>(localStorage.getItem('token'));
	const isAuthenticated = ref(!!token.value);

	async function login(credentials: LoginDto) {
		try {
			const response = await axios.post(`${AUTH_API_URL}/login`, credentials);
			token.value = response.data.token;
			localStorage.setItem('token', token.value);
			isAuthenticated.value = true;
			axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
		} catch (error) {
			throw new Error(
				'Ошибка входа: ' + (error.response?.data?.message || error.message)
			);
		}
	}

	async function register(data: RegisterDto) {
		try {
			const response = await axios.post(`${AUTH_API_URL}/register`, data);
			token.value = response.data.token;
			localStorage.setItem('token', token.value);
			isAuthenticated.value = true;
			axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
		} catch (error) {
			throw new Error(
				'Ошибка регистрации: ' +
					(error.response?.data?.message || error.message)
			);
		}
	}

	function logout() {
		token.value = null;
		localStorage.removeItem('token');
		isAuthenticated.value = false;
		delete axios.defaults.headers.common['Authorization'];
	}

	return { token, isAuthenticated, login, register, logout };
});
