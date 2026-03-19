<template>
  <div class="empty-state">
    <div class="icon-wrapper">
      <span class="icon">{{ icon }}</span>
    </div>
    <h4 class="title">{{ title }}</h4>
    <p v-if="description" class="description">{{ description }}</p>
    <div class="action" v-if="$slots.action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  icon: { type: String, default: '📭' },
  title: { type: String, required: true },
  description: { type: String, default: '' }
});
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: #F8FAFC;
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-color);
}
.icon-wrapper {
  margin-bottom: 16px;
}
.icon {
  font-size: 3rem;
  opacity: 0.5;
}
.title {
  color: var(--text-main);
  margin-bottom: 8px;
  font-size: 1.1rem;
}
.description {
  color: var(--text-muted);
  font-size: 0.95rem;
  max-width: 400px;
  margin: 0 auto 24px auto;
}
</style>
