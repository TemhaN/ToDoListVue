export interface LoginDto {
	email: string;
	password: string;
}

export interface RegisterDto {
	email: string;
	password: string;
	username: string;
}
export interface Task {
	id: number;
	title: string;
	description?: string;
	isCompleted: boolean;
	dueDate?: string;
	createdAt: string;
	categoryName?: string;
	categoryIds?: number[];
}

export interface PagedResult<T> {
	items: T[];
	totalCount: number;
	page: number;
	pageSize: number;
}