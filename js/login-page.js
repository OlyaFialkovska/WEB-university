import UserModel from './models/UserModel.js';

const loginForm = document.querySelector('#login-form');
const alertBox = document.querySelector('#login-alert');
const userModel = new UserModel();

function showMessage(message, type = 'success') {
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.classList.remove('d-none');
}

loginForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const result = userModel.login(
    formData.get('email').trim(),
    formData.get('password').trim(),
  );

  if (!result.success) {
    showMessage(result.message, 'danger');
    return;
  }

  showMessage('Вхід виконано успішно.', 'success');

  window.setTimeout(() => {
    window.location.href = 'profile.html';
  }, 1000);
});
