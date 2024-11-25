const container = document.querySelector('.container');
const registroBtn = document.querySelector('.cadastro-btn');
const loginBtn = document.querySelector('.login-btn');

registroBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// function login() {
//     const username = document.getElementById('username').value;
//     const password = document.getElementById('login-password').value;
//     const savedUsers = JSON.parse(localStorage.getItem('users')) || [];

//     const userExists = savedUsers.find(
//         (user) => user.username === username && user.password === password
//     );

//     if (userExists) {
//         localStorage.setItem('currentUser', username); // Salva o usuário logado
//         alert(`Bem-vindo, ${username}!`);
//         window.location.href = '../html/dashboard.html'; // Redireciona para o dashboard
//     } else {
//         alert('Usuário ou senha incorretos. Por favor, tente novamente.');
//     }
// }

// // Função de registro
// function register() {
//     const username = document.getElementById('register-username').value;
//     const email = document.getElementById('register-email').value;
//     const password = document.getElementById('register-password').value;

//     if (username && email && password) {
//         const savedUsers = JSON.parse(localStorage.getItem('users')) || [];

//         // Verifica se o usuário já existe
//         const userExists = savedUsers.some((user) => user.username === username);

//         if (userExists) {
//             alert('Usuário já cadastrado! Faça login.');
//         } else {
//             savedUsers.push({ username, email, password });
//             localStorage.setItem('users', JSON.stringify(savedUsers));
//             alert('Registro realizado com sucesso! Agora faça login.');
//             container.classList.remove('active'); // Vai para o login
//         }
//     } else {
//         alert('Por favor, preencha todos os campos.');
//     }
// }

// const users = [
//     { username: 'Ana', email: 'ana@email.com', password: '1234' },
//     { username: 'Beatriz', email: 'beatriz@email.com', password: '1234' }
//   ];
//   localStorage.setItem('users', JSON.stringify(users));
//   localStorage.setItem('currentUser', 'Ana');