// sosial-komunitas.js
import { auth, db } from './firebaseConfig.js';
import { getDoc, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const contactNetworkForm = document.getElementById('contact-network-form');
const contactNetworkInput = document.getElementById('contact-network-input');
const groupsForm = document.getElementById('groups-form');
const groupsInput = document.getElementById('groups-input');
const socialActivitiesForm = document.getElementById('social-activities-form');
const socialActivitiesInput = document.getElementById('social-activities-input');

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
      // Isi data sosial dan komunitas dengan data pengguna
      renderList(document.getElementById('contact-network-list'), userData.contactNetwork || []);
      renderList(document.getElementById('groups-list'), userData.groups || []);
      renderList(document.getElementById('social-activities-list'), userData.socialActivities || []);
    } else {
      console.log("Dokumen tidak ditemukan!");
    }
  } else {
    console.log("Tidak ada pengguna yang login.");
  }
});

const addSocialData = async (socialType, inputElement) => {
  const user = auth.currentUser;
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const socialData = inputElement.value.trim();
    if (socialData) {
      await updateDoc(docRef, {
        [socialType]: arrayUnion(socialData)
      });
      inputElement.value = '';
      window.location.reload();
    }
  }
};

contactNetworkForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addSocialData('contactNetwork', contactNetworkInput);
});

groupsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addSocialData('groups', groupsInput);
});

socialActivitiesForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addSocialData('socialActivities', socialActivitiesInput);
});