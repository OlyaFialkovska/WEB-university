import { apiRequest } from './api.js';
import { getCurrentUserId } from './auth.js';

const { createApp } = Vue;

createApp({
  data() {
    return {
      userId: null,
      notes: [],
      editingId: null,
      form: {
        title: '',
        category: 'Ідея',
        description: '',
      },
      filters: {
        search: '',
        category: 'Усі',
      },
      stats: {
        total: 0,
        goals: 0,
      },
      lastAction: 'Остання дія: готово до роботи',
      message: '',
    };
  },
  methods: {
    async loadNotes() {
      if (!this.userId) {
        return;
      }

      try {
        const params = new URLSearchParams({
          search: this.filters.search,
          category: this.filters.category,
        });
        const data = await apiRequest(`/api/users/${this.userId}/notes?${params.toString()}`);
        this.notes = data.notes;
        await this.loadStats();
      } catch (error) {
        this.message = error.message;
      }
    },
    async loadStats() {
      const data = await apiRequest(`/api/users/${this.userId}/stats`);
      this.stats.total = data.stats.total;
      this.stats.goals = data.stats.goals;
    },
    async saveNote() {
      if (!this.form.title.trim() || !this.form.description.trim()) {
        this.message = 'Заповни назву та опис запису.';
        return;
      }

      try {
        if (this.editingId) {
          await apiRequest(`/api/users/${this.userId}/notes/${this.editingId}`, {
            method: 'PUT',
            body: JSON.stringify(this.form),
          });
          this.lastAction = 'Остання дія: запис відредаговано';
        } else {
          await apiRequest(`/api/users/${this.userId}/notes`, {
            method: 'POST',
            body: JSON.stringify(this.form),
          });
          this.lastAction = 'Остання дія: запис додано';
        }

        this.resetForm();
        await this.loadNotes();
        this.message = '';
      } catch (error) {
        this.message = error.message;
      }
    },
    startEdit(note) {
      this.editingId = note.id;
      this.form = {
        title: note.title,
        category: note.category,
        description: note.description,
      };
      this.lastAction = 'Остання дія: відкрито режим редагування';
      this.message = '';
    },
    async deleteNote(noteId) {
      try {
        await apiRequest(`/api/users/${this.userId}/notes/${noteId}`, {
          method: 'DELETE',
        });
        this.lastAction = 'Остання дія: запис видалено';
        await this.loadNotes();
      } catch (error) {
        this.message = error.message;
      }
    },
    resetForm() {
      this.editingId = null;
      this.form = {
        title: '',
        category: 'Ідея',
        description: '',
      };
      this.lastAction = 'Остання дія: форму очищено';
    },
    badgeClass(category) {
      return {
        'badge-idea': category === 'Ідея',
        'badge-goal': category === 'Ціль',
        'badge-plan': category === 'План',
        'badge-motivation': category === 'Мотивація',
      };
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('uk-UA');
    },
  },
  async mounted() {
    this.userId = getCurrentUserId();
    if (!this.userId) {
      this.message = 'Щоб працювати із записами, спочатку увійди в систему.';
      return;
    }

    await this.loadNotes();
  },
}).mount('#app');
