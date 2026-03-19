import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any | null,
    token: localStorage.getItem('token') || null,
    isInitialized: false,
  }),
  actions: {
    setAuth(user: any, token: string) {
      this.user = user;
      this.token = token;
      localStorage.setItem('token', token);
    },
    logout() {
      this.user = null;
      this.token = null;
      this.isInitialized = true;
      localStorage.removeItem('token');
    },
    async fetchProfile() {
      if (!this.token) {
        this.isInitialized = true;
        return;
      }
      try {
        const { default: api } = await import('../services/api');
        const { data } = await api.get('/auth/profile');
        this.user = data;
      } catch (err) {
        console.error('Falha ao restaurar sessão:', err);
        this.logout();
      } finally {
        this.isInitialized = true;
      }
    },
  },
});
