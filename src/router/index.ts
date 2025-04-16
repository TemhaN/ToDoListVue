import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			name: 'home',
			component: () => import('@/views/Home.vue'),
			meta: { requiresAuth: true },
		},
		{
			path: '/login',
			name: 'login',
			component: () => import('@/components/Login.vue'),
		},
		{
			path: '/register',
			name: 'register',
			component: () => import('@/components/Register.vue'),
		},
		{
			path: '/add-task',
			name: 'AddTask',
			component: () => import('@/views/AddTask.vue'),
			meta: { requiresAuth: true },
		},
		{
			path: '/edit-task/:id',
			name: 'EditTask',
			component: () => import('@/views/EditTask.vue'),
			meta: { requiresAuth: true },
		},
	],
});

router.beforeEach(async (to, from, next) => {
	const authStore = useAuthStore();
	await authStore.initialize();
	if (to.meta.requiresAuth && !authStore.user) {
		next('/login');
	} else {
		next();
	}
});

export default router;
