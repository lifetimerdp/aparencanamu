import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is logged in, load the logged in header
            loadHeader('/partials/header_logged_in.html');
        } else {
            // Initialize scripts for logged-out header
            initializeHeaderScripts();
        }
    });

    function loadHeader(headerUrl) {
        fetch(headerUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
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
            .catch(error => console.error('Error loading header:', error));
    }

    function initializeHeaderScripts() {
        const dropdownLogoutButton = document.getElementById('dropdown-logout-button');
        if (dropdownLogoutButton) {
            dropdownLogoutButton.querySelector('button').addEventListener('click', () => {
                signOut(auth).then(() => {
                    window.location.href = '/masuk';
                }).catch((error) => {
                    console.error('Error signing out: ', error);
                });
            });
        }

        const hamburgerButton = document.querySelector('.hamburger');
        const dropdownMenu = document.querySelector('.dropdown-menu');

        if (hamburgerButton) {
            hamburgerButton.addEventListener('click', function(event) {
                event.stopPropagation();
                requestAnimationFrame(() => {
                    dropdownMenu.classList.toggle('show');
                });
            });
        }

        if (dropdownMenu) {
            dropdownMenu.addEventListener('click', function(event) {
                event.stopPropagation();
            });

            document.addEventListener('click', function(event) {
                if (!dropdownMenu.contains(event.target) && !hamburgerButton.contains(event.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
        }
    }
});