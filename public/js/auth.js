const CURRENT_USER_KEY = 'mindvault_current_user';

export function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  } catch (error) {
    return null;
  }
}

export function getCurrentUserId() {
  const user = getCurrentUser();
  return user?.id || null;
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}
