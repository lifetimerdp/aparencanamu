// static/js/firebaseConfig.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeUpI8hb-mLbp4xYldcu5q89vPxGj1EY8",
  authDomain: "aparencanamu.firebaseapp.com",
  projectId: "aparencanamu",
  storageBucket: "aparencanamu.appspot.com",
  messagingSenderId: "1082769981395",
  appId: "1:1082769981395:web:611ad60b17e104b7d83926",
  measurementId: "G-3PGV4HD1BP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

// Export variables
export { app, analytics, auth, db, messaging };