// Log untuk memastikan Service Worker dimulai
console.log('Service Worker mulai berjalan.');

// Import Firebase scripts dengan log
try {
    console.log('Mengimpor firebase-app.js...');
    importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
    console.log('firebase-app.js berhasil diimpor.');

    console.log('Mengimpor firebase-messaging.js...');
    importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');
    console.log('firebase-messaging.js berhasil diimpor.');
} catch (e) {
    console.error('Gagal mengimpor Firebase scripts:', e);
}

// Inisialisasi Firebase dengan log
try {
    console.log('Inisialisasi Firebase...');
    firebase.initializeApp({
        apiKey: "AIzaSyAeUpI8hb-mLbp4xYldcu5q89vPxGj1EY8",
        authDomain: "aparencanamu.firebaseapp.com",
        projectId: "aparencanamu",
        storageBucket: "aparencanamu.appspot.com",
        messagingSenderId: "1082769981395",
        appId: "1:1082769981395:web:611ad60b17e104b7d83926",
        measurementId: "G-3PGV4HD1BP"
    });
    console.log('Firebase berhasil diinisialisasi.');
} catch (e) {
    console.error('Gagal menginisialisasi Firebase:', e);
}

// Mendapatkan instance messaging dengan log
try {
    console.log('Mendapatkan instance Firebase Messaging...');
    const messaging = firebase.messaging();
    console.log('Instance Firebase Messaging berhasil didapatkan.');

    // Handle background message dengan log
    messaging.onBackgroundMessage((payload) => {
        console.log('Received background message ', payload);
        // Customize notification here
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: '/firebase-logo.png'
        };

        console.log('Menampilkan notifikasi:', notificationTitle, notificationOptions);
        self.registration.showNotification(notificationTitle, notificationOptions);
    });

} catch (e) {
    console.error('Gagal mendapatkan instance Firebase Messaging:', e);
}