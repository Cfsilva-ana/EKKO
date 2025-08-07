const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const resgisterLink = document.querySelector('.register-link');
const bntPopup = document.querySelector('.bntLogin-popup');
const closeIcon = document.querySelector('.icon-close');

resgisterLink.addEventListener('click', () => {
    wrapper.classList.add('active');
});

loginLink.addEventListener('click', () => {
    wrapper.classList.remove('active');
});

bntPopup.addEventListener('click', () => {
    wrapper.classList.add('active-popup');
});

closeIcon.addEventListener('click', () => {
    wrapper.classList.remove('active-popup');
});

// Seleciona o formulário de cadastro
const registerForm = document.getElementById('registerForm');

// Adiciona um evento para quando o usuário enviar o formulário
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    // Coleta os dados digitados nos campos
    const username = registerForm.querySelector('input[type="text"]').value;
    const email = registerForm.querySelector('input[type="email"]').value;
    const password = registerForm.querySelector('input[type="password"]').value;

    try {
        // Envia os dados para o backend via POST
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        alert(data.message); // Mostra o resultado para o usuário
    } catch (error) {
        console.error('Erro ao registrar:', error);
        alert('Erro ao registrar usuário.');
    }
});