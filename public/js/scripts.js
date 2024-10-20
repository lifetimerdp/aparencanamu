import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Pengguna sudah login, muat header untuk pengguna yang sudah login
            loadHeader('/partials/header_logged_in.html');
        } else {
            // Inisialisasi skrip untuk header pengguna yang belum login
            initializeHeaderScripts();
        }
    });

    function loadHeader(headerUrl) {
        fetch(headerUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Respons jaringan tidak baik ' + response.statusText);
                }
                return response.text();
            })
            .then(data => {
                const dynamicHeader = document.getElementById('dynamic-header');
                dynamicHeader.innerHTML = data;
                dynamicHeader.style.display = 'block';
                document.querySelector('.site-header').remove();
                initializeHeaderScripts();
            })
            .catch(error => console.error('Error saat memuat header:', error));
    }

    function initializeHeaderScripts() {
        const dropdownLogoutButton = document.getElementById('dropdown-logout-button');
        if (dropdownLogoutButton) {
            dropdownLogoutButton.querySelector('button').addEventListener('click', () => {
                signOut(auth).then(() => {
                    window.location.href = '/masuk';
                }).catch((error) => {
                    console.error('Error saat logout: ', error);
                });
            });
        }

        const hamburgerButton = document.querySelector('.hamburger');
        const dropdownMenu = document.querySelector('.dropdown-menu');

        if (hamburgerButton && dropdownMenu) {
            hamburgerButton.addEventListener('click', function(event) {
                event.stopPropagation();
                requestAnimationFrame(() => {
                    dropdownMenu.classList.toggle('show');
                    hamburgerButton.classList.toggle('active');
                });
            });

            document.addEventListener('click', function(event) {
                if (!dropdownMenu.contains(event.target) && !hamburgerButton.contains(event.target)) {
                    dropdownMenu.classList.remove('show');
                    hamburgerButton.classList.remove('active');
                }
            });
        }

        // Tambahkan event listener untuk setiap tautan di dalam dropdown menu
        const dropdownLinks = dropdownMenu ? dropdownMenu.querySelectorAll('a') : [];
        dropdownLinks.forEach(link => {
            link.addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
                hamburgerButton.classList.remove('active');
            });
        });
    }
});