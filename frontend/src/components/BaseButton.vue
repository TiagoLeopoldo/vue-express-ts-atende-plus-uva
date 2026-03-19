<template>
  <button 
    :class="['base-button', variant, { 'is-loading': loading }]" 
    :disabled="disabled || loading" 
    @click="$emit('click')"
  >
    <span v-if="loading" class="spinner"></span>
    <slot v-else></slot>
  </button>
</template>

<script setup lang="ts">
defineProps({
  variant: { type: String, default: 'primary' }, // primary, success, danger, secondary, outline
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
});
defineEmits(['click']);
</script>

<style scoped>
.base-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  border: none;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  margin-bottom: 0.5rem;
}

.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary { background-color: var(--primary-color); color: #fff; }
.primary:not(:disabled):hover { background-color: var(--primary-hover); transform: translateY(-1px); }

.success { background-color: var(--success-color); color: #fff; }
.success:not(:disabled):hover { background-color: var(--success-hover); transform: translateY(-1px); }

.danger { background-color: var(--danger-color); color: #fff; }
.danger:not(:disabled):hover { background-color: var(--danger-hover); transform: translateY(-1px); }

.outline { 
  background-color: transparent; 
  color: var(--primary-color); 
  border: 1px solid var(--primary-color); 
}
.outline:not(:disabled):hover { 
  background-color: rgba(74, 144, 226, 0.05); 
}

.secondary { 
  background-color: var(--card-bg); 
  color: var(--text-muted); 
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  font-size: 0.9rem;
}
.secondary:not(:disabled):hover { 
  background-color: var(--bg-color); 
  color: var(--text-main); 
}

.spinner {
  width: 20px; 
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}
</style>
