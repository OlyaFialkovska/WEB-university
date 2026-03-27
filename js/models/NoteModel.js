import { STORAGE_KEYS, loadFromStorage, saveToStorage, generateId } from '../storage.js';

export default class NoteModel {
  constructor() {
    this.notes = loadFromStorage(STORAGE_KEYS.NOTES, []);
  }

  getAllNotes() {
    return [...this.notes];
  }

  save() {
    saveToStorage(STORAGE_KEYS.NOTES, this.notes);
  }

  addNote(noteData) {
    const note = {
      id: generateId(),
      title: noteData.title,
      category: noteData.category,
      description: noteData.description,
      createdAt: new Date().toISOString(),
    };

    this.notes.unshift(note);
    this.save();
    return note;
  }

  updateNote(noteId, updatedData) {
    this.notes = this.notes.map((note) =>
      note.id === noteId
        ? {
            ...note,
            ...updatedData,
            updatedAt: new Date().toISOString(),
          }
        : note,
    );

    this.save();
  }

  deleteNote(noteId) {
    this.notes = this.notes.filter((note) => note.id !== noteId);
    this.save();
  }

  getNoteById(noteId) {
    return this.notes.find((note) => note.id === noteId) || null;
  }
}
