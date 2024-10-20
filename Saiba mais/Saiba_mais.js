const menuLinks = document.querySelectorAll('.menu-link');
window.addEventListener('scroll', () => {
  let fromTop = window.scrollY;

  menuLinks.forEach(link => {
    let section = document.querySelector(link.getAttribute('href'));

    if (
      section.offsetTop <= fromTop &&
      section.offsetTop + section.offsetHeight > fromTop
    ) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

menuLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      menuLinks.forEach(item => item.classList.remove('active')); 
      this.classList.add('active'); 
    });
  });

// Animação aparecendo
document.addEventListener("DOMContentLoaded", function () {
    const elements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    });

    elements.forEach(element => {
        observer.observe(element);
    });
});