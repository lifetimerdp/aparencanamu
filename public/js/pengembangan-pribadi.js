// pengembangan-pribadi.js
import { auth, db } from './firebaseConfig.js';
import { getDoc, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const booksReadForm = document.getElementById('books-read-form');
const booksReadInput = document.getElementById('books-read-input');
const coursesTakenForm = document.getElementById('courses-taken-form');
const coursesTakenInput = document.getElementById('courses-taken-input');
const hobbiesInterestsForm = document.getElementById('hobbies-interests-form');
const hobbiesInterestsInput = document.getElementById('hobbies-interests-input');

const renderList = (listElement, items) => {
  listElement.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    listElement.appendChild(li);
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  const user = auth.currentUser;
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Isi data pengembangan pribadi dengan data pengguna
      renderList(document.getElementById('books-read-list'), userData.booksRead || []);
      renderList(document.getElementById('courses-taken-list'), userData.coursesTaken || []);
      renderList(document.getElementById('hobbies-interests-list'), userData.hobbiesInterests || []);
    } else {
      console.log("Dokumen tidak ditemukan!");
    }
  } else {
    console.log("Tidak ada pengguna yang login.");
  }
});

const addPersonalDevelopmentData = async (devType, inputElement) => {
  const user = auth.currentUser;
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const devData = inputElement.value.trim();
    if (devData) {
      await updateDoc(docRef, {
        [devType]: arrayUnion(devData)
      });
      inputElement.value = '';
      window.location.reload();
    }
  }
};

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