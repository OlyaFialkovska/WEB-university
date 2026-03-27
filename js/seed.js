import { STORAGE_KEYS, loadFromStorage, saveToStorage, generateId } from './storage.js';

export function seedNotes() {
  const notes = loadFromStorage(STORAGE_KEYS.NOTES, []);

  if (notes.length > 0) {
    return;
  }

  const demoNotes = [
    {
      id: generateId(),
      title: 'Список тем для курсової',
      category: 'Ідея',
      description: 'Зібрати варіанти тем і вибрати найцікавішу.',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Здати лабораторну на 20',
      category: 'Ціль',
      description: 'Доробити адаптивність, Javascript і оформити звіт.',
      createdAt: new Date().toISOString(),
    },
  ];

  saveToStorage(STORAGE_KEYS.NOTES, demoNotes);
}
