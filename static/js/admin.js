import { auth, db } from './firebaseConfig.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Fungsi untuk memuat konten admin
const loadAdminContent = () => {
  const container = document.getElementById('admin-container');
  container.innerHTML = `
    <h1>Admin Dashboard</h1>
    <nav>
      <a href="/admin/editDokumentasi">Edit Dokumentasi</a>
      <button id="logout-btn">Logout</button>
    </nav>
  `;

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    auth.signOut().then(() => window.location.href = '/');
  });
};

// Cek role pengguna
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists() && userDoc.data().role === 'admin') {
      loadAdminContent(); // Muat konten admin
    } else {
      window.location.href = '/'; // Redirect jika bukan admin
    }
  } else {
    window.location.href = '/masuk'; // Redirect jika belum login
  }
});