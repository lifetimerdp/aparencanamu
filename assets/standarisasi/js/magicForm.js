import { auth, db, doc, setDoc, updateDoc, getDoc } from '/js/firebaseConfig.js';

document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('.magic-form');
  
  const getValueFromInput = (element) => {
    if (element.type === 'checkbox') {
      return Array.from(document.querySelectorAll(`input[name="${element.name}"]:checked`))
        .map(checkbox => checkbox.value);
    }
    if (element.type === 'radio') {
      const checked = document.querySelector(`input[name="${element.name}"]:checked`);
      return checked ? checked.value : null;
    }
    if (element.type === 'number') {
      return Number(element.value);
    }
    return element.value;
  };

  const handleFormSubmit = async (e, container) => {
    e.preventDefault();
    const form = e.target;
    const statusMessage = container.querySelector('.status-message');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Silakan login terlebih dahulu');
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner"></div> Menyimpan...';

      // Konfigurasi Firestore
      const collectionName = container.dataset.koleksi;
      const componentName = container.dataset.namaKomponen;
      const customDocId = container.dataset.dokumen;
      
      // Di magicForm.js, ubah bagian pembuatan docRef
			const finalDocId = customDocId || user.uid;
			const docRef = doc(
			  db, 
			  collectionName, 
			  componentName, 
			  'pengguna', 
			  finalDocId
			);

      // Kumpulkan data form
      const formData = {};
      const elements = form.elements;
      
      Array.from(elements).forEach(element => {
        if (element.name && !['submit', 'button'].includes(element.type)) {
          formData[element.name] = getValueFromInput(element);
        }
      });

      // Tambahkan metadata
      const timestamp = new Date();
      const dataToSave = {
        ...formData,
        metadata: {
          createdAt: timestamp,
          updatedAt: timestamp,
          userId: user.uid,
          komponen: componentName
        }
      };

      // Cek dokumen existing
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        dataToSave.metadata.updatedAt = timestamp;
        await updateDoc(docRef, dataToSave);
      } else {
        await setDoc(docRef, dataToSave);
      }

      // Tampilkan feedback
      statusMessage.textContent = '✅ Data berhasil disimpan!';
      statusMessage.className = 'status-message success';
      
      // Redirect jika ada
      if (container.dataset.redirect) {
        setTimeout(() => {
          window.location.href = container.dataset.redirect;
        }, 1500);
      }
    } catch (error) {
      console.error('Error:', error);
      statusMessage.innerHTML = `❌ Gagal menyimpan: <em>${error.message}</em>`;
      statusMessage.className = 'status-message error';
    } finally {
      statusMessage.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Simpan';
      
      setTimeout(() => {
        statusMessage.style.display = 'none';
      }, 3000);
    }
  };

  // Inisialisasi semua form
  forms.forEach(form => {
    const container = form.closest('.magic-form-container');
    form.addEventListener('submit', (e) => handleFormSubmit(e, container));
  });
});