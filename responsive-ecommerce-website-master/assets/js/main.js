/*===== MENU SHOW =====*/ 
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navLink = document.querySelectorAll('.nav__link')

/*===== MENU SHOW =====*/
if(navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('show')
    })
}

/*===== REMOVE MENU MOBILE =====*/
function linkAction() {
    const navMenu = document.getElementById('nav-menu')
    navMenu.classList.remove('show')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*===== SCROLL REVEAL ANIMATION =====*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2000,
    delay: 400
})

sr.reveal('.home__data')
sr.reveal('.home__img', {delay: 500})
sr.reveal('.collection__card', {interval: 100})
sr.reveal('.featured__product', {interval: 100})
sr.reveal('.offer__data', {origin: 'left'})
sr.reveal('.offer__img', {origin: 'right'})
sr.reveal('.new__card', {interval: 100})
sr.reveal('.newsletter__container')
