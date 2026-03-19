<template>
  <div id="app">
    <div v-if="!authStore.isInitialized" class="app-loading">
      <div class="spinner-container">
        <span class="spinner"></span>
        <p>Iniciando o Atende+...</p>
      </div>
    </div>
    <router-view v-else></router-view>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from './store/auth';
const authStore = useAuthStore();
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --primary-color: #4A90E2;      /* Light/Soft Blue - Trust */
  --primary-hover: #357ABD;
  --success-color: #68D391;      /* Soft Green - Health */
  --success-hover: #48BB78;
  --danger-color: #FC8181;       /* Soft Red */
  --danger-hover: #F56565;
  --bg-color: #F7FAFC;           /* Clean light background */
  --card-bg: #FFFFFF;
  --text-main: #2D3748;          /* Soft Dark Gray */
  --text-muted: #718096;
  --border-color: #E2E8F0;
  
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.05);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.05);
  
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-color);
  color: var(--text-main);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

* {
  box-sizing: border-box;
}

h1, h2, h3, h4 {
  color: var(--primary-color);
  margin-top: 0;
  font-weight: 600;
}

.app-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: var(--bg-color);
  color: var(--primary-color);
  font-weight: 500;
}
.spinner-container {
  text-align: center;
}
.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(74, 144, 226, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
