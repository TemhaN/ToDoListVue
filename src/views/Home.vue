<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTasksStore } from '@/stores/tasks';
import { useRouter } from 'vue-router';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue';
import { formatDate, formatCategories } from '@/utils/formatUtils';

const authStore = useAuthStore();
const tasksStore = useTasksStore();
const router = useRouter();

const error = ref<string | null>(null);
const isCompleted = ref<boolean | null>(null);
const sortBy = ref<string | null>(null);
const sortOrder = ref<string>('asc');
const searchQuery = ref<string>('');
const isLoading = ref(false);
const showDeleteConfirm = ref(false);
const taskToDelete = ref<number | null>(null);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

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
		}
		isLoading.value = false;
	}, 500);
});

watch([isCompleted, sortBy, sortOrder], () => {
	searchQuery.value = '';
	isLoading.value = true;
	applyFilters()
		.then(() => {
			isLoading.value = false;
		})
		.catch(() => {
			isLoading.value = false;
		});
});

onMounted(async () => {
	try {
		isLoading.value = true;
		await tasksStore.fetchTasks();
	} catch (err) {
		error.value = (err as Error).message;
	}
	isLoading.value = false;
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
	}
	isLoading.value = false;
}

async function completeTask(taskId: number) {
	try {
		isLoading.value = true;
		await tasksStore.completeTask(taskId);
		await tasksStore.fetchTasks(
			tasksStore.tasks.page,
			isCompleted.value,
			sortBy.value,
			sortOrder.value,
			searchQuery.value
		);
	} catch (err) {
		error.value = 'Ошибка при отметке задачи: ' + (err as Error).message;
	}
	isLoading.value = false;
}

function confirmDelete(taskId: number) {
	taskToDelete.value = taskId;
	showDeleteConfirm.value = true;
}

async function deleteTask() {
	if (!taskToDelete.value) return;
	try {
		isLoading.value = true;
		await tasksStore.deleteTask(taskToDelete.value);
		await tasksStore.fetchTasks(
			tasksStore.tasks.page,
			isCompleted.value,
			sortBy.value,
			sortOrder.value,
			searchQuery.value
		);
	} catch (err) {
		error.value = 'Ошибка при удалении задачи: ' + (err as Error).message;
	}
	isLoading.value = false;
	showDeleteConfirm.value = false;
	taskToDelete.value = null;
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
		error.value = 'Ошибка при применении фильтров: ' + (err as Error).message;
	}
}
</script>

<template>
	<div class="container py-5">
		<div class="row justify-content-center">
			<div class="col-lg-10">
				<div class="d-flex justify-content-between align-items-center mb-4">
					<h1 class="mb-0">
						Список задач
						<span v-if="authStore.user" class="text-muted"
							>для {{ authStore.user.username }}</span
						>
					</h1>
					<button
						class="btn btn-outline-danger rounded-pill"
						@click="authStore.logout"
					>
						Выйти
					</button>
				</div>

				<div class="d-flex mb-4 gap-2">
					<router-link to="/add-task" class="btn btn-primary rounded-pill px-4">
						<i class="bi bi-plus-circle me-2"></i>Добавить задачу
					</router-link>
					<router-link
						to="/categories"
						class="btn btn-outline-secondary rounded-pill px-4"
					>
						<i class="bi bi-tags me-2"></i>Управление категориями
					</router-link>
				</div>

				<div
					v-if="error"
					class="alert alert-danger alert-dismissible fade show mb-4 rounded-3"
				>
					{{ error }}
					<button
						type="button"
						class="btn-close"
						@click="error = null"
					></button>
				</div>

				<div class="card mb-4 rounded-4 border-0 shadow-sm">
					<div class="card-body p-4">
						<div class="row g-3">
							<div class="col-md-4">
								<label for="sortBy" class="form-label">Сортировать по</label>
								<select
									id="sortBy"
									v-model="sortBy"
									class="form-select rounded-pill"
								>
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
							<div class="col-md-3">
								<label for="sortOrder" class="form-label">Порядок</label>
								<select
									id="sortOrder"
									v-model="sortOrder"
									class="form-select rounded-pill"
								>
									<option value="asc">По возрастанию</option>
									<option value="desc">По убыванию</option>
								</select>
							</div>
							<div class="col-md-3">
								<label for="statusFilter" class="form-label">Статус</label>
								<select
									id="statusFilter"
									v-model="isCompleted"
									class="form-select rounded-pill"
								>
									<option :value="null">Все</option>
									<option :value="true">Выполненные</option>
									<option :value="false">Не выполненные</option>
								</select>
							</div>
							<div class="col-md-2">
								<label class="form-label d-block">&nbsp;</label>
								<button
									class="btn btn-outline-secondary w-100 rounded-pill"
									@click="
										() => {
											sortBy = null;
											isCompleted = null;
											sortOrder = 'asc';
											searchQuery = '';
										}
									"
								>
									Сбросить
								</button>
							</div>
						</div>
					</div>
				</div>

				<div class="input-group mb-4">
					<input
						v-model="searchQuery"
						type="text"
						class="form-control rounded-pill"
						placeholder="Поиск по названию или описанию"
					/>
					<span
						v-if="isLoading"
						class="input-group-text bg-transparent rounded-pill"
					>
						<div class="spinner-border spinner-border-sm" role="status">
							<span class="visually-hidden">Загрузка...</span>
						</div>
					</span>
				</div>

				<div v-if="isLoading" class="text-center my-5">
					<div class="spinner-border text-primary" role="status">
						<span class="visually-hidden">Загрузка...</span>
					</div>
				</div>

				<div v-else>
					<div
						v-if="filteredTasks.length"
						class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"
					>
						<div v-for="task in filteredTasks" :key="task.id" class="col">
							<div
								class="card h-100 rounded-4 border-0 shadow-sm overflow-hidden"
							>
								<div class="card-body p-4">
									<div
										class="d-flex justify-content-between align-items-start mb-3"
									>
										<h5 class="card-title mb-0">{{ task.title }}</h5>
										<span
											class="badge rounded-pill"
											:class="task.isCompleted ? 'bg-success' : 'bg-warning'"
										>
											{{ task.isCompleted ? 'Выполнена' : 'Не выполнена' }}
										</span>
									</div>
									<p class="card-text text-muted small mb-2">
										<strong>Дата выполнения:</strong>
										{{ formatDate(task.dueDate) }}
									</p>
									<p class="card-text mb-3">
										{{ task.description || 'Нет описания' }}
									</p>
									<div v-if="task.categories.length" class="mb-3">
										<span
											class="badge bg-light text-dark me-1 mb-1 rounded-pill"
											v-for="cat in task.categories"
											:key="cat.id"
										>
											{{ cat.name }}
										</span>
									</div>
									<div class="d-flex flex-wrap gap-2">
										<button
											v-if="!task.isCompleted"
											class="btn btn-sm btn-outline-success rounded-pill"
											@click="completeTask(task.id)"
										>
											Выполнить
										</button>
										<router-link
											:to="`/edit-task/${task.id}`"
											class="btn btn-sm btn-outline-primary rounded-pill"
										>
											Редактировать
										</router-link>
										<button
											class="btn btn-sm btn-outline-danger rounded-pill"
											@click="confirmDelete(task.id)"
										>
											Удалить
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div v-else class="text-center py-5">
						<h4 class="text-muted mb-4">Задачи не найдены</h4>
						<router-link
							to="/add-task"
							class="btn btn-primary rounded-pill px-4"
						>
							<i class="bi bi-plus-circle me-2"></i>Добавить первую задачу
						</router-link>
					</div>
				</div>

				<nav v-if="totalPages > 1" class="mt-4">
					<ul class="pagination justify-content-center">
						<li
							class="page-item"
							:class="{ disabled: tasksStore.tasks.page === 1 }"
						>
							<button
								class="page-link rounded-start-pill"
								@click="changePage(tasksStore.tasks.page - 1)"
							>
								&laquo;
							</button>
						</li>
						<li class="page-item active">
							<span class="page-link">{{ tasksStore.tasks.page }}</span>
						</li>
						<li
							class="page-item"
							:class="{ disabled: tasksStore.tasks.page === totalPages }"
						>
							<button
								class="page-link rounded-end-pill"
								@click="changePage(tasksStore.tasks.page + 1)"
							>
								&raquo;
							</button>
						</li>
					</ul>
				</nav>
			</div>
		</div>

		<ConfirmDeleteModal
			:isVisible="showDeleteConfirm"
			:isLoading="isLoading"
			title="Подтверждение удаления"
			message="Вы уверены, что хотите удалить задачу?"
			@confirm="deleteTask"
			@cancel="showDeleteConfirm = false"
		/>
	</div>
</template>