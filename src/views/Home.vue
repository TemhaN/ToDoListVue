<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTasksStore } from '@/stores/tasks';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const tasksStore = useTasksStore();
const error = ref<string | null>(null);
const router = useRouter();

const isCompleted = ref<boolean | null>(null);
const sortBy = ref<string | null>(null);
const sortOrder = ref<string>('asc');
const searchQuery = ref<string>('');

const isLoading = ref(false);
let searchTimeout: number | null = null;

const sortOptions = [
	{ value: 'title', label: 'Название' },
	{ value: 'dueDate', label: 'Дата выполнения' },
	{ value: 'createdAt', label: 'Дата создания' },
	{ value: 'isCompleted', label: 'Статус' },
];

const filteredTasks = computed(() => tasksStore.tasks.items);
const totalPages = computed(() =>
	Math.ceil(tasksStore.tasks.totalCount / tasksStore.tasks.pageSize)
);

watch(searchQuery, () => {
	if (searchTimeout) {
		clearTimeout(searchTimeout);
	}
	isLoading.value = true;
	searchTimeout = setTimeout(async () => {
		try {
			await tasksStore.fetchTasks(
				1,
				isCompleted.value,
				sortBy.value,
				sortOrder.value,
				searchQuery.value
			);
		} catch (err) {
			error.value = (err as Error).message;
		} finally {
			isLoading.value = false;
		}
	}, 500);
});

watch([isCompleted, sortBy, sortOrder], () => {
	searchQuery.value = '';
	isLoading.value = true;
	applyFilters().finally(() => {
		isLoading.value = false;
	});
});

onMounted(async () => {
	try {
		isLoading.value = true;
		await tasksStore.fetchTasks();
	} catch (err) {
		error.value = (err as Error).message;
		if (err.message.includes('401') || err.message.includes('авторизации')) {
			router.push('/login');
		}
	} finally {
		isLoading.value = false;
	}
});

async function changePage(page: number) {
	if (page < 1 || page > totalPages.value) return;
	try {
		isLoading.value = true;
		await tasksStore.fetchTasks(
			page,
			isCompleted.value,
			sortBy.value,
			sortOrder.value,
			searchQuery.value
		);
	} catch (err) {
		error.value = (err as Error).message;
	} finally {
		isLoading.value = false;
	}
}

async function deleteTask(taskId: number) {
	try {
		isLoading.value = true;
		await tasksStore.deleteTask(taskId);
		await tasksStore.fetchTasks(
			tasksStore.tasks.page,
			isCompleted.value,
			sortBy.value,
			sortOrder.value,
			searchQuery.value
		);
	} catch (err) {
		error.value = (err as Error).message;
	} finally {
		isLoading.value = false;
	}
}

async function applyFilters() {
	try {
		await tasksStore.fetchTasks(
			1,
			isCompleted.value,
			sortBy.value,
			sortOrder.value,
			searchQuery.value
		);
	} catch (err) {
		error.value = (err as Error).message;
		console.error('Apply filters error:', err);
	}
}
</script>

<template>
	<div class="container mt-5">
		<h1>Список задач</h1>
		<button class="btn btn-danger mb-3" @click="authStore.logout">Выйти</button>
		<div v-if="error" class="alert alert-danger">{{ error }}</div>

		<div class="mb-4">
			<div class="row">
				<div class="col-md-4">
					<label for="sortBy" class="form-label">Сортировать по</label>
					<select id="sortBy" v-model="sortBy" class="form-select">
						<option :value="null">Без сортировки</option>
						<option
							v-for="option in sortOptions"
							:key="option.value"
							:value="option.value"
						>
							{{ option.label }}
						</option>
					</select>
				</div>
				<div class="col-md-4">
					<label for="sortOrder" class="form-label">Порядок</label>
					<select id="sortOrder" v-model="sortOrder" class="form-select">
						<option value="asc">По возрастанию</option>
						<option value="desc">По убыванию</option>
					</select>
				</div>
				<div class="col-md-4">
					<label for="statusFilter" class="form-label">Статус</label>
					<select id="statusFilter" v-model="isCompleted" class="form-select">
						<option :value="null">Все статусы</option>
						<option :value="true">Выполненные</option>
						<option :value="false">Не выполненные</option>
					</select>
				</div>
			</div>
			<div class="row mt-3">
				<div class="col-md-12">
					<label for="searchInput" class="form-label">Поиск</label>
					<div class="input-group">
						<input
							id="searchInput"
							v-model="searchQuery"
							type="text"
							class="form-control"
							placeholder="Поиск по названию или описанию"
						/>
						<span v-if="isLoading" class="input-group-text">
							<div class="spinner-border spinner-border-sm" role="status">
								<span class="visually-hidden">Загрузка...</span>
							</div>
						</span>
					</div>
				</div>
			</div>
		</div>

		<div class="row" v-if="filteredTasks.length">
			<div class="col-md-4 mb-3" v-for="task in filteredTasks" :key="task.id">
				<div class="card">
					<div class="card-body">
						<h5 class="card-title">{{ task.title }}</h5>
						<p class="card-text">
							<strong>Описание:</strong> {{ task.description || '-' }}
						</p>
						<p class="card-text">
							<strong>Дата выполнения:</strong> {{ task.dueDate || '-' }}
						</p>
						<p class="card-text">
							<strong>Статус:</strong>
							{{ task.isCompleted ? 'Выполнена' : 'Не выполнена' }}
						</p>
						<p class="card-text">
							<strong>Категория:</strong> {{ task.categoryName || '-' }}
						</p>
						<button class="btn btn-danger btn-sm" @click="deleteTask(task.id)">
							Удалить
						</button>
					</div>
				</div>
			</div>
		</div>
		<p v-else>Задачи отсутствуют.</p>

		<nav v-if="totalPages > 1">
			<ul class="pagination justify-content-center">
				<li
					class="page-item"
					:class="{ disabled: tasksStore.tasks.page === 1 }"
				>
					<button
						class="page-link"
						@click="changePage(tasksStore.tasks.page - 1)"
					>
						Назад
					</button>
				</li>
				<li
					class="page-item"
					:class="{ disabled: tasksStore.tasks.page === totalPages }"
				>
					<button
						class="page-link"
						@click="changePage(tasksStore.tasks.page + 1)"
					>
						Вперёд
					</button>
				</li>
			</ul>
		</nav>
	</div>
</template>
<style scoped>
.spinner-border {
	margin-right: 0.5rem;
}
</style>
