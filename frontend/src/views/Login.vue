<template>
  <div class="auth-page">
    <BaseCard class="auth-card">
      <div class="header-text">
        <h1 class="brand-title">Atende+</h1>
        <p class="brand-subtitle">Sistema inteligente de agendamento</p>
        <h2>{{ texts.auth.loginTitle }}</h2>
      </div>

      <form @submit.prevent="handleLogin">
        <BaseInput 
          v-model="form.email" 
          type="email" 
          :label="texts.auth.emailLabel" 
          required 
        />
        <BaseInput 
          v-model="form.password" 
          type="password" 
          :label="texts.auth.passwordLabel" 
          required 
          autocomplete="current-password"
        />
        
        <BaseButton type="submit" :loading="loading" variant="primary">
          {{ texts.auth.loginSubmit }}
        </BaseButton>

        <BaseAlert :show="!!error" type="error">{{ error }}</BaseAlert>
      </form>

      <div class="auth-footer">
        <p>{{ texts.auth.noAccount }}</p>
        <router-link to="/register" class="link">{{ texts.auth.noAccountLink }}</router-link>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../store/auth';
import { texts } from '../constants/texts';
import BaseCard from '../components/BaseCard.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseAlert from '../components/BaseAlert.vue';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({ email: '', password: '' });
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await api.post('/auth/login', form);
    authStore.setAuth(data.user, data.token);
    if (data.user.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || texts.auth.loginError;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}
.auth-card {
  width: 100%;
  max-width: 420px;
  animation: fadeIn 0.4s ease;
}
.header-text {
  text-align: center;
  margin-bottom: 30px;
}
.brand-title {
  font-size: 2.4rem;
  color: var(--primary-color);
  margin: 0 0 5px 0;
  font-weight: 700;
  letter-spacing: -0.5px;
}
.brand-subtitle {
  color: var(--text-muted);
  font-size: 1rem;
  margin: 0 0 20px 0;
}
.header-text h2 {
  font-size: 1.3rem;
  margin-bottom: 8px;
  color: var(--text-main);
  font-weight: 600;
}
.feedback {
  text-align: center;
  margin-top: 20px;
  padding: 12px;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
}
.error {
  background-color: rgba(252, 129, 129, 0.1);
  color: var(--danger-color);
  border: 1px solid rgba(252, 129, 129, 0.2);
}
.auth-footer {
  margin-top: 25px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}
.auth-footer p {
  color: var(--text-muted);
  margin-bottom: 5px;
  font-size: 0.95rem;
}
.link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}
.link:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
