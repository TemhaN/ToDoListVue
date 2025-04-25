<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import { useCategoriesStore } from '@/stores/categories';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue';
import type { CategoryDto } from '@/types';

const categoriesStore = useCategoriesStore();
const error = ref<string | null>(null);
const isLoading = ref(false);

const categoryName = ref('');
const editingCategoryId = ref<number | null>(null);
const showDeleteConfirm = ref(false);
const categoryToDelete = ref<number | null>(null);

const globalCategories = computed(() =>
	categoriesStore.categories.filter(c => c.isGlobal)
);
const userCategories = computed(() =>
	categoriesStore.categories.filter(c => !c.isGlobal)
);

onMounted(async () => {
	try {
		isLoading.value = true;
		await categoriesStore.fetchCategories();
	} catch (err) {
		error.value = (err as Error).message;
	}
	isLoading.value = false;
});

async function addOrUpdateCategory() {
	if (!categoryName.value.trim()) {
		error.value = 'Введите имя категории';
		return;
	}

	try {
		isLoading.value = true;
		if (editingCategoryId.value) {
			await categoriesStore.updateCategory(
				editingCategoryId.value,
				categoryName.value.trim()
			);
			error.value = 'Категория обновлена';
		} else {
			await categoriesStore.createCategory(categoryName.value.trim());
			error.value = 'Категория создана';
		}
		categoryName.value = '';
		editingCategoryId.value = null;
	} catch (err) {
		error.value = (err as Error).message;
	}
	isLoading.value = false;
}

function editCategory(category: CategoryDto) {
	if (category.isGlobal) {
		error.value = 'Глобальные категории нельзя редактировать';
		return;
	}
	categoryName.value = category.name;
	editingCategoryId.value = category.id;
}

function confirmDeleteCategory(id: number) {
	const category = categoriesStore.categories.find(c => c.id === id);
	if (!category) {
		error.value = 'Категория не найдена';
		return;
	}
	if (category.isGlobal) {
		error.value = 'Глобальные категории нельзя удалять';
		return;
	}
	categoryToDelete.value = id;
	showDeleteConfirm.value = true;
}

async function deleteCategory() {
	if (!categoryToDelete.value) return;
	try {
		isLoading.value = true;
		await categoriesStore.deleteCategory(categoryToDelete.value);
		error.value = 'Категория удалена';
	} catch (err) {
		error.value = (err as Error).message;
	}
	isLoading.value = false;
	showDeleteConfirm.value = false;
	categoryToDelete.value = null;
}

function cancelEdit() {
	categoryName.value = '';
	editingCategoryId.value = null;
}
</script>

<template>
	<div class="container py-5">
		<div class="row justify-content-center">
			<div class="col-lg-10">
				<div class="d-flex justify-content-between align-items-center mb-4">
					<h1 class="mb-0">Управление категориями</h1>
					<router-link
						to="/"
						class="btn btn-outline-secondary rounded-pill px-4"
					>
						<i class="bi bi-arrow-left me-2"></i>Вернуться к задачам
					</router-link>
				</div>

				<div class="card mb-4 rounded-4 border-0 shadow-sm">
					<div class="card-body p-4">
						<div
							v-if="error"
							class="alert alert-dismissible fade show rounded-3 mb-4"
							:class="
								error.includes('создана') ||
								error.includes('обновлена') ||
								error.includes('удалена')
									? 'alert-success'
									: 'alert-danger'
							"
						>
							{{ error }}
							<button
								type="button"
								class="btn-close"
								@click="error = null"
							></button>
						</div>

						<form @submit.prevent="addOrUpdateCategory" class="mb-4">
							<div class="mb-3">
								<label for="categoryName" class="form-label"
									>Имя категории</label
								>
								<input
									id="categoryName"
									v-model="categoryName"
									type="text"
									class="form-control rounded-pill py-2"
									placeholder="Введите имя категории"
									:disabled="isLoading"
								/>
							</div>
							<div class="d-flex gap-2">
								<button
									type="submit"
									class="btn btn-primary rounded-pill px-4"
									:disabled="isLoading"
								>
									<i
										class="bi bi-plus-circle me-2"
										v-if="!editingCategoryId"
									></i>
									<i class="bi bi-save me-2" v-else></i>
									{{ editingCategoryId ? 'Обновить' : 'Добавить' }}
								</button>
								<button
									v-if="editingCategoryId"
									type="button"
									class="btn btn-outline-secondary rounded-pill px-4"
									@click="cancelEdit"
									:disabled="isLoading"
								>
									<i class="bi bi-x-circle me-2"></i>Отмена
								</button>
							</div>
						</form>

						<div class="row">
							<div class="col-md-6">
								<h4 class="mb-3">Пользовательские категории</h4>
								<ul class="list-group" v-if="userCategories.length">
									<li
										class="list-group-item d-flex justify-content-between align-items-center rounded-3 mb-2"
										v-for="category in userCategories"
										:key="category.id"
									>
										{{ category.name }}
										<div class="d-flex gap-2">
											<button
												class="btn btn-outline-warning btn-sm rounded-pill px-3"
												@click="editCategory(category)"
												:disabled="isLoading"
											>
												<i class="bi bi-pencil me-1"></i>Редактировать
											</button>
											<button
												class="btn btn-outline-danger btn-sm rounded-pill px-3"
												@click="confirmDeleteCategory(category.id)"
												:disabled="isLoading"
											>
												<i class="bi bi-trash me-1"></i>Удалить
											</button>
										</div>
									</li>
								</ul>
								<p v-else class="text-muted">
									Пользовательские категории отсутствуют.
								</p>
							</div>
							<div class="col-md-6">
								<h4 class="mb-3">Глобальные категории</h4>
								<ul class="list-group" v-if="globalCategories.length">
									<li
										class="list-group-item rounded-3 mb-2"
										v-for="category in globalCategories"
										:key="category.id"
									>
										{{ category.name }}
									</li>
								</ul>
								<p v-else class="text-muted">
									Глобальные категории отсутствуют.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<ConfirmDeleteModal
			:isVisible="showDeleteConfirm"
			:isLoading="isLoading"
			title="Подтверждение удаления"
			message="Вы уверены, что хотите удалить категорию?"
			@confirm="deleteCategory"
			@cancel="showDeleteConfirm = false"
		/>
	</div>
</template>
