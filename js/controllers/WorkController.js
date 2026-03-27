export default class WorkController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.view.bindSubmit(this.handleSubmit.bind(this));
    this.view.bindReset(this.handleReset.bind(this));
    this.view.bindCancelEdit(this.handleReset.bind(this));
    this.view.bindFilterChange(this.render.bind(this));
    this.view.bindCardActions(this.handleCardAction.bind(this));

    this.render();
  }

  render() {
    const notes = this.model.getAllNotes();
    const filteredNotes = this.applyFilters(notes);

    this.view.renderNotes(filteredNotes);
    this.view.updateStats(notes);
  }

  applyFilters(notes) {
    const filters = this.view.getFilters();

    return notes.filter((note) => {
      const matchesCategory = filters.category === 'Усі' || note.category === filters.category;
      const text = `${note.title} ${note.description}`.toLowerCase();
      const matchesSearch = text.includes(filters.search);

      return matchesCategory && matchesSearch;
    });
  }

  handleSubmit() {
    const formData = this.view.getFormData();
    const editingId = this.view.editingIdField.value;

    if (!formData.title || !formData.description) {
      this.view.showToast('Заповни назву та опис запису.');
      return;
    }

    if (editingId) {
      this.model.updateNote(editingId, formData);
      this.view.showToast('Запис успішно оновлено.');
      this.view.setLastAction('Остання дія: запис відредаговано');
    } else {
      this.model.addNote(formData);
      this.view.showToast('Новий запис додано.');
      this.view.setLastAction('Остання дія: запис додано');
    }

    this.view.resetForm();
    this.render();
  }

  handleReset() {
    this.view.resetForm();
    this.view.setLastAction('Остання дія: форму очищено');
  }

  handleCardAction(action, noteId) {
    if (action === 'delete') {
      this.model.deleteNote(noteId);
      this.view.showToast('Запис видалено.');
      this.view.setLastAction('Остання дія: запис видалено');
      this.render();
      return;
    }

    if (action === 'edit') {
      const note = this.model.getNoteById(noteId);

      if (!note) {
        return;
      }

      this.view.fillForm(note);
      this.view.setLastAction('Остання дія: відкрито режим редагування');
    }
  }
}
