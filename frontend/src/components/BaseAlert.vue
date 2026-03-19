<template>
  <div v-if="show" :class="['base-alert', type]">
    <div class="icon">
      <span v-if="type === 'success'">✔️</span>
      <span v-if="type === 'error'">⚠️</span>
      <span v-if="type === 'info'">ℹ️</span>
    </div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  show: { type: Boolean, default: false },
  type: { type: String, default: 'info' } // 'success', 'error', 'info'
});
</script>

<style scoped>
.base-alert {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  margin-top: 16px;
  margin-bottom: 16px;
  font-size: 0.95rem;
  animation: slideIn 0.3s ease;
}
.icon {
  margin-right: 12px;
  font-size: 1.2rem;
}
.success {
  background-color: rgba(104, 211, 145, 0.1);
  color: #2F855A;
  border: 1px solid rgba(104, 211, 145, 0.2);
}
.error {
  background-color: rgba(252, 129, 129, 0.1);
  color: var(--danger-color);
  border: 1px solid rgba(252, 129, 129, 0.2);
}
.info {
  background-color: rgba(74, 144, 226, 0.1);
  color: var(--primary-color);
  border: 1px solid rgba(74, 144, 226, 0.2);
}
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
