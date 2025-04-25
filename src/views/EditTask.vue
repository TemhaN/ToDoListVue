<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useTasksStore } from '@/stores/tasks';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import CategorySelect from '@/components/CategorySelect.vue';
import type { CategoryDto, TaskCategoryInput } from '@/types';

const tasksStore = useTasksStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const taskId = Number(route.params.id);

const form = ref({
	title: '',
	description: '',
	dueDate: '',
	isCompleted: false,
	categoryIds: [] as { id: number; isGlobal: boolean }[],
});
const categories = ref<CategoryDto[]>([]);
const error = ref<string | null>(null);
const isLoading = ref(false);

onMounted(async () => {
	try {
		isLoading.value = true;
		const task = await tasksStore.fetchTask(taskId);
		form.value = {
			title: task.title || '',
			description: task.description || '',
			dueDate: task.dueDate
				? new Date(task.dueDate).toISOString().slice(0, 16)
				: '',
			isCompleted: task.isCompleted || false,
			categoryIds: task.categories
				? task.categories.map((c: CategoryDto) => ({
						id: c.id,
						isGlobal: c.isGlobal,
				  }))
				: [],
		};
		categories.value = await tasksStore.fetchCategories();
	} catch (err) {
		error.value =
			'Не удалось загрузить задачу или категории: ' + (err as Error).message;
	} finally {
		isLoading.value = false;
	}
});

async function submitForm() {
	if (!form.value.title.trim()) {
		error.value = 'Название задачи обязательно';
		return;
	}

	if (!form.value.description.trim()) {
		error.value = 'Описание задачи обязательно';
		return;
	}

	try {
		isLoading.value = true;
		let dueDate: string | undefined = undefined;
		if (form.value.dueDate) {
			dueDate = new Date(form.value.dueDate).toISOString();
		}

		const taskCategories: TaskCategoryInput[] = form.value.categoryIds.map(
			cat => ({
				id: cat.id,
				isGlobal: cat.isGlobal,
			})
		);

		await tasksStore.updateTask(taskId, {
			title: form.value.title.trim(),
			description: form.value.description.trim(),
			isCompleted: form.value.isCompleted,
			dueDate,
			categories: taskCategories.length ? taskCategories : undefined,
		});
		router.push('/');
	} catch (err) {
		error.value = 'Ошибка обновления задачи: ' + (err as Error).message;
	} finally {
		isLoading.value = false;
	}
}
</script>

<template>
	<div class="container py-5">
		<div class="row justify-content-center">
			<div class="col-lg-10">
				<div class="d-flex justify-content-between align-items-center mb-4">
					<h1 class="mb-0">Редактировать задачу</h1>
					<router-link
						to="/"
						class="btn btn-outline-secondary rounded-pill px-4"
					>
						<i class="bi bi-arrow-left me-2"></i>Назад
					</router-link>
				</div>

				<div class="card mb-4 rounded-4 border-0 shadow-sm">
					<div class="card-body p-4">
						<div
							v-if="error"
							class="alert alert-danger alert-dismissible fade show rounded-3 mb-4"
						>
							{{ error }}
							<button
								type="button"
								class="btn-close"
								@click="error = null"
							></button>
						</div>
						<div
							v-if="isLoading"
							class="alert alert-info alert-dismissible fade show rounded-3 mb-4"
						>
							Загрузка...
							<button
								type="button"
								class="btn-close"
								@click="isLoading = false"
							></button>
						</div>
						<div
							v-if="!categories.length && !isLoading"
							class="alert alert-warning alert-dismissible fade show rounded-3 mb-4"
						>
							Категории не найдены. Проверьте подключение к API.
							<button
								type="button"
								class="btn-close"
								@click="error = null"
							></button>
						</div>

						<form @submit.prevent="submitForm">
							<div class="mb-3">
								<label for="title" class="form-label">Название</label>
								<input
									id="title"
									v-model="form.title"
									type="text"
									class="form-control rounded-pill py-2"
									placeholder="Введите название задачи"
									required
								/>
							</div>
							<div class="mb-3">
								<label for="description" class="form-label">Описание</label>
								<textarea
									id="description"
									v-model="form.description"
									class="form-control rounded-3"
									rows="4"
									placeholder="Введите описание задачи"
								></textarea>
							</div>
							<div class="mb-3">
								<label for="dueDate" class="form-label">Дата выполнения</label>
								<input
									id="dueDate"
									v-model="form.dueDate"
									type="datetime-local"
									class="form-control rounded-pill py-2"
								/>
							</div>
							<div class="mb-3">
								<label for="isCompleted" class="form-label">Статус</label>
								<select
									id="isCompleted"
									v-model="form.isCompleted"
									class="form-select rounded-pill"
								>
									<option :value="false">Не выполнена</option>
									<option :value="true">Выполнена</option>
								</select>
							</div>
							<CategorySelect
								v-model="form.categoryIds"
								:categories="categories"
								:isLoading="isLoading"
							/>
							<div class="d-flex justify-content-end mt-4">
								<button
									type="submit"
									class="btn btn-primary rounded-pill px-4"
									:disabled="isLoading"
								>
									<i class="bi bi-save me-2"></i>
									{{ isLoading ? 'Сохранение...' : 'Сохранить задачу' }}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>