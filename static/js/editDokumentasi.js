import { auth, db } from './firebaseConfig.js';
import { 
  collection, getDocs, doc, getDoc, 
  setDoc, deleteDoc, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Variabel untuk kontrol listener dan form
let isUnsubscribed = false;
let formSubmitListener = null;

// Fungsi untuk memeriksa role admin
async function checkAdminRole(user) {
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    return userDoc.exists() && userDoc.data().role === 'admin';
  } catch (error) {
    console.error('Role check error:', error);
    return false;
  }
}

// Fungsi untuk memuat konten halaman
function loadPageContent() {
  const container = document.getElementById('edit-container');
  container.innerHTML = `
    <a href="/admin">Kembali ke Dashboard</a>
    <div class="doc-list" id="doc-list"></div>
    <div id="editor">
      <h2>${window.location.search ? 'Edit' : 'Buat'} Dokumentasi</h2>
      <form id="edit-form">
        <div>
          <label for="title">Judul:</label>
          <input type="text" id="title" required>
        </div>
        <div>
          <label for="content">Konten:</label>
          <textarea id="content" rows="10" required></textarea>
        </div>
        <div>
          <label for="image-url">Link Gambar:</label>
          <input type="url" id="image-url">
        </div>
        <button type="submit">Simpan</button>
        <button type="button" id="cancel-btn">Batal</button>
      </form>
    </div>
  `;
  
  document.getElementById('cancel-btn').addEventListener('click', () => {
    window.location.href = '/admin/editDokumentasi';
  });
}

// Fungsi untuk memproses snapshot realtime
function processSnapshot(snapshot) {
  const docList = document.getElementById('doc-list');
  docList.innerHTML = '';
  
  snapshot.forEach((docItem) => {
    const docElement = document.createElement('div');
    docElement.className = 'doc-item';
    docElement.innerHTML = `
      <div>${docItem.data().title} (ID: ${docItem.id})</div>
      <div class="doc-actions">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Hapus</button>
      </div>
    `;
    
    docElement.querySelector('.edit-btn').addEventListener('click', () => {
      window.location.href = `/admin/editDokumentasi?id=${docItem.id}`;
    });
    
    docElement.querySelector('.delete-btn').addEventListener('click', () => {
      deleteDocument(docItem.id);
    });
    
    docList.appendChild(docElement);
  });
}

// Fungsi untuk menghapus dokumen
async function deleteDocument(docId) {
  if (!confirm(`Hapus dokumen ${docId}?`)) return;
  
  try {
    await deleteDoc(doc(db, "dokumentasi", docId));
    alert('Dokumen dihapus!');
  } catch (error) {
    console.error('Delete error:', error);
    alert(`Gagal menghapus: ${error.message}`);
  }
}

// Fungsi untuk memuat dokumen yang akan diedit
async function loadDocumentForEdit() {
  const params = new URLSearchParams(window.location.search);
  const docId = params.get('id');

  // Hapus listener sebelumnya jika ada
  if (formSubmitListener) {
    document.getElementById('edit-form').removeEventListener('submit', formSubmitListener);
  }

  // Tambahkan listener baru
  formSubmitListener = async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const imageUrl = document.getElementById('image-url').value.trim();

    if (!title || !content) {
      alert('Judul dan konten wajib diisi!');
      return;
    }

    try {
      const data = {
        title,
        content,
        imageUrl: imageUrl || null,
        updatedAt: new Date().toISOString()
      };

      // CREATE NEW DOCUMENT
      if (!docId) {
        const newDocRef = doc(collection(db, "dokumentasi"));
        await setDoc(newDocRef, {
          ...data,
          createdAt: new Date().toISOString()
        });
        alert('Dokumen baru berhasil dibuat!');
        await new Promise(resolve => setTimeout(resolve, 500)); // Tunggu 500ms
        window.location.href = `/admin/editDokumentasi?id=${newDocRef.id}`;
        return;
      }

      // UPDATE EXISTING DOCUMENT
      const docRef = doc(db, "dokumentasi", docId);
      await setDoc(docRef, data, { merge: true });
      alert('Perubahan tersimpan!');
      await new Promise(resolve => setTimeout(resolve, 500)); // Tunggu 500ms
      window.location.href = '/admin/editDokumentasi';
    } catch (error) {
      console.error('Save error:', error);
      alert(`Gagal menyimpan: ${error.code || error.message}`);
    }
  };

  document.getElementById('edit-form').addEventListener('submit', formSubmitListener);

  if (!docId) return;

  try {
    const docRef = doc(db, "dokumentasi", docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Dokumen tidak ditemukan');
    }

    const data = docSnap.data();
    document.getElementById('title').value = data.title || '';
    document.getElementById('content').value = data.content || '';
    document.getElementById('image-url').value = data.imageUrl || '';
  } catch (error) {
    console.error('Load error:', error);
    alert(error.message);
    window.location.href = '/admin/editDokumentasi';
  }
}

// Fungsi utama untuk setup halaman
async function setupPageFunctionality() {
  try {
    const unsubscribe = onSnapshot(
      collection(db, "dokumentasi"),
      (snapshot) => {
        if (!isUnsubscribed) processSnapshot(snapshot);
      },
      (error) => {
        console.error('Listener error:', error);
        alert('Gagal memuat data realtime');
      }
    );

    window.addEventListener('beforeunload', () => {
      isUnsubscribed = true;
      unsubscribe();
    });

    await loadDocumentForEdit();
  } catch (error) {
    console.error('Setup error:', error);
    alert('Error: ' + error.message);
  }
}

// Autentikasi dan inisialisasi
auth.onAuthStateChanged(async (user) => {
  const container = document.getElementById('edit-container');
  
  if (!user) {
    window.location.href = '/masuk';
    return;
  }

  if (!(await checkAdminRole(user))) {
    window.location.href = '/';
    return;
  }

  loadPageContent();
  setupPageFunctionality();
});