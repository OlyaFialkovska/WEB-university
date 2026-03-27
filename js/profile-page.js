import UserModel from './models/UserModel.js';
import NoteModel from './models/NoteModel.js';
import { seedNotes } from './seed.js';

seedNotes();

const userModel = new UserModel();
const noteModel = new NoteModel();
const user = userModel.getUser();

const emptyProfile = document.querySelector('#empty-profile');
const profileContent = document.querySelector('#profile-content');
const logoutButton = document.querySelector('#logout-button');

function formatGender(gender) {
  if (gender === 'Чоловіча') {
    return 'Чоловіча';
  }

  return 'Жіноча';
}

function formatDate(dateString) {
  if (!dateString) {
    return '—';
  }

  return new Date(dateString).toLocaleDateString('uk-UA');
}

if (!user || !userModel.isAuthenticated()) {
  emptyProfile.classList.remove('d-none');
  profileContent.classList.add('d-none');
} else {
  const notes = noteModel.getAllNotes();
  const goals = notes.filter((note) => note.category === 'Ціль').length;
  const plans = notes.filter((note) => note.category === 'План').length;

  document.querySelector('#profile-name').textContent = user.name;
  document.querySelector('#profile-email').textContent = user.email;
  document.querySelector('#profile-gender').textContent = formatGender(user.gender);
  document.querySelector('#profile-birthdate').textContent = formatDate(user.birthDate);
  document.querySelector('#profile-status').textContent = 'У системі';
  document.querySelector('#profile-notes-count').textContent = String(notes.length);
  document.querySelector('#profile-goals-count').textContent = String(goals);
  document.querySelector('#profile-plans-count').textContent = String(plans);
}

logoutButton?.addEventListener('click', () => {
  userModel.logout();
  window.location.href = 'login.html';
});
