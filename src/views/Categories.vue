<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import { useCategoriesStore } from '@/stores/categories';
import type { CategoryDto } from '@/types';

const categoriesStore = useCategoriesStore();
const error = ref<string | null>(null);
const isLoading = ref(false);

const categoryName = ref('');
const editingCategoryId = ref<number | null>(null);
const showDeleteConfirm = ref(false);
const categoryToDelete = ref<number | null>(null);

const globalCategories = computed(() => categoriesStore.categories.filter(c => c.isGlobal));
const userCategories = computed(() => categoriesStore.categories.filter(c => !c.isGlobal));

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
      await categoriesStore.updateCategory(editingCategoryId.value, categoryName.value.trim());
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
    console.error('Delete category error:', err); // Добавлено логирование
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
  <div class="container mt-5">
    <h1>Управление категориями</h1>
    <router-link to="/" class="btn btn-primary mb-3">Вернуться к задачам</router-link>
    <div v-if="error" class="alert" :class="error.includes('создана') || error.includes('обновлена') || error.includes('удалена') ? 'alert-success' : 'alert-danger'">{{ error }}</div>

    <div class="mb-4">
      <form @submit.prevent="addOrUpdateCategory">
        <div class="mb-3">
          <label for="categoryName" class="form-label">Имя категории</label>
          <input
            id="categoryName"
            v-model="categoryName"
            type="text"
            class="form-control"
            placeholder="Введите имя категории"
            :disabled="isLoading"
          />
        </div>
        <button
          type="submit"
          class="btn btn-primary me-2"
          :disabled="isLoading"
        >
          {{ editingCategoryId ? 'Обновить' : 'Добавить' }}
        </button>
        <button
          v-if="editingCategoryId"
          type="button"
          class="btn btn-secondary"
          @click="cancelEdit"
          :disabled="isLoading"
        >
          Отмена
        </button>
      </form>
    </div>

    <div class="row">
      <div class="col-md-6">
        <h4>Пользовательские категории</h4>
        <ul class="list-group" v-if="userCategories.length">
          <li
            class="list-group-item d-flex justify-content-between align-items-center"
            v-for="category in userCategories"
            :key="category.id"
          >
            {{ category.name }}
            <div>
              <button
                class="btn btn-warning btn-sm me-2"
                @click="editCategory(category)"
                :disabled="isLoading"
              >
                Редактировать
              </button>
              <button
                class="btn btn-danger btn-sm"
                @click="confirmDeleteCategory(category.id)"
                :disabled="isLoading"
              >
                Удалить
              </button>
            </div>
          </li>
        </ul>
        <p v-else>Пользовательские категории отсутствуют.</p>
      </div>
      <div class="col-md-6">
        <h4>Глобальные категории</h4>
        <ul class="list-group" v-if="globalCategories.length">
          <li
            class="list-group-item"
            v-for="category in globalCategories"
            :key="category.id"
          >
            {{ category.name }}
          </li>
        </ul>
        <p v-else>Глобальные категории отсутствуют.</p>
      </div>
    </div>

    <div
      v-if="showDeleteConfirm"
      class="modal fade show"
      style="display: block;"
      tabindex="-1"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Подтверждение удаления</h5>
            <button
              type="button"
              class="btn-close"
              @click="showDeleteConfirm = false"
              :disabled="isLoading"
            ></button>
          </div>
          <div class="modal-body">
            Вы уверены, что хотите удалить категорию?
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showDeleteConfirm = false"
              :disabled="isLoading"
            >
              Отмена
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="deleteCategory"
              :disabled="isLoading"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showDeleteConfirm" class="modal-backdrop fade show"></div>
  </div>
</template>

<style scoped>
.spinner-border {
  margin-right: 0.5rem;
}
</style>