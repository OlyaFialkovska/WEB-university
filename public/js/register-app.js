import { apiRequest } from './api.js';

const { createApp } = Vue;

createApp({
  data() {
    return {
      form: {
        name: '',
        email: '',
        gender: '',
        birthDate: '',
        password: '',
        confirmPassword: '',
      },
      message: '',
      messageType: 'success',
      loading: false,
    };
  },
  methods: {
    async registerUser() {
      this.message = '';

      if (this.form.password.length < 6) {
        this.message = 'Пароль має містити щонайменше 6 символів.';
        this.messageType = 'danger';
        return;
      }

      if (this.form.password !== this.form.confirmPassword) {
        this.message = 'Паролі не збігаються.';
        this.messageType = 'danger';
        return;
      }

      try {
        this.loading = true;
        await apiRequest('/api/register', {
          method: 'POST',
          body: JSON.stringify({
            name: this.form.name,
            email: this.form.email,
            gender: this.form.gender,
            birthDate: this.form.birthDate,
            password: this.form.password,
          }),
        });

        this.message = 'Реєстрація успішна. Тепер можна увійти.';
        this.messageType = 'success';

        this.form = {
          name: '',
          email: '',
          gender: '',
          birthDate: '',
          password: '',
          confirmPassword: '',
        };

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1200);
      } catch (error) {
        this.message = error.message;
        this.messageType = 'danger';
      } finally {
        this.loading = false;
      }
    },
  },
}).mount('#app');
