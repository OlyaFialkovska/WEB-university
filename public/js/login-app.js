import { apiRequest } from './api.js';
import { saveCurrentUser } from './auth.js';

const { createApp } = Vue;

createApp({
  data() {
    return {
      form: {
        email: '',
        password: '',
      },
      message: '',
      messageType: 'success',
      loading: false,
    };
  },
  methods: {
    async loginUser() {
      this.message = '';

      try {
        this.loading = true;
        const data = await apiRequest('/api/login', {
          method: 'POST',
          body: JSON.stringify(this.form),
        });

        saveCurrentUser(data.user);
        this.message = 'Вхід виконано успішно.';
        this.messageType = 'success';

        setTimeout(() => {
          window.location.href = 'profile.html';
        }, 1000);
      } catch (error) {
        this.message = error.message;
        this.messageType = 'danger';
      } finally {
        this.loading = false;
      }
    },
  },
}).mount('#app');
