// static/js/register.js

import { auth, db } from './firebaseConfig.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.getElementById('register-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const firstName = document.getElementById('first-name').value;
  const lastName = document.getElementById('last-name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const notificationElement = document.getElementById('notification');

  // Validasi password
  const passwordCriteria = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (password !== confirmPassword) {
    notificationElement.innerHTML = 'Password dan konfirmasi password tidak cocok.';
    notificationElement.classList.add('error');
    notificationElement.classList.remove('success');
    notificationElement.classList.remove('info');
    return;
  }

  if (!passwordCriteria.test(password)) {
    notificationElement.innerHTML = 'Password harus memiliki minimal 8 karakter, mengandung setidaknya satu huruf kapital dan satu angka.';
    notificationElement.classList.add('error');
    notificationElement.classList.remove('success');
    notificationElement.classList.remove('info');
    return;
  }

  try {
    // Buat pengguna baru di Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    notificationElement.innerHTML = 'Tunggu sebentar, pendaftaran sedang diproses...';
    notificationElement.classList.add('info');
    notificationElement.classList.remove('error');
    notificationElement.classList.remove('success');

    // Simpan data pengguna ke Firestore
    await setDoc(doc(db, "users", user.uid), {
      firstName: firstName,
      lastName: lastName,
      email: email,
      userId: user.uid
    });

    notificationElement.innerHTML = 'Pendaftaran berhasil, mengalihkan halaman.';
    notificationElement.classList.add('success');
    notificationElement.classList.remove('error');
    notificationElement.classList.remove('info');

    // Mengalihkan ke halaman /masuk setelah pendaftaran berhasil
    setTimeout(() => {
      window.location.href = '/masuk';
    }, 2000); // Mengalihkan setelah 2 detik
  } catch (error) {
    let errorMessage = 'Gagal mendaftar: ';

    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage += 'Email sudah terdaftar. Silakan gunakan email lain atau masuk dengan email tersebut.';
        break;
      case 'auth/invalid-email':
        errorMessage += 'Email tidak valid. Silakan masukkan email yang benar.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage += 'Pendaftaran pengguna baru tidak diizinkan saat ini.';
        break;
      case 'auth/weak-password':
        errorMessage += 'Password terlalu lemah. Silakan gunakan password yang lebih kuat.';
        break;
      default:
        errorMessage += error.message;
    }

    notificationElement.innerHTML = errorMessage;
    notificationElement.classList.add('error');
    notificationElement.classList.remove('success');
    notificationElement.classList.remove('info');
  }
});