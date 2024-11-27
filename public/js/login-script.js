const container = document.querySelector('.container');
const registroBtn = document.querySelector('.cadastro-btn');
const loginBtn = document.querySelector('.login-btn');

registroBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});