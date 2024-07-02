// dashboard.js
import { auth, db } from './firebaseConfig.js';
import { getDoc, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const dailyActivitiesForm = document.getElementById('daily-activities-form');
const dailyActivitiesInput = document.getElementById('daily-activities-input');
const weeklyPlansForm = document.getElementById('weekly-plans-form');
const weeklyPlansInput = document.getElementById('weekly-plans-input');
const budgetForm = document.getElementById('budget-form');
const budgetInput = document.getElementById('budget-input');

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
      // Isi data dengan data pengguna
      renderList(document.getElementById('daily-activities-list'), userData.dailyActivities || []);
      renderList(document.getElementById('weekly-plans-list'), userData.weeklyPlans || []);
      renderList(document.getElementById('budget-list'), userData.budget || []);
    } else {
      console.log("Dokumen tidak ditemukan!");
    }
  } else {
    console.log("Tidak ada pengguna yang login.");
  }
});

const addData = async (dataType, inputElement) => {
  const user = auth.currentUser;
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const data = inputElement.value.trim();
    if (data) {
      await updateDoc(docRef, {
        [dataType]: arrayUnion(data)
      });
      inputElement.value = '';
      window.location.reload();
    }
  }
};

dailyActivitiesForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addData('dailyActivities', dailyActivitiesInput);
});

weeklyPlansForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addData('weeklyPlans', weeklyPlansInput);
});

budgetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addData('budget', budgetInput);
});