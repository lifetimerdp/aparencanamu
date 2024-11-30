 Berdasarkan kode yang Anda bagikan, masalah duplikasi data pada subaktivitas dan tugas di halaman dashboard disebabkan oleh logika filter yang tidak tepat dalam fungsi `renderSubActivities` dan `renderTasks`.

Di file `dailyActivities.js`, Anda menggunakan `Array.from(new Map(...))` untuk membuat array unik, tetapi filter yang Anda gunakan hanya memfilter status 'selesai':

```javascript
const uniqueSubActivities = Array.from(new Map(
  subActivities.filter(sa => sa.status !== 'selesai')
    .map(sa => [sa.id, sa])
)).values());
```

Ini berarti jika ada subaktivitas atau tugas dengan ID yang sama tetapi status berbeda, keduanya akan tetap ditampilkan.

Untuk mengatasi masalah ini, Anda bisa memodifikasi filter untuk memastikan hanya satu item dengan ID unik yang ditampilkan. Berikut adalah perbaikan yang disarankan:

Di `dailyActivities.js`, perbarui fungsi `renderSubActivities` dan `renderTasks`:

```javascript

```

Perubahan utama:
1. Menggunakan `Set` untuk mendapatkan ID unik
2. Mengambil item pertama untuk setiap ID unik menggunakan `find()`
3. Filter tetap mempertahankan logika asli (status 'selesai' atau belum selesai)

Dengan pendekatan ini, jika ada beberapa item dengan ID yang sama, hanya satu item yang akan ditampilkan, menghindari duplikasi.

Catatan: Pastikan untuk memeriksa mengapa Anda memiliki data dengan ID yang sama di Firestore. Ini mungkin mengindikasikan masalah pada saat penambahan atau sinkronisasi data.

Apakah Anda ingin saya membantu Anda menyelidiki mengapa data duplikat bisa terjadi di Firestore?