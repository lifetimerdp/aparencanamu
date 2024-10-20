// static/js/forgotPass.js

import { auth } from './firebaseConfig.js';
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', (event) => {
  // Mendapatkan elemen-elemen dari dokumen HTML
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  const forgotPasswordStatus = document.getElementById('forgot-password-status');

  if (forgotPasswordForm) {
    // Menangani event submit pada form reset password
    forgotPasswordForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = document.getElementById('forgot-password-email').value;

      // Mengirim email reset password dengan Firebase Authentication
      sendPasswordResetEmail(auth, email)
        .then(() => {
          // Berhasil mengirim email reset password
          forgotPasswordStatus.textContent = 'Email reset password telah dikirim!';
          forgotPasswordStatus.className = 'notification success';
        })
        .catch((error) => {
          // Gagal mengirim email reset password
          forgotPasswordStatus.textContent = `Error: ${error.message}`;
          forgotPasswordStatus.className = 'notification error';
        });
    });
  }
});