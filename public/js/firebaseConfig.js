import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyAeUpI8hb-mLbp4xYldcu5q89vPxGj1EY8",
  authDomain: "aparencanamu.firebaseapp.com",
  projectId: "aparencanamu",
  storageBucket: "aparencanamu.appspot.com",
  messagingSenderId: "1082769981395",
  appId: "1:1082769981395:web:611ad60b17e104b7d83926",
  measurementId: "G-3PGV4HD1BP"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

export { 
  app, 
  analytics, 
  auth, 
  db, 
  messaging,
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  getDoc, 
  logEvent 
};