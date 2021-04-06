import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';

const mapBox = document.getElementById('map');
const logoutButton = document.querySelector('.nav__el--logout');
const loginForm = document.querySelector('.form');
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);

  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', logout);
}
