// Import Firebase scripts yang dibutuhkan
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js');

console.log('Firebase scripts imported');

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

console.log('Firebase configuration set');

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

console.log('Firebase initialized');

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

console.log('Firebase Messaging retrieved');

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/img/logo-aparencanamu.png' // Sesuaikan path ini dengan yang ada di proyek Anda
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});