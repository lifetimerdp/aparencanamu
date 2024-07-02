// login.js

import { auth, db, analytics } from './firebaseConfig.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', (event) => {
  console.log("DOM fully loaded and parsed");

  // Mengecek apakah user sudah login
  if (sessionStorage.getItem('userLoggedIn')) {
    window.location.href = '/profil';
    return;
  }

  // Mendapatkan elemen-elemen dari dokumen HTML
  const loginForm = document.getElementById('login-form');
  const notification = document.getElementById('notification');

  if (loginForm) {
    // Menangani event submit pada form login
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      console.log("Form submission prevented");

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        // Coba login
        await signInWithEmailAndPassword(auth, email, password);
        // Berhasil login
        notification.className = "notification success";
        notification.textContent = "Login berhasil! Anda akan dialihkan...";
        setTimeout(() => {
          window.location.href = '/profil';
        }, 2000); // Mengalihkan setelah 2 detik
      } catch (error) {
        // Gagal login
        notification.className = "notification error";
        switch (error.code) {
          case 'auth/wrong-password':
            notification.textContent = "Password salah. Silakan coba lagi.";
            break;
          case 'auth/user-not-found':
            notification.textContent = "Pengguna tidak ditemukan. Silakan periksa email Anda atau daftar akun baru.";
            break;
          case 'auth/invalid-email':
            notification.textContent = "Email tidak valid. Silakan masukkan email yang benar.";
            break;
          case 'auth/user-disabled':
            notification.textContent = "Akun Anda telah dinonaktifkan. Silakan hubungi dukungan.";
            break;
          default:
            notification.textContent = "Login gagal. Silakan coba lagi.";
            break;
        }
        // Menambahkan pesan kesalahan dari Firebase untuk debugging (opsional)
        console.error('Firebase Error:', error.message);
      }
    });
  }
});