import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import { TASKS_API_URL, CATEGORIES_API_URL } from '@/api/config';
import type {
	PagedResult,
	CategoryDto,
	Task,
	TaskCategoryInput,
} from '@/types';
import { useAuthStore } from '@/stores/auth';

export const useTasksStore = defineStore('tasks', () => {
	const tasks = ref<PagedResult<Task>>({
		items: [],
		totalCount: 0,
		page: 1,
		pageSize: 3,
	});

	const authStore = useAuthStore();

	async function fetchTasks(
		page: number = 1,
		isCompleted: boolean | null = null,
		sortBy: string | null = null,
		sortOrder: string | null = 'asc',
		searchQuery: string = ''
	) {
		try {
			if (!authStore.token) {
				throw new Error('Токен авторизации отсутствует');
			}

			const response = await axios.get<PagedResult<Task>>(TASKS_API_URL, {
				params: {
					page,
					pageSize: tasks.value.pageSize,
					isCompleted,
					sortBy,
					sortOrder,
					searchQuery: searchQuery || undefined,
				},
				headers: {
					Authorization: `Bearer ${authStore.token}`,
				},
			});
			tasks.value = response.data;
		} catch (error) {
			throw new Error(
				'Ошибка загрузки задач: ' +
					(error.response?.data?.message || error.message)
			);
		}
	}

	async function createTask(task: {
		title: string;
		description: string;
		dueDate?: string;
		categories?: TaskCategoryInput[];
	}) {
		try {
			if (!authStore.token) {
				throw new Error('Токен авторизации отсутствует');
			}

			const response = await axios.post<Task>(TASKS_API_URL, task, {
				headers: {
					Authorization: `Bearer ${authStore.token}`,
				},
			});
			return response.data;
		} catch (error) {
			throw new Error(
				'Ошибка создания задачи: ' +
					(error.response?.data || error.message)
			);
		}
	}

	async function updateTask(
		taskId: number,
		task: {
			title?: string;
			description: string;
			isCompleted?: boolean;
			dueDate?: string;
			categories?: TaskCategoryInput[];
		}
	) {
		try {
			if (!authStore.token) {
				throw new Error('Токен авторизации отсутствует');
			}

			await axios.put(`${TASKS_API_URL}/${taskId}`, task, {
				headers: {
					Authorization: `Bearer ${authStore.token}`,
				},
			});
		} catch (error) {
			throw new Error(
				'Ошибка обновления задачи: ' + (error.response?.data || error.message)
			);
		}
	}

	async function deleteTask(taskId: number) {
		try {
			if (!authStore.token) {
				throw new Error('Токен авторизации отсутствует');
			}
			await axios.delete(`${TASKS_API_URL}/${taskId}`, {
				headers: {
					Authorization: `Bearer ${authStore.token}`,
				},
			});
		} catch (error) {
			throw new Error(
				'Ошибка удаления задачи: ' +
					(error.response?.data?.message || error.message)
			);
		}
	}

	async function completeTask(taskId: number) {
		try {
			if (!authStore.token) {
				throw new Error('Токен авторизации отсутствует');
			}
			await axios.patch(
				`${TASKS_API_URL}/${taskId}/complete`,
				{},
				{
					headers: {
						Authorization: `Bearer ${authStore.token}`,
					},
				}
			);
		} catch (error) {
			throw new Error(
				'Ошибка при отметке задачи: ' +
					(error.response?.data?.message || error.message)
			);
		}
	}

	async function fetchCategories() {
		try {
			if (!authStore.token) {
				throw new Error('Токен авторизации отсутствует');
			}

			const [globalResponse, userResponse] = await Promise.all([
				axios.get<CategoryDto[]>(`${CATEGORIES_API_URL}/global`, {
					headers: {
						Authorization: `Bearer ${authStore.token}`,
					},
				}),
				axios.get<CategoryDto[]>(`${CATEGORIES_API_URL}/user`, {
					headers: {
						Authorization: `Bearer ${authStore.token}`,
					},
				}),
			]);

			const globalCategories = Array.isArray(globalResponse.data)
				? globalResponse.data.map(category => ({
						id: category.id,
						name: category.name || 'Без названия',
						isGlobal: true,
				  }))
				: [];
			const userCategories = Array.isArray(userResponse.data)
				? userResponse.data.map(category => ({
						id: category.id,
						name: category.name || 'Без названия',
						isGlobal: false,
				  }))
				: [];

			return [...globalCategories, ...userCategories];
		} catch (error) {
			throw new Error(
				'Ошибка загрузки категорий: ' +
					(error.response?.data?.message || error.message)
			);
		}
	}

	return {
		tasks,
		fetchTasks,
		createTask,
		updateTask,
		deleteTask,
		completeTask,
		fetchCategories,
	};
});
