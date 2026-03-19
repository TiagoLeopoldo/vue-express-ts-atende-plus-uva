<template>
  <div class="dashboard-layout">
    <header class="dashboard-header">
      <div class="header-container">
        <div class="brand-group">
          <span class="brand-logo">Atende+</span>
          <span class="separator">|</span>
          <h2 class="page-title">{{ texts.dashboard.title }}</h2>
        </div>
        <div class="user-controls">
          <span v-if="authStore.user" class="greeting">{{ texts.dashboard.welcome }} <strong>{{ authStore.user.name }}</strong></span>
          <BaseButton variant="outline" @click="logout" style="width: auto; padding: 8px 16px;">
            {{ texts.dashboard.logoutBtn }}
          </BaseButton>
        </div>
      </div>
    </header>

    <main class="dashboard-content">
      <div class="split-layout">
        <BaseCard class="scheduling-card">
          <h3 class="section-title">{{ texts.dashboard.patientSectionTitle }}</h3>
          <form @submit.prevent="scheduleAppointment">
            <BaseInput 
              v-model="form.date" 
              type="datetime-local" 
              :label="texts.dashboard.dateLabel" 
              required 
            />
            <BaseInput 
              v-model="form.notes" 
              type="textarea" 
              :label="texts.dashboard.notesLabel" 
              placeholder="Ex: Primeira consulta, check-up de rotina..."
            />
            
            <BaseButton type="submit" :loading="scheduling" variant="primary">
              {{ texts.dashboard.scheduleSubmit }}
            </BaseButton>

            <BaseAlert :show="!!feedback.message" :type="feedback.type">
              {{ feedback.message }}
            </BaseAlert>
          </form>
        </BaseCard>

        <BaseCard class="appointments-card">
          <div class="appointments-header">
            <h3 class="section-title">
              {{ texts.dashboard.myAppointmentsTitle }}
            </h3>
            <BaseButton variant="secondary" @click="fetchAppointments" style="width: auto; padding: 6px 12px; font-size: 0.85rem;">
              ↻ Atualizar
            </BaseButton>
          </div>

          <div v-if="fetching" class="loading-state">
            <span class="spinner-blue"></span>
            <p>{{ texts.dashboard.loadingAppointments }}</p>
          </div>
          
          <div class="table-responsive" v-else-if="appointments.length > 0">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>{{ texts.dashboard.tableDate }}</th>
                  <th>{{ texts.dashboard.tableStatus }}</th>
                  <th>{{ texts.dashboard.tableWeather }}</th>
                  <th>{{ texts.dashboard.tableActions }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="apt in appointments" :key="apt._id">
                  <td>
                    <div class="date-cell">
                      <span class="date-main">{{ formatDate(apt.date) }}</span>
                      <span class="date-sub">{{ formatTime(apt.date) }}</span>
                    </div>
                  </td>
                  <td>
                    <span :class="['status-badge', apt.status]">
                      {{ formatStatus(apt.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="weather-cell" v-if="apt.weatherForecast">
                      🌤️ {{ apt.weatherForecast }}
                    </div>
                    <span v-else class="text-muted">Indisponível</span>
                  </td>
                  <td>
                    <BaseButton 
                      v-if="apt.status === 'scheduled'" 
                      variant="danger" 
                      @click="promptCancel(apt._id)"
                      style="padding: 6px 12px; font-size: 0.85rem;"
                    >
                      {{ texts.dashboard.cancelBtn }}
                    </BaseButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <BaseEmptyState 
            v-else 
            icon="📅"
            :title="texts.dashboard.noAppointments" 
            description="Use o formulário para marcar uma nova consulta."
          />
        </BaseCard>
      </div>
    </main>

    <BaseModal 
      :isOpen="isModalOpen" 
      title="Atenção" 
      @close="closeModal"
    >
      <p>{{ texts.dashboard.cancelConfirm }}</p>
      <template #footer>
        <BaseButton variant="secondary" @click="closeModal" style="width: auto;">
          Voltar
        </BaseButton>
        <BaseButton variant="danger" @click="confirmCancel" style="width: auto;">
          Sim, cancelar consulta
        </BaseButton>
      </template>
    </BaseModal>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { texts } from '../constants/texts';
import BaseCard from '../components/BaseCard.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseModal from '../components/BaseModal.vue';
import BaseAlert from '../components/BaseAlert.vue';
import BaseEmptyState from '../components/BaseEmptyState.vue';

const authStore = useAuthStore();
const router = useRouter();

const appointments = ref<any[]>([]);
const fetching = ref(false);
const scheduling = ref(false);

const form = reactive({ date: '', notes: '' });
const feedback = reactive({ type: '', message: '' });

const isModalOpen = ref(false);
const appointmentToCancel = ref('');

const fetchAppointments = async () => {
  fetching.value = true;
  try {
    const { data } = await api.get('/appointments/my-appointments');
    appointments.value = data;
  } catch (err: any) {
    console.error('Erro ao buscar consultas:', err);
  } finally {
    fetching.value = false;
  }
};

const scheduleAppointment = async () => {
  scheduling.value = true;
  feedback.message = '';
  try {
    await api.post('/appointments', form);
    feedback.type = 'success';
    feedback.message = texts.dashboard.scheduleSuccess;
    form.date = '';
    form.notes = '';
    await fetchAppointments();
    setTimeout(() => { feedback.message = ''; }, 5000);
  } catch (err: any) {
    feedback.type = 'error';
    feedback.message = err.response?.data?.message || texts.dashboard.scheduleError;
  } finally {
    scheduling.value = false;
  }
};

const promptCancel = (id: string) => {
  appointmentToCancel.value = id;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  appointmentToCancel.value = '';
};

const confirmCancel = async () => {
  if (!appointmentToCancel.value) return;
  try {
    await api.patch(`/appointments/${appointmentToCancel.value}/cancel`);
    await fetchAppointments();
    closeModal();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Erro ao cancelar consulta');
  }
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const formatStatus = (status: string) => {
  if (status === 'scheduled') return texts.admin.statusScheduled;
  if (status === 'confirmed') return texts.admin.statusConfirmed;
  if (status === 'canceled') return texts.admin.statusCanceled;
  if (status === 'completed') return texts.admin.statusCompleted;
  return status;
};

onMounted(() => {
  if (!authStore.token) {
    router.push('/login');
    return;
  }
  if (authStore.user?.role === 'admin') {
    router.push('/admin');
    return;
  }
  fetchAppointments();
});
</script>

<style scoped>
.dashboard-layout {
  background-color: var(--bg-color);
  min-height: 100vh;
}
.dashboard-header {
  background-color: #fff;
  border-bottom: 1px solid var(--border-color);
  padding: 16px 0;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 10;
}
.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.brand-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand-logo {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: -0.5px;
}
.separator {
  color: var(--border-color);
  font-size: 1.2rem;
}
.page-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-main);
  font-weight: 500;
}
.user-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}
.greeting {
  color: var(--text-muted);
}
.greeting strong {
  color: var(--text-main);
}
.dashboard-content {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 24px;
}
.split-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  align-items: start;
}
@media (min-width: 900px) {
  .split-layout {
    grid-template-columns: 350px 1fr;
  }
}
.section-title {
  font-size: 1.25rem;
  color: var(--text-main);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}
.appointments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
}
.appointments-header .section-title {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.feedback-msg {
  margin-top: 20px;
  padding: 12px;
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 0.95rem;
  animation: fadeIn 0.3s ease;
}
.feedback-msg.error {
  background-color: rgba(252, 129, 129, 0.1);
  color: var(--danger-color);
  border: 1px solid rgba(252, 129, 129, 0.2);
}
.feedback-msg.success {
  background-color: rgba(104, 211, 145, 0.1);
  color: #2F855A;
  border: 1px solid rgba(104, 211, 145, 0.2);
}

.table-responsive {
  overflow-x: auto;
}
.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.modern-table th {
  background-color: #F8FAFC;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}
.modern-table td {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
  font-size: 0.95rem;
}
.modern-table tbody tr:hover {
  background-color: #F8FAFC;
}
.modern-table tbody tr:last-child td {
  border-bottom: none;
}
.date-cell {
  display: flex;
  flex-direction: column;
}
.date-main {
  font-weight: 500;
  color: var(--text-main);
}
.date-sub {
  font-size: 0.85rem;
  color: var(--text-muted);
}
.weather-cell {
  display: inline-flex;
  background: #EBF8FF;
  color: #2B6CB0;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}
.text-muted {
  color: var(--text-muted);
  font-size: 0.85rem;
}
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}
.status-badge.scheduled { background: #EBF4FF; color: var(--primary-color); }
.status-badge.confirmed { background: #E6FFFA; color: #319795; }
.status-badge.canceled { background: #FFF5F5; color: var(--danger-color); }
.status-badge.completed { background: #F0FFF4; color: var(--success-color); }

.loading-state, .empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
}
.spinner-blue {
  display: inline-block;
  width: 30px; height: 30px;
  border: 3px solid rgba(74, 144, 226, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes spin { 
  to { transform: rotate(360deg); } 
}
</style>
