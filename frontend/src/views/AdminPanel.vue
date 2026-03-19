<template>
  <div class="dashboard-layout">
    <header class="dashboard-header">
      <div class="header-container">
        <div class="brand-group">
          <span class="brand-logo">Atende+</span>
          <span class="separator">|</span>
          <h2 class="page-title">{{ texts.admin.title }}</h2>
        </div>
        <div class="user-controls">
          <span class="greeting">{{ texts.admin.welcome }} <strong>{{ authStore.user?.name }}</strong> (Admin)</span>
          <BaseButton variant="outline" @click="logout" style="width: auto; padding: 8px 16px;">
            {{ texts.admin.logoutBtn }}
          </BaseButton>
        </div>
      </div>
    </header>

    <main class="dashboard-content">
      <BaseCard class="admin-card">
        
        <div class="filters-container">
          <div class="filter-group">
            <BaseInput 
              v-model="filterStatus"
              type="select" 
              :label="texts.admin.filterStatusLabel"
            >
              <template #default>
                <select v-model="filterStatus" class="native-select">
                  <option value="">{{ texts.admin.statusAll }}</option>
                  <option value="scheduled">{{ texts.admin.statusScheduled }}</option>
                  <option value="confirmed">{{ texts.admin.statusConfirmed }}</option>
                  <option value="canceled">{{ texts.admin.statusCanceled }}</option>
                  <option value="completed">{{ texts.admin.statusCompleted }}</option>
                </select>
              </template>
            </BaseInput>
          </div>
          
          <div class="filter-group">
            <BaseInput 
              v-model="filterDate" 
              type="date" 
              :label="texts.admin.filterDateLabel" 
            />
          </div>
          
          <div class="filter-actions">
            <BaseButton variant="secondary" @click="clearFilters">Limpar Filtros</BaseButton>
          </div>
        </div>

        <div v-if="fetching" class="loading-state">
          <span class="spinner-blue"></span>
          <p>{{ texts.admin.loadingAppointments }}</p>
        </div>

        <div class="table-responsive" v-else-if="filteredAppointments.length > 0">
          <table class="modern-table">
            <thead>
              <tr>
                <th>{{ texts.dashboard.tablePatient }}</th>
                <th>{{ texts.dashboard.tableDate }}</th>
                <th>{{ texts.dashboard.tableStatus }}</th>
                <th>{{ texts.dashboard.tableWeather }}</th>
                <th>{{ texts.dashboard.tableActions }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="apt in filteredAppointments" :key="apt._id">
                <td>
                  <strong>{{ apt.patientId?.name || '---' }}</strong><br/>
                  <small class="text-muted">CPF: {{ apt.patientId?.cpf || '---' }}</small>
                </td>
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
                  <span v-else class="text-muted">---</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <BaseButton 
                      v-if="apt.status === 'scheduled'" 
                      variant="success" 
                      @click="promptAction(apt._id, 'confirmed')"
                      style="padding: 6px 12px; font-size: 0.85rem;"
                    >
                      Confirmar
                    </BaseButton>
                    <BaseButton 
                      v-if="apt.status === 'confirmed'" 
                      variant="primary" 
                      @click="promptAction(apt._id, 'completed')"
                      style="padding: 6px 12px; font-size: 0.85rem;"
                    >
                      Concluir
                    </BaseButton>
                    <BaseButton 
                      v-if="apt.status === 'scheduled' || apt.status === 'confirmed'" 
                      variant="danger" 
                      @click="promptAction(apt._id, 'canceled')"
                      style="padding: 6px 12px; font-size: 0.85rem;"
                    >
                      Cancelar
                    </BaseButton>
                    <BaseButton 
                      v-if="apt.status === 'canceled'" 
                      variant="outline" 
                      @click="promptAction(apt._id, 'delete')"
                      style="padding: 6px 12px; font-size: 0.85rem; color: var(--danger-color); border-color: var(--danger-color);"
                    >
                      Excluir
                    </BaseButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <BaseEmptyState 
          v-else 
          icon="🔍"
          :title="texts.admin.noAppointments" 
          description="Tente ajustar os filtros ou a data para encontrar os resultados corretos."
        />

      </BaseCard>
    </main>

    <BaseModal 
      :isOpen="isModalOpen" 
      title="Ação Administrativa" 
      @close="closeModal"
    >
      <p v-if="actionTarget === 'delete'">Tem certeza que deseja <strong>EXCLUIR PERMANENTEMENTE</strong> este registro do sistema?</p>
      <p v-else>Confirma a alteração do status desta consulta?</p>
      <template #footer>
        <BaseButton variant="secondary" @click="closeModal" style="width: auto;">
          Voltar
        </BaseButton>
        <BaseButton variant="primary" @click="confirmAction" style="width: auto;">
          Confirmar Ação
        </BaseButton>
      </template>
    </BaseModal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { texts } from '../constants/texts';
import BaseCard from '../components/BaseCard.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseModal from '../components/BaseModal.vue';
import BaseEmptyState from '../components/BaseEmptyState.vue';

const authStore = useAuthStore();
const router = useRouter();

const appointments = ref<any[]>([]);
const fetching = ref(false);

const filterStatus = ref('');
const filterDate = ref('');

const isModalOpen = ref(false);
const appointmentTarget = ref('');
const actionTarget = ref('');

const clearFilters = () => {
  filterStatus.value = '';
  filterDate.value = '';
};

const filteredAppointments = computed(() => {
  return appointments.value.filter(apt => {
    let match = true;
    if (filterStatus.value && apt.status !== filterStatus.value) match = false;
    if (filterDate.value) {
      const aptDate = new Date(apt.date).toISOString().split('T')[0];
      if (aptDate !== filterDate.value) match = false;
    }
    return match;
  });
});

const fetchAppointments = async () => {
  fetching.value = true;
  try {
    const { data } = await api.get('/appointments');
    appointments.value = data;
  } catch (err: any) {
    console.error('Erro ao buscar consultas:', err);
  } finally {
    fetching.value = false;
  }
};

const promptAction = (id: string, action: string) => {
  appointmentTarget.value = id;
  actionTarget.value = action;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  appointmentTarget.value = '';
  actionTarget.value = '';
};

const confirmAction = async () => {
  if (!appointmentTarget.value || !actionTarget.value) return;
  try {
    if (actionTarget.value === 'delete') {
      await api.delete(`/appointments/${appointmentTarget.value}`);
    } else {
      await api.patch(`/appointments/${appointmentTarget.value}/status`, { status: actionTarget.value });
    }
    await fetchAppointments();
    closeModal();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Erro ao executar ação na consulta');
  }
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};

const formatDate = (dateStr: string) => { return new Date(dateStr).toLocaleDateString('pt-BR'); };
const formatTime = (dateStr: string) => { return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); };

const formatStatus = (status: string) => {
  if (status === 'scheduled') return texts.admin.statusScheduled;
  if (status === 'confirmed') return texts.admin.statusConfirmed;
  if (status === 'canceled') return texts.admin.statusCanceled;
  if (status === 'completed') return texts.admin.statusCompleted;
  return status;
};

onMounted(() => {
  if (!authStore.token || authStore.user?.role !== 'admin') {
    router.push('/dashboard');
    return;
  }
  fetchAppointments();
});
</script>

<style scoped>
.dashboard-layout { background-color: var(--bg-color); min-height: 100vh; }
.dashboard-header { background-color: #fff; border-bottom: 1px solid var(--border-color); padding: 16px 0; box-shadow: var(--shadow-sm); position: sticky; top: 0; z-index: 10; }
.header-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;}
.brand-group { display: flex; align-items: center; gap: 12px; }
.brand-logo { font-size: 1.4rem; font-weight: 700; color: var(--primary-color); letter-spacing: -0.5px; }
.separator { color: var(--border-color); font-size: 1.2rem; }
.page-title { margin: 0; font-size: 1.1rem; color: var(--text-main); font-weight: 500; }
.user-controls { display: flex; align-items: center; gap: 20px; }
.greeting { color: var(--text-muted); }
.dashboard-content { max-width: 1200px; margin: 40px auto; padding: 0 24px; }
.admin-card { padding: 40px; }

.filters-container {
  display: flex; gap: 20px; align-items: flex-end; margin-bottom: 30px; 
  background: #F8FAFC; padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color);
  flex-wrap: wrap;
}
.filter-group { flex: 1; min-width: 200px; max-width: 250px; }
.filter-actions { padding-bottom: 20px; }

.table-responsive { overflow-x: auto; }
.modern-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.modern-table th { background-color: #F8FAFC; color: var(--text-muted); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
.modern-table td { padding: 16px; border-bottom: 1px solid var(--border-color); vertical-align: middle; font-size: 0.95rem; }
.modern-table tbody tr:hover { background-color: #F8FAFC; }
.modern-table tbody tr:last-child td { border-bottom: none; }
.date-cell { display: flex; flex-direction: column; }
.date-main { font-weight: 500; color: var(--text-main); }
.date-sub { font-size: 0.85rem; color: var(--text-muted); }
.weather-cell { display: inline-flex; background: #EBF8FF; color: #2B6CB0; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: 500; }
.text-muted { color: var(--text-muted); font-size: 0.85rem; }
.status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
.status-badge.scheduled { background: #EBF4FF; color: var(--primary-color); }
.status-badge.confirmed { background: #E6FFFA; color: #319795; }
.status-badge.canceled { background: #FFF5F5; color: var(--danger-color); }
.status-badge.completed { background: #F0FFF4; color: var(--success-color); }

.action-buttons { display: flex; gap: 8px; flex-wrap: wrap; }

.loading-state, .empty-state { text-align: center; padding: 40px; color: var(--text-muted); }
.spinner-blue { display: inline-block; width: 30px; height: 30px; border: 3px solid rgba(74, 144, 226, 0.2); border-radius: 50%; border-top-color: var(--primary-color); animation: spin 1s ease-in-out infinite; margin-bottom: 16px; }

.native-select { width: 100%; padding: 12px 14px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 1rem; font-family: inherit; color: var(--text-main); background-color: var(--card-bg); transition: all 0.2s ease; cursor: pointer; }
.native-select:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15); }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
