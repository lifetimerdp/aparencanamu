import { auth, db } from './firebaseConfig.js';
import { getDoc, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = '/masuk'
  } else {
    loadUserData()
  }
});

const booksReadForm = document.getElementById('books-read-form');
const booksReadInput = document.getElementById('books-read-input');
const coursesTakenForm = document.getElementById('courses-taken-form');
const coursesTakenInput = document.getElementById('courses-taken-input');
const hobbiesInterestsForm = document.getElementById('hobbies-interests-form');
const hobbiesInterestsInput = document.getElementById('hobbies-interests-input');
const keterampilanForm = document.getElementById('keterampilan-form');
const keterampilanInput = document.getElementById('keterampilan-input');
const prestasiForm = document.getElementById('prestasi-form');
const prestasiInput = document.getElementById('prestasi-input');
const targetForm = document.getElementById('target-form');
const targetInput = document.getElementById('target-input');
const sertifikasiForm = document.getElementById('sertifikasi-form');
const sertifikasiInput = document.getElementById('sertifikasi-input');
const catatanForm = document.getElementById('catatan-form');
const catatanInput = document.getElementById('catatan-input');

const renderList = (listElement, emptyElement, items) => {
  if (!items || items.length === 0) {
    listElement.style.display = 'none';
    emptyElement.style.display = 'block';
    return
  }
  listElement.style.display = 'block';
  emptyElement.style.display = 'none';
  listElement.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '×';
    deleteButton.className = 'delete-btn';
    deleteButton.onclick = () => deleteItem(item, listElement.id);
    li.appendChild(deleteButton);
    listElement.appendChild(li)
  })
};

const deleteItem = async (item, listId) => {
  const user = auth.currentUser;
  if (!user) return;
  const docRef = doc(db, "users", user.uid);
  const fieldMap = {
    'books-read-list': 'booksRead',
    'courses-taken-list': 'coursesTaken',
    'hobbies-interests-list': 'hobbiesInterests',
    'keterampilan-list': 'keterampilan',
    'prestasi-list': 'prestasi',
    'target-list': 'target',
    'sertifikasi-list': 'sertifikasi',
    'catatan-list': 'catatan'
  };
  const field = fieldMap[listId];
  const userDoc = await getDoc(docRef);
  const currentItems = userDoc.data()[field] || [];
  const updatedItems = currentItems.filter(i => i !== item);
  await updateDoc(docRef, {
    [field]: updatedItems
  });
  loadUserData()
};

const loadUserData = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.log("Tidak ada pengguna yang login.");
    return;
  }
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      console.log("Dokumen tidak ditemukan!");
      return;
    }
    const userData = userDoc.data();

    // Render semua data
    renderList(document.getElementById('books-read-list'), document.getElementById('books-read-empty'), userData.booksRead || []);
    renderList(document.getElementById('courses-taken-list'), document.getElementById('courses-taken-empty'), userData.coursesTaken || []);
    renderList(document.getElementById('hobbies-interests-list'), document.getElementById('hobbies-interests-empty'), userData.hobbiesInterests || []);
    renderList(document.getElementById('keterampilan-list'), document.getElementById('keterampilan-empty'), userData.keterampilan || []);
    renderList(document.getElementById('prestasi-list'), document.getElementById('prestasi-empty'), userData.prestasi || []);
    renderList(document.getElementById('target-list'), document.getElementById('target-empty'), userData.target || []);
    renderList(document.getElementById('sertifikasi-list'), document.getElementById('sertifikasi-empty'), userData.sertifikasi || []);
    renderList(document.getElementById('catatan-list'), document.getElementById('catatan-empty'), userData.catatan || []);
  } catch (error) {
    console.error("Error saat memuat data pengguna:", error);
  }
};

const addPersonalDevelopmentData = async (devType, inputElement) => {
  const user = auth.currentUser;
  if (!user) return;
  const docRef = doc(db, "users", user.uid);
  const devData = inputElement.value.trim();
  if (devData) {
    try {
      await updateDoc(docRef, {
        [devType]: arrayUnion(devData)
      });
      inputElement.value = '';
      loadUserData();
    } catch (error) {
      console.error("Error saat menambah data:", error);
    }
  }
};

// Event listeners untuk form yang sudah ada
booksReadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addPersonalDevelopmentData('booksRead', booksReadInput);
});

coursesTakenForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addPersonalDevelopmentData('coursesTaken', coursesTakenInput);
});

hobbiesInterestsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addPersonalDevelopmentData('hobbiesInterests', hobbiesInterestsInput);
});

// Event listeners untuk form baru
keterampilanForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addPersonalDevelopmentData('keterampilan', keterampilanInput);
});

prestasiForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addPersonalDevelopmentData('prestasi', prestasiInput);
});

targetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addPersonalDevelopmentData('target', targetInput);
});

sertifikasiForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addPersonalDevelopmentData('sertifikasi', sertifikasiInput);
});

catatanForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addPersonalDevelopmentData('catatan', catatanInput);
});