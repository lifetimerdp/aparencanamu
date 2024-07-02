// static/js/firebaseConfig.js

// Mengimpor fungsi yang diperlukan dari SDK Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

// Konfigurasi Firebase untuk aplikasi web
const firebaseConfig = {
  apiKey: "AIzaSyAeUpI8hb-mLbp4xYldcu5q89vPxGj1EY8",
  authDomain: "aparencanamu.firebaseapp.com",
  projectId: "aparencanamu",
  storageBucket: "aparencanamu.appspot.com",
  messagingSenderId: "1082769981395",
  appId: "1:1082769981395:web:611ad60b17e104b7d83926",
  measurementId: "G-3PGV4HD1BP"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Ekspor variabel yang diperlukan
export { app, analytics, auth, db };