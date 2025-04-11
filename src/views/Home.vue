<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTasksStore } from '@/stores/tasks';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const tasksStore = useTasksStore();
const error = ref<string | null>(null);
const router = useRouter();

onMounted(async () => {
  try {
    await tasksStore.fetchTasks();
  } catch (err) {
    error.value = (err as Error).message;
    if (err.message.includes('401') || err.message.includes('авторизации')) {
      router.push('/login');
    }
  }
});

async function changePage(page: number) {
  if (
    page < 1 ||
    page > Math.ceil(tasksStore.tasks.totalCount / tasksStore.tasks.pageSize)
  )
    return;
  try {
    await tasksStore.fetchTasks(page);
  } catch (err) {
    error.value = (err as Error).message;
    if (err.message.includes('401') || err.message.includes('авторизации')) {
      router.push('/login');
    }
  }
}

async function deleteTask(taskId: number) {
  try {
    await tasksStore.deleteTask(taskId);
    await tasksStore.fetchTasks(tasksStore.tasks.page);
  } catch (err) {
    error.value = (err as Error).message;
  }
}
</script>

<template>
  <div class="container mt-5">
    <h1>Список задач</h1>
    <button class="btn btn-danger mb-3" @click="authStore.logout">Выйти</button>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div class="row" v-if="tasksStore.tasks.items.length">
      <div
        class="col-md-4 mb-3"
        v-for="task in tasksStore.tasks.items"
        :key="task.id"
      >
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
            <button
              class="btn btn-danger btn-sm"
              @click="deleteTask(task.id)"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
    <p v-else>Задачи отсутствуют.</p>

    <nav v-if="tasksStore.tasks.totalCount > tasksStore.tasks.pageSize">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: tasksStore.tasks.page === 1 }">
          <button
            class="page-link"
            @click="changePage(tasksStore.tasks.page - 1)"
          >
            Назад
          </button>
        </li>
        <li
          class="page-item"
          :class="{
            disabled:
              tasksStore.tasks.page * tasksStore.tasks.pageSize >=
              tasksStore.tasks.totalCount,
          }"
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