import { getLogin, logout } from './login';
import { updateSettings } from './updateSetting';

import '@babel/polyfill';
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateSettingsBtn = document.querySelector('.form-user-data');
const updatePasswordBtn = document.querySelector('.form-user-password');

if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    // console.log('doing')
    getLogin(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (updateSettingsBtn) {
  updateSettingsBtn.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.querySelector('.update-name').value;
    const email = document.querySelector('.update-email').value;
    updateSettings({ name, email }, 'settings');
  });
}

if (updatePasswordBtn) {
  updatePasswordBtn.addEventListener('submit', async function (e) {
    e.preventDefault();
   
    const currentPassword = document.querySelector('#password-current').value;
    const password = document.querySelector('#password').value;
    const confirmPassword = document.querySelector('#password-confirm').value;

    await updateSettings(
      { currentPassword, confirmPassword, password },
      'password'
    );
    document.querySelector('#password-current').value = '';
    document.querySelector('#password').value = '';
    document.querySelector('#password-confirm').value = '';
  });
}
