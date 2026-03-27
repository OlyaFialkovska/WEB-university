import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../storage.js';

export default class UserModel {
  normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  getUser() {
    return loadFromStorage(STORAGE_KEYS.USER, null);
  }

  saveUser(user) {
    saveToStorage(STORAGE_KEYS.USER, user);
  }

  register(userData) {
    const normalizedEmail = this.normalizeEmail(userData.email);
    const existingUser = this.getUser();

    if (existingUser && this.normalizeEmail(existingUser.email) === normalizedEmail) {
      return {
        success: false,
        message: 'Користувач з таким email уже існує.',
      };
    }

    const user = {
      ...userData,
      email: normalizedEmail,
      password: String(userData.password || '').trim(),
      registeredAt: new Date().toISOString(),
    };

    this.saveUser(user);
    saveToStorage(STORAGE_KEYS.SESSION, { isLoggedIn: false, email: user.email });

    return { success: true, user };
  }

  login(email, password) {
    const user = this.getUser();
    const normalizedEmail = this.normalizeEmail(email);
    const normalizedPassword = String(password || '').trim();

    if (!user) {
      return { success: false, message: 'Спочатку потрібно зареєструватися.' };
    }

    if (this.normalizeEmail(user.email) !== normalizedEmail || String(user.password) !== normalizedPassword) {
      return { success: false, message: 'Невірний email або пароль.' };
    }

    saveToStorage(STORAGE_KEYS.SESSION, {
      isLoggedIn: true,
      email: user.email,
      loginTime: new Date().toISOString(),
    });

    return { success: true, user };
  }

  getSession() {
    return loadFromStorage(STORAGE_KEYS.SESSION, { isLoggedIn: false, email: '' });
  }

  isAuthenticated() {
    const user = this.getUser();
    const session = this.getSession();

    return Boolean(
      user &&
      session.isLoggedIn &&
      this.normalizeEmail(session.email) === this.normalizeEmail(user.email),
    );
  }

  logout() {
    saveToStorage(STORAGE_KEYS.SESSION, { isLoggedIn: false, email: '' });
  }
}
