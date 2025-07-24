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

// NOVO: Envio do formulário de login para o backend
const loginForm = document.querySelector('.form-box.login form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[type="email"]').value.trim();
    const password = loginForm.querySelector('input[type="password"]').value.trim();

    if (!email || !password) {
        alert('Por favor, preencha email e senha.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/login', { // ajustar de acordo com a url
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Login realizado com sucesso!');
            // Exemplo: redirecionar para painel
            // window.location.href = '/dashboard.html';
        } else {
            alert(data.message || 'Erro ao fazer login');
        }
    } catch (error) {
        alert('Erro na conexão com o servidor.');
        console.error(error);
    }
});