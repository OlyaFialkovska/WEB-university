export const STORAGE_KEYS = {
  USER: 'mindvault_user',
  SESSION: 'mindvault_session',
  NOTES: 'mindvault_notes',
};

export function loadFromStorage(key, fallbackValue) {
  try {
    const rawValue = localStorage.getItem(key);

    if (!rawValue) {
      return fallbackValue;
    }

    return JSON.parse(rawValue);
  } catch (error) {
    console.error(`Помилка читання localStorage за ключем ${key}:`, error);
    return fallbackValue;
  }
}

export function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
