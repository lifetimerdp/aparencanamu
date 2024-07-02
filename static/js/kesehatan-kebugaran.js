// kesehatan-kebugaran.js
import { auth, db } from './firebaseConfig.js';
import { getDoc, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const physicalActivitiesForm = document.getElementById('physical-activities-form');
const physicalActivitiesInput = document.getElementById('physical-activities-input');
const healthGoalsForm = document.getElementById('health-goals-form');
const healthGoalsInput = document.getElementById('health-goals-input');

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
      // Isi data kesehatan dan kebugaran dengan data pengguna
      renderList(document.getElementById('physical-activities-list'), userData.physicalActivities || []);
      renderList(document.getElementById('health-goals-list'), userData.healthGoals || []);
    } else {
      console.log("Dokumen tidak ditemukan!");
    }
  } else {
    console.log("Tidak ada pengguna yang login.");
  }
});

const addHealthData = async (healthType, inputElement) => {
  const user = auth.currentUser;
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const healthData = inputElement.value.trim();
    if (healthData) {
      await updateDoc(docRef, {
        [healthType]: arrayUnion(healthData)
      });
      inputElement.value = '';
      window.location.reload();
    }
  }
};

physicalActivitiesForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addHealthData('physicalActivities', physicalActivitiesInput);
});

healthGoalsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addHealthData('healthGoals', healthGoalsInput);
});