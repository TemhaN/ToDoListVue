<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useTasksStore } from '@/stores/tasks';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import type { CategoryDto } from '@/stores/tasks';

const tasksStore = useTasksStore();
const authStore = useAuthStore();
const router = useRouter();

const form = ref({
  title: '',
  description: '',
  dueDate: '',
  categoryIds: [] as number[],
});
const categories = ref<CategoryDto[]>([]);
const error = ref<string | null>(null);
const isLoading = ref(false);

onMounted(async () => {
  try {
    isLoading.value = true;

		categories.value = await tasksStore.fetchCategories();

  } catch (err) {
    // error.value = 'Не удалось загрузить категории: ' + (err as Error).message;
    console.error('Не удалось загрузить категории::', err);
  } finally {
    isLoading.value = false;
  }
});

async function submitForm() {
  if (!form.value.title.trim()) {
    error.value = 'Название задачи обязательно';
    return;
  }

  try {
    isLoading.value = true;
    let dueDate: string | undefined = undefined;

    await tasksStore.createTask({
      title: form.value.title,
      description: form.value.description || undefined,
      dueDate,
      categoryIds: form.value.categoryIds.length ? form.value.categoryIds : undefined,
    });
    router.push('/');
  } catch (err) {
    error.value = 'Ошибка создания задачи: ' + (err as Error).message;
    // console.error('Ошибка создания задачи:', err);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="container mt-5">
    <h1>Добавить задачу</h1>
    <router-link to="/" class="btn btn-secondary mb-3">Назад</router-link>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="isLoading" class="alert alert-info">Загрузка...</div>
    <div v-if="!categories.length && !isLoading" class="alert alert-warning">
      Категории не найдены. Проверьте подключение к API.
    </div>

    <form @submit.prevent="submitForm">
      <div class="mb-3">
        <label for="title" class="form-label">Название</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          class="form-control"
          required
        />
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">Описание</label>
        <textarea
          id="description"
          v-model="form.description"
          class="form-control"
          rows="4"
        ></textarea>
      </div>
      <div class="mb-3">
        <label for="dueDate" class="form-label">Дата выполнения</label>
        <input
          id="dueDate"
          v-model="form.dueDate"
          type="datetime-local"
          class="form-control"
        />
      </div>
      <div class="mb-3">
        <label for="categoryIds" class="form-label">Категории</label>
        <select
          id="categoryIds"
          v-model="form.categoryIds"
          class="form-select"
          multiple
          :disabled="isLoading || !categories.length"
        >
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name || 'Без названия' }} ({{ category.isGlobal ? 'Глобальная' : 'Пользовательская' }})
          </option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary" :disabled="isLoading">
        {{ isLoading ? 'Создание...' : 'Создать задачу' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
select[multiple] {
  height: 200px;
}
</style>