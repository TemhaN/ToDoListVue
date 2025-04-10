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
	],
});

router.beforeEach((to, from, next) => {
	const authStore = useAuthStore();
	if (to.meta.requiresAuth && !authStore.isAuthenticated) {
		next('/login');
	} else {
		next();
	}
});

export default router;