import { auth, db, doc, setDoc, getDoc, onSnapshot } from '/js/firebaseConfig.js';

class MagicNav {
  constructor() {
    this.navElement = document.querySelector('.magic-nav');
    this.init();
  }

  async init() {
    await this.initializeFirebase();
    this.setupEventListeners();
  }

  async initializeFirebase() {
    this.user = auth.currentUser;
    if (!this.user) return;

    this.koleksi = this.navElement.dataset.koleksi;
    this.kolom = this.navElement.dataset.kolom;
    this.dokumenId = this.navElement.dataset.dokumen || this.user.uid;

    this.docRef = doc(db, 'magicKomponen', this.koleksi, 'pengguna', this.dokumenId);
    
    await this.initializeDocument();
    this.setupRealtimeUpdates();
  }

  async initializeDocument() {
    const docSnap = await getDoc(this.docRef);
    
    if (!docSnap.exists()) {
      await setDoc(this.docRef, {
        metadata: {
          userId: this.user.uid,
          createdAt: new Date()
        },
        [this.kolom]: {
          items: [
            { label: 'Beranda', url: '/' },
            { label: 'Tentang', url: '/tentang' }
          ]
        }
      });
    }
  }

  setupRealtimeUpdates() {
    onSnapshot(this.docRef, (doc) => {
      const data = doc.data();
      if (data && data[this.kolom]) {
        this.renderMenu(data[this.kolom].items);
      }
    });
  }

  renderMenu(items) {
    const menuContainer = document.getElementById('magicNavMenu');
    menuContainer.innerHTML = items.map(item => `
      <a href="${item.url}" class="magic-nav-link">${item.label}</a>
    `).join('');
  }

  setupEventListeners() {
    document.querySelector('.magic-nav-toggle').addEventListener('click', () => {
      document.getElementById('magicNavMenu').classList.toggle('active');
    });
  }
}

// Initialize when auth state changes
auth.onAuthStateChanged(user => {
  if (user) new MagicNav();
});