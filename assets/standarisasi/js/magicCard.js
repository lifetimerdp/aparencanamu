import { 
  db, 
  auth, 
  analytics, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  increment, 
  logEvent 
} from '/js/firebaseConfig.js';

// Inisialisasi Magic Card
document.addEventListener('DOMContentLoaded', () => {
  initializeMagicCards();
});

// Fungsi Utama untuk Inisialisasi Kartu
async function initializeMagicCards() {
  // Inisialisasi Like Button
  document.querySelectorAll('.magic-like-btn').forEach(btn => {
    btn.addEventListener('click', handleLike);
  });

  // Inisialisasi Tombol Aksi
  document.querySelectorAll('.magic-action-btn').forEach(btn => {
    btn.addEventListener('click', trackAction);
  });

  // Inisialisasi Like Counter
  const cardsWithLikes = document.querySelectorAll('.magic-card[data-dokumen]');
  cardsWithLikes.forEach(async card => {
    const dokumenId = card.dataset.dokumen;

    // Pastikan dokumen ada
    await initMagicDocument(dokumenId);

    // Ambil jumlah like
    const likes = await getLikesCount(dokumenId);
    card.querySelector('.magic-like-count').textContent = likes;
  });
}

// Fungsi untuk Membuat Dokumen Baru (Jika Belum Ada)
async function initMagicDocument(dokumenId) {
  const docRef = doc(db, "magicKomponen", dokumenId);
  const docSnap = await getDoc(docRef);

  // Jika dokumen belum ada, buat baru
  if (!docSnap.exists()) {
    await setDoc(docRef, {
      likes: 0, // Field tetap di root
      createdAt: new Date() // Field tetap di root
    });
  }
}

// Fungsi untuk Menangani Like
async function handleLike(e) {
  const card = e.target.closest('.magic-card');
  const dokumenId = card.dataset.dokumen;
  const user = auth.currentUser;

  if (!user) {
    alert('Silakan login untuk memberikan like!');
    return;
  }

  try {
    const docRef = doc(db, "magicKomponen", dokumenId);
    const docSnap = await getDoc(docRef);

    // Validasi di kode: Pastikan like hanya bertambah 1
    const currentLikes = docSnap.exists() ? docSnap.data().likes || 0 : 0;
    
    await updateDoc(docRef, {
      likes: currentLikes + 1
    });

    // Update tampilan
    const countElement = card.querySelector('.magic-like-count');
    countElement.textContent = currentLikes + 1;

  } catch (error) {
    console.error('Error updating like:', error);
  }
}

// Fungsi untuk Mengambil Jumlah Like
async function getLikesCount(dokumenId) {
  try {
    const docRef = doc(db, "magicKomponen", dokumenId);
    const docSnap = await getDoc(docRef);

    // Jika dokumen ada, kembalikan nilai likes; jika tidak, kembalikan 0
    return docSnap.exists() ? docSnap.data().likes || 0 : 0;
  } catch (error) {
    console.error('Error getting likes:', error);
    return 0;
  }
}

// Fungsi untuk Melacak Aksi Tombol
function trackAction(e) {
  const action = e.target.dataset.action;
  const buttonText = e.target.textContent.trim();

  // Log event ke Firebase Analytics
  logEvent(analytics, 'card_action', {
    action: action,
    button_text: buttonText
  });
}