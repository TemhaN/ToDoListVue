import type { CategoryDto } from '@/types';

export function formatDate(date: string | null): string {
	if (!date) return '-';
	return new Date(date).toLocaleString('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

export function formatCategories(
	categories: CategoryDto[] | undefined
): string {
	if (!categories || !categories.length) return '-';
	return categories.map(cat => cat.name || 'Без названия').join(', ');
}
