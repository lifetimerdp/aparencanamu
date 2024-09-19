console.log('Service worker sedang berjalan...');

self.addEventListener('install', (event) => {
    console.log('Service worker diinstall:', event);
    event.waitUntil(self.skipWaiting()); // Memaksa service worker baru untuk segera aktif
});

self.addEventListener('activate', (event) => {
    console.log('Service worker diaktifkan:', event);
    event.waitUntil(self.clients.claim()); // Memastikan service worker baru segera mengontrol semua halaman
});

self.addEventListener('push', (event) => {
    console.log('Push event diterima:', event);

    let data;
    try {
        data = event.data.json();  // Jika event.data adalah objek JSON, ini akan berhasil.
    } catch (e) {
        console.error('Data yang diterima bukan JSON:', e);
        data = { title: 'Unknown Title', message: 'Unknown Message' };  // Backup data
        console.log('Raw push event data:', event.data.text());
    }

    self.registration.showNotification(data.title, {
        body: data.message,
        icon: '/img/logo-aparencanamu.png'
    });
});

self.addEventListener('notificationclick', (event) => {
    console.log('Notifikasi diklik:', event);
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});