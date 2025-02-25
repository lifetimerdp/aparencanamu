import { auth, db, doc, getDoc, updateDoc, deleteDoc } from '/js/firebaseConfig.js';

class MagicPopup {
  constructor() {
    this.element = document.getElementById('magicPopup');
    if (!this.element) return;

    this.currentDocPath = null; // Menyimpan path dokumen yang sedang dibuka
    window.magicPopupInstance = this;
    this.initEvents();
  }

  async show() {
    const type = this.element.dataset.tipe || 'info';
    this.element.querySelector('.judul').textContent = this.element.dataset.judul;

    if (type === 'info') {
      await this.loadData();
      this.toggleEditMode(this.element.dataset.allowEdit === 'true');
    } else {
      this.showNotification();
    }
  }

  async loadData() {
    try {
      const paths = JSON.parse(this.element.dataset.paths);
      if (!paths || paths.length === 0) {
        throw new Error('Path Firestore tidak ditemukan.');
      }

      const docConfig = paths[0];
      this.currentDocPath = docConfig.path.replace(/{userId}/g, auth.currentUser.uid);

      const data = await this.fetchData(docConfig);
      this.renderData(data, docConfig.fields);
    } catch (error) {
      this.showError(`Gagal memuat data: ${error.message}`);
    }
  }

  async fetchData({ path }) {
    const docRef = doc(db, path.replace(/{userId}/g, auth.currentUser.uid));
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Dokumen tidak ditemukan.');
    }

    return docSnap.data();
  }

  renderData(data, fields) {
    const form = this.element.querySelector('.isi-form');
    form.innerHTML = fields.map(field => this.renderField(field, data)).join('');
  }

  renderField(fieldPath, data) {
    const [isArray, cleanPath] = fieldPath.endsWith('[]') ?
      [true, fieldPath.slice(0, -2)] : [false, fieldPath];

    const value = this.getNestedValue(data, cleanPath);
    const isEditable = this.element.dataset.allowEdit === 'true';

    return `
      <div class="field-data" data-field="${cleanPath}">
        <label>${this.formatLabel(cleanPath)}</label>
        ${isArray ?
          this.renderArrayField(value, isEditable) :
          this.renderInputField(cleanPath, value, isEditable)}
      </div>
    `;
  }

  renderInputField(fieldPath, value, editable) {
    if (typeof value === 'object' && value !== null) {
      return `<pre>${JSON.stringify(value, null, 2)}</pre>`;
    }

    return editable ?
      `<input name="${fieldPath}" value="${value || ''}" />` :
      `<div>${this.formatValue(value)}</div>`;
  }

  renderArrayField(items, editable) {
    if (!items || !Array.isArray(items)) {
      return `<div>-</div>`;
    }

    if (editable) {
      return `
        <div class="array-editor">
          ${items.map((item, index) => `
            <div class="array-item">
              <input value="${item}" />
              <button class="btn-hapus-item" data-index="${index}">×</button>
            </div>
          `).join('')}
          <button class="btn-tambah-item">+ Tambah Item</button>
        </div>
      `;
    }

    return items.map(item => `
      <div class="array-item">${this.formatValue(item)}</div>
    `).join('');
  }

  async saveData() {
    if (this.element.dataset.allowEdit !== 'true') return;

    const docRef = doc(db, this.currentDocPath);
    const formData = this.collectFormData();

    try {
      await updateDoc(docRef, formData);
      this.showNotification('Data berhasil diperbarui!', 'sukses');
    } catch (error) {
      this.showError(`Gagal menyimpan data: ${error.message}`);
    }
  }

  async deleteData() {
    if (this.element.dataset.allowDelete !== 'true') return;

    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

    try {
      await deleteDoc(doc(db, this.currentDocPath));
      this.showNotification('Data berhasil dihapus!', 'sukses');
      this.close();
    } catch (error) {
      this.showError(`Gagal menghapus data: ${error.message}`);
    }
  }

  collectFormData() {
    const data = {};
    this.element.querySelectorAll('.field-data').forEach(field => {
      const fieldPath = field.dataset.field;
      const input = field.querySelector('input, textarea');

      if (input) {
        data[fieldPath] = input.value;
      }
    });
    return data;
  }

  toggleEditMode(enabled) {
    this.element.querySelectorAll('input, textarea').forEach(input => {
      input.disabled = !enabled;
    });
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  formatLabel(field) {
    return field
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  formatValue(value) {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object' && !Array.isArray(value)) {
      return JSON.stringify(value, null, 2);
    }
    if (value?.toDate instanceof Function) {
      return value.toDate().toLocaleString();
    }
    return value;
  }

  showNotification(message, type = 'info') {
    const icon = this.element.querySelector('.ikon');
    const text = this.element.querySelector('.teks-pesan');

    if (icon && text) {
      icon.textContent = type === 'sukses' ? '✅' : '❌';
      text.textContent = message;
    }
  }

  showError(message) {
    this.showNotification(`Error: ${message}`, 'error');
  }

  initEvents() {
    // Tutup popup saat mengklik di luar area atau tombol close (×)
    this.element.addEventListener('click', e => {
      if (e.target.classList.contains('tutup') || e.target === this.element) {
        this.close();
      }
    });

    // Event untuk tombol Simpan
    this.element.querySelector('.btn-simpan')?.addEventListener('click', () => this.saveData());

    // Event untuk tombol Hapus
    this.element.querySelector('.btn-hapus')?.addEventListener('click', () => this.deleteData());
  }

  close() {
    this.element.style.display = 'none';
    this.element.querySelector('.isi-form').innerHTML = '';
  }
}

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', () => new MagicPopup());