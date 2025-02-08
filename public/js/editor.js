import { auth, db } from './firebaseConfig.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let isSubmitting = false;
const params = new URLSearchParams(window.location.search);
const docId = params.get('id');

// Fungsi untuk menampilkan pesan error
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  document.getElementById('editor').prepend(errorDiv);
}

// Fungsi untuk memuat data dokumen
async function loadDocument() {
  try {
    if (!docId) {
      throw new Error('ID dokumen tidak ditemukan!');
    }

    const docRef = doc(db, "dokumentasi", docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById('title').value = data.title || '';
      document.getElementById('content').value = data.content || '';
      document.getElementById('image-url').value = data.imageUrl || '';
    } else {
      throw new Error('Dokumen tidak ditemukan!');
    }
  } catch (error) {
    console.error('Load error:', error);
    showError(error.message);
    setTimeout(() => {
      window.location.href = 'editDokumentasi';
    }, 3000);
  }
}

// Fungsi untuk menyimpan data
async function saveDocument(data) {
  try {
    const docRef = doc(db, "dokumentasi", docId);
    
    // Validasi data
    if (!data.title || !data.content) {
      throw new Error('Judul dan konten wajib diisi!');
    }

    // Tambahkan timestamp
    data.updatedAt = new Date().toISOString();

    // Simpan dengan merge untuk update partial
    await setDoc(docRef, data, { merge: true });
    
    alert('Data tersimpan!');
    window.location.href = 'editDokumentasi';
  } catch (error) {
    console.error('Save error:', error);
    throw new Error('Gagal menyimpan data: ' + error.message);
  }
}

// Event listener untuk form submission
document.getElementById('edit-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (isSubmitting) return;
  isSubmitting = true;

  const submitButton = document.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Menyimpan...';

  try {
    const data = {
      title: document.getElementById('title').value.trim(),
      content: document.getElementById('content').value.trim(),
      imageUrl: document.getElementById('image-url').value.trim() || null
    };

    await saveDocument(data);
  } catch (error) {
    showError(error.message);
  } finally {
    isSubmitting = false;
    submitButton.disabled = false;
    submitButton.textContent = 'Simpan';
  }
});

// Inisialisasi halaman
document.addEventListener('DOMContentLoaded', async () => {
  // Periksa autentikasi
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = '/masuk';
      return;
    }

    try {
      // Periksa role admin
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        window.location.href = '/';
        return;
      }

      // Load dokumen
      await loadDocument();
    } catch (error) {
      console.error('Auth error:', error);
      showError('Gagal memverifikasi akses');
    }
  });
});