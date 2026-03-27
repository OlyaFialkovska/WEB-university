export default class WorkView {
  constructor() {
    this.form = document.querySelector('#note-form');
    this.titleInput = document.querySelector('#note-title');
    this.categorySelect = document.querySelector('#note-category');
    this.descriptionInput = document.querySelector('#note-description');
    this.submitButton = document.querySelector('#submit-button');
    this.cancelEditButton = document.querySelector('#cancel-edit-button');
    this.searchInput = document.querySelector('#search-input');
    this.filterSelect = document.querySelector('#filter-category');
    this.notesContainer = document.querySelector('#notes-container');
    this.emptyState = document.querySelector('#empty-state');
    this.toastBody = document.querySelector('#app-toast-message');
    this.toastElement = document.querySelector('#app-toast');
    this.formTitle = document.querySelector('#form-title');
    this.editingIdField = document.querySelector('#editing-id');
    this.totalCount = document.querySelector('#total-count');
    this.goalCount = document.querySelector('#goal-count');
    this.lastAction = document.querySelector('#last-action');
    this.toast = this.toastElement ? new bootstrap.Toast(this.toastElement) : null;
  }

  getFormData() {
    return {
      title: this.titleInput.value.trim(),
      category: this.categorySelect.value,
      description: this.descriptionInput.value.trim(),
    };
  }

  getFilters() {
    return {
      search: this.searchInput.value.trim().toLowerCase(),
      category: this.filterSelect.value,
    };
  }

  resetForm() {
    this.form.reset();
    this.editingIdField.value = '';
    this.submitButton.textContent = 'Додати';
    this.formTitle.textContent = 'Додати новий запис';
    this.cancelEditButton.classList.add('d-none');
  }

  fillForm(note) {
    this.titleInput.value = note.title;
    this.categorySelect.value = note.category;
    this.descriptionInput.value = note.description;
    this.editingIdField.value = note.id;
    this.submitButton.textContent = 'Зберегти';
    this.formTitle.textContent = 'Редагувати запис';
    this.cancelEditButton.classList.remove('d-none');
    this.titleInput.focus();
  }

  renderNotes(notes) {
    this.notesContainer.innerHTML = '';

    if (notes.length === 0) {
      this.emptyState.classList.remove('d-none');
      return;
    }

    this.emptyState.classList.add('d-none');

    notes.forEach((note) => {
      this.notesContainer.insertAdjacentHTML('beforeend', this.createNoteMarkup(note));
    });
  }

  updateStats(notes) {
    const goalCount = notes.filter((note) => note.category === 'Ціль').length;
    this.totalCount.textContent = notes.length;
    this.goalCount.textContent = goalCount;
  }

  setLastAction(text) {
    this.lastAction.textContent = text;
  }

  showToast(message) {
    if (!this.toast) {
      return;
    }

    this.toastBody.textContent = message;
    this.toast.show();
  }

  createNoteMarkup(note) {
    const badgeClass = this.getBadgeClass(note.category);

    return `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card note-card bg-dark border-secondary h-100">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <span class="badge ${badgeClass}">${note.category}</span>
              <small class="text-secondary">${this.formatDate(note.createdAt)}</small>
            </div>
            <h5 class="card-title">${this.escapeHtml(note.title)}</h5>
            <p class="card-text text-secondary flex-grow-1">${this.escapeHtml(note.description)}</p>
            <div class="d-flex gap-2 flex-wrap mt-3">
              <button class="btn btn-sm btn-outline-light" data-action="edit" data-id="${note.id}">Редагувати</button>
              <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${note.id}">Видалити</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getBadgeClass(category) {
    const map = {
      Ідея: 'badge-idea',
      Ціль: 'badge-goal',
      План: 'badge-plan',
      Мотивація: 'badge-motivation',
    };

    return map[category] || 'bg-secondary';
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('uk-UA');
  }

  escapeHtml(value) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  bindSubmit(handler) {
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      handler();
    });
  }

  bindReset(handler) {
    this.form.addEventListener('reset', () => {
      window.setTimeout(handler, 0);
    });
  }

  bindCancelEdit(handler) {
    this.cancelEditButton.addEventListener('click', handler);
  }

  bindFilterChange(handler) {
    this.searchInput.addEventListener('input', handler);
    this.filterSelect.addEventListener('change', handler);
  }

  bindCardActions(handler) {
    this.notesContainer.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');

      if (!button) {
        return;
      }

      handler(button.dataset.action, button.dataset.id);
    });
  }
}
