import { 
  auth, 
  db, 
  doc, 
  collection, 
  getDoc, 
  getDocs, 
  query, 
  where 
} from '/js/firebaseConfig.js';

const buildPathReference = (path) => {
  const segments = path.split('/').filter(s => s);
  let ref = db;
  
  for(let i = 0; i < segments.length; i++) {
    ref = i % 2 === 0 ? collection(ref, segments[i]) : doc(ref, segments[i]);
  }
  return ref;
};

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((o, k) => o?.[k], obj) || '-';
};

const handleMagicTable = async (container) => {
  let param;
  
  try {
    param = {
      namaTabel: container.dataset.namaTabel,
      path: container.dataset.path?.replace('{userId}', auth.currentUser?.uid || ''),
      kolom: JSON.parse(container.dataset.kolom || '{}'),
      filter: container.dataset.filter?.split(',') || []
    };

    if (!auth.currentUser) throw new Error('Pengguna belum login');
    if (!param.path) throw new Error('Parameter path wajib diisi');

    const ref = buildPathReference(param.path);
    const isCollection = ref.path.split('/').length % 2 !== 0;

    let data = [];
    if (isCollection) {
      let q = collection(ref);
      if(param.filter.length === 2) {
        q = query(q, where(param.filter[0], "==", param.filter[1]));
      }
      const snapshot = await getDocs(q);
      data = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    } 
    else {
      const docSnap = await getDoc(ref);
      if (!docSnap.exists()) throw new Error('Dokumen tidak ditemukan');
      data = [docSnap.data()];
    }

    if (!data.length) throw new Error('Tidak ada data yang ditemukan');

    // Render header
    const headers = Object.keys(param.kolom);
    const fields = Object.values(param.kolom);
    
    const headerRow = container.querySelector('.header-tabel');
    if(headerRow) {
      headerRow.innerHTML = headers.map(header => `<th>${header}</th>`).join('');
    }

    // Render body
    const tbody = container.querySelector('.body-tabel');
    if(tbody) {
      tbody.innerHTML = data
        .map(item => `
          <tr>
            ${fields.map(fieldPath => `
              <td>${getNestedValue(item, fieldPath)}</td>
            `).join('')}
          </tr>
        `).join('');
    }

    // Hapus loading state jika ada
    const loadingRow = container.querySelector('.loading');
    if(loadingRow) {
      loadingRow.remove();
    }

  } catch (error) {
    console.error('MagicTable Error:', error);
    const errorContainer = container.querySelector('.pesan-error');
    if(errorContainer) {
      errorContainer.innerHTML = `
        <div class="error-message">
          <strong>Error pada ${param?.namaTabel || 'Tabel'}:</strong><br>
          ${error.message}<br>
          <small>Path: ${param?.path || 'tidak valid'}</small>
        </div>
      `;
    }
    const loadingRow = container.querySelector('.loading');
    if(loadingRow) {
      loadingRow.remove();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(user => {
    document.querySelectorAll('.magic-table-container').forEach(container => {
      if(user) {
        handleMagicTable(container);
      } else {
        container.innerHTML = '<div class="error">Silakan login untuk melihat tabel</div>';
      }
    });
  });
});