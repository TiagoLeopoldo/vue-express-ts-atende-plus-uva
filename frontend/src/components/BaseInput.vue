<template>
  <div class="input-wrapper">
    <label v-if="label">{{ label }}</label>
    
    <slot v-if="$slots.default"></slot>
    <template v-else>
      <input 
        v-if="type !== 'textarea'"
        :type="type" 
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="placeholder"
        :required="required"
        :minlength="minlength"
        :pattern="pattern"
        :title="title"
        class="base-input"
      />
      <textarea 
        v-else
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        :placeholder="placeholder"
        :required="required"
        class="base-input textarea"
        rows="4"
      ></textarea>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSlots } from 'vue';

defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  minlength: { type: [String, Number] },
  pattern: { type: String },
  title: { type: String }
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.input-wrapper {
  margin-bottom: 20px;
  text-align: left;
  width: 100%;
}
label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-muted);
  font-size: 0.95rem;
}
.base-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-family: inherit;
  color: var(--text-main);
  background-color: var(--card-bg);
  transition: all 0.2s ease;
}
.base-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15);
}
.base-input::placeholder {
  color: #A0AEC0;
}
.textarea {
  resize: vertical;
  min-height: 100px;
}
</style>
