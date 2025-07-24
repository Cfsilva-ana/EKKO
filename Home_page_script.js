const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const loginBtn = document.querySelector('.bntLogin-popup');
const iconClose = document.querySelector('.icon-close');

loginBtn.addEventListener('click', () => {
  wrapper.classList.add('active-popup');
});

registerLink.addEventListener('click', () => {
  wrapper.classList.add('active');
});

loginLink.addEventListener('click', () => {
  wrapper.classList.remove('active');
});

iconClose.addEventListener('click', () => {
  wrapper.classList.remove('active-popup');
});

// (Opcional) Fecha modal ao clicar fora
document.addEventListener('click', e => {
  if (wrapper.classList.contains('active-popup') &&
      !wrapper.contains(e.target) &&
      e.target !== loginBtn) {
    wrapper.classList.remove('active-popup');
  }
});