document.addEventListener("DOMContentLoaded", function() {
    const toggleNavbarButton = document.getElementById('toggle-navbar');
    const bottomNavbar = document.querySelector('.bottom-navbar');
    const searchBar = document.querySelector('.search-bar');

    toggleNavbarButton.addEventListener('click', function() {
        console.log(toggleNavbarButton);
        console.log(bottomNavbar);
        bottomNavbar.classList.toggle('show-navbar');
        if (window.innerWidth < 768) {
            searchBar.classList.toggle('show-navbar');
        }
    });
});
