import UserModel from './models/UserModel.js';

const registerForm = document.querySelector('#register-form');
const alertBox = document.querySelector('#register-alert');
const userModel = new UserModel();

function showMessage(message, type = 'success') {
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.classList.remove('d-none');
}

registerForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(registerForm);
  const password = formData.get('password').trim();
  const confirmPassword = formData.get('confirmPassword').trim();

  if (password.length < 6) {
    showMessage('Пароль має містити щонайменше 6 символів.', 'danger');
    return;
  }

  if (password !== confirmPassword) {
    showMessage('Паролі не збігаються.', 'danger');
    return;
  }

  const result = userModel.register({
    name: formData.get('name').trim(),
    email: formData.get('email').trim(),
    gender: formData.get('gender'),
    birthDate: formData.get('birthDate'),
    password,
  });

  if (!result.success) {
    showMessage(result.message, 'danger');
    return;
  }

  showMessage('Реєстрація успішна. Тепер можна увійти.', 'success');
  registerForm.reset();

  window.setTimeout(() => {
    window.location.href = 'login.html';
  }, 1200);
});
