document.querySelectorAll('.menu-link a').forEach(link => {
  link.addEventListener('click', function(e) {
      e.preventDefault(); // Impede o comportamento padrão do link

      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
          // Calcular a posição de rolagem
          const headerOffset = document.getElementById('header').offsetHeight;
          const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - headerOffset; // Ajustar para o tamanho do cabeçalho

          // Rolagem suave
          window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
          });
      }
  });
});
<<<<<<< HEAD



// // Animação aparecendo
// document.addEventListener("DOMContentLoaded", function () {
//     const elements = document.querySelectorAll('.fade-in');

//     const observer = new IntersectionObserver((entries) => {
//         entries.forEach(entry => {
//             if (entry.isIntersecting) {
//                 entry.target.classList.add('visible');
//                 observer.unobserve(entry.target);
//             }
//         });
//     });

//     elements.forEach(element => {
//         observer.observe(element);
//     });
// });
=======
>>>>>>> 0050668a1c7a82e61b098ea4fcffb8b2ff817e99
