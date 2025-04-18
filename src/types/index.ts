export interface LoginDto {
	email: string;
	password: string;
}

export interface RegisterDto {
	email: string;
	password: string;
	username: string;
}

export interface CategoryDto {
	id: number;
	name: string;
	isGlobal: boolean;
}

export interface CategoryCreateDto {
	name: string;
}

export interface CategoryUpdateDto {
	name: string;
}

export interface TaskCategoryInput {
	id: number;
	isGlobal: boolean;
}

export interface Task {
	id: number;
	title: string;
	description?: string;
	isCompleted: boolean;
	dueDate?: string;
	createdAt: string;
	categories?: CategoryDto[];
}
export interface PagedResult<T> {
	items: T[];
	totalCount: number;
	page: number;
	pageSize: number;
}