import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../store/auth';

import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: () => import('../views/Dashboard.vue'), 
    meta: { requiresAuth: true } 
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: () => import('../views/AdminPanel.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Aguarda a inicialização do estado (sessão) se ainda não ocorreu
  if (!authStore.isInitialized) {
    await authStore.fetchProfile();
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (requiresAuth && !authStore.token) {
    next('/login');
  } else if (requiresAdmin && authStore.user?.role !== 'admin') {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
