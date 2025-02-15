import { auth, db } from '/js/firebaseConfig.js';

// Handle Klik Tombol
document.querySelectorAll('.magic-button').forEach(button => {
  button.addEventListener('click', async () => {
    const action = button.dataset.action;
    const target = button.dataset.target;

    // Tambahkan Class Loading
    button.classList.add('loading');

    try {
      switch(action) {
        case 'showPopup':
          document.getElementById(target).classList.add('active');
          break;

        case 'firebaseSignOut':
          await auth.signOut();
          window.location.href = '/masuk';  // Ganti /login menjadi /masuk
          break;

        case 'saveToFirestore':
          await db.collection('users').doc(auth.currentUser.uid).set({
            lastAction: new Date()
          });
          break;

        case 'customFunction':
          window[target]();
          break;
      }
    } catch (error) {
      console.error('Error:', error);
      button.style.backgroundColor = 'var(--color-danger)'; // Ganti warna jika gagal
    } finally {
      button.classList.remove('loading');
    }
  });
});