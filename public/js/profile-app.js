import { apiRequest } from './api.js';
import { getCurrentUserId, logout } from './auth.js';

const { createApp } = Vue;

createApp({
  data() {
    return {
      user: null,
      stats: {
        total: 0,
        goals: 0,
        plans: 0,
      },
      message: '',
    };
  },
  methods: {
    formatDate(value) {
      return value ? new Date(value).toLocaleDateString('uk-UA') : '—';
    },
    async loadProfile() {
      const userId = getCurrentUserId();
      if (!userId) {
        this.message = 'Дані користувача ще не заповнені. Спочатку увійди або зареєструйся.';
        return;
      }

      try {
        const [userData, statsData] = await Promise.all([
          apiRequest(`/api/users/${userId}`),
          apiRequest(`/api/users/${userId}/stats`),
        ]);

        this.user = userData.user;
        this.stats = statsData.stats;
      } catch (error) {
        this.message = error.message;
      }
    },
    handleLogout() {
      logout();
      window.location.href = 'login.html';
    },
  },
  mounted() {
    this.loadProfile();
  },
}).mount('#app');
