export function getErrorMessage(error: any): string {
	if (error.response) {
		if (typeof error.response.data === 'string') {
			return error.response.data;
		}
		return error.response.data?.message || 'Неизвестная ошибка сервера';
	}
	return error.message || 'Неизвестная ошибка';
}
