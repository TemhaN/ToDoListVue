<script lang="ts" setup>
import { ref } from 'vue';

defineProps<{
	isVisible: boolean;
	isLoading: boolean;
	title: string;
	message: string;
}>();

defineEmits<{
	(e: 'confirm'): void;
	(e: 'cancel'): void;
}>();
</script>

<template>
	<div
		v-if="isVisible"
		class="modal fade show"
		style="display: block"
		tabindex="-1"
	>
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content rounded-4 border-0 shadow-sm">
				<div class="modal-header border-0">
					<h5 class="modal-title fw-bold">{{ title }}</h5>
					<button
						type="button"
						class="btn-close"
						@click="$emit('cancel')"
						:disabled="isLoading"
					></button>
				</div>
				<div class="modal-body">{{ message }}</div>
				<div class="modal-footer border-0">
					<button
						type="button"
						class="btn btn-outline-secondary rounded-pill px-4"
						@click="$emit('cancel')"
						:disabled="isLoading"
					>
						<i class="bi bi-x-circle me-2"></i>Отмена
					</button>
					<button
						type="button"
						class="btn btn-outline-danger rounded-pill px-4"
						@click="$emit('confirm')"
						:disabled="isLoading"
					>
						<i class="bi bi-trash me-2"></i>Удалить
					</button>
				</div>
			</div>
		</div>
	</div>
	<div v-if="isVisible" class="modal-backdrop fade show"></div>
</template>