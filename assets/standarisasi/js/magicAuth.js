import { auth } from '/js/firebaseConfig.js';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  class MagicAuth {
    constructor(container) {
      this.container = container;
      this.isModal = this.container.classList.contains('magic-auth-modal-wrapper');
      this.modal = this.container.querySelector('.magic-auth-modal');
      this.auth = auth;

      this.initAuth();
      this.initEventListeners();
    }

    initAuth() {
      if (this.isModal) {
        this.createOverlay();
        this.initModal();
      }
    }

    createOverlay() {
      this.overlay = document.createElement('div');
      this.overlay.className = 'magic-auth-modal-overlay';
      document.body.appendChild(this.overlay);
    }

    initModal() {
      this.triggerButton = this.container.querySelector('.magic-auth-trigger');
      this.triggerButton.addEventListener('click', () => this.show());

      this.closeButton = this.modal.querySelector('.magic-auth-close');
      this.closeButton.addEventListener('click', () => this.hide());

      this.overlay.addEventListener('click', () => this.hide());
    }

    initEventListeners() {
      const form = this.container.querySelector('form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleFormSubmit();
        });
      }

      const googleBtn = this.container.querySelector('.magic-auth-google-btn');
      if (googleBtn) {
        googleBtn.addEventListener('click', () => this.socialLogin(new GoogleAuthProvider()));
      }

      const githubBtn = this.container.querySelector('.magic-auth-github-btn');
      if (githubBtn) {
        githubBtn.addEventListener('click', () => this.socialLogin(new GithubAuthProvider()));
      }

      const forgotPasswordLink = this.container.querySelector('.magic-auth-forgot-password');
      if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleForgotPassword();
        });
      }
    }

    async handleFormSubmit() {
      const email = this.container.querySelector('#magic-auth-email').value;
      const password = this.container.querySelector('#magic-auth-password').value;

      try {
        await signInWithEmailAndPassword(this.auth, email, password);
      } catch (error) {
        this.showError(this.parseAuthError(error.code));
      }
    }

    async socialLogin(provider) {
      try {
        await signInWithPopup(this.auth, provider);
      } catch (error) {
        this.showError(this.parseAuthError(error.code));
      }
    }

    async handleForgotPassword() {
      const email = prompt('Masukkan email Anda:');
      if (email) {
        try {
          await sendPasswordResetEmail(this.auth, email);
          alert('Email reset password telah dikirim!');
        } catch (error) {
          this.showError(this.parseAuthError(error.code));
        }
      }
    }

    parseAuthError(code) {
      const errors = {
        'auth/invalid-email': 'Email tidak valid',
        'auth/user-disabled': 'Akun dinonaktifkan',
        'auth/user-not-found': 'Akun tidak ditemukan',
        'auth/wrong-password': 'Password salah',
        'auth/popup-closed-by-user': 'Popup login ditutup',
        'auth/cancelled-popup-request': 'Login dibatalkan',
        'auth/account-exists-with-different-credential': 'Akun sudah ada dengan metode login berbeda',
      };
      return errors[code] || 'Terjadi kesalahan, silakan coba lagi';
    }

    showError(message) {
      const errorEl = this.container.querySelector('.magic-auth-error');
      errorEl.textContent = message;
      errorEl.style.display = 'block';
      setTimeout(() => errorEl.style.display = 'none', 5000);
    }

    show() {
      if (this.isModal) {
        this.modal.style.display = 'block';
        this.overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
      }
    }

    hide() {
      if (this.isModal) {
        this.modal.style.display = 'none';
        this.overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    }
  }

  // Auto-initialize all instances
  document.querySelectorAll('.magic-auth').forEach(container => {
    new MagicAuth(container);
  });
});