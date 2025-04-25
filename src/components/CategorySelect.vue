<script lang="ts" setup>
import { computed } from 'vue';
import type { CategoryDto } from '@/types';

const props = defineProps<{
	categories: CategoryDto[];
	modelValue: { id: number; isGlobal: boolean }[];
	isLoading: boolean;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: { id: number; isGlobal: boolean }[]): void;
}>();

const globalCategories = computed(() =>
	props.categories.filter(c => c.isGlobal)
);
const userCategories = computed(() =>
	props.categories.filter(c => !c.isGlobal)
);

const localSelectedValues = computed({
	get() {
		return props.modelValue.map(cat => `${cat.id}:${cat.isGlobal}`);
	},
	set(newValues: string[]) {
		const selectedCategories = newValues.map(value => {
			const [id, isGlobal] = value.split(':');
			return { id: Number(id), isGlobal: isGlobal === 'true' };
		});
		emit('update:modelValue', selectedCategories);
	},
});
</script>

<template>
	<div class="mb-4">
		<label for="categoryIds" class="form-label fw-semibold mb-2"
			>Категории</label
		>
		<div class="input-group">
			<select
				id="categoryIds"
				v-model="localSelectedValues"
				class="form-select rounded-3 py-2"
				multiple
				:disabled="isLoading || !categories.length"
				style="min-height: 120px"
			>
				<optgroup label="Глобальные категории" class="optgroup-style">
					<option
						v-for="category in globalCategories"
						:key="'global_' + category.id"
						:value="`${category.id}:true`"
						class="option-style"
					>
						<span class="badge bg-primary me-2">
							<i class="bi bi-globe"></i>
						</span>
						{{ category.name || 'Без названия' }}
					</option>
				</optgroup>
				<optgroup label="Пользовательские категории" class="optgroup-style">
					<option
						v-for="category in userCategories"
						:key="'user_' + category.id"
						:value="`${category.id}:false`"
						class="option-style"
					>
						<span class="badge bg-success me-2">
							<i class="bi bi-person"></i>
						</span>
						{{ category.name || 'Без названия' }}
					</option>
				</optgroup>
			</select>
			<span class="input-group-text bg-transparent">
				<i class="bi bi-tags fs-5"></i>
			</span>
		</div>
		<small class="text-muted mt-1 d-block"
			>Выберите одну или несколько категорий (для множественного выбора
			используйте Ctrl/Cmd)</small
		>
	</div>
</template>
