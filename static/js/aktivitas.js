// static/js/aktivitas.js

import { db, auth } from './firebaseConfig.js';
import { collection, addDoc, query, getDocs, doc, updateDoc, deleteDoc, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const activityForm = document.getElementById('activity-form');
  const activityList = document.getElementById('activity-list');
  const activityInput = document.getElementById('activity');
  let userId = null;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      userId = user.uid;
      loadActivities();
    } else {
      userId = null;
      activityList.innerHTML = '<li>Login untuk melihat aktivitas Anda.</li>';
    }
  });

  // Memuat aktivitas dari Firestore
  function loadActivities() {
    if (!userId) return;
    const q = query(collection(db, `users/${userId}/aktivitas`));
    getDocs(q).then((querySnapshot) => {
      activityList.innerHTML = ''; // Bersihkan daftar aktivitas sebelumnya
      querySnapshot.forEach((doc) => {
        addActivityToList(doc.id, doc.data().activity);
      });
    });
  }

  // Menambahkan aktivitas ke dalam daftar di DOM
  function addActivityToList(id, activity) {
    const li = document.createElement('li');
    li.textContent = activity;
    li.setAttribute('data-id', id);

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => editActivity(id, activity));

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Hapus';
    deleteButton.addEventListener('click', () => deleteActivity(id));

    li.appendChild(editButton);
    li.appendChild(deleteButton);
    activityList.appendChild(li);
  }

  // Menangani submit form untuk menambahkan aktivitas baru
  activityForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!userId) {
      alert('Login terlebih dahulu untuk menambahkan aktivitas.');
      return;
    }
    const activity = activityInput.value;
    if (activity) {
      addDoc(collection(db, `users/${userId}/aktivitas`), {
        activity: activity
      }).then((docRef) => {
        addActivityToList(docRef.id, activity);
        activityInput.value = '';
      });
    }
  });

  // Mengedit aktivitas
  function editActivity(id, oldActivity) {
    const newActivity = prompt("Edit aktivitas:", oldActivity);
    if (newActivity && newActivity !== oldActivity) {
      const docRef = doc(db, `users/${userId}/aktivitas`, id);
      updateDoc(docRef, { activity: newActivity }).then(() => {
        const li = activityList.querySelector(`[data-id='${id}']`);
        li.firstChild.textContent = newActivity;
      });
    }
  }

  // Menghapus aktivitas
  function deleteActivity(id) {
    const docRef = doc(db, `users/${userId}/aktivitas`, id);
    deleteDoc(docRef).then(() => {
      const li = activityList.querySelector(`[data-id='${id}']`);
      li.remove();
    });
  }
});