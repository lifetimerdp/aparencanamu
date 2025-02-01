import { auth, db } from "./firebaseConfig.js";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CATEGORIES = {
  target: { icon: '🎯', label: 'Target' },
  booksRead: { icon: '📚', label: 'Buku' },
  coursesTaken: { icon: '🎓', label: 'Kursus' },
  hobbiesInterests: { icon: '🎨', label: 'Hobi' },
  keterampilan: { icon: '🛠️', label: 'Keterampilan' },
  prestasi: { icon: '🏆', label: 'Prestasi' },
  sertifikasi: { icon: '📜', label: 'Sertifikasi' },
  catatan: { icon: '📝', label: 'Catatan' }
};

class DevelopmentManager {
  constructor() {
    this.currentStep = 0;
    this.formData = {};
    this.userData = {};
    this.editFormSubmitHandler = null;
    this.debounceTimer = null;
    this.init();
  }

  async init() {
    this.initDOM();
    this.setupEventListeners();
    this.authStateHandler();
    this.setDefaultDate();
    this.populateKategoriOptions();
    this.setupThemeToggle();
  }

  initDOM() {
    this.dom = {
      formWizard: document.querySelector('.form-wizard'),
      wizardPanels: document.querySelectorAll('.wizard-panel'),
      btnPrev: document.querySelectorAll('.btn-prev'),
      btnNext: document.querySelectorAll('.btn-next'),
      kategoriSelect: document.getElementById('kategori-select'),
      itemInput: document.getElementById('item-input'),
      tanggalInput: document.getElementById('tanggal-input'),
      deskripsiInput: document.getElementById('deskripsi-input'),
      dataGrid: document.getElementById('data-sections'),
      sectionTemplate: document.getElementById('section-template'),
      modal: document.getElementById('modal'),
      editForm: document.getElementById('edit-form'),
      themeToggle: document.getElementById('theme-toggle')
    };
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.desktop-tabs a').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const target = tab.getAttribute('href');
        this.showSection(target);
      });
    });

    document.querySelector('.mobile-dropdown').addEventListener('change', (e) => {
      this.showSection(e.target.value);
    });

    // Form Navigation
    this.dom.btnPrev.forEach(btn => 
      btn.addEventListener('click', () => this.handlePrevStep()));
    this.dom.btnNext.forEach(btn => 
      btn.addEventListener('click', () => this.handleNextStep()));

    // Form Submission
    document.getElementById('pengembangan-form').addEventListener('submit', 
      (e) => this.handleFormSubmit(e));

    // Dynamic Elements
    this.dom.dataGrid.addEventListener('click', (e) => this.handleDynamicElements(e));
    this.dom.dataGrid.addEventListener('input', 
      (e) => this.handleSearchInput(e));

    // Character Count
    this.dom.deskripsiInput.addEventListener('input', () => 
      this.updateCharacterCount());

    // Modal Close
    this.dom.modal.querySelector('.btn-close').addEventListener('click', 
      () => this.toggleModal());
  }

  setupThemeToggle() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.body.classList.add(savedTheme);
      this.dom.themeToggle.textContent = savedTheme === 'dark-mode' ? '☀️' : '🌙';
    }

    this.dom.themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDarkMode = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDarkMode ? 'dark-mode' : '');
      this.dom.themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    });
  }

  showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
      section.classList.remove('active');
    });
    document.querySelector(sectionId).classList.add('active');
    
    document.querySelectorAll('.desktop-tabs a').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('href') === sectionId);
    });
  }

  async authStateHandler() {
    auth.onAuthStateChanged(async (user) => {
      if (!user) return (window.location.href = '/masuk');
      await this.loadUserData(user.uid);
      this.renderDataSections();
    });
  }

  handleNextStep() {
    if (!this.validateStep()) return;
    this.currentStep++;
    this.updateWizard();
  }

  handlePrevStep() {
    this.currentStep--;
    this.updateWizard();
  }

  validateStep() {
    const currentPanel = this.dom.wizardPanels[this.currentStep];
    const requiredFields = currentPanel.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!field.checkValidity()) {
        field.reportValidity();
        isValid = false;
      }
    });

    return isValid;
  }

  updateWizard() {
    const progress = ((this.currentStep + 1) / this.dom.wizardPanels.length) * 100;
    this.dom.formWizard.querySelector('.progress-bar').style.width = `${progress}%`;
    
    this.dom.wizardPanels.forEach((panel, index) => {
      panel.classList.toggle('active', index === this.currentStep);
    });

    if (this.currentStep === 2) {
      this.updatePreview();
    }
  }

  updatePreview() {
    const previewContent = this.dom.formWizard.querySelector('.preview-content');
    previewContent.innerHTML = `
      <p><strong>Kategori:</strong> ${CATEGORIES[this.dom.kategoriSelect.value].label}</p>
      <p><strong>Judul:</strong> ${this.dom.itemInput.value}</p>
      <p><strong>Tanggal:</strong> ${new Date(this.dom.tanggalInput.value).toLocaleDateString('id-ID')}</p>
      ${this.dom.deskripsiInput.value ? `<p><strong>Deskripsi:</strong> ${this.dom.deskripsiInput.value}</p>` : ''}
    `;
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    this.showLoading();
    
    try {
      const user = auth.currentUser;
      if (!user) return;

      const itemData = {
        id: this.generateId(),
        title: this.dom.itemInput.value.trim(),
        date: Timestamp.fromDate(new Date(this.dom.tanggalInput.value)),
        description: this.dom.deskripsiInput.value.trim(),
        category: this.dom.kategoriSelect.value,
        createdAt: Timestamp.now(),
      };

      await this.saveToFirebase(user.uid, itemData);
      this.resetForm();
      this.showNotification('Data berhasil disimpan!', 'success');
      await this.loadUserData(user.uid);
      this.renderDataSections();
    } catch (error) {
      this.showNotification(`Gagal menyimpan: ${error.message}`, 'error');
    } finally {
      this.hideLoading();
    }
  }

  showLoading() {
    const button = this.dom.formWizard.querySelector('.btn-submit');
    button.innerHTML = `<div class="loading-spinner"></div>`;
    button.disabled = true;
  }

  hideLoading() {
    const button = this.dom.formWizard.querySelector('.btn-submit');
    button.innerHTML = '💾 Simpan';
    button.disabled = false;
  }

  showNotification(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const existing = toastContainer.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'error' : ''}`;
    notification.textContent = message;
    toastContainer.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  resetForm() {
    this.currentStep = 0;
    this.updateWizard();
    this.dom.formWizard.querySelector('form').reset();
    this.setDefaultDate();
  }

  setDefaultDate() {
    this.dom.tanggalInput.value = new Date().toISOString().split('T')[0];
  }

  populateKategoriOptions() {
    const select = this.dom.kategoriSelect;
    select.innerHTML = '<option value="">Pilih Kategori...</option>';
    
    Object.entries(CATEGORIES).forEach(([value, category]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = `${category.icon} ${category.label}`;
      select.appendChild(option);
    });
  }

  renderDataSections() {
    this.dom.dataGrid.innerHTML = '';
    Object.entries(CATEGORIES).forEach(([key, category]) => {
      const section = this.dom.sectionTemplate.content.cloneNode(true);
      section.querySelector('.section-title').textContent = `${category.icon} ${category.label}`;
      section.querySelector('.data-card').id = `${key}-section`;
      section.querySelector('.btn-add').dataset.category = key;
      this.dom.dataGrid.appendChild(section);
    });
    
    this.renderAllItems();
  }

  renderAllItems() {
    Object.keys(CATEGORIES).forEach(category => {
      const listElement = document.querySelector(`#${category}-section .item-list`);
      const emptyState = document.querySelector(`#${category}-section .empty-state`);
      const items = this.userData[category] || [];
      this.renderItems(listElement, emptyState, items, category);
    });
  }

  renderItems(listElement, emptyState, items, category) {
    listElement.innerHTML = '';
    
    if (items.length === 0) {
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    items.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div>
          <h3>${item.title}</h3>
          <small>${item.date.toDate().toLocaleDateString('id-ID')}</small>
        </div>
        <div class="item-actions">
          <button class="btn-edit" data-id="${item.id}" data-category="${category}">✏️</button>
          <button class="btn-delete" data-id="${item.id}" data-category="${category}">🗑️</button>
        </div>
      `;
      listElement.appendChild(li);
    });
  }

  handleDynamicElements(e) {
    const target = e.target;
    
    if (target.classList.contains('btn-add')) {
      this.handleAddItem(target.dataset.category);
    }
    
    if (target.classList.contains('btn-edit')) {
      this.handleEditItem(target.dataset.id, target.dataset.category);
    }
    
    if (target.classList.contains('btn-delete')) {
      this.handleDeleteItem(target.dataset.id, target.dataset.category);
    }
  }

  handleAddItem(category) {
    this.dom.kategoriSelect.value = category;
    document.querySelector('#form-section').scrollIntoView({ behavior: 'smooth' });
    this.handleNextStep();
  }

  async handleEditItem(itemId, category) {
    const item = this.userData[category]?.find(i => i.id === itemId);
    if (!item) return;

    const editFormHTML = `
      <div class="input-group">
        <label for="edit-title">Judul</label>
        <input id="edit-title" value="${item.title}" required>
      </div>
      <div class="input-group">
        <label for="edit-date">Tanggal</label>
        <input type="date" id="edit-date" value="${item.date.toDate().toISOString().split('T')[0]}" required>
      </div>
      <div class="input-group">
        <label for="edit-desc">Deskripsi</label>
        <textarea id="edit-desc">${item.description || ''}</textarea>
      </div>
      <input type="hidden" id="edit-item-id" value="${itemId}">
      <input type="hidden" id="edit-category" value="${category}">
      <div class="button-group">
        <button type="button" class="btn-cancel">Batal</button>
        <button type="submit" class="btn-submit">Simpan Perubahan</button>
      </div>
    `;

    this.toggleModal(editFormHTML);

    if (this.editFormSubmitHandler) {
      this.dom.editForm.removeEventListener('submit', this.editFormSubmitHandler);
    }

    this.dom.editForm.querySelector('.btn-cancel').addEventListener('click', 
      () => this.toggleModal());
    
    this.editFormSubmitHandler = (e) => this.handleUpdateItem(e);
    this.dom.editForm.addEventListener('submit', this.editFormSubmitHandler);
  }

  async handleUpdateItem(e) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const updates = {
      title: document.getElementById('edit-title').value,
      date: Timestamp.fromDate(new Date(document.getElementById('edit-date').value)),
      description: document.getElementById('edit-desc').value,
      updatedAt: Timestamp.now(),
    };

    try {
      const userRef = doc(db, 'users', user.uid);
      const category = document.getElementById('edit-category').value;
      const itemId = document.getElementById('edit-item-id').value;
      
      const updatedItems = this.userData[category].map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      );

      await updateDoc(userRef, { [category]: updatedItems });
      this.toggleModal();
      this.showNotification('Perubahan berhasil disimpan!', 'success');
      
      const listElement = document.querySelector(`#${category}-section .item-list`);
      const emptyState = document.querySelector(`#${category}-section .empty-state`);
      this.renderItems(listElement, emptyState, updatedItems, category);
    } catch (error) {
      this.showNotification(`Gagal menyimpan perubahan: ${error.message}`, 'error');
    }
  }

  async handleDeleteItem(itemId, category) {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;
    
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const filteredItems = this.userData[category].filter(item => item.id !== itemId);
      
      await updateDoc(userRef, { [category]: filteredItems });
      this.showNotification('Item berhasil dihapus', 'success');
      
      const listElement = document.querySelector(`#${category}-section .item-list`);
      const emptyState = document.querySelector(`#${category}-section .empty-state`);
      this.renderItems(listElement, emptyState, filteredItems, category);
    } catch (error) {
      this.showNotification(`Gagal menghapus: ${error.message}`, 'error');
    }
  }

  toggleModal(content) {
    this.dom.modal.style.display = this.dom.modal.style.display === 'flex' ? 'none' : 'flex';
    if (content) {
      this.dom.editForm.innerHTML = content;
    } else {
      this.dom.editForm.innerHTML = '';
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  async saveToFirebase(uid, data) {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    const category = data.category;
    
    const updateData = {
      [category]: userSnap.exists() 
        ? [...(userSnap.data()[category] || []), data] 
        : [data]
    };
    
    await setDoc(userRef, updateData, { merge: true });
  }
  
  renderChart() {
    const chartContainer = document.querySelector('#progress-chart .chart-bars');
    chartContainer.innerHTML = '';
    const total = Object.keys(CATEGORIES).reduce((acc, key) => acc + (this.userData[key]?.length || 0), 0);

    Object.entries(CATEGORIES).forEach(([key, category]) => {
      const count = this.userData[key]?.length || 0;
      const percentage = total ? (count / total) * 100 : 0;
      
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      bar.innerHTML = `
        <div class="bar-label">${category.icon} ${category.label}</div>
        <div class="bar-container">
          <div class="bar-fill" style="width: ${percentage}%"></div>
        </div>
        <div class="bar-value">${count} item</div>
      `;

      // Accessibility and interactivity
      bar.setAttribute('role', 'progressbar');
      bar.setAttribute('aria-valuenow', count);
      bar.setAttribute('aria-valuemin', '0');
      bar.setAttribute('aria-valuemax', total);
      bar.querySelector('.bar-fill').dataset.progress = `${percentage.toFixed(1)}%`;
      
      // Click handler for filtering
      bar.addEventListener('click', () => this.filterByCategory(key));
      
      chartContainer.appendChild(bar);
    });
  }

  async animateChart() {
    const bars = document.querySelectorAll('.bar-fill');
    bars.forEach(bar => {
      const targetWidth = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => {
        bar.style.width = targetWidth;
      }, 100);
    });
  }

  filterByCategory(category) {
    document.querySelectorAll('.data-card').forEach(card => {
      card.style.display = card.id === `${category}-section` ? 'block' : 'none';
    });
    this.showNotification(`Menampilkan kategori: ${CATEGORIES[category].label}`);
  }

  async loadUserData(uid) {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    this.userData = userSnap.exists() ? userSnap.data() : {};
    this.renderChart();
    await this.animateChart();
  }

  updateCharacterCount() {
    const charCount = this.dom.deskripsiInput.value.length;
    this.dom.deskripsiInput.closest('.input-group')
      .querySelector('.char-count').textContent = `${charCount}/500`;
  }

  handleSearchInput(e) {
    if (e.target.classList.contains('search-bar')) {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      
      this.debounceTimer = setTimeout(() => {
        const searchTerm = e.target.value.toLowerCase();
        const items = e.target.closest('.data-card').querySelectorAll('.item-list li');
        
        items.forEach(item => {
          const title = item.querySelector('h3').textContent.toLowerCase();
          item.style.display = title.includes(searchTerm) ? 'flex' : 'none';
        });
      }, 300);
    }
  }
}

const developmentManager = new DevelopmentManager();