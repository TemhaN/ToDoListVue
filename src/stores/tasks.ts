import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import { TASKS_API_URL } from '@/api/config';
import type { Task, PagedResult } from '@/types';
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
			console.error('Fetch tasks error:', error);
			throw new Error(
				'Ошибка загрузки задач: ' +
					(error.response?.data?.message || error.message)
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
			console.error('Delete task error:', error);
			throw new Error(
				'Ошибка удаления задачи: ' +
					(error.response?.data?.message || error.message)
			);
		}
	}

	return { tasks, fetchTasks, deleteTask };
});
