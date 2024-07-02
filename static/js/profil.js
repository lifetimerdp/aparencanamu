import { auth, db } from './firebaseConfig.js';
import { getDoc, setDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { signOut, deleteUser, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Fungsi untuk logout
const logout = async () => {
  try {
    await signOut(auth);
    alert("Logout berhasil!");
    window.location.href = '/masuk';
  } catch (error) {
    alert(`Logout gagal: ${error.message}`);
  }
};

// Fungsi untuk menghapus akun
const deleteAccount = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      // Hapus data pengguna dari Firestore
      await deleteDoc(doc(db, "users", user.uid));
      // Hapus akun pengguna dari Authentication
      await deleteUser(user);
      alert("Akun berhasil dihapus!");
      window.location.href = '/masuk';
    } catch (error) {
      alert(`Penghapusan akun gagal: ${error.message}`);
    }
  } else {
    alert("Tidak ada pengguna yang login.");
  }
};

// Menampilkan informasi pengguna dari Firestore ke tampilan profil
const loadUserProfile = async (userId) => {
  const docRef = doc(db, "users", userId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      document.getElementById('name-display').textContent = userData.name || '-';
      document.getElementById('email-display').textContent = userData.email || '-';
      document.getElementById('phone-display').textContent = userData.phone || '-';
      document.getElementById('address-display').textContent = userData.address || '-';
      document.getElementById('education-display').textContent = userData.education || '-';
      document.getElementById('institution-display').textContent = userData.institution || '-';
      document.getElementById('currentJob-display').textContent = userData.currentJob || '-';
      document.getElementById('workHistory-display').textContent = userData.workHistory || '-';
      document.getElementById('skills-display').textContent = userData.skills || '-';
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error fetching document:", error);
  }
};

// Mengisi form edit profil dengan data dari Firestore
const populateProfileForm = async (userId) => {
  const docRef = doc(db, "users", userId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      document.getElementById('name').value = userData.name || '';
      document.getElementById('email').value = userData.email || '';
      document.getElementById('phone').value = userData.phone || '';
      document.getElementById('address').value = userData.address || '';
      document.getElementById('education').value = userData.education || '';
      document.getElementById('institution').value = userData.institution || '';
      document.getElementById('currentJob').value = userData.currentJob || '';
      document.getElementById('workHistory').value = userData.workHistory || '';
      document.getElementById('skills').value = userData.skills || '';
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error fetching document:", error);
  }
};

// Menyimpan perubahan data pengguna ke Firestore
const saveUserProfile = async (userId) => {
  const userData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    education: document.getElementById('education').value,
    institution: document.getElementById('institution').value,
    currentJob: document.getElementById('currentJob').value,
    workHistory: document.getElementById('workHistory').value,
    skills: document.getElementById('skills').value,
  };

  try {
    await setDoc(doc(db, "users", userId), userData, { merge: true });
    alert("Profil berhasil diperbarui!");
    loadUserProfile(userId); // Memuat kembali informasi profil yang telah diperbarui
  } catch (error) {
    alert(`Gagal memperbarui profil: ${error.message}`);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Event listener untuk tombol edit
  document.getElementById('edit-profile-btn').addEventListener('click', () => {
    document.getElementById('profile-form').style.display = 'block';
    document.getElementById('save-profile-btn').style.display = 'block';
    document.getElementById('edit-profile-btn').style.display = 'none';
    populateProfileForm(auth.currentUser.uid);
  });

  // Event listener untuk menyimpan perubahan profil
  document.getElementById('save-profile-btn').addEventListener('click', () => {
    const user = auth.currentUser;
    if (user) {
      saveUserProfile(user.uid);
      document.getElementById('profile-form').style.display = 'none';
      document.getElementById('save-profile-btn').style.display = 'none';
      document.getElementById('edit-profile-btn').style.display = 'block';
    } else {
      alert("Tidak ada pengguna yang login.");
    }
  });

  // Event listener untuk tombol logout
  document.getElementById('logout-btn').addEventListener('click', logout);

  // Event listener untuk tombol hapus akun
  document.getElementById('delete-account-btn').addEventListener('click', () => {
    if (confirm("Apakah Anda yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan.")) {
      deleteAccount();
    }
  });

  // Memuat profil pengguna saat terautentikasi
  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.querySelector('.profile-container').style.display = 'block';
      loadUserProfile(user.uid);
    } else {
      window.location.href = '/masuk';
    }
  });
});