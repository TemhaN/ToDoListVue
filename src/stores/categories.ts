import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import { CATEGORIES_API_URL } from '@/api/config';
import { useAuthStore } from '@/stores/auth';
import type { CategoryDto } from '@/types';

export const useCategoriesStore = defineStore('categories', () => {
	const categories = ref<CategoryDto[]>([]);
	const authStore = useAuthStore();

	async function fetchCategories() {
		try {
			if (!authStore.token) {
				throw new Error('Токен авторизации отсутствует');
			}

			const [globalResponse, userResponse] = await Promise.all([
				axios.get<CategoryDto[]>(`${CATEGORIES_API_URL}/global`, {
					headers: { Authorization: `Bearer ${authStore.token}` },
				}),
				axios.get<CategoryDto[]>(`${CATEGORIES_API_URL}/user`, {
					headers: { Authorization: `Bearer ${authStore.token}` },
				}),
			]);

			categories.value = [
				...(globalResponse.data || []).map(category => ({
					id: category.id,
					name: category.name || 'Без названия',
					isGlobal: true,
				})),
				...(userResponse.data || []).map(category => ({
					id: category.id,
					name: category.name || 'Без названия',
					isGlobal: false,
				})),
			];
		} catch (error) {
			throw new Error(
				'Ошибка загрузки категорий: ' +
					(error.response?.data?.message ||
						error.response?.data ||
						error.message)
			);
		}
	}

	async function createCategory(name: string) {
		try {
			if (!authStore.token) {
				throw new Error('Токен авторизации отсутствует');
			}

			const response = await axios.post<CategoryDto>(
				`${CATEGORIES_API_URL}/user`,
				{ name },
				{ headers: { Authorization: `Bearer ${authStore.token}` } }
			);

			categories.value.push({
				id: response.data.id,
				name: response.data.name,
				isGlobal: false,
			});
		} catch (error) {
			throw new Error(
				'Ошибка создания категории: ' +
					(error.response?.data?.message ||
						error.response?.data ||
						error.message)
			);
		}
	}

	async function updateCategory(id: number, name: string) {
		try {
			if (!authStore.token) {
				throw new Error('Токен авторизации отсутствует');
			}

			await axios.put(
				`${CATEGORIES_API_URL}/user/${id}`,
				{ name },
				{ headers: { Authorization: `Bearer ${authStore.token}` } }
			);

			const category = categories.value.find(c => c.id === id && !c.isGlobal);
			if (category) {
				category.name = name;
			} else {
				throw new Error('Пользовательская категория не найдена');
			}
		} catch (error) {
			throw new Error(
				'Ошибка обновления категории: ' +
					(error.response?.data?.message ||
						error.response?.data ||
						error.message)
			);
		}
	}

	async function deleteCategory(id: number) {
		try {
			if (!authStore.token) {
				throw new Error('Токен авторизации отсутствует');
			}

			await axios.delete(`${CATEGORIES_API_URL}/user/${id}`, {
				headers: { Authorization: `Bearer ${authStore.token}` },
			});

			categories.value = categories.value.filter(
				c => !(c.id === id && !c.isGlobal)
			);
		} catch (error) {
			throw new Error(
				'Ошибка удаления категории: ' +
					(error.response?.data?.message ||
						error.response?.data ||
						error.message)
			);
		}
	}

	return {
		categories,
		fetchCategories,
		createCategory,
		updateCategory,
		deleteCategory,
	};
});
